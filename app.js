(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const read = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, String(value)); } catch { /* browsing without persistence is supported */ } };
  const supported = ['ja', 'en', 'zh'];
  const requestedLanguage = new URLSearchParams(location.search).get('lang');
  let language = supported.includes(requestedLanguage) ? requestedLanguage : read('ezo.language', 'ja');
  if (!supported.includes(language)) language = 'ja';
  let cartQuantity = Math.min(20, Math.max(0, parseInt(read('ezo.preview.cart', '0'), 10) || 0));
  let galleryMode = 'pen';
  let toastTimer;
  const t = key => window.EZO_COPY[language][key] ?? window.EZO_COPY.ja[key] ?? key;
  const arrow = '<span class="arrow" aria-hidden="true"></span>';
  const routeLink = (route, label, css = 'text-link') => `<a class="${css}" href="#/${route}">${esc(label)}${arrow}</a>`;
  const image = (name, alt, css = '', extra = '') => `<img src="assets/${name}.jpg" alt="${esc(alt)}" class="${css}" ${extra} loading="lazy" decoding="async">`;
  const eyebrow = text => `<p class="eyebrow">${esc(text)}</p>`;
  const languages = () => `<select class="language-select" data-language aria-label="Language"><option value="ja" ${language === 'ja' ? 'selected' : ''}>日本語</option><option value="en" ${language === 'en' ? 'selected' : ''}>EN</option><option value="zh" ${language === 'zh' ? 'selected' : ''}>中文</option></select>`;
  const getRoute = () => {
    const [path = '', query = ''] = location.hash.replace(/^#\/?/, '').split('?');
    return { path: ['story', 'product', 'guide', 'cart', 'checkout', 'complete', 'contact'].includes(path) ? path : '', params: new URLSearchParams(query) };
  };
  const pageHeader = (label, title, intro = '') => `<div class="page-header container reveal">${eyebrow(label)}<h1 class="preline">${esc(title)}</h1>${intro ? `<p class="body-copy preline">${esc(intro)}</p>` : ''}</div>`;
  const previewNote = () => `<p class="preview-note">${esc(t('previewShort'))}</p>`;
  const photoCaption = () => `<span class="image-caption">IMAGE FOR PREVIEW</span>`;

  function header() {
    const current = getRoute().path;
    const nav = (path, key) => `<a href="#/${path}" ${current === path ? 'aria-current="page"' : ''}>${esc(t(key))}</a>`;
    $('#site-header').innerHTML = `<a class="brand" href="#/" aria-label="Ezowood Hokkaido — Home"><img src="assets/logo.svg" alt="ezowood" width="165" height="52"><span>HOKKAIDO</span></a><nav class="header-nav" aria-label="Main navigation">${nav('story','navStory')}${nav('product','navCollection')}${nav('guide','navGuide')}<div class="header-tools">${languages()}<a class="cart-link" href="#/cart" aria-label="${esc(t('cart'))} ${cartQuantity}"><i class="bag" aria-hidden="true"></i><span>${String(cartQuantity).padStart(2, '0')}</span></a><button class="menu-button" data-menu aria-label="${esc(t('menu'))}"></button></div></nav>`;
    $('#menu-dialog').innerHTML = `<button class="modal-close" data-close aria-label="${esc(t('close'))}">×</button>${eyebrow('EZOWOOD HOKKAIDO')}<nav class="menu-links" aria-label="${esc(t('menu'))}"><a href="#/story">${esc(t('navStory'))}<span class="eyebrow">OUR STORY</span></a><a href="#/product">${esc(t('navCollection'))}<span class="eyebrow">COLLECTION</span></a><a href="#/guide">${esc(t('navGuide'))}<span class="eyebrow">GUIDE</span></a><a href="#/contact">${esc(t('navContact'))}<span class="eyebrow">CONTACT</span></a></nav>${languages()}`;
  }
  function footer() {
    $('#site-footer').innerHTML = `<div class="footer-top"><div class="footer-brand"><a href="#/" aria-label="Ezowood Hokkaido — Home"><img src="assets/logo.svg" alt="ezowood" width="240" height="90"><div class="eyebrow">HOKKAIDO</div></a><p>${esc(t('footerTagline'))}</p></div><nav class="footer-links" aria-label="Footer"><a href="#/story">${esc(t('navStory'))}</a><a href="#/product">${esc(t('navCollection'))}</a><a href="#/guide">${esc(t('navGuide'))}</a><a href="#/contact">${esc(t('navContact'))}</a></nav></div><div class="footer-bottom"><p>${esc(t('footerNote'))}<br>${esc(t('previewShort'))}</p><small>${esc(t('copyright'))}</small></div>`;
    let badge = $('.preview-chip');
    if (!badge) { badge = document.createElement('a'); badge.className = 'preview-chip'; document.body.append(badge); }
    badge.href = '#/guide'; badge.textContent = t('previewLabel'); badge.title = t('previewShort');
  }
  function home() {
    return `<section class="hero" aria-labelledby="hero-title"><div class="hero-media"><video id="forest-film" autoplay muted loop playsinline preload="metadata" poster="assets/forest.jpg" aria-label="${esc(t('heroEyebrow'))}"><source src="assets/forest-film.mp4" type="video/mp4"></video></div><div class="hero-shade"></div><div class="hero-content reveal">${eyebrow(t('heroEyebrow'))}<h1 id="hero-title" class="preline">${esc(t('heroTitle'))}</h1><p class="hero-sub">${esc(t('heroSub'))}</p>${routeLink('story',t('discoverStory'))}</div><div class="hero-bottom"><p class="hero-place"><strong>HOKKAIDO, JAPAN</strong><br>WOOD & CRAFT / EZOWOOD</p><a class="scroll-cue" href="#origin" data-origin>${esc(t('scroll'))}</a></div><button class="film-control" data-film aria-label="${language === 'ja' ? '映像の再生を切り替える' : language === 'zh' ? '播放或暂停影片' : 'Play or pause film'}" aria-pressed="false"><i aria-hidden="true"></i>IMAGE FILM</button></section>
    <section id="origin" class="origin container"><div class="origin-mark" aria-hidden="true">HOKKAIDO</div>${eyebrow(t('originEyebrow'))}<h2 class="section-title preline">${esc(t('originTitle'))}</h2><p class="body-copy preline">${esc(t('originBody'))}</p>${routeLink('story',t('originLink'))}</section>
    <section class="collection" aria-labelledby="collection-heading"><a class="collection-image" href="#/product">${image('pen',t('productName'))}${photoCaption()}</a><div class="collection-content">${eyebrow(t('collectionEyebrow'))}<h2 id="collection-heading" class="collection-title preline">${esc(t('collectionTitle'))}</h2><h3>${esc(t('productName'))}</h3><p class="product-en">${esc(t('productEnglish'))}</p><p class="body-copy preline">${esc(t('productLead'))}</p><div class="product-tags"><span>${esc(t('madeToOrder'))}</span><span>${esc(t('limitedRun'))}</span></div>${routeLink('product',t('seeProduct'))}</div></section>
    <section class="craft-section container"><div class="craft-intro">${eyebrow(t('craftEyebrow'))}<h2 class="section-title preline">${esc(t('craftTitle'))}</h2></div><div class="craft-grid"><a class="craft-image" href="#/story?section=craft">${image('craft',t('storyCraftTitle'))}${photoCaption()}</a><div class="craft-text"><div class="craft-number" aria-hidden="true">01 /</div><h3 class="section-title preline">${esc(t('storyCraftTitle'))}</h3><p class="body-copy preline">${esc(t('craftBody'))}</p>${routeLink('story?section=craft',t('readCraft'))}</div></div></section>
    <section class="gift">${image('forest',t('giftEyebrow'))}<div class="gift-content container"><div>${eyebrow(t('giftEyebrow'))}<h2 class="section-title preline">${esc(t('giftTitle'))}</h2></div><div class="gift-right"><p class="body-copy preline">${esc(t('giftBody'))}</p>${routeLink('product',t('chooseGift'))}</div></div></section>
    <section class="news container"><div>${eyebrow(t('newsEyebrow'))}<h2>${esc(t('newsTitle'))}</h2></div><div><a class="news-row" href="#/product"><span class="eyebrow">COLLECTION</span><span>${esc(t('newsOne'))}</span>${arrow}</a><a class="news-row" href="#/guide?section=order"><span class="eyebrow">INFORMATION</span><span>${esc(t('newsTwo'))}</span>${arrow}</a></div></section>`;
  }
  function story() {
    const sections = [
      ['forest','01','forest', 'storyForestTitle', 'storyForestBody',''],
      ['wood','02','pen','storyWoodTitle','storyWoodBody','grain'],
      ['craft','03','craft','storyCraftTitle','storyCraftBody',''],
      ['gift','04','pen','storyGiftTitle','storyGiftBody','']
    ];
    return `${pageHeader('OUR STORY',t('storyTitle'),t('storyIntro'))}<div class="story-cover">${image('forest',t('storyTitle'))}${photoCaption()}</div><div class="story-content container">${sections.map(([id,n,img,title,body,cls]) => `<section class="story-row" id="story-${id}"><div class="story-row-image">${image(img,t(title),cls)}${photoCaption()}</div><div>${eyebrow(`${n} — ${id}`)}<h2 class="section-title preline">${esc(t(title))}</h2><p class="body-copy preline">${esc(t(body))}</p></div></section>`).join('')}</div><div class="story-end">${eyebrow('THE FIRST PEN')}<h2 class="preline">${esc(t('collectionTitle'))}</h2>${routeLink('product',t('storyCta'),'button')}</div>`;
  }
  function product() {
    const specs = [['specWood','woodValue'],['specType','typeValue'],['specMethod','methodValue'],['specIncluded','includedValue'],['specShipping','shippingValue']];
    return `<div class="product-page container reveal"><a class="back-link" href="#/">${esc(t('returnHome'))}</a><div class="product-layout"><div class="product-gallery"><button class="product-main-image" data-zoom aria-label="${esc(t('photoNotice'))}">${image('pen',t('productName'),'', 'id="product-photo"')}<span class="zoom-hint" aria-hidden="true">＋</span></button><div class="gallery-thumbs" aria-label="Gallery"><button class="active" data-gallery="pen" aria-label="${esc(t('productName'))}" aria-pressed="true">${image('pen',t('productName'))}</button><button data-gallery="grain" aria-label="${esc(t('grainNotice'))}" aria-pressed="false">${image('pen',t('grainNotice'))}</button><button data-gallery="craft" aria-label="${esc(t('storyCraftTitle'))}" aria-pressed="false">${image('craft',t('storyCraftTitle'))}</button></div><p class="small-copy">${esc(t('photoNotice'))}</p></div><div class="product-info">${eyebrow(t('productEyebrow'))}<h1>${esc(t('productName'))}</h1><p class="product-en">${esc(t('productEnglish'))}</p><div class="price">${esc(t('pricePending'))}</div><p class="price-note">${esc(t('priceNote'))}</p><p class="product-description">${esc(t('productStory'))}</p><div class="product-points"><div>${esc(t('madeToOrder'))} / ${esc(t('limitedRun'))}</div><div>${esc(t('leadTime'))}</div></div><label class="quantity-label" for="product-quantity">${esc(t('quantity'))}</label><div class="quantity-control"><button data-quantity="-1" aria-label="${esc(t('decrease'))}">−</button><input id="product-quantity" type="number" min="1" max="20" step="1" value="1" inputmode="numeric"><button data-quantity="1" aria-label="${esc(t('increase'))}">＋</button></div><button class="button" data-add-cart>${esc(t('addCart'))}${arrow}</button><a class="button outline" href="#/cart">${esc(t('viewCart'))}${arrow}</a><button class="notify-link" data-notify>${esc(t('notifyButton'))} ↗</button><p class="product-notice">${esc(t('grainNotice'))}<br>${esc(t('previewShort'))}</p></div></div><section class="specs"><h2>${esc(t('detailsTitle'))}</h2><dl>${specs.map(([key,value]) => `<div class="spec-row"><dt>${esc(t(key))}</dt><dd>${esc(t(value))}</dd></div>`).join('')}</dl></section><section class="care-block"><h2>${esc(t('careTitle'))}</h2><div><p>${esc(t('careBody'))}</p>${routeLink('guide',t('navGuide'))}</div></section></div>`;
  }
  function guide() {
    const parts = [['order','guideOrderTitle','guideOrderBody'],['delivery','guideDeliveryTitle','guideDeliveryBody'],['grain','guideGrainTitle','guideGrainBody'],['care','guideCareTitle','guideCareBody'],['cancel','guideCancelTitle','guideCancelBody'],['overseas','guideOverseasTitle','guideOverseasBody']];
    return `${pageHeader('SHOPPING GUIDE',t('guideTitle'),t('guideIntro'))}<div class="guide-layout container"><nav class="guide-nav">${parts.map(([id,key]) => `<a href="#/guide?section=${id}">${esc(t(key))}</a>`).join('')}<button class="notify-link" data-notify>${esc(t('notifyButton'))}</button></nav><div>${previewNote()}${parts.map(([id,key,body]) => `<section class="guide-section" id="guide-${id}"><h2>${esc(t(key))}</h2><p class="body-copy">${esc(t(body))}</p></section>`).join('')}</div></div>`;
  }
  function summary(checkout = false) {
    return `<aside class="summary"><h2>${esc(t('orderSummary'))}</h2><div class="summary-row"><span>${esc(t('quantity'))}</span><span>${cartQuantity} ${esc(t('unit'))}</span></div><div class="summary-row"><span>${esc(t('subtotal'))}</span><span>${esc(t('pending'))}</span></div><div class="summary-row"><span>${esc(t('shipping'))}</span><span>${esc(t('pending'))}</span></div><div class="summary-row total"><span>${esc(t('total'))}</span><span>${esc(t('pending'))}</span></div>${checkout ? '' : routeLink('checkout',t('checkoutButton'),'button')}<p class="small-copy">${esc(t('priceNote'))}<br>${esc(t('previewShort'))}</p></aside>`;
  }
  function cart() {
    if (!cartQuantity) return `${pageHeader('YOUR SELECTION',t('cartTitle'))}<div class="cart-empty container"><p>${esc(t('emptyCart'))}</p>${routeLink('product',t('continueShopping'),'button')}</div>`;
    return `${pageHeader('YOUR SELECTION',t('cartTitle'))}<div class="shop-layout container"><div>${previewNote()}<div class="cart-item">${image('pen',t('productName'))}<div><a href="#/product"><h2>${esc(t('productName'))}</h2></a><p class="small-copy">${esc(t('madeToOrder'))}</p><div class="quantity-control"><button data-cart-change="-1" ${cartQuantity === 1 ? 'disabled' : ''} aria-label="${esc(t('decrease'))}">−</button><span style="min-width:35px;text-align:center;font:12px Arial" aria-live="polite">${cartQuantity}</span><button data-cart-change="1" ${cartQuantity === 20 ? 'disabled' : ''} aria-label="${esc(t('increase'))}">＋</button></div><button class="remove-link" data-remove>${esc(t('remove'))}</button></div></div><p class="small-copy" style="margin:23px 0">${esc(t('grainNotice'))}</p>${routeLink('product',t('continueShopping'))}</div>${summary()}</div>`;
  }
  function checkout() {
    if (!cartQuantity) return cart();
    const sample = language === 'ja' ? ['サンプルのお客様','sample@example.com','サンプルの配送先','販売開始前にご案内','カード情報は入力しません'] : language === 'zh' ? ['示例顾客','sample@example.com','示例收货地址','将在开售前公布','无需输入银行卡资料'] : ['Sample customer','sample@example.com','Sample delivery address','Details before launch','No card details are required'];
    return `${pageHeader('ORDER PREVIEW',t('checkoutTitle'))}<div class="shop-layout container"><div><p class="preview-note">${esc(t('checkoutIntro'))}</p><div class="checkout-panel"><h2>01 / ${esc(t('customerPreview'))}</h2><div class="sample-field"><span>${esc(sample[0])}</span><strong>${esc(sample[1])}</strong></div><div class="sample-field"><span>${esc(t('deliveryPreview'))}</span><strong>${esc(sample[2])}</strong></div></div><div class="checkout-panel"><h2>02 / ${esc(t('deliveryPreview'))}</h2><p class="small-copy">${esc(t('shippingValue'))}<br>${esc(t('priceNote'))}</p></div><div class="checkout-panel"><h2>03 / ${esc(t('paymentPreview'))}</h2><p class="small-copy">${esc(sample[3])}<br>${esc(sample[4])}</p></div><form id="checkout-form"><label class="checkbox-line"><input type="checkbox" id="preview-consent" required><span>${esc(t('agreePreview'))}</span></label><button class="button" type="submit">${esc(t('previewSubmit'))}${arrow}</button><p class="small-copy" style="margin-top:20px">${esc(t('privacyNote'))}</p></form></div>${summary(true)}</div>`;
  }
  function complete() {
    return `<section class="complete reveal"><div class="complete-mark" aria-hidden="true">✓</div>${eyebrow('PREVIEW COMPLETE')}<h1 class="preline">${esc(t('completeTitle'))}</h1><p class="body-copy preline">${esc(t('completeBody'))}</p>${routeLink('',t('returnHome'),'button')}</section>`;
  }
  function contact() {
    return `${pageHeader('CONTACT',t('contactTitle'))}<section class="contact-area container"><p class="body-copy">${esc(t('contactBody'))}</p>${routeLink('guide',t('contactFaq'),'button outline')}<button class="notify-link" data-notify style="margin-top:35px">${esc(t('notifyButton'))} ↗</button><p class="privacy-note">${esc(t('privacyNote'))}</p></section>`;
  }
  function render(resetScroll = true) {
    const { path, params } = getRoute();
    document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    document.body.classList.toggle('home', !path);
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
    header(); footer(); galleryMode = 'pen';
    const pages = {story,product,guide,cart,checkout,complete,contact};
    $('#main').innerHTML = path ? pages[path]() : home();
    const titles = {story:'navStory',product:'productName',guide:'navGuide',cart:'cart',checkout:'checkoutTitle',complete:'completeTitle',contact:'navContact'};
    document.title = `${path ? t(titles[path]) : t('heroTitle').replace('\n',language==='en'?' ':'')} | Ezowood Hokkaido`;
    if (resetScroll) window.scrollTo({ top: 0, behavior: 'instant' });
    updateHeader();
    if (params.has('section')) {
      const section = document.getElementById(`${path}-${params.get('section')}`);
      if (section) requestAnimationFrame(() => section.scrollIntoView({behavior:'smooth',block:'start'}));
    }
    const video = $('#forest-film');
    if (video) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.pause();
      else video.play().catch(() => { const control = $('[data-film]'); if (control) control.classList.add('paused'); });
    }
  }
  function updateHeader() { $('#site-header').classList.toggle('scrolled', window.scrollY > 45); }
  function setCart(q) { cartQuantity = Math.min(20, Math.max(0, Math.trunc(Number(q)) || 0)); save('ezo.preview.cart',cartQuantity); }
  function toast(text) { const node = $('#toast'); node.textContent = text; node.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('show'), 3200); }
  function notify() {
    $('#notify-dialog').innerHTML = `<button class="modal-close" data-close aria-label="${esc(t('close'))}">×</button>${eyebrow('STAY IN TOUCH')}<h2>${esc(t('notifyTitle'))}</h2><p class="body-copy">${esc(t('notifyBody'))}</p><form id="notify-form"><label for="notify-email">${esc(t('email'))}</label><input id="notify-email" type="email" value="sample@example.com" autocomplete="off" required><button class="button" type="submit">${esc(t('notifySubmit'))}${arrow}</button></form><p class="small-copy">${esc(t('notifyDisclaimer'))}</p>`;
    $('#notify-dialog').showModal();
  }
  document.addEventListener('click', e => {
    const el = e.target.closest('button,a'); if (!el) return;
    if (el.matches('.skip-link')) { e.preventDefault(); $('#main').focus(); return; }
    if (el.matches('[data-menu]')) { $('#menu-dialog').showModal(); return; }
    if (el.matches('[data-close]')) { el.closest('dialog').close(); return; }
    if (el.matches('#menu-dialog a')) { $('#menu-dialog').close(); }
    if (el.matches('[data-origin]')) { e.preventDefault(); $('#origin')?.scrollIntoView({behavior:'smooth'}); return; }
    if (el.matches('[data-film]')) { const v=$('#forest-film'); if (v.paused) {v.play().catch(()=>{}); el.classList.remove('paused'); el.setAttribute('aria-pressed','false');} else {v.pause();el.classList.add('paused');el.setAttribute('aria-pressed','true');} return; }
    if (el.matches('[data-quantity]')) { const input=$('#product-quantity'); input.value=Math.min(20,Math.max(1,(parseInt(input.value,10)||1)+Number(el.dataset.quantity))); return; }
    if (el.matches('[data-add-cart]')) { const q=Math.min(20,Math.max(1,parseInt($('#product-quantity').value,10)||1)); $('#product-quantity').value=q; if (cartQuantity+q>20) {toast(t('toastLimit'));return;} setCart(cartQuantity+q); header();toast(t('toastAdded'));return; }
    if (el.matches('[data-cart-change]')) {setCart(cartQuantity+Number(el.dataset.cartChange));render(false);return;}
    if (el.matches('[data-remove]')) {setCart(0);render(false);toast(t('toastRemoved'));return;}
    if (el.matches('[data-notify]')) {notify();return;}
    if (el.matches('[data-gallery]')) {
      galleryMode=el.dataset.gallery;
      const photo=$('#product-photo');photo.src=`assets/${galleryMode==='craft'?'craft':'pen'}.jpg`;photo.className=galleryMode==='grain'?'grain':'';
      document.querySelectorAll('[data-gallery]').forEach(b=>{b.classList.toggle('active',b===el);b.setAttribute('aria-pressed',String(b===el));});return;
    }
    if (el.matches('[data-zoom]')) {
      $('#image-dialog').innerHTML=`<button class="modal-close" data-close aria-label="${esc(t('close'))}">×</button>${image(galleryMode==='craft'?'craft':'pen',t('productName'))}<p>${esc(t('photoNotice'))}</p>`;$('#image-dialog').showModal();return;
    }
  });
  document.addEventListener('change', e => {
    if (e.target.matches('#product-quantity')) {e.target.value=Math.min(20,Math.max(1,parseInt(e.target.value,10)||1));return;}
    if (!e.target.matches('[data-language]')) return;
    const next=e.target.value;if (!supported.includes(next)) return;const y=window.scrollY;language=next;save('ezo.language',language);clearTimeout(toastTimer);$('#toast').classList.remove('show');$('#toast').textContent='';
    const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);render(false);window.scrollTo(0,y);
  });
  document.addEventListener('submit', e => {
    if (e.target.id==='notify-form') {e.preventDefault();e.target.innerHTML=`<p class="notify-success" role="status">${esc(t('notifySuccess'))}</p>`;return;}
    if (e.target.id==='checkout-form') {e.preventDefault();if (!$('#preview-consent').checked) return;setCart(0);location.hash='/complete';}
  });
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}));
  window.addEventListener('hashchange',()=>render());
  window.addEventListener('scroll',updateHeader,{passive:true});
  render();
})();
