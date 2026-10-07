
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
const menu=document.querySelector(".menu"),nav=document.querySelector("nav");
if(menu&&nav)menu.addEventListener("click",()=>nav.classList.toggle("open"));
applyLang(lang);
