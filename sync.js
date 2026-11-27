// =====================================================================
//  sync.js — 🌐 Website mode (GitHub Pages) + ☁️ Firebase sync
//  • ទិន្នន័យ (គណនី ថ្នាក់ ពិន្ទុ ប្រឡង វឌ្ឍនភាព) រក្សាទុកក្នុង Firestore: schools/{code}/kv/{key}
//  • ពេលបើក៖ ទាញទិន្នន័យពី Cloud → localStorage → ដំណើរការកម្មវិធី
//  • ពេលកែ៖ localStorage.setItem → រុញទៅ Cloud (បញ្ចូលគ្នា 3-way merge ការពារការជាន់គ្នា)
//  • សៀវភៅ/សំឡេង Headway មិនដាក់លើ Website ទេ — គ្រូភ្ជាប់ពី Folder ក្នុងម៉ាស៊ីន (📂)
// =====================================================================
(function(){
window.IS_WEB = true; document.documentElement.classList.add('is-web'); document.addEventListener('DOMContentLoaded',()=>document.body.classList.add('is-web')); if(document.body) document.body.classList.add('is-web');
const VER='2026.11.27n';
const FILES=['tts.js','qrcode.js','tracks.js','data.js','wordlist.js','lessons.js','slides.js','book.js','class.js','rank.js','chat.js','notify.js','exam.js','worksheet.js','track.js','qrscan.js','auth.js','ctx.js','voice.js','lessonex.js','sg-courses.js','course.js','levelup.js','rich.js','games.js','sig.js','cert.js','app.js'];
const FB='https://www.gstatic.com/firebasejs/10.12.2/';
const CK='bs-cloud', PREFIX='beginner-studio', CHUNK=300000;
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const b64e = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d = s => decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));
const _get=Storage.prototype.getItem, _set=Storage.prototype.setItem, _rm=Storage.prototype.removeItem;
let cloud=null; try{ cloud=JSON.parse(_get.call(localStorage,CK)||'null'); }catch(e){}
const MEDIA = window.MEDIA = {audio:{}, book:{}, pdf:{}};
const SYK='bs-sync', IDX='_index';
const syncMap = () => { try{ return JSON.parse(_get.call(localStorage,SYK)||'{}'); }catch(e){ return {}; } };
const saveSync = m => _set.call(localStorage,SYK,JSON.stringify(m));
// ⚡ start downloading app scripts + Firebase SDK in parallel with data sync
FILES.forEach(f=>{ const l=document.createElement('link'); l.rel='preload'; l.as='script'; l.href=f+'?v='+VER; document.head.appendChild(l); });
if(cloud) ['firebase-app.js','firebase-auth.js','firebase-firestore.js'].forEach(f=>{ const l=document.createElement('link'); l.rel='modulepreload'; l.crossOrigin='anonymous'; l.href=FB+f; document.head.appendChild(l); });
if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{});

/* ---------- join link ---------- */
function joinLink(){ return location.href.split('#')[0]+'#join='+b64e(JSON.stringify({c:cloud.cfg, s:cloud.school})); }
(function parseJoin(){
  const m=location.hash.match(/join=([\w-]+)/); if(!m) return;
  try{ const j=JSON.parse(b64d(m[1])); if(j.c&&j.c.apiKey&&j.c.projectId&&j.s){ cloud={cfg:j.c, school:j.s}; _set.call(localStorage,CK,JSON.stringify(cloud)); } }catch(e){}
  history.replaceState(null,'',location.pathname+location.search);
})();

/* ---------- Firebase ---------- */
let F=null, db=null, status='off';
async function initFB(){
  if(db) return;
  const [app, auth, fs] = await Promise.all([import(FB+'firebase-app.js'), import(FB+'firebase-auth.js'), import(FB+'firebase-firestore.js')]);
  const a=app.initializeApp(cloud.cfg); F={...fs}; db=fs.getFirestore(a);
  const au=auth.getAuth(a); try{ await au.authStateReady(); }catch(e){} if(!au.currentUser) await auth.signInAnonymously(au);
}
const col = () => F.collection(db,'schools',cloud.school,'kv');
const dref = id => F.doc(db,'schools',cloud.school,'kv',id);
async function fetchAll(){
  const snap=await F.getDocs(col()); const main={}, parts={};
  snap.forEach(d=>{ const v=d.data(), id=d.id, i=id.lastIndexOf('~'); if(i>0 && /^\d+$/.test(id.slice(i+1))) (parts[id.slice(0,i)]=parts[id.slice(0,i)]||[])[+id.slice(i+1)]=v.d; else main[id]=v; });
  delete main[IDX]; const out={}; Object.entries(main).forEach(([k,v])=>{ out[k]=v.n ? (parts[k]||[]).slice(0,v.n).join('') : v.d; }); return {out, main};
}
async function fetchOne(k){
  const m=await F.getDoc(dref(k)); if(!m.exists()) return {v:null,n:0}; const v=m.data();
  if(!v.n) return {v:v.d, n:0};
  const ps=await Promise.all(Array.from({length:v.n},(_,i)=>F.getDoc(dref(k+'~'+i)))); return {v:ps.map(p=>p.exists()?p.data().d:'').join(''), n:v.n};
}
async function writeOne(k, str, oldN){
  const b=F.writeBatch(db), who=(window.Auth&&Auth.user&&Auth.user()&&Auth.user().name)||'', ts=Date.now();
  if(str==null){ b.delete(dref(k)); for(let i=0;i<oldN;i++) b.delete(dref(k+'~'+i)); b.set(dref(IDX),{[k]:F.deleteField()},{merge:true}); }
  else if(str.length<=CHUNK){ b.set(dref(k),{d:str,n:0,ts,by:who}); for(let i=0;i<oldN;i++) b.delete(dref(k+'~'+i)); b.set(dref(IDX),{[k]:{ts,n:0}},{merge:true}); }
  else { const n=Math.ceil(str.length/CHUNK); for(let i=0;i<n;i++) b.set(dref(k+'~'+i),{d:str.slice(i*CHUNK,(i+1)*CHUNK)}); for(let i=n;i<oldN;i++) b.delete(dref(k+'~'+i)); b.set(dref(k),{n,ts,by:who}); b.set(dref(IDX),{[k]:{ts,n}},{merge:true}); }
  await b.commit();
  const m=syncMap(); if(str==null) delete m[k]; else m[k]=ts; saveSync(m);
}

