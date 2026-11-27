// =====================================================================
//  levelup.js — 🎮 រៀនតាមកម្រិតសៀវភៅ Sounds Great 1–5 ដូចលេងហ្គេម
//  • 🧩 ប្រកបដោយខ្លួនឯង — តាមចំណែកសំឡេងដែលសៀវភៅកម្រិតនោះបង្រៀន
//      SG1–3៖ អក្សរម្តងមួយៗ • SG4៖ + bl cl … ch sh th ck ng • SG5៖ + ai ay ea ee oa ow oi oy ou oo ar or er ir ur
//  • 📖 អានដោយខ្លួនឯង — ពាក្យ/ប្រយោគគ្មានសំឡេង → ជ្រើសរូប → ទើបឮសំឡេងពិនិត្យ
//  • 📐 វេយ្យាករណ៍សមកម្រិត — មួយចំណុចក្នុងមួយ Unit (ភ្ជាប់នឹង sight words របស់ Unit នោះ)
//  • 🎮 ផ្លូវ Level ក្នុង Unit • ★ ផ្កាយ • 🔥 Combo • 🎉 LEVEL CLEAR! • 🏁 Boss Level
//  • Beginner (Headway)៖ មានតែស្រទាប់ហ្គេម (ផ្លូវ Level ផ្កាយ Combo LEVEL CLEAR) — ខ្លឹមសារ និងលំហាត់ដដែលទាំងអស់
//    ផ្កាយគណនាពីទិន្នន័យដែលមានស្រាប់ (S.sec, S.ex) — មិនសរសេរ ឬកែទិន្នន័យសិស្សទេ
// =====================================================================
(function(){
if(!window.COURSE) return;
const SG = !!COURSE.sg, LV = +COURSE.sg || 0;
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr = t => JSON.stringify(String(t)).replace(/"/g,'&quot;');
const shuf = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const pick = (a,k) => shuf(a).slice(0,k);
const uniq = a => a.filter((x,i)=>a.indexOf(x)===i);
const blank = s => esc(s).replace('___','<u class="lv-bl">&nbsp;?&nbsp;</u>');
const Uof = n => (window.UNITS||[])[n-1];
const say = (t,r) => { try{ speak(t,r); }catch(e){} };

/* ---------- 🧩 graphemes taught at each level ---------- */
const G4=['ch','sh','th','ph','wh','ck','ng','nk','bl','cl','fl','gl','pl','sl','br','cr','dr','fr','gr','pr','tr','sm','sn','st','sw'];
const G5=['ai','ay','ea','ee','oa','ow','oi','oy','ou','oo','ar','or','er','ir','ur'];
const GR = LV>=5 ? G5.concat(G4) : LV>=4 ? G4 : [];
function chunks(w){ w=String(w).toLowerCase(); const out=[]; let i=0;
  while(i<w.length){ const g=GR.filter(x=>w.startsWith(x,i)).sort((a,b)=>b.length-a.length)[0]; if(g){ out.push(g); i+=g.length; } else { out.push(w[i]); i++; } }
  return out; }
const VOW='aeiou';
function chunkHtml(w){ return chunks(w).map(c=>`<span class="lv-ch ${c.length>1?'team':VOW.includes(c)?'v':''}">${esc(c)}</span>`).join(''); }
const magicE = w => LV===3 && /[aeiou][^aeiou]e$/.test(w);

/* ---------- unit words ---------- */
const MASS=/^(milk|water|juice|rice|bread|soup|jam|honey|sand|mud|gum|cheese|meat|corn|popcorn|toast|tea|coffee|ham|ice|snow|rain|smoke|grass|hair|money|music|food|fruit|salt|sugar|butter|oil|soap|wood|glue|dough|meal|steam|cream)$/;
const IRR=/^(ox|fish|sheep|mouse|man|woman|child|tooth|foot|goose|deer|people|leaf|knife|wolf|wife|scissors|glasses|jeans|shorts|pants|teeth|feet|mice|news|sushi)$/;
function vocab(n){ const u=Uof(n); return u ? u.vocab.filter(v=>/^[a-z]+$/.test(v[0])) : []; }
const emo = (n,w) => ((Uof(n)||{}).emoji||{})[w] || '';
const kmOf = (n,w) => ((vocab(n).find(v=>v[0]===w))||[])[2] || '';
function spellWords(n){ const max = LV===1 ? 5 : 7; return vocab(n).map(v=>v[0]).filter(w=>w.length>=2 && w.length<=max && emo(n,w)); }
const ODD=/^(fit|pit|dam|sub|bud|rib|rip|hit|wed|rap|sip|tip|jot|rot|mob|nab|wit|kit|bit|vet|jab|lad|cad|gut|tot|yak|more|lure|mute|dune|ore|bore|core|tote|lane|mane|pane|wade|mate|fate|hate|vine|tine|dine|plus|slim|lunch|graph|cross)$/;   // ពាក្យដែលធ្វើឱ្យប្រយោគវេយ្យាករណ៍ចម្លែក
function nouns(n){ const a=vocab(n).filter(v=>v[1]==='n' && emo(n,v[0]) && !MASS.test(v[0]) && !IRR.test(v[0]) && !ODD.test(v[0])).map(v=>v[0]); return a.length>=3 ? a : vocab(n).filter(v=>emo(n,v[0])).map(v=>v[0]); }
const art = w => /^(uni|use|uke|euro|one)/.test(w) ? 'a' : /^[aeiou]/.test(w) ? 'an' : 'a';
const plural = w => /(s|x|z|ch|sh)$/.test(w) || /^(potato|tomato|mango|hero|volcano)$/.test(w) ? w+'es' : /[^aeiou]y$/.test(w) ? w.slice(0,-1)+'ies' : w+'s';
const wrongPl = w => /(s|x|z|ch|sh)$/.test(w) ? w+'s' : w+'es';
const v3 = v => /(s|x|z|ch|sh|o)$/.test(v) ? v+'es' : /[^aeiou]y$/.test(v) ? v.slice(0,-1)+'ies' : v+'s';
const ing = v => /^(run|swim|sit|hop|cut|dig|jog|get|hit|put|shop|stop|clap|skip|nap|win)$/.test(v) ? v+v.slice(-1)+'ing' : /[^e]e$/.test(v) ? v.slice(0,-1)+'ing' : v+'ing';
const ed = v => /e$/.test(v) ? v+'d' : /^(hop|clap|skip|stop|nap|shop)$/.test(v) ? v+v.slice(-1)+'ed' : v+'ed';
const BOY=['Dara','Vuthy','Ben','Sam'], GIRL=['Sophea','Lina','Ann','Kim'];
const one = a => a[Math.floor(Math.random()*a.length)];
const VERBS=['ride','swim','run','jump','read','sing','cook','play','walk','sleep'];
const VERB_OK=/^(ride|swim|run|jump|read|sing|cook|play|walk|sleep|skate|bake|dive|hide|smile|wave|dance|climb|clap|fly|draw|paint|kick|hop|dig|drink|eat|write|skip|sit|shop|brush|wash|fish|crawl|shout|cry|blow|float|row|cheer|camp|hike|bounce|pray)$/;
function verbsOf(n){ const v=vocab(n).filter(x=>x[1]==='v' && VERB_OK.test(x[0])).map(x=>x[0]); return uniq(v.concat(shuf(VERBS))).slice(0,10); }

/* ---------- exercise item builders (LEX item format) ---------- */
function mcS(q, ok, wrong, full, hint){ q=String(q).replace('___','<u class="lv-bl">&nbsp;?&nbsp;</u>'); return {t:'mc', lv:'gram', q, opts:shuf(uniq([ok,...wrong])), a:ok, full, hint, sayAns:true}; }
function orderS(sentence, km){ const w=sentence.split(' '); if(w.length<3) return null; let s=shuf(w), g=0; while(s.join(' ')===sentence && g++<6) s=shuf(w);
  return {t:'order', lv:'gram', q:`🧱 រៀបពាក្យឱ្យទៅជាប្រយោគ${km?` <small class="km">${esc(km)}</small>`:''}`, tiles:s, a:sentence}; }
function distract(ch, n){
  if(LV===1 && n<=2) return [];
  const pool = LV>=4 ? GR.concat(VOW.split('')) : VOW.split('').concat('bdgmnpst'.split(''));
  const vw = shuf(VOW.split('').filter(v=>!ch.includes(v)))[0];
  const other = shuf(pool.filter(x=>!ch.includes(x) && x!==vw))[0];
  return LV===1 ? [vw] : [vw, other].filter(Boolean);
}
function spellItem(n, w, listen){
  const ch=chunks(w), em=emo(n,w);
  return {t:'order', lv:'spell', j:'', need:ch.length, tiles:shuf(ch.concat(distract(ch,n))), a:w,
    q: listen ? `🎧 <b>ស្តាប់ ហើយប្រកបពាក្យ</b> <button class="lex-say" onclick="speak(${attr(w)})">🔊</button> <button class="lex-say" onclick="speak(${attr(w)},0.55)">🐢</button><small>Listen and spell • ${ch.length} ${GR.length?'ចំណែកសំឡេង':'អក្សរ'}</small>`
      : `<span class="lv-em">${em}</span> <b>ប្រកបពាក្យនេះដោយខ្លួនឯង</b><small class="km">${esc(kmOf(n,w))} • ${ch.length} ${GR.length?'ចំណែកសំឡេង':'អក្សរ'}${magicE(w)?' • 🪄 កុំភ្លេច e ចុងក្រោយ!':''}</small>`};
}
function readItem(n, w){
  const e=emo(n,w), others=pick(uniq(vocab(n).map(v=>emo(n,v[0])).filter(x=>x&&x!==e)),2); if(others.length<2) return null;
  return {t:'mc', lv:'read', cls:'pic', q:`📖 <b>អានដោយខ្លួនឯង</b> — ពាក្យនេះជារូបណា?<div class="lv-word">${chunkHtml(w)}</div>`, opts:shuf([e,...others]), a:e, full:w};
}
function sentItem(n, sent){
  const E=(Uof(n)||{}).emoji||{}, keys=Object.keys(E).filter(w=>new RegExp('\\b'+w+'s?\\b','i').test(sent)); if(!keys.length) return null;
  const k=keys.sort((a,b)=>b.length-a.length)[0], e=E[k], bad=keys.map(x=>E[x]);
  const others=pick(uniq(Object.values(E).filter(x=>!bad.includes(x))),2); if(others.length<2) return null;
  return {t:'mc', lv:'read', cls:'pic', q:`📖 <b>អានប្រយោគដោយខ្លួនឯង</b> រួចជ្រើសរូបដែលត្រូវ<div class="lv-sent">${esc(sent)}</div>`, opts:shuf([e,...others]), a:e, full:sent};
}
function topicKey(t){ return String(t||'').replace(/\(.*?\)/g,'').replace(/-/g,'').trim().toLowerCase().slice(0, LV===1?1:9); }
function missItem(n){
  const u=Uof(n), T=uniq((u.vocab||[]).map(v=>topicKey(v[3])).filter(Boolean)); if(T.length<2) return null;
  const c=shuf(vocab(n).filter(v=>emo(n,v[0]) && topicKey(v[3]) && v[0].includes(topicKey(v[3]))))[0]; if(!c) return null;
  const w=c[0], t=topicKey(c[3]), i=LV===1 ? w.indexOf(t) : w.lastIndexOf(t);
  return {t:'mc', lv:'read', q:`🔍 <span class="lv-em">${emo(n,w)}</span> <b>បំពេញសំឡេងដែលបាត់</b><div class="lv-word">${esc(w.slice(0,i))}<u class="lv-bl">&nbsp;?&nbsp;</u>${esc(w.slice(i+t.length))}</div>`,
    opts:shuf([t,...pick(T.filter(x=>x!==t),2)]), a:t, full:w};
}
function sightItem(n){
  const u=Uof(n), S0=(u.sight||[]).filter(w=>/^[a-z']+$/i.test(w)); if(!S0.length) return null;
  const w=one(S0), pool=uniq(S0.concat(((Uof(n-1)||{}).sight||[]), ['the','a','is','and','to','he','she','it','on','in'])).filter(x=>x.toLowerCase()!==w.toLowerCase());
  return {t:'mc', lv:'read', q:`👂 <b>ស្តាប់ ហើយចុចពាក្យមើលចាំ</b><small>Sight word — ពាក្យដែលត្រូវចាំមើល មិនបាច់ប្រកប</small>`, say:w, opts:shuf([w,...pick(pool,2)]), a:w, sayAns:true};
}

/* ---------- 📐 grammar points by level (one per unit, tied to the unit's sight words) ---------- */
const GMAP = {
  1:['a_an','a_an','this_is','yes_no','plural','prep','adj','has'],
  2:['prep','he_she','verb_s','adj','has','is_are','yes_no','his_her'],
  3:['is_are','must','verb_s','be','do_does','this_that','obj','can'],
  4:['numbers','will','wh:What,Where','prep','can','want','this_that','plural'],
  5:['ing','his_her','there','obj','wh:How many,What','past','wh:Who,What,Where','lets_their']
};
const PREP={in:'នៅក្នុង', on:'នៅលើ', under:'នៅក្រោម'}, PLACE=[['box','ប្រអប់'],['bed','គ្រែ'],['table','តុ'],['bag','កាបូប']];
const NUM=[['two',2],['three',3],['four',4],['five',5]];
const WH={What:'អ្វី', Where:'នៅឯណា', Who:'នរណា', 'How many':'ប៉ុន្មាន'};
function G(n){
  const key=(GMAP[LV]||[])[n-1]||'a_an', [k,arg]=key.split(':'), N=nouns(n), w=()=>one(N), V=verbsOf(n);
  const ex=[], it=[]; let t='', km='', rule=[];
  const ns=pick(N,4);
  switch(k){
    case 'a_an': t='a / an'; km='ប្រើ <b>a</b> មុខពាក្យដែលចាប់ផ្តើមដោយសំឡេងព្យញ្ជនៈ • ប្រើ <b>an</b> មុខសំឡេងស្រៈ <b>a e i o u</b>';
      rule=[['a','a cat • a book • a bear'],['an','an ant • an apple • an egg']]; ns.forEach(x=>ex.push(`${art(x)} ${x}`));
      ns.slice(0,3).forEach(x=>it.push(mcS(`${emo(n,x)} ___ ${esc(x)}`, art(x), [art(x)==='a'?'an':'a'], `${art(x)} ${x}`))); break;
    case 'this_is': t='This is a … • It is a …'; km='<b>This is</b> = នេះគឺជា… • <b>It is</b> = វាគឺជា… (កុំភ្លេច a / an)';
      rule=[['What is it?','តើវាជាអ្វី?'],['It is a cat.','វាជាឆ្មា'],['This is an apple.','នេះជាផ្លែប៉ោម']]; ns.slice(0,3).forEach(x=>ex.push(`This is ${art(x)} ${x}.`));
      ns.slice(0,2).forEach(x=>it.push(mcS(`${emo(n,x)} What is it?`, `It is ${art(x)} ${x}.`, [`It ${art(x)} ${x}.`, `Is ${art(x)} ${x} it.`], `It is ${art(x)} ${x}.`)));
      { const x=ns[2]||ns[0]; it.push(orderS(`This is ${art(x)} ${x}.`, 'នេះគឺជា '+kmOf(n,x))); } break;
    case 'yes_no': t='Is it a …? Yes, it is. / No, it isn\'t.'; km='សំណួរ <b>Is it …?</b> ឆ្លើយ <b>Yes, it is.</b> (ត្រូវ) ឬ <b>No, it isn\'t.</b> (មិនត្រូវ)';
      rule=[['Is it a cat? 🐱','Yes, it is. ✅'],['Is it a cat? 🐶','No, it isn\'t. ❌']];
      ns.slice(0,3).forEach((x,i)=>{ const y=ns[(i+1)%ns.length], yes=Math.random()<.5, q=yes?x:y; ex.push(`Is it ${art(q)} ${q}? ${yes?'Yes, it is.':'No, it isn\'t.'}`);
        it.push(mcS(`${emo(n,x)} Is it ${art(q)} ${esc(q)}?`, yes?'Yes, it is.':'No, it isn\'t.', [yes?'No, it isn\'t.':'Yes, it is.'])); }); break;
    case 'plural': t='one → two (+s / +es)'; km='ច្រើនជាងមួយ ថែម <b>-s</b> • ពាក្យចុង <b>s x ch sh</b> ថែម <b>-es</b>';
      rule=[['one cat','two cats'],['one box','two boxes'],['one dish','three dishes']];
      { const es=N.filter(x=>/(s|x|z|ch|sh)$/.test(x)), L=uniq(pick(es,2).concat(pick(N,3))).slice(0,3);
        L.forEach(x=>ex.push(`one ${x} → two ${plural(x)}`)); L.forEach(x=>it.push(mcS(`${emo(n,x)}${emo(n,x)} two ___`, plural(x), [x, wrongPl(x)], `two ${plural(x)}`))); } break;
    case 'prep': t='in • on • under'; km='<b>in</b> = នៅក្នុង • <b>on</b> = នៅលើ • <b>under</b> = នៅក្រោម';
      rule=Object.entries(PREP).map(([a,b])=>[a,b]);
      pick(N,3).forEach(x=>{ const p=one(Object.keys(PREP)), pl=one(PLACE); ex.push(`The ${x} is ${p} the ${pl[0]}.`);
        it.push(mcS(`${emo(n,x)} The ${esc(x)} is ___ the ${pl[0]}.`, p, Object.keys(PREP).filter(z=>z!==p), `The ${x} is ${p} the ${pl[0]}.`, `${kmOf(n,x)} ${PREP[p]}${pl[1]}`)); }); break;
    case 'adj': t='a big cat • The cat is big.'; km='ពាក្យពិពណ៌នា (adjective) នៅ<b>មុខ</b>នាម៖ <b>a big cat</b> • ឬក្រោយ <b>is</b>៖ <b>The cat is big.</b>';
      { const A=uniq(vocab(n).filter(v=>v[1]==='adj').map(v=>v[0]).concat(['big','small','little','new','red'])); rule=[['a big cat','ឆ្មាធំ'],['The cat is little.','ឆ្មាតូច']];
        pick(N,3).forEach(x=>{ const a=one(A); ex.push(`The ${x} is ${a}.`); it.push(mcS(`${emo(n,x)} ___`, `${art(a)} ${a} ${x}`, [`${art(x)} ${x} ${a}`], `${art(a)} ${a} ${x}`)); });
        { const x=w(), a=one(A); it.push(orderS(`The ${x} is ${a}.`)); } } break;
    case 'has': t='have / has'; km='<b>I / You / We / They</b> + <b>have</b> • <b>He / She / It</b> + <b>has</b>';
      rule=[['I have a cat.','ខ្ញុំមានឆ្មា'],['She has a cat.','នាងមានឆ្មា'],['They have a cat.','ពួកគេមានឆ្មា']];
      { const x=w(), b=one(BOY), g=one(GIRL), y=w(); ex.push(`${b} has ${art(x)} ${x}.`, `I have ${art(y)} ${y}.`);
        it.push(mcS(`👦 ${b} ___ ${art(x)} ${esc(x)}.`, 'has', ['have'], `${b} has ${art(x)} ${x}.`), mcS(`👫 They ___ ${art(y)} ${esc(y)}.`, 'have', ['has'], `They have ${art(y)} ${y}.`), mcS(`👧 ${g} ___ ${art(x)} ${esc(x)}.`, 'has', ['have'], `${g} has ${art(x)} ${x}.`)); } break;
    case 'he_she': t='he • she • it • they'; km='👦 ប្រុស = <b>he</b> • 👧 ស្រី = <b>she</b> • 🐱 សត្វ/វត្ថុ = <b>it</b> • 👫 ច្រើន = <b>they</b>';
      rule=[['👦 Dara','he'],['👧 Sophea','she'],['🐱 the cat','it'],['👫 Dara and Sophea','they']];
      { const b=one(BOY), g=one(GIRL), x=w(); ex.push(`${g} is happy. She is happy.`, `The ${x} is big. It is big.`);
        it.push(mcS(`👧 ${g} is happy. ___ is happy.`, 'She', ['He','It'], `She is happy.`), mcS(`👦 ${b} is sad. ___ is sad.`, 'He', ['She','It'], 'He is sad.'), mcS(`${emo(n,x)} The ${esc(x)} is big. ___ is big.`, 'It', ['He','She'], 'It is big.')); } break;
    case 'his_her': t='his • her • their'; km='របស់ប្រុស = <b>his</b> • របស់ស្រី = <b>her</b> • របស់ពួកគេ = <b>their</b>';
      rule=[['he → his','his cat'],['she → her','her cat'],['they → their','their cat']];
      { const b=one(BOY), g=one(GIRL), x=w(), y=w(); ex.push(`${b} has ${art(x)} ${x}. It is his ${x}.`, `${g} has ${art(y)} ${y}. It is her ${y}.`);
        it.push(mcS(`👦 ${b} has ${art(x)} ${esc(x)}. It is ___ ${esc(x)}.`, 'his', ['her','he'], `It is his ${x}.`), mcS(`👧 ${g} has ${art(y)} ${esc(y)}. It is ___ ${esc(y)}.`, 'her', ['his','she'], `It is her ${y}.`), mcS(`👫 They have ${art(x)} ${esc(x)}. It is ___ ${esc(x)}.`, 'their', ['they','his'], `It is their ${x}.`)); } break;
    case 'is_are': t='is / are'; km='មួយ ➜ <b>is</b> • ច្រើន ➜ <b>are</b>';
      rule=[['The cat is big.','1 ➜ is'],['The cats are big.','2+ ➜ are']];
      { const x=w(), y=w(); ex.push(`The ${x} is big.`, `The ${plural(y)} are big.`);
        it.push(mcS(`${emo(n,y)}${emo(n,y)} The ${plural(y)} ___ big.`, 'are', ['is'], `The ${plural(y)} are big.`), mcS(`${emo(n,x)} The ${esc(x)} ___ little.`, 'is', ['are'], `The ${x} is little.`), mcS(`${emo(n,x)}${emo(n,x)}${emo(n,x)} The ${plural(x)} ___ here.`, 'are', ['is'], `The ${plural(x)} are here.`)); } break;
    case 'be': t='am • is • are'; km='<b>I am</b> • <b>He / She / It is</b> • <b>You / We / They are</b>';
      rule=[['I am','I\'m'],['she is','she\'s'],['they are','they\'re']];
      { const g=one(GIRL); ex.push('I am happy.', `${g} is happy.`, 'They are happy.');
        it.push(mcS('🙋 I ___ happy.', 'am', ['is','are'], 'I am happy.'), mcS('👫 They ___ my friends.', 'are', ['is','am'], 'They are my friends.'), mcS(`👧 ${g} ___ at home.`, 'is', ['am','are'], `${g} is at home.`)); } break;
    case 'verb_s': t='I ride → He rides (+s)'; km='<b>He / She / It</b> + កិរិយាសព្ទ ថែម <b>-s</b> (go → goes)';
      rule=[['I ride a bike.','He rides a bike.'],['I go to school.','She goes to school.']];
      { const a=pick(V,3), b=one(BOY), g=one(GIRL); ex.push(`I ${a[0]} every day.`, `${g} ${v3(a[0])} every day.`);
        it.push(mcS(`👧 ${g} ___ every day.`, v3(a[0]), [a[0], ing(a[0])], `${g} ${v3(a[0])} every day.`), mcS(`👫 We ___ every day.`, a[1], [v3(a[1])], `We ${a[1]} every day.`), mcS(`👦 ${b} ___ to school.`, 'goes', ['go','gos'], `${b} goes to school.`)); } break;
    case 'must': t='must + verb'; km='<b>must</b> = ត្រូវតែ • ក្រោយ must ប្រើកិរិយាសព្ទដើម (គ្មាន -s)';
      rule=[['You must wash your hands.','អ្នកត្រូវតែលាងដៃ'],['He must go to bed.','គាត់ត្រូវតែចូលគេង']]; ex.push('You must wash your hands.','We must be kind.');
      it.push(mcS('🧼 You must ___ your hands.', 'wash', ['washes','washing'], 'You must wash your hands.'), mcS('😴 He must ___ to bed.', 'go', ['goes','going'], 'He must go to bed.'), orderS('You must be kind.', 'អ្នកត្រូវតែចិត្តល្អ')); break;
    case 'can': t='can + verb'; km='<b>can</b> = អាច • <b>can\'t</b> = មិនអាច • ក្រោយ can ប្រើកិរិយាសព្ទដើម';
      rule=[['I can swim.','ខ្ញុំអាចហែលទឹក'],['A fish can\'t run.','ត្រីរត់មិនបាន']];
      { const a=pick(V,2), g=one(GIRL); ex.push(`I can ${a[0]}.`, `${g} can ${a[1]}.`);
        it.push(mcS(`👧 ${g} can ___.`, a[0], [v3(a[0]), ing(a[0])], `${g} can ${a[0]}.`), mcS('🐟 A fish ___ swim.', 'can', ['cans','can\'t'], 'A fish can swim.'), mcS('🐟 A fish ___ run.', 'can\'t', ['can'], 'A fish can\'t run.')); } break;
    case 'do_does': t='Do … ? • Does … ?'; km='<b>Do</b> + I / you / we / they … ? • <b>Does</b> + he / she / it … ?';
      rule=[['Do you like cats?','Yes, I do.'],['Does it move?','Yes, it does.']];
      { const x=w(); ex.push('Do you like it? Yes, I do.', `Does the ${x} move? No, it doesn't.`);
        it.push(mcS(`${emo(n,x)} ___ the ${esc(x)} move?`, 'Does', ['Do'], `Does the ${x} move?`), mcS('🙋 ___ you like it?', 'Do', ['Does'], 'Do you like it?'), mcS(`Does she ride a bike? — Yes, she ___.`, 'does', ['do','is'], 'Yes, she does.')); } break;
    case 'this_that': { const all=LV>=4; t=all?'this • that • these • those':'this • that';
      km=all?'<b>this</b> នេះ • <b>that</b> នោះ (មួយ) • <b>these</b> ទាំងនេះ • <b>those</b> ទាំងនោះ (ច្រើន)':'<b>this</b> = នេះ (នៅជិត) • <b>that</b> = នោះ (នៅឆ្ងាយ)';
      rule=[['👇 this cat','នេះ'],['👉 that cat','នោះ']].concat(all?[['👇 these cats','ទាំងនេះ'],['👉 those cats','ទាំងនោះ']]:[]);
      const x=w(), y=w(); ex.push(`This is ${art(x)} ${x}.`, `That is ${art(y)} ${y}.`); if(all) ex.push(`These are ${plural(x)}.`, `Those are ${plural(y)}.`);
      it.push(mcS(`👇 ${emo(n,x)} ___ is ${art(x)} ${esc(x)}. <small class="km">(នេះ)</small>`, 'This', all?['These','That']:['That'], `This is ${art(x)} ${x}.`), mcS(`👉 ${emo(n,y)} ___ is ${art(y)} ${esc(y)}. <small class="km">(នោះ)</small>`, 'That', all?['Those','This']:['This'], `That is ${art(y)} ${y}.`));
      if(all) it.push(mcS(`👉 ${emo(n,x)}${emo(n,x)} ___ are ${plural(x)}. <small class="km">(ទាំងនោះ)</small>`, 'Those', ['That','These'], `Those are ${plural(x)}.`)); break; }
    case 'obj': t='me • him • her • them'; km='ក្រោយកិរិយាសព្ទ៖ I ➜ <b>me</b> • he ➜ <b>him</b> • she ➜ <b>her</b> • they ➜ <b>them</b>';
      rule=[['I ➜ me','Help me!'],['he ➜ him','Give it to him.'],['she ➜ her','I like her.'],['they ➜ them','I see them.']];
      { const b=one(BOY), g=one(GIRL); ex.push(`I like ${b}. I like him.`, 'Give it to her.');
        it.push(mcS(`👦 I like ${b}. I like ___.`, 'him', ['he','his'], 'I like him.'), mcS(`👧 Give the book to ${g}. Give it to ___.`, 'her', ['she','his'], 'Give it to her.'), mcS(`👫 I see ${b} and ${g}. I see ___.`, 'them', ['they','their'], 'I see them.')); } break;
    case 'numbers': t='two, three, four + -s'; km='លេខច្រើនជាងមួយ ➜ នាមថែម <b>-s</b>៖ <b>three flags</b>';
      rule=NUM.slice(0,3).map(([a,c])=>[String(c), a]);
      pick(N,3).forEach(x=>{ const [nm,c]=one(NUM), o=NUM.find(z=>z[1]!==c); ex.push(`${nm} ${plural(x)}`);
        it.push(mcS(`${emo(n,x).repeat(c)} ___`, `${nm} ${plural(x)}`, [`${nm} ${x}`, `${o[0]} ${plural(x)}`], `${nm} ${plural(x)}`)); }); break;
    case 'will': t='will + verb (អនាគត)'; km='<b>will</b> = នឹង • ក្រោយ will ប្រើកិរិយាសព្ទដើម៖ <b>I will help.</b>';
      rule=[['I will help you.','ខ្ញុំនឹងជួយអ្នក'],['She will come.','នាងនឹងមក']];
      { const a=pick(V,2), g=one(GIRL); ex.push('I will help my mom.', `Tomorrow ${g} will ${a[0]}.`);
        it.push(mcS(`Tomorrow ${g} will ___.`, a[0], [v3(a[0]), ing(a[0])], `Tomorrow ${g} will ${a[0]}.`), mcS('I ___ help my mom.', 'will', ['wills','am'], 'I will help my mom.'), orderS('We will come tomorrow.', 'យើងនឹងមកថ្ងៃស្អែក')); } break;
    case 'wh': { const W=(arg||'What,Where').split(','); t=W.join(' • '); km=W.map(x=>`<b>${x}</b> = ${WH[x]}`).join(' • ');
      const x=w(), y=w(), g=one(GIRL), Q={What:[`___ is it?`, `It is ${art(x)} ${x}.`], Where:[`___ is the ${y}?`, `It is on the table.`], Who:[`___ is she?`, `She is ${g}.`], 'How many':[`___ ${plural(x)} are there?`, 'There are three.']};
      rule=W.map(k=>[Q[k][0].replace('___',k), Q[k][1]]); W.forEach(k=>ex.push(Q[k][0].replace('___',k)+' '+Q[k][1]));
      W.forEach(k=>{ const others=Object.keys(WH).filter(z=>z!==k).slice(0,2); it.push(mcS(`${blank(Q[k][0])} — <i>${esc(Q[k][1])}</i>`, k, others, Q[k][0].replace('___',k))); }); break; }
    case 'want': t='want to + verb'; km='<b>want to</b> = ចង់ • He / She ➜ <b>wants to</b>';
      rule=[['I want to play.','ខ្ញុំចង់លេង'],['He wants to sleep.','គាត់ចង់គេង']];
      { const a=pick(V,2), b=one(BOY); ex.push(`I want to ${a[0]}.`, `${b} wants to ${a[1]}.`);
        it.push(mcS(`🙋 I want to ___.`, a[0], [v3(a[0]), ing(a[0])], `I want to ${a[0]}.`), mcS(`👦 ${b} ___ to ${a[1]}.`, 'wants', ['want','wanting'], `${b} wants to ${a[1]}.`), orderS(`I want to ${a[1]}.`)); } break;
    case 'ing': t='is + verb-ing (កំពុង…)'; km='<b>am / is / are</b> + កិរិយាសព្ទ <b>-ing</b> = កំពុង… • run ➜ running • make ➜ making';
      rule=[['I am playing.','ខ្ញុំកំពុងលេង'],['It is raining.','ភ្លៀងកំពុងធ្លាក់'],['They are running.','ពួកគេកំពុងរត់']];
      { const a=pick(V,3), g=one(GIRL); ex.push(`${g} is ${ing(a[0])} now.`, `They are ${ing(a[1])}.`);
        it.push(mcS(`👧 ${g} is ___ now.`, ing(a[0]), [a[0], v3(a[0])], `${g} is ${ing(a[0])} now.`), mcS(`👫 They ___ ${ing(a[1])}.`, 'are', ['is','am'], `They are ${ing(a[1])}.`), mcS(`🙋 I am ___.`, ing(a[2]), [a[2], v3(a[2])], `I am ${ing(a[2])}.`)); } break;
    case 'there': t='There is • There are'; km='<b>There is</b> + មួយ • <b>There are</b> + ច្រើន (= មាន…)';
      rule=[['There is a boat.','មានទូកមួយ'],['There are two boats.','មានទូកពីរ']];
      { const x=w(), y=w(); ex.push(`There is ${art(x)} ${x}.`, `There are three ${plural(y)}.`);
        it.push(mcS(`${emo(n,x)} There ___ ${art(x)} ${esc(x)}.`, 'is', ['are'], `There is ${art(x)} ${x}.`), mcS(`${emo(n,y).repeat(3)} There ___ three ${plural(y)}.`, 'are', ['is'], `There are three ${plural(y)}.`), mcS(`${emo(n,y).repeat(2)} ___ two ${plural(y)}.`, 'There are', ['There is','They are'], `There are two ${plural(y)}.`)); } break;
    case 'past': t='Yesterday … + -ed'; km='រឿងកន្លងទៅ (ម្សិលមិញ) ➜ កិរិយាសព្ទថែម <b>-ed</b>៖ play ➜ <b>played</b>';
      { const R=['play','jump','cook','paint','clean','walk','look','help','wash','kick'], a=pick(R,3); rule=a.slice(0,2).map(v=>[v, ed(v)]); ex.push(`Yesterday I ${ed(a[0])}.`, `After school we ${ed(a[1])}.`);
        it.push(mcS(`📅 Yesterday I ___.`, ed(a[0]), [a[0], ing(a[0])], `Yesterday I ${ed(a[0])}.`), mcS(`📅 After school she ___.`, ed(a[1]), [v3(a[1]), ing(a[1])], `After school she ${ed(a[1])}.`), mcS(`📅 Last night they ___.`, ed(a[2]), [a[2], ing(a[2])], `Last night they ${ed(a[2])}.`)); } break;
    case 'lets_their': t='Let\'s … • their'; km='<b>Let\'s</b> + កិរិយាសព្ទ = តោះ… • <b>their</b> = របស់ពួកគេ (ខុសពី there / they)';
      { const a=pick(V,2), x=w(); rule=[['Let\'s go!','តោះទៅ!'],['They have a dog. It is their dog.','របស់ពួកគេ']]; ex.push(`Let's ${a[0]}!`, `They have ${art(x)} ${x}. It is their ${x}.`);
        it.push(mcS(`🙌 Let's ___!`, a[0], [v3(a[0]), ing(a[0])], `Let's ${a[0]}!`), mcS(`👫 They have ${art(x)} ${esc(x)}. It is ___ ${esc(x)}.`, 'their', ['there','they'], `It is their ${x}.`), orderS(`Let's ${a[1]} together.`, 'តោះ…ជាមួយគ្នា')); } break;
  }
  return {t, km, rule, ex:uniq(ex).slice(0,4), items:it.filter(Boolean)};
}
const GC={}; const gram = n => GC[n] || (GC[n]=G(n));

/* ---------- extend each lesson section's exercises (called from lessonex.js) ---------- */
function extend(n, si, s, res){
  if(!SG) return res;   // Beginner៖ លំហាត់ដដែល
  const L=LESSONS[n], W=spellWords(n), secW=(s.w||[]).map(w=>w[0]).filter(w=>W.includes(w)), Wpool=secW.length?secW:W;
  const sents=uniq((s.ph||[]).map(p=>p[0]).concat((s.g||[]).flatMap(gi=>(L.grammar[gi]||{}).ex||[])));
  const allSents=uniq(L.sections.flatMap(x=>(x.ph||[]).map(p=>p[0])));
  const sp=res.filter(x=>x.t==='speak'), base=res.filter(x=>x.t!=='speak'), add=[];
  const spell=(k,listen)=>pick(Wpool,k).forEach(w=>add.push(spellItem(n,w,listen)));
  const read=k=>pick(Wpool,k).forEach(w=>add.push(readItem(n,w)));
  const sent=(k,src)=>{ let c=0; shuf(src).forEach(x=>{ if(c<k){ const i=sentItem(n,x); if(i){ add.push(i); c++; } } }); };
  const gr=k=>pick(gram(n).items,k).forEach(x=>add.push(Object.assign({},x)));
  switch(s.k){
    case 'open':    read(1); if(LV===1) add.push(missItem(n)); break;
    case 'grammar': add.push(missItem(n)); read(1); spell(1); break;
    case 'vocab':   read(1); spell(2); break;
    case 'practice':sent(1, sents.length?sents:allSents); gr(3); break;
    case 'listen':  spell(2, true); break;
    case 'read':    sent(2, sents.length?sents:allSents); add.push(sightItem(n)); break;
    case 'speak':   sent(1, allSents); break;
    case 'review':  gr(2); spell(1); sent(1, allSents); break;
  }
  const A=add.filter(Boolean), first=A.filter(x=>x.lv==='read'), later=A.filter(x=>x.lv!=='read');
  const keep=base.slice(0, Math.max(2, 8-A.length));
  return first.concat(keep, later, sp);
}

/* ---------- section intro cards (shown above the exercises) ---------- */
function pre(n, si, s){
  if(!SG) return '';    // Beginner៖ ខ្លឹមសារដដែល
  let h='';
  if(s.k==='vocab' || s.k==='open'){ const W=(s.w||[]).map(w=>w[0]).filter(w=>/^[a-z]+$/.test(w)).slice(0,12);
    if(W.length) h+=`<div class="lv-box lv-blend"><h4>🧩 ប្រកបតាមចំណែកសំឡេង <small>${GR.length?(LV>=5?'ស្រៈផ្សំ (ពណ៌ទឹកក្រូច) អានជាសំឡេងតែមួយ':'ព្យញ្ជនៈផ្សំ (ពណ៌ទឹកក្រូច) អានភ្ជាប់គ្នា'):'ស្រៈ (ពណ៌ក្រហម) • ព្យញ្ជនៈ (ពណ៌ខៀវ)'} — ចុចដើម្បីស្តាប់យឺតៗ</small></h4>
      <div class="lv-bw">${W.map(w=>`<button onclick="speak(${attr(w)},0.55)"><span>${emo(n,w)}</span><b>${chunkHtml(w)}</b></button>`).join('')}</div></div>`; }
  if(s.k==='practice' || s.k==='review'){ const g=gram(n);
    h+=`<div class="lv-box lv-gram"><h4>📐 វេយ្យាករណ៍ <span class="lv-tag">Sounds Great ${LV} • Unit ${n}</span></h4><b class="lv-gt">${esc(g.t)}</b><p class="km">${g.km}</p>
      <div class="lv-rule">${g.rule.map(r=>`<div><b onclick="speak(${attr(r[0].replace(/[👇👉👦👧👫🐱🐶🙋]/gu,''))})">${esc(r[0])}</b><span class="km">${esc(r[1])}</span></div>`).join('')}</div>
      ${s.k==='practice'?`<div class="lv-ex">${g.ex.map(e=>`<button onclick="speak(${attr(e.replace(/→.*/,''))})">🔊 ${esc(e)}</button>`).join('')}</div>`:''}</div>`; }
  if(s.k==='read' || s.k==='practice'){ const P=(s.ph||[]).map(p=>p[0]).filter(t=>/[a-z]/i.test(t)).slice(0,6);
    if(P.length) h+=`<div class="lv-box lv-self"><h4>👀 អានដោយខ្លួនឯងសិន <small>អានឱ្យឮៗ រួចចុច 🔊 ដើម្បីពិនិត្យថាអានត្រូវឬទេ</small></h4>
      ${P.map(p=>`<div class="lv-sr"><b>${esc(p)}</b><button onclick="LVL.chk(this,${attr(p)})">🔊 ពិនិត្យ</button></div>`).join('')}</div>`; }
  return h;
}
function chk(btn, t){ say(t); const r=btn.closest('.lv-sr'); if(r && !r.classList.contains('ok')){ r.classList.add('ok'); btn.innerHTML='✅ អានម្តងទៀត'; } }

/* ---------- 🎮 game layer ---------- */
const doneL = n => (((window.S||S).sec||{})[n]||[]);
function starsOf(n, si){ if(!doneL(n).includes(si)) return 0; const r=((S.ex||{})[n]||{})[si]; if(!r||!r.t) return 3; const p=(r.best||0)/r.t; return p>=.9?3:p>=.6?2:1; }
function road(n){
  hook(); const L=LESSONS[n], K=window.KIND||{}, tot=L.sections.reduce((a,_,i)=>a+starsOf(n,i),0), cur=(typeof openSec!=='undefined'&&openSec&&openSec.n===n)?openSec.i:-1;
  return `<div class="lv-road"><div class="lv-rh"><b>🎮 Level ក្នុង Unit ${n}</b><span>⭐ ${tot}/${L.sections.length*3}</span></div><div class="lv-track">${L.sections.map((s,i)=>{
    const ok=doneL(n).includes(i), open=typeof secOpen==='function'?secOpen(n,i):true, st=starsOf(n,i), boss=i===L.sections.length-1, k=K[s.k]||{};
    return `${i?`<i class="lv-link ${ok?'on':''}"></i>`:''}<button class="lv-node ${ok?'ok':open?'open':'lock'} ${i===cur?'cur':''} ${boss?'boss':''}" onclick="LVL.go(${n},${i})" title="${esc(s.t)}">
      <span class="lv-c">${open?(boss?'👑':(k.i||'⭐')):'🔒'}</span><b>${boss?'BOSS':'Lv '+(i+1)}</b><em>${ok?'★'.repeat(st)+'<s>'+'★'.repeat(3-st)+'</s>':'&nbsp;'}</em></button>`; }).join('')}
    <i class="lv-link ${typeof unitPassed==='function'&&unitPassed(n)?'on':''}"></i><button class="lv-node final ${typeof unitPassed==='function'&&unitPassed(n)?'ok':''}" onclick="LVL.final(${n})"><span class="lv-c">🏁</span><b>ឆ្លង</b><em>&nbsp;</em></button></div></div>`;
}
function go(n, i){ if(typeof secOpen==='function' && !secOpen(n,i)) return toast('🔒 ឆ្លង Level មុនសិន ទើបបើក Level នេះ');
  if(!(openSec&&openSec.n===n&&openSec.i===i)) Stu.open(n,i); else { const el=document.querySelectorAll('.les-s')[i]; el&&el.scrollIntoView({behavior:'smooth',block:'start'}); } }
function final(n){ if(typeof lessonDone==='function' && !lessonDone(n) && !(typeof PREVIEW==='function'&&PREVIEW())) return toast('🔒 ឆ្លងគ្រប់ Level ក្នុង Unit នេះសិន ទើបប្រកួត 🏁'); startLevel(n); }
let hooked=false;
function hook(){ if(hooked || !window.Stu) return; hooked=true; const orig=Stu.done;
  Stu.done=(n,i)=>{ const before=doneL(n).includes(i); orig(n,i); if(!before && doneL(n).includes(i)) setTimeout(()=>clear(n,i), 120); }; }
window.addEventListener('load', hook);
function clear(n, i){
  const L=LESSONS[n], s=L.sections[i], st=starsOf(n,i), last=!L.sections.some((x,k)=>!doneL(n).includes(k)), nx=L.sections.findIndex((x,k)=>k>i&&!doneL(n).includes(k)), K=(window.KIND||{})[s.k]||{};
  const msg=st===3?'ពូកែណាស់! ត្រូវលើកទីមួយស្ទើរទាំងអស់ 🌟':st===2?'ល្អណាស់! បន្តទៀត 💪':'បានហើយ! លេងម្តងទៀតដើម្បីបាន ★★★ 🙂';
  document.querySelectorAll('.lv-clear').forEach(e=>e.remove());
  const d=document.createElement('div'); d.className='lv-clear';
  d.innerHTML=`<div class="lv-fx">${Array.from({length:18},(_,k)=>`<i style="--x:${Math.round(Math.cos(k/18*6.283)*160)}px;--y:${Math.round(Math.sin(k/18*6.283)*160)}px;animation-delay:${(k%3)*.06}s">${['⭐','🎉','✨','🪙'][k%4]}</i>`).join('')}</div>
    <div class="lv-card"><small>Unit ${n} • ${esc(K.km||'')}</small><h2>${last?'UNIT COMPLETE!':i===L.sections.length-1?'BOSS CLEAR!':`LEVEL ${i+1} CLEAR!`}</h2><p class="lv-st">${esc(s.t)}</p>
      <div class="lv-stars">${[0,1,2].map(k=>`<span class="${k<st?'on':''}" style="animation-delay:${.25+k*.28}s">★</span>`).join('')}</div><p class="km">${msg}</p>
      <div class="lv-btns">${st<3?`<button class="btn ghost" onclick="LVL.retry(${n},${i})">↺ លេងម្តងទៀត</button>`:''}
      ${last?`<button class="btn sun" onclick="LVL.close();LVL.final(${n})">🏁 ប្រកួតឆ្លង Unit</button>`:nx>=0?`<button class="btn teal" onclick="LVL.close()">▶ ${nx===L.sections.length-1?'BOSS':'Level '+(nx+1)}</button>`:`<button class="btn teal" onclick="LVL.close()">▶ បន្ត</button>`}</div></div>`;
  d.onclick=e=>{ if(e.target===d) close(); };
  document.body.appendChild(d); try{ beep(true); setTimeout(()=>beep(true),180); }catch(e){}
}
function close(){ document.querySelectorAll('.lv-clear').forEach(e=>{ e.classList.add('out'); setTimeout(()=>e.remove(),250); }); }
function retry(n, i){ close(); if(window.LEX) LEX.again(n,i); openSec={n, i}; render(); setTimeout(()=>{ const el=document.querySelectorAll('.les-s')[i]; el&&el.scrollIntoView({behavior:'smooth',block:'start'}); },80); }

/* 🔥 combo — consecutive first-try answers */
let combo=0;
function hit(ok, first){ if(!ok){ combo=0; return; } if(!first) return; combo++;
  if(combo===3||combo===5||combo===8||combo%10===0){ const d=document.createElement('div'); d.className='lv-combo'; d.innerHTML=`🔥 Combo ×${combo}<small>${combo>=8?'អស្ចារ្យ!':combo>=5?'ពូកែណាស់!':'ល្អណាស់!'}</small>`; document.body.appendChild(d); setTimeout(()=>d.remove(),1500); } }

window.LVL = { extend, pre, chk, road, go, final, clear, close, retry, hit, chunks, gram, level:LV };
})();
