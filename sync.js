// =====================================================================
//  sync.js — 🌐 Website mode (GitHub Pages) + ☁️ Firebase sync
//  • ទិន្នន័យ (គណនី ថ្នាក់ ពិន្ទុ ប្រឡង វឌ្ឍនភាព) រក្សាទុកក្នុង Firestore: schools/{code}/kv/{key}
//  • ពេលបើក៖ ទាញទិន្នន័យពី Cloud → localStorage → ដំណើរការកម្មវិធី
//  • ពេលកែ៖ localStorage.setItem → រុញទៅ Cloud (បញ្ចូលគ្នា 3-way merge ការពារការជាន់គ្នា)
//  • សៀវភៅ/សំឡេង Headway មិនដាក់លើ Website ទេ — គ្រូភ្ជាប់ពី Folder ក្នុងម៉ាស៊ីន (📂)
// =====================================================================
(function(){
window.IS_WEB = true; document.documentElement.classList.add('is-web'); document.addEventListener('DOMContentLoaded',()=>document.body.classList.add('is-web')); if(document.body) document.body.classList.add('is-web');
const FILES=['qrcode.js','tracks.js','data.js','wordlist.js','lessons.js','slides.js','book.js','class.js','exam-font.js','exam.js','auth.js','app.js'];
const FB='https://www.gstatic.com/firebasejs/10.12.2/';
const CK='bs-cloud', PREFIX='beginner-studio', CHUNK=300000;
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const b64e = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d = s => decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));
const _get=Storage.prototype.getItem, _set=Storage.prototype.setItem, _rm=Storage.prototype.removeItem;
let cloud=null; try{ cloud=JSON.parse(_get.call(localStorage,CK)||'null'); }catch(e){}
const MEDIA = window.MEDIA = {audio:{}, book:{}, pdf:{}};

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
  const [app, auth, fs] = await Promise.all([import(FB+'firebase-app.js'), import(FB+'firebase-auth.js'), import(FB+'firebase-firestore.js')]);
  const a=app.initializeApp(cloud.cfg); F={...fs}; db=fs.getFirestore(a);
  const au=auth.getAuth(a); if(!au.currentUser) await auth.signInAnonymously(au);
}
const col = () => F.collection(db,'schools',cloud.school,'kv');
const dref = id => F.doc(db,'schools',cloud.school,'kv',id);
async function fetchAll(){
  const snap=await F.getDocs(col()); const main={}, parts={};
  snap.forEach(d=>{ const v=d.data(), id=d.id, i=id.lastIndexOf('~'); if(i>0 && /^\d+$/.test(id.slice(i+1))) (parts[id.slice(0,i)]=parts[id.slice(0,i)]||[])[+id.slice(i+1)]=v.d; else main[id]=v; });
  const out={}; Object.entries(main).forEach(([k,v])=>{ out[k]=v.n ? (parts[k]||[]).slice(0,v.n).join('') : v.d; }); return {out, main};
}
async function fetchOne(k){
  const m=await F.getDoc(dref(k)); if(!m.exists()) return {v:null,n:0}; const v=m.data();
  if(!v.n) return {v:v.d, n:0};
  const ps=await Promise.all(Array.from({length:v.n},(_,i)=>F.getDoc(dref(k+'~'+i)))); return {v:ps.map(p=>p.exists()?p.data().d:'').join(''), n:v.n};
}
async function writeOne(k, str, oldN){
  const b=F.writeBatch(db), who=(window.Auth&&Auth.user()&&Auth.user().name)||'';
  if(str==null){ b.delete(dref(k)); for(let i=0;i<oldN;i++) b.delete(dref(k+'~'+i)); return b.commit(); }
  if(str.length<=CHUNK){ b.set(dref(k),{d:str,n:0,ts:Date.now(),by:who}); for(let i=0;i<oldN;i++) b.delete(dref(k+'~'+i)); }
  else { const n=Math.ceil(str.length/CHUNK); for(let i=0;i<n;i++) b.set(dref(k+'~'+i),{d:str.slice(i*CHUNK,(i+1)*CHUNK)}); for(let i=n;i<oldN;i++) b.delete(dref(k+'~'+i)); b.set(dref(k),{n,ts:Date.now(),by:who}); }
  return b.commit();
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
  if(r==='student') return k===PREFIX+'-exams-v1' || k===PREFIX+'-auth-v1' || k.startsWith(PREFIX+'-v1:');
  return true;
}
function queue(k){ if(!db || !k.startsWith(PREFIX) || k===PREFIX+'-session') return; Q.set(k,1); setStatus('wait'); clearTimeout(timer); timer=setTimeout(flush,900); }
async function flush(){
  if(busy){ clearTimeout(timer); timer=setTimeout(flush,500); return; } if(!Q.size) return;
  busy=true; const keys=[...Q.keys()]; Q.clear();
  try{
    for(const k of keys){ if(!allowed(k)) continue;
      const local=_get.call(localStorage,k);
      const rem=await fetchOne(k); let out=local;
      if(local!=null && rem.v!=null && rem.v!==local){ try{ out=J(merge(JSON.parse(BASE[k]||'null'),JSON.parse(local),JSON.parse(rem.v))); }catch(e){ out=local; } }
      if(out===rem.v) continue;
      await writeOne(k,out,rem.n);
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
function panel(){
  if(!cloud) return `<div class="panel"><h3 class="sec">☁️ Cloud (Firebase)</h3><p class="km">ម៉ាស៊ីននេះមិនទាន់ភ្ជាប់ Cloud ទេ — ទិន្នន័យនៅក្នុង Browser នេះតែប៉ុណ្ណោះ។</p><button class="btn teal" onclick="Cloud.setupScreen()">☁️ ភ្ជាប់ Firebase</button></div><div style="height:14px"></div>`;
  const L=joinLink();
  return `<div class="panel"><div class="row" style="justify-content:space-between"><h3 class="sec" style="margin:0">☁️ Cloud (Firebase) — ${status==='err'?'⚠️ គ្មានអ៊ីនធឺណិត':'✅ ភ្ជាប់រួច'}</h3><span class="note">Project: <b>${esc(cloud.cfg.projectId)}</b></span></div>
    <div class="cloud-join"><div class="qr">${qrSvg(L,4)}</div><div>
      <p class="km"><b>🔗 តំណចូលថ្នាក់</b> — ផ្ញើឱ្យសិស្ស និងគ្រូតាម Telegram ឬឱ្យស្កេន QR។ បើកម្តងគត់ ទូរស័ព្ទនឹងចងចាំ។</p>
      <textarea class="cl-in" readonly style="width:100%;height:70px;font-size:11px" onclick="this.select()">${esc(L)}</textarea>
      <div class="row"><button class="btn teal" onclick="navigator.clipboard.writeText('${L}').then(()=>toast('✅ បានចម្លង'))">📋 ចម្លងតំណ</button><a class="btn ghost" target="_blank" href="https://t.me/share/url?url=${encodeURIComponent(L)}&text=${encodeURIComponent('📚 Beginner English Studio — ចុចដើម្បីចូលថ្នាក់')}">✈️ Telegram</a><button class="btn ghost" onclick="Cloud.disconnect()">⛔ ផ្តាច់ម៉ាស៊ីននេះ</button></div>
      <p class="note">⚠️ អ្នកណាមានតំណនេះ អាចមើលឃើញទិន្នន័យថ្នាក់ (ឈ្មោះ រូប ពិន្ទុ)។ កុំផ្សព្វផ្សាយជាសាធារណៈ។</p></div></div></div><div style="height:14px"></div>`;
}
function disconnect(){ if(!confirm('ផ្តាច់ Cloud ពីម៉ាស៊ីននេះ? (ទិន្នន័យលើ Cloud នៅដដែល)')) return; _rm.call(localStorage,CK); Object.keys(localStorage).filter(k=>k.startsWith(PREFIX)).forEach(k=>_rm.call(localStorage,k)); sessionStorage.clear(); location.reload(); }

/* ---------- first-visit screen (no cloud, no local data) ---------- */
function setupScreen(force){
  const el=document.createElement('div'); el.id='auth'; document.body.appendChild(el); document.body.classList.add('auth-open');
  el.innerHTML=`<div class="au-bg"><i></i><i></i><i></i></div><div class="au-card"><div class="au-logo">☁️</div><h1>Beginner English Studio</h1>
    <div class="cloud-opt"><b>🎓 សិស្ស / 👩‍🏫 គ្រូ / 🛡️ Admin</b><p class="km">ស្កេន <b>QR</b> ឬបើក <b>តំណចូលថ្នាក់</b> — ឬបិទភ្ជាប់តំណនៅទីនេះ៖</p>
      <input id="joinIn" class="cl-in" style="width:100%;box-sizing:border-box" placeholder="https://…#join=…" onkeydown="if(event.key==='Enter')Cloud._join()"><div class="au-err" id="joinErr"></div>
      <button class="au-btn" onclick="Cloud._join()">🔗 ចូលថ្នាក់</button></div>
    <details class="cloud-opt" ${force?'open':''}><summary><b>⚙️ បង្កើតសាលាថ្មីលើ Firebase (Admin តែលើកដំបូងប៉ុណ្ណោះ)</b></summary>
      <p class="km" style="text-align:left;color:#b45309">⚠️ បើសាលាបានភ្ជាប់រួចហើយ កុំប្រើផ្នែកនេះ — វានឹងបង្កើតសាលាថ្មីទទេ។ សូមប្រើតំណចូលថ្នាក់ខាងលើវិញ។</p>
      <p class="km" style="text-align:left">បិទភ្ជាប់ <code>firebaseConfig</code> ពី Firebase Console (Project settings → Your apps → Web)</p>
      <textarea id="cfgIn" class="cl-in" style="width:100%;height:140px;font:12px monospace" placeholder="const firebaseConfig = {&#10;  apiKey: &quot;...&quot;,&#10;  authDomain: &quot;...&quot;,&#10;  projectId: &quot;...&quot;,&#10;  appId: &quot;...&quot;&#10;};"></textarea>
      <div class="au-err" id="auErr"></div><button class="au-btn" onclick="Cloud._connect()">☁️ ភ្ជាប់ ហើយបង្កើតសាលាថ្មី</button></details>
    <button class="au-link" style="background:none" onclick="Cloud._local()">💻 ប្រើក្នុង Browser នេះតែប៉ុណ្ណោះ (គ្មាន Cloud)</button></div>
    <div class="au-foot">Beginner English Studio • 🌐 Website</div>`;
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
function loader(on){ let l=document.getElementById('bootL'); if(on&&!l){ l=document.createElement('div'); l.id='bootL'; l.innerHTML='<div class="spin"></div><p>☁️ កំពុងទាញទិន្នន័យថ្នាក់…</p>'; document.body.appendChild(l); } if(!on&&l) l.remove(); }
function loadScripts(){ FILES.forEach(f=>{ const s=document.createElement('script'); s.src=f; s.async=false; document.body.appendChild(s); });
  const last=document.querySelector('script[src="app.js"]'); last.addEventListener('load',afterApp); }
function afterApp(){
  const tl=document.querySelector('header .tools'); if(!tl) return;
  const r=window.Auth&&Auth.role(); if(!r) return;
  if(r!=='student') tl.insertAdjacentHTML('afterbegin','<button onclick="Cloud.pickMedia()" title="ភ្ជាប់ Folder សៀវភៅ/សំឡេង ពីកុំព្យូទ័រនេះ">📂<span>ឯកសារ</span></button>');
  tl.insertAdjacentHTML('afterbegin','<button id="cloudChip" class="cloud-chip" onclick="location.reload()"></button>'); setStatus(db?(status==='err'?'err':'ok'):'off');
  if(r!=='student') restoreMedia();
}
async function boot(){
  const hasLocal=Object.keys(localStorage).some(k=>k.startsWith(PREFIX)) || _get.call(localStorage,CK+'-local');
  if(!cloud && !hasLocal){ setupScreen(); return; }
  if(cloud){
    loader(true);
    try{ await initFB(); const {out,main}=await fetchAll();
      Object.keys(localStorage).filter(k=>k.startsWith(PREFIX)&&!(k in out)).forEach(k=>_rm.call(localStorage,k));
      Object.entries(out).forEach(([k,v])=>{ _set.call(localStorage,k,v); BASE[k]=v; N[k]=main[k].n||0; });
      Object.keys(localStorage).filter(k=>k.startsWith(PREFIX)).forEach(k=>{ if(BASE[k]===undefined) BASE[k]=null; });
      status='ok';
    }catch(e){ console.warn(e); status='err'; db=null; setTimeout(()=>window.toast&&toast('⚠️ ភ្ជាប់ Cloud មិនបាន — កំពុងប្រើទិន្នន័យចុងក្រោយក្នុងម៉ាស៊ីននេះ'),1500); }
    loader(false);
  }
  loadScripts();
}
window.Cloud={ flush:flushNow, panel, pickMedia, disconnect, setupScreen:()=>{ setupScreen(true); }, _connect, _join, _local, joinLink:()=>cloud?joinLink():null, qrSvg, on:()=>!!db, merge };
boot();
})();
