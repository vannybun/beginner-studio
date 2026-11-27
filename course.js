// =====================================================================
//  course.js — 📚 សៀវភៅច្រើន (Headway Beginner + Sounds Great 1–5)
//  • ថ្នាក់នីមួយៗមានសៀវភៅរបស់ខ្លួន (c.book) — សិស្សឃើញតែសៀវភៅថ្នាក់ខ្លួន
//  • គ្រូ/Admin៖ សៀវភៅ = សៀវភៅនៃថ្នាក់ដែលកំពុងជ្រើស (ប្តូរថ្នាក់ → ប្តូរសៀវភៅ ដោយស្វ័យប្រវត្តិ)
//  • Sounds Great៖ រូបទំព័រ សំឡេង CD និងរូបកាតពាក្យ យកពី Folder «1. Sound great» ក្នុងកុំព្យូទ័រ
// =====================================================================
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say = m => { try{ toast(m); }catch(e){} };
const curView = () => { try{ return view; }catch(e){ return null; } };
const HW='hw5-beg', CK='beginner-studio-class-v1', PV='bs-course-preview';
const SGC=window.SG_COURSES||{};
Object.values(SGC).forEach(c=>{ if(!COURSES.some(x=>x.id===c.meta.id)) COURSES.push({id:c.meta.id, name:c.meta.name, level:c.meta.level, icon:c.meta.icon}); });
{ const hw=COURSES.find(x=>x.id===HW); if(hw) hw.short='Beginner'; }

function readC(){ try{ return JSON.parse(localStorage.getItem(CK)||'{}'); }catch(e){ return {}; } }
function me(){ try{ return window.Auth&&Auth.user&&Auth.user(); }catch(e){ return null; } }
function staffVisible(L){ try{ return me()&&Auth.canSeeClass ? L.filter(x=>Auth.canSeeClass(x)) : L; }catch(e){ return L; } }
/* 📚 ថ្នាក់មួយរៀនសៀវភៅច្រើន
   c.book  = សៀវភៅគោល (សិស្សរៀនបានជានិច្ច)
   c.books = សៀវភៅទាំងអស់របស់ថ្នាក់ — មានតែ Admin ទេដែលកំណត់បាន
   c.bookOpen = សៀវភៅបន្ថែមដែលគ្រូបានបើកឱ្យសិស្សរៀន/មើល */
const valid = id => id===HW || !!SGC[id];
function booksOf(c){ if(!c) return [HW]; const p=c.book||HW; return [p, ...(c.books||[]).filter(b=>b!==p && valid(b))].filter((b,i,a)=>a.indexOf(b)===i); }
/* 🔐 សិស្សរៀនបាន លុះត្រាតែគ្រូបើក (c.bookOpen)។ ថ្នាក់ចាស់ (មិនទាន់មាន c.lock) — សៀវភៅគោលនៅបើកដូចមុន ដើម្បីកុំឱ្យប៉ះពាល់សិស្សកំពុងរៀន។
   c.lock=true ពេលគ្រូបិទ/បើកសៀវភៅគោលម្តង ឬថ្នាក់ថ្មី → គ្រប់សៀវភៅត្រូវគ្រូបើក */
function isOpen(c, b){ const B=booksOf(c); return B.includes(b) && ((c.bookOpen||[]).includes(b) || (b===B[0] && !c.lock)); }
function openOf(c){ if(!c) return [HW]; return booksOf(c).filter(b=>isOpen(c,b)); }
/* 👩‍🏫 គ្រូមើលឃើញតែសៀវភៅដែល Admin បើកឱ្យថ្នាក់របស់ខ្លួន (c.books) • 🛡️ Admin មើលឃើញទាំងអស់ */
function allowed(){ const u=me(); if(!u || u.role==='admin') return COURSES.map(x=>x.id);
  if(u.role==='student') return openOf(stuClass());
  return staffVisible(readC().classes||[]).flatMap(booksOf).filter((b,i,a)=>a.indexOf(b)===i); }
