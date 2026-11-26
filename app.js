/* ===================== Beginner English Studio — app.js ===================== */
/* ---------- paths ---------- */
const AUDIO_DIR = "../2. Beginner Audio/";
const BOOKS = {
  1: "../1. Book/1. Headway.Fifth edition.Beginner.Student's Book - secure.pdf",
  2: "../1. Book/Headway_5ed_Beginner_Teacher_Guide_www.frenglish.ru.pdf",
  3: "../1. Book/Headway_5ed_Beginner_Workbook_www.frenglish.ru.pdf"
};
const enc = p => p.split('/').map(encodeURIComponent).join('/');
function pdfUrl(which, page){ return ((window.MEDIA&&MEDIA.pdf[which]) || enc(BOOKS[which])) + (page ? '#page=' + (page + 1) + '&view=FitH' : ''); }
function bookUrl(which, page){ return which===1 && page!=null ? Book.img(page) : pdfUrl(which, page); }
function openPdf(which, page){ window.open(pdfUrl(which, page), '_blank'); }
function openBook(which, page){ if(which===1 && window.Book){ if(window.Deck && Deck.D && document.getElementById('deck').classList.contains('show')) Deck.close(); Book.open(page); } else openPdf(which, page); }

/* ---------- storage ---------- */
const KEY = 'beginner-studio-v1' + (window.Auth ? Auth.progressKey() : '');
const ROLE_NOW = window.Auth ? Auth.role() : 'admin';
let S = { mode:'learn', known:{}, quiz:{}, listened:{}, names:'', teams:[{n:'ក្រុម A',s:0},{n:'ក្រុម B',s:0},{n:'ក្រុម C',s:0}], voice:'', rate:0.9, lastUnit:1 };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch(e){}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
/* ---------- 📊 activity tracking (students only) ---------- */
const TRACKING = window.Auth && Auth.role && Auth.role()==='student';
const dayKey = (t=new Date()) => t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');
function act(){ S.act = S.act || {d:{}, u:{}, ev:[]}; return S.act; }
function track(type, detail){ if(!TRACKING) return; const a=act(); a.ev.unshift([Date.now(), type, detail==null?'':detail]); a.ev=a.ev.slice(0,200); a.last=Date.now(); if(!a.first) a.first=Date.now(); }
let lastInput=Date.now(), hbN=0;
['pointerdown','keydown','wheel','touchstart'].forEach(e=>addEventListener(e,()=>{ lastInput=Date.now(); },{passive:true,capture:true}));
if(TRACKING) setInterval(()=>{
  if(document.visibilityState!=='visible' || Date.now()-lastInput>120000) return;
  const a=act(), k=dayKey(); a.d[k]=(a.d[k]||0)+15; a.last=Date.now(); if(!a.first) a.first=Date.now();
  const deckOn=document.getElementById('deck')&&document.getElementById('deck').classList.contains('show');
  const un = deckOn&&window.Deck&&Deck.D ? Deck.D.n : (typeof view!=='undefined'&&view.name==='unit' ? view.unit : null);
  if(un) a.u[un]=(a.u[un]||0)+15;
  if(++hbN%4===0) save();
}, 15000);
addEventListener('visibilitychange',()=>{ if(TRACKING && document.visibilityState==='hidden') save(); });

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr = s => esc(JSON.stringify(s));
const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const U = n => UNITS[n-1];
const unitTracks = n => TRACKS.filter(t => t.unit === n);
function toast(m){ const t=$('#toast'); t.textContent=m; t.style.display='block'; t.style.animation='none'; t.offsetHeight; t.style.animation=''; clearTimeout(t._h); t._h=setTimeout(()=>t.style.display='none',2300); }
function fmt(s){ if(!isFinite(s)) return '0:00'; s=Math.floor(s); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
function knownCount(n){ return (S.known[n]||[]).length; }
function tracksDone(n){ return unitTracks(n).filter(t=>S.listened[t.id]).length; }
function emojiFor(u, w){ const k=w.toLowerCase(); return (u.emoji||{})[k] || (u.emoji||{})[k.replace(/^(a|an|the) /,'')] || ''; }
function setUnitColors(n, el){ const st=UNIT_STYLE[n]; (el||document.documentElement).style.setProperty('--c1',st.c1); (el||document.documentElement).style.setProperty('--c2',st.c2); }
function clean(t){ return String(t).replace(/\(.*?\)/g,'').replace(/[→=↔].*$/,'').trim(); }

/* ---------- speech ---------- */
let voices = [];
function loadVoices(){ voices = (speechSynthesis.getVoices()||[]).filter(v => /^en/i.test(v.lang)); }
if ('speechSynthesis' in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function pickVoice(){ return voices.find(v=>v.name===S.voice) || voices.find(v=>/en-GB/i.test(v.lang)) || voices[0]; }
function speak(text, rate){
  if(!('speechSynthesis' in window)) return toast('កុំព្យូទ័រនេះមិនមានសំឡេង TTS');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean(text));
  const v = pickVoice(); if(v){ u.voice=v; u.lang=v.lang; } else u.lang='en-GB';
  u.rate = rate || S.rate || 0.9;
  speechSynthesis.speak(u);
}
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function listenWord(target, cb){
  if(!SR){ toast('កម្មវិធីរុករកនេះមិនគាំទ្រការស្គាល់សំឡេងទេ'); return; }
  const r = new SR(); r.lang='en-GB'; r.maxAlternatives=5; toast('🎤 និយាយឥឡូវនេះ…');
  r.onresult = e => { const alts=[...e.results[0]].map(a=>a.transcript.toLowerCase().trim()); const t=clean(target).toLowerCase().replace(/^(a|an) /,'').replace(/[^a-z' ]/g,'').trim(); cb(alts.some(a=>a.replace(/[^a-z' ]/g,'').includes(t)), alts[0]); };
  r.onerror = e => toast(e.error==='network' ? 'ការស្គាល់សំឡេងត្រូវការអ៊ីនធឺណិត' : 'មិនអាចស្តាប់បាន: '+e.error);
  r.start();
}

/* ---------- audio player ---------- */
const A = $('#audio');
const P = {
  list:[], i:0, loop:false, a:null, b:null,
  load(list, i, autoplay=true){
    this.list=list; this.i=i; this.a=this.b=null; $('#pAB').classList.remove('on'); $('#pAB').textContent='A-B';
    const t=list[i];
    A.src = (window.MEDIA&&MEDIA.audio[t.file]) || enc(AUDIO_DIR + t.file);
    A.playbackRate = +$('#pRate').value;
    $('#pTitle').textContent = 'Track ' + t.id + ' • p' + t.page;
    $('#pSub').textContent = t.text;
    $('#player').classList.add('show');
    if(autoplay) A.play().catch(()=>toast(window.IS_WEB&&!(window.MEDIA&&MEDIA.audio[t.file]) ? '🎧 សូមចុច 📂 ភ្ជាប់ Folder សំឡេងសិន (ក្នុងកុំព្យូទ័រនេះ)' : 'រកឯកសារសំឡេងមិនឃើញ: '+t.file));
    S.listened[t.id]=true; track('listen', t.id); save();
    document.querySelectorAll('.trk').forEach(el=>el.classList.toggle('on', el.dataset.id===t.id));
  },
  toggle(){ if(!A.src) return; A.paused ? A.play() : A.pause(); },
  skip(s){ A.currentTime = Math.max(0, A.currentTime + s); },
  next(){ if(this.i < this.list.length-1) this.load(this.list, this.i+1); },
  prev(){ if(A.currentTime>3){A.currentTime=0;return;} if(this.i>0) this.load(this.list, this.i-1); },
  loopToggle(){ this.loop=!this.loop; $('#pLoop').classList.toggle('on', this.loop); toast(this.loop?'🔁 ចាក់ម្តងហើយម្តងទៀត':'បិទការចាក់ម្តងទៀត'); },
  ab(){
    const btn=$('#pAB');
    if(this.a===null){ this.a=A.currentTime; btn.textContent='A…'; btn.classList.add('on'); toast('កំណត់ចំណុច A — ចុចម្តងទៀតដើម្បីកំណត់ B'); }
    else if(this.b===null){ this.b=A.currentTime; if(this.b<=this.a+0.3){this.b=null;return;} btn.textContent='A↔B'; A.currentTime=this.a; toast('ចាក់ឡើងវិញ A↔B'); }
    else { this.a=this.b=null; btn.textContent='A-B'; btn.classList.remove('on'); }
  },
  page(){ const t=this.list[this.i]; if(t) openBook(1, t.page); },
  close(){ A.pause(); $('#player').classList.remove('show'); }
};
window.P = P; window.speak = speak; window.bookUrl = bookUrl;
A.addEventListener('play', ()=>{ $('#pPlay').textContent='⏸'; $('#pEq').classList.add('on'); });
A.addEventListener('pause', ()=>{ $('#pPlay').textContent='▶'; $('#pEq').classList.remove('on'); });
A.addEventListener('timeupdate', ()=>{
  if(P.b!==null && A.currentTime>=P.b) A.currentTime=P.a;
  $('#pTime').textContent = fmt(A.currentTime)+' / '+fmt(A.duration);
  if(!seeking && A.duration) $('#pSeek').value = A.currentTime/A.duration*1000;
});
A.addEventListener('ended', ()=>{ if(P.loop){A.currentTime=0;A.play();} });
let seeking=false;
$('#pSeek').addEventListener('input', e=>{ seeking=true; if(A.duration) A.currentTime = e.target.value/1000*A.duration; });
$('#pSeek').addEventListener('change', ()=>seeking=false);
$('#pRate').addEventListener('change', e=>A.playbackRate=+e.target.value);

