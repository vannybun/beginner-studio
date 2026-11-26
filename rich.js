// =====================================================================
//  rich.js — 💼 ឱកាសក្លាយជាសេដ្ឋី (សិស្សប្រុស) • 👑 ឱកាសក្លាយជាជំទាវ (សិស្សស្រី)
//  លំហាត់បន្ថែមតាម Unit: សំណួរនិយាយ ១០ ជាន់ (ពិនិត្យសំឡេងភ្លាមៗ) — ឡើងជាន់ទទួលលុយ
//  • ជាន់នីមួយៗបង់លុយតែម្តង/Unit (សរុប 10,000៛) • លេងឈ្នះម្តងទៀតនៅថ្ងៃក្រោយ +1,000៛/ថ្ងៃ
//  • ទិន្នន័យ: S.rich[n] = {best, plays, wins}
// =====================================================================
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = s => document.querySelector(s);
const CUM = [200,500,900,1400,2000,2800,3800,5000,7000,10000];
const PLAN = ['say','say','say','repeat','repeat','repeat','read','read','long','final'];
const MODE_KM = {say:'🗣 មើលន័យ ហើយនិយាយជាអង់គ្លេស', repeat:'🎧 ស្តាប់ ហើយនិយាយតាម', read:'📖 អានឱ្យឮៗ', long:'🎧 ប្រយោគវែង — ស្តាប់ ហើយនិយាយតាម', final:'🏆 សំណួរចុងក្រោយ — បកប្រែជាអង់គ្លេសដោយនិយាយ'};
const R = n => { S.rich=S.rich||{}; return S.rich[n]=S.rich[n]||{best:0, plays:0, wins:0}; };
const isStu = () => window.Auth && Auth.role()==='student' && !(Auth.asStaff&&Auth.asStaff());

/* ---------- who am I: boy → សេដ្ឋី • girl → ជំទាវ ---------- */
function gender(){ try{ const me=Auth.user(); if(!me||me.role!=='student') return '';
  const c=(JSON.parse(localStorage.getItem('beginner-studio-class-v1')||'{}').classes||[]).find(x=>x.id===me.classId), s=c&&c.students.find(x=>x.id===me.studentId); return (s&&s.g)||''; }catch(e){ return ''; } }
function T(){ const g=gender();
  if(g==='M') return {ic:'💼', name:'ឱកាសក្លាយជាសេដ្ឋី', who:'សេដ្ឋី', tab:'💼 សេដ្ឋី'};
  if(g==='F') return {ic:'👑', name:'ឱកាសក្លាយជាជំទាវ', who:'ជំទាវ', tab:'👑 ជំទាវ'};
  return {ic:'💰', name:'ឱកាសក្លាយជាសេដ្ឋី • ជំទាវ', who:'សេដ្ឋី/ជំទាវ', tab:'💰 សេដ្ឋី/ជំទាវ'}; }
const riel = n => (window.RIEL?RIEL(n):n+'៛');

/* ---------- questions ---------- */
function question(n, k, used){
  const B=Voice.pool(n), fresh=a=>a.filter(x=>!used.has(x.text.toLowerCase())), m=PLAN[k];
  const long=fresh(B.S).concat(fresh(B.P)).filter(x=>x.text.split(' ').length>=5);
  let x, mode=m;
  if(m==='say') x=fresh(B.W)[0];
  else if(m==='repeat') x=fresh(B.P.filter(p=>p.text.split(' ').length<=5))[0]||fresh(B.P)[0];
  else if(m==='read') x=fresh(B.S)[0]||fresh(B.P)[0];
  else if(m==='long'){ x=long[0]; mode='repeat'; }
  else { x=fresh(B.P.filter(p=>p.km))[0]; mode='say'; if(!x){ x=long[0]||fresh(B.S)[0]; mode='read'; } }
  x = x || fresh(B.P)[0] || fresh(B.S)[0] || fresh(B.W)[0]; if(!x) return null;
  if(mode==='say' && !x.km) mode='read';
  used.add(x.text.toLowerCase()); return {...x, mode, kind:m};
}

