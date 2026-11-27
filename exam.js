// =====================================================================
//  exam.js — 📝 ប្រឡងបញ្ចប់មេរៀន (End-of-unit test)
//  • បង្កើតសំណួរពី Wordlist + សំឡេង Phonicsនៃមេរៀន (សំណួរថ្មី មិនមែនចម្លងពីសៀវភៅ)
//  • ៣ របៀប: 🖨 បោះពុម្ព (Version A/B + ចម្លើយ + អត្ថបទស្តាប់) • 💻 ប្រឡងក្នុង App • 🌐 Online (ឯកសារ HTML + កូដលទ្ធផល)
//  • ពិន្ទុសរុប ៥០ • A វាក្យសព្ទ 10 • B សំឡេង Phonics 10 • C ផ្គូផ្គង 8 • D ស្តាប់ 6 • E សរសេរ 8 • F រៀបប្រយោគ 4×2
// =====================================================================
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = s => document.querySelector(s);
const EK = 'beginner-studio-exams-v1';
let X = { results:[], open:[], settings:{minutes:40, school:'', ver:'A'} };
try { Object.assign(X, JSON.parse(localStorage.getItem(EK)||'{}')); } catch(e){}
function reloadX(){ try{ X={ results:[], open:[], settings:{minutes:40, school:'', ver:'A'}, ...JSON.parse(localStorage.getItem(EK)||'{}') }; X.open=X.open||[]; }catch(e){} }
const saveX = () => { try{ localStorage.setItem(EK, JSON.stringify(X)); }catch(e){ toast('⚠️ ទំហំទិន្នន័យពេញ'); } };