/* ---------- ⚡ delta pull: read the small _index doc, fetch only keys that changed ---------- */
const PROG=PREFIX+'-v1:';
function sessionUser(){ try{ const ss=JSON.parse(sessionStorage.getItem(PREFIX+'-session')||_get.call(localStorage,'bs-keep')||'null'); if(!ss) return null; const A=JSON.parse(_get.call(localStorage,PREFIX+'-auth-v1')||'{}'); return (A.users||[]).find(u=>u.id===ss.uid)||null; }catch(e){ return null; } }
async function pull(skipKeys){
  const ix=await F.getDoc(dref(IDX)); let idx;
  if(!ix.exists()){            // first time: full download, then build the index
    const {out,main}=await fetchAll(); idx={}; Object.entries(main).forEach(([k,v])=>{ idx[k]={ts:v.ts||1,n:v.n||0}; });
    try{ const b=F.writeBatch(db); b.set(dref(IDX),idx,{merge:true}); await b.commit(); }catch(e){}
    const m={}; Object.entries(out).forEach(([k,v])=>{ if(!(skipKeys&&skipKeys.has(k))) _set.call(localStorage,k,v); m[k]=idx[k].ts; }); saveSync(m);
  } else {
    idx=ix.data(); const SY=syncMap();
    const fetchKeys=async keys=>{ await Promise.all(keys.map(async k=>{ const r=await fetchOne(k); if(r.v!=null && !(skipKeys&&skipKeys.has(k))){ _set.call(localStorage,k,r.v); SY[k]=idx[k].ts; } })); };
    const stale=k=>SY[k]!==idx[k].ts || _get.call(localStorage,k)==null;
    await fetchKeys(Object.keys(idx).filter(k=>!k.startsWith(PROG) && stale(k)));          // 1) shared data
    const me=sessionUser(), staff=me&&me.role!=='student';                                  // 2) progress: staff = all, student = own
    const wantP=k=>staff || (me && (k===PROG+me.id || k.startsWith(PROG+me.id+':')));   // + វឌ្ឍនភាពសៀវភៅបន្ថែម
    await fetchKeys(Object.keys(idx).filter(k=>k.startsWith(PROG) && wantP(k) && stale(k)));
    Object.keys(localStorage).filter(k=>k.startsWith(PROG) && !wantP(k) && !(skipKeys&&skipKeys.has(k))).forEach(k=>_rm.call(localStorage,k));
    saveSync(SY);
  }
  Object.keys(localStorage).filter(k=>k.startsWith(PREFIX) && k!==PREFIX+'-session' && !(k in idx) && !(skipKeys&&skipKeys.has(k)) && !Q.has(k)).forEach(k=>_rm.call(localStorage,k));
  return idx;
}

/* ---------- 3-way merge (base = value when this page loaded) ---------- */
const J = x => JSON.stringify(x);
const isObj = x => x && typeof x==='object' && !Array.isArray(x);
function idOf(x){ return isObj(x) && x.id!=null ? 'id:'+x.id : 'j:'+J(x); }
function mergeArr(b,l,r){
  const B=new Map((b||[]).map(x=>[idOf(x),x])), L=new Map(l.map(x=>[idOf(x),x])), out=[], seen=new Set();
  r.forEach(x=>{ const k=idOf(x); seen.add(k);
    if(B.has(k) && !L.has(k)) return;                       // deleted locally
    if(L.has(k) && B.has(k) && J(L.get(k))!==J(B.get(k))) out.push(merge(B.get(k),L.get(k),x)); // changed locally
    else out.push(x); });
  l.forEach(x=>{ const k=idOf(x); if(!seen.has(k) && !B.has(k)) out.push(x); }); // added locally
  return out;
}
function merge(b,l,r){
  if(J(l)===J(r)) return l; if(J(l)===J(b)) return r; if(J(r)===J(b)) return l;
  if(Array.isArray(l)&&Array.isArray(r)) return mergeArr(Array.isArray(b)?b:[],l,r);
  if(isObj(l)&&isObj(r)){ const bb=isObj(b)?b:{}, o={}; new Set([...Object.keys(l),...Object.keys(r),...Object.keys(bb)]).forEach(k=>{
    const inL=k in l, inR=k in r, inB=k in bb;
    if(inL&&inR) o[k]=merge(bb[k],l[k],r[k]);
    else if(inL&&!inR){ if(!inB || J(l[k])!==J(bb[k])) o[k]=l[k]; }        // remote deleted unless changed locally
    else if(inR&&!inL){ if(!inB || J(r[k])!==J(bb[k])) o[k]=r[k]; } });   // local deleted unless changed remotely
    return o; }
  return l;
}