/* ---------- start screen ---------- */
let G=null;
function tab(u){ const el=$('#tab'); if(!el) return; Voice.stop(); G=null;
  const t=T(), r=R(u.n), staff=!isStu();
  el.innerHTML=`<div class="rich">
    <div class="rich-hero"><div class="rich-ic">${t.ic}</div><div><h2>${t.name}</h2>
      <p>Unit ${u.n} • ឆ្លើយសំណួរ <b>និយាយ</b> ១០ ជាន់ — ឡើងដល់ជាន់ទី ១០ ដើម្បីទទួល <b>${riel(CUM[9])}</b></p>
      ${staff?`<p class="rich-pv">👀 គ្រូ/មើលជាសិស្ស — សាកលេងបាន ប៉ុន្តែមិនរាប់លុយ • សិស្សប្រុសឃើញ «💼 ឱកាសក្លាយជាសេដ្ឋី» • សិស្សស្រីឃើញ «👑 ឱកាសក្លាយជាជំទាវ»</p>`:''}</div></div>
    <div class="rich-body">
      <div class="rich-ladder">${CUM.map((v,i)=>i).reverse().map(i=>`<div class="${i<r.best?'got':''} ${i===4||i===9?'safe':''}"><span>${i+1}</span><b>${riel(CUM[i])}</b>${i<r.best?'<i>✓</i>':''}</div>`).join('')}</div>
      <div class="rich-info">
        <div class="rich-me"><div><b>${r.best}/10</b><small>ជាន់ខ្ពស់បំផុត</small></div><div><b>${riel(r.best?CUM[r.best-1]:0)}</b><small>លុយបានពីទីនេះ</small></div><div><b>${r.wins||0}</b><small>ដងឈ្នះ</small></div></div>
        <h4>📜 ច្បាប់លេង</h4>
        <ul class="rich-rules"><li>🎤 សំណួរនីមួយៗ ត្រូវ<b>និយាយ</b>ចូលមេក្រូ — កម្មវិធីពិនិត្យភ្លាមៗ</li>
          <li>❤️ សំណួរនីមួយៗ សាកបាន <b>៣ ដង</b> • ខុសទាំង ៣ ដង = ចប់ហ្គេម (លុយដែលបានរួច មិនបាត់ទេ)</li>
          <li>💰 ជាន់ថ្មីដែលឡើងដល់លើកដំបូង ទទួលលុយភ្លាម • សរុប ${riel(CUM[9])} ក្នុងមួយ Unit</li>
          <li>🔁 ឈ្នះ ១០ ជាន់ម្តងទៀតនៅថ្ងៃក្រោយ ទទួល <b>+1,000៛</b>/ថ្ងៃ</li>
          <li>🛟 ជំនួយ៖ 🔊 ស្តាប់គំរូ (២ ដង) • 🔄 ប្តូរសំណួរ (១ ដង)</li></ul>
        ${Voice.ok()?`<div class="row" style="gap:8px"><button class="btn sun xl" onclick="Rich.start(${u.n})">▶ ចាប់ផ្តើមលេង</button><button class="btn ghost" onclick="Rich.mic()">🎤 សាកមេក្រូ</button></div>`
          :`<div class="vc-msg warn">⚠️ ឧបករណ៍/កម្មវិធីរុករកនេះមិនស្គាល់សំឡេងទេ — សូមបើកក្នុង <b>Google Chrome</b> (Android/កុំព្យូទ័រ) ឬ <b>Safari</b> (iPhone) ហើយភ្ជាប់អ៊ីនធឺណិត ដើម្បីលេង</div>`}
      </div></div></div>`;
}
async function mic(){ const ok=await Voice.mic(); if(ok===true) toast('✅ មេក្រូដំណើរការ — ចុច ▶ ចាប់ផ្តើមលេង');
  else modal(`<h3>🎤 មេក្រូត្រូវបានបិទ</h3>${Voice.card('richmic',{mode:'read',text:'Hello',noSkip:true},()=>{})}`); }