/* ---------- seeded random ---------- */
function rng(seed){ let a=seed>>>0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hashStr(s){ let h=2166136261; for(const ch of s){ h^=ch.codePointAt(0); h=Math.imul(h,16777619); } return h>>>0; }
const shuf = (a,r) => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const clean = t => String(t).replace(/\(.*?\)/g,'').replace(/[→=↔].*$/,'').trim();
const normA = t => clean(t).toLowerCase().replace(/[’`]/g,"'").replace(/^(a|an|the) /,'').replace(/[^a-z0-9' -]/g,'').replace(/\s+/g,' ').trim();

function grammarItems(n, r){
  const u=UNITS[n-1], L=LESSONS[n], B=[];
  const mcFrom = (ans, others) => { const o=shuf([ans,...others],r); return {opts:o, a:o.indexOf(ans)}; };

  shuf(u.quiz,r).forEach(q=>{ const m=mcFrom(q.o[q.a], q.o.filter((_,k)=>k!==q.a)); B.push({t:'mc',q:q.q,...m}); });
  L.grammar.forEach(g=>(g.err||[]).forEach(e=>{ const m=mcFrom(e[1],[e[0]]); B.push({t:'mc',q:'Which sentence is correct?',qKm:'ប្រយោគណាត្រឹមត្រូវ?',...m}); }));
  L.grammar.forEach(g=>{ const keys=[...new Set((g.t+' '+(g.form||[]).flat().join(' ')).toLowerCase().replace(/[^a-z' ]/g,' ').split(/\s+/).filter(w=>w.length>1&&!['and','the','or','with','to','noun','verb','past','present','simple','questions','negatives','short','answers'].includes(w)))];
    if(window.COURSE&&COURSE.sg){ const V=new Set(u.vocab.map(v=>v[0].toLowerCase())); keys.splice(0,keys.length,...keys.filter(k=>V.has(k))); }
    g.ex.forEach(ex=>{ const ws=ex.split(' '); const i=ws.findIndex(w=>keys.includes(w.toLowerCase().replace(/[^a-z']/g,''))); if(i<0||keys.length<3) return;
      const ans=ws[i].replace(/[^A-Za-z']/g,''); const others=shuf(keys.filter(k=>k!==ans.toLowerCase()),r).slice(0,2); const m=mcFrom(ans,others);
      B.push({t:'mc',q:ws.map((w,j)=>j===i?w.replace(/[A-Za-z']+/,'_____'):w).join(' '),...m}); }); });
  return B;
}
/* ---------- build an exam (deterministic per unit + version) ---------- */
function build(n, ver, sp){
  if(sp===undefined) sp=true;   // 🎤 speaking part G (in-app only); print / online files use the classic 50-point layout
  const u=UNITS[n-1], L=LESSONS[n], r=rng(hashStr('exam-'+n+'-'+ver));
  const emo = w => (u.emoji||{})[w.toLowerCase()] || (u.emoji||{})[w.toLowerCase().replace(/^(a|an|the) /,'')] || '';
  const pool = u.vocab.filter(v=>v[0] && !/[→↔\/]/.test(v[0]) && v[2]);
  const words = pool.filter(v=>!/[?!.]$/.test(v[0]) && v[0].split(' ').length<=3);
  const used = new Set();
  const take = (arr,k,f) => { const out=[]; for(const v of shuf(arr,r)){ if(out.length>=k) break; if(used.has(v[0])||(f&&!f(v))) continue; used.add(v[0]); out.push(v); } return out; };
  const distract = (v,key,k) => shuf(pool.filter(x=>x[0]!==v[0] && x[key]!==v[key] && (!v[1]||!x[1]||x[1]===v[1]||r()<.3)),r).slice(0,k).map(x=>x[key]);
  const mcFrom = (ans, others) => { const o=shuf([ans,...others],r); return {opts:o, a:o.indexOf(ans)}; };
  const parts=[];
  // A — Vocabulary (10): half EN→KM, half KM→EN (picture when available)
  const A=take(words,10).map((v,i)=>{ if(i%2===0){ const m=mcFrom(v[2],distract(v,2,3)); return {t:'mc',q:v[0],say:v[0],em:emo(v[0]),kmOpts:true,...m}; }
    const m=mcFrom(v[0],distract(v,0,3)); return {t:'mc',q:v[2],km:true,em:emo(v[0]),...m}; });
  parts.push({id:'A',km:'វាក្យសព្ទ',en:'Vocabulary',ins:'Choose the correct answer.',insKm:'ជ្រើសចម្លើយត្រឹមត្រូវ។',pts:1,qs:A});
  // B — Grammar (10): unit quiz + correct-sentence + gap from examples
  const B=grammarItems(n, r);
  parts.push({id:'B',km:(window.COURSE&&COURSE.sg)?'សំឡេង Phonics':'វេយ្យាករណ៍',en:(window.COURSE&&COURSE.sg)?'Phonics':'Grammar',ins:'Choose the correct answer.',insKm:'ជ្រើសចម្លើយត្រឹមត្រូវ។',pts:1,qs:shuf(B,r).slice(0,10)});
  // C — Matching (8)
  const C=take(words,sp?6:8); const right=shuf(C.map(v=>v[2]),r);
  parts.push({id:'C',km:'ផ្គូផ្គង',en:'Matching',ins:'Match the English words with the Khmer meanings.',insKm:'ផ្គូផ្គងពាក្យអង់គ្លេសជាមួយន័យខ្មែរ។',pts:1,
    qs:C.map(v=>({t:'match',q:v[0],a:right.indexOf(v[2])})), right});
  // D — Listening (6): hear a word / phrase, choose it
  const phr=[].concat(...L.sections.map(s=>s.ph||[])).filter(p=>p[0].split(' ').length<=7 && !/[→=\/…]|\.\.\.|^[A-Z ]+$|\bp\b|£|\$/.test(p[0]));
  const D=take(words,4).map(v=>{ const m=mcFrom(v[0],distract(v,0,3)); return {t:'mc',listen:true,say:clean(v[0]),...m}; });
  shuf(phr,r).slice(0,2).forEach(p=>{ const others=shuf(phr.filter(x=>x!==p),r).slice(0,2).map(x=>clean(x[0])); if(others.length<2) return; const m=mcFrom(clean(p[0]),others); D.push({t:'mc',listen:true,say:clean(p[0]),...m}); });
  while(D.length<6){ const v=take(words,1)[0]; if(!v) break; const m=mcFrom(v[0],distract(v,0,3)); D.push({t:'mc',listen:true,say:clean(v[0]),...m}); }
  parts.push({id:'D',km:'ស្តាប់',en:'Listening',ins:'Listen and choose what you hear.',insKm:'ស្តាប់ ហើយជ្រើសអ្វីដែលអ្នកឮ។',pts:1,qs:D});
  // E — Writing (8): Khmer → English word
  const E=take(words,sp?6:8,v=>clean(v[0]).length<=16).map(v=>({t:'write',q:v[2],em:emo(v[0]),a:clean(v[0])}));
  parts.push({id:'E',km:'សរសេរ',en:'Writing',ins:'Write the English word.',insKm:'សរសេរពាក្យជាភាសាអង់គ្លេស។',pts:1,qs:E});
  // F — Sentence order (4 × 2)
  const sents=[].concat(...L.grammar.map(g=>g.ex)).map(s=>s.replace(/\(.*?\)/g,'').replace(/\s*—.*$/,'').replace(/[→=].*$/,'').trim()).filter(s=>{ const k=s.split(' ').length; return k>=3&&k<=8; });
  const F=shuf([...new Set(sents)],r).slice(0,sp?3:4).map(s=>{ const ws=s.replace(/[.?!]$/,'').split(' '); let sh=shuf(ws,r); if(sh.join(' ')===ws.join(' ')) sh=sh.reverse(); return {t:'order',words:sh,a:s,end:(s.match(/[.?!]$/)||['.'])[0]}; });
  parts.push({id:'F',km:'រៀបប្រយោគ',en:'Sentence order',ins:'Put the words in the correct order.',insKm:'រៀបពាក្យឱ្យទៅជាប្រយោគត្រឹមត្រូវ។',pts:2,qs:F});
  // G — Speaking (3 × 2): say a word • listen & repeat • read a sentence  (checked instantly by speech recognition)
  if(sp){ const need=t=>{ const k=normA(t).split(' ').filter(w=>w&&!/^(a|an|the)$/.test(w)).length; return k<=2?100:k<=6?80:75; };
    const w=take(words,1,v=>clean(v[0]).split(' ').length<=2&&!/[?!]/.test(v[0]))[0], ph=shuf(phr.filter(p=>p[0].split(' ').length>=2&&p[0].split(' ').length<=6),r)[0], se=shuf(sents.filter(x=>!/[?]$/.test(x)||1),r).find(x=>!F.some(f=>f.a===x))||sents[0];
    const G=[]; if(w){ const t=clean(w[0]).replace(/^(a|an|the) /i,''); G.push({t:'speak',mode:'say',text:t,km:w[2],em:emo(w[0]),need:need(t)}); }
    if(ph) G.push({t:'speak',mode:'repeat',text:clean(ph[0]),km:'',need:need(clean(ph[0]))});
    if(se) G.push({t:'speak',mode:'read',text:se,km:'',need:need(se)});
    if(G.length===3) parts.push({id:'G',km:'និយាយ',en:'Speaking',ins:'Speak into the microphone.',insKm:'ចុច 🎤 ហើយនិយាយ (សាកបាន ៣ ដង • យកលើកល្អបំផុត)។',pts:2,qs:G});
    else { C.length&&0; } }
  const total=parts.reduce((a,p)=>a+p.pts*p.qs.length,0);
  return {n, ver, id:`U${n}${ver}`, title:`Unit ${n} Test — ${u.en}`, km:u.km, parts, total};
}

/* ---------- scoring ---------- */
function score(ex, ans){
  let s=0; const by={};
  ex.parts.forEach(p=>{ let ps=0; p.qs.forEach((q,i)=>{ const a=(ans[p.id]||{})[i]; let ok=false;
      if(q.t==='mc'||q.t==='match') ok = a!==undefined && a!==null && +a===q.a;
      else if(q.t==='write') ok = a && normA(a)===normA(q.a);
      else if(q.t==='order') ok = a && normA(a)===normA(q.a);
      else if(q.t==='speak') ok = a!=null && a!=='' && +a>=q.need;
      if(ok) ps+=p.pts; });
    by[p.id]=ps; s+=ps; });
  return {s, by, pct: Math.round(s/ex.total*100)};
}

/* ---------- unit tab UI ---------- */
/* ---------- 🔓 exam sessions: teacher/admin opens an exam for a class ---------- */
const meStu = () => { const me=window.Auth&&Auth.user(); return me&&me.role==='student'?me:null; };
function sessDone(se, me){ return X.results.find(r=>r.sess===se.id && (r.uid===me.id || (r.sid&&r.sid===me.studentId))); }
function uniqOpen(list){ const m=new Map(); (list||[]).forEach(se=>{ const k=se.n+'|'+se.cls, o=m.get(k); if(!o || se.ts>o.ts) m.set(k,se); }); return [...m.values()]; }
function cleanOpen(){ const u=uniqOpen(X.open); if(u.length!==(X.open||[]).length){ X.open=u; saveX(); } }
function openFor(me){ return uniqOpen((X.open||[]).filter(se=>se.cls===me.classId)); }
function classes(){ const C=(window.Class&&Class.data())||{classes:[]}; return C.classes.filter(c=>!window.Auth||!Auth.user()||Auth.canSeeClass(c)); }
function openPanel(u){
  cleanOpen(); const cs=classes(), list=(X.open||[]).filter(se=>se.n===u.n && cs.some(c=>c.id===se.cls));
  return `<div class="panel ex-gate"><div class="row" style="justify-content:space-between"><h3 class="sec" style="margin:0">🔓 បើកឱ្យសិស្សប្រឡង (លើទូរស័ព្ទ/App របស់សិស្ស)</h3><span class="note">សិស្សមើលមិនឃើញប្រឡងទេ រហូតដល់គ្រូបើក</span></div>
    ${cs.length?`<div class="row" style="margin:10px 0;align-items:end">
      <label class="km">🏫 ថ្នាក់<select id="exoC" class="cl-in">${cs.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label>
      <label class="km">Version<select id="exoV" class="cl-in"><option>A</option><option>B</option></select></label>
      <label class="km">⏱ នាទី<input id="exoM" type="number" class="cl-in" style="width:70px" min="0" max="180" value="${X.settings.minutes}"></label>
      <label class="km" style="display:flex;gap:6px;align-items:center"><input id="exoOnce" type="checkbox" checked> ធ្វើបានតែម្តង</label>
      <button class="btn teal" onclick="Exam.openSess(${u.n})">🔓 បើកប្រឡង</button></div>`:'<p class="note">មិនទាន់មានថ្នាក់</p>'}
    ${list.length?list.map(se=>{ const c=cs.find(x=>x.id===se.cls)||{name:'?',students:[]}; const done=X.results.filter(r=>r.sess===se.id); const ids=new Set(done.map(r=>r.sid));
      return `<div class="ex-sess"><span class="live">● កំពុងបើក</span><b>Unit ${se.n} • Version ${se.ver}</b><span>🏫 ${esc(c.name)} • ⏱ ${se.min?se.min+' នាទី':'គ្មានកំណត់'} • ${se.once?'ម្តង':'ច្រើនដង'}</span>
        <span class="cnt">✅ ${ids.size}/${c.students.length} បានប្រឡង</span><button class="btn sm ghost" style="color:#dc2626" onclick="Exam.closeSess('${se.id}')">⛔ បិទ</button></div>`; }).join(''):''}
  </div>`;
}
function openSess(n){
  const se={id:Math.random().toString(36).slice(2,10), n, ver:$('#exoV').value, cls:$('#exoC').value, min:+$('#exoM').value||0, once:$('#exoOnce').checked, ts:Date.now(), by:(window.Auth&&Auth.user()&&Auth.user().name)||''};
  X.open=(X.open||[]).filter(x=>!(x.n===n && x.cls===se.cls)); X.open.push(se); saveX(); if(window.Notify) Notify.task(se.cls, `ប្រឡង Unit ${n} បើកហើយ`, 'ចូល 📝 កិច្ចការ ដើម្បីចាប់ផ្តើមប្រឡង • សំណាងល្អ! 🍀'); toast('🔓 បានបើកប្រឡង Unit '+n+' — សិស្សអាចចូលប្រឡងបានហើយ'); render();
}
function closeSess(id){ if(!confirm('បិទប្រឡងនេះ? សិស្សនឹងមិនអាចចូលប្រឡងទៀតទេ')) return; const se=(X.open||[]).find(x=>x.id===id); X.open=(X.open||[]).filter(x=>x.id!==id && !(se && x.n===se.n && x.cls===se.cls)); saveX(); toast('⛔ បានបិទ'); render(); }
let lastRef=0;
async function studentPage(refresh){
  const me=meStu(); if(!me) return;
  if(window.Cloud && Cloud.refresh && (refresh || Date.now()-lastRef>15000)){ lastRef=Date.now(); $('#main').innerHTML='<div class="stu-empty"><div class="spin2"></div><p>កំពុងពិនិត្យប្រឡងថ្មីៗ…</p></div>'; try{ await Promise.all([Cloud.refresh(EK), window.WS?Cloud.refresh(WS.key):0]); }catch(e){} reloadX(); if(window.WS) WS.reload(); if(typeof stuNav==='function') stuNav(); if(view.name!=='exams') return; }
  const list=openFor(me).sort((a,b)=>a.n-b.n);
  const mine=X.results.filter(r=>r.uid===me.id||(r.sid&&r.sid===me.studentId)).sort((a,b)=>b.ts-a.ts);
  setUnitColors(4);
  $('#main').innerHTML=`<div class="stu-head"><h2>📝 កិច្ចការ</h2><button class="btn ghost sm" onclick="Exam.studentPage(true)">🔄</button></div>
    <h3 class="stu-sub">📝 ប្រឡង</h3>${list.length?list.map(se=>{ const u=UNITS[se.n-1], st=UNIT_STYLE[se.n], d=sessDone(se,me), can=!d||!se.once;
      return `<div class="stu-exam" style="--c1:${st.c1};--c2:${st.c2}"><div class="ic">${st.icon}</div><div class="tx"><b>Unit ${se.n} • ${esc(u.en)}</b><span>50 ពិន្ទុ • ${se.min?'⏱ '+se.min+' នាទី':'គ្មានកំណត់ពេល'}</span>
        ${d?`<span class="dn">✅ បានប្រឡង • ${d.s}/${d.t} (${d.pct}%)</span>`:''}</div>
        ${can?`<button class="btn sun" onclick="Exam.start(${se.n},'${se.ver}','${se.id}')">▶ ${d?'ម្តងទៀត':'ចាប់ផ្តើម'}</button>`:'<span class="lock">🔒</span>'}</div>`; }).join('')
      :`<div class="stu-empty sm"><div style="font-size:40px">🔒</div><b>មិនទាន់មានប្រឡងបើកទេ</b><p>ពេលគ្រូបើក វានឹងបង្ហាញនៅទីនេះ។ ចុច 🔄 ដើម្បីពិនិត្យម្តងទៀត។</p></div>`}
    ${window.WS?WS.studentSection():''}
    ${mine.length?`<h3 class="stu-sub">📊 លទ្ធផលរបស់ខ្ញុំ</h3>${mine.map(r=>`<div class="stu-res"><b>Unit ${r.n}</b><span>${new Date(r.ts).toLocaleDateString('en-GB')}</span><em style="background:${r.pct>=80?'#16a34a':r.pct>=50?'#2563eb':'#dc2626'}">${r.s}/${r.t} • ${r.pct}%</em></div>`).join('')}`:''}`;
}

function tab(u){
  if(meStu()){ go('exams'); return; }
  const teach = S.mode==='teach', me=window.Auth&&Auth.user(), mySids=me&&me.role==='teacher'?new Set(classes().flatMap(c=>c.students.map(s=>s.id))):null, res=X.results.filter(r=>r.n===u.n && (!me||me.role==='admin'||(me.role==='teacher'?mySids.has(r.sid):(r.uid===me.id||(r.sid&&r.sid===me.studentId))))).sort((a,b)=>b.ts-a.ts);
  const ex=build(u.n,'A');
  $('#tab').innerHTML = (teach?openPanel(u):'') + `<div class="ex-hero panel">
    <div class="ex-hi"><div class="ex-ico">📝</div><div><h3 class="sec" style="margin:0">ប្រឡងបញ្ចប់មេរៀន Unit ${u.n} — ${esc(u.en)}</h3>
      <div class="note">${ex.total} ពិន្ទុ • ${ex.parts.length} ផ្នែក • ${ex.parts.reduce((a,p)=>a+p.qs.length,0)} សំណួរ • ពេល ${X.settings.minutes} នាទី</div></div></div>
    <div class="ex-parts">${ex.parts.map(p=>`<div><b>${p.id}</b><span>${p.km}</span><i>${p.qs.length*p.pts}</i></div>`).join('')}</div>
  </div>
  <div class="ex-modes">
    <div class="ex-mode"><div class="em">💻</div><b>ប្រឡងក្នុង App</b><p>សិស្សធ្វើលើកុំព្យូទ័រនេះ — ពិន្ទុគណនាភ្លាមៗ ហើយរក្សាទុកក្នុងលទ្ធផល</p>
      <div class="row"><button class="btn teal" onclick="Exam.start(${u.n},'A')">▶ Version A</button><button class="btn ghost" onclick="Exam.start(${u.n},'B')">▶ Version B</button></div></div>
    ${teach?`<div class="ex-mode"><div class="em">🖨</div><b>បោះពុម្ពជាក្រដាស</b><p>A4 មានក្បាលប្រឡង • Version A/B (លំដាប់ខុសគ្នា) • សន្លឹកចម្លើយ • អត្ថបទស្តាប់សម្រាប់គ្រូអាន</p>
      <div class="row"><button class="btn sun" onclick="Exam.print(${u.n},'A')">🖨 A</button><button class="btn sun" onclick="Exam.print(${u.n},'B')">🖨 B</button><button class="btn ghost" onclick="Exam.print(${u.n},'AB')">🖨 A + B</button></div></div>
    <div class="ex-mode"><div class="em">🌐</div><b>ប្រឡង Online</b><p>ទាញយកឯកសារ HTML មួយ ផ្ញើតាម Telegram — សិស្សបើកលើទូរស័ព្ទ ធ្វើប្រឡង ហើយផ្ញើ «កូដលទ្ធផល» មកគ្រូវិញ</p>
      <div class="row"><button class="btn" onclick="Exam.online(${u.n},'A')">⬇ HTML (A)</button><button class="btn ghost" onclick="Exam.online(${u.n},'B')">⬇ (B)</button><button class="btn ghost" onclick="Exam.importCodes()">📥 បញ្ចូលកូដលទ្ធផល</button></div></div>`:''}
  </div>
  ${teach?`<div class="panel" style="margin-top:14px"><div class="row" style="justify-content:space-between"><h3 class="sec" style="margin:0">⚙️ ការកំណត់</h3></div>
    <div class="row"><label class="km">⏱ រយៈពេល <input type="number" min="0" max="180" class="cl-in" style="width:70px" value="${X.settings.minutes}" onchange="Exam.setting('minutes',+this.value)"> នាទី (0 = គ្មានកំណត់)</label>
    <label class="km">🏫 ឈ្មោះសាលា <input class="cl-in" style="width:260px" value="${esc(X.settings.school)}" onchange="Exam.setting('school',this.value)"></label></div></div>`:''}
  <div class="panel" style="margin-top:14px">
    <div class="row" style="justify-content:space-between"><h3 class="sec" style="margin:0">📊 លទ្ធផលប្រឡង Unit ${u.n} (${res.length})</h3>
      ${teach&&res.length?`<div class="row"><button class="btn ghost sm" onclick="Exam.toScores(${u.n})">➡️ បញ្ចូលទៅពិន្ទុខែ</button><button class="btn ghost sm" onclick="Exam.csv(${u.n})">📊 Excel</button><button class="btn ghost sm" onclick="Exam.clear(${u.n})">🗑</button></div>`:''}</div>
    ${res.length?`<div class="cl-tablewrap"><table class="cl-table res"><thead><tr><th class="l">ឈ្មោះ</th><th>Ver</th>${ex.parts.map(p=>`<th>${p.id}<small>${p.km}</small></th>`).join('')}<th>សរុប<small>/${ex.total}</small></th><th>%</th><th>របៀប</th><th>ថ្ងៃ</th></tr></thead>
      <tbody>${res.map(r=>`<tr><td class="l"><b>${esc(r.name)}</b></td><td>${r.ver}</td>${ex.parts.map(p=>`<td>${r.by?(r.by[p.id]??'—'):'—'}</td>`).join('')}<td class="tot">${r.s}</td><td><span class="gr" style="background:${r.pct>=80?'#16a34a':r.pct>=50?'#2563eb':'#dc2626'}">${r.pct}%</span></td><td>${r.via==='online'?'🌐':'💻'}</td><td>${new Date(r.ts).toLocaleDateString('en-GB')}</td></tr>`).join('')}</tbody></table></div>`
      :`<p class="note">មិនទាន់មានលទ្ធផលទេ</p>`}
  </div>`;
}

/* ---------- in-app exam ---------- */
let RUN=null;
async function start(n, ver, sessId){
  if(window.Auth&&Auth.asStaff&&Auth.asStaff()) return toast('👁 គ្រូកំពុងមើល — មិនអាចប្រឡងជំនួសសិស្សបានទេ');
  if(meStu() && window.Cloud && Cloud.refresh){ try{ await Cloud.refresh(EK); }catch(e){} reloadX(); }
  if(meStu()){ const se=(X.open||[]).find(x=>x.id===sessId && x.cls===meStu().classId); if(!se){ toast('🔒 គ្រូបានបិទប្រឡងនេះហើយ'); studentPage(); return; } if(se.once && sessDone(se,meStu())) return toast('✅ អ្នកបានប្រឡងរួចហើយ'); }
  const me=window.Auth&&Auth.user();
  if(me&&me.role==='student'){ const ex0=build(n,ver), se0=(X.open||[]).find(x=>x.id===sessId)||{}; modal(`<h3>📝 ${esc(ex0.title)} • Version ${ver}</h3><p class="km">👤 ${esc(me.name)} • ${ex0.total} ពិន្ទុ • ${se0.min?se0.min+' នាទី':'គ្មានកំណត់ពេល'}</p><p class="note">សូមត្រៀមខ្លួន ហើយធ្វើដោយខ្លួនឯង 💪</p><div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn ghost" onclick="closeModal()">បោះបង់</button><button class="btn teal" onclick="Exam.begin(${n},'${ver}','${sessId||''}')">▶ ចាប់ផ្តើមប្រឡង</button></div>`); return; }
  const ex=build(n,ver), st=(window.Class&&Class.studentsForPicker())||[];
  modal(`<h3>📝 ${esc(ex.title)} • Version ${ver}</h3>
    <p class="km">${ex.total} ពិន្ទុ • ${X.settings.minutes?X.settings.minutes+' នាទី':'គ្មានកំណត់ពេល'}</p>
    <label class="km" style="display:block;margin:10px 0 4px">👤 ឈ្មោះសិស្ស</label>
    ${st.length?`<select id="exWho" class="cl-in" style="width:100%"><option value="">— ជ្រើសឈ្មោះ —</option>${st.map(s=>`<option value="${s.id}">${esc(s.name)}${s.latin?' — '+esc(s.latin):''}</option>`).join('')}</select><p class="note">ឬវាយឈ្មោះ៖</p>`:''}
    <input id="exName" class="cl-in" style="width:100%" placeholder="ឈ្មោះ">
    <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn ghost" onclick="closeModal()">បោះបង់</button><button class="btn teal" onclick="Exam.begin(${n},'${ver}')">▶ ចាប់ផ្តើមប្រឡង</button></div>`);
}
function begin(n, ver, sessId){
  const sel=$('#exWho'), st=(window.Class&&Class.studentsForPicker())||[], me=window.Auth&&Auth.user();
  const s = me&&me.role==='student' ? {id:me.studentId, name:me.name} : sel && sel.value ? st.find(x=>x.id===sel.value) : null;
  const name = s ? s.name : ($('#exName').value.trim());
  if(!name) return toast('សូមជ្រើស ឬវាយឈ្មោះសិស្ស');
  closeModal();
  const se=sessId?(X.open||[]).find(x=>x.id===sessId):null;
  RUN={ex:build(n,ver,!!(window.Voice&&Voice.ok())), ans:{}, name, sid:s?s.id:null, t0:Date.now(), part:0, sess:sessId||null, min:se?se.min:X.settings.minutes};
  const el=document.createElement('div'); el.id='exam'; document.body.appendChild(el); document.body.classList.add('exam-open');
  el.innerHTML = examShell(RUN.ex, name, false);
  wireExam(el, RUN, ()=>finish());
  if(RUN.min) startTimer(RUN.min);
}
function startTimer(min){ const end=RUN.t0+min*60000; const tick=()=>{ if(!RUN) return; const left=Math.max(0,end-Date.now()), m=Math.floor(left/60000), sec=Math.floor(left%60000/1000), el=$('#exTime'); if(el){ el.textContent=`⏱ ${m}:${String(sec).padStart(2,'0')}`; el.classList.toggle('warn',left<60000); } if(left<=0){ toast('⏰ អស់ម៉ោង — ប្រគល់ដោយស្វ័យប្រវត្តិ'); finish(true); return; } RUN.timer=setTimeout(tick,500); }; tick(); }

/* shared exam renderer (also embedded in the online HTML) */
function examShell(ex, name, online){
  return `<div class="ex-top"><div><b>📝 ${esc(ex.title)}</b><span>Version ${ex.ver} • ${esc(name)}</span></div><span class="grow"></span><span id="exTime"></span><span id="exProg">0 / ${ex.parts.reduce((a,p)=>a+p.qs.length,0)}</span>${online?'':`<button class="ex-x" onclick="Exam.quit()">✕</button>`}</div>
  <div class="ex-nav">${ex.parts.map((p,i)=>`<button data-go="${i}" class="${i===0?'on':''}"><b>${p.id}</b> ${p.km}</button>`).join('')}</div>
  <div class="ex-body">${ex.parts.map((p,pi)=>`<section class="ex-part ${pi===0?'on':''}" data-part="${pi}">
    <h2><span>${p.id}</span>${p.km} • ${p.en} <small>${p.qs.length*p.pts} ពិន្ទុ</small></h2><p class="ex-ins">${p.insKm} <i>${p.ins}</i></p>${p.id==='D'?`<div class="ex-audio">🔊 បើកសំឡេងទូរស័ព្ទ (Volume) រួចចុច <b>🔊 Listen</b> — ស្តាប់បានច្រើនដង។ <button class="ex-play" data-say="Hello! Can you hear me?">▶ សាកល្បងសំឡេង</button><small>មិនឮ? សូមបើកតាម Google Chrome (មិនមែនក្នុង Telegram ឬ Facebook)</small></div>`:''}
    ${p.id==='C'?`<div class="ex-match">${p.qs.map((q,i)=>`<div class="ex-mrow"><b>${i+1}. ${esc(q.q)}</b><select data-p="C" data-i="${i}"><option value="">—</option>${p.right.map((r,k)=>`<option value="${k}">${String.fromCharCode(97+k)}. ${esc(r)}</option>`).join('')}</select></div>`).join('')}</div>`:
    p.qs.map((q,i)=>{
      if(q.t==='speak') return `<div class="ex-q ex-sp" data-p="${p.id}" data-i="${i}"><div class="qq"><span class="n">${i+1}</span><b>${['🗣 និយាយពាក្យនេះជាអង់គ្លេស','🎧 ស្តាប់ ហើយនិយាយតាម','📖 អានប្រយោគនេះឱ្យឮៗ'][['say','repeat','read'].indexOf(q.mode)]}</b></div>${window.Voice?Voice.card('ex'+p.id+i, {...q, noSkip:true, exam:true}, r=>{ if(window.Exam&&Exam._sp) Exam._sp(p.id,i,r); }):''}</div>`;
      if(q.t==='mc') return `<div class="ex-q" data-p="${p.id}" data-i="${i}"><div class="qq"><span class="n">${i+1}</span>${q.listen?`<button class="ex-play" data-say="${esc(q.say)}">🔊 Listen</button>`:`${q.em?`<span class="em">${q.em}</span>`:''}<span class="${q.km?'km':''}">${esc(q.qKm?q.q+' • '+q.qKm:q.q).replace('_____','<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>')}</span>${q.say&&!q.listen?`<button class="ex-say" data-say="${esc(q.say)}">🔊</button>`:''}`}</div>
        <div class="oo">${q.opts.map((o,k)=>`<label class="${q.kmOpts?'km':''}"><input type="radio" name="${p.id}${i}" value="${k}"><span>${String.fromCharCode(65+k)}</span>${esc(o)}</label>`).join('')}</div></div>`;
      if(q.t==='write') return `<div class="ex-q" data-p="${p.id}" data-i="${i}"><div class="qq"><span class="n">${i+1}</span>${q.em?`<span class="em">${q.em}</span>`:''}<span class="km">${esc(q.q)}</span></div><input class="ex-in" data-p="${p.id}" data-i="${i}" autocomplete="off" spellcheck="false" placeholder="English…"></div>`;
      return `<div class="ex-q ex-ord" data-p="${p.id}" data-i="${i}"><div class="qq"><span class="n">${i+1}</span><span class="ex-built" data-i="${i}"></span><span class="end">${q.end}</span><button class="ex-undo" data-i="${i}">↶</button></div>
        <div class="ex-chips">${q.words.map((w,k)=>`<button data-k="${k}" data-i="${i}">${esc(w)}</button>`).join('')}</div></div>`;
    }).join('')}
    <div class="ex-pnav">${pi>0?`<button data-go="${pi-1}" class="ex-b ghost">◀ ${ex.parts[pi-1].km}</button>`:'<span></span>'}${pi<ex.parts.length-1?`<button data-go="${pi+1}" class="ex-b">${ex.parts[pi+1].km} ▶</button>`:`<button class="ex-b sun" data-submit="1">✅ ប្រគល់ប្រឡង</button>`}</div>
  </section>`).join('')}</div>`;
}
function wireExam(root, run, onSubmit){
  const ex=run.ex, total=ex.parts.reduce((a,p)=>a+p.qs.length,0);
  const set=(p,i,v)=>{ (run.ans[p]=run.ans[p]||{})[i]=v; prog(); };
  const prog=()=>{ let k=0; ex.parts.forEach(p=>p.qs.forEach((q,i)=>{ const v=(run.ans[p.id]||{})[i]; if(v!==undefined&&v!==''&&v!==null) k++; })); const el=root.querySelector('#exProg'); if(el) el.textContent=`${k} / ${total}`;
    root.querySelectorAll('.ex-nav button').forEach((b,pi)=>{ const p=ex.parts[pi]; const done=p.qs.every((q,i)=>{ const v=(run.ans[p.id]||{})[i]; return v!==undefined&&v!==''&&v!==null; }); b.classList.toggle('done',done); }); };
  const go=i=>{ root.querySelectorAll('.ex-part').forEach((s,k)=>s.classList.toggle('on',k===+i)); root.querySelectorAll('.ex-nav button').forEach((b,k)=>b.classList.toggle('on',k===+i)); root.querySelector('.ex-body').scrollTop=0; window.scrollTo(0,0); };
  const sayIt=t=>{ if(window.TTS) return TTS.say(t,.85); try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); const v=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang)); const pv=v.find(x=>/en-GB/i.test(x.lang))||v[0]; if(pv){u.voice=pv;u.lang=pv.lang;} else u.lang='en-GB'; u.rate=.85; speechSynthesis.speak(u); }catch(e){} };
  root.addEventListener('click',e=>{
    const g=e.target.closest('[data-go]'); if(g){ go(g.dataset.go); return; }
    const sb=e.target.closest('[data-submit]'); if(sb){ onSubmit(); return; }
    const sp=e.target.closest('[data-say]'); if(sp){ e.preventDefault(); sayIt(sp.dataset.say); sp.classList.add('ping'); setTimeout(()=>sp.classList.remove('ping'),400); const q=sp.closest('.ex-q'); if(q){ const c=(run.plays=run.plays||{}); c[q.dataset.p+q.dataset.i]=(c[q.dataset.p+q.dataset.i]||0)+1; } return; }
    const chip=e.target.closest('.ex-chips button'); if(chip && !chip.disabled){ const i=+chip.dataset.i, q=ex.parts.find(p=>p.id==='F').qs[i]; const st=(run.ord=run.ord||{}); st[i]=(st[i]||[]).concat(+chip.dataset.k); chip.disabled=true; drawOrd(i); return; }
    const un=e.target.closest('.ex-undo'); if(un){ const i=+un.dataset.i, st=(run.ord=run.ord||{}); const k=(st[i]||[]).pop(); if(k!==undefined){ const b=root.querySelector(`.ex-chips button[data-i="${i}"][data-k="${k}"]`); if(b) b.disabled=false; } drawOrd(i); }
  });
  const drawOrd=i=>{ const q=ex.parts.find(p=>p.id==='F').qs[i], ks=(run.ord||{})[i]||[]; const s=ks.map(k=>q.words[k]).join(' '); root.querySelector(`.ex-built[data-i="${i}"]`).textContent=s||'…'; set('F',i, ks.length===q.words.length ? s+q.end : (ks.length?s:'')); };
  root.addEventListener('change',e=>{ const t=e.target;
    if(t.type==='radio'){ const q=t.closest('.ex-q'); set(q.dataset.p,+q.dataset.i,+t.value); q.classList.add('answered'); }
    if(t.tagName==='SELECT'){ set('C',+t.dataset.i, t.value===''?null:+t.value); }
  });
  root.addEventListener('input',e=>{ const t=e.target; if(t.classList.contains('ex-in')) set(t.dataset.p,+t.dataset.i,t.value); });
  ex.parts.forEach((p,pi)=>{ if(p.id==='F') p.qs.forEach((q,i)=>drawOrd(i)); });
  run._set=set; prog();
}
function finish(force){
  if(!RUN) return;
  const ex=RUN.ex, total=ex.parts.reduce((a,p)=>a+p.qs.length,0); let k=0; ex.parts.forEach(p=>p.qs.forEach((q,i)=>{ const v=(RUN.ans[p.id]||{})[i]; if(v!==undefined&&v!==''&&v!==null) k++; }));
  if(!force && k<total && !confirm(`នៅសល់ ${total-k} សំណួរមិនទាន់ឆ្លើយ។ ប្រគល់ប្រឡងឥឡូវ?`)) return;
  clearTimeout(RUN.timer);
  const sc=score(ex,RUN.ans);
  X.results.push({n:ex.n, ver:ex.ver, name:RUN.name, sid:RUN.sid, sess:RUN.sess, uid:(window.Auth&&Auth.user()&&Auth.role()==='student')?Auth.user().id:null, s:sc.s, t:ex.total, pct:sc.pct, by:sc.by, ts:Date.now(), via:'app', mins:Math.round((Date.now()-RUN.t0)/60000)}); if(window.earn) earn(`exam:${RUN.sess||ex.n}`, Math.min(3000, Math.round(sc.pct/10)*300), `ប្រឡង Unit ${ex.n} (${sc.pct}%)`);
  saveX();
  $('#exam').innerHTML = resultHtml(ex, RUN.ans, sc, RUN.name, false);
  if(sc.pct>=80 && window.pageConfetti) pageConfetti();
}
function resultHtml(ex, ans, sc, name, online, code){
  const g = sc.pct>=90?['🏆','ល្អប្រសើរ!']:sc.pct>=80?['🌟','ល្អណាស់!']:sc.pct>=65?['👍','ល្អ!']:sc.pct>=50?['🙂','ជាប់']:['💪','ព្យាយាមម្តងទៀត'];
  return `<div class="ex-top"><div><b>📝 ${esc(ex.title)}</b><span>Version ${ex.ver} • ${esc(name)}</span></div><span class="grow"></span>${online?'':`<button class="ex-x" onclick="Exam.quit()">✕</button>`}</div>
  <div class="ex-body"><div class="ex-res">
    <div class="ex-medal">${g[0]}</div><div class="ex-score">${sc.s}<small>/${ex.total}</small></div><div class="ex-pct">${sc.pct}% • ${g[1]}</div>
    <div class="ex-bars">${ex.parts.map(p=>{ const mx=p.qs.length*p.pts, v=sc.by[p.id]; return `<div><span>${p.id} ${p.km}</span><i><b style="width:${v/mx*100}%"></b></i><em>${v}/${mx}</em></div>`; }).join('')}</div>
    ${code?`<div class="ex-code"><p>📤 ផ្ញើកូដនេះទៅគ្រូ (ចម្លង ឬថតអេក្រង់)</p><textarea readonly onclick="this.select()">${code}</textarea><div class="row" style="justify-content:center"><button class="ex-b" onclick="navigator.clipboard&&navigator.clipboard.writeText(document.querySelector('.ex-code textarea').value);this.textContent='✅ បានចម្លង'">📋 ចម្លងកូដ</button><a class="ex-b sun" target="_blank" href="https://t.me/share/url?url=${encodeURIComponent(' ')}&text=${encodeURIComponent(code)}">✈️ ផ្ញើតាម Telegram</a></div></div>`:''}
  </div>
  <h3 class="ex-rv">🔍 ពិនិត្យចម្លើយ</h3>
  ${ex.parts.map(p=>`<div class="ex-review"><h4>${p.id}. ${p.km} • ${p.en} — ${sc.by[p.id]}/${p.qs.length*p.pts}</h4>${p.qs.map((q,i)=>{ const a=(ans[p.id]||{})[i];
    let mine='—', right='', ok=false;
    if(q.t==='mc'){ mine=a!=null&&a!==''?q.opts[a]:'—'; right=q.opts[q.a]; ok=+a===q.a&&a!==null&&a!==undefined&&a!==''; }
    else if(q.t==='match'){ mine=a!=null?p.right[a]:'—'; right=p.right[q.a]; ok=+a===q.a&&a!=null; }
    else if(q.t==='speak'){ mine=a!=null&&a!==''?a+'%':'—'; right=q.text+' (≥'+q.need+'%)'; ok=a!=null&&a!==''&&+a>=q.need; }
    else { mine=a||'—'; right=q.a; ok=a&&normA(a)===normA(q.a); }
    const qtxt = q.t==='speak'?'🎤 '+q.text : q.t==='match'?q.q : q.listen?'🔊 '+q.say : q.t==='order'?q.words.join(' / ') : (q.qKm?q.q:q.q);
    return `<div class="ex-rr ${ok?'ok':'no'}"><span>${ok?'✅':'❌'}</span><div><div class="km">${i+1}. ${esc(qtxt)}</div><small>${ok?esc(mine):`<s>${esc(mine)}</s> → <b>${esc(right)}</b>`}</small></div></div>`; }).join('')}</div>`).join('')}
  </div>`;
}
function quit(){ if(RUN && !$('.ex-res') && !confirm('ចាកចេញពីប្រឡង? ចម្លើយនឹងមិនត្រូវបានរក្សាទុកទេ។')) return; if(RUN) clearTimeout(RUN.timer); RUN=null; const el=$('#exam'); if(el) el.remove(); document.body.classList.remove('exam-open'); speechSynthesis.cancel(); if(window.render) render(); }

