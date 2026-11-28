// =====================================================================
//  pending.js — ⏳ សិស្សដែលមិនទាន់ប្រឡង / មិនទាន់ធ្វើកិច្ចការដែលគ្រូដាក់ឱ្យ
//  • ប៊ូតុង «⏳ មិនទាន់ N» លើប្រឡងនីមួយៗ និងសន្លឹកលំហាត់ → បញ្ជីឈ្មោះ + 📣 រំលឹក
//  • ផ្ទាំងថ្នាក់ «⏳ មិនទាន់ប្រឡង» — សង្ខេបគ្រប់ប្រឡង/សន្លឹកលំហាត់ដែលកំពុងបើក
// =====================================================================
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CLS = () => (window.Class&&Class.data&&Class.data().classes)||[];
const users = () => (window.Auth&&Auth.data().users)||[];
const av = (s,n) => window.Class&&Class._avatar?Class._avatar(s,n):'';
const uOf = (c,sid) => users().find(x=>x.role==='student'&&x.classId===c.id&&x.studentId===sid);

/* every task the teacher has opened for a class: {k, id, title, sub, c, done:Set(sid)} */
function tasks(c){ const out=[];
  const X=(window.Exam&&Exam.data&&Exam.data())||{}, R=X.results||[];
  (X.open||[]).filter(se=>se.cls===c.id).sort((a,b)=>a.n-b.n||String(a.ver).localeCompare(String(b.ver))).forEach(se=>{
    const done=new Set(R.filter(r=>r.sess===se.id).map(r=>{ if(r.sid) return r.sid; const u=users().find(x=>x.id===r.uid); return u&&u.studentId; }).filter(Boolean));
    out.push({k:'ex', id:se.id, title:`📝 ប្រឡង Unit ${se.n} • Version ${se.ver}`, sub:`${se.min?'⏱ '+se.min+' នាទី':'គ្មានកំណត់ពេល'} • បើកថ្ងៃ ${new Date(se.ts).toLocaleDateString('en-GB')}`, c, done}); });
  const W=(window.WS&&WS.data&&WS.data())||{};
  (W.list||[]).filter(a=>a.cls===c.id&&a.open).forEach(a=>{ const done=new Set((W.results||[]).filter(r=>r.wid===a.id).map(r=>r.sid));
    out.push({k:'ws', id:a.id, title:`📄 សន្លឹកលំហាត់ Unit ${a.n}`, sub:`${a.mode==='do'?'✍️ ធ្វើលើទូរស័ព្ទ':'📖 សរសេរក្នុងសៀវភៅ'} • ${new Date(a.ts).toLocaleDateString('en-GB')}`, c, done}); });
  return out; }
const miss = t => t.c.students.filter(s=>!t.done.has(s.id));
function find(k, id){ for(const c of CLS()){ const t=tasks(c).find(x=>x.k===k&&x.id===id); if(t) return t; } return null; }

/* small button for a session / worksheet row */
function btn(k, id){ const t=find(k,id); if(!t) return ''; const n=miss(t).length;
  return n?`<button class="btn sm pd-btn" onclick="Pending.show('${k}','${id}')">⏳ មិនទាន់ ${n} នាក់</button>`:`<span class="pd-all">🎉 គ្រប់គ្នា</span>`; }
const list = (t, M) => M.length?`<div class="pd-list">${M.map(s=>`<div class="pd-s">${av(s,34)}<span>${esc(s.name)}</span>${uOf(t.c,s.id)?'':'<small title="សិស្សនេះមិនទាន់មានគណនី App">🚫 គ្មានគណនី</small>'}</div>`).join('')}</div>`:'<p class="pd-ok">🎉 សិស្សទាំងអស់បានធ្វើរួចហើយ</p>';
function show(k, id){ const t=find(k,id); if(!t) return; const M=miss(t);
  modal(`<div class="pd"><h3>⏳ មិនទាន់ធ្វើ — ${esc(t.title)}</h3><p class="note">🏫 ${esc(t.c.name)} • ${t.sub} • ✅ ${t.c.students.length-M.length}/${t.c.students.length} បានធ្វើ</p>
    ${list(t,M)}
    <div class="row" style="justify-content:flex-end;gap:8px;margin-top:12px"><button class="btn ghost" onclick="closeModal()">បិទ</button>${M.length?`<button class="btn sun" onclick="Pending.remind('${k}','${id}')">📣 រំលឹកអ្នកមិនទាន់ធ្វើ (${M.length})</button>`:''}</div></div>`); }
function remind(k, id, quiet){ const t=find(k,id); if(!t) return 0; let n=0;
  miss(t).forEach(s=>{ const u=uOf(t.c,s.id); if(u&&window.Notify&&Notify.post){ Notify.post(t.c.id,{to:u.id, kind:'task', t:`⏰ រំលឹក៖ ${t.title.replace(/^\S+\s/,'')}`, x:'អ្នកមិនទាន់ធ្វើទេ — ចូល 📝 កិច្ចការ ដើម្បីធ្វើឥឡូវនេះ 🙏'}); n++; } });
  if(!quiet){ closeModal(); toast(n?`📣 បានរំលឹកសិស្ស ${n} នាក់`:'⚠️ សិស្សទាំងនេះមិនទាន់មានគណនី App'); } return n; }

/* class tab: everything still open, with who hasn't done it */
function tab(el, c){ if(!el) return; if(!c){ el.innerHTML='<div class="panel"><p class="note">មិនទាន់មានថ្នាក់</p></div>'; return; }
  const T=tasks(c), tot=T.reduce((a,t)=>a+miss(t).length,0);
  el.innerHTML=`<div class="panel"><div class="pd-head"><h3 class="sec" style="margin:0">⏳ សិស្សមិនទាន់ប្រឡង / មិនទាន់ធ្វើកិច្ចការ</h3>${tot?`<button class="btn sun sm" onclick="Pending.remindAll('${c.id}')">📣 រំលឹកទាំងអស់</button>`:''}</div>
    <p class="note">បង្ហាញតែប្រឡង និងសន្លឹកលំហាត់ដែលកំពុងបើក • ចុចលើកាត ដើម្បីមើល និងរំលឹក</p></div>
    ${T.length?T.map(t=>{ const M=miss(t), n=t.c.students.length, d=n-M.length; return `<div class="panel pd-card ${M.length?'':'ok'}" style="margin-top:12px">
      <div class="pd-ch"><div><b>${esc(t.title)}</b><small>${t.sub}</small></div><div class="pd-pr"><span>✅ ${d}/${n}</span><i><s style="width:${n?d/n*100:0}%"></s></i></div>
        ${M.length?`<button class="btn ghost sm" onclick="Pending.remind('${t.k}','${t.id}')">📣 រំលឹក</button>`:''}</div>
      ${list(t,M)}</div>`; }).join(''):'<div class="panel" style="margin-top:12px"><p class="pd-ok">📭 មិនមានប្រឡង ឬសន្លឹកលំហាត់កំពុងបើកសម្រាប់ថ្នាក់នេះទេ</p></div>'}`; }
function remindAll(cid){ const c=CLS().find(x=>x.id===cid); if(!c) return; let n=0; tasks(c).forEach(t=>{ n+=remind(t.k,t.id,true); }); toast(n?`📣 បានផ្ញើការរំលឹក ${n} ដង`:'⚠️ គ្មានសិស្សមានគណនីដែលត្រូវរំលឹក'); }

window.Pending = { tasks, btn, show, remind, remindAll, tab };
})();
