// =====================================================================
//  track.js — 📊 តាមដានទិន្នន័យសិស្ស (Student tracking dashboard)
//  ប្រភពទិន្នន័យ៖ វឌ្ឍនភាពសិស្សម្នាក់ៗ (beginner-studio-v1:<uid>) • ប្រឡង • ពិន្ទុខែ • កំណត់ហេតុចូលប្រព័ន្ធ
// =====================================================================
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DAY=86400000;
const dk = t => { t=new Date(t); return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0'); };
const fmtMin = s => { const m=Math.round((s||0)/60); return m<60 ? m+' នាទី' : Math.floor(m/60)+' ម៉ោង '+(m%60?m%60+' នាទី':''); };
function ago(t){ if(!t) return 'មិនដែល'; const d=Date.now()-t; if(d<60000) return 'ឥឡូវនេះ'; if(d<3600000) return Math.floor(d/60000)+' នាទីមុន'; if(d<DAY) return Math.floor(d/3600000)+' ម៉ោងមុន'; const n=Math.floor(d/DAY); return n===1?'ម្សិលមិញ':n+' ថ្ងៃមុន'; }
const TOTAL_W = () => UNITS.reduce((a,u)=>a+u.vocab.length,0);
const EV = {unit:['📘','បើក Unit'], quiz:['✍️','ធ្វើលំហាត់'], listen:['🎧','ស្តាប់បទ'], slides:['🖥','រៀនស្លាយ'], book:['📖','បើកសៀវភៅ'], exam:['📝','ប្រឡង'], login:['🔓','ចូលប្រព័ន្ធ']};

/* ---------- collect one student's data ---------- */
function userOf(c, s){ return window.Auth ? Auth.data().users.find(u=>u.role==='student' && u.classId===c.id && u.studentId===s.id) : null; }
function progOf(u){ if(!u) return null; try{ return JSON.parse(localStorage.getItem('beginner-studio-v1:'+u.id)||'null'); }catch(e){ return null; } }
function collect(c, s){
  const u=userOf(c,s), P=progOf(u)||{}, A=P.act||{d:{},u:{},ev:[]};
  const X=(window.Exam&&Exam.data())||{results:[]};
  const ex=X.results.filter(r=>r.sid===s.id || (u&&r.uid===u.id));
  const exBest={}; ex.forEach(r=>{ if(!exBest[r.n] || r.pct>exBest[r.n].pct) exBest[r.n]=r; });
  const logins=window.Auth&&u ? Auth.data().log.filter(l=>l.uid===u.id && /ចូលប្រព័ន្ធ/.test(l.ev)).map(l=>l.ts) : [];
  const known=P.known||{}, quiz=P.quiz||{}, listened=P.listened||{};
  const words=Object.values(known).reduce((a,x)=>a+x.length,0);
  const qv=Object.values(quiz), quizAvg=qv.length?Math.round(qv.reduce((a,b)=>a+b,0)/qv.length):null;
  const exAvg=Object.keys(exBest).length?Math.round(Object.values(exBest).reduce((a,r)=>a+r.pct,0)/Object.keys(exBest).length):null;
  const now=Date.now(); let s7=0, d7=0, s30=0, d30=0, sAll=0;
  Object.entries(A.d||{}).forEach(([k,v])=>{ const t=new Date(k+'T12:00:00').getTime(); sAll+=v; if(now-t<7*DAY){ s7+=v; if(v>=60) d7++; } if(now-t<30*DAY){ s30+=v; if(v>=60) d30++; } });
  const last=Math.max(A.last||0, u&&u.last||0, ...ex.map(r=>r.ts), 0) || null;
  const status = !last ? 'never' : now-last<3*DAY ? 'ok' : now-last<8*DAY ? 'warn' : 'risk';
  // monthly score: latest month with data
  const mt=c.cols.reduce((a,x)=>a+(+x.max||0),0); const ms=Object.keys(c.scores||{}).filter(m=>c.scores[m][s.id]).sort(); let monthPct=null, month=null;
  if(ms.length){ month=ms[ms.length-1]; const r=c.scores[month][s.id]; let t=0; c.cols.forEach(x=>{ const v=parseFloat(r[x.id]); if(!isNaN(v)) t+=v; }); monthPct=mt?Math.round(t/mt*100):null; }
  // per unit
  const units=UNITS.map(U=>{ const kw=(known[U.n]||[]).length, tt=TRACKS.filter(t=>t.unit===U.n), tl=tt.filter(t=>listened[t.id]).length;
    const parts=[kw/U.vocab.length, tt.length?tl/tt.length:0, (quiz[U.n]||0)/100, exBest[U.n]?exBest[U.n].pct/100:0];
    return {n:U.n, kw, kt:U.vocab.length, tl, tt:tt.length, quiz:quiz[U.n], exam:exBest[U.n]?exBest[U.n].pct:null, secs:(A.u||{})[U.n]||0, done:Math.round(parts.reduce((a,b)=>a+b,0)/4*100)}; });
  const events=[...(A.ev||[]).map(e=>({ts:e[0],t:e[1],d:e[2]})), ...ex.map(r=>({ts:r.ts,t:'exam',d:`${r.n}:${r.pct}`})), ...logins.map(ts=>({ts,t:'login',d:''}))].sort((a,b)=>b.ts-a.ts);
  return {s, u, P, A, words, tracks:Object.keys(listened).length, quizAvg, passed:qv.filter(v=>v>=80).length, exAvg, exams:ex.length, s7, d7, s30, d30, sAll, last, status, monthPct, month, units, events, logins:logins.length};
}

/* ---------- small visuals ---------- */
const ST = {ok:['🟢','សកម្ម','#16a34a'], warn:['🟡','យូរបន្តិច','#ca8a04'], risk:['🔴','ត្រូវតាមដាន','#dc2626'], never:['⚪','មិនទាន់ចូល','#94a3b8']};
function bar(v, max, col){ const p=max?Math.min(100,v/max*100):0; return `<div class="tk-bar"><i style="width:${p}%;${col?'background:'+col:''}"></i></div>`; }
function unitStrip(units){ return `<div class="tk-strip">${units.map(x=>`<i title="Unit ${x.n}: ${x.done}%" style="--p:${x.done/100};--c:${UNIT_STYLE[x.n].c1}"></i>`).join('')}</div>`; }
function heat(d, weeks){
  weeks=weeks||12; const end=new Date(); end.setHours(12,0,0,0); const start=new Date(end.getTime()-(weeks*7-1)*DAY); start.setDate(start.getDate()-start.getDay());
  let cells='', t=start.getTime(); const days=Math.round((end-start)/DAY)+1;
  for(let i=0;i<days;i++,t+=DAY){ const v=(d||{})[dk(t)]||0, lv=v<=0?0:v<300?1:v<900?2:v<1800?3:4; cells+=`<i class="l${lv}" title="${dk(t)} • ${fmtMin(v)}"></i>`; }
  return `<div class="tk-heat">${cells}</div><div class="tk-hl"><span>តិច</span><i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>ច្រើន</span></div>`;
}
function evText(e){ const [i,n]=EV[e.t]||['•',e.t]; let d=e.d; if(e.t==='quiz'||e.t==='exam'){ const [u,p]=String(d).split(':'); d=`Unit ${u} • ${p}%`; } else if(e.t==='unit'){ d='Unit '+String(d).split(':')[0]; } else if(e.t==='slides') d='Unit '+d; else if(e.t==='listen') d='Track '+d; else if(e.t==='book') d=d!==''?'p'+d:''; return `${i} ${n} <b>${esc(d)}</b>`; }

/* ---------- class dashboard ---------- */
let sortBy='status', filter='all';
function tab(c){
  const rows=c.students.map(s=>collect(c,s)), TW=TOTAL_W(), TT=TRACKS.length;
  const order={risk:0,never:1,warn:2,ok:3};
  const sorters={status:(a,b)=>order[a.status]-order[b.status]||(a.last||0)-(b.last||0), name:(a,b)=>a.s.name.localeCompare(b.s.name,'km'), last:(a,b)=>(b.last||0)-(a.last||0), time:(a,b)=>b.s7-a.s7, words:(a,b)=>b.words-a.words, exam:(a,b)=>(b.exAvg??-1)-(a.exAvg??-1)};
  const list=rows.filter(r=>filter==='all'||r.status===filter||(filter==='risk'&&r.status==='never')).sort(sorters[sortBy]);
  const today=dk(Date.now()), actToday=rows.filter(r=>(r.A.d||{})[today]>=60||(r.last&&dk(r.last)===today)).length, actWeek=rows.filter(r=>r.d7>0||(r.last&&Date.now()-r.last<7*DAY)).length;
  const avg=(a)=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):0;
  const ex=rows.filter(r=>r.exAvg!=null).map(r=>r.exAvg), noAcc=rows.filter(r=>!r.u).length, risk=rows.filter(r=>r.status==='risk'||r.status==='never');
  $('#clTab').innerHTML = `
  <div class="tk-cards">
    <div class="tk-card"><span>🟢 សកម្មថ្ងៃនេះ</span><b>${actToday}<small>/${rows.length}</small></b>${bar(actToday,rows.length,'#16a34a')}</div>
    <div class="tk-card"><span>📅 សកម្មសប្តាហ៍នេះ</span><b>${actWeek}<small>/${rows.length}</small></b>${bar(actWeek,rows.length,'#2563eb')}</div>
    <div class="tk-card"><span>⏱ ពេលរៀនមធ្យម / សប្តាហ៍</span><b>${fmtMin(avg(rows.map(r=>r.s7)))}</b></div>
    <div class="tk-card"><span>🔤 ពាក្យចេះមធ្យម</span><b>${avg(rows.map(r=>r.words))}<small>/${TW}</small></b>${bar(avg(rows.map(r=>r.words)),TW)}</div>
    <div class="tk-card"><span>📝 ប្រឡងមធ្យម</span><b>${ex.length?avg(ex)+'%':'—'}</b>${bar(avg(ex),100,'#7c3aed')}</div>
    <div class="tk-card ${risk.length?'alert':''}"><span>🔴 ត្រូវតាមដាន</span><b>${risk.length}</b><small class="tk-risk">${risk.slice(0,4).map(r=>esc(r.s.name)).join(' • ')}${risk.length>4?' …':''}</small></div>
  </div>
  ${noAcc&&window.Auth?`<div class="tk-note">ℹ️ សិស្ស ${noAcc} នាក់មិនទាន់មានគណនី — វឌ្ឍនភាពរៀនដោយខ្លួនឯងតាមដានបានតែពេលសិស្សចូលប្រព័ន្ធប៉ុណ្ណោះ។ <a href="#" onclick="Class.render('accounts');return false">🔑 បង្កើតគណនី</a></div>`:''}
  <div class="panel">
    <div class="row" style="justify-content:space-between;margin-bottom:10px">
      <h3 class="sec" style="margin:0">📊 តាមដានសិស្ស (${list.length})</h3>
      <div class="row">
        <div class="tk-flt">${[['all','ទាំងអស់'],['ok','🟢'],['warn','🟡'],['risk','🔴⚪']].map(f=>`<button class="${filter===f[0]?'on':''}" onclick="Track.filter('${f[0]}')">${f[1]}</button>`).join('')}</div>
        <select class="cl-in" onchange="Track.sort(this.value)">${[['status','តម្រៀប៖ ស្ថានភាព'],['name','ឈ្មោះ'],['last','សកម្មចុងក្រោយ'],['time','ពេលរៀន ៧ ថ្ងៃ'],['words','ពាក្យចេះ'],['exam','ពិន្ទុប្រឡង']].map(o=>`<option value="${o[0]}" ${sortBy===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select>
        ${window.IS_WEB?`<button class="btn ghost sm" onclick="location.reload()" title="ទាញទិន្នន័យថ្មីពី Cloud">🔄 ធ្វើបច្ចុប្បន្នភាព</button>`:''}
        <button class="btn ghost sm" onclick="Track.csv()">📊 Excel</button>
      </div>
    </div>
    <div class="cl-tablewrap"><table class="cl-table tk-table"><thead><tr><th></th><th class="l">សិស្ស</th><th>ស្ថានភាព</th><th>សកម្មចុងក្រោយ</th><th>ថ្ងៃរៀន<small>៧ ថ្ងៃ</small></th><th>ពេលរៀន<small>៧ ថ្ងៃ</small></th><th>ពាក្យចេះ</th><th>សំឡេង</th><th>លំហាត់<small>មធ្យម</small></th><th>ប្រឡង<small>មធ្យម</small></th><th>ពិន្ទុខែ</th><th class="l">វឌ្ឍនភាព Unit 1–14</th></tr></thead><tbody>
    ${list.map(r=>`<tr class="tk-row" onclick="Track.detail('${r.s.id}')">
      <td>${Class.avatar(r.s,34)}</td><td class="l"><b>${esc(r.s.name)}</b>${r.s.latin?`<small class="tk-lat">${esc(r.s.latin)}</small>`:''}${!r.u&&window.Auth?'<small class="tk-lat">🔑 គ្មានគណនី</small>':''}</td>
      <td><span class="tk-st" style="--c:${ST[r.status][2]}">${ST[r.status][0]} ${ST[r.status][1]}</span></td>
      <td>${ago(r.last)}</td><td>${r.d7}/7</td><td>${fmtMin(r.s7)}</td>
      <td>${r.words}<small>/${TW}</small>${bar(r.words,TW)}</td><td>${r.tracks}<small>/${TT}</small></td>
      <td>${r.quizAvg!=null?r.quizAvg+'%':'—'}${r.passed?`<small>✓${r.passed}</small>`:''}</td>
      <td>${r.exAvg!=null?`<span class="gr" style="background:${r.exAvg>=80?'#16a34a':r.exAvg>=50?'#2563eb':'#dc2626'}">${r.exAvg}%</span>`:'—'}</td>
      <td>${r.monthPct!=null?r.monthPct+'%':'—'}</td><td class="l">${unitStrip(r.units)}</td></tr>`).join('')}
    </tbody></table></div>
    <p class="note" style="margin-top:10px">💡 ចុចលើសិស្សដើម្បីមើលលម្អិត • 🟢 សកម្មក្នុង ៣ ថ្ងៃ • 🟡 ៣–៧ ថ្ងៃ • 🔴 លើស ៧ ថ្ងៃ • ⚪ មិនទាន់ចូល • ពេលរៀនរាប់តែពេលសិស្សកំពុងប្រើពិតប្រាកដ</p>
  </div>`;
}

/* ---------- student detail ---------- */
function detail(sid){
  const c=Class.data().classes.find(x=>x.students.some(s=>s.id===sid)), s=c.students.find(x=>x.id===sid), r=collect(c,s), TW=TOTAL_W();
  modal(`<div class="tk-dh">${Class.avatar(s,72)}<div><h3 style="margin:0">${esc(s.name)}</h3><div class="note">${esc(s.latin||'')} • 🏫 ${esc(c.name)}${r.u?` • @${esc(r.u.username)}`:''}</div>
      <span class="tk-st" style="--c:${ST[r.status][2]}">${ST[r.status][0]} ${ST[r.status][1]} • ${ago(r.last)}</span></div></div>
    <div class="tk-cards sm">
      <div class="tk-card"><span>⏱ ពេលរៀនសរុប</span><b>${fmtMin(r.sAll)}</b><small>៣០ ថ្ងៃ៖ ${fmtMin(r.s30)} • ${r.d30} ថ្ងៃ</small></div>
      <div class="tk-card"><span>🔤 ពាក្យចេះ</span><b>${r.words}<small>/${TW}</small></b>${bar(r.words,TW)}</div>
      <div class="tk-card"><span>🎧 បទបានស្តាប់</span><b>${r.tracks}<small>/${TRACKS.length}</small></b>${bar(r.tracks,TRACKS.length)}</div>
      <div class="tk-card"><span>✍️ Unit ឆ្លង (≥80%)</span><b>${r.passed}<small>/14</small></b>${bar(r.passed,14,'#16a34a')}</div>
      <div class="tk-card"><span>📝 ប្រឡង</span><b>${r.exAvg!=null?r.exAvg+'%':'—'}</b><small>${r.exams} ដង</small></div>
      <div class="tk-card"><span>🔓 ចូលប្រព័ន្ធ</span><b>${r.logins}</b><small>ដង</small></div>
    </div>
    <h4 class="tk-h">📅 សកម្មភាព ១២ សប្តាហ៍ចុងក្រោយ</h4>${heat(r.A.d,12)}
    <h4 class="tk-h">📚 តាម Unit</h4>
    <div class="cl-tablewrap" style="max-height:260px"><table class="cl-table"><thead><tr><th>Unit</th><th>ពាក្យ</th><th>សំឡេង</th><th>លំហាត់</th><th>ប្រឡង</th><th>ពេលរៀន</th><th class="l">វឌ្ឍនភាព</th></tr></thead><tbody>
      ${r.units.map(x=>`<tr><td><b>${UNIT_STYLE[x.n].icon} ${x.n}</b></td><td>${x.kw}/${x.kt}</td><td>${x.tl}/${x.tt}</td><td>${x.quiz!=null?x.quiz+'%':'—'}</td><td>${x.exam!=null?x.exam+'%':'—'}</td><td>${x.secs?fmtMin(x.secs):'—'}</td><td class="l" style="min-width:120px">${bar(x.done,100,UNIT_STYLE[x.n].c1)}</td></tr>`).join('')}
    </tbody></table></div>
    <h4 class="tk-h">🕒 សកម្មភាពថ្មីៗ</h4>
    <div class="tk-ev">${r.events.slice(0,40).map(e=>`<div><span>${new Date(e.ts).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'})}</span>${evText(e)}</div>`).join('')||'<p class="note">មិនទាន់មានសកម្មភាព</p>'}</div>
    ${!r.u&&window.Auth?'<p class="tk-note">🔑 សិស្សនេះមិនទាន់មានគណនី — បង្កើតគណនី ដើម្បីតាមដានការរៀនដោយខ្លួនឯង</p>':''}`);
  $('#modal').classList.add('wide');
}

function csv(){
  const c=Class.data().classes.find(x=>x.id===Class.data().cur)||Class.data().classes[0]; const rows=c.students.map(s=>collect(c,s));
  const head=['ល.រ','ឈ្មោះ','ឈ្មោះឡាតាំង','ស្ថានភាព','សកម្មចុងក្រោយ','ថ្ងៃរៀន (៧ថ្ងៃ)','នាទីរៀន (៧ថ្ងៃ)','នាទីរៀនសរុប','ពាក្យចេះ','បទស្តាប់','លំហាត់មធ្យម %','Unit ឆ្លង','ប្រឡងមធ្យម %','ចំនួនប្រឡង','ពិន្ទុខែចុងក្រោយ %',...UNITS.map(u=>'Unit '+u.n+' %')];
  const q=v=>{ v=v==null?'':String(v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; };
  const lines=[head,...rows.map((r,i)=>[i+1,r.s.name,r.s.latin||'',ST[r.status][1],r.last?new Date(r.last).toLocaleString('en-GB'):'',r.d7,Math.round(r.s7/60),Math.round(r.sAll/60),r.words,r.tracks,r.quizAvg??'',r.passed,r.exAvg??'',r.exams,r.monthPct??'',...r.units.map(x=>x.done)])].map(r=>r.map(q).join(',')).join('\r\n');
  const b=new Blob(['﻿'+lines],{type:'text/csv;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`${c.name} - តាមដានសិស្ស ${dk(Date.now())}.csv`; a.click();
}

window.Track = { tab, detail, csv, heat, collect, fmtMin,
  sort:v=>{ sortBy=v; Class.render('track'); }, filter:v=>{ filter=v; Class.render('track'); } };
})();