/* ---------- print (paper test) ---------- */
function paper(ex, school){
  const u=UNITS[ex.n-1];
  return `<div class="exp">
    <div class="exp-head"><div><b>${esc(school||'')}</b><br>Beginner English</div><div class="t"><h1>END-OF-UNIT TEST — UNIT ${ex.n}</h1><div>ប្រឡងបញ្ចប់មេរៀនទី ${ex.n} • ${esc(u.en)} — ${u.km}</div></div><div class="v">Version<br><b>${ex.ver}</b></div></div>
    <table class="exp-info"><tr><td>Name / ឈ្មោះ: ..................................................</td><td>Class / ថ្នាក់: ............</td><td>Date / ថ្ងៃ: ............</td><td class="sc">Score<br><b>&nbsp;&nbsp;&nbsp;&nbsp;/ ${ex.total}</b></td></tr></table>
    ${ex.parts.map(p=>`<div class="exp-part"><h2>${p.id}. ${p.en} <span>${p.km}</span><em>/ ${p.qs.length*p.pts}</em></h2><p class="ins">${p.ins} <span>${p.insKm}</span></p>
      ${p.id==='C'?`<table class="exp-match">${p.qs.map((q,i)=>`<tr><td>${i+1}. ${esc(q.q)}</td><td class="bl">_____</td><td>${String.fromCharCode(97+i)}. ${esc(p.right[i])}</td></tr>`).join('')}</table>`:
      p.id==='E'?`<div class="exp-grid2">${p.qs.map((q,i)=>`<div>${i+1}. <span class="km">${esc(q.q)}</span> ${q.em&&!/^\d/.test(q.em)?q.em:''} → ______________________</div>`).join('')}</div>`:
      p.id==='F'?p.qs.map((q,i)=>`<div class="exp-ord">${i+1}. <span class="box">${q.words.map(esc).join(' / ')}</span><div class="line">_________________________________________________________ ${q.end}</div></div>`).join(''):
      `<div class="exp-mc ${p.id==='A'||p.id==='D'?'two':''}">${p.qs.map((q,i)=>`<div class="q">${i+1}. ${q.listen?'🎧 <i>(Listen)</i>':`${esc(q.qKm?q.q:q.q).replace('_____','________')}`}<div class="o">${q.opts.map((o,k)=>`<span>${String.fromCharCode(97+k)}) ${esc(o)}</span>`).join('')}</div></div>`).join('')}</div>`}
    </div>`).join('')}
    <div class="exp-foot">Good luck! • សូមសំណាងល្អ! 🍀</div></div>`;
}
function keyHtml(ex){
  return `<div class="exp key"><h1>ANSWER KEY — Unit ${ex.n} • Version ${ex.ver}</h1>
    ${ex.parts.map(p=>`<h2>${p.id}. ${p.en} (${p.qs.length*p.pts})</h2><p>${p.qs.map((q,i)=>`<b>${i+1}</b> ${esc(q.t==='mc'?String.fromCharCode(97+q.a)+') '+q.opts[q.a]:q.t==='match'?String.fromCharCode(97+q.a):q.a)}`).join(' &nbsp;•&nbsp; ')}</p>`).join('')}
    <h2>🎧 Listening script — គ្រូអានឱ្យឮ ២ ដង</h2><ol>${ex.parts.find(p=>p.id==='D').qs.map(q=>`<li>${esc(q.say)}</li>`).join('')}</ol></div>`;
}
function print(n, which){
  const vs = which==='AB'?['A','B']:[which];
  $('#printArea').innerHTML = vs.map(v=>{ const ex=build(n,v,false); return paper(ex,X.settings.school)+`<div class="pbreak"></div>`+keyHtml(ex); }).join('<div class="pbreak"></div>');
  const st=document.createElement('style'); st.textContent='@page{size:A4 portrait;margin:12mm}'; document.head.appendChild(st);
  document.body.classList.add('printing-cert');
  const done=()=>{ st.remove(); document.body.classList.remove('printing-cert'); window.removeEventListener('afterprint',done); };
  window.addEventListener('afterprint',done);
  setTimeout(()=>{ window.print(); setTimeout(done,1500); },150);
}

