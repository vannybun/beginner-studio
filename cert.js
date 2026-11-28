// =====================================================================
//  cert.js — 🏅 ប័ណ្ណសរសើរ
//  • 💪 រៀនបានច្រើនម៉ោងជាងគេ (សប្តាហ៍ • ខែ • ឆ្នាំ) • 💰 រកលុយពីការរៀនបានច្រើនជាងគេ (សប្តាហ៍ • ខែ • ឆ្នាំ)
//  • 📝 ប្រឡងបញ្ចប់មេរៀនជាប់តាមនិទ្ទេស (A–E)
//  • ប្រព័ន្ធស្នើ → គ្រូ ✅ អនុម័ត → គ្រូ 📤 ផ្ញើ → សិស្សទើបឃើញ • រក្សាទុករហូត (c.certs) លុះត្រាគ្រូ 🗑 ដកហូត
//  c.certs = [{id, k, t:'busy'|'rich'|'exam', sid, p:{y:'w'|'m'|'y', key}, rk, v, g, n, st:'ok'|'sent'|'no', ts, sent, by, tn}]
// =====================================================================
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const J = k => { try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } };
const $ = s => document.querySelector(s);
const BK='beginner-studio-board-v1', XK='beginner-studio-exams-v1', CK='beginner-studio-class-v1';
const MK=['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
const MEN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const GR=[[90,'A','ល្អប្រសើរ','Excellent'],[80,'B','ល្អណាស់','Very Good'],[70,'C','ល្អ','Good'],[60,'D','ល្អបង្គួរ','Fairly Good'],[50,'E','មធ្យម','Average']];
const KD=n=>String(n).replace(/\d/g,d=>'០១២៣៤៥៦៧៨៩'[d]);
const RK=new Proxy({},{get:(o,n)=>'លេខ '+KD(n)}), MED=new Proxy(['','🥇','🥈','🥉'],{get:(a,n)=>a[n]||'🏅'});
/* ⚙️ teacher-set rules: per type × period → mode 'rank' (top N, optional minimum) | 'goal' (everyone ≥ minimum) | 'off' */
const PER={w:'សប្តាហ៍',m:'ខែ',y:'ឆ្នាំ'};
const DEF={busy:{w:{mode:'rank',n:3,min:0},m:{mode:'rank',n:3,min:0},y:{mode:'rank',n:3,min:0}}, rich:{w:{mode:'rank',n:3,min:0},m:{mode:'rank',n:3,min:0},y:{mode:'rank',n:3,min:0}}, exam:{min:50}};
function cfg(c){ const o=(c&&c.certCfg)||{}, R={exam:{...DEF.exam,...(o.exam||{})}}; ['busy','rich'].forEach(t=>{ R[t]={}; ['w','m','y'].forEach(y=>{ R[t][y]={...DEF[t][y], ...((o[t]||{})[y]||{})}; }); }); return R; }
const dk = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const D = k => new Date(k+'T12:00:00');
const mon = d => { d=new Date(d); const w=(d.getDay()+6)%7; d.setDate(d.getDate()-w); return dk(d); };   // Monday of the week
const addD = (k,n) => { const d=D(k); d.setDate(d.getDate()+n); return dk(d); };
const fmtT = s => { const m=Math.round((s||0)/60); return m<60? m+' នាទី' : Math.floor(m/60)+' ម៉ោង'+(m%60?' '+m%60+' នាទី':''); };
const riel = n => Math.round(n||0).toLocaleString('en-US')+'៛';
const dm = k => { const d=D(k); return d.getDate()+'/'+(d.getMonth()+1); };
function perLabel(p){ if(p.y==='w') return `សប្តាហ៍ ${dm(p.key)}–${dm(addD(p.key,6))}/${p.key.slice(0,4)}`; if(p.y==='m'){ const [y,m]=p.key.split('-'); return `ខែ${MK[+m-1]} ${y}`; } return `ឆ្នាំ ${p.key}`; }
function perEn(p){ if(p.y==='w') return `Week of ${D(p.key).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`; if(p.y==='m'){ const [y,m]=p.key.split('-'); return `${MEN[+m-1]} ${y}`; } return `Year ${p.key}`; }
const gradeOf = pct => GR.find(g=>pct>=g[0]);
const TYPES = {busy:['💪','សិស្សឧស្សាហ៍រៀនជាងគេ','Most Hard-working Student'], rich:['💰','សិស្សប្រឹងរៀនរកលុយបានច្រើនជាងគេ','Top Learning Earner'], exam:['📝','ប្រឡងបញ្ចប់មេរៀនជាប់និទ្ទេស','Unit Test Achievement']};

/* ---------- numbers from the shared board (each student pushes a small summary) ---------- */
function entries(c){ const B=J(BK)||{}, out={}; Object.values(B).forEach(e=>{ if(e&&e.c===c.id&&e.s&&(!out[e.s]||(e.ts||0)>(out[e.s].ts||0))) out[e.s]=e; }); return out; }
function value(e, t, p){ if(!e) return 0; const days=()=>{ const ks=[]; for(let i=0;i<7;i++) ks.push(addD(p.key,i)); return ks; };
  if(t==='busy'){ if(p.y==='w') return days().reduce((a,k)=>a+((e.d||{})[k]||0),0);
    const sm=e.sm||{}, fromD=pre=>Object.entries(e.d||{}).filter(([k])=>k.startsWith(pre)).reduce((a,[,v])=>a+v,0);
    if(p.y==='m') return sm[p.key]!=null?sm[p.key]:fromD(p.key);
    const ys=Object.entries(sm).filter(([k])=>k.startsWith(p.key)); return ys.length?ys.reduce((a,[,v])=>a+v,0):fromD(p.key); }
  if(p.y==='w') return days().reduce((a,k)=>a+((e.rd||{})[k]||0),0);
  if(p.y==='m') return (e.rm||{})[p.key]||0;
  return Object.entries(e.rm||{}).filter(([k])=>k.startsWith(p.key)).reduce((a,[,v])=>a+v,0); }
function top(c, t, p){ const E=entries(c), K=cfg(c)[t][p.y]; if(!K||K.mode==='off') return [];
  const min=Math.max(t==='busy'?60:1, +K.min||0), L=c.students.map(s=>({s, v:value(E[s.id],t,p)})).filter(x=>x.v>=min).sort((a,b)=>b.v-a.v);
  if(K.mode==='goal') return L.map(x=>({...x, rk:0, goal:+K.min||0}));
  return L.slice(0,Math.max(1,Math.min(20,+K.n||3))).map((x,i)=>({...x, rk:i+1})); }
function examBest(c){ const X=(J(XK)||{}).results||[], users=(window.Auth&&Auth.data().users)||[], best={};
  X.forEach(r=>{ let sid=null; if(r.uid){ const u=users.find(x=>x.id===r.uid); if(u&&u.classId===c.id) sid=u.studentId; } if(!sid&&r.sid&&c.students.some(s=>s.id===r.sid)) sid=r.sid; if(!sid) return;
    const k=sid+':'+r.n; if(!best[k]||r.pct>best[k].pct) best[k]={sid, n:r.n, pct:r.pct, ts:r.ts}; });
  return Object.values(best).filter(b=>b.pct>=Math.max(50,+cfg(c).exam.min||50)); }

/* ---------- suggestions: last finished week / month / year + exam grades ---------- */
const CS = c => (c.certs=c.certs||[]);
const has = (c,k) => CS(c).some(x=>x.k===k);
function periods(){ const now=new Date(), wk=mon(now), m=dk(now).slice(0,7), y=String(now.getFullYear());
  const pm=new Date(now.getFullYear(), now.getMonth()-1, 15); return {w:addD(wk,-7), m:dk(pm).slice(0,7), y:String(+y-1), cw:wk, cm:m, cy:y}; }
function suggest(c){ const P=periods(), out=[];
  [['w',P.w],['m',P.m],['y',P.y]].forEach(([y,key])=>['busy','rich'].forEach(t=>{ const p={y,key}; top(c,t,p).forEach(x=>{ const k=`${t}:${y}:${key}:${x.s.id}`; if(!has(c,k)) out.push({k, t, sid:x.s.id, p, rk:x.rk, v:x.v, ...(x.goal!=null?{goal:x.goal}:{})}); }); }));
  examBest(c).forEach(b=>{ const g=gradeOf(b.pct); const done=CS(c).filter(x=>x.t==='exam'&&x.sid===b.sid&&x.n===b.n);
    if(done.some(x=>x.v>=b.pct||x.g===g[1])) return; const k=`exam:${b.n}:${g[1]}:${b.sid}`; if(!has(c,k)) out.push({k, t:'exam', sid:b.sid, n:b.n, g:g[1], v:b.pct, p:{y:'d', key:dk(new Date(b.ts||Date.now()))}}); });
  return out; }

/* ---------- certificate picture (canvas → PNG) ---------- */
function lines(t){ const T=TYPES[t.t];
  if(t.t==='exam'){ const g=GR.find(x=>x[1]===t.g)||GR[4]; return {title:`បានប្រឡងបញ្ចប់ Unit ${t.n} ជាប់និទ្ទេស ${g[1]} (${g[2]})`, en:`for passing the Unit ${t.n} test with grade ${g[1]} — ${g[3]} (${t.v}%)`, val:`${t.v}% • និទ្ទេស ${g[1]}`, big:g[1]}; }
  if(!t.rk){ const gtxt=t.t==='busy'?fmtT(t.goal||0):riel(t.goal||0); return {title:`${t.t==='busy'?'សិស្សឧស្សាហ៍ — រៀនបានគ្រប់':'សិស្សពូកែ — រកលុយពីការរៀនបានគ្រប់'} ${gtxt} ${perLabel(t.p)}`, en:`${t.t==='busy'?'Hard-working Student — studied':'Smart Earner — earned'} over ${t.t==='busy'?Math.round((t.goal||0)/360)/10+' hours':Math.round(t.goal||0).toLocaleString('en-US')+' riel'} — ${perEn(t.p)}`, val:t.t==='busy'?'រៀនបាន '+fmtT(t.v):'រកបាន '+riel(t.v), big:'🏅'}; }
  return {title:`${T[1]} ${RK[t.rk]} ${perLabel(t.p)}`, en:`${T[2]} — No. ${t.rk} — ${perEn(t.p)}`, val:t.t==='busy'?'រៀនបាន '+fmtT(t.v):'រកបាន '+riel(t.v), big:MED[t.rk]}; }
const THEMES={teal:['#0f766e','#14b8a6'], gold:['#b45309','#f59e0b'], blue:['#1d4ed8','#60a5fa'], purple:['#6d28d9','#a78bfa'], red:['#b91c1c','#f87171'], green:['#15803d','#4ade80'], navy:['#1e293b','#64748b']};
const MK2=d=>'ថ្ងៃទី '+d.getDate()+' ខែ'+MK[d.getMonth()]+' ឆ្នាំ '+d.getFullYear();
/* default text of a certificate — every field can be overridden by the teacher (t.ed) */
/* 🎨 class templates for the two award types (💪 busy • 💰 rich): one template serves week / month / year */
const TPLN={busy:'💪 សិស្សឧស្សាហ៍', rich:'💰 សិស្សប្រឹងរៀនរកលុយ', exam:'📝 ប្រឡងបញ្ចប់មេរៀន'};
function tplDef(type, c){ const B=type==='busy';
  if(type==='exam') return {theme:'blue', medal:'', frame:(c&&c.certCfg&&c.certCfg.frame)||'classic', head:'កម្មវិធីគ្រប់គ្រងថ្នាក់រៀន • {ថ្នាក់}',
    title:'ប័ណ្ណសរសើរ', titleEn:'Certificate of Achievement', pre:'សូមប្រគល់ជូន • This certificate is proudly presented to',
    kh:'បានប្រឡងបញ្ចប់ Unit {មេរៀន} ជាប់និទ្ទេស {និទ្ទេស} ({កម្រិត})', en:'for passing the Unit {unit} test with grade {grade} — {level} ({pct}%)',
    val:'{pct}% • និទ្ទេស {និទ្ទេស}', role:'គ្រូបង្រៀន • Teacher', sig:true, sigS:1, sigX:0, sigY:0};
  return {theme:B?'teal':'gold', medal:B?'💪':'💰', frame:(c&&c.certCfg&&c.certCfg.frame)||'classic', head:'កម្មវិធីគ្រប់គ្រងថ្នាក់រៀន • {ថ្នាក់}',
    title:'ប័ណ្ណសរសើរ', titleEn:'Certificate of Achievement', pre:'សូមប្រគល់ជូន • This certificate is proudly presented to',
    kh:B?'សិស្សឧស្សាហ៍រៀនជាងគេ {លេខ} {រយៈពេល}':'សិស្សប្រឹងរៀនរកលុយបានច្រើនជាងគេ {លេខ} {រយៈពេល}',
    en:B?'Most Hard-working Student — {rank} — {period}':'Top Learning Earner — {rank} — {period}',
    khG:B?'សិស្សឧស្សាហ៍ — រៀនបានគ្រប់ {គោលដៅ} {រយៈពេល}':'សិស្សប្រឹងរៀនរកលុយ — រកបានគ្រប់ {គោលដៅ} {រយៈពេល}',
    enG:B?'Hard-working Student — studied over {goal} — {period}':'Hard-working Earner — earned over {goal} — {period}',
    val:B?'រៀនបាន {តម្លៃ}':'រកបាន {តម្លៃ}', role:'គ្រូបង្រៀន • Teacher', sig:true, sigS:1, sigX:0, sigY:0}; }
const tplOf = (type, c) => ({...tplDef(type,c), ...(((c&&c.certCfg&&c.certCfg.tpl)||{})[type]||{})});
const PHX=[['{មេរៀន}','1'],['{unit}','1'],['{និទ្ទេស}','A'],['{grade}','A'],['{កម្រិត}','ល្អប្រសើរ'],['{level}','Excellent'],['{pct}','92'],['{ថ្នាក់}','Beginner 1'],['{ឈ្មោះ}','ឈ្មោះសិស្ស']];
const PH=[['{លេខ}','លេខ ១'],['{rank}','No. 1'],['{រយៈពេល}','ខែវិច្ឆិកា 2026'],['{period}','November 2026'],['{តម្លៃ}','12 ម៉ោង'],['{គោលដៅ}','5 ម៉ោង'],['{goal}','5 hours'],['{ថ្នាក់}','Beginner 1'],['{ឈ្មោះ}','ឈ្មោះសិស្ស']];
function fill(str, t, s, c){ if(typeof str!=='string') return str; const B=t.t==='busy', gl=t.goal||0;
  const map={'{លេខ}':t.rk?RK[t.rk]:'', '{rank}':t.rk?'No. '+t.rk:'', '{រយៈពេល}':t.p?perLabel(t.p):'', '{period}':t.p?perEn(t.p):'',
    '{តម្លៃ}':B?fmtT(t.v):riel(t.v), '{គោលដៅ}':B?fmtT(gl):riel(gl), '{goal}':B?(Math.round(gl/360)/10)+' hours':Math.round(gl).toLocaleString('en-US')+' riel', '{ថ្នាក់}':c?c.name:'', '{ឈ្មោះ}':s?s.name:''};
  if(t.t==='exam'){ const g=GR.find(x=>x[1]===t.g)||GR[4]; Object.assign(map,{'{មេរៀន}':t.n, '{unit}':t.n, '{និទ្ទេស}':g[1], '{grade}':g[1], '{កម្រិត}':g[2], '{level}':g[3], '{pct}':t.v}); }
  return str.replace(/\{[^}]+\}/g, k=>map[k]!=null?map[k]:k).replace(/\s+—\s+—\s+/g,' — ').replace(/\s{2,}/g,' ').trim(); }
