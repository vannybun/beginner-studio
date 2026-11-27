// =====================================================================
//  book.js — សៀវភៅឌីជីថល (Digital Book) • ទំព័រពិតពី PDF របស់អ្នក + ផ្ទាំងជំនួយ
//  Keys: → PageDown Space = ទំព័របន្ទាប់ • ← PageUp = ទំព័រមុន • + / − ពង្រីក
//        A = ចាក់សំឡេង • H = បង្ហាញ/លាក់ចម្លើយគ្រូ • D = គូរ • F5 = ពេញអេក្រង់ • Esc = ចេញ
// =====================================================================
(function(){
const LASTP = () => (window.COURSE&&COURSE.sg) ? COURSE.last : 146;   // last book page (pdf page 147)
const img = p => { if(window.COURSE&&COURSE.sg) return COURSE.img(p); const f='p-' + String(p+1).padStart(3,'0') + '.jpg'; return (window.MEDIA&&MEDIA.book[f]) || 'book/'+f; };
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = s => document.querySelector(s);
const NK = 'beginner-studio-notes-v1' + ((window.COURSE&&COURSE.sg) ? ':sg'+COURSE.sg : '');
let NOTES = {}; try{ NOTES = JSON.parse(localStorage.getItem(NK)||'{}'); }catch(e){}
const saveNotes = () => { try{ localStorage.setItem('beginner-studio-notes-v1'+((window.COURSE&&COURSE.sg)?':sg'+COURSE.sg:''), JSON.stringify(NOTES)); }catch(e){} };

const B = { spreads:[], si:0, single:false, zoom:1, tab:'help', pen:false, color:'#ef4444', size:4, ink:{}, showAns:false, open:false };

function buildSpreads(){
  const s = B.single ? Array.from({length:LASTP()+1},(_,p)=>[p]) : [[0],[1]];
  if(!B.single) for(let p=2;p<=LASTP();p+=2) s.push(p+1<=LASTP() ? [p,p+1] : [p]);
  B.spreads = s;
}
const spreadOf = p => B.spreads.findIndex(s=>s.includes(p));
const pages = () => B.spreads[B.si] || [0];
const unitOf = p => (window.UNITS||[]).find(u=>p>=u.start-0 && p<=u.end) || null;
function sectionAt(u,p){ const L=LESSONS[u.n]; let cur=null; L.sections.forEach((s,i)=>{ if(s.p<=p) cur={s,i}; }); return cur; }

/* ---------------- open / close ---------------- */
function open(page){
  if(window.COURSE&&COURSE.sg&&!B._sgReady){ B._sgReady=true; return COURSE.loadPages().then(()=>open(page)); }
  if(window.COURSE&&COURSE.sg){ try{ NOTES=JSON.parse(localStorage.getItem('beginner-studio-notes-v1:sg'+COURSE.sg)||'{}'); }catch(e){} }
  if(!B.spreads.length) buildSpreads();
  B.open=true; $('#book').classList.add('show'); document.body.classList.add('book-open');
  go(typeof page==='number' ? page : (Math.min(S.bookPage||(window.COURSE&&COURSE.first)||7, LASTP())), 0);
}
function close(){ B.open=false; $('#book').classList.remove('show'); document.body.classList.remove('book-open'); if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); }
function go(p, dir){
  p = Math.max(0, Math.min(LASTP(), p));
  const ni = spreadOf(p); if(ni<0) return;
  dir = dir==null ? (ni>B.si?1:ni<B.si?-1:0) : dir;
  B.si = ni; S.bookPage = pages()[0]; save();
  draw(dir);
}
function next(){ if(B.si < B.spreads.length-1){ B.si++; S.bookPage=pages()[0]; save(); draw(1); } }
function prev(){ if(B.si > 0){ B.si--; S.bookPage=pages()[0]; save(); draw(-1); } }

/* ---------------- draw the spread ---------------- */
function draw(dir){
  const ps = pages(), st = $('#bkStage');
  const u = unitOf(ps[ps.length-1]) || unitOf(ps[0]);
  const style = u ? UNIT_STYLE[u.n] : {c1:'#0f766e',c2:'#14b8a6'};
  $('#book').style.setProperty('--c1', style.c1); $('#book').style.setProperty('--c2', style.c2);
  st.className = 'bk-stage ' + (dir>0?'flip-next':dir<0?'flip-prev':'flip-0') + (ps.length===1?' one':'');
  void st.offsetWidth;
  st.innerHTML = `<div class="bk-spread ${ps.length===1?'one':'two'}" style="--z:${B.zoom}">${ps.map((p,k)=>`
     <div class="bk-page ${ps.length===2?(k===0?'left':'right'):'solo'}" data-p="${p}">
       <img src="${img(p)}" alt="Student's Book page ${p}" draggable="false" onerror="Book.miss(this)">
       <canvas class="bk-ink"></canvas>
       <div class="bk-pno">${p===0?'Cover':'p'+p}</div>
       ${NOTES[p] ? `<div class="bk-ans ${B.showAns?'on':''}"><b>📝 ចម្លើយ p${p}</b><div>${esc(NOTES[p]).replace(/\n/g,'<br>')}</div></div>` : ''}
     </div>`).join('')}</div>`;
  st.querySelectorAll('.bk-page').forEach(pg=>{ const im=pg.querySelector('img'); const fit=()=>{ sizeInk(pg); }; im.complete?fit():im.onload=fit; });
  $('#bkPno').value = ps.join('–');
  $('#bkRange').value = ps[0];
  $('#bkUnit').textContent = u ? `Unit ${u.n} • ${u.en}` : (ps[0]<7?'Contents':'Pair work • Audioscripts');
  $('#bkSec').textContent = u ? (()=>{ const c=sectionAt(u,ps[ps.length-1]); return c ? `${KIND[c.s.k].i} ${c.s.t}` : ''; })() : '';
  $('#bkZoomV').textContent = Math.round(B.zoom*100)+'%';
  $('#bkSingle').classList.toggle('on', B.single);
  $('#bkPenBtn').classList.toggle('on', B.pen);
  $('#bkAnsBtn').classList.toggle('on', B.showAns);
  st.classList.toggle('pen', B.pen);
  // preload neighbours
  [B.si+1,B.si-1].forEach(i=>(B.spreads[i]||[]).forEach(p=>{ const im=new Image(); im.src=img(p); }));
  drawPanel();
  drawThumbsCur();
}

/* ---------------- ink (pen / highlighter) ---------------- */
function sizeInk(pg){
  const c=pg.querySelector('canvas'), im=pg.querySelector('img'), p=+pg.dataset.p;
  c.width=im.clientWidth*2; c.height=im.clientHeight*2;
  const ctx=c.getContext('2d'); ctx.scale(2,2);
  (B.ink[p]||[]).forEach(s=>stroke(ctx,s,im.clientWidth,im.clientHeight));
}
function stroke(ctx,s,w,h){
  ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle=s.c; ctx.lineWidth=s.w*(w/700);
  if(s.hl){ ctx.globalAlpha=.35; ctx.lineWidth=s.w*3*(w/700); }
  ctx.beginPath(); s.pts.forEach((q,i)=> i?ctx.lineTo(q[0]*w,q[1]*h):ctx.moveTo(q[0]*w,q[1]*h)); ctx.stroke(); ctx.restore();
}
let drawing=null;
function inkDown(e){
  if(!B.pen) return; const pg=e.target.closest('.bk-page'); if(!pg) return;
  e.preventDefault(); const r=pg.querySelector('img').getBoundingClientRect(), p=+pg.dataset.p;
  drawing={pg,p,r,s:{c:B.color,w:B.size,hl:B.color==='hl',pts:[]}};
  if(drawing.s.hl) drawing.s.c='#facc15';
  (B.ink[p]=B.ink[p]||[]).push(drawing.s); inkMove(e);
}
function inkMove(e){
  if(!drawing) return; const t=e.touches?e.touches[0]:e, r=drawing.r;
  drawing.s.pts.push([(t.clientX-r.left)/r.width,(t.clientY-r.top)/r.height]);
  const c=drawing.pg.querySelector('canvas'), ctx=c.getContext('2d');
  ctx.setTransform(2,0,0,2,0,0); ctx.clearRect(0,0,c.width,c.height);
  (B.ink[drawing.p]||[]).forEach(s=>stroke(ctx,s,r.width,r.height));
}
function inkUp(){ drawing=null; }
function inkClear(){ pages().forEach(p=>delete B.ink[p]); draw(0); }
function inkUndo(){ const ps=pages(); for(let i=ps.length-1;i>=0;i--){ const a=B.ink[ps[i]]; if(a&&a.length){ a.pop(); break; } } draw(0); }

/* ---------------- companion panel ---------------- */
function practiceFor(u, ps){
  const L=LESSONS[u.n], items=[];
  // grammar points on these pages → "Which is correct?" + gap-fill (original items, instant answers)
  L.grammar.filter(g=>ps.includes(g.p)).forEach(g=>{
    (g.err||[]).forEach(e=>{ const right=Math.random()<.5; items.push({t:'mc',tag:g.t,q:'Which sentence is correct?',o:right?[e[1],e[0]]:[e[0],e[1]],a:right?0:1}); });
    const keys=new Set((g.t+' '+(g.form||[]).flat().join(' ')).toLowerCase().replace(/[^a-z' ]/g,' ').split(/\s+/).filter(w=>w.length>1 && !['and','the','or','with','to','noun','verb'].includes(w)));
    g.ex.forEach(ex=>{
      const words=ex.split(' '); const idx=words.findIndex(w=>keys.has(w.toLowerCase().replace(/[^a-z']/g,'')));
      if(idx<0) return; const ans=words[idx].replace(/[^A-Za-z']/g,'');
      const pool=[...keys].filter(k=>k!==ans.toLowerCase()); if(pool.length<2) return;
      const opts=shuffle([ans, ...shuffle(pool).slice(0,2)]);
      items.push({t:'mc',tag:g.t,q:words.map((w,i)=>i===idx?w.replace(/[A-Za-z']+/,'_____'):w).join(' '),o:opts,a:opts.indexOf(ans)});
    });
  });
  // vocabulary / phrases in sections on these pages → reveal cards
  L.sections.filter(s=>ps.includes(s.p)).forEach(s=>{
    (s.w||[]).filter(w=>!/^\d+$/.test(w[2])).slice(0,8).forEach(w=>items.push({t:'card',tag:'Vocabulary',front:w[2]+'  '+w[1],back:w[0],say:w[0]}));
    (s.ph||[]).slice(0,6).forEach(p=>items.push({t:'card',tag:'Useful language',front:p[1],back:p[0],say:p[0],km:true}));
  });
  // unit quiz on the Grammar reference / Wordlist page
  if(ps.includes(u.wl)) u.quiz.forEach(q=>items.push({t:'mc',tag:'Unit quiz',q:q.q,o:q.o,a:q.a}));
  return items;
}
function groupsOf(ps){ const g=[]; ps.forEach(p=>{ const u=unitOf(p); if(!u) return; const x=g.find(y=>y.u===u); x?x.ps.push(p):g.push({u,ps:[p]}); }); return g; }
function helpHtml(u, ps){
  const L=LESSONS[u.n], tr=TRACKS.filter(t=>t.unit===u.n);
  const onP=tr.filter(t=>ps.includes(t.page));
  const secs=L.sections.filter(s=>ps.includes(s.p));
  const cur=sectionAt(u,ps[0]); if(cur && !secs.includes(cur.s)) secs.unshift(cur.s);
  const gs=L.grammar.filter(g=>ps.includes(g.p));
  const isWL=ps.includes(u.wl);
  return `<div class="bk-uhead" style="--c1:${UNIT_STYLE[u.n].c1};--c2:${UNIT_STYLE[u.n].c2}">${UNIT_STYLE[u.n].icon} Unit ${u.n} • ${esc(u.en)} <small>p${ps.join(', ')}</small></div>
    ${secs.map(s=>`<div class="bk-sec"><span class="ki">${KIND[s.k].i}</span><div><small>p${s.p} • ${KIND[s.k].en}</small><b>${esc(s.t)}</b><p>${s.km}</p></div></div>`).join('')}
    <h4>🎧 សំឡេងក្នុងទំព័រនេះ ${onP.length?'('+onP.length+')':''}</h4>
    ${onP.length?`<div class="bk-trs">${onP.map(t=>`<button onclick="P.load(TRACKS.filter(x=>x.unit===${u.n}),${tr.indexOf(t)})"><span>▶</span><b>${t.id}</b><small>${esc(t.text)}</small><i>p${t.page}</i></button>`).join('')}</div>`:'<p class="bk-mute">គ្មានសំឡេងក្នុងទំព័រនេះ</p>'}
    ${gs.length?`<h4>${window.COURSE&&COURSE.sg?'🔊 សំឡេង Phonics':'📐 វេយ្យាករណ៍'}</h4>${gs.map(g=>`<div class="bk-g"><b>${esc(g.t)}</b><p>${g.km}</p>${g.form?`<table>${g.form.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`:''}${(g.more||[]).slice(0,2).map(m=>`<div class="tip">💡 ${m}</div>`).join('')}</div>`).join('')}`:''}
    ${isWL?`<h4>📒 Wordlist — ${u.vocab.length} ពាក្យ</h4><div class="bk-wl">${u.vocab.map(v=>`<button onclick="speak(${attr(v[0])})"><b>${esc(v[0])}</b><span>${v[2]}</span></button>`).join('')}</div>`:''}
    <div class="bk-actions"><button class="btn sm teal" onclick="Book.close();Deck.open(${u.n},${ps[0]})">▶ ស្លាយទំព័រនេះ</button><button class="btn sm ghost" onclick="Book.close();go('unit',${u.n},'path')">📚 Unit ${u.n}</button></div>`;
}
function drawPanel(){
  const ps=pages(), groups=groupsOf(ps), el=$('#bkPanel');
  const tabs=[['help','🧭 ជំនួយ'],['practice','✅ លំហាត់'],['answers','📝 ចម្លើយគ្រូ']];
  let body='';
  if(B.tab==='answers'){
    body = `<p class="bk-mute">វាយចម្លើយលំហាត់សៀវភៅសម្រាប់ទំព័រនីមួយៗ (ពី Teacher's Guide ឬរបស់អ្នក)។ រក្សាទុកដោយស្វ័យប្រវត្តិ។ ចុច <kbd>H</kbd> ឬ 👁 ដើម្បីបង្ហាញលើទំព័រភ្លាមៗ។</p>` +
      ps.map(p=>`<div class="bk-note"><label>📝 ទំព័រ ${p}</label><textarea data-p="${p}" placeholder="ឧ. 1 am  2 is  3 are …" oninput="Book.note(${p},this.value)">${esc(NOTES[p]||'')}</textarea></div>`).join('') +
      `<div class="bk-actions"><button class="btn sm ${B.showAns?'sun':'teal'}" onclick="Book.toggleAns()">👁 ${B.showAns?'លាក់ចម្លើយ':'បង្ហាញចម្លើយលើទំព័រ'}</button>
        <button class="btn sm ghost" onclick="Book.exportNotes()">⬇ Backup</button>
        <label class="btn sm ghost">⬆ Restore<input type="file" accept=".json" hidden onchange="Book.importNotes(this.files[0])"></label></div>
        <p class="bk-mute">ទំព័រដែលមានចម្លើយ៖ ${Object.keys(NOTES).filter(k=>NOTES[k]).sort((a,b)=>a-b).map(k=>`<a href="#" onclick="Book.go(${k});return false">p${k}</a>`).join(', ')||'—'}</p>`;
  } else if(!groups.length){
    body=`<div class="bk-empty">📖 ${ps[0]===0?'Cover':ps[0]<7?'Contents — ជ្រើស Unit ខាងក្រោម':'Pair work / Audioscripts'}</div>
      ${ps[0]<7?`<div class="bk-units">${UNITS.map(x=>`<button onclick="Book.go(${x.start})"><span>${UNIT_STYLE[x.n].icon}</span><b>${x.n}</b> ${esc(x.en)} <i>p${x.start}</i></button>`).join('')}</div>`:''}`;
  } else if(B.tab==='help'){
    body = groups.map(g=>helpHtml(g.u,g.ps)).join('<hr class="bk-hr">');
  } else {
    let n=0; const items=[].concat(...groups.map(g=>practiceFor(g.u,g.ps)));
    body = items.length ? `<p class="bk-mute">លំហាត់បន្ថែម (ថ្មី) ផ្អែកលើចំណុចមេរៀនក្នុងទំព័រនេះ — ចុចចម្លើយ ដើម្បីឃើញភ្លាមៗ។</p>` + items.map((it,i)=> it.t==='mc' ? `
      <div class="bk-q" data-a="${it.a}" style="animation-delay:${Math.min(i,12)*0.04}s"><small>${esc(it.tag)}</small><div class="q">${i+1}. ${esc(it.q)}</div>
        <div class="o">${it.o.map((o,k)=>`<button onclick="Book.ans(this,${k})">${'ABC'[k]}. ${esc(o)}</button>`).join('')}</div></div>` : `
      <div class="bk-card" style="animation-delay:${Math.min(i,12)*0.04}s" onclick="this.classList.toggle('show');speak(${attr(it.say)})"><small>${esc(it.tag)}</small><div class="f ${it.km?'km':''}">${esc(it.front)}</div><div class="b">${esc(it.back)}</div><i>ចុចដើម្បីបង្ហាញចម្លើយ</i></div>`).join('')
      + `<div class="bk-actions"><button class="btn sm ghost" onclick="Book.revealAll()">👁 បង្ហាញចម្លើយទាំងអស់</button><button class="btn sm ghost" onclick="drawPanelReset()">↺ ធ្វើម្តងទៀត</button></div>`
      : `<div class="bk-empty">ទំព័រនេះមិនមានលំហាត់បន្ថែមទេ — សាកមើលទំព័របន្ទាប់ ▶<br><small>ឬបើក ✍️ លំហាត់ក្នុង Unit ${groups[0].u.n}</small></div>`;
  }
  el.innerHTML = `<div class="bk-tabs">${tabs.map(t=>`<button class="${B.tab===t[0]?'on':''}" onclick="Book.tabTo('${t[0]}')">${t[1]}</button>`).join('')}</div><div class="bk-body">${body}</div>`;
}
window.drawPanelReset = drawPanel;
function ans(btn,k){
  const q=btn.closest('.bk-q'); if(q.classList.contains('done')) return; q.classList.add('done');
  const a=+q.dataset.a; q.querySelectorAll('button').forEach((b,i)=>{ if(i===a) b.classList.add('right'); });
  if(k!==a) btn.classList.add('wrong'); window.beep && beep(k===a);
}
function revealAll(){ document.querySelectorAll('.bk-q').forEach(q=>{ if(!q.classList.contains('done')){ q.classList.add('done'); q.querySelectorAll('button')[+q.dataset.a].classList.add('right'); } }); document.querySelectorAll('.bk-card').forEach(c=>c.classList.add('show')); }
function note(p,v){ if(v.trim()) NOTES[p]=v; else delete NOTES[p]; saveNotes(); }
function toggleAns(){ B.showAns=!B.showAns; if(window.COURSE) COURSE.showAns=B.showAns; draw(0); }
function exportNotes(){ const b=new Blob([JSON.stringify(NOTES,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='digital-book-answers.json'; a.click(); }
function importNotes(f){ if(!f) return; f.text().then(t=>{ Object.assign(NOTES,JSON.parse(t)); saveNotes(); draw(0); toast('✅ នាំចូលចម្លើយរួចរាល់'); }).catch(()=>toast('ឯកសារមិនត្រឹមត្រូវ')); }

/* ---------------- thumbnails ---------------- */
function thumbs(){
  const t=$('#bkThumbs'); t.classList.toggle('show');
  if(!t.dataset.ok){ t.dataset.ok=1; t.innerHTML=Array.from({length:LASTP()+1},(_,p)=>{ const u=unitOf(p); return `<button data-p="${p}" onclick="Book.go(${p});Book.thumbs()" style="${u?`--c1:${UNIT_STYLE[u.n].c1}`:''}"><img loading="lazy" src="${img(p)}" alt=""><span>${p===0?'Cover':'p'+p}</span></button>`; }).join(''); }
  drawThumbsCur();
}
function drawThumbsCur(){ const ps=pages(); document.querySelectorAll('#bkThumbs button').forEach(b=>b.classList.toggle('cur', ps.includes(+b.dataset.p))); const c=document.querySelector('#bkThumbs button.cur'); if(c && $('#bkThumbs').classList.contains('show')) c.scrollIntoView({block:'nearest',inline:'center'}); }

/* ---------------- toc ---------------- */
function toc(){
  const m=$('#bkToc'); m.classList.toggle('show'); if(!m.classList.contains('show')) return;
  m.innerHTML = `<button onclick="Book.go(2);Book.toc()">📑 Contents p2–5</button>` + UNITS.map(u=>`<details ${unitOf(pages()[0])===u?'open':''}><summary><span>${UNIT_STYLE[u.n].icon}</span> Unit ${u.n} • ${esc(u.en)} <i>p${u.start}</i></summary>
    ${LESSONS[u.n].sections.map(s=>`<button onclick="Book.go(${s.p});Book.toc()"><i>p${s.p}</i> ${KIND[s.k].i} ${esc(s.t)}</button>`).join('')}</details>`).join('') +
    `<button onclick="Book.go(141);Book.toc()">👥 Pair work p141</button><button onclick="Book.go(142);Book.toc()">🎧 Audioscripts p142</button>`;
}

/* ---------------- zoom / pan ---------------- */
function zoom(d){ B.zoom = d===0 ? 1 : Math.max(.6, Math.min(3, +(B.zoom+d).toFixed(2))); const sp=$('.bk-spread'); if(sp) sp.style.setProperty('--z',B.zoom); $('#bkZoomV').textContent=Math.round(B.zoom*100)+'%'; setTimeout(()=>document.querySelectorAll('.bk-page').forEach(sizeInk),260); }
let pan=null;
function panDown(e){ if(B.pen || B.zoom<=1 || e.button!==0) return; const s=$('#bkStage'); pan={x:e.clientX,y:e.clientY,l:s.scrollLeft,t:s.scrollTop}; s.classList.add('grab'); }
function panMove(e){ if(!pan) return; const s=$('#bkStage'); s.scrollLeft=pan.l-(e.clientX-pan.x); s.scrollTop=pan.t-(e.clientY-pan.y); }
function panUp(){ pan=null; const s=$('#bkStage'); s && s.classList.remove('grab'); }

/* ---------------- keys ---------------- */
function key(e){
  if(!B.open) return false;
  if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return true;
  const k=e.key;
  if(['ArrowRight','PageDown',' ','ArrowDown'].includes(k)){ e.preventDefault(); next(); }
  else if(['ArrowLeft','PageUp','ArrowUp','Backspace'].includes(k)){ e.preventDefault(); prev(); }
  else if(k==='+'||k==='=') zoom(.2); else if(k==='-') zoom(-.2); else if(k==='0') zoom(0);
  else if(k==='h'||k==='H') toggleAns();
  else if(k==='d'||k==='D'){ B.pen=!B.pen; draw(0); }
  else if(k==='t'||k==='T') thumbs();
  else if(k==='a'||k==='A'){ const A=document.getElementById('audio'); if(A.src&&!A.paused) A.pause(); else { const u=unitOf(pages()[0]); const tr=u?TRACKS.filter(t=>t.unit===u.n):[]; const i=tr.findIndex(t=>pages().includes(t.page)); if(i>=0) P.load(tr,i); else if(A.src) A.play(); } }
  else if(k==='F5'){ e.preventDefault(); fs(); }
  else if(k==='Home') go(0); else if(k==='End') go(LASTP());
  else if(k==='Escape'){ if($('#bkThumbs').classList.contains('show')) thumbs(); else if($('#bkToc').classList.contains('show')) toc(); else if(!document.fullscreenElement) close(); }
  else return false;
  return true;
}
function fs(){ if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{}); else document.exitFullscreen(); }

/* ---------------- DOM ---------------- */
function init(){
  const el=document.createElement('div'); el.id='book';
  el.innerHTML=`
   <div class="bk-top">
     <button class="bk-x" onclick="Book.close()" title="Close (Esc)">✕</button>
     <div class="bk-title"><b>📖 សៀវភៅឌីជីថល</b><span id="bkUnit"></span><em id="bkSec"></em></div>
     <span class="grow"></span>
     <button onclick="Book.toc()" title="Contents">☰ មាតិកា</button>
     <div class="bk-pg"><button onclick="Book.prev()">◀</button><input id="bkPno" onchange="Book.go(parseInt(this.value)||0)" title="Page"><span>/ ${LASTP()}</span><button onclick="Book.next()">▶</button></div>
     <button id="bkSingle" onclick="Book.toggleSingle()" title="1 / 2 pages">▯▯</button>
     <div class="bk-zoom"><button onclick="Book.zoom(-.2)">−</button><span id="bkZoomV">100%</span><button onclick="Book.zoom(.2)">+</button></div>
     <button id="bkPenBtn" onclick="Book.penToggle()" title="Draw (D)">✏️</button>
     <div class="bk-pens">${['#ef4444','#2563eb','#16a34a','hl'].map(c=>`<button style="--pc:${c==='hl'?'#facc15':c}" class="${c==='hl'?'hl':''}" onclick="Book.color('${c}')" title="${c==='hl'?'Highlighter':'Pen'}"></button>`).join('')}<button onclick="Book.undo()" title="Undo">↶</button><button onclick="Book.clear()" title="Clear">🧽</button></div>
     <button id="bkAnsBtn" onclick="Book.toggleAns()" title="Answers (H)">👁</button>
     <button onclick="Book.thumbs()" title="Thumbnails (T)">▦</button>
     <button onclick="Book.fs()" title="Fullscreen (F5)">⛶</button>
     <button onclick="Book.panelToggle()" title="Panel">◧</button>
   </div>
   <div class="bk-main">
     <div id="bkStage" class="bk-stage"></div>
     <aside id="bkPanel"></aside>
   </div>
   <input type="range" id="bkRange" min="0" max="${LASTP()}" value="7" oninput="Book.go(+this.value)">
   <div id="bkThumbs"></div>
   <div id="bkToc"></div>`;
  document.body.appendChild(el);
  const st=$('#bkStage');
  st.addEventListener('mousedown',e=>{ inkDown(e); panDown(e); });
  window.addEventListener('mousemove',e=>{ inkMove(e); panMove(e); });
  window.addEventListener('mouseup',()=>{ inkUp(); panUp(); });
  st.addEventListener('touchstart',e=>inkDown(e),{passive:false});
  st.addEventListener('touchmove',e=>{ if(drawing){ e.preventDefault(); inkMove(e); } },{passive:false});
  st.addEventListener('touchend',inkUp);
  st.addEventListener('wheel',e=>{ if(e.ctrlKey){ e.preventDefault(); zoom(e.deltaY<0?.1:-.1); } },{passive:false});
  st.addEventListener('dblclick',e=>{ if(!B.pen) zoom(B.zoom>1?0:.8); });
  let sx=null; st.addEventListener('touchstart',e=>{ if(!B.pen) sx=e.touches[0].clientX; },{passive:true});
  st.addEventListener('touchend',e=>{ if(sx==null||B.zoom>1) return; const dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>60) dx<0?next():prev(); sx=null; });
  window.addEventListener('resize',()=>{ if(B.open) document.querySelectorAll('.bk-page').forEach(sizeInk); });
}
function miss(im){
  const pg=im.parentNode; pg.classList.add('missing'); if(!window.IS_WEB||pg.querySelector('.bk-miss')) return;
  const st=window.Auth&&Auth.role()==='student';
  pg.insertAdjacentHTML('afterbegin', st
    ? `<div class="bk-miss"><div class="i">📖</div><b>ទំព័រសៀវភៅមិនមានលើ Website ទេ</b><p>សូមបើកសៀវភៅពិតរបស់អ្នក ទំព័រ ${pg.dataset.p} 🙂<br>ផ្ទាំងជំនួយខាងស្តាំ (សំឡេង វេយ្យាករណ៍ លំហាត់) នៅតែប្រើបាន</p></div>`
    : window.COURSE&&COURSE.sg
    ? `<div class="bk-miss"><div class="i">📂</div><b>ភ្ជាប់ Folder សៀវភៅ Sounds Great ពីកុំព្យូទ័រនេះ</b><p>ជ្រើស Folder <code>1. Sound great</code> (មាន <code>0. Sounds Great Digital Book</code> និង Folder សៀវភៅ ១–៥) — ឯកសារមិនត្រូវបាន Upload ទេ • ភ្ជាប់ម្តង ប្រើបានគ្រប់សៀវភៅ Sounds Great</p><button class="btn teal" onclick="Cloud.pickMedia()">📂 ជ្រើស Folder</button></div>`
    : `<div class="bk-miss"><div class="i">📂</div><b>ភ្ជាប់ Folder សៀវភៅពីកុំព្យូទ័រនេះ</b><p>ជ្រើស Folder <code>Beginner App</code> (មាន book/ និង 2. Beginner Audio) — ឯកសារមិនត្រូវបាន Upload ទេ</p><button class="btn teal" onclick="Cloud.pickMedia()">📂 ជ្រើស Folder</button></div>`);
}
function redraw(){ if(B.open) draw(0); }
window.Book = { miss, redraw, init, open, close, go, next, prev, key, zoom, thumbs, toc, ans, revealAll, note, toggleAns, exportNotes, importNotes, fs, img,
  tabTo(t){ B.tab=t; drawPanel(); }, toggleSingle(){ const p=pages()[0]; B.single=!B.single; buildSpreads(); B.si=spreadOf(p); draw(0); },
  penToggle(){ B.pen=!B.pen; draw(0); }, color(c){ B.color=c; B.pen=true; document.querySelectorAll('.bk-pens button[style]').forEach(b=>b.classList.toggle('on', b.getAttribute('onclick').includes("'"+c+"'"))); draw(0); },
  undo:inkUndo, clear:inkClear, panelToggle(){ $('#book').classList.toggle('nopanel'); document.body.classList.toggle('nopanel'); setTimeout(()=>document.querySelectorAll('.bk-page').forEach(sizeInk),350); }, B };
})();