/* ---------- online (standalone HTML) ---------- */
const SECRET='BES-2026';
function sign(str){ return hashStr(SECRET+str).toString(36).slice(-5).toUpperCase(); }
function b64e(s){ return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function b64d(s){ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; return decodeURIComponent(escape(atob(s))); }
function online(n, ver){
  if(!window.EXAM_FONT_CSS && window.IS_WEB){ const sc=document.createElement('script'); sc.src='exam-font.js'; sc.onload=()=>online(n,ver); sc.onerror=()=>{ window.EXAM_FONT_CSS=' '; online(n,ver); }; document.head.appendChild(sc); toast('⏳ កំពុងរៀបចំ…'); return; }
  const ex=build(n,ver,false);
  const hide = b64e(JSON.stringify(ex)).split('').reverse().join('');
  const css = EXAM_CSS;
  const html = `<!DOCTYPE html><html lang="km"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(ex.title)} • Version ${ver}</title>
<style>${window.EXAM_FONT_CSS||""}
:root{--kh:"Kantumruy Pro","Khmer UI","Noto Sans Khmer",sans-serif;--en:"Segoe UI",system-ui,sans-serif;--ink:#16202a;--ink2:#46525e;--mute:#8a96a3;--line:#e6e1d6;--c1:#0f766e;--c2:#14b8a6;--ok:#16a34a;--rose:#e11d48}
*{box-sizing:border-box}body{margin:0;background:#f7f3ea;font-family:var(--en),var(--kh);color:var(--ink)}.km{font-family:var(--kh)}button,input,select,textarea{font:inherit}
.start{max-width:520px;margin:8vh auto;background:#fff;border-radius:24px;padding:28px;box-shadow:0 20px 40px -20px rgba(0,0,0,.3);text-align:center}
.start h1{font-size:24px;margin:6px 0}.start input{width:100%;height:48px;border-radius:14px;border:2px solid var(--line);padding:0 14px;font-size:17px;margin:14px 0}
${css}</style></head><body>
<div id="exam" class="online"><div class="start"><div style="font-size:60px">📝</div><h1>${esc(ex.title)}</h1><p class="km">ប្រឡងបញ្ចប់មេរៀនទី ${n} • Version ${ver} • ${ex.total} ពិន្ទុ</p>
<input id="nm" placeholder="វាយឈ្មោះរបស់អ្នក / Your name"><button class="ex-b" style="width:100%;height:50px;font-size:18px" onclick="go()">▶ ចាប់ផ្តើម / Start</button>
<p class="km" style="color:#8a96a3;font-size:13px;margin-top:14px">🔊 បើកសំឡេងទូរស័ព្ទ សម្រាប់ផ្នែកស្តាប់</p></div></div>
<script>
const EX=JSON.parse((s=>{s=s.split('').reverse().join('').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))})(${JSON.stringify(hide)}));
${esc.toString().replace(/^/,'const esc = ')};
${hashStr.toString()}
const normA=${normA.toString()}; const clean=${clean.toString()};
${score.toString()}
${examShell.toString()}
${wireExam.toString()}
${resultHtml.toString()}
${sign.toString().replace('SECRET',JSON.stringify(SECRET))}
${b64e.toString()}
function toast(m){alert(m)}
let RUN=null;
function go(){ const n=document.getElementById('nm').value.trim(); if(!n){ alert('សូមវាយឈ្មោះ'); return; }
  RUN={ex:EX,ans:{},name:n,t0:Date.now()}; const el=document.getElementById('exam'); el.innerHTML=examShell(EX,n,true); wireExam(el,RUN,submit); window.speechSynthesis&&speechSynthesis.getVoices(); }
function submit(){ const total=EX.parts.reduce((a,p)=>a+p.qs.length,0); let k=0; EX.parts.forEach(p=>p.qs.forEach((q,i)=>{const v=(RUN.ans[p.id]||{})[i]; if(v!==undefined&&v!==''&&v!==null)k++;}));
  if(k<total && !confirm('នៅសល់ '+(total-k)+' សំណួរ។ ប្រគល់ឥឡូវ?')) return;
  const sc=score(EX,RUN.ans); const payload=JSON.stringify({n:EX.n,v:EX.ver,nm:RUN.name,s:sc.s,t:EX.total,by:sc.by,ts:Date.now(),m:Math.round((Date.now()-RUN.t0)/60000)});
  const body=b64e(payload); const code='BES1.'+body+'.'+sign(body);
  document.getElementById('exam').innerHTML=resultHtml(EX,RUN.ans,sc,RUN.name,true,code); window.scrollTo(0,0); }
window.onbeforeunload=()=>RUN&&!document.querySelector('.ex-res')?'':undefined;
<\/script></body></html>`;
  const b=new Blob([html],{type:'text/html'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`Unit${n}-Test-${ver}.html`; a.click();
  modal(`<h3>🌐 ប្រឡង Online — Unit ${n} Version ${ver}</h3>
    <ol class="km ex-steps"><li>ឯកសារ <b>Unit${n}-Test-${ver}.html</b> ត្រូវបានទាញយក (ក្នុង Downloads)</li>
    <li>ផ្ញើឯកសារនោះទៅសិស្សតាម <b>Telegram</b> (ក្រុមថ្នាក់)</li>
    <li>សិស្សចុចបើកឯកសារ → ជ្រើស <b>Chrome</b> → វាយឈ្មោះ → ធ្វើប្រឡង</li>
    <li>ពេលប្រគល់ សិស្សឃើញពិន្ទុ និង <b>កូដលទ្ធផល</b> → ផ្ញើកូដមកគ្រូតាម Telegram</li>
    <li>គ្រូចម្លងកូដទាំងអស់ ហើយចុច <b>📥 បញ្ចូលកូដលទ្ធផល</b> ក្នុង App នេះ</li></ol>
    <p class="note">💡 កូដមានសញ្ញាផ្ទៀងផ្ទាត់ — បើសិស្សកែពិន្ទុក្នុងកូដ App នឹងបដិសេធ។ ប្រឡងដំណើរការក្រៅបណ្តាញបាន បន្ទាប់ពីបើកម្តង។</p>
    <div class="row" style="justify-content:flex-end"><button class="btn teal" onclick="closeModal()">យល់ហើយ</button></div>`);
}
function importCodes(){
  modal(`<h3>📥 បញ្ចូលកូដលទ្ធផលពីសិស្ស</h3><p class="note">បិទភ្ជាប់កូដទាំងអស់ (មួយបន្ទាត់មួយកូដ ឬសារ Telegram ទាំងមូលក៏បាន)</p>
    <textarea id="exCodes" class="names" style="height:200px" placeholder="BES1.xxxx.XXXXX"></textarea><div id="exCodeRes"></div>
    <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn ghost" onclick="closeModal()">បិទ</button><button class="btn teal" onclick="Exam.doImport()">📥 បញ្ចូល</button></div>`);
}
function doImport(){
  const txt=$('#exCodes').value, codes=txt.match(/BES1\.[A-Za-z0-9_-]+\.[A-Z0-9]{1,6}/g)||[]; let ok=0, bad=0, dup=0;
  codes.forEach(c=>{ const [,body,sg]=c.split('.'); if(sign(body)!==sg){ bad++; return; } try{ const d=JSON.parse(b64d(body));
    if(X.results.some(r=>r.ts===d.ts&&r.name===d.nm)){ dup++; return; }
    const st=(window.Class&&Class.studentsForPicker())||[]; const nn=String(d.nm).toLowerCase().replace(/\s+/g,' ').trim();
    const s=st.find(x=>x.name.replace(/\s+/g,' ').trim().toLowerCase()===nn || (x.latin||'').replace(/\s+/g,' ').trim().toLowerCase()===nn);
    X.results.push({n:d.n,ver:d.v,name:s?s.name:d.nm,sid:s?s.id:null,s:d.s,t:d.t,pct:Math.round(d.s/d.t*100),by:d.by,ts:d.ts,via:'online',mins:d.m}); ok++; }catch(e){ bad++; } });
  saveX();
  $('#exCodeRes').innerHTML=`<p class="km">✅ បញ្ចូល ${ok} • ${dup?`⏭ ស្ទួន ${dup} • `:''}${bad?`❌ កូដខុស/ត្រូវបានកែ ${bad}`:''}</p>`;
  if(ok && window.render) setTimeout(()=>{ closeModal(); render(); toast(`✅ បានបញ្ចូលលទ្ធផល ${ok}`); },900);
}

/* ---------- results → class monthly scores ---------- */
function toScores(n){
  const res=X.results.filter(r=>r.n===n), D=window.Class&&Class.data(); const c=D&&D.classes.find(x=>x.id===D.cur);
  if(!c) return toast('សូមបង្កើតថ្នាក់ក្នុង 👥 ថ្នាក់រៀន ជាមុនសិន');
  modal(`<h3>➡️ បញ្ចូលពិន្ទុប្រឡង Unit ${n} ទៅពិន្ទុខែ</h3>
    <p class="km">ថ្នាក់ «${esc(c.name)}» • ខែ <input type="month" id="exM" class="cl-in" value="${D.month}"></p>
    <p class="km">ផ្នែកពិន្ទុ <select id="exCol" class="cl-in">${c.cols.map(x=>`<option value="${x.id}" ${x.id==='test'?'selected':''}>${esc(x.n)} (/${x.max})</option>`).join('')}</select></p>
    <p class="km">យក <label><input type="radio" name="exPick" value="best" checked> ពិន្ទុខ្ពស់បំផុត</label> <label><input type="radio" name="exPick" value="last"> ពិន្ទុចុងក្រោយ</label></p>
    <p class="note">ពិន្ទុត្រូវបានប្តូរតាមសមាមាត្រ (ឧ. 40/50 → 40/50 ឬ 8/10)។ សិស្សដែលឈ្មោះមិនត្រូវនឹងបញ្ជីថ្នាក់ នឹងត្រូវរំលង។</p>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" onclick="closeModal()">បោះបង់</button><button class="btn teal" onclick="Exam.doScores(${n})">✅ បញ្ចូល</button></div>`);
}
function doScores(n){
  const D=Class.data(), c=D.classes.find(x=>x.id===D.cur), m=$('#exM').value, col=c.cols.find(x=>x.id===$('#exCol').value);
  const best=(document.querySelector('input[name=exPick]:checked')||{}).value!=='last';
  const latest={}; X.results.filter(r=>r.n===n).sort((a,b)=>a.ts-b.ts).forEach(r=>{ const s=r.sid?c.students.find(x=>x.id===r.sid):c.students.find(x=>x.name===r.name||x.latin===r.name); if(s && (!best || !latest[s.id] || r.s>=latest[s.id].s)) latest[s.id]=r; });
  let k=0; Object.entries(latest).forEach(([sid,r])=>{ const M=c.scores[m]=c.scores[m]||{}, R=M[sid]=M[sid]||{}; R[col.id]=Math.round(r.s/r.t*col.max*10)/10; k++; });
  localStorage.setItem('beginner-studio-class-v1', JSON.stringify(D)); closeModal(); toast(`✅ បានបញ្ចូលពិន្ទុ ${k} នាក់ ទៅ «${col.n}» ${m}`);
  (window.Cloud&&Cloud.flush?Cloud.flush():Promise.resolve()).catch(()=>{}).then(()=>setTimeout(()=>location.reload(),300));   // 🛡️ រក្សាទុកដល់ Cloud សិន
}
function csv(n){ const ex=build(n,'A'), res=X.results.filter(r=>r.n===n); const rows=[['ឈ្មោះ','Version',...ex.parts.map(p=>p.id+' '+p.en),'សរុប /'+ex.total,'%','របៀប','ថ្ងៃ'],...res.map(r=>[r.name,r.ver,...ex.parts.map(p=>r.by?r.by[p.id]:''),r.s,r.pct,r.via,new Date(r.ts).toLocaleDateString('en-GB')])];
  const b=new Blob(['﻿'+rows.map(r=>r.map(v=>/[",\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':v).join(',')).join('\r\n')],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`Unit${n}-Test-results.csv`; a.click(); }
function clear(n){ if(!confirm('លុបលទ្ធផលប្រឡង Unit '+n+' ទាំងអស់?')) return; X.results=X.results.filter(r=>r.n!==n); saveX(); render(); }

/* CSS shared by in-app & online exam */
const EXAM_CSS = `
#exam{position:fixed;inset:0;z-index:1400;background:#f7f3ea;overflow:auto;display:flex;flex-direction:column}
#exam.online{position:static;min-height:100vh}
.ex-top{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:12px;padding:10px 18px;background:#16202a;color:#fff}
.ex-top b{display:block;font-size:15px}.ex-top span{font-size:12.5px;opacity:.8}.ex-top .grow{flex:1}
#exTime{font-variant-numeric:tabular-nums;font-weight:700;background:rgba(255,255,255,.12);padding:4px 10px;border-radius:10px;opacity:1!important}
#exTime.warn{background:#e11d48;animation:pl 1s infinite}@keyframes pl{50%{opacity:.6}}
#exProg{background:rgba(255,255,255,.12);padding:4px 10px;border-radius:10px;opacity:1!important}
.ex-x{background:rgba(255,255,255,.12);color:#fff;border:0;width:36px;height:36px;border-radius:10px;cursor:pointer}
.ex-nav{position:sticky;top:56px;z-index:2;display:flex;gap:4px;overflow-x:auto;padding:8px 12px;background:#fff;box-shadow:0 4px 12px -8px rgba(0,0,0,.3)}
.ex-nav button{flex:none;border:0;background:#f1ece1;border-radius:10px;padding:7px 12px;font-family:var(--kh);cursor:pointer;white-space:nowrap}
.ex-nav button b{color:var(--c1)}
.ex-nav button.on{background:#16202a;color:#fff}.ex-nav button.on b{color:#fcd34d}
.ex-nav button.done::after{content:" ✓";color:#16a34a;font-weight:700}
.ex-body{max-width:820px;width:100%;margin:0 auto;padding:16px 14px 60px}
.ex-part{display:none;animation:exin .35s ease}.ex-part.on{display:block}@keyframes exin{from{opacity:0;transform:translateY(12px)}}
.ex-part h2{display:flex;align-items:center;gap:10px;font-family:var(--kh);font-size:20px;margin:6px 0 2px}
.ex-part h2 span{display:inline-grid;place-items:center;width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff}
.ex-part h2 small{margin-left:auto;font-size:13px;color:var(--mute);font-weight:400}
.ex-ins{font-family:var(--kh);color:var(--ink2);margin:0 0 12px}.ex-ins i{font-family:var(--en);color:var(--mute)}
.ex-q{background:#fff;border-radius:18px;padding:14px 16px;margin-bottom:10px;box-shadow:0 1px 2px rgba(0,0,0,.05),0 6px 18px -10px rgba(0,0,0,.2);border:2px solid transparent;transition:.2s}
.ex-q.answered{border-color:#99f6e4}
.qq{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:18px;font-weight:600;margin-bottom:10px}
.qq .n{display:inline-grid;place-items:center;min-width:28px;height:28px;border-radius:50%;background:#f1ece1;font-size:13px}
.qq .em{font-size:34px}.qq .km{font-family:var(--kh)}
.oo{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.oo label{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;background:#f7f3ea;cursor:pointer;border:2px solid transparent;font-size:16px;transition:.15s}
.oo label:hover{border-color:var(--c2)}
.oo input{display:none}.oo label span{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:8px;background:#fff;font-weight:700;font-size:13px;flex:none}
.oo label:has(input:checked){background:#ccfbf1;border-color:var(--c1)}.oo label:has(input:checked) span{background:var(--c1);color:#fff}
.ex-play,.ex-say{border:0;border-radius:12px;background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;padding:8px 16px;font-size:16px;cursor:pointer}
.ex-say{padding:4px 10px;font-size:14px}.ex-play.ping,.ex-say.ping{transform:scale(1.08)}
.ex-in{width:100%;height:46px;border-radius:12px;border:2px solid var(--line);padding:0 14px;font-size:18px}
.ex-in:focus{outline:none;border-color:var(--c2);box-shadow:0 0 0 4px rgba(20,184,166,.15)}
.ex-match{display:grid;gap:8px}
.ex-mrow{display:grid;grid-template-columns:1fr 1.3fr;gap:10px;align-items:center;background:#fff;border-radius:14px;padding:10px 14px;box-shadow:0 6px 18px -12px rgba(0,0,0,.3)}
.ex-mrow b{font-size:17px}.ex-mrow select{height:42px;border-radius:10px;border:2px solid var(--line);font-family:var(--kh);font-size:15px;padding:0 8px}
.ex-built{flex:1;min-height:32px;border-bottom:2px dashed var(--c2);font-weight:600;color:var(--c1)}
.ex-ord .end{font-size:20px}
.ex-undo{border:0;background:#f1ece1;border-radius:10px;width:34px;height:34px;cursor:pointer}
.ex-chips{display:flex;flex-wrap:wrap;gap:6px}
.ex-chips button{border:0;border-radius:12px;padding:9px 14px;background:#e0f2fe;font-size:16px;cursor:pointer;font-weight:600;transition:.15s}
.ex-chips button:disabled{opacity:.25;cursor:default}
.ex-pnav{display:flex;justify-content:space-between;margin-top:16px}
.ex-b{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:14px;padding:12px 20px;background:#16202a;color:#fff;font-family:var(--kh);font-size:15px;cursor:pointer;text-decoration:none}
.ex-b.ghost{background:#fff;color:#16202a;box-shadow:inset 0 0 0 1px var(--line)}
.ex-b.sun{background:linear-gradient(135deg,#f59e0b,#fb923c);color:#1c1206;font-weight:700}
.ex-res{background:#fff;border-radius:24px;padding:24px;text-align:center;box-shadow:0 20px 40px -20px rgba(0,0,0,.3);animation:exin .5s}
.ex-medal{font-size:70px}.ex-score{font-size:64px;font-weight:800;color:var(--c1);line-height:1}.ex-score small{font-size:26px;color:var(--mute)}
.ex-pct{font-family:var(--kh);font-size:20px;margin:6px 0 14px}
.ex-bars{display:grid;gap:6px;max-width:480px;margin:0 auto;text-align:left}
.ex-bars div{display:grid;grid-template-columns:130px 1fr 50px;gap:8px;align-items:center;font-family:var(--kh);font-size:14px}
.ex-bars i{height:10px;background:#eee8dc;border-radius:9px;overflow:hidden}.ex-bars i b{display:block;height:100%;background:linear-gradient(90deg,var(--c1),var(--c2));border-radius:9px}
.ex-bars em{font-style:normal;text-align:right;font-weight:700}
.ex-code{margin-top:18px;background:#fef3c7;border-radius:16px;padding:14px}.ex-code p{font-family:var(--kh);margin:0 0 8px}
.ex-code textarea{width:100%;height:70px;border-radius:10px;border:1px solid #fcd34d;padding:8px;font-family:monospace;font-size:12px;word-break:break-all}
.ex-rv{font-family:var(--kh);margin:22px 0 8px}
.ex-review{background:#fff;border-radius:16px;padding:12px 14px;margin-bottom:10px}
.ex-review h4{margin:0 0 6px;font-family:var(--kh)}
.ex-rr{display:flex;gap:10px;padding:6px 0;border-top:1px dashed var(--line)}
.ex-rr small{color:var(--ink2)}.ex-rr s{color:var(--rose)}.ex-rr b{color:var(--ok)}
@media (max-width:600px){.oo{grid-template-columns:1fr}.ex-mrow{grid-template-columns:1fr}.qq{font-size:16px}}
`;
const st=document.createElement('style'); st.textContent=EXAM_CSS; document.head.appendChild(st);

window.Exam = { _sp:(pid,i,r)=>{ if(!RUN||!RUN._set) return; const cur=+((RUN.ans[pid]||{})[i])||0; RUN._set(pid,i,Math.max(cur,r.best||r.pct||0)); const q=document.querySelector(`#exam .ex-q[data-p="${pid}"][data-i="${i}"]`); if(q) q.classList.add('answered');
    if(r.pass||r.tries>=3){ const m=document.querySelector(`#vc-ex${pid}${i} .vc-mic`); if(m) m.innerHTML=r.pass?'<small>✅ បានរក្សាទុក</small>':'<small>🔒 អស់ឱកាស ៣ ដងហើយ — រក្សាទុកលទ្ធផលល្អបំផុត '+Math.max(cur,r.best||0)+'%</small>'; } }, grammarPool:n=>grammarItems(n,Math.random).map(q=>({q:q.q,qKm:q.qKm,o:q.opts,a:q.a})), studentPage, openSess, closeSess, reload:reloadX, build, score, tab, start, begin, quit, print, online, importCodes, doImport, toScores, doScores, csv, clear,
  setting:(k,v)=>{ X.settings[k]=v; saveX(); }, data:()=>X };
})();
