(() => {
  if(document.getElementById('rez-companion')) return;
  const root=new URL('../',document.currentScript.src),url=p=>new URL(p,root).href;
  const read=k=>{try{return localStorage.getItem(k)}catch{return null}},save=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  const tr=(a,b)=>document.documentElement.lang==='en'?b:a;
  const pets=['hazan','lucian-cross','vivian-hale','seren-vega','layla-rezonans','aurelia-nox','clara-stone','deniz-ekin','aras-demir','mahir-koz'];
  let selected=pets.includes(read('rezSurprisePet'))?read('rezSurprisePet'):pets[Math.floor(Math.random()*pets.length)];
  let hidden=read('rezCompanionHidden')==='true',paused=read('rezCompanionPaused')==='true',pinned=read('rezPetPinned')==='true';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let allowMotion=read('rezCompanionMotionAllowed')==='true';
  const canMove=()=>!paused&&(!reduced.matches||allowMotion);
  const css=document.createElement('link');css.rel='stylesheet';css.href=url('css/companion.css?v=7');document.head.append(css);
  const pet=document.createElement('aside');pet.id='rez-companion';
  pet.innerHTML='<button type="button" class="pet-body" aria-haspopup="dialog"><span class="pet-art"></span></button><div class="pet-bubble" hidden><a></a><button type="button" aria-label="Kapat / Close">×</button></div>';
  const body=pet.querySelector('.pet-body'),art=pet.querySelector('.pet-art'),bubble=pet.querySelector('.pet-bubble');
  const paw=document.createElement('button');paw.id='rez-paw';paw.type='button';paw.textContent='🐾';
  const menu=document.createElement('section');menu.id='rez-pet-menu';menu.hidden=true;menu.setAttribute('role','dialog');menu.setAttribute('aria-label','Pati dostu / Pet companion');
  menu.innerHTML='<header><strong>Pati dostu</strong><button type="button" data-action="close" aria-label="Kapat / Close">×</button></header><button type="button" data-action="pin"></button><button type="button" data-action="pause"></button><button type="button" data-action="change"></button><div class="pet-choices" hidden></div><button type="button" data-action="hide"></button>';
  document.body.append(pet,paw,menu);
  const petNote=document.createElement('p');petNote.className='pet-kindness-note';
  const footer=document.querySelector('footer');if(footer)footer.append(petNote);

  let x=innerWidth-125,y=innerHeight-150,target=null,drag=null,longTimer,suppress=false,action='idle',phase=0,frame=0,last=0,nextAction=0,menuOpen=false;
  const sizes=()=>({w:innerWidth<=700?160:100,h:innerWidth<=700?186:120});
  function clamp(){const s=sizes();x=Math.max(4,Math.min(innerWidth-s.w-4,x));y=Math.max(4,Math.min(innerHeight-s.h-4,y));pet.style.transform=`translate3d(${x}px,${y}px,0)`;bubble.style.left=x<220?'0':'auto';bubble.style.right=x<220?'auto':'0';bubble.classList.toggle('below',y<150);}


  let viewer=null;
  function skin(){
    save('rezSurprisePet',selected);
    if(viewer){viewer.select(selected);return;}
    art.style.backgroundImage='url("'+url('assets/avatars/pets/'+selected+'.png')+'")';
  }
  import(url('js/pet-3d.js?v=1')).then(({makePetViewer})=>{
    const candidate=makePetViewer(art);
    candidate.select(selected);
    viewer=candidate;
    art.style.backgroundImage='none';
  }).catch(()=>skin());
  function render(){petNote.textContent=tr('🐾 Burada her sese, her patiye yer var.','🐾 Every voice and every paw belongs here.');paw.title=tr('REZONANSLAR’ın Pati Dostları','REZONANSLAR’s Pet Friends');pet.hidden=hidden;paw.hidden=!hidden;body.setAttribute('aria-label',tr('Pati dostunla oyna; sağ tık veya uzun bas ile menü','Play with your pet; right-click or long-press for menu'));body.title=tr('Menü: sağ tık veya uzun bas','Menu: right-click or long-press');paw.setAttribute('aria-label',tr('Pati dostunu göster','Show your pet'));menu.querySelector('strong').textContent=tr('REZONANSLAR’ın Pati Dostları','REZONANSLAR’s Pet Friends');menu.querySelector('[data-action=pin]').textContent=pinned?tr('Serbest bırak','Let roam'):tr('Burada sabitle','Stay here');menu.querySelector('[data-action=pause]').textContent=canMove()?tr('Pati dostunu dinlendir','Let your pet rest'):tr('Hareketi başlat','Resume motion');menu.querySelector('[data-action=change]').textContent=tr('Pati dostunu değiştir','Change your pet friend');menu.querySelector('[data-action=hide]').textContent=tr('Gizle','Hide');}
  function closeMenu(focus=false){menu.hidden=true;menuOpen=false;nextAction=performance.now()+1500;if(focus&&!hidden)body.focus();}
  function openMenu(){clearTimeout(longTimer);target=null;bubble.hidden=true;menu.hidden=false;menuOpen=true;render();menu.style.left=Math.max(4,Math.min(innerWidth-menu.offsetWidth-4,x))+'px';menu.style.top=Math.max(4,Math.min(innerHeight-menu.offsetHeight-4,y-menu.offsetHeight))+'px';menu.querySelector('[data-action=pin]').focus();}
  pets.forEach((id,i)=>{const b=document.createElement('button');b.type='button';b.textContent='✦ '+(i+1);b.setAttribute('aria-label','Sürpriz / Surprise '+(i+1));b.onclick=()=>{selected=id;skin();closeMenu();action='wag';phase=performance.now();nextAction=phase+2200;};menu.querySelector('.pet-choices').append(b);});
  menu.addEventListener('click',e=>{const a=e.target.dataset.action;if(!a)return;
    if(a==='close')closeMenu(true);
    if(a==='pin'){pinned=!pinned;target=null;save('rezPetPinned',String(pinned));closeMenu(true);}
    if(a==='pause'){if(canMove())paused=true;else{paused=false;allowMotion=true;}target=null;action='idle';save('rezCompanionPaused',String(paused));save('rezCompanionMotionAllowed',String(allowMotion));closeMenu(true);}
    if(a==='change'){const list=menu.querySelector('.pet-choices');list.hidden=!list.hidden;menu.style.top=Math.max(4,Math.min(innerHeight-menu.offsetHeight-4,y-menu.offsetHeight))+'px';}
    if(a==='hide'){hidden=true;save('rezCompanionHidden','true');closeMenu();paw.focus();}
    render();
  });
  paw.onclick=()=>{hidden=false;save('rezCompanionHidden','false');render();clamp();body.focus();nextAction=performance.now()+1000;};
  body.addEventListener('contextmenu',e=>{e.preventDefault();suppress=true;openMenu();});
  body.addEventListener('keydown',e=>{if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){e.preventDefault();openMenu();}});
  body.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;clearTimeout(longTimer);target=null;suppress=false;drag={id:e.pointerId,px:e.clientX,py:e.clientY,x,y,moved:false};body.setPointerCapture(e.pointerId);if(e.pointerType!=='mouse')longTimer=setTimeout(()=>{suppress=true;openMenu();},550);});
  body.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;let dx=e.clientX-drag.px,dy=e.clientY-drag.py;if(!drag.moved&&Math.hypot(dx,dy)<7)return;clearTimeout(longTimer);drag.moved=true;suppress=true;closeMenu();x=drag.x+dx;y=drag.y+dy;clamp();});
  function release(e){if(!drag||e.pointerId!==drag.id)return;clearTimeout(longTimer);suppress=suppress||drag.moved;drag=null;nextAction=performance.now()+1000;if(body.hasPointerCapture(e.pointerId))body.releasePointerCapture(e.pointerId);}
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>body.addEventListener(n,release));
  body.onclick=e=>{if(suppress&&e.detail!==0){suppress=false;return;}if(!canMove()){art.animate([{opacity:.5},{opacity:1}],{duration:250});return;}action=['jump','wag','spin'][Math.floor(Math.random()*3)];phase=performance.now();nextAction=phase+2100;target=null;};
  document.addEventListener('pointerdown',e=>{if(menuOpen&&!menu.contains(e.target)&&!pet.contains(e.target))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu(true);bubble.hidden=true;}});
  window.addEventListener('resize',()=>{target=null;clamp();if(menuOpen)openMenu();});
  let promptIndex=0;
  bubble.querySelector('button').onclick=()=>bubble.hidden=true;
  setInterval(()=>{if(hidden||menuOpen||drag||!canMove()||document.hidden)return;const prompts=[[tr('Müziği keşfet, pati dostlarımızla tanış.','Discover the music, meet our pet friends.'),'#haberler'],[tr('Müzik dünyamı keşfet!','Explore my music world!'),'artists/'+selected+'/'],[tr('Hikâyeni paylaşmak ister misin?','Want to share your story?'),'fan-club/']];const p=prompts[promptIndex++%prompts.length];bubble.querySelector('a').textContent=p[0];bubble.querySelector('a').href=url(p[1]);bubble.hidden=false;setTimeout(()=>{if(!bubble.contains(document.activeElement))bubble.hidden=true;},10000);},75000);
  function tick(now){const dt=Math.min((now-last)/1000,.05);last=now;
    const active=!hidden&&!document.hidden&&!menuOpen&&!drag&&!pet.matches(':hover')&&canMove();
    if(active){
      if(now>nextAction){phase=now;action=['walk','walk','wag','jump','idle'][Math.floor(Math.random()*5)];nextAction=now+(action==='walk'?4500:2400);if(action==='walk'&&!pinned){const s=sizes();target={x:Math.random()*Math.max(0,innerWidth-s.w-8)+4,y:Math.random()*Math.max(0,innerHeight-s.h-8)+4};}else target=null;}
      if(target&&!pinned){const dx=target.x-x,dy=target.y-y,d=Math.hypot(dx,dy),step=42*dt;if(d<step){x=target.x;y=target.y;target=null;}else{x+=dx/d*step;y+=dy/d*step;}art.classList.toggle('facing-left',dx<0);clamp();}
    }
    if(viewer && !hidden && !document.hidden) viewer.draw(dt,action,active,art.classList.contains('facing-left'));
    requestAnimationFrame(tick);
  }
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});reduced.addEventListener('change',render);
  skin();render();clamp();nextAction=performance.now()+1000;requestAnimationFrame(tick);
})();
