// =====================================================================
//  class.js — 👥 ថ្នាក់រៀន: សិស្ស+រូបថត • ពិន្ទុប្រចាំខែ • លទ្ធផលប្រចាំខែ • បង្កើតក្រុម • នាឡិកា
//  ទិន្នន័យរក្សាទុកក្នុងកុំព្យូទ័រ (localStorage) + Backup/Restore ជាឯកសារ .json
// =====================================================================
(function(){
const CK = 'beginner-studio-class-v1';
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = s => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2,9);
const MONTHS_KM = ['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
const monthNow = () => { const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); };
const monthName = m => { const [y,mm]=m.split('-'); return 'ខែ'+MONTHS_KM[+mm-1]+' '+y; };
const DEFAULT_COLS = [
  {id:'listen', n:'ស្តាប់', en:'Listening', max:10},
  {id:'speak',  n:'និយាយ', en:'Speaking',  max:10},
  {id:'read',   n:'អាន',   en:'Reading',   max:10},
  {id:'write',  n:'សរសេរ', en:'Writing',   max:10},
  {id:'hw',     n:'កិច្ចការផ្ទះ', en:'Homework', max:10},
  {id:'test',   n:'ប្រឡងប្រចាំខែ', en:'Monthly test', max:50}
];
const GRADES = [[90,'A','ល្អប្រសើរ','#16a34a'],[80,'B','ល្អណាស់','#0d9488'],[70,'C','ល្អ','#2563eb'],[60,'D','ល្អបង្គួរ','#7c3aed'],[50,'E','មធ្យម','#d97706'],[0,'F','ខ្សោយ','#dc2626']];
const grade = p => GRADES.find(g=>p>=g[0]);
const gname = g => g==='F'?'ស្រី':g==='M'?'ប្រុស':'—';

let C = { classes:[], cur:null, month:monthNow() };
try { Object.assign(C, JSON.parse(localStorage.getItem(CK)||'{}')); } catch(e){}
function saveC(){ try{ localStorage.setItem(CK, JSON.stringify(C)); return true; }catch(e){ toast('⚠️ ទំហំទិន្នន័យពេញ — សូម Backup ហើយកាត់បន្ថយរូបថត'); return false; } }
function vis(){ return window.Auth&&Auth.user() ? C.classes.filter(c=>Auth.canSeeClass(c)) : C.classes; }
function cls(){ const V=vis(); let c=V.find(x=>x.id===C.cur); if(!c && V.length){ c=V[0]; C.cur=c.id; } return c; }
function newClass(name){ const c={id:uid(), name:name||'ថ្នាក់ Beginner A', book:'hw5-beg', cols:JSON.parse(JSON.stringify(DEFAULT_COLS)), students:[], scores:{}, groups:null}; if(window.Auth&&Auth.role()==='teacher') c.owner=Auth.user().id; C.classes.push(c); C.cur=c.id; saveC(); return c; }

/* ✏️ students edit their own profile (kept in their progress key) → staff devices copy newer ones into the roster */
function applyProfiles(){ if(!window.Auth||!Auth.user()||Auth.role()==='student') return 0; let n=0;
  Auth.data().users.filter(u=>u.role==='student').forEach(u=>{ let P=null; try{ P=JSON.parse(localStorage.getItem('beginner-studio-v1:'+u.id)||'null'); }catch(e){} const p=P&&P.profile; if(!p||!p.ts) return;
    const c=C.classes.find(x=>x.id===u.classId), s=c&&c.students.find(x=>x.id===u.studentId); if(!s||(s.pts||0)>=p.ts) return;
    if(p.name) s.name=p.name; s.latin=p.latin||''; if(p.dob) s.dob=p.dob; s.phone=p.phone||''; s.photo=p.photo||''; s.pts=p.ts; n++; Auth._rename(c.id,s.id,s.name); });
  if(n) saveC(); return n; }
setTimeout(()=>{ const n=applyProfiles(); if(n) toast(`✏️ សិស្ស ${n} នាក់បានកែព័ត៌មានខ្លួនឯង — បានធ្វើបច្ចុប្បន្នភាពបញ្ជីថ្នាក់`); }, 2500);

/* ---------- helpers ---------- */
function avatar(s, size){
  size=size||44;
  if(s.photo) return `<img class="cl-av" src="${s.photo}" style="width:${size}px;height:${size}px" alt="">`;
  const ini=(s.name||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  return `<span class="cl-av ini ${s.g==='F'?'f':'m'}" style="width:${size}px;height:${size}px;font-size:${size*.38}px">${esc(ini)}</span>`;
}
function parseDate(v){ const r=parseDate0(v); if(!r) return r; const [y,m,d]=r.split('-').map(Number), dt=new Date(Date.UTC(y,m-1,d)); return (dt.getUTCMonth()===m-1 && dt.getUTCDate()===d && y>1900 && dt<=new Date()) ? r : null; }
function parseDate0(v){
  v=String(v==null?'':v).trim(); if(!v) return '';
  if(/^\d{5}$/.test(v)){ const d=new Date(Date.UTC(1899,11,30)+(+v)*864e5); return d.toISOString().slice(0,10); }   // Excel serial
  let m=v.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/); if(m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  m=v.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})$/); if(m){ let y=+m[3]; if(y<100) y+= y>40?1900:2000; return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; }
  return null;
}
const KHD='០១២៣៤៥៦៧៨៩';
const toKhNum = x => String(x).replace(/\d/g,d=>KHD[d]);
function fmtDob(d){ if(!d) return ''; const [y,m,dd]=d.split('-'); return `${dd}/${m}/${y}`; }
function ageOf(d){ if(!d) return null; const b=new Date(d), n=new Date(); let a=n.getFullYear()-b.getFullYear(); if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate())) a--; return a>=0&&a<120?a:null; }
function parseGender(v){ v=String(v||'').trim().toLowerCase(); if(/^(ស|ស្រី|f|female|girl|w)$/.test(v)) return 'F'; if(/^(ប|ប្រុស|m|male|boy)$/.test(v)) return 'M'; return null; }
function maxTotal(c){ return c.cols.reduce((a,x)=>a+(+x.max||0),0); }
function rowOf(c,m,sid){ return ((c.scores[m]||{})[sid])||{}; }
function totalOf(c,m,sid){ const r=rowOf(c,m,sid); let t=0,any=false; c.cols.forEach(x=>{ const v=parseFloat(r[x.id]); if(!isNaN(v)){ t+=v; any=true; } }); return any?t:null; }
function results(c,m){
  const mt=maxTotal(c);
  const rows=c.students.map(s=>{ const t=totalOf(c,m,s.id); return {s, t, p: t==null?null: t/mt*100, r:rowOf(c,m,s.id)}; });
  const ranked=rows.filter(r=>r.t!=null).sort((a,b)=>b.t-a.t);
  ranked.forEach((r,i)=>{ r.rank = i>0 && ranked[i-1].t===r.t ? ranked[i-1].rank : i+1; });
  return rows.sort((a,b)=> (a.rank||999)-(b.rank||999) || a.s.name.localeCompare(b.s.name));
}
function monthsWithData(c){ return Object.keys(c.scores).filter(m=>Object.keys(c.scores[m]||{}).length).sort(); }
function resizePhoto(file, cb){
  const fr=new FileReader();
  fr.onload=()=>{ const im=new Image(); im.onload=()=>{ const s=Math.min(im.width,im.height), cv=document.createElement('canvas'); cv.width=cv.height=200; const ctx=cv.getContext('2d'); ctx.drawImage(im,(im.width-s)/2,(im.height-s)/2*0.6,s,s,0,0,200,200); cb(cv.toDataURL('image/jpeg',0.8)); }; im.src=fr.result; };
  fr.readAsDataURL(file);
}

/* ---------- main render ---------- */
const TABS = [['students','👩‍🎓 សិស្ស'],['track','📊 តាមដានសិស្ស'],['scores','✏️ ដាក់ពិន្ទុ'],['results','🏅 លទ្ធផលប្រចាំខែ'],['year','📈 សរុបឆ្នាំ'],['attend','🙋 វត្តមាន'],['groups','👥 បង្កើតក្រុម'],['timer','⏱ នាឡិកា'],['rank','🏆 ចំណាត់ថ្នាក់'],['notify','📣 ជូនដំណឹង'],['chat','💬 ឆាតសិស្ស'],['unlock','🔓 បើក/កាលវិភាគមេរៀន'],['accounts','🔑 គណនីសិស្ស']];
let tab='students';
function render(t){ applyProfiles();
  if(t) tab=t;
  setUnitColors(3);
  let c=cls();
  const head = `
  <div class="uhero cl-hero">
    <div class="emo float" style="margin-left:0">👥</div>
    <div><h2>ថ្នាក់រៀនរបស់ខ្ញុំ</h2><div class="kmt">គ្រប់គ្រងសិស្ស ពិន្ទុប្រចាំខែ ក្រុម និងពេលវេលា</div>
      <div class="pgs">${c?`${c.students.length} សិស្ស • ស្រី ${c.students.filter(s=>s.g==='F').length} • ${monthsWithData(c).length} ខែមានពិន្ទុ`:'មិនទាន់មានថ្នាក់'}</div></div>
    <div class="act" style="width:auto;margin-left:auto;align-items:center">
      ${vis().length?`<select class="cl-sel" onchange="Class.pick(this.value)">${vis().map(x=>`<option value="${x.id}" ${x.id===C.cur?'selected':''}>${esc(x.name)}</option>`).join('')}</select>`:''}
      <button class="btn ghost sm" onclick="Class.addClass()">＋ ថ្នាក់ថ្មី</button>
      ${c?`<button class="btn ghost sm" onclick="Class.renameClass()">✎</button><select class="cl-sel" title="សៀវភៅរបស់ថ្នាក់" onchange="Class.setBook(this.value)">${COURSES.map(b=>`<option value="${b.id}" ${courseOf(c).id===b.id?'selected':''}>${b.icon} ${esc(b.name)}</option>`).join('')}</select>`:''}
      <button class="btn ghost sm" onclick="Class.backup()">⬇ Backup</button>
      ${!window.Auth||Auth.role()==='admin'?`<label class="btn ghost sm">⬆ Restore<input type="file" accept=".json" hidden onchange="Class.restore(this.files[0])"></label>`:''}
    </div>
  </div>`;
  if(!c){
    $('#main').innerHTML = head + `<div class="panel cl-empty"><div style="font-size:70px" class="float">🏫</div><h3 class="km">ចាប់ផ្តើមដោយបង្កើតថ្នាក់រៀន</h3>
      <div class="row" style="justify-content:center"><input id="clNewName" class="cl-in" placeholder="ឈ្មោះថ្នាក់ ឧ. Beginner A — ព្រឹក" value="Beginner A"><button class="btn teal" onclick="Class.addClass($('#clNewName').value)">＋ បង្កើតថ្នាក់</button></div></div>`;
    return;
  }
  $('#main').innerHTML = head + `<div class="tabs">${TABS.map(x=>`<button class="${x[0]===tab?'on':''}" onclick="Class.render('${x[0]}')">${x[1]}</button>`).join('')}</div><div id="clTab"></div>`;
  ({students:tStudents, scores:tScores, results:tResults, year:tYear, groups:tGroups, timer:tTimer, track:c=>Track.tab(c), unlock:tUnlock, attend:tAttend, notify:c=>{ if(window.Notify) Notify.teacherTab($('#clTab'), c); }, chat:c=>{ if(window.Chat) Chat.teacherTab($('#clTab'), c); }, rank:c=>{ Rank._target(()=>Class.render('rank')); Rank.page($('#clTab'), c, {staff:true, head:false}); }, accounts:c=>{ $('#clTab').innerHTML=Auth.accountsPanel(c); }})[tab](c);
}

/* ---------- 🔓 teacher unlocks units (for students who studied before) ---------- */
function UL(c){ c.unlock=c.unlock||{all:[],s:{}}; c.unlock.all=c.unlock.all||[]; c.unlock.s=c.unlock.s||{}; return c.unlock; }
function passedOf(c,s){ try{ const u=window.Auth&&Auth.data().users.find(x=>x.role==='student'&&x.classId===c.id&&x.studentId===s.id); const P=u&&JSON.parse(localStorage.getItem('beginner-studio-v1:'+u.id)||'null'); return P?(n=>(P.level||{})[n]>=80):(()=>false); }catch(e){ return ()=>false; } }
function tUnlock(c){
  const L=UL(c), N=[...Array(14)].map((_,i)=>i+1);
  const cell=(sid,n,pass)=>{ const all=L.all.includes(n), on=all||(sid!=='*'&&(L.s[sid]||[]).includes(n)); const lock=n===1;
    return `<td><button class="ul-c ${pass?'pass':on?'on':''} ${lock?'first':''}" ${lock||(sid!=='*'&&all)?'disabled':''} title="Unit ${n}" onclick="Class.unl('${sid}',${n})">${pass?'✅':lock||on?'🔓':'🔒'}</button></td>`; };
  const upto=sid=>`<select class="ul-to" onchange="Class.unlTo('${sid}',+this.value);this.value=''"><option value="">បើកដល់…</option>${N.slice(1).map(n=>`<option value="${n}">Unit ${n}</option>`).join('')}<option value="0">🔒 បិទវិញទាំងអស់</option></select>`;
  const G=c.gate||{on:false,d:{}}, td=new Date(), tk=td.getFullYear()+'-'+String(td.getMonth()+1).padStart(2,'0')+'-'+String(td.getDate()).padStart(2,'0');
  $('#clTab').innerHTML=`<div class="panel gt-panel">
    <div class="row" style="justify-content:space-between"><h3 class="sec" style="margin:0">📅 កាលវិភាគបើកមេរៀន</h3>
      <label class="gt-sw ${G.on?'on':''}"><input type="checkbox" ${G.on?'checked':''} onchange="Class.gate('on',this.checked)" hidden><span></span>${G.on?'កំពុងប្រើ':'បិទ'}</label></div>
    <p class="note" style="margin:6px 0 10px">ពេលបើក៖ Unit នីមួយៗបើកឱ្យសិស្សរៀនតែចាប់ពីថ្ងៃដែលគ្រូកំណត់ប៉ុណ្ណោះ <b>ទោះសិស្សឆ្លងមេរៀនមុនរួចហើយក៏ដោយ</b> — ការពារមិនឱ្យរៀនលឿនជាងថ្នាក់។ សិស្សឃើញថ្ងៃបើកលើផែនទី។ Unit ដែលមិនទាន់កំណត់ថ្ងៃ = «រង់ចាំគ្រូ»។ (ការបើកសោផ្ទាល់ខាងក្រោម នៅតែបើកបានជានិច្ច)</p>
    ${G.on?`<div class="gt-auto">⚡ បំពេញស្វ័យប្រវត្តិ៖ ចាប់ពី <input type="date" id="gtS" value="${tk}"> រៀងរាល់ <input type="number" id="gtE" value="14" min="1" max="60" style="width:60px"> ថ្ងៃ/Unit <button class="btn ghost sm" onclick="Class.gateAuto()">បំពេញ</button></div>
    <div class="gt-list">${N.map(n=>{ const d=(G.d||{})[n]||'', st=n===1?'ok':!d?'wait':d<=tk?'ok':'soon';
      return `<div class="gt-row ${st}"><span class="gt-u" style="--c:${UNIT_STYLE[n].c1}">${n}</span><b>${esc(UNITS[n-1].en)}</b>
        ${n===1?'<em>✅ បើកជានិច្ច</em>':`<input type="date" value="${d}" onchange="Class.gate('d',[${n},this.value])"><em>${st==='ok'?'✅ បើកហើយ':st==='soon'?'📅 រង់ចាំថ្ងៃ':'⏳ មិនទាន់កំណត់'}</em><button class="btn ghost sm" onclick="Class.gate('d',[${n},'${tk}'])">បើកថ្ងៃនេះ</button>`}</div>`; }).join('')}</div>`:''}
  </div>
  <div class="panel">
    <h3 class="sec" style="margin:0 0 6px">🔓 បើកសោមេរៀនឱ្យសិស្ស</h3>
    <p class="note" style="margin:0 0 12px">សម្រាប់សិស្សដែលធ្លាប់រៀនខ្លះហើយ — ចុច 🔒 ដើម្បីបើក Unit នោះឱ្យសិស្សចូលរៀនបានភ្លាម ដោយមិនចាំបាច់ឆ្លង Unit មុន។ ចុចម្តងទៀតដើម្បីបិទវិញ។ ក្រោយបើក Unit ណាមួយ សិស្សនៅតែត្រូវឆ្លងកម្រិត Unit នោះ ទើប Unit បន្ទាប់បើកដោយខ្លួនឯង។<br>🔓 = បើក • 🔒 = ចាក់សោ • ✅ = ឆ្លងរួច</p>
    <div class="ul-wrap"><table class="ul-t"><thead><tr><th>សិស្ស</th>${N.map(n=>`<th style="color:${UNIT_STYLE[n].c1}">${n}</th>`).join('')}<th></th></tr></thead><tbody>
      <tr class="ul-all"><td><b>👥 ថ្នាក់ទាំងមូល</b></td>${N.map(n=>cell('*',n,false)).join('')}<td>${upto('*')}</td></tr>
      ${c.students.map((s,i)=>{ const P=passedOf(c,s); return `<tr><td><span class="ul-n">${i+1}. ${esc(s.name)}</span></td>${N.map(n=>cell(s.id,n,P(n))).join('')}<td>${upto(s.id)}</td></tr>`; }).join('')}
    </tbody></table></div></div>`;
}
function gate(k,v){ const c=cls(); c.gate=c.gate||{on:false,d:{}}; c.gate.d=c.gate.d||{};
  if(k==='on'){ c.gate.on=!!v; toast(v?'📅 បានបើកកាលវិភាគ — Unit បើកតាមថ្ងៃដែលគ្រូកំណត់':'🔓 បានបិទកាលវិភាគ'); }
  else { const [n,d]=v; if(d) c.gate.d[n]=d; else delete c.gate.d[n]; }
  saveC(); tUnlock(c); }
