// =====================================================================
//  sig.js — ✍️ ហត្ថលេខាគ្រូ: គូរផ្ទាល់ ឬថតរូប → លុបផ្ទៃខាងក្រោយ • ប្តូរពណ៌ • កាត់គែម → PNG ថ្លា
//  Sig.open(current, cb)  → cb(dataURL | '')
// =====================================================================
(function(){
const $ = s => document.querySelector(s);
const INKS = [['','ពណ៌ដើម'],['#111827','ខ្មៅ'],['#1d4ed8','ខៀវ'],['#1e3a8a','ខៀវចាស់'],['#b91c1c','ក្រហម'],['#047857','បៃតង'],['#7c3aed','ស្វាយ']];
let G=null;
function open(cur, cb){
  G={cb, mode:'draw', src:null, bg:true, thr:62, ink:'#1d4ed8', w:4, drawing:false};
  modal(`<div class="sg"><h3>✍️ ហត្ថលេខារបស់ខ្ញុំ</h3>
    <div class="sg-tabs"><button data-m="draw" class="on" onclick="Sig._mode('draw')">✍️ គូរផ្ទាល់</button><button data-m="photo" onclick="Sig._mode('photo')">📷 ថតរូប / រើសរូប</button></div>
    <div id="sgDraw"><canvas id="sgPad" width="900" height="320"></canvas>
      <div class="row sg-row"><span>កម្រាស់</span><input type="range" min="2" max="10" value="4" oninput="Sig._w(this.value)"><button class="btn ghost sm" onclick="Sig._clear()">🧽 លុបចោល</button></div></div>
    <div id="sgPhoto" hidden><div class="row sg-row"><label class="btn teal sm">📷 ថតរូប<input type="file" accept="image/*" capture="environment" hidden onchange="Sig._file(this.files[0])"></label><label class="btn ghost sm">🖼 រើសរូប<input type="file" accept="image/*" hidden onchange="Sig._file(this.files[0])"></label></div>
      <p class="note">💡 សរសេរហត្ថលេខាលើក្រដាសស ហើយថតឱ្យភ្លឺ ច្បាស់ និងត្រង់</p>
      <label class="row sg-row"><input type="checkbox" checked onchange="Sig._bg(this.checked)"> <b>🧽 លុបផ្ទៃខាងក្រោយ</b></label>
      <div class="row sg-row"><span>កម្រិតលុប</span><input type="range" min="20" max="95" value="62" oninput="Sig._thr(this.value)"><small class="note">រំកិលស្តាំ = លុបច្រើន</small></div></div>
    <div class="row sg-row"><span>🎨 ពណ៌</span>${INKS.map(([c,l])=>`<button class="sg-ink ${c===G.ink?'on':''}" data-c="${c}" title="${l}" style="${c?`background:${c}`:'background:conic-gradient(#111,#888,#111)'}" onclick="Sig._ink('${c}')"></button>`).join('')}<input type="color" value="#1d4ed8" onchange="Sig._ink(this.value)" title="ពណ៌ផ្សេង"></div>
    <div class="sg-prev"><small>👁 មើលមុន (ផ្ទៃក្រឡាអុក = ថ្លា)</small><div class="sg-chk"><img id="sgOut" alt=""></div></div>
    <div class="row" style="justify-content:flex-end;gap:8px"><button class="btn ghost" onclick="Sig._cancel()">បោះបង់</button><button class="btn teal" onclick="Sig._save()">💾 រក្សាទុកហត្ថលេខា</button></div></div>`);
  document.getElementById('modal').classList.add('wide');
  pad(); if(cur){ const im=new Image(); im.onload=()=>{ const p=$('#sgPad'), x=p.getContext('2d'), k=Math.min(p.width*.9/im.width, p.height*.9/im.height); x.drawImage(im,(p.width-im.width*k)/2,(p.height-im.height*k)/2,im.width*k,im.height*k); render(); }; im.src=cur; }
  render();
}
function pad(){ const p=$('#sgPad'), x=p.getContext('2d'); x.lineCap='round'; x.lineJoin='round';
  const pos=e=>{ const r=p.getBoundingClientRect(); return [(e.clientX-r.left)*p.width/r.width, (e.clientY-r.top)*p.height/r.height]; };
  let last=null;
  p.onpointerdown=e=>{ p.setPointerCapture(e.pointerId); last=pos(e); G.drawing=true; x.beginPath(); x.fillStyle='#000'; x.arc(last[0],last[1],G.w/2,0,7); x.fill(); };
  p.onpointermove=e=>{ if(!G.drawing) return; const q=pos(e), pr=e.pressure&&e.pointerType==='pen'?.5+e.pressure:1; x.strokeStyle='#000'; x.lineWidth=G.w*pr*1.6; x.beginPath(); x.moveTo(last[0],last[1]); x.lineTo(q[0],q[1]); x.stroke(); last=q; };
  p.onpointerup=p.onpointercancel=()=>{ G.drawing=false; render(); };
}
/* process: source → (remove light background) → recolour → trim → ≤600px PNG */
function process(srcCv, photo){
  const w=srcCv.width, h=srcCv.height, x=srcCv.getContext('2d'), d=x.getImageData(0,0,w,h), a=d.data;
  const thr=G.thr/100*255, feather=28, ink=G.ink?[parseInt(G.ink.slice(1,3),16),parseInt(G.ink.slice(3,5),16),parseInt(G.ink.slice(5,7),16)]:null;
  let x0=w,y0=h,x1=-1,y1=-1;
  for(let i=0;i<a.length;i+=4){ let al=a[i+3];
    if(photo&&G.bg){ const L=.299*a[i]+.587*a[i+1]+.114*a[i+2]; al = L>=thr ? 0 : Math.min(255, Math.round((thr-L)/feather*255)); }
    if(ink&&al){ a[i]=ink[0]; a[i+1]=ink[1]; a[i+2]=ink[2]; }
    a[i+3]=al; if(al>24){ const p=i/4, px=p%w, py=(p/w)|0; if(px<x0)x0=px; if(px>x1)x1=px; if(py<y0)y0=py; if(py>y1)y1=py; } }
  if(x1<0) return '';
  const o=document.createElement('canvas'); o.width=w; o.height=h; o.getContext('2d').putImageData(d,0,0);
  const m=8; x0=Math.max(0,x0-m); y0=Math.max(0,y0-m); x1=Math.min(w-1,x1+m); y1=Math.min(h-1,y1+m);
  const cw=x1-x0+1, ch=y1-y0+1, k=Math.min(1, 600/cw, 240/ch), out=document.createElement('canvas'); out.width=Math.round(cw*k); out.height=Math.round(ch*k);
  const ox=out.getContext('2d'); ox.imageSmoothingQuality='high'; ox.drawImage(o,x0,y0,cw,ch,0,0,out.width,out.height); return out.toDataURL('image/png');
}
function render(){ clearTimeout(G.rt); G.rt=setTimeout(()=>{ let url='';
  if(G.mode==='draw'){ const p=$('#sgPad'); if(!p) return; const c=document.createElement('canvas'); c.width=p.width; c.height=p.height; c.getContext('2d').drawImage(p,0,0); url=process(c,false); }
  else if(G.src){ const c=document.createElement('canvas'); c.width=G.src.width; c.height=G.src.height; c.getContext('2d').drawImage(G.src,0,0); url=process(c,true); }
  G.url=url; const o=$('#sgOut'); if(o){ o.src=url||''; o.style.visibility=url?'visible':'hidden'; } },60); }
function file(f){ if(!f) return; const r=new FileReader(); r.onload=()=>{ const im=new Image(); im.onload=()=>{ const k=Math.min(1,1400/Math.max(im.width,im.height)), c=document.createElement('canvas'); c.width=Math.round(im.width*k); c.height=Math.round(im.height*k); c.getContext('2d').drawImage(im,0,0,c.width,c.height); G.src=c; render(); }; im.src=r.result; }; r.readAsDataURL(f); }
function mode(m){ G.mode=m; document.querySelectorAll('.sg-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.m===m)); $('#sgDraw').hidden=m!=='draw'; $('#sgPhoto').hidden=m!=='photo'; render(); }
function ink(c){ G.ink=c; document.querySelectorAll('.sg-ink').forEach(b=>b.classList.toggle('on',b.dataset.c===c)); render(); }
function save(){ const cb=G.cb, url=G.url; if(!url) return toast('សូមគូរ ឬថតហត្ថលេខាជាមុនសិន'); G=null; cb&&cb(url); }
function cancel(){ const cb=G&&G.cb; G=null; cb&&cb(null); }
function download(url, name){ if(!url) return; const a=document.createElement('a'); a.href=url; a.download=(name||'signature')+'.png'; document.body.appendChild(a); a.click(); a.remove(); }
window.Sig = { open, download, _mode:mode, _ink:ink, _file:file, _save:save, _cancel:cancel, _clear:()=>{ const p=$('#sgPad'); p.getContext('2d').clearRect(0,0,p.width,p.height); render(); }, _w:v=>{ G.w=+v; }, _bg:v=>{ G.bg=v; render(); }, _thr:v=>{ G.thr=+v; render(); } };
})();