document.addEventListener('keydown', e=>{
  if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
  if(window.Book && Book.key(e)) return;
  if(window.Deck && Deck.key(e)) return;
  if(e.code==='Space' && $('#player').classList.contains('show')){ e.preventDefault(); P.toggle(); }
});
let idleT; document.addEventListener('mousemove', ()=>{ const d=$('#deck'); if(!d) return; d.classList.remove('idle'); clearTimeout(idleT); idleT=setTimeout(()=>d.classList.add('idle'),2500); });

/* ---------- routing ---------- */
let view = {name:'home', unit:S.lastUnit||1, tab:'path'};
function go(name, unit, tab){ view = {name, unit:unit||view.unit, tab:tab||(name==='class'?'students':name==='admin'?'users':'path')}; if(name==='unit') track('unit', view.unit+':'+view.tab); if(name==='unit'){ S.lastUnit=view.unit; save(); } render(); window.scrollTo({top:0,behavior:'smooth'}); }
function setMode(m){
  if(ROLE_NOW==='student') m='learn';
  S.mode=m; save(); document.body.classList.toggle('teach', m==='teach');
  $('#mLearn').classList.toggle('on',m==='learn'); $('#mTeach').classList.toggle('on',m==='teach');
  const b=(m==='learn'?$('#mLearn'):$('#mTeach')); const pill=$('#mPill'); pill.style.left=b.offsetLeft+'px'; pill.style.width=b.offsetWidth+'px';
  render();
}
function render(){
  if(!ROLE_NOW) return;
  if(ROLE_NOW==='student' && (view.name==='class'||view.name==='admin')) view.name='home';
  if(ROLE_NOW!=='admin' && view.name==='admin') view.name='home';
  if(ROLE_NOW==='student'){ stuNav(); if(view.name==='home') return renderStuHome(); if(view.name==='units') return renderStuUnits(); if(view.name==='exams') return Exam.studentPage(); }
  view.name==='home' ? renderHome() : view.name==='class' ? Class.render(view.tab) : view.name==='me' ? Auth.renderMe() : view.name==='admin' ? Auth.renderAdmin(view.tab) : renderUnit(); }
window.render = render;

/* ---------- illustration ---------- */
const HERO_SVG = `<svg class="ill" viewBox="0 0 260 220" aria-hidden="true">
  <defs><linearGradient id="pg" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fef3c7"/></linearGradient></defs>
  <g class="float" style="transform-origin:130px 140px">
    <path d="M30 150 Q80 125 128 150 L128 205 Q80 182 30 205Z" fill="url(#pg)"/>
    <path d="M230 150 Q180 125 132 150 L132 205 Q180 182 230 205Z" fill="#fde68a"/>
    <path d="M45 160 Q80 145 115 160M45 172 Q80 157 115 172M45 184 Q80 169 115 184" stroke="#94a3b8" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M145 160 Q180 145 215 160M145 172 Q180 157 215 172" stroke="#d97706" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
  <g fill="#fff" font-weight="800" font-family="Segoe UI,sans-serif">
    <text x="60" y="95" font-size="34" class="float" style="animation-delay:-1s">A</text>
    <text x="120" y="60" font-size="40" fill="#fde68a" class="float" style="animation-delay:-2s">B</text>
    <text x="185" y="100" font-size="30" class="float" style="animation-delay:-3s">C</text>
    <text x="22" y="130" font-size="26" fill="#a7f3d0" font-family="Kantumruy Pro,Khmer UI,sans-serif" class="float" style="animation-delay:-1.5s">ក</text>
    <text x="215" y="140" font-size="26" fill="#a7f3d0" font-family="Kantumruy Pro,Khmer UI,sans-serif" class="float" style="animation-delay:-2.5s">ខ</text>
  </g>
  <g stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"><path d="M150 40 q14 14 0 28"/><path d="M162 30 q24 24 0 48" opacity=".6"/></g>
</svg>`;

/* ---------- 🎓 student (mobile-first) ---------- */
const STU_NAV=[['home','🏠','ដើម'],['units','📚','មេរៀន'],['exams','📝','ប្រឡង'],['me','📊','ខ្ញុំ']];
function stuNav(){
  let n=document.getElementById('stuNav'); if(!n){ n=document.createElement('nav'); n.id='stuNav'; document.body.appendChild(n); }
  const cur=view.name==='unit'?'units':view.name;
  n.innerHTML=STU_NAV.map(([k,i,t])=>`<button class="${cur===k?'on':''}" onclick="go('${k}')"><span>${i}</span><b>${t}</b>${k==='exams'&&stuOpenExams().length?`<i>${stuOpenExams().length}</i>`:''}</button>`).join('');
}
function stuOpenExams(){ const me=Auth.user(), X=(window.Exam&&Exam.data())||{}; return (X.open||[]).filter(se=>se.cls===me.classId && !(se.once && (X.results||[]).some(r=>r.sess===se.id && (r.uid===me.id||r.sid===me.studentId)))); }
function unitPct(u){ const kp=knownCount(u.n)/u.vocab.length, sp=((S.sec||{})[u.n]||[]).length/LESSONS[u.n].sections.length, q=(S.quiz[u.n]||0)/100; return Math.round((kp+sp+q)/3*100); }
function renderStuHome(){
  const me=Auth.user(), nu=nextUnit(), u=U(nu), st=UNIT_STYLE[nu]; setUnitColors(nu);
  const totalW=UNITS.reduce((a,x)=>a+x.vocab.length,0), knownW=UNITS.reduce((a,x)=>a+knownCount(x.n),0), passed=Object.values(S.quiz).filter(v=>v>=80).length;
  const ox=stuOpenExams(), first=(me.name||'').trim().split(/\s+/).slice(-1)[0];
  $('#main').innerHTML=`<div class="stu-hi"><div>${Auth.avatarFor(me,52)}</div><div><small>សួស្តី 👋</small><b>${esc(first)}</b></div></div>
    ${ox.length?`<button class="stu-alert" onclick="go('exams')"><span>📝</span><div><b>មានប្រឡង ${ox.length} កំពុងបើក</b><small>ចុចដើម្បីចូលប្រឡង</small></div><i>›</i></button>`:''}
    <div class="stu-cont" style="--c1:${st.c1};--c2:${st.c2}">
      <small>បន្តរៀន</small><div class="r"><div class="n">${nu}</div><div><b>${esc(u.en)}</b><span>${u.km}</span></div><div class="e">${st.icon}</div></div>
      <div class="bar"><i style="width:${unitPct(u)}%"></i></div>
      <div class="b"><button class="btn white" onclick="go('unit',${nu},'lesson')">▶ បន្តរៀន</button><button class="btn ghost" onclick="go('unit',${nu},'practice')">✍️ លំហាត់</button></div>
    </div>
    <div class="stu-stats"><div><b>${knownW}</b><span>🔤 ពាក្យចេះ</span></div><div><b>${Object.values(S.sec||{}).reduce((a,x)=>a+x.length,0)}</b><span>📖 ផ្នែករៀនរួច</span></div><div><b>${passed}<small>/14</small></b><span>🏅 មេរៀនឆ្លង</span></div></div>
    <h3 class="stu-sub">📚 មេរៀនទាំងអស់</h3>${stuUnitList()}`;
}
function stuUnitList(){ return `<div class="stu-units">${UNITS.map((u,i)=>{ const st=UNIT_STYLE[u.n], p=unitPct(u), q=S.quiz[u.n];
  return `<button class="stu-u" style="--c1:${st.c1};--c2:${st.c2};animation-delay:${Math.min(i,10)*0.03}s" onclick="go('unit',${u.n})"><span class="n">${u.n}</span><span class="t"><b>${esc(u.en)}</b><small>${u.km}</small><span class="bar"><i style="width:${p}%"></i></span></span><span class="s">${q>=80?'✅':st.icon}</span></button>`; }).join('')}</div>`; }
function renderStuUnits(){ setUnitColors(2); $('#main').innerHTML=`<div class="stu-head"><h2>📚 មេរៀន</h2></div>${stuUnitList()}`; }

