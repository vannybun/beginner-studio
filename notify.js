/* 🔔 Notifications & calls
   • inbox per class (Firestore live/inbox_<class>/m): teacher announcements (text • YouTube • file), new tasks,
     calls (📞 ring) and "friend passed a unit" news  • unit-opened alerts are worked out on the phone itself
   • phone notifications use the Notification API through the service worker — they appear while the app (or the
     installed app) is running, also in the background; a fully closed browser cannot receive them without a push server. */
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = s => document.querySelector(s);
const CK='beginner-studio-class-v1', MAXF=700*1024;
const L = () => window.Cloud && Cloud.live && Cloud.live.ok() ? Cloud.live : null;
const me = () => window.Auth && Auth.user();
const isStu = () => me() && me().role==='student';
const toast = t => (typeof window.toast==='function') && window.toast(t);
const av = (s,n) => window.Class&&Class._avatar ? Class._avatar(s,n) : '';
function classOf(cid){ try{ return (JSON.parse(localStorage.getItem(CK)||'{}').classes||[]).find(x=>x.id===cid); }catch(e){ return null; } }
function nameOf(uid){ const u=window.Auth&&Auth.data().users.find(x=>x.id===uid); if(!u) return '?'; if(u.role!=='student') return (u.role==='admin'?'🛡️ ':'👩‍🏫 ')+u.name; const c=classOf(u.classId), s=c&&c.students.find(x=>x.id===u.studentId); return (s&&s.name)||u.name; }
function studentObj(uid){ const u=window.Auth&&Auth.data().users.find(x=>x.id===uid); const c=u&&classOf(u.classId); return (c&&c.students.find(x=>x.id===u.studentId))||{name:u?u.name:'?'}; }
const ytId = u => { const m=String(u||'').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/); return m?m[1]:null; };
const when = ts => { const m=Math.round((Date.now()-ts)/60000); return m<1?'ឥឡូវ':m<60?m+' នាទីមុន':m<1440?Math.round(m/60)+' ម៉ោងមុន':new Date(ts).toLocaleDateString('en-GB'); };
const KIND = { ann:'📣', task:'📝', call:'📞', pass:'🎉', unit:'🔓' };

/* ---------- phone notification ---------- */
const canN = () => 'Notification' in window;
const perm = () => canN() ? Notification.permission : 'unsupported';
async function ask(){ if(!canN()) return toast('ទូរស័ព្ទ/កម្មវិធីរុករកនេះមិនគាំទ្រការជូនដំណឹង — សូមដំឡើងកម្មវិធី (📲) ឬបើកតាម Chrome');
  const r=await Notification.requestPermission(); toast(r==='granted'?'🔔 បានបើកការជូនដំណឹង!':'🔕 មិនបានអនុញ្ញាត — អាចបើកវិញក្នុង Settings របស់ Browser'); draw(); bellUI(); }
async function osNotify(title, body, tag, data){
  if(perm()!=='granted') return;
  const opt={ body, tag:tag||undefined, icon:'icons/icon-192.png', badge:'icons/icon-192.png', data:data||{}, vibrate:[200,100,200], renotify:!!tag };
  try{ const r=navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if(r){ await r.showNotification(title, opt); return; } }catch(e){}
  try{ new Notification(title, opt); }catch(e){}
}

/* ---------- inbox state ---------- */
const ST = { cid:null, items:[], unsub:null, ringing:null };
const seenKey = () => 'bs-ntf-seen:'+me().id, readKey = () => 'bs-ntf-read:'+me().id;
const getN = k => { try{ return +localStorage.getItem(k)||0; }catch(e){ return 0; } };
const setN = (k,v) => { try{ localStorage.setItem(k, v); }catch(e){} };
function mine(it){ const u=me(); if(!u) return false; if(it.from===u.id) return false;
  if(it.to==='*') return true; if(it.to===u.id) return true;
  if(it.to==='friends' && window.Chat && Chat.isFriend && Chat.isFriend(it.from)) return true; return false; }
