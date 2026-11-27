// =====================================================================
//  games.js — 🎮 ល្បែងសិក្សាសម្រាប់គ្រូដឹកនាំក្នុងថ្នាក់ (បញ្ចាំងលើអេក្រង់ធំ)
//  ❓ សំណួររហ័ស • 🔤 ទាយពាក្យ • 🔀 រៀបអក្សរ • 🃏 ផ្គូផ្គងកាត • ⭕ X-O វាក្យសព្ទ • ⚡ កាតពាក្យរហ័ស
//  • ពាក្យ/សំណួរយកពី Unit ដែលជ្រើស • ពិន្ទុក្រុម (ប្រើក្រុមថ្នាក់បាន) • 🎁 ផ្តល់រង្វាន់ឱ្យក្រុមឈ្នះ
// =====================================================================
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuf = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const say = t => { try{ speak(t); }catch(e){} };
const sayA = t => JSON.stringify(t).replace(/"/g,'&quot;');
const GAMES = [
  ['quiz','❓','សំណួររហ័ស','ជ្រើស A B C D — ពាក្យ ស្តាប់ សំឡេង Phonics','#7c3aed'],
  ['hang','🔤','ទាយពាក្យ','ទាយអក្សរម្តងមួយៗ មុនប៉េងប៉ោងបែកអស់','#ea580c'],
  ['scr','🔀','រៀបអក្សរ','រៀបអក្សរដែលច្របូកច្របល់ឱ្យជាពាក្យ','#0891b2'],
  ['mem','🃏','ផ្គូផ្គងកាត','បើកកាតពីរ — អង់គ្លេស និងន័យខ្មែរ','#16a34a'],
  ['xo','⭕','X-O វាក្យសព្ទ','និយាយពាក្យឱ្យត្រូវ ដើម្បីដាក់ X ឬ O','#db2777'],
  ['flash','⚡','កាតពាក្យរហ័ស','មើលរូប/ន័យ ហើយស្រែកពាក្យអង់គ្លេសមុនគេ','#ca8a04']];
const TCOL=['#ef4444','#2563eb','#16a34a','#d97706','#7c3aed','#0891b2'];
let GM=null;

/* ---------- unit content ---------- */
function words(n, opt){ opt=opt||{}; const u=UNITS[n-1], seen=new Set();
  return shuf(u.vocab.map(v=>{ let en=String(v[0]).replace(/\(.*?\)/g,'').replace(/\s*[\/→=↔].*$/,'').trim(); const em=(typeof emojiFor==='function'?emojiFor(u,v[0]):'')||'';
      if(opt.single) en=en.replace(/^(a|an|the) /i,''); return {en, km:v[2]||'', em}; })
    .filter(w=>w.en&&w.km&&/^[A-Za-z][A-Za-z' .?!-]*$/.test(w.en)&&(!opt.single||/^[A-Za-z]+$/.test(w.en))&&(!opt.max||w.en.length<=opt.max)&&!seen.has(w.en.toLowerCase())&&seen.add(w.en.toLowerCase()))); }

/* ---------- shell ---------- */
function open(){
  const c=window.Class&&Class._cur&&Class._cur();
  const n=(typeof view!=='undefined'&&view.unit)||(typeof S!=='undefined'&&S.lastUnit)||1;
  GM={n, game:null, turn:0, teams:teamsFrom(c)};
  let el=document.getElementById('gm'); if(!el){ el=document.createElement('div'); el.id='gm'; document.body.appendChild(el); }
  document.body.classList.add('gm-open'); hub();
}
function teamsFrom(c, k){
  if(!k && c && c.groups && c.groups.length>=2) return c.groups.map((g,i)=>{ const N=Class._gn(c,i); return {e:N[0], n:N[1], c:N[2], s:0, m:g.slice()}; });
  k=k||2; return Array.from({length:k},(_,i)=>({e:['🔴','🔵','🟢','🟠','🟣','🩵'][i], n:'ក្រុម '+'ABCDEF'[i], c:TCOL[i], s:0, m:[]}));
}
function close(){ const el=document.getElementById('gm'); if(el) el.remove(); document.body.classList.remove('gm-open'); clearInterval(GM&&GM.tk); GM=null; try{ document.fullscreenElement&&document.exitFullscreen(); }catch(e){} }
function frame(title, body){
  const el=document.getElementById('gm'); if(!el) return;
  el.innerHTML=`<div class="gm-top"><button class="gm-b" onclick="Games.hub()" ${GM.game?'':'disabled'}>‹</button><b>🎮 ${title}</b>
      <select onchange="Games.unit(+this.value)">${UNITS.map(u=>`<option value="${u.n}" ${u.n===GM.n?'selected':''}>Unit ${u.n} • ${esc(u.en)}</option>`).join('')}</select>
      <span class="grow"></span><button class="gm-b" onclick="Games.full()" title="អេក្រង់ពេញ">⛶</button><button class="gm-b" onclick="Games.close()">✕</button></div>
    <div class="gm-main">${body}</div>${teamsBar()}`;
}
function teamsBar(){ const T=GM.teams;
  return `<div class="gm-teams">${T.map((t,i)=>`<div class="gm-t ${GM.turn===i&&GM.turnOn?'turn':''}" style="--tc:${t.c}" onclick="Games.turn(${i})"><span>${t.e}</span><b>${esc(t.n)}</b><em>${t.s}</em>
      <div><button onclick="event.stopPropagation();Games.pt(${i},-1)">−</button><button onclick="event.stopPropagation();Games.pt(${i},1)">＋</button></div></div>`).join('')}
    <div class="gm-tset"><select onchange="Games.teamsSet(this.value)"><option value="">👥 ក្រុម…</option>${[2,3,4,5,6].map(k=>`<option value="${k}">${k} ក្រុម</option>`).join('')}<option value="cls">ក្រុមថ្នាក់</option></select>
      <button class="gm-b win" onclick="Games.finish()">🏆 ចប់</button></div></div>`; }
function redrawTeams(){ const b=document.querySelector('#gm .gm-teams'); if(b) b.outerHTML=teamsBar(); }
function pt(i,d){ GM.teams[i].s=Math.max(0,GM.teams[i].s+d); redrawTeams(); if(d>0&&typeof beep==='function') beep(true); }
function teamsSet(v){ if(!v) return; const c=Class._cur&&Class._cur(); GM.teams=v==='cls'?(c&&c.groups&&c.groups.length>=2?teamsFrom(c):(toast('ថ្នាក់មិនទាន់មានក្រុម — ចូល 👥 បង្កើតក្រុម'),GM.teams)):teamsFrom(null,+v); GM.turn=0; redrawTeams(); }
function finish(){ const R=GM.teams.map((t,i)=>({...t,i})).sort((a,b)=>b.s-a.s), top=R[0];
  const el=document.querySelector('#gm .gm-main'); if(!el) return;
  el.innerHTML=`<div class="gm-fin"><div class="gm-crown">🏆</div><h2>${top.s?`${top.e} ${esc(top.n)} ឈ្នះ!`:'មិនទាន់មានពិន្ទុ'}</h2>
    <div class="gm-rank">${R.map((t,k)=>`<div style="--tc:${t.c}"><span>${['🥇','🥈','🥉'][k]||k+1}</span><b>${t.e} ${esc(t.n)}</b><em>${t.s}</em></div>`).join('')}</div>
    <div class="row" style="justify-content:center;gap:10px">${top.s?`<button class="gm-btn sun" onclick="Games.prize(${top.i})">🎁 ផ្តល់រង្វាន់ឱ្យក្រុមឈ្នះ</button>`:''}<button class="gm-btn" onclick="Games.reset()">↺ ចាប់ផ្តើមពិន្ទុថ្មី</button><button class="gm-btn" onclick="Games.hub()">🎮 ល្បែងផ្សេង</button></div></div>`;
  if(top.s&&window.pageConfetti) pageConfetti(); }
function prize(i){ const t=GM.teams[i], g=GAMES.find(x=>x[0]===GM.game); Class.reward({sids:t.m, w:'ឈ្នះល្បែង'+(g?' '+g[2]:'')+' ('+t.n+')'}); if(!t.m.length) toast('👆 សូមជ្រើសសិស្សក្នុងក្រុមឈ្នះ'); }
function reset(){ GM.teams.forEach(t=>t.s=0); redrawTeams(); hub(); }
function full(){ try{ document.fullscreenElement?document.exitFullscreen():document.getElementById('gm').requestFullscreen(); }catch(e){} }
function hub(){ clearInterval(GM.tk); GM.game=null; GM.turnOn=false;
  frame('ល្បែងសិក្សា', `<div class="gm-hub">${GAMES.map(g=>`<button class="gm-card" style="--gc:${g[4]}" onclick="Games.go('${g[0]}')"><span>${g[1]}</span><b>${g[2]}</b><small>${g[3]}</small></button>`).join('')}</div>
    <p class="gm-tip">💡 បញ្ចាំងលើអេក្រង់ធំ (⛶) • ចុច ＋/− ដើម្បីដាក់ពិន្ទុក្រុម • ពេលចប់ ចុច 🏆 ដើម្បីប្រកាសអ្នកឈ្នះ និងផ្តល់រង្វាន់ 💰</p>`); }
function unit(n){ GM.n=n; GM.game?go(GM.game):hub(); }
function go(g){ clearInterval(GM.tk); GM.game=g; GM.turnOn=(g==='mem'||g==='xo'); ({quiz:quizStart, hang:hangStart, scr:scrStart, mem:memStart, xo:xoStart, flash:flashStart})[g](); }
const title = () => { const g=GAMES.find(x=>x[0]===GM.game); return g[1]+' '+g[2]+' • Unit '+GM.n; };
function timer(sec, onEnd){ clearInterval(GM.tk); let left=sec; const draw=()=>{ const el=document.getElementById('gmClock'); if(el){ el.textContent=left; el.classList.toggle('warn',left<=5); el.style.setProperty('--p',left/sec); } };
  draw(); GM.tk=setInterval(()=>{ left--; draw(); if(left<=0){ clearInterval(GM.tk); onEnd&&onEnd(); } },1000); }
function turn(i){ GM.turn=i; redrawTeams(); }

/* ---------- ❓ quiz ---------- */
function quizStart(){ const n=GM.n, W=words(n), qs=[];
  const opts=(w,key)=>shuf([w,...shuf(W.filter(x=>x!==w&&x[key]!==w[key])).slice(0,3)]);
  W.slice(0,4).forEach(w=>{ const o=opts(w,'km'); qs.push({q:`<b>${esc(w.en)}</b>`, say:w.en, o:o.map(x=>x.km), a:o.indexOf(w), km:1}); });
  W.slice(4,7).forEach(w=>{ const o=opts(w,'en'); qs.push({q:`${w.em?`<span class="gm-em">${w.em}</span>`:''}<span class="km">${esc(w.km)}</span>`, o:o.map(x=>x.en), a:o.indexOf(w)}); });
  W.slice(7,10).forEach(w=>{ const o=opts(w,'en'); qs.push({q:'🎧 ស្តាប់ ហើយជ្រើស', listen:w.en, o:o.map(x=>x.en), a:o.indexOf(w)}); });
  const gp=(window.Exam&&Exam.grammarPool)?shuf(Exam.grammarPool(n)).slice(0,4):[]; gp.forEach(g=>qs.push({q:esc(g.q).replace(/_{3,}/,'<u>　　　</u>'), o:g.o, a:g.a}));
  GM.q={list:shuf(qs).slice(0,12), i:0, shown:false}; quizDraw(); }
function quizDraw(){ const Q=GM.q, q=Q.list[Q.i]; if(!q) return finish();
  frame(title(), `<div class="gm-quiz"><div class="gm-qh"><span>សំណួរ ${Q.i+1}/${Q.list.length}</span><div class="gm-clock" id="gmClock"></div></div>
    <div class="gm-q">${q.listen?`<button class="gm-btn big" onclick="Games.say(${sayA(q.listen)})">🔊 ស្តាប់</button>`:q.q}${q.say?` <button class="gm-b" onclick="Games.say(${sayA(q.say)})">🔊</button>`:''}</div>
    <div class="gm-opts ${q.km?'km':''}">${q.o.map((o,k)=>`<button class="gm-o o${k} ${Q.shown?(k===q.a?'right':'dim'):''}" onclick="Games.qPick(${k})"><i>${'▲◆●■'[k]}</i>${esc(o)}</button>`).join('')}</div>
    <div class="row" style="justify-content:center;gap:10px">${Q.shown?`<button class="gm-btn sun" onclick="Games.qNext()">▶ សំណួរបន្ទាប់</button>`:`<button class="gm-btn" onclick="Games.qShow()">👀 បង្ហាញចម្លើយ</button>`}</div></div>`);
  if(!Q.shown){ if(q.listen) setTimeout(()=>say(q.listen),400); timer(20, qShow); } }
function qPick(k){ const Q=GM.q, q=Q.list[Q.i]; if(Q.shown) return; const b=document.querySelectorAll('.gm-o')[k]; if(k===q.a){ qShow(); if(typeof beep==='function') beep(true); } else { b.classList.add('wrong'); if(typeof beep==='function') beep(false); } }
function qShow(){ clearInterval(GM.tk); GM.q.shown=true; quizDraw(); const q=GM.q.list[GM.q.i]; if(q.listen||!q.km) say(q.listen||(/^[A-Za-z]/.test(q.o[q.a])?q.o[q.a]:'')); }
function qNext(){ GM.q.i++; GM.q.shown=false; quizDraw(); }

/* ---------- 🔤 hangman ---------- */
function hangStart(){ GM.h={list:words(GM.n,{single:1,max:12}).filter(w=>w.en.length>=3), i:0}; hangNew(); }
function hangNew(){ const H=GM.h, w=H.list[H.i%Math.max(1,H.list.length)]; if(!w) return frame(title(),'<p>Unit នេះគ្មានពាក្យគ្រប់គ្រាន់</p>'); H.w=w; H.got=new Set(); H.tried=new Set(); H.bad=0; H.hint=0; H.done=false; hangDraw(); }
function hangDraw(){ const H=GM.h, w=H.w, word=w.en.toLowerCase(), MAX=7, win=[...word].every(ch=>H.got.has(ch)), lose=H.bad>=MAX; H.done=win||lose;
  frame(title(), `<div class="gm-hang"><div class="gm-ball">${Array.from({length:MAX},(_,i)=>`<span class="${i<H.bad?'pop':''}">${i<H.bad?'💥':'🎈'}</span>`).join('')}</div>
    <div class="gm-word">${[...word].map(ch=>`<span class="${H.got.has(ch)||H.done?'on':''} ${H.done&&!H.got.has(ch)?'miss':''}">${H.got.has(ch)||H.done?ch.toUpperCase():''}</span>`).join('')}</div>
    <div class="gm-hint">${H.hint>=1||H.done?`<span class="km">💡 ${esc(w.km)}</span>`:''}${(H.hint>=2||H.done)&&w.em?`<span class="gm-em">${w.em}</span>`:''}</div>
    ${H.done?`<div class="gm-res ${win?'ok':'no'}">${win?'🎉 ត្រឹមត្រូវ!':'😮 ចម្លើយ៖'} <b>${esc(w.en)}</b> <button class="gm-b" onclick="Games.say(${sayA(w.en)})">🔊</button></div><div class="row" style="justify-content:center"><button class="gm-btn sun" onclick="Games.hNext()">▶ ពាក្យបន្ទាប់</button></div>`
      :`<div class="gm-kb">${'abcdefghijklmnopqrstuvwxyz'.split('').map(ch=>`<button ${H.got.has(ch)||(H.tried||new Set()).has(ch)?'disabled':''} class="${H.got.has(ch)?'ok':''}" onclick="Games.hKey('${ch}')">${ch.toUpperCase()}</button>`).join('')}</div>
      <div class="row" style="justify-content:center;gap:8px"><button class="gm-btn" onclick="Games.hHint()">💡 ជំនួយ (${2-H.hint})</button><button class="gm-btn" onclick="Games.hReveal()">👀 បង្ហាញចម្លើយ</button></div>`}</div>`);
  if(H.done&&win){ say(w.en); if(window.pageConfetti) pageConfetti(); } }
function hKey(ch){ const H=GM.h; if(H.done) return; H.tried=H.tried||new Set(); if(H.w.en.toLowerCase().includes(ch)){ H.got.add(ch); if(typeof beep==='function') beep(true); } else { H.tried.add(ch); H.bad++; if(typeof beep==='function') beep(false); } hangDraw(); }
function hHint(){ const H=GM.h; if(H.hint<2){ H.hint++; hangDraw(); } }
function hReveal(){ const H=GM.h; H.bad=7; hangDraw(); }
function hNext(){ GM.h.i++; GM.h.tried=new Set(); hangNew(); }

/* ---------- 🔀 unscramble ---------- */
function scrStart(){ GM.s={list:words(GM.n,{single:1,max:12}).filter(w=>w.en.length>=3), i:0}; scrNew(); }
function scrNew(){ const X=GM.s, w=X.list[X.i%Math.max(1,X.list.length)]; if(!w) return frame(title(),'<p>Unit នេះគ្មានពាក្យគ្រប់គ្រាន់</p>');
  let t=shuf([...w.en.toLowerCase()]); for(let g=0;g<6&&t.join('')===w.en.toLowerCase();g++) t=shuf(t); X.w=w; X.t=t; X.pick=[]; X.done=false; scrDraw(); timer(30, ()=>{ GM.s.done=true; scrDraw(); }); }
function scrDraw(){ const X=GM.s, w=X.w, built=X.pick.map(k=>X.t[k]).join(''), ok=built===w.en.toLowerCase(); if(ok) X.done=true;
  frame(title(), `<div class="gm-scr"><div class="gm-qh"><span>ពាក្យទី ${X.i+1}</span><div class="gm-clock" id="gmClock"></div></div>
    <div class="gm-hint"><span class="km">💡 ${esc(w.km)}</span>${w.em?`<span class="gm-em">${w.em}</span>`:''}</div>
    <div class="gm-tiles">${X.t.map((ch,k)=>`<button ${X.pick.includes(k)||X.done?'disabled':''} onclick="Games.sPick(${k})">${ch.toUpperCase()}</button>`).join('')}</div>
    <div class="gm-word built">${X.done?[...w.en].map(ch=>`<span class="on">${ch.toUpperCase()}</span>`).join(''):[...w.en].map((_,k)=>`<span class="${X.pick[k]!=null?'on':''}">${X.pick[k]!=null?X.t[X.pick[k]].toUpperCase():''}</span>`).join('')}</div>
    ${X.done?`<div class="gm-res ${ok?'ok':''}">${ok?'🎉 ត្រឹមត្រូវ!':'ចម្លើយ៖'} <b>${esc(w.en)}</b> <button class="gm-b" onclick="Games.say(${sayA(w.en)})">🔊</button></div><div class="row" style="justify-content:center"><button class="gm-btn sun" onclick="Games.sNext()">▶ ពាក្យបន្ទាប់</button></div>`
      :`<div class="row" style="justify-content:center;gap:8px"><button class="gm-btn" onclick="Games.sUndo()">↶ លុប</button><button class="gm-btn" onclick="Games.sReveal()">👀 បង្ហាញចម្លើយ</button></div>`}</div>`);
  if(X.done){ clearInterval(GM.tk); if(ok){ say(w.en); if(typeof beep==='function') beep(true); } } }
function sPick(k){ const X=GM.s; X.pick.push(k); if(X.pick.length===X.t.length&&X.pick.map(i=>X.t[i]).join('')!==X.w.en.toLowerCase()){ if(typeof beep==='function') beep(false); setTimeout(()=>{ X.pick=[]; scrDraw(); },700); } scrDraw(); }
function sUndo(){ GM.s.pick.pop(); scrDraw(); }
function sReveal(){ GM.s.done=true; scrDraw(); }
function sNext(){ GM.s.i++; scrNew(); }

/* ---------- 🃏 memory ---------- */
function memStart(){ const W=words(GM.n).filter(w=>w.en.length<=16).slice(0,8); const cards=shuf(W.flatMap((w,i)=>[{p:i,t:'en',w},{p:i,t:'km',w}]));
  GM.m={cards, open:[], done:new Set(), lock:false}; GM.turn=0; memDraw(); }
function memDraw(){ const M=GM.m;
  frame(title(), `<div class="gm-mem"><p class="gm-turn">👉 វេនរបស់ <b style="color:${GM.teams[GM.turn].c}">${GM.teams[GM.turn].e} ${esc(GM.teams[GM.turn].n)}</b></p>
    <div class="gm-grid">${M.cards.map((c,k)=>{ const up=M.open.includes(k)||M.done.has(c.p); return `<button class="gm-mc ${up?'up':''} ${M.done.has(c.p)?'got':''}" onclick="Games.mFlip(${k})">${up?(c.t==='en'?`<b>${esc(c.w.en)}</b>`:`${c.w.em?`<span class="gm-em">${c.w.em}</span>`:''}<span class="km">${esc(c.w.km)}</span>`):'<i>?</i>'}</button>`; }).join('')}</div></div>`);
  if(M.done.size===M.cards.length/2) setTimeout(finish,900); }
function mFlip(k){ const M=GM.m, c=M.cards[k]; if(M.lock||M.open.includes(k)||M.done.has(c.p)) return; M.open.push(k); if(c.t==='en') say(c.w.en); memDraw();
  if(M.open.length===2){ const [a,b]=M.open.map(i=>M.cards[i]); M.lock=true;
    setTimeout(()=>{ if(a.p===b.p){ M.done.add(a.p); GM.teams[GM.turn].s++; if(typeof beep==='function') beep(true); } else { GM.turn=(GM.turn+1)%GM.teams.length; } M.open=[]; M.lock=false; memDraw(); }, a.p===b.p?600:1300); } }

/* ---------- ⭕ X-O vocabulary (team 1 = ✖, team 2 = ⭕) ---------- */
function xoStart(){ GM.x={cells:words(GM.n).slice(0,9).map(w=>({w, o:null})), cur:null, win:null}; GM.turn=0; if(GM.x.cells.length<9) return frame(title(),'<p>Unit នេះគ្មានពាក្យគ្រប់គ្រាន់</p>'); xoDraw(); }
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function xoDraw(){ const X=GM.x, T=GM.teams, mk=i=>i===0?'✖':'⭕';
  frame(title(), `<div class="gm-xo"><p class="gm-turn">${X.win!=null?(X.win>=0?`🏆 <b style="color:${T[X.win].c}">${T[X.win].e} ${esc(T[X.win].n)}</b> ឈ្នះ! (+3)`:'🤝 ស្មើ'):`👉 វេន <b style="color:${T[GM.turn%2].c}">${mk(GM.turn%2)} ${T[GM.turn%2].e} ${esc(T[GM.turn%2].n)}</b> — ជ្រើសប្រអប់ ហើយនិយាយពាក្យអង់គ្លេស`}</p>
    <div class="gm-xog">${X.cells.map((c,i)=>`<button class="${c.o!=null?'own o'+c.o:''} ${X.line&&X.line.includes(i)?'line':''}" style="${c.o!=null?`--tc:${T[c.o].c}`:''}" onclick="Games.xPick(${i})">${c.o!=null?`<b>${mk(c.o)}</b><small>${esc(c.w.en)}</small>`:`${c.w.em?`<span class="gm-em">${c.w.em}</span>`:''}<span class="km">${esc(c.w.km)}</span>`}</button>`).join('')}</div>
    ${X.cur!=null?`<div class="gm-xoq"><div><span class="km">${esc(X.cells[X.cur].w.km)}</span> → <b id="xoA" class="hide">${esc(X.cells[X.cur].w.en)}</b></div>
      <div class="row" style="gap:8px;justify-content:center"><button class="gm-btn" onclick="document.getElementById('xoA').classList.remove('hide');Games.say(${sayA(X.cells[X.cur].w.en)})">👀🔊 ចម្លើយ</button><button class="gm-btn ok" onclick="Games.xJudge(1)">✅ ត្រូវ</button><button class="gm-btn no" onclick="Games.xJudge(0)">❌ ខុស</button></div></div>`
      :X.win!=null?`<div class="row" style="justify-content:center"><button class="gm-btn sun" onclick="Games.go('xo')">↺ លេងម្តងទៀត</button></div>`:''}</div>`); }
function xPick(i){ const X=GM.x; if(X.win!=null||X.cells[i].o!=null) return; X.cur=i; xoDraw(); }
function xJudge(ok){ const X=GM.x, me=GM.turn%2; if(X.cur==null) return; if(ok){ X.cells[X.cur].o=me; say(X.cells[X.cur].w.en); if(typeof beep==='function') beep(true); } else if(typeof beep==='function') beep(false);
  X.cur=null; const L=LINES.find(l=>l.every(i=>X.cells[i].o===me)); if(L){ X.win=me; X.line=L; GM.teams[me].s+=3; if(window.pageConfetti) pageConfetti(); } else if(X.cells.every(c=>c.o!=null)) X.win=-1; else GM.turn=(me+1)%2; xoDraw(); }

/* ---------- ⚡ flash cards ---------- */
function flashStart(){ GM.f={list:words(GM.n), i:0, show:false, sec:5}; flashDraw(); }
function flashDraw(){ const F=GM.f, w=F.list[F.i]; if(!w) return finish();
  frame(title(), `<div class="gm-flash"><div class="gm-qh"><span>កាត ${F.i+1}/${F.list.length}</span><div class="gm-clock" id="gmClock"></div>
      <select onchange="GM_f_sec(this.value)">${[3,5,8,10].map(v=>`<option ${v===F.sec?'selected':''} value="${v}">${v} វិនាទី</option>`).join('')}</select></div>
    <div class="gm-fc ${F.show?'show':''}">${w.em?`<div class="gm-em xl">${w.em}</div>`:''}<div class="km">${esc(w.km)}</div>${F.show?`<b>${esc(w.en)}</b>`:''}</div>
    <div class="row" style="justify-content:center;gap:8px">${F.show?`<button class="gm-btn" onclick="Games.say(${sayA(w.en)})">🔊</button><button class="gm-btn sun" onclick="Games.fNext()">▶ កាតបន្ទាប់ (Space)</button>`:`<button class="gm-btn sun" onclick="Games.fShow()">👀 បង្ហាញ (Space)</button>`}</div></div>`);
  if(!F.show) timer(F.sec, fShow); }
function fShow(){ clearInterval(GM.tk); GM.f.show=true; flashDraw(); say(GM.f.list[GM.f.i].en); }
function fNext(){ GM.f.i++; GM.f.show=false; flashDraw(); }
window.GM_f_sec=v=>{ GM.f.sec=+v; };
document.addEventListener('keydown',e=>{ if(!GM||e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
  if(e.key==='Escape') return close();
  if(GM.game==='flash'&&e.code==='Space'){ e.preventDefault(); GM.f.show?fNext():fShow(); }
  if(GM.game==='hang'&&/^[a-z]$/i.test(e.key)&&!GM.h.done) hKey(e.key.toLowerCase());
  if(GM.game==='quiz'&&/^[1-4]$/.test(e.key)) qPick(+e.key-1);
});

window.Games = { open, close, hub, go, unit, full, turn, pt, teamsSet, finish, prize, reset, say, qPick, qShow, qNext, hKey, hHint, hReveal, hNext, sPick, sUndo, sReveal, sNext, mFlip, xPick, xJudge, fShow, fNext };
})();
