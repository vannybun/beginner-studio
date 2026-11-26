/* 💬 Friends & chat for classmates — online status • add friend • 1-to-1 chat (realtime, Firestore "live").
   Safety: only classmates in the same class • chat only between accepted friends • the teacher/Admin can read every
   conversation, delete messages and switch chat off for the class • students can report a message. */
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = s => document.querySelector(s);
const CK='beginner-studio-class-v1', ONLINE=150000;
const L = () => window.Cloud && Cloud.live && Cloud.live.ok() ? Cloud.live : null;
const me = () => window.Auth && Auth.user();
const isStu = () => me() && me().role==='student';
const pairId = (a,b) => [a,b].sort().join('_');
const toast = t => (typeof window.toast==='function') && window.toast(t);
function classOf(cid){ try{ return (JSON.parse(localStorage.getItem(CK)||'{}').classes||[]).find(x=>x.id===cid); }catch(e){ return null; } }
function myClassId(){ const u=me(); if(!u) return null; if(u.role==='student') return u.classId; return window.Class&&Class._cur()&&Class._cur().id; }
function mates(cid){ const c=classOf(cid); if(!c||!window.Auth) return [];
  return Auth.data().users.filter(u=>u.role==='student'&&u.classId===cid&&!u.disabled).map(u=>{ const s=c.students.find(x=>x.id===u.studentId)||{name:u.name}; return {uid:u.id, s, name:s.name||u.name}; }); }