/* ---------- push queue ---------- */
const BASE={}, N={}, Q=new Map(); let timer=null, busy=false;
function allowed(k){
  const r=window.Auth&&Auth.role&&Auth.role();
  if(r==='student') return k===PREFIX+'-exams-v1' || k===PREFIX+'-ws-v1' || k===PREFIX+'-auth-v1' || k===PREFIX+'-board-v1' || k.startsWith(PREFIX+'-v1:');
  return true;
}
function queue(k){ if(!cloud || !k.startsWith(PREFIX) || k===PREFIX+'-session') return; Q.set(k,1); if(!db) return; setStatus('wait'); clearTimeout(timer); timer=setTimeout(flush,900); }
async function flush(){
  if(!db) return; if(busy){ clearTimeout(timer); timer=setTimeout(flush,500); return; } if(!Q.size) return;
  busy=true; const keys=[...Q.keys()]; Q.clear();
  try{
    for(const k of keys){ if(!allowed(k)) continue;
      const local=_get.call(localStorage,k);
      const rem=await fetchOne(k); let out=local;
      if(local!=null && rem.v!=null && rem.v!==local){ try{ out=J(merge(JSON.parse(BASE[k]||'null'),JSON.parse(local),JSON.parse(rem.v))); }catch(e){ out=local; } }
      if(out!==rem.v) await writeOne(k,out,rem.n);
      BASE[k]=local;   // what this app has seen: our own removals since now count as deletions, others' additions stay
    }
    setStatus('ok');
  }catch(e){ console.warn('sync',e); keys.forEach(k=>Q.set(k,1)); setStatus('err'); clearTimeout(timer); timer=setTimeout(flush,8000); }
  busy=false;
}
Storage.prototype.setItem=function(k,v){ _set.call(this,k,v); if(this===localStorage) queue(k); };
Storage.prototype.removeItem=function(k){ _rm.call(this,k); if(this===localStorage) queue(k); };
addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') flush(); });
window.addEventListener('beforeunload',()=>{ if(Q.size) flush(); });
async function flushNow(){ clearTimeout(timer); for(let i=0;i<60 && (Q.size||busy);i++){ if(!busy) await flush(); else await new Promise(r=>setTimeout(r,150)); } }

/* ---------- status chip ---------- */
function setStatus(s){ status=s; const el=document.getElementById('cloudChip'); if(!el) return;
  el.className='cloud-chip '+s; el.title={ok:'☁️ បានរក្សាទុកលើ Cloud',wait:'⏳ កំពុងរក្សាទុក…',err:'⚠️ គ្មានអ៊ីនធឺណិត — នឹងព្យាយាមម្តងទៀត',off:'💻 ក្នុងម៉ាស៊ីននេះតែប៉ុណ្ណោះ'}[s];
  el.textContent={ok:'☁️',wait:'⏳',err:'⚠️',off:'💻'}[s]; }

/* ---------- media from local folder (never uploaded) ---------- */
// Chrome/Edge: showDirectoryPicker + handle remembered in IndexedDB (ជ្រើសម្តងគត់)
const IDB = (mode, fn) => new Promise((res,rej)=>{ const r=indexedDB.open('bs-media',1); r.onupgradeneeded=()=>r.result.createObjectStore('h'); r.onerror=()=>rej(r.error);
  r.onsuccess=()=>{ const tx=r.result.transaction('h',mode), q=fn(tx.objectStore('h')); tx.oncomplete=()=>res(q&&q.result); tx.onerror=()=>rej(tx.error); }; });
