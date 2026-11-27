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
const RK=['','លេខ ១','លេខ ២','លេខ ៣'], MED=['','🥇','🥈','🥉'];
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
const TYPES = {busy:['💪','សិស្សឧស្សាហ៍រៀនជាងគេ','Most Hard-working Student'], rich:['💰','សិស្សរកលុយពីការរៀនបានច្រើនជាងគេ','Top Learning Earner'], exam:['📝','ប្រឡងបញ្ចប់មេរៀនជាប់និទ្ទេស','Unit Test Achievement']};

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
function top(c, t, p){ const E=entries(c); return c.students.map(s=>({s, v:value(E[s.id],t,p)})).filter(x=>x.v>(t==='busy'?60:0)).sort((a,b)=>b.v-a.v).slice(0,3).map((x,i)=>({...x, rk:i+1})); }
function examBest(c){ const X=(J(XK)||{}).results||[], users=(window.Auth&&Auth.data().users)||[], best={};
  X.forEach(r=>{ let sid=null; if(r.uid){ const u=users.find(x=>x.id===r.uid); if(u&&u.classId===c.id) sid=u.studentId; } if(!sid&&r.sid&&c.students.some(s=>s.id===r.sid)) sid=r.sid; if(!sid) return;
    const k=sid+':'+r.n; if(!best[k]||r.pct>best[k].pct) best[k]={sid, n:r.n, pct:r.pct, ts:r.ts}; });
  return Object.values(best).filter(b=>b.pct>=50); }

/* ---------- suggestions: last finished week / month / year + exam grades ---------- */
const CS = c => (c.certs=c.certs||[]);
const has = (c,k) => CS(c).some(x=>x.k===k);
function periods(){ const now=new Date(), wk=mon(now), m=dk(now).slice(0,7), y=String(now.getFullYear());
  const pm=new Date(now.getFullYear(), now.getMonth()-1, 15); return {w:addD(wk,-7), m:dk(pm).slice(0,7), y:String(+y-1), cw:wk, cm:m, cy:y}; }
function suggest(c){ const P=periods(), out=[];
  [['w',P.w],['m',P.m],['y',P.y]].forEach(([y,key])=>['busy','rich'].forEach(t=>{ const p={y,key}; top(c,t,p).forEach(x=>{ const k=`${t}:${y}:${key}:${x.s.id}`; if(!has(c,k)) out.push({k, t, sid:x.s.id, p, rk:x.rk, v:x.v}); }); }));
  examBest(c).forEach(b=>{ const g=gradeOf(b.pct); const done=CS(c).filter(x=>x.t==='exam'&&x.sid===b.sid&&x.n===b.n);
    if(done.some(x=>x.v>=b.pct||x.g===g[1])) return; const k=`exam:${b.n}:${g[1]}:${b.sid}`; if(!has(c,k)) out.push({k, t:'exam', sid:b.sid, n:b.n, g:g[1], v:b.pct, p:{y:'d', key:dk(new Date(b.ts||Date.now()))}}); });
  return out; }

/* ---------- certificate picture (canvas → PNG) ---------- */
function lines(t){ const T=TYPES[t.t];
  if(t.t==='exam'){ const g=GR.find(x=>x[1]===t.g)||GR[4]; return {title:`បានប្រឡងបញ្ចប់ Unit ${t.n} ជាប់និទ្ទេស ${g[1]} (${g[2]})`, en:`for passing the Unit ${t.n} test with grade ${g[1]} — ${g[3]} (${t.v}%)`, val:`${t.v}% • និទ្ទេស ${g[1]}`, big:g[1]}; }
  return {title:`${T[1]} ${RK[t.rk]} ${perLabel(t.p)}`, en:`${T[2]} — No. ${t.rk} — ${perEn(t.p)}`, val:t.t==='busy'?'រៀនបាន '+fmtT(t.v):'រកបាន '+riel(t.v), big:MED[t.rk]}; }