function defs(t, s, c){ const L=lines(t);
  const base={theme:{busy:'teal',rich:'gold',exam:'blue'}[t.t], medal:t.t==='exam'?L.big:TYPES[t.t][0], head:'កម្មវិធីគ្រប់គ្រងថ្នាក់រៀន • '+(c?c.name:''),
    title:'ប័ណ្ណសរសើរ', titleEn:'Certificate of Achievement', pre:'សូមប្រគល់ជូន • This certificate is proudly presented to',
    name:s?s.name:'—', latin:s&&s.latin||'', kh:L.title, en:L.en, val:L.val, date:MK2(new Date(t.sent||t.ts||Date.now())),
    tn:t.tn||'គ្រូបង្រៀន', role:'គ្រូបង្រៀន • Teacher', sig:true, sigBy:t.by||'', frame:(c&&c.certCfg&&c.certCfg.frame)||'classic', sigS:1, sigX:0, sigY:0};
  if(!TPLN[t.t]) return base;
  const T=tplOf(t.t,c), F=v=>fill(v,t,s,c);
  ['theme','medal','frame','sig','sigS','sigX','sigY','_themeSet'].forEach(k=>{ if(T[k]!==undefined) base[k]=T[k]; });
  ['head','title','titleEn','pre','val','role'].forEach(k=>{ base[k]=F(T[k]); });
  if(t.t==='exam'){ if(!T.medal) base.medal=L.big; base.kh=F(T.kh); base.en=F(T.en); return base; }
  base.kh=F(t.rk?T.kh:T.khG); base.en=F(t.rk?T.en:T.enG); return base; }
