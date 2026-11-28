// =====================================================================
//  money.js — 💰 តាមដានលុយ និងប្រភពលុយ
//  • 👩‍🏫 គ្រូ៖ មើលលុយសិស្សក្នុងថ្នាក់ (សរុប • ខែនេះ • ប្រភព • ប្រវត្តិ)
//  • 🛡️ Admin៖ មើលលុយសិស្សគ្រប់ថ្នាក់ + កាបូបគ្រូ • ➕ បន្ថែមលុយឱ្យគ្រូ និងខ្លួនឯង (គ្រូមិនអាចបន្ថែមឱ្យខ្លួនឯង)
//  • កាបូបគ្រូ = 10,000,000៛ + Admin បន្ថែម + រៀនបាន (🎓 មើលជាសិស្ស) − ផ្តល់រង្វាន់សិស្ស
//  u.grants = [{id, a, w, ts, by, bn}] (ក្នុងគណនីគ្រូ)
// =====================================================================
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const J = k => { try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } };
const rl = n => Math.round(n||0).toLocaleString('en-US')+'៛';
const sr = n => (n>0?'+':n<0?'−':'')+rl(Math.abs(n||0));
const mk = () => { const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); };
const dt = t => new Date(t).toLocaleString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});
const TMK = uid => 'beginner-studio-tm:'+uid;
const TW0 = 10000000;
const A = () => (window.Auth&&Auth.data())||{users:[]};
const me = () => (window.Auth&&Auth.user())||{};
const CLS = () => (window.Class&&Class.data&&Class.data().classes)||[];
const av = (s,n) => window.Class&&Class._avatar?Class._avatar(s,n):'';

/* ---------- 🧾 sources ---------- */
const CAT = {word:['🔤','ចេះពាក្យ'], sec:['📖','រៀនចប់ផ្នែក'], ex:['✍️','លំហាត់ក្នុងផ្នែក'], q:['🎯','លំហាត់អនុវត្ត'], lv:['🏁','ឆ្លងកម្រិត'], unit:['🏆','រៀនចប់ Unit'],
  rich:['💰','លំហាត់និយាយ ១០ ជាន់'], ws:['📄','សន្លឹកលំហាត់'], exam:['📝','ប្រឡង'], bonus:['🎁','រង្វាន់ពីគ្រូ'], grant:['🛡️','Admin បន្ថែម'], fine:['❌','ដកដោយអវត្តមាន'], old:['⏳','មុនពេលកត់ត្រាប្រភព'], other:['🪙','ផ្សេងៗ']};
const catOfWhy = w => { w=String(w||'');
  return /ចេះពាក្យ/.test(w)?'word' : /^រៀនចប់ផ្នែក/.test(w)?'sec' : /^លំហាត់ផ្នែក/.test(w)?'ex' : /^លំហាត់ Unit/.test(w)?'q' : /^ឆ្លងកម្រិត/.test(w)?'lv' : /^រៀនចប់ Unit/.test(w)?'unit' : /ជាន់|ឈ្នះ/.test(w)?'rich' : /^សន្លឹកលំហាត់/.test(w)?'ws' : /ប្រឡង/.test(w)?'exam' : 'other'; };
/* learning money by source: recorded (M.src) + older entries classified from the history; what the short history can't explain → ⏳ */
function sources(M){ M=M||{}; const o={...(M.src||{})}, from=M.srcFrom||Infinity; let rec=Object.values(o).reduce((a,b)=>a+b,0);
  (M.log||[]).forEach(([t,a,w])=>{ if(t<from && a>0){ const k=catOfWhy(w); o[k]=(o[k]||0)+a; rec+=a; } });
  const left=(M.t||0)-rec; if(left>0) o.old=(o.old||0)+left; return o; }
const chips = (o, max) => Object.entries(o).filter(([,v])=>v).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,max||99).map(([k,v])=>`<span class="mo-chip ${v<0?'neg':''}" title="${esc(CAT[k]?CAT[k][1]:k)}">${CAT[k]?CAT[k][0]:'🪙'} ${esc(CAT[k]?CAT[k][1]:k)} <b>${sr(v)}</b></span>`).join('');

