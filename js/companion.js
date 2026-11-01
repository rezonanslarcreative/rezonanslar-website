(() => {
  if (document.getElementById('rez-companion')) return;
  const script = document.currentScript;
  const root = new URL('../', script.src);
  const url = path => new URL(path, root).href;
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const save = (key,value) => { try { localStorage.setItem(key,value); } catch {} };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let hidden = read('rezCompanionHidden') === 'true';
  let paused = read('rezCompanionPaused') === 'true';
  let dancing = false;
  const text = (tr,en) => document.documentElement.lang === 'en' ? en : tr;
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = url('css/companion.css?v=2'); document.head.append(css);
  const mascot = document.createElement('aside');
  mascot.id = 'rez-companion'; mascot.setAttribute('aria-label','Hazan');
  mascot.innerHTML = `<div class="companion-bubble" hidden><a></a><button type="button" class="bubble-close" aria-label="Kapat / Close">×</button></div><button type="button" class="companion-character" aria-label="Hazan ile dans et / Dance with Hazan"><img alt="Hazan" width="100" height="120"></button><button type="button" class="companion-hide" aria-label="Avatarı gizle / Hide avatar">×</button>`;
  mascot.querySelector('img').src = url('assets/avatars/hazan.png');
  document.body.append(mascot);
  const bubble = mascot.querySelector('.companion-bubble');
  const link = bubble.querySelector('a');
  const panel = document.createElement('section');
  panel.className = 'companion-picker wrap';
  panel.innerHTML = `<h2></h2><p></p><div class="companion-options"><button type="button" class="companion-select" aria-pressed="true"><img alt="" width="48" height="58"><span>Hazan</span></button><button type="button" class="companion-toggle"></button><button type="button" class="companion-pause"></button></div>`;
  panel.querySelector('img').src = url('assets/avatars/hazan.png');
  const footer = document.querySelector('footer');
  if (footer) footer.before(panel); else document.body.append(panel);
  function render() {
    mascot.hidden = hidden;
    mascot.classList.toggle('motion-paused',paused || reduced.matches);
    panel.querySelector('h2').textContent = text('Yol arkadaşını seç','Choose your companion');
    panel.querySelector('p').textContent = text('Hazan sana eşlik etsin. Dans için dokun, taşımak için sürükle!','Let Hazan keep you company. Tap to dance, drag to move!');
    panel.querySelector('.companion-toggle').textContent = hidden ? text('Göster','Show') : text('Gizle','Hide');
    panel.querySelector('.companion-pause').textContent = paused ? text('Hareketi başlat','Resume motion') : text('Hareketi durdur','Pause motion');
    panel.querySelector('.companion-pause').setAttribute('aria-pressed',String(paused));
    panel.querySelector('.companion-select').setAttribute('aria-pressed',String(!hidden));
    if (hidden || paused || reduced.matches) bubble.hidden = true;
  }
  function visibility(value) { hidden=value; save('rezCompanionHidden',String(value)); render(); }
  panel.querySelector('.companion-toggle').onclick = () => visibility(!hidden);
  panel.querySelector('.companion-select').onclick = () => { save('rezCompanion','hazan'); visibility(false); };
  mascot.querySelector('.companion-hide').onclick = () => visibility(true);
  panel.querySelector('.companion-pause').onclick = () => { paused=!paused; save('rezCompanionPaused',String(paused)); render(); };
  bubble.querySelector('button').onclick = () => { bubble.hidden=true; };
  const character = mascot.querySelector('.companion-character');
  character.querySelector('img').draggable = false;
  let drag = null, placed = false, suppressClick = false, danceTimer;
  function place(x,y) {
    const rect=mascot.getBoundingClientRect();
    const left=Math.max(0,Math.min(innerWidth-rect.width,x));
    const top=Math.max(0,Math.min(innerHeight-rect.height,y));
    mascot.style.left=left+'px'; mascot.style.top=top+'px';
    mascot.style.right='auto'; mascot.style.bottom='auto';
    mascot.classList.toggle('bubble-below',top<160);
    mascot.classList.toggle('bubble-left-edge',left<230);
  }
  character.addEventListener('pointerdown',e => {
    if (!e.isPrimary || e.button!==0) return;
    const rect=mascot.getBoundingClientRect();
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:rect.left,top:rect.top,moved:false};
    suppressClick=false;
    character.setPointerCapture(e.pointerId);
  });
  character.addEventListener('pointermove',e => {
    if (!drag || e.pointerId!==drag.id) return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if (!drag.moved && Math.hypot(dx,dy)<6) return;
    drag.moved=true; placed=true; bubble.hidden=true;
    mascot.classList.add('dragging');
    place(drag.left+dx,drag.top+dy);
  });
  function finishDrag(e) {
    if (!drag || e.pointerId!==drag.id) return;
    suppressClick=drag.moved;
    drag=null; mascot.classList.remove('dragging');
    if(character.hasPointerCapture(e.pointerId)) character.releasePointerCapture(e.pointerId);
  }
  character.addEventListener('pointerup',finishDrag);
  character.addEventListener('pointercancel',finishDrag);
  character.addEventListener('lostpointercapture',finishDrag);
  window.addEventListener('resize',() => {
    if(placed) { const rect=mascot.getBoundingClientRect(); place(rect.left,rect.top); }
  });
  character.onclick = e => {
    if(suppressClick && e.detail!==0) { suppressClick=false; return; }
    // Pausing automatic motion must not disable an explicitly requested dance.
    clearTimeout(danceTimer);
    mascot.classList.remove('dancing');
    void character.offsetWidth;
    dancing=true; mascot.classList.add('dancing');
    danceTimer=setTimeout(() => { mascot.classList.remove('dancing'); dancing=false; },1800);
  };
  const prompts = [
    ['Yeni şarkılara bakalım mı?','Shall we discover new songs?','#haberler'],
    ['Benim hikâyemi keşfetmek ister misin?','Want to discover my story?','artists/hazan/'],
    ['Senin hikâyen hangi şarkıda?','Which song tells your story?','fan-club/']
  ];
  let index=0, bubbleTimer;
  function suggest() {
    if (hidden || paused || reduced.matches || document.hidden) return;
    const prompt=prompts[index++ % prompts.length];
    link.textContent=text(prompt[0],prompt[1]); link.href=url(prompt[2]);
    bubble.hidden=false; clearTimeout(bubbleTimer);
    bubbleTimer=setTimeout(() => { if (!bubble.contains(document.activeElement)) bubble.hidden=true; },12000);
  }
  function move() {
    if (placed || drag || hidden || paused || reduced.matches || document.hidden || dancing || mascot.matches(':hover') || mascot.contains(document.activeElement)) return;
    // Remain in the edge rail, leaving the central page content available.
    const mobile=innerWidth < 700;
    mascot.style.bottom=(mobile ? 12 : 16 + Math.random()*Math.min(180,innerHeight*0.22))+'px';
  }
  setTimeout(suggest,15000); setInterval(suggest,75000); setInterval(move,14000);
  document.addEventListener('keydown',e => { if (e.key === 'Escape') bubble.hidden=true; });
  document.addEventListener('visibilitychange',() => { if(document.hidden) bubble.hidden=true; });
  new MutationObserver(() => { render(); bubble.hidden=true; }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  reduced.addEventListener('change',render);
  render();
})();