const imgOf = url => new Promise(r=>{ if(!url) return r(null); const im=new Image(); im.onload=()=>r(im); im.onerror=()=>r(null); im.src=url; });
/* 🖼 frames: drawn styles + the Khmer ornament images used by the monthly certificates (cert-frames/f1–f8.jpg) */
const KFR=[["f1","ក្បាច់ផ្កាបៃតង",[10.61,6.88,10.88,8.5],"#518f6f"],["f2","ក្បាច់ត្នោតបុរាណ",[9.55,6.5,9.37,5.94],"#9e8c7a"],["f3","ក្បាច់រាជបៃតង",[18.39,8.25,9.64,8.25],"#229a1e"],["f4","ក្បាច់ស្លឹកត្នោត",[18.48,12.88,15.74,13.81],"#ac876f"],["f5","ក្បាច់នាគខៀវ",[20.25,13.69,13.17,12.56],"#5b6d97"],["f6","ក្បាច់សិង្ហខៀវ",[12.2,8.69,12.91,9.19],"#54639e"],["f7","ក្បាច់មាស",[18.3,10.44,13.7,10.06],"#776150"],["f8","ក្បាច់ផ្កាខៀវ",[9.73,6.19,9.64,6.12],"#30369d"]];
const FRS=[['classic','👑 បុរាណមាស'],['double','✨ ពីរជាន់'],['minimal','◻️ សាមញ្ញ'],['ribbon','🎀 ខ្សែបូ'],['geo','🔷 ធរណីមាត្រ'],['kids','🌈 កុមារ'],['wave','🌊 រលក'],...KFR.map(f=>[f[0],'🪷 '+f[1]])];
const BASE=(document.currentScript&&document.currentScript.src||'').replace(/[^\/]*$/,'');
function frameDeco(x, fr, pal, W, H){
  const gold='#c9a227';
  if(fr==='classic'){ const gr=x.createLinearGradient(0,0,W,H); gr.addColorStop(0,pal[0]); gr.addColorStop(.5,pal[1]); gr.addColorStop(1,pal[0]);
    x.fillStyle=gr; x.fillRect(0,0,W,34); x.fillRect(0,H-34,W,34); x.fillRect(0,0,34,H); x.fillRect(W-34,0,34,H);
    x.strokeStyle=gold; x.lineWidth=4; x.strokeRect(58,58,W-116,H-116); x.lineWidth=1.5; x.strokeRect(72,72,W-144,H-144);
    x.fillStyle=gold; [[72,72],[W-72,72],[72,H-72],[W-72,H-72]].forEach(([a,b])=>{ x.save(); x.translate(a,b); x.rotate(Math.PI/4); x.fillRect(-12,-12,24,24); x.restore(); }); }
  else if(fr==='double'){ x.strokeStyle=pal[0]; x.lineWidth=14; x.strokeRect(40,40,W-80,H-80); x.strokeStyle=gold; x.lineWidth=3; x.strokeRect(66,66,W-132,H-132); x.lineWidth=1; x.strokeRect(76,76,W-152,H-152);
    x.fillStyle=gold; [[66,66],[W-66,66],[66,H-66],[W-66,H-66]].forEach(([a,b])=>{ x.beginPath(); x.arc(a,b,14,0,7); x.fill(); x.fillStyle=pal[0]; x.beginPath(); x.arc(a,b,6,0,7); x.fill(); x.fillStyle=gold; }); }
  else if(fr==='minimal'){ x.strokeStyle=pal[0]; x.lineWidth=2; x.strokeRect(60,60,W-120,H-120); x.fillStyle=pal[0]; x.fillRect(W/2-90,60,180,6); x.fillRect(W/2-90,H-66,180,6); }
  else if(fr==='ribbon'){ x.strokeStyle=gold; x.lineWidth=3; x.strokeRect(50,50,W-100,H-100);
    x.fillStyle='#b91c1c'; x.beginPath(); x.moveTo(0,0); x.lineTo(300,0); x.lineTo(0,300); x.fill(); x.fillStyle='#ef4444'; x.beginPath(); x.moveTo(0,330); x.lineTo(330,0); x.lineTo(370,0); x.lineTo(0,370); x.fill();
    x.fillStyle='#b91c1c'; x.beginPath(); x.moveTo(W,H); x.lineTo(W-300,H); x.lineTo(W,H-300); x.fill(); x.fillStyle='#ef4444'; x.beginPath(); x.moveTo(W,H-330); x.lineTo(W-330,H); x.lineTo(W-370,H); x.lineTo(W,H-370); x.fill(); }
  else if(fr==='geo'){ const tri=(a,b,c,col)=>{ x.fillStyle=col; x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.lineTo(...c); x.fill(); };
    tri([0,0],[260,0],[0,260],pal[0]); tri([0,0],[150,0],[0,150],pal[1]); tri([W,0],[W-260,0],[W,260],pal[1]); tri([W,0],[W-140,0],[W,140],gold);
    tri([0,H],[260,H],[0,H-260],pal[1]); tri([0,H],[140,H],[0,H-140],gold); tri([W,H],[W-260,H],[W,H-260],pal[0]); tri([W,H],[W-150,H],[W,H-150],pal[1]);
    x.strokeStyle=pal[0]; x.lineWidth=2; x.strokeRect(70,70,W-140,H-140); }
  else if(fr==='kids'){ const cols=['#ef4444','#f59e0b','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899']; let k=0;
    for(let a=40;a<W-20;a+=52){ x.fillStyle=cols[k++%8]; x.beginPath(); x.arc(a,40,18,0,7); x.fill(); x.fillStyle=cols[k%8]; x.beginPath(); x.arc(a,H-40,18,0,7); x.fill(); }
    for(let b=92;b<H-60;b+=52){ x.fillStyle=cols[k++%8]; x.beginPath(); x.arc(40,b,18,0,7); x.fill(); x.fillStyle=cols[(k+3)%8]; x.beginPath(); x.arc(W-40,b,18,0,7); x.fill(); }
    x.strokeStyle=pal[1]; x.lineWidth=4; x.setLineDash([16,12]); x.strokeRect(80,80,W-160,H-160); x.setLineDash([]); }
  else if(fr==='wave'){ const band=(y0,dir,col)=>{ x.fillStyle=col; x.beginPath(); x.moveTo(0,y0); for(let a=0;a<=W;a+=20) x.lineTo(a,y0+dir*(24+18*Math.sin(a/90))); x.lineTo(W,dir<0?0:H); x.lineTo(0,dir<0?0:H); x.fill(); };
    band(70,-1,pal[0]); band(48,-1,pal[1]); band(H-70,1,pal[0]); band(H-48,1,pal[1]); x.strokeStyle=gold; x.lineWidth=2; x.strokeRect(70,110,W-140,H-220); }
}
async function draw(t, s, c, over){
  const E={...defs(t,s,c), ...(t.ed||{}), ...(over||{})};
  const W=1600, H=1130, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const x=cv.getContext('2d');
  try{ await document.fonts.load('700 40px "Kantumruy Pro"'); }catch(e){}
  const KH='"Kantumruy Pro","Noto Sans Khmer","Khmer UI",sans-serif', SER='Georgia,"Times New Roman",serif';
  const KF=KFR.find(f=>f[0]===E.frame); let pal=THEMES[E.theme]||THEMES.teal; if(KF&&!E._themeSet) pal=[KF[3],KF[3]];
  x.fillStyle='#fffdf6'; x.fillRect(0,0,W,H);
  let fimg=null; if(KF){ fimg=await imgOf(BASE+'cert-frames/'+KF[0]+'.jpg'); if(fimg) x.drawImage(fimg,0,0,W,H); }
  if(!KF||!fimg) frameDeco(x, KF?'classic':E.frame, pal, W, H);
  x.save();
  if(KF&&fimg){ const [l,tp,r,b]=KF[2], ix=W*l/100, iy=H*tp/100, iw=W*(1-(l+r)/100), ih=H*(1-(tp+b)/100), cx0=110, cy0=100, cw=W-220, ch=H-160, k=Math.min(iw/cw, ih/ch);
    x.translate(ix+(iw-cw*k)/2, iy+(ih-ch*k)/2); x.scale(k,k); x.translate(-cx0,-cy0); }
  x.globalAlpha=.05; x.font='520px serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(String(E.medal||'').length<=2?E.medal:'★',W/2,H/2+40); x.globalAlpha=1;
  x.textAlign='center'; x.textBaseline='alphabetic';
  x.fillStyle='#64748b'; x.font=`500 26px ${KH}`; x.fillText(E.head,W/2,140);
  x.fillStyle=pal[0]; x.font=`800 92px ${KH}`; x.fillText(E.title,W/2,250);
  x.fillStyle='#c9a227'; x.font=`italic 600 34px ${SER}`; x.fillText(E.titleEn,W/2,300);
  x.fillStyle='#475569'; x.font=`400 30px ${KH}`; x.fillText(E.pre,W/2,385);
  x.fillStyle='#0f172a'; let fs=84; do{ x.font=`800 ${fs}px ${KH}`; fs-=4; }while(x.measureText(E.name).width>1250&&fs>40); x.fillText(E.name,W/2,490);
  if(E.latin){ x.fillStyle='#334155'; x.font=`600 36px ${SER}`; x.fillText(E.latin,W/2,545); }
  x.strokeStyle='#c9a227'; x.lineWidth=2; x.beginPath(); x.moveTo(W/2-360,575); x.lineTo(W/2+360,575); x.stroke();
  const wrap=(txt,y,font,col,max)=>{ x.font=font; x.fillStyle=col; const ws=String(txt||'').split(' '); let line='', yy=y; ws.forEach(w=>{ const tt=line?line+' '+w:w; if(x.measureText(tt).width>max&&line){ x.fillText(line,W/2,yy); line=w; yy+=56; } else line=tt; }); x.fillText(line,W/2,yy); return yy; };
  let y=wrap(E.kh,650,`700 44px ${KH}`,pal[0],1250);
  if(E.en) y=wrap(E.en,y+52,`italic 30px ${SER}`,'#475569',1250);
  if(E.val){ x.fillStyle='#0f172a'; x.font=`700 34px ${KH}`; x.fillText(E.val,W/2,y+62); }
  const mx=250, my=880; x.fillStyle=pal[1]; x.beginPath(); x.moveTo(mx-40,my-40); x.lineTo(mx-70,my+110); x.lineTo(mx-20,my+80); x.lineTo(mx,my+120); x.lineTo(mx+20,my+80); x.lineTo(mx+70,my+110); x.lineTo(mx+40,my-40); x.fill();
  const mg=x.createRadialGradient(mx-20,my-30,10,mx,my,90); mg.addColorStop(0,'#fff3b0'); mg.addColorStop(1,'#c9a227'); x.fillStyle=mg; x.beginPath(); x.arc(mx,my,82,0,Math.PI*2); x.fill();
  x.strokeStyle='#fff'; x.lineWidth=4; x.beginPath(); x.arc(mx,my,66,0,Math.PI*2); x.stroke();
  x.fillStyle=pal[0]; x.textBaseline='middle'; x.font=/^[A-Z+]{1,2}$/.test(E.medal)?`800 72px ${SER}`:`64px serif`; x.fillText(E.medal||'',mx,my+4); x.textBaseline='alphabetic';
  x.fillStyle='#334155'; x.font=`500 28px ${KH}`; x.fillText(E.date,W/2,960);
  if(E.sig){ const im=await imgOf(window.Auth&&Auth.sigOf?Auth.sigOf(E.sigBy):''); if(im){ const sc=+E.sigS||1, k=Math.min(330/im.width, 120/im.height)*sc, cx=W-380+(+E.sigX||0), by=945+(+E.sigY||0); x.drawImage(im, cx-im.width*k/2, by-im.height*k, im.width*k, im.height*k); } }
  x.strokeStyle='#94a3b8'; x.lineWidth=1.5; x.beginPath(); x.moveTo(W-560,950); x.lineTo(W-200,950); x.stroke();
  x.font=`700 30px ${KH}`; x.fillStyle='#0f172a'; x.fillText(E.tn,W-380,995); x.font=`400 24px ${KH}`; x.fillStyle='#64748b'; x.fillText(E.role,W-380,1030);
  x.font=`400 20px ${KH}`; x.fillStyle='#94a3b8'; x.fillText('លេខប័ណ្ណ '+t.id.slice(-8).toUpperCase(),W/2,1050);
  x.restore();
  return cv;
}
/* canvas → image URL; a canvas tainted by a local (file://) frame picture falls back to the drawn frame */
async function toURL(t,s,c,over,type,q){ let cv=await draw(t,s,c,over); try{ return cv.toDataURL(type||'image/png',q); }catch(e){ cv=await draw(t,s,c,{...(over||{}), frame:'classic'}); toast('⚠️ ស៊ុមក្បាច់ខ្មែរ ប្រើបានលើវេបសាយ (កម្មវិធី offline ប្រើស៊ុមបុរាណជំនួស)'); return cv.toDataURL(type||'image/png',q); } }
/* ---------- ✏️ teacher edits any certificate before download / send ---------- */
let ED=null;
const TFIELDS=[['title','ចំណងជើង'],['titleEn','ចំណងជើង (English)'],['head','បន្ទាត់ខាងលើ'],['pre','ឃ្លាប្រគល់ជូន'],['kh','ខ្លឹមសារ — 🏆 ចំណាត់ថ្នាក់ (ខ្មែរ)','ta'],['en','ខ្លឹមសារ — 🏆 ចំណាត់ថ្នាក់ (English)','ta'],['khG','ខ្លឹមសារ — 🎯 គោលដៅ (ខ្មែរ)','ta'],['enG','ខ្លឹមសារ — 🎯 គោលដៅ (English)','ta'],['val','លទ្ធផល'],['role','តួនាទីអ្នកចុះហត្ថលេខា']];
const FIELDS=[['title','ចំណងជើង'],['titleEn','ចំណងជើង (English)'],['head','បន្ទាត់ខាងលើ (សាលា • ថ្នាក់)'],['pre','ឃ្លាប្រគល់ជូន'],['name','ឈ្មោះសិស្ស'],['latin','ឈ្មោះ Latin'],['kh','ខ្លឹមសារ (ខ្មែរ)','ta'],['en','ខ្លឹមសារ (English)','ta'],['val','លទ្ធផល'],['date','កាលបរិច្ឆេទ'],['tn','ឈ្មោះគ្រូ'],['role','តួនាទី']];
async function edit(cid, id){ const c=findC(cid), t=c&&CS(c).find(x=>x.id===id); if(!t) return; const s=c.students.find(x=>x.id===t.sid);
  ED={cid, id, v:{...defs(t,s,c), ...(t.ed||{})}}; if(ED.v.sig&&!(Auth.sigOf&&Auth.sigOf(ED.v.sigBy))&&Auth.sigOf(me().id)) ED.v.sigBy=me().id; edDraw(); }
