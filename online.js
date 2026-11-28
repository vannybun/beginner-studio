// =====================================================================
//  online.js — 🟢 សិស្សណាកំពុងរៀន (Live)
//  • សិស្ស៖ ទូរស័ព្ទផ្ញើសញ្ញារៀងរាល់ ២០ វិនាទី (ពេលបើក App) — កំពុងនៅទំព័រណា / Unit ណា / ប្រឡង …
//  • គ្រូ/Admin៖ ផ្ទាំងថ្នាក់ «🟢 កំពុងរៀន» — អ្នកកំពុងរៀន • ទើបចាកចេញ • មិនទាន់ចូលថ្ងៃនេះ
//  live/act_<classId> = {uid: {sid, ts, s0, w}}
// =====================================================================
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const L = () => window.Cloud && Cloud.live && Cloud.live.ok() ? Cloud.live : null;
const me = () => (window.Auth&&Auth.user())||null;
const isStu = () => { const u=me(); return u&&u.role==='student'&&!(Auth.asStaff&&Auth.asStaff()); };
const ON=70000, RECENT=30*60000;

/* ---------- student: heartbeat with what they are doing ---------- */
const TABN={lesson:'📖 មេរៀន', vocab:'🔤 ពាក្យ', grammar:'📐 វេយ្យាករណ៍', practice:'✍️ លំហាត់', book:'📘 សៀវភៅ', listen:'🎧 ស្តាប់', exam:'📝 ប្រឡង'};
function what(){
  const ex=document.getElementById('exam'); if(ex&&!ex.querySelector('.ex-res')){ const t=ex.querySelector('.ex-top b'); return '📝 កំពុងប្រឡង'+(t?' — '+t.textContent.replace(/^📝\s*/,''):''); }
  if(document.getElementById('wsRun')) return '📄 កំពុងធ្វើសន្លឹកលំហាត់';
  if(document.querySelector('.rich-q,.rich-top')) return '💰 លំហាត់និយាយ ១០ ជាន់';
  const v=window.view||(typeof view!=='undefined'?view:{}); if(!v||!v.name) return '📱 បើក App';
  if(v.name==='unit'){ let s=`📖 Unit ${v.unit} • ${TABN[v.tab]||v.tab||''}`; try{ if(typeof openSec!=='undefined'&&openSec&&openSec.n===v.unit&&openSec.i>=0) s+=` • ផ្នែក ${openSec.i+1}`; }catch(e){} if(document.querySelector('.qwrap')) s+=' • កំពុងធ្វើតេស្ត'; return s; }
  return ({home:'🏠 ទំព័រដើម', units:'🗺 ផែនទីមេរៀន', exams:'📝 ទំព័រកិច្ចការ', rank:'🏆 ចំណាត់ថ្នាក់', chat:'💬 ឆាត', me:'📊 ទំព័រខ្ញុំ', certs:'🏅 ប័ណ្ណសរសើរ', inbox:'📣 ដំណឹង'})[v.name]||'📱 '+v.name; }
let S0=Date.now(), last=0, lastW='';
function beat(force){ const l=L(), u=me(); if(!l||!isStu()||document.visibilityState!=='visible') return; const w=what();
  if(!force && w===lastW && Date.now()-last<20000) return; last=Date.now(); lastW=w;
  l.merge(['act_'+u.classId], {[u.id]:{sid:u.studentId, ts:Date.now(), s0:S0, w}}); }
if(isStu()){
  setInterval(()=>beat(true), 20000); setTimeout(()=>beat(true), 3000);
  document.addEventListener('click', ()=>setTimeout(()=>beat(false), 400), true);
  document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible'){ if(Date.now()-last>5*60000) S0=Date.now(); beat(true); } });
}

/* ---------- teacher / admin: live class view ---------- */
const W={}, D={};
function watch(cid){ const l=L(); if(!l||W[cid]) return; W[cid]=l.watch(['act_'+cid], d=>{ D[cid]=d||{}; refresh(); }); }
const ago = ms => { const m=Math.round(ms/60000); return m<1?'ទើបតែឥឡូវ':m<60?m+' នាទីមុន':Math.floor(m/60)+' ម៉ោង'+(m%60?' '+m%60+' នាទី':'')+'មុន'; };
const dur = ms => { const m=Math.max(1,Math.round(ms/60000)); return m<60?m+' នាទី':Math.floor(m/60)+' ម៉ោង '+(m%60)+' នាទី'; };
function rows(c){ const d=D[c.id]||{}, users=(window.Auth&&Auth.data().users)||[], now=Date.now();
  return c.students.map(s=>{ const u=users.find(x=>x.role==='student'&&x.classId===c.id&&x.studentId===s.id), a=u&&d[u.id];
    return {s, u, a, on:!!(a&&now-a.ts<ON), rec:!!(a&&now-a.ts>=ON&&now-a.ts<RECENT)}; }); }
