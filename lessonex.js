// =====================================================================
//  lessonex.js — ✍️ លំហាត់តាមផ្នែកនីមួយៗនៃមេរៀន (រៀនផង ធ្វើលំហាត់ផង)
//  • ចេញពីខ្លឹមសារផ្នែកនោះ (ពាក្យ ឃ្លា វេយ្យាករណ៍) + ប្រយោគបរិបទកម្ពុជា (ctx.js)
//  • ធ្វើបានច្រើនដងមិនកំណត់ — ខុសសាកម្តងទៀតរហូតដល់ត្រូវ • កត់ «ត្រូវលើកទីមួយ» ដើម្បីដឹងសមត្ថភាព
// =====================================================================
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuf = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const pick = (a,k) => shuf(a).slice(0,k);
const clean = t => String(t).replace(/\(.*?\)/g,'').replace(/\s+/g,' ').trim();
const words = t => clean(t).split(' ').filter(Boolean);
const MAX = 6;

/* ---------- build items for one section ---------- */
function vocabPoolOf(n){ return UNITS[n-1].vocab.filter(v=>v[0]&&v[2]&&!/[→↔\/]/.test(v[0])); }
function mcWord(n, w){   // w = [en, km, emoji]
  const pool=vocabPoolOf(n), others=pick(pool.filter(v=>v[0]!==w[0]&&v[2]!==w[1]),3);
  return Math.random()<.5
    ? {t:'mc', q:`${w[2]?w[2]+' ':''}<b>${esc(w[0])}</b> មានន័យថា…`, say:w[0], opts:shuf([w[1],...others.map(v=>v[2])]), a:w[1], km:true}
    : {t:'mc', q:`${w[2]?w[2]+' ':''}«${esc(w[1])}» ជាភាសាអង់គ្លេស៖`, opts:shuf([w[0],...others.map(v=>v[0])]), a:w[0], sayAns:true};
}
function mcPhrase(n, ph, all){
  const others=pick(all.filter(p=>p[0]!==ph[0]&&p[1]),3).map(p=>p[1]);
  if(others.length<2) return null;
  return {t:'mc', q:`<b>${esc(ph[0])}</b>`, say:ph[0], opts:shuf([ph[1],...others]), a:ph[1], km:true};
}
function orderItem(sentence, km){
  const w=words(sentence); if(w.length<3 || w.length>9) return null;
  let s=shuf(w), g=0; while(s.join(' ')===w.join(' ') && g++<5) s=shuf(w);
  return {t:'order', q:km?`រៀបពាក្យឱ្យត្រូវ៖ <span class="km">${esc(km)}</span>`:'រៀបពាក្យឱ្យទៅជាប្រយោគត្រឹមត្រូវ៖', tiles:s, a:w.join(' ')};
}
function ctxItem(c){ return {t:'mc', q:esc(c[0]).replace('___','<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'), hint:c[3], opts:shuf([c[1],...c[2]]), a:c[1], full:c[0].replace('___',c[1]), ctx:true}; }
function build(n, si){
  const L=LESSONS[n], s=L.sections[si], C=(window.CTX||{})[n]||{}, allPh=L.sections.flatMap(x=>x.ph||[]), out=[];
  if(s.k==='review'){
    const gs=Object.keys(C).filter(k=>/^\d+$/.test(k)).flatMap(k=>C[k]);
    pick(gs,3).forEach(c=>out.push(ctxItem(c)));
    pick(L.sections.flatMap(x=>x.w||[]),2).forEach(w=>out.push(mcWord(n,w)));
    const ph=pick(allPh.filter(p=>words(p[0]).length>=3&&words(p[0]).length<=8),1)[0]; if(ph){ const o=orderItem(ph[0],ph[1]); if(o) out.push(o); }
    return out.slice(0,MAX);
  }
  (s.g||[]).forEach(gi=>{ (C[gi]||[]).slice(0,3).forEach(c=>out.push(ctxItem(c)));
    const g=L.grammar[gi]; if(g&&g.err&&g.err.length){ const e=g.err[0]; out.push({t:'mc', q:'ប្រយោគណាត្រឹមត្រូវ? <small>Which sentence is correct?</small>', opts:shuf([e[1],e[0]]), a:e[1], sayAns:true}); }
    if(g&&g.ex&&g.ex.length){ const o=orderItem(g.ex[Math.floor(Math.random()*g.ex.length)]); if(o) out.push(o); } });
  if(s.w&&s.w.length>=2) pick(s.w,Math.min(3,MAX-out.length)).forEach(w=>out.push(mcWord(n,w)));
  if(s.ph&&s.ph.length){ const p=pick(s.ph,1)[0]; const m=mcPhrase(n,p,allPh); if(m&&out.length<MAX) out.push(m);
    const op=pick(s.ph.filter(p=>words(p[0]).length>=3&&words(p[0]).length<=8),1)[0]; if(op&&out.length<MAX){ const o=orderItem(op[0],op[1]); if(o) out.push(o); } }
  if(!out.length && (s.k==='open'||s.k==='read'||s.k==='listen'||s.k==='speak'||s.k==='write')){
    const ws=pick(s.w||L.sections.flatMap(x=>x.w||[]),3); ws.forEach(w=>out.push(mcWord(n,w)));
  }
  return shuf(out).slice(0,MAX);
}

