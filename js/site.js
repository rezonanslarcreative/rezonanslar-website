
const dict={
tr:{home:"Ana Sayfa",artists:"Sanatçılar",about:"Hakkımızda",contact:"İletişim",discover:"Sanatçıları Keşfet",profile:"Sanatçı Profili",music:"Müzik",official:"Resmî bağlantılar",coming:"Platform bağlantıları bu alana eklenecek.",back:"Tüm Sanatçılar",universe:"REZONANSLAR Müzik Evreni"},
en:{home:"Home",artists:"Artists",about:"About",contact:"Contact",discover:"Discover Artists",profile:"Artist Profile",music:"Music",official:"Official links",coming:"Platform links will be added here.",back:"All Artists",universe:"REZONANSLAR Music Universe"}
};
let lang=localStorage.getItem("rezLang")||"tr";
function applyLang(next){
 lang=next;localStorage.setItem("rezLang",lang);document.documentElement.lang=lang;
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