/* ---------- 🎓 student unit: lesson cards (no slides) — phone first, roomy on PC ---------- */
const TABS_STU = () => [['lesson','📖 មេរៀន'],['vocab','🔤 ពាក្យ'],['grammar','📐 វេយ្យាករណ៍'],['practice','✍️ លំហាត់']].concat(window.IS_WEB?[]:[['listen','🎧 ស្តាប់']]);
function secDone(n){ S.sec=S.sec||{}; return S.sec[n]=S.sec[n]||[]; }
function renderStuUnit(u, tabs){
  const st=UNIT_STYLE[u.n], L=LESSONS[u.n], done=secDone(u.n).length;
  $('#main').innerHTML=`<div class="su-hero" style="--c1:${st.c1};--c2:${st.c2}">
      <button class="su-nav" onclick="go('units')">‹</button>
      <div class="n">${u.n}</div><div class="t"><b>${esc(u.en)}</b><span>${u.km}</span><div class="bar"><i style="width:${unitPct(u)}%"></i></div><small>📖 ${done}/${L.sections.length} ផ្នែក • 📘 សៀវភៅ p${u.start}–${u.end}</small></div>
      <div class="e">${st.icon}</div>
      <div class="pn"><button ${u.n<=1?'disabled':''} onclick="go('unit',${u.n-1},'${view.tab}')">◀</button><button ${u.n>=14?'disabled':''} onclick="go('unit',${u.n+1},'${view.tab}')">▶</button></div>
    </div>
    <div class="tabs su-tabs">${tabs.map(t=>`<button class="${t[0]===view.tab?'on':''}" onclick="go('unit',${u.n},'${t[0]}')">${t[1]}</button>`).join('')}</div>
    <div id="tab"></div>`;
  ({lesson:tabLesson, vocab:tabVocab, grammar:tabGrammar, practice:tabPractice, listen:tabListen})[view.tab](u);
}
let openSec=null;
function tabLesson(u){
  const L=LESSONS[u.n], dn=secDone(u.n); if(openSec==null || openSec.n!==u.n){ const f=L.sections.findIndex((x,i)=>!dn.includes(i)); openSec={n:u.n, i:f<0?0:f}; }
  const say=t=>`speak(${JSON.stringify(t).replace(/"/g,'&quot;')})`;
  $('#tab').innerHTML=`<div class="les">${L.sections.map((s,si)=>{ const K=KIND[s.k], on=openSec.i===si, ok=dn.includes(si);
    let body='';
    if(on){
      if(s.w&&s.w.length) body+=`<div class="les-w">${s.w.map(w=>`<button onclick="${say(w[0])}"><span class="em">${w[2]||'🔤'}</span><b>${esc(w[0])}</b><small>${esc(w[1]||'')}</small></button>`).join('')}</div>`;
      if(s.g) body+=s.g.map(gi=>{ const g=L.grammar[gi]; if(!g) return ''; return `<div class="les-g"><h4>📐 ${esc(g.t)}</h4><p class="km">${g.km}</p>
        ${g.form?`<div class="les-form">${g.form.map(row=>`<div>${row.map((c,ci)=>`<span class="${ci===1?'hl':''}">${esc(c)}</span>`).join('')}<button onclick="${say(row.join(' '))}">🔊</button></div>`).join('')}</div>`:''}
        ${g.ex?g.ex.map(e=>`<div class="les-ph" onclick="${say(e)}"><span>🔊</span><b>${esc(e)}</b></div>`).join(''):''}
        ${g.err?g.err.map(e=>`<div class="les-err"><s>❌ ${esc(e[0])}</s><b>✅ ${esc(e[1])}</b></div>`).join(''):''}</div>`; }).join('');
      if(s.ph&&s.ph.length) body+=`<div class="les-phs">${s.ph.map(p=>`<div class="les-ph" onclick="${say(p[0])}"><span>🔊</span><div><b>${esc(p[0])}</b><small>${esc(p[1]||'')}</small></div></div>`).join('')}</div>`;
      if(s.qs&&s.qs.length) body+=`<div class="les-q"><h4>❓ សំណួរ — ឆ្លើយដោយខ្លួនឯង</h4>${s.qs.map((q,qi)=>`<div onclick="${say(q)}"><span>${qi+1}</span>${esc(q)} 🔊</div>`).join('')}</div>`;
      if(s.k==='review') body+=`<div class="les-rev">🏁 ធ្វើលំហាត់ដើម្បីពិនិត្យខ្លួនឯង <button class="btn teal" onclick="go('unit',${u.n},'practice')">✍️ ធ្វើលំហាត់</button></div>`;
      if(!body) body=`<p class="note">📘 សូមបើកសៀវភៅទំព័រ ${s.p} ហើយធ្វើតាមការណែនាំរបស់គ្រូ</p>`;
      body+=`<div class="les-foot"><span class="note">📘 សៀវភៅ p${s.p}</span><button class="btn ${ok?'ghost':'teal'}" onclick="Stu.done(${u.n},${si})">${ok?'✓ រៀនរួច':si<L.sections.length-1?'✅ រៀនរួច → បន្ទាប់':'✅ រៀនរួច'}</button></div>`;
    }
    return `<div class="les-s ${on?'on':''} ${ok?'ok':''}" style="--kc:${K.c||'var(--c1)'}"><button class="les-h" onclick="Stu.open(${u.n},${si})"><span class="ki">${ok?'✓':K.i}</span><span class="tt"><small>${K.km}</small><b>${esc(s.t)}</b>${on?'':`<em>${s.km}</em>`}</span><span class="ch">${on?'−':'+'}</span></button>${on?`<div class="les-b"><p class="km les-d">${s.km}</p>${body}</div>`:''}</div>`; }).join('')}</div>`;
}
window.Stu = {
  open:(n,i)=>{ openSec={n, i: openSec&&openSec.n===n&&openSec.i===i ? -1 : i}; tabLesson(U(n)); const el=document.querySelectorAll('.les-s')[i]; if(el&&openSec.i===i) el.scrollIntoView({behavior:'smooth',block:'start'}); },
  done:(n,i)=>{ const d=secDone(n); if(!d.includes(i)){ d.push(i); track('lesson', n+':'+i); save(); } const L=LESSONS[n]; const nx=L.sections.findIndex((x,k)=>k>i&&!d.includes(k)); if(nx>=0){ openSec={n,i:nx}; renderUnit(); setTimeout(()=>{ const el=document.querySelectorAll('.les-s')[nx]; el&&el.scrollIntoView({behavior:'smooth',block:'start'}); },60); } else { toast('🎉 រៀនគ្រប់ផ្នែកហើយ! តោះធ្វើលំហាត់'); renderUnit(); } }
};

/* ---------- home ---------- */
function renderHome(){
  setUnitColors(1);
  const totalW = UNITS.reduce((a,u)=>a+u.vocab.length,0);
  const knownW = UNITS.reduce((a,u)=>a+knownCount(u.n),0);
  const doneT = Object.keys(S.listened).length;
  const qs = Object.values(S.quiz); const avg = qs.length ? Math.round(qs.reduce((a,b)=>a+b,0)/qs.length) : 0;
  const passed = Object.values(S.quiz).filter(v=>v>=80).length;
  const teach = S.mode==='teach', nu = nextUnit();
  $('#main').innerHTML = `
  <div class="hero">
    <div class="main">
      ${HERO_SVG}
      <h1>${teach ? 'សួស្តីលោកគ្រូ អ្នកគ្រូ 👋' : 'សួស្តី! តោះរៀនភាសាអង់គ្លេស 👋'}</h1>
      <p>${teach
        ? 'បង្រៀនតាមស្លាយដែលរៀបតាមលំដាប់ទំព័រសៀវភៅ — ចុច Remote Presenter ដើម្បីប្តូរស្លាយ ចាក់សំឡេង បង្ហាញទំព័រសៀវភៅ និងសួរសំណួរ។'
        : 'រៀនតាមស្លាយតាមលំដាប់មេរៀនក្នុងសៀវភៅ ស្តាប់សំឡេងពិត រៀនពាក្យមានរូបភាព និងធ្វើលំហាត់។ វឌ្ឍនភាពរក្សាទុកដោយស្វ័យប្រវត្តិ។'}</p>
      <div class="ctas row">
        <button class="btn sun xl glow" onclick="Deck.open(${nu})">▶ ${teach?'បង្រៀន':'រៀន'} Unit ${nu} ជាស្លាយ</button>
        <button class="btn ghost" onclick="go('unit',${nu})">📚 មេរៀន ${nu}</button>
        <button class="btn ghost" onclick="Book.open()">📖 សៀវភៅឌីជីថល</button>
      </div>
    </div>
    <div class="statbox">
      <div class="stat"><div class="ring" style="--p:${Math.round(knownW/totalW*100)}" data-v="${Math.round(knownW/totalW*100)}%"></div><b>${knownW}</b><span>ពាក្យចេះ / ${totalW}</span></div>
      <div class="stat"><div class="ic">🎧</div><b>${doneT}</b><span>បទបានស្តាប់ / ${TRACKS.length}</span></div>
      <div class="stat"><div class="ic">🏅</div><b>${passed}<small style="font-size:16px;color:var(--mute)">/14</small></b><span>មេរៀនឆ្លង • មធ្យម ${avg}%</span></div>
      <div class="tip-card">💡 <b>គន្លឹះ៖</b> ${teach?'ភ្ជាប់ Remote Presenter (USB) → បើកស្លាយ → ចុច ▶ / ◀ ដើម្បីបង្ហាញចំណុចម្តងមួយៗ។ ចុច B ដើម្បីបិទអេក្រង់ខ្មៅ ពេលចង់ឱ្យសិស្សផ្តោតលើគ្រូ។':'រៀនតាមលំដាប់៖ 📚 ស្លាយមេរៀន → 🎧 ស្តាប់ → 🔤 ពាក្យ → ✍️ លំហាត់ (80%+ ដើម្បីឆ្លង)។'}</div>
    </div>
  </div>
  <div class="grid">${UNITS.map((u,i)=>{
    const st=UNIT_STYLE[u.n];
    const kp = Math.round(knownCount(u.n)/u.vocab.length*100);
    const tp = Math.round(tracksDone(u.n)/unitTracks(u.n).length*100);
    const q = S.quiz[u.n];
    return `<button class="ucard" style="--c1:${st.c1};--c2:${st.c2};animation-delay:${i*0.04}s" onclick="go('unit',${u.n})">
      <div class="band"><div class="num">${u.n}</div><div class="emo">${st.icon}</div></div>
      <div class="body">
        <h3>${esc(u.en)}</h3><span class="kmt">${u.km}</span>
        <span class="pg">📘 p${u.start}–${u.end} • ${LESSONS[u.n].sections.length} ផ្នែក • ${unitTracks(u.n).length} បទ</span>
        <div class="bar"><i style="width:${Math.round((kp+tp+(q||0))/3)}%"></i></div>
        <div class="mini"><span>🔤 ${kp}%</span><span>🎧 ${tracksDone(u.n)}/${unitTracks(u.n).length}</span><span>✍️ ${q!=null?q+'%':'—'}</span></div>
      </div>
      ${q>=80?'<span class="done-badge">✓ ឆ្លង</span>':''}
    </button>`}).join('')}</div>`;
}
function nextUnit(){ for(const u of UNITS){ if(ROLE_NOW==='student' ? (((S.sec||{})[u.n]||[]).length<LESSONS[u.n].sections.length || (S.quiz[u.n]||0)<80) : (S.quiz[u.n]||0)<80) return u.n; } return 14; }

