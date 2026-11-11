# Produk Medivue

> Dokumen ini merefleksikan **produk yang benar-benar ada di repository saat ini**.
> Untuk detail teknis, lihat `docs/architecture.md`; untuk visual dan komponen, lihat `docs/design-system.md`.

---

## 1. Ringkasan produk

**Medivue** adalah pendamping triase kesehatan berbasis AI yang membantu pengguna menjawab satu pertanyaan praktis:

> **"Saya harus ngapain sekarang, dan seberapa cepat?"**

Medivue **tidak mendiagnosis penyakit**. Produk memetakan keluhan ke salah satu dari empat tingkat urgensi, menjelaskan alasannya dengan bahasa yang menenangkan, lalu memberi langkah konkret, dukungan menenangkan, dan ringkasan siap dibawa ke dokter.

- **Tagline:** *Pahami keluhan. Tentukan langkah.*
- **Kategori:** AI health triage companion / pendamping keputusan awal.
- **Bahasa produk:** Indonesia, dengan nada santai dan empatik.
- **Model akses:** guest-first (tanpa akun), akun opsional untuk kerapian riwayat.

---

## 2. Masalah yang diselesaikan

### Masalah utama

Pengguna dengan keluhan ringan sering mengalami **cyberchondria**: mencari gejala di internet, menemukan kemungkinan penyakit paling seram lebih dulu, lalu cemas berlebihan dan bingung harus berbuat apa.

### Rasa sakit pengguna

| Rasa sakit | Dampak |
|---|---|
| Informasi internet tidak terurut dan menakut-nakuti | Kecemasan meningkat, keputusan tertunda |
| Tidak tahu kapan cukup istirahat vs kapan ke dokter | Bisa under-triage (terlambat) atau over-triage (IGD penuh) |
| Tidak tahu apa yang harus disampaikan ke dokter | Konsultasi tidak efisien, informasi penting terlewat |
| Sulit memantau perkembangan gejala | Tidak ada bukti perubahan untuk dibawa saat konsultasi |

### Peluang

Mayoritas keluhan awal bersifat ringan dan dapat dipantau di rumah. Yang dibutuhkan bukan diagnosis, melainkan **pemilahan urgensi yang jelas, tenang, dan bisa ditindaklanjuti**.

---

## 3. Target pengguna

### Persona utama — "Rani, 24, pekerja kantoran"

- Baru merasakan sakit kepala + badan pegal 1–2 hari.
- Sudah mencari di internet dan malah makin cemas.
- Ingin tahu: apakah boleh kerja, cukup istirahat, atau harus ke dokter.
- Tidak ingin membuat akun hanya untuk cek gejala.

### Persona sekunder — "Budi, 35, orang tua"

- Anak/keluarga merasakan demam atau nyeri.
- Butuh panduan cepat soal tanda bahaya dan kapan harus ke fasilitas kesehatan.
- Ingin catatan yang rapi untuk dibawa ke klinik.

### Persona tersier — "Sari, 29, pengguna dengan kecemasan tinggi"

- Cenderung overthinking dan self-diagnosis.
- Membutuhkan validasi emosional, kemungkinan penyebab yang lazim, dan latihan menenangkan diri.

### Kebutuhan lintas persona

- Bahasa sederhana, tidak menghakimi, tidak menakut-nakuti.
- Jelas soal batas: informasi awal, **bukan diagnosis**.
- Bisa dipakai di ponsel, cepat, dan tanpa hambatan login.

---

## 4. Value proposition

| Untuk | Yang ditawarkan |
|---|---|
| Pengguna cemas | Urutan informasi yang menenangkan: kemungkinan lazim dulu, penyakit seram belakangan (atau tidak sama sekali) |
| Pengguna yang bingung | Satu hasil jelas: Darurat / Segera / Terjadwal / Pantau di rumah + alasan |
| Pengguna yang ingin bertindak | 1–3 langkah konkret, latihan napas, dan ringkasan dokter |
| Pengguna yang memantau | Symptom diary dan riwayat pengecekan |
| Pengguna yang akan konsultasi | Surat/ringkasan siap salin atau cetak |

Diferensiasi:

1. **Safety-first, bukan AI-first** — red flag deterministik mendahului AI.
2. **Tenang secara desain** — palet hijau, bahasa suportif, calm support.
3. **Guest-first** — nilai langsung tanpa akun.
4. **Siap konsultasi** — output dirancang untuk dibawa ke tenaga medis.

---

## 5. Journey pengguna

Medivue mengikuti lima tahap:

```text
01 Describe  →  02 Triage  →  03 Understand  →  04 Act  →  05 Track
   Ceritakan       Tingkat        Pahami           Ambil       Pantau
   gejala          urgensi        alasannya        langkah     perkembangan
```

