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
  const css=document.createElement('link');css.rel='stylesheet';css.href=url('css/companion.css?v=6');document.head.append(css);
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
  const sizes=()=>({w:innerWidth<=700?126:100,h:innerWidth<=700?157.5:120});
  function clamp(){const s=sizes();x=Math.max(4,Math.min(innerWidth-s.w-4,x));y=Math.max(4,Math.min(innerHeight-s.h-4,y));pet.style.transform=`translate3d(${x}px,${y}px,0)`;bubble.style.left=x<220?'0':'auto';bubble.style.right=x<220?'auto':'0';bubble.classList.toggle('below',y<150);}

  // Articulated vector character: continuous joint motion, no frame replacement.
  let joints={},rigTime=0;
  const looks={hazan:['#d99b50','#ffdfac','#862b40',false],'lucian-cross':['#41434c','#7a7c88','#292631',true],'vivian-hale':['#d7a469','#fff1db','#87245f',true],'seren-vega':['#33343c','#fff7e9','#bc2938',false],'layla-rezonans':['#e4b77b','#fff0cf','#1eafa9',false],'aurelia-nox':['#eee6dc','#fffaf0','#253b77',true],'clara-stone':['#858093','#d1c9db','#7247a2',false],'deniz-ekin':['#e8ac4d','#ffe1a2','#285c9c',true],'aras-demir':['#df9142','#fff3d7','#269e9b',true],'mahir-koz':['#ad9476','#e8d7bd','#9a4430',true]};
  function skin(){
    const [fur,cream,scarf,dog]=looks[selected];
    const leg=(id,c)=>'<g data-joint="'+id+'"><path d="M0 0 Q-6 14 -2 27" stroke="'+c+'" stroke-width="15" fill="none" stroke-linecap="round"/><g data-joint="'+id+'-lower"><path d="M0 0 L0 18" stroke="'+c+'" stroke-width="12" stroke-linecap="round"/><ellipse cx="5" cy="18" rx="11" ry="6" fill="'+cream+'"/></g></g>';
    art.style.backgroundImage='none';art.classList.remove('sprite');
    art.innerHTML='<svg class="pet-rig" viewBox="0 0 240 240" aria-hidden="true"><ellipse data-joint="shadow" cx="125" cy="213" rx="71" ry="7" fill="#39281d" opacity=".13"/><g data-joint="body"><g data-joint="tail"><path d="M0 0 C-28 -4 -43 -28 -34 -51" fill="none" stroke="'+fur+'" stroke-width="'+(dog?19:25)+'" stroke-linecap="round"/><g data-joint="tail-tip"><path d="M0 0 Q8 -21 -4 -27" fill="none" stroke="'+cream+'" stroke-width="'+(dog?17:23)+'" stroke-linecap="round"/></g></g>'+leg('rear-far',fur)+leg('front-far',fur)+'<ellipse cx="116" cy="149" rx="58" ry="35" fill="'+fur+'"/><ellipse cx="137" cy="157" rx="34" ry="26" fill="'+cream+'"/>'+leg('rear-near',fur)+leg('front-near',fur)+'<g data-joint="head"><g data-joint="ear-left">'+(dog?'<path d="M-38 -31 Q-71 -39 -60 8 Q-47 21 -34 -10Z" fill="'+fur+'"/>':'<path d="M-41 -24 L-44 -66 Q-24 -59 -13 -37Z" fill="'+fur+'"/><path d="M-35 -34 L-37 -54 L-21 -38Z" fill="#e5aaa1"/>')+'</g><g data-joint="ear-right">'+(dog?'<path d="M30 -29 Q57 -41 53 9 Q39 20 28 -6Z" fill="'+fur+'"/>':'<path d="M13 -37 Q29 -60 44 -64 L41 -18Z" fill="'+fur+'"/><path d="M23 -37 L37 -53 L34 -28Z" fill="#e5aaa1"/>')+'</g><ellipse cx="0" cy="0" rx="48" ry="43" fill="'+fur+'"/><path d="M-40 10 Q0 -4 40 10 Q37 42 0 43 Q-35 43 -40 10" fill="'+cream+'"/><g data-joint="eyes"><ellipse cx="-18" cy="-3" rx="11" ry="15" fill="#fff9ed"/><ellipse cx="20" cy="-3" rx="11" ry="15" fill="#fff9ed"/><ellipse cx="-15" cy="-2" rx="7" ry="11" fill="#3b271e"/><ellipse cx="23" cy="-2" rx="7" ry="11" fill="#3b271e"/><circle cx="-13" cy="-7" r="3" fill="white"/><circle cx="25" cy="-7" r="3" fill="white"/></g><g data-joint="closed-eyes" fill="none" stroke="#503628" stroke-width="3" stroke-linecap="round"><path d="M-28 0 Q-18 7 -8 0 M10 0 Q20 7 30 0"/></g><path d="M-7 15 Q0 11 8 15 L1 22Z" fill="'+(dog?'#42302c':'#bb6b6c')+'"/><path d="M1 22 Q0 31 -9 27 M1 22 Q5 32 13 26" stroke="#684533" stroke-width="2" fill="none"/><path d="M-35 30 Q0 48 35 31 L21 48 L-27 46Z" fill="'+scarf+'"/><path d="M-20 43 L-27 70 L-9 61 L-2 46" fill="'+scarf+'"/><circle cx="4" cy="44" r="4" fill="#efc658"/></g></g></svg>';
    joints={};art.querySelectorAll('[data-joint]').forEach(el=>joints[el.dataset.joint]=el);save('rezSurprisePet',selected);
  }
  function animateRig(dt,active){
    if(active)rigTime+=dt;
    const t=rigTime,walk=active&&action==='walk',jump=active&&action==='jump';
    const cycle=t*7.5,hop=jump?Math.max(0,Math.sin((t*2.2)%Math.PI))*28:0;
    const breath=active?Math.sin(t*2)*1.2:0;
    const bob=walk?Math.cos(cycle*2)*1.5:breath;
    joints.body.setAttribute('transform','translate(0 '+(bob-hop)+')');
    joints.shadow.setAttribute('transform','translate(125 213) scale('+(1-hop/100)+' 1) translate(-125 -213)');
    const wag=active?Math.sin(t*(action==='wag'?8:2.3))*(action==='wag'?25:10):0;
    joints.tail.setAttribute('transform','translate(67 142) rotate('+wag+')');
    joints['tail-tip'].setAttribute('transform','translate(-34 -51) rotate('+(active?Math.sin(t*3-1)*12:0)+')');
    const specs=[['rear-far',86,169,Math.PI],['front-far',151,169,0],['rear-near',78,174,0],['front-near',145,174,Math.PI]];
    for(const [id,lx,ly,offset] of specs){const a=walk?Math.sin(cycle+offset)*23:jump?-22:0;const knee=walk?Math.max(0,Math.cos(cycle+offset))*32:jump?38:0;joints[id].setAttribute('transform','translate('+lx+' '+ly+') rotate('+a+')');joints[id+'-lower'].setAttribute('transform','translate(-2 27) rotate('+(-knee)+')');}
    joints.head.setAttribute('transform','translate(160 '+(105+(walk?Math.sin(cycle)*1.2:breath*.4))+') rotate('+(walk?Math.sin(cycle)*1.5:0)+')');
    const blinkPhase=t%4.7,blink=active&&blinkPhase>4.48?Math.sin((blinkPhase-4.48)/.22*Math.PI):0;
    joints.eyes.setAttribute('transform','translate(0 -3) scale(1 '+Math.max(.04,1-blink)+') translate(0 3)');joints['closed-eyes'].setAttribute('opacity',blink>.85?'1':'0');
    joints['ear-left'].setAttribute('transform','rotate('+(active?Math.sin(t*2.1)*2:0)+' -30 -30)');joints['ear-right'].setAttribute('transform','rotate('+(active?Math.sin(t*2.1+.8)*2:0)+' 30 -30)');
    art.style.transform=active&&action==='spin'?'rotate('+Math.sin(t*4)*10+'deg)':'';
  }
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
    animateRig(dt,active);
    requestAnimationFrame(tick);
  }
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});reduced.addEventListener('change',render);
  skin();render();clamp();nextAction=performance.now()+1000;requestAnimationFrame(tick);
})();
