# 📚 Beginner English Studio — Website

កម្មវិធីរៀន និងបង្រៀនភាសាអង់គ្លេស (Headway 5th ed. Beginner) • មេរៀន ស្លាយ វេយ្យាករណ៍ Wordlist លំហាត់ ប្រឡង ថ្នាក់រៀន ប័ណ្ណសរសើរ និងគណនី Admin / គ្រូ / សិស្ស។

> ⚠️ Website នេះ **មិនមាន** រូបទំព័រសៀវភៅ ឬសំឡេង Headway ទេ (សម្ភារៈរក្សាសិទ្ធិ Oxford)។
> គ្រូអាចចុច **📂 ឯកសារ** ដើម្បីភ្ជាប់ Folder សៀវភៅ/សំឡេង ពីកុំព្យូទ័រខ្លួនឯង — ឯកសារមិនត្រូវបាន Upload ទេ។

## ☁️ ភ្ជាប់ Firebase (ធ្វើម្តងគត់ ដោយ Admin)
1. ចូល https://console.firebase.google.com → **Add project** (បិទ Google Analytics ក៏បាន)
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable**
3. **Build → Firestore Database → Create database** → ជ្រើសទីតាំង `asia-southeast1` (Singapore) → **Production mode**
4. Firestore → **Rules** → បិទភ្ជាប់ខ្លឹមសារ `firestore.rules` → **Publish**
5. **Project settings (⚙️) → Your apps → Web (</>)** → ដាក់ឈ្មោះ → ចម្លង `firebaseConfig`
6. បើក Website → **🛡️ Admin៖ ភ្ជាប់ Firebase** → បិទភ្ជាប់ config → បង្កើតគណនី Admin
7. 🛡️ Admin → 💾 ទិន្នន័យ → ផ្ញើ **តំណចូលថ្នាក់ / QR** ឱ្យគ្រូ និងសិស្ស

## 🔁 ផ្ទេរទិន្នន័យពីកម្មវិធីក្នុងកុំព្យូទ័រ
កម្មវិធីក្នុងកុំព្យូទ័រ → 🛡️ Admin → 💾 ទិន្នន័យ → ⬇ Backup ទាំងអស់ → នៅលើ Website → ⬆ Restore ទាំងអស់

## 🔐 សុវត្ថិភាព
គណនីការពារកម្រិតថ្នាក់រៀន។ អ្នកណាមានតំណចូលថ្នាក់ អាចមើលទិន្នន័យថ្នាក់បាន — កុំផ្សព្វផ្សាយជាសាធារណៈ។

Font: Kantumruy Pro (SIL OFL) • QR: qrcode-generator (MIT, Kazuhiko Arase)
