// =====================================================================
//  slides.js — ម៉ាស៊ីនស្លាយបង្រៀន (Slide engine) • គាំទ្រ Remote Presenter / Pointer
//  Keys: → ↓ PageDown Space Enter N = បន្ទាប់ • ← ↑ PageUp Backspace P = ថយក្រោយ
//        B / . = អេក្រង់ខ្មៅ • W / , = អេក្រង់ស • F5 = ពេញអេក្រង់ • Esc = ចេញ
//        L = Laser pointer • V = បង្ហាញទំព័រសៀវភៅ • G = ទិដ្ឋភាពស្លាយទាំងអស់ • A = ចាក់សំឡេង
//        Home / End • លេខ + Enter = ទៅស្លាយលេខនោះ
// =====================================================================
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chunk = (a,n) => { const r=[]; for(let i=0;i<a.length;i+=n) r.push(a.slice(i,i+n)); return r; };
const say = t => `data-say="${esc(String(t).replace(/\(.*?\)/g,'').replace(/[→=↔].*$/,'').trim())}"`;
const spk = t => `<button class="s-spk" ${say(t)} title="Listen">🔊</button>`;

/* ---------------- build a deck for one unit (book order) ----------------
   Slides show only lesson content (big & clear). Every teaching instruction — Khmer explanation,
   the book's exercise rubrics with track numbers, how to run the slide — lives in s.note,
   shown in the 📋 notes drawer (button / key I). */