/* ---------- unit ---------- */
const TABS_LEARN = [['path','📚 មេរៀនតាមសៀវភៅ'],['listen','🎧 ស្តាប់'],['vocab','🔤 វាក្យសព្ទ'],['grammar','📐 វេយ្យាករណ៍'],['practice','✍️ លំហាត់'],['exam','📝 ប្រឡងបញ្ចប់មេរៀន']];
const TABS_TEACH = [['plan','📋 ផែនការបង្រៀន'],['worksheet','🖨 សន្លឹកលំហាត់']];
function renderUnit(){
  const u = U(view.unit), st = UNIT_STYLE[u.n];
  setUnitColors(u.n);
  const tabs = ROLE_NOW==='student' ? TABS_STU() : TABS_LEARN.concat(S.mode==='teach'?TABS_TEACH:[]);
  if(!tabs.find(t=>t[0]===view.tab)) view.tab=tabs[0][0];
  if(ROLE_NOW==='student') return renderStuUnit(u, tabs);
  $('#main').innerHTML = `
  <div class="uhero">
    <div class="big">${u.n}</div>
    <div><h2>${esc(u.en)}</h2><div class="kmt">${u.km}</div><div class="pgs">📘 Student's Book p${u.start}–${u.end} • ${LESSONS[u.n].sections.length} ផ្នែក • ${unitTracks(u.n).length} បទសំឡេង • ${u.vocab.length} ពាក្យ</div></div>
    <div class="emo float">${st.icon}</div>
    <div class="act">
      <button class="btn white xl" onclick="Deck.open(${u.n})">▶ ${S.mode==='teach'?'បង្រៀនជាស្លាយ':'រៀនជាស្លាយ'}</button>
      <button class="btn ghost" onclick="Book.open(${u.start})">📖 សៀវភៅឌីជីថល p${u.start}</button>
      <button class="btn ghost" onclick="openPdf(3)">📗 Workbook</button>
      <button class="btn ghost teach-only" onclick="openPdf(2)">📕 Teacher's Guide</button>
      <span style="flex:1"></span>
      <button class="btn ghost sm" onclick="go('home')">⌂</button>
      <button class="btn ghost sm" ${u.n<=1?'disabled style="opacity:.4"':''} onclick="go('unit',${u.n-1},'${view.tab}')">◀</button>
      <button class="btn ghost sm" ${u.n>=14?'disabled style="opacity:.4"':''} onclick="go('unit',${u.n+1},'${view.tab}')">▶</button>
    </div>
  </div>
  <div class="tabs">${tabs.map(t=>`<button class="${t[0]===view.tab?'on':''}" onclick="go('unit',${u.n},'${t[0]}')">${t[1]}</button>`).join('')}</div>
  <div id="tab"></div>`;
  ({path:tabPath, listen:tabListen, vocab:tabVocab, grammar:tabGrammar, practice:tabPractice, plan:tabPlan, worksheet:tabWorksheet, exam:Exam.tab})[view.tab](u);
}

/* lesson path: sections in book order */
function sectionTracks(n, si){ const L=LESSONS[n], s=L.sections[si], nx=L.sections[si+1]; return unitTracks(n).filter(t=>t.page>=s.p && t.page<(nx?nx.p:999)); }
function tabPath(u){
  const L = LESSONS[u.n];
  $('#tab').innerHTML = `<div class="cols" style="grid-template-columns:1.6fr 1fr;align-items:start">
    <div class="path">${L.sections.map((s,si)=>{ const K=KIND[s.k], tl=sectionTracks(u.n,si);
      return `<div class="step" style="animation-delay:${si*0.05}s">
        <div class="ki">${K.i}</div>
        <div><div class="kk">${K.en} • <span class="km">${K.km}</span></div><div class="tt">${esc(s.t)}</div><div class="dd">${s.km}</div>
          ${tl.length?`<div class="tchips">${tl.map(t=>`<button onclick="P.load(unitTracks(${u.n}),${unitTracks(u.n).indexOf(t)})">▶ ${t.id}</button>`).join('')}</div>`:''}</div>
        <div class="pgn"><span class="pbadge">p${s.p}</span>
          <button class="btn sm teal" onclick="Deck.open(${u.n},${s.p})">▶ ស្លាយ</button>
          <button class="btn sm ghost" onclick="openBook(1,${s.p})">📘</button></div>
      </div>`}).join('')}</div>
    <div style="position:sticky;top:130px">
      <div class="panel">
        <h3 class="sec">🎯 គោលបំណងមេរៀន</h3>
        ${u.goals.map(g=>`<div class="km" style="margin:6px 0">✅ ${g}</div>`).join('')}
        <h3 class="sec" style="margin-top:16px">📐 វេយ្យាករណ៍ (តាមសៀវភៅ)</h3>
        <div>${L.grammar.map(g=>`<span class="chip">${esc(g.t)} <small>p${g.p}</small></span>`).join('')}</div>
        <h3 class="sec" style="margin-top:16px">📊 វឌ្ឍនភាព</h3>
        <div class="note">🎧 ${tracksDone(u.n)} / ${unitTracks(u.n).length} បទ</div><div class="bar"><i style="width:${tracksDone(u.n)/unitTracks(u.n).length*100}%"></i></div>
        <div class="note" style="margin-top:8px">🔤 ${knownCount(u.n)} / ${u.vocab.length} ពាក្យ</div><div class="bar"><i style="width:${knownCount(u.n)/u.vocab.length*100}%"></i></div>
        <div class="note" style="margin-top:8px">✍️ ពិន្ទុល្អបំផុត៖ <b>${S.quiz[u.n]!=null?S.quiz[u.n]+'%':'—'}</b></div>
      </div>
    </div></div>`;
}

function tabListen(u){
  const list = unitTracks(u.n), L=LESSONS[u.n];
  let rows='';
  L.sections.forEach((s,si)=>{ const tl=sectionTracks(u.n,si); if(!tl.length) return;
    rows += `<div class="secrow">${KIND[s.k].i} p${s.p} • ${esc(s.t)}</div>` + tl.map(t=>{ const i=list.indexOf(t); return `
      <div class="trk ${P.list[P.i]&&P.list[P.i].id===t.id?'on':''}" data-id="${t.id}" style="animation-delay:${i*0.02}s" onclick="P.load(unitTracks(${u.n}),${i})">
        <div class="pl">▶</div><div class="id">${t.id}</div>
        <div class="tx">${esc(t.text)} ${S.listened[t.id]?'<span class="done">✓</span>':''}</div>
        <div><button class="btn ghost sm" onclick="event.stopPropagation();openBook(1,${t.page})">p${t.page}</button></div>
      </div>`}).join('');
  });
  $('#tab').innerHTML = `<div class="panel">
    <div class="row" style="justify-content:space-between;margin-bottom:6px">
      <h3 class="sec" style="margin:0">🎧 សំឡេងមេរៀន ${u.n} — ${list.length} បទ (តាមលំដាប់សៀវភៅ)</h3>
      <button class="btn teal sm" onclick="P.load(unitTracks(${u.n}),0)">▶ ចាក់ទាំងអស់ពីដើម</button>
    </div>
    <p class="note">0.75× ស្តាប់យឺត • 🔁 ចាក់ម្តងទៀត • A-B ហាត់និយាយតាមមួយប្រយោគ • 📄 បើកទំព័រសៀវភៅ • Space = ផ្អាក</p>
    <div class="tracks">${rows}</div></div>`;
}

