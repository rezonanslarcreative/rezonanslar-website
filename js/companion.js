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
  css.rel = 'stylesheet'; css.href = url('css/companion.css?v=1'); document.head.append(css);
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
    panel.querySelector('p').textContent = text('Hazan sana eşlik etsin. Küçük bir dans için ona dokun!','Let Hazan keep you company. Tap her for a little dance!');
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
  mascot.querySelector('.companion-character').onclick = () => {
    if (paused || reduced.matches || dancing) return;
    dancing=true; mascot.classList.add('dancing');
    setTimeout(() => { mascot.classList.remove('dancing'); dancing=false; },1800);
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
    if (hidden || paused || reduced.matches || document.hidden || dancing || mascot.matches(':hover') || mascot.contains(document.activeElement)) return;
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
