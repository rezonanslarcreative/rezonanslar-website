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
  let motionAllowed = read('rezCompanionMotionAllowed') === 'true';
  const motionReduced = () => reduced.matches && !motionAllowed;
  const pets = ['hazan','lucian-cross','vivian-hale','seren-vega','layla-rezonans','aurelia-nox','clara-stone','deniz-ekin','aras-demir','mahir-koz'];
  const storedPet = read('rezSurprisePet');
  let selected = pets.includes(storedPet) ? storedPet : pets[Math.floor(Math.random()*pets.length)];
  save('rezSurprisePet',selected);
  const text = (tr,en) => document.documentElement.lang === 'en' ? en : tr;
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = url('css/companion.css?v=3'); document.head.append(css);
  const mascot = document.createElement('aside');
  mascot.id = 'rez-companion'; mascot.setAttribute('aria-label','Sürpriz arkadaş / Surprise companion');
  mascot.innerHTML = `<div class="companion-bubble" hidden><a></a><button type="button" class="bubble-close" aria-label="Kapat / Close">×</button></div><button type="button" class="companion-character" aria-label="Arkadaşınla oyna / Play with your companion"><img alt="Sürpriz arkadaş / Surprise companion" width="100" height="120"></button><button type="button" class="companion-hide" aria-label="Avatarı gizle / Hide avatar">×</button>`;
  mascot.querySelector('img').src = url('assets/avatars/pets/'+selected+'.png');
  document.body.append(mascot);
  const bubble = mascot.querySelector('.companion-bubble');
  const link = bubble.querySelector('a');
  const panel = document.createElement('section');
  panel.className = 'companion-picker wrap';
  panel.innerHTML = `<h2></h2><p></p><div class="companion-options"><div class="surprise-choices"></div><button type="button" class="companion-toggle"></button><button type="button" class="companion-pause"></button></div>`;
  const choiceButtons = pets.map((id,index) => {
    const button=document.createElement('button');
    button.type='button'; button.className='companion-select';
    button.textContent='✦ '+String(index+1).padStart(2,'0');
    button.onclick=() => {
      selected=id; save('rezSurprisePet',id);
      mascot.querySelector('img').src=url('assets/avatars/pets/'+id+'.png');
      visibility(false); bubble.hidden=true; character.click();
    };
    panel.querySelector('.surprise-choices').append(button);
    return button;
  });
  const footer = document.querySelector('footer');
  if (footer) footer.before(panel); else document.body.append(panel);
  function render() {
    mascot.hidden = hidden;
    mascot.classList.toggle('motion-paused',paused || motionReduced());
    mascot.classList.toggle('motion-enabled',motionAllowed);
    mascot.classList.toggle('reduced-feedback',motionReduced());
    panel.querySelector('h2').textContent = text('Sürpriz arkadaşını keşfet','Discover your surprise companion');
    panel.querySelector('p').textContent = text('Bir gizemli kart seç; arkadaşın ortaya çıksın! Oynamak için dokun, taşımak için sürükle.','Choose a mystery card to reveal your companion! Tap to play, drag to move.');
    panel.querySelector('.companion-toggle').textContent = hidden ? text('Göster','Show') : text('Gizle','Hide');
    panel.querySelector('.companion-pause').textContent = (paused || motionReduced()) ? text('Hareketi başlat','Resume motion') : text('Hareketi durdur','Pause motion');
    panel.querySelector('.companion-pause').setAttribute('aria-pressed',String(paused || motionReduced()));
    choiceButtons.forEach((button,index) => {
      button.setAttribute('aria-label',text('Sürpriz kart ','Mystery card ')+(index+1));
      button.setAttribute('aria-pressed',String(!hidden && pets[index]===selected));
    });
    if (hidden || paused || motionReduced()) bubble.hidden = true;
  }
  function visibility(value) { hidden=value; save('rezCompanionHidden',String(value)); render(); }
  panel.querySelector('.companion-toggle').onclick = () => visibility(!hidden);

  mascot.querySelector('.companion-hide').onclick = () => visibility(true);
  panel.querySelector('.companion-pause').onclick = () => {
    if(paused || motionReduced()) { paused=false; motionAllowed=true; }
    else paused=true;
    if(paused) { clearTimeout(danceTimer); dancing=false; mascot.classList.remove('dancing'); }
    save('rezCompanionPaused',String(paused)); save('rezCompanionMotionAllowed',String(motionAllowed)); render();
  };
  bubble.querySelector('button').onclick = () => { bubble.hidden=true; };
  const character = mascot.querySelector('.companion-character');
  character.querySelector('img').draggable = false;
  let drag = null, placed = false, suppressClick = false, danceTimer;
  const tricks=['dance','hop','spin','wiggle','walk'];
  let lastTrick='';
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
    const available=tricks.filter(t=>t!==lastTrick);
    lastTrick=available[Math.floor(Math.random()*available.length)];
    character.style.setProperty('--companion-trick','companion-'+lastTrick);
    void character.offsetWidth;
    dancing=true; mascot.classList.add('dancing');
    danceTimer=setTimeout(() => { mascot.classList.remove('dancing'); dancing=false; },1800);
  };
  const prompts = [
    ['Yeni şarkılara bakalım mı?','Shall we discover new songs?','#haberler'],
    ['Bu arkadaşın müzik dünyasını keşfet!','Explore your companion’s music world!','artist'],
    ['Senin hikâyen hangi şarkıda?','Which song tells your story?','fan-club/']
  ];
  let index=0, bubbleTimer;
  function suggest() {
    if (hidden || paused || motionReduced() || document.hidden) return;
    const prompt=prompts[index++ % prompts.length];
    link.textContent=text(prompt[0],prompt[1]); link.href=url(prompt[2]==='artist' ? 'artists/'+selected+'/' : prompt[2]);
    bubble.hidden=false; clearTimeout(bubbleTimer);
    bubbleTimer=setTimeout(() => { if (!bubble.contains(document.activeElement)) bubble.hidden=true; },12000);
  }
  function move() {
    if (placed || drag || hidden || paused || motionReduced() || document.hidden || dancing || mascot.matches(':hover') || mascot.matches(':focus-visible')) return;
    // Remain in the edge rail, leaving the central page content available.
    const mobile=innerWidth < 700;
    mascot.style.bottom=(mobile ? 12 : 16 + Math.random()*Math.min(180,innerHeight*0.22))+'px';
    character.style.setProperty('--companion-trick','companion-walk');
    dancing=true; mascot.classList.add('dancing');
    clearTimeout(danceTimer);
    danceTimer=setTimeout(()=>{mascot.classList.remove('dancing');dancing=false;},1800);
  }
  setTimeout(suggest,15000); setInterval(suggest,75000); setInterval(move,14000);
  document.addEventListener('keydown',e => { if (e.key === 'Escape') bubble.hidden=true; });
  document.addEventListener('visibilitychange',() => { if(document.hidden) bubble.hidden=true; });
  new MutationObserver(() => { render(); bubble.hidden=true; }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  reduced.addEventListener('change',render);
  render();
})();