/* ---------- 👩‍🎓 one student ---------- */
function stu(c, s){ const u=A().users.find(x=>x.role==='student'&&x.classId===c.id&&x.studentId===s.id), P=u&&J('beginner-studio-v1:'+u.id), M=(P&&P.money)||{};
  const F=window.Class&&Class.fines?Class.fines(c, s.id):{t:0,m:{},log:[],fine:0,bonus:0}, m=mk(), src=sources(M);
  if(F.bonus) src.bonus=F.bonus; if(F.fine) src.fine=-F.fine;
  return {s, u, M, F, src, learn:M.t||0, net:(M.t||0)-F.t, mon:((M.m||{})[m]||0)-(F.m[m]||0), log:[...(M.log||[]), ...F.log].sort((a,b)=>b[0]-a[0])}; }
let SORT='net';
function classPanel(el, c){ if(!el) return; if(!c){ el.innerHTML='<div class="panel"><p class="note">មិនទាន់មានថ្នាក់</p></div>'; return; }
  const R=c.students.map(s=>stu(c,s)), sum=k=>R.reduce((a,r)=>a+r[k],0), tot={}; R.forEach(r=>Object.entries(r.src).forEach(([k,v])=>{ tot[k]=(tot[k]||0)+v; }));
  R.sort((a,b)=>b[SORT]-a[SORT]);
  el.innerHTML=`<div class="panel"><div class="mo-head"><h3 class="sec" style="margin:0">💰 លុយ និងប្រភពលុយរបស់សិស្ស — ${esc(c.name)}</h3>
      <div class="mo-kpi"><div><small>សរុបថ្នាក់</small><b>${rl(sum('net'))}</b></div><div><small>ខែនេះ</small><b>${sr(sum('mon'))}</b></div><div><small>សិស្ស</small><b>${R.length}</b></div></div></div>
    <div class="mo-chips">${chips(tot)}</div>
    <p class="note">💡 លុយសុទ្ធ = រកបានពីការរៀន + 🎁 រង្វាន់ពីគ្រូ − ❌ អវត្តមាន • ចុចលើសិស្ស ដើម្បីមើលប្រវត្តិលម្អិត • ទិន្នន័យធ្វើបច្ចុប្បន្នភាពពេលសិស្សបើក App</p></div>
  <div class="panel" style="margin-top:12px"><div class="row mo-sort"><span class="note">តម្រៀបតាម៖</span>${[['net','💰 សរុប'],['mon','📅 ខែនេះ'],['learn','📚 រៀនបាន']].map(([k,l])=>`<button class="chip ${SORT===k?'on':''}" onclick="Money._sort('${k}','${c.id}')">${l}</button>`).join('')}</div>
    <div class="mo-list">${R.map((r,i)=>`<button class="mo-row" onclick="Money.detail('${c.id}','${r.s.id}')"><span class="mo-n">${i+1}</span>${av(r.s,38)}<div class="mo-tx"><b>${esc(r.s.name)}${r.u?'':' <small class="note">(គ្មានគណនី)</small>'}</b><div class="mo-chips sm">${chips(r.src,4)||'<span class="note">មិនទាន់មានលុយ</span>'}</div></div>
      <div class="mo-v"><b class="${r.net<0?'neg':''}">${r.net<0?'−'+rl(-r.net):rl(r.net)}</b><small>ខែនេះ ${sr(r.mon)}</small></div><i>›</i></button>`).join('')||'<p class="note">មិនទាន់មានសិស្ស</p>'}</div></div>`;
  CUR={el, c}; }
