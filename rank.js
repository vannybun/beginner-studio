/* 🏆 ចំណាត់ថ្នាក់រៀនតាម App (សប្តាហ៍ • ខែ • Level) + លទ្ធផលប្រចាំខែ/ឆ្នាំ (បង្ហាញសិស្ស លុះត្រាតែគ្រូបើក) */
(function(){
const BK='beginner-studio-board-v1', CK='beginner-studio-class-v1';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const J=k=>{ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } };
const dk=t=>{ t=new Date(t); return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0'); };
const MK=['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
const mName=m=>{ const [y,mm]=m.split('-'); return 'ខែ'+MK[+mm-1]+' '+y; };
const fmt=s=>{ const m=Math.round((s||0)/60); return m<60? m+' នាទី' : Math.floor(m/60)+' ម៉ោង'+(m%60?' '+m%60+' នាទី':''); };
let T='busy', MON=null;

/* ---- the student's own summary → shared board (small, synced) ---- */
function summ(S){ const cut=dk(Date.now()-70*864e5), d={}; Object.entries((S.act&&S.act.d)||{}).forEach(([k,v])=>{ if(k>=cut) d[k]=v; });
  const lv=Object.values(S.level||{}), M=S.money||{}, L=window.LESSONS||{}, N=Object.keys(L).length||14;
  let cu=0, sr=0, pcs=0;
  for(let n=1;n<=N;n++){ const tot=(L[n]&&L[n].sections.length)||1, dn=Math.min(tot,((S.sec||{})[n]||[]).length), lvn=(S.level||{})[n]||0, done=dn>=tot;
    sr += (done?1:0)+(lvn>=80?1:0)+(lvn>=95?1:0); pcs += dn/tot*0.5 + Math.min(lvn,100)/200; if(!cu && !(done&&lvn>=80)) cu=n; }
  return {cu:cu||N, sr, pc:Math.round(pcs/N*100), d, p:lv.filter(v=>v>=80).length, l:lv.length?Math.round(lv.reduce((a,b)=>a+b,0)/lv.length):0, w:Object.values(S.known||{}).reduce((a,x)=>a+x.length,0), lv:S.level||{}, r:M.t||0, rm:M.m||{}}; }
function push(S, force){
  if(!window.Auth||Auth.role()!=='student') return; const me=Auth.user(); if(!me||!S) return;
  if(!force && Date.now()-(push.t||0)<90000) return; push.t=Date.now();
  const e={c:me.classId, s:me.studentId, ...summ(S)};
  const B=J(BK)||{}, old=B[me.id]; if(old){ const o={...old}; delete o.ts; if(JSON.stringify(o)===JSON.stringify(e)) return; }
  B[me.id]={...e, ts:Date.now()}; try{ localStorage.setItem(BK, JSON.stringify(B)); }catch(x){}
}

/* ---- one row per student: board entry, or (staff) live progress ---- */
function rows(c){
  const B=J(BK)||{}, users=(window.Auth&&Auth.data().users)||[], staff=window.Auth&&Auth.role()!=='student';
  return c.students.map(s=>{ const u=users.find(x=>x.role==='student'&&x.classId===c.id&&x.studentId===s.id); let e=u&&B[u.id];
    const P=staff&&u&&J('beginner-studio-v1:'+u.id); if(P) e=summ(P);
    return {s, uid:u&&u.id, e:e||{d:{},p:0,l:0,w:0,lv:{},r:0,rm:{},cu:1,sr:0,pc:0}}; });
}
function weekRange(off){ const n=new Date(); n.setHours(12,0,0,0); const dow=(n.getDay()+6)%7; const a=new Date(n.getTime()-(dow+7*off)*864e5); return [dk(a), dk(a.getTime()+6*864e5)]; }
function monthKey(off){ const n=new Date(); const d=new Date(n.getFullYear(), n.getMonth()-off, 15); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); }
function rankBy(list, val, tie){ const r=list.map(x=>({...x, v:val(x), t:tie?tie(x):0})).sort((a,b)=>b.v-a.v||b.t-a.t);
  r.forEach((x,i)=>{ x.rank = !x.v ? null : i>0&&r[i-1].v===x.v&&r[i-1].t===x.t ? r[i-1].rank : i+1; }); return r; }
const riel=n=>(Math.round(n||0)).toLocaleString('en-US')+'៛';

const av=(s,n)=>window.Class&&Class._avatar?Class._avatar(s,n):'';
function board(list, meSid, empty, unit){
  const top=list.filter(x=>x.rank&&x.rank<=3).slice(0,3), pod=[top[1],top[0],top[2]];
  if(!list.some(x=>x.rank)) return `<div class="rk-empty"><div>🌱</div><p>${empty}</p></div>`;
  return `<div class="cl-podium rk-pod">${pod.map((r,k)=>r?`<div class="pd p${[2,1,3][k]}"><div class="crown">${['🥈','🥇','🥉'][k]}</div>${av(r.s,[60,78,56][k])}<b>${esc(r.s.name)}</b><span>${unit(r)}</span><div class="base">${r.rank}</div></div>`:'<div class="pd empty"></div>').join('')}</div>
    <div class="rk-list">${list.map(r=>`<div class="rk-row ${r.s.id===meSid?'me':''} ${r.rank?'':'zero'}"><span class="rk r${r.rank&&r.rank<=3?r.rank:0}">${r.rank||'—'}</span>${av(r.s,36)}<b>${esc(r.s.name)}${r.s.id===meSid?' <em>(ខ្ញុំ)</em>':''}</b><i>${r.rank?unit(r):'—'}</i></div>`).join('')}</div>`;
}
const chips=(list,cur,fn)=>list.map(([k,t])=>`<button class="chip ${k===cur?'on':''}" onclick="${fn}('${k}')">${t}</button>`).join('');

let SUB={busy:'w0', rich:'all', score:null}, UNIT=null;
function page(el, c, opt){
  opt=opt||{}; const staff=!!opt.staff, meSid=window.Auth&&Auth.role()==='student'?Auth.user().studentId:null;
  if(!c){ el.innerHTML='<div class="panel cl-empty"><p class="km">មិនទាន់មានថ្នាក់</p></div>'; return; }
  const sh=c.share||{}, R=rows(c);
  const scoreSubs=[['res','🗓 ប្រចាំខែ'],['unit','📘 ប្រចាំមេរៀន'],['year','📈 ប្រចាំឆ្នាំ']].filter(([k])=>staff||sh[k]);
  const tabs=[['busy','💪 អ្នកឧស្សាហ៍ប្រចាំថ្នាក់'],['rich','💰 អ្នកមានប្រចាំថ្នាក់']]; if(scoreSubs.length) tabs.push(['score','🏅 ចំណាត់ថ្នាក់']);
  if(!tabs.some(t=>t[0]===T)) T='busy';
  let body='', sub='';
  if(T==='busy'){ const k=SUB.busy; let a,b,lbl;
    if(k[0]==='w'){ [a,b]=weekRange(+k[1]); lbl=a.slice(5).split('-').reverse().join('/')+' – '+b.slice(5).split('-').reverse().join('/'); } else { const m=monthKey(+k[1]); a=m+'-01'; b=m+'-31'; lbl=mName(m); }
    sub=`<p class="rk-why">💪 អ្នកដែលរៀនតាម App បានច្រើនម៉ោង ច្រើននាទីជាងគេ</p><div class="rk-sub">${chips([['w0','សប្តាហ៍នេះ'],['w1','សប្តាហ៍មុន'],['m0','ខែនេះ'],['m1','ខែមុន']],k,'Rank.sub')}<span>${lbl}</span></div>`;
    body=board(rankBy(R, x=>Object.entries(x.e.d||{}).reduce((t,[d,v])=>d>=a&&d<=b?t+v:t,0)), meSid, 'មិនទាន់មានអ្នករៀនក្នុងរយៈពេលនេះទេ — ចាប់ផ្តើមរៀនឥឡូវ ដើម្បីក្លាយជាលេខ ១!', r=>'⏱ '+fmt(r.v)); }
  else if(T==='rich'){ const k=SUB.rich, m=k==='all'?null:monthKey(+k[1]);
    sub=`<p class="rk-why">💰 លុយ (រៀល) ដែលរកបានពីការរៀនចប់មេរៀន និងធ្វើលំហាត់</p><div class="rk-sub">${chips([['all','សរុបទាំងអស់'],['m0','ខែនេះ'],['m1','ខែមុន']],k,'Rank.sub')}${m?`<span>${mName(m)}</span>`:''}</div>`;
    body=board(rankBy(R, x=>m?((x.e.rm||{})[m]||0):(x.e.r||0)), meSid, 'មិនទាន់មាននរណារកលុយបានទេ — រៀន និងធ្វើលំហាត់ ដើម្បីរកលុយ 💰', r=>'💰 '+riel(r.v)); }
  else { const k=scoreSubs.some(x=>x[0]===SUB.score)?SUB.score:scoreSubs[0][0], on=!!sh[k];
    sub=`<div class="rk-sub">${chips(scoreSubs,k,'Rank.sub')}</div>`+(staff?`<div class="rk-share ${on?'on':''}"><span>${on?'👁 សិស្សកំពុងមើលឃើញផ្ទាំងនេះ':'🙈 សិស្សមិនទាន់មើលឃើញផ្ទាំងនេះទេ'}</span><button class="btn sm ${on?'ghost':'teal'}" onclick="Rank.share('${k}')">${on?'🔒 បិទវិញ':'👁 បើកឱ្យសិស្សមើល'}</button></div>`:'');
    body=k==='res'?resView(c,meSid):k==='unit'?unitView(c,R,meSid):yearView(c,meSid); }
  el.innerHTML=`<div class="rk-wrap">${opt.head===false?'':`<div class="stu-head"><h2>🏆 ចំណាត់ថ្នាក់</h2><small>${esc(c.name)}</small></div>`}
    <div class="rk-tabs">${tabs.map(([k,t])=>`<button class="${k===T?'on':''}" onclick="Rank.set('${k}')">${t}</button>`).join('')}</div>${sub}${body}</div>`;
}
function resView(c, meSid){
  const ms=Class._months(c); if(!ms.length) return '<div class="rk-empty"><div>📭</div><p>មិនទាន់មានពិន្ទុប្រចាំខែ</p></div>';
  const m=MON&&ms.includes(MON)?MON:ms[ms.length-1], R=Class._results(c,m), mt=Class._maxTotal(c);
  return `<div class="rk-sub">${ms.slice(-6).map(x=>`<button class="chip ${x===m?'on':''}" onclick="Rank.month('${x}')">${mName(x)}</button>`).join('')}</div>`+
    board(R.map(r=>({...r, v:r.p||0})), meSid, '', r=>`${+r.t.toFixed(2)}/${mt} • ${Math.round(r.p)}% ${Class._grade(r.p)[1]}`);
}
function unitView(c, R, meSid){
  const X=(window.Exam&&Exam.data())||{results:[]};
  const score=(x,n)=>{ const ex=(X.results||[]).filter(r=>r.n===n&&((x.uid&&r.uid===x.uid)||r.sid===x.s.id)); if(ex.length) return {v:Math.max(...ex.map(r=>r.pct)), k:'📝'}; const l=(x.e.lv||{})[n]; return l!=null?{v:l,k:'🏁'}:null; };
  const has=n=>R.some(x=>score(x,n)); const ns=[...Array(14)].map((_,i)=>i+1);
  const n=UNIT&&ns.includes(UNIT)?UNIT:(ns.filter(has).pop()||1);
  const L=rankBy(R.map(x=>({...x, sc:score(x,n)})), x=>x.sc?x.sc.v:0);
  return `<p class="rk-why">📘 ពិន្ទុប្រឡងបញ្ចប់មេរៀន (📝) ឬ 🏁 លំហាត់ឆ្លងកម្រិត ពេលមិនទាន់ប្រឡង</p><div class="rk-sub rk-units">${ns.map(k=>`<button class="chip ${k===n?'on':''} ${has(k)?'':'dim'}" onclick="Rank.unit(${k})">U${k}</button>`).join('')}</div>`+
    board(L, meSid, `មិនទាន់មានពិន្ទុ Unit ${n}`, r=>`${r.sc.k} ${r.sc.v}%`);
}
function yearView(c, meSid){
  const Y=Class._yearRows(c); if(!Y.ms.length) return '<div class="rk-empty"><div>📭</div><p>មិនទាន់មានពិន្ទុខែណាមួយទេ</p></div>';
  const L=rankBy(Y.rows, x=>x.avg==null?0:Math.round(x.avg*100)/100);
  return `<div class="rk-sub"><span>មធ្យមភាគ ${Y.ms.length} ខែ (${mName(Y.ms[0])} – ${mName(Y.ms[Y.ms.length-1])})</span></div>`+board(L, meSid, '', r=>`${r.avg.toFixed(1)}% ${Class._grade(r.avg)[1]}`);
}

function stuClass(){ const me=Auth.user(); return ((J(CK)||{}).classes||[]).find(x=>x.id===me.classId); }
function stuPage(){
  const el=document.getElementById('main'); target=()=>page(el, stuClass()); page(el, stuClass());
  if(window.Cloud&&Cloud.refresh&&Date.now()-(stuPage.t||0)>15000){ stuPage.t=Date.now();
    Promise.all([Cloud.refresh(BK),Cloud.refresh(CK)]).then(r=>{ if((r[0]||r[1])&&view.name==='rank') page(el, stuClass()); }).catch(()=>{}); }
}
let target=null;
function set(t){ T=t; redraw(); }
function sub(k){ SUB[T]=k; redraw(); }
function unit(n){ UNIT=n; redraw(); }
function month(m){ MON=m; redraw(); }
function redraw(){ if(target) target(); }
function share(k){ Class._share(k); redraw(); }
window.Rank={ summ, rows, riel, sub, unit, push, page, stuPage, set, month, share, _target:f=>{ target=f; }, key:BK };
})();