let vMode='cards', fIdx=0, fOrder=[];
function tabVocab(u){
  const known = new Set(S.known[u.n]||[]);
  if(!fOrder.length || fOrder._u!==u.n){ fOrder = u.vocab.map((_,i)=>i); fOrder._u=u.n; fIdx=0; }
  const head = `<div class="row" style="justify-content:space-between;margin-bottom:14px">
      <div class="row"><button class="btn ${vMode==='cards'?'':'ghost'} sm" onclick="vMode='cards';tabVocab(U(${u.n}))">🖼 កាតរូបភាព</button>
      <button class="btn ${vMode==='flash'?'':'ghost'} sm" onclick="vMode='flash';tabVocab(U(${u.n}))">🃏 កាតបង្វិល</button>
      <button class="btn ghost sm" onclick="speakAll(${u.n})">🔊 អានទាំងអស់</button><button class="btn ghost sm" onclick="speechSynthesis.cancel()">⏹</button></div>
      <div class="note">📒 Wordlist សៀវភៅ p${u.wl} — ${u.vocab.length} ពាក្យ (គ្រប់ពាក្យ) • ចេះ ${known.size} • ចុចកាត = ស្តាប់</div>
      <button class="btn ghost sm" onclick="openBook(1,${u.wl})">📘 Wordlist p${u.wl}</button></div>`;
  if(vMode==='cards'){
    $('#tab').innerHTML = `<div class="panel">${head}<div class="vgrid">${u.vocab.map((v,i)=>{ const em=emojiFor(u,v[0]);
      const gh = (v[3] && (i===0 || u.vocab[i-1][3]!==v[3])) ? `<div class="vgroup">${esc(v[3])}</div>` : '';
      return gh+`<div class="vc ${known.has(v[0])?'known':''}" style="animation-delay:${Math.min(i,30)*0.02}s" onclick="speak(${attr(v[0])})">
        <button class="chk" onclick="event.stopPropagation();markKnown(${u.n},${i},${!known.has(v[0])})">✓</button>
        ${em?`<div class="em">${em}</div>`:`<div class="av">${esc(clean(v[0]).replace(/^(a|an) /,'').charAt(0).toUpperCase())}</div>`}
        <div class="en">${esc(v[0])}</div><div class="pos">${esc(v[1])}</div><div class="kmw">${v[2]}</div></div>`}).join('')}</div></div>`;
  } else {
    const v = u.vocab[fOrder[fIdx]], em=emojiFor(u,v[0]);
    $('#tab').innerHTML = `<div class="panel">${head}
      <div class="flash"><div class="fcard" onclick="this.classList.toggle('flip')">
        <div class="face front">${em?`<div class="em">${em}</div>`:''}<div class="w">${esc(v[0])}</div><div class="p">${esc(v[1])} • ចុចដើម្បីបង្វិល</div></div>
        <div class="face back"><div class="k">${v[2]}</div><div class="p">${esc(v[0])}</div></div>
      </div></div>
      <div class="row" style="justify-content:center;margin-top:18px">
        <button class="btn ghost" onclick="flashMove(-1)">◀</button>
        <button class="btn ghost" onclick="speak(${attr(v[0])})">🔊 ស្តាប់</button>
        <button class="btn ghost" onclick="tryMic(${attr(v[0])})">🎤 ហាត់និយាយ</button>
        <button class="btn ${known.has(v[0])?'ghost':'sun'}" onclick="markKnown(${u.n},${fOrder[fIdx]},${!known.has(v[0])});flashMove(1)">${known.has(v[0])?'↺ មិនទាន់ចេះ':'✓ ចេះហើយ'}</button>
        <button class="btn ghost" onclick="flashMove(1)">▶</button>
        <button class="btn ghost" onclick="fOrder=shuffle(fOrder);fOrder._u=${u.n};fIdx=0;tabVocab(U(${u.n}))">🔀</button>
      </div>
      <p class="note" style="text-align:center">${fIdx+1} / ${u.vocab.length} • 🎤 ត្រូវការអ៊ីនធឺណិត (Chrome/Edge)</p></div>`;
    setTimeout(()=>speak(v[0]),200);
  }
}
function flashMove(d){ const u=U(view.unit); fIdx=(fIdx+d+u.vocab.length)%u.vocab.length; tabVocab(u); }
function markKnown(n,i,on){ const w=U(n).vocab[i][0]; const set=new Set(S.known[n]||[]); on?set.add(w):set.delete(w); S.known[n]=[...set]; save(); if(vMode==='cards') tabVocab(U(n)); }
function speakAll(n){ const words=U(n).vocab.map(v=>v[0]); let i=0; speechSynthesis.cancel(); (function nx(){ if(i>=words.length) return; const u=new SpeechSynthesisUtterance(clean(words[i++])); const v=pickVoice(); if(v){u.voice=v;u.lang=v.lang;} u.rate=S.rate; u.onend=()=>setTimeout(nx,600); speechSynthesis.speak(u);})(); }
function tryMic(w){ listenWord(w,(ok,heard)=>toast(ok?'✅ ល្អណាស់! "'+heard+'"':'🔁 ព្យាយាមម្តងទៀត — ឮថា "'+heard+'"')); }

