// =====================================================================
//  qrscan.js — 📷 ស្កេន QR ក្នុងកម្មវិធី (សិស្ស និងគ្រូ) • BarcodeDetector ឬ jsQR (iPhone)
// =====================================================================
(function(){
let stream=null, raf=null, det=null, busy=false;
function loadJsQR(){ return window.jsQR ? Promise.resolve() : new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='jsqr.min.js'; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
function stop(){ if(raf) cancelAnimationFrame(raf); raf=null; if(stream) stream.getTracks().forEach(t=>t.stop()); stream=null; const o=document.getElementById('qrScan'); if(o) o.remove(); }
function handle(text){
  text=String(text||'').trim(); if(!text) return false;
  const code=text.toUpperCase().replace(/[^A-Z0-9]/g,'');
  let url=null; try{ url=new URL(text, location.href); }catch(e){}
  if(url && /^https?:/.test(url.protocol) && (url.search||url.hash)){
    if(url.origin!==location.origin){ msg('⚠️ QR នេះមិនមែនសម្រាប់កម្មវិធីនេះទេ'); return false; }
    stop(); if(typeof window.toast==='function') window.toast('✅ បានស្កេន — កំពុងចូល…');
    const same=url.pathname===location.pathname && url.search===location.search;
    location.href=url.href; if(same) setTimeout(()=>location.reload(),60);   // only the #hash changed → reload so it is read
    return true;
  }
  if(/^[A-Z2-9]{6}$/.test(code)){ stop(); location.href=location.pathname+'?c='+code; return true; }
  msg('⚠️ មិនស្គាល់ QR នេះ — សូមស្កេន QR លើកាតចូលប្រព័ន្ធ'); return false;
}
function msg(t){ const m=document.getElementById('qrMsg'); if(m){ m.textContent=t; m.classList.add('warn'); } }
async function open(){
  const o=document.createElement('div'); o.id='qrScan';
  o.innerHTML=`<div class="qs-top"><b>📷 ស្កេន QR</b><button onclick="QRScan.stop()">✕</button></div>
    <div class="qs-view"><video id="qrV" playsinline muted></video><div class="qs-frame"><i></i><i></i><i></i><i></i><div class="qs-line"></div></div></div>
    <p id="qrMsg" class="qs-msg">ដាក់ QR លើកាតចូលប្រព័ន្ធ ឱ្យនៅក្នុងប្រអប់</p>
    <label class="qs-file">🖼 ឬជ្រើសរូប QR ពីទូរស័ព្ទ<input type="file" accept="image/*" hidden onchange="QRScan.file(this.files[0])"></label>`;
  document.body.appendChild(o);
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ msg('⚠️ Browser នេះបើកកាមេរ៉ាមិនបាន — សូមជ្រើសរូប QR ជំនួស'); return; }
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}, width:{ideal:1280}}, audio:false});
  }catch(e){ msg(e.name==='NotAllowedError'?'⚠️ សូមអនុញ្ញាតឱ្យប្រើកាមេរ៉ា (Allow camera) ហើយសាកម្តងទៀត':'⚠️ បើកកាមេរ៉ាមិនបាន — សូមជ្រើសរូប QR ជំនួស'); return; }
  const v=document.getElementById('qrV'); if(!v){ stop(); return; } v.srcObject=stream; await v.play().catch(()=>{});
  if('BarcodeDetector' in window){ try{ const f=await BarcodeDetector.getSupportedFormats(); if(f.includes('qr_code')) det=new BarcodeDetector({formats:['qr_code']}); }catch(e){} }
  if(!det) await loadJsQR().catch(()=>{});
  const cv=document.createElement('canvas'), cx=cv.getContext('2d',{willReadFrequently:true});
  const tick=async()=>{
    if(!stream) return; raf=requestAnimationFrame(tick); if(busy || v.readyState<2) return; busy=true;
    try{
      let text=null;
      if(det){ const r=await det.detect(v); if(r&&r[0]) text=r[0].rawValue; }
      else if(window.jsQR){ const w=Math.min(640,v.videoWidth), h=Math.round(v.videoHeight*w/v.videoWidth); cv.width=w; cv.height=h; cx.drawImage(v,0,0,w,h); const r=jsQR(cx.getImageData(0,0,w,h).data,w,h,{inversionAttempts:'dontInvert'}); if(r) text=r.data; }
      if(text){ if(navigator.vibrate) navigator.vibrate(80); handle(text); }
    }catch(e){}
    busy=false;
  };
  tick();
}
async function file(f){
  if(!f) return; const img=new Image(); img.src=URL.createObjectURL(f); await img.decode().catch(()=>{});
  let text=null;
  try{ if('BarcodeDetector' in window){ const r=await new BarcodeDetector({formats:['qr_code']}).detect(img); if(r&&r[0]) text=r[0].rawValue; } }catch(e){}
  if(!text){ await loadJsQR().catch(()=>{}); if(window.jsQR){ const cv=document.createElement('canvas'), s=Math.min(1,1200/Math.max(img.width,img.height)); cv.width=img.width*s; cv.height=img.height*s; const cx=cv.getContext('2d'); cx.drawImage(img,0,0,cv.width,cv.height); const r=jsQR(cx.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height); if(r) text=r.data; } }
  if(!text) return msg('⚠️ រក QR មិនឃើញក្នុងរូបនេះ');
  handle(text);
}
window.QRScan={open, stop, file, handle};
})();
