// Update only the mailto button when language switches; no form submission or data collection.
(function(){const button=document.querySelector('[data-mail-template="1"]');if(!button)return;
const tr='Merhaba REZONANSLAR Creative Studio,\n\nKonu: \n\nMesajım: \n\nAdım Soyadım: ';
const en='Hello REZONANSLAR Creative Studio,\n\nSubject: \n\nMy message: \n\nName: ';
const sync=()=>{const isEn=document.querySelector('.lang button[data-lang="en"].active')!==null;const sub=isEn?'REZONANSLAR Creative Studio – Enquiry':'REZONANSLAR Creative Studio – İletişim';button.href='mailto:selcuk.yabar@gmail.com?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(isEn?en:tr);};
document.querySelectorAll('.lang button').forEach(b=>b.addEventListener('click',()=>queueMicrotask(sync)));sync();})();