function tabGrammar(u){
  $('#tab').innerHTML = u.grammar.map((g,i)=>`
    <div class="gcard" style="animation-delay:${i*0.07}s">
      <div class="row" style="justify-content:space-between"><h4>${esc(g.t)}</h4>
        <div class="row"><button class="btn sm ghost" onclick="openBook(1,${g.p})">📘 p${g.p}</button><button class="btn sm teal" onclick="Deck.open(${u.n},${g.p})">▶ ស្លាយ</button></div></div>
      <p class="rule">${g.km}</p>
      ${g.form?`<table class="ftable">${g.form.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`:''}
      ${g.ex.map(e=>`<div class="ex"><button class="spk" onclick="speak(${attr(e)})">🔊</button><span>${esc(e)}</span></div>`).join('')}
      ${(g.more||[]).length?`<div class="more">${g.more.map(m=>`<div>💡 ${m}</div>`).join('')}</div>`:''}
      ${(g.err||[]).length?`<div class="errs"><div class="note">⚠️ កំហុសដែលសិស្សតែងធ្វើ</div>${g.err.map(e=>`<div class="err"><span class="bad">❌ ${esc(e[0])}</span>→<span class="good">✅ ${esc(e[1])}</span></div>`).join('')}</div>`:''}
    </div>`).join('') + `<div class="row"><button class="btn" onclick="openBook(1,${u.gr})">📘 Grammar reference p${u.gr}</button><button class="btn sun" onclick="startQuiz(${u.n},'grammar')">✍️ ធ្វើលំហាត់វេយ្យាករណ៍</button></div>`;
}

/* ---------- practice ---------- */
const QTYPES = [
  ['mix','🎯','លាយចម្រុះ','សំណួរគ្រប់ប្រភេទ ១០ សំណួរ'],
  ['grammar','📐','វេយ្យាករណ៍','ជ្រើសពាក្យត្រឹមត្រូវបំពេញចន្លោះ'],
  ['en2km','🇬🇧','អង់គ្លេស → ខ្មែរ','មើលពាក្យអង់គ្លេស ជ្រើសន័យខ្មែរ'],
  ['km2en','🇰🇭','ខ្មែរ → អង់គ្លេស','មើលពាក្យខ្មែរ ជ្រើសពាក្យអង់គ្លេស'],
  ['pic','🖼️','រូបភាព → ពាក្យ','មើលរូប ជ្រើសពាក្យត្រឹមត្រូវ'],
  ['listen','🎧','ស្តាប់ហើយជ្រើស','ស្តាប់សំឡេង ជ្រើសពាក្យដែលឮ'],
  ['spell','⌨️','សរសេរប្រកប','មើលខ្មែរ/ស្តាប់ ហើយវាយពាក្យ']
];
function tabPractice(u){
  $('#tab').innerHTML = `<div class="panel"><h3 class="sec">✍️ ជ្រើសប្រភេទលំហាត់</h3>
    <div class="qtypes">${QTYPES.map((q,i)=>`<button class="qtype" style="animation-delay:${i*0.05}s" onclick="startQuiz(${u.n},'${q[0]}')"><div class="qi">${q[1]}</div><b>${q[2]}</b><span>${q[3]}</span></button>`).join('')}</div>
    <p class="note" style="margin-top:14px">ពិន្ទុល្អបំផុត៖ ${S.quiz[u.n]!=null?S.quiz[u.n]+'%':'—'} • ទទួលបាន 80% ឡើងទៅ = ឆ្លងមេរៀន ✅</p></div>`;
}
let Q=null;
function vocabPool(u){ return u.vocab.filter(v=>!/[→↔\/]/.test(v[0])); }
function makeVocabQ(u,type){
  let pool=vocabPool(u);
  if(type==='pic') pool=pool.filter(v=>{ const e=emojiFor(u,v[0]); return e && !/^\d+$/.test(e); });
  if(pool.length<4) { pool=vocabPool(u); if(type==='pic') type='en2km'; }
  const i=Math.floor(Math.random()*pool.length), v=pool[i];
  const others=shuffle(pool.filter((_,j)=>j!==i)).slice(0,3);
  if(type==='en2km') return {kind:'mc',prompt:v[0],speakIt:v[0],opts:shuffle([v,...others]).map(x=>x[2]),ans:v[2],kmOpts:true};
  if(type==='km2en') return {kind:'mc',prompt:v[2],kmPrompt:true,opts:shuffle([v,...others]).map(x=>x[0]),ans:v[0]};
  if(type==='pic') return {kind:'mc',emoji:emojiFor(u,v[0]),prompt:'',opts:shuffle([v,...others]).map(x=>x[0]),ans:v[0]};
  if(type==='listen') return {kind:'mc',prompt:'',audio:v[0],opts:shuffle([v,...others]).map(x=>x[0]),ans:v[0]};
  return {kind:'spell',prompt:v[2],kmPrompt:true,audio:v[0],ans:v[0]};
}
function startQuiz(n,type){
  const u=U(n); let qs=[];
  const gq = q=>({kind:'mc',prompt:q.q,opts:shuffle(q.o),ans:q.o[q.a]});
  if(type==='grammar') qs=shuffle(u.quiz).map(gq);
  else if(type==='mix'){ qs=shuffle(u.quiz).slice(0,4).map(gq); ['en2km','km2en','pic','listen','spell','pic'].forEach(t=>qs.push(makeVocabQ(u,t))); qs=shuffle(qs); }
  else { const seen=new Set(); let guard=0; while(qs.length<10 && guard++<300){ const q=makeVocabQ(u,type); if(!seen.has(q.ans)){seen.add(q.ans);qs.push(q);} } }
  Q={n,type,qs,i:0,score:0,locked:false};
  if(view.name!=='unit'||view.tab!=='practice'){ view={name:'unit',unit:n,tab:'practice'}; renderUnit(); }
  showQ();
}
function showQ(){
  const q=Q.qs[Q.i];
  const top=`<div class="qtop"><span>សំណួរ ${Q.i+1} / ${Q.qs.length}</span><span>⭐ ${Q.score}</span><button class="btn ghost sm" onclick="tabPractice(U(${Q.n}))">✕ ចេញ</button></div><div class="bar"><i style="width:${Q.i/Q.qs.length*100}%"></i></div>`;
  let body='';
  if(q.kind==='mc'){
    const pr = q.emoji ? `<span class="em">${q.emoji}</span>What's this?` : q.audio ? `<button class="btn teal xl" onclick="speak(${attr(q.audio)})">🔊 ស្តាប់ម្តងទៀត</button>` : esc(q.prompt).replace('___','<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>');
    body=`<div class="qprompt ${q.kmPrompt?'kmq':''}">${pr} ${q.speakIt?`<button class="spk" onclick="speak(${attr(q.speakIt)})">🔊</button>`:''}</div>
      <div class="opts">${q.opts.map((o,k)=>`<button class="opt ${q.kmOpts?'kmo':''}" data-o="${esc(o)}" onclick="answer(this)">${String.fromCharCode(65+k)}. ${esc(o)}</button>`).join('')}</div>`;
  } else {
    body=`<div class="qprompt kmq">${esc(q.prompt)} <button class="spk" onclick="speak(${attr(q.audio)})">🔊</button></div>
      <div class="spell"><input id="spIn" autocomplete="off" placeholder="type in English…" onkeydown="if(event.key==='Enter')checkSpell()"><button class="btn teal" onclick="checkSpell()">✓</button></div>`;
  }
  $('#tab').innerHTML=`<div class="panel"><div class="qwrap">${top}${body}<div class="fb" id="fb"></div></div></div>`;
  Q.locked=false;
  if(q.audio && q.kind==='mc') setTimeout(()=>speak(q.audio),250);
  if(q.kind==='spell') setTimeout(()=>{const i=$('#spIn'); if(i) i.focus();},50);
}
function answer(btn){
  if(Q.locked) return; Q.locked=true;
  const q=Q.qs[Q.i], ok=btn.dataset.o===q.ans;
  document.querySelectorAll('.opt').forEach(b=>{ if(b.dataset.o===q.ans) b.classList.add('right'); });
  if(!ok) btn.classList.add('wrong'); else Q.score++;
  feedback(ok,q.ans);
}
function checkSpell(){
  if(Q.locked) return;
  const q=Q.qs[Q.i], v=$('#spIn').value.trim().toLowerCase().replace(/[’]/g,"'").replace(/^(a|an) /,'');
  const target=clean(q.ans).toLowerCase().replace(/^(a|an) /,'').replace(/[!?.]/g,'');
  if(!v) return; Q.locked=true;
  const ok = v.replace(/[!?.]/g,'')===target; if(ok) Q.score++;
  feedback(ok,q.ans);
}
function feedback(ok,ans){
  const fb=$('#fb'); fb.className='fb '+(ok?'ok':'no');
  fb.innerHTML = ok ? ['✅ ត្រឹមត្រូវ! ពូកែណាស់','🌟 អស្ចារ្យ!','👏 ល្អណាស់!'][Math.floor(Math.random()*3)] : '❌ ចម្លើយត្រឹមត្រូវ៖ <b>'+esc(ans)+'</b>';
  beep(ok);
  setTimeout(()=>{ Q.i++; Q.i<Q.qs.length ? showQ() : finishQ(); }, ok?900:1900);
}
function finishQ(){
  const pct=Math.round(Q.score/Q.qs.length*100);
  track('quiz', Q.n+':'+pct); if(S.quiz[Q.n]==null || pct>S.quiz[Q.n]){ S.quiz[Q.n]=pct; } save();
  $('#tab').innerHTML=`<div class="panel result"><div style="font-size:64px" class="pop">${pct>=80?'🏆':pct>=50?'👍':'💪'}</div><div class="score">${pct}%</div>
    <p class="km" style="font-size:18px">${pct>=80?'🎉 អស្ចារ្យ! អ្នកឆ្លងមេរៀននេះហើយ':pct>=50?'👍 ល្អ! ហាត់បន្ថែមបន្តិចទៀត':'💪 កុំបោះបង់! រៀនវាក្យសព្ទម្តងទៀត ហើយសាកល្បងម្តងទៀត'}</p>
    <p class="note">ត្រូវ ${Q.score} / ${Q.qs.length}</p>
    <div class="row" style="justify-content:center"><button class="btn teal" onclick="startQuiz(${Q.n},'${Q.type}')">↺ ធ្វើម្តងទៀត</button><button class="btn ghost" onclick="tabPractice(U(${Q.n}))">ប្រភេទផ្សេង</button>${Q.n<14?`<button class="btn sun" onclick="go('unit',${Q.n+1})">Unit ${Q.n+1} ▶</button>`:''}</div></div>`;
  if(pct>=80) pageConfetti();
}
let actx;
function beep(ok){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); const o=actx.createOscillator(), g=actx.createGain(); o.type='sine'; o.connect(g); g.connect(actx.destination); o.frequency.setValueAtTime(ok?660:220,actx.currentTime); if(ok) o.frequency.setValueAtTime(990,actx.currentTime+.09); g.gain.setValueAtTime(.12,actx.currentTime); g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+.3); o.start(); o.stop(actx.currentTime+.31);}catch(e){} }
function pageConfetti(){ const c=document.createElement('canvas'); c.style.cssText='position:fixed;inset:0;z-index:3000;pointer-events:none'; document.body.appendChild(c); const ctx=c.getContext('2d'); c.width=innerWidth; c.height=innerHeight; const cols=['#f59e0b','#10b981','#3b82f6','#ef4444','#a855f7']; const ps=Array.from({length:150},()=>({x:innerWidth/2,y:innerHeight/2,vx:(Math.random()-.5)*18,vy:-Math.random()*18-4,s:Math.random()*8+4,c:cols[Math.floor(Math.random()*5)],r:0})); let f=0; (function st(){ctx.clearRect(0,0,c.width,c.height); ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.5;p.r+=.2;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);ctx.restore();}); if(++f<110) requestAnimationFrame(st); else c.remove();})(); }