| Tahap | Yang terjadi di produk | Layar |
|---|---|---|
| **Describe** | 5 pertanyaan bertahap: gejala utama, durasi, keparahan, gejala penyerta, tingkat kecemasan | `/checkin` (stage `questions`) |
| **Triage** | Red flag dicek lebih dulu, lalu AI/fallback menentukan 1 dari 4 level | `/api/triage` |
| **Understand** | Alasan singkat, kemungkinan penyebab paling lazim, tanda bahaya | `InteractiveAiChat` (sidebar & pesan awal) |
| **Act** | Langkah konkret, latihan napas 4-4-6, ringkasan/surat dokter | `InteractiveAiChat`, `BreathingExercise`, `DoctorLetterModal` |
| **Track** | Riwayat cek gejala, sebaran urgensi, diary harian | `/dashboard`, `/diary` |

Detail alur check-in:

1. **Intro** — penjelasan singkat, estimasi ±2 menit, janji "tidak ada jawaban salah".
2. **Lima langkah** — progress bar, bisa kembali ke langkah sebelumnya, pilihan cepat + input bebas.
3. **Review** — ringkasan jawaban, bisa ubah per baris.
4. **Analisis** — loading state, lalu hasil.
5. **AI Companion** — percakapan lanjutan, pertanyaan cepat, breathing, surat dokter.
6. **Reset** — mulai gejala baru tanpa keluar.

---

## 6. Empat tingkat urgensi

Sumber kebenaran ada di `src/lib/urgency.ts`.

| Level | Label | Deskripsi | Waktu tindakan | Aksi utama |
|---|---|---|---|---|
| `darurat` | Darurat medis | Berpotensi mengancam nyawa | Sekarang | Segera ke IGD atau hubungi 119 |
| `segera` | Perlu diperiksa segera | Sebaiknya diperiksa dokter | Dalam 24 jam | Temui dokter/klinik dalam 24 jam |
| `terjadwal` | Perlu dijadwalkan | Perlu dicek, tidak mendesak | 2–3 hari | Buat janji dokter dalam 2–3 hari |
| `pantau_di_rumah` | Pantau di rumah | Cenderung ringan | Mandiri | Rawat mandiri sambil pantau eskalasi |

Setiap hasil selalu menyertakan:

- **Alasan** mengapa level tersebut dipilih.
- **Kemungkinan penyebab paling lazim** (bukan penyakit seram).
- **Tanda bahaya** yang mengharuskan naik level.
- **Langkah konkret** yang bisa dilakukan sekarang.
- **Pesan penenang** (calm support).
- **Ringkasan dokter** + 3 pertanyaan untuk konsultasi.

---

## 7. Fitur per halaman

### 7.1 Landing page (`/`)

- Hero dengan headline "Bingung harus ke IGD, dokter, atau istirahat di rumah?".
- Preview contoh hasil triase.
- Penjelasan 4 tingkat urgensi.
- Cara kerja 3 langkah.
- Fitur: terarah, pantau harian, siap ke dokter.
- Bagian calm support dengan animasi napas.
- Bagian privasi & batasan.
- FAQ (4 pertanyaan).
- CTA ke `/checkin`.
- Navbar berubah CTA menjadi "Buka dashboard" jika sudah login.

### 7.2 Autentikasi (`/auth`)

- Login dan daftar dengan email + kata sandi (**minimal 8 karakter untuk pendaftaran**).
- Tombol **Masuk dengan Google** / **Daftar dengan Google** (Supabase OAuth) di atas form, dipisahkan divider "atau dengan email".
- Link **"Lupa kata sandi?"** (mode Masuk) menuju `/auth/forgot`.
- `/auth/forgot`: kirim tautan reset dengan pesan netral ("jika email terdaftar…") untuk mencegah enumerasi email.
- `/auth/reset`: form kata sandi baru + konfirmasi (min. 8 karakter), menangani tautan kedaluwarsa, dan mencabut sesi di perangkat lain setelah berhasil.
- Pesan error khusus untuk email belum dikonfirmasi dan kredensial salah.
- Redirect kembali ke `?redirect=` atau `/dashboard`.
- Tetap menawarkan "cek gejala sebagai tamu".
- Panel kiri menjelaskan alasan akun dan perlindungan RLS.

### 7.3 Check-in (`/checkin`)

- Header ringkas dengan nomor darurat 119 dan tautan dashboard.
- Intro dengan ekspektasi hasil.
- Lima pertanyaan:
  1. Gejala utama (input bebas + chip cepat).
  2. Durasi (4 pilihan).
  3. Keparahan (ringan/sedang/berat dengan deskripsi).
  4. Gejala penyerta (multi-select + input kustom).
  5. Tingkat kecemasan (skala 1–5 dengan emoji dan label).
- Review jawaban sebelum analisis.
- Peringatan darurat di sidebar.
- Hasil langsung masuk ke AI Companion.

