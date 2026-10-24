#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..');
const checkOnly = process.argv.includes('--check');
const outputFlag = process.argv.find(arg => arg.startsWith('--outdir='));
const output = outputFlag ? path.resolve(outputFlag.slice('--outdir='.length)) : ROOT;
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
const plain = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const json = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const sandbox = {console, URL, URLSearchParams, EZO_STATIC_BUILD: true};
sandbox.window = sandbox;
vm.createContext(sandbox);
function load(file) {
  const filename = path.join(ROOT, file);
  if (!fs.existsSync(filename)) throw new Error(`Required build input is missing: ${file}`);
  vm.runInContext(fs.readFileSync(filename, 'utf8'), sandbox, {filename: file, timeout: 10000});
}
load('site-config.js');
const config = sandbox.EZO_SITE_CONFIG;
sandbox.location = new URL(config.origin + config.basePath);
const stored = new Map();
sandbox.localStorage = {getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, String(value)), removeItem: key => stored.delete(key)};
for (const file of ['copy.js', 'edition-ui.js', 'editorial.js', 'edition-renderers.js', 'media.js', 'releases.js', 'routing.js', 'app.js']) load(file);
if (typeof sandbox.EZO_RENDER_PAGE !== 'function') throw new Error('The page renderer must expose EZO_RENDER_PAGE in static build mode.');
if (!/^\d{4}-\d{2}-\d{2}$/.test(config.updatedAt)) throw new Error('updatedAt must be a confirmed ISO calendar date.');
const routes = sandbox.EZO_ROUTES;
const template = fs.readFileSync(path.join(ROOT, 'templates/shell.html'), 'utf8').replace(/^.*data-template-only.*\r?\n/gm, '');
const infoPaths = ['', 'story', 'materials', 'craft', 'purpose', 'gift', 'care', 'journal', 'product', 'guide', 'contact'];
const privatePaths = ['cart', 'checkout', 'complete'];
const labels = {
  ja: {home:'ホーム', journal:'木のある日々', purpose:'私たちが届けたいもの', reference:'画像は参考イメージです。完成品の実物写真ではありません。', skip:'本文へ', noscript:'メニューや画像切り替えなど一部の操作にはJavaScriptが必要です。', notFound:'ページが見つかりません', notFoundBody:'ページが移動したか、URLが異なる可能性があります。ホームからお探しください。', breadcrumb:'現在のページ'},
  en: {home:'Home', journal:'Journal', purpose:'Our purpose', reference:'Images are illustrative and do not show the finished product.', skip:'Skip to content', noscript:'The menu and image controls require JavaScript.', notFound:'Page not found', notFoundBody:'This page may have moved, or the address may be incorrect. Please explore from the home page.', breadcrumb:'Breadcrumb'},
  zh: {home:'首頁', journal:'與木的日常', purpose:'我們想傳遞的事物', reference:'圖片為參考意象，並非成品實物照片。', skip:'跳至主要內容', noscript:'選單與圖片切換等操作需要JavaScript。', notFound:'找不到頁面', notFoundBody:'頁面可能已移動，或網址有誤。請從首頁重新尋找。', breadcrumb:'目前位置'}
};
const absolute = value => new URL(value, config.origin).href;
const local = file => `${routes.basePath}${file}`;
const versioned = file => `${local(file)}?v=${encodeURIComponent(config.version)}`;
const styleFiles = ['styles.css', 'edition.css', 'launch.css'];
const scriptFiles = ['site-config.js', 'copy.js', 'edition-ui.js', 'editorial.js', 'edition-renderers.js', 'media.js', 'releases.js', 'routing.js', 'app.js'];
const missingDependencies = [...styleFiles, ...scriptFiles].filter(file => !fs.existsSync(path.join(ROOT, file)));

function copy(locale, key) { return sandbox.EZO_COPY[locale]?.[key] ?? sandbox.EZO_COPY.ja[key] ?? key; }
function ui(locale, key) { return sandbox.EZO_UI[locale]?.[key] ?? sandbox.EZO_UI.ja[key] ?? key; }
function editorial(locale) { return sandbox.EZO_EDITORIAL[locale]; }
function pageData(page) {
  const {locale, pathname, article} = page;
  const data = editorial(locale);
  const keys = {story:'navStory', product:'productName', guide:'navGuide', contact:'navContact', cart:'cart', checkout:'checkoutTitle', complete:'completeTitle'};
  const extra = {materials:'navMaterials', craft:'navCraft', gift:'navGift', care:'navCare', journal:'navJournal', purpose:'navPurpose'};
  let title;
  let description;
  if (article) {
    title = article.title;
    description = article.summary;
  } else if (!pathname) {
    title = locale === 'ja' ? `${config.brandName}｜北海道の木を使った木軸ペン` : locale === 'zh' ? `${config.brandName}｜北海道木杆筆` : `${config.brandName} | Wooden pens from Hokkaido`;
    description = ui(locale, 'heroCaption') + ' ' + copy(locale, 'productStory');
  } else {
    const item = data.pages[pathname];
    title = item?.title || (keys[pathname] ? copy(locale, keys[pathname]) : ui(locale, extra[pathname]));
    if (title === 'navPurpose') title = labels[locale].purpose;
    description = item?.lead || ({product:copy(locale, 'productStory'), guide:copy(locale, 'guideIntro'), contact:copy(locale, 'contactBody'), journal:ui(locale, 'journalIntro')}[pathname]) || title;
  }
  title = plain(title);
  description = plain(description);
  if (!description.includes(labels[locale].reference)) description += ' ' + labels[locale].reference;
  return {title: pathname || article ? `${title} | ${config.brandName}` : title, shortTitle:title, description};
}

