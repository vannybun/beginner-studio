// =====================================================================
//  auth.js — 🔐 គណនី Admin • គ្រូ • សិស្ស  (រក្សាទុកក្នុងកុំព្យូទ័រនេះ)
//  • Admin  : គ្រប់គ្រងគណនីទាំងអស់ ថ្នាក់ គ្រូ Backup និងកំណត់ហេតុ
//  • គ្រូ    : របៀបគ្រូ + ថ្នាក់ដែលខ្លួនទទួលបន្ទុក + បង្កើតគណនីសិស្សក្នុងថ្នាក់
//  • សិស្ស  : របៀបរៀនតែម្តង • វឌ្ឍនភាពផ្ទាល់ខ្លួន • ប្រឡងដោយឈ្មោះខ្លួនឯង • មើលលទ្ធផលខ្លួនឯង
//  ពាក្យសម្ងាត់រក្សាទុកជា SHA-256 + salt • Session បិទពេលបិទកម្មវិធី
// =====================================================================
(function(){
const AK='beginner-studio-auth-v1', SK='beginner-studio-session';
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reload = () => (window.Cloud&&Cloud.flush ? Cloud.flush() : Promise.resolve()).then(()=>location.reload());
const uid = () => Math.random().toString(36).slice(2,10);
let A = { users:[], log:[], recovery:null };
try { Object.assign(A, JSON.parse(localStorage.getItem(AK)||'{}')); } catch(e){}
const saveA = () => { try{ localStorage.setItem(AK, JSON.stringify(A)); }catch(e){} };
let SESSION=null; try{ SESSION=JSON.parse(sessionStorage.getItem(SK)||'null'); }catch(e){}
const ROLE = {admin:{i:'🛡️',km:'Admin',c:'#7c3aed'}, teacher:{i:'👩‍🏫',km:'គ្រូ',c:'#0f766e'}, student:{i:'🎓',km:'សិស្ស',c:'#ea580c'}};

/* ---------- hashing ---------- */
async function sha(s){
  try{ const b=await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); }
  catch(e){ let h=5381; for(const ch of s) h=(h*33)^ch.codePointAt(0); return 'f'+(h>>>0).toString(16); }
}
async function setPass(u, p){ u.salt=uid()+uid(); u.hash=await sha(u.salt+'|'+p); }
async function checkPass(u, p){ return u.hash && u.hash===await sha(u.salt+'|'+p); }
const randPin = () => String(Math.floor(1000+Math.random()*9000));

/* ---------- session ---------- */
function user(){ if(!SESSION) return null; const u=A.users.find(x=>x.id===SESSION.uid && !x.disabled); return u||null; }
function role(){ const u=user(); return u?u.role:null; }
function progressKey(){ const u=user(); return u && u.role==='student' ? ':'+u.id : ''; }
function log(ev, u){ u=u||user(); A.log.unshift({ts:Date.now(), uid:u?u.id:null, name:u?u.name:'—', role:u?u.role:'', ev}); A.log=A.log.slice(0,400); saveA(); }
function login(u){ u.last=Date.now(); SESSION={uid:u.id, ts:Date.now()}; sessionStorage.setItem(SK, JSON.stringify(SESSION)); log('ចូលប្រព័ន្ធ', u); reload(); }
function logout(){ log('ចាកចេញ'); { const u=user(); if(u) sessionStorage.setItem('bs-tab', u.role); } sessionStorage.removeItem(SK); reload(); }

/* ---------- class helpers (works with class.js data) ---------- */
const CK='beginner-studio-class-v1';
function classData(){ try{ return JSON.parse(localStorage.getItem(CK)||'{}'); }catch(e){ return {}; } }
function studentOf(u){ const D=classData(); const c=(D.classes||[]).find(x=>x.id===u.classId); return c ? {c, s:c.students.find(x=>x.id===u.studentId)} : {}; }
function canSeeClass(c){ const u=user(); if(!u) return false; if(u.role==='admin') return true; if(u.role==='teacher') return !c.owner || c.owner===u.id || (u.classIds||[]).includes(c.id); if(u.role==='student') return c.id===u.classId; return false; }
function avatarFor(u, size){ size=size||36; let photo=u.photo; if(u.role==='student'){ const {s}=studentOf(u); if(s&&s.photo) photo=s.photo; }
  if(photo) return `<img class="au-av" src="${photo}" style="width:${size}px;height:${size}px">`;
  const ini=(u.name||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('');
  return `<span class="au-av ini" style="width:${size}px;height:${size}px;font-size:${size*.38}px;background:${ROLE[u.role].c}">${esc(ini)}</span>`; }

/* ---------- 📱 personal QR codes (scan → that account's login) ---------- */
function qrLinkOf(u){
  const code=window.Cloud&&Cloud.code&&Cloud.code(); if(!code) return null;
  const base=Cloud.roleLink(u.role==='student'?'student':u.role==='admin'?'admin':'teacher', code);
  return base+'#u='+encodeURIComponent(u.username)+(u.role==='student'&&u.pin?'&p='+u.pin:'');
}
function qrObj(text){ try{ const q=qrcode(0,'M'); q.addData(text); q.make(); return q; }catch(e){ return null; } }
function qrSvgOf(text, size){ const q=qrObj(text); if(!q) return ''; const n=q.getModuleCount(); let d=''; for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c)) d+=`M${c+2} ${r+2}h1v1h-1z`; return `<svg viewBox="0 0 ${n+4} ${n+4}" width="${size||200}" height="${size||200}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#0f172a"/></svg>`; }
function qrPng(u){
  const L=qrLinkOf(u), q=qrObj(L); if(!q) return;
  const n=q.getModuleCount(), cell=Math.floor(520/(n+4)), W=600, H=820, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const x=cv.getContext('2d');
  const g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,ROLE[u.role].c); g.addColorStop(1,'#0f172a'); x.fillStyle=g; x.fillRect(0,0,W,H);
  x.fillStyle='#fff'; x.beginPath(); x.roundRect(30,140,540,560,28); x.fill();
  const off=(W-cell*(n+4))/2; x.fillStyle='#0f172a'; for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c)) x.fillRect(off+(c+2)*cell, 150+(r+2)*cell, cell, cell);
  x.fillStyle='#fff'; x.textAlign='center'; x.font='bold 30px "Kantumruy Pro",sans-serif'; x.fillText('📚 Beginner English Studio',W/2,60);
  x.font='26px "Kantumruy Pro",sans-serif'; x.fillText(ROLE[u.role].i+' '+ROLE[u.role].km,W/2,110);
  x.font='bold 36px "Kantumruy Pro",sans-serif'; x.fillText(u.name||'',W/2,760); x.font='22px sans-serif'; x.fillText('@'+u.username,W/2,800);
  const a=document.createElement('a'); a.href=cv.toDataURL('image/png'); a.download=`QR - ${u.name} (${u.username}).png`; a.click();
}
function showQR(id){
  const u=A.users.find(x=>x.id===id), L=qrLinkOf(u);
  if(!L) return modal(`<h3>📱 QR</h3><p class="km">QR ប្រើបានតែលើ <b>Website</b> (vannybun.github.io/beginner-studio) ដែលភ្ជាប់ Cloud រួច។</p>`);
  const st=u.role==='student';
  modal(`<div class="qr-card" style="--rc:${ROLE[u.role].c}"><div class="h">${avatarFor(u,54)}<div><b>${esc(u.name)}</b><span>${ROLE[u.role].i} ${ROLE[u.role].km} • @${esc(u.username)}</span></div></div>
    <div class="q">${qrSvgOf(L,260)}</div>
    <p class="km">${st?'📱 ស្កេន QR នេះដោយកាមេរ៉ាទូរស័ព្ទ → <b>ចូលប្រព័ន្ធដោយស្វ័យប្រវត្តិ</b> (មិនចាំបាច់វាយ PIN)':'📱 ស្កេន QR → បើកទំព័រចូលប្រព័ន្ធ ហើយមាន Username រួចជាស្រេច → វាយតែពាក្យសម្ងាត់'}</p>
    <div class="row" style="justify-content:center"><button class="btn teal" onclick="Auth.qrPng('${u.id}')">⬇ ទាញយក QR (PNG)</button><button class="btn ghost" onclick="navigator.clipboard.writeText(${JSON.stringify(L).replace(/"/g,'&quot;')}).then(()=>toast('✅ បានចម្លងតំណ'))">📋 ចម្លងតំណ</button></div>
    ${st?'<p class="note">⚠️ QR សិស្សមាន PIN នៅខាងក្នុង — អ្នកណាស្កេនបាន អាចចូលគណនីនោះបាន។ ឱ្យសិស្សរក្សាទុកដូចកាតសម្ងាត់។</p>':''}</div>`);
}

