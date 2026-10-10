(() => {
  const feed=document.getElementById('news-feed');
  if(!feed)return;
  const filters=[...document.querySelectorAll('.news-filter')];
  const empty=document.getElementById('news-empty');
  let active='all';
  const categories={release:{tr:'Yeni Yayınlar',en:'Releases'},social:{tr:'Sosyal Medya',en:'Social Media'},studio:{tr:'Stüdyo Haberleri',en:'Studio News'}};
  const trDate=new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  const enDate=new Intl.DateTimeFormat('en-US',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  function el(tag,cls,content){const node=document.createElement(tag);if(cls)node.className=cls;if(content!==undefined)node.textContent=content;return node;}
  function buildCard(item,language){
    const card=el('article','news-card');
    const art=el('div','news-art');art.dataset.type=item.type;
    if(item.image){
      art.classList.add('has-image');
      art.style.backgroundImage = `linear-gradient(180deg, rgba(20,16,10,.06) 0%, rgba(20,16,10,.62) 100%), url('${item.image}')`;
    }
    art.append(el('span','news-art-kind',(categories[item.type]||categories.studio)[language]),el('span','news-art-mark','R'));
    const body=el('div','news-body');
    const date = new Date(item.date+'T12:00:00Z');
    const dateLabel=Number.isNaN(date.valueOf())?item.date:(language==='tr'?trDate:enDate).format(date);
    const statusMap={plan:{tr:' · Yayın Takvimi',en:' · Release Schedule'},live:{tr:' · Güncel',en:' · Current'},soon:{tr:' · Yakında',en:' · Coming Soon'}};
    const suffix=(statusMap[item.status]||statusMap.live)[language]||'';
    body.append(el('div','news-meta',dateLabel+suffix),el('h3','',item.title[language]),el('p','',item.description[language]));
    const link=el('a','news-more',item.link[language]+' →');
    if(item.url){link.href=item.url; if(/^https?:/i.test(item.url)){link.target='_blank'; link.rel='noopener noreferrer';}} else {link.href='javascript:void(0)'; link.classList.add('is-disabled'); link.setAttribute('aria-disabled','true');}
    body.append(link);
    card.append(art,body);
    return card;
  }
  function render(){
    const language=document.documentElement.lang==='en'?'en':'tr';
    feed.replaceChildren();
    const entries=(window.REZONANSLAR_NEWS||[]).filter(x=>active==='all'||x.type===active).sort((a,b)=>b.date.localeCompare(a.date));
    empty.hidden=entries.length>0;
    feed.classList.toggle('is-empty', entries.length===0);
    if(!entries.length)return;
    const viewport=el('div','news-marquee-viewport');
    viewport.setAttribute('aria-label', language==='tr'?'Kayan haberler':'Scrolling news');
    const track=el('div','news-marquee-track');
    const minimumCards=Math.max(entries.length,4);
    const repeated=[];
    while(repeated.length<minimumCards){ repeated.push(...entries); }
    repeated.slice(0, minimumCards).forEach(item=>track.append(buildCard(item,language)));
    repeated.slice(0, minimumCards).forEach(item=>track.append(buildCard(item,language)));
    const duration=Math.max(28, minimumCards*7);
    track.style.setProperty('--marquee-duration', duration+'s');
    track.setAttribute('data-layout','horizontal');
    viewport.append(track);
    feed.append(viewport);
  }
  filters.forEach(f=>f.addEventListener('click',()=>{active=f.dataset.filter;filters.forEach(b=>b.classList.toggle('active',b===f));render();}));
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',render));
  render();
})();
