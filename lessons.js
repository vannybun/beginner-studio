// =====================================================================
//  lessons.js — រចនាសម្ព័ន្ធមេរៀនតាមលំដាប់ទំព័រ Student's Book (Headway 5th ed. Beginner)
//  section: {p:ទំព័រ, k:ប្រភេទ, t:ចំណងជើង, km:ពន្យល់ខ្មែរ, g:[លេខវេយ្យាករណ៍], w:[[en,km,emoji]], ph:[[en,km]], task, qs}
//  k: open | grammar | practice | vocab | read | listen | speak | write | everyday | review
//  grammar: {t, p, km, form:[[...]], ex:[], more:[...], err:[[ខុស,ត្រូវ]]}
// =====================================================================
window.UNIT_STYLE = {
  1:{icon:"👋",c1:"#0f766e",c2:"#14b8a6"}, 2:{icon:"🌍",c1:"#1d4ed8",c2:"#38bdf8"},
  3:{icon:"🧑‍💼",c1:"#7c3aed",c2:"#c084fc"}, 4:{icon:"👨‍👩‍👧‍👦",c1:"#be123c",c2:"#fb7185"},
  5:{icon:"🍦",c1:"#ea580c",c2:"#fbbf24"}, 6:{icon:"⏰",c1:"#0369a1",c2:"#22d3ee"},
  7:{icon:"💖",c1:"#db2777",c2:"#f9a8d4"}, 8:{icon:"🏡",c1:"#15803d",c2:"#86efac"},
  9:{icon:"🕰️",c1:"#92400e",c2:"#f59e0b"}, 10:{icon:"🎉",c1:"#9333ea",c2:"#f472b6"},
  11:{icon:"💪",c1:"#dc2626",c2:"#fb923c"}, 12:{icon:"🛍️",c1:"#0d9488",c2:"#a3e635"},
  13:{icon:"🌂",c1:"#4f46e5",c2:"#f472b6"}, 14:{icon:"✈️",c1:"#0284c7",c2:"#facc15"}
};
window.KIND = {
  open:{i:"🚀",en:"Unit opener",km:"ចាប់ផ្តើមមេរៀន"}, grammar:{i:"📐",en:"Grammar",km:"វេយ្យាករណ៍"},
  practice:{i:"🎯",en:"Practice",km:"អនុវត្ត"}, vocab:{i:"🔤",en:"Vocabulary",km:"វាក្យសព្ទ"},
  read:{i:"📖",en:"Reading",km:"ការអាន"}, listen:{i:"🎧",en:"Listening",km:"ការស្តាប់"},
  speak:{i:"🗣️",en:"Speaking",km:"ការនិយាយ"}, write:{i:"✍️",en:"Writing",km:"ការសរសេរ"},
  everyday:{i:"💬",en:"Everyday English",km:"ភាសាអង់គ្លេសប្រចាំថ្ងៃ"}, review:{i:"🔁",en:"Review",km:"រំលឹកមេរៀន"}
};