/* ---------- gate: setup / login screen ---------- */
function gate(){
  const H=new URLSearchParams(location.hash.slice(1)), qu=(H.get('u')||'').toLowerCase(), qp=H.get('p')||'';
  if(qu){ history.replaceState(null,'',location.pathname+location.search);
    const t=A.users.find(x=>x.username===qu && !x.disabled);
    if(t && user() && user().id!==t.id){ sessionStorage.removeItem(SK); SESSION=null; }
    if(t && !user()){
      if(t.role==='student'){ LS.tab='student'; LS.cls=t.classId; LS.stu=t.id; LS.pin=''; if(qp) checkPass(t,qp).then(ok=>{ if(ok) login(t); else { LS.pin=''; loginScreen(); err('PIN ក្នុង QR ចាស់ហើយ — សូមវាយ PIN ថ្មី'); } }); }
      else { LS.tab=t.role==='admin'?'admin':'teacher'; LS.prefill=t.username; }
    }
  }
  if(user()){ applyRole(); return true; }
  const el=document.createElement('div'); el.id='auth';
  document.body.appendChild(el); document.body.classList.add('auth-open');
  if(!A.users.some(u=>u.role==='admin')) setupScreen(); else loginScreen();
  return false;
}
function shell(inner){ return `<div class="au-bg"><i></i><i></i><i></i></div><div class="au-card">${inner}</div><div class="au-foot">Beginner English Studio • 🔐 គណនីរក្សាទុកក្នុងកុំព្យូទ័រនេះ</div>`; }
function setupScreen(){
  $a().innerHTML = shell(`<div class="au-logo">🛡️</div><h1>ចាប់ផ្តើមប្រើប្រាស់ជាលើកដំបូង</h1><p class="km">បង្កើតគណនី <b>Admin</b> (អ្នកគ្រប់គ្រងប្រព័ន្ធ) — អាចបង្កើតគណនីគ្រូ និងសិស្សនៅពេលក្រោយ</p>
    <label>ឈ្មោះពេញ<input id="auN" value="" placeholder="ឧ. លោកគ្រូ ពៅ"></label>
    <label>ឈ្មោះអ្នកប្រើ (Username)<input id="auU" value="admin" autocomplete="off"></label>
    <label>ពាក្យសម្ងាត់ (យ៉ាងតិច ៦ តួ)<input id="auP" type="password"></label>
    <label>បញ្ជាក់ពាក្យសម្ងាត់<input id="auP2" type="password" onkeydown="if(event.key==='Enter')Auth._setup()"></label>
    <div class="au-err" id="auErr"></div>
    <button class="au-btn" onclick="Auth._setup()">✅ បង្កើតគណនី Admin</button>`);
}
async function _setup(){
  const n=$('#auN').value.trim()||'Admin', un=$('#auU').value.trim().toLowerCase(), p=$('#auP').value, p2=$('#auP2').value;
  if(!/^[a-z0-9._-]{3,}$/.test(un)) return err('Username ត្រូវមានយ៉ាងតិច ៣ តួ (a-z, 0-9)');
  if(p.length<6) return err('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួ'); if(p!==p2) return err('ពាក្យសម្ងាត់មិនដូចគ្នា');
  const u={id:uid(), role:'admin', username:un, name:n, created:Date.now()}; await setPass(u,p);
  const rc=Array.from({length:3},()=>Math.random().toString(36).slice(2,6).toUpperCase()).join('-'); A.recovery={salt:uid()}; A.recovery.hash=await sha(A.recovery.salt+rc);
  A.users.push(u); saveA(); log('បង្កើតគណនី Admin', u);
  $a().innerHTML = shell(`<div class="au-logo">🔑</div><h1>កូដសង្គ្រោះ (Recovery code)</h1><p class="km">សូមសរសេរ ឬថតទុកកូដនេះ — ប្រើពេលភ្លេចពាក្យសម្ងាត់ Admin។ កូដនេះបង្ហាញតែម្តងប៉ុណ្ណោះ។</p>
    <div class="au-rc">${rc}</div><button class="au-btn" onclick="Auth._loginAs('${u.id}')">✅ ខ្ញុំបានរក្សាទុកហើយ — ចូលប្រព័ន្ធ</button>`);
}
function _loginAs(id){ login(A.users.find(u=>u.id===id)); }
let LS={tab:sessionStorage.getItem('bs-tab')||'student', cls:null, stu:null, pin:''};
function loginScreen(tab){
  LS.tab=tab||LS.tab;
  const tabs=`<div class="au-tabs">${(LS.tab==='admin'?['student','teacher','admin']:['student','teacher']).map(r=>`<button class="${LS.tab===r?'on':''}" onclick="Auth._tab('${r}')">${ROLE[r].i} ${ROLE[r].km}</button>`).join('')}</div>`;
  let body='';
  if(LS.tab==='student'){
    const D=classData(), classes=(D.classes||[]).filter(c=>A.users.some(u=>u.role==='student'&&u.classId===c.id&&!u.disabled));
    if(!classes.length) body=`<div class="au-empty">🎓 មិនទាន់មានគណនីសិស្សទេ<br><small>សូមឱ្យគ្រូបង្កើតគណនីសិស្សក្នុង 👥 ថ្នាក់រៀន → 🔑 គណនីសិស្ស</small></div>`;
    else if(!LS.stu){
      if(!LS.cls || !classes.find(c=>c.id===LS.cls)) LS.cls=classes[0].id;
      const c=classes.find(x=>x.id===LS.cls), us=A.users.filter(u=>u.role==='student'&&u.classId===c.id&&!u.disabled);
      body=`${classes.length>1?`<select class="au-sel" onchange="Auth._cls(this.value)">${classes.map(x=>`<option value="${x.id}" ${x.id===c.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select>`:`<div class="au-cn">🏫 ${esc(c.name)}</div>`}
        <p class="km au-hint">👆 ចុចលើឈ្មោះ ឬរូបរបស់អ្នក</p>
        <div class="au-stus">${us.map((u,i)=>`<button style="animation-delay:${Math.min(i,40)*0.02}s" onclick="Auth._stu('${u.id}')">${avatarFor(u,58)}<span>${esc(u.name)}</span></button>`).join('')}</div>`;
    } else {
      const u=A.users.find(x=>x.id===LS.stu);
      body=`<button class="au-back" onclick="Auth._stu(null)">◀ ត្រឡប់</button><div class="au-me">${avatarFor(u,96)}<b>${esc(u.name)}</b></div>
        <p class="km au-hint">🔢 វាយលេខសម្ងាត់ ៤ ខ្ទង់ (PIN)</p>
        <div class="au-dots">${[0,1,2,3].map(i=>`<i class="${LS.pin.length>i?'on':''}"></i>`).join('')}</div><div class="au-err" id="auErr"></div>
        <div class="au-pad">${[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'].map(k=>`<button onclick="Auth._pin('${k}')">${k}</button>`).join('')}</div>`;
    }
  } else {
    body=`<label>ឈ្មោះអ្នកប្រើ (Username)<input id="auU" autocomplete="off" autofocus value="${esc(LS.prefill||'')}"></label>
      <label>ពាក្យសម្ងាត់<input id="auP" type="password" onkeydown="if(event.key==='Enter')Auth._login()"></label>
      <div class="au-err" id="auErr"></div><button class="au-btn" onclick="Auth._login()">🔓 ចូលប្រព័ន្ធ</button>
      ${LS.tab==='admin'?`<a class="au-link" href="#" onclick="Auth._recover();return false">ភ្លេចពាក្យសម្ងាត់ Admin?</a>`:''}
      ${LS.tab==='teacher'?`<p class="note" style="margin-top:10px">គ្មានគណនី? សូមស្នើ Admin បង្កើតគណនីគ្រូឱ្យ</p>`:''}`;
  }
  $a().innerHTML = shell(`<div class="au-logo">📚</div><h1>Beginner English Studio</h1>${tabs}<div class="au-body">${body}</div>${LS.tab!=='admin'?`<a class="au-link au-adm" href="#" onclick="Auth._tab('admin');return false">🛡️ Admin</a>`:''}`);
  const f=$('#auU'); if(f) setTimeout(()=>{ (LS.prefill?$('#auP'):f).focus(); },50);
}
async function _login(){
  const un=$('#auU').value.trim().toLowerCase(), p=$('#auP').value;
  const u=A.users.find(x=>x.username===un && x.role===LS.tab && !x.disabled) || A.users.find(x=>x.username===un && LS.tab==='teacher' && x.role==='admin' && !x.disabled);
  if(!u || !(await checkPass(u,p))){ log('ចូលមិនបាន: '+un); return err('Username ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ'); }
  login(u);
}
async function _pin(k){
  if(k==='⌫'){ LS.pin=LS.pin.slice(0,-1); return loginScreen(); }
  if(k==='✓'||LS.pin.length>=4){} else { LS.pin+=k; }
  if(LS.pin.length<4 && k!=='✓') return loginScreen();
  const u=A.users.find(x=>x.id===LS.stu);
  if(u && LS.pin.length===4 && await checkPass(u,LS.pin)) return login(u);
  LS.pin=''; loginScreen(); err('❌ PIN មិនត្រឹមត្រូវ — សាកម្តងទៀត'); const d=document.querySelector('.au-dots'); if(d){ d.classList.add('shake'); }
}
function _recover(){
  $a().innerHTML = shell(`<div class="au-logo">🔑</div><h1>កំណត់ពាក្យសម្ងាត់ Admin ឡើងវិញ</h1>
    <label>កូដសង្គ្រោះ<input id="auRc" placeholder="XXXX-XXXX-XXXX" style="text-transform:uppercase"></label>
    <label>ពាក្យសម្ងាត់ថ្មី<input id="auP" type="password"></label><div class="au-err" id="auErr"></div>
    <button class="au-btn" onclick="Auth._doRecover()">✅ កំណត់ឡើងវិញ</button><a class="au-link" href="#" onclick="Auth._tab('admin');return false">◀ ត្រឡប់</a>`);
}
async function _doRecover(){
  const rc=$('#auRc').value.trim().toUpperCase(), p=$('#auP').value;
  if(!A.recovery || A.recovery.hash!==await sha(A.recovery.salt+rc)) return err('កូដសង្គ្រោះមិនត្រឹមត្រូវ');
  if(p.length<6) return err('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួ');
  const u=A.users.find(x=>x.role==='admin'); u.disabled=false; await setPass(u,p); saveA(); log('កំណត់ពាក្យសម្ងាត់ Admin ឡើងវិញ', u);
  toastA('✅ បានកំណត់ពាក្យសម្ងាត់ថ្មី — username: '+u.username); LS.tab='admin'; loginScreen();
}
const $a = () => document.getElementById('auth');
function err(m){ const e=document.getElementById('auErr'); if(e){ e.textContent=m; e.classList.remove('show'); void e.offsetWidth; e.classList.add('show'); } }
function toastA(m){ if(window.toast) toast(m); else alert(m); }

/* ---------- role application (after login) ---------- */
function applyRole(){
  const u=user(); if(!u) return;
  document.body.classList.add('role-'+u.role);
  document.addEventListener('DOMContentLoaded', ()=>{});
}
function headerChip(){
  const u=user(); if(!u) return '';
  return `<button class="au-chip" onclick="Auth.menu()">${avatarFor(u,30)}<span><b>${esc(u.name)}</b><i>${ROLE[u.role].i} ${ROLE[u.role].km}</i></span></button>`;
}
function menu(){
  const u=user();
  modal(`<div class="au-mhead">${avatarFor(u,64)}<div><h3 style="margin:0">${esc(u.name)}</h3><span class="au-badge" style="background:${ROLE[u.role].c}">${ROLE[u.role].i} ${ROLE[u.role].km}</span>${u.username?` <span class="note">@${esc(u.username)}</span>`:''}</div></div>
    <div class="au-menu">
      ${u.role==='student'?`<button onclick="closeModal();go('me')">📊 លទ្ធផលរបស់ខ្ញុំ</button>`:''}
      ${u.role==='admin'?`<button onclick="closeModal();go('admin',null,'users')">🛡️ ផ្ទាំង Admin</button>`:''}
      ${u.role!=='student'?`<button onclick="Auth.changePass()">🔑 ប្តូរពាក្យសម្ងាត់</button>`:`<button onclick="Auth.changePass()">🔢 ប្តូរ PIN</button>`}
      ${window.Cloud&&Cloud.install&&!Cloud.standalone()?`<button onclick="closeModal();Cloud.install()">📲 ដំឡើងកម្មវិធីលើទូរស័ព្ទ</button>`:''}
      <button class="out" onclick="Auth.logout()">🚪 ចាកចេញ</button>
    </div>`);
}
function changePass(){
  const u=user(), st=u.role==='student';
  modal(`<h3>${st?'🔢 ប្តូរ PIN':'🔑 ប្តូរពាក្យសម្ងាត់'}</h3>
    <label class="au-l">${st?'PIN ចាស់':'ពាក្យសម្ងាត់ចាស់'}<input id="cpO" type="password" class="cl-in" ${st?'inputmode="numeric" maxlength="4"':''}></label>
    <label class="au-l">${st?'PIN ថ្មី (៤ ខ្ទង់)':'ពាក្យសម្ងាត់ថ្មី (យ៉ាងតិច ៦ តួ)'}<input id="cpN" type="password" class="cl-in" ${st?'inputmode="numeric" maxlength="4"':''}></label>
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" onclick="closeModal()">បោះបង់</button><button class="btn teal" onclick="Auth._cp()">💾 រក្សាទុក</button></div>`);
}
async function _cp(){
  const u=user(), st=u.role==='student', o=$('#cpO').value, n=$('#cpN').value;
  if(!(await checkPass(u,o))) return toast('❌ មិនត្រឹមត្រូវ');
  if(st ? !/^\d{4}$/.test(n) : n.length<6) return toast(st?'PIN ត្រូវមាន ៤ ខ្ទង់':'យ៉ាងតិច ៦ តួ');
  await setPass(u,n); if(st) u.pin=n; saveA(); log(st?'ប្តូរ PIN':'ប្តូរពាក្យសម្ងាត់'); closeModal(); toast('✅ បានប្តូររួចរាល់');
}

/* ---------- student: my results ---------- */
function renderMe(){
  const u=user(), {c,s}=studentOf(u);
  const X=(window.Exam&&Exam.data())||{results:[]}; const ex=X.results.filter(r=>r.sid===u.studentId || r.uid===u.id).sort((a,b)=>b.ts-a.ts);
  let months='';
  if(c&&s){ const mt=c.cols.reduce((a,x)=>a+(+x.max||0),0); const ms=Object.keys(c.scores||{}).filter(m=>c.scores[m][s.id]).sort().reverse();
    months = ms.map(m=>{ const r=c.scores[m][s.id]; let t=0; c.cols.forEach(x=>{ const v=parseFloat(r[x.id]); if(!isNaN(v)) t+=v; }); const p=t/mt*100;
      const all=c.students.map(x=>{ const rr=c.scores[m][x.id]; if(!rr) return null; let tt=0; c.cols.forEach(cc=>{ const v=parseFloat(rr[cc.id]); if(!isNaN(v)) tt+=v; }); return tt; }).filter(v=>v!=null).sort((a,b)=>b-a);
      const rank=all.indexOf(t)+1; const [y,mm]=m.split('-');
      return `<div class="me-m"><div class="me-mh"><b>ខែ${['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'][+mm-1]} ${y}</b><span class="me-rank">${rank<=3?['🥇','🥈','🥉'][rank-1]:'🏅'} ចំណាត់ថ្នាក់ ${rank}/${all.length}</span></div>
        <div class="me-cols">${c.cols.map(x=>`<div><span>${esc(x.n)}</span><b>${r[x.id]??'—'}<small>/${x.max}</small></b></div>`).join('')}</div>
        <div class="me-tot"><span>សរុប ${+t.toFixed(2)} / ${mt}</span><div class="bar"><i style="width:${p}%"></i></div><b>${p.toFixed(1)}%</b></div></div>`; }).join('');
  }
  const prog=S; const totalW=UNITS.reduce((a,x)=>a+x.vocab.length,0), knownW=UNITS.reduce((a,x)=>a+((prog.known||{})[x.n]||[]).length,0);
  setUnitColors(5);
  $('#main').innerHTML = `<div class="uhero"><div>${avatarFor(u,92)}</div><div><h2>${esc(u.name)}</h2><div class="kmt">${c?'🏫 '+esc(c.name):''} ${s&&s.latin?'• '+esc(s.latin):''}</div><div class="pgs">📊 លទ្ធផល និងវឌ្ឍនភាពរបស់ខ្ញុំ</div></div><div class="emo float">🏆</div></div>
    <div class="statbox" style="margin-bottom:16px"><div class="stat"><div class="ic">🔤</div><b>${knownW}</b><span>ពាក្យចេះ / ${totalW}</span></div><div class="stat"><div class="ic">🎧</div><b>${Object.keys(prog.listened||{}).length}</b><span>បទបានស្តាប់</span></div><div class="stat"><div class="ic">📝</div><b>${ex.length}</b><span>ប្រឡងបានធ្វើ</span></div></div>
    ${window.Track?`<div class="panel" style="margin-bottom:16px"><h3 class="sec">📅 ការរៀនរបស់ខ្ញុំ — ${(()=>{ const d=(prog.act||{}).d||{}; let w=0; Object.entries(d).forEach(([k,v])=>{ if(Date.now()-new Date(k+'T12:00:00')<7*86400000) w+=v; }); return 'សប្តាហ៍នេះ '+Track.fmtMin(w); })()}</h3>${Track.heat((prog.act||{}).d,12)}</div>`:''}
    <div class="cols"><div class="panel"><h3 class="sec">📅 ពិន្ទុប្រចាំខែ</h3>${months||'<p class="note">មិនទាន់មានពិន្ទុប្រចាំខែទេ</p>'}</div>
    <div class="panel"><h3 class="sec">📝 ប្រឡងបញ្ចប់មេរៀន</h3>${ex.length?ex.map(r=>`<div class="me-ex"><b>Unit ${r.n}</b><span>Version ${r.ver} • ${new Date(r.ts).toLocaleDateString('en-GB')}</span><em style="background:${r.pct>=80?'#16a34a':r.pct>=50?'#2563eb':'#dc2626'}">${r.s}/${r.t} • ${r.pct}%</em></div>`).join(''):'<p class="note">មិនទាន់បានប្រឡងទេ</p>'}</div></div>`;
}

/* ---------- account cards for students (teacher/admin) ---------- */
function studentAccounts(c){
  const us=A.users.filter(u=>u.role==='student'&&u.classId===c.id);
  return {us, missing:c.students.filter(s=>!us.some(u=>u.studentId===s.id))};
}
function slug(s){ return String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,''); }
async function makeStudentAccounts(classId){
  const D=classData(), c=(D.classes||[]).find(x=>x.id===classId); if(!c) return;
  const {missing}=studentAccounts(c); let k=0;
  for(const s of missing){ let base=slug(s.latin)||('s'+(c.students.indexOf(s)+1)); let un=base, i=2; while(A.users.some(u=>u.username===un)) un=base+i++;
    const pin=randPin(), u={id:uid(), role:'student', username:un, name:s.name, classId:c.id, studentId:s.id, pin, created:Date.now()}; await setPass(u,pin); A.users.push(u); k++; }
  // keep names in sync
  A.users.filter(u=>u.role==='student'&&u.classId===c.id).forEach(u=>{ const s=c.students.find(x=>x.id===u.studentId); if(s) u.name=s.name; else u.disabled=true; });
  saveA(); log(`បង្កើតគណនីសិស្ស ${k} នាក់ (${c.name})`); return k;
}
async function resetPin(id){ const u=A.users.find(x=>x.id===id); const pin=randPin(); u.pin=pin; await setPass(u,pin); saveA(); log('កំណត់ PIN ថ្មី: '+u.name); return pin; }
function accountsPanel(c){
  const {us, missing}=studentAccounts(c);
  return `<div class="panel"><div class="row" style="justify-content:space-between"><h3 class="sec" style="margin:0">🔑 គណនីសិស្ស — ${esc(c.name)} (${us.filter(u=>!u.disabled).length}/${c.students.length})</h3>
    <div class="row">${missing.length?`<button class="btn teal" onclick="Auth._mk('${c.id}')">＋ បង្កើតគណនីសិស្ស ${missing.length} នាក់</button>`:''}${us.length?`<button class="btn sun" onclick="Auth.printCards('${c.id}')">🖨 បោះពុម្ពកាតចូលប្រព័ន្ធ</button>`:''}</div></div>
    <p class="note">សិស្សចូលប្រព័ន្ធដោយចុចរូប/ឈ្មោះខ្លួនឯង រួចវាយ PIN ៤ ខ្ទង់។ វឌ្ឍនភាព និងប្រឡងរបស់សិស្សម្នាក់ៗត្រូវបានរក្សាទុកដាច់ដោយឡែក។</p>
    ${us.length?`<div class="cl-tablewrap"><table class="cl-table"><thead><tr><th></th><th class="l">ឈ្មោះ</th><th class="l">Username</th><th>PIN</th><th>ចូលចុងក្រោយ</th><th></th></tr></thead><tbody>
    ${us.map(u=>`<tr style="${u.disabled?'opacity:.45':''}"><td>${avatarFor(u,32)}</td><td class="l"><b>${esc(u.name)}</b></td><td class="l"><code>${esc(u.username)}</code></td><td><span class="au-pin">${u.pin||'••••'}</span></td><td>${u.last?new Date(u.last).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'}):'—'}</td>
      <td><button class="btn ghost sm" onclick="Auth.showQR('${u.id}')">📱 QR</button> <button class="btn ghost sm" onclick="Auth._rp('${u.id}','${c.id}')">🔄 PIN ថ្មី</button> <button class="btn ghost sm" onclick="Auth._tg('${u.id}','${c.id}')">${u.disabled?'✅ បើក':'⛔ បិទ'}</button></td></tr>`).join('')}</tbody></table></div>`:''}
  </div>`;
}
async function _mk(cid){ const k=await makeStudentAccounts(cid); toast(`✅ បានបង្កើតគណនី ${k} នាក់`); render(); }
async function _rp(id,cid){ const pin=await resetPin(id); toast('🔄 PIN ថ្មី៖ '+pin); render(); }
function _tg(id){ const u=A.users.find(x=>x.id===id); u.disabled=!u.disabled; saveA(); log((u.disabled?'បិទ':'បើក')+'គណនី: '+u.name); render(); }
function printCards(cid){
  const CC=window.Cloud&&Cloud.code&&Cloud.code(), JL=CC?Cloud.roleLink('student',CC):(window.Cloud&&Cloud.joinLink&&Cloud.joinLink()), QR=JL?Cloud.qrSvg(JL,2):'';
  const D=classData(), c=(D.classes||[]).find(x=>x.id===cid), us=A.users.filter(u=>u.role==='student'&&u.classId===cid&&!u.disabled);
  document.getElementById('printArea').innerHTML = `<div class="au-cards">${us.map(u=>{ const s=c.students.find(x=>x.id===u.studentId)||{};
    return `<div class="au-pc"><div class="h">📚 Beginner English Studio</div><div class="b">${s.photo?`<img src="${s.photo}">`:`<div class="ph">${esc((u.name||'?')[0])}</div>`}<div><b>${esc(u.name)}</b>${s.latin?`<small>${esc(s.latin)}</small>`:''}<span>🏫 ${esc(c.name)}</span></div></div>
      <div class="pinrow"><span>Username: <b>${esc(u.username)}</b></span><span>PIN: <b>${u.pin||'— (ស្នើគ្រូ)'}</b></span></div><div class="t">ចុចរូបខ្លួនឯង → វាយ PIN • កុំប្រាប់អ្នកដទៃ 🤫</div>${(()=>{ const PL=qrLinkOf(u); return PL?`<div class="qrw">${qrSvgOf(PL,100)}<span>📱 <b>ស្កេន QR = ចូលភ្លាម</b><br>ឬបើក ${esc(location.host+location.pathname)}<br>វាយកូដថ្នាក់ <b class="code">${CC||''}</b></span></div>`:''; })()}</div>`; }).join('')}</div>`;
  const st=document.createElement('style'); st.textContent='@page{size:A4 portrait;margin:10mm}'; document.head.appendChild(st);
  document.body.classList.add('printing-cert'); const done=()=>{ st.remove(); document.body.classList.remove('printing-cert'); window.removeEventListener('afterprint',done); };
  window.addEventListener('afterprint',done); setTimeout(()=>{ window.print(); setTimeout(done,1500); },150);
}

/* ---------- admin panel ---------- */
let atab='users';
function renderAdmin(t){
  if(role()!=='admin'){ go('home'); return; }
  if(t) atab=t; setUnitColors(3);
  const tabs=[['users','👥 គណនី'],['students','🎓 គណនីសិស្ស'],['classes','🏫 ថ្នាក់ & គ្រូ'],['data','💾 ទិន្នន័យ'],['log','📜 កំណត់ហេតុ']];
  const n=r=>A.users.filter(u=>u.role===r&&!u.disabled).length;
  $('#main').innerHTML = `<div class="uhero"><div class="emo float" style="margin-left:0">🛡️</div><div><h2>ផ្ទាំង Admin</h2><div class="kmt">គ្រប់គ្រងគណនី ថ្នាក់ និងទិន្នន័យ</div><div class="pgs">🛡️ ${n('admin')} Admin • 👩‍🏫 ${n('teacher')} គ្រូ • 🎓 ${n('student')} សិស្ស</div></div></div>
    <div class="tabs">${tabs.map(x=>`<button class="${x[0]===atab?'on':''}" onclick="go('admin',null,'${x[0]}')">${x[1]}</button>`).join('')}</div><div id="adTab"></div>`;
  const D=classData(), el=document.getElementById('adTab');
  if(atab==='users'){
    const staff=A.users.filter(u=>u.role!=='student');
    el.innerHTML=`<div class="panel"><div class="row" style="justify-content:space-between"><h3 class="sec" style="margin:0">👥 គណនីគ្រូ និង Admin</h3><div class="row"><button class="btn teal" onclick="Auth.editUser(null,'teacher')">＋ គណនីគ្រូ</button><button class="btn ghost" onclick="Auth.editUser(null,'admin')">＋ Admin</button></div></div>
      <div class="au-grid">${staff.map(u=>`<div class="au-ucard ${u.disabled?'off':''}">${avatarFor(u,56)}<b>${esc(u.name)}</b><code>@${esc(u.username)}</code><span class="au-badge" style="background:${ROLE[u.role].c}">${ROLE[u.role].i} ${ROLE[u.role].km}</span>
        ${u.role==='teacher'?`<small>🏫 ${(D.classes||[]).filter(c=>c.owner===u.id||(u.classIds||[]).includes(c.id)).map(c=>esc(c.name)).join(', ')||'—'}</small>`:''}
        <small>ចូលចុងក្រោយ៖ ${u.last?new Date(u.last).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'}):'—'}</small>
        <div class="row" style="justify-content:center;gap:4px"><button class="btn ghost sm" title="QR ចូលប្រព័ន្ធ" onclick="Auth.showQR('${u.id}')">📱</button>${u.role==='teacher'?`<button class="btn ghost sm" title="ផ្ញើតំណចូល" onclick="Auth.invite('${u.id}')">✉️</button>`:''}<button class="btn ghost sm" onclick="Auth.editUser('${u.id}')">✎</button>${u.id!==user().id?`<button class="btn ghost sm" onclick="Auth._tg('${u.id}')">${u.disabled?'✅':'⛔'}</button><button class="btn ghost sm" onclick="Auth.delUser('${u.id}')">🗑</button>`:''}</div></div>`).join('')}</div></div>`;
  } else if(atab==='students'){
    const cs=D.classes||[]; el.innerHTML = cs.length ? cs.map(c=>accountsPanel(c)).join('<div style="height:14px"></div>') : `<div class="panel cl-empty"><p class="km">មិនទាន់មានថ្នាក់ — បង្កើតក្នុង 👥 ថ្នាក់រៀន</p></div>`;
  } else if(atab==='classes'){
    const teachers=A.users.filter(u=>u.role==='teacher'&&!u.disabled);
    el.innerHTML=`<div class="panel"><h3 class="sec">🏫 កំណត់គ្រូបន្ទុកថ្នាក់</h3><p class="note">គ្រូមើលឃើញតែថ្នាក់ដែលខ្លួនទទួលបន្ទុក។ ថ្នាក់ដែលគ្មានម្ចាស់ គ្រូទាំងអស់មើលឃើញ។</p>
      ${(D.classes||[]).map(c=>`<div class="au-crow"><b>🏫 ${esc(c.name)}</b><span class="note">${c.students.length} សិស្ស</span>
        <select class="cl-in" onchange="Auth._own('${c.id}',this.value)"><option value="">— គ្រប់គ្រូ (គ្មានម្ចាស់) —</option>${teachers.map(t=>`<option value="${t.id}" ${c.owner===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></div>`).join('')||'<p class="note">មិនទាន់មានថ្នាក់</p>'}</div>`;
  } else if(atab==='data'){
    const pre=window.Cloud?Cloud.panel():'';
    const keys=Object.keys(localStorage).filter(k=>k.startsWith('beginner-studio')); const kb=keys.reduce((a,k)=>a+(localStorage.getItem(k)||'').length,0)/1024;
    el.innerHTML=pre+`<div class="panel"><h3 class="sec">💾 Backup / Restore ទិន្នន័យទាំងមូល</h3><p class="km">រួមមាន៖ គណនី ថ្នាក់ សិស្ស រូបថត ពិន្ទុ ប្រឡង ចម្លើយគ្រូ វឌ្ឍនភាពសិស្ស និងការកំណត់ — ${keys.length} ផ្នែក • ${kb.toFixed(0)} KB</p>
      <div class="row"><button class="btn teal" onclick="Auth.backupAll()">⬇ Backup ទាំងអស់</button><label class="btn ghost">⬆ Restore ទាំងអស់<input type="file" accept=".json" hidden onchange="Auth.restoreAll(this.files[0])"></label></div>
      <p class="note" style="margin-top:12px">💡 សូម Backup យ៉ាងហោចណាស់ម្តងក្នុងមួយសប្តាហ៍ ហើយទុកក្នុង USB ឬ Google Drive។ ឯកសារ Backup មានព័ត៌មានសិស្ស — សូមរក្សាឱ្យមានសុវត្ថិភាព។</p></div>`;
  } else {
    el.innerHTML=`<div class="panel"><h3 class="sec">📜 កំណត់ហេតុសកម្មភាព (${A.log.length})</h3><div class="cl-tablewrap" style="max-height:60vh"><table class="cl-table"><thead><tr><th>ពេលវេលា</th><th class="l">អ្នកប្រើ</th><th>តួនាទី</th><th class="l">សកម្មភាព</th></tr></thead><tbody>
      ${A.log.map(l=>`<tr><td>${new Date(l.ts).toLocaleString('en-GB',{dateStyle:'short',timeStyle:'short'})}</td><td class="l">${esc(l.name)}</td><td>${l.role?ROLE[l.role].i:''}</td><td class="l km">${esc(l.ev)}</td></tr>`).join('')}</tbody></table></div></div>`;
  }
}
function editUser(id, r){
  const u=id?A.users.find(x=>x.id===id):{role:r, name:'', username:''};
  modal(`<h3>${id?'✎ កែគណនី':'＋ គណនី'+ROLE[u.role].km+'ថ្មី'}</h3>
    <label class="au-l">ឈ្មោះពេញ<input id="euN" class="cl-in" value="${esc(u.name)}"></label>
    <label class="au-l">Username<input id="euU" class="cl-in" value="${esc(u.username)}" autocomplete="off"></label>
    <label class="au-l">${id?'ពាក្យសម្ងាត់ថ្មី (ទុកទទេ = មិនប្តូរ)':'ពាក្យសម្ងាត់ (យ៉ាងតិច ៦ តួ)'}<input id="euP" type="text" class="cl-in" autocomplete="off"></label>
    ${u.role==='teacher'?`<div class="au-l">ថ្នាក់ទទួលបន្ទុក<div class="au-cls">${(classData().classes||[]).map(c=>`<label><input type="checkbox" value="${c.id}" ${(u.classIds||[]).includes(c.id)||c.owner===u.id&&id?'checked':''}> ${esc(c.name)}</label>`).join('')||'<span class="note">មិនទាន់មានថ្នាក់</span>'}</div></div>`:''}
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" onclick="closeModal()">បោះបង់</button><button class="btn teal" onclick="Auth._saveUser('${id||''}','${u.role}')">💾 រក្សាទុក</button></div>`);
}
async function _saveUser(id, r){
  const n=$('#euN').value.trim(), un=$('#euU').value.trim().toLowerCase(), p=$('#euP').value;
  if(!n) return toast('សូមបញ្ចូលឈ្មោះ'); if(!/^[a-z0-9._-]{3,}$/.test(un)) return toast('Username យ៉ាងតិច ៣ តួ (a-z 0-9 . _ -)');
  if(A.users.some(x=>x.username===un && x.id!==id)) return toast('Username នេះមានរួចហើយ');
  let u=id?A.users.find(x=>x.id===id):null;
  if(!u){ if(p.length<6) return toast('ពាក្យសម្ងាត់យ៉ាងតិច ៦ តួ'); u={id:uid(), role:r, created:Date.now()}; A.users.push(u); }
  u.name=n; u.username=un; if(p){ if(p.length<6) return toast('ពាក្យសម្ងាត់យ៉ាងតិច ៦ តួ'); await setPass(u,p); }
  if(r==='teacher') u.classIds=[...document.querySelectorAll('.au-cls input:checked')].map(x=>x.value);
  saveA(); log((id?'កែ':'បង្កើត')+'គណនី '+ROLE[r].km+': '+n); closeModal(); render(); toast('✅ បានរក្សាទុក');
  if(r==='teacher' && p) setTimeout(()=>teacherInvite(u, p), 300);
}
function teacherInvite(u, pass){
  const code=window.Cloud&&Cloud.code&&Cloud.code(), L=(code&&qrLinkOf(u))||location.href.split(/[?#]/)[0];
  const msg=`👩‍🏫 Beginner English Studio — គណនីគ្រូ\n\n🔗 តំណ៖ ${L}\n👤 Username៖ ${u.username}\n🔑 ពាក្យសម្ងាត់៖ ${pass||'(ស្នើ Admin)'}\n\nបើកតំណ → វាយ Username និងពាក្យសម្ងាត់ → ចូលប្រព័ន្ធ។ សូមប្តូរពាក្យសម្ងាត់ក្រោយចូលលើកដំបូង (ចុចឈ្មោះខាងស្តាំលើ → 🔑)។`;
  modal(`<h3>✉️ ផ្ញើព័ត៌មានចូលប្រព័ន្ធឱ្យ ${esc(u.name)}</h3>
    ${code&&window.Cloud?`<div style="display:flex;gap:16px;align-items:center;margin:8px 0"><div class="qr" style="width:140px">${qrSvgOf(L,140)}</div><div class="km">📱 គ្រូស្កេន QR នេះ ឬចុចតំណ → វាយ Username និងពាក្យសម្ងាត់</div></div>`:''}
    <textarea class="cl-in" style="width:100%;height:170px;box-sizing:border-box" readonly onclick="this.select()">${esc(msg)}</textarea>
    <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn ghost" onclick="closeModal()">បិទ</button>
      <a class="btn ghost" target="_blank" href="https://t.me/share/url?url=${encodeURIComponent(L)}&text=${encodeURIComponent(msg)}">✈️ Telegram</a>
      <button class="btn teal" onclick="navigator.clipboard.writeText(${JSON.stringify(msg).replace(/"/g,'&quot;')}).then(()=>toast('✅ បានចម្លង'))">📋 ចម្លងសារ</button></div>
    <p class="note">⚠️ ពាក្យសម្ងាត់បង្ហាញតែពេលនេះប៉ុណ្ណោះ។ បើភ្លេច Admin អាចកំណត់ថ្មីបាន (✎)។</p>`);
}
function delUser(id){ const u=A.users.find(x=>x.id===id); if(!confirm('លុបគណនី «'+u.name+'»?')) return; A.users=A.users.filter(x=>x.id!==id); saveA(); log('លុបគណនី: '+u.name); render(); }
function _own(cid, tid){ const D=classData(); const c=D.classes.find(x=>x.id===cid); if(tid) c.owner=tid; else delete c.owner; localStorage.setItem(CK, JSON.stringify(D)); log('កំណត់គ្រូបន្ទុក: '+c.name); toast('✅ រក្សាទុក'); setTimeout(()=>reload(),500); }
function backupAll(){ const o={}; Object.keys(localStorage).filter(k=>k.startsWith('beginner-studio')).forEach(k=>o[k]=localStorage.getItem(k)); const b=new Blob([JSON.stringify({app:'beginner-studio',v:1,ts:Date.now(),data:o})],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`beginner-studio-FULL-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); log('Backup ទាំងអស់'); }
function restoreAll(f){ if(!f) return; f.text().then(t=>{ const d=JSON.parse(t); if(d.app!=='beginner-studio'||!d.data) throw 0; if(!confirm('ជំនួសទិន្នន័យទាំងអស់ដោយ Backup នេះ? (ត្រូវចូលប្រព័ន្ធម្តងទៀត)')) return; Object.keys(localStorage).filter(k=>k.startsWith('beginner-studio')).forEach(k=>localStorage.removeItem(k)); Object.entries(d.data).forEach(([k,v])=>localStorage.setItem(k,v)); sessionStorage.removeItem(SK); reload(); }).catch(()=>toast('ឯកសារ Backup មិនត្រឹមត្រូវ')); }

window.Auth = { showQR, qrPng:id=>qrPng(A.users.find(x=>x.id===id)), qrLinkOf, invite:id=>teacherInvite(A.users.find(x=>x.id===id)), gate, user, role, progressKey, canSeeClass, headerChip, menu, logout, changePass, renderMe, renderAdmin, accountsPanel, printCards, avatarFor,
  editUser, delUser, backupAll, restoreAll, log, data:()=>A,
  _setup, _loginAs, _login, _pin, _recover, _doRecover, _cp, _mk, _rp, _tg, _own, _saveUser,
  _tab:r=>{ LS.tab=r; LS.stu=null; LS.pin=''; loginScreen(); }, _cls:id=>{ LS.cls=id; loginScreen(); }, _stu:id=>{ LS.stu=id; LS.pin=''; loginScreen(); } };
})();
