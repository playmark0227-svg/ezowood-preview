(() => {
  'use strict';
  const $=(selector,root=document)=>root.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const routes=window.EZO_ROUTES;
  let staticRoute=null;
  const getRoute=()=>staticRoute||routes.parse(location.href)||{path:'',locale:'ja',params:new URLSearchParams()};
  let language=getRoute().locale;
  let galleryMode='pen';
  const t=key=>window.EZO_COPY[language][key]??window.EZO_COPY.ja[key]??key;
  const u=key=>window.EZO_UI[language][key]??window.EZO_UI.ja[key]??key;
  const editorial=()=>window.EZO_EDITORIAL[language];
  const arrow='<span class="arrow" aria-hidden="true"></span>';
  const routeLink=(route,label,css='text-link')=>`<a class="${css}" href="#/${route}"><span>${esc(label)}</span>${arrow}</a>`;
  const transform=html=>routes.transformHTML(html,language);
  const mediaCaption=name=>{
    const item=window.EZO_MEDIA[name]||window.EZO_MEDIA.burl;
    if(item.status==='real') return '';
    const labels={material:'mediaMaterial',landscape:'mediaLandscape',product:'mediaProduct',partner:'mediaPartner',life:'mediaLife',packaging:'mediaPackaging'};
    return u(labels[item.category]||'photoAwaiting');
  };
  const image=(name,alt,css='',extra='')=>{
    const item=window.EZO_MEDIA[name]||window.EZO_MEDIA.burl;
    const description=item.status==='real'?alt:`${mediaCaption(name)} — ${String(alt).replace(/\n/g,' ')}`;
    return `<img src="${routes.asset('assets/'+item.file)}" alt="${esc(description)}" class="${css}" width="1536" height="1024" data-media-status="${item.status}" loading="${name==='hero'?'eager':'lazy'}" decoding="async" ${name==='hero'?'fetchpriority="high"':''} ${extra}>`;
  };
  const eyebrow=text=>`<p class="eyebrow">${esc(text)}</p>`;
  const languages=()=>`<select class="language-select" data-language aria-label="Language"><option value="ja" ${language==='ja'?'selected':''}>日本語</option><option value="en" ${language==='en'?'selected':''}>English</option><option value="zh" ${language==='zh'?'selected':''}>繁體中文</option></select>`;
  const pageHeader=(label,title,intro='')=>`<div class="page-header container">${eyebrow(label)}<h1 class="preline">${esc(title)}</h1>${intro?`<p class="body-copy preline">${esc(intro)}</p>`:''}</div>`;
  const edition=window.EZO_RENDERERS({t,u,editorial,esc,routeLink,image,eyebrow,arrow,pageHeader,getRoute,mediaCaption});

  function header(){
    const current=getRoute().path;
    const links=[['purpose',u('navPurpose'),'OUR PURPOSE'],['story',t('navStory'),'OUR STORY'],['materials',u('navMaterials'),'HOKKAIDO BURL'],['craft',u('navCraft'),'PARTNER WORKSHOPS'],['journal',u('navJournal'),'JOURNAL'],['gift',u('navGift'),'GIFT'],['care',u('navCare'),'USE & CARE'],['guide',t('navGuide'),'RESERVATIONS & DELIVERY'],['contact',t('navContact'),'CONTACT']];
    const nav=(path,label,css='')=>`<a class="${css}" href="#/${path}" ${current===path?'aria-current="page"':''}>${esc(label)}</a>`;
    const headerHtml=transform(`<a class="brand" href="#/" aria-label="Ezowood Hokkaido — Home"><img src="assets/logo.svg" alt="ezowood" width="165" height="52"><span>HOKKAIDO</span></a><nav class="header-nav" aria-label="Main navigation">${nav('purpose',u('navPurpose'))}${nav('materials',u('navMaterials'))}${nav('craft',u('navCraft'))}${nav('journal',u('navJournal'),'nav-journal')}<div class="header-tools">${nav('product',u('navShop'),'header-shop')}${languages()}<button class="menu-button" data-menu aria-label="${esc(t('menu'))}"><span></span><span></span></button></div></nav>`);
    const menuHtml=transform(`<button class="modal-close" data-close aria-label="${esc(t('close'))}">×</button><div class="menu-brand"><img src="assets/logo.svg" alt="ezowood"><span>HOKKAIDO</span></div><div class="menu-layout"><nav class="menu-links" aria-label="${esc(t('menu'))}">${links.map(([path,label,en],i)=>`<a href="#/${path}"><span class="menu-number">${String(i+1).padStart(2,'0')}</span><span>${esc(label)}<small>${en}</small></span>${arrow}</a>`).join('')}</nav><aside><p>${esc(u('footerAbout'))}</p>${routeLink('product',u('navShop'),'button')}<div class="menu-availability">SOLD OUT<span>${esc(u('releaseClosed'))}</span></div>${languages()}</aside></div>`);
    if(!window.EZO_STATIC_BUILD){$('#site-header').innerHTML=headerHtml;$('#menu-dialog').innerHTML=menuHtml;}
    return {header:headerHtml,menu:menuHtml};
  }
  function footer(){
    const link=(path,label)=>`<a href="#/${path}">${esc(label)}</a>`;
    const html=transform(`<div class="footer-top container"><div class="footer-brand"><a href="#/" aria-label="Ezowood Hokkaido — Home"><img src="assets/logo.svg" alt="ezowood" width="240" height="90"><span>HOKKAIDO</span></a><p>${esc(u('footerAbout'))}</p><small>HOKKAIDO BURL & JAPANESE CRAFT<br>CURATED BY EZOWOOD HOKKAIDO</small></div><div class="footer-nav-group"><p>${esc(u('footerExplore'))}</p><nav aria-label="${esc(u('footerExplore'))}">${link('purpose',u('navPurpose'))}${link('story',t('navStory'))}${link('materials',u('navMaterials'))}${link('craft',u('navCraft'))}${link('journal',u('navJournal'))}</nav></div><div class="footer-nav-group"><p>${esc(u('footerSupport'))}</p><nav aria-label="${esc(u('footerSupport'))}">${link('product',u('navShop'))}${link('gift',u('navGift'))}${link('care',u('navCare'))}${link('guide',t('navGuide'))}${link('contact',t('navContact'))}</nav></div></div><div class="footer-bottom container"><p>${esc(u('aboutImage'))}<br>${esc(t('previewShort'))}</p><small>${esc(t('copyright'))}</small></div>`);
    if(!window.EZO_STATIC_BUILD)$('#site-footer').innerHTML=html;
    return html;
  }
  function monthLabel(value){
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(value||''))return u('releaseMonthPending');
    const [year,month]=value.split('-').map(Number);
    return new Intl.DateTimeFormat(language==='zh'?'zh-TW':language,{year:'numeric',month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(year,month-1,1)));
  }
  function releasePanel(){
    return `<section class="release-panel" id="product-release-window" aria-labelledby="release-title"><div class="release-heading"><span class="sold-out">SOLD OUT</span><span class="release-phase">${esc(u('releaseStatus'))}</span></div><h2 id="release-title">${esc(u('releaseClosed'))}</h2><p class="body-copy">${esc(u('releaseIntro'))}</p><div class="release-windows">${window.EZO_RELEASES.windows.map((item,i)=>`<article class="release-window"><div><span class="release-number">${String(i+1).padStart(2,'0')}</span><h3>${esc(u('releaseNext'))}</h3></div><dl><div><dt>${esc(u('releaseMonthLabel'))}</dt><dd>${esc(monthLabel(item.shippingMonth))}</dd></div><div><dt>${esc(u('releaseOpenLabel'))}</dt><dd>${esc(u('releaseDatePending'))}</dd></div><div><dt>${esc(u('releaseCapacityLabel'))}</dt><dd>${esc(u('releaseCapacityPending'))}</dd></div></dl></article>`).join('')}</div><button class="button release-disabled" type="button" disabled>${esc(u('releaseButton'))}<span aria-hidden="true">—</span></button><p class="small-copy">${esc(u('releaseNotice'))}</p>${routeLink('guide?section=order',u('releaseFlowLink'))}</section>`;
  }
  function international(){
    return `<section class="international-section container" id="guide-international">${eyebrow('FROM HOKKAIDO, TO THE WORLD')}<h2 class="section-title preline">${esc(u('internationalTitle'))}</h2><p class="body-copy">${esc(u('internationalLead'))}</p><div class="international-grid">${u('internationalRegions').map(region=>`<div><h3>${esc(region)}</h3><span>${esc(u('internationalStatus'))}</span></div>`).join('')}</div><div class="international-languages" aria-label="${esc(u('internationalLanguage'))}"><a href="${routes.url(getRoute().path,'ja',Object.fromEntries(getRoute().params))}" lang="ja">日本語</a><a href="${routes.url(getRoute().path,'en',Object.fromEntries(getRoute().params))}" lang="en">English</a><a href="${routes.url(getRoute().path,'zh',Object.fromEntries(getRoute().params))}" lang="zh-Hant">繁體中文</a></div><p class="small-copy">${esc(u('internationalNote'))}</p></section>`;
  }
  function product(){
    const specs=[['specWood','woodValue'],['specType','typeValue'],['specMethod','methodValue'],['specIncluded','includedValue'],['specShipping','shippingValue'],['detailDimensions','detailPending'],['detailFinish','detailPending'],['detailRefill','detailPending']];
    return `<div class="product-page container"><a class="back-link" href="#/materials">${esc(u('navMaterials'))}</a><div class="product-layout"><div class="product-gallery"><button class="product-main-image" data-zoom aria-label="${esc(t('photoNotice'))}">${image('pen',t('productName'),'','id="product-photo"')}<span class="zoom-hint" aria-hidden="true">＋</span></button><div class="gallery-thumbs" aria-label="Gallery">${['pen','burl'].map((name,i)=>`<button class="${i===0?'active':''}" data-gallery="${name}" aria-label="${esc(i===0?t('productName'):u('mediaMaterial'))}" aria-pressed="${i===0}">${image(name,i===0?t('productName'):u('mediaMaterial'))}</button>`).join('')}</div><p class="small-copy product-image-state" data-product-caption>${esc(mediaCaption('pen'))}</p><p class="small-copy">${esc(t('photoNotice'))}</p></div><div class="product-info">${eyebrow('HOKKAIDO BURL / THE FIRST OBJECT')}<h1>${esc(t('productName'))}</h1><p class="product-en">SHIRAKABA BURL BALLPOINT PEN</p><p class="product-description">${esc(t('productStory'))}</p><div class="price">${esc(t('pricePending'))}</div><p class="price-note">${esc(t('priceNote'))}</p>${releasePanel()}<p class="product-notice">${esc(t('grainNotice'))}</p></div></div><section class="specs"><h2>${esc(t('detailsTitle'))}</h2><dl>${specs.map(([key,value])=>`<div class="spec-row"><dt>${esc(key.startsWith('detail')?u(key):t(key))}</dt><dd>${esc(value.startsWith('detail')?u(value):t(value))}</dd></div>`).join('')}</dl></section></div>${edition.productDetails()}`;
  }
  function guide(){
    const parts=[['order','guideOrderTitle','guideOrderBody'],['delivery','guideDeliveryTitle','guideDeliveryBody'],['grain','guideGrainTitle','guideGrainBody'],['care','guideCareTitle','guideCareBody'],['cancel','guideCancelTitle','guideCancelBody'],['overseas','guideOverseasTitle','guideOverseasBody']];
    return `${pageHeader('RESERVATIONS & DELIVERY',t('guideTitle'),t('guideIntro'))}<div class="guide-layout container"><nav class="guide-nav" aria-label="${esc(u('toc'))}">${parts.map(([id,key])=>`<a href="#/guide?section=${id}">${esc(t(key))}</a>`).join('')}<a href="#/guide?section=international">${esc(u('internationalLink'))}</a><a href="#/guide?section=faq">FAQ</a></nav><div><div class="guide-closed"><strong>SOLD OUT</strong><p>${esc(u('releaseClosed'))}</p></div>${parts.map(([id,key,body])=>`<section class="guide-section" id="guide-${id}"><h2>${esc(t(key))}</h2><p class="body-copy">${esc(t(body))}</p></section>`).join('')}</div></div>${international()}${edition.faq()}`;
  }
  function closedPage(){return `${pageHeader('RESERVATIONS CLOSED',u('releaseTitle'),u('releaseClosed'))}<div class="closed-order-page container">${releasePanel()}${routeLink('product',u('navShop'),'button outline')}</div>`;}
  function contact(){return `${pageHeader('CONTACT',t('contactTitle'))}<section class="contact-area container"><p class="body-copy">${esc(t('contactBody'))}</p>${routeLink('purpose',u('projectLink'),'button outline')}${routeLink('guide',t('contactFaq'))}</section>${international()}`;}
  function pageContent(path){
    if(['story','materials','craft','purpose','gift','care'].includes(path))return edition.page(path);
    const pages={journal:()=>edition.journal(),product,guide,contact,cart:closedPage,checkout:closedPage,complete:closedPage};
    return path&&pages[path]?pages[path]():edition.home();
  }

  if(window.EZO_STATIC_BUILD){
    window.EZO_RENDER_PAGE=(path,locale,params={})=>{
      staticRoute={path,locale,params:new URLSearchParams(params)};language=locale;
      const shell=header();
      return {main:transform(pageContent(path)),header:shell.header,menu:shell.menu,footer:footer()};
    };
    return;
  }
  const notFoundPage=document.documentElement.dataset.staticPage==='404';
  const firstRoute=getRoute();
  const legacyHash=location.hash.startsWith('#/');
  const legacyLanguage=new URLSearchParams(location.search).get('lang');
  if(legacyHash||legacyLanguage){
    const target=routes.url(firstRoute.path,firstRoute.locale,Object.fromEntries(firstRoute.params));
    if(target!==location.pathname+location.search+location.hash){location.replace(target);return;}
  }
  function render(){
    language=getRoute().locale;
    document.body.classList.toggle('home',!getRoute().path);
    document.documentElement.lang=language==='zh'?'zh-Hant':language;
    const breadcrumb=$('.static-breadcrumb')?.outerHTML||'';
    header();footer();galleryMode='pen';
    $('#main').innerHTML=breadcrumb+transform(pageContent(getRoute().path));
    updateHeader();
    if(location.hash&&!location.hash.startsWith('#/'))requestAnimationFrame(()=>{
      let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
      document.getElementById(id)?.scrollIntoView({behavior:'auto',block:'start'});
    });
  }
  function updateHeader(){$('#site-header')?.classList.toggle('scrolled',window.scrollY>45);}
  function notify(){
    $('#notify-dialog').innerHTML=transform(`<button class="modal-close" data-close aria-label="${esc(t('close'))}">×</button>${eyebrow('NEXT RELEASE')}<h2>${esc(t('notifyTitle'))}</h2><p class="body-copy">${esc(t('notifyBody'))}</p>${routeLink('guide?section=order',u('releaseFlowLink'),'button')}<p class="small-copy">${esc(t('notifyDisclaimer'))}</p>`);
    $('#notify-dialog').showModal();
  }
  document.addEventListener('click',event=>{
    const el=event.target.closest('button,a');if(!el)return;
    if(el.matches('.skip-link')){event.preventDefault();$('#main').focus();return;}
    if(el.matches('[data-menu]')){$('#menu-dialog').showModal();return;}
    if(el.matches('[data-close]')){el.closest('dialog').close();return;}
    if(el.matches('#menu-dialog a'))$('#menu-dialog').close();
    if(el.matches('[data-origin]')){event.preventDefault();$('#origin')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return;}
    if(el.matches('[data-faq-filter]')){const category=el.dataset.faqFilter;const section=el.closest('.faq-section');let count=0;section.querySelectorAll('[data-category]').forEach(item=>{item.hidden=category!=='all'&&item.dataset.category!==category;if(!item.hidden)count++;});section.querySelectorAll('[data-faq-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button===el)));section.querySelector('[data-faq-count]').textContent=count;return;}
    if(el.matches('[data-grain-tab]')){const index=Number(el.dataset.grainTab);document.querySelectorAll('[data-grain-tab]').forEach(button=>button.setAttribute('aria-pressed',String(button===el)));$('[data-grain-description]').textContent=u('grainBodies')[index];$('[data-grain-label]').textContent=`0${index+1} / ${u('grainNames')[index]}`;$('[data-grain-view]').className=`grain-view focus-${index}`;return;}
    if(el.matches('[data-notify]')){notify();return;}
    if(el.matches('[data-gallery]')){const name=el.dataset.gallery;if(!['pen','burl'].includes(name))return;galleryMode=name;const media=window.EZO_MEDIA[name];const photo=$('#product-photo');photo.src=routes.asset('assets/'+media.file);photo.alt=mediaCaption(name)||t('productName');photo.dataset.mediaStatus=media.status;$('[data-product-caption]').textContent=mediaCaption(name);document.querySelectorAll('[data-gallery]').forEach(button=>{button.classList.toggle('active',button===el);button.setAttribute('aria-pressed',String(button===el));});return;}
    if(el.matches('[data-zoom]')){$('#image-dialog').innerHTML=transform(`<button class="modal-close" data-close aria-label="${esc(t('close'))}">×</button>${image(galleryMode,t('productName'))}<p>${esc(mediaCaption(galleryMode))}<br>${esc(t('photoNotice'))}</p>`);$('#image-dialog').showModal();}
  });
  document.addEventListener('change',event=>{
    if(!event.target.matches('[data-language]'))return;
    const next=event.target.value;if(!['ja','en','zh'].includes(next))return;
    const current=getRoute();const params=Object.fromEntries(current.params);
    location.assign(routes.url(current.path,next,params));
  });
  document.addEventListener('submit',event=>{event.preventDefault();});
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}));
  window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#/')){const current=getRoute();location.replace(routes.url(current.path,current.locale,Object.fromEntries(current.params)));}});
  window.addEventListener('scroll',updateHeader,{passive:true});
  if(notFoundPage)updateHeader();else render();
})();