const chatAllowed = cid => { const c=classOf(cid); return !(c&&c.chat===false); };
const av = (s,n) => window.Class&&Class._avatar ? Class._avatar(s,n) : '';
const ago = ts => { const m=Math.round((Date.now()-ts)/60000); return m<1?'ឥឡូវ':m<60?m+' នាទីមុន':m<1440?Math.round(m/60)+' ម៉ោងមុន':Math.round(m/1440)+' ថ្ងៃមុន'; };
const hm = ts => { const d=new Date(ts); return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0'); };

/* ---------- live state ---------- */
const ST = { cid:null, pres:{}, soc:{req:{},fr:{}}, convs:{}, unsub:[], msgs:null, msgUnsub:null, open:null, tab:'mates' };
function start(){
  const l=L(), u=me(); if(!l||!u) return; const cid=myClassId(); if(!cid||cid===ST.cid) return;
  stop(); ST.cid=cid;
  ST.unsub.push(l.watch(['pres_'+cid], d=>{ ST.pres=d||{}; redraw(); }));
  ST.unsub.push(l.watch(['soc_'+cid], d=>{ ST.soc={req:(d&&d.req)||{}, fr:(d&&d.fr)||{}}; redraw(); badge(); }));
  ST.unsub.push(l.watchCol(['chat_'+cid,'c'], list=>{ ST.convs={}; (list||[]).forEach(c=>ST.convs[c.id]=c); redraw(); badge(); }, 300));
  if(isStu()) beat();
}
function stop(){ ST.unsub.forEach(f=>{ try{f();}catch(e){} }); ST.unsub=[]; ST.cid=null; if(ST.msgUnsub){ ST.msgUnsub(); ST.msgUnsub=null; } }
function beat(){ const l=L(), u=me(); if(!l||!u||!isStu()||(Auth.asStaff&&Auth.asStaff())||document.visibilityState!=='visible') return; l.merge(['pres_'+u.classId], {[u.id]:Date.now()}); }
setInterval(beat, 60000); document.addEventListener('visibilitychange', beat);
const online = uid => Date.now()-(ST.pres[uid]||0) < ONLINE;
function rel(uid){ const m=me().id, k=pairId(m,uid);
  if(ST.soc.fr[k]) return 'friend'; if(ST.soc.req[m+'>'+uid]) return 'sent'; if(ST.soc.req[uid+'>'+m]) return 'incoming'; return 'none'; }
function lastRead(conv){ try{ return +localStorage.getItem('bs-chat-read:'+me().id+':'+conv)||0; }catch(e){ return 0; } }
function setRead(conv){ try{ localStorage.setItem('bs-chat-read:'+me().id+':'+conv, Date.now()); }catch(e){} }
function unread(){ const u=me(); if(!u||!isStu()) return 0; let n=0;
  Object.values(ST.convs).forEach(c=>{ if((c.m||[]).includes(u.id) && c.last && c.last.f!==u.id && c.ts>lastRead(c.id)) n++; });
  n += Object.keys(ST.soc.req).filter(k=>k.endsWith('>'+u.id)).length; return n; }
function badge(){ const n=unread(); document.querySelectorAll('[data-chat-badge]').forEach(b=>{ b.textContent=n||''; b.hidden=!n; }); }

/* ---------- actions ---------- */
function addFriend(uid){ const l=L(), u=me(); if(!l) return; if(Auth.asStaff&&Auth.asStaff()) return toast('👁 គ្រូកំពុងមើល'); if(rel(uid)==='incoming') return accept(uid);
  l.merge(['soc_'+ST.cid], {req:{[u.id+'>'+uid]:Date.now()}}).then(()=>toast('📨 បានផ្ញើសំណើសុំធ្វើជាមិត្ត')); }
function accept(uid){ const l=L(), u=me(); l.merge(['soc_'+ST.cid], {fr:{[pairId(u.id,uid)]:Date.now()}}).then(()=>{ l.del(['soc_'+ST.cid],'req.'+uid+'>'+u.id); toast('🤝 ឥឡូវអ្នកជាមិត្តភក្តិហើយ!'); }); }
function decline(uid){ const u=me(); L().del(['soc_'+ST.cid],'req.'+uid+'>'+u.id); }
function cancel(uid){ const u=me(); L().del(['soc_'+ST.cid],'req.'+u.id+'>'+uid); }
function unfriend(uid){ if(!confirm('លុបចេញពីមិត្តភក្តិ?')) return; L().del(['soc_'+ST.cid],'fr.'+pairId(me().id,uid)); closeChat(); }

/* ---------- student page ---------- */
let host=null;
function page(el){ host=el; start(); draw(); }
function redraw(){ if(ST.open) drawMsgs(); else if(host && document.body.contains(host)) draw(); else if(ST.tHost && document.body.contains(ST.tHost) && ST.tCls) teacherTab(ST.tHost, ST.tCls); }
function draw(){
  if(!host) return; const u=me(), cid=ST.cid, l=L();
  if(!l){ host.innerHTML=`<div class="stu-head"><h2>💬 មិត្តភក្តិ</h2></div><div class="panel cl-empty"><div class="em">📡</div><p class="km">មុខងារនេះត្រូវការ Internet (Cloud)</p></div>`; return; }
  if(!chatAllowed(cid)){ host.innerHTML=`<div class="stu-head"><h2>💬 មិត្តភក្តិ</h2></div><div class="panel cl-empty"><div class="em">🔕</div><p class="km">គ្រូបានបិទមុខងារមិត្តភក្តិ និងឆាតសម្រាប់ថ្នាក់នេះ</p></div>`; return; }
  const M=mates(cid).filter(m=>m.uid!==u.id).sort((a,b)=>(online(b.uid)-online(a.uid))||a.name.localeCompare(b.name));
  const inc=M.filter(m=>rel(m.uid)==='incoming'), fr=M.filter(m=>rel(m.uid)==='friend');
  const onN=M.filter(m=>online(m.uid)).length;
  const row=m=>{ const r=rel(m.uid), on=online(m.uid);
    const btn = r==='friend'?`<button class="btn teal sm" onclick="Chat.open('${m.uid}')">💬 ឆាត</button>`
      : r==='sent'?`<button class="btn ghost sm" onclick="Chat.cancel('${m.uid}')">⏳ បានស្នើ</button>`
      : r==='incoming'?`<button class="btn sun sm" onclick="Chat.accept('${m.uid}')">✅ ទទួល</button><button class="btn ghost sm" onclick="Chat.decline('${m.uid}')">✕</button>`
      : `<button class="btn ghost sm" onclick="Chat.add('${m.uid}')">➕ Add Friend</button>`;
    const callB = window.Notify ? `<button class="btn ghost sm ch-call" title="ហៅ" onclick="Notify.call('${m.uid}')">📞</button>` : '';
    return `<div class="ch-row"><span class="ch-av ${on?'on':''}">${av(m.s,44)}</span><span class="ch-nm"><b>${esc(m.name)}</b><small>${on?'🟢 Online':ST.pres[m.uid]?'⚪ '+ago(ST.pres[m.uid]):'⚪ Offline'}${r==='friend'?' • 🤝 មិត្ត':''}</small></span><span class="ch-act">${btn}${callB}</span></div>`; };
  const convRow=m=>{ const k=pairId(u.id,m.uid), c=ST.convs[k], un=c&&c.last&&c.last.f!==u.id&&c.ts>lastRead(k);
    return `<button class="ch-row conv ${un?'unread':''}" onclick="Chat.open('${m.uid}')"><span class="ch-av ${online(m.uid)?'on':''}">${av(m.s,44)}</span><span class="ch-nm"><b>${esc(m.name)}</b><small>${c&&c.last?esc((c.last.f===u.id?'អ្នក៖ ':'')+c.last.x).slice(0,60):'ចាប់ផ្តើមឆាត 👋'}</small></span><span class="ch-tm">${c?ago(c.ts):''}${un?'<i></i>':''}</span></button>`; };
  host.innerHTML=`<div class="stu-head"><h2>💬 មិត្តភក្តិ</h2><span class="ch-online">🟢 ${onN} Online</span></div>
    <div class="ch-safe">🛡️ គ្រូអាចមើលឃើញការឆាតទាំងអស់ — សូមនិយាយគួរសម និងជួយគ្នារៀន 😊</div>
    ${inc.length?`<div class="ch-inc"><b>📨 សំណើធ្វើជាមិត្ត (${inc.length})</b>${inc.map(row).join('')}</div>`:''}
    <div class="rk-tabs"><button class="${ST.tab==='mates'?'on':''}" onclick="Chat.tab('mates')">👥 មិត្តរួមថ្នាក់ (${M.length})</button><button class="${ST.tab==='chats'?'on':''}" onclick="Chat.tab('chats')">💬 ឆាត (${fr.length})</button></div>
    <div class="ch-list">${ST.tab==='chats' ? (fr.length? fr.sort((a,b)=>((ST.convs[pairId(u.id,b.uid)]||{}).ts||0)-((ST.convs[pairId(u.id,a.uid)]||{}).ts||0)).map(convRow).join('') : `<div class="rk-empty"><div>🤝</div><p>មិនទាន់មានមិត្ត — ចុច ➕ Add Friend នៅផ្ទាំង 👥 មិត្តរួមថ្នាក់</p></div>`) : M.map(row).join('')}</div>`;
  badge();
}

/* ---------- chat window (student or teacher read-only) ---------- */
const STICK=['👍','😀','😂','🥰','👏','🙏','💪','🎉','❤️','📚','✅','🤔'];
function open(uid, conv){
  const l=L(); if(!l) return; const u=me(), cid=ST.cid||myClassId();
  const k = conv || pairId(u.id,uid), other = uid ? mates(cid).find(m=>m.uid===uid) : null;
  if(!conv && rel(uid)!=='friend') return toast('ត្រូវជាមិត្តភក្តិជាមុនសិន');
  ST.open={k, uid, cid, other, ro:!!conv && !isStu()};
  if(ST.msgUnsub) ST.msgUnsub(); ST.msgs=null;
  const w=document.createElement('div'); w.id='chatWin'; w.className='ch-win'; document.body.appendChild(w);
  const ttl = other ? `${av(other.s,36)}<span><b>${esc(other.name)}</b><small>${online(uid)?'🟢 Online':'⚪ Offline'}</small></span>` : `<span><b>👀 ${esc(convTitle(cid,k))}</b><small>មើលជាគ្រូ (Read-only)</small></span>`;
  w.innerHTML=`<div class="ch-top"><button onclick="Chat.close()">‹</button>${ttl}<span class="grow"></span>${other&&isStu()&&window.Notify?`<button title="ហៅ" onclick="Notify.call('${uid}')">📞</button>`:''}${other&&isStu()?`<button title="លុបមិត្ត" onclick="Chat.unfriend('${uid}')">⋯</button>`:''}</div>
    <div class="ch-msgs" id="chMsgs"><div class="rk-empty"><p>កំពុងផ្ទុក…</p></div></div>
    ${ST.open.ro?'':`<div class="ch-stk">${STICK.map(e=>`<button onclick="Chat.send('${e}')">${e}</button>`).join('')}</div>
    <form class="ch-in" onsubmit="event.preventDefault();Chat.send()"><input id="chTxt" maxlength="300" placeholder="សរសេរសារ… (English ក៏បាន!)" autocomplete="off"><button class="btn teal">➤</button></form>`}`;
  ST.msgUnsub = l.watchCol(['chat_'+cid,'c',k,'m'], list=>{ ST.msgs=list||[]; drawMsgs(); if(isStu()) setRead(k); badge(); }, 200);
  history.pushState({chat:1},'');
}
function convTitle(cid,k){ const M=mates(cid), [a,b]=k.split('_'); const n=x=>(M.find(m=>m.uid===x)||{name:'?'}).name; return n(a)+' ↔ '+n(b); }
function drawMsgs(){
  const box=$('#chMsgs'); if(!box||!ST.open) return; const u=me(), M=ST.msgs; if(M==null) return;
  const staff=!isStu(), names={}; mates(ST.open.cid).forEach(m=>names[m.uid]=m);
  const atBottom = box.scrollHeight-box.scrollTop-box.clientHeight<80;
  box.innerHTML = M.length ? M.map((m,i)=>{ const mine=!staff&&m.f===u.id, big=/^\p{Extended_Pictographic}+$/u.test(m.x||'');
    const day=new Date(m.ts).toDateString(), prev=i?new Date(M[i-1].ts).toDateString():'';
    return `${day!==prev?`<div class="ch-day">${new Date(m.ts).toLocaleDateString('en-GB')}</div>`:''}<div class="ch-m ${mine?'me':''} ${m.rep?'rep':''}">
      ${staff?`<small class="ch-who">${esc((names[m.f]||{}).name||'?')}</small>`:''}<div class="ch-b ${big?'big':''}">${esc(m.x)}</div>
      <span class="ch-meta">${hm(m.ts)}${m.rep?' • 🚩':''}${staff?` <button onclick="Chat.delMsg('${m.id}')">🗑</button>`:(!mine?` <button title="រាយការណ៍ទៅគ្រូ" onclick="Chat.report('${m.id}')">🚩</button>`:'')}</span></div>`; }).join('')
    : `<div class="rk-empty"><div>👋</div><p>និយាយសួស្តីទៅមិត្តរបស់អ្នក!</p></div>`;
  if(atBottom || !box.dataset.init){ box.scrollTop=box.scrollHeight; box.dataset.init=1; }
}
function send(x){
  const l=L(), O=ST.open, u=me(); if(!O||O.ro) return; if(Auth.asStaff&&Auth.asStaff()) return toast('👁 គ្រូកំពុងមើល — មិនអាចផ្ញើសារជំនួសសិស្សបានទេ'); const inp=$('#chTxt'); const t=(x||(inp&&inp.value)||'').trim().slice(0,300); if(!t) return;
  if(!chatAllowed(O.cid)) return toast('🔕 គ្រូបានបិទឆាត');
  if(inp&&!x) inp.value='';
  const ts=Date.now(), [a,b]=O.k.split('_');
  l.add(['chat_'+O.cid,'c',O.k,'m'], {f:u.id, x:t, ts}).catch(()=>toast('⚠️ ផ្ញើមិនបាន — សូមពិនិត្យ Internet'));
  l.set(['chat_'+O.cid,'c',O.k], {m:[a,b], last:{f:u.id, x:t}, ts});
}
function report(id){ if(!confirm('រាយការណ៍សារនេះទៅគ្រូ?')) return; const O=ST.open; L().upd(['chat_'+O.cid,'c',O.k,'m',id], {rep:true}).then(()=>toast('🚩 បានរាយការណ៍ទៅគ្រូ'));
  L().set(['chat_'+O.cid,'c',O.k], {rep:Date.now()}); }
function delMsg(id){ if(!confirm('លុបសារនេះ?')) return; const O=ST.open; L().rm(['chat_'+O.cid,'c',O.k,'m',id]); }
function closeChat(){ const w=$('#chatWin'); if(w) w.remove(); if(ST.msgUnsub){ ST.msgUnsub(); ST.msgUnsub=null; } ST.open=null; if(host&&document.body.contains(host)) draw(); }
addEventListener('popstate', ()=>{ if(ST.open) closeChat(); });

/* ---------- teacher tab (inside 👥 class page) ---------- */
function teacherTab(el, c){
  host=null; const l=L();
  if(!l){ el.innerHTML='<div class="panel cl-empty"><div class="em">📡</div><p class="km">ត្រូវភ្ជាប់ Cloud (Website) ដើម្បីប្រើឆាត</p></div>'; return; }
  if(ST.cid!==c.id){ stop(); start(); }
  const M=mates(c.id), on=M.filter(m=>online(m.uid)), convs=Object.values(ST.convs).sort((a,b)=>b.ts-a.ts), frN=Object.keys(ST.soc.fr).length;
  el.innerHTML=`<div class="panel"><div class="row" style="justify-content:space-between"><h3 class="sec" style="margin:0">💬 មិត្តភក្តិ & ឆាតរបស់សិស្ស</h3>
      <label class="gt-sw ${c.chat===false?'':'on'}"><input type="checkbox" hidden ${c.chat===false?'':'checked'} onchange="Chat.allow(this.checked)"><span></span>${c.chat===false?'បិទ':'អនុញ្ញាត'}</label></div>
    <p class="note">សិស្សឃើញតែមិត្តក្នុងថ្នាក់ខ្លួន • ឆាតបានតែជាមួយមិត្តដែលបានទទួលយក • គ្រូ/Admin អាចអាន និងលុបសារទាំងអស់ • សារដែលសិស្សរាយការណ៍មានសញ្ញា 🚩</p>
    <div class="ch-tstat"><div><b>${on.length}</b><span>🟢 Online ឥឡូវ</span></div><div><b>${frN}</b><span>🤝 គូមិត្ត</span></div><div><b>${convs.length}</b><span>💬 ការសន្ទនា</span></div><div><b>${convs.filter(x=>x.rep).length}</b><span>🚩 រាយការណ៍</span></div></div>
    ${on.length?`<div class="ch-onl">${on.map(m=>`<span>${av(m.s,30)}${esc(m.name)}</span>`).join('')}</div>`:''}
    <h4 style="margin:14px 0 6px">💬 ការសន្ទនា</h4>
    <div class="ch-list">${convs.length?convs.map(cv=>`<button class="ch-row conv ${cv.rep?'unread':''}" onclick="Chat.view('${cv.id}')"><span class="ch-nm"><b>${cv.rep?'🚩 ':''}${esc(convTitle(c.id,cv.id))}</b><small>${esc((cv.last&&cv.last.x)||'').slice(0,70)}</small></span><span class="ch-tm">${ago(cv.ts)}</span></button>`).join(''):'<p class="note">មិនទាន់មានការសន្ទនា</p>'}</div></div>`;
  ST.tHost=el; ST.tCls=c;
}
function allow(v){ const c=window.Class&&Class._cur(); if(!c) return; c.chat=v?true:false; Class._save(); toast(v?'💬 បានអនុញ្ញាតឆាត':'🔕 បានបិទឆាតសម្រាប់ថ្នាក់នេះ'); teacherTab(ST.tHost,c); }
window.Chat={ isFriend:uid=>{ try{ return rel(uid)==='friend'; }catch(e){ return false; } }, page, start, stop, badge, add:addFriend, accept, decline, cancel, unfriend, open, close:closeChat, send, report, delMsg,
  view:k=>open(null,k), tab:t=>{ ST.tab=t; draw(); }, allow, teacherTab, unread };
})();