/* ---------- state ---------- */
let CUR={};   // key → {items, st:[{ok, first, tries}], sel:{i:[tileIdx...]}}
const key=(n,si)=>n+'-'+si;
function rec(n,si){ S.ex=S.ex||{}; S.ex[n]=S.ex[n]||{}; return S.ex[n][si]; }
function passed(n,si){ const r=rec(n,si); return !!(r&&r.done); }
function has(n,si){ const k=key(n,si); if(!CUR[k]) CUR[k]=fresh(n,si); return CUR[k].items.length>0; }
function fresh(n,si){ const items=build(n,si); return {items, st:items.map(()=>({ok:false, first:null, tries:0})), sel:{}}; }

/* ---------- render ---------- */
function block(n, si){
  const k=key(n,si); if(!CUR[k]) CUR[k]=fresh(n,si); const E=CUR[k]; if(!E.items.length) return '';
  const okN=E.st.filter(x=>x.ok).length, firstN=E.st.filter(x=>x.first===true).length, all=okN===E.items.length, r=rec(n,si);
  return `<div class="lex" id="lex-${k}"><div class="lex-h"><b>✍️ លំហាត់ផ្នែកនេះ</b><span>${okN}/${E.items.length}</span></div>
    <div class="lex-bar"><i style="width:${okN/E.items.length*100}%"></i></div>
    ${E.items.map((it,i)=>itemHtml(n,si,it,i,E)).join('')}
    ${all?`<div class="lex-done"><span>${firstN===E.items.length?'🏆':'🎉'}</span><div><b>ត្រូវទាំងអស់!</b><small>ត្រូវលើកទីមួយ ${firstN}/${E.items.length}${r&&r.best!=null?` • ល្អបំផុត ${r.best}/${r.t}`:''}</small></div><button class="btn ghost sm" onclick="LEX.again(${n},${si})">↺ ធ្វើម្តងទៀត</button></div>`
      :`<p class="lex-tip">💡 ខុសមិនអីទេ — សាកម្តងទៀតរហូតដល់ត្រូវ</p>`}</div>`;
}
function itemHtml(n,si,it,i,E){
  const st=E.st[i], k=key(n,si), say=t=>`speak(${JSON.stringify(t).replace(/"/g,'&quot;')})`;
  const head=`<div class="lex-q"><span class="no ${st.ok?'ok':''}">${st.ok?'✓':i+1}</span><div>${it.q}${it.say?` <button class="lex-say" onclick="${say(it.say)}">🔊</button>`:''}${it.hint&&!st.ok?`<small class="km lex-hint">${esc(it.hint)}</small>`:''}</div></div>`;
  if(it.t==='mc'){
    return `<div class="lex-i ${st.ok?'done':''}" data-i="${i}">${head}<div class="lex-o ${it.km?'km':''}">${it.opts.map((o,j)=>`<button class="${st.ok&&o===it.a?'right':''}" ${st.ok?'disabled':''} onclick="LEX.mc('${k}',${i},${j},this)">${esc(o)}</button>`).join('')}</div>
      ${st.ok&&(it.full||it.sayAns)?`<div class="lex-fb">✅ ${esc(it.full||it.a)} <button class="lex-say" onclick="${say(it.full||it.a)}">🔊</button></div>`:''}</div>`;
  }
  const sel=E.sel[i]||[];
  return `<div class="lex-i ${st.ok?'done':''}" data-i="${i}">${head}
    <div class="lex-ans">${st.ok?`<b>${esc(it.a)}</b> <button class="lex-say" onclick="${say(it.a)}">🔊</button>`:sel.map((t,p)=>`<button onclick="LEX.untile('${k}',${i},${p})">${esc(it.tiles[t])}</button>`).join('')||'<span class="ph">ចុចពាក្យខាងក្រោម…</span>'}</div>
    ${st.ok?'':`<div class="lex-tiles">${it.tiles.map((w,t)=>`<button ${sel.includes(t)?'disabled':''} onclick="LEX.tile('${k}',${i},${t})">${esc(w)}</button>`).join('')}</div>
    <div class="lex-row"><button class="btn ghost sm" onclick="LEX.clearT('${k}',${i})">↺ សម្អាត</button><button class="btn teal sm" ${sel.length===it.tiles.length?'':'disabled'} onclick="LEX.checkT('${k}',${i})">✓ ពិនិត្យ</button></div>`}</div>`;
}
function rerender(k){ const [n,si]=k.split('-').map(Number), el=document.getElementById('lex-'+k); if(el) el.outerHTML=block(n,si); refreshFoot(n,si); }
function refreshFoot(n,si){ const b=document.querySelector(`[data-lexfoot="${n}-${si}"]`); if(b){ const ok=!has(n,si)||passed(n,si)||(CUR[key(n,si)]&&CUR[key(n,si)].st.every(x=>x.ok)); b.disabled=!ok; b.classList.toggle('lockd',!ok); } }
function mark(k,i,ok){
  const E=CUR[k], st=E.st[i]; st.tries++; if(st.first===null) st.first=ok; if(ok) st.ok=true;
  if(typeof beep==='function') beep(ok);
  if(E.st.every(x=>x.ok)){ const [n,si]=k.split('-').map(Number); const f=E.st.filter(x=>x.first).length, r=rec(n,si)||{};
    S.ex[n][si]={done:true, t:E.items.length, last:f, best:Math.max(r.best||0,f), n:(r.n||0)+1, ts:Date.now()}; save();
    if(typeof track==='function') track('ex', n+':'+si+':'+f+'/'+E.items.length); }
}
function mc(k,i,j,btn){
  const E=CUR[k], it=E.items[i], o=it.opts[j], ok=o===it.a; mark(k,i,ok);
  if(ok){ rerender(k); if(it.sayAns||it.full) speak(it.full||it.a); }
  else { btn.classList.add('wrong'); btn.disabled=true; const el=btn.closest('.lex-i'); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
}
function tile(k,i,t){ const E=CUR[k]; (E.sel[i]=E.sel[i]||[]).push(t); rerender(k); }
function untile(k,i,p){ CUR[k].sel[i].splice(p,1); rerender(k); }
function clearT(k,i){ CUR[k].sel[i]=[]; rerender(k); }
function checkT(k,i){
  const E=CUR[k], it=E.items[i], got=(E.sel[i]||[]).map(t=>it.tiles[t]).join(' '), ok=got===it.a; mark(k,i,ok);
  if(ok){ rerender(k); speak(it.a); }
  else { E.sel[i]=[]; rerender(k); const el=document.querySelector(`#lex-${k} .lex-i[data-i="${i}"]`); if(el){ el.classList.add('shake'); el.insertAdjacentHTML('beforeend','<div class="lex-fb no">❌ មិនទាន់ត្រូវ — សាកម្តងទៀត</div>'); } }
}
function again(n,si){ CUR[key(n,si)]=fresh(n,si); rerender(key(n,si)); }

window.LEX = { block, has, passed, again, mc, tile, untile, clearT, checkT, refreshFoot,
  ready:(n,si)=>!has(n,si) || passed(n,si) || (CUR[key(n,si)]&&CUR[key(n,si)].st.every(x=>x.ok)) };
})();
