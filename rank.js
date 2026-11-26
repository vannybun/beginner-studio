/* 🏆 ចំណាត់ថ្នាក់រៀនតាម App (សប្តាហ៍ • ខែ • Level) + លទ្ធផលប្រចាំខែ/ឆ្នាំ (បង្ហាញសិស្ស លុះត្រាតែគ្រូបើក) */
(function(){
const BK='beginner-studio-board-v1', CK='beginner-studio-class-v1';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const J=k=>{ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } };
const dk=t=>{ t=new Date(t); return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0'); };
const MK=['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
const mName=m=>{ const [y,mm]=m.split('-'); return 'ខែ'+MK[+mm-1]+' '+y; };
const fmt=s=>{ const m=Math.round((s||0)/60); return m<60? m+' នាទី' : Math.floor(m/60)+' ម៉ោង'+(m%60?' '+m%60+' នាទី':''); };
let T='week', OFF=0, MON=null;

/* ---- the student's own summary → shared board (small, synced) ---- */
function push(S, force){
  if(!window.Auth||Auth.role()!=='student') return; const me=Auth.user(); if(!me||!S) return;
  if(!force && Date.now()-(push.t||0)<90000) return; push.t=Date.now();
  const cut=dk(Date.now()-70*864e5), d={}; Object.entries((S.act&&S.act.d)||{}).forEach(([k,v])=>{ if(k>=cut) d[k]=v; });
  const lv=Object.values(S.level||{}), e={c:me.classId, s:me.studentId, d, p:lv.filter(v=>v>=80).length, l:lv.length?Math.round(lv.reduce((a,b)=>a+b,0)/lv.length):0, w:Object.values(S.known||{}).reduce((a,x)=>a+x.length,0)};
  const B=J(BK)||{}, old=B[me.id]; if(old){ const o={...old}; delete o.ts; if(JSON.stringify(o)===JSON.stringify(e)) return; }
  B[me.id]={...e, ts:Date.now()}; try{ localStorage.setItem(BK, JSON.stringify(B)); }catch(x){}
}

/* ---- one row per student: board entry, or (staff) live progress ---- */
function rows(c){
  const B=J(BK)||{}, users=(window.Auth&&Auth.data().users)||[], staff=window.Auth&&Auth.role()!=='student';
  return c.students.map(s=>{ const u=users.find(x=>x.role==='student'&&x.classId===c.id&&x.studentId===s.id); let e=u&&B[u.id];
    const P=staff&&u&&J('beginner-studio-v1:'+u.id);
    if(P){ const lv=Object.values(P.level||{}); e={d:(P.act&&P.act.d)||{}, p:lv.filter(v=>v>=80).length, l:lv.length?Math.round(lv.reduce((a,b)=>a+b,0)/lv.length):0, w:Object.values(P.known||{}).reduce((a,x)=>a+x.length,0)}; }
    return {s, uid:u&&u.id, e:e||{d:{},p:0,l:0,w:0}}; });
}
function weekRange(off){ const n=new Date(); n.setHours(12,0,0,0); const dow=(n.getDay()+6)%7; const a=new Date(n.getTime()-(dow+7*off)*864e5); return [dk(a), dk(a.getTime()+6*864e5)]; }
function monthKey(off){ const n=new Date(); const d=new Date(n.getFullYear(), n.getMonth()-off, 15); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); }
function rankBy(list, val, tie){ const r=list.map(x=>({...x, v:val(x), t:tie?tie(x):0})).sort((a,b)=>b.v-a.v||b.t-a.t);
  r.forEach((x,i)=>{ x.rank = !x.v ? null : i>0&&r[i-1].v===x.v&&r[i-1].t===x.t ? r[i-1].rank : i+1; }); return r; }

const av=(s,n)=>window.Class&&Class._avatar?Class._avatar(s,n):'';
function board(list, meSid, label, unit){
  const top=list.filter(x=>x.rank&&x.rank<=3).slice(0,3), pod=[top[1],top[0],top[2]];
  if(!list.some(x=>x.rank)) return `<div class="rk-empty"><div>🌱</div><p>មិនទាន់មានអ្នករៀន${label}ទេ — ចាប់ផ្តើមរៀនឥឡូវ ដើម្បីក្លាយជាលេខ ១!</p></div>`;
  return `<div class="cl-podium rk-pod">${pod.map((r,k)=>r?`<div class="pd p${[2,1,3][k]}"><div class="crown">${['🥈','🥇','🥉'][k]}</div>${av(r.s,[60,78,56][k])}<b>${esc(r.s.name)}</b><span>${unit(r)}</span><div class="base">${r.rank}</div></div>`:'<div class="pd empty"></div>').join('')}</div>
    <div class="rk-list">${list.map(r=>`<div class="rk-row ${r.s.id===meSid?'me':''} ${r.rank?'':'zero'}"><span class="rk r${r.rank&&r.rank<=3?r.rank:0}">${r.rank||'—'}</span>${av(r.s,36)}<b>${esc(r.s.name)}${r.s.id===meSid?' <em>(ខ្ញុំ)</em>':''}</b><i>${r.rank?unit(r):'—'}</i></div>`).join('')}</div>`;
}

function page(el, c, opt){
  opt=opt||{}; const staff=!!opt.staff, meSid=window.Auth&&Auth.role()==='student'?Auth.user().studentId:null;
  if(!c){ el.innerHTML='<div class="panel cl-empty"><p class="km">មិនទាន់មានថ្នាក់</p></div>'; return; }
  const sh=c.share||{}, R=rows(c);
  const tabs=[['week','📅 សប្តាហ៍'],['month','🗓 ខែ'],['level','⭐ Level']];
  if(sh.res||staff) tabs.push(['res','🏅 លទ្ធផលប្រចាំខែ']); if(sh.year||staff) tabs.push(['year','📈 សរុបឆ្នាំ']);
  if(!tabs.some(t=>t[0]===T)) T='week';
  let body='', sub='';
  if(T==='week'){ const [a,b]=weekRange(OFF); sub=`<div class="rk-sub"><button class="chip ${OFF===0?'on':''}" onclick="Rank.set('week',0)">សប្តាហ៍នេះ</button><button class="chip ${OFF===1?'on':''}" onclick="Rank.set('week',1)">សប្តាហ៍មុន</button><span>${a.slice(5).split('-').reverse().join('/')} – ${b.slice(5).split('-').reverse().join('/')}</span></div>`;
    body=board(rankBy(R, x=>Object.entries(x.e.d||{}).reduce((t,[k,v])=>k>=a&&k<=b?t+v:t,0)), meSid, 'សប្តាហ៍នេះ', r=>'⏱ '+fmt(r.v)); }
  else if(T==='month'){ const m=monthKey(OFF); sub=`<div class="rk-sub"><button class="chip ${OFF===0?'on':''}" onclick="Rank.set('month',0)">ខែនេះ</button><button class="chip ${OFF===1?'on':''}" onclick="Rank.set('month',1)">ខែមុន</button><span>${mName(m)}</span></div>`;
    body=board(rankBy(R, x=>Object.entries(x.e.d||{}).reduce((t,[k,v])=>k.startsWith(m)?t+v:t,0)), meSid, 'ខែនេះ', r=>'⏱ '+fmt(r.v)); }
  else if(T==='level'){ sub=`<div class="rk-sub"><span>តម្រៀបតាមចំនួន Unit ដែលឆ្លងកម្រិត (🏁 ≥80%) បន្ទាប់មកពិន្ទុមធ្យម</span></div>`;
    body=board(rankBy(R, x=>x.e.p||0, x=>(x.e.l||0)*1000+(x.e.w||0)), meSid, '', r=>`⭐ Level ${r.v} • ${r.e.l||0}%`); }
  else { const isRes=T==='res', on=isRes?sh.res:sh.year;
    sub=staff?`<div class="rk-share ${on?'on':''}"><span>${on?'👁 សិស្សកំពុងមើលឃើញផ្ទាំងនេះ':'🙈 សិស្សមិនទាន់មើលឃើញផ្ទាំងនេះទេ'}</span><button class="btn sm ${on?'ghost':'teal'}" onclick="Rank.share('${isRes?'res':'year'}')">${on?'🔒 បិទវិញ':'👁 បើកឱ្យសិស្សមើល'}</button></div>`:'';
    body=isRes?resView(c,meSid):yearView(c,meSid); }
  el.innerHTML=`<div class="rk-wrap">${opt.head===false?'':`<div class="stu-head"><h2>🏆 ចំណាត់ថ្នាក់</h2><small>${esc(c.name)}</small></div>`}
    <div class="rk-tabs">${tabs.map(([k,t])=>`<button class="${k===T?'on':''}" onclick="Rank.set('${k}',0)">${t}</button>`).join('')}</div>${sub}${body}</div>`;
}
function resView(c, meSid){
  const ms=Class._months(c); if(!ms.length) return '<div class="rk-empty"><div>📭</div><p>មិនទាន់មានពិន្ទុប្រចាំខែ</p></div>';
  const m=MON&&ms.includes(MON)?MON:ms[ms.length-1], R=Class._results(c,m), mt=Class._maxTotal(c);
  return `<div class="rk-sub">${ms.slice(-6).map(x=>`<button class="chip ${x===m?'on':''}" onclick="Rank.month('${x}')">${mName(x)}</button>`).join('')}</div>`+
    board(R.map(r=>({...r, v:r.p||0})), meSid, '', r=>`${+r.t.toFixed(2)}/${mt} • ${Math.round(r.p)}% ${Class._grade(r.p)[1]}`);
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
function set(t,o){ T=t; OFF=o||0; redraw(); }
function month(m){ MON=m; redraw(); }
function redraw(){ if(target) target(); }
function share(k){ Class._share(k); redraw(); }
window.Rank={ push, page, stuPage, set, month, share, _target:f=>{ target=f; }, key:BK };
})();