function start(){
  const l=L(), u=me(); if(!l||!u||!isStu()) return; const cid=u.classId; if(ST.cid===cid) return;
  if(ST.unsub) ST.unsub(); ST.cid=cid; if(!getN(seenKey())) setN(seenKey(), Date.now());
  ST.unsub = l.watchCol(['inbox_'+cid,'m'], list=>{ if(!list) return; ST.items=list.filter(mine).sort((a,b)=>b.ts-a.ts);
    const seen=getN(seenKey()), fresh=ST.items.filter(i=>i.ts>seen && Date.now()-i.ts<6*3600e3);
    if(fresh.length){ setN(seenKey(), Math.max(...fresh.map(i=>i.ts))); fresh.slice(0,5).reverse().forEach(arrive); }
    bellUI(); draw(); }, 120);
  unitCheck(); setInterval(unitCheck, 5*60000);
}
function arrive(it){
  const t=title(it), b=it.x||'';
  if(it.kind==='call' && Date.now()-it.ts<60000) return ring(it);
  toast(t); osNotify(t, b, it.kind==='ann'?'ann-'+it.id:undefined, {go:'inbox'});
}
function title(it){ const n=nameOf(it.from);
  return it.kind==='ann'? `📣 ${it.t||'ដំណឹងពីគ្រូ'}` : it.kind==='task'? `📝 ${it.t}` : it.kind==='call'? `📞 ${n} កំពុងហៅអ្នក` : it.kind==='pass'? `🎉 ${n} ${it.t}` : (KIND[it.kind]||'🔔')+' '+(it.t||''); }

/* ---------- 🔓 unit-opened alerts (computed locally from the teacher's schedule / unlocks) ---------- */
function unitCheck(){ if(!isStu()||typeof window.unitOpen!=='function') return; const k='bs-ntf-units:'+me().id;
  let prev=null; try{ prev=JSON.parse(localStorage.getItem(k)||'null'); }catch(e){}
  const now=[...Array(NU())].map((_,i)=>i+1).filter(n=>unitOpen(n));
  if(prev){ now.filter(n=>!prev.includes(n)).forEach(n=>{ const t=`🔓 Unit ${n} បើកហើយ!`, b='ចុចដើម្បីចាប់ផ្តើមរៀនមេរៀនថ្មី 🚀'; toast(t); osNotify(t,b,'unit-'+n,{go:'units'}); }); }
  try{ localStorage.setItem(k, JSON.stringify(now)); }catch(e){}
}

/* ---------- post ---------- */
function post(cid, data){ const l=L(), u=me(); if(!l||!u||!cid) return Promise.resolve();
  return l.add(['inbox_'+cid,'m'], {to:'*', ...data, from:u.id, ts:Date.now()}).catch(e=>console.warn(e)); }
function task(cid, t, x){ return post(cid, {kind:'task', t, x:x||''}); }
function passed(n){ const u=me(); if(!isStu()||(Auth.asStaff&&Auth.asStaff())) return; post(u.classId, {to:'friends', kind:'pass', t:`បានឆ្លង Unit ${n}! 🏆`, x:'ចូលរួមអបអរសាទរ និងរៀនឱ្យទាន់គ្នា 💪'}); }

/* ---------- 📞 call ---------- */
let lastCall=0;
function call(uid){ const u=me(); if(!L()) return toast('📡 ត្រូវការ Internet'); if(isStu()&&Auth.asStaff&&Auth.asStaff()) return toast('👁 គ្រូកំពុងមើល — មិនអាចហៅជំនួសសិស្សបានទេ');
  if(Date.now()-lastCall<20000) return toast('សូមរង់ចាំបន្តិច មុនហៅម្តងទៀត'); lastCall=Date.now();
  const cid = isStu()? u.classId : (window.Class&&Class._cur()&&Class._cur().id);
  post(cid, {to:uid, kind:'call', t:'call', x:''}).then(()=>toast(`📞 កំពុងហៅ ${nameOf(uid)}…`)); }
let actx=null, ringT=null;
function beep(){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)(); const o=actx.createOscillator(), g=actx.createGain(); o.type='sine'; o.frequency.value=880; o.connect(g); g.connect(actx.destination);
  g.gain.setValueAtTime(.0001,actx.currentTime); g.gain.exponentialRampToValueAtTime(.3,actx.currentTime+.05); g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+.6); o.start(); o.stop(actx.currentTime+.65); }catch(e){} }