const count = c => rows(c).filter(r=>r.on).length;
let EL=null, C=null;
function tab(el, c){ if(!el) return; EL=el; C=c; if(!c){ el.innerHTML='<div class="panel"><p class="note">មិនទាន់មានថ្នាក់</p></div>'; return; }
  if(!L()){ el.innerHTML='<div class="panel"><p class="note">📶 ត្រូវភ្ជាប់ Cloud (អ៊ីនធឺណិត) ដើម្បីមើល Live</p></div>'; return; }
  watch(c.id); draw(); clearInterval(tab.t); tab.t=setInterval(()=>{ if(!EL||!document.body.contains(EL)){ clearInterval(tab.t); return; } draw(); }, 5000); }
function draw(){ if(!EL||!C) return; const R=rows(C), now=Date.now(), on=R.filter(r=>r.on).sort((a,b)=>a.a.s0-b.a.s0), rec=R.filter(r=>r.rec).sort((a,b)=>b.a.ts-a.a.ts), off=R.filter(r=>!r.on&&!r.rec);
  const av=s=>window.Class&&Class._avatar?Class._avatar(s,40):'';
  const isEx=r=>r.a&&/ប្រឡង|សន្លឹកលំហាត់|តេស្ត/.test(r.a.w);
  EL.innerHTML=`<div class="panel"><div class="ol-head"><h3 class="sec" style="margin:0">🟢 សិស្សកំពុងរៀន — ${esc(C.name)} <span class="ol-dot"></span></h3>${window.Exam&&Exam.liveView?`<button class="btn sm ex-livebtn on" onclick="Exam.liveView('${C.id}')">📝 អ្នកកំពុងប្រឡង</button>`:''}</div>
      <div class="exl-sum"><div class="on"><b>${on.length}</b><small>🟢 កំពុងរៀនឥឡូវ</small></div><div class="ok"><b>${rec.length}</b><small>🕒 ទើបចាកចេញ (≤៣០ នាទី)</small></div><div class="warn"><b>${off.length}</b><small>⚪ មិនបានបើក App</small></div></div>
      <p class="note">💡 ធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ • បង្ហាញតែសិស្សដែលបើក App លើទូរស័ព្ទ ហើយមានអ៊ីនធឺណិត</p></div>
    <div class="panel" style="margin-top:12px"><h3 class="sec">🟢 កំពុងរៀនឥឡូវ (${on.length})</h3><div class="ol-list">${on.map(r=>`<div class="ol-r on ${isEx(r)?'ex':''}">${av(r.s)}<div><b>${esc(r.s.name)}</b><span>${esc(r.a.w)}</span><small>⏱ រៀនបាន ${dur(now-r.a.s0)}</small></div></div>`).join('')||'<p class="note">មិនមាននរណាកំពុងរៀនទេ</p>'}</div></div>
    ${rec.length?`<div class="panel" style="margin-top:12px"><h3 class="sec">🕒 ទើបចាកចេញ</h3><div class="ol-list">${rec.map(r=>`<div class="ol-r rec">${av(r.s)}<div><b>${esc(r.s.name)}</b><span>${esc(r.a.w)}</span><small>ចេញ ${ago(now-r.a.ts)} • រៀន ${dur(r.a.ts-r.a.s0)}</small></div></div>`).join('')}</div></div>`:''}
    <div class="panel" style="margin-top:12px"><h3 class="sec">⚪ មិនបានបើក App (${off.length})</h3><div class="ol-list sm">${off.map(r=>`<div class="ol-r off">${av(r.s)}<div><b>${esc(r.s.name)}</b><small>${!r.u?'🚫 គ្មានគណនី':r.a?'ចុងក្រោយ '+ago(now-r.a.ts):'មិនទាន់មានទិន្នន័យ'}</small></div></div>`).join('')}</div></div>`; }
function refresh(){ if(EL&&document.body.contains(EL)) draw(); document.querySelectorAll('[data-olc]').forEach(e=>{ const c=(window.Class&&Class.data().classes||[]).find(x=>x.id===e.dataset.olc); if(c) e.textContent=count(c)||''; }); }

window.Online = { tab, count, watch, beat };
})();