const SK = u => 'bs-stu-book:'+u.id;          // សៀវភៅដែលសិស្សជ្រើសចុងក្រោយ
const CB = 'bs-class-book';                    // {classId: bookId} — សៀវភៅដែលគ្រូកំពុងបង្រៀនតាមថ្នាក់
function readCB(){ try{ return JSON.parse(localStorage.getItem(CB)||'{}'); }catch(e){ return {}; } }
function stuClass(){ const u=me(); return u&&u.role==='student' ? (readC().classes||[]).find(x=>x.id===u.classId) : null; }
function wantedId(){
  const u=me(), C=readC(), L=C.classes||[];
  if(u&&u.role==='student'){ const c=L.find(x=>x.id===u.classId), O=openOf(c); let pick=null; try{ pick=localStorage.getItem(SK(u)); }catch(e){} return O.includes(pick) ? pick : (O[0] || booksOf(c)[0]); }
  const pv=sessionStorage.getItem(PV); if(pv && valid(pv) && allowed().includes(pv)) return pv;
  const V=staffVisible(L), c=V.find(x=>x.id===C.cur)||V[0];
  if(!c) return HW; const B=booksOf(c), want=readCB()[c.id];
  return B.includes(want) ? want : B[0];
}
let ID=wantedId(); if(!SGC[ID]) ID=HW; const pack=SGC[ID];
const CO = window.COURSE = pack ? Object.assign({}, pack.meta) : {id:HW, name:'Headway 5th ed. Beginner', short:'Beginner', icon:'📘', sg:0};
CO.short = CO.short || CO.name;
{ const sc=stuClass(); CO.extra = !!sc && ID!==booksOf(sc)[0]; }   // សិស្សកំពុងរៀនសៀវភៅបន្ថែម → វឌ្ឍនភាពទុកដាច់ដោយឡែក
{ const u=me(); CO.locked = !!u && u.role==='student' && !openOf(stuClass()).length; }   // 🔒 គ្រូមិនទាន់បើកសៀវភៅណាឱ្យទេ
if(pack){
  window.UNITS=pack.UNITS; window.LESSONS=pack.LESSONS; window.CTX=pack.CTX; window.UNIT_STYLE=pack.UNIT_STYLE; window.TRACKS=pack.TRACKS;
  window.WORDLIST={}; pack.UNITS.forEach(u=>{ WORDLIST[u.n]=u.vocabApp; });
  document.documentElement.classList.add('course-sg');
  window.KIND && (KIND.grammar={i:'🔊', en:'Phonics', km:'សំឡេង Phonics', c:KIND.grammar&&KIND.grammar.c});
}
window.NU = () => (window.UNITS||[]).length || 14;            // number of units in the active course

/* ---------- Sounds Great media from the local «1. Sound great» folder ---------- */
const P = {};  window.SG_LOAD = (k, arr) => { P[k]=arr; };
const loaded = {};
function script(src){ if(loaded[src]) return loaded[src];
  return loaded[src]=new Promise(res=>{ const s=document.createElement('script'); s.src=src.split('/').map(encodeURIComponent).join('/').replace(/%2E%2E/g,'..'); s.onload=()=>res(true); s.onerror=()=>{ res(false); }; document.body.appendChild(s); }); }
