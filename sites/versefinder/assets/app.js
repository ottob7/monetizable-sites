const $=s=>document.querySelector(s);
const refs=['John 3:16','Psalm 23','Romans 8:28','Philippians 4:13','Jeremiah 29:11','Proverbs 3:5-6','Matthew 6:34','Isaiah 41:10'];
async function getVerse(ref){
  const r=await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=kjv`);
  if(!r.ok) throw new Error('Verse lookup failed. Try a reference like John 3:16.');
  return await r.json();
}
function render(v){
  const text=(v.text||'').trim().replace(/\n+/g,' ');
  $('#verseResult').innerHTML=`<article class="card"><span class="ref">${v.reference||'Verse'}</span><div class="verse">“${text}”</div><p class="muted">Translation: ${(v.translation_name||'King James Version')}</p><div class="quick"><button onclick="copyVerse()">Copy verse</button><a href="#study">Study guide</a></div></article>`;
  window.currentVerse=`${v.reference}: ${text}`;
}
async function search(ref){
  $('#verseResult').innerHTML='<div class="card loading">Looking up scripture…</div>';
  try{render(await getVerse(ref)); history.replaceState(null,'',`#${encodeURIComponent(ref)}`)}catch(e){$('#verseResult').innerHTML=`<div class="card"><h2>Could not find that passage</h2><p class="muted">${e.message}</p></div>`}
}
function copyVerse(){navigator.clipboard?.writeText(window.currentVerse||'').then(()=>alert('Verse copied.'))}
function daily(){const d=new Date(); const idx=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000)%refs.length; return refs[idx];}
window.addEventListener('DOMContentLoaded',()=>{
  $('#verseForm')?.addEventListener('submit',e=>{e.preventDefault(); const q=$('#reference').value.trim(); if(q) search(q)});
  document.querySelectorAll('[data-ref]').forEach(b=>b.addEventListener('click',()=>search(b.dataset.ref)));
  search(window.DEFAULT_REF || (location.hash?decodeURIComponent(location.hash.slice(1)):daily()));
});