### 7.4 AI Companion (setelah hasil)

- Pesan sambutan berisi ringkasan triase, alasan, langkah, dan calm support.
- Sidebar desktop: rincian triase + tab relaksasi napas.
- Mobile: ringkasan triase dalam elemen `details`.
- Chat lanjutan dengan pertanyaan saran:
  - pertolongan pertama,
  - makanan/minuman,
  - kapan ke dokter,
  - obat bebas,
  - cara mengurangi cemas.
- Indikator mode AI: "AI aktif" (Gemini) atau "Mode pendamping" (fallback).
- Tombol **Akhiri & Buat Surat Dokter**.
- Reset gejala baru.

### 7.5 Red flag alert

- Muncul saat `isRedFlagTriggered`.
- Warna rose, label "Tanda Bahaya Terdeteksi", aksi utama, tombol telepon 119.

### 7.6 Breathing exercise

- Latihan napas 4 detik tarik – 4 detik tahan – 6 detik hembuskan.
- Animasi lingkaran membesar/mengecil.
- Kontrol mulai/jeda/reset.
- Disclaimer: menenangkan, bukan pengganti bantuan medis.

### 7.7 Dashboard (`/dashboard`)

- **Wajib login** (`AuthGuard`): tamu diarahkan ke `/auth?redirect=/dashboard`.
- Sapaan sesuai waktu (pagi/siang/sore/malam), tanpa tombol keluar karena aksi akun ada di navbar/action sheet.
- Hero "Ada yang terasa beda hari ini?" dengan satu CTA utama → cek gejala baru.
- Tiga kartu kategori dengan anatomi dan aksi seragam:
  - **Riwayat cek** → jumlah sesi + "Lihat riwayat" (scroll ke pengecekan terakhir).
  - **Catatan dokter** → jumlah surat + "Lihat catatan" (scroll ke daftar catatan) atau "Buat catatan" bila kosong.
  - **Symptom diary** → "Buka diary".
- Kartu sesi terakhir: gejala, durasi, badge urgensi, alasan, tanggal, buka ringkasan dokter.
- Sebaran urgensi (jika >1 sesi).
- Panel breathing dan pengingat batas medis.
- Daftar surat dokter tersimpan dengan tombol "Buka catatan".
- Panel penutup berisi catatan bahwa riwayat tersimpan di browser.
- Halaman **tanpa Footer global** agar terasa seperti ruang kerja pribadi; Navbar, disclaimer, dan bottom nav tetap tampil.

### 7.8 Symptom diary (`/diary`)

- **Wajib login** (`AuthGuard`): tamu diarahkan ke `/auth?redirect=/diary`.
- Form catatan bebas (maks. 1000 karakter).
- Skala keparahan 1–5 dengan label.
- Daftar catatan + rata-rata keparahan.
- Peringatan bahwa diary bukan penentu diagnosis.
- Tautan ke latihan napas.

### 7.9 Ringkasan & surat dokter

- **DoctorSummaryModal**: ringkasan gejala + 3 pertanyaan, tombol salin.
- **DoctorLetterModal**: lembar catatan keluhan lengkap (identitas dokumen, anamnesis, poin diskusi, upaya mandiri, tanda bahaya, pertanyaan, catatan penutup), tombol cetak/PDF, salin, simpan & selesai.

### 7.10 Navigasi

- **Desktop:** navbar atas dengan Dashboard, Diary, Cara kerja, CTA "Cek gejala", dan akun.
- **Mobile:** top bar slim (logo + tombol darurat 119 + avatar/shortcut dashboard saat login). Tamu di landing page juga melihat tombol **Masuk** di top bar.
- **Bottom navigation** hanya tampil untuk pengguna yang sudah login dan tidak berada di landing page maupun `/checkin`. Slot: Beranda, Cek gejala, Diary, Akun.
- Dashboard tidak menjadi tab bottom nav karena pengguna langsung diarahkan ke `/dashboard` setelah login; aksesnya tersedia lewat avatar di top bar dan action sheet akun.
- Halaman aktif ditandai **bubble yang bergeser** di belakang tab, sehingga posisi pengguna selalu terlihat.
- `Akun` membuka action sheet berisi email, tombol "Buka dashboard", dan tombol keluar.
- Bottom nav tidak ditampilkan pada alur `/checkin` yang bersifat fullscreen.

---

## 8. Batasan dan etika produk

Medivue secara sadar membatasi diri:

- **Bukan diagnosis.** Tidak menyebut diagnosis pasti.
- **Tidak meresepkan.** Tidak menyebut dosis obat keras/antibiotik; obat bebas hanya sesuai aturan kemasan.
- **Tidak menakut-nakuti.** Kemungkinan lazim ditampilkan lebih dulu; nama penyakit serius dihindari kecuali red flag nyata.
- **Red flag menang.** Jika tanda bahaya terdeteksi, alur langsung diarahkan ke bantuan darurat; AI tidak boleh menurunkan level.
- **Disclaimer berlapis.** Banner global, footer, prompt sistem, safety layer, dan komponen hasil.
- **Privasi minimal.** Tidak meminta data yang tidak diperlukan; riwayat di perangkat.