/* ---------- the game ---------- */
function start(n){ R(n).plays=(R(n).plays||0)+1; save(); G={n, k:0, used:new Set(), life:{hear:2, swap:1}, wasWin:(R(n).best||0)>=10}; G.q=question(n,0,G.used); draw(); }
function draw(note){
  const el=$('#tab'); if(!el||!G) return; const t=T(), q=G.q, k=G.k;
  if(!q){ el.innerHTML='<div class="stu-empty"><p>Unit នេះមិនទាន់មានសំណួរនិយាយគ្រប់គ្រាន់ទេ</p></div>'; return; }
  const id='rc'+G.n+'_'+k+'_'+Date.now()%1e5; G.id=id;
  el.innerHTML=`<div class="rich play">
    <div class="rich-top"><button class="btn ghost sm" onclick="Rich.quit()">✕</button><div class="rich-step">${t.ic} ជាន់ទី <b>${k+1}</b>/10</div><div class="rich-prize">💰 ${riel(CUM[k])}</div></div>
    <div class="rich-dots">${CUM.map((_,i)=>`<i class="${i<k?'ok':i===k?'cur':''}"></i>`).join('')}</div>
    <div class="rich-q"><div class="rich-mode">${MODE_KM[q.kind]}</div>
      ${Voice.card(id, {...q, noSkip:true}, res)}
      <div class="rich-tries" id="rcLife">${'❤️'.repeat(3)}</div>
      <div class="rich-help">
        ${q.mode!=='repeat'?`<button class="btn ghost sm" ${G.life.hear?'':'disabled'} onclick="Rich.hear()">🔊 ស្តាប់គំរូ (${G.life.hear})</button>`:''}
        <button class="btn ghost sm" ${G.life.swap?'':'disabled'} onclick="Rich.swap()">🔄 ប្តូរសំណួរ (${G.life.swap})</button></div>
      ${note?`<div class="vc-msg">${note}</div>`:''}</div></div>`;
}
function res(r){ if(!G) return; const left=3-r.tries;
  if(r.pass){ const k=G.k, n=G.n, rr=R(n); let got=0;
    if(k+1>(rr.best||0)){ rr.best=k+1; save(); if(isStu()&&window.earn) got=earn(`rich:${n}:${k+1}`, CUM[k]-(k?CUM[k-1]:0), `${T().ic} ${T().who} Unit ${n} • ជាន់ ${k+1}`); }
    if(k===9) return setTimeout(()=>win(got),900);
    const box=document.querySelector('.rich-q'); if(box) box.insertAdjacentHTML('beforeend',`<div class="rich-ok"><b>✅ ត្រឹមត្រូវ!</b>${got?` <span>+${riel(got)}</span>`:''}<button class="btn sun" onclick="Rich.next()">▶ ជាន់ទី ${k+2}</button></div>`);
    if(typeof beep==='function') beep(true); return; }
  const l=$('#rcLife'); if(l) l.innerHTML='❤️'.repeat(Math.max(0,left))+'🤍'.repeat(Math.min(3,r.tries));
  if(left<=0) setTimeout(over,1600);
}
function next(){ if(!G) return; G.k++; G.q=question(G.n,G.k,G.used); draw(); }
function hear(){ if(!G||!G.life.hear) return; G.life.hear--; speak(G.q.text); Voice.reveal(G.id); const b=[...document.querySelectorAll('.rich-help button')][0]; if(b){ b.textContent=`🔊 ស្តាប់គំរូ (${G.life.hear})`; if(!G.life.hear) b.disabled=true; } }
function swap(){ if(!G||!G.life.swap) return; G.life.swap--; Voice.stop(); G.q=question(G.n,G.k,G.used); draw('🔄 បានប្តូរសំណួរ'); }
function over(){ if(!G) return; const n=G.n, k=G.k, t=T(); Voice.stop();
  $('#tab').innerHTML=`<div class="rich end"><div class="rich-big">😮</div><h2>ឈប់នៅជាន់ទី ${k}</h2>
    <p>ចម្លើយ៖ <b>${esc(G.q.text)}</b> <button class="vc-say" onclick="speak(${JSON.stringify(G.q.text).replace(/"/g,'&quot;')})">🔊</button></p>
    <p class="note">លុយដែលបានរួច មិនបាត់ទេ 💰 • ហាត់និយាយបន្ថែម ហើយលេងម្តងទៀត ដើម្បីក្លាយជា${t.who}!</p>
    <div class="row" style="justify-content:center"><button class="btn sun" onclick="Rich.start(${n})">↺ លេងម្តងទៀត</button><button class="btn ghost" onclick="Rich.tab(U(${n}))">🏠 ទំព័រហ្គេម</button></div></div>`; G=null; }
function win(got){ const n=G.n, t=T(), rr=R(n); rr.wins=(rr.wins||0)+1; save(); let bonus=0;
  if(G.wasWin && isStu() && window.earn) bonus=earn(`richday:${n}:${typeof dayKey==='function'?dayKey():new Date().toISOString().slice(0,10)}`, 1000, `${t.ic} ឈ្នះ ${t.who} Unit ${n} ម្តងទៀត`);
  if(!G.wasWin && isStu() && window.Notify && Notify.post){ try{ const me=Auth.user(); Notify.post(me.classId,{to:'friends', kind:'pass', t:`${t.ic} បានក្លាយជា${t.who} Unit ${n}! 💰`, x:'លេង «'+t.name+'» ដើម្បីក្លាយជាអ្នកមានដូចគ្នា 🎤'}); }catch(e){} }
  $('#tab').innerHTML=`<div class="rich end win"><div class="rich-big">${t.ic}</div><h2>🎉 អបអរសាទរ! អ្នកបានក្លាយជា${t.who} Unit ${n}!</h2>
    <p>អ្នកនិយាយបានត្រឹមត្រូវទាំង ១០ ជាន់ ${got||bonus?`• <b>+${riel(got+bonus)}</b>`:G.wasWin?'• ថ្ងៃនេះបានទទួលរង្វាន់រួចហើយ':''}</p>
    <div class="row" style="justify-content:center"><button class="btn sun" onclick="Rich.start(${n})">↺ លេងម្តងទៀត</button>${n<14?`<button class="btn ghost" onclick="go('unit',${n+1},'rich')">Unit ${n+1} ▶</button>`:''}</div></div>`;
  if(window.pageConfetti) pageConfetti(); G=null; }
function quit(){ if(G&&G.k>0&&!confirm('ចេញពីហ្គេម? (លុយដែលបានរួចមិនបាត់)')) return; const n=G?G.n:null; Voice.stop(); G=null; if(n) tab(U(n)); }

window.Rich = { tab, start, next, hear, swap, quit, mic, label:()=>T().tab, title:()=>T().name };
})();