let CUR=null;
function detail(cid, sid){ const c=CLS().find(x=>x.id===cid), s=c&&c.students.find(x=>x.id===sid); if(!s) return; const r=stu(c,s);
  modal(`<div class="mo-det"><div class="mo-dh">${av(s,54)}<div><h3>${esc(s.name)}</h3><small>${esc(c.name)}</small></div><div class="mo-v"><b class="${r.net<0?'neg':''}">${r.net<0?'−'+rl(-r.net):rl(r.net)}</b><small>ខែនេះ ${sr(r.mon)}</small></div></div>
    <h4>🧾 ប្រភពលុយ</h4><div class="mo-src">${Object.entries(r.src).filter(([,v])=>v).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div><span>${CAT[k]?CAT[k][0]+' '+CAT[k][1]:esc(k)}</span><i style="width:${Math.min(100,Math.abs(v)/Math.max(1,...Object.values(r.src).map(Math.abs))*100)}%" class="${v<0?'neg':''}"></i><b class="${v<0?'neg':''}">${sr(v)}</b></div>`).join('')||'<p class="note">មិនទាន់មាន</p>'}</div>
    ${r.src.old?`<p class="note">⏳ «មុនពេលកត់ត្រាប្រភព» = លុយចាស់ៗ ដែលប្រវត្តិខ្លីមិនអាចបែងចែកប្រភពបាន</p>`:''}
    <h4>📜 ប្រវត្តិថ្មីៗ (${Math.min(80,r.log.length)})</h4><div class="wal-log">${r.log.slice(0,80).map(([t,a,w])=>`<div class="${a<0?'minus':''}"><span>${esc(w)}<small>${dt(t)}</small></span><b>${sr(a)}</b></div>`).join('')||'<p class="note">មិនទាន់មាន</p>'}</div></div>`);
  document.getElementById('modal').classList.add('wide'); }

/* ---------- 👩‍🏫 teacher wallet ---------- */
function teacher(uid){ const u=A().users.find(x=>x.id===uid)||{}, T=J(TMK(uid))||{}, grants=(u.grants||[]).reduce((a,g)=>a+(+g.a||0),0), learned=T.t||0;
  let spent=0, given=0; CLS().forEach(c=>(c.bonus||[]).forEach(b=>{ if(b.by===uid){ spent+=+b.a||0; given++; } }));
  return {start:TW0, grants, learned, spent, given, left:TW0+grants+learned-spent, T, u}; }
function teachersPanel(){ const staff=A().users.filter(u=>u.role!=='student'&&!u.disabled), myId=me().id;
  return `<div class="panel"><div class="mo-head"><h3 class="sec" style="margin:0">👩‍🏫 កាបូបគ្រូ</h3></div>
    <p class="note">កាបូប = ${rl(TW0)} ចាប់ផ្តើម + 🛡️ Admin បន្ថែម + 📚 រៀនបាន (ពេលគ្រូរៀនក្នុង «🎓 មើលជាសិស្ស») − 🎁 ផ្តល់រង្វាន់សិស្ស • Admin បន្ថែមលុយឱ្យគ្រូ និងខ្លួនឯងបាន • គ្រូមិនអាចបន្ថែមលុយឱ្យខ្លួនឯងបានទេ</p>
    <div class="cl-tablewrap"><table class="cl-table mo-tt"><thead><tr><th>ឈ្មោះ</th><th>🛡️ Admin បន្ថែម</th><th>📚 រៀនបាន</th><th>🎁 ផ្តល់សិស្ស</th><th>💰 នៅសល់</th><th></th></tr></thead><tbody>
    ${staff.map(u=>{ const W=teacher(u.id); return `<tr><td class="l"><b>${esc(u.name)}</b> <small class="note">${u.role==='admin'?'🛡️ Admin':'👩‍🏫 គ្រូ'}</small></td><td>${W.grants?'+'+rl(W.grants):'—'}</td><td>${W.learned?'+'+rl(W.learned):'—'}</td><td>${W.spent?'−'+rl(W.spent)+` <small class="note">(${W.given})</small>`:'—'}</td><td><b>${rl(W.left)}</b></td>
      <td class="mo-act">${u.id===myId&&u.role!=='admin'?'<small class="note">ខ្លួនឯង</small>':`<button class="btn sun sm" onclick="Money.grant('${u.id}')">➕ បន្ថែមលុយ</button>`}<button class="btn ghost sm" onclick="Money.tDetail('${u.id}')">📜</button></td></tr>`; }).join('')}</tbody></table></div></div>`; }
function grant(uid){ const u=A().users.find(x=>x.id===uid); if(!u) return;   if(!window.Auth||Auth.role()!=='admin') return toast('🔒 មានតែ Admin ទេដែលអាចបន្ថែមលុយឱ្យគ្រូ');
  modal(`<div class="rw"><h3>➕ បន្ថែមលុយឱ្យ ${uid===me().id?'ខ្លួនឯង (Admin)':esc(u.name)}</h3><div class="rw-wal"><span>💰 កាបូបបច្ចុប្បន្ន</span><b>${rl(teacher(uid).left)}</b></div>
    <h4>💵 ចំនួនលុយ</h4><div class="row rw-q">${[100000,500000,1000000,2000000,5000000].map(v=>`<button class="chip" onclick="document.getElementById('grA').value=${v}">${v.toLocaleString('en-US')}</button>`).join('')}<input id="grA" type="number" min="100" step="100" class="cl-in" style="width:140px" value="1000000">៛</div>
    <h4>📝 មូលហេតុ</h4><input id="grW" class="cl-in" style="width:100%" maxlength="80" placeholder="ឧ. បន្ថែមថវិការង្វាន់ខែធ្នូ">
    <div class="rw-foot"><span></span><button class="btn sun" onclick="Money._grantGo('${uid}')">➕ បន្ថែមលុយ</button></div></div>`); }
function grantGo(uid){ const u=A().users.find(x=>x.id===uid), a=Math.round(+document.getElementById('grA').value||0), w=(document.getElementById('grW').value||'').trim();
  if(!u||Auth.role()!=='admin') return; if(!(a>0)) return toast('សូមបញ្ចូលចំនួនលុយ');
  u.grants=u.grants||[]; u.grants.push({id:Math.random().toString(36).slice(2,10), a, w, ts:Date.now(), by:me().id, bn:me().name||''}); u.ts=Date.now(); Auth._saveA();
  closeModal(); toast(`➕ បានបន្ថែម ${rl(a)} ឱ្យ ${u.name}`); redo(); }
function grantUndo(uid, gid){ const u=A().users.find(x=>x.id===uid); if(!u||Auth.role()!=='admin'||!confirm('ដកលុយដែលបានបន្ថែមនេះវិញ?')) return; u.grants=(u.grants||[]).filter(g=>g.id!==gid); u.ts=Date.now(); Auth._saveA(); tDetail(uid); redo(); }
function tDetail(uid){ const W=teacher(uid), u=W.u, adm=window.Auth&&Auth.role()==='admin';
  const L=[...(u.grants||[]).map(g=>[g.ts,+g.a||0,'🛡️ Admin បន្ថែម'+(g.bn?' ('+g.bn+')':'')+(g.w?' — '+g.w:''),g.id]), ...(W.T.log||[]).map(x=>[x[0],x[1],'📚 '+x[2]])];
  CLS().forEach(c=>(c.bonus||[]).forEach(b=>{ if(b.by===uid){ const s=c.students.find(x=>x.id===b.sid); L.push([b.ts,-(+b.a||0),`🎁 ផ្តល់រង្វាន់ ${s?s.name:'?'} (${c.name})${b.w?' — '+b.w:''}`]); } }));
  L.sort((a,b)=>b[0]-a[0]);
  modal(`<div class="mo-det"><div class="mo-dh"><div><h3>💰 កាបូបគ្រូ — ${esc(u.name||'')}</h3></div><div class="mo-v"><b>${rl(W.left)}</b><small>នៅសល់</small></div></div>
    <div class="mo-src"><div><span>🏦 ចាប់ផ្តើម</span><i style="width:100%"></i><b>${rl(W.start)}</b></div><div><span>🛡️ Admin បន្ថែម</span><i style="width:${Math.min(100,W.grants/W.start*100)}%"></i><b>+${rl(W.grants)}</b></div>
      <div><span>📚 រៀនបាន</span><i style="width:${Math.min(100,W.learned/W.start*100)}%"></i><b>+${rl(W.learned)}</b></div><div><span>🎁 ផ្តល់សិស្ស</span><i class="neg" style="width:${Math.min(100,W.spent/W.start*100)}%"></i><b class="neg">−${rl(W.spent)}</b></div></div>
    ${W.learned?`<h4>📚 រៀនបានតាមប្រភព</h4><div class="mo-chips">${chips(sources(W.T))}</div>`:''}
    <h4>📜 ប្រវត្តិ (${Math.min(100,L.length)})</h4><div class="wal-log">${L.slice(0,100).map(([t,a,w,gid])=>`<div class="${a<0?'minus':''}"><span>${esc(w)}<small>${dt(t)}</small></span><b>${sr(a)}</b>${gid&&adm?`<button class="btn ghost sm" title="ដកវិញ" onclick="Money._grantUndo('${uid}','${gid}')">↩</button>`:''}</div>`).join('')||'<p class="note">មិនទាន់មាន</p>'}</div></div>`);
  document.getElementById('modal').classList.add('wide'); }

/* ---------- 🛡️ admin page ---------- */
let AD={v:'stu', c:null};
function adminPanel(el){ if(!el) return; const cs=CLS(); if(!AD.c||!cs.some(c=>c.id===AD.c)) AD.c=cs[0]&&cs[0].id;
  const all=cs.map(c=>({c, R:c.students.map(s=>stu(c,s))})), sum=all.reduce((a,x)=>a+x.R.reduce((b,r)=>b+r.net,0),0);
  el.innerHTML=`<div class="row mo-sw"><button class="chip ${AD.v==='stu'?'on':''}" onclick="Money._ad('v','stu')">🎓 លុយសិស្ស</button><button class="chip ${AD.v==='t'?'on':''}" onclick="Money._ad('v','t')">👩‍🏫 កាបូបគ្រូ</button></div>
    ${AD.v==='t'?teachersPanel():`<div class="panel"><div class="mo-head"><h3 class="sec" style="margin:0">🎓 លុយសិស្សគ្រប់ថ្នាក់</h3><div class="mo-kpi"><div><small>សរុបគ្រប់ថ្នាក់</small><b>${rl(sum)}</b></div><div><small>ថ្នាក់</small><b>${cs.length}</b></div></div></div>
      <div class="mo-cls">${all.map(({c,R})=>`<button class="${AD.c===c.id?'on':''}" onclick="Money._ad('c','${c.id}')"><b>${esc(c.name)}</b><small>${R.length} នាក់ • ${rl(R.reduce((a,r)=>a+r.net,0))}</small></button>`).join('')||'<p class="note">មិនទាន់មានថ្នាក់</p>'}</div></div><div id="moCls" style="margin-top:12px"></div>`}`;
  if(AD.v!=='t') classPanel(document.getElementById('moCls'), cs.find(c=>c.id===AD.c));
  ADEL=el; }
let ADEL=null;
function redo(){ if(ADEL&&document.body.contains(ADEL)) adminPanel(ADEL); else if(CUR&&document.body.contains(CUR.el)) classPanel(CUR.el, CUR.c); }

window.Money = { classPanel, adminPanel, teacher, detail, tDetail, grant, sources, TMK, _grantGo:grantGo, _grantUndo:grantUndo,
  _sort:(k,cid)=>{ SORT=k; if(ADEL&&document.body.contains(ADEL)) adminPanel(ADEL); else classPanel(CUR.el, CLS().find(c=>c.id===cid)); },
  _ad:(k,v)=>{ AD[k]=v; adminPanel(ADEL); } };
})();