window.LESSONS = {
/* ============================== UNIT 1 ============================== */
1:{
 grammar:[
  {t:"am / is / are", p:8, km:"កិរិយាសព្ទ <b>to be</b> មានន័យថា «ជា / គឺ / នៅ»។ វាប្តូររាងតាមប្រធាន។",
   form:[["I","am","I'm"],["he / she / it","is","he's / she's / it's"],["you / we / they","are","you're / we're / they're"]],
   ex:["I'm Serena.","My name's Tom.","It's a book."],
   more:["ពេលនិយាយ យើងតែងប្រើទម្រង់បង្រួម (contraction)៖ I am → I'm, name is → name's ។","ភាសាខ្មែរអាចនិយាយ «ខ្ញុំ សុខា» ដោយគ្មានកិរិយាសព្ទ ប៉ុន្តែភាសាអង់គ្លេសត្រូវតែមាន am / is / are ជានិច្ច។"],
   err:[["I Dara.","I'm Dara."],["She are a student.","She's a student."]]},
  {t:"my / your", p:8, km:"<b>my</b> = របស់ខ្ញុំ • <b>your</b> = របស់អ្នក។ ដាក់នៅមុខនាមជានិច្ច។",
   form:[["I","→","my"],["you","→","your"]],
   ex:["What's your name?","My name's Leo."],
   more:["What's = What is ។ សំណួរ What's your name? ចម្លើយ My name's … ឬ I'm …"],
   err:[["What's you name?","What's your name?"],["I name is Nari.","My name is Nari."]]},
  {t:"This is …", p:9, km:"ប្រើ <b>This is …</b> ដើម្បីណែនាំមនុស្សម្នាក់ ឬបង្ហាញវត្ថុនៅជិត។",
   ex:["This is Pedro.","This is my friend, Sophea.","Hello, Pedro. Nice to meet you."],
   more:["ពេលគេណែនាំអ្នក ឆ្លើយថា Nice to meet you. (រីករាយដែលបានស្គាល់)។"]},
  {t:"How are you?", p:10, km:"សំណួរសួរសុខទុក្ខ។ ឆ្លើយ៖ <b>Fine, thanks.</b> / <b>I'm OK.</b> / <b>Very well, thank you.</b> រួចសួរត្រឡប់វិញ <b>And you?</b>",
   ex:["Hi, Sophie! How are you?","Fine, thanks. And you?","I'm OK, thanks."],
   more:["How are you? ≠ How old are you? (អាយុប៉ុន្មាន)។","Very well (ល្អណាស់) • Fine / OK (ធម្មតា ល្អ)។"]},
  {t:"a / an + plurals", p:12, km:"<b>a</b> មុខពាក្យចាប់ផ្តើមដោយសំឡេងព្យញ្ជនៈ • <b>an</b> មុខសំឡេងស្រៈ (a e i o u)។ ពហុវចនៈភាគច្រើនថែម <b>-s</b>, ពាក្យបញ្ចប់ដោយ -ch -sh -s -x ថែម <b>-es</b>។",
   form:[["a book","→","books"],["an apple","→","apples"],["a sandwich","→","sandwiches"],["a bus","→","buses"]],
   ex:["What's this in English? — It's an umbrella.","It's a bag.","two watches, three buses"],
   more:["What's this in English? = តើនេះជាភាសាអង់គ្លេសហៅថាអ្វី?","ពហុវចនៈមិនប្រើ a / an ទេ៖ ✅ two books ❌ two a books ។"],
   err:[["a apple","an apple"],["two bus","two buses"]]}
 ],
 sections:[
  {p:7,k:"open",t:"Hello!",km:"ស្វាគមន៍មកកាន់មេរៀនទី១ — យើងនឹងរៀនណែនាំខ្លួន សួរសុខទុក្ខ ឈ្មោះវត្ថុ និងលេខ ១–១០។"},
  {p:8,k:"grammar",t:"Starter: What's your name?",km:"ស្តាប់ ហើយនិយាយឈ្មោះខ្លួនឯង។",g:[0,1],
   ph:[["Hello, I'm …","សួស្តី ខ្ញុំឈ្មោះ…"],["What's your name?","អ្នកឈ្មោះអ្វី?"],["My name's …","ខ្ញុំឈ្មោះ…"]]},
  {p:9,k:"grammar",t:"Introductions: This is …",km:"ណែនាំមិត្តភក្តិ។",g:[2],
   ph:[["This is …","នេះគឺ…"],["Nice to meet you.","រីករាយដែលបានស្គាល់"]]},
  {p:10,k:"grammar",t:"How are you?",km:"សួរសុខទុក្ខ និងឆ្លើយ។",g:[3]},
  {p:11,k:"everyday",t:"Everyday English: Good morning!",km:"ពាក្យស្វាគមន៍តាមពេលវេលា។",
   ph:[["Good morning!","អរុណសួស្តី (ពេលព្រឹក)"],["Good afternoon!","ទិវាសួស្តី (ពេលរសៀល)"],["Good evening!","សាយ័ណ្ហសួស្តី (ពេលល្ងាច)"],["Good night!","រាត្រីសួស្តី (មុនគេង)"],["Goodbye! / Bye!","លាហើយ"],["See you later!","ជួបគ្នាពេលក្រោយ"],["Have a nice day!","សូមឱ្យមានថ្ងៃល្អ"],["Sleep well.","គេងលក់ស្រួល"]]},
  {p:12,k:"vocab",t:"Vocabulary and speaking: What's this in English?",km:"ឈ្មោះវត្ថុប្រចាំថ្ងៃ និង a / an។",g:[4],
   w:[["a bag","កាបូប","👜"],["a book","សៀវភៅ","📘"],["a photo","រូបថត","🖼️"],["an apple","ផ្លែប៉ោម","🍎"],["a phone","ទូរស័ព្ទ","📱"],["a laptop","កុំព្យូទ័រយួរដៃ","💻"],["a sandwich","នំសាំងវិច","🥪"],["an umbrella","ឆ័ត្រ","☂️"],["a watch","នាឡិកាដៃ","⌚"],["a house","ផ្ទះ","🏠"],["a bike","កង់","🚲"],["a bus","ឡានក្រុង","🚌"]]},
  {p:13,k:"vocab",t:"Numbers 1–10 and plurals",km:"រាប់លេខ ១–១០ និងនាមពហុវចនៈ។",
   w:[["one","មួយ","1️⃣"],["two","ពីរ","2️⃣"],["three","បី","3️⃣"],["four","បួន","4️⃣"],["five","ប្រាំ","5️⃣"],["six","ប្រាំមួយ","6️⃣"],["seven","ប្រាំពីរ","7️⃣"],["eight","ប្រាំបី","8️⃣"],["nine","ប្រាំបួន","9️⃣"],["ten","ដប់","🔟"]]},
  {p:14,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកវេយ្យាករណ៍ និងពាក្យថ្មីទាំងអស់នៃមេរៀន។"}
 ]},
/* ============================== UNIT 2 ============================== */
2:{
 grammar:[
  {t:"he / she", p:16, km:"<b>he</b> = គាត់ (ប្រុស) • <b>she</b> = គាត់ (ស្រី) • <b>it</b> = វា (វត្ថុ/ទីកន្លែង)។ ប្រើជាមួយ <b>is</b>។",
   form:[["he is","→","he's"],["she is","→","she's"],["it is","→","it's"]],
   ex:["She's from China.","He's from Brazil.","It's in Italy."],
   more:["Where … from? = មកពីណា ។ ឆ្លើយ៖ I'm from Cambodia. / She's from Japan."],
   err:[["She from China.","She's from China."]]},
  {t:"his / her", p:16, km:"<b>his</b> = របស់គាត់ (ប្រុស) • <b>her</b> = របស់គាត់ (ស្រី)។",
   form:[["he","→","his"],["she","→","her"]],
   ex:["His name's Leo.","Her name's Akemi.","What's her name?"],
   more:["ប្រយ័ត្ន៖ he's (= he is) ≠ his (របស់គាត់)។"],
   err:[["She name is Mara.","Her name is Mara."],["He's name is Bud.","His name is Bud."]]},
  {t:"Questions: What … ? / Where … ?", p:17, km:"ពាក្យសួរ + <b>is / are</b> + ប្រធាន។ <b>What</b> = អ្វី • <b>Where</b> = ឯណា • <b>How old</b> = អាយុប៉ុន្មាន។",
   form:[["What","'s","your / his / her name?"],["Where","'s","he / she from?"],["Where","are","you from?"]],
   ex:["Where's Moscow? — It's in Russia.","Where are you from? — I'm from Cambodia.","What's his name? — His name's Bud."],
   more:["Where is → Where's ។ What is → What's ។","ទីក្រុង + in + ប្រទេស៖ Siem Reap is in Cambodia."],
   err:[["Where you are from?","Where are you from?"]]},
  {t:"Adjective + noun", p:20, km:"គុណនាម (adjective) ដាក់<b>មុខ</b>នាម — ផ្ទុយពីភាសាខ្មែរ។",
   ex:["a beautiful city","a big building","fantastic views"],
   more:["ខ្មែរ៖ ទីក្រុង + ស្អាត • អង់គ្លេស៖ beautiful + city ។","គុណនាមមិនថែម -s ទេ៖ ✅ big buildings ❌ bigs buildings ។"],
   err:[["a city beautiful","a beautiful city"]]}
 ],
 sections:[
  {p:15,k:"open",t:"Your world",km:"ប្រទេស ទីក្រុង និងព័ត៌មានអំពីមនុស្សជុំវិញពិភពលោក។"},
  {p:16,k:"grammar",t:"She's from China — he/she, his/her",km:"ស្តាប់ឈ្មោះប្រទេស ហើយនិយាយថាមនុស្សមកពីណា។",g:[0,1],
   w:[["Argentina","អាហ្សង់ទីន","🇦🇷"],["Australia","អូស្ត្រាលី","🇦🇺"],["Brazil","ប្រេស៊ីល","🇧🇷"],["China","ចិន","🇨🇳"],["England","អង់គ្លេស","🏴󠁧󠁢󠁥󠁮󠁧󠁿"],["Egypt","អេហ្ស៊ីប","🇪🇬"],["France","បារាំង","🇫🇷"],["Italy","អ៊ីតាលី","🇮🇹"],["Japan","ជប៉ុន","🇯🇵"],["Spain","អេស្ប៉ាញ","🇪🇸"],["Russia","រុស្ស៊ី","🇷🇺"],["Turkey","តួកគី","🇹🇷"],["the US","សហរដ្ឋអាមេរិក","🇺🇸"]]},
  {p:17,k:"grammar",t:"Questions",km:"សួរ What / Where ជាមួយ is / are។",g:[2]},
  {p:18,k:"practice",t:"Practice: Where's it from? Talking about you",km:"ផ្គូផ្គងទីក្រុងជាមួយប្រទេស និងសួរ-ឆ្លើយជាគូ (Student A / Student B)។",
   ph:[["Where's Moscow?","តើម៉ូស្គូនៅឯណា?"],["It's in Russia.","វានៅប្រទេសរុស្ស៊ី"],["Where are you from?","អ្នកមកពីណា?"],["I'm from Cambodia.","ខ្ញុំមកពីកម្ពុជា"]]},
  {p:19,k:"practice",t:"Practice: Check it",km:"ស្តាប់ សរសេរឈ្មោះប្រទេស ហើយជ្រើសប្រយោគត្រឹមត្រូវ។"},
  {p:20,k:"read",t:"Reading and vocabulary: A holiday in New York",km:"អានអំពីដំណើរកម្សាន្តនៅញូវយ៉ក ហើយរៀនគុណនាម + នាម។",g:[3],
   w:[["beautiful","ស្អាត","🌸"],["fantastic","អស្ចារ្យ","🤩"],["awful","អាក្រក់ខ្លាំង","😖"],["great","ល្អណាស់","👍"],["amazing","អស្ចារ្យ","✨"],["big","ធំ","🐘"],["building","អគារ","🏢"],["view","ទេសភាព","🌆"],["weather","អាកាសធាតុ","🌤️"],["hotel","សណ្ឋាគារ","🏨"]],
   qs:["Where are they on holiday?","Is the weather good?","What's the hotel like?"]},
  {p:21,k:"everyday",t:"Everyday English: Numbers 11–30",km:"រាប់លេខ ១១–៣០ ហើយស្តាប់ធីកលេខដែលឮ។",
   w:[["eleven","ដប់មួយ","11"],["twelve","ដប់ពីរ","12"],["thirteen","ដប់បី","13"],["fourteen","ដប់បួន","14"],["fifteen","ដប់ប្រាំ","15"],["sixteen","ដប់ប្រាំមួយ","16"],["seventeen","ដប់ប្រាំពីរ","17"],["eighteen","ដប់ប្រាំបី","18"],["nineteen","ដប់ប្រាំបួន","19"],["twenty","ម្ភៃ","20"],["twenty-one","ម្ភៃមួយ","21"],["thirty","សាមសិប","30"]],
   ph:[["thirteen ≠ thirty","១៣ (សង្កត់ -TEEN) ≠ ៣០ (សង្កត់ THIR-)"]]},
  {p:22,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកវេយ្យាករណ៍ និងពាក្យថ្មី។"}
 ]},
/* ============================== UNIT 3 ============================== */
3:{
 grammar:[
  {t:"Negatives — he/she isn't", p:25, km:"បដិសេធ៖ <b>is not = isn't</b>។",
   form:[["He","isn't","a teacher."],["She","isn't","from Spain."],["It","isn't","a hotel."]],
   ex:["He isn't a doctor. He's a nurse.","She isn't married."],
   more:["isn't = is not • ពេលនិយាយ យើងប្រើ isn't ច្រើនជាង is not ។"],
   err:[["He not a doctor.","He isn't a doctor."]]},
  {t:"Questions and short answers", p:25, km:"សួរ Yes/No៖ ដាក់ <b>Is / Are</b> នៅមុខប្រធាន។ ចម្លើយខ្លី៖ <b>Yes, he is.</b> / <b>No, he isn't.</b>",
   form:[["Is","he / she","a student?"],["Are","you / they","married?"]],
   ex:["Is she a teacher? — No, she isn't.","Is he from England? — Yes, he is.","Are you married? — No, I'm not."],
   more:["ចម្លើយខ្លីវិជ្ជមាន មិនបង្រួមទេ៖ ✅ Yes, he is. ❌ Yes, he's.","How old are you? — I'm 25. (មិនប្រើ years old ក៏បាន)"],
   err:[["Yes, she's.","Yes, she is."],["She is a nurse?","Is she a nurse?"]]},
  {t:"Negatives — I'm not, they/we aren't", p:26, km:"<b>am not → I'm not</b> • <b>are not → aren't</b>។",
   form:[["I","'m not","married."],["You / We / They","aren't","from Paris."]],
   ex:["We aren't from Spain. We're from Scotland.","I'm not a student.","They aren't twins."],
   more:["គ្មាន amn't ទេ — ប្រើ I'm not ។"],
   err:[["I amn't married.","I'm not married."],["They isn't here.","They aren't here."]]}
 ],
 sections:[
  {p:23,k:"open",t:"All about you — Vocabulary: Jobs",km:"មុខរបរ៖ What's your job? — I'm a teacher.",
   w:[["teacher","គ្រូបង្រៀន","👩‍🏫"],["doctor","វេជ្ជបណ្ឌិត","👨‍⚕️"],["nurse","គិលានុបដ្ឋាក","🧑‍⚕️"],["student","សិស្ស/និស្សិត","🧑‍🎓"],["police officer","ប៉ូលិស","👮"],["builder","ជាងសំណង់","👷"],["bus driver","អ្នកបើកឡានក្រុង","🚌"],["taxi driver","អ្នកបើកតាក់ស៊ី","🚕"],["businessman","អ្នកជំនួញ","💼"],["receptionist","អ្នកទទួលភ្ញៀវ","🛎️"],["waitress","អ្នករត់តុ","🍽️"],["footballer","កីឡាករបាល់ទាត់","⚽"]]},
  {p:24,k:"vocab",t:"What's his job?",km:"សួរ និងឆ្លើយអំពីការងាររបស់អ្នកដទៃ។",
   ph:[["What's his job?","គាត់ធ្វើការអ្វី?"],["He's a builder.","គាត់ជាជាងសំណង់"],["What's her job?","គាត់ (ស្រី) ធ្វើការអ្វី?"],["She's a nurse.","គាត់ជាគិលានុបដ្ឋាក"]]},
  {p:25,k:"grammar",t:"Grammar: Questions and answers • Negatives he/she isn't • Personal information",km:"ព័ត៌មានផ្ទាល់ខ្លួន៖ surname, country, age, job, married?",g:[0,1],
   w:[["surname","នាមត្រកូល","🔤"],["first name","នាមខ្លួន","🪪"],["country","ប្រទេស","🗺️"],["age","អាយុ","🎂"],["job","ការងារ","💼"],["address","អាសយដ្ឋាន","📮"],["phone number","លេខទូរស័ព្ទ","☎️"],["married","រៀបការហើយ","💍"]]},
  {p:26,k:"grammar",t:"Negatives — I'm not, they/we aren't",km:"អានបទសម្ភាសន៍ និងប្រើទម្រង់អវិជ្ជមាន។",g:[2]},
  {p:27,k:"practice",t:"Practice",km:"សួរ-ឆ្លើយអំពីមនុស្សក្នុងតារាង (Country, City, Age, Job, Married?)។",
   ph:[["Where are they from?","ពួកគេមកពីណា?"],["How old is she?","គាត់អាយុប៉ុន្មាន?"],["Is he married?","គាត់រៀបការហើយឬនៅ?"]]},
  {p:28,k:"read",t:"Reading and listening: Scottish Rovers in Paris",km:"អាន និងស្តាប់បទសម្ភាសន៍ជាមួយក្រុមបាល់ទាត់នារីស្កុតឡែន។",
   w:[["team","ក្រុម","👥"],["captain","ប្រធានក្រុម","🎖️"],["final","ការប្រកួតផ្តាច់ព្រ័ត្រ","🏆"],["twins","កូនភ្លោះ","👯"],["excited","រំភើប","🤩"],["nervous","ភ័យ","😬"]],
   qs:["Where are the girls?","Are they all from Scotland?","Who is married?"]},
  {p:29,k:"everyday",t:"Everyday English: Social expressions (1)",km:"ឃ្លាប្រើក្នុងសង្គមប្រចាំថ្ងៃ។",
   ph:[["Excuse me!","សុំទោស! (ហៅ/សួរ)"],["I'm sorry.","ខ្ញុំសុំទោស"],["I don't know.","ខ្ញុំមិនដឹងទេ"],["I don't understand.","ខ្ញុំមិនយល់ទេ"],["Pardon?","សូមនិយាយម្តងទៀត?"],["That's right.","ត្រឹមត្រូវហើយ"],["No problem.","គ្មានបញ្ហាទេ"],["Good luck!","សូមសំណាងល្អ!"]]},
  {p:30,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកមេរៀន។"}
 ]},
/* ============================== UNIT 4 ============================== */
4:{
 grammar:[
  {t:"Possessive adjectives", p:32, km:"បង្ហាញម្ចាស់៖ ដាក់មុខនាម។",
   form:[["I → my","you → your","he → his"],["she → her","it → its","we → our"],["they → their","",""]],
   ex:["This is his family.","Their house is in Belfast.","Our children are Michael and Becky."],
   more:["its (របស់វា) ≠ it's (= it is)។","their (របស់ពួកគេ) ≠ they're (= they are)។"],
   err:[["They house is big.","Their house is big."]]},
  {t:"Possessive 's", p:32, km:"ឈ្មោះមនុស្ស + <b>'s</b> = របស់អ្នកនោះ។ <b>Jenny's job</b> = ការងាររបស់ជេននី។",
   ex:["Jenny is Ian's wife.","Ian's school is in the centre of town.","Who's Michael? — He's Becky's brother."],
   more:["'s មានន័យ ២៖ (១) is: He's a teacher. (២) របស់: Ian's school ។ មើលបរិបទ។","ខ្មែរ៖ សាលា (របស់) អៀន • អង់គ្លេស៖ Ian's school (ម្ចាស់មកមុន)។"],
   err:[["the car of Marie","Marie's car"]]},
  {t:"Common verbs (1): have / has, love, like, work", p:35, km:"Present Simple៖ I/you/we/they <b>have, like, work</b> — he/she/it <b>has, likes, works</b>។",
   form:[["I / You / We / They","have","a laptop."],["He / She","has","a laptop."],["He / She","likes / loves / works","…"]],
   ex:["They have three sons.","He has a big house.","She works in a boutique.","He loves football."],
   more:["have → has (មិនមែន haves)។","ជាមួយ he/she/it ថែម -s: like → likes, work → works, love → loves ។"],
   err:[["She have a car.","She has a car."],["He work in London.","He works in London."]]}
 ],
 sections:[
  {p:31,k:"open",t:"Family and friends",km:"មើលមែកធាងគ្រួសារ ហើយស្តាប់។"},
  {p:32,k:"grammar",t:"My family — Possessive adjectives & Possessive 's",km:"អានអំពីគ្រួសាររបស់ Ian McCaul។",g:[0,1],
   qs:["What's Ian's job?","What's Jenny's job?","How old is Michael?"]},
  {p:33,k:"vocab",t:"Vocabulary: The family",km:"សមាជិកគ្រួសារ។",
   w:[["mother","ម្តាយ","👩"],["father","ឪពុក","👨"],["parents","ឪពុកម្តាយ","👪"],["son","កូនប្រុស","👦"],["daughter","កូនស្រី","👧"],["brother","បង/ប្អូនប្រុស","🧑"],["sister","បង/ប្អូនស្រី","👩‍🦰"],["husband","ប្តី","🤵"],["wife","ប្រពន្ធ","👰"],["grandmother","យាយ","👵"],["grandfather","តា","👴"],["children","កូនៗ","🧒"]]},
  {p:34,k:"practice",t:"Practice: my / your / his …",km:"និយាយអំពីគ្រួសារ និងមិត្តភក្តិ។",
   ph:[["Who's this?","នេះជានរណា?"],["He's my brother.","គាត់ជាបងប្រុសខ្ញុំ"],["Really? What's his job?","ពិតមែន? គាត់ធ្វើការអ្វី?"]]},
  {p:35,k:"grammar",t:"Common verbs (1): have/has, love, like, work",km:"អានអំពីកីឡាករល្បី និងគ្រួសាររបស់គាត់។",g:[2]},
  {p:36,k:"read",t:"Practice • Reading and writing: My e-pal",km:"អានអ៊ីមែលពីមិត្តតាមអ៊ីនធឺណិត។",
   w:[["e-pal","មិត្តតាមអ៊ីមែល","📧"],["university","សាកលវិទ្យាល័យ","🎓"],["funny","កំប្លែង","😂"],["dancing","ការរាំ","💃"],["boyfriend","មិត្តប្រុស","🧑‍🤝‍🧑"]],
   qs:["Where does Melisa live?","What's her job?","What does she like?"]},
  {p:37,k:"write",t:"Writing: about your friend",km:"សរសេរកថាខណ្ឌខ្លីអំពីមិត្តភក្តិរបស់អ្នក (ឈ្មោះ អាយុ ការងារ គ្រួសារ អ្វីដែលចូលចិត្ត)។",
   ph:[["My friend's name is …","មិត្តខ្ញុំឈ្មោះ…"],["She's … years old.","គាត់អាយុ … ឆ្នាំ"],["She lives in …","គាត់រស់នៅ…"],["She likes …","គាត់ចូលចិត្ត…"]]},
  {p:38,k:"vocab",t:"Vocabulary and speaking: The alphabet",km:"អក្សរ A–Z និងការប្រកប (spelling)។",
   ph:[["How do you spell …?","ប្រកបយ៉ាងម៉េច?"],["A H J K","/eɪ/"],["B C D E G P T V","/iː/"],["F L M N S X Z","/e/"],["I Y","/aɪ/"],["O","/əʊ/"],["Q U W","/uː/"],["R","/ɑː/"]]},
  {p:39,k:"everyday",t:"Everyday English: On the phone",km:"ការហៅទូរស័ព្ទ ប្រកបឈ្មោះ និងអ៊ីមែល។",
   ph:[["Hello, … Hotel.","ជម្រាបសួរ សណ្ឋាគារ…"],["Can I help you?","តើខ្ញុំអាចជួយអ្វីបាន?"],["What's your name, please?","សូមប្រាប់ឈ្មោះ"],["How do you spell that?","ប្រកបយ៉ាងម៉េច?"],["What's your email address?","អ៊ីមែលរបស់អ្នក?"],["@ = at   . = dot","@ អានថា at • . អានថា dot"]]},
  {p:40,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកមេរៀន។"}
 ]},
/* ============================== UNIT 5 ============================== */
5:{
 grammar:[
  {t:"Present Simple positive — I/you/we/they", p:42, km:"ប្រើសម្រាប់ <b>ទម្លាប់ ចំណូលចិត្ត និងការពិត</b>។ ប្រើកិរិយាសព្ទដើម។",
   form:[["I / You / We / They","like","pizza."],["I / You / We / They","play","tennis."]],
   ex:["I like football.","We live in London.","They speak two languages."],
   more:["ពាក្យសម្គាល់៖ every day, usually, at the weekend ។"]},
  {t:"Present Simple negative", p:43, km:"<b>don't</b> (= do not) + កិរិយាសព្ទដើម។",
   form:[["I / You / We / They","don't","like coffee."]],
   ex:["I don't like tennis.","We don't speak French.","They don't eat meat."],
   err:[["I not like coffee.","I don't like coffee."]]},
  {t:"Questions — I/you/we/they", p:43, km:"<b>Do</b> + ប្រធាន + កិរិយាសព្ទ? ចម្លើយខ្លី៖ <b>Yes, I do.</b> / <b>No, I don't.</b> ពាក្យសួរ៖ <b>Where / What / How many</b> + do …?",
   form:[["Do","you / they","like ice cream?"],["Where","do you","live?"],["How many languages","do you","speak?"]],
   ex:["Do you like chocolate? — Yes, I do.","Where do you work?","How many languages do they speak?"],
   err:[["You like tea?","Do you like tea?"],["Where you live?","Where do you live?"]]},
  {t:"Adjective + noun (1)", p:47, km:"គុណនាមនៅមុខនាម ហើយមិនថែម -s។ ភាសា/សញ្ជាតិក៏ជាគុណនាម៖ <b>a Japanese car</b>។",
   ex:["an English dictionary","a Japanese car","Italian ice cream"],
   err:[["a car Japanese","a Japanese car"]]}
 ],
 sections:[
  {p:41,k:"open",t:"Things I like!",km:"កីឡា អាហារ ភេសជ្ជៈ និងអ្វីដែលយើងចូលចិត្ត/មិនចូលចិត្ត។"},
  {p:42,k:"grammar",t:"Likes and dislikes — Present Simple positive",km:"រៀនពាក្យកីឡា អាហារ ភេសជ្ជៈ (រូបភាព ១–១៦)។",g:[0],
   w:[["football","បាល់ទាត់","⚽"],["tennis","វាយកូនបាល់","🎾"],["swimming","ហែលទឹក","🏊"],["ice cream","ការ៉េម","🍦"],["chocolate","សូកូឡា","🍫"],["pizza","ភីហ្សា","🍕"],["hamburgers","ហាំប៊ឺហ្គឺ","🍔"],["tomatoes","ប៉េងប៉ោះ","🍅"],["oranges","ក្រូច","🍊"],["coffee","កាហ្វេ","☕"],["tea","តែ","🍵"],["Coke","កូកាកូឡា","🥤"],["cheese","ឈីស","🧀"],["bread","នំប៉័ង","🍞"],["wine","ស្រាទំពាំងបាយជូរ","🍷"],["crisps","ដំឡូងចៀនស្ងួត","🥔"]]},
  {p:43,k:"grammar",t:"Present Simple negative • Questions I/you/we/they",km:"Dexter និង Daisy — តើពួកគេចូលចិត្តអ្វី?",g:[1,2],
   w:[["delicious","ឆ្ងាញ់","😋"],["disgusting","គួរខ្ពើម","🤢"],["boring","ធុញ","🥱"],["exciting","រំភើប","🤩"],["fantastic","អស្ចារ្យ","🌟"],["cool","ឡូយ","😎"]]},
  {p:44,k:"read",t:"Practice: Alek Brosko from Warsaw",km:"អាន និងស្តាប់អំពី Alek — គាត់និយាយ៣ភាសា។",
   qs:["Where is he from?","How many languages does he speak?","Where does he work?"]},
  {p:45,k:"listen",t:"Listening and speaking",km:"ស្តាប់ការសន្ទនា៤ — Alek នៅឯណា? ជាមួយអ្នកណា?",
   ph:[["Do you speak Spanish?","អ្នកនិយាយភាសាអេស្ប៉ាញទេ?"],["Yes, I do. / No, I don't.","បាទ/ចាស និយាយ • ទេ"]]},
  {p:46,k:"vocab",t:"Vocabulary: Languages and nationalities",km:"ប្រទេស → សញ្ជាតិ / ភាសា។",
   w:[["Mexico → Mexican","ម៉ិកស៊ិក","🇲🇽"],["Spain → Spanish","អេស្ប៉ាញ","🇪🇸"],["Poland → Polish","ប៉ូឡូញ","🇵🇱"],["Brazil → Brazilian","ប្រេស៊ីល","🇧🇷"],["Ireland → Irish","អៀរឡង់","🇮🇪"],["Germany → German","អាល្លឺម៉ង់","🇩🇪"],["China → Chinese","ចិន","🇨🇳"],["Japan → Japanese","ជប៉ុន","🇯🇵"],["France → French","បារាំង","🇫🇷"],["Italy → Italian","អ៊ីតាលី","🇮🇹"],["Portugal → Portuguese","ព័រទុយហ្គាល់","🇵🇹"],["Switzerland → Swiss","ស្វីស","🇨🇭"],["Cambodia → Cambodian / Khmer","កម្ពុជា / ខ្មែរ","🇰🇭"]]},
  {p:47,k:"vocab",t:"Adjective + noun (1)",km:"ផ្សំគុណនាមជាមួយនាម។",g:[3]},
  {p:48,k:"speak",t:"Listening and speaking: Party time",km:"Daniel និង Tam ជួបគ្នានៅពិធីជប់លៀង — សម្តែងតួ (Roleplay)។",
   ph:[["Hi, I'm …","សួស្តី ខ្ញុំ…"],["Where are you from?","អ្នកមកពីណា?"],["What do you do?","អ្នកធ្វើការអ្វី?"],["Do you like …?","អ្នកចូលចិត្ត…ទេ?"]]},
  {p:49,k:"everyday",t:"Everyday English: How much is it?",km:"លេខ ១០–១០០ និងតម្លៃ។",
   ph:[["How much is it?","តម្លៃប៉ុន្មាន?"],["How much are they?","ទាំងនេះតម្លៃប៉ុន្មាន?"],["It's £2.99.","two pounds ninety-nine"],["30p","thirty p"],["£1.60","one pound sixty"],["$5","five dollars"],["10,000 riels","ten thousand riels"]],
   w:[["forty","សែសិប","40"],["fifty","ហាសិប","50"],["sixty","ហុកសិប","60"],["seventy","ចិតសិប","70"],["eighty","ប៉ែតសិប","80"],["ninety","កៅសិប","90"],["one hundred","មួយរយ","💯"]]},
  {p:50,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកមេរៀន។"}
 ]},
/* ============================== UNIT 6 ============================== */
6:{
 grammar:[
  {t:"The time", p:52, km:"<b>What time is it?</b> — It's … o'clock / half past / quarter past / quarter to / five past …",
   form:[["7:00","seven o'clock",""],["7:15","quarter past seven",""],["7:30","half past seven",""],["7:45","quarter to eight",""],["7:10","ten past seven",""],["7:50","ten to eight",""]],
   ex:["What time is it? — It's half past ten.","Excuse me, what time is it?"],
   more:["past = ហួស (នាទី ១–៣០) • to = ខ្វះ (នាទី ៣១–៥៩)។","អាចនិយាយលេខសាមញ្ញ៖ 7:45 = seven forty-five ។"]},
  {t:"Present Simple — he / she", p:54, km:"ជាមួយ <b>he / she / it</b> ថែម <b>-s</b> ឬ <b>-es</b>។",
   form:[["work → works","live → lives","get up → gets up"],["go → goes","watch → watches","have → has"]],
   ex:["She gets up at six o'clock.","He goes to work by bus.","Anna has lunch at the hospital."],
   more:["-es បន្ទាប់ពី -o, -ch, -sh, -s, -x: goes, watches, washes ។","សំឡេង -s: works /s/, lives /z/, watches /ɪz/ ។"],
   err:[["She work in a hospital.","She works in a hospital."],["He gos to bed.","He goes to bed."]]},
  {t:"Adverbs of frequency — always / sometimes / never", p:54, km:"បង្ហាញថាញឹកញាប់ប៉ុណ្ណា។ ដាក់<b>មុខកិរិយាសព្ទ</b>។",
   form:[["always","100%","ជានិច្ច"],["usually","80%","ជាធម្មតា"],["sometimes","50%","ពេលខ្លះ"],["never","0%","មិនដែល"]],
   ex:["She always gets up early.","He sometimes goes out on Saturday.","I never drink coffee."],
   more:["ជាមួយ be ដាក់ក្រោយ: The hospital is always busy ។"],
   err:[["I go always to school.","I always go to school."]]},
  {t:"Questions and negatives — does / doesn't", p:55, km:"he/she/it៖ <b>doesn't</b> + កិរិយាសព្ទដើម • <b>Does</b> + he/she + កិរិយាសព្ទដើម?",
   form:[["She","doesn't","work on Sundays."],["Does","he","like football?"],["What time","does she","go to bed?"]],
   ex:["Does she like her job? — Yes, she does.","He doesn't have a car.","Where does he live?"],
   more:["ពេលមាន does/doesn't — កិរិយាសព្ទត្រឡប់ទៅដើម (គ្មាន -s)។"],
   err:[["She doesn't works.","She doesn't work."],["Does he lives here?","Does he live here?"]]},
  {t:"Prepositions of time", p:59, km:"<b>at</b> + ម៉ោង • <b>on</b> + ថ្ងៃ • <b>in</b> + ពេលព្រឹក/រសៀល/ល្ងាច",
   ex:["at seven o'clock","on Monday / on Saturday evening","in the morning / in the evening"],
   more:["ពិសេស៖ at night, at the weekend ។"]}
 ],
 sections:[
  {p:51,k:"open",t:"Every day",km:"ម៉ោង ទម្លាប់ប្រចាំថ្ងៃ និង Present Simple ជាមួយ he/she។"},
  {p:52,k:"vocab",t:"What time is it?",km:"ស្តាប់ និងសរសេរម៉ោង។",g:[0],
   ph:[["What time is it?","ម៉ោងប៉ុន្មានហើយ?"],["It's nine o'clock.","ម៉ោងប្រាំបួនគត់"],["It's half past nine.","ម៉ោងប្រាំបួនកន្លះ"]]},
  {p:53,k:"grammar",t:"Grammar: Present Simple I/you — Felipe's day",km:"Felipe ជាអ្នកលក់ក្នុងផ្សារទំនើប — ស្តាប់ទម្លាប់របស់គាត់។",
   w:[["get up","ក្រោក","⏰"],["have a shower","ងូតទឹក","🚿"],["have breakfast","ញ៉ាំអាហារពេលព្រឹក","🥣"],["go to work","ទៅធ្វើការ","🚶"],["have lunch","ញ៉ាំអាហារថ្ងៃត្រង់","🍱"],["leave work","ចេញពីការងារ","🏃"],["cook dinner","ចម្អិនអាហារល្ងាច","🍳"],["watch TV","មើលទូរទស្សន៍","📺"],["go to bed","ចូលគេង","🛏️"]]},
  {p:54,k:"grammar",t:"Present Simple he/she • always/sometimes/never — Anna's day",km:"អានអំពីថ្ងៃធម្មតារបស់ Anna។",g:[1,2]},
  {p:55,k:"grammar",t:"Questions and negatives",km:"ធ្វើសំណួរ និងបដិសេធជាមួយ does / doesn't។",g:[3]},
  {p:56,k:"read",t:"Practice: Toby's day — the London dog walker",km:"អានអំពី Toby អ្នកដើរឆ្កែនៅទីក្រុងឡុងដ៍។",
   qs:["What's Toby's job?","What time does he get up?","Does he like his job?"]},
  {p:57,k:"listen",t:"Listening: Anna and Toby",km:"ស្តាប់ការសន្ទនារវាង Anna និង Toby រួចបំពេញ។"},
  {p:58,k:"vocab",t:"Vocabulary and speaking: Words that go together — Lifestyle",km:"ពាក្យដែលទៅជាមួយគ្នា និងកម្រងសំណួររបៀបរស់នៅ។",
   w:[["get up early","ក្រោកព្រឹក","🌅"],["go out","ចេញដើរលេង","🎶"],["cycle to work","ជិះកង់ទៅធ្វើការ","🚴"],["eat fruit","ញ៉ាំផ្លែឈើ","🍓"],["go to the gym","ទៅហាត់ប្រាណ","🏋️"],["stay at home","នៅផ្ទះ","🏠"],["visit friends","ទៅលេងមិត្ត","🫂"],["eat takeaway","ញ៉ាំម្ហូបខ្ចប់","🥡"]]},
  {p:59,k:"everyday",t:"Everyday English: Days of the week • Prepositions of time",km:"ថ្ងៃក្នុងសប្តាហ៍ និង at / on / in។",g:[4],
   w:[["Monday","ច័ន្ទ","🌙"],["Tuesday","អង្គារ","🔥"],["Wednesday","ពុធ","💧"],["Thursday","ព្រហស្បតិ៍","🌳"],["Friday","សុក្រ","🎉"],["Saturday","សៅរ៍","🛍️"],["Sunday","អាទិត្យ","☀️"]]},
  {p:60,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកមេរៀន។"}
 ]},
/* ============================== UNIT 7 ============================== */
7:{
 grammar:[
  {t:"Question words", p:62, km:"ពាក្យសួរនៅដើមសំណួរ។",
   form:[["What?","អ្វី","A hamburger."],["Who?","នរណា","My sister."],["Where?","ឯណា","In Paris."],["When?","ពេលណា","On Monday."],["Why?","ហេតុអ្វី","Because …"],["How?","យ៉ាងម៉េច","By taxi."],["How many?","ប៉ុន្មាន (រាប់បាន)","Three."],["How much?","ប៉ុន្មាន (តម្លៃ)","£5."],["What time?","ម៉ោងប៉ុន្មាន","At 8."]],
   ex:["Why do you like it? — Because it's delicious.","How do you get to work? — By bus.","Who is your favourite chef?"],
   more:["Why? ឆ្លើយដោយ Because … ជានិច្ច។"]},
  {t:"Pronouns — subject, object, possessive", p:63, km:"សព្វនាម៖ <b>ប្រធាន</b> (មុខកិរិយាសព្ទ) • <b>កម្មបទ</b> (ក្រោយកិរិយាសព្ទ) • <b>possessive adjective</b> (មុខនាម)។",
   form:[["I → me → my","you → you → your","he → him → his"],["she → her → her","it → it → its","we → us → our"],["they → them → their","",""]],
   ex:["I love her. She loves me.","Do you like them? — Yes, I love them!","We visit him every Sunday."],
   err:[["She loves I.","She loves me."],["I like they.","I like them."]]},
  {t:"this and that", p:64, km:"<b>this</b> = នេះ (ជិត) • <b>that</b> = នោះ (ឆ្ងាយ)។",
   ex:["This coffee is cold.","That's a beautiful jumper!","How much is this?"],
   more:["ពហុវចនៈ៖ these (ទាំងនេះ) / those (ទាំងនោះ)។","ប្រើ That's … សម្រាប់ប្រតិកម្ម៖ That's great! That's right."]}
 ],
 sections:[
  {p:61,k:"open",t:"Favourite things",km:"ពាក្យសួរ សព្វនាម this/that និងគុណនាមពិពណ៌នា។"},
  {p:62,k:"grammar",t:"Things I love! — Question words; me/him/us/them",km:"អានសំណួរ-ចម្លើយជាមួយមេចុងភៅល្បី។",g:[0],
   qs:["Where is his restaurant?","Why does he love cooking?","What's his favourite food?"]},
  {p:63,k:"grammar",t:"Pronouns",km:"subject • object • possessive",g:[1]},
  {p:64,k:"grammar",t:"this and that",km:"បង្ហាញវត្ថុជិត/ឆ្ងាយ។",g:[2],
   ph:[["What's this?","នេះជាអ្វី?"],["What's that?","នោះជាអ្វី?"],["That's lovely!","ស្អាតណាស់!"]]},
  {p:65,k:"practice",t:"Practice",km:"សួរ Why … ? ហើយឆ្លើយដោយ Because …"},
  {p:66,k:"vocab",t:"Vocabulary: Adjectives",km:"គុណនាម និងពាក្យផ្ទុយ។",
   w:[["hot ↔ cold","ក្តៅ ↔ ត្រជាក់","🔥"],["old ↔ new","ចាស់ ↔ ថ្មី","🆕"],["expensive ↔ cheap","ថ្លៃ ↔ ថោក","💰"],["big ↔ small","ធំ ↔ តូច","🐘"],["delicious","ឆ្ងាញ់","😋"],["beautiful","ស្អាត","🌺"],["horrible","អាក្រក់","😖"],["comfortable","ស្រួល","🛋️"],["quiet","ស្ងាត់","🤫"],["wonderful","អស្ចារ្យ","🌈"],["fresh","ស្រស់","🥗"],["excellent","ល្អឥតខ្ចោះ","🏅"]]},
  {p:67,k:"read",t:"Reading and writing: An email from Dubai",km:"អានអ៊ីមែលវិស្សមកាល ហើយសរសេរអ៊ីមែលរបស់អ្នក។",
   qs:["Who is the email from?","Is their holiday good?","What's the weather like?"]},
  {p:68,k:"everyday",t:"Everyday English: Can I …?",km:"ទីកន្លែងក្នុងទីក្រុង និងការស្នើសុំ។",
   w:[["post office","ប្រៃសណីយ៍","🏤"],["railway station","ស្ថានីយរថភ្លើង","🚉"],["chemist's","ឱសថស្ថាន","💊"],["clothes shop","ហាងសម្លៀកបំពាក់","👕"],["café","ហាងកាហ្វេ","☕"],["bank","ធនាគារ","🏦"]],
   ph:[["Can I have …, please?","សូមឱ្យខ្ញុំ…"],["Can I try it on?","ខ្ញុំអាចសាកពាក់បានទេ?"],["How much is it?","តម្លៃប៉ុន្មាន?"],["A return ticket, please.","សំបុត្រទៅ-មក មួយ"]]},
  {p:69,k:"speak",t:"Everyday English: Role-play in town",km:"Iveta នៅទីកន្លែងផ្សេងៗក្នុងទីក្រុង — សម្តែងការសន្ទនា។",
   ph:[["Next, please!","បន្ទាប់!"],["Large or small?","ធំឬតូច?"],["Here you are.","នេះណា"],["Thanks a lot.","អរគុណច្រើន"]]},
  {p:70,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកមេរៀន។"}
 ]},
/* ============================== UNIT 8 ============================== */
8:{
 grammar:[
  {t:"There is / There are", p:72, km:"<b>There's</b> + ឯកវចនៈ • <b>There are</b> + ពហុវចនៈ = «មាន …»។",
   form:[["There's","a sofa","in the living room."],["There are","two bedrooms","upstairs."],["There are","some pictures","on the wall."]],
   ex:["There's a big kitchen.","There are three chairs.","There's a lamp on the desk."],
   more:["There's = There is ។","មិនប្រើ have សម្រាប់ «មាន» ក្នុងទីកន្លែង៖ ✅ There's a bank. ❌ It has a bank here."],
   err:[["There is two beds.","There are two beds."]]},
  {t:"There isn't / There aren't • Questions", p:73, km:"អវិជ្ជមាន និងសំណួរ។",
   form:[["There isn't","a garden.",""],["There aren't","any books.",""],["Is there","a TV?","Yes, there is. / No, there isn't."],["Are there","any plants?","Yes, there are. / No, there aren't."],["How many … are there?","",""]],
   ex:["Is there a shower? — Yes, there is.","How many bedrooms are there? — There are two.","There aren't any pictures."]},
  {t:"Prepositions of place • some / any", p:74, km:"<b>in, on, under, next to, opposite, near</b>។ <b>some</b> ក្នុងប្រយោគវិជ្ជមាន • <b>any</b> ក្នុងសំណួរ/អវិជ្ជមាន។",
   form:[["in","ក្នុង","📦"],["on","លើ","🔝"],["under","ក្រោម","⬇️"],["next to","ជាប់/ក្បែរ","↔️"],["opposite","ទល់មុខ","🔁"]],
   ex:["The cat is under the table.","There are some books on the desk.","Are there any magazines? — No, there aren't any."],
   err:[["There are any books.","There are some books."]]}
 ],
 sections:[
  {p:71,k:"open",t:"Home sweet home",km:"បន្ទប់ គ្រឿងសង្ហារិម ទីកន្លែងក្នុងទីក្រុង និងការប្រាប់ផ្លូវ។"},
  {p:72,k:"grammar",t:"My house — Rooms and furniture • There is/are",km:"មើលរូបផ្ទះ ស្តាប់ និងនិយាយតាមឈ្មោះបន្ទប់ និងវត្ថុ។",g:[0],
   w:[["living room","បន្ទប់ទទួលភ្ញៀវ","🛋️"],["kitchen","ផ្ទះបាយ","🍳"],["bedroom","បន្ទប់គេង","🛏️"],["bathroom","បន្ទប់ទឹក","🛁"],["toilet","បង្គន់","🚽"],["study","បន្ទប់ធ្វើការ","📚"],["armchair","កៅអីមានដៃ","🪑"],["table","តុ","🍽️"],["lamp","ចង្កៀង","💡"],["fridge","ទូទឹកកក","🧊"],["cooker","ចង្ក្រាន","♨️"],["desk","តុធ្វើការ","🖥️"],["picture","រូបភាព","🖼️"],["shower","ផ្កាឈូក","🚿"]]},
  {p:73,k:"grammar",t:"There isn't / There aren't",km:"សួរ និងឆ្លើយ Is there …? / Are there …?",g:[1]},
  {p:74,k:"grammar",t:"Prepositions • some/any",km:"ប្រាប់ទីតាំងវត្ថុ។",g:[2]},
  {p:75,k:"practice",t:"Practice: Jack's flat • Two kitchens",km:"ស្តាប់ Jack និយាយជាមួយម្តាយ ហើយស្តាប់ការពិពណ៌នាផ្ទះបាយ — មួយណា?"},
  {p:76,k:"read",t:"Reading and vocabulary: Cape Town — best place in the world!",km:"អានអំពីទីក្រុង Cape Town ហើយដាក់ចំណងជើងកថាខណ្ឌ។",
   w:[["beach","ឆ្នេរ","🏖️"],["mountain","ភ្នំ","⛰️"],["vineyard","ចម្ការទំពាំងបាយជូរ","🍇"],["penguin","សត្វភេនឃ្វីន","🐧"],["campsite","កន្លែងបោះតង់","🏕️"],["fabulous","អស្ចារ្យ","🤩"],["cosmopolitan","ចម្រុះជាតិសាសន៍","🌐"]],
   qs:["Where is it?","When is a good time to go?","Where can you stay?"]},
  {p:78,k:"listen",t:"Listening and writing: My home town",km:"ស្តាប់ Ben អំពីទីក្រុងរបស់គាត់ ហើយសរសេរអំពីស្រុកកំណើតអ្នក។",
   ph:[["My home town is …","ស្រុកកំណើតខ្ញុំគឺ…"],["There's a / There are some …","មាន…"],["It's famous for …","ល្បីដោយសារ…"]]},
  {p:79,k:"everyday",t:"Everyday English: Directions",km:"ទីកន្លែងក្នុងទីក្រុង និងការប្រាប់ផ្លូវ។",
   w:[["bank","ធនាគារ","🏦"],["church","ព្រះវិហារ","⛪"],["supermarket","ផ្សារទំនើប","🛒"],["car park","ចំណតឡាន","🅿️"],["football stadium","ពហុកីឡដ្ឋាន","🏟️"],["theatre","រោងល្ខោន","🎭"],["fish and chip shop","ហាងត្រីចៀន","🐟"],["garden centre","ហាងលក់ដើមឈើ","🌿"]],
   ph:[["Excuse me! Is there a … near here?","សុំទោស! នៅជិតនេះមាន…ទេ?"],["Go straight on.","ទៅត្រង់"],["Turn left.","បត់ឆ្វេង"],["Turn right.","បត់ស្តាំ"],["It's on the left / right.","វានៅខាងឆ្វេង/ស្តាំ"],["It's next to / opposite the …","វានៅជាប់/ទល់មុខ…"]]},
  {p:80,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកមេរៀន។"}
 ]},
/* ============================== UNIT 9 ============================== */
9:{
 grammar:[
  {t:"Saying years", p:82, km:"អានឆ្នាំជាពីរផ្នែក។",
   form:[["1840","eighteen forty",""],["1996","nineteen ninety-six",""],["2000","two thousand",""],["2009","two thousand and nine",""],["2025","twenty twenty-five",""]],
   ex:["I was born in 1998.","She was born in two thousand and five."]},
  {t:"was / were born", p:82, km:"អតីតកាលនៃ <b>be</b>៖ <b>was</b> (I/he/she/it) • <b>were</b> (you/we/they)។ <b>be born</b> = កើត។",
   form:[["I / He / She / It","was","born in 1990."],["You / We / They","were","born in Phnom Penh."],["Where","were you","born?"],["When","was he","born?"]],
   ex:["Amy Winehouse was born in London.","Where were you born? — I was born in Takeo.","When was she born? — In 2001."],
   more:["ប្រើ was/were born ជានិច្ច — មិនប្រើ I born ទេ។"],
   err:[["I born in 2000.","I was born in 2000."],["Where you were born?","Where were you born?"]]},
  {t:"Present → Past: is/are → was/were • Negatives", p:84, km:"<b>wasn't</b> = was not • <b>weren't</b> = were not។",
   form:[["am / is","→","was"],["are","→","were"],["isn't","→","wasn't"],["aren't","→","weren't"]],
   ex:["Today is Monday, so yesterday was Sunday.","They weren't at school yesterday.","Was she at home? — Yes, she was."],
   more:["wasn't អានថា /ˈwɒznt/ • weren't អានថា /wɜːnt/"]},
  {t:"Past Simple — irregular verbs", p:86, km:"កិរិយាសព្ទមិនទៀងទាត់ ផ្លាស់ប្តូររាងទាំងស្រុងក្នុងអតីតកាល — ត្រូវទន្ទេញ។",
   form:[["go → went","have → had","do → did"],["see → saw","make → made","buy → bought"],["get → got","put → put","run → ran"],["sit → sat","say → said","find → found"]],
   ex:["She found the ticket in her jeans.","They went to the shop.","I had a sandwich for lunch."],
   more:["អតីតកាលដូចគ្នាសម្រាប់គ្រប់ប្រធាន៖ I went, she went, they went ។"],
   err:[["She goed home.","She went home."]]},
  {t:"have, do, go (+ noun)", p:88, km:"កិរិយាសព្ទទូទៅដែលទៅជាមួយនាម។",
   form:[["have","breakfast / a shower / a good time",""],["do","homework / the housework / exercise",""],["go","shopping / to bed / home",""]],
   ex:["I had breakfast at 7.","She did her homework.","We went shopping."]},
  {t:"Ordinal numbers & dates", p:89, km:"លេខលំដាប់៖ <b>first, second, third, fourth …</b>។ កាលបរិច្ឆេទ៖ <b>the + លេខលំដាប់ + of + ខែ</b>។",
   form:[["1st","first",""],["2nd","second",""],["3rd","third",""],["4th","fourth",""],["5th","fifth",""],["20th","twentieth",""],["21st","twenty-first",""],["31st","thirty-first",""]],
   ex:["When's your birthday? — It's on the third of March.","My birthday is on 14th April."],
   more:["សរសេរ 3 March / 3rd March • អានថា the third of March ។"]}
 ],
 sections:[
  {p:81,k:"open",t:"Past times",km:"ឆ្នាំ was/were born អតីតកាល និងថ្ងៃខែ។"},
  {p:82,k:"grammar",t:"When was he born? — Saying years • was/were born",km:"និយាយឆ្នាំ ហើយសួរពេលកើត។",g:[0,1]},
  {p:83,k:"grammar",t:"Present and Past — Rolf's family",km:"ស្តាប់ Rolf Ackman និយាយអំពីគ្រួសាររបស់គាត់។",
   ph:[["Who's Susan?","Susan ជានរណា?"],["She's Rolf's sister.","គាត់ជាប្អូនស្រីរបស់ Rolf"],["Where was he born?","គាត់កើតនៅឯណា?"]]},
  {p:84,k:"practice",t:"Practice • Negatives and pronunciation",km:"សួរ-ឆ្លើយអំពីមនុស្សល្បី និង wasn't / weren't។",g:[2]},
  {p:85,k:"practice",t:"Today and yesterday",km:"Today is … Yesterday was …",
   ph:[["Today is …","ថ្ងៃនេះគឺ…"],["Yesterday was …","ម្សិលមិញគឺ…"],["Were they at school yesterday morning?","ពួកគេនៅសាលាម្សិលមិញព្រឹកទេ?"]]},
  {p:86,k:"read",t:"Reading and speaking: Past Simple — irregular verbs • The Lottery Ticket",km:"អានរឿងសំបុត្រឆ្នោត — Oh no! What bad luck!",g:[3],
   qs:["Who bought the ticket?","Where was the ticket?","Was it good luck or bad luck?"]},
  {p:88,k:"vocab",t:"Vocabulary: Common verbs (2) — have, do, go",km:"ផ្គូផ្គងកិរិយាសព្ទជាមួយនាម។",g:[4],
   w:[["have breakfast","ញ៉ាំអាហារពេលព្រឹក","🥐"],["have a shower","ងូតទឹក","🚿"],["do homework","ធ្វើកិច្ចការផ្ទះ","📝"],["do the housework","ធ្វើការងារផ្ទះ","🧹"],["go shopping","ទៅទិញឥវ៉ាន់","🛍️"],["go to bed","ចូលគេង","🛏️"],["go home","ទៅផ្ទះ","🏠"],["have a good time","សប្បាយ","🥳"]]},
  {p:89,k:"everyday",t:"Everyday English: When's your birthday?",km:"ខែ លេខលំដាប់ និងថ្ងៃកំណើត។",g:[5],
   w:[["January","មករា","❄️"],["February","កុម្ភៈ","💝"],["March","មីនា","🌱"],["April","មេសា","🎆"],["May","ឧសភា","🌼"],["June","មិថុនា","🌦️"],["July","កក្កដា","☀️"],["August","សីហា","🏖️"],["September","កញ្ញា","🍂"],["October","តុលា","🎃"],["November","វិច្ឆិកា","🍁"],["December","ធ្នូ","🎄"]]},
  {p:90,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកមេរៀន។"}
 ]},
/* ============================== UNIT 10 ============================== */
10:{
 grammar:[
  {t:"Past Simple — regular and irregular verbs", p:92, km:"កិរិយាសព្ទ<b>ទៀងទាត់</b>ថែម <b>-ed</b>។ កិរិយាសព្ទ<b>មិនទៀងទាត់</b>ប្តូររាង។",
   form:[["play → played","watch → watched","cook → cooked"],["stay → stayed","study → studied","stop → stopped"],["go → went","see → saw","eat → ate"]],
   ex:["I played tennis on Sunday.","We stayed at home.","She went to the cinema."],
   more:["-ed អានបាន ៣៖ /t/ cooked • /d/ played • /ɪd/ visited, wanted ។","consonant + y → ied: study → studied ។"],
   err:[["I play football yesterday.","I played football yesterday."]]},
  {t:"Questions and negatives — did / didn't", p:93, km:"សួរ៖ <b>Did</b> + ប្រធាន + កិរិយាសព្ទ<b>ដើម</b>? • បដិសេធ៖ <b>didn't</b> + កិរិយាសព្ទដើម។",
   form:[["Did","you","go out last night?"],["What","did you","do?"],["I / She / They","didn't","go shopping."]],
   ex:["Did you have a good weekend? — Yes, I did.","What did she do on Saturday?","He didn't watch TV."],
   more:["ពេលមាន did/didn't — កិរិយាសព្ទត្រឡប់ទៅដើមវិញ (go មិនមែន went)។"],
   err:[["Did you went?","Did you go?"],["I didn't saw him.","I didn't see him."]]},
  {t:"Time expressions", p:94, km:"ពាក្យបង្ហាញពេលអតីតកាល។",
   form:[["last","night / week / Saturday / year",""],["yesterday","morning / afternoon / evening",""],["in","2019 / the summer",""],["at","the weekend",""]],
   ex:["I saw her last Monday.","We went to Kep in 2023.","What did you do yesterday evening?"],
   err:[["in last week","last week"],["yesterday night","last night"]]},
  {t:"ago", p:98, km:"<b>ago</b> = មុន (រាប់ថយក្រោយពីឥឡូវ) — ដាក់<b>ក្រោយ</b>រយៈពេល។",
   ex:["two days ago","three years ago","I started school ten years ago."],
   err:[["ago two days","two days ago"],["before two years","two years ago"]]}
 ],
 sections:[
  {p:91,k:"open",t:"We had a good time!",km:"សកម្មភាពចុងសប្តាហ៍ កីឡា និងវិស្សមកាល — អតីតកាល។"},
  {p:92,k:"grammar",t:"Yesterday was Sunday — Past Simple regular and irregular verbs",km:"ស្តាប់ Kristin ហើយធីកអ្វីដែលគាត់បានធ្វើម្សិលមិញ។",g:[0],
   w:[["went shopping","បានទៅទិញឥវ៉ាន់","🛍️"],["cooked a meal","បានចម្អិនម្ហូប","🍲"],["watched a film","បានមើលភាពយន្ត","🎬"],["played tennis","បានលេងតែនីស","🎾"],["cleaned the car","បានលាងឡាន","🚗"],["visited friends","បានទៅលេងមិត្ត","🫂"],["stayed at home","បាននៅផ្ទះ","🏠"]]},
  {p:93,k:"grammar",t:"Past Simple questions and negatives — Monday morning",km:"Kristin និង Dave នៅកន្លែងធ្វើការថ្ងៃច័ន្ទ។",g:[1]},
  {p:94,k:"practice",t:"Practice • Time expressions",km:"ពាក្យពេលវេលា last / yesterday / ago។",g:[2]},
  {p:95,k:"speak",t:"Speaking: Making conversation",km:"បន្តការសន្ទនាដោយសួរសំណួរបន្ថែម។",
   ph:[["What did you do at the weekend?","អ្នកបានធ្វើអ្វីនៅចុងសប្តាហ៍?"],["Oh, really? Where?","ពិតមែន? នៅឯណា?"],["Did you have a good time?","សប្បាយទេ?"],["That sounds great!","ស្តាប់ទៅល្អណាស់!"]]},
  {p:96,k:"vocab",t:"Vocabulary and speaking: Sport and leisure",km:"កីឡា និងសកម្មភាពកម្សាន្ត។",
   w:[["rugby","រ៉ាកប៊ី","🏉"],["sailing","បើកទូកក្តោង","⛵"],["skiing","ជិះស្គី","⛷️"],["tennis","តែនីស","🎾"],["ice-skating","រអិលលើទឹកកក","⛸️"],["canoeing","អុំទូក","🛶"],["cycling","ជិះកង់","🚴"],["cards","បៀ","🃏"],["golf","វាយកូនហ្គោល","⛳"],["running","រត់","🏃"],["walking","ដើរ","🚶"],["swimming","ហែលទឹក","🏊"],["fishing","ស្ទូចត្រី","🎣"],["camping","បោះតង់","🏕️"]],
   ph:[["go + -ing","go swimming, go cycling"],["play + ball games","play tennis, play golf"]]},
  {p:97,k:"listen",t:"Listening and speaking: Gary and Cathy's holidays",km:"ស្តាប់ Gary និង Cathy និយាយអំពីវិស្សមកាល។",
   qs:["Where do they usually go on holiday?","Where did they go last year?","Did they have a good time?"]},
  {p:98,k:"write",t:"Speaking and writing: My last holiday • ago",km:"សរសេរអំពីវិស្សមកាលចុងក្រោយរបស់អ្នក។",g:[3],
   ph:[["Last …, I went to …","កាលពី… ខ្ញុំបានទៅ…"],["I went with …","ខ្ញុំទៅជាមួយ…"],["We stayed in …","យើងស្នាក់នៅ…"],["Every day we …","រាល់ថ្ងៃយើង…"],["The food was … / The weather was …","ម្ហូប… / អាកាសធាតុ…"]]},
  {p:99,k:"everyday",t:"Everyday English: Going sightseeing",km:"នៅការិយាល័យទេសចរណ៍ — Roleplay។",
   w:[["tourist office","ការិយាល័យទេសចរណ៍","ℹ️"],["museum","សារមន្ទីរ","🏛️"],["castle","ប្រាសាទ","🏰"],["tour","ដំណើរទស្សនា","🚌"],["map","ផែនទី","🗺️"]],
   ph:[["Can I help you?","តើខ្ញុំអាចជួយអ្វី?"],["What time does it open?","បើកម៉ោងប៉ុន្មាន?"],["How much is a ticket?","សំបុត្រតម្លៃប៉ុន្មាន?"],["Do you have a map?","មានផែនទីទេ?"]]},
  {p:100,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកមេរៀន។"}
 ]},
/* ============================== UNIT 11 ============================== */
11:{
 grammar:[
  {t:"can / can't", p:102, km:"<b>can</b> + កិរិយាសព្ទដើម = អាច (សមត្ថភាព)។ ដូចគ្នាសម្រាប់គ្រប់ប្រធាន។",
   form:[["I / You / He / She / We / They","can","swim."],["I / You / He / She / We / They","can't","drive."]],
   ex:["She can speak four languages.","I can't cook.","They can play the guitar."],
   more:["can អានខ្សោយ /kən/ • can't អានខ្លាំង /kɑːnt/ — ស្តាប់ឱ្យល្អ!","គ្មាន -s ទេ៖ ✅ He can ❌ He cans"],
   err:[["He can swims.","He can swim."],["I can to drive.","I can drive."]]},
  {t:"Questions and negatives with can", p:103, km:"<b>Can</b> + ប្រធាន + កិរិយាសព្ទ? ចម្លើយ៖ <b>Yes, I can.</b> / <b>No, I can't.</b> មិនប្រើ do!",
   form:[["Can","you","cook?"],["What","can you","do?"]],
   ex:["Can you swim? — Yes, I can.","Can he drive? — No, he can't.","What languages can you speak?"],
   err:[["Do you can swim?","Can you swim?"]]},
  {t:"Adverbs", p:104, km:"Adverb ពិពណ៌នា <b>របៀប</b>ធ្វើ។ adjective + <b>-ly</b>។",
   form:[["slow → slowly","careful → carefully","beautiful → beautifully"],["quick → quickly","bad → badly","fluent → fluently"],["fast → fast","hard → hard","good → well ⚠️"]],
   ex:["He drives his car fast.","She sings beautifully.","I speak English well."],
   more:["Adverb ដាក់ក្រោយកិរិយាសព្ទ + កម្មបទ៖ He drives his car fast ។"],
   err:[["He drives fast his car.","He drives his car fast."],["You speak very good.","You speak very well."]]},
  {t:"Requests and offers", p:105, km:"សំណើ៖ <b>Can you …?</b> (សុំឱ្យគេធ្វើ) • ផ្តល់ជូន៖ <b>Can I …?</b> (ខ្ញុំជួយ)។",
   ex:["Can you help me, please? — Of course.","Can I carry your bag? — Thank you!","Can you open the window, please?"],
   more:["ឆ្លើយ៖ Sure. / Of course. / Sorry, I can't."]}
 ],
 sections:[
  {p:101,k:"open",t:"We can do it!",km:"សមត្ថភាព can/can't, adverbs និងសំណើ។"},
  {p:102,k:"grammar",t:"What can they do? — can/can't",km:"ស្តាប់ និងនិយាយអំពីអ្វីដែលមនុស្សអាចធ្វើបាន។",g:[0],
   w:[["swim","ហែលទឹក","🏊"],["drive","បើកឡាន","🚗"],["cook","ចម្អិនម្ហូប","🧑‍🍳"],["draw","គូររូប","🎨"],["sing","ច្រៀង","🎤"],["dance","រាំ","💃"],["ski","ជិះស្គី","⛷️"],["play the guitar","លេងហ្គីតា","🎸"],["speak Spanish","និយាយភាសាអេស្ប៉ាញ","🗣️"],["ride a horse","ជិះសេះ","🏇"]]},
  {p:103,k:"grammar",t:"Questions and negatives — Lucy and her grandad",km:"អាន និងស្តាប់ Lucy និងជីតារបស់នាង។",g:[1]},
  {p:104,k:"grammar",t:"Practice • Adverbs — Bobby Boyd",km:"Bobby Boyd ជាជនជាតិអៀរឡង់រស់នៅលីសបោន — ស្តាប់ can ឬ can't។",g:[2]},
  {p:105,k:"grammar",t:"Requests and offers",km:"សុំជំនួយ និងផ្តល់ជំនួយ។",g:[3]},
  {p:106,k:"read",t:"Reading and speaking: The smartphone",km:"អានអំពីប្រវត្តិ និងអ្វីដែលស្មាតហ្វូនអាចធ្វើបាន។",
   w:[["send emails","ផ្ញើអ៊ីមែល","📧"],["take photos","ថតរូប","📸"],["watch videos","មើលវីដេអូ","▶️"],["play games","លេងហ្គេម","🎮"],["share","ចែករំលែក","🔗"],["text","ផ្ញើសារ","💬"]],
   qs:["What can you do on a smartphone?","Can you live without it?"]},
  {p:107,k:"listen",t:"Listening and speaking: What do you do on your smartphone?",km:"ស្តាប់មនុស្ស៣នាក់ ហើយនិយាយអំពីស្មាតហ្វូនរបស់អ្នក។"},
  {p:108,k:"vocab",t:"Vocabulary and speaking: Verb + noun • Adjective + noun (2) • Opposite adjectives",km:"ពាក្យផ្សំ និងគុណនាមផ្ទុយ។",
   w:[["cold ↔ hot","ត្រជាក់ ↔ ក្តៅ","🌡️"],["wet ↔ dry","សើម ↔ ស្ងួត","💧"],["fast ↔ slow","លឿន ↔ យឺត","🐇"],["easy ↔ difficult","ងាយ ↔ ពិបាក","🧩"],["boring ↔ interesting","ធុញ ↔ គួរចាប់អារម្មណ៍","📚"],["dangerous ↔ safe","គ្រោះថ្នាក់ ↔ សុវត្ថិភាព","⚠️"],["popular","ពេញនិយម","🔥"],["kind","ចិត្តល្អ","🤗"]]},
  {p:109,k:"everyday",t:"Everyday English: Everyday problems",km:"បញ្ហាប្រចាំថ្ងៃ និងការផ្តល់ដំណោះស្រាយ។",
   ph:[["What's the matter?","មានបញ្ហាអ្វី?"],["I can't find my keys.","ខ្ញុំរកកូនសោមិនឃើញ"],["The lift doesn't work.","ជណ្តើរយន្តខូច"],["I don't feel well.","ខ្ញុំមិនស្រួលខ្លួន"],["Don't worry.","កុំបារម្ភ"],["Can I help?","ឱ្យខ្ញុំជួយទេ?"]]},
  {p:110,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកមេរៀន។"}
 ]},
/* ============================== UNIT 12 ============================== */
12:{
 grammar:[
  {t:"would like / I'd like / I'd like to", p:112, km:"<b>I'd like</b> + នាម • <b>I'd like to</b> + កិរិយាសព្ទ = ខ្ញុំចង់ (គួរសម)។",
   form:[["I'd like","a coffee.","(+ noun)"],["I'd like to","buy some bread.","(+ verb)"],["Would you like","a drink?","Yes, please. / No, thank you."],["Would you like to","go out?","Yes, I'd love to."]],
   ex:["I'd like some apples, please.","I'd like to go to the market.","Would you like a sandwich?"],
   more:["I'd = I would ។ គួរសមជាង I want ។"],
   err:[["I'd like go home.","I'd like to go home."]]},
  {t:"some and any", p:112, km:"<b>some</b> ក្នុងប្រយោគវិជ្ជមាន និងសំណើ/ការផ្តល់ • <b>any</b> ក្នុងសំណួរ និងអវិជ្ជមាន។",
   form:[["+","I'd like some cheese.",""],["?","Do you have any eggs?",""],["−","There isn't any milk.",""],["offer","Would you like some tea?",""]],
   ex:["I'd like some tomatoes.","Do you have any bread?","We don't have any rice."]},
  {t:"like and would like", p:115, km:"<b>like</b> = ចូលចិត្ត (ជាទូទៅ ជានិច្ច) • <b>would like</b> = ចង់បាន (ពេលនេះ)។",
   form:[["Do you like coffee?","= ជាទូទៅ",""],["Would you like a coffee?","= ឥឡូវនេះ",""]],
   ex:["I like swimming. (ជានិច្ច)","I'd like to swim now. (ឥឡូវ)","Do you like tea? — Yes, I do.","Would you like some tea? — Yes, please."],
   err:[["Would you like tea? — Yes, I would like.","Yes, please."]]}
 ],
 sections:[
  {p:111,k:"open",t:"Thank you very much!",km:"ផ្សារ ហាងកាហ្វេ ការកុម្ម៉ង់ និង would like។"},
  {p:112,k:"grammar",t:"At the market — I'd like / I'd like to; some/any",km:"Harry នៅផ្សារ — ស្តាប់ និងបំពេញ។",g:[0,1],
   w:[["apples","ផ្លែប៉ោម","🍎"],["bananas","ចេក","🍌"],["potatoes","ដំឡូងបារាំង","🥔"],["tomatoes","ប៉េងប៉ោះ","🍅"],["cabbage","ស្ពៃក្តោប","🥬"],["eggs","ពងមាន់","🥚"],["cheese","ឈីស","🧀"],["bread","នំប៉័ង","🥖"],["a kilo of","មួយគីឡូ","⚖️"],["a bottle of","មួយដប","🍾"]]},
  {p:113,k:"speak",t:"Role-play: Harry is still shopping",km:"សម្តែងទិញឥវ៉ាន់នៅផ្សារ។",
   ph:[["Can I help you?","ត្រូវការអ្វីដែរ?"],["I'd like a kilo of tomatoes, please.","សុំប៉េងប៉ោះមួយគីឡូ"],["Anything else?","ត្រូវការអ្វីទៀតទេ?"],["That's all, thanks.","ប៉ុណ្ណឹងហើយ អរគុណ"],["How much is that?","សរុបប៉ុន្មាន?"]]},
  {p:114,k:"practice",t:"Practice: Birthday wishes",km:"តើពួកគេចង់បានអ្វីសម្រាប់ថ្ងៃកំណើត?",
   ph:[["What would you like for your birthday?","អ្នកចង់បានអ្វីសម្រាប់ថ្ងៃកំណើត?"],["I'd like a new phone.","ខ្ញុំចង់បានទូរស័ព្ទថ្មី"],["Happy birthday!","រីករាយថ្ងៃកំណើត!"]]},
  {p:115,k:"grammar",t:"like and would like • Listening and pronunciation",km:"ស្តាប់ការសន្ទនាពីរ — មួយណា like, មួយណា would like?",g:[2]},
  {p:116,k:"read",t:"Reading and speaking: Meal times around the world",km:"មនុស្ស៣នាក់ពីប្រទេសផ្សេងគ្នា និយាយអំពីអាហារប្រចាំថ្ងៃ។",
   w:[["breakfast","អាហារពេលព្រឹក","🍳"],["lunch","អាហារថ្ងៃត្រង់","🥪"],["dinner","អាហារពេលល្ងាច","🍽️"],["snack","អាហារសម្រន់","🍪"],["soup","ស៊ុប","🍜"],["rice","បាយ","🍚"],["meat","សាច់","🥩"],["dessert","បង្អែម","🍰"]],
   qs:["What do they have for breakfast?","What time do they have dinner?","What do you eat every day?"]},
  {p:118,k:"vocab",t:"Vocabulary and speaking: In a café",km:"មើលម៉ឺនុយ ហើយកុម្ម៉ង់ — Role-play។",
   w:[["soup of the day","ស៊ុបប្រចាំថ្ងៃ","🥣"],["spaghetti","មីស្ប៉ាហ្គេទី","🍝"],["sandwich","សាំងវិច","🥪"],["salad","សាឡាដ","🥗"],["chocolate cake","នំខេកសូកូឡា","🍰"],["ice cream","ការ៉េម","🍨"],["mineral water","ទឹកសុទ្ធ","💧"],["orange juice","ទឹកក្រូច","🧃"]],
   ph:[["Can I have the menu, please?","សុំម៉ឺនុយ"],["I'd like the soup, please.","ខ្ញុំយកស៊ុប"],["Still or sparkling?","ទឹកធម្មតា ឬមានហ្គាស?"],["Can I have the bill, please?","សុំគិតលុយ"]]},
  {p:119,k:"everyday",t:"Everyday English: Signs all around",km:"ស្លាកសញ្ញាដែលឃើញជុំវិញខ្លួន។",
   w:[["PUSH","រុញ","👐"],["PULL","ទាញ","🫳"],["EXIT","ច្រកចេញ","🚪"],["ENTRANCE","ច្រកចូល","➡️"],["OUT OF ORDER","ខូច","🚫"],["SALE","បញ្ចុះតម្លៃ","🏷️"],["PRIVATE","ឯកជន","🔒"],["RESERVED","កក់ទុក","📌"],["NO ENTRY","ហាមចូល","⛔"],["LADIES / GENTS","បន្ទប់ទឹកស្ត្រី/បុរស","🚻"]]},
  {p:120,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកមេរៀន។"}
 ]},
/* ============================== UNIT 13 ============================== */
13:{
 grammar:[
  {t:"Present Continuous", p:123, km:"<b>am / is / are + verb-ing</b> = កំពុង … (សកម្មភាពកើតឡើងឥឡូវនេះ)។",
   form:[["I","'m","working."],["He / She / It","'s","raining."],["You / We / They","'re","playing."],["Am / Is / Are","… -ing?",""]],
   ex:["She's wearing a red dress.","It's raining.","What are you doing? — I'm reading."],
   more:["ច្បាប់ -ing៖ make → making (ដក e) • swim → swimming (ទ្វេ m) • play → playing ។","ពាក្យសម្គាល់៖ now, at the moment, Look!, Listen!"],
   err:[["She wearing jeans.","She's wearing jeans."],["I'm swiming.","I'm swimming."]]},
  {t:"Present Simple and Present Continuous", p:124, km:"<b>Simple</b> = ទម្លាប់ ការពិត (every day, usually) • <b>Continuous</b> = ឥឡូវនេះ ឬសកម្មភាពបណ្តោះអាសន្ន (now, today)។",
   form:[["Present Simple","He works in a bank.","រាល់ថ្ងៃ"],["Present Continuous","He's relaxing by the pool.","ឥឡូវ / ថ្ងៃនេះ"]],
   ex:["Carl usually wears a suit, but today he's wearing shorts.","She speaks French. She's speaking French now.","Hans comes from Germany."],
   more:["កិរិយាសព្ទខ្លះមិនប្រើ -ing: like, love, want, know, understand ។"],
   err:[["I'm liking pizza.","I like pizza."]]}
 ],
 sections:[
  {p:121,k:"open",t:"What's happening now?",km:"ពណ៌ សម្លៀកបំពាក់ និង Present Continuous។"},
  {p:122,k:"vocab",t:"What colour is it? — Colours • Clothes",km:"ពណ៌ និងសម្លៀកបំពាក់។",
   w:[["red","ក្រហម","🔴"],["blue","ខៀវ","🔵"],["green","បៃតង","🟢"],["yellow","លឿង","🟡"],["black","ខ្មៅ","⚫"],["white","ស","⚪"],["brown","ត្នោត","🟤"],["orange","ទឹកក្រូច","🟠"],["purple","ស្វាយ","🟣"],["T-shirt","អាវយឺត","👕"],["jeans","ខោខូវប៊យ","👖"],["dress","រ៉ូប","👗"],["shoes","ស្បែកជើង","👟"],["jacket","អាវក្រៅ","🧥"],["hat","មួក","🧢"],["shorts","ខោខ្លី","🩳"]]},
  {p:123,k:"grammar",t:"Grammar: Present Continuous",km:"តើពួកគេកំពុងពាក់អ្វី? កំពុងធ្វើអ្វី?",g:[0]},
  {p:124,k:"grammar",t:"Practice • Present Simple and Present Continuous — Carl at work",km:"Carl នៅកន្លែងធ្វើការ ធៀបនឹងពេលវិស្សមកាល។",g:[1],
   ph:[["What's he doing?","គាត់កំពុងធ្វើអ្វី?"],["He's cooking.","គាត់កំពុងចម្អិន"]]},
  {p:125,k:"listen",t:"Carl on holiday in Spain",km:"ស្តាប់ Carl និងគ្រួសារនៅប្រទេសអេស្ប៉ាញ។",
   qs:["Where are they?","What is Carl doing today?","What is the weather like?"]},
  {p:126,k:"read",t:"Practice • Reading and speaking: Today's different!",km:"មនុស្ស៤នាក់ — ធម្មតាពួកគេធ្វើអ្វី ប៉ុន្តែថ្ងៃនេះកំពុងធ្វើអ្វី?",
   qs:["What does Mark usually do?","What is he doing today?","Why is today different?"]},
  {p:128,k:"vocab",t:"Vocabulary and listening: Opposite verbs",km:"កិរិយាសព្ទផ្ទុយគ្នា។",
   w:[["open ↔ close","បើក ↔ បិទ","🚪"],["start ↔ finish","ចាប់ផ្តើម ↔ បញ្ចប់","🏁"],["win ↔ lose","ឈ្នះ ↔ ចាញ់","🏆"],["remember ↔ forget","ចាំ ↔ ភ្លេច","🧠"],["turn on ↔ turn off","បើក ↔ បិទ (ភ្លើង)","💡"],["put on ↔ take off","ពាក់ ↔ ដោះ","🧤"],["buy ↔ sell","ទិញ ↔ លក់","💳"],["come ↔ go","មក ↔ ទៅ","↔️"]]},
  {p:129,k:"everyday",t:"Everyday English: What's the matter?",km:"អារម្មណ៍ និងបញ្ហាសុខភាព — Role-play។",
   w:[["tired","ហត់","😴"],["hungry","ឃ្លាន","🍽️"],["thirsty","ស្រេកទឹក","🥤"],["bored","ធុញ","🥱"],["angry","ខឹង","😠"],["worried","បារម្ភ","😟"],["cold","រងា","🥶"],["hot","ក្តៅ","🥵"]],
   ph:[["What's the matter?","មានបញ្ហាអ្វី?"],["I'm tired.","ខ្ញុំហត់"],["I have a headache.","ខ្ញុំឈឺក្បាល"],["Why don't you go to bed?","ហេតុអ្វីមិនចូលគេង?"],["Good idea!","គំនិតល្អ!"]]},
  {p:130,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកមេរៀន។"}
 ]},
/* ============================== UNIT 14 ============================== */
14:{
 grammar:[
  {t:"Future plans — going to", p:132, km:"<b>am / is / are + going to + កិរិយាសព្ទដើម</b> = គម្រោងនាពេលអនាគត។",
   form:[["I","'m going to","travel."],["He / She","'s going to","study medicine."],["We / They","'re going to","visit Morocco."],["Are you","going to","…?"]],
   ex:["I'm going to buy a new phone.","They're going to drive across Africa.","What are you going to do next year?"],
   more:["going to go → និយាយខ្លី going to ក៏បាន៖ I'm going to Kep."],
   err:[["I going to study.","I'm going to study."],["She's going to visits.","She's going to visit."]]},
  {t:"Present Continuous for future", p:132, km:"Present Continuous ក៏ប្រើសម្រាប់<b>គម្រោងដែលបានរៀបចំរួច</b> (មានពេល/ទីកន្លែងច្បាស់)។",
   ex:["We're flying to Bangkok on Sunday.","She's leaving next week.","What are you doing tonight?"],
   more:["ពាក្យសម្គាល់៖ tonight, tomorrow, next week, on Saturday ។"]},
  {t:"Grammar revision", p:138, km:"រំលឹកកាលទាំងអស់ដែលបានរៀន។",
   form:[["Present Simple","I live in Phnom Penh.","ទម្លាប់/ការពិត"],["Present Continuous","I'm studying English now.","ឥឡូវ"],["Past Simple","I was born in 2005. I went to …","អតីតកាល"],["can","I can swim.","សមត្ថភាព"],["going to","I'm going to travel.","គម្រោង"]],
   ex:["Where do you live?","What are you doing?","Where did you go?","What are you going to do?"]}
 ],
 sections:[
  {p:131,k:"open",t:"Let's go!",km:"មធ្យោបាយធ្វើដំណើរ គម្រោងអនាគត និងរំលឹកមេរៀនទាំងអស់។"},
  {p:132,k:"grammar",t:"Ready, steady, go! — Future plans: going to • Present Continuous",km:"ប្រទេស៧ ក្នុង៧ថ្ងៃ — គម្រោងធ្វើដំណើររបស់ Stewart និង Geoff។",g:[0,1],
   w:[["car","ឡាន","🚗"],["plane","យន្តហោះ","✈️"],["train","រថភ្លើង","🚆"],["boat","ទូក","⛴️"],["bus","ឡានក្រុង","🚌"],["motorbike","ម៉ូតូ","🏍️"],["bike","កង់","🚲"],["taxi","តាក់ស៊ី","🚕"],["on foot","ដើរ","🚶"]],
   ph:[["by car / by plane / by train","ដោយឡាន / យន្តហោះ / រថភ្លើង"],["on foot","ដោយថ្មើរជើង"]]},
  {p:134,k:"practice",t:"Practice: Evie's plans",km:"ស្តាប់ Evie និយាយអំពីគម្រោងវិស្សមកាល ហើយបំពេញ។"},
  {p:135,k:"vocab",t:"Vocabulary revision: Words that go together",km:"រំលឹកវាក្យសព្ទ — ពាក្យដែលទៅជាមួយគ្នា។",
   w:[["play cards","លេងបៀ","🃏"],["catch a train","ជិះរថភ្លើង","🚆"],["go to the airport","ទៅព្រលានយន្តហោះ","🛫"],["read a newspaper","អានកាសែត","📰"],["go sunbathing","ហាលថ្ងៃ","🏖️"],["work in a hospital","ធ្វើការនៅមន្ទីរពេទ្យ","🏥"]]},
  {p:136,k:"read",t:"Reading and speaking: My past, present and future — Life's big events",km:"មនុស្ស៣នាក់និយាយអំពីគ្រួសារ ការសិក្សា ការងារ និងក្តីស្រមៃ។",
   w:[["university","សាកលវិទ្យាល័យ","🎓"],["medicine","វេជ្ជសាស្ត្រ","🩺"],["journalist","អ្នកកាសែត","📰"],["get married","រៀបការ","💒"],["research","ស្រាវជ្រាវ","🔬"],["future","អនាគត","🔮"]],
   qs:["Where was she born?","What is she doing now?","What is she going to do in the future?"]},
  {p:138,k:"grammar",t:"Grammar revision",km:"រំលឹក៖ Present Simple • Present Continuous • Past Simple • can • going to",g:[2]},
  {p:139,k:"everyday",t:"Everyday English: Social expressions (2)",km:"ឃ្លាសង្គមសម្រាប់ស្ថានភាពផ្សេងៗ។",
   ph:[["Have a good weekend! — Same to you!","ចុងសប្តាហ៍រីករាយ! — ដូចគ្នាដែរ!"],["Congratulations!","អបអរសាទរ!"],["Good luck!","សូមសំណាងល្អ!"],["Never mind. / Don't worry.","មិនអីទេ / កុំបារម្ភ"],["What a pity!","គួរឱ្យស្តាយ!"],["Excuse me, can I get past?","សុំទោស ខ្ញុំសុំផ្លូវ"],["Have a safe journey!","ធ្វើដំណើរប្រកបដោយសុវត្ថិភាព!"]]},
  {p:140,k:"review",t:"Grammar reference & Wordlist",km:"រំលឹកមេរៀនទាំងមូល — អបអរសាទរ! អ្នកបានបញ្ចប់ Beginner! 🎉"}
 ]}
};

// ---- merge: grammar ↔ UNITS, add section words to unit vocab ----
(function(){
  (window.UNITS||[]).forEach(u=>{
    const L = window.LESSONS[u.n]; if(!L) return;
    u.grammar = L.grammar;
    u.emoji = u.emoji || {};
    L.sections.forEach(s=>(s.w||[]).forEach(w=>{
      const key = w[0].replace(/^(a|an) /,'').toLowerCase();
      u.emoji[key] = w[2]; u.emoji[w[0].toLowerCase()] = w[2];
      // section words are teaching aids only — the unit vocabulary comes from the book Wordlist (wordlist.js)
    }));
  });
})();