const staff = () => { const u=me(); return !u || u.role!=='student'; };
CO.loadPages = function(){
  if(!pack || window.IS_WEB) return Promise.resolve(false);
  const ks=['stu'].concat(staff()?['ans']:[]);
  return Promise.all(ks.map(k=>script(CO.pages+k+'.js'))).then(r=>{ if(!r[0]) say('📂 រកមិនឃើញរូបទំព័រ Sounds Great — សូមទុក Folder «1. Sound great» នៅជាប់ Folder «Beginner App»'); return r[0]; });
};
CO.showAns = false;
CO.img = function(p){
  const b='b'+CO.sg, stu=P[b+'_stu'], ans=P[b+'_ans'];
  if(CO.showAns && ans && ans[p]) return ans[p];
  const j=CO.align[p]; if(stu && j!=null && stu[j]) return stu[j];
  return (ans&&ans[p]) || (stu&&stu[Math.min(p,stu.length-1)]) || '';
};
/* flash-card pictures (desktop) */
let PIC=null;
function buildPic(){ const arr=window.SG_CARDS&&SG_CARDS[CO.sg]; if(!arr) return; PIC={}; let i=0; (window.UNITS||[]).forEach(u=>u.vocab.forEach(v=>{ if(arr[i]) PIC[v[0].toLowerCase()]=arr[i]; i++; })); }
window.picFor = w => { if(!PIC) return ''; const s=PIC[String(w||'').toLowerCase()]; return s?`<img class="sgpic" src="${s}" alt="">`:''; };
if(pack && !window.IS_WEB) script(CO.cards).then(ok=>{ if(ok){ buildPic(); const v=curView(); if(typeof render==='function' && v && v.name!=='home') render(); } });

/* ---------- switching ---------- */
const nameOf = id => (COURSES.find(x=>x.id===id)||{}).name || id;
function check(){                     // called after class data is saved
  if(!staff()) return stuCheck();
  const want=wantedId(); if(want===CO.id) return;
  if(sessionStorage.getItem(PV)) return;
  say(`📚 ប្តូរទៅសៀវភៅ ${nameOf(want)} …`);
  const v=curView(); sessionStorage.setItem('bs-after-switch', JSON.stringify(v&&v.name==='class'?{name:'class',tab:v.tab}:{name:'home'}));
  setTimeout(()=>location.reload(), 500);
}
/* សិស្ស៖ បើគ្រូបិទសៀវភៅដែលកំពុងរៀន ឬ Admin ដកចេញ → ត្រឡប់ទៅសៀវភៅដែលបានអនុញ្ញាត */
function stuCheck(){
  const u=me(); if(!u||u.role!=='student') return;
  pill(); const want=wantedId(), lockNow=!openOf(stuClass()).length; if(want===CO.id && lockNow===!!CO.locked) return;
  sessionStorage.setItem('bs-after-switch', JSON.stringify({name:'home'}));
  say(lockNow?'🔒 គ្រូបានបិទសៀវភៅ …':CO.locked?`🔓 គ្រូបានបើក ${nameOf(want)} ហើយ!`:`🔒 សៀវភៅ ${nameOf(CO.id)} ត្រូវបានបិទ — ត្រឡប់ទៅ ${nameOf(want)} …`);
  setTimeout(()=>location.reload(), 900);
}
function stuMenu(){
  const c=stuClass(), O=openOf(c);
  modalOpen(`<h3>📚 សៀវភៅរបស់ខ្ញុំ</h3><p class="note">គ្រូបានបើកសៀវភៅទាំងនេះឱ្យអ្នករៀន។</p><div class="crs-list">${O.map(id=>{ const b=COURSES.find(x=>x.id===id)||{icon:'📘',name:id};
    return `<div class="crs-row ${id===CO.id?'on':''}"><div class="crs-ic">${b.icon}</div><div class="crs-t"><b>${esc(b.name)}</b><small>${id===O[0]?'📌 សៀវភៅគោលរបស់ថ្នាក់':'🔓 គ្រូបានបើក'}</small></div>
      <div class="crs-b">${id===CO.id?'<button class="btn sm teal" disabled>✓ កំពុងរៀន</button>':`<button class="btn sm ghost" onclick="Course.stuUse('${id}')">▶ រៀន</button>`}</div></div>`; }).join('')}</div>`);
}
function stuUse(id){ const u=me(); if(!u||!openOf(stuClass()).includes(id)) return say('🔒 គ្រូមិនទាន់បើកសៀវភៅនេះទេ'); try{ localStorage.setItem(SK(u), id); }catch(e){} sessionStorage.setItem('bs-after-switch', JSON.stringify({name:'home'})); (window.Cloud&&Cloud.flush?Cloud.flush():Promise.resolve()).catch(()=>{}).then(()=>location.reload()); }
/* 🎓 សិស្ស៖ គ្រូមិនទាន់បើកសៀវភៅណាមួយ */
function lockedPage(el){ const c=stuClass();
  el.innerHTML=`<div class="stu-empty" style="margin-top:30px"><div style="font-size:64px">🔒</div><b>គ្រូមិនទាន់បើកសៀវភៅឱ្យរៀនទេ</b><p>${c?'ថ្នាក់ «'+esc(c.name)+'» — ':''}សូមរង់ចាំគ្រូ 🔓 បើកសៀវភៅ។ ពេលគ្រូបើក កម្មវិធីនឹងបើកមេរៀនដោយស្វ័យប្រវត្តិ 🙂</p>
    <p class="note">ពេលរង់ចាំ អ្នកនៅតែអាចមើល 📝 កិច្ចការ 🏆 ចំណាត់ថ្នាក់ និង 💬 មិត្ត បាន</p></div>`;
  const poll=()=>{ if(!document.body.contains(el.firstElementChild)) return; (window.Cloud&&Cloud.refresh?Cloud.refresh(CK):Promise.resolve(false)).catch(()=>{}).then(()=>{ stuCheck(); setTimeout(poll, 20000); }); };
  clearTimeout(lockedPage.t); lockedPage.t=setTimeout(poll, 3000); }