function ctx(){ const c=findC(ED.cid); if(ED.tpl==='exam'){ const g=GR.find(x=>x[1]===(ED.dx||'A'))||GR[0], t={id:'demo0000', t:'exam', n:1, g:g[1], v:Math.min(100,g[0]+2), ts:Date.now(), by:me().id, tn:me().name||''}; return {c, t, s:c.students[0]||{name:'សុខ សុភា', latin:'SOK Sophea'}}; }
  if(ED.tpl){ const P=periods(), key={w:P.cw,m:P.cm,y:P.cy}[ED.dy], B=ED.tpl==='busy';
    const t={id:'demo0000', t:ED.tpl, rk:ED.dg?0:1, goal:ED.dg?(B?18000:5000):0, p:{y:ED.dy,key}, v:B?45600:12500, ts:Date.now(), by:me().id, tn:me().name||''}; return {c, t, s:c.students[0]||{name:'សុខ សុភា', latin:'SOK Sophea'}}; }
  const t=CS(c).find(x=>x.id===ED.id); return {c, t, s:t&&c.students.find(x=>x.id===t.sid)}; }
function edDraw(){ const {c,t}=ctx(), V=ED.v, mySig=window.Auth&&Auth.sigOf(me().id), TP=!!ED.tpl, EX=ED.tpl==='exam';
  modal(`<div class="ce"><h3>${TP?'🎨 គំរូប័ណ្ណ — '+TPLN[ED.tpl]:'✏️ កែប័ណ្ណសរសើរ'}</h3>${TP?`${EX?`<p class="note">គំរូនេះប្រើសម្រាប់ប័ណ្ណ <b>ប្រឡងបញ្ចប់មេរៀន</b> របស់សិស្សទាំងអស់គ្នា គ្រប់ Unit — លេខ Unit និទ្ទេស និងពិន្ទុ បំពេញឱ្យស្វ័យប្រវត្តិ • ទុក «រូបមេដាយ» ទទេ = បង្ហាញនិទ្ទេស (A–E)</p>`:`<p class="note">គំរូនេះប្រើសម្រាប់ប័ណ្ណ${TPLN[ED.tpl]} ប្រចាំ <b>សប្តាហ៍ ខែ និងឆ្នាំ</b> — រយៈពេល លេខចំណាត់ថ្នាក់ និងចំនួន បំពេញឱ្យស្វ័យប្រវត្តិ</p>`}
      ${EX?`<div class="row ce-demo"><span>👁 មើល Demo៖</span>${GR.map(g=>`<button class="chip ${(ED.dx||'A')===g[1]?'on':''}" onclick="Cert._edDemo('dx','${g[1]}')">${g[1]} • ${g[2]}</button>`).join('')}</div>`:''}${EX?'':`<div class="row ce-demo"><span>👁 មើល Demo៖</span>${[['w','សប្តាហ៍'],['m','ខែ'],['y','ឆ្នាំ']].map(([k,l])=>`<button class="chip ${ED.dy===k?'on':''}" onclick="Cert._edDemo('dy','${k}')">${l}</button>`).join('')}<span class="sep"></span><button class="chip ${ED.dg?'':'on'}" onclick="Cert._edDemo('dg',0)">🏆 លេខ ១</button><button class="chip ${ED.dg?'on':''}" onclick="Cert._edDemo('dg',1)">🎯 គោលដៅ</button></div>`}`:''}<div class="ce-g">
    <div class="ce-prev"><img id="ceImg" alt=""><div class="row" style="justify-content:center;gap:6px;margin-top:8px"><button class="btn ghost sm" onclick="Cert._edReset()">↺ លំនាំដើម</button><button class="btn ghost sm" onclick="Cert._edPng()">⬇ PNG</button></div></div>
    <div class="ce-f">
      <div class="me-f"><span>🖼 ស៊ុម</span><div class="ce-frs">${FRS.map(([k,l])=>`<button class="ce-fr ${V.frame===k?'on':''}" onclick="Cert._edFrame('${k}')">${/^f\d$/.test(k)?`<img src="${BASE}cert-frames/${k}.jpg" alt="">`:`<i class="fr-${k}"></i>`}<small>${l}</small></button>`).join('')}</div></div>
      <div class="me-f"><span>🎨 ពណ៌ប័ណ្ណ</span><div class="row" style="gap:6px">${Object.entries(THEMES).map(([k,p])=>`<button class="ce-th ${V.theme===k?'on':''}" style="background:linear-gradient(135deg,${p[0]},${p[1]})" onclick="Cert._edSet('theme','${k}',1)"></button>`).join('')}</div></div>
      <div class="me-f"><span>🏅 រូបមេដាយ</span><div class="row" style="gap:4px">${['💪','💰','📝','🏆','⭐','🥇','🎓','👑','🌟','A','B','C'].map(m=>`<button class="ce-md ${V.medal===m?'on':''}" onclick="Cert._edSet('medal','${m}',1)">${m}</button>`).join('')}<input class="cl-in" style="width:64px" value="${esc(V.medal)}" maxlength="3" oninput="Cert._edSet('medal',this.value)"></div></div>
      ${TP?`<div class="me-f"><span>🔤 ពាក្យជំនួស <small class="note">(ចុចដើម្បីបញ្ចូលក្នុងប្រអប់ដែលកំពុងសរសេរ)</small></span><div class="ce-ph">${(EX?PHX:PH).map(([k,e])=>`<button class="chip" title="ឧ. ${esc(e)}" onmousedown="event.preventDefault()" onclick="Cert._edIns('${k}')">${k}</button>`).join('')}</div></div>`:''}
      ${(EX?TFIELDS.filter(f=>!/G$/.test(f[0])).map(f=>[f[0],f[1].replace(/ — 🏆 ចំណាត់ថ្នាក់/,''),f[2]]):TP?TFIELDS:FIELDS).map(([k,l,ta])=>`<label class="me-f"><span>${l}</span>${ta?`<textarea class="cl-in" rows="2" data-k="${k}" onfocus="Cert._edFocus(this)" oninput="Cert._edSet('${k}',this.value)">${esc(V[k])}</textarea>`:`<input class="cl-in" data-k="${k}" onfocus="Cert._edFocus(this)" value="${esc(V[k])}" oninput="Cert._edSet('${k}',this.value)">`}</label>`).join('')}
      <label class="row" style="gap:6px;margin:6px 0"><input type="checkbox" ${V.sig?'checked':''} onchange="Cert._edSet('sig',this.checked,1)"> <b>✍️ បង្ហាញហត្ថលេខាគ្រូ</b></label>
      ${V.sig?`<div class="ce-sig"><label><span>🔍 ទំហំ <b id="ceSS">${Math.round((+V.sigS||1)*100)}%</b></span><input type="range" min="40" max="250" value="${Math.round((+V.sigS||1)*100)}" oninput="document.getElementById('ceSS').textContent=this.value+'%';Cert._edSet('sigS',this.value/100)"></label>
        <label><span>↔️ ឆ្វេង / ស្តាំ</span><input type="range" min="-900" max="160" value="${+V.sigX||0}" oninput="Cert._edSet('sigX',+this.value)"></label>
        <label><span>↕️ ឡើង / ចុះ</span><input type="range" min="-250" max="80" value="${+V.sigY||0}" oninput="Cert._edSet('sigY',+this.value)"></label>
        <button class="btn ghost sm" onclick="Cert._edSet('sigS',1);Cert._edSet('sigX',0);Cert._edSet('sigY',0,1)">↺ ទីតាំងដើម</button></div>`:''}
      ${V.sig?(mySig?(V.sigBy!==me().id?`<button class="btn ghost sm" onclick="Cert._edSet('sigBy','${me().id}',1)">✍️ ប្រើហត្ថលេខារបស់ខ្ញុំ</button>`:'<small class="note">✅ ប្រើហត្ថលេខារបស់អ្នក</small>'):`<p class="note">⚠️ អ្នកមិនទាន់មានហត្ថលេខា — <button class="btn ghost sm" onclick="Cert._edSig()">✍️ បង្កើតហត្ថលេខា</button></p>`):''}
    </div></div>
    <div class="row" style="justify-content:flex-end;gap:8px;margin-top:10px"><button class="btn ghost" onclick="closeModal()">បោះបង់</button>${TP?`<button class="btn teal" onclick="Cert._tplSave()">💾 រក្សាទុកគំរូ</button>`:''}<button class="btn teal" style="${TP?'display:none':''}" onclick="Cert._edSave()">💾 រក្សាទុក</button>${!TP&&t.st==='ok'?`<button class="btn sun" onclick="Cert._edSave(1)">💾 រក្សាទុក និង 📤 ផ្ញើ</button>`:''}</div></div>`);
  document.getElementById('modal').classList.add('wide'); edPrev(); }