function ring(it){ stopRing(); ST.ringing=it; const n=nameOf(it.from);
  osNotify(`📞 ${n} កំពុងហៅអ្នក`, 'ចុចដើម្បីឆ្លើយ', 'call', {go:'call'});
  const w=document.createElement('div'); w.id='callWin'; w.className='call-win';
  const u=window.Auth&&Auth.data().users.find(x=>x.id===it.from), isT=u&&u.role!=='student';
  w.innerHTML=`<div class="call-card"><div class="call-av">${isT?'<span class="call-t">👩‍🏫</span>':av(studentObj(it.from),110)}</div><b>${esc(n)}</b><span>📞 កំពុងហៅអ្នក…</span>
    <div class="call-btns"><button class="call-no" onclick="Notify.decline()">✕<small>មិនទាន់</small></button><button class="call-ok" onclick="Notify.answer()">✓<small>ឆ្លើយ</small></button></div></div>`;
  document.body.appendChild(w); beep(); ringT=setInterval(beep,1400); if(navigator.vibrate) navigator.vibrate([400,200,400,200,400]);
  setTimeout(()=>{ if(ST.ringing===it) stopRing(); }, 30000);
}
function stopRing(){ clearInterval(ringT); ringT=null; const w=$('#callWin'); if(w) w.remove(); ST.ringing=null; }
function answer(){ const it=ST.ringing; stopRing(); if(!it) return; post(ST.cid, {to:it.from, kind:'ann', t:`✅ ${nameOf(me().id)} បានឆ្លើយការហៅរបស់អ្នក`, x:''});
  const u=window.Auth&&Auth.data().users.find(x=>x.id===it.from);
  if(u&&u.role==='student'&&window.Chat){ if(Chat.isFriend&&Chat.isFriend(it.from)) return Chat.open(it.from); go('chat'); toast('ផ្ញើសំណើមិត្ត ដើម្បីឆាតជាមួយគ្នា 🤝'); }
  else toast('👩‍🏫 គ្រូកំពុងរង់ចាំអ្នក — សូមទៅជួបគ្រូ ឬមើល 🔔 ដំណឹង'); }
function decline(){ const it=ST.ringing; stopRing(); if(it) post(ST.cid, {to:it.from, kind:'ann', t:`⏰ ${nameOf(me().id)} មិនទាន់អាចឆ្លើយបានទេ`, x:''}); }

