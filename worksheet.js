// =====================================================================
//  worksheet.js — 📄 សន្លឹកលំហាត់៖ បោះពុម្ព • បើកឱ្យសិស្សធ្វើលើទូរស័ព្ទ (ពិន្ទុស្វ័យប្រវត្តិ) • បើកឱ្យសិស្សមើលសរសេរក្នុងសៀវភៅ
//  ទិន្នន័យ៖ beginner-studio-ws-v1 = { list:[assignment], results:[...] }
// =====================================================================
(function(){
const WK='beginner-studio-ws-v1';
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = s => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2,10);
let W={list:[], results:[]};
function load(){ try{ W={list:[], results:[], ...JSON.parse(localStorage.getItem(WK)||'{}')}; }catch(e){} }
load();
const saveW = () => { try{ localStorage.setItem(WK, JSON.stringify(W)); }catch(e){ toast('⚠️ ទំហំទិន្នន័យពេញ'); } };
const me = () => { const u=window.Auth&&Auth.user(); return u&&u.role==='student'?u:null; };
const shuf = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const normA = t => String(t||'').toLowerCase().replace(/[’`]/g,"'").replace(/\(.*?\)/g,'').replace(/^(a|an|the) /,'').replace(/[^a-z0-9' -]/g,'').replace(/\s+/g,' ').trim();
const letter = i => String.fromCharCode(97+i);

/* ---------- build a sheet (stored as plain content so every student gets the same sheet) ---------- */
function poolOf(u){ return u.vocab.filter(v=>v[0]&&v[2]&&!/[→↔\/]/.test(v[0])); }
function make(n, nA, nB, nC){
  const u=UNITS[n-1], pool=shuf(poolOf(u));
  const A=pool.slice(0,nA).map(v=>[v[0],v[2]]);
  const C=pool.slice(nA, nA+nC).map(v=>[v[2],v[0]]);
  const B=shuf((window.Exam&&Exam.grammarPool)?Exam.grammarPool(n):u.quiz.map(q=>({q:q.q,o:q.o,a:q.a}))).slice(0,nB);
  return {n, title:`Unit ${n}: ${u.en}`, km:u.km, A, Am:shuf(A.map((_,i)=>i)), B, C};
}
const total = ws => ws.A.length+ws.B.length+ws.C.length;

/* ---------- paper / read-only rendering ---------- */
function paper(ws, key){
  return `<div class="ws-paper"><h1>${esc(ws.title)} — ${esc(ws.km)}</h1>
    <div class="ws-row"><span>Name / ឈ្មោះ: ______________________</span><span>Date: ________</span><span>Score: ____ / ${total(ws)}</span></div>
    ${ws.A.length?`<h2>A. Match the words. ផ្គូផ្គងពាក្យអង់គ្លេសជាមួយអត្ថន័យខ្មែរ</h2><table>${ws.A.map((w,i)=>`<tr><td style="width:50%">${i+1}. ${esc(w[0])} ____</td><td class="km">${letter(i)}. ${esc(ws.A[ws.Am[i]][1])}</td></tr>`).join('')}</table>`:''}
    ${ws.B.length?`<h2>B. Choose the correct answer. គូសរង្វង់ចម្លើយត្រឹមត្រូវ</h2><table>${ws.B.map((q,i)=>`<tr><td>${i+1}. ${esc(q.q).replace(/_{3,}/,'________')}</td><td style="width:45%">${q.o.map((o,j)=>letter(j)+') '+esc(o)).join('&nbsp;&nbsp;&nbsp;')}</td></tr>`).join('')}</table>`:''}
    ${ws.C.length?`<h2>C. Write the English word. សរសេរពាក្យជាភាសាអង់គ្លេស</h2><table>${ws.C.map((w,i)=>`<tr><td class="km" style="width:50%">${i+1}. ${esc(w[0])}</td><td>_________________________</td></tr>`).join('')}</table>`:''}
    ${key?`<div class="pbreak"></div><h1>Answer key — ${esc(ws.title)}</h1>
      ${ws.A.length?`<h2>A</h2><p>${ws.A.map((w,i)=>`${i+1}–${letter(ws.Am.indexOf(i))}`).join(', ')}</p>`:''}
      ${ws.B.length?`<h2>B</h2><p>${ws.B.map((q,i)=>`${i+1}. ${esc(q.o[q.a])}`).join(' • ')}</p>`:''}
      ${ws.C.length?`<h2>C</h2><p>${ws.C.map((w,i)=>`${i+1}. ${esc(w[1])}`).join(' • ')}</p>`:''}`:''}</div>`;
}

/* ---------- teacher tab ---------- */
let CUR=null, SEL={A:10,B:6,C:6};
const OPTS=(arr,sel)=>arr.map(v=>`<option ${v===sel?'selected':''}>${v}</option>`).join('');
function classes(){ const C=(window.Class&&Class.data())||{classes:[]}; return C.classes.filter(c=>!window.Auth||!Auth.user()||Auth.canSeeClass(c)); }
function teacherTab(u){
  const maxA=poolOf(u).length, gp=(window.Exam&&Exam.grammarPool)?Exam.grammarPool(u.n).length:u.quiz.length;
  const As=[0,5,8,10,12,15,20,25,30,40,50].filter(v=>v<=maxA).concat(maxA>50?[maxA]:[]), Bs=[0,3,5,6,8,10,12,15,20].filter(v=>v<=gp).concat([gp]).filter((v,i,a)=>a.indexOf(v)===i), Cs=[0,3,5,6,8,10,12,15,20,25,30].filter(v=>v<=maxA);
  const cs=classes(), list=W.list.filter(a=>a.n===u.n && cs.some(c=>c.id===a.cls)).sort((a,b)=>b.ts-a.ts);
  $('#tab').innerHTML=`<div class="panel"><h3 class="sec">📄 សន្លឹកលំហាត់ Unit ${u.n}</h3>
    <div class="row ws-opts">
      <label class="km">A. ផ្គូផ្គងពាក្យ<select id="wsA">${OPTS(As, Math.min(SEL.A,maxA))}</select></label>
      <label class="km">B. វេយ្យាករណ៍<select id="wsB">${OPTS(Bs, Math.min(SEL.B,gp))}</select></label>
      <label class="km">C. សរសេរពាក្យ<select id="wsC">${OPTS(Cs, SEL.C)}</select></label>
      <button class="btn teal" onclick="WS.gen(${u.n})">🔄 បង្កើតថ្មី</button>
    </div>
    <p class="note">មានពាក្យសរុប ${maxA} • សំណួរវេយ្យាករណ៍ ${gp} • រាល់ពេលចុច «បង្កើតថ្មី» បានសន្លឹកខុសគ្នា</p>
    <div class="ws-acts">
      <div class="ws-act print"><b>🖨 បោះពុម្ព</b><label class="km"><input type="checkbox" id="wsKey" checked> ភ្ជាប់ទំព័រចម្លើយ</label><button class="btn sun" onclick="WS.print()">🖨 បោះពុម្ព / PDF</button></div>
      <div class="ws-act send"><b>📲 ផ្ញើឱ្យសិស្ស</b>
        ${cs.length?`<label class="km">🏫 ថ្នាក់ <select id="wsCls" class="cl-in">${cs.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label>
        <div class="ws-mode"><label><input type="radio" name="wsM" value="do" checked> ✍️ <b>ធ្វើលើទូរស័ព្ទ</b><small>ដាក់ពិន្ទុ ដឹងខុសត្រូវភ្លាមៗ</small></label>
          <label><input type="radio" name="wsM" value="view"> 📖 <b>មើល ហើយសរសេរក្នុងសៀវភៅ</b><small>សិស្សចម្លងទៅសៀវភៅ</small></label></div>
        <label class="km"><input type="checkbox" id="wsShow" checked> បង្ហាញចម្លើយត្រឹមត្រូវក្រោយធ្វើរួច</label>
        <label class="km"><input type="checkbox" id="wsOnce" checked> ធ្វើបានតែម្តង</label>
        <button class="btn teal" onclick="WS.send()">📲 ផ្ញើឱ្យសិស្ស</button>`:'<p class="note">មិនទាន់មានថ្នាក់</p>'}</div>
    </div>
    ${list.length?`<h3 class="sec" style="margin-top:18px">📋 សន្លឹកដែលបានផ្ញើ</h3>${list.map(a=>assignRow(a,cs)).join('')}`:''}
    <div id="wsPrev" class="ws-prev"></div></div>`;
  if(CUR && CUR.n===u.n) $('#wsPrev').innerHTML=paper(CUR,true); else gen(u.n);
}
function assignRow(a, cs){
  const c=cs.find(x=>x.id===a.cls)||{name:'?',students:[]}, rs=W.results.filter(r=>r.wid===a.id), who=new Set(rs.map(r=>r.sid));
  const avg=a.mode==='do'&&rs.length?Math.round(rs.reduce((s,r)=>s+r.s/r.t*100,0)/rs.length):null;
  return `<div class="ws-asg ${a.open?'':'closed'}"><span class="st">${a.open?'● បើក':'⛔ បិទ'}</span><b>${a.mode==='do'?'✍️ ធ្វើលើទូរស័ព្ទ':'📖 សរសេរក្នុងសៀវភៅ'}</b>
    <span>🏫 ${esc(c.name)} • ${total(a.ws)} សំណួរ • ${new Date(a.ts).toLocaleDateString('en-GB')}</span>
    <span class="cnt">✅ ${who.size}/${c.students.length}${avg!=null?` • មធ្យម ${avg}%`:''}</span>
    <button class="btn sm ghost" onclick="WS.results('${a.id}')">📊 លទ្ធផល</button>
    <button class="btn sm ghost" onclick="WS.toggle('${a.id}')">${a.open?'⛔ បិទ':'🔓 បើកវិញ'}</button>
    <button class="btn sm ghost" onclick="WS.del('${a.id}')">🗑</button></div>`;
}
function gen(n){ SEL={A:+$('#wsA').value, B:+$('#wsB').value, C:+$('#wsC').value}; CUR=make(n, +$('#wsA').value, +$('#wsB').value, +$('#wsC').value); $('#wsPrev').innerHTML=paper(CUR, true); }
function print(){ $('#printArea').innerHTML=paper(CUR, $('#wsKey').checked); window.print(); }
function send(){
  if(!CUR || !total(CUR)) return toast('សូមជ្រើសចំនួនសំណួរ');
  const mode=(document.querySelector('input[name=wsM]:checked')||{}).value||'do';
  const a={id:uid(), n:CUR.n, cls:$('#wsCls').value, mode, show:$('#wsShow').checked, once:$('#wsOnce').checked, open:true, ts:Date.now(), by:(window.Auth&&Auth.user()&&Auth.user().name)||'', ws:CUR};
  W.list.push(a); saveW(); if(window.Notify) Notify.task(a.cls, `សន្លឹកលំហាត់ Unit ${a.n}`, mode==='do'?'ធ្វើលើទូរស័ព្ទ — ចូល 📝 កិច្ចការ':'មើល ហើយសរសេរក្នុងសៀវភៅ — ចូល 📝 កិច្ចការ'); toast(mode==='do'?'📲 បានផ្ញើ — សិស្សអាចធ្វើលើទូរស័ព្ទបានហើយ':'📲 បានផ្ញើ — សិស្សអាចមើល ហើយសរសេរក្នុងសៀវភៅ'); render();
}
function toggle(id){ const a=W.list.find(x=>x.id===id); a.open=!a.open; saveW(); render(); }
function del(id){ if(!confirm('លុបសន្លឹកនេះ និងលទ្ធផលរបស់វា?')) return; W.list=W.list.filter(x=>x.id!==id); W.results=W.results.filter(r=>r.wid!==id); saveW(); render(); }
function results(id){
  const a=W.list.find(x=>x.id===id), c=classes().find(x=>x.id===a.cls)||{students:[]}, rs=W.results.filter(r=>r.wid===id);
  const best={}; rs.forEach(r=>{ if(!best[r.sid] || r.s>best[r.sid].s) best[r.sid]=r; });
  modal(`<h3>📊 លទ្ធផល — ${esc(a.ws.title)} (${a.mode==='do'?'✍️ ធ្វើលើទូរស័ព្ទ':'📖 សរសេរក្នុងសៀវភៅ'})</h3>
    <div class="cl-tablewrap" style="max-height:60vh"><table class="cl-table"><thead><tr><th class="l">សិស្ស</th><th>ស្ថានភាព</th>${a.mode==='do'?'<th>ពិន្ទុ</th><th>%</th>':''}<th>ពេល</th></tr></thead><tbody>
    ${c.students.map(s=>{ const r=best[s.id]; return `<tr><td class="l">${esc(s.name)}</td><td>${r?'✅':'—'}</td>${a.mode==='do'?`<td>${r?r.s+'/'+r.t:''}</td><td>${r?`<span class="gr" style="background:${r.s/r.t>=.8?'#16a34a':r.s/r.t>=.5?'#2563eb':'#dc2626'}">${Math.round(r.s/r.t*100)}%</span>`:''}</td>`:''}<td>${r?new Date(r.ts).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'}):''}</td></tr>`; }).join('')}
    </tbody></table></div>${window.IS_WEB?'<p class="note">🔄 បើកទំព័រឡើងវិញ ដើម្បីឃើញលទ្ធផលថ្មីពីទូរស័ព្ទសិស្ស</p>':''}`);
  $('#modal').classList.add('wide');
}

/* ---------- student side ---------- */
function forMe(){ const m=me(); if(!m) return []; return W.list.filter(a=>a.open && a.cls===m.classId).sort((a,b)=>b.ts-a.ts); }
function doneOf(a){ const m=me(); return W.results.filter(r=>r.wid===a.id && (r.uid===m.id || r.sid===m.studentId)).sort((x,y)=>y.ts-x.ts)[0]; }
function pending(){ return forMe().filter(a=>!doneOf(a)).length; }
function studentSection(){
  const L=forMe();
  if(!L.length) return `<h3 class="stu-sub">📄 សន្លឹកលំហាត់</h3><div class="stu-empty sm"><p>មិនទាន់មានសន្លឹកលំហាត់ពីគ្រូទេ</p></div>`;
  return `<h3 class="stu-sub">📄 សន្លឹកលំហាត់</h3>${L.map(a=>{ const st=UNIT_STYLE[a.n], d=doneOf(a), can=!(d&&a.once);
    return `<div class="stu-exam" style="--c1:${st.c1};--c2:${st.c2}"><div class="ic">${a.mode==='do'?'✍️':'📖'}</div><div class="tx"><b>${esc(a.ws.title)}</b><span>${a.mode==='do'?'ធ្វើលើទូរស័ព្ទ':'មើល ហើយសរសេរក្នុងសៀវភៅ'} • ${total(a.ws)} សំណួរ</span>
      ${d?`<span class="dn">✅ ${a.mode==='do'?`${d.s}/${d.t} (${Math.round(d.s/d.t*100)}%)`:'បានសរសេររួច'}</span>`:''}</div>
      ${a.mode==='view'?`<button class="btn sun" onclick="WS.open('${a.id}')">📖 មើល</button>`:can?`<button class="btn sun" onclick="WS.open('${a.id}')">▶ ${d?'ម្តងទៀត':'ធ្វើ'}</button>`:`<button class="btn ghost" onclick="WS.review('${a.id}')">👁 មើល</button>`}</div>`; }).join('')}`;
}
let RUN=null;
function shell(inner){ let el=$('#wsRun'); if(!el){ el=document.createElement('div'); el.id='wsRun'; document.body.appendChild(el); } document.body.classList.add('exam-open'); el.innerHTML=inner; el.scrollTop=0; }
function close(){ const el=$('#wsRun'); if(el) el.remove(); document.body.classList.remove('exam-open'); RUN=null; if(window.render) render(); }
async function openA(id){
  if(window.Cloud&&Cloud.refresh){ try{ await Cloud.refresh(WK); }catch(e){} load(); }
  const a=W.list.find(x=>x.id===id); if(!a||!a.open){ toast('🔒 គ្រូបានបិទសន្លឹកនេះហើយ'); if(window.render) render(); return; }
  if(a.mode==='view') return viewA(a);
  if(a.once && doneOf(a)) return review(id);
  const ws=a.ws, kmOpts=shuf(ws.A.map(w=>w[1]));
  RUN={a, ans:{A:{},B:{},C:{}}};
  shell(`<div class="wr-top"><button onclick="WS.close()">✕</button><div><b>${esc(ws.title)}</b><small>${total(ws)} សំណួរ</small></div><span id="wrCnt">0/${total(ws)}</span></div>
    <div class="wr-body">
    ${ws.A.length?`<h3>A. ផ្គូផ្គងពាក្យ <small>Match the words</small></h3>${ws.A.map((w,i)=>`<div class="wr-q"><b>${i+1}. ${esc(w[0])}</b><button class="wr-say" onclick="speak(${JSON.stringify(w[0]).replace(/"/g,'&quot;')})">🔊</button><select onchange="WS.ans('A',${i},this.value)"><option value="">— ជ្រើសអត្ថន័យ —</option>${kmOpts.map(k=>`<option>${esc(k)}</option>`).join('')}</select></div>`).join('')}`:''}
    ${ws.B.length?`<h3>B. ជ្រើសចម្លើយត្រឹមត្រូវ <small>Choose the correct answer</small></h3>${ws.B.map((q,i)=>`<div class="wr-q"><b>${i+1}. ${esc(q.q)}</b>${q.qKm?`<small>${esc(q.qKm)}</small>`:''}<div class="wr-opts">${q.o.map((o,j)=>`<button data-b="${i}" onclick="WS.pick(${i},${j},this)">${letter(j)}. ${esc(o)}</button>`).join('')}</div></div>`).join('')}`:''}
    ${ws.C.length?`<h3>C. សរសេរពាក្យអង់គ្លេស <small>Write the English word</small></h3>${ws.C.map((w,i)=>`<div class="wr-q"><b>${i+1}. ${esc(w[0])}</b><input autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="English…" oninput="WS.ans('C',${i},this.value)"></div>`).join('')}`:''}
    <button class="btn teal wr-submit" onclick="WS.submit()">✅ ប្រគល់ ហើយមើលពិន្ទុ</button></div>`);
}
function count(){ const r=RUN.ans, k=Object.values(r.A).filter(Boolean).length+Object.keys(r.B).length+Object.values(r.C).filter(v=>v.trim()).length; const el=$('#wrCnt'); if(el) el.textContent=k+'/'+total(RUN.a.ws); return k; }
function ans(p,i,v){ RUN.ans[p][i]=v; count(); }
function pick(i,j,btn){ RUN.ans.B[i]=j; document.querySelectorAll(`[data-b="${i}"]`).forEach(b=>b.classList.toggle('on',b===btn)); count(); }
function grade(ws, ans){
  const A=ws.A.map((w,i)=>ans.A[i]===w[1]), B=ws.B.map((q,i)=>ans.B[i]===q.a), C=ws.C.map((w,i)=>!!ans.C[i] && normA(ans.C[i])===normA(w[1]));
  const s=[...A,...B,...C].filter(Boolean).length; return {A,B,C,s,t:total(ws)};
}
function submit(){ if(window.Auth&&Auth.asStaff&&Auth.asStaff()) return toast('👁 គ្រូកំពុងមើល — មិនអាចដាក់ចម្លើយជំនួសសិស្សបានទេ');
  const left=total(RUN.a.ws)-count(); if(left>0 && !confirm(`នៅសល់ ${left} សំណួរមិនទាន់ឆ្លើយ។ ប្រគល់ឥឡូវ?`)) return;
  const m=me(), g=grade(RUN.a.ws, RUN.ans);
  W.results.push({id:uid(), wid:RUN.a.id, uid:m.id, sid:m.studentId, name:m.name, s:g.s, t:g.t, ts:Date.now(), ans:RUN.ans});
  saveW(); if(typeof track==='function') track('worksheet', RUN.a.n+':'+Math.round(g.s/g.t*100));
  if(window.earn&&g.t) earn(`ws:${RUN.a.id}`, Math.min(2000, Math.round(g.s/g.t*10)*200), `សន្លឹកលំហាត់ (${g.s}/${g.t})`);
  showResult(RUN.a, RUN.ans, g);
}
function showResult(a, ans, g){
  const ws=a.ws, pct=Math.round(g.s/g.t*100), show=a.show;
  const row=(ok,q,your,right)=>`<div class="wr-r ${ok?'ok':'no'}"><span>${ok?'✅':'❌'}</span><div><b>${q}</b>${show||ok?'':''}<small>${esc(your||'—')}${!ok&&show?` → <em>${esc(right)}</em>`:''}</small></div></div>`;
  shell(`<div class="wr-top"><button onclick="WS.close()">✕</button><div><b>${esc(ws.title)}</b><small>លទ្ធផល</small></div><span></span></div>
    <div class="wr-body"><div class="wr-score ${pct>=80?'good':pct>=50?'mid':'low'}"><div>${pct>=80?'🏆':pct>=50?'👍':'💪'}</div><b>${g.s}/${g.t}</b><span>${pct}%</span></div>
    ${ws.A.length?`<h3>A</h3>${ws.A.map((w,i)=>row(g.A[i], esc(w[0]), ans.A[i], w[1])).join('')}`:''}
    ${ws.B.length?`<h3>B</h3>${ws.B.map((q,i)=>row(g.B[i], esc(q.q), ans.B[i]!=null?q.o[ans.B[i]]:'', q.o[q.a])).join('')}`:''}
    ${ws.C.length?`<h3>C</h3>${ws.C.map((w,i)=>row(g.C[i], esc(w[0]), ans.C[i], w[1])).join('')}`:''}
    ${show?'':'<p class="note">🔒 គ្រូមិនបានបើកឱ្យមើលចម្លើយត្រឹមត្រូវទេ</p>'}
    <button class="btn teal wr-submit" onclick="WS.close()">✔ រួចរាល់</button></div>`);
}
function review(id){ const a=W.list.find(x=>x.id===id), d=doneOf(a); if(!d) return; showResult(a, d.ans||{A:{},B:{},C:{}}, grade(a.ws, d.ans||{A:{},B:{},C:{}})); }
function viewA(a){
  const d=doneOf(a);
  shell(`<div class="wr-top"><button onclick="WS.close()">✕</button><div><b>${esc(a.ws.title)}</b><small>📖 សរសេរចម្លើយក្នុងសៀវភៅរបស់អ្នក</small></div><span></span></div>
    <div class="wr-body wr-view">${paper(a.ws, false)}
    ${d?'<p class="note" style="text-align:center">✅ អ្នកបានប្រាប់គ្រូថា សរសេររួចហើយ</p>':`<button class="btn teal wr-submit" onclick="WS.wrote('${a.id}')">✅ ខ្ញុំបានសរសេរក្នុងសៀវភៅរួចហើយ</button>`}</div>`);
}
function wrote(id){ const a=W.list.find(x=>x.id===id), m=me(); W.results.push({id:uid(), wid:id, uid:m.id, sid:m.studentId, name:m.name, s:0, t:total(a.ws), ts:Date.now(), wrote:true}); saveW(); toast('✅ បានប្រាប់គ្រូហើយ'); close(); }

window.WS = { teacherTab, gen, print, send, toggle, del, results, studentSection, pending, open:openA, close, ans, pick, submit, review, wrote, reload:load, key:WK, data:()=>W };
})();