/* ---------- teacher: lesson plan from book sections ---------- */
const ACT = {
  open:'បង្ហាញស្លាយចំណងជើង និងគោលបំណង • សួរសិស្សពីអ្វីដែលពួកគេដឹងរួច (brainstorm)។',
  grammar:'បង្ហាញច្បាប់ → ឧទាហរណ៍ម្តងមួយៗ (Remote ▶) → សួរសិស្សបង្កើតប្រយោគផ្ទាល់ខ្លួន • ចាក់សំឡេង Listen & repeat។',
  practice:'សិស្សធ្វើលំហាត់ក្នុងសៀវភៅជាគូ → ពិនិត្យចម្លើយលើស្លាយ • ប្រើ 🎲 ជ្រើសសិស្សឆ្លើយ។',
  vocab:'បង្ហាញកាតរូបភាព → និយាយតាម (choral drill) → Quick check (បង្ហាញរូប សិស្សទាយពាក្យ)។',
  read:'Pre-reading: សួរសំណួរនាំផ្លូវ → អាន/ស្តាប់ → ឆ្លើយសំណួរលើស្លាយ → ពិភាក្សាជាក្រុម។',
  listen:'ណែនាំភារកិច្ច → ចាក់លើកទី១ (យល់ទូទៅ) → លើកទី២ (ព័ត៌មានលម្អិត) → ពិនិត្យចម្លើយ។',
  speak:'គ្រូធ្វើគំរូជាមួយសិស្សម្នាក់ → សិស្សហាត់ជាគូ (Role-play) → គូ២–៣ បង្ហាញមុខថ្នាក់។',
  write:'បង្ហាញឃ្លាគំរូលើស្លាយ → សិស្សសរសេរ ៥–៦ ប្រយោគ → ផ្លាស់ប្តូរកែជាមួយមិត្ត។',
  everyday:'ស្តាប់ការសន្ទនា → និយាយតាមឃ្លាសំខាន់ៗ → Role-play ស្ថានភាពពិត។',
  review:'រំលឹកវេយ្យាករណ៍ទាំងអស់ → Unit quiz លើស្លាយ (ប្រកួតជាក្រុម 🏆) → ដាក់កិច្ចការផ្ទះ។'
};
const MIN = {open:5,grammar:15,practice:10,vocab:10,read:15,listen:12,speak:10,write:12,everyday:12,review:10};
function tabPlan(u){
  const L=LESSONS[u.n]; let t=0;
  const rows=L.sections.map((s,si)=>{ const m=MIN[s.k]||10, a=t; t+=m; const tl=sectionTracks(u.n,si);
    return {time:`${a}–${t}′`, s, tl}; });
  $('#tab').innerHTML=`<div class="panel">
    <div class="row" style="justify-content:space-between"><h3 class="sec" style="margin:0">📋 ផែនការបង្រៀន Unit ${u.n} — តាមលំដាប់សៀវភៅ (~${t} នាទី ≈ ${Math.ceil(t/90)} វគ្គ)</h3>
    <div class="row"><button class="btn ghost sm" onclick="openPdf(2)">📕 Teacher's Guide</button><button class="btn sm" onclick="window.print()">🖨 បោះពុម្ព</button></div></div>
    <p class="km"><b>គោលបំណង៖</b> ${u.goals.join(' • ')}</p>
    ${rows.map(r=>`<div class="stage"><div class="t">${r.time}<br><span class="pbadge">p${r.s.p}</span></div><div>
      <h4>${KIND[r.s.k].i} ${esc(r.s.t)}</h4><p>${r.s.km}</p><p style="margin-top:4px">👉 ${ACT[r.s.k]}</p>
      <div class="row" style="margin-top:6px">${r.tl.map(t=>`<button class="btn ghost sm" onclick="P.load(unitTracks(${u.n}),${unitTracks(u.n).indexOf(t)})">▶ ${t.id}</button>`).join('')}
      <button class="btn teal sm" onclick="Deck.open(${u.n},${r.s.p})">▶ ស្លាយ</button></div></div></div>`).join('')}
    <p class="note" style="margin-top:12px">ពេលវេលាជាការណែនាំ — កែសម្រួលតាមកម្រិតសិស្ស និងកម្មវិធីសិក្សា MoEYS។</p></div>`;
  $('#printArea').innerHTML = `<h1>Lesson plan — Unit ${u.n}: ${esc(u.en)} (${u.km})</h1><p>${u.goals.join(' • ')}</p>`+rows.map(r=>`<h2>${r.time} • p${r.s.p} • ${esc(r.s.t)}</h2><p>${r.s.km}<br>👉 ${ACT[r.s.k]}${r.tl.length?'<br>🎧 '+r.tl.map(t=>t.id).join(', '):''}</p>`).join('');
}

/* ---------- teacher: worksheet ---------- */
function tabWorksheet(u){
  $('#tab').innerHTML=`<div class="panel"><h3 class="sec">🖨 បង្កើតសន្លឹកលំហាត់សម្រាប់បោះពុម្ព</h3>
    <p class="km">ជ្រើសពាក្យ និងសំណួរដោយចៃដន្យ — រាល់ពេលចុច «បង្កើតថ្មី» បានសន្លឹកខុសគ្នា។ មានទំព័រចម្លើយនៅខាងក្រោយ។</p>
    <div class="row"><label class="km">ចំនួនពាក្យ <select id="wsN"><option>8</option><option selected>10</option><option>12</option><option>15</option></select></label>
      <label class="km"><input type="checkbox" id="wsKey" checked> ភ្ជាប់ទំព័រចម្លើយ</label>
      <button class="btn teal" onclick="buildWS(${u.n})">🔄 បង្កើតថ្មី</button><button class="btn sun" onclick="window.print()">🖨 បោះពុម្ព / PDF</button></div>
    <div id="wsPrev" style="margin-top:16px;border:1px dashed var(--line);border-radius:16px;padding:20px;background:#fff"></div></div>`;
  buildWS(u.n);
}
function buildWS(n){
  const u=U(n), k=+$('#wsN').value, pool=vocabPool(u), words=shuffle(pool).slice(0,k);
  const match=shuffle(words), gq=shuffle(u.quiz), spellW=shuffle(pool.filter(v=>!words.includes(v))).slice(0,6);
  const html=`<h1>Unit ${u.n}: ${esc(u.en)} — ${u.km}</h1>
    <div class="ws-row"><span>Name / ឈ្មោះ: ______________________</span><span>Class / ថ្នាក់: ________</span><span>Date: ________</span><span>Score: ____ / ${words.length+gq.length+spellW.length}</span></div>
    <h2>A. Match the words. ផ្គូផ្គងពាក្យអង់គ្លេសជាមួយអត្ថន័យខ្មែរ</h2>
    <table>${words.map((w,i)=>`<tr><td style="width:50%">${i+1}. ${esc(w[0])} ____</td><td class="km">${String.fromCharCode(97+i)}. ${match[i][2]}</td></tr>`).join('')}</table>
    <h2>B. Choose the correct answer. គូសរង្វង់ចម្លើយត្រឹមត្រូវ</h2>
    <table>${gq.map((q,i)=>`<tr><td>${i+1}. ${esc(q.q).replace('___','________')}</td><td style="width:45%">${q.o.map((o,j)=>String.fromCharCode(97+j)+') '+esc(o)).join('&nbsp;&nbsp;&nbsp;')}</td></tr>`).join('')}</table>
    <h2>C. Write the English word. សរសេរពាក្យជាភាសាអង់គ្លេស</h2>
    <table>${spellW.map((w,i)=>`<tr><td class="km" style="width:50%">${i+1}. ${w[2]}</td><td>_________________________</td></tr>`).join('')}</table>
    ${$('#wsKey').checked?`<div class="pbreak"></div><h1>Answer key — Unit ${u.n}</h1>
    <h2>A</h2><p>${words.map((w,i)=>`${i+1}–${String.fromCharCode(97+match.indexOf(w))}`).join(', ')}</p>
    <h2>B</h2><p>${gq.map((q,i)=>`${i+1}. ${esc(q.o[q.a])}`).join(' • ')}</p>
    <h2>C</h2><p>${spellW.map((w,i)=>`${i+1}. ${esc(w[0])}`).join(' • ')}</p>`:''}`;
  $('#wsPrev').innerHTML=html; $('#printArea').innerHTML=html;
}

