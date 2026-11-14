window.EZO_RENDERERS = function ({t,u,editorial,esc,routeLink,image,eyebrow,arrow,pageHeader,getRoute,mediaCaption,priceText,priceBlock,statusPill,fill}) {
  const h = (value, tag='h2', css='section-title') => `<${tag} class="${css} preline">${esc(value)}</${tag}>`;
  const p = value => `<p class="body-copy preline">${esc(value)}</p>`;
  const cleanKicker=value=>value.replace(/^0\d\s*\/\s*/,'').replace(/\s*\/\s*0\d$/,'');
  const caption=name=>mediaCaption(name)?`<figcaption class="photo-caption">${esc(mediaCaption(name))}</figcaption>`:'';
  const figure = (name,alt,css='') => `<figure class="editorial-photo ${css} ${window.EZO_MEDIA[name]?.status==='awaiting'?'media-awaiting':''}">${image(name,alt)}${caption(name)}</figure>`;
  const sectionHead = (title,label,body='') => `<div class="section-heading">${eyebrow(label)}${h(title)}${body?p(body):''}</div>`;
  const orderSteps = () => `<ol class="order-steps">${u('orderSteps').map(([title,body],i)=>`<li><span class="step-number">0${i+1}</span><h3>${esc(title)}</h3>${p(body)}</li>`).join('')}</ol>`;
  function stay() {
    return `<section class="stay-section container">${eyebrow('NEXT RELEASE')}${h(u('stayTitle'))}${p(u('stayBody'))}<button class="button" data-notify><span>${esc(t('notifyButton'))}</span>${arrow}</button><p class="small-copy">${esc(t('notifyDisclaimer'))}</p></section>`;
  }
  function articleCard(a,i=0) {
    return `<a class="article-card" href="#/journal?article=${encodeURIComponent(a.id)}"><div class="article-photo">${image(a.image,a.title,'','','(max-width:760px) 100vw, 33vw')}</div><div class="article-meta">${eyebrow(cleanKicker(a.kicker))}<span>0${i+1}</span></div><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p><span class="article-read">${esc(u('readMore'))}${arrow}</span></a>`;
  }
  function faqDetails(items) {
    return items.map((item,i)=>`<details class="faq-item" data-category="${esc(item.category)}"><summary><span class="faq-q">Q.</span><span>${esc(item.q)}</span><i aria-hidden="true"></i></summary><div class="faq-answer"><span>A.</span><p>${esc(fill(item.a))}</p></div></details>`).join('');
  }
  function faq(full=true) {
    /* The short list answers what buyers ask first: what it is, the grain, price, delivery time and gifting. */
    const items=full?editorial().faq:editorial().faq.filter((_,i)=>[0,1,4,9,17].includes(i));
    return `<section class="faq-section container" id="guide-faq">${sectionHead(u('faqTitle'),'QUESTIONS',u('faqIntro'))}${full?`<div class="faq-filters" role="group" aria-label="${esc(u('faqTitle'))}">${Object.entries(u('faqCategories')).map(([key,label])=>`<button data-faq-filter="${key}" aria-pressed="${key==='all'}">${esc(label)}</button>`).join('')}</div><p class="faq-count small-copy" aria-live="polite"><span data-faq-count>${items.length}</span>${esc(u('faqCount'))}</p>`:''}<div class="faq-list">${faqDetails(items)}</div>${full?'':routeLink('guide?section=faq',u('faqAll'))}</section>`;
  }
  /* Home page, ordered as a purchase story: see the pen → what it is → why the grain matters → using it → where it comes from → gifting → how to order → questions → who we are. */
  const shot=(name,alt,css='',sizes='100vw')=>`<figure class="shot ${css}">${image(name,alt,'','',sizes)}${mediaCaption(name)?`<figcaption class="shot-chip">${esc(mediaCaption(name))}</figcaption>`:''}</figure>`;
  const kicker=text=>`<p class="hm-kicker">${esc(text)}</p>`;
  const title=(text,tag='h2')=>`<${tag} class="hm-title preline">${esc(text)}</${tag}>`;
  const body=text=>`<p class="hm-body preline">${esc(text)}</p>`;
  const checks=items=>`<ul class="hm-checks">${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
  function home() {
    const journalPicks=[0,2,3];
    /* The hero film opens on the pen (also its poster), then cuts through forest and workshop shots. The small source serves phones. */
    return `<section class="hm-hero" data-hero aria-labelledby="hero-title">
      <div class="hm-hero-media" data-film-frame><video class="hm-hero-video" data-film="hero" autoplay muted loop playsinline preload="metadata" poster="assets/hero-poster.webp" width="1280" height="720" aria-label="${esc(u('filmLabel'))}"><source src="assets/hero-film-480.mp4" type="video/mp4" media="(max-width: 900px)"><source src="assets/hero-film-720.mp4" type="video/mp4"></video><span class="shot-chip">${esc(u('hFilmChip'))}</span><button class="hm-film-toggle" type="button" data-film-toggle aria-label="${esc(u('filmAction'))}" aria-pressed="true"><span aria-hidden="true"></span></button></div>
      <div class="hm-hero-copy">${kicker(u('hEyebrow'))}<h1 id="hero-title" class="hm-hero-title preline">${esc(u('hTitle'))}</h1><p class="hm-hero-lead preline">${esc(u('hLead'))}</p></div>
      <div class="hm-hero-buy">${statusPill()}<div class="hm-actions">${routeLink('product',u('hPrimary'),'button button-primary')}<a class="hm-secondary" href="#grain">${esc(u('hSecondary'))}</a></div></div>
    </section>
    <section class="hm-facts" aria-label="${esc(t('productName'))}"><ul class="container">${u('hFacts').map(([name,text],i)=>`<li><span class="hm-no">0${i+1}</span><h2>${esc(name)}</h2><p class="preline">${esc(text)}</p></li>`).join('')}</ul></section>
    <section class="hm-grain" id="grain"><div class="container hm-grain-layout">
      <div class="hm-grain-visual"><div class="grain-view" data-grain-view>${image('burl',u('grainTitle'),'','','(max-width:760px) 100vw, 56vw')}<span class="grain-view-label" data-grain-label>01 / ${esc(u('grainNames')[0])}</span></div><span class="shot-chip">${esc(mediaCaption('burl'))}</span></div>
      <div class="hm-grain-text">${kicker('A LANDSCAPE IN THE GRAIN')}${title(u('hGrainTitle'))}${body(u('grainIntro'))}<div class="grain-tabs" role="group" aria-label="${esc(u('grainTitle'))}">${u('grainNames').map((label,i)=>`<button data-grain-tab="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${esc(label)}</button>`).join('')}</div><p class="grain-description hm-body" data-grain-description aria-live="polite">${esc(u('grainBodies')[0])}</p><p class="hm-note">${esc(t('grainNotice'))}</p>${routeLink('materials',u('materialLink'))}</div>
    </div></section>
    <section class="hm-life"><div class="container hm-split">
      ${shot('writing',u('lifeTitle'),'hm-split-media','(max-width:760px) 100vw, 50vw')}
      <div class="hm-split-text">${kicker('WITH YOU, EVERY DAY')}${title(u('lifeTitle'))}${body(u('lifeBody'))}${checks(u('hLifePoints'))}${routeLink('product',u('hPrimary'))}</div>
    </div></section>
    <section class="hm-story"><div class="container">
      <div class="hm-story-head">${kicker(u('hStoryEyebrow'))}${title(u('hStoryTitle'))}</div>
      <div class="hm-story-layout">
        ${shot('tools',u('hStoryTitle'),'hm-story-media','(max-width:900px) 100vw, 58vw')}
        <ol class="hm-steps">${u('hStorySteps').map(([name,text],i)=>`<li><div class="hm-step-thumb">${image(['forest','burl','craft'][i],name,'','','120px')}</div><div><span class="hm-no">0${i+1}</span><h3>${esc(name)}</h3><p>${esc(text)}</p></div></li>`).join('')}</ol>
      </div>
      <div class="hm-story-foot">${routeLink('craft',u('craftLink'))}<p class="hm-note">${esc(u('craftNote'))}</p></div>
    </div></section>
    <section class="hm-gift"><div class="container hm-split hm-split-reverse">
      ${shot('gift',u('giftTitle'),'hm-split-media','(max-width:760px) 100vw, 50vw')}
      <div class="hm-split-text">${kicker('A GIFT OF HOKKAIDO')}${title(u('giftTitle'))}${body(u('giftBody'))}${checks(u('hGiftPoints'))}${routeLink('gift',u('giftLink'))}</div>
    </div></section>
    <section class="hm-buy" id="order"><div class="container">
      <div class="hm-buy-head">${kicker(u('hBuyEyebrow'))}${title(u('hBuyTitle'))}${body(u('hBuyIntro'))}</div>
      <div class="hm-buy-layout">
        <ol class="hm-buy-steps">${u('orderSteps').map(([name,text],i)=>`<li><span class="hm-no">0${i+1}</span><div><h3>${esc(name)}</h3><p>${esc(text)}</p></div></li>`).join('')}</ol>
        <article class="hm-buy-card"><a class="hm-buy-thumb" href="#/product" tabindex="-1" aria-hidden="true">${image('pen',t('productName'),'','','(max-width:760px) 100vw, 34vw')}</a><div class="hm-buy-info"><p class="hm-buy-en">SHIRAKABA BURL BALLPOINT PEN</p><h3>${esc(t('productName'))}</h3>${priceBlock('hm-price')}${statusPill()}${routeLink('product',u('hPrimary'),'button button-primary')}<p class="hm-note">${esc(t('priceNote'))}</p></div></article>
      </div>
    </div></section>
    ${faq(false)}
    <section class="hm-brand"><div class="container hm-brand-inner"><img src="assets/symbol.svg" class="hm-brand-symbol" alt="" aria-hidden="true">${kicker(u('missionEyebrow'))}${title(u('missionTitle'))}${body(u('missionBody'))}${routeLink('purpose',u('missionLink'))}</div></section>
    <section class="hm-journal"><div class="container">${kicker('JOURNAL')}${title(u('journalTitle'))}<div class="article-grid">${journalPicks.map(i=>articleCard(editorial().articles[i],i)).join('')}</div>${routeLink('journal',u('journalLink'))}</div></section>
    <section class="hm-final"><div class="hm-final-media">${image('forest',u('landscapeTitle'),'','','100vw')}</div><div class="container hm-final-inner">${kicker('THE FIRST PEN')}${title(u('hFinalTitle'))}${body(u('hFinalBody'))}${priceBlock('hm-price')}${routeLink('product',u('hPrimary'),'button button-light')}</div></section>
    <div class="hm-sticky" data-sticky-buy><div class="hm-sticky-info"><strong>${esc(t('productName'))}</strong><span>${esc(priceText()?`${priceText()}${t('taxIncluded')}`:t('pricePending'))}</span></div>${routeLink('product',u('hSticky'),'button button-primary')}</div>`;
  }
  function related(current) {
    return `<section class="related-pages container">${sectionHead(u('relatedTitle'),'CONTINUE THE STORY')}<div class="related-grid">${['purpose','materials','craft','gift','care'].filter(key=>key!==current).slice(0,3).map(key=>{const item=editorial().pages[key];return `<a href="#/${key}"><div>${image(item.hero,item.title)}</div><h3>${esc(item.title.replace(/\n/g,' '))}</h3><span>${esc(u('readMore'))}${arrow}</span></a>`;}).join('')}</div></section>`;
  }
  function page(key) {
    const item=editorial().pages[key];
    return `<section class="editorial-masthead container">${eyebrow(item.eyebrow)}${h(item.title,'h1')}<p class="editorial-lead">${esc(item.lead)}</p><nav class="chapter-toc" aria-label="${esc(u('toc'))}">${item.chapters.map((chapter,i)=>`<a href="#/${key}?section=chapter-${i+1}"><span>0${i+1}</span>${esc(chapter.title.replace(/\n/g,' '))}</a>`).join('')}</nav></section><div class="editorial-cover">${image(item.hero,item.title)}<span>EZOWOOD HOKKAIDO / ${esc(item.eyebrow)}</span>${mediaCaption(item.hero)?`<span class="shot-chip">${esc(mediaCaption(item.hero))}</span>`:''}</div><div class="editorial-chapters container">${item.chapters.map((chapter,i)=>`<section class="editorial-chapter ${i%2?'reverse':''}" id="${key}-chapter-${i+1}"><div class="chapter-picture">${figure(chapter.image,chapter.title)}</div><div class="chapter-prose">${eyebrow(`0${i+1} / ${cleanKicker(chapter.kicker)}`)}${h(chapter.title)}${chapter.body.map(p).join('')}</div></section>`).join('')}</div><section class="editorial-notes container"><div>${eyebrow('THINGS TO KNOW')}${h(u('productFaqTitle'))}</div><div>${item.notes.map(note=>`<div class="editorial-note"><h3>${esc(note.title)}</h3>${p(note.body)}</div>`).join('')}</div></section>${key==='materials'?`<aside class="source-note container"><span>${esc(u('forestSource'))}</span><a href="https://www.hro.or.jp/forest/research/fri/database/zukanf/kitanoki/b25sirakaba.html" target="_blank" rel="noopener noreferrer">北海道立総合研究機構 — シラカンバ ↗</a><a href="https://www.pref.hokkaido.lg.jp/sr/sky/japanese_white_birch.html" target="_blank" rel="noopener noreferrer">北海道庁 — シラカンバ ↗</a></aside>`:''}<section class="page-product-cta container"><div>${eyebrow('THE FIRST PEN')}${h(t('productName'))}${p(t('productLead'))}${routeLink('product',u('navShop'),'button outline')}</div><a href="#/product">${image('pen',t('productName'))}</a></section>${related(key)}`;
  }
  function journal() {
    const id=getRoute().params.get('article');
    const item=editorial().articles.find(a=>a.id===id);
    if(!item) return `${pageHeader('JOURNAL',u('journalTitle'),u('journalIntro'))}<section class="journal-index container"><p class="journal-edition">${esc(u('journalEdition'))} / 01–06</p><div class="article-grid">${editorial().articles.map(articleCard).join('')}</div></section>${stay()}`;
    const index=editorial().articles.indexOf(item);
    return `<article class="long-article"><header class="article-header container"><a class="back-link" href="#/journal">${esc(u('articleBack'))}</a>${eyebrow(item.kicker)}${h(item.title,'h1')}<p class="editorial-lead">${esc(item.summary)}</p><span class="article-number">EZOWOOD JOURNAL / 0${index+1}</span></header><div class="article-cover container">${figure(item.image,item.title)}</div><div class="article-reading"><nav class="article-toc" aria-label="${esc(u('articleContents'))}">${eyebrow(u('articleContents'))}${item.sections.map((section,i)=>`<a href="#/journal?article=${encodeURIComponent(item.id)}&section=part-${i+1}">${String(i+1).padStart(2,'0')} — ${esc(section.title)}</a>`).join('')}</nav><div class="article-body">${item.sections.map((section,i)=>`<section id="journal-part-${i+1}">${h(section.title)}${section.body.map(p).join('')}</section>`).join('')}<p class="article-endnote">${esc(u('aboutImage'))}</p>${routeLink('product',u('navShop'))}</div></div></article><section class="journal-related container">${sectionHead(u('articleRelated'),'JOURNAL')}<div class="article-grid">${editorial().articles.filter(a=>a!==item).slice(0,3).map(articleCard).join('')}</div></section>`;
  }
  function productDetails() {
    const item=editorial().product;
    return `<nav class="product-subnav container" aria-label="${esc(t('detailsTitle'))}">${u('productDetailNav').map((label,i)=>`<a href="#/product?section=${['about','wood','life','details'][i]}">${esc(label)}</a>`).join('')}</nav><section class="product-story container" id="product-about">${sectionHead(u('productStoryTitle'),'THE FIRST PEN',fill(item.statement))}<div class="product-feature-list">${item.features.map((f,i)=>`<div><span>0${i+1}</span><h3>${esc(f.title)}</h3>${p(f.body)}</div>`).join('')}</div></section><section class="product-wood container" id="product-wood">${figure('burl',u('grainTitle'))}<div>${eyebrow('HOKKAIDO / SHIRAKABA BURL')}${h(u('grainTitle'))}${p(u('materialBody'))}${p(t('grainNotice'))}${routeLink('materials',u('materialLink'))}</div></section><section class="product-life container" id="product-life">${figure('writing',u('lifeTitle'))}${sectionHead(u('productScenesTitle'),'EVERYDAY COMPANION')}<div class="scene-columns">${item.scenes.map(s=>`<div><h3>${esc(s.title)}</h3>${p(s.body)}</div>`).join('')}</div></section><section class="product-delivery container" id="product-details">${sectionHead(u('productOrderTitle'),'MADE TO ORDER')}<ol class="product-order-steps">${item.steps.map((step,i)=>`<li><span>0${i+1}</span><div><h3>${esc(step.title)}</h3>${p(step.body)}</div></li>`).join('')}</ol><p class="small-copy">${esc(t('previewShort'))}</p>${routeLink('guide',t('navGuide'))}</section>${faq(false)}${related('product')}`;
  }
  return {home,page,journal,faq,productDetails,stay};
};