function preview(id){ if(id && !allowed().includes(id)) return say('🔒 Admin មិនទាន់បើកសៀវភៅនេះឱ្យអ្នកទេ'); if(id===wantedNoPv()) sessionStorage.removeItem(PV); else sessionStorage.setItem(PV,id); sessionStorage.setItem('bs-after-switch', JSON.stringify({name:'home'})); location.reload(); }
function wantedNoPv(){ const s=sessionStorage.getItem(PV); sessionStorage.removeItem(PV); const w=wantedId(); if(s) sessionStorage.setItem(PV,s); return w; }
function menu(){
  const C=readC(), V=staffVisible(C.classes||[]), A=allowed(), adm=(me()||{role:'admin'}).role==='admin';
  const tag = (c,id) => isOpen(c,id) ? ' 🔓' : ' 🔒';
  const rows=COURSES.filter(b=>A.includes(b.id)).map(b=>{ const cl=V.filter(c=>booksOf(c).includes(b.id));
    return `<div class="crs-row ${b.id===CO.id?'on':''}"><div class="crs-ic">${b.icon}</div><div class="crs-t"><b>${esc(b.name)}</b><small>${cl.length?cl.map(c=>'👥 '+esc(c.name)+tag(c,b.id)).join(' • '):'មិនទាន់មានថ្នាក់'}</small></div>
      <div class="crs-b">${cl.map(c=>`<button class="btn sm ${c.id===C.cur&&b.id===CO.id?'teal':'ghost'}" onclick="Course.useClass('${c.id}','${b.id}')">${esc(c.name)}</button>`).join('')}
      <button class="btn sm ghost" onclick="Course.preview('${b.id}')" title="មើលមេរៀន (មិនប្តូរថ្នាក់)">👀 មើល</button></div></div>`; }).join('');
  const pv=sessionStorage.getItem(PV);
  modalOpen(`<h3>📚 សៀវភៅ • ថ្នាក់</h3><p class="note">${adm?'🛡️ Admin មើលឃើញសៀវភៅទាំងអស់។ ដើម្បីឱ្យគ្រូមើល/បង្រៀនបាន៖ 👥 ថ្នាក់រៀន → 📚 → ☑ សៀវភៅឱ្យថ្នាក់របស់គ្រូនោះ។':'👩‍🏫 អ្នកឃើញតែសៀវភៅដែល Admin បើកឱ្យថ្នាក់របស់អ្នក។'} សិស្សរៀនបាន លុះត្រាតែគ្រូ 🔓 បើក (👥 ថ្នាក់រៀន → 📚)។ 🔓/🔒 ក្រោយឈ្មោះថ្នាក់ = សិស្សរៀនបាន/មិនទាន់បាន។</p>
    ${pv?`<div class="pv-note">👀 កំពុងមើល ${esc(nameOf(pv))} <button class="btn sm sun" onclick="Course.preview('')">↺ ត្រឡប់ទៅថ្នាក់</button></div>`:''}<div class="crs-list">${rows||'<p class="note">🔒 Admin មិនទាន់បើកសៀវភៅណាមួយឱ្យអ្នកទេ — សូមទាក់ទង Admin</p>'}</div>`);
}
function setClassBook(cid, bid){ const M=readCB(); if(bid) M[cid]=bid; else delete M[cid]; try{ localStorage.setItem(CB, JSON.stringify(M)); }catch(e){} }
function useClass(id, bid){ const C=readC(); C.cur=id; localStorage.setItem(CK, JSON.stringify(C)); setClassBook(id, bid||null); sessionStorage.removeItem(PV); sessionStorage.setItem('bs-after-switch', JSON.stringify({name:'home'})); location.reload(); }
function modalOpen(h){ if(typeof openModal==='function') return openModal(h); const o=document.getElementById('ov'), m=document.getElementById('modal'); m.innerHTML=`<button class="x" onclick="closeModal()">✕</button>`+h; o.classList.add('show'); }
function pill(){
  if(!document.querySelector('header .modes')) return;
  let b=document.getElementById('crsPill');
  if(!staff()){ const n=openOf(stuClass()).length; if(n<2){ if(b) b.remove(); return; }   // សិស្ស៖ បង្ហាញតែពេលគ្រូបើកសៀវភៅច្រើន
    if(!b){ b=document.createElement('button'); b.id='crsPill'; b.className='crs-pill'; document.querySelector('header .modes').before(b); }
    b.onclick=stuMenu; b.innerHTML=`<span>${CO.icon}</span><b>${esc(CO.short)}</b><i>📚${n}</i><em>▾</em>`; b.title=CO.name; return; }
  if(!b){ b=document.createElement('button'); b.id='crsPill'; b.className='crs-pill'; b.onclick=menu; document.querySelector('header .modes').before(b); }
  const pv=sessionStorage.getItem(PV);
  b.innerHTML=`<span>${CO.icon}</span><b>${esc(CO.short)}</b>${pv?'<i>👀</i>':''}<em>▾</em>`; b.title=CO.name;
}
function brand(){ if(!CO.sg) return; const sm=document.querySelector('.kh-brand small'); if(sm) sm.textContent=CO.short+' • '+CO.kh+' • រៀន • បង្រៀន'; document.title='កម្មវិធីគ្រប់គ្រងថ្នាក់រៀន — '+CO.short; }
window.addEventListener('load',()=>{ brand(); pill(); const a=sessionStorage.getItem('bs-after-switch'); if(!a) return; sessionStorage.removeItem('bs-after-switch');
  try{ const v=JSON.parse(a); if(typeof go==='function' && v.name==='class') setTimeout(()=>go('class',null,v.tab||'students'),50); }catch(e){} });
window.Course = { id:ID, sg:!!pack, extra:CO.extra, check, stuCheck, menu, stuMenu, stuUse, preview:id=>preview(id||wantedNoPv()), useClass, setClassBook, pill, nameOf, booksOf, openOf, isOpen, allowed, lockedPage, locked:!!CO.locked };
document.addEventListener('DOMContentLoaded', pill); setTimeout(pill, 0);
})();
