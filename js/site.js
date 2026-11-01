
const dict={
tr:{home:"Ana Sayfa",artists:"Sanatçılar",about:"Hakkımızda",contact:"İletişim",discover:"Sanatçıları Keşfet",profile:"Sanatçı Profili",music:"Müzik",official:"Resmî bağlantılar",coming:"Platform bağlantıları bu alana eklenecek.",back:"Tüm Sanatçılar",universe:"REZONANSLAR Müzik Evreni"},
en:{home:"Home",artists:"Artists",about:"About",contact:"Contact",discover:"Discover Artists",profile:"Artist Profile",music:"Music",official:"Official links",coming:"Platform links will be added here.",back:"All Artists",universe:"REZONANSLAR Music Universe"}
};
let lang="tr";
try { lang=localStorage.getItem("rezLang")||"tr"; } catch (_) {}
if(!["tr","en"].includes(lang))lang="tr";
function applyLang(next){
 lang=next==="en"?"en":"tr";
 try { localStorage.setItem("rezLang",lang); } catch (_) {}
 document.documentElement.lang=lang;
 document.querySelectorAll("[data-tr][data-en]").forEach(el=>el.textContent=el.dataset[lang]);
 document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));
}
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>applyLang(b.dataset.lang)));
/* Responsive main menu: scoped to header (not breadcrumb navigation). */
const menu=document.querySelector('header .menu');
const nav=document.querySelector('header nav.main-navigation');
if(menu && nav){
  nav.id = nav.id || 'rezonanslar-primary-navigation';
  menu.setAttribute('type','button');
  menu.setAttribute('aria-controls',nav.id);
  menu.setAttribute('aria-expanded','false');
  const closeMenu=()=>{
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded','false');
    nav.querySelectorAll('.nav-artists.open').forEach(group=>{
      group.classList.remove('open');
      const toggle=group.querySelector('.nav-drop-toggle');
      if(toggle)toggle.setAttribute('aria-expanded','false');
    });
  };
  menu.addEventListener('click',()=>{
    const next=!nav.classList.contains('open');
    if(!next) closeMenu();
    else {nav.classList.add('open');menu.setAttribute('aria-expanded','true');}
  });
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && nav.classList.contains('open')){
      closeMenu();menu.focus();
    }
  });
  document.addEventListener('click',event=>{
    if(nav.classList.contains('open') && !event.target.closest('header .header-inner'))closeMenu();
  });
  window.addEventListener('resize',()=>{
    if(window.innerWidth>1000 && nav.classList.contains('open'))closeMenu();
  });
}
applyLang(lang);

/* Shared site-wide page-view counter. One badge request per production page load.
   All pages use the same key; local previews never increment the live counter. */
(() => {
  const footer = document.querySelector('footer .footer-inner');
  if (!footer || document.querySelector('.visit-counter')) return;
  const counter = document.createElement('span');
  counter.className = 'visit-counter';
  counter.style.cssText = 'display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;min-height:20px';
  counter.title = '1 Kasım 2026 tarihinden itibaren sayfa görüntülemeleri / Page views since November 1, 2026';
  const label = document.createElement('span');
  label.dataset.tr = 'Toplam ziyaret';
  label.dataset.en = 'Total visits';
  label.textContent = label.dataset[lang];
  counter.appendChild(label);
  const badge = document.createElement('img');
  badge.alt = 'Toplam sayfa görüntüleme sayısı / Total page views';
  badge.height = 20;
  badge.style.cssText = 'height:20px;width:auto;max-width:100%;vertical-align:middle';
  badge.referrerPolicy = 'no-referrer';
  badge.addEventListener('error', () => {
    badge.remove();
    const unavailable = document.createElement('span');
    unavailable.dataset.tr = 'Şu anda kullanılamıyor';
    unavailable.dataset.en = 'Currently unavailable';
    unavailable.textContent = unavailable.dataset[lang];
    counter.appendChild(unavailable);
  }, { once: true });
  footer.appendChild(counter);
  if (location.hostname === 'rezonanslarcreative.github.io' &&
      location.pathname.startsWith('/rezonanslar-website/') &&
      !location.pathname.includes('/fan-club-preview/')) {
    badge.src = 'https://hits.sh/rezonanslarcreative.github.io/rezonanslar-website.svg?style=flat-square&label=REZ&color=c9a227&labelColor=161411&extraCount=275280';
    counter.appendChild(badge);
  } else {
    const preview = document.createElement('span');
    preview.dataset.tr = 'Önizleme';
    preview.dataset.en = 'Preview';
    preview.textContent = preview.dataset[lang];
    counter.appendChild(preview);
  }
})();

// Load the shared companion relative to this script on every public page.
(() => {
 const base = new URL('../', document.currentScript.src);
 if (location.pathname.includes('/fan-club-preview/')) return;
 const companion = document.createElement('script');
 companion.src = new URL('js/companion.js?v=6',base).href;
 document.body.appendChild(companion);
})();