const edOver = (t,s,c) => { if(!ED.tpl) return ED.v; const o={...ED.v}; ['head','title','titleEn','pre','val','role'].forEach(k=>o[k]=fill(o[k],t,s,c)); if(t.t==='exam'){ o.kh=fill(ED.v.kh,t,s,c); o.en=fill(ED.v.en,t,s,c); if(!o.medal) o.medal=lines(t).big; return o; }
  o.kh=fill(t.rk?ED.v.kh:ED.v.khG,t,s,c); o.en=fill(t.rk?ED.v.en:ED.v.enG,t,s,c); return o; };
function edPrev(){ clearTimeout(ED.pt); ED.pt=setTimeout(async()=>{ const {c,t,s}=ctx(), url=await toURL({...t, ed:{}}, s, c, edOver(t,s,c),'image/jpeg',.85); const im=document.getElementById('ceImg'); if(im) im.src=url; },150); }
function edFrame(k){ ED.v.frame=k; const KF=KFR.find(f=>f[0]===k); if(KF) delete ED.v._themeSet; edDraw(); }
function edSet(k,v,re){ if(k==='theme') ED.v._themeSet=1; ED.v[k]=v; re?edDraw():edPrev(); }
function edSave(andSend){ const c=findC(ED.cid), t=CS(c).find(x=>x.id===ED.id), s=c.students.find(x=>x.id===t.sid), D0=defs(t,s,c), ed={};
  Object.keys(ED.v).forEach(k=>{ if(ED.v[k]!==D0[k]) ed[k]=ED.v[k]; }); if(Object.keys(ed).length) t.ed=ed; else delete t.ed;
  closeModal(); if(andSend){ t.st='sent'; t.sent=Date.now(); notify(c,t); toast('📤 បានរក្សាទុក និងផ្ញើ'); } else toast('💾 បានរក្សាទុកការកែ'); redo(); }
async function edPng(){ const {c,t,s}=ctx(), url=await toURL({...t,ed:{}},s,c,edOver(t,s,c));
  const a=document.createElement('a'); a.href=url; a.download=`ប័ណ្ណសរសើរ_${(ED.v.latin||ED.v.name||'student').replace(/\s+/g,'_')}.png`; document.body.appendChild(a); a.click(); a.remove(); }
function edReset(){ const {c,t,s}=ctx(); ED.v=ED.tpl?{...tplDef(ED.tpl,c), sigBy:me().id}:defs(t,s,c); edDraw(); }
function tplEdit(type){ const c=TAB.c; ED={cid:c.id, tpl:type, dy:'m', dg:0, v:{...tplOf(type,c), sigBy:me().id}}; edDraw(); }
function tplSave(){ const c=findC(ED.cid), D0=tplDef(ED.tpl,c), o={}; Object.keys(D0).concat('_themeSet').forEach(k=>{ if(ED.v[k]!==undefined&&ED.v[k]!==D0[k]) o[k]=ED.v[k]; });
  c.certCfg=c.certCfg||{}; c.certCfg.tpl=c.certCfg.tpl||{}; if(Object.keys(o).length) c.certCfg.tpl[ED.tpl]=o; else delete c.certCfg.tpl[ED.tpl]; closeModal(); redo(); toast('💾 បានរក្សាទុកគំរូ '+TPLN[ED.tpl]); }
let LASTF=null;
function edIns(tok){ const el=LASTF&&document.body.contains(LASTF)?LASTF:null; if(!el) return toast('👆 ចុចក្នុងប្រអប់ខ្លឹមសារជាមុនសិន'); const a=el.selectionStart??el.value.length, b=el.selectionEnd??a;
  const pre=el.value.slice(0,a), post=el.value.slice(b); tok=(pre&&!/\s$/.test(pre)?' ':'')+tok+(post&&!/^\s/.test(post)?' ':''); el.value=pre+tok+post; el.focus(); el.selectionStart=el.selectionEnd=a+tok.length; edSet(el.dataset.k, el.value); }