function addFile(name, f){
  if(/\.mp3$/i.test(name)){ if(!MEDIA.audio[name]){ MEDIA.audio[name]=URL.createObjectURL(f); return 'a'; } }
  else if(/^p-\d{3}\.jpg$/i.test(name)){ if(!MEDIA.book[name]){ MEDIA.book[name]=URL.createObjectURL(f); return 'b'; } }
  else if(/\.pdf$/i.test(name)){ const w=/teacher/i.test(name)?2:/workbook/i.test(name)?3:/student/i.test(name)?1:0; if(w&&!MEDIA.pdf[w]){ MEDIA.pdf[w]=URL.createObjectURL(f); return 'p'; } }
  return null;
}
async function walk(dir, cnt, depth){
  for await (const [name, h] of dir.entries()){
    if(h.kind==='directory'){ if(depth<4 && !/^(node_modules|\.git|fonts|cert-frames)$/i.test(name)) await walk(h, cnt, depth+1); }
    else if(/\.(mp3|jpg|pdf)$/i.test(name)){ const k=addFile(name, await h.getFile()); if(k) cnt[k]++; }
  }
}
function mediaDone(cnt){
  const t=document.getElementById('bkThumbs'); if(t) delete t.dataset.ok;
  const chip=document.getElementById('mediaChip'); if(chip) chip.remove();
  if(window.toast) toast(`📂 បានភ្ជាប់៖ 📖 ${Object.keys(MEDIA.book).length} ទំព័រ • 🎧 ${Object.keys(MEDIA.audio).length} សំឡេង • 📄 ${Object.keys(MEDIA.pdf).length} PDF`);
  if(window.Book&&Book.redraw) Book.redraw();
}
async function loadHandle(h){ const cnt={a:0,b:0,p:0}; if(window.toast) toast('⏳ កំពុងអាន Folder…'); await walk(h,cnt,0); mediaDone(cnt); return cnt; }
async function pickMedia(){
  if(window.showDirectoryPicker){
    try{ const h=await showDirectoryPicker({id:'bs-media', mode:'read'}); await loadHandle(h); try{ await IDB('readwrite', s=>s.put(h,'dir')); }catch(e){} }
    catch(e){ if(e.name!=='AbortError') toast('មិនអាចបើក Folder: '+e.message); }
    return;
  }
  const i=document.createElement('input'); i.type='file'; i.multiple=true; i.webkitdirectory=true;
  i.onchange=()=>{ const cnt={a:0,b:0,p:0}; [...i.files].forEach(f=>{ const k=addFile(f.name,f); if(k) cnt[k]++; }); mediaDone(cnt); };
  i.click();
}
async function restoreMedia(){
  if(!window.showDirectoryPicker) return;
  let h=null; try{ h=await IDB('readonly', s=>s.get('dir')); }catch(e){} if(!h) return;
  try{ if(await h.queryPermission({mode:'read'})==='granted') return loadHandle(h); }catch(e){ return; }
  const tl=document.querySelector('header .tools'); if(!tl) return;
  tl.insertAdjacentHTML('afterbegin','<button id="mediaChip" class="hot" title="បើក Folder សៀវភៅ/សំឡេង ដែលបានភ្ជាប់ពីមុន">🔓<span>បើកសៀវភៅ/សំឡេង</span></button>');
  document.getElementById('mediaChip').onclick=async()=>{ try{ if(await h.requestPermission({mode:'read'})==='granted') loadHandle(h); }catch(e){ pickMedia(); } };
}

/* ---------- admin panel section ---------- */
function qrSvg(text, cell){ try{ const q=qrcode(0,'L'); q.addData(text); q.make(); return q.createSvgTag({cellSize:cell||4, margin:2}); }catch(e){ return ''; } }
async function refreshKey(k){ if(!db) return false; const r=await fetchOne(k); if(r.v!=null && r.v!==_get.call(localStorage,k) && !Q.has(k)){ _set.call(localStorage,k,r.v); BASE[k]=r.v; return true; } return false; }
/* ---------- 🔄 auto-update: check for a newer version and reload (never in the middle of a test) ---------- */
let updWaiting=false, lastChk=Date.now();
async function checkUpdate(){
  lastChk=Date.now();
  try{ const t=await (await fetch('index.html?u='+Date.now(),{cache:'no-store'})).text(); const m=t.match(/sync\.js\?v=([\w.-]+)/);
    if(!m || m[1]===VER) return;
    if(navigator.serviceWorker){ const r=await navigator.serviceWorker.getRegistration(); if(r) r.update().catch(()=>{}); }
    if(document.getElementById('exam')||document.getElementById('wsRun')){ updWaiting=true; return; }
    (typeof toast==='function')&&toast('🔄 មានកំណែថ្មី — កំពុងធ្វើបច្ចុប្បន្នភាព…'); await flushNow(); setTimeout(()=>location.reload(),900);
  }catch(e){}
}
addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible' && Date.now()-lastChk>30000) checkUpdate(); });
setInterval(()=>{ if(document.visibilityState==='visible') checkUpdate(); }, 5*60000);
setInterval(()=>{ if(updWaiting && !document.getElementById('exam') && !document.getElementById('wsRun')){ updWaiting=false; checkUpdate(); } }, 5000);