function gateAuto(){ const c=cls(), s=document.getElementById('gtS').value, e=+document.getElementById('gtE').value||14; if(!s) return;
  if(!confirm(`បំពេញថ្ងៃបើក Unit 2–14 ចាប់ពី ${s} រៀងរាល់ ${e} ថ្ងៃ? (ជំនួសថ្ងៃចាស់)`)) return;
  const b=new Date(s+'T12:00:00'); c.gate.d={}; for(let n=2;n<=14;n++){ const d=new Date(b.getTime()+(n-2)*e*864e5); c.gate.d[n]=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  saveC(); tUnlock(c); toast('✅ បានបំពេញកាលវិភាគ'); }
function unl(sid,n){ const c=cls(), L=UL(c), a=sid==='*'?L.all:(L.s[sid]=L.s[sid]||[]); const i=a.indexOf(n); i>=0?a.splice(i,1):a.push(n); saveC(); tUnlock(c); toast(i>=0?`🔒 បិទ Unit ${n} វិញ`:`🔓 បានបើក Unit ${n}${sid==='*'?' ឱ្យថ្នាក់ទាំងមូល':''}`); }
function unlTo(sid,n){ if(isNaN(n)) return; const c=cls(), L=UL(c), v=n?[...Array(n-1)].map((_,i)=>i+2):[]; if(sid==='*') L.all=v; else L.s[sid]=v; saveC(); tUnlock(c); toast(n?`🔓 បានបើក Unit 1–${n}`:'🔒 បានបិទវិញ'); }

/* ---------- 📋 copy / move students from another class ---------- */
let CP={src:null, mode:'copy'};
function copyFrom(){
  const c=cls(), others=vis().filter(x=>x.id!==c.id);
  if(!others.length) return toast('មិនមានថ្នាក់ផ្សេងទៀតសម្រាប់ចម្លងទេ');
  if(!others.some(x=>x.id===CP.src)) CP.src=others[0].id;
  const src=others.find(x=>x.id===CP.src), has=new Set(c.students.map(x=>(x.name||'').trim()));
  modal(`<h3>📋 ចម្លងសិស្សពីថ្នាក់ផ្សេង → «${esc(c.name)}»</h3>
    <div class="row" style="gap:8px;margin:6px 0 10px"><b class="km">ពីថ្នាក់៖</b><select class="cl-sel" onchange="Class._cpSrc(this.value)">${others.map(x=>`<option value="${x.id}" ${x.id===CP.src?'selected':''}>${esc(x.name)} (${x.students.length})</option>`).join('')}</select></div>
    <div class="cl-impmode">
      <label class="cl-how ${CP.mode==='copy'?'on':''}"><input type="radio" name="cpm" value="copy" hidden ${CP.mode==='copy'?'checked':''} onchange="Class._cpMode('copy')"><b>📋 ចម្លង</b><span>សិស្សនៅថ្នាក់ទាំងពីរ • គណនីចាស់នៅថ្នាក់ដើម (បង្កើតគណនីថ្មីនៅ 🔑 បាន)</span></label>
      <label class="cl-how ${CP.mode==='move'?'on':''}"><input type="radio" name="cpm" value="move" hidden ${CP.mode==='move'?'checked':''} onchange="Class._cpMode('move')"><b>➡️ ផ្លាស់ទី</b><span>ដកចេញពីថ្នាក់ដើម • គណនី PIN និងវឌ្ឍនភាពរៀនទៅតាមសិស្ស</span></label>
    </div>
    <label class="row" style="gap:6px;margin:10px 0 4px"><input type="checkbox" onchange="document.querySelectorAll('.cp-s:not(:disabled)').forEach(x=>x.checked=this.checked)"> <b>ជ្រើសទាំងអស់</b></label>
    <div class="cp-list">${src.students.map(s=>{ const dup=has.has((s.name||'').trim()); return `<label class="cp-i ${dup?'dup':''}"><input type="checkbox" class="cp-s" value="${s.id}" ${dup?'disabled':''}>${avatar(s,34)}<span>${esc(s.name)}${s.latin?`<small>${esc(s.latin)}</small>`:''}</span>${dup?'<em>មានរួចហើយ</em>':''}</label>`; }).join('')||'<p class="note">ថ្នាក់នេះមិនមានសិស្ស</p>'}</div>
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" onclick="closeModal()">បោះបង់</button><button class="btn teal" onclick="Class._cpGo()">✅ ${CP.mode==='move'?'ផ្លាស់ទី':'ចម្លង'}</button></div>`);
}
function cpGo(){
  const c=cls(), src=C.classes.find(x=>x.id===CP.src); if(!c||!src) return;
  const ids=[...document.querySelectorAll('.cp-s:checked')].map(x=>x.value); if(!ids.length) return toast('សូមជ្រើសសិស្សយ៉ាងហោចណាស់ម្នាក់');
  if(CP.mode==='move' && !confirm(`ផ្លាស់ទីសិស្ស ${ids.length} នាក់ ពី «${src.name}» ទៅ «${c.name}»?\nពិន្ទុប្រចាំខែចាស់នៅថ្នាក់ដើម។`)) return;
  let n=0, acc=0;
  ids.forEach(id=>{ const s=src.students.find(x=>x.id===id); if(!s) return; const ns={...JSON.parse(JSON.stringify(s)), id:uid()}; c.students.push(ns); n++;
    if(CP.mode==='move'){ src.students=src.students.filter(x=>x.id!==id); if(window.Auth&&Auth.moveStudent&&Auth.moveStudent(src.id,id,c.id,ns.id)) acc++; } });
  saveC(); closeModal(); render(); toast(`✅ បាន${CP.mode==='move'?'ផ្លាស់ទី':'ចម្លង'}សិស្ស ${n} នាក់${acc?` • គណនី ${acc}`:''}`);
}

/* ---------- students ---------- */
function tStudents(c){
  $('#clTab').innerHTML = `<div class="panel">
    <div class="row" style="justify-content:space-between;margin-bottom:14px">
      <h3 class="sec" style="margin:0">👩‍🎓 បញ្ជីសិស្ស (${c.students.length})${(()=>{ const nl=c.students.filter(x=>!x.latin).length, nd=c.students.filter(x=>!x.dob).length, ng=c.students.filter(x=>!x.g).length; return (nl||nd||ng)&&c.students.length?`<span class="cl-miss" onclick="Class.infoTable()" title="ចុចដើម្បីបំពេញ">⚠️ ${[nl?'ខ្វះឈ្មោះឡាតាំង '+nl:'',nd?'ខ្វះថ្ងៃកំណើត '+nd:'',ng?'ខ្វះភេទ '+ng:''].filter(Boolean).join(' • ')}</span>`:''; })()}</h3>
      <div class="row"><button class="btn teal" onclick="Class.editStudent()">＋ បន្ថែមសិស្ស</button><button class="btn ghost" onclick="Class.bulk()">📥 នាំចូល (Excel)</button><button class="btn ghost" onclick="Class.copyFrom()">📋 ចម្លងពីថ្នាក់ផ្សេង</button><button class="btn ghost" onclick="Class.photoBulk()">🖼 រូបថតជាបាច់</button><button class="btn ghost" onclick="Class.infoTable()">📝 កែព័ត៌មានជាតារាង</button><button class="btn ghost" onclick="Class.template()">⬇ គំរូ Excel</button><button class="btn ghost" onclick="Class.sortStudents()">🔤 តម្រៀប</button></div>
    </div>
    ${c.students.length?`<div class="cl-grid">${c.students.map((s,i)=>`
      <div class="cl-card" style="animation-delay:${Math.min(i,30)*0.025}s">
        <div class="cl-no">${i+1}</div>
        <label class="cl-ph" title="ប្តូររូបថត">${avatar(s,86)}<input type="file" accept="image/*" hidden onchange="Class.photo('${s.id}',this.files[0])"><span>📷</span></label>
        <b>${esc(s.name)}</b>${s.latin?`<em class="cl-lat">${esc(s.latin)}</em>`:''}<small>${s.g==='F'?'👩 ស្រី':s.g==='M'?'👦 ប្រុស':'⚪ មិនទាន់កំណត់ភេទ'}${s.code?' • '+esc(s.code):''}</small>${s.dob?`<small class="cl-dob">🎂 ${fmtDob(s.dob)}${ageOf(s.dob)!=null?' • '+ageOf(s.dob)+' ឆ្នាំ':''}</small>`:''}
        <div class="row" style="justify-content:center;gap:4px"><button class="btn ghost sm" onclick="Class.editStudent('${s.id}')">✎</button><button class="btn ghost sm" onclick="Class.delStudent('${s.id}')">🗑</button></div>
      </div>`).join('')}</div>`:`<div class="cl-empty"><div style="font-size:54px">🧑‍🎓</div><p class="km">មិនទាន់មានសិស្ស — ចុច «＋ បន្ថែមសិស្ស» ឬ «📥 នាំចូល (Excel)»</p></div>`}
    <p class="note" style="margin-top:12px">💡 ចុចលើរូប ដើម្បីដាក់/ប្តូររូបថត • រូបត្រូវបានកាត់ជាការ៉េ ហើយបង្រួមដោយស្វ័យប្រវត្តិ • សូមចុច ⬇ Backup ជាប្រចាំ ដើម្បីការពារទិន្នន័យ</p></div>`;
}
let camStream=null, editPhoto=null;
function editStudent(id){
  const c=cls(), s=id?c.students.find(x=>x.id===id):{name:'',latin:'',dob:'',g:'M',code:'',photo:null};
  editPhoto=s.photo||null;
  modal(`<h3>${id?'✎ កែព័ត៌មានសិស្ស':'＋ បន្ថែមសិស្សថ្មី'}</h3>
    <div class="cl-edit">
      <div class="cl-edph"><div id="clPrev">${avatar({...s,photo:editPhoto},140)}</div><video id="clCam" autoplay playsinline hidden></video>
        <div class="row" style="justify-content:center;margin-top:8px"><label class="btn ghost sm">🖼 ជ្រើសរូប<input type="file" accept="image/*" hidden onchange="Class.pickPhoto(this.files[0])"></label><button class="btn ghost sm" id="clCamBtn" onclick="Class.cam()">📷 ថតរូប</button>${editPhoto?`<button class="btn ghost sm" onclick="Class.noPhoto()">✕</button>`:''}</div></div>
      <div class="cl-edf">
        <label>ឈ្មោះសិស្ស (ខ្មែរ)<input id="clN" class="cl-in" value="${esc(s.name)}" placeholder="ឧ. សុខ ដារា"></label>
        <label>ឈ្មោះឡាតាំង <span class="note">(ស្រេចចិត្ត — បញ្ចូលពេលក្រោយក៏បាន)</span><input id="clLat" class="cl-in" value="${esc(s.latin||'')}" placeholder="ឧ. SOK Dara"></label>
        <label>ថ្ងៃខែឆ្នាំកំណើត <span class="note">(ស្រេចចិត្ត)</span><div class="row"><input id="clDob" type="date" class="cl-in" value="${esc(s.dob||'')}" max="${new Date().toISOString().slice(0,10)}" oninput="$('#clAge').textContent=this.value&&Class.age(this.value)!=null?Class.age(this.value)+' ឆ្នាំ':''"><span id="clAge" class="cl-mname" style="font-size:14px">${s.dob&&ageOf(s.dob)!=null?ageOf(s.dob)+' ឆ្នាំ':''}</span></div></label>
        <label>ភេទ<div class="row"><label class="cl-radio"><input type="radio" name="clG" value="M" ${s.g==='M'?'checked':''}> 👦 ប្រុស</label><label class="cl-radio"><input type="radio" name="clG" value="F" ${s.g==='F'?'checked':''}> 👩 ស្រី</label></div></label>
        <label>លេខសម្គាល់ (ស្រេចចិត្ត)<input id="clCode" class="cl-in" value="${esc(s.code||'')}" placeholder="ឧ. 001"></label>
      </div>
    </div>
    <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn ghost" onclick="Class.camStop();closeModal()">បោះបង់</button><button class="btn teal" onclick="Class.saveStudent('${id||''}')">💾 រក្សាទុក</button></div>`);
  setTimeout(()=>$('#clN')&&$('#clN').focus(),50);
}
function pickPhoto(f){ if(!f) return; resizePhoto(f, d=>{ editPhoto=d; $('#clPrev').innerHTML=`<img class="cl-av" src="${d}" style="width:140px;height:140px">`; }); }
async function cam(){
  const v=$('#clCam'), b=$('#clCamBtn');
  if(camStream){ const cv=document.createElement('canvas'); const s=Math.min(v.videoWidth,v.videoHeight); cv.width=cv.height=200; cv.getContext('2d').drawImage(v,(v.videoWidth-s)/2,(v.videoHeight-s)/2,s,s,0,0,200,200); editPhoto=cv.toDataURL('image/jpeg',.8); camStop(); $('#clPrev').innerHTML=`<img class="cl-av" src="${editPhoto}" style="width:140px;height:140px">`; $('#clPrev').hidden=false; b.textContent='📷 ថតរូប'; return; }
  try{ camStream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480}}); v.srcObject=camStream; v.hidden=false; $('#clPrev').hidden=true; b.textContent='📸 ចុចដើម្បីថត'; }
  catch(e){ toast('មិនអាចបើកកាមេរ៉ាបានទេ — សូមជ្រើសរូបពីកុំព្យូទ័រ'); }
}
function camStop(){ if(camStream){ camStream.getTracks().forEach(t=>t.stop()); camStream=null; } const v=$('#clCam'); if(v) v.hidden=true; }
function saveStudent(id){
  const c=cls(), name=$('#clN').value.trim(); if(!name) return toast('សូមបញ្ចូលឈ្មោះសិស្ស');
  const g=(document.querySelector('input[name=clG]:checked')||{}).value||'', code=$('#clCode').value.trim();
  const latin=$('#clLat').value.trim(), dob=$('#clDob').value||'';
  if(id){ Object.assign(c.students.find(x=>x.id===id),{name,latin,dob,g,code,photo:editPhoto}); }
  else c.students.push({id:uid(),name,latin,dob,g,code,photo:editPhoto});
  camStop(); if(saveC()){ closeModal(); render(); toast('✅ បានរក្សាទុក '+name); }
}
function photo(id,f){ if(!f) return; resizePhoto(f,d=>{ cls().students.find(x=>x.id===id).photo=d; if(saveC()) render(); }); }
function delStudent(id){ const c=cls(), s=c.students.find(x=>x.id===id); if(!confirm('លុបសិស្ស «'+s.name+'» និងពិន្ទុរបស់គាត់?')) return; c.students=c.students.filter(x=>x.id!==id); Object.values(c.scores).forEach(m=>delete m[id]); saveC(); render(); }
/* ---------- import (paste from Excel or .csv file) ---------- */
let IMP=null;
function bulk(){
  modal(`<h3>📥 នាំចូលព័ត៌មានសិស្ស</h3>
    <p class="note">ចម្លងពី Excel (ជួរឈរ៖ <b>ឈ្មោះខ្មែរ | ឈ្មោះឡាតាំង | ភេទ | ថ្ងៃខែឆ្នាំកំណើត</b>) ហើយបិទភ្ជាប់ខាងក្រោម ឬជ្រើសឯកសារ .csv។ ជួរឈរក្រោយៗអាចទុកទទេបាន។ ថ្ងៃកំណើតទទួលទម្រង់ 25/03/2015, 2015-03-25 ។ ភេទ៖ ប្រុស/ស្រី ឬ ប/ស ឬ M/F។</p>
    <div class="cl-impmode">
      <label class="cl-how on"><input type="radio" name="impm" value="add" checked hidden onchange="Class.impMode(this)"><b>＋ បន្ថែម និងបំពេញ</b><span>សិស្សថ្មីនឹងត្រូវបន្ថែម • សិស្សមានស្រាប់ (ឈ្មោះដូចគ្នា) នឹងបំពេញព័ត៌មានដែលខ្វះ</span></label>
      <label class="cl-how"><input type="radio" name="impm" value="update" hidden onchange="Class.impMode(this)"><b>✎ បំពេញតែសិស្សមានស្រាប់</b><span>មិនបន្ថែមសិស្សថ្មី — សម្រាប់បញ្ចូលឈ្មោះឡាតាំង/ថ្ងៃកំណើតតាមក្រោយ</span></label>
    </div>
    <textarea id="clBulk" class="names" style="height:170px" placeholder="សុខ ដារា&#9;SOK DARA&#9;ប្រុស&#9;12/05/2014&#10;ចាន់ សុភា&#9;CHAN SOPHEA&#9;ស្រី&#9;03/11/2014&#10;លី វណ្ណា" oninput="Class.impPreview()"></textarea>
    <div class="row" style="margin-top:8px"><label class="btn ghost sm">📄 ជ្រើសឯកសារ .csv<input type="file" accept=".csv,.txt" hidden onchange="Class.impFile(this.files[0])"></label><label class="note"><input type="checkbox" id="impOver"> សរសេរជាន់ព័ត៌មានចាស់ (បើមិនធីក បំពេញតែកន្លែងទទេ)</label></div>
    <div id="clImpPrev" class="cl-imp"></div>
    <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn ghost" onclick="closeModal()">បោះបង់</button><button class="btn teal" id="impGo" disabled onclick="Class.impApply()">📥 នាំចូល</button></div>`);
}
function impMode(el){ document.querySelectorAll('.cl-impmode .cl-how').forEach(l=>l.classList.toggle('on', l.contains(el))); impPreview(); }
function impFile(f){ if(!f) return; f.text().then(t=>{ $('#clBulk').value=t.replace(/^﻿/,''); impPreview(); }); }
function splitLine(l){ if(l.includes('\t')) return l.split('\t'); const out=[]; let cur='',q=false; for(const ch of l){ if(ch==='"'){ q=!q; continue; } if(ch===','&&!q){ out.push(cur); cur=''; } else cur+=ch; } out.push(cur); return out; }
const norm = x => String(x||'').replace(/\s+/g,' ').trim().toLowerCase();
function impParse(){
  const c=cls(), mode=(document.querySelector('input[name=impm]:checked')||{}).value||'add';
  const lines=$('#clBulk').value.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const rows=[];
  lines.forEach((l,i)=>{
    let p=splitLine(l).map(x=>x.trim());
    if(i===0 && /ឈ្មោះ|name|ភេទ|gender/i.test(l) && !parseDate(p[3])) return;           // header row
    if(/^\d+$/.test(p[0]) && p.length>1 && !/^\d+$/.test(p[1])) p=p.slice(1);              // leading "No." column
    let [name,latin,g,dob]=p;
    // allow old format "name, ស"
    if(parseGender(latin) && !g){ g=latin; latin=''; }
    if(latin && parseDate(latin) && !dob){ dob=latin; latin=''; }
    if(g && parseDate(g) && !dob){ dob=g; g=''; }
    const d=parseDate(dob);
    if(!name && !latin) return;
    const match=c.students.find(s=>(name&&norm(s.name)===norm(name)) || (latin&&s.latin&&norm(s.latin)===norm(latin)));
    rows.push({name:name||'', latin:(latin||'').trim(), g:parseGender(g), dob:d||'', badDate: dob && d===null ? dob : '', match, act: match?'update':(mode==='add'&&name?'add':'skip')});
  });
  return rows;
}
function impPreview(){
  IMP=impParse(); const n={add:0,update:0,skip:0}; IMP.forEach(r=>n[r.act]++);
  $('#impGo').disabled = !(n.add+n.update);
  $('#clImpPrev').innerHTML = !IMP.length ? '' : `<div class="cl-impsum"><span class="a">＋ ថ្មី ${n.add}</span><span class="u">✎ បំពេញ ${n.update}</span>${n.skip?`<span class="s">⏭ រកមិនឃើញ ${n.skip}</span>`:''}</div>
    <div class="cl-tablewrap" style="max-height:210px"><table class="cl-table"><thead><tr><th></th><th class="l">ឈ្មោះ</th><th class="l">ឡាតាំង</th><th>ភេទ</th><th>ថ្ងៃកំណើត</th></tr></thead><tbody>
    ${IMP.map(r=>`<tr class="act-${r.act}"><td>${r.act==='add'?'＋':r.act==='update'?'✎':'⏭'}</td><td class="l">${esc(r.name)}</td><td class="l">${esc(r.latin)}</td><td>${gname(r.g)}</td><td>${r.dob?fmtDob(r.dob):r.badDate?`<span style="color:var(--rose)">⚠️ ${esc(r.badDate)}</span>`:'—'}</td></tr>`).join('')}</tbody></table></div>`;
}
function impApply(){
  const c=cls(), over=$('#impOver').checked; let a=0,u=0;
  (IMP||[]).forEach(r=>{
    if(r.act==='add'){ c.students.push({id:uid(),name:r.name,latin:r.latin,dob:r.dob,g:r.g||'',code:'',photo:null}); a++; }
    else if(r.act==='update'){ const s=r.match, set=(k,v)=>{ if(v && (over || !s[k])) s[k]=v; };
      set('latin',r.latin); set('dob',r.dob); if(r.g && (over || !s.g)) s.g=r.g; if(!s.name && r.name) s.name=r.name; u++; }
  });
  saveC(); closeModal(); render(); toast(`✅ បន្ថែម ${a} នាក់ • បំពេញ ${u} នាក់`);
}
/* ---------- quick info table (fill latin / DOB later) ---------- */
function infoTable(){
  const c=cls();
  modal(`<h3>📝 កែព័ត៌មានសិស្សជាតារាង</h3><p class="note">វាយបញ្ចូលផ្ទាល់ — Enter / ↓ = ចុះក្រោម • រក្សាទុកពេលចុច 💾</p>
    <div class="cl-tablewrap" style="max-height:60vh"><table class="cl-table" id="clInfo"><thead><tr><th>#</th><th></th><th class="l">ឈ្មោះខ្មែរ</th><th class="l">ឈ្មោះឡាតាំង</th><th>ភេទ</th><th>ថ្ងៃខែឆ្នាំកំណើត</th></tr></thead><tbody>
    ${c.students.map((s,i)=>`<tr data-sid="${s.id}"><td>${i+1}</td><td>${avatar(s,30)}</td>
      <td class="l"><input class="cl-in w" data-k="name" data-r="${i}" data-j="0" value="${esc(s.name)}"></td>
      <td class="l"><input class="cl-in w up" data-k="latin" data-r="${i}" data-j="1" value="${esc(s.latin||'')}" placeholder="SOK DARA"></td>
      <td><select class="cl-in" data-k="g" data-r="${i}" data-j="2"><option value="" ${!s.g?'selected':''}>—</option><option value="M" ${s.g==='M'?'selected':''}>ប្រុស</option><option value="F" ${s.g==='F'?'selected':''}>ស្រី</option></select></td>
      <td><input class="cl-in" type="date" data-k="dob" data-r="${i}" data-j="3" value="${esc(s.dob||'')}"></td></tr>`).join('')}</tbody></table></div>
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" onclick="closeModal()">បោះបង់</button><button class="btn teal" onclick="Class.infoSave()">💾 រក្សាទុក</button></div>`);
  $('#modal').classList.add('wide');
  const t=$('#clInfo');
  t.addEventListener('keydown',e=>{ const el=e.target; if(!el.dataset.r || el.type==='date' && e.key!=='Enter') return; const r=+el.dataset.r, j=el.dataset.j; let n=null;
    if(e.key==='Enter'||e.key==='ArrowDown') n=t.querySelector(`[data-r="${r+1}"][data-j="${j}"]`); if(e.key==='ArrowUp') n=t.querySelector(`[data-r="${r-1}"][data-j="${j}"]`);
    if(n){ e.preventDefault(); n.focus(); n.select&&n.select(); } });
}
function infoSave(){
  const c=cls();
  document.querySelectorAll('#clInfo tbody tr').forEach(tr=>{ const s=c.students.find(x=>x.id===tr.dataset.sid); if(!s) return;
    tr.querySelectorAll('[data-k]').forEach(el=>{ let v=el.value.trim(); if(el.dataset.k==='name' && !v) return; s[el.dataset.k]=v; }); });
  saveC(); closeModal(); render(); toast('✅ បានរក្សាទុកព័ត៌មានសិស្ស');
}
function template(){
  const c=cls(); const rows=[['ល.រ','ឈ្មោះខ្មែរ','ឈ្មោះឡាតាំង','ភេទ','ថ្ងៃខែឆ្នាំកំណើត (dd/mm/yyyy)'],...(c.students.length?c.students.map((s,i)=>[i+1,s.name,s.latin||'',s.g?gname(s.g):'',fmtDob(s.dob)]):[[1,'សុខ ដារា','SOK DARA','ប្រុស','12/05/2014']])];
  download(`${c.name} - បញ្ជីសិស្ស.csv`, '﻿'+rows.map(r=>r.map(csvEsc).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
  toast('⬇ បំពេញក្នុង Excel រួចនាំចូលវិញតាម 📥');
}
function sortStudents(){ const c=cls(); c.students.sort((a,b)=>a.name.localeCompare(b.name,'km')); saveC(); render(); }

/* ---------- scores (monthly) ---------- */
function monthBar(c, extra){
  const ms=monthsWithData(c);
  return `<div class="row cl-mbar"><label class="km">📅 ខែ <input type="month" class="cl-in" value="${C.month}" onchange="Class.setMonth(this.value)"></label>
    <span class="cl-mname">${monthName(C.month)}</span>
    ${ms.length?`<span class="note">ខែមានពិន្ទុ៖</span>${ms.map(m=>`<button class="chip ${m===C.month?'on':''}" onclick="Class.setMonth('${m}')">${monthName(m)}</button>`).join('')}`:''}
    <span style="flex:1"></span>${extra||''}</div>`;
}
function tScores(c){
  if(!c.students.length){ $('#clTab').innerHTML=`<div class="panel cl-empty"><p class="km">សូមបន្ថែមសិស្សជាមុនសិន</p><button class="btn teal" onclick="Class.render('students')">👩‍🎓 ទៅបញ្ជីសិស្ស</button></div>`; return; }
  const mt=maxTotal(c), m=C.month;
  $('#clTab').innerHTML = `<div class="panel">
    ${monthBar(c, `<button class="btn ghost sm" onclick="Class.cols()">⚙️ ផ្នែកពិន្ទុ</button><button class="btn sun sm" onclick="Class.render('results')">🏅 មើលលទ្ធផល</button>`)}
    <div class="cl-tablewrap"><table class="cl-table" id="clScore">
      <thead><tr><th>#</th><th></th><th class="l">ឈ្មោះ</th>${c.cols.map(x=>`<th>${esc(x.n)}<small>${esc(x.en)} /${x.max}</small></th>`).join('')}<th>សរុប<small>/${mt}</small></th><th>%</th></tr></thead>
      <tbody>${c.students.map((s,i)=>{ const r=rowOf(c,m,s.id), t=totalOf(c,m,s.id);
        return `<tr data-sid="${s.id}"><td>${i+1}</td><td>${avatar(s,34)}</td><td class="l"><b>${esc(s.name)}</b>${s.latin?`<small>${esc(s.latin)}</small>`:''}</td>
        ${c.cols.map((x,j)=>`<td><input class="cl-sc" type="number" inputmode="decimal" min="0" max="${x.max}" step="0.5" data-c="${x.id}" data-max="${x.max}" data-r="${i}" data-j="${j}" value="${r[x.id]??''}"></td>`).join('')}
        <td class="tot">${t==null?'—':+t.toFixed(2)}</td><td class="pct">${t==null?'—':Math.round(t/mt*100)+'%'}</td></tr>`; }).join('')}</tbody>
    </table></div>
    <p class="note">⌨️ Enter / ↓ = សិស្សបន្ទាប់ • Tab = ផ្នែកបន្ទាប់ • ពិន្ទុរក្សាទុកដោយស្វ័យប្រវត្តិ • ពិន្ទុលើសអតិបរមាត្រូវកែដោយស្វ័យប្រវត្តិ</p></div>`;
  const tb=$('#clScore');
  tb.addEventListener('input', e=>{ const i=e.target; if(!i.classList.contains('cl-sc')) return; scoreInput(i); });
  tb.addEventListener('keydown', e=>{ const i=e.target; if(!i.classList.contains('cl-sc')) return;
    const r=+i.dataset.r, j=+i.dataset.j; let n=null;
    if(e.key==='Enter'||e.key==='ArrowDown') n=tb.querySelector(`[data-r="${r+1}"][data-j="${j}"]`);
    if(e.key==='ArrowUp') n=tb.querySelector(`[data-r="${r-1}"][data-j="${j}"]`);
    if(n){ e.preventDefault(); n.focus(); n.select(); } });
}
function scoreInput(i){
  const c=cls(), m=C.month, sid=i.closest('tr').dataset.sid, mx=+i.dataset.max;
  let v=i.value===''?null:parseFloat(i.value);
  if(v!=null && v>mx){ v=mx; i.value=mx; i.classList.add('clamp'); setTimeout(()=>i.classList.remove('clamp'),600); }
  if(v!=null && v<0){ v=0; i.value=0; }
  const M=c.scores[m]=c.scores[m]||{}, R=M[sid]=M[sid]||{};
  if(v==null) delete R[i.dataset.c]; else R[i.dataset.c]=v;
  if(!Object.keys(R).length) delete M[sid];
  saveC();
  const tr=i.closest('tr'), t=totalOf(c,m,sid), mt=maxTotal(c);
  tr.querySelector('.tot').textContent = t==null?'—':+t.toFixed(2);
  tr.querySelector('.pct').textContent = t==null?'—':Math.round(t/mt*100)+'%';
}
function cols(){
  const c=cls();
  modal(`<h3>⚙️ ផ្នែកពិន្ទុ (ពិន្ទុអតិបរមា)</h3><p class="note">កែឈ្មោះ ឬពិន្ទុអតិបរមា ឬបន្ថែម/លុបផ្នែកបាន។ សរុប = ផលបូកផ្នែកទាំងអស់។</p>
    <div id="clCols">${c.cols.map((x,i)=>`<div class="row cl-colrow"><input class="cl-in" value="${esc(x.n)}" data-k="n"><input class="cl-in" value="${esc(x.en)}" data-k="en"><input class="cl-in" type="number" style="width:80px" value="${x.max}" data-k="max"><button class="btn ghost sm" onclick="this.parentNode.remove()">🗑</button></div>`).join('')}</div>
    <div class="row" style="justify-content:space-between;margin-top:10px"><button class="btn ghost sm" onclick="Class.colAdd()">＋ ផ្នែកថ្មី</button><button class="btn teal" onclick="Class.colSave()">💾 រក្សាទុក</button></div>`);
}
function colAdd(){ $('#clCols').insertAdjacentHTML('beforeend',`<div class="row cl-colrow"><input class="cl-in" value="ផ្នែកថ្មី" data-k="n"><input class="cl-in" value="New" data-k="en"><input class="cl-in" type="number" style="width:80px" value="10" data-k="max"><button class="btn ghost sm" onclick="this.parentNode.remove()">🗑</button></div>`); }
function colSave(){
  const c=cls(), old=c.cols;
  const rows=[...document.querySelectorAll('.cl-colrow')].map((r,i)=>{ const g=k=>r.querySelector(`[data-k=${k}]`).value.trim(); const keep=old[i]; return {id:(keep&&keep.n===g('n'))?keep.id:(old.find(o=>o.n===g('n'))||{}).id||uid(), n:g('n')||'—', en:g('en'), max:Math.max(1,+g('max')||10)}; });
  if(!rows.length) return toast('ត្រូវមានយ៉ាងហោចណាស់មួយផ្នែក');
  c.cols=rows; saveC(); closeModal(); render(); toast('✅ បានរក្សាទុកផ្នែកពិន្ទុ');
}

/* ---------- monthly results ---------- */
function tResults(c){
  const m=C.month, R=results(c,m), mt=maxTotal(c), has=R.filter(r=>r.t!=null);
  const avg = has.length ? has.reduce((a,r)=>a+r.p,0)/has.length : 0;
  const top = has.filter(r=>r.rank<=3).slice(0,3);
  const pod = [top[1],top[0],top[2]];
  const dist = GRADES.map(g=>({g, n:has.filter(r=>grade(r.p)===g).length}));
  $('#clTab').innerHTML = `<div class="panel">
    ${monthBar(c, `${shareBtn(c,'res')}<button class="btn sm" style="background:linear-gradient(135deg,#b45309,#f59e0b)" onclick="Class.certs()">🏆 ប័ណ្ណសរសើរ</button><button class="btn ghost sm" onclick="Class.csv()">📊 Excel (CSV)</button><button class="btn sun sm" onclick="Class.printMonth()">🖨 បោះពុម្ព / PDF</button>`)}
    ${!has.length?`<div class="cl-empty"><div style="font-size:54px">📭</div><p class="km">មិនទាន់មានពិន្ទុសម្រាប់${monthName(m)}</p><button class="btn teal" onclick="Class.render('scores')">✏️ ដាក់ពិន្ទុ</button></div>`:`
    <div class="cl-res">
      <div class="cl-podium">${pod.map((r,k)=>r?`<div class="pd p${[2,1,3][k]}" style="animation-delay:${[.3,.1,.5][k]}s">
          <div class="crown">${['🥈','🥇','🥉'][k]}</div>${avatar(r.s,[74,96,70][k])}<b>${esc(r.s.name)}</b><span>${+r.t.toFixed(2)} • ${Math.round(r.p)}%</span><div class="base">${r.rank}</div></div>`:'<div class="pd empty"></div>').join('')}</div>
      <div class="cl-stats">
        <div class="stat"><b>${has.length}/${c.students.length}</b><span>សិស្សមានពិន្ទុ</span></div>
        <div class="stat"><b>${avg.toFixed(1)}%</b><span>មធ្យមភាគថ្នាក់</span></div>
        <div class="stat"><b>${has.filter(r=>r.p>=50).length}</b><span>ជាប់ (≥50%)</span></div>
        <div class="cl-dist">${dist.map(d=>`<div><i style="height:${has.length?d.n/has.length*100:0}%;background:${d.g[3]}"></i><b>${d.n}</b><span>${d.g[1]}</span></div>`).join('')}</div>
      </div>
    </div>
    <div class="cl-tablewrap"><table class="cl-table res">
      <thead><tr><th>ចំណាត់ថ្នាក់</th><th></th><th class="l">ឈ្មោះ</th>${c.cols.map(x=>`<th>${esc(x.n)}<small>/${x.max}</small></th>`).join('')}<th>សរុប<small>/${mt}</small></th><th>%</th><th>និទ្ទេស</th></tr></thead>
      <tbody>${R.map((r,i)=>{ const g=r.p==null?null:grade(r.p); return `<tr style="animation-delay:${Math.min(i,30)*0.03}s"><td><span class="rk r${r.rank||0}">${r.rank||'—'}</span></td><td>${avatar(r.s,34)}</td><td class="l"><b>${esc(r.s.name)}</b><small>${r.s.latin?esc(r.s.latin)+' • ':''}${gname(r.s.g)}</small></td>
        ${c.cols.map(x=>`<td>${r.r[x.id]??'—'}</td>`).join('')}<td class="tot">${r.t==null?'—':+r.t.toFixed(2)}</td><td>${r.p==null?'—':r.p.toFixed(1)+'%'}</td>
        <td>${g?`<span class="gr" style="background:${g[3]}">${g[1]} ${g[2]}</span>`:'—'}</td></tr>`; }).join('')}</tbody></table></div>`}
  </div>`;
  if(has.length && window.pageConfetti && !tResults._shown){ tResults._shown=true; }
}
function csvEsc(v){ v=String(v==null?'':v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }
function download(name, text, type){ const b=new Blob([text],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; a.click(); }
function csv(){
  const c=cls(), m=C.month, R=results(c,m), mt=maxTotal(c);
  const head=['ចំណាត់ថ្នាក់','ឈ្មោះ','ឈ្មោះឡាតាំង','ភេទ','ថ្ងៃកំណើត',...c.cols.map(x=>`${x.n} (${x.en}) /${x.max}`),`សរុប /${mt}`,'%','និទ្ទេស'];
  const rows=R.map(r=>{ const g=r.p==null?null:grade(r.p); return [r.rank||'',r.s.name,r.s.latin||'',gname(r.s.g),fmtDob(r.s.dob),...c.cols.map(x=>r.r[x.id]??''),r.t==null?'':+r.t.toFixed(2),r.p==null?'':r.p.toFixed(1),g?g[1]+' '+g[2]:'']; });
  download(`${c.name} - ${monthName(m)}.csv`, '﻿'+[[`${c.name} — លទ្ធផល${monthName(m)}`],head,...rows].map(r=>r.map(csvEsc).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
}
function printMonth(){
  const c=cls(), m=C.month, R=results(c,m), mt=maxTotal(c), has=R.filter(r=>r.t!=null), avg=has.length?has.reduce((a,r)=>a+r.p,0)/has.length:0;
  $('#printArea').innerHTML = `<div class="cl-print"><h1>${esc(c.name)} — លទ្ធផលសិក្សា${monthName(m)}</h1>
    <p>ចំនួនសិស្ស ${c.students.length} នាក់ (ស្រី ${c.students.filter(s=>s.g==='F').length}) • មានពិន្ទុ ${has.length} • មធ្យមភាគថ្នាក់ ${avg.toFixed(1)}% • ជាប់ ${has.filter(r=>r.p>=50).length} នាក់</p>
    <table><thead><tr><th>ល.រ</th><th>រូប</th><th>ឈ្មោះ</th><th>ឈ្មោះឡាតាំង</th><th>ភេទ</th><th>ថ្ងៃកំណើត</th>${c.cols.map(x=>`<th>${esc(x.n)}<br>/${x.max}</th>`).join('')}<th>សរុប<br>/${mt}</th><th>%</th><th>ចំណាត់ថ្នាក់</th><th>និទ្ទេស</th></tr></thead>
    <tbody>${R.map((r,i)=>{ const g=r.p==null?null:grade(r.p); return `<tr><td>${i+1}</td><td>${r.s.photo?`<img src="${r.s.photo}">`:''}</td><td style="text-align:left">${esc(r.s.name)}</td><td style="text-align:left">${esc(r.s.latin||'')}</td><td>${gname(r.s.g)}</td><td>${fmtDob(r.s.dob)}</td>${c.cols.map(x=>`<td>${r.r[x.id]??''}</td>`).join('')}<td><b>${r.t==null?'':+r.t.toFixed(2)}</b></td><td>${r.p==null?'':r.p.toFixed(1)}</td><td><b>${r.rank||''}</b></td><td>${g?g[1]+' '+g[2]:''}</td></tr>`; }).join('')}</tbody></table>
    <div class="cl-sign"><div>បានឃើញ និងឯកភាព<br>នាយកសាលា<br><br><br>.............................</div><div>ថ្ងៃទី......ខែ...........ឆ្នាំ............<br>គ្រូបន្ទុកថ្នាក់<br><br><br>.............................</div></div></div>`;
  window.print();
}


/* ---------- certificates (ប័ណ្ណសរសើរ) ---------- */
const CSTYLES = [['gold','👑 មាស','classic'],['teal','🌿 បៃតង','modern'],['kids','🌈 កុមារ','modern'],['navy','🌌 ខៀវចាស់-មាស','modern'],['minimal','◻️ សាមញ្ញ','modern'],['ribbon','🎀 ខ្សែបូក្រហម','modern'],['geo','🔷 ធរណីមាត្រ','modern'],['royal','💜 ស្វាយរាជ','modern'],['wave','🌊 រលក','modern'],['sunset','🌅 ថ្ងៃរះ','modern']];
const FRAMES = [{"id": "f1", "n": "ក្បាច់ផ្កាបៃតង", "inset": [10.61, 6.88, 10.88, 8.5], "c": "#518f6f"}, {"id": "f2", "n": "ក្បាច់ត្នោតបុរាណ", "inset": [9.55, 6.5, 9.37, 5.94], "c": "#9e8c7a"}, {"id": "f3", "n": "ក្បាច់រាជបៃតង", "inset": [18.39, 8.25, 9.64, 8.25], "c": "#229a1e"}, {"id": "f4", "n": "ក្បាច់ស្លឹកត្នោត", "inset": [18.48, 12.88, 15.74, 13.81], "c": "#ac876f"}, {"id": "f5", "n": "ក្បាច់នាគខៀវ", "inset": [20.25, 13.69, 13.17, 12.56], "c": "#5b6d97"}, {"id": "f6", "n": "ក្បាច់សិង្ហខៀវ", "inset": [12.2, 8.69, 12.91, 9.19], "c": "#54639e"}, {"id": "f7", "n": "ក្បាច់មាស", "inset": [18.3, 10.44, 13.7, 10.06], "c": "#776150"}, {"id": "f8", "n": "ក្បាច់ផ្កាខៀវ", "inset": [9.73, 6.19, 9.64, 6.12], "c": "#30369d"}];
FRAMES.forEach(f=>CSTYLES.push([f.id,'🪷 '+f.n,'khmer']));
function darken(hex,k){ const n=parseInt(hex.slice(1),16); const c=[n>>16,(n>>8)&255,n&255].map(v=>Math.round(v*k)); return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join(''); }
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function certCfg(c){ return c.cert = Object.assign({mode:'rank', top:3, grades:['A'], style:'gold', lang:'both', signers:'both',
  school:'', schoolEn:'', teacher:'', teacherEn:'', principal:'', principalEn:'', sigT:null, sigP:null,
  sigPos:{P:{x:0,y:0,s:1},T:{x:0,y:0,s:1}}, note:'ចំពោះការខិតខំប្រឹងប្រែង និងលទ្ធផលសិក្សាដ៏ល្អប្រសើរ', noteEn:'For outstanding effort and excellent academic results', photo:true}, c.cert||{}); }
function certPick(c, m){
  const cf=certCfg(c), R=results(c,m).filter(r=>r.t!=null);
  return cf.mode==='rank' ? R.filter(r=>r.rank<=cf.top) : R.filter(r=>cf.grades.includes(grade(r.p)[1]));
}
function khDate(d){ d=d||new Date(); return `ថ្ងៃទី${toKhNum(d.getDate())} ខែ${MONTHS_KM[d.getMonth()]} ឆ្នាំ${toKhNum(d.getFullYear())}`; }
function enDate(d){ d=d||new Date(); return `${d.getDate()} ${MONTHS_EN[d.getMonth()]} ${d.getFullYear()}`; }
const ORD = n => n%100>=11&&n%100<=13 ? n+'th' : n+(['th','st','nd','rd'][n%10]||'th');
const GRADE_EN = {A:'Excellent',B:'Very Good',C:'Good',D:'Fairly Good',E:'Average',F:'Weak'};
function certHtml(c, m, r){
  const cf=certCfg(c), g=grade(r.p), st=cf.style, [y,mm]=m.split('-'), L=cf.lang, KM=L!=='en', EN=L!=='km';
  const medal = r.rank===1?'🥇':r.rank===2?'🥈':r.rank===3?'🥉':'🏅';
  const reasonKm = cf.mode==='rank'
    ? `ដែលទទួលបាន <b>ចំណាត់ថ្នាក់លេខ ${toKhNum(r.rank)}</b> ប្រចាំខែ${MONTHS_KM[+mm-1]} ឆ្នាំ${toKhNum(y)} • ថ្នាក់ ${esc(c.name)}`
    : `ដែលទទួលបាន <b>និទ្ទេស ${g[1]} (${g[2]})</b> ប្រចាំខែ${MONTHS_KM[+mm-1]} ឆ្នាំ${toKhNum(y)} • ថ្នាក់ ${esc(c.name)}`;
  const reasonEn = cf.mode==='rank'
    ? `for achieving <b>${ORD(r.rank)} place</b> in ${MONTHS_EN[+mm-1]} ${y} • Class ${esc(c.name)}`
    : `for achieving <b>Grade ${g[1]} (${GRADE_EN[g[1]]})</b> in ${MONTHS_EN[+mm-1]} ${y} • Class ${esc(c.name)}`;
  const corner = `<svg viewBox="0 0 100 100"><path d="M4 4 H60 M4 4 V60" /><path d="M14 14 H44 M14 14 V44"/><circle cx="14" cy="14" r="5"/><path d="M24 4 C40 20 20 40 4 24"/></svg>`;
  const seal = `<div class="ct-seal"><svg viewBox="0 0 120 120">${Array.from({length:24},(_,i)=>`<path d="M60 60 L${60+58*Math.cos(i*Math.PI/12)} ${60+58*Math.sin(i*Math.PI/12)} L${60+58*Math.cos((i+.5)*Math.PI/12)} ${60+58*Math.sin((i+.5)*Math.PI/12)}Z"/>`).join('')}<circle cx="60" cy="60" r="44"/></svg><span>${cf.mode==='rank'?(KM?toKhNum(r.rank):r.rank):g[1]}</span><i></i><i></i></div>`;
  const confetti = st==='kids' ? Array.from({length:26},(_,i)=>`<b class="cf" style="left:${(i*37)%100}%;top:${(i*53)%100}%;transform:rotate(${i*41}deg);background:${['#f43f5e','#f59e0b','#22c55e','#3b82f6','#a855f7'][i%5]}"></b>`).join('') : '';
  const school = KM&&EN ? [cf.school, cf.schoolEn].filter(Boolean).map(esc).join('<br><small>')+(cf.school&&cf.schoolEn?'</small>':'') : esc(KM?cf.school:(cf.schoolEn||cf.school));
  const sign = (who) => {
    const isT=who==='T', img=isT?cf.sigT:cf.sigP, nKm=isT?cf.teacher:cf.principal, nEn=isT?(cf.teacherEn||''):(cf.principalEn||'');
    const top = isT ? [KM?khDate():'', EN?enDate():''].filter(Boolean) : [KM?'បានឃើញ និងឯកភាព':'', EN&&!KM?'Approved by':''].filter(Boolean);
    const role = [KM?(isT?'គ្រូបន្ទុកថ្នាក់':'នាយកសាលា'):'', EN?(isT?'Class Teacher':'Principal'):''].filter(Boolean).join(' / ');
    const name = KM&&EN ? [nKm,nEn].filter(Boolean).join(' • ') : (KM?nKm:(nEn||nKm));
    return `<div class="ct-sign">${top.map(t=>`<span class="${/[a-z]/i.test(t)&&!/[ក-៿]/.test(t)?'en':''}">${esc(t)}</span>`).join('')}<span class="role">${esc(role)}</span>
      <div class="ct-sigimg">${img?`<img src="${img}" alt="" data-sig="${who}" style="transform:translate(${(cf.sigPos[who]||{}).x||0}px,${(cf.sigPos[who]||{}).y||0}px) scale(${(cf.sigPos[who]||{}).s||1})">`:''}</div><em>${esc(name)||'&nbsp;'}</em></div>`;
  };
  const showP = cf.signers!=='teacher', showT = cf.signers!=='principal';
  const FR = FRAMES.find(f=>f.id===st);
  let frameStyle='', certStyle='';
  if(FR){ const [t,rr,b,l]=FR.inset.map(v=>v+1.2), iw=1123*(1-(l+rr)/100), ih=794*(1-(t+b)/100), sc=Math.min(iw/1055, ih/726);
    frameStyle=`left:${l}%;top:${t}%;width:${iw/sc}px;height:${ih/sc}px;transform:scale(${sc})`;
    certStyle=`--ca:${darken(FR.c,.78)};--cb:${darken(FR.c,.6)};--cs:${FR.c};background-image:url(cert-frames/${FR.id}.jpg)`; }
  return `<div class="cert ct-${FR?'khmer':st} lang-${L}" style="${certStyle}">${confetti}${st==='wave'?'<svg class="ct-wv t" viewBox="0 0 1123 140" preserveAspectRatio="none"><path d="M0 0H1123V70C900 140 700 20 500 70S150 120 0 60Z"/><path class="b" d="M0 0H1123V40C880 100 680 0 480 45S140 90 0 30Z"/></svg><svg class="ct-wv bt" viewBox="0 0 1123 140" preserveAspectRatio="none"><path d="M0 140H1123V70C900 0 700 120 500 70S150 20 0 80Z"/><path class="b" d="M0 140H1123V100C880 40 680 140 480 95S140 50 0 110Z"/></svg>':''}${st==='geo'?'<i class="g1"></i><i class="g2"></i><i class="g3"></i><i class="g4"></i>':''}${st==='ribbon'?'<i class="rb1"></i><i class="rb2"></i>':''}
    <div class="ct-frame" style="${frameStyle}"><div class="ct-c tl">${corner}</div><div class="ct-c tr">${corner}</div><div class="ct-c bl">${corner}</div><div class="ct-c br">${corner}</div>
      ${school?`<div class="ct-school">${school}</div>`:''}
      ${KM?`<div class="ct-title">ប័ណ្ណសរសើរ</div>`:`<div class="ct-title en">Certificate of Achievement</div>`}
      ${KM&&EN?`<div class="ct-sub">CERTIFICATE OF ACHIEVEMENT</div>`:''}
      <div class="ct-pres">${[KM?'សូមប្រគល់ជូន':'', EN?'This certificate is proudly presented to':''].filter(Boolean).join(' • ')}</div>
      <div class="ct-who">${cf.photo&&r.s.photo?`<img src="${r.s.photo}">`:''}<div>${KM||!r.s.latin?`<div class="ct-name">${esc(r.s.name)}</div>${EN&&r.s.latin?`<div class="ct-latin">${esc(r.s.latin)}</div>`:''}`:`<div class="ct-name en">${esc(r.s.latin)}</div>`}</div></div>
      ${KM?`<div class="ct-reason">${reasonKm}</div>`:''}
      ${EN?`<div class="ct-reason en ${KM?'':'solo'}">${reasonEn}</div>`:''}
      ${KM&&cf.note?`<div class="ct-note">${esc(cf.note)}</div>`:''}
      ${EN&&cf.noteEn?`<div class="ct-note en">${esc(cf.noteEn)}</div>`:''}
      <div class="ct-foot">
        ${showP?sign('P'):'<div></div>'}
        <div class="ct-mid">${seal}<div class="ct-medal">${medal}</div></div>
        ${showT?sign('T'):'<div></div>'}
      </div>
    </div></div>`;
}
function sigBox(k, label){
  const cf=certCfg(cls()), img=cf[k];
  return `<div class="ct-sigbox"><b>${label}</b><div class="ct-sigprev">${img?`<img src="${img}">`:'<span class="note">គ្មានហត្ថលេខា</span>'}</div>
    <div class="row" style="gap:4px"><label class="btn ghost sm">🖼 រូប<input type="file" accept="image/*" hidden onchange="Class.sigFile('${k}',this.files[0])"></label><button class="btn ghost sm" onclick="Class.sigDraw('${k}')">✍️ គូរ</button>${img?`<button class="btn ghost sm" onclick="Class.certSet('${k}',null)">🗑</button>`:''}</div>
    ${img?`<div class="ct-sigctl"><span>ទំហំ</span><input type="range" min="0.4" max="2.2" step="0.05" value="${(cf.sigPos[k==='sigT'?'T':'P']||{}).s||1}" oninput="Class.sigScale('${k==='sigT'?'T':'P'}',+this.value)"><button class="btn ghost sm" title="ដាក់ទីតាំងដើមវិញ" onclick="Class.sigReset('${k==='sigT'?'T':'P'}')">↺</button></div>`:''}</div>`;
}
function certs(){
  const c=cls(), cf=certCfg(c), m=C.month;
  const ap = results(c,m).filter(r=>r.t!=null);
  if(!ap.length) return toast('មិនទាន់មានពិន្ទុសម្រាប់'+monthName(m));
  const KM=cf.lang!=='en', EN=cf.lang!=='km';
  modal(`<h3>🏆 ប័ណ្ណសរសើរ — ${monthName(m)}</h3>
    <div class="ct-form"><div class="ct-opts">
        <label class="lbl">ផ្តល់ជូនតាម</label>
        <div class="cl-impmode">
          <label class="cl-how ${cf.mode==='rank'?'on':''}"><input type="radio" name="ctm" hidden ${cf.mode==='rank'?'checked':''} onchange="Class.certSet('mode','rank')"><b>🥇 ចំណាត់ថ្នាក់</b><span>សិស្សលេខ ១ ដល់ N</span></label>
          <label class="cl-how ${cf.mode==='grade'?'on':''}"><input type="radio" name="ctm" hidden ${cf.mode==='grade'?'checked':''} onchange="Class.certSet('mode','grade')"><b>🅰️ និទ្ទេស</b><span>សិស្សដែលបាននិទ្ទេសដែលជ្រើស</span></label>
        </div>
        ${cf.mode==='rank'?`<div class="row"><span class="km">លេខ ១ ដល់</span>${[1,3,5,10].map(n=>`<button class="chip ${cf.top===n?'on':''}" onclick="Class.certSet('top',${n})">${n}</button>`).join('')}<input type="number" min="1" max="99" class="cl-in" style="width:64px" value="${cf.top}" onchange="Class.certSet('top',Math.max(1,+this.value||1))"></div>`
        :`<div class="row">${GRADES.map(g=>`<label class="ct-g ${cf.grades.includes(g[1])?'on':''}" style="--gc:${g[3]}"><input type="checkbox" hidden ${cf.grades.includes(g[1])?'checked':''} onchange="Class.certGrade('${g[1]}')">${g[1]} <small>${g[2]}</small></label>`).join('')}</div>`}
        <label class="lbl">🌐 ភាសាលើប័ណ្ណ</label>
        <div class="ct-seg">${[['both','ខ្មែរ + English'],['km','ខ្មែរ'],['en','English']].map(x=>`<button class="${cf.lang===x[0]?'on':''}" onclick="Class.certSet('lang','${x[0]}')">${x[1]}</button>`).join('')}</div>
        <label class="lbl">🎨 គំរូរចនា (${CSTYLES.length})</label>
        ${[['khmer','🪷 ស៊ុមក្បាច់ខ្មែរ'],['modern','✨ ទំនើប'],['classic','👑 បុរាណ']].map(gr=>`<div class="ct-gtitle">${gr[1]}</div><div class="ct-gal">${CSTYLES.filter(x=>x[2]===gr[0]).map(x=>`<button class="ct-th ${cf.style===x[0]?'on':''}" onclick="Class.certSet('style','${x[0]}')" title="${x[1]}"><div class="ct-thin" data-st="${x[0]}"></div><span>${x[1]}</span></button>`).join('')}</div>`).join('')}
        <label class="lbl">🏫 ឈ្មោះសាលា</label>
        ${KM?`<input class="cl-in w100" value="${esc(cf.school)}" placeholder="ឧ. សាលាបឋមសិក្សា ..." onchange="Class.certSet('school',this.value,1)">`:''}
        ${EN?`<input class="cl-in w100" value="${esc(cf.schoolEn)}" placeholder="School name in English" onchange="Class.certSet('schoolEn',this.value,1)">`:''}
        <label class="lbl">✍️ អ្នកចុះហត្ថលេខា</label>
        <div class="ct-seg">${[['both','នាយក + គ្រូ'],['teacher','គ្រូតែម្តង'],['principal','នាយកតែម្តង']].map(x=>`<button class="${cf.signers===x[0]?'on':''}" onclick="Class.certSet('signers','${x[0]}')">${x[1]}</button>`).join('')}</div>
        ${cf.signers!=='teacher'?`<div class="ct-person"><span>👔 នាយកសាលា</span>${KM?`<input class="cl-in" value="${esc(cf.principal)}" placeholder="ឈ្មោះ (ខ្មែរ)" onchange="Class.certSet('principal',this.value,1)">`:''}${EN?`<input class="cl-in" value="${esc(cf.principalEn)}" placeholder="Name (English)" onchange="Class.certSet('principalEn',this.value,1)">`:''}${sigBox('sigP','ហត្ថលេខានាយក')}</div>`:''}
        ${cf.signers!=='principal'?`<div class="ct-person"><span>👩‍🏫 គ្រូបន្ទុកថ្នាក់</span>${KM?`<input class="cl-in" value="${esc(cf.teacher)}" placeholder="ឈ្មោះ (ខ្មែរ)" onchange="Class.certSet('teacher',this.value,1)">`:''}${EN?`<input class="cl-in" value="${esc(cf.teacherEn)}" placeholder="Name (English)" onchange="Class.certSet('teacherEn',this.value,1)">`:''}${sigBox('sigT','ហត្ថលេខាគ្រូ')}</div>`:''}
        <label class="lbl">💬 ពាក្យសរសើរ</label>
        ${KM?`<input class="cl-in w100" value="${esc(cf.note)}" onchange="Class.certSet('note',this.value,1)">`:''}
        ${EN?`<input class="cl-in w100" value="${esc(cf.noteEn)}" onchange="Class.certSet('noteEn',this.value,1)">`:''}
        <label class="km note" style="display:block;margin-top:8px"><input type="checkbox" ${cf.photo?'checked':''} onchange="Class.certSet('photo',this.checked)"> បង្ហាញរូបថតសិស្ស</label>
      </div>
      <div class="ct-side"><div class="ct-list" id="ctList"></div><div><div class="ct-prevwrap"><div class="ct-prev" id="ctPrev"></div></div>
        <p class="note" style="margin-top:8px">🖐 <b>អូសហត្ថលេខាលើប័ណ្ណខាងលើ</b> ដើម្បីផ្លាស់ទីតាំង • កង់កណ្តុរលើហត្ថលេខា = ពង្រីក/បង្រួម • អនុវត្តលើប័ណ្ណទាំងអស់<br>💡 ហត្ថលេខា៖ ស្កេន ឬថតរូបហត្ថលេខាលើក្រដាសស ហើយជ្រើស «🖼 រូប» — ផ្ទៃសនឹងត្រូវលុបចេញដោយស្វ័យប្រវត្តិ។ ឬចុច «✍️ គូរ» ដើម្បីចុះហត្ថលេខាដោយកណ្តុរ/ប៊ិចអេក្រង់។</p></div></div>
    </div>
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" onclick="closeModal()">បិទ</button><button class="btn sun" id="ctPrint" onclick="Class.certPrint()">🖨 បោះពុម្ព / PDF</button></div>`);
  $('#modal').classList.add('wide','xwide');
  certRefresh();
}
let ctSel=0;
function certRefresh(){
  const c=cls(), list=certPick(c,C.month);
  ctSel=Math.min(ctSel, Math.max(0,list.length-1));
  $('#ctList').innerHTML = list.length ? `<div class="note">📜 ប័ណ្ណ ${list.length} សន្លឹក</div>` + list.map((r,i)=>`<button class="${i===ctSel?'on':''}" onclick="Class.certShow(${i})">${avatar(r.s,28)}<span>${esc(r.s.name)}</span><i>${r.rank} • ${grade(r.p)[1]}</i></button>`).join('') : `<div class="note" style="padding:20px">គ្មានសិស្សត្រូវនឹងលក្ខខណ្ឌនេះទេ</div>`;
  $('#ctPrev').innerHTML = list.length ? certHtml(c,C.month,list[ctSel]) : '';
  const w=$('.ct-prevwrap'); if(w) $('#ctPrev').style.setProperty('--pw', w.clientWidth);
  $('#ctPrint').disabled=!list.length; $('#ctPrint').textContent=`🖨 បោះពុម្ព ${list.length} សន្លឹក / PDF`;
  const sample = list[ctSel] || results(c,C.month).find(r=>r.t!=null);
  document.querySelectorAll('.ct-thin').forEach(el=>{ if(el.dataset.done===String(certCfg(c).lang)) return; el.dataset.done=certCfg(c).lang; const cf=certCfg(c), keep=cf.style; cf.style=el.dataset.st; el.innerHTML=sample?certHtml(c,C.month,sample):''; cf.style=keep; });
  sigDragBind();
}
function sigDragBind(){
  const cf=certCfg(cls());
  document.querySelectorAll('#ctPrev img[data-sig]').forEach(img=>{
    img.onpointerdown=e=>{ e.preventDefault(); img.setPointerCapture(e.pointerId); const who=img.dataset.sig, p=cf.sigPos[who]=cf.sigPos[who]||{x:0,y:0,s:1};
      const ratio=img.getBoundingClientRect().width/(img.offsetWidth*(p.s||1)) || 1, sx=e.clientX, sy=e.clientY, ox=p.x||0, oy=p.y||0;
      img.classList.add('drag');
      img.onpointermove=ev=>{ p.x=Math.round(ox+(ev.clientX-sx)/ratio); p.y=Math.round(oy+(ev.clientY-sy)/ratio); img.style.transform=`translate(${p.x}px,${p.y}px) scale(${p.s||1})`; };
      img.onpointerup=()=>{ img.onpointermove=null; img.classList.remove('drag'); saveC(); };
    };
    img.onwheel=e=>{ e.preventDefault(); const who=img.dataset.sig, p=cf.sigPos[who]=cf.sigPos[who]||{x:0,y:0,s:1}; p.s=Math.max(.4,Math.min(2.2,+((p.s||1)+(e.deltaY<0?.05:-.05)).toFixed(2))); img.style.transform=`translate(${p.x||0}px,${p.y||0}px) scale(${p.s})`; const r=document.querySelector(`.ct-sigctl input[oninput*="'${who}'"]`); if(r) r.value=p.s; clearTimeout(sigDragBind.t); sigDragBind.t=setTimeout(saveC,400); };
  });
}
function sigScale(who,v){ const cf=certCfg(cls()); const p=cf.sigPos[who]=cf.sigPos[who]||{x:0,y:0,s:1}; p.s=v; const img=document.querySelector(`#ctPrev img[data-sig="${who}"]`); if(img) img.style.transform=`translate(${p.x||0}px,${p.y||0}px) scale(${v})`; clearTimeout(sigScale.t); sigScale.t=setTimeout(saveC,300); }
function sigReset(who){ const cf=certCfg(cls()); cf.sigPos[who]={x:0,y:0,s:1}; saveC(); certs(); }
function certSet(k,v,quiet){ const c=cls(), cf=certCfg(c); cf[k]=v; saveC(); if(quiet) certRefresh(); else { const sc=$('.ct-opts')?$('.ct-opts').scrollTop:0; certs(); if($('.ct-opts')) $('.ct-opts').scrollTop=sc; } }
function certGrade(g){ const cf=certCfg(cls()); cf.grades = cf.grades.includes(g) ? cf.grades.filter(x=>x!==g) : [...cf.grades,g]; saveC(); certs(); }
/* signature: image file → remove white background → transparent PNG */
function sigClean(src, cb){
  const im=new Image(); im.onload=()=>{
    const sc=Math.min(1, 600/im.width, 220/im.height), w=Math.round(im.width*sc), h=Math.round(im.height*sc);
    const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const x=cv.getContext('2d'); x.drawImage(im,0,0,w,h);
    const d=x.getImageData(0,0,w,h), a=d.data; let minX=w,minY=h,maxX=0,maxY=0;
    for(let i=0;i<a.length;i+=4){ const l=(a[i]*.3+a[i+1]*.59+a[i+2]*.11); if(l>170){ a[i+3]=0; } else { a[i+3]=Math.min(255,(170-l)*3); const p=i/4, px=p%w, py=(p/w)|0; if(px<minX)minX=px; if(px>maxX)maxX=px; if(py<minY)minY=py; if(py>maxY)maxY=py; } }
    x.putImageData(d,0,0);
    if(maxX<=minX) return toast('រកមិនឃើញហត្ថលេខាក្នុងរូបទេ');
    const pad=6, cw=maxX-minX+pad*2, ch=maxY-minY+pad*2, o=document.createElement('canvas'); o.width=cw; o.height=ch;
    o.getContext('2d').drawImage(cv,minX-pad,minY-pad,cw,ch,0,0,cw,ch); cb(o.toDataURL('image/png'));
  }; im.src=src;
}
function sigFile(k,f){ if(!f) return; const fr=new FileReader(); fr.onload=()=>sigClean(fr.result, d=>certSet(k,d)); fr.readAsDataURL(f); }
function sigDraw(k){
  const back=()=>certs();
  modal(`<h3>✍️ ចុះហត្ថលេខា${k==='sigT'?'គ្រូ':'នាយក'}</h3><p class="note">គូរហត្ថលេខាដោយកណ្តុរ ឬប៊ិចអេក្រង់ប៉ះ</p>
    <canvas id="sigPad" width="600" height="220" class="ct-pad"></canvas>
    <div class="row" style="justify-content:space-between;margin-top:10px"><div class="row"><button class="btn ghost sm" onclick="Class._sigClear()">↺ លុប</button>
      ${['#111827','#1d4ed8'].map(c=>`<button class="ct-ink" style="background:${c}" onclick="Class._sigInk('${c}')"></button>`).join('')}</div>
      <div class="row"><button class="btn ghost" onclick="Class.certs()">បោះបង់</button><button class="btn teal" onclick="Class._sigSave('${k}')">💾 ប្រើហត្ថលេខានេះ</button></div></div>`);
  const cv=$('#sigPad'), x=cv.getContext('2d'); let down=false, last=null; x.lineCap='round'; x.lineJoin='round'; x.strokeStyle='#111827';
  const pos=e=>{ const r=cv.getBoundingClientRect(), t=e.touches?e.touches[0]:e; return [(t.clientX-r.left)*cv.width/r.width,(t.clientY-r.top)*cv.height/r.height]; };
  const st=e=>{ e.preventDefault(); down=true; last=pos(e); };
  const mv=e=>{ if(!down) return; e.preventDefault(); const p=pos(e), dist=Math.hypot(p[0]-last[0],p[1]-last[1]); x.lineWidth=Math.max(1.6,4.2-dist*0.12); x.beginPath(); x.moveTo(last[0],last[1]); x.lineTo(p[0],p[1]); x.stroke(); last=p; };
  const up=()=>down=false;
  cv.addEventListener('mousedown',st); cv.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
  cv.addEventListener('touchstart',st,{passive:false}); cv.addEventListener('touchmove',mv,{passive:false}); cv.addEventListener('touchend',up);
  window.Class._sigClear=()=>x.clearRect(0,0,cv.width,cv.height);
  window.Class._sigInk=c=>x.strokeStyle=c;
  window.Class._sigSave=key=>{ const d=x.getImageData(0,0,cv.width,cv.height).data; let any=false; for(let i=3;i<d.length;i+=4) if(d[i]){ any=true; break; } if(!any) return toast('សូមចុះហត្ថលេខាជាមុនសិន');
    // crop to ink
    let minX=cv.width,minY=cv.height,maxX=0,maxY=0; for(let i=3;i<d.length;i+=4) if(d[i]){ const p=(i-3)/4, px=p%cv.width, py=(p/cv.width)|0; minX=Math.min(minX,px); maxX=Math.max(maxX,px); minY=Math.min(minY,py); maxY=Math.max(maxY,py); }
    const pad=6, o=document.createElement('canvas'); o.width=maxX-minX+pad*2; o.height=maxY-minY+pad*2; o.getContext('2d').drawImage(cv,minX-pad,minY-pad,o.width,o.height,0,0,o.width,o.height);
    const cf=certCfg(cls()); cf[key]=o.toDataURL('image/png'); saveC(); certs(); toast('✅ បានរក្សាទុកហត្ថលេខា'); };
}
function certPrint(){
  const c=cls(), list=certPick(c,C.month); if(!list.length) return;
  $('#printArea').innerHTML = `<div class="ct-print">${list.map(r=>certHtml(c,C.month,r)).join('')}</div>`;
  const st=document.createElement('style'); st.id='ctPage'; st.textContent='@page{size:A4 landscape;margin:0}'; document.head.appendChild(st);
  document.body.classList.add('printing-cert');
  const done=()=>{ st.remove(); document.body.classList.remove('printing-cert'); window.removeEventListener('afterprint',done); };
  window.addEventListener('afterprint',done);
  setTimeout(()=>{ window.print(); setTimeout(done,1500); },150);
}
/* ---------- yearly summary ---------- */
function tYear(c){
  const ms=monthsWithData(c);
  if(!ms.length){ $('#clTab').innerHTML=`<div class="panel cl-empty"><p class="km">មិនទាន់មានពិន្ទុខែណាមួយទេ</p></div>`; return; }
  const mt=maxTotal(c);
  const rows=c.students.map(s=>{ const ps=ms.map(m=>{ const t=totalOf(c,m,s.id); return t==null?null:t/mt*100; }); const v=ps.filter(x=>x!=null); return {s,ps,avg:v.length?v.reduce((a,b)=>a+b,0)/v.length:null}; });
  const ranked=rows.filter(r=>r.avg!=null).sort((a,b)=>b.avg-a.avg); ranked.forEach((r,i)=>r.rank=i>0&&Math.abs(ranked[i-1].avg-r.avg)<1e-9?ranked[i-1].rank:i+1);
  rows.sort((a,b)=>(a.rank||999)-(b.rank||999));
  $('#clTab').innerHTML=`<div class="panel"><div class="row" style="justify-content:space-between"><h3 class="sec" style="margin:0">📈 សរុបពិន្ទុគ្រប់ខែ (${ms.length} ខែ) — មធ្យមភាគ %</h3>
    <div class="row">${shareBtn(c,'year')}<button class="btn ghost sm" onclick="Class.csvYear()">📊 Excel (CSV)</button><button class="btn sun sm" onclick="Class.printYear()">🖨 បោះពុម្ព</button></div></div>
    <div class="cl-tablewrap"><table class="cl-table res" id="clYear"><thead><tr><th>ចំណាត់ថ្នាក់</th><th></th><th class="l">ឈ្មោះ</th>${ms.map(m=>`<th>${monthName(m).replace('ខែ','')}</th>`).join('')}<th>មធ្យមភាគ</th><th>និទ្ទេស</th><th>វឌ្ឍនភាព</th></tr></thead>
    <tbody>${rows.map(r=>{ const g=r.avg==null?null:grade(r.avg); const pts=r.ps.map((p,i)=>p==null?null:[i,p]).filter(Boolean);
      const spark = pts.length>1 ? `<svg viewBox="0 0 ${(ms.length-1)*20+4} 34" class="spark"><polyline points="${pts.map(q=>`${q[0]*20+2},${32-q[1]*0.3}`).join(' ')}"/>${pts.map(q=>`<circle cx="${q[0]*20+2}" cy="${32-q[1]*0.3}" r="2.5"/>`).join('')}</svg>` : '';
      return `<tr><td><span class="rk r${r.rank||0}">${r.rank||'—'}</span></td><td>${avatar(r.s,34)}</td><td class="l"><b>${esc(r.s.name)}</b></td>${r.ps.map(p=>`<td>${p==null?'—':p.toFixed(1)}</td>`).join('')}<td class="tot">${r.avg==null?'—':r.avg.toFixed(1)+'%'}</td><td>${g?`<span class="gr" style="background:${g[3]}">${g[1]} ${g[2]}</span>`:'—'}</td><td>${spark}</td></tr>`; }).join('')}</tbody></table></div></div>`;
}
function yearRows(c){ const ms=monthsWithData(c), mt=maxTotal(c); return {ms, rows:c.students.map(s=>{ const ps=ms.map(m=>{ const t=totalOf(c,m,s.id); return t==null?null:t/mt*100; }); const v=ps.filter(x=>x!=null); return {s,ps,avg:v.length?v.reduce((a,b)=>a+b,0)/v.length:null}; }).sort((a,b)=>(b.avg??-1)-(a.avg??-1))}; }
function csvYear(){ const c=cls(), {ms,rows}=yearRows(c); download(`${c.name} - សរុបឆ្នាំ.csv`, '﻿'+[[c.name+' — សរុបពិន្ទុគ្រប់ខែ (%)'],['ល.រ','ឈ្មោះ','ឈ្មោះឡាតាំង','ភេទ','ថ្ងៃកំណើត',...ms.map(monthName),'មធ្យមភាគ %','និទ្ទេស'],...rows.map((r,i)=>[i+1,r.s.name,r.s.latin||'',gname(r.s.g),fmtDob(r.s.dob),...r.ps.map(p=>p==null?'':p.toFixed(1)),r.avg==null?'':r.avg.toFixed(1),r.avg==null?'':grade(r.avg)[1]+' '+grade(r.avg)[2]])].map(r=>r.map(csvEsc).join(',')).join('\r\n'),'text/csv;charset=utf-8'); }
function printYear(){ const c=cls(), {ms,rows}=yearRows(c); $('#printArea').innerHTML=`<div class="cl-print"><h1>${esc(c.name)} — សរុបលទ្ធផលសិក្សាប្រចាំខែ</h1><table><thead><tr><th>ល.រ</th><th>ឈ្មោះ</th><th>ឈ្មោះឡាតាំង</th><th>ភេទ</th>${ms.map(m=>`<th>${monthName(m)}</th>`).join('')}<th>មធ្យមភាគ %</th><th>និទ្ទេស</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td style="text-align:left">${esc(r.s.name)}</td><td style="text-align:left">${esc(r.s.latin||'')}</td><td>${gname(r.s.g)}</td>${r.ps.map(p=>`<td>${p==null?'':p.toFixed(1)}</td>`).join('')}<td><b>${r.avg==null?'':r.avg.toFixed(1)}</b></td><td>${r.avg==null?'':grade(r.avg)[1]+' '+grade(r.avg)[2]}</td></tr>`).join('')}</tbody></table></div>`; window.print(); }

/* ---------- 🙋 សម្រង់វត្តមាន: c.att[YYYY-MM-DD][sid] = {st:'p'|'l'|'e'|'a', f:fine, n:note} ----------
   a = អវត្តមានឥតច្បាប់ (ដក 4,000៛ ស្វ័យប្រវត្តិ) • e = មានច្បាប់ (គ្រូកំណត់ ដក ឬមិនដក) • l = មកយឺត */
const FINE_A = 4000;
const AST = {p:['✅','មក','#16a34a'], l:['⏰','យឺត','#d97706'], e:['📝','មានច្បាប់','#2563eb'], a:['❌','ឥតច្បាប់','#dc2626']};
const dkey = d => { d=d||new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
const dkm = k => { const [y,m,d]=k.split('-'); return `${+d}/${+m}/${y}`; };
let AT={d:null, m:null};
function fines(c, sid){ const out={t:0, m:{}, log:[]}; Object.entries((c&&c.att)||{}).forEach(([d,day])=>{ const r=day&&day[sid]; const f=r?Math.round(+r.f||0):0; if(!f) return;
    out.t+=f; const mk=d.slice(0,7); out.m[mk]=(out.m[mk]||0)+f; out.log.push([new Date(d+'T12:00:00').getTime(), -f, (r.st==='a'?'❌ អវត្តមានឥតច្បាប់':r.st==='e'?'📝 អវត្តមានមានច្បាប់':'⏰ មកយឺត')+' '+dkm(d)+(r.n?' — '+r.n:'')]); });
  out.log.sort((a,b)=>b[0]-a[0]); return out; }
function tAttend(c){
  if(!c.students.length){ $('#clTab').innerHTML=`<div class="panel cl-empty"><p class="km">សូមបន្ថែមសិស្សជាមុនសិន</p></div>`; return; }
  const d=AT.d||(AT.d=dkey()), day=(c.att||{})[d]||{}, cnt={p:0,l:0,e:0,a:0,x:0};
  c.students.forEach(s=>{ const r=day[s.id]; cnt[r?r.st:'x']++; });
  const row=s=>{ const r=day[s.id]||{}, st=r.st||'', f=+r.f||0;
    return `<div class="at-row ${st?'at-'+st:''}"><div class="at-who">${avatar(s,36)}<span><b>${esc(s.name)}</b>${s.latin?`<small>${esc(s.latin)}</small>`:''}</span></div>
      <div class="at-btns">${Object.entries(AST).map(([k,[i,t]])=>`<button class="${st===k?'on':''}" onclick="Class.att('${s.id}','${k}')">${i} ${t}</button>`).join('')}</div>
      ${st==='a'?`<div class="at-fine"><b>−${FINE_A.toLocaleString('en-US')}៛</b><small>ដកស្វ័យប្រវត្តិ</small></div>`:''}
      ${st==='e'||st==='l'?`<div class="at-fine ed"><span>ដក:</span>${[0,1000,2000,4000].map(v=>`<button class="${f===v?'on':''}" onclick="Class.attFine('${s.id}',${v})">${v?v.toLocaleString('en-US'):'មិនដក'}</button>`).join('')}<input type="number" min="0" step="500" value="${f||''}" placeholder="ផ្សេង" onchange="Class.attFine('${s.id}',this.value)">៛
        <input class="at-note" value="${esc(r.n||'')}" placeholder="មូលហេតុ (ឈឺ, ធុរៈគ្រួសារ…)" onchange="Class.attNote('${s.id}',this.value)"></div>`:''}</div>`; };
  const mk=d.slice(0,7), m=AT.m||mk, days=Object.keys(c.att||{}).filter(k=>k.startsWith(m)).sort();
  const sum=c.students.map(s=>{ const o={p:0,l:0,e:0,a:0,f:0}; days.forEach(k=>{ const r=c.att[k][s.id]; if(r){ o[r.st]++; o.f+=+r.f||0; } }); return [s,o]; });
  const months=[...new Set([mk, ...Object.keys(c.att||{}).map(k=>k.slice(0,7))])].sort().reverse();
  $('#clTab').innerHTML=`<div class="panel at-panel">
    <div class="at-top"><h3 class="sec" style="margin:0">🙋 សម្រង់វត្តមាន</h3>
      <button class="btn ghost sm" onclick="Class.attDay(-1)">‹</button><input type="date" value="${d}" onchange="Class.attDay(this.value)"><button class="btn ghost sm" onclick="Class.attDay(1)">›</button>
      ${d!==dkey()?`<button class="btn ghost sm" onclick="Class.attDay(0)">ថ្ងៃនេះ</button>`:''}<span class="grow"></span>
      <button class="btn teal sm" onclick="Class.attAll()">✅ ដែលនៅសល់ = មក</button>
      ${Object.keys(day).length?`<button class="btn ghost sm" onclick="Class.attClear()">🗑 លុបថ្ងៃនេះ</button>`:''}</div>
    <div class="at-cnt"><span style="--c:#16a34a">✅ មក <b>${cnt.p}</b></span><span style="--c:#d97706">⏰ យឺត <b>${cnt.l}</b></span><span style="--c:#2563eb">📝 មានច្បាប់ <b>${cnt.e}</b></span><span style="--c:#dc2626">❌ ឥតច្បាប់ <b>${cnt.a}</b></span>${cnt.x?`<span style="--c:#94a3b8">⬜ មិនទាន់ស្រង់ <b>${cnt.x}</b></span>`:''}</div>
    <p class="note">💡 អវត្តមានឥតច្បាប់ ដក <b>4,000៛</b> ពីលុយសិស្សភ្លាម • មានច្បាប់/មកយឺត គ្រូជ្រើសដក ឬមិនដកក៏បាន • ចុចប៊ូតុងដដែលម្តងទៀតដើម្បីលុប</p>
    <div class="at-list">${c.students.map(row).join('')}</div>
    ${cnt.a+cnt.e?`<div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn ghost sm" onclick="Class.attTell()">📣 ជូនដំណឹងទៅសិស្សអវត្តមាន</button></div>`:''}</div>
  <div class="panel at-panel"><div class="at-top"><h3 class="sec" style="margin:0">📊 សរុបវត្តមានប្រចាំខែ</h3><select onchange="Class.attMon(this.value)">${months.map(x=>`<option value="${x}" ${x===m?'selected':''}>${monthName(x)}</option>`).join('')}</select>
    <span class="grow"></span><small class="note">${days.length} ថ្ងៃបានស្រង់</small><button class="btn ghost sm" onclick="Class.attPrint()">🖨 បោះពុម្ព</button></div>
    <div class="cl-tablewrap"><table class="cl-table at-sum"><thead><tr><th>#</th><th>ឈ្មោះ</th><th>✅ មក</th><th>⏰ យឺត</th><th>📝 មានច្បាប់</th><th>❌ ឥតច្បាប់</th><th>% វត្តមាន</th><th>💸 ដកលុយ</th></tr></thead>
    <tbody>${sum.map(([s,o],i)=>{ const n=o.p+o.l+o.e+o.a, pc=n?Math.round((o.p+o.l)/n*100):null; return `<tr><td>${i+1}</td><td class="nm">${esc(s.name)}</td><td>${o.p||''}</td><td>${o.l||''}</td><td>${o.e||''}</td><td class="${o.a?'bad':''}">${o.a||''}</td><td>${pc==null?'—':pc+'%'}</td><td class="${o.f?'bad':''}">${o.f?'−'+o.f.toLocaleString('en-US')+'៛':''}</td></tr>`; }).join('')}</tbody></table></div></div>`;
}
function attDo(fn){ const c=cls(), d=AT.d||dkey(); c.att=c.att||{}; const day=c.att[d]=c.att[d]||{}; fn(day,c); if(!Object.keys(day).length) delete c.att[d]; saveC(); tAttend(c); }
function att(sid, st){ attDo(day=>{ const r=day[sid]; if(r&&r.st===st){ delete day[sid]; return; } day[sid]={st, f:st==='a'?FINE_A:0}; if(r&&r.n&&(st==='e'||st==='l')) day[sid].n=r.n; }); }
function attFine(sid, v){ v=Math.max(0, Math.round(+v||0)); attDo(day=>{ if(day[sid]&&day[sid].st!=='a') day[sid].f=v; }); }
function attNote(sid, v){ attDo(day=>{ if(day[sid]){ v=String(v||'').trim().slice(0,80); if(v) day[sid].n=v; else delete day[sid].n; } }); }
function attAll(){ attDo((day,c)=>c.students.forEach(s=>{ if(!day[s.id]) day[s.id]={st:'p', f:0}; })); toast('✅ បានស្រង់វត្តមាន'); }
function attClear(){ if(!confirm('លុបវត្តមានថ្ងៃ '+dkm(AT.d||dkey())+' ទាំងអស់? (លុយដែលបានដកនឹងត្រឡប់ទៅសិស្សវិញ)')) return; const c=cls(); if(c.att) delete c.att[AT.d||dkey()]; saveC(); tAttend(c); }
function attDay(v){ if(v===0) AT.d=dkey(); else if(typeof v==='number'){ const t=new Date((AT.d||dkey())+'T12:00:00'); t.setDate(t.getDate()+v); AT.d=dkey(t); } else if(v) AT.d=v; AT.m=null; tAttend(cls()); }
function attTell(){ const c=cls(), d=AT.d||dkey(), day=(c.att||{})[d]||{}, users=(window.Auth&&Auth.data().users)||[]; if(!window.Notify) return; let n=0;
  c.students.forEach(s=>{ const r=day[s.id]; if(!r||(r.st!=='a'&&r.st!=='e')) return; const u=users.find(x=>x.role==='student'&&x.classId===c.id&&x.studentId===s.id); if(!u) return; n++;
    Notify.post(c.id, {to:u.id, kind:'ann', t:r.st==='a'?`❌ អ្នកអវត្តមានឥតច្បាប់ ថ្ងៃ ${dkm(d)}`:`📝 អវត្តមានមានច្បាប់ ថ្ងៃ ${dkm(d)}`, x:(r.f?`ត្រូវបានដក ${r.f.toLocaleString('en-US')}៛ ពីលុយរបស់អ្នក។ `:'មិនដកលុយទេ។ ')+(r.n?'មូលហេតុ: '+r.n:'')+' សូមកុំភ្លេចរៀនមេរៀនដែលខកខាន 📚'}); });
  toast(n?`📣 បានផ្ញើដំណឹងទៅសិស្ស ${n} នាក់`:'⚠️ សិស្សទាំងនេះមិនទាន់មានគណនី'); }
function attPrint(){ const c=cls(), m=AT.m||(AT.d||dkey()).slice(0,7), days=Object.keys(c.att||{}).filter(k=>k.startsWith(m)).sort(), L={p:'✓',l:'L',e:'P',a:'A'};
  $('#printArea').innerHTML=`<div class="cl-print"><h1>${esc(c.name)} — តារាងវត្តមាន ${monthName(m)}</h1><table><thead><tr><th>#</th><th>ឈ្មោះ</th>${days.map(k=>`<th>${+k.slice(8)}</th>`).join('')}<th>A</th><th>P</th><th>ដក (៛)</th></tr></thead><tbody>
    ${c.students.map((s,i)=>{ let a=0,e=0,f=0; const cells=days.map(k=>{ const r=c.att[k][s.id]; if(!r) return '<td></td>'; if(r.st==='a') a++; if(r.st==='e') e++; f+=+r.f||0; return `<td>${L[r.st]}</td>`; }).join(''); return `<tr><td>${i+1}</td><td style="text-align:left">${esc(s.name)}</td>${cells}<td>${a||''}</td><td>${e||''}</td><td>${f?f.toLocaleString('en-US'):''}</td></tr>`; }).join('')}</tbody></table>
    <p style="font-size:11px">✓ មក • L មកយឺត • P អវត្តមានមានច្បាប់ • A អវត្តមានឥតច្បាប់ (ដក 4,000៛)</p></div>`; window.print(); }

/* ---------- groups ---------- */
const GNAMES = [['🦁','Lions','#ea580c'],['🐯','Tigers','#d97706'],['🐘','Elephants','#64748b'],['🦅','Eagles','#2563eb'],['🐬','Dolphins','#0891b2'],['🐼','Pandas','#334155'],['🦊','Foxes','#c2410c'],['🐢','Turtles','#15803d'],['🦋','Butterflies','#a21caf'],['🐝','Bees','#ca8a04'],['🦉','Owls','#7c3aed'],['🐧','Penguins','#0f766e']];
let G={mode:'count', n:4, how:'random', absent:new Set()};
function tGroups(c){
  const td=(c.att||{})[dkey()]; if(td && G.attC!==c.id+dkey()){ G.attC=c.id+dkey(); G.absent=new Set(Object.keys(td).filter(k=>td[k].st==='a'||td[k].st==='e')); }
  if(!c.students.length){ $('#clTab').innerHTML=`<div class="panel cl-empty"><p class="km">សូមបន្ថែមសិស្សជាមុនសិន</p></div>`; return; }
  const present=c.students.filter(s=>!G.absent.has(s.id));
  $('#clTab').innerHTML = `<div class="cols" style="grid-template-columns:340px 1fr;align-items:start">
    <div class="panel">
      <h3 class="sec">⚙️ របៀបបង្កើតក្រុម</h3>
      <div class="cl-opt"><label class="cl-radio"><input type="radio" name="gm" ${G.mode==='count'?'checked':''} onchange="Class.gset('mode','count')"> ចំនួនក្រុម</label><label class="cl-radio"><input type="radio" name="gm" ${G.mode==='size'?'checked':''} onchange="Class.gset('mode','size')"> សិស្សក្នុងមួយក្រុម</label></div>
      <div class="cl-num"><button onclick="Class.gset('n',${Math.max(2,G.n-1)})">−</button><b>${G.n}</b><button onclick="Class.gset('n',${Math.min(20,G.n+1)})">＋</button><span class="km">${G.mode==='count'?'ក្រុម':'នាក់/ក្រុម'}</span></div>
      <h3 class="sec" style="margin-top:14px">🎯 ការចែក</h3>
      ${[['random','🎲 ចៃដន្យ','លាយសិស្សដោយចៃដន្យ'],['mixed','⚖️ ស្មើកម្រិត','សិស្សពូកែ និងខ្សោយលាយគ្នា (ពិន្ទុខែចុងក្រោយ)'],['gender','👫 ស្មើភេទ','ប្រុស-ស្រីចែកស្មើគ្នា']].map(o=>`<label class="cl-how ${G.how===o[0]?'on':''}"><input type="radio" name="gh" hidden ${G.how===o[0]?'checked':''} onchange="Class.gset('how','${o[0]}')"><b>${o[1]}</b><span>${o[2]}</span></label>`).join('')}
      <h3 class="sec" style="margin-top:14px">🙋 វត្តមានថ្ងៃនេះ (${present.length}/${c.students.length})</h3>
      <div class="cl-att">${c.students.map(s=>`<button class="${G.absent.has(s.id)?'off':''}" onclick="Class.gabs('${s.id}')" title="ចុចដើម្បីសម្គាល់អវត្តមាន">${avatar(s,30)}<span>${esc(s.name)}</span></button>`).join('')}</div>
      <button class="btn sun xl glow" style="width:100%;justify-content:center;margin-top:14px" onclick="Class.makeGroups()">✨ បង្កើតក្រុម</button>
    </div>
    <div class="panel" id="clGroups">${c.groups?groupsHtml(c):`<div class="cl-empty"><div style="font-size:64px" class="float">👥</div><p class="km">ជ្រើសរបៀប ហើយចុច «✨ បង្កើតក្រុម»</p></div>`}</div>
  </div>`;
}
function groupsHtml(c){
  const byId=Object.fromEntries(c.students.map(s=>[s.id,s]));
  return `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h3 class="sec" style="margin:0">👥 ${c.groups.length} ក្រុម</h3>
    <div class="row"><button class="btn ghost sm" onclick="Class.makeGroups()">🔄 បង្កើតម្តងទៀត</button><button class="btn ghost sm" onclick="Class.groupsToScore()">🏆 ផ្ញើទៅពិន្ទុក្រុម</button><button class="btn ghost sm" onclick="Class.groupsFull()">⛶ បង្ហាញធំ</button><button class="btn ghost sm" onclick="Class.printGroups()">🖨</button></div></div>
    <div class="cl-groups">${c.groups.map((g,i)=>{ const N=GNAMES[i%GNAMES.length]; return `<div class="cl-grp" style="--gc:${N[2]};animation-delay:${i*0.12}s">
      <div class="gh"><span>${N[0]}</span><b>${N[1]}</b><i>${g.length} នាក់</i></div>
      <div class="gm">${g.map((id,k)=>{ const s=byId[id]; return s?`<div class="gs" style="animation-delay:${i*0.12+0.15+k*0.07}s">${avatar(s,40)}<span>${esc(s.name)}</span></div>`:''; }).join('')}</div></div>`; }).join('')}</div>`;
}
function lastPct(c,sid){ const ms=monthsWithData(c); for(let i=ms.length-1;i>=0;i--){ const t=totalOf(c,ms[i],sid); if(t!=null) return t/maxTotal(c)*100; } return 50; }
function makeGroups(){
  const c=cls(); const st=shuffle(c.students.filter(s=>!G.absent.has(s.id)));
  if(st.length<2) return toast('ត្រូវការសិស្សយ៉ាងហោចណាស់ ២ នាក់');
  const k=Math.max(1,Math.min(st.length, G.mode==='count'?G.n:Math.ceil(st.length/G.n)));
  const groups=Array.from({length:k},()=>[]);
  let order=st;
  if(G.how==='mixed') order=st.slice().sort((a,b)=>lastPct(c,b.id)-lastPct(c,a.id));
  if(G.how==='gender') order=[...shuffle(st.filter(s=>s.g==='F')),...shuffle(st.filter(s=>s.g!=='F'))];
  // snake distribution keeps groups balanced
  order.forEach((s,i)=>{ const r=Math.floor(i/k), p=i%k; groups[r%2?k-1-p:p].push(s.id); });
  c.groups=groups.map(g=>shuffle(g)); saveC();
  $('#clGroups').innerHTML=groupsHtml(c); beep&&beep(true);
}
function groupsToScore(){ const c=cls(); S.teams=c.groups.slice(0,4).map((g,i)=>({n:GNAMES[i][0]+' '+GNAMES[i][1],s:0})); save(); openScore(); if(c.groups.length>4) toast('ពិន្ទុក្រុមបង្ហាញបាន ៤ ក្រុមដំបូង'); }
function groupsFull(){
  const c=cls(); const el=document.createElement('div'); el.className='cl-full'; el.innerHTML=`<button class="x" onclick="this.parentNode.remove();document.fullscreenElement&&document.exitFullscreen()">✕</button>`+groupsHtml(c).replace(/<div class="row"[\s\S]*?<\/div><\/div>/,'<h2>👥 ក្រុមថ្ងៃនេះ</h2>');
  document.body.appendChild(el); try{ document.documentElement.requestFullscreen(); }catch(e){}
}
function printGroups(){ const c=cls(), byId=Object.fromEntries(c.students.map(s=>[s.id,s])); $('#printArea').innerHTML=`<div class="cl-print"><h1>${esc(c.name)} — ក្រុម</h1>${c.groups.map((g,i)=>`<h2>${GNAMES[i%12][0]} ${GNAMES[i%12][1]}</h2><p>${g.map(id=>esc((byId[id]||{}).name||'')).join(' • ')}</p>`).join('')}</div>`; window.print(); }

/* ---------- timer (big ring) ---------- */
const TT={total:300,left:300,run:false,h:null,mode:'down',up:0};
function tTimer(){
  $('#clTab').innerHTML = `<div class="panel cl-timer" id="clTimer">${timerHtml()}</div>`;
  tDraw();
}
function timerHtml(){
  return `<div class="cl-tmodes"><button class="${TT.mode==='down'?'on':''}" onclick="Class.tMode('down')">⏳ រាប់ថយក្រោយ</button><button class="${TT.mode==='up'?'on':''}" onclick="Class.tMode('up')">⏱ នាឡិកាបញ្ចប់ (Stopwatch)</button></div>
   <div class="cl-ring"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="96" class="bg"/><circle cx="110" cy="110" r="96" class="fg" id="tArc"/></svg>
     <div class="cl-tval" id="tVal">5:00</div><div class="cl-tlab" id="tLab"></div></div>
   ${TT.mode==='down'?`<div class="row" style="justify-content:center">${[[0.5,'30 វិ'],[1,'1'],[2,'2'],[3,'3'],[5,'5'],[10,'10'],[15,'15'],[20,'20'],[30,'30']].map(m=>`<button class="btn ghost sm" onclick="Class.tSet(${m[0]*60})">${m[1]}${m[0]>=1?' នាទី':''}</button>`).join('')}</div>
   <div class="row" style="justify-content:center;margin-top:8px"><span class="km">កំណត់ខ្លួនឯង៖</span><input id="tMin" type="number" min="0" max="180" class="cl-in" style="width:70px" value="${Math.floor(TT.total/60)}"> នាទី <input id="tSec" type="number" min="0" max="59" class="cl-in" style="width:70px" value="${TT.total%60}"> វិនាទី <button class="btn ghost sm" onclick="Class.tSet((+$('#tMin').value||0)*60+(+$('#tSec').value||0))">✓</button></div>`:''}
   <div class="row" style="justify-content:center;margin-top:14px"><button class="btn sun xl" id="tGo" onclick="Class.tGo()">▶ ចាប់ផ្តើម</button><button class="btn ghost xl" onclick="Class.tReset()">↺</button><button class="btn ghost xl" onclick="Class.tFull()">⛶ ពេញអេក្រង់</button></div>`;
}
function tDraw(){
  const v=$('#tVal'); if(!v) return;
  const secs = TT.mode==='down' ? Math.max(0,TT.left) : TT.up;
  v.textContent = Math.floor(secs/60)+':'+String(Math.floor(secs%60)).padStart(2,'0');
  const frac = TT.mode==='down' ? (TT.total? TT.left/TT.total : 0) : (TT.up%60)/60;
  const L=2*Math.PI*96, a=$('#tArc'); a.style.strokeDasharray=L; a.style.strokeDashoffset=L*(1-frac);
  const warn = TT.mode==='down' && TT.left<=10 && TT.left>0;
  document.querySelectorAll('.cl-ring').forEach(r=>{ r.classList.toggle('warn',warn); r.classList.toggle('end',TT.mode==='down'&&TT.left<=0&&TT.total>0&&!TT.run); });
  $('#tLab').textContent = TT.run ? (TT.mode==='down'?'កំពុងរាប់…':'កំពុងរាប់…') : (TT.mode==='down'&&TT.left<=0?'⏰ អស់ម៉ោង!':'ផ្អាក');
  const g=$('#tGo'); if(g) g.textContent = TT.run?'⏸ ផ្អាក':'▶ ចាប់ផ្តើម';
}
function tSet(s){ TT.total=TT.left=Math.max(1,Math.round(s)); TT.run=false; clearInterval(TT.h); tDraw(); }
function tMode(m){ TT.mode=m; TT.run=false; clearInterval(TT.h); TT.up=0; TT.left=TT.total; $('#clTimer').innerHTML=timerHtml(); tDraw(); }
function tReset(){ TT.run=false; clearInterval(TT.h); TT.left=TT.total; TT.up=0; tDraw(); }
function tGo(){
  if(TT.mode==='down' && TT.left<=0) TT.left=TT.total;
  TT.run=!TT.run; clearInterval(TT.h);
  if(TT.run){ let last=Date.now(); TT.h=setInterval(()=>{ const now=Date.now(), d=(now-last)/1000; last=now;
    if(TT.mode==='down'){ const before=Math.ceil(TT.left); TT.left-=d; const after=Math.ceil(TT.left); if(after<before && after<=5 && after>0) beep(false);
      if(TT.left<=0){ TT.left=0; TT.run=false; clearInterval(TT.h); alarm(); } }
    else TT.up+=d;
    tDraw(); },200); }
  tDraw();
}
function alarm(){ let i=0; const h=setInterval(()=>{ beep(true); if(++i>5) clearInterval(h); },300); if(window.pageConfetti) pageConfetti(); }
function tFull(){
  let el=$('#clTfull'); if(!el){ el=document.createElement('div'); el.id='clTfull'; el.className='cl-full tfull'; document.body.appendChild(el); }
  el.innerHTML=`<button class="x" onclick="Class.tFullClose()">✕</button><div class="panel cl-timer big" id="clTimerFull">${timerHtml()}</div>`;
  const inner=$('#clTimer'); if(inner) inner.id='clTimerHidden';
  el.querySelector('.cl-timer').id='clTimer';
  try{ document.documentElement.requestFullscreen(); }catch(e){}
  tDraw();
}
function tFullClose(){ const el=$('#clTfull'); if(el) el.remove(); const h=$('#clTimerHidden'); if(h){ h.id='clTimer'; h.innerHTML=timerHtml(); } if(document.fullscreenElement) document.exitFullscreen(); tDraw(); }

/* ---------- class management ---------- */
function addClass(name){ if(name===undefined){ name=prompt('ឈ្មោះថ្នាក់ថ្មី', 'Beginner B'); if(!name) return; } newClass(name.trim()||'ថ្នាក់ថ្មី'); tab='students'; render(); }
function renameClass(){ const c=cls(); const n=prompt('ប្តូរឈ្មោះថ្នាក់ (ទុកទទេ ដើម្បីលុបថ្នាក់)', c.name); if(n===null) return; if(!n.trim()){ if(confirm('លុបថ្នាក់ «'+c.name+'» ទាំងសិស្ស និងពិន្ទុទាំងអស់?')){ C.classes=C.classes.filter(x=>x!==c); C.cur=C.classes[0]?C.classes[0].id:null; saveC(); render(); } return; } c.name=n.trim(); saveC(); render(); }
/* ---------- 🖼 bulk photos: many image files, or photos from a Backup .json ---------- */
const pnorm = x => String(x||'').toLowerCase().normalize('NFC').replace(/\.[a-z0-9]+$/,'').replace(/[\s_\-.]+/g,' ').replace(/^\s*\d+\s*[.)-]?\s*(?=\D)/,'').trim();
function matchStudent(c, label){
  const n=pnorm(label), raw=String(label).replace(/\.[a-z0-9]+$/i,'').trim();
  if(/^\d+$/.test(raw)){ const i=+raw-1; if(c.students[i]) return c.students[i]; }
  return c.students.find(s=>pnorm(s.latin)===n || pnorm(s.name)===n) || c.students.find(s=>s.latin && n && (pnorm(s.latin).includes(n)||n.includes(pnorm(s.latin))));
}
let PB=null;
function photoBulk(){
  const c=cls(); PB={items:[]};
  modal(`<h3>🖼 ដាក់រូបថតសិស្សជាបាច់</h3>
    <div class="pb-opts">
      <label class="pb-opt"><input type="file" accept="image/*" multiple hidden onchange="Class._pbFiles(this.files)"><div class="i">📷</div><b>ជ្រើសរូបច្រើនសន្លឹក</b><small>ដាក់ឈ្មោះឯកសារជា <code>ល.រ</code> (1.jpg, 2.jpg…) ឬ <code>ឈ្មោះឡាតាំង</code> (KENG Ratana.jpg) ឬឈ្មោះខ្មែរ</small></label>
      <label class="pb-opt"><input type="file" accept=".json" hidden onchange="Class._pbBackup(this.files[0])"><div class="i">💾</div><b>យករូបពី Backup</b><small>ឯកសារ Backup (.json) ពីកម្មវិធីក្នុងកុំព្យូទ័រ — យកតែរូបថត ផ្គូផ្គងតាមឈ្មោះ</small></label>
    </div>
    <div id="pbPrev" class="pb-prev"></div>
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" onclick="closeModal()">បោះបង់</button><button class="btn teal" id="pbGo" disabled onclick="Class._pbApply()">💾 រក្សាទុករូប</button></div>`);
  $('#modal').classList.add('wide');
}
function pbShow(){
  const c=cls(), ok=PB.items.filter(x=>x.s), bad=PB.items.filter(x=>!x.s);
  $('#pbPrev').innerHTML = `<p class="km">✅ ផ្គូផ្គងបាន <b>${ok.length}</b>${bad.length?` • ❌ មិនស្គាល់ ${bad.length}`:''} • សិស្សគ្មានរូប ${c.students.filter(s=>!s.photo && !ok.some(x=>x.s===s)).length}</p>
    <div class="pb-grid">${PB.items.map(x=>`<div class="${x.s?'':'bad'}"><img src="${x.photo}"><b>${x.s?esc(x.s.name):'❓'}</b><small>${esc(x.label)}</small></div>`).join('')}</div>`;
  $('#pbGo').disabled=!ok.length;
}
function _pbFiles(files){
  const c=cls(), list=[...files]; let left=list.length; if(!left) return; $('#pbPrev').innerHTML='<p class="note">⏳ កំពុងរៀបចំរូប…</p>';
  list.forEach(f=>resizePhoto(f, d=>{ PB.items.push({label:f.name, photo:d, s:matchStudent(c, f.name)}); if(--left===0){ PB.items.sort((a,b)=>(a.s?c.students.indexOf(a.s):999)-(b.s?c.students.indexOf(b.s):999)); pbShow(); } }));
}
function _pbBackup(f){
  if(!f) return; const c=cls();
  f.text().then(t=>{ let d=JSON.parse(t), classes=[];
    if(d.classes) classes=d.classes; else if(d.data && d.data['beginner-studio-class-v1']) classes=JSON.parse(d.data['beginner-studio-class-v1']).classes||[];
    const studs=classes.flatMap(x=>x.students||[]).filter(s=>s.photo);
    PB.items=studs.map(s=>({label:(s.latin||s.name), photo:s.photo, s:c.students.find(x=>(s.latin&&pnorm(x.latin)===pnorm(s.latin)) || pnorm(x.name)===pnorm(s.name))}));
    if(!PB.items.length){ $('#pbPrev').innerHTML='<p class="note">⚠️ Backup នេះគ្មានរូបថតសិស្សទេ</p>'; return; }
    pbShow(); }).catch(()=>toast('ឯកសារ Backup មិនត្រឹមត្រូវ'));
}
function _pbApply(){ const c=cls(); let k=0; PB.items.forEach(x=>{ if(x.s){ const s=c.students.find(y=>y.id===x.s.id); if(s){ s.photo=x.photo; k++; } } }); if(saveC()){ closeModal(); toast(`✅ បានដាក់រូប ${k} នាក់`); render(); } }

function backup(){ download(`class-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(window.Auth&&Auth.role()==='teacher'?{...C, classes:vis()}:C), 'application/json'); }
function restore(f){ if(!f||(window.Auth&&Auth.role()!=='admin')) return; f.text().then(t=>{ const d=JSON.parse(t); if(!d.classes) throw 0; if(C.classes.length && !confirm('ជំនួសទិន្នន័យថ្នាក់បច្ចុប្បន្នដោយ Backup នេះ?')) return; C=Object.assign({classes:[],cur:null,month:monthNow()},d); saveC(); render(); toast('✅ Restore រួចរាល់'); }).catch(()=>toast('ឯកសារ Backup មិនត្រឹមត្រូវ')); }

/* ---------- picker integration ---------- */
function studentsForPicker(){ const c=cls(); return c?c.students:[]; }

function setBook(id){ const c=cls(); if(!c) return; c.book=id; saveC(); render(); }
function share(k){ const c=cls(); if(!c) return; c.share=c.share||{}; c.share[k]=!c.share[k]; saveC(); toast(c.share[k]?'👁 សិស្សអាចមើលបានហើយ':'🔒 បានបិទមិនឱ្យសិស្សមើល'); }
function shareBtn(c,k){ const on=c.share&&c.share[k]; return `<button class="btn sm ${on?'teal':'ghost'}" onclick="Class._share('${k}');Class.render('${k==='res'?'results':'year'}')" title="សិស្សមើលឃើញក្នុង 🏆 ចំណាត់ថ្នាក់">${on?'👁 សិស្សកំពុងមើលបាន':'🙈 សិស្សមើលមិនឃើញ'}</button>`; }
window.Class = { _save:saveC, att, attFine, attNote, attAll, attClear, attDay, attTell, attPrint, attMon:m=>{ AT.m=m; tAttend(cls()); }, fines, FINE_A, gate, gateAuto, copyFrom, _cpSrc:v=>{ CP.src=v; copyFrom(); }, _cpMode:m=>{ CP.mode=m; copyFrom(); }, _cpGo:cpGo, _share:share, _cur:()=>cls(), _avatar:avatar, _months:monthsWithData, _results:results, _maxTotal:maxTotal, _grade:grade, _yearRows:yearRows, unl, unlTo, setBook, photoBulk, _pbFiles, _pbBackup, _pbApply, render, pick:id=>{ C.cur=id; saveC(); render(); }, addClass, renameClass, backup, restore,
  editStudent, pickPhoto, noPhoto:()=>{ editPhoto=null; $('#clPrev').innerHTML=avatar({name:$('#clN').value},140); }, cam, camStop, saveStudent, photo, delStudent, bulk, impMode, impFile, impPreview, impApply, infoTable, infoSave, template, age:ageOf, sortStudents,
  setMonth:m=>{ if(m){ C.month=m; saveC(); render(); } }, cols, colAdd, colSave, csv, printMonth, csvYear, printYear, certs, certSet, certGrade, certPrint, sigFile, sigDraw, sigScale, sigReset, certShow:i=>{ ctSel=i; certRefresh(); },
  gset:(k,v)=>{ G[k]=v; tGroups(cls()); }, gabs:id=>{ G.absent.has(id)?G.absent.delete(id):G.absent.add(id); tGroups(cls()); }, makeGroups, groupsToScore, groupsFull, printGroups,
  tSet, tMode, tReset, tGo, tFull, tFullClose, studentsForPicker, avatar, data:()=>C };
})();
