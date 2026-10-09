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
  function render(){
    const language=document.documentElement.lang==='en'?'en':'tr';
    feed.replaceChildren();
    const entries=(window.REZONANSLAR_NEWS||[]).filter(x=>active==='all'||x.type===active).sort((a,b)=>b.date.localeCompare(a.date));
    empty.hidden=entries.length>0;
    entries.forEach(item=>{
      const card=el('article','news-card');
      const art=el('div','news-art');art.dataset.type=item.type;
      art.append(el('span','news-art-kind',(categories[item.type]||categories.studio)[language]),el('span','news-art-mark','R'));
      const body=el('div','news-body');
      const date = new Date(item.date+'T12:00:00Z');
      const dateLabel=Number.isNaN(date.valueOf())?item.date:(language==='tr'?trDate:enDate).format(date);
      const planned=item.status==='plan'?(language==='tr'?' · Yayın takvimi':' · Release schedule'):'';
      body.append(el('div','news-meta',dateLabel+planned),el('h3','',item.title[language]),el('p','',item.description[language]));
      if(item.url){const link=el('a','news-more',item.link[language]+' →');link.href=item.url;body.append(link);}
      card.append(art,body);feed.append(card);
    });
  }
  filters.forEach(f=>f.addEventListener('click',()=>{active=f.dataset.filter;filters.forEach(b=>b.classList.toggle('active',b===f));render();}));
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',render));
  render();
})();