/* ---------- 📲 install as an app (PWA) ---------- */
let BIP=null;
addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); BIP=e; document.querySelectorAll('.inst-b').forEach(b=>b.classList.add('ready')); });
addEventListener('appinstalled', ()=>{ BIP=null; document.querySelectorAll('.inst-bar').forEach(b=>b.remove()); (typeof toast==='function')&&toast('✅ បានដំឡើងកម្មវិធីរួចរាល់ — រកមើលរូប 📚 នៅលើអេក្រង់ទូរស័ព្ទ'); });
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone===true;
const IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
function installBanner(){
  if(standalone() || _get.call(localStorage,'bs-inst-x')) return '';
  return `<div class="inst-bar"><img src="icons/icon-192.png" alt=""><div><b>ដំឡើងកម្មវិធីលើទូរស័ព្ទ</b><small>បើកលឿន ដូចកម្មវិធីធម្មតា 📲</small></div><button class="btn teal sm inst-b ${BIP?'ready':''}" onclick="Cloud.install()">ដំឡើង</button><button class="x" onclick="localStorage.setItem('bs-inst-x','1');this.parentNode.remove()">✕</button></div>`;
}
async function install(){
  if(standalone()) return toast('✅ កម្មវិធីបានដំឡើងរួចហើយ');
  if(BIP){ BIP.prompt(); try{ const c=await BIP.userChoice; if(c.outcome==='accepted') toast('⏳ កំពុងដំឡើង…'); }catch(e){} BIP=null; return; }
  const android=/android/i.test(navigator.userAgent);
  modal(`<h3>📲 ដំឡើងកម្មវិធីលើទូរស័ព្ទ</h3>
    ${IOS?`<div class="inst-steps"><div><span>1</span>បើក Website នេះក្នុង <b>Safari</b></div><div><span>2</span>ចុចប៊ូតុង <b>ចែករំលែក</b> <svg width="18" height="22" viewBox="0 0 18 22" style="vertical-align:-4px"><path d="M9 1v13M4 6l5-5 5 5M2 10v10h14V10" fill="none" stroke="#2563eb" stroke-width="2"/></svg> (ខាងក្រោមអេក្រង់)</div><div><span>3</span>ជ្រើស <b>Add to Home Screen</b> (បន្ថែមទៅអេក្រង់ដើម)</div><div><span>4</span>ចុច <b>Add</b> → បើកពីរូប 📚 លើអេក្រង់</div></div>
      <p class="note">💡 លើ iPhone បើកកម្មវិធីលើកដំបូង ត្រូវវាយកូដថ្នាក់ម្តងទៀត</p>`
    :`<div class="inst-steps"><div><span>1</span>បើក Website នេះក្នុង <b>Chrome</b></div><div><span>2</span>ចុច <b>⋮</b> (ជ្រុងខាងលើស្តាំ)</div><div><span>3</span>ជ្រើស <b>Install app</b> ឬ <b>Add to Home screen</b></div><div><span>4</span>ចុច <b>Install</b> → បើកពីរូប 📚 លើអេក្រង់</div></div>
      ${android?'':'<p class="note">💡 លើកុំព្យូទ័រ៖ ចុចរូប ⊕ នៅចុងរបារអាសយដ្ឋាន (Chrome/Edge) ដើម្បីដំឡើង</p>'}`}`);
}