function edSig(){ const keep=ED; Sig.open('', url=>{ ED=keep; if(url){ const u=Auth.data().users.find(x=>x.id===me().id); if(u){ u.sig=url; u.ts=Date.now(); Auth._saveA&&Auth._saveA(); } ED.v.sigBy=me().id; } edDraw(); }); }
/* 📥 a student's own opens / downloads / prints of a certificate → their synced progress (S.certDl) so teachers & admin can follow */
function track(id, kind){ try{ if(!(window.Auth&&Auth.role()==='student'&&!(Auth.asStaff&&Auth.asStaff()))||typeof S==='undefined') return;
  S.certDl=S.certDl||{}; const o=S.certDl[id]=S.certDl[id]||{v:0,d:0,p:0}; o[kind]=(o[kind]||0)+1; const now=Date.now(); if(!o.f) o.f=now; o.l=now; if(kind!=='v'&&!o.fd) o.fd=now; save(); }catch(e){} }
const stuU = (c, sid) => ((window.Auth&&Auth.data().users)||[]).find(x=>x.role==='student'&&x.classId===c.id&&x.studentId===sid);
function dlOf(c, t){ const u=stuU(c,t.sid); if(!u) return {acc:false}; const P=J('beginner-studio-v1:'+u.id)||{}; return {acc:true, ...((P.certDl||{})[t.id]||{})}; }
const dd = t => new Date(t).toLocaleString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});
function dlChip(c, t){ const o=dlOf(c,t);
  if(!o.acc) return '<span class="ct-dl no" title="សិស្សនេះមិនទាន់មានគណនី App">🚫 គ្មានគណនី</span>';
  if(o.d||o.p) return `<span class="ct-dl ok" title="បើកមើល ${o.v||0} • ទាញយក ${o.d||0} • បោះពុម្ព ${o.p||0} • ចុងក្រោយ ${dd(o.l)}">⬇ ${o.d?'ទាញយក '+o.d+'ដង':''}${o.d&&o.p?' • ':''}${o.p?'🖨 '+o.p+'ដង':''} • ${dd(o.fd||o.l)}</span>`;
  if(o.v) return `<span class="ct-dl seen" title="បើកមើល ${o.v} ដង • ចុងក្រោយ ${dd(o.l)}">👁 បានមើល (មិនទាន់ទាញយក)</span>`;
  return '<span class="ct-dl wait">⏳ មិនទាន់បើក</span>'; }
const dlState = (c,t) => { const o=dlOf(c,t); return !o.acc?'no':(o.d||o.p)?'dl':o.v?'seen':'wait'; };
async function view(cid, id){ const c=findC(cid), t=c&&CS(c).find(x=>x.id===id); if(!t) return; const s=c.students.find(x=>x.id===t.sid); track(id,'v');
  modal(`<div class="ct-view"><div class="ct-img"><p class="note">⏳ កំពុងរៀបចំ…</p></div>
    <div class="row" style="justify-content:center;gap:8px;margin-top:10px"><button class="btn teal" onclick="Cert.png('${cid}','${id}')">⬇ ទាញយករូបភាព (PNG)</button><button class="btn ghost" onclick="Cert.print('${cid}','${id}')">🖨 បោះពុម្ព</button>${window.Auth&&Auth.role()!=='student'?`<button class="btn ghost" onclick="Cert.edit('${cid}','${id}')">✏️ កែ</button>`:''}</div></div>`);
  document.getElementById('modal').classList.add('wide');
  const url=await toURL(t,s,c); const box=$('.ct-img'); if(box) box.innerHTML=`<img src="${url}" alt="certificate">`; }
async function png(cid,id){ track(id,'d'); const c=findC(cid), t=CS(c).find(x=>x.id===id), s=c.students.find(x=>x.id===t.sid), url=await toURL(t,s,c);
  const a=document.createElement('a'); a.href=url; a.download=`ប័ណ្ណសរសើរ_${(s&&(s.latin||s.name)||'student').replace(/\s+/g,'_')}_${t.t}.png`; document.body.appendChild(a); a.click(); a.remove(); }
async function print(cid,id){ track(id,'p'); const c=findC(cid), t=CS(c).find(x=>x.id===id), s=c.students.find(x=>x.id===t.sid), url=await toURL(t,s,c);
  $('#printArea').innerHTML=`<style>@page{size:A4 landscape;margin:0}</style><img src="${url}" style="width:100%;display:block">`; setTimeout(()=>window.print(),300); }
const findC = id => window.Class&&Class.data ? Class.data().classes.find(x=>x.id===id) : (J(CK)||{classes:[]}).classes.find(x=>x.id===id);

/* ---------- 👩‍🏫 teacher tab ---------- */
let TT={y:'w', t:'busy', key:null, yr:null};
function row(c, x, btns){ const s=c.students.find(v=>v.id===x.sid)||{name:'?'}, L=lines(x), T=TYPES[x.t];
  return `<div class="ct-row ct-${x.t}"><span class="ct-ic">${x.t==='exam'?`<b>${x.g}</b>`:MED[x.rk]||T[0]}</span>${Class._avatar?Class._avatar(s,38):''}<div class="ct-tx"><b>${esc(s.name)}</b><small>${T[0]} ${esc(L.title)}</small><em>${esc(L.val)}</em></div><div class="ct-bt">${btns}</div></div>`; }
function tab(el, c){ const sug=suggest(c), ok=CS(c).filter(x=>x.st==='ok'), sent=CS(c).filter(x=>x.st==='sent'), P=periods();
  const yrs=[...new Set(sent.map(x=>new Date(x.sent||x.ts).getFullYear()))].sort((a,b)=>b-a); const yr=TT.yr||yrs[0]||new Date().getFullYear();
  const keyDef={w:P.cw, m:P.cm, y:P.cy}[TT.y]; const key=TT.key&&TT.key[0]===TT.y?TT.key.slice(1):keyDef;
  const opts=TT.y==='w'?[...Array(12)].map((_,i)=>addD(P.cw,-7*i)):TT.y==='m'?[...Array(12)].map((_,i)=>{ const d=new Date(); d.setDate(15); d.setMonth(d.getMonth()-i); return dk(d).slice(0,7); }):[...Array(4)].map((_,i)=>String(new Date().getFullYear()-i));
  const man=top(c, TT.t, {y:TT.y, key});
  el.innerHTML=`<div class="panel"><div class="ct-head"><h3 class="sec" style="margin:0">🏅 ប័ណ្ណសរសើរ</h3>
      <div class="ct-cnt"><span>🔔 ស្នើ <b>${sug.length}</b></span><span>✅ អនុម័ត <b>${ok.length}</b></span><span>📤 បានផ្ញើ <b>${sent.length}</b></span></div></div>
    <div class="row ct-cfgrow"><button class="btn ghost sm ct-cfgb" onclick="Cert._cfgOpen()">⚙️ កំណត់លក្ខខណ្ឌទទួលប័ណ្ណ</button><span class="note">🎨 គំរូប័ណ្ណ៖</span><button class="btn ghost sm" onclick="Cert._tplEdit('busy')">${TPLN.busy}${((c.certCfg||{}).tpl||{}).busy?' ✓':''}</button><button class="btn ghost sm" onclick="Cert._tplEdit('rich')">${TPLN.rich}${((c.certCfg||{}).tpl||{}).rich?' ✓':''}</button><button class="btn ghost sm" onclick="Cert._tplEdit('exam')">${TPLN.exam}${((c.certCfg||{}).tpl||{}).exam?' ✓':''}</button></div>
    <div class="ct-rules">${(()=>{ const K=cfg(c); return ['busy','rich'].map(t=>['w','m','y'].map(y=>{ const k=K[t][y]; return k.mode==='off'?'':`<span>${TYPES[t][0]} ${PER[y]}: ${k.mode==='goal'?'គ្រប់គ្នាដែល ≥ '+(t==='busy'?fmtT(k.min):riel(k.min)):'លេខ ១–'+k.n+(+k.min?' (≥ '+(t==='busy'?fmtT(k.min):riel(k.min))+')':'')}</span>`; }).join('')).join('')+`<span>📝 ប្រឡង ≥ ${K.exam.min}%</span>`; })()}</div>
    <p class="note">ជំហាន៖ ប្រព័ន្ធស្នើ → <b>✅ អនុម័ត</b> (ផ្ទៀងផ្ទាត់) → <b>📤 ផ្ញើ</b> → សិស្សទើបឃើញ • ប័ណ្ណដែលផ្ញើ រក្សាទុកជារៀងរហូត លុះត្រាគ្រូ <b>🗑 ដកហូត</b></p></div>
  <div class="panel"><div class="ct-sh"><h3 class="sec">🔔 សំណើថ្មី — ត្រូវអនុម័ត (${sug.length})</h3>${sug.length?`<button class="btn teal sm" onclick="Cert.okAll()">✅ អនុម័តទាំងអស់</button>`:''}</div>
    <p class="note">សប្តាហ៍មុន • ខែមុន • ឆ្នាំមុន (រយៈពេលដែលចប់ហើយ) និងលទ្ធផលប្រឡងជាប់ (≥50%)</p>
    ${sug.length?`<div class="ct-list">${sug.map((x,i)=>row(c,x,`<button class="btn teal sm" onclick="Cert.ok(${i})">✅ អនុម័ត</button><button class="btn ghost sm" title="មិនផ្តល់" onclick="Cert.no(${i})">✖</button>`)).join('')}</div>`:'<p class="ct-empty">✨ គ្មានសំណើថ្មីទេ</p>'}</div>
  <div class="panel"><div class="ct-sh"><h3 class="sec">✅ បានអនុម័ត — រង់ចាំផ្ញើ (${ok.length})</h3>${ok.length?`<button class="btn sun sm" onclick="Cert.sendAll()">📤 ផ្ញើទាំងអស់</button>`:''}</div>
    ${ok.length?`<div class="ct-list">${ok.map(x=>row(c,x,`<button class="btn ghost sm" onclick="Cert.view('${c.id}','${x.id}')">👁</button><button class="btn ghost sm" onclick="Cert.edit('${c.id}','${x.id}')">✏️ កែ</button><button class="btn sun sm" onclick="Cert.send('${x.id}')">📤 ផ្ញើ</button><button class="btn ghost sm" title="ត្រឡប់ទៅសំណើ" onclick="Cert.undo('${x.id}')">↩</button>`)).join('')}</div>`:'<p class="ct-empty">—</p>'}</div>
  <div class="panel"><div class="ct-sh"><h3 class="sec">➕ ពិនិត្យរយៈពេលផ្សេង (រួមទាំងសប្តាហ៍/ខែនេះ)</h3></div>
    <div class="row ct-pick"><select onchange="Cert._tt('t',this.value)"><option value="busy" ${TT.t==='busy'?'selected':''}>💪 រៀនច្រើនម៉ោង</option><option value="rich" ${TT.t==='rich'?'selected':''}>💰 រកលុយច្រើន</option></select>
      <select onchange="Cert._tt('y',this.value)">${[['w','សប្តាហ៍'],['m','ខែ'],['y','ឆ្នាំ']].map(([k,l])=>`<option value="${k}" ${TT.y===k?'selected':''}>${l}</option>`).join('')}</select>
      <select onchange="Cert._tt('key',this.value)">${opts.map(k=>`<option value="${k}" ${k===key?'selected':''}>${esc(perLabel({y:TT.y,key:k}))}</option>`).join('')}</select></div>
    ${man.length?`<div class="ct-list">${man.map(x=>{ const k=`${TT.t}:${TT.y}:${key}:${x.s.id}`, st=(CS(c).find(v=>v.k===k)||{}).st; const it={k,t:TT.t,sid:x.s.id,p:{y:TT.y,key},rk:x.rk,v:x.v,...(x.goal!=null?{goal:x.goal}:{})};
      return row(c,it, st==='sent'?'<span class="ct-st sent">📤 បានផ្ញើ</span>':st==='ok'?'<span class="ct-st">✅ បានអនុម័ត</span>':`<button class="btn teal sm" onclick='Cert.okItem(${JSON.stringify(it).replace(/'/g,"&#39;")})'>✅ អនុម័ត</button>`); }).join('')}</div>`:'<p class="ct-empty">មិនទាន់មានទិន្នន័យសម្រាប់រយៈពេលនេះ</p>'}</div>
  <div class="panel"><div class="ct-sh"><h3 class="sec">📜 ប័ណ្ណដែលបានផ្ញើ</h3>${sent.length?`<button class="btn ghost sm" onclick="Cert.dlOpen('${c.id}')">📥 តាមដានការទាញយក</button>`:''}${yrs.length?`<select onchange="Cert._tt('yr',+this.value)">${yrs.map(y=>`<option ${y===yr?'selected':''}>${y}</option>`).join('')}</select>`:''}</div>
    ${sent.length?`<div class="ct-list">${sent.filter(x=>new Date(x.sent||x.ts).getFullYear()===yr).sort((a,b)=>(b.sent||0)-(a.sent||0)).map(x=>row(c,x,`${dlChip(c,x)}<button class="btn ghost sm" onclick="Cert.view('${c.id}','${x.id}')">👁</button><button class="btn ghost sm" title="កែ" onclick="Cert.edit('${c.id}','${x.id}')">✏️</button><button class="btn ghost sm" onclick="Cert.png('${c.id}','${x.id}')">⬇</button><button class="btn ghost sm" title="ដកហូតប័ណ្ណ" onclick="Cert.revoke('${x.id}')">🗑</button>`)).join('')}</div>`:'<p class="ct-empty">មិនទាន់បានផ្ញើប័ណ្ណ</p>'}</div>`;
  TAB={el, c, sug}; }