/* ---------- 🔔 student inbox page + bell ---------- */
function unread(){ const r=getN(readKey()); return ST.items.filter(i=>i.ts>r && i.kind!=='call').length; }
function bellUI(){ const n=isStu()?unread():0; document.querySelectorAll('[data-ntf-badge]').forEach(b=>{ b.textContent=n||''; b.hidden=!n; }); }
let host=null;
function page(el){ host=el; start(); setN(readKey(), Date.now()); draw(); bellUI(); }
function itemHtml(it, staff){ const y=ytId(it.yt);
  return `<div class="nt-it k-${it.kind}"><div class="nt-h"><span class="nt-ic">${KIND[it.kind]||'🔔'}</span><div><b>${esc(staff?(it.t||''):title(it))}</b><small>${staff?'':esc(nameOf(it.from))+' • '}${when(it.ts)}</small></div>${staff?`<button class="btn ghost sm" onclick="Notify.del('${it.id}')">🗑</button>`:''}</div>
    ${it.x?`<p>${esc(it.x).replace(/\n/g,'<br>').replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>')}</p>`:''}
    ${y?`<div class="nt-yt"><iframe src="https://www.youtube-nocookie.com/embed/${y}" title="YouTube" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`:it.yt?`<a class="btn ghost sm" href="${esc(it.yt)}" target="_blank" rel="noopener">🔗 បើកតំណ</a>`:''}
    ${it.file?`<button class="nt-file" onclick="Notify.dl('${it.file.id}')"><span>📎</span><div><b>${esc(it.file.name)}</b><small>${Math.round(it.file.size/1024)} KB • ចុចដើម្បីទាញយក</small></div></button>`:''}</div>`; }
function draw(){
  if(!host||!document.body.contains(host)) return;
  const p=perm(), L0=L();
  host.innerHTML=`<div class="stu-head"><h2>🔔 ដំណឹង</h2></div>
    ${!L0?'<div class="panel cl-empty"><div class="em">📡</div><p class="km">ត្រូវការ Internet</p></div>':''}
    ${p!=='granted'?`<div class="nt-perm"><span>🔔</span><div><b>បើកការជូនដំណឹងលើទូរស័ព្ទ</b><small>ដឹងភ្លាមៗពេលគ្រូដាក់កិច្ចការ មេរៀនថ្មីបើក មិត្តហៅ ឬមិត្តឆ្លងកម្រិត</small></div>${p==='denied'?'<em>បានបិទក្នុង Browser</em>':p==='unsupported'?'<em>សូមដំឡើងកម្មវិធី 📲</em>':`<button class="btn teal sm" onclick="Notify.ask()">បើក</button>`}</div>`:''}
    <div class="nt-list">${ST.items.filter(i=>i.kind!=='call'||Date.now()-i.ts<864e5).map(i=>itemHtml(i,false)).join('') || '<div class="rk-empty"><div>📭</div><p>មិនទាន់មានដំណឹង</p></div>'}</div>`;
}
async function dl(fid){ const l=L(); if(!l) return; toast('⏳ កំពុងទាញយក…'); const cid=ST.cid||(Class._cur()&&Class._cur().id);
  const f=await l.get(['files_'+cid,'f',fid]); if(!f) return toast('❌ រកឯកសារមិនឃើញ (ប្រហែលត្រូវបានលុប)');
  const a=document.createElement('a'); a.href=f.data; a.download=f.name; document.body.appendChild(a); a.click(); a.remove(); }

/* ---------- 📣 teacher tab ---------- */
let T={host:null,c:null,list:[],unsub:null,file:null};
function teacherTab(el, c){ T.host=el; T.c=c; const l=L();
  if(!l){ el.innerHTML='<div class="panel cl-empty"><div class="em">📡</div><p class="km">ត្រូវភ្ជាប់ Cloud (Website) ដើម្បីផ្ញើដំណឹង</p></div>'; return; }
  if(T.cid!==c.id){ if(T.unsub) T.unsub(); T.cid=c.id; T.list=[]; T.unsub=l.watchCol(['inbox_'+c.id,'m'], list=>{ T.list=(list||[]).filter(i=>i.kind==='ann'||i.kind==='task').sort((a,b)=>b.ts-a.ts); tdraw(); }, 100); }
  tdraw(); }
function tdraw(){ const el=T.host, c=T.c; if(!el||!document.body.contains(el)) return; const D=window.Auth?Auth.data().users.filter(u=>u.role==='student'&&u.classId===c.id&&!u.disabled):[];
  const keep=id=>{ const e=document.getElementById(id); return e?e.value:''; }, v={t:keep('ntT'),x:keep('ntX'),yt:keep('ntY'),to:keep('ntTo')||'*'};
  el.innerHTML=`<div class="panel"><h3 class="sec" style="margin:0 0 8px">📣 ផ្ញើដំណឹងទៅសិស្ស</h3>
    <div class="nt-form">
      <label>ផ្ញើទៅ<select id="ntTo" class="cl-in"><option value="*">👥 សិស្សទាំងអស់ក្នុង ${esc(c.name)}</option>${D.map(u=>`<option value="${u.id}" ${v.to===u.id?'selected':''}>👤 ${esc(nameOf(u.id))}</option>`).join('')}</select></label>
      <label>ចំណងជើង<input id="ntT" class="cl-in" maxlength="80" placeholder="ឧ. ថ្ងៃស្អែកប្រឡង Unit 3" value="${esc(v.t)}"></label>
      <label>សារ<textarea id="ntX" class="cl-in" rows="3" maxlength="1000" placeholder="សរសេរព័ត៌មាន ឬកិច្ចការ…">${esc(v.x)}</textarea></label>
      <label>🎬 តំណ YouTube ឬតំណផ្សេង (ស្រេចចិត្ត)<input id="ntY" class="cl-in" placeholder="https://youtu.be/…" value="${esc(v.yt)}"></label>
      <div class="row" style="gap:8px;align-items:center"><label class="btn ghost sm">📎 ភ្ជាប់ឯកសារ (≤700KB)<input type="file" hidden onchange="Notify._file(this.files[0])"></label><span class="note" id="ntF">${T.file?`📎 ${esc(T.file.name)} (${Math.round(T.file.size/1024)} KB) <a href="#" onclick="Notify._file(null);return false">✕</a>`:'PDF រូបភាព Word សំឡេងខ្លី…'}</span>
        <span class="grow"></span><button class="btn teal" onclick="Notify._send()">📨 ផ្ញើ</button></div>
    </div></div>
    <div class="panel"><h3 class="sec" style="margin:0 0 8px">📞 ហៅសិស្ស</h3><p class="note">ទូរស័ព្ទសិស្សនឹងរោទ៍ និងបង្ហាញ «គ្រូកំពុងហៅអ្នក»</p>
      <div class="nt-calls">${D.map(u=>`<button onclick="Notify.call('${u.id}')">${av(studentObj(u.id),34)}<span>${esc(nameOf(u.id))}</span><b>📞</b></button>`).join('')||'<p class="note">មិនទាន់មានគណនីសិស្ស</p>'}</div></div>
    <div class="panel"><h3 class="sec" style="margin:0 0 8px">🗂 ដំណឹងដែលបានផ្ញើ (${T.list.length})</h3><div class="nt-list">${T.list.map(i=>itemHtml({...i,t:(i.to==='*'?'👥 ':'👤 '+nameOf(i.to)+' • ')+(i.t||'')},true)).join('')||'<p class="note">មិនទាន់មាន</p>'}</div></div>`;
}
function pickFile(f){ if(!f){ T.file=null; return tdraw(); } if(f.size>MAXF) return toast('❌ ឯកសារធំពេក — អតិបរមា 700KB (សូមបង្រួម ឬដាក់ជាតំណ Google Drive)');
  const r=new FileReader(); r.onload=()=>{ T.file={name:f.name, type:f.type, size:f.size, data:r.result}; tdraw(); }; r.readAsDataURL(f); }
async function sendAnn(){ const l=L(), c=T.c; const t=$('#ntT').value.trim(), x=$('#ntX').value.trim(), yt=$('#ntY').value.trim(), to=$('#ntTo').value;
  if(!t && !x && !yt && !T.file) return toast('សូមសរសេរចំណងជើង ឬសារ');
  let file=null; if(T.file){ const id=Math.random().toString(36).slice(2,12); await l.set(['files_'+c.id,'f',id], {name:T.file.name, type:T.file.type, data:T.file.data, ts:Date.now()}); file={id, name:T.file.name, size:T.file.size}; }
  await post(c.id, {to, kind:'ann', t:t||'📣 ដំណឹងពីគ្រូ', x, yt:yt||'', file});
  T.file=null; ['ntT','ntX','ntY'].forEach(i=>{ const e=document.getElementById(i); if(e) e.value=''; }); toast('✅ បានផ្ញើដំណឹង'); tdraw(); }
function del(id){ if(!confirm('លុបដំណឹងនេះ?')) return; const it=T.list.find(x=>x.id===id); L().rm(['inbox_'+T.c.id,'m',id]); if(it&&it.file) L().rm(['files_'+T.c.id,'f',it.file.id]); }

/* open the right page when a phone notification is tapped */
if(navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', e=>{ const g=e.data&&e.data.go; if(!g) return; if(g==='call'){ return; } if(window.go) go(g==='inbox'?'inbox':g); });
if(/[?&]n=/.test(location.search)){ setTimeout(()=>{ const g=new URLSearchParams(location.search).get('n'); if(window.go&&isStu()) go(g==='inbox'?'inbox':g); }, 1500); }

window.Notify={ start, page, ask, perm, post, task, passed, call, answer, decline, dl, del, unread, bellUI, teacherTab, _file:pickFile, _send:sendAnn };
})();
