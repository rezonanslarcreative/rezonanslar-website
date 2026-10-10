/* REZONANSLAR Haberler v6 — 11.10.2026
   Continuous right-to-left flow uses GPU-translated track, not scrollLeft.
   This avoids browser-dependent scroll behavior and stale legacy carousel CSS.
*/
(() => {
  'use strict';
  const feed = document.querySelector('#news-feed');
  if (!feed) return;
  const buttons = [...document.querySelectorAll('.news-filter')];
  const empty = document.getElementById('news-empty');
  const labels = {
    release: {tr:'Yeni Yayınlar',en:'Releases'},
    social: {tr:'Sosyal Medya',en:'Social Media'},
    studio: {tr:'Stüdyo Haberleri',en:'Studio News'}
  };
  const statuses = {
    plan:{tr:'Yayın Takvimi',en:'Release Schedule'},
    live:{tr:'Güncel',en:'Current'},
    soon:{tr:'Yakında',en:'Coming Soon'}
  };
  let filter='all';
  let destroy=()=>{};
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const create=(tag, cls, text)=>{
    const el=document.createElement(tag);
    if(cls) el.className=cls;
    if(text!==undefined) el.textContent=text;
    return el;
  };

  function makeCard(item,lang,duplicate){
    const card=create('article','news-card');
    if(duplicate){card.setAttribute('aria-hidden','true');}
    const art=create('div','news-art');
    art.dataset.type=item.type;
    if(item.image){
      art.classList.add('has-image');
      art.style.backgroundImage=`linear-gradient(180deg,rgba(20,16,10,.08),rgba(20,16,10,.62)),url("${item.image}")`;
    }
    art.append(create('span','news-art-kind',(labels[item.type]||labels.studio)[lang]),create('span','news-art-mark','R'));
    const body=create('div','news-body');
    const date=new Date(`${item.date}T12:00:00Z`);
    const formatted=Number.isNaN(date.getTime())?item.date:new Intl.DateTimeFormat(lang==='tr'?'tr-TR':'en-US',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(date);
    const state=(statuses[item.status]||statuses.live)[lang];
    const title=(item.title?.[lang])||item.title?.tr||'';
    const desc=(item.description?.[lang])||item.description?.tr||'';
    body.append(create('div','news-meta',`${formatted} · ${state}`),create('h3','',title),create('p','',desc));
    if(item.url){
      const link=create('a','news-more',((item.link?.[lang])||'Detaylar')+' →');
      link.href=item.url;
      if(/^https?:\/\//i.test(item.url)){link.target='_blank';link.rel='noopener noreferrer';}
      if(duplicate) link.tabIndex=-1;
      body.append(link);
    }
    card.append(art,body);
    return card;
  }

  function render(){
    destroy();
    const lang=document.documentElement.lang==='en'?'en':'tr';
    const items=[...(window.REZONANSLAR_NEWS||[])].filter(x=>filter==='all'||x.type===filter);
    // Preserve source order; do not assign artificial dates to new releases.
    feed.replaceChildren();
    empty.hidden=items.length!==0;
    if(!items.length) return;

    const shell=create('div','news-carousel-shell');
    shell.setAttribute('role','region');
    shell.setAttribute('aria-label',lang==='tr'?'REZONANSLAR kayan haberler':'REZONANSLAR scrolling news');
    const viewport=create('div','news-marquee-viewport');
    const track=create('div','news-marquee-track');
    const prev=create('button','news-arrow news-arrow-prev','‹');
    const next=create('button','news-arrow news-arrow-next','›');
    [prev,next].forEach(btn=>{btn.type='button';});
    prev.setAttribute('aria-label',lang==='tr'?'Önceki haber':'Previous news');
    next.setAttribute('aria-label',lang==='tr'?'Sonraki haber':'Next news');
    const cardWidth=window.matchMedia('(max-width:620px)').matches?280:window.matchMedia('(max-width:900px)').matches?310:350;
    const gap=window.matchMedia('(max-width:620px)').matches?14:18;
    const required=Math.max(items.length,Math.ceil(Math.max(600,feed.clientWidth)/(cardWidth+gap))+2);
    const oneCycle=Array.from({length:required},(_,i)=>items[i%items.length]);
    for(let g=0;g<3;g++)oneCycle.forEach(item=>track.append(makeCard(item,lang,g!==1)));
    viewport.append(track); shell.append(prev,viewport,next); feed.append(shell);

    let cycleWidth=0, position=0, rafId=0, prior=0, hovering=false, keyboardPause=false, dragging=false;
    let resumeAt=0, motion=null, dragStartX=0, dragStartPosition=0, touchMoved=false;
    const SPEED=58; // px/sec, noticeable but gentle
    const draw=()=>{track.style.transform=`translate3d(${-position}px,0,0)`;};
    const normalize=()=>{
      if(!cycleWidth)return;
      if(position>=cycleWidth*2) position-=cycleWidth;
      if(position<cycleWidth) position+=cycleWidth;
    };
    function measure(reset=false){
      const start=track.children[0],second=track.children[required];
      const newWidth=second.offsetLeft-start.offsetLeft;
      if(newWidth>0){
        if(reset || !cycleWidth)position=newWidth;
        else position=position/cycleWidth*newWidth;
        cycleWidth=newWidth;
        normalize();draw();
      }
    }
    function stepWidth(){
      if(track.children.length>1)return track.children[1].offsetLeft-track.children[0].offsetLeft;
      return cardWidth+gap;
    }
    function navigate(sign){
      measure();
      const change=sign*stepWidth();
      motion={start:position,end:position+change,since:performance.now(),length:450};
    }
    function tick(time){
      const dt=prior?Math.min(80,time-prior):0;
      prior=time;
      if(motion){
        const t=Math.min(1,(time-motion.since)/motion.length);
        const smooth=1-Math.pow(1-t,3);
        position=motion.start+(motion.end-motion.start)*smooth;
        if(t===1)motion=null;
        normalize();draw();
      }else if(cycleWidth&&!hovering&&!keyboardPause&&!dragging&&!document.hidden&&!reduceMotion.matches&&time>=resumeAt){
        position+=SPEED*dt/1000;
        normalize();draw();
      }
      rafId=requestAnimationFrame(tick);
    }
    const onMouseEnter=e=>{if(e.pointerType==='mouse'||e.pointerType==='pen') hovering=true;};
    const onMouseLeave=()=>{hovering=false;};
    const onFocusIn=()=>{keyboardPause=!!(document.activeElement&&viewport.contains(document.activeElement));};
    const onFocusOut=()=>queueMicrotask(()=>{keyboardPause=!!(document.activeElement&&viewport.contains(document.activeElement));});
    const onDown=e=>{
      if(e.pointerType!=='touch')return;
      dragging=true;touchMoved=false;motion=null;dragStartX=e.clientX;dragStartPosition=position;
      viewport.setPointerCapture?.(e.pointerId);
    };
    const onMove=e=>{
      if(!dragging||e.pointerType!=='touch')return;
      const delta=dragStartX-e.clientX;
      if(Math.abs(delta)>5)touchMoved=true;
      position=dragStartPosition+delta;normalize();draw();
    };
    const onUp=e=>{
      if(e.pointerType!=='touch')return;
      dragging=false;resumeAt=performance.now()+1200;
    };
    const onResize=()=>{measure();prior=0;};
    const onLeft=()=>navigate(-1),onRight=()=>navigate(1);
    const onKeys=e=>{
      if(e.key==='ArrowLeft'){e.preventDefault();navigate(-1);}
      if(e.key==='ArrowRight'){e.preventDefault();navigate(1);}
    };
    prev.addEventListener('click',onLeft);next.addEventListener('click',onRight);
    shell.addEventListener('pointerenter',onMouseEnter);shell.addEventListener('pointerleave',onMouseLeave);
    viewport.addEventListener('focusin',onFocusIn);viewport.addEventListener('focusout',onFocusOut);
    viewport.addEventListener('keydown',onKeys);
    viewport.addEventListener('pointerdown',onDown);viewport.addEventListener('pointermove',onMove);
    viewport.addEventListener('pointerup',onUp);viewport.addEventListener('pointercancel',onUp);
    window.addEventListener('resize',onResize);
    requestAnimationFrame(()=>{measure(true);rafId=requestAnimationFrame(tick);});
    destroy=()=>{
      cancelAnimationFrame(rafId);window.removeEventListener('resize',onResize);
      prev.removeEventListener('click',onLeft);next.removeEventListener('click',onRight);
    };
  }

  buttons.forEach(b=>{
    b.addEventListener('click',()=>{
      filter=b.dataset.filter;
      buttons.forEach(btn=>{
        btn.classList.toggle('active',btn===b);
        btn.setAttribute('aria-pressed',String(btn===b));
      });
      render();
    });
    b.setAttribute('aria-pressed',String(b.classList.contains('active')));
  });
  document.querySelectorAll('[data-lang]').forEach(btn=>btn.addEventListener('click',render));
  render();
})();