let TAB=null;
const me = () => (window.Auth&&Auth.user())||{};
function store(c, x, st){ CS(c).push({id:'ct'+Date.now().toString(36)+Math.random().toString(36).slice(2,6), ...x, st, ts:Date.now(), by:me().id||'local', tn:me().name||''}); }
const redo = () => { if(window.Class) Class._save(); if(TAB) tab(TAB.el, TAB.c); };
function ok(i){ const x=TAB.sug[i]; if(!x) return; store(TAB.c, x, 'ok'); redo(); }
function okItem(x){ if(has(TAB.c,x.k)) return; store(TAB.c, x, 'ok'); redo(); }
function okAll(){ TAB.sug.forEach(x=>store(TAB.c,x,'ok')); redo(); toast('✅ បានអនុម័តទាំងអស់'); }
function no(i){ const x=TAB.sug[i]; if(!x) return; store(TAB.c, x, 'no'); redo(); }
function undo(id){ TAB.c.certs=CS(TAB.c).filter(x=>x.id!==id); redo(); }
function notify(c, x){ const users=(window.Auth&&Auth.data().users)||[], u=users.find(v=>v.role==='student'&&v.classId===c.id&&v.studentId===x.sid);
  if(u&&window.Notify&&Notify.post) Notify.post(c.id,{to:u.id, kind:'ann', t:'🏅 អបអរ! អ្នកទទួលបានប័ណ្ណសរសើរ', x:lines(x).title+' — ចូល «🏅 ប័ណ្ណសរសើរ» ដើម្បីមើល និងទាញយក'}); }
function send(id){ const x=CS(TAB.c).find(v=>v.id===id); if(!x) return; x.st='sent'; x.sent=Date.now(); x.tn=x.tn||me().name||''; notify(TAB.c,x); redo(); toast('📤 បានផ្ញើទៅសិស្ស'); }
function sendAll(){ const L=CS(TAB.c).filter(x=>x.st==='ok'); L.forEach(x=>{ x.st='sent'; x.sent=Date.now(); notify(TAB.c,x); }); redo(); toast(`📤 បានផ្ញើ ${L.length} ប័ណ្ណ`); }
function revoke(id){ const x=CS(TAB.c).find(v=>v.id===id); if(!x) return; const s=TAB.c.students.find(v=>v.id===x.sid);
  if(!confirm(`ដកហូតប័ណ្ណសរសើររបស់ ${s?s.name:''}?\n«${lines(x).title}»\nសិស្សនឹងលែងឃើញប័ណ្ណនេះទៀត។`)) return;
  TAB.c.certs=CS(TAB.c).filter(v=>v.id!==id); redo(); toast('🗑 បានដកហូតប័ណ្ណ'); }

/* ---------- 🎓 student: my certificates ---------- */
function myC(){ const u=me(); return (J(CK)||{classes:[]}).classes.find(x=>x.id===u.classId); }
function mine(){ const u=me(), c=myC(); return c?CS(c).filter(x=>x.st==='sent'&&x.sid===u.studentId):[]; }
function count(){ try{ return mine().length; }catch(e){ return 0; } }
function page(el){ const c=myC(), L=mine().sort((a,b)=>(b.sent||0)-(a.sent||0)), yrs=[...new Set(L.map(x=>new Date(x.sent||x.ts).getFullYear()))];
  el.innerHTML=`<div class="stu-page"><div class="ct-hero"><span>🏅</span><div><h2>ប័ណ្ណសរសើររបស់ខ្ញុំ</h2><p>${L.length?`ទទួលបាន ${L.length} ប័ណ្ណ — ពូកែណាស់! 👏`:'ខិតខំរៀន ប្រឡងឱ្យជាប់ល្អ ដើម្បីទទួលប័ណ្ណសរសើរពីគ្រូ'}</p></div></div>
    ${L.length?yrs.map(y=>`<h3 class="sec">📅 ឆ្នាំ ${y}</h3><div class="ct-grid">${L.filter(x=>new Date(x.sent||x.ts).getFullYear()===y).map(x=>{ const l=lines(x); return `<button class="ct-card ct-${x.t}" onclick="Cert.view('${c.id}','${x.id}')"><span>${x.t==='exam'?`<b>${x.g}</b>`:MED[x.rk]}</span><div><b>${esc(TYPES[x.t][1])}</b><small>${esc(x.t==='exam'?'Unit '+x.n+' • '+l.val:perLabel(x.p)+' • '+l.val)}</small></div><i>›</i></button>`; }).join('')}</div>`).join('')
      :`<div class="stu-empty"><div style="font-size:64px">🎖️</div><p>មិនទាន់មានប័ណ្ណសរសើរនៅឡើយ</p><ul class="ct-how"><li>💪 រៀនបានច្រើនម៉ោងជាងគេ ប្រចាំសប្តាហ៍ ខែ ឬឆ្នាំ</li><li>💰 រកលុយពីការរៀនបានច្រើនជាងគេ</li><li>📝 ប្រឡងបញ្ចប់មេរៀនជាប់និទ្ទេស A–E</li></ul></div>`}</div>`; }