async function draw(t, s, c){
  const W=1600, H=1130, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const x=cv.getContext('2d');
  try{ await document.fonts.load('700 40px "Kantumruy Pro"'); }catch(e){}
  const KH='"Kantumruy Pro","Noto Sans Khmer","Khmer UI",sans-serif', SER='Georgia,"Times New Roman",serif', L=lines(t);
  const pal={busy:['#0f766e','#14b8a6'], rich:['#b45309','#f59e0b'], exam:['#1d4ed8','#60a5fa']}[t.t];
  x.fillStyle='#fffdf6'; x.fillRect(0,0,W,H);
  const gr=x.createLinearGradient(0,0,W,H); gr.addColorStop(0,pal[0]); gr.addColorStop(.5,pal[1]); gr.addColorStop(1,pal[0]);
  x.fillStyle=gr; x.fillRect(0,0,W,34); x.fillRect(0,H-34,W,34); x.fillRect(0,0,34,H); x.fillRect(W-34,0,34,H);
  x.strokeStyle='#c9a227'; x.lineWidth=4; x.strokeRect(58,58,W-116,H-116); x.lineWidth=1.5; x.strokeRect(72,72,W-144,H-144);
  x.fillStyle='#c9a227'; [[72,72],[W-72,72],[72,H-72],[W-72,H-72]].forEach(([a,b])=>{ x.save(); x.translate(a,b); x.rotate(Math.PI/4); x.fillRect(-12,-12,24,24); x.restore(); });
  x.globalAlpha=.05; x.font='520px serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(TYPES[t.t][0],W/2,H/2+40); x.globalAlpha=1;
  x.textAlign='center'; x.textBaseline='alphabetic';
  x.fillStyle='#64748b'; x.font=`500 26px ${KH}`; x.fillText('កម្មវិធីគ្រប់គ្រងថ្នាក់រៀន • '+(c?c.name:''),W/2,140);
  x.fillStyle=pal[0]; x.font=`800 92px ${KH}`; x.fillText('ប័ណ្ណសរសើរ',W/2,250);
  x.fillStyle='#c9a227'; x.font=`italic 600 34px ${SER}`; x.fillText('Certificate of Achievement',W/2,300);
  x.fillStyle='#475569'; x.font=`400 30px ${KH}`; x.fillText('សូមប្រគល់ជូន • This certificate is proudly presented to',W/2,385);
  x.fillStyle='#0f172a'; x.font=`800 84px ${KH}`; x.fillText(s?s.name:'—',W/2,490);
  if(s&&s.latin){ x.fillStyle='#334155'; x.font=`600 36px ${SER}`; x.fillText(s.latin,W/2,545); }
  x.strokeStyle='#c9a227'; x.lineWidth=2; x.beginPath(); x.moveTo(W/2-360,575); x.lineTo(W/2+360,575); x.stroke();
  const wrap=(txt,y,font,col,max)=>{ x.font=font; x.fillStyle=col; const ws=txt.split(' '); let line='', yy=y; ws.forEach(w=>{ const tt=line?line+' '+w:w; if(x.measureText(tt).width>max&&line){ x.fillText(line,W/2,yy); line=w; yy+=56; } else line=tt; }); x.fillText(line,W/2,yy); return yy; };
  let y=wrap(L.title,650,`700 44px ${KH}`,pal[0],1250);
  y=wrap(L.en,y+52,`italic 30px ${SER}`,'#475569',1250);
  x.fillStyle='#0f172a'; x.font=`700 34px ${KH}`; x.fillText(L.val,W/2,y+62);
  // medal
  const mx=250, my=880; x.fillStyle=pal[1]; x.beginPath(); x.moveTo(mx-40,my-40); x.lineTo(mx-70,my+110); x.lineTo(mx-20,my+80); x.lineTo(mx,my+120); x.lineTo(mx+20,my+80); x.lineTo(mx+70,my+110); x.lineTo(mx+40,my-40); x.fill();
  const mg=x.createRadialGradient(mx-20,my-30,10,mx,my,90); mg.addColorStop(0,'#fff3b0'); mg.addColorStop(1,'#c9a227'); x.fillStyle=mg; x.beginPath(); x.arc(mx,my,82,0,Math.PI*2); x.fill();
  x.strokeStyle='#fff'; x.lineWidth=4; x.beginPath(); x.arc(mx,my,66,0,Math.PI*2); x.stroke();
  x.fillStyle=pal[0]; x.textBaseline='middle'; x.font=t.t==='exam'?`800 72px ${SER}`:`64px serif`; x.fillText(t.t==='exam'?L.big:TYPES[t.t][0],mx,my+4); x.textBaseline='alphabetic';
  // date + signature
  const dt=new Date(t.sent||t.ts||Date.now()); x.fillStyle='#334155'; x.font=`500 28px ${KH}`;
  x.fillText('ថ្ងៃទី '+dt.getDate()+' ខែ'+MK[dt.getMonth()]+' ឆ្នាំ '+dt.getFullYear(),W/2,960);
  x.strokeStyle='#94a3b8'; x.lineWidth=1.5; x.beginPath(); x.moveTo(W-560,950); x.lineTo(W-200,950); x.stroke();
  x.font=`700 30px ${KH}`; x.fillStyle='#0f172a'; x.fillText(t.tn||'គ្រូបង្រៀន',W-380,995); x.font=`400 24px ${KH}`; x.fillStyle='#64748b'; x.fillText('គ្រូបង្រៀន • Teacher',W-380,1030);
  x.font=`400 20px ${KH}`; x.fillStyle='#94a3b8'; x.fillText('លេខប័ណ្ណ '+t.id.slice(-8).toUpperCase(),W/2,1050);
  return cv;
}
async function view(cid, id){ const c=findC(cid), t=c&&CS(c).find(x=>x.id===id); if(!t) return; const s=c.students.find(x=>x.id===t.sid);
  modal(`<div class="ct-view"><div class="ct-img"><p class="note">⏳ កំពុងរៀបចំ…</p></div>
    <div class="row" style="justify-content:center;gap:8px;margin-top:10px"><button class="btn teal" onclick="Cert.png('${cid}','${id}')">⬇ ទាញយករូបភាព (PNG)</button><button class="btn ghost" onclick="Cert.print('${cid}','${id}')">🖨 បោះពុម្ព</button></div></div>`);
  document.getElementById('modal').classList.add('wide');
  const cv=await draw(t,s,c); const box=$('.ct-img'); if(box) box.innerHTML=`<img src="${cv.toDataURL('image/png')}" alt="certificate">`; }