Kalimat kunci yang konsisten dipakai:

> "Informasi awal, bukan pengganti diagnosis tenaga medis."

> "Untuk kondisi darurat, jangan menunggu hasil aplikasi. Segera ke IGD atau hubungi 119."

---

## 9. Use case utama

| Skenario | Perilaku produk |
|---|---|
| Sakit kepala + pegal 2 hari, cemas | 5 pertanyaan → `pantau_di_rumah`/`terjadwal` → langkah mandiri + diary |
| Nyeri dada tertekan menjalar | Red flag cocok → langsung `darurat` tanpa AI → alert 119 |
| Demam + leher kaku | Red flag meningismus → `darurat` |
| Cemas terkena kanker | Chat fallback/AI memvalidasi, menjelaskan penyebab lazim, menyarankan pemeriksaan |
| Akan ke dokter | Buat surat dokter → salin/cetak → bawa |
| Ingin memantau | Diary harian + dashboard riwayat |
| Tidak mau daftar | Semua alur inti tetap berjalan sebagai tamu |

---

## 10. Metrik keberhasilan

Belum ada instrumentasi analitik di kode. Metrik yang relevan untuk diukur:

| Kategori | Metrik |
|---|---|
| Keterlibatan | Persentase pengguna yang menyelesaikan 5 langkah |
| Kejelasan | Persentase hasil yang membuka ringkasan/surat dokter |
| Ketenangan | Perubahan skor kecemasan sebelum vs sesudah (field `anxietyBefore` sudah ada; `anxiety_after` baru di skema) |
| Kepatuhan | Persentase pengguna `segera`/`terjadwal` yang membuka panduan langkah |
| Retensi | Pengguna yang kembali membuat diary atau cek ulang |
| Keselamatan | Jumlah red flag yang terdeteksi dan diarahkan ke 119/IGD |
| Kualitas AI | Proporsi respons Gemini vs fallback (`X-AI-Provider`) |

---

## 11. Roadmap dan gap produk

Prioritas berdasarkan kondisi saat ini:

### Jangka pendek

1. **Persistensi diary nyata** — ganti in-memory store dengan Supabase/localStorage.
2. **Sinkronisasi riwayat ke akun** — sesi dan surat mengikuti pengguna lintas perangkat.
3. **Ukur kecemasan sesudah** — tampilkan dan simpan `anxietyAfter`.
4. **Rate limiting & autentikasi opsional** untuk endpoint AI.

### Jangka menengah

5. **Personalisasi profil** — manfaatkan `profiles` (usia, kondisi khusus, preferensi nada).
6. **Ekspor surat yang lebih kaya** — PDF langsung, bukan hanya print dialog.
7. **Ringkasan perkembangan** — tren keparahan diary dan korelasi dengan sesi triase.
8. **Onboarding akun yang lebih jelas** — jelaskan manfaat akun tanpa menghalangi tamu.

### Jangka panjang

9. **Lokalisasi** — dukungan bahasa selain Indonesia.
10. **Integrasi faskes** — kirim ringkasan ke klinik/puskesmas.
11. **Mode offline penuh** — fallback lokal untuk seluruh alur tanpa jaringan.
12. **Evaluasi klinis** — validasi konten red flag dan hasil triase bersama tenaga medis.

### Gap yang diketahui (produk)

- AuthGuard belum memproteksi halaman; akun belum memberi manfaat data terpusat.
- Diary belum per pengguna dan tidak persisten.
- Belum ada metrik/analitik.
- Belum ada alur koreksi jika pengguna salah mengisi setelah hasil keluar (harus reset).
- Belum ada penjelasan eksplisit tentang model AI/fallback di UI selain indikator kecil.

---

## 12. Glosarium

| Istilah | Arti |
|---|---|
| **Triase** | Pemilahan tingkat urgensi, bukan diagnosis |
| **Red flag** | Tanda bahaya yang memerlukan penanganan darurat |
| **Calm support** | Dukungan menenangkan berupa pesan dan latihan napas |
| **Fallback engine** | Logika lokal pengganti AI saat API tidak tersedia |
| **AI Companion** | Antarmuka chat lanjutan setelah hasil triase |
| **Surat dokter** | Lembar ringkasan keluhan siap dibawa ke fasilitas kesehatan |
| **Guest mode** | Penggunaan tanpa akun, data di perangkat |
| **Urgensi** | Salah satu dari empat level: darurat, segera, terjadwal, pantau di rumah |