/* ---------- teacher tools ---------- */
function modal(html){ $('#modal').innerHTML='<button class="x" onclick="closeModal()">✕</button>'+html; $('#ov').classList.add('show'); }
function closeModal(){ $('#ov').classList.remove('show'); $('#modal').classList.remove('wide','xwide'); }
$('#ov').addEventListener('click',e=>{ if(e.target.id==='ov') closeModal(); });
let TM={left:300,left0:300,run:false,h:null};
function openTimer(){
  modal(`<h3>⏱ នាឡិកាកំណត់ពេល</h3><div class="timer-d" id="tmD">${fmt(TM.left)}</div>
   <div class="row" style="justify-content:center">${[1,2,3,5,10,15].map(m=>`<button class="btn ghost sm" onclick="tmSet(${m*60})">${m} នាទី</button>`).join('')}</div>
   <div class="row" style="justify-content:center;margin-top:12px"><button class="btn teal" onclick="tmGo()">▶ / ⏸</button><button class="btn ghost" onclick="tmSet(TM.left0)">↺</button></div>`);
}
function tmSet(s){ TM.left=s; TM.left0=s; TM.run=false; clearInterval(TM.h); const d=$('#tmD'); if(d){d.textContent=fmt(s);d.classList.remove('end');} }
function tmGo(){ TM.run=!TM.run; clearInterval(TM.h); if(TM.run) TM.h=setInterval(()=>{ TM.left--; const d=$('#tmD'); if(d) d.textContent=fmt(Math.max(0,TM.left)); if(TM.left<=0){ clearInterval(TM.h); TM.run=false; if(d) d.classList.add('end'); for(let i=0;i<3;i++) setTimeout(()=>beep(true),i*350); } },1000); }
function openPicker(){
  const st=Class.studentsForPicker();
  modal(`<h3>🎲 ជ្រើសសិស្សដោយចៃដន្យ</h3><div class="pick-d" id="pkD"><div class="pk-av" id="pkAv">❓</div><div id="pkName">?</div></div>
   <div class="row" style="justify-content:center;margin-bottom:12px"><button class="btn sun" onclick="pick()">🎲 ជ្រើស!</button><label class="km note"><input type="checkbox" id="pkRm" ${S.pkRm?'checked':''} onchange="S.pkRm=this.checked;save()"> មិនជ្រើសម្នាក់ដដែលម្តងទៀត</label></div>
   ${st.length?`<p class="note">👥 ជ្រើសពីថ្នាក់ «${esc((Class.data().classes.find(c=>c.id===Class.data().cur)||{}).name||'')}» — ${st.length} នាក់ ${PK.done.size?`• បានហៅរួច ${PK.done.size} <a href="#" onclick="PK.done.clear();openPicker();return false">↺ ចាប់ផ្តើមឡើងវិញ</a>`:''}</p>`
   :`<p class="note">បញ្ចូលឈ្មោះសិស្ស (មួយបន្ទាត់មួយឈ្មោះ) ឬបង្កើតថ្នាក់ក្នុង 👥 ថ្នាក់រៀន ដើម្បីបង្ហាញរូបថត</p><textarea class="names" id="pkN" oninput="S.names=this.value;save()">${esc(S.names)}</textarea>`}`);
}
const PK={done:new Set()};
function pick(){
  const st=Class.studentsForPicker();
  let pool = st.length ? st : S.names.split('\n').map(s=>s.trim()).filter(Boolean).map(n=>({id:n,name:n}));
  if(!pool.length) return toast('សូមបញ្ចូលឈ្មោះសិស្សជាមុនសិន');
  if($('#pkRm').checked){ const left=pool.filter(s=>!PK.done.has(s.id)); if(!left.length){ PK.done.clear(); toast('↺ គ្រប់គ្នាត្រូវបានហៅហើយ — ចាប់ផ្តើមជុំថ្មី'); } else pool=left; }
  const d=$('#pkD'), av=$('#pkAv'), nm=$('#pkName'); d.classList.remove('win');
  let c=0; const step=()=>{ const s=pool[Math.floor(Math.random()*pool.length)]; av.innerHTML=Class.avatar(s,120); nm.textContent=s.name; beep(false);
    if(++c<18) setTimeout(step,60+c*c*1.6); else { const w=pool[Math.floor(Math.random()*pool.length)]; av.innerHTML=Class.avatar(w,140); nm.textContent='🌟 '+w.name; d.classList.add('win'); beep(true); PK.done.add(w.id); } };
  step();
}
const TCOL=['linear-gradient(135deg,#0f766e,#14b8a6)','linear-gradient(135deg,#be123c,#fb7185)','linear-gradient(135deg,#6d28d9,#a78bfa)','linear-gradient(135deg,#b45309,#fbbf24)'];
function openScore(){
  modal(`<h3>🏆 ពិន្ទុក្រុម</h3><div class="teams">${S.teams.map((t,i)=>`<div class="team" style="background:${TCOL[i%4]}">
    <input value="${esc(t.n)}" oninput="S.teams[${i}].n=this.value;save()"><div class="sc">${t.s}</div>
    <button onclick="S.teams[${i}].s--;save();openScore()">−</button><button onclick="S.teams[${i}].s++;save();beep(true);openScore()">+</button></div>`).join('')}</div>
    <div class="row" style="margin-top:14px"><button class="btn ghost sm" onclick="if(S.teams.length<4){S.teams.push({n:'ក្រុម '+'ABCD'[S.teams.length],s:0});save();openScore()}">+ ក្រុម</button>
    <button class="btn ghost sm" onclick="if(S.teams.length>2){S.teams.pop();save();openScore()}">− ក្រុម</button>
    <button class="btn ghost sm" onclick="S.teams.forEach(t=>t.s=0);save();openScore()">↺ សូន្យ</button></div>`);
}
function openSettings(){
  loadVoices();
  modal(`<h3>⚙️ ការកំណត់</h3>
   <p class="km"><b>សំឡេងអាន (Text-to-Speech)</b></p>
   <select style="width:100%;padding:8px;border-radius:10px" onchange="S.voice=this.value;save();speak('Hello! Welcome to English class.')">
     <option value="">— ស្វ័យប្រវត្តិ (English UK) —</option>${voices.map(v=>`<option ${v.name===S.voice?'selected':''} value="${esc(v.name)}">${esc(v.name)} (${v.lang})</option>`).join('')}</select>
   <p class="km" style="margin-top:14px"><b>ល្បឿនអាន</b>: <span id="stRv">${S.rate}</span></p>
   <input type="range" min="0.5" max="1.2" step="0.05" value="${S.rate}" style="width:100%" oninput="S.rate=+this.value;$('#stRv').textContent=this.value;save()">
   <hr style="border:0;border-top:1px solid var(--line);margin:18px 0">
   <p class="km"><b>🎮 Remote Presenter</b> — ក្នុងស្លាយ៖ ▶/PageDown បន្ទាប់ • ◀/PageUp ថយ • B អេក្រង់ខ្មៅ • F5 ពេញអេក្រង់ • L Laser • V ទំព័រសៀវភៅ • G ស្លាយទាំងអស់ • A សំឡេង</p>
   <hr style="border:0;border-top:1px solid var(--line);margin:18px 0">
   <p class="km"><b>ទិន្នន័យវឌ្ឍនភាព</b> — រក្សាទុកក្នុងកុំព្យូទ័រនេះ</p>
   <div class="row"><button class="btn ghost sm" onclick="exportData()">⬇ Backup</button>
   <label class="btn ghost sm">⬆ Restore<input type="file" accept=".json" style="display:none" onchange="importData(this.files[0])"></label>
   <button class="btn ghost sm" style="color:var(--rose)" onclick="if(confirm('លុបវឌ្ឍនភាពទាំងអស់?')){S.known={};S.quiz={};S.listened={};save();closeModal();render();}">🗑 លុបវឌ្ឍនភាព</button></div>`);
}
function exportData(){ const b=new Blob([JSON.stringify(S,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='beginner-studio-progress.json'; a.click(); }
function importData(f){ if(!f) return; f.text().then(t=>{ Object.assign(S,JSON.parse(t)); save(); closeModal(); setMode(S.mode); toast('✅ នាំចូលរួចរាល់'); }).catch(()=>toast('ឯកសារមិនត្រឹមត្រូវ')); }

/* ---------- start ---------- */
if(window.Auth && Auth.gate()){
  const tl=document.querySelector('header .tools');
  if(ROLE_NOW==='admin') tl.insertAdjacentHTML('afterbegin','<button class="adm-only" onclick="go(\'admin\',null,\'users\')">🛡️<span>Admin</span></button>');
  if(ROLE_NOW==='student') tl.insertAdjacentHTML('afterbegin','<button onclick="go(\'me\')">📊<span>លទ្ធផលខ្ញុំ</span></button>');
  tl.insertAdjacentHTML('beforeend', Auth.headerChip());
}
Deck.init();
Book.init();
if(ROLE_NOW==='student'){ Deck.open=(n)=>go('unit',n||nextUnit(),'lesson'); Book.open=()=>toast('📖 សូមបើកសៀវភៅពិតរបស់អ្នក'); window.openBook=()=>toast('📖 សូមបើកសៀវភៅពិតរបស់អ្នក'); window.openPdf=()=>{}; if(Deck.bookToggle) Deck.bookToggle=()=>{}; }
if(TRACKING){ const _dO=Deck.open, _bO=Book.open; Deck.open=(n,p)=>{ track('slides', n); return _dO(n,p); }; Book.open=p=>{ track('book', p==null?'':p); return _bO(p); }; }
if(ROLE_NOW) setMode(S.mode||'learn');
window.addEventListener('resize', ()=>{ if(!ROLE_NOW) return; const b=(S.mode==='learn'?$('#mLearn'):$('#mTeach')); const pill=$('#mPill'); pill.style.left=b.offsetLeft+'px'; pill.style.width=b.offsetWidth+'px'; });