/* ---------- 🔢 class code (short code → school) ---------- */
const ALPH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789', META=PREFIX+'-meta';
const DEF = () => window.BS_DEFAULT_CFG || null;
function meta(){ try{ return JSON.parse(_get.call(localStorage,META)||'{}'); }catch(e){ return {}; } }
async function makeCode(){
  if(!db) return toast('⚠️ ត្រូវភ្ជាប់ Cloud ជាមុនសិន');
  for(let i=0;i<8;i++){
    const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),x=>ALPH[x%ALPH.length]).join('');
    try{ const b=F.writeBatch(db); b.set(F.doc(db,'codes',code),{s:cloud.school, c:cloud.cfg, ts:Date.now()}); await b.commit();
      const m=meta(); m.code=code; localStorage.setItem(META, J(m)); toast('✅ កូដថ្នាក់៖ '+code); if(window.render) render(); return code; }
    catch(e){ if(i===7) toast('❌ បង្កើតកូដមិនបាន៖ '+(e.code||e.message)); }
  }
}
async function _code(){
  const inp=document.getElementById('codeIn'), err=document.getElementById('joinErr'), v=inp.value.trim();
  const m=v.match(/join=([\w-]+)/); if(m){ location.hash='join='+m[1]; location.reload(); return; }
  const code=v.toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(code.length!==6){ err.textContent='សូមវាយលេខកូដ ៦ តួ'; return; }
  err.textContent='⏳ កំពុងស្វែងរកថ្នាក់…';
  try{ const ok=await joinByCode(code); if(!ok){ err.textContent='❌ រកមិនឃើញកូដ «'+code+'» — សូមពិនិត្យម្តងទៀត'; return; } location.reload(); }
  catch(x){ err.textContent='❌ ភ្ជាប់មិនបាន ('+(x.code||x.message)+') — សូមពិនិត្យអ៊ីនធឺណិត'; }
}
// look up a 6-character code and switch this device to that school
async function joinByCode(code){
  const cfg=(cloud&&cloud.cfg)||DEF(); if(!cfg) throw new Error('no Firebase config');
  const prev=cloud; cloud={cfg, school:(prev&&prev.school)||null};
  if(!db) await initFB();
  const d=await F.getDoc(F.doc(db,'codes',code));
  if(!d.exists()){ cloud=prev; return false; }
  const v=d.data(), school=v.s;
  if(prev && prev.school && prev.school!==school){   // another school's data on this device → clear it
    Object.keys(localStorage).filter(k=>k.startsWith(PREFIX)).forEach(k=>_rm.call(localStorage,k)); _rm.call(localStorage,SYK); _rm.call(localStorage,'bs-keep'); sessionStorage.removeItem(PREFIX+'-session'); }
  cloud={cfg:v.c||cfg, school, code}; _set.call(localStorage,CK,J(cloud)); return true;
}
// role links:  ?c=CODE → students   ?t=CODE → teachers   ?a=CODE → admin
const LINK=(()=>{ const q=new URLSearchParams(location.search); for(const [k,role] of [['c','student'],['t','teacher'],['a','admin']]){ const v=(q.get(k)||'').toUpperCase().replace(/[^A-Z0-9]/g,''); if(v.length===6) return {code:v, role}; } return null; })();
if(LINK) sessionStorage.setItem('bs-tab', LINK.role);
function roleLink(role, code){ return location.origin+location.pathname+'?'+({student:'c',teacher:'t',admin:'a'}[role])+'='+code; }
function codeKey(e){ const i=e.target; const p=i.selectionStart; i.value=i.value.toUpperCase().replace(/[^A-Z0-9#:/=._-]/g,''); if(e.key==='Enter') _code(); }

function panel(){
  if(!cloud) return `<div class="panel"><h3 class="sec">☁️ Cloud (Firebase)</h3><p class="km">ម៉ាស៊ីននេះមិនទាន់ភ្ជាប់ Cloud ទេ — ទិន្នន័យនៅក្នុង Browser នេះតែប៉ុណ្ណោះ។</p><button class="btn teal" onclick="Cloud.setupScreen()">☁️ ភ្ជាប់ Firebase</button></div><div style="height:14px"></div>`;
  const L=joinLink();
  return `<div class="panel"><div class="row" style="justify-content:space-between"><h3 class="sec" style="margin:0">☁️ Cloud (Firebase) — ${status==='err'?'⚠️ គ្មានអ៊ីនធឺណិត':'✅ ភ្ជាប់រួច'}</h3><span class="note">Project: <b>${esc(cloud.cfg.projectId)}</b></span></div>
    ${(()=>{ const c=meta().code; if(!c) return ''; const R=[['student','🎓 តំណសិស្ស','ផ្ញើក្នុងក្រុម Telegram សិស្ស'],['teacher','👩‍🏫 តំណគ្រូ','ផ្ញើឱ្យគ្រូផ្សេងៗ (ចូលដោយ Username + ពាក្យសម្ងាត់)'],['admin','🛡️ តំណ Admin','សម្រាប់ Admin តែប៉ុណ្ណោះ — កុំចែករំលែក']];
      return `<div class="cloud-links">${R.map(([r,t,d])=>{ const L=roleLink(r,c); return `<div class="cl-link ${r}"><div class="qr">${qrSvg(L,3)}</div><div><b>${t}</b><small>${d}</small><code>${esc(L)}</code>
        <div class="row"><button class="btn sm teal" onclick="navigator.clipboard.writeText('${L}').then(()=>toast('✅ បានចម្លង'))">📋 ចម្លង</button>${r!=='admin'?`<a class="btn sm ghost" target="_blank" href="https://t.me/share/url?url=${encodeURIComponent(L)}&text=${encodeURIComponent(r==='teacher'?'👩‍🏫 Beginner English Studio — តំណសម្រាប់គ្រូ':'📚 Beginner English Studio — ចុចដើម្បីចូលថ្នាក់')}">✈️ Telegram</a>`:''}</div></div></div>`; }).join('')}</div>`; })()}
    ${(()=>{ const c=meta().code; return `<div class="cloud-code"><div><span>🔢 កូដថ្នាក់ (ប្រាប់សិស្សឱ្យវាយ)</span><b>${c?c.split('').join(' '):'—'}</b><small>${location.host+location.pathname}</small></div>${c?'':`<button class="btn sun" onclick="Cloud.makeCode()">＋ បង្កើតកូដថ្នាក់</button>`}</div>`; })()}
    <div class="cloud-join"><div class="qr">${qrSvg(L,4)}</div><div>
      <p class="km"><b>🔗 តំណចូលថ្នាក់</b> — ផ្ញើឱ្យសិស្ស និងគ្រូតាម Telegram ឬឱ្យស្កេន QR។ បើកម្តងគត់ ទូរស័ព្ទនឹងចងចាំ។</p>
      <textarea class="cl-in" readonly style="width:100%;height:70px;font-size:11px" onclick="this.select()">${esc(L)}</textarea>
      <div class="row"><button class="btn teal" onclick="navigator.clipboard.writeText('${L}').then(()=>toast('✅ បានចម្លង'))">📋 ចម្លងតំណ</button><a class="btn ghost" target="_blank" href="https://t.me/share/url?url=${encodeURIComponent(L)}&text=${encodeURIComponent('📚 Beginner English Studio — ចុចដើម្បីចូលថ្នាក់')}">✈️ Telegram</a><button class="btn ghost" onclick="Cloud.disconnect()">⛔ ផ្តាច់ម៉ាស៊ីននេះ</button></div>
      <p class="note">⚠️ អ្នកណាមានតំណនេះ អាចមើលឃើញទិន្នន័យថ្នាក់ (ឈ្មោះ រូប ពិន្ទុ)។ កុំផ្សព្វផ្សាយជាសាធារណៈ។</p></div></div></div><div style="height:14px"></div>`;
}
function disconnect(){ if(!confirm('ផ្តាច់ Cloud ពីម៉ាស៊ីននេះ? (ទិន្នន័យលើ Cloud នៅដដែល)')) return; _rm.call(localStorage,CK); Object.keys(localStorage).filter(k=>k.startsWith(PREFIX)).forEach(k=>_rm.call(localStorage,k)); sessionStorage.clear(); location.reload(); }

/* ---------- first-visit screen (no cloud, no local data) ---------- */
function setupScreen(force){
  if(!window.QRScan){ const sc=document.createElement('script'); sc.src='qrscan.js?v='+VER; document.head.appendChild(sc); }
  const el=document.createElement('div'); el.id='auth'; document.body.appendChild(el); document.body.classList.add('auth-open');
  el.innerHTML=`<div class="au-bg"><i></i><i></i><i></i></div><div class="au-card"><div class="au-logo">📚</div><h1>Beginner Class</h1>
    <button class="au-scan" onclick="QRScan.open()"><span>📷</span><div><b>ស្កេន QR លើកាត</b><small>សិស្ស ឬគ្រូ — ចូលភ្លាម</small></div></button><div class="au-or"><span>ឬ</span></div>
    <div class="cloud-opt code"><b>🔢 វាយលេខកូដថ្នាក់</b><p class="km">លេខកូដ ៦ តួ ដែលគ្រូប្រាប់ (ឧ. <b>K7M2QX</b>)</p>
      <input id="codeIn" class="code-in" maxlength="600" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="••••••" onkeyup="Cloud._codeKey(event)"><div class="au-err" id="joinErr"></div>
      <button class="au-btn" onclick="Cloud._code()">🚀 ចូលថ្នាក់</button>
      <p class="note" style="text-align:center;margin-top:8px">ឬស្កេន QR លើកាតចូលប្រព័ន្ធ</p></div>
    <details class="cloud-opt" ${force?'open':''}><summary><b>⚙️ បង្កើតសាលាថ្មីលើ Firebase (Admin តែលើកដំបូងប៉ុណ្ណោះ)</b></summary>
      <p class="km" style="text-align:left;color:#b45309">⚠️ បើសាលាបានភ្ជាប់រួចហើយ កុំប្រើផ្នែកនេះ — វានឹងបង្កើតសាលាថ្មីទទេ។ សូមប្រើតំណចូលថ្នាក់ខាងលើវិញ។</p>
      <p class="km" style="text-align:left">បិទភ្ជាប់ <code>firebaseConfig</code> ពី Firebase Console (Project settings → Your apps → Web)</p>
      <textarea id="cfgIn" class="cl-in" style="width:100%;height:140px;font:12px monospace" placeholder="const firebaseConfig = {&#10;  apiKey: &quot;...&quot;,&#10;  authDomain: &quot;...&quot;,&#10;  projectId: &quot;...&quot;,&#10;  appId: &quot;...&quot;&#10;};"></textarea>
      <div class="au-err" id="auErr"></div><button class="au-btn" onclick="Cloud._connect()">☁️ ភ្ជាប់ ហើយបង្កើតសាលាថ្មី</button></details>
    <button class="au-link" style="background:none;display:block;margin:8px auto 0" onclick="Cloud._local()">💻 ប្រើក្នុង Browser នេះតែប៉ុណ្ណោះ (គ្មាន Cloud)</button></div>
    <div class="au-foot"><div>គ្រប់គ្រងការបង្កើតដោយ៖ <b>លោក ប៊ុន វណ្ណនី</b></div><div class="au-contact">📞 ទំនាក់ទំនង Telegram៖ <a href="https://t.me/bunvanny" target="_blank" rel="noopener">0967943637</a> ឬ <a href="https://t.me/bunvanny" target="_blank" rel="noopener">@bunvanny</a></div></div>`;
  setTimeout(()=>{ const i=document.getElementById('codeIn'); if(i) i.focus(); },100);
}
async function _connect(){
  const t=document.getElementById('cfgIn').value, cfg={};
  ['apiKey','authDomain','projectId','storageBucket','messagingSenderId','appId'].forEach(k=>{ const m=t.match(new RegExp(k+'["\']?\\s*:\\s*["\']([^"\']+)["\']')); if(m) cfg[k]=m[1]; });
  const e=document.getElementById('auErr');
  if(!cfg.apiKey||!cfg.projectId){ e.textContent='រកមិនឃើញ apiKey / projectId — សូមបិទភ្ជាប់ firebaseConfig ទាំងមូល'; return; }
  const school=Array.from(crypto.getRandomValues(new Uint8Array(15)),x=>x.toString(36).padStart(2,'0')).join('').slice(0,24);
  cloud={cfg, school}; e.textContent='⏳ កំពុងភ្ជាប់…';
  try{ await initFB(); await writeOne('beginner-studio-hello', J({created:Date.now()}), 0); }
  catch(x){ cloud=null; e.textContent='❌ ភ្ជាប់មិនបាន៖ '+(x.code||x.message)+' — សូមពិនិត្យ Anonymous sign-in និង Firestore rules'; return; }
  _set.call(localStorage,CK,J(cloud));
  // upload any existing local data from this browser
  for(const k of Object.keys(localStorage).filter(k=>k.startsWith(PREFIX))) await writeOne(k,_get.call(localStorage,k),0);
  location.reload();
}
function _join(){ const v=document.getElementById('joinIn').value.trim(), m=v.match(/join=([\w-]+)/); if(!m){ document.getElementById('joinErr').textContent='តំណមិនត្រឹមត្រូវ — ត្រូវមាន #join=…'; return; } location.hash='join='+m[1]; location.reload(); }
function _local(){ _set.call(localStorage,CK+'-local','1'); location.reload(); }

/* ---------- boot ---------- */
function loader(on, msg){ let l=document.getElementById('bootL'); if(on&&!l){ l=document.createElement('div'); l.id='bootL'; l.innerHTML='<div class="spin"></div><p></p><button onclick="this.parentNode.dataset.skip=1">⏭ ប្រើទិន្នន័យចាស់ក្នុងទូរស័ព្ទសិន</button>'; document.body.appendChild(l); } if(l&&msg) l.querySelector('p').textContent=msg; if(!on&&l) l.remove(); }
function loadScripts(){ FILES.forEach(f=>{ const s=document.createElement('script'); s.src=f+'?v='+VER; s.async=false; document.body.appendChild(s); });
  const last=document.querySelector('script[src^="app.js"]'); last.addEventListener('load',afterApp); }
function afterApp(){
  const tl=document.querySelector('header .tools'); if(!tl) return;
  const r=window.Auth&&Auth.role(); if(!r) return;
  if(r!=='student') tl.insertAdjacentHTML('afterbegin','<button onclick="Cloud.pickMedia()" title="ភ្ជាប់ Folder សៀវភៅ/សំឡេង ពីកុំព្យូទ័រនេះ">📂<span>ឯកសារ</span></button>');
  tl.insertAdjacentHTML('afterbegin','<button id="cloudChip" class="cloud-chip" onclick="location.reload()"></button>'); setStatus(!cloud?'off':status==='wait'?'wait':status==='err'||!db?'err':'ok');
  if(r!=='student') restoreMedia();
}
async function boot(){
  if(LINK && !(cloud && cloud.code===LINK.code)){
    loader(true,'🔗 កំពុងភ្ជាប់ថ្នាក់…');
    try{ const ok=await joinByCode(LINK.code); if(!ok){ loader(false); setupScreen(); const e=document.getElementById('joinErr'); if(e) e.textContent='❌ តំណនេះមិនត្រឹមត្រូវ (រកមិនឃើញកូដ '+LINK.code+')'; return; } }
    catch(e){ console.warn(e); }
    loader(false);
  }
  const hasLocal=Object.keys(localStorage).some(k=>k.startsWith(PREFIX)) || _get.call(localStorage,CK+'-local');
  if(!cloud && !hasLocal){ setupScreen(); return; }
  const setBase=()=>Object.keys(localStorage).filter(k=>k.startsWith(PREFIX)).forEach(k=>{ BASE[k]=_get.call(localStorage,k); });
  if(cloud){
    const cached = !!_get.call(localStorage,SYK) && Object.keys(localStorage).some(k=>k.startsWith(PREFIX+'-auth'));
    loader(true, cached ? '⚡ កំពុងពិនិត្យទិន្នន័យថ្មី…' : '☁️ កំពុងទាញទិន្នន័យថ្នាក់ (លើកដំបូង)…');
    const late=new Set(); let started=false;
    const job=(async()=>{ await initFB(); await pull(late); })();
    // returning device: never wait long — start with cached data and keep syncing in background
    const winner = await Promise.race([ job.then(()=>'ok',e=>{ console.warn(e); return 'err'; }),
      new Promise(res=>{ const t0=Date.now(); const iv=setInterval(()=>{ const l=document.getElementById('bootL'); if((cached && Date.now()-t0>3000) || (l&&l.dataset.skip)){ clearInterval(iv); res('slow'); } },150); }) ]);
    if(winner==='slow'){
      setBase(); started=true; Object.keys(BASE).forEach(k=>late.add(k)); status='wait';
      job.then(()=>{ status='ok'; setStatus('ok'); if(Q.size) flush(); }).catch(()=>{ status='err'; setStatus('err'); });
    } else if(winner==='err'){ status='err'; setTimeout(()=>(typeof toast==='function')&&toast('⚠️ ភ្ជាប់ Cloud មិនបាន — កំពុងប្រើទិន្នន័យចុងក្រោយក្នុងម៉ាស៊ីននេះ'),1500); }
    else status='ok';
    loader(false);
  }
  setBase();
  loadScripts();
}
/* ---------- 💬 live data (presence • friends • chat) — schools/{school}/live/... realtime via onSnapshot ---------- */
const lref = (...p) => F.doc(db,'schools',cloud.school,'live',...p);
const lcol = (...p) => F.collection(db,'schools',cloud.school,'live',...p);
const live = {
  ok: ()=>!!db,
  watch(path, cb){ if(!db) return ()=>{}; return F.onSnapshot(lref(...path), d=>cb(d.exists()?d.data():{}), ()=>cb(null)); },
  merge(path, data){ if(!db) return Promise.resolve(); return F.setDoc(lref(...path), data, {merge:true}).catch(e=>console.warn(e)); },
  del(path, field){ if(!db) return Promise.resolve(); return F.updateDoc(lref(...path), {[field]:F.deleteField()}).catch(()=>{}); },
  watchCol(path, cb, n){ if(!db) return ()=>{}; const q=F.query(lcol(...path), F.orderBy('ts'), F.limitToLast(n||150)); return F.onSnapshot(q, s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))), ()=>cb(null)); },
  add(path, data){ if(!db) return Promise.reject('off'); return F.addDoc(lcol(...path), data); },
  set(path, data){ if(!db) return Promise.resolve(); return F.setDoc(lref(...path), data, {merge:true}); },
  get(path){ if(!db) return Promise.resolve(null); return F.getDoc(lref(...path)).then(d=>d.exists()?d.data():null); },
  rm(path){ if(!db) return Promise.resolve(); return F.deleteDoc(lref(...path)).catch(()=>{}); },
  upd(path, data){ if(!db) return Promise.resolve(); return F.updateDoc(lref(...path), data).catch(()=>{}); }
};
window.Cloud={ live, checkUpdate, installBanner, install, standalone, refresh:refreshKey, roleLink, makeCode, _code, _codeKey:codeKey, code:()=>meta().code, flush:flushNow, panel, pickMedia, disconnect, setupScreen:()=>{ setupScreen(true); }, _connect, _join, _local, joinLink:()=>cloud?joinLink():null, qrSvg, on:()=>!!db, merge };
boot();
})();
