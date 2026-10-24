(function () {
  'use strict';
  const config = window.EZO_SITE_CONFIG;
  if (!config) throw new Error('Site configuration must be loaded before routing.');
  const origin = config.origin.replace(/\/+$/, '');
  const basePath = `/${config.basePath.split('/').filter(Boolean).join('/')}${config.basePath.split('/').filter(Boolean).length ? '/' : ''}`;
  const locales = config.locales;
  const paths = new Set(['', 'story', 'materials', 'craft', 'purpose', 'gift', 'care', 'journal', 'product', 'guide', 'contact', 'cart', 'checkout', 'complete']);
  const validLocale = value => locales.includes(value) ? value : config.defaultLocale;
  const currentURL = () => new URL(window.location && window.location.href ? window.location.href : `${origin}${basePath}`);
  const decode = value => { try { return decodeURIComponent(value); } catch { return null; } };
  const entities = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
  const attr = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function parameters(input) {
    if (input instanceof URLSearchParams) return new URLSearchParams(input);
    const result = new URLSearchParams();
    for (const [key, value] of Object.entries(input || {})) {
      if (value === undefined || value === null || value === '') continue;
      for (const item of Array.isArray(value) ? value : [value]) result.append(key, String(item));
    }
    return result;
  }

  function anchor(path, section) {
    const value = String(section || '');
    return path && !value.startsWith(`${path}-`) ? `${path}-${value}` : value;
  }

  function url(path = '', locale = config.defaultLocale, input = {}) {
    if (!paths.has(path)) throw new TypeError(`Unknown page: ${path}`);
    locale = validLocale(locale);
    const params = parameters(input);
    const article = path === 'journal' ? params.get('article') : null;
    if (path === 'journal') params.delete('article');
    const section = params.get('section');
    params.delete('section');
    params.delete('lang');
    const parts = [];
    if (locale !== config.defaultLocale) parts.push(locale);
    if (path) parts.push(path);
    if (article) parts.push(encodeURIComponent(article));
    const pathname = basePath + parts.join('/') + (parts.length ? '/' : '');
    const search = params.toString();
    return pathname + (search ? `?${search}` : '') + (section ? `#${encodeURIComponent(anchor(path, section))}` : '');
  }

  function parse(href) {
    if (typeof href !== 'string' || !href.trim()) return null;
    const current = currentURL();
    let parsed;
    try { parsed = new URL(entities(href), current); } catch { return null; }
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (parsed.origin !== origin && parsed.origin !== current.origin) return null;
    const withoutFinalSlash = basePath === '/' ? '' : basePath.slice(0, -1);
    if (parsed.pathname !== withoutFinalSlash && !parsed.pathname.startsWith(basePath)) return null;
    let relative = parsed.pathname === withoutFinalSlash ? '' : parsed.pathname.slice(basePath.length);
    let parts = relative.split('/').filter(Boolean);
    if (parts.at(-1) === 'index.html') parts.pop();
    let explicitLocale = null;
    if (locales.includes(parts[0])) explicitLocale = parts.shift();
    const params = new URLSearchParams(parsed.search);
    let path = parts.shift() || '';
    let legacy = false;
    if (/^#!?\//.test(parsed.hash)) {
      legacy = true;
      const hash = parsed.hash.replace(/^#!?\//, '');
      const mark = hash.indexOf('?');
      const route = mark < 0 ? hash : hash.slice(0, mark);
      const hashParams = new URLSearchParams(mark < 0 ? '' : hash.slice(mark + 1));
      for (const [key, value] of hashParams) params.set(key, value);
      parts = route.split('/').filter(Boolean);
      path = parts.shift() || '';
    }
    if (!paths.has(path)) return null;
    if (path === 'journal' && parts.length === 1) {
      const article = decode(parts.shift());
      if (article === null || article.includes('/')) return null;
      params.set('article', article);
    }
    if (parts.length) return null;
    const locale = explicitLocale || validLocale(params.get('lang'));
    params.delete('lang');
    if (!legacy && parsed.hash.length > 1) {
      const section = decode(parsed.hash.slice(1));
      if (section === null) return null;
      params.set('section', path && section.startsWith(`${path}-`) ? section.slice(path.length + 1) : section);
    }
    return {path, locale, params};
  }

  function asset(relativeFile) {
    const value = String(relativeFile || '');
    if (/^(?:https?:|data:|blob:)/i.test(value)) return value;
    if (value.startsWith(basePath)) return value;
    const file = value.replace(/^\.?\//, '').replace(/^assets\//, '');
    if (!file || file.split(/[/?#]/).includes('..')) throw new TypeError('Invalid asset path.');
    return `${basePath}assets/${file}`;
  }

  function transformHTML(html, locale = config.defaultLocale) {
    locale = validLocale(locale);
    return String(html).replace(/\b(href|src|poster)\s*=\s*(["'])(.*?)\2/gi, (whole, name, quote, value) => {
      const decoded = entities(value);
      let result = decoded;
      if (name.toLowerCase() === 'href' && /^#!?\//.test(decoded)) {
        const parsed = parse(`${origin}${basePath}${decoded}`);
        if (parsed) result = url(parsed.path, locale, parsed.params);
      } else if (/^\.?\/?assets\//.test(decoded)) result = asset(decoded);
      else return whole;
      return `${name}=${quote}${attr(result)}${quote}`;
    });
  }

  window.EZO_ROUTES = Object.freeze({parse, url, asset, transformHTML, origin, basePath});
})();
