document.addEventListener('DOMContentLoaded', () => {
 document.querySelectorAll('.nav-artists').forEach(group => {
  const button=group.querySelector('.nav-drop-toggle');if(!button)return;
  const close=()=>{group.classList.remove('open');button.setAttribute('aria-expanded','false')};
  button.addEventListener('click',e=>{e.stopPropagation();const next=!group.classList.contains('open');document.querySelectorAll('.nav-artists.open').forEach(g=>{g.classList.remove('open');g.querySelector('button')?.setAttribute('aria-expanded','false')});group.classList.toggle('open',next);button.setAttribute('aria-expanded',String(next))});
  document.addEventListener('click',e=>{if(!group.contains(e.target))close()});
  group.addEventListener('keydown',e=>{if(e.key==='Escape'){close();button.focus()}});
 });
});