const splitTitle = t => { const parts=String(t).split(/\s+[—•]\s+/); return {main:parts[0], rest:parts.slice(1)}; };
const titleHtml = (t, cls) => { const {main,rest}=splitTitle(t); return `<h2 class="s-h2 ${cls||''} rise">${esc(main)}</h2>${rest.length?`<div class="s-subs rise d2">${rest.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}`; };
const noteBlock = (title, body) => `<div class="dn-b"><h4>${title}</h4>${body}</div>`;
function buildDeck(n){
  const u = UNITS[n-1], L = LESSONS[n], st = UNIT_STYLE[n], tr = TRACKS.filter(t=>t.unit===n);
  const S = [];  // {html, note, steps, sec, page, tracks:[idx], kind}
  const trBetween = (a,b) => tr.filter(t=>t.page>=a && t.page<b);
  const trackBtns = list => list.length ? `<div class="s-tracks">${list.map(t=>`<button class="s-trk" data-track="${tr.indexOf(t)}" title="${esc(t.text)}"><span>▶</span>${t.id}</button>`).join('')}</div>` : '';
  const trackNote = list => list.length ? noteBlock('🎧 លំហាត់ក្នុងសៀវភៅ (Audio)', `<ul class="dn-trk">${list.map(t=>`<li><b>🔊 ${t.id}</b> <span>p${t.page}</span> ${esc(t.text)}</li>`).join('')}</ul>`) : '';
  const how = (...lines) => noteBlock('🎮 របៀបបង្ហាញ', `<ul>${lines.map(x=>`<li>${x}</li>`).join('')}</ul>`);

  // 1. Title
  S.push({kind:'title', page:u.start, sec:'Unit '+n, steps:0, html:`
    <div class="s-title">
      <div class="s-bigicon float">${st.icon}</div>
      <div class="s-unitno pop">UNIT ${n}</div>
      <h1 class="s-h1 rise">${esc(u.en)}</h1>
      <div class="s-kmt rise d2">${u.km}</div>
    </div>`,
    note: noteBlock('🎯 គោលបំណងមេរៀន', `<ul>${u.goals.map(g=>`<li>${g}</li>`).join('')}</ul>`) + noteBlock('📘 សៀវភៅ', `<p>Student's Book ទំព័រ ${u.start}–${u.end}</p>`)});
  // 2. Lesson map
  S.push({kind:'map', page:u.start, sec:'Lesson map', steps:0, html:`
    <h2 class="s-h2 rise">Lesson map</h2>
    <div class="s-map">${L.sections.map((s,i)=>`<div class="s-mapi rise" style="animation-delay:${0.04*i}s"><b>p${s.p}</b><span class="ki">${KIND[s.k].i}</span><span>${esc(splitTitle(s.t).main)}</span></div>`).join('')}</div>`,
    note: noteBlock('🗺 ផែនទីមេរៀន', '<p>បង្ហាញលំដាប់ផ្នែកនៃមេរៀនតាមទំព័រសៀវភៅ ឱ្យសិស្សដឹងថាថ្ងៃនេះនឹងរៀនអ្វីខ្លះ។</p>')});

  // 3. Sections in book order
  L.sections.forEach((s, si) => {
    const nx = L.sections[si+1], tlist = trBetween(s.p, nx ? nx.p : 999);
    const K = KIND[s.k], secName = `p${s.p} • ${splitTitle(s.t).main}`;
    const base = {sec:secName, page:s.p, tracks:tlist.map(t=>tr.indexOf(t)), kind:s.k};
    const secNote = noteBlock(`${K.i} ${K.en} • ទំព័រ ${s.p}`, `<p>${s.km||''}</p>`) + trackNote(tlist);
    // header
    S.push({...base, steps:0, html:`
      <div class="s-sechead">
        <div class="s-kind pop"><span>${K.i}</span>${K.en}</div>
        ${titleHtml(s.t,'big')}
        <div class="s-pagebadge rise d3">Student's Book • p${s.p}</div>
        ${trackBtns(tlist)}
      </div>`, note: secNote + how('ចុចលើលេខ 🔊 ដើម្បីចាក់សំឡេងលំហាត់ក្នុងសៀវភៅ (ឬចុច A)', 'ចុច V ដើម្បីបង្ហាញទំព័រសៀវភៅពិតនៅខាងស្តាំ')});
    // grammar
    (s.g||[]).forEach(gi => {
      const g = L.grammar[gi]; if(!g) return;
      S.push({...base, steps:g.form?1:0, html:`
        <div class="s-gram">
          <div class="s-tag rise">Grammar • p${g.p}</div>
          <h2 class="s-h2 rise">${esc(g.t)}</h2>
          ${g.form?`<table class="s-form st" data-s="1">${g.form.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`:''}
          <p class="s-rule rise d2">${g.km}</p>
        </div>`, note: noteBlock('📐 វេយ្យាករណ៍', `<p>${g.km}</p>`) + (g.form?how('ចុចបន្ទាប់ ដើម្បីបង្ហាញតារាងទម្រង់'):'')});
      S.push({...base, steps:g.ex.length, html:`
        <div class="s-tag rise">Examples • ${esc(g.t)}</div>
        <div class="s-exs">${g.ex.map((e,i)=>`<div class="s-ex st" data-s="${i+1}">${spk(e)}<span>${esc(e)}</span></div>`).join('')}</div>`,
        note: how('ចុចបន្ទាប់ម្តងមួយៗ ដើម្បីបង្ហាញឧទាហរណ៍', 'ចុច 🔊 ឬចុច S ដើម្បីស្តាប់ការអាន', 'ឱ្យសិស្សអានតាម ហើយបង្កើតប្រយោគថ្មីដោយខ្លួនឯង')});
      const extra = (g.more||[]).length + (g.err||[]).length;
      if(extra) S.push({...base, steps:extra, html:`
        <div class="s-tag rise">Tips & common mistakes</div>
        <div class="s-tips">
          ${(g.more||[]).map((m,i)=>`<div class="s-tip st" data-s="${i+1}">💡 ${m}</div>`).join('')}
          ${(g.err||[]).map((e,i)=>`<div class="s-err st" data-s="${(g.more||[]).length+i+1}"><span class="bad">✗ ${esc(e[0])}</span><span class="arr">→</span><span class="good">✓ ${esc(e[1])}</span></div>`).join('')}
        </div>`, note: how('ចុចបន្ទាប់ម្តងមួយៗ', 'សួរសិស្សថា ប្រយោគខុសនៅត្រង់ណា មុនបង្ហាញចម្លើយ')});
    });
    // vocabulary (pictures)
    if((s.w||[]).length){
      const per = s.w.length>12 ? 10 : s.w.length>8 ? Math.ceil(s.w.length/2) : 8;
      chunk(s.w, per).forEach((grp,ci,arr) => S.push({...base, steps:1, html:`
        <div class="s-tag rise">Vocabulary${arr.length>1?' '+(ci+1)+'/'+arr.length:''}</div>
        <div class="s-vgrid n${Math.min(grp.length,10)}">${grp.map((w,i)=>`
          <div class="s-vcard pop" style="animation-delay:${0.05*i}s" ${say(w[0])}>
            <div class="em">${w[2]}</div><div class="en">${esc(w[0])}</div><div class="km st" data-s="1">${w[1]}</div>
          </div>`).join('')}</div>`,
        note: how('ឱ្យសិស្សទាយពាក្យពីរូបភាពសិន', 'ចុចបន្ទាប់ ដើម្បីបង្ហាញន័យខ្មែរ', 'ចុចលើកាត ដើម្បីស្តាប់ការអាន')}));
      const quiz = s.w.filter(w=>!/^\d+$/.test(w[2]) && !/[↔→\/]/.test(w[0])).slice(0,6);
      if(quiz.length>=3) S.push({...base, steps:quiz.length, html:`
        <div class="s-tag rise">Quick check</div>
        <h2 class="s-h2 rise">What's this in English?</h2>
        <div class="s-qc">${quiz.map((w,i)=>`<div class="s-qci pop" style="animation-delay:${0.06*i}s"><div class="em">${w[2]}</div><div class="ans st" data-s="${i+1}">${esc(w[0])}</div></div>`).join('')}</div>`,
        note: how('សួរសិស្សម្តងមួយរូប', 'ចុចបន្ទាប់ ដើម្បីបង្ហាញចម្លើយម្តងមួយៗ')});
    }
    // phrases
    if((s.ph||[]).length){
      chunk(s.ph, 6).forEach(grp => S.push({...base, steps:grp.length, html:`
        <div class="s-tag rise">Useful language</div>
        <div class="s-phr">${grp.map((p,i)=>`<div class="s-ph st" data-s="${i+1}">${spk(p[0])}<b>${esc(p[0])}</b><span>${p[1]}</span></div>`).join('')}</div>`,
        note: how('ចុចបន្ទាប់ម្តងមួយៗ ដើម្បីបង្ហាញឃ្លា', 'ចុច 🔊 ដើម្បីស្តាប់', 'ឱ្យសិស្សហាត់និយាយជាគូ (Pair work)')}));
    }
    // comprehension questions
    if((s.qs||[]).length) S.push({...base, steps:s.qs.length, html:`
      <div class="s-tag rise">${s.k==='listen'?'Listen and answer':'Read and answer'}</div>
      <ol class="s-qs">${s.qs.map((q,i)=>`<li class="st" data-s="${i+1}">${spk(q)}${esc(q)}</li>`).join('')}</ol>`,
      note: noteBlock('🤔 សួរ-ឆ្លើយ', `<p>ឱ្យសិស្សមើលអត្ថបទក្នុងសៀវភៅទំព័រ ${s.p} (ចុច V ដើម្បីបង្ហាញទំព័រ) ឬស្តាប់សំឡេង រួចឆ្លើយសំណួរ។</p>`) + trackNote(tlist) + how('ចុចបន្ទាប់ ដើម្បីបង្ហាញសំណួរម្តងមួយៗ')});
    // review section → whole-unit wrap-up
    if(s.k==='review'){
      const WL=u.vocab, parts=chunk(WL,12);
      parts.forEach((grp,ci)=>S.push({...base, steps:1, html:`
        <div class="s-tag rise">Wordlist p${u.wl} • ${ci+1}/${parts.length}</div>
        <div class="s-wl">${grp.map((w,i)=>`<div class="s-wli pop" style="animation-delay:${0.03*i}s" ${say(w[0])}><b>${esc(w[0])}<i>${esc(w[1])}</i></b><span class="st" data-s="1">${w[2]}</span></div>`).join('')}</div>`,
        note: noteBlock('📒 Wordlist', `<p>ពាក្យទាំង ${WL.length} នៃ Unit ${n} តាមទំព័រ ${u.wl} ក្នុងសៀវភៅ។</p>`) + how('ចុចបន្ទាប់ ដើម្បីបង្ហាញន័យខ្មែរ', 'ចុចលើពាក្យ ដើម្បីស្តាប់')}));
      S.push({...base, steps:L.grammar.length, html:`
        <div class="s-tag rise">Grammar review</div>
        <div class="s-rev">${L.grammar.map((g,i)=>`<div class="s-revi st" data-s="${i+1}"><b>${esc(g.t)}</b><span>${esc(g.ex[0])}</span></div>`).join('')}</div>`,
        note: how('ចុចបន្ទាប់ ដើម្បីរំលឹកវេយ្យាករណ៍ម្តងមួយៗ', 'ឱ្យសិស្សផ្តល់ឧទាហរណ៍ថ្មី')});
      u.quiz.forEach((q,qi) => S.push({...base, kind:'quiz', steps:1, html:`
        <div class="s-tag rise">Unit quiz ${qi+1}/${u.quiz.length}</div>
        <div class="s-quiz"><div class="q rise">${esc(q.q).replace('___','<u>&nbsp;?&nbsp;</u>')}</div>
        <div class="opts">${q.o.map((o,k)=>`<div class="o pop ${k===q.a?'right':''}" style="animation-delay:${0.1+0.08*k}s"><b>${'ABC'[k]}</b>${esc(o)}</div>`).join('')}</div></div>`,
        note: how('ឱ្យសិស្សលើកដៃ ឬបង្ហាញ A / B / C', 'ចុចបន្ទាប់ ដើម្បីបង្ហាញចម្លើយត្រូវ')}));
    }
  });
  // 4. Finish
  S.push({kind:'end', page:u.end, sec:'Finish', steps:0, html:`
    <div class="s-title end">
      <div class="s-bigicon spin">🏆</div>
      <h1 class="s-h1 rise">Well done!</h1>
      <div class="s-kmt rise d2">Unit ${n} — ${esc(u.en)}</div>
    </div>`, note: noteBlock('🏠 កិច្ចការផ្ទះ', `<p>Workbook Unit ${n} • រៀនពាក្យក្នុងកម្មវិធី • ធ្វើលំហាត់ ✍️ និង 🏁 លំហាត់ឆ្លងកម្រិត</p>`)});
  S.forEach((s,i)=>{ s.i=i; s.tr=tr; });
  return S;
}

/* ---------------- deck UI ---------------- */
const D = { n:1, slides:[], i:0, step:0, black:null, laser:false, book:false, grid:false, notes:false, numbuf:'' };
const $ = s => document.querySelector(s);

function open(n, startPage){
  D.n=n; D.slides=buildDeck(n); D.i=0; D.step=0; D.black=null; D.grid=false;
  if(startPage){ const k=D.slides.findIndex(s=>s.page>=startPage && s.i>1); if(k>=0) D.i=k; }
  const st=UNIT_STYLE[n], el=$('#deck');
  el.style.setProperty('--c1',st.c1); el.style.setProperty('--c2',st.c2);
  el.classList.add('show'); document.body.classList.add('deck-open');
  draw(0);
  try{ if(!document.fullscreenElement) document.documentElement.requestFullscreen(); }catch(e){}
}
function close(){
  $('#deck').classList.remove('show'); document.body.classList.remove('deck-open');
  speechSynthesis && speechSynthesis.cancel();
  if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  if(window.render) window.render();
}
function draw(dir){
  const s=D.slides[D.i], u=UNITS[D.n-1];
  const stage=$('#dStage');
  const old=stage.querySelector('.slide.cur');
  const sl=document.createElement('section');
  sl.className='slide cur k-'+(s.kind||'x')+(dir>0?' from-r':dir<0?' from-l':' from-0');
  sl.innerHTML=`<div class="s-inner">${s.html}</div>`;
  stage.appendChild(sl);
  if(old){ old.classList.remove('cur'); old.classList.add(dir>=0?'out-l':'out-r'); setTimeout(()=>old.remove(),650); }
  applyStep();
  $('#dSec').textContent = s.sec;
  $('#dCount').textContent = (D.i+1)+' / '+D.slides.length;
  $('#dBar').style.width = ((D.i+1)/D.slides.length*100)+'%';
  $('#dUnit').textContent = 'Unit '+D.n+' • '+u.en;
  $('#dPage').textContent = 'p'+s.page;
  const nb=$('#dNotesBody'); if(nb) nb.innerHTML = s.note || '<p class="dn-none">គ្មានការណែនាំសម្រាប់ស្លាយនេះ</p>';
  if(D.book) bookSync();
  if(s.kind==='end') confetti();
}
function applyStep(){
  const sl=$('#dStage .slide.cur'); if(!sl) return;
  sl.querySelectorAll('.st').forEach(e=>e.classList.toggle('on', +e.dataset.s<=D.step));
  const s=D.slides[D.i];
  sl.querySelectorAll('.s-quiz .o.right').forEach(e=>e.classList.toggle('reveal', D.step>=1));
  if(s.kind==='quiz' && D.step>=1) { confetti(40); }
  $('#dStep').textContent = s.steps ? '●'.repeat(D.step)+'○'.repeat(s.steps-D.step) : '';
  sl.classList.toggle('has-more', D.step < s.steps);
}
function next(){
  if(D.black){ D.black=null; $('#dCurtain').className=''; return; }
  const s=D.slides[D.i];
  if(D.step < s.steps){ D.step++; applyStep(); const e=$('#dStage .slide.cur .st.on[data-s="'+D.step+'"] [data-say]'); return; }
  if(D.i < D.slides.length-1){ D.i++; D.step=0; draw(1); }
}
function prev(){
  if(D.black){ D.black=null; $('#dCurtain').className=''; return; }
  if(D.step>0){ D.step--; applyStep(); return; }
  if(D.i>0){ D.i--; D.step=D.slides[D.i].steps; draw(-1); }
}
function goto(i){ D.i=Math.max(0,Math.min(D.slides.length-1,i)); D.step=0; draw(0); }
function curtain(c){ D.black = D.black===c ? null : c; $('#dCurtain').className = D.black ? 'show '+c : ''; }
function notes(v){ D.notes = v==null ? !D.notes : !!v; $('#deck').classList.toggle('notes-on', D.notes); try{ localStorage.setItem('bs-deck-notes', D.notes?'1':''); }catch(e){} }
function laser(){ D.laser=!D.laser; $('#deck').classList.toggle('laser-on',D.laser); }
function bookToggle(){ if(typeof ROLE_NOW!=='undefined'&&ROLE_NOW==='student') return; D.book=!D.book; $('#deck').classList.toggle('book-on',D.book); if(D.book) bookSync(); }
function bookSync(){ const p=D.slides[D.i].page, f=$('#dBook'); const url=window.bookUrl(1,p); if(f.dataset.p!=String(p)){ f.dataset.p=p; f.src=url; } }
function playSlide(){
  const s=D.slides[D.i]; const A=document.getElementById('audio');
  if(A.src && !A.paused){ A.pause(); return; }
  if(s.tracks && s.tracks.length) window.P.load(s.tr, s.tracks[0]);
  else if(A.src) A.play();
}
function gridToggle(){
  D.grid=!D.grid; const g=$('#dGrid');
  if(!D.grid){ g.classList.remove('show'); return; }
  g.innerHTML = D.slides.map((s,i)=>`<button class="${i===D.i?'cur':''}" onclick="Deck.goto(${i});Deck.gridToggle()"><b>${i+1}</b><span>${KIND[s.kind]?KIND[s.kind].i:'⭐'}</span><small>${esc(s.sec)}</small></button>`).join('');
  g.classList.add('show');
}
function key(e){
  if(!$('#deck').classList.contains('show')) return false;
  const k=e.key;
  if(/^[0-9]$/.test(k)){ D.numbuf+=k; return true; }
  if(k==='Enter' && D.numbuf){ goto(+D.numbuf-1); D.numbuf=''; e.preventDefault(); return true; }
  D.numbuf='';
  if(['ArrowRight','ArrowDown','PageDown',' ','Enter','n','N'].includes(k)){ e.preventDefault(); next(); }
  else if(['ArrowLeft','ArrowUp','PageUp','Backspace','p','P'].includes(k)){ e.preventDefault(); prev(); }
  else if(k==='b'||k==='B'||k==='.') curtain('black');
  else if(k==='w'||k==='W'||k===',') curtain('white');
  else if(k==='F5'){ e.preventDefault(); if(!document.fullscreenElement) document.documentElement.requestFullscreen(); }
  else if(k==='Escape'){ if(D.grid) gridToggle(); else if(!document.fullscreenElement) close(); }
  else if(k==='l'||k==='L') laser();
  else if(k==='i'||k==='I'||k==='Tab'){ e.preventDefault(); notes(); }
  else if(k==='v'||k==='V') bookToggle();
  else if(k==='g'||k==='G') gridToggle();
  else if(k==='a'||k==='A') playSlide();
  else if(k==='Home') goto(0);
  else if(k==='End') goto(D.slides.length-1);
  else if(k==='s'||k==='S'){ const e2=$('#dStage .slide.cur [data-say]'); if(e2) window.speak(e2.dataset.say); }
  else return false;
  return true;
}
/* confetti */
function confetti(count){
  const c=$('#dConf'), ctx=c.getContext('2d'); c.width=innerWidth; c.height=innerHeight;
  const cols=['#f59e0b','#10b981','#3b82f6','#ef4444','#a855f7','#ec4899'];
  const P=Array.from({length:count||140},()=>({x:innerWidth/2+(Math.random()-.5)*200,y:innerHeight*0.55,vx:(Math.random()-.5)*16,vy:-Math.random()*16-6,s:Math.random()*8+5,c:cols[Math.floor(Math.random()*cols.length)],r:Math.random()*6,vr:(Math.random()-.5)*.3}));
  let f=0; (function step(){ ctx.clearRect(0,0,c.width,c.height); P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.45;p.vx*=0.99;p.r+=p.vr; ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);ctx.restore();}); if(++f<120) requestAnimationFrame(step); else ctx.clearRect(0,0,c.width,c.height); })();
}
/* wire DOM */
function init(){
  const el=document.createElement('div'); el.id='deck';
  el.innerHTML=`
   <div class="d-bg"><i class="b1"></i><i class="b2"></i><i class="b3"></i><div class="d-grain"></div></div>
   <div class="d-top"><span id="dUnit"></span><span class="sep">•</span><span id="dSec"></span><span class="grow"></span><span id="dStep"></span></div>
   <div id="dStage"></div>
   <iframe id="dBook" title="Book page"></iframe>
   <div class="d-hud">
     <button onclick="Deck.prev()" title="Previous (←, PageUp)">◀</button>
     <button onclick="Deck.next()" title="Next (→, PageDown, Space)">▶</button>
     <span id="dCount"></span><span id="dPage" class="pg"></span>
     <span class="grow"></span>
     <button onclick="Deck.notes()" title="Teacher notes (I)" class="d-nbtn">📋</button>
     <button onclick="Deck.playSlide()" title="Audio (A)">🎧</button>
     <button onclick="Deck.bookToggle()" title="Book page (V)">📘</button>
     <button onclick="Deck.laser()" title="Laser (L)">🔴</button>
     <button onclick="Deck.gridToggle()" title="All slides (G)">▦</button>
     <button onclick="Deck.curtain('black')" title="Black screen (B)">⬛</button>
     <button onclick="document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()" title="Fullscreen (F5)">⛶</button>
     <button onclick="Deck.help()" title="Help">?</button>
     <button onclick="Deck.close()" title="Exit (Esc)">✕</button>
   </div>
   <aside id="dNotes"><div class="dn-h"><b>📋 ការណែនាំសម្រាប់គ្រូ</b><button onclick="Deck.notes(false)" title="បិទ (I)">✕</button></div><div id="dNotesBody"></div></aside>
   <div class="d-prog"><i id="dBar"></i></div>
   <div id="dGrid"></div>
   <div id="dCurtain"></div>
   <div id="dLaser"></div>
   <canvas id="dConf"></canvas>
   <div id="dHelp"><div><h3>🎮 ការបញ្ជាស្លាយ (Remote / Keyboard)</h3>
     <p><kbd>→</kbd> <kbd>PageDown</kbd> <kbd>Space</kbd> បន្ទាប់ / បង្ហាញចំណុចបន្ទាប់</p>
     <p><kbd>←</kbd> <kbd>PageUp</kbd> ថយក្រោយ</p>
     <p><kbd>B</kbd> / <kbd>.</kbd> អេក្រង់ខ្មៅ • <kbd>W</kbd> អេក្រង់ស</p>
     <p><kbd>F5</kbd> ពេញអេក្រង់ • <kbd>Esc</kbd> ចេញ</p>
     <p><kbd>L</kbd> Laser pointer • <kbd>V</kbd> ទំព័រសៀវភៅ • <kbd>G</kbd> ស្លាយទាំងអស់</p>
     <p><kbd>I</kbd> / <kbd>Tab</kbd> បើក/បិទការណែនាំសម្រាប់គ្រូ 📋</p>
     <p><kbd>A</kbd> ចាក់/ផ្អាកសំឡេង • <kbd>S</kbd> អានពាក្យ • <kbd>លេខ</kbd>+<kbd>Enter</kbd> ទៅស្លាយ</p>
     <p class="m">Presenter remote (Logitech R400, Spotlight, Norwii…) ប្រើ PageUp/PageDown/B ដែលកម្មវិធីស្គាល់ស្រាប់។ ចុចលើស្លាយ = បន្ទាប់ • ចុចកណ្តុរស្តាំ = ថយក្រោយ</p>
     <button onclick="Deck.help()">យល់ហើយ ✓</button></div></div>`;
  document.body.appendChild(el);
  try{ if(localStorage.getItem('bs-deck-notes')) notes(true); }catch(e){}
  $('#dStage').addEventListener('click', e=>{
    const sp=e.target.closest('[data-say]'); const tk=e.target.closest('[data-track]');
    if(tk){ e.stopPropagation(); const s=D.slides[D.i]; window.P.load(s.tr, +tk.dataset.track); return; }
    if(sp){ e.stopPropagation(); window.speak(sp.dataset.say); sp.classList.add('ping'); setTimeout(()=>sp.classList.remove('ping'),500); return; }
    next();
  });
  $('#dStage').addEventListener('contextmenu', e=>{ e.preventDefault(); prev(); });
  el.addEventListener('mousemove', e=>{ if(D.laser){ const l=$('#dLaser'); l.style.left=e.clientX+'px'; l.style.top=e.clientY+'px'; } });
  let wheelT=0; $('#dStage').addEventListener('wheel', e=>{ const t=Date.now(); if(t-wheelT<350) return; wheelT=t; e.deltaY>0?next():prev(); });
  let tx=null; $('#dStage').addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
  $('#dStage').addEventListener('touchend',e=>{ if(tx==null) return; const dx=e.changedTouches[0].clientX-tx; if(Math.abs(dx)>50){ dx<0?next():prev(); } tx=null; });
}
function help(){ $('#dHelp').classList.toggle('show'); }
window.Deck = { notes, init, open, close, next, prev, goto, curtain, laser, bookToggle, gridToggle, playSlide, key, help, buildDeck, D };
})();
