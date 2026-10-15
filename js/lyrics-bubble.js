/* REZONANSLAR Lyrics Bubble v1 — preview UI for ten artist story pages.
   The popover follows the pointer until the story textarea receives focus, then
   docks to the viewport edge so the visitor can keep reading while typing. */
(function(){
 "use strict";
 const story=document.querySelector(".hs-reply-panel");
 const draft=document.getElementById("hs-draft");
 const songName=document.getElementById("hs-selected-song");
 const activeCard=()=>document.querySelector(".hs-song-card.is-selected");
 const artist=document.querySelector(".hs-photo-label")?.textContent?.trim()||"";
 if(!story||!draft||!songName||!artist||document.querySelector(".rzlb-launcher"))return;
 const tr=()=>document.documentElement.lang!=="en";
 const messages={
  prompt:["Şarkı sözlerini yanı başında tut","Keep the lyrics close as you write"],
  help:["Konuşma balonunu aç; yazmaya başladığında kenara sabitlensin.","Open the speech bubble; it docks while you write."],
  open:["Şarkı Sözlerini Aç ♫","Open Lyrics ♫"],
  close:["Sözleri Kapat","Close Lyrics"],
  label:["ŞARKININ ORİJİNAL SÖZLERİ","ORIGINAL SONG LYRICS"],
  pin:["Sabitle","Pin"],
  follow:["İmleci takip et","Follow pointer"],
  noLyrics:["Bu şarkının eksiksiz ve doğrulanmış orijinal sözleri henüz sisteme eklenmedi. Yanlış veya eksik bir metni sözlerin tamamı gibi göstermemek için bu alan şimdilik boş tutuluyor.","The complete, verified original lyrics for this song have not yet been added. This area remains empty rather than presenting incorrect or incomplete lyrics as the full text."],
  copyright:["Sözler: Selçuk Yabar · REZONANSLAR Creative Studio","Lyrics: Selçuk Yabar · REZONANSLAR Creative Studio"],
  copyNotice:["Onaylı sözler yalnızca okumak içindir; kopyalama sınırlandırılmıştır. Tam koruma teknik olarak mümkün değildir.","Approved lyrics are for reading; copying is discouraged. Technical protection cannot be guaranteed."],
  previewNotice:["Şarkı sözleri arşivi hazırlanıyor • Önizleme","Original lyrics archive being prepared • Preview"],
  master:["ORİJİNAL SÖZ MASTERI","ORIGINAL LYRICS MASTER"],
  masterBadge:["ONAYLI ORİJİNAL METİN","VERIFIED ORIGINAL TEXT"],
  cardBadge:["KATALOG KİMLİĞİ","CATALOG RECORD"],
  archiveBadge:["ORİJİNAL SÖZ BELGESİ","ORIGINAL LYRICS DOCUMENT"],
  pendingCodes:["Bu şarkının ISRC kodu henüz doğrulanmadı.","The ISRC for this song has not yet been verified."],
  codesNote:["ISRC, ses kaydı kimliğidir; şarkı sözlerinin telif tescil numarası değildir.","ISRC identifies a sound recording; it is not a lyrics copyright registration number."],
  version:["Kaynak sürümü","Source version"]
 };
 const L=(key)=>messages[key][tr()?0:1];
 function node(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n;}
 const bar=node("div","rzlb-launcher");
 const copy=node("div","rzlb-launcher-copy");
 const heading=node("span","rzlb-launcher-title");
 const sub=node("span","rzlb-launcher-hint");
 const toggle=node("button","rzlb-open-button");
 toggle.type="button";toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-controls","rzlb-bubble");
 copy.append(heading,sub);bar.append(copy,toggle);
 const label=story.querySelector('label[for="hs-draft"]');
 if(!label)return;
 story.insertBefore(bar,label);
 const bubble=node("aside","rzlb-bubble");
 bubble.id="rzlb-bubble";bubble.setAttribute("role","region");bubble.setAttribute("aria-label","Şarkı sözleri");bubble.setAttribute("aria-live","off");
 const head=node("div","rzlb-head");
 const overline=node("span","rzlb-overline");
 const headRow=node("div","rzlb-head-row");
 const title=node("strong","rzlb-song-title");
 const actions=node("div","rzlb-head-buttons");
 const pin=node("button","rzlb-tool");
 pin.type="button";pin.dataset.action="pin";
 const close=node("button","rzlb-tool rzlb-close","×");close.type="button";close.setAttribute("aria-label","Kapat");
 actions.append(pin,close);headRow.append(title,actions);head.append(overline,headRow);
 const masterLine=node("span","rzlb-master-line");
 const identity=node("div","rzlb-identity");
 const catalogId=node("span","rzlb-catalog-badge");
 const ids=node("div","rzlb-code-row");
 const isrcTag=node("span","rzlb-code-item");
 ids.append(isrcTag);
 identity.append(catalogId,ids);head.append(masterLine,identity);
 const main=node("div","rzlb-main");
 const text=node("div","rzlb-lyrics");
 text.setAttribute("aria-label","Söz içeriği");
 main.append(text);
 const footer=node("div","rzlb-footer");
 const credit=node("span","rzlb-credit");
 const disclaimer=node("span","rzlb-disclaimer");
 const idExplanation=node("span","rzlb-id-explain");
 footer.append(credit,idExplanation,disclaimer);bubble.append(head,main,footer);
 document.body.append(bubble);
 let opened=false,pinned=false,wasPinnedBeforeFocus=false,typing=false,hasPointer=false,px=0,py=0;
 const mobile=()=>window.matchMedia("(max-width:700px), (hover:none)").matches;
 const isData=(entry)=>entry&&typeof entry==="object"&&entry.status==="approved-full"&&typeof entry.text==="string"&&entry.text.trim().length>0;
 const artistRecords=()=>window.REZONANSLAR_APPROVED_LYRICS?.[artist]||{};
 const availableEntry=(entry)=>isData(entry)&&typeof entry.catalog==="string"&&typeof entry.documentId==="string";
 const hasISRC=(entry)=>availableEntry(entry)&&/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(entry.isrc||"");
 function addCardIdentity(){
  document.querySelectorAll(".hs-song-card").forEach(function(card){
   const entry=artistRecords()[card.dataset.song];
   const titleNode=card.querySelector(".hs-track-title");
   if(!titleNode||!availableEntry(entry))return;
   let wrap=card.querySelector(".rzlb-card-ident");
   if(!wrap){
    wrap=node("span","rzlb-card-ident");
    const badge=node("span","rzlb-card-auth");
    const codes=node("span","rzlb-card-code-line");
    badge.dataset.rzlbRole="badge";
    codes.textContent=hasISRC(entry)?"ISRC "+entry.isrc:"";
    codes.hidden=!hasISRC(entry);
    wrap.append(badge,codes);
    titleNode.insertAdjacentElement("afterend",wrap);
    titleNode.classList.add("rzlb-title-verified");
   }
   const badge=wrap.querySelector('[data-rzlb-role="badge"]');
   if(badge)badge.textContent=(hasISRC(entry)?L("cardBadge"):L("archiveBadge"))+" · "+entry.catalog;
  });
 }

 function selected(){
  const id=activeCard()?.dataset.song||"";
  const entry=artistRecords()[id];
  return {title:songName.textContent.trim(),entry};
 }
 /* Show only sung words: original master text and metadata stay untouched.
    Any standalone [VERSE], [CHORUS], [INTRO], [OUTRO], [BRIDGE],
    [BREAK], instrumental or production prompt becomes a stanza boundary.
    Adjacent prompts never create extra empty stanzas. */
 function formatReadableLyrics(source){
  const lines=String(source).replace(/\r\n?/g,"\n").split("\n");
  const out=[];
  const separate=()=>{if(out.length&&out[out.length-1]!=="")out.push("");};
  for(const raw of lines){
   const clean=raw.trim();
   if(!clean){separate();continue;}
   if(/^\[[^\]\r\n]*\]$/.test(clean)){separate();continue;}
   out.push(raw);
  }
  return out.join("\n").replace(/\n{3,}/g,"\n\n").trim();
 }
 function paintLyrics(target,source){
  target.textContent=formatReadableLyrics(source);
 }
 function redraw(){
  const s=selected();
  heading.textContent=L("prompt");sub.textContent=L("help");
  toggle.textContent=opened?L("close"):L("open");
  bubble.setAttribute("aria-label",tr()?"Şarkı sözleri":"Song lyrics");
  close.setAttribute("aria-label",tr()?"Kapat":"Close");
  const verified=isData(s.entry);
  overline.textContent=verified?L("label"):L("previewNotice");
  title.textContent=s.title;
  if(verified)paintLyrics(text,s.entry.text);else text.textContent=L("noLyrics");
  text.classList.toggle("rzlb-unavailable",!verified);
  text.setAttribute("dir",verified&&/^ar(?:\/|$)/.test(s.entry.language||"")?"rtl":"ltr");
  masterLine.textContent=verified?L("masterBadge"):"";
  masterLine.hidden=!verified;
  identity.hidden=!availableEntry(s.entry);
  if(availableEntry(s.entry)){
   catalogId.textContent=L("master")+" · "+s.entry.catalog+" · "+s.entry.documentId;
   ids.hidden=!hasISRC(s.entry);
   isrcTag.textContent=hasISRC(s.entry)?"ISRC  "+s.entry.isrc:"";
  }
  credit.textContent=L("copyright")+(verified&&s.entry.version?" · "+L("version")+": "+s.entry.version:"");
  idExplanation.textContent=hasISRC(s.entry)?L("codesNote"):(availableEntry(s.entry)?L("pendingCodes"):"");
  disclaimer.textContent=L("copyNotice");
  addCardIdentity();
  pin.textContent=pinned?L("follow"):L("pin");
  main.scrollTop=0;
 }
 function position(x,y){
  if(!opened||pinned||typing||mobile())return;
  const bw=bubble.offsetWidth||370,bh=bubble.offsetHeight||400,pad=12;
  const X=Math.min(Math.max(pad,x+21),Math.max(pad,window.innerWidth-bw-pad));
  const below=y+22+bh<=window.innerHeight-pad;
  const Y=Math.min(Math.max(pad,below?y+22:y-bh-22),Math.max(pad,window.innerHeight-bh-pad));
  bubble.style.left=X+"px";bubble.style.top=Y+"px";
 }
 function mode(value){
  pinned=Boolean(value);bubble.classList.toggle("rzlb-pinned",pinned||typing);
  if(!pinned&&!typing&&hasPointer)position(px,py);
  redraw();
 }
 function show(value){
  opened=Boolean(value);bubble.classList.toggle("rzlb-visible",opened);
  toggle.setAttribute("aria-expanded",String(opened));
  if(opened){
   redraw();
   if(!hasPointer){const r=toggle.getBoundingClientRect();px=r.right;py=r.bottom;hasPointer=true;}
   if(!pinned&&!typing)position(px,py);
   else bubble.classList.add("rzlb-pinned");
  }else{
   bubble.classList.remove("rzlb-pinned");redraw();
  }
 }
 toggle.addEventListener("click",function(){show(!opened);});
 close.addEventListener("click",function(){show(false);toggle.focus();});
 pin.addEventListener("click",function(){mode(!pinned);});
 document.addEventListener("pointermove",function(e){
  if(e.pointerType==="touch")return;
  px=e.clientX;py=e.clientY;hasPointer=true;
  // Don't jump while hovering over the bubble itself.
  if(e.target instanceof Node&&bubble.contains(e.target))return;
  position(px,py);
 },{passive:true});
 draft.addEventListener("focus",function(){
  typing=true;wasPinnedBeforeFocus=pinned;
  if(opened){bubble.classList.add("rzlb-pinned");redraw();}
 });
 draft.addEventListener("blur",function(){
  typing=false;pinned=wasPinnedBeforeFocus;
  bubble.classList.toggle("rzlb-pinned",pinned);
  if(opened&&!pinned&&hasPointer)position(px,py);
  redraw();
 });
 document.querySelectorAll(".hs-song-card").forEach(function(card){
  card.addEventListener("click",function(){queueMicrotask(redraw);});
 });
 document.querySelectorAll("[data-lang]").forEach(function(b){b.addEventListener("click",function(){queueMicrotask(redraw);});});
 window.addEventListener("resize",function(){if(opened&&!pinned&&!typing)position(px,py);});
 document.addEventListener("keydown",function(e){if(e.key==="Escape"&&opened&&document.activeElement?.closest(".hs-dialog")==null){show(false);}});
 // Deliberately limited to the lyric text only. Never intercept story drafts or general page copying.
 ["copy","cut","contextmenu","dragstart","selectstart"].forEach(function(type){
  text.addEventListener(type,function(e){if(!text.classList.contains("rzlb-unavailable"))e.preventDefault();});
 });
 redraw();
})();