async function png(cid,id){ const c=findC(cid), t=CS(c).find(x=>x.id===id), s=c.students.find(x=>x.id===t.sid), cv=await draw(t,s,c);
  const a=document.createElement('a'); a.href=cv.toDataURL('image/png'); a.download=`ប័ណ្ណសរសើរ_${(s&&(s.latin||s.name)||'student').replace(/\s+/g,'_')}_${t.t}.png`; document.body.appendChild(a); a.click(); a.remove(); }
async function print(cid,id){ const c=findC(cid), t=CS(c).find(x=>x.id===id), s=c.students.find(x=>x.id===t.sid), cv=await draw(t,s,c);
  $('#printArea').innerHTML=`<style>@page{size:A4 landscape;margin:0}</style><img src="${cv.toDataURL('image/png')}" style="width:100%;display:block">`; setTimeout(()=>window.print(),300); }
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
    <p class="note">ជំហាន៖ ប្រព័ន្ធស្នើ → <b>✅ អនុម័ត</b> (ផ្ទៀងផ្ទាត់) → <b>📤 ផ្ញើ</b> → សិស្សទើបឃើញ • ប័ណ្ណដែលផ្ញើ រក្សាទុកជារៀងរហូត លុះត្រាគ្រូ <b>🗑 ដកហូត</b></p></div>
  <div class="panel"><div class="ct-sh"><h3 class="sec">🔔 សំណើថ្មី — ត្រូវអនុម័ត (${sug.length})</h3>${sug.length?`<button class="btn teal sm" onclick="Cert.okAll()">✅ អនុម័តទាំងអស់</button>`:''}</div>
    <p class="note">សប្តាហ៍មុន • ខែមុន • ឆ្នាំមុន (រយៈពេលដែលចប់ហើយ) និងលទ្ធផលប្រឡងជាប់ (≥50%)</p>
    ${sug.length?`<div class="ct-list">${sug.map((x,i)=>row(c,x,`<button class="btn teal sm" onclick="Cert.ok(${i})">✅ អនុម័ត</button><button class="btn ghost sm" title="មិនផ្តល់" onclick="Cert.no(${i})">✖</button>`)).join('')}</div>`:'<p class="ct-empty">✨ គ្មានសំណើថ្មីទេ</p>'}</div>
  <div class="panel"><div class="ct-sh"><h3 class="sec">✅ បានអនុម័ត — រង់ចាំផ្ញើ (${ok.length})</h3>${ok.length?`<button class="btn sun sm" onclick="Cert.sendAll()">📤 ផ្ញើទាំងអស់</button>`:''}</div>
    ${ok.length?`<div class="ct-list">${ok.map(x=>row(c,x,`<button class="btn ghost sm" onclick="Cert.view('${c.id}','${x.id}')">👁</button><button class="btn sun sm" onclick="Cert.send('${x.id}')">📤 ផ្ញើ</button><button class="btn ghost sm" title="ត្រឡប់ទៅសំណើ" onclick="Cert.undo('${x.id}')">↩</button>`)).join('')}</div>`:'<p class="ct-empty">—</p>'}</div>
  <div class="panel"><div class="ct-sh"><h3 class="sec">➕ ពិនិត្យរយៈពេលផ្សេង (រួមទាំងសប្តាហ៍/ខែនេះ)</h3></div>
    <div class="row ct-pick"><select onchange="Cert._tt('t',this.value)"><option value="busy" ${TT.t==='busy'?'selected':''}>💪 រៀនច្រើនម៉ោង</option><option value="rich" ${TT.t==='rich'?'selected':''}>💰 រកលុយច្រើន</option></select>
      <select onchange="Cert._tt('y',this.value)">${[['w','សប្តាហ៍'],['m','ខែ'],['y','ឆ្នាំ']].map(([k,l])=>`<option value="${k}" ${TT.y===k?'selected':''}>${l}</option>`).join('')}</select>
      <select onchange="Cert._tt('key',this.value)">${opts.map(k=>`<option value="${k}" ${k===key?'selected':''}>${esc(perLabel({y:TT.y,key:k}))}</option>`).join('')}</select></div>
    ${man.length?`<div class="ct-list">${man.map(x=>{ const k=`${TT.t}:${TT.y}:${key}:${x.s.id}`, st=(CS(c).find(v=>v.k===k)||{}).st; const it={k,t:TT.t,sid:x.s.id,p:{y:TT.y,key},rk:x.rk,v:x.v};
      return row(c,it, st==='sent'?'<span class="ct-st sent">📤 បានផ្ញើ</span>':st==='ok'?'<span class="ct-st">✅ បានអនុម័ត</span>':`<button class="btn teal sm" onclick='Cert.okItem(${JSON.stringify(it).replace(/'/g,"&#39;")})'>✅ អនុម័ត</button>`); }).join('')}</div>`:'<p class="ct-empty">មិនទាន់មានទិន្នន័យសម្រាប់រយៈពេលនេះ</p>'}</div>
  <div class="panel"><div class="ct-sh"><h3 class="sec">📜 ប័ណ្ណដែលបានផ្ញើ</h3>${yrs.length?`<select onchange="Cert._tt('yr',+this.value)">${yrs.map(y=>`<option ${y===yr?'selected':''}>${y}</option>`).join('')}</select>`:''}</div>
    ${sent.length?`<div class="ct-list">${sent.filter(x=>new Date(x.sent||x.ts).getFullYear()===yr).sort((a,b)=>(b.sent||0)-(a.sent||0)).map(x=>row(c,x,`<button class="btn ghost sm" onclick="Cert.view('${c.id}','${x.id}')">👁</button><button class="btn ghost sm" onclick="Cert.png('${c.id}','${x.id}')">⬇</button><button class="btn ghost sm" title="ដកហូតប័ណ្ណ" onclick="Cert.revoke('${x.id}')">🗑</button>`)).join('')}</div>`:'<p class="ct-empty">មិនទាន់បានផ្ញើប័ណ្ណ</p>'}</div>`;
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

window.Cert = { tab, page, count, view, png, print, ok, okItem, okAll, no, undo, send, sendAll, revoke, suggest, draw, _tt:(k,v)=>{ TT[k]=v; if(k==='y'||k==='t') TT.key=null; if(k==='key') TT.key=TT.y+v; if(TAB) tab(TAB.el,TAB.c); } };
})();
