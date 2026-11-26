/* 🔊 TTS — plays pre-recorded natural English audio (tts/<hash>.mp3) for every word, phrase and sentence in the app.
   Works on phones that have no built-in voices and inside in-app browsers (Telegram, Facebook, Messenger).
   Falls back to the device's speechSynthesis when a clip doesn't exist (e.g. on the offline desktop app). */
(function(){
  const clean = t => String(t).replace(/\(.*?\)/g,'').replace(/[→=↔].*$/,'').trim();
  const key = t => String(t).toLowerCase().replace(/’/g,"'").replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ').trim();
  const fnv = s => { let h=0x811c9dc5; for(const b of new TextEncoder().encode(s)){ h=Math.imul(h^b,0x01000193)>>>0; } return ('0000000'+h.toString(16)).slice(-8); };
  let IDX=null, au=null, seqStop=false;
  const web = location.protocol.startsWith('http');
  function load(){ if(!web){ IDX=new Set(); return; }
    fetch('tts/index.json').then(r=>r.ok?r.json():[]).then(a=>{ IDX=new Set(a); }).catch(()=>{ IDX=new Set(); }); }
  load();
  const hasVoice = () => 'speechSynthesis' in window;
  function stop(){ seqStop=true; try{ if(au){ au.onended=null; au.pause(); } }catch(e){} try{ if(hasVoice()) speechSynthesis.cancel(); }catch(e){} }
  function device(text, rate, onend){
    if(!hasVoice()){ warn(); onend&&onend(); return false; }
    try{ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text);
      const vs=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang)), v=vs.find(x=>/en-GB/i.test(x.lang))||vs[0];
      if(v){ u.voice=v; u.lang=v.lang; } else u.lang='en-GB'; u.rate=rate||0.9; if(onend) u.onend=onend;
      speechSynthesis.speak(u); if(!vs.length) setTimeout(()=>{ if(!speechSynthesis.speaking) warn(); }, 1200);
      return true; }catch(e){ warn(); return false; }
  }
  let warned=0;
  function warn(){ if(Date.now()-warned<8000) return; warned=Date.now();
    (typeof window.toast==='function') && window.toast('🔇 ទូរស័ព្ទនេះមិនមានសំឡេងអាន — សូមបើកតាម Google Chrome ហើយបើកសំឡេង (Volume)'); }
  // play one text; returns true if something was started
  function say(text, rate, onend){
    const t=clean(text); if(!t){ onend&&onend(); return false; }
    const h=fnv(key(t));
    if(IDX && IDX.has(h)){
      seqStop=false; try{ if(au){ au.onended=null; au.pause(); } if(hasVoice()) speechSynthesis.cancel(); }catch(e){}
      au = au || new Audio(); au.preload='auto'; au.src='tts/'+h+'.mp3'; au.playbackRate = Math.max(.6, Math.min(1.3, (rate||0.9)/0.9));
      au.onended = onend || null;
      const p=au.play(); if(p&&p.catch) p.catch(()=>device(t, rate, onend));
      return true;
    }
    return device(t, rate, onend);
  }
  // read a list one after another
  function seq(list, rate, gap){ stop(); seqStop=false; let i=0; (function nx(){ if(seqStop||i>=list.length) return; say(list[i++], rate, ()=>setTimeout(()=>{ if(!seqStop) nx(); }, gap||600)); })(); }
  window.TTS={ say, seq, stop, key, fnv, ready:()=>!!(IDX&&IDX.size) };
})();