function breadcrumbs(page, title) {
  if (!page.pathname || !page.indexable) return [];
  const items = [{name:labels[page.locale].home, url:absolute(routes.url('', page.locale))}];
  if (page.article) items.push({name:labels[page.locale].journal, url:absolute(routes.url('journal', page.locale))});
  items.push({name:title, url:absolute(page.url)});
  return items;
}
function breadcrumbHTML(items, locale) {
  if (!items.length) return '';
  return `<nav class="static-breadcrumb container" aria-label="${esc(labels[locale].breadcrumb)}"><ol>${items.map((item, i) => `<li>${i === items.length - 1 ? `<span aria-current="page">${esc(item.name)}</span>` : `<a href="${esc(new URL(item.url).pathname)}">${esc(item.name)}</a>`}</li>`).join('')}</ol></nav>`;
}

function metadata(page, data, crumbs, renderedMain) {
  const pageURL = absolute(page.url);
  const imageURL = absolute(routes.asset(config.socialImage));
  const rootURL = absolute(routes.url('', config.defaultLocale));
  const organization = {'@type':'Organization', '@id':`${rootURL}#organization`, name:config.brandName, url:rootURL, logo:absolute(routes.asset('assets/logo.svg'))};
  const graph = [organization];
  if (crumbs.length >= 2) graph.push({'@type':'BreadcrumbList', itemListElement:crumbs.map((item, i) => ({'@type':'ListItem', position:i+1, name:item.name, item:item.url}))});
  if (page.article) {
    const image = renderedMain.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
    const article = {'@type':'Article', '@id':`${pageURL}#article`, mainEntityOfPage:pageURL, headline:plain(page.article.title), description:plain(page.article.summary), inLanguage:config.languageCodes[page.locale], image:absolute(image ? image[1].replace(/&amp;/g, '&') : imageURL), publisher:{'@id':organization['@id']}};
    // Dates and bylines are optional. Do not infer either from a build timestamp.
    for (const key of ['datePublished', 'dateModified']) if (typeof page.article[key] === 'string' && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(page.article[key])) article[key] = page.article[key];
    graph.push(article);
  }
  const result = [
    `  <meta name="robots" content="${page.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow'}">`,
    `  <link rel="canonical" href="${esc(pageURL)}">`
  ];
  if (page.indexable) {
    for (const locale of config.locales) result.push(`  <link rel="alternate" hreflang="${esc(config.languageCodes[locale])}" href="${esc(absolute(routes.url(page.pathname, locale, page.params)))}">`);
    result.push(`  <link rel="alternate" hreflang="x-default" href="${esc(absolute(routes.url(page.pathname, config.defaultLocale, page.params)))}">`);
  }
  result.push(`  <meta property="og:type" content="${page.article ? 'article' : 'website'}">`, `  <meta property="og:site_name" content="${esc(config.brandName)}">`, `  <meta property="og:title" content="${esc(data.title)}">`, `  <meta property="og:description" content="${esc(data.description)}">`, `  <meta property="og:url" content="${esc(pageURL)}">`, `  <meta property="og:image" content="${esc(imageURL)}">`, `  <meta property="og:image:alt" content="${esc(labels[page.locale].reference)}">`, `  <meta name="twitter:card" content="summary_large_image">`, `  <script type="application/ld+json">${json({'@context':'https://schema.org', '@graph':graph})}</script>`);
  return result.join('\n');
}

function compile(values) {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) => {
    if (!(key in values)) throw new Error(`Unknown shell placeholder: ${key}`);
    return values[key];
  });
}
const styles = [`  <link rel="icon" href="${esc(routes.asset('assets/favicon.svg'))}" type="image/svg+xml">`, `  <link rel="preload" href="${esc(versioned('assets/serif-jp.woff2'))}" as="font" type="font/woff2" crossorigin>`, ...styleFiles.map(file => `  <link rel="stylesheet" href="${esc(versioned(file))}">`)].join('\n');
const scripts = scriptFiles.map(file => `  <script src="${esc(versioned(file))}" defer></script>`).join('\n');
const generated = [];
const seen = new Set();

