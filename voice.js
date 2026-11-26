// =====================================================================
//  voice.js — 🎤 លំហាត់និយាយ: ស្គាល់សំឡេងសិស្ស (Web Speech API) ហើយផ្ទៀងផ្ទាត់ភ្លាមៗ
//  • Voice.card(id, item, cb) → HTML កាតនិយាយ (មានប៊ូតុងមេក្រូនៅកន្លែងតែម្តង)
//  • item = {mode:'read'|'repeat'|'say', text, km, em}
//    read = អានប្រយោគ • repeat = ស្តាប់ ហើយនិយាយតាម • say = មើលន័យខ្មែរ/រូប ហើយនិយាយជាអង់គ្លេស
//  • cb(res) → res = {pass, pct, heard, tries, skip}
//  • ត្រូវការ Chrome / Edge / Safari និងអ៊ីនធឺណិត (Google/Apple ជាអ្នកស្គាល់សំឡេង)
// =====================================================================
(function(){
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const ok = () => !!SR;

/* ---------- text → comparable words ---------- */
const CONTR = {"i'm":"i am","you're":"you are","we're":"we are","they're":"they are","he's":"he is","she's":"she is","it's":"it is","what's":"what is","where's":"where is","who's":"who is","that's":"that is","there's":"there is","here's":"here is","how's":"how is","isn't":"is not","aren't":"are not","don't":"do not","doesn't":"does not","didn't":"did not","can't":"cannot","cant":"cannot","can not":"cannot","won't":"will not","wasn't":"was not","weren't":"were not","i've":"i have","you've":"you have","we've":"we have","they've":"they have","i'll":"i will","you'll":"you will","we'll":"we will","i'd":"i would","let's":"let us","haven't":"have not","hasn't":"has not","couldn't":"could not","shouldn't":"should not","wouldn't":"would not","name's":"name is"};
const ONES=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'], TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function num(n){ n=+n; if(n<20) return ONES[n]; if(n<100) return TENS[Math.floor(n/10)]+(n%10?' '+ONES[n%10]:''); if(n<1000) return ONES[Math.floor(n/100)]+' hundred'+(n%100?' and '+num(n%100):''); if(n<10000) return num(Math.floor(n/1000))+' thousand'+(n%1000?' '+num(n%1000):''); return String(n).split('').map(d=>ONES[d]).join(' '); }
const HOMO = {two:'to',too:'to',four:'for',fore:'for',their:'there',high:'hi',know:'no',write:'right',ate:'eight',won:'one',sea:'see',buy:'by',bye:'by',eye:'i',okay:'ok',mister:'mr',hour:'our',meet:'meat',whose:'who is',wear:'where',were:'where',here:'hear',dear:'deer',sun:'son',weight:'wait',flower:'flour',week:'weak',new:'knew',its:'it is',yeah:'yes',yep:'yes',mum:'mom',mam:'mom',colour:'color',favourite:'favorite',centre:'center',theatre:'theater',grey:'gray',programme:'program',travelling:'traveling',neighbour:'neighbor',organise:'organize',realise:'realize'};
const ART = new Set(['a','an','the']);
function norm(t){
  let s=String(t||'').toLowerCase().replace(/[’‘`´]/g,"'").replace(/\(.*?\)/g,' ').replace(/\b(\d{1,2}):(\d{2})\b/g,(m,h,mm)=>num(h)+' '+(+mm?num(mm):"o'clock"));
  s=s.replace(/£\s?(\d+)/g,'$1 pounds').replace(/\$\s?(\d+)/g,'$1 dollars').replace(/(\d+)\s?%/g,'$1 percent').replace(/(\d+)(st|nd|rd|th)\b/g,'$1');
  s=s.replace(/\d+/g,d=>' '+num(d)+' ');
  Object.keys(CONTR).forEach(k=>{ s=s.replace(new RegExp("(^|[^a-z'])"+k.replace("'","'")+"(?![a-z'])",'g'),'$1'+CONTR[k]); });
  s=s.replace(/-/g,' ').replace(/[^a-z' ]/g,' ').replace(/'s\b/g,'s').replace(/'/g,'');
  return s.split(/\s+/).filter(Boolean).flatMap(w=>(HOMO[w]||w).split(' '));
}
function lev(a,b){ if(a===b) return 0; const m=a.length,n=b.length; if(Math.abs(m-n)>1) return 2; let p=[...Array(n+1).keys()]; for(let i=1;i<=m;i++){ const c=[i]; for(let j=1;j<=n;j++) c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1)); p=c; } return p[n]; }
const eq=(a,b)=>a===b || (a.length>=4 && b.length>=4 && lev(a,b)<=1) || (a+'s'===b) || (b+'s'===a);
/* word-level alignment (LCS) → which target words were said */
function score(target, heard){
  const T=norm(target), H=norm(heard), m=T.length, n=H.length;
  const D=Array.from({length:m+1},()=>new Array(n+1).fill(0));
  for(let i=m-1;i>=0;i--) for(let j=n-1;j>=0;j--) D[i][j]=eq(T[i],H[j])?D[i+1][j+1]+1:Math.max(D[i+1][j],D[i][j+1]);
  const hit=new Array(m).fill(false); let i=0,j=0; while(i<m&&j<n){ if(eq(T[i],H[j])){ hit[i]=true; i++; j++; } else if(D[i+1][j]>=D[i][j+1]) i++; else j++; }
  let num_=0, den=0; T.forEach((w,k)=>{ if(ART.has(w)){ if(hit[k]){ num_++; den++; } } else { den++; if(hit[k]) num_++; } });
  return {pct: den?Math.round(num_/den*100):0, T, hit};
}
function need(text){ const k=norm(text).filter(w=>!ART.has(w)).length; return k<=2?100:k<=6?80:75; }
/* colour the target text word-by-word (green = said, red = missed) */
function paint(text, hit){ const T=norm(text); let k=0; const out=[];
  String(text).split(/\s+/).forEach(w=>{ const n=norm(w).length||0; const seg=hit.slice(k,k+n); k+=n; const good=n===0||seg.every(Boolean), some=seg.some(Boolean);
    out.push(`<span class="${good?'vg':some?'vh':'vb'}">${esc(w)}</span>`); }); return out.join(' '); }

/* ---------- microphone permission ---------- */
async function micState(){ try{ const p=await navigator.permissions.query({name:'microphone'}); return p.state; }catch(e){ return 'unknown'; } }
async function askMic(){ try{ const st=await navigator.mediaDevices.getUserMedia({audio:true}); st.getTracks().forEach(t=>t.stop()); return true; }catch(e){ return e&&e.name==='NotReadableError'?'busy':false; } }
const HELP=`<div class="vc-help"><b>🔒 មេក្រូត្រូវបានបិទ — សូមបើកវិញ៖</b>
  <ul><li>📱 <b>Chrome (Android)</b>៖ ចុច 🔒 ឬ ⓘ ខាងឆ្វេងអាសយដ្ឋានវេបសាយ → <b>ការអនុញ្ញាត / Permissions</b> → <b>មេក្រូហ្វូន</b> → <b>អនុញ្ញាត (Allow)</b></li>
  <li>🍎 <b>iPhone (Safari)</b>៖ ចុច <b>ᴀA</b> ខាងឆ្វេងអាសយដ្ឋាន → Website Settings → Microphone → <b>Allow</b></li>
  <li>💻 <b>កុំព្យូទ័រ</b>៖ ចុច 🔒 ខាងឆ្វេងអាសយដ្ឋាន → Microphone → <b>Allow</b></li>
  <li>⚙️ បើទូរស័ព្ទបិទមេក្រូទាំងស្រុង៖ អូសរបារពីលើចុះ ហើយបើក <b>«Microphone access / ការចូលប្រើមីក្រូហ្វូន»</b></li></ul>
  <div class="row"><button class="btn teal sm" onclick="Voice._fix(this)">🎤 សាកបើកមេក្រូម្តងទៀត</button><button class="btn ghost sm" onclick="location.reload()">🔄 ផ្ទុកទំព័រឡើងវិញ</button></div></div>`;
async function fix(btn){ const r=await askMic(); const box=btn.closest('.vc-help'); if(r===true){ if(box) box.outerHTML='<div class="vc-msg ok">✅ មេក្រូបើកហើយ! ចុច 🎤 ដើម្បីនិយាយ</div>'; } else toast(r==='busy'?'⚠️ កម្មវិធីផ្សេងកំពុងប្រើមេក្រូ — សូមបិទវា':'⚠️ នៅតែបិទ — សូមធ្វើតាមជំហានខាងលើ ហើយផ្ទុកទំព័រឡើងវិញ'); }

/* ---------- speech recognition ---------- */
let REC=null;
function stop(){ try{ REC&&REC.abort(); }catch(e){} REC=null; document.querySelectorAll('.vc.on').forEach(c=>c.classList.remove('on')); }
function listen(target, onLive){
  return new Promise((res, rej)=>{
    stop(); try{ if(window.TTS&&TTS.stop) TTS.stop(); window.speechSynthesis&&speechSynthesis.cancel(); }catch(e){}
    const r=new SR(); REC=r; r.lang='en-US'; r.interimResults=true; r.maxAlternatives=5; r.continuous=false;
    let best=null, done=false, live='';
    const finish=()=>{ if(done) return; done=true; clearTimeout(to); REC=null; best?res(best):(live?res({...score(target,live),heard:live}):rej('no-speech')); };
    r.onresult=e=>{ for(let i=e.resultIndex;i<e.results.length;i++){ const R=e.results[i];
        if(R.isFinal){ for(let a=0;a<R.length;a++){ const h=R[a].transcript.trim(), s=score(target,h); if(!best||s.pct>best.pct) best={...s,heard:h}; } }
        else { live=R[0].transcript; onLive&&onLive(live); } } };
    r.onerror=e=>{ if(done) return; done=true; clearTimeout(to); REC=null; rej(e.error||'error'); };
    r.onend=finish;
    const to=setTimeout(()=>{ try{ r.stop(); }catch(e){} }, 4500+norm(target).length*700);
    try{ r.start(); }catch(e){ done=true; clearTimeout(to); rej('start'); }
  });
}

/* ---------- the speaking card ---------- */
const IT={};
const sayBtn=(t,label)=>`<button class="vc-say" onclick="speak(${JSON.stringify(t).replace(/"/g,'&quot;')})">${label||'🔊'}</button>`;
function card(id, item, cb){
  IT[id]={item, cb, tries:0, best:0, need:item.need||need(item.text), shown:item.mode!=='repeat'&&item.mode!=='say'};
  const I=IT[id], m=item.mode;
  const prompt = m==='say' ? `<div class="vc-say-q">${item.em?`<span class="vc-em">${item.em}</span>`:''}<span class="km">${esc(item.km)}</span></div><div class="vc-ins">🗣 និយាយជាភាសាអង់គ្លេស</div>`
    : m==='repeat' ? `<div class="vc-ins">🎧 ស្តាប់ ហើយនិយាយតាម</div><div class="vc-big">${sayBtn(item.text,'🔊 ស្តាប់')}${sayBtn(item.text,'🐢')}</div>`
    : `<div class="vc-ins">📖 អានឱ្យឮៗ</div>`;
  const textLine = `<div class="vc-text ${I.shown?'':'hide'}" data-vt>${I.shown?esc(item.text)+' '+(m==='read'&&!item.exam?sayBtn(item.text):''):'<span class="vc-dots">• • •</span>'}</div>${item.km&&m!=='say'?`<div class="vc-km km">${esc(item.km)}</div>`:''}`;
  if(!ok()) return `<div class="vc nosr" id="vc-${id}">${prompt}${textLine.replace(' hide','').replace('<span class="vc-dots">• • •</span>',esc(item.text))}<div class="vc-msg warn">⚠️ ឧបករណ៍/កម្មវិធីរុករកនេះមិនស្គាល់សំឡេងទេ — សូមប្រើ <b>Google Chrome</b> (Android/កុំព្យូទ័រ) ឬ <b>Safari</b> (iPhone) ហើយភ្ជាប់អ៊ីនធឺណិត</div>${item.noSkip?'':`<button class="btn ghost sm" onclick="Voice._skip('${id}')">⏭ រំលង</button>`}</div>`;
  return `<div class="vc" id="vc-${id}">${prompt}${textLine}
    <div class="vc-mic"><button class="vc-btn" onclick="Voice.go('${id}')"><span>🎤</span></button><small data-vs>ចុច 🎤 ហើយនិយាយ</small></div>
    <div class="vc-res" data-vr></div></div>`;
}
async function go(id){
  const I=IT[id], el=document.getElementById('vc-'+id); if(!I||!el) return;
  if(el.classList.contains('on')){ try{ REC&&REC.stop(); }catch(e){} return; }
  const st=el.querySelector('[data-vs]'), out=el.querySelector('[data-vr]');
  if(await micState()==='denied'){ out.innerHTML=HELP; return; }
  el.classList.add('on'); st.textContent='🔴 កំពុងស្តាប់… និយាយឥឡូវ'; out.innerHTML='';
  try{
    const r=await listen(I.item.text, live=>{ st.innerHTML='🔴 <i>'+esc(live)+'</i>'; });
    el.classList.remove('on'); I.tries++; I.best=Math.max(I.best,r.pct);
    const pass=r.pct>=I.need;
    if(pass||(I.tries>=2&&!I.item.exam)) reveal(id);
    st.textContent=pass?'✅ ត្រឹមត្រូវ!':`ចុច 🎤 ដើម្បីនិយាយម្តងទៀត (លើកទី ${I.tries+1})`;
    out.innerHTML=`<div class="vc-score ${pass?'ok':'no'}"><b>${r.pct}%</b><div><div class="vc-paint">${I.shown?paint(I.item.text,r.hit):''}</div><small>អ្នកនិយាយ៖ «${esc(r.heard)}»</small></div></div>
      ${pass?'':`<div class="vc-msg">${r.pct>=I.need-25?'👍 ជិតត្រូវហើយ! ':'💪 '}ពាក្យពណ៌ក្រហមមិនទាន់ច្បាស់ — ${I.item.exam||(I.item.mode==='say'&&!I.shown)?'សាកម្តងទៀត':'ស្តាប់គំរូ '+sayBtn(I.item.text)+' ហើយនិយាយម្តងទៀត'}${I.item.skipAfter&&I.tries>=I.item.skipAfter?` <button class="btn ghost sm" onclick="Voice._skip('${id}')">⏭ រំលង</button>`:''}</div>`}`;
    if(!pass&&typeof beep==='function') beep(false);
    if(pass) el.classList.add('passed');
    I.cb&&I.cb({pass, pct:r.pct, best:I.best, heard:r.heard, tries:I.tries});
  }catch(err){
    el.classList.remove('on'); st.textContent='ចុច 🎤 ហើយនិយាយ';
    if(err==='not-allowed'||err==='service-not-allowed'){ const g=await askMic(); out.innerHTML = g===true ? '<div class="vc-msg ok">✅ មេក្រូបើកហើយ! ចុច 🎤 ម្តងទៀត</div>' : HELP; }
    else if(err==='audio-capture') out.innerHTML='<div class="vc-msg warn">🎙 រកមេក្រូមិនឃើញ ឬទូរស័ព្ទកំពុងបិទមេក្រូ — អូសរបារពីលើចុះ ហើយបើក «Microphone access» រួចសាកម្តងទៀត</div>'+HELP;
    else if(err==='network') out.innerHTML='<div class="vc-msg warn">📶 ការស្គាល់សំឡេងត្រូវការអ៊ីនធឺណិត — សូមភ្ជាប់អ៊ីនធឺណិត ហើយសាកម្តងទៀត</div>';
    else if(err==='no-speech') out.innerHTML='<div class="vc-msg">🤫 មិនឮសំឡេងទេ — និយាយឱ្យខ្លាំងៗ ហើយដាក់ទូរស័ព្ទជិតមាត់</div>';
    else if(err!=='aborted') out.innerHTML='<div class="vc-msg warn">⚠️ មិនអាចស្តាប់បាន — សាកម្តងទៀត</div>';
  }
}
function skip(id){ const I=IT[id]; if(!I) return; stop(); I.cb&&I.cb({pass:false, skip:true, pct:I.best, best:I.best, tries:I.tries}); }
function reveal(id){ const el=document.getElementById('vc-'+id), I=IT[id]; if(!el||!I) return; I.shown=true; const t=el.querySelector('[data-vt]'); if(t&&t.classList.contains('hide')){ t.classList.remove('hide'); t.innerHTML=esc(I.item.text)+' '+sayBtn(I.item.text); } }

/* ---------- speaking items from a unit (words • phrases • sentences) ---------- */
const shuf = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const clean = t => String(t||'').replace(/\(.*?\)/g,'').replace(/\s*[—=→].*$/,'').replace(/^[A-Z][a-z]*:\s*/,'').replace(/\s+/g,' ').trim();
const good = t => t && !/[\/…_|\[\]]|\.\.\.|^[A-Z ]+$/.test(t) && /[a-z]/i.test(t);
const wc = t => t.split(' ').length;
function pool(n){
  const u=UNITS[n-1], L=window.LESSONS&&LESSONS[n]||{sections:[],grammar:[]}, emo=w=>(typeof emojiFor==='function'?emojiFor(u,w):'');
  const W=[], seen=new Set(), add=(arr,x)=>{ const k=norm(x.text).join(' '); if(seen.has(k)) return; seen.add(k); arr.push(x); };
  u.vocab.forEach(v=>{ const t=clean(v[0]).replace(/^(a|an|the) /i,''); if(good(t)&&wc(t)<=3&&v[2]) add(W,{mode:'say', text:t, km:v[2], em:emo(v[0])}); });
  const P=[]; L.sections.forEach(s=>(s.ph||[]).forEach(p=>{ const t=clean(p[0]); if(good(t)&&wc(t)>=2&&wc(t)<=9) add(P,{text:t, km:p[1]||''}); }));
  u.vocab.forEach(v=>{ const t=clean(v[0]); if(good(t)&&wc(t)>=3&&wc(t)<=8) add(P,{text:t, km:v[2]||''}); });
  const G=[]; (L.grammar||[]).forEach(g=>(g.ex||[]).forEach(e=>{ const t=clean(e); if(good(t)&&wc(t)>=3&&wc(t)<=10) add(G,{text:t, km:''}); }));
  const C=window.CTX&&CTX[n]||{}; Object.keys(C).forEach(k=>(C[k]||[]).forEach(c=>{ if(!Array.isArray(c)) return; const t=clean(String(c[0]).replace('___',c[1])); if(good(t)&&wc(t)>=3&&wc(t)<=10) add(G,{text:t, km:c[3]||''}); }));
  return {W:shuf(W), P:shuf(P), S:shuf(G)};
}
/* mix: e.g. Voice.items(5, [['say',3],['repeat',3],['read',2]]) */
function items(n, plan){ const B=pool(n), out=[];
  plan.forEach(([mode,k,src])=>{ const from = src ? B[src] : mode==='say'?B.W : mode==='repeat'?(B.P.length?B.P:B.S) : (B.S.length?B.S:B.P);
    for(let i=0;i<k;i++){ const x=from.shift()||B.P.shift()||B.S.shift()||B.W.shift(); if(!x) break; out.push({...x, mode: x.mode==='say'&&mode!=='say'?'read':mode}); } });
  return out; }

window.Voice = { _peek:id=>IT[id]&&IT[id].item.text, ok, card, go, stop, items, pool, score, need, norm, reveal, _skip:skip, _fix:fix, mic:askMic };
})();