function cfgOpen(){ const c=TAB.c, K=cfg(c);
  const row=(t,y)=>{ const k=K[t][y], u=t==='busy'?'ម៉ោង':'៛', mv=t==='busy'?Math.round((+k.min||0)/360)/10:(+k.min||0);
    return `<tr><td>${TYPES[t][0]} ${PER[y]}</td><td><select id="cf_${t}_${y}_m" onchange="this.closest('tr').dataset.m=this.value">${[['rank','🏆 ចំណាត់ថ្នាក់'],['goal','🎯 គោលដៅ'],['off','⛔ បិទ']].map(([v,l])=>`<option value="${v}" ${k.mode===v?'selected':''}>${l}</option>`).join('')}</select></td>
      <td><input id="cf_${t}_${y}_n" type="number" min="1" max="20" value="${k.n}" title="ចំនួនចំណាត់ថ្នាក់"></td><td><input id="cf_${t}_${y}_v" type="number" min="0" step="${t==='busy'?'0.5':'500'}" value="${mv}"> ${u}</td></tr>`; };
  modal(`<div class="ct-cfg"><h3>⚙️ លក្ខខណ្ឌទទួលប័ណ្ណសរសើរ — ${esc(c.name)}</h3>
    <p class="note">🏆 <b>ចំណាត់ថ្នាក់</b> = ផ្តល់ឱ្យលេខ ១ ដល់លេខ N (អាចដាក់អប្បបរមាផង) • 🎯 <b>គោលដៅ</b> = ផ្តល់ឱ្យសិស្សគ្រប់គ្នាដែលរៀនបាន/រកបានគ្រប់ចំនួនកំណត់</p>
    <table class="ct-cft"><thead><tr><th>ប្រភេទ</th><th>របៀប</th><th>ចំនួនចំណាត់ថ្នាក់</th><th>អប្បបរមា</th></tr></thead><tbody>
      ${['busy','rich'].map(t=>['w','m','y'].map(y=>row(t,y)).join('')).join('')}
      <tr><td>📝 ប្រឡង</td><td colspan="3">ពិន្ទុចាប់ពី <select id="cf_exam">${[[50,'E មធ្យម (50%)'],[60,'D ល្អបង្គួរ (60%)'],[70,'C ល្អ (70%)'],[80,'B ល្អណាស់ (80%)'],[90,'A ល្អប្រសើរ (90%)']].map(([v,l])=>`<option value="${v}" ${+K.exam.min===v?'selected':''}>${l}</option>`).join('')}</select> ឡើងទៅ</td></tr></tbody></table>
    <p class="note">💡 ឧទាហរណ៍៖ 💪 សប្តាហ៍ = 🎯 គោលដៅ 5 ម៉ោង → សិស្សគ្រប់គ្នាដែលរៀនបាន ≥ 5 ម៉ោង/សប្តាហ៍ ទទួលប័ណ្ណ • 💰 ខែ = 🏆 ចំណាត់ថ្នាក់ 5 → លេខ ១–៥</p>
    <label class="me-f"><span>🖼 ស៊ុមលំនាំដើមសម្រាប់ប័ណ្ណថ្មី</span><select id="cf_frame" class="cl-in">${FRS.map(([k,l])=>`<option value="${k}" ${((c.certCfg||{}).frame||'classic')===k?'selected':''}>${l}</option>`).join('')}</select></label>
    <div class="row" style="justify-content:flex-end;gap:8px"><button class="btn ghost" onclick="Cert._cfgReset()">↺ លំនាំដើម</button><button class="btn teal" onclick="Cert._cfgSave()">💾 រក្សាទុក</button></div></div>`);
  document.getElementById('modal').classList.add('wide'); }
function cfgSave(){ const c=TAB.c, o={exam:{min:+document.getElementById('cf_exam').value}, frame:document.getElementById('cf_frame').value};
  ['busy','rich'].forEach(t=>{ o[t]={}; ['w','m','y'].forEach(y=>{ const g=k=>document.getElementById(`cf_${t}_${y}_${k}`).value, v=Math.max(0,+g('v')||0);
    o[t][y]={mode:g('m'), n:Math.max(1,Math.min(20,Math.round(+g('n')||3))), min:t==='busy'?Math.round(v*3600):Math.round(v)}; if(o[t][y].mode==='goal'&&!o[t][y].min) o[t][y].min=t==='busy'?3600:5000; }); });
  if(c.certCfg&&c.certCfg.tpl) o.tpl=c.certCfg.tpl; c.certCfg=o; closeModal(); redo(); toast('💾 បានរក្សាទុកលក្ខខណ្ឌ'); }
/* 📥 download tracker: per class (teacher) or every class (admin) */
let DLF='all';
const DLN={all:'ទាំងអស់', dl:'⬇ ទាញយករួច', seen:'👁 មើលតែមិនទាន់ទាញយក', wait:'⏳ មិនទាន់បើក', no:'🚫 គ្មានគណនី'};
function dlHtml(cs){ const R=[]; cs.forEach(c=>CS(c).filter(x=>x.st==='sent').forEach(x=>R.push({c,x,st:dlState(c,x)})));
  const n=k=>R.filter(r=>r.st===k).length, L=R.filter(r=>DLF==='all'||r.st===DLF).sort((a,b)=>(b.x.sent||0)-(a.x.sent||0));
  return `<div class="ct-dlk"><div><b>${R.length}</b><small>ប័ណ្ណបានផ្ញើ</small></div><div class="ok"><b>${n('dl')}</b><small>⬇ ទាញយក/បោះពុម្ពរួច</small></div><div class="seen"><b>${n('seen')}</b><small>👁 មើលតែមិនទាន់ទាញយក</small></div><div class="wait"><b>${n('wait')}</b><small>⏳ មិនទាន់បើក</small></div></div>
    <div class="row" style="gap:6px;margin:10px 0">${Object.entries(DLN).map(([k,l])=>`<button class="chip ${DLF===k?'on':''}" onclick="Cert._dlF('${k}')">${l}${k==='all'?'':' ('+n(k)+')'}</button>`).join('')}</div>
    <div class="ct-list">${L.map(({c,x})=>row(c,x,`${cs.length>1?`<span class="ct-dl cls">🏫 ${esc(c.name)}</span>`:''}${dlChip(c,x)}<button class="btn ghost sm" onclick="Cert.view('${c.id}','${x.id}')">👁</button>`)).join('')||'<p class="ct-empty">—</p>'}</div>
    <p class="note">💡 ទិន្នន័យមកពីទូរស័ព្ទសិស្ស — ធ្វើបច្ចុប្បន្នភាពពេលសិស្សភ្ជាប់អ៊ីនធឺណិត • ដាក់ម៉ៅស៍លើស្លាក ដើម្បីមើលចំនួនដង និងពេលចុងក្រោយ</p>`; }
let DLC=null;
function dlOpen(cid){ DLC={cid}; const c=findC(cid); modal(`<div class="ct-dlw"><h3>📥 តាមដានការទាញយកប័ណ្ណ — ${esc(c?c.name:'')}</h3><div id="ctDl">${dlHtml(c?[c]:[])}</div></div>`); document.getElementById('modal').classList.add('wide'); }
const allC = () => window.Class&&Class.data ? Class.data().classes : (J(CK)||{classes:[]}).classes;
function dlPanel(el){ DLC={el}; el.innerHTML=`<div class="panel"><h3 class="sec">📥 តាមដានការទាញយកប័ណ្ណសរសើរ — គ្រប់ថ្នាក់</h3><div id="ctDl">${dlHtml(allC())}</div></div>`; }
function dlF(k){ DLF=k; if(DLC&&DLC.el&&document.body.contains(DLC.el)) return dlPanel(DLC.el); const b=document.getElementById('ctDl'); if(b&&DLC) b.innerHTML=dlHtml([findC(DLC.cid)].filter(Boolean)); }
window.Cert = { dlOpen, dlPanel, _dlF:dlF, _tplEdit:tplEdit, _tplSave:tplSave, _edIns:edIns, _edFocus:el=>{ LASTF=el; }, _edDemo:(k,v)=>{ ED[k]=v; edDraw(); }, _edFrame:edFrame, FRS, _cfgOpen:cfgOpen, _cfgSave:cfgSave, _cfgReset:()=>{ const tp=TAB.c.certCfg&&TAB.c.certCfg.tpl; delete TAB.c.certCfg; if(tp) TAB.c.certCfg={tpl:tp}; closeModal(); redo(); toast('↺ ត្រឡប់លំនាំដើម (លេខ ១–៣)'); }, edit, _edSet:edSet, _edSave:edSave, _edPng:edPng, _edReset:edReset, _edSig:edSig, tab, page, count, view, png, print, ok, okItem, okAll, no, undo, send, sendAll, revoke, suggest, draw, _tt:(k,v)=>{ TT[k]=v; if(k==='y'||k==='t') TT.key=null; if(k==='key') TT.key=TT.y+v; if(TAB) tab(TAB.el,TAB.c); } };
})();