function addPage(pathname, locale, params, indexable, article) {
  const publicURL = routes.url(pathname, locale, params);
  if (seen.has(publicURL)) throw new Error(`Duplicate generated URL: ${publicURL}`);
  seen.add(publicURL);
  const page = {pathname, locale, params, indexable, article, url:publicURL};
  const result = sandbox.EZO_RENDER_PAGE(pathname, locale, params);
  for (const key of ['main', 'header', 'menu', 'footer']) if (typeof result?.[key] !== 'string') throw new Error(`Renderer returned no ${key} for ${publicURL}`);
  const parts = Object.fromEntries(Object.entries(result).map(([key, value]) => [key, routes.transformHTML(value, locale)]));
  const data = pageData(page);
  const crumbs = breadcrumbs(page, data.shortTitle);
  const html = compile({HTML_LANG:esc(config.languageCodes[locale]), LOCALE:esc(locale), PAGE_PATH:esc(pathname), TITLE:esc(data.title), DESCRIPTION:esc(data.description), SEO_HEAD:metadata(page, data, crumbs, parts.main), STYLES:styles, SCRIPTS:scripts, BODY_CLASS:pathname ? '' : 'home', SKIP_LABEL:esc(labels[locale].skip), NOSCRIPT_LABEL:esc(labels[locale].noscript), BREADCRUMBS:breadcrumbHTML(crumbs, locale), MAIN:parts.main, HEADER:parts.header, MENU:parts.menu, FOOTER:parts.footer});
  if (/\bhref=["']#!?\//i.test(html) || /\b(?:src|href|poster)=["']\.?\/?assets\//i.test(html)) throw new Error(`Unconverted relative link in ${publicURL}`);
  if (!parts.main.trim()) throw new Error(`Empty page body: ${publicURL}`);
  const relative = publicURL.slice(routes.basePath.length);
  generated.push({filename:relative + 'index.html', html, url:absolute(publicURL), indexable});
}

for (const locale of config.locales) {
  const content = editorial(locale);
  if (!content || !Array.isArray(content.articles)) throw new Error(`Missing editorial locale: ${locale}`);
  for (const pathname of infoPaths) addPage(pathname, locale, {}, true, null);
  for (const article of content.articles) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(article.id)) throw new Error(`Unsafe article slug: ${article.id}`);
    addPage('journal', locale, {article:article.id}, true, article);
  }
  for (const pathname of privatePaths) addPage(pathname, locale, {}, false, null);
}

const notFoundLocale = config.defaultLocale;
const notFound = labels[notFoundLocale];
const common = sandbox.EZO_RENDER_PAGE('contact', notFoundLocale, {});
generated.push({filename:'404.html', indexable:false, html:compile({HTML_LANG:esc(config.languageCodes[notFoundLocale]), LOCALE:notFoundLocale, PAGE_PATH:'404', TITLE:esc(`${notFound.notFound} | ${config.brandName}`), DESCRIPTION:esc(notFound.notFoundBody), SEO_HEAD:'  <meta name="robots" content="noindex,follow">', STYLES:styles, SCRIPTS:scripts, BODY_CLASS:'', SKIP_LABEL:esc(notFound.skip), NOSCRIPT_LABEL:esc(notFound.noscript), BREADCRUMBS:'', MAIN:`<section class="page-header container"><h1>${esc(notFound.notFound)}</h1><p class="body-copy">${esc(notFound.notFoundBody)}</p><a class="text-link" href="${esc(routes.url('', notFoundLocale))}">${esc(notFound.home)}</a></section>`, HEADER:routes.transformHTML(common.header, notFoundLocale), MENU:routes.transformHTML(common.menu, notFoundLocale), FOOTER:routes.transformHTML(common.footer, notFoundLocale)})});

const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + generated.filter(page => page.indexable).map(page => `  <url><loc>${esc(page.url)}</loc><lastmod>${esc(config.updatedAt)}</lastmod></url>`).join('\n') + '\n</urlset>\n';
if (missingDependencies.length) throw new Error(`Rendered ${generated.length} HTML pages, but page dependencies are missing: ${missingDependencies.join(', ')}`);
if (!checkOnly) {
  for (const page of generated) {
    const target = path.join(output, page.filename);
    fs.mkdirSync(path.dirname(target), {recursive:true});
    fs.writeFileSync(target, page.html.trimEnd() + '\n');
  }
  fs.mkdirSync(output, {recursive:true});
  fs.writeFileSync(path.join(output, 'sitemap.xml'), sitemap);
}
console.log(`${checkOnly ? 'Checked' : 'Generated'} ${generated.length} HTML pages; ${generated.filter(page => page.indexable).length} indexable URLs. Sitemap: ${absolute(local('sitemap.xml'))}`);
