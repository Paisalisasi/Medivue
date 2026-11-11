# Design System Medivue

> Dokumen ini mendokumentasikan **design system yang benar-benar dipakai** di kode saat ini.
> Sebagian besar styling berupa utility Tailwind langsung di JSX; belum ada file token terpusat.

---

## 1. Prinsip desain

| Prinsip | Wujud di produk |
|---|---|
| **Tenang, bukan menakutkan** | Palet hijau-emerald, latar krem-hijau lembut, bahasa suportif |
| **Jelas satu langkah** | Satu hasil urgensi, aksi utama ditonjolkan, tidak ada istilah medis rumit |
| **Empati dulu** | Calm support, validasi rasa cemas, latihan napas |
| **Aman secara visual** | Merah khusus darurat; amber untuk perhatian; tidak ada alarm berlebihan |
| **Guest-first** | Tanpa paywall/login; CTA utama selalu terlihat |
| **Siap konsultasi** | Tampilan surat dokter rapi dan print-friendly |

---

## 2. Brand dan tone of voice

### Identitas

- **Nama:** Medivue
- **Tagline:** *Pahami keluhan. Tentukan langkah.*
- **Ikon merek:** `HeartPulse` (lucide) dalam kotak emerald dengan ikon lime.
- **Kesan:** tenang, hangat, kompeten, tidak birokratis.

### Nada komunikasi

- Gunakan **"kamu"** untuk pengguna, **"Anda"** hanya di konteks medis formal (surat dokter).
- Kalimat pendek, hindari jargon.
- Validasi emosi sebelum memberi informasi: "Wajar kok merasa cemas…".
- Tampilkan kemungkinan lazim lebih dulu.
- Jangan menghakimi, jangan menakut-nakuti, jangan menyepelekan.
- Selalu sertakan pengingat batas medis pada titik keputusan.

### Contoh copy

| Konteks | Contoh |
|---|---|
| CTA utama | "Mulai cek gejala" |
| CTA lembut | "Mulai dengan tenang" |
| Judul hasil | "Satu hasil yang jelas, tanpa istilah rumit." |
| Disclaimer | "Informasi awal, bukan pengganti tenaga medis" |
| Darurat | "Segera ke IGD atau hubungi 119" |
| Empty state | "Belum ada riwayat pengecekan" |

---

## 3. Warna

### 3.1 Token dasar (dari `globals.css` dan layout)

| Token | Nilai | Penggunaan |
|---|---|---|
| Background aplikasi | `#f6f8f4` | Body, halaman, section netral |
| Surface terang | `#fbfcf8` | Navbar, footer, hero, header check-in |
| Surface kartu | `#ffffff` / `#fffefa` | Kartu, modal, panel |
| Teks utama | `#1e293b` (`slate-900` via body) | Teks body |
| Teks judul | `emerald-950` | Heading dan label penting |
| Selection | `#d9f99d` / `#052e16` | Seleksi teks |
| Focus ring | `#047857` | `:focus-visible` |
| Theme color | `#064e3b` | Meta viewport browser |

### 3.2 Palet Tailwind yang dipakai

| Keluarga | Peran | Contoh kelas |
|---|---|---|
| `emerald` | Warna utama, aksi, teks judul | `bg-emerald-900`, `text-emerald-950`, `border-emerald-950/10` |
| `lime` | Aksen positif, CTA sekunder | `bg-lime-300`, `bg-lime-200/80`, `text-lime-200` |
| `slate` | Teks sekunder, border netral, latar form | `text-slate-600`, `border-slate-200`, `bg-slate-50` |
| `rose` | Darurat, error, red flag | `bg-rose-600`, `border-rose-200`, `text-rose-700` |
| `amber` | Perhatian, disclaimer, level segera | `bg-[#fff8e8]`, `border-amber-200`, `text-amber-950` |
| `sky` | Level terjadwal | `bg-sky-50`, `text-sky-800`, `ring-sky-200` |
| `teal` | Calm support / napas | `bg-teal-50`, `border-teal-100`, `text-teal-900` |
| `blue` | Level terjadwal di beberapa komponen lama | `bg-blue-600` (`TriageResultCard`, `DoctorLetterModal`) |

### 3.3 Latar netral tambahan

| Hex | Pemakaian |
|---|---|
| `#f6f8f4` | Latar halaman |
| `#fbfcf8` | Navbar, footer, hero, header |
| `#fffefa` | Kartu preview hero |
| `#f3f6ee` | Panel dalam kartu, tombol breathing dashboard |
| `#eef3e8` | Baris info "sistem memeriksa tanda bahaya" |
| `#e9f0e2` | CTA akhir landing, panel diary |
| `#f4f8ec` | Badge hero |
| `#fff8e8` | Disclaimer, peringatan, catatan review |

### 3.4 Warna per level urgensi

Sumber: `src/lib/urgency.ts`.

| Level | Badge | Border | Latar | Pill | Dot |
|---|---|---|---|---|---|
| `darurat` | `bg-rose-600 text-white` | `border-rose-300` | `bg-rose-50` | `bg-rose-50 text-rose-700 ring-rose-200` | `bg-rose-500` |
| `segera` | `bg-amber-500 text-white` | `border-amber-300` | `bg-amber-50` | `bg-amber-50 text-amber-800 ring-amber-200` | `bg-amber-500` |
| `terjadwal` | `bg-sky-600 text-white` | `border-sky-300` | `bg-sky-50` | `bg-sky-50 text-sky-800 ring-sky-200` | `bg-sky-500` |
| `pantau_di_rumah` | `bg-emerald-600 text-white` | `border-emerald-300` | `bg-emerald-50` | `bg-emerald-50 text-emerald-800 ring-emerald-200` | `bg-emerald-500` |

Aturan:

- **Merah hanya untuk darurat/error**, jangan dipakai untuk dekorasi.
- **Amber untuk perhatian**, termasuk disclaimer.
- **Hijau untuk aman/pantau**, bukan untuk "sembuh".
- Ikon level mengikuti konteks: `ShieldAlert`, `AlertTriangle`, `CalendarCheck`, `Home`.

Catatan inkonsistensi: `TriageResultCard` dan `DoctorLetterModal` masih memakai `blue-600` untuk level `terjadwal`, sedangkan `URGENCY_META` memakai `sky`.

---

## 4. Tipografi

### Font

```css
--font-sans: system-ui, -apple-system, BlinkMacSystemFont,
             'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
             sans-serif;
```

Tidak ada webfont eksternal; render memakai font sistem.

### Skala

| Peran | Kelas | Catatan |
|---|---|---|
| Display hero | `text-4xl sm:text-5xl lg:text-[3.65rem]` | `font-semibold`, `leading-[1.06]`, `tracking-[-0.045em]` |
| Judul section | `text-3xl sm:text-4xl` | `tracking-[-.035em]` |
| Judul halaman | `text-3xl sm:text-4xl` | `tracking-[-.04em]` |
| Judul kartu besar | `text-2xl sm:text-3xl` | `tracking-[-.03em]` |
| Judul kartu | `text-lg` / `text-xl` | `font-semibold` |
| Body besar | `text-base leading-7` | Landing dan pengantar |
| Body | `text-sm leading-6` | Default UI |
| Body kecil | `text-xs leading-5` | Metadata, helper |
| Micro label | `text-[10px]` / `text-[11px]` | Eyebrow, badge, timestamp |
| Eyebrow | `text-xs font-bold uppercase tracking-[.16em]` | Label section |

### Aturan

- Heading memakai **tracking negatif** (rapat) untuk kesan modern.
- Eyebrow memakai **uppercase + tracking lebar**.
- Body text memakai `leading-6`/`leading-7` agar terbaca tenang.
- Hindari teks lebih kecil dari `text-[10px]`, terutama untuk konten penting.

---

## 5. Spacing, radius, shadow

### Container dan spacing

| Pola | Nilai |
|---|---|
| Container utama | `mx-auto max-w-6xl` |
| Container sempit | `max-w-4xl` / `max-w-3xl` |
| Padding horizontal | `px-5 sm:px-8` |
| Padding vertikal section | `py-12 sm:py-16`, `py-16 sm:py-20` |
| Gap grid umum | `gap-3`, `gap-4`, `gap-8`, `gap-10` |
| Tinggi target sentuh | `min-h-11` (44px), `min-h-12` (48px) |

### Radius

| Kelas | Kegunaan |
|---|---|
| `rounded-lg` | Tombol kecil, potongan kode |
| `rounded-xl` | Tombol, input, panel kecil |
| `rounded-2xl` | Kartu, panel, alert |
| `rounded-[1.75rem]` | Kartu besar, hero panel |
| `rounded-[2rem]` | Panel auth, calm support |
| `rounded-full` | Pill, badge, CTA bulat, avatar |

### Shadow

| Kelas | Kegunaan |
|---|---|
| `shadow-xs` / `shadow-sm` | Kartu harian, tombol |
| `shadow-md` | Red flag alert |
| `shadow-lg` | CTA utama, tombol dokter |
| `shadow-[0_24px_70px_-42px_rgba(6,78,59,.34)]` | Kartu preview hero |
| `shadow-[0_24px_80px_-40px_rgba(6,78,59,.35)]` | Kartu intro check-in |
| `shadow-[0_32px_100px_-52px_rgba(6,78,59,.45)]` | Panel auth |

Shadow khas Medivue: **hijau gelap transparan, sangat lembut, offset besar** — bukan hitam pekat.

---

## 6. Layout dan responsif

### Breakpoint yang dipakai

Tailwind default: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px.

### Pola layout

| Layar | Pola |
|---|---|
| Landing | 1 kolom → 2 kolom hero (`lg:grid-cols-[1.05fr_.95fr]`) |
| Urgensi | 1 → 2 → 4 kolom |
| Cara kerja | 1 → 3 kolom dengan garis putus-putus |
| Dashboard | Kartu kategori `1 → sm:2 → lg:3`, lalu area utama `1 → 2` kolom (`lg:grid-cols-[1.35fr_.8fr]`) |
| Check-in pertanyaan | Sidebar progress + form (`lg:grid-cols-[.34fr_.66fr]`) |
| AI Companion | Sidebar 320–384px + chat fleksibel |
| Auth | Panel kiri gelap + form kanan; back-link `pt-2 sm:pt-4` (jarak visual ke teks ±20px mobile / 28px desktop) |
| Diary | 1 kolom `max-w-4xl` |

### Back-link halaman Auth

- Container memakai `pb-10 pt-2 sm:pb-16 sm:pt-4`. Dengan kotak sentuh `min-h-11`, jarak visual navbar → teks tombol adalah **±20px di mobile** dan **±28px di desktop**.
- Tautan memakai `min-h-11` + `-ml-1.5 px-1.5` agar target sentuh 44px tanpa menggeser alignment teks.
- Kartu form diberi `mt-5 sm:mt-6` agar ritme atas tetap seimbang.

### Shell

- Navbar sticky (`top-0 z-40`), tinggi `4.25rem`.
- Disclaimer banner di atas Navbar (kecuali `/checkin`).
- `/checkin` bersifat **fullscreen**: tanpa Navbar/Footer/Disclaimer global.
- `/dashboard` memakai Navbar/Disclaimer/BottomNav, tetapi **tanpa Footer** global; halaman ditutup panel info penyimpanan browser.
- Header check-in sendiri sticky dengan `backdrop-blur-xl`.
- AI Companion memakai tinggi penuh (`h-dvh`) dengan area chat scrollable.

### Navigasi mobile (`BottomNav`)

- Muncul hanya di `< md`, **khusus pengguna yang sudah login**, dan tidak tampil di landing page (`/`) maupun route fullscreen (`/checkin`).
- Fixed `bottom-0 inset-x-0 z-40`, surface `bg-[#fbfcf8]/95` + `backdrop-blur-xl`, border atas emerald, shadow `0_-8px_30px_-12px_rgba(6,78,59,.18)`.
- 4 slot seimbang: Beranda, Cek gejala, Diary, Akun. Dashboard tidak menjadi tab karena pengguna login langsung diarahkan ke `/dashboard`.
- Cek gejala menonjol lewat lingkaran lime (`bg-lime-300`, `h-8 w-8`) tanpa tombol terangkat, sehingga grid tetap simetris.
- **Bubble indikator aktif**: elemen absolut `w-1/4`, `translateX(index * 100%)`, `transition-all duration-300 ease-out`, berisi pill `bg-emerald-100/90 ring-1 ring-emerald-200/80`. Memberi petunjuk halaman aktif yang responsif tanpa menggeser layout.
- Aktif: ikon `text-emerald-800` + stroke lebih tebal; non-aktif `text-slate-500`.
- Safe area: container memakai `pb-[env(safe-area-inset-bottom)]`; konten halaman diberi padding setara agar tidak tertutup.
- Akun membuka action sheet (email + tombol Buka dashboard + Keluar) dengan overlay `z-50`.
- Top bar mobile menampilkan logo, tombol darurat 119, dan avatar/inisial sebagai shortcut dashboard saat login. Tamu yang berada di landing page juga melihat tombol **Masuk** (outline putih) di top bar.
- Aksesibilitas: `aria-label="Navigasi bawah"`, `aria-current="page"`, `aria-expanded` untuk sheet akun, target sentuh minimal 40–44px.

---

## 7. Inventaris komponen

| Komponen | File | Peran | Ciri visual |
|---|---|---|---|
| `Logo` | `components/brand/Logo.tsx` | Merek | Kotak emerald + `HeartPulse` lime, 3 ukuran (`sm/md/lg`), opsi tagline & inverted |
| `ShellLayout` | `components/layout/ShellLayout.tsx` | Shell global | Menyembunyikan chrome di `/checkin` |
| `Navbar` | `components/layout/Navbar.tsx` | Navigasi | Sticky; desktop links + CTA + akun; mobile slim (logo + 119) |
| `BottomNav` | `components/layout/BottomNav.tsx` | Navigasi mobile | Hanya user login, 4 slot, bubble aktif bergeser, action sheet akun |
| `Footer` | `components/layout/Footer.tsx` | Footer | 3 kolom, tombol 119 rose, disclaimer |
| `DisclaimerBanner` | `components/layout/DisclaimerBanner.tsx` | Peringatan global | Latar `#fff8e8`, ikon amber |
| `StepChat` | `components/triage/StepChat.tsx` | Alur check-in | 3 stage, progress, kartu putih, chip pilihan |
| `InteractiveAiChat` | `components/triage/InteractiveAiChat.tsx` | Chat pasca-triage | Sidebar triase + napas, bubble chat, quick chips |
| `TriageResultCard` | `components/triage/TriageResultCard.tsx` | Kartu hasil | **Belum dipakai halaman**; tetap bagian sistem |
| `RedFlagAlert` | `components/triage/RedFlagAlert.tsx` | Peringatan darurat | Border rose 2px, tombol 119 |
| `AnxietySlider` | `components/triage/AnxietySlider.tsx` | Skala 1–5 | 5 tombol emoji, state terpilih emerald |
| `DoctorSummaryModal` | `components/triage/DoctorSummaryModal.tsx` | Ringkasan salin | Modal, panel monospace, tombol salin |
| `DoctorLetterModal` | `components/triage/DoctorLetterModal.tsx` | Surat dokter | Dokumen print-ready, kop, 3 bagian, aksi cetak/salin |
| `BreathingExercise` | `components/calm/BreathingExercise.tsx` | Latihan napas | Lingkaran animasi, 4-4-6, gradient emerald-teal |
| `DiaryList` | `components/diary/DiaryList.tsx` | Diary harian | Form + skala 1–5 + daftar kartu |
| `AuthGuard` | `components/auth/AuthGuard.tsx` | Pembungkus akses | `/dashboard` & `/diary` wajib login; spinner saat cek sesi; redirect ke `/auth?redirect=…` |

### Pola kartu

```text
rounded-2xl border border-emerald-950/10 bg-white p-5 sm:p-6
```

Kartu interaktif menambahkan:

```text
transition hover:border-emerald-800/20 hover:shadow-sm
```

### Pola kartu kategori (dashboard)

Tiga kategori (Riwayat cek, Catatan dokter, Symptom diary) memakai anatomi identik:

```text
[ikon chip h-10 w-10 rounded-xl bg-lime-100 text-emerald-800]
[label text-xs uppercase tracking-[.12em] text-slate-500]
[nilai text-2xl font-semibold text-emerald-950]
[helper text-xs text-slate-500]
─────────────────────────────
[aksi text-sm font-semibold text-emerald-800 + ArrowRight]  ← mt-auto
```

- Kartu `flex h-full flex-col` agar tinggi dan posisi aksi sejajar dalam satu baris grid.
- Aksi selalu berada di baris bawah dengan `border-t border-slate-100 pt-4`.
- Hanya satu aksi per kategori; navigasi memakai tautan/`Link` dengan target sentuh `min-h-11`.

### Pola tombol

| Varian | Kelas inti |
|---|---|
| Primer gelap | `bg-emerald-900 text-white hover:bg-emerald-800 rounded-xl` |
| Primer terang | `bg-lime-300 text-emerald-950 hover:bg-lime-200 rounded-xl font-bold` |
| Sekunder | `border border-emerald-950/10 bg-white text-emerald-950 hover:bg-emerald-50` |
| Netral | `border border-slate-200 bg-white text-slate-700 hover:bg-slate-50` |
| Google | `border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 rounded-xl min-h-12` + ikon G 4 warna; dipisahkan divider "atau dengan email" |
| Darurat | `bg-rose-600 text-white hover:bg-rose-700` |
| Ghost/teks | `text-emerald-900 hover:underline` |
| Disabled | `disabled:opacity-50/60 disabled:cursor-not-allowed` |

### Pola input

```text
w-full rounded-xl border border-slate-300 bg-white px-4 py-3
text-sm text-slate-800 placeholder-slate-400
transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100
```

### Pola badge/pill

- Level urgensi: `rounded-full px-3 py-1 text-xs font-semibold ring-1` + token level.
- Eyebrow: `text-xs font-bold uppercase tracking-[.16em] text-emerald-700`.
- Checklist: lingkaran kecil emerald dengan ikon `Check`.

### Pola alert

| Jenis | Kelas |
|---|---|
| Error | `rounded-xl border border-rose-200 bg-rose-50 text-rose-700` + `role="alert"` |
| Sukses | `rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800` + `role="status"` |
| Perhatian | `rounded-xl border border-amber-200/70 bg-[#fff8e8] text-amber-950` |
| Info/netral | `rounded-xl border border-slate-200 bg-slate-50 text-slate-700` |
| Darurat | `rounded-2xl border-2 border-rose-500 bg-rose-50 text-rose-950` |

---

## 8. Ikon

- Library: **lucide-react**.
- Ukuran umum: `h-3.5 w-3.5` (meta), `h-4 w-4` (tombol), `h-5 w-5` (kartu), `h-6/7` (penekanan).
- Ikon dekoratif diberi `aria-hidden` bila perlu; tombol ikon selalu punya `aria-label`.
- Pemetaan penting:
  - `HeartPulse` — merek, kesehatan.
  - `ShieldAlert` — darurat.
  - `AlertTriangle` — perhatian/tanda bahaya.
  - `CalendarCheck` — terjadwal.
  - `Home` — pantau di rumah.
  - `Wind` — calm support/napas.
  - `BookHeart` — diary.
  - `FileCheck2` / `FileText` — surat/ringkasan dokter.
  - `PhoneCall` — 119.
  - `Sparkles` — AI/insight.
  - `Loader2` — loading (`animate-spin`).

---

## 9. Motion

| Animasi | Detail |
|---|---|
| `calmBreathe` | `scale(1) → scale(1.3)` + opacity, 8s ease-in-out infinite |
| Breathing exercise | Transisi lingkaran 1000ms ease-in-out; fase 4s–4s–6s |
| Progress bar | `transition-all duration-300` |
| Hover tombol/kartu | Transisi default Tailwind (150ms) |
| Status AI | `animate-ping` pada dot hijau |
| Loading | `animate-spin` pada `Loader2` |

Prinsip: gerakan **lambat, lembut, tidak mengejutkan**. Tidak ada animasi dekoratif yang cepat atau berkedip.

---

## 10. State

| State | Perlakuan |
|---|---|
| Hover | Perubahan warna/border halus |
| Focus | `focus-visible:outline` emerald atau `focus:ring-2 ring-emerald-100` |
| Selected | Border emerald + latar emerald-50 + ikon centang |
| Disabled | Opacity 40–60% + cursor not-allowed |
| Loading | Spinner + teks "Menganalisis…" / "Memproses…" |
| Error | Alert rose dengan `role="alert"` |
| Success | Alert emerald dengan `role="status"` |
| Empty | Kartu dashed + ikon + ajakan bertindak |
| Red flag | Alert rose tebal + tombol 119 |

---

## 11. Aksesibilitas

Yang sudah diterapkan:

- `lang="id"` pada `<html>`.
- Elemen semantik: `header`, `nav`, `main`, `aside`, `footer`, `section`, `article`, `details/summary`.
- `aria-label` pada navigasi, tombol ikon, dan input tertentu.
- `aria-pressed` pada tombol pilihan (skala kecemasan, diary, tab auth).
- `aria-expanded` + `aria-controls` pada menu mobile dan panel breathing.
- `role="alert"` / `role="status"` untuk pesan sistem.
- `:focus-visible` global dengan outline emerald.
- Target sentuh `min-h-11`/`min-h-12` pada CTA.
- Teks alternatif: gambar hero memakai `alt=""` + `aria-hidden` karena dekoratif.
- Print: kontrol modal disembunyikan (`print:hidden`), latar putih.

Rekomendasi perbaikan:

- Beberapa teks `text-[10px]`/`text-[11px]` berpotensi sulit dibaca; pertimbangkan minimum 12px untuk konten penting.
- Modal belum memakai focus trap atau `aria-modal`/`role="dialog"`.
- Kontras teks sekunder `slate-400`/`slate-500` pada latar terang perlu diuji.
- Tabbable order pada modal dan sidebar chat perlu diverifikasi.

---

## 12. Print

Dipakai pada `DoctorLetterModal`:

- Latar putih, tanpa shadow/border.
- Kontrol modal disembunyikan (`print:hidden`).
- Modal menjadi statis (`print:static print:inset-auto`).
- Tinggi tidak dibatasi (`print:max-h-none`).
- Tipografi surat: kop tebal, badan `text-xs sm:text-sm`, warna slate.

`globals.css` juga menetapkan `body { background: #ffffff }` pada media print.

---

## 13. Copywriting

### Prinsip

1. **"Kamu"** untuk percakapan; **"Anda"** untuk dokumen klinis.
2. Kalimat pendek, satu ide per kalimat.
3. Sebut tindakan, bukan diagnosis.
4. Validasi perasaan sebelum instruksi.
5. Hindari kata yang memicu panik: "bahaya", "fatal", "gagal" hanya pada konteks darurat nyata.
6. Selalu beri jalan keluar: "kalau ragu, periksa ke dokter".

### Kamus istilah

| Hindari | Gunakan |
|---|---|
| "Anda menderita…" | "Keluhan yang kamu rasakan…" |
| "Diagnosis: …" | "Tingkat urgensi: …" |
| "Pasti bukan apa-apa" | "Kemungkinan paling lazim adalah…" |
| "Segera minum obat X mg" | "Ikuti aturan pakai di kemasan atau tanyakan apoteker" |
| "Anda harus…" | "Yang bisa kamu coba…" |

### Do / Don't

| Do | Don't |
|---|---|
| Tampilkan kemungkinan lazim lebih dulu | Menampilkan penyakit seram sebagai kemungkinan utama |
| Jelaskan alasan level urgensi | Memberi label tanpa konteks |
| Sediakan langkah konkret 1–3 | Memberi daftar panjang tanpa prioritas |
| Sertakan disclaimer di titik keputusan | Menyembunyikan batas medis di footer saja |
| Gunakan warna merah hanya untuk darurat | Memakai merah untuk aksen biasa |

---

## 14. Known gaps design system

1. **Belum ada token terpusat** — warna/spacing ditulis sebagai utility string berulang; rawan drift.
2. **Dua palet level `terjadwal`** — `sky` (sumber utama) vs `blue` (komponen lama).
3. **Belum ada dark mode**.
4. **Modal belum aksesibel penuh** — belum ada focus trap/`role="dialog"`.
5. **Skala teks mikro** (`10px`/`11px`) dipakai cukup sering.
6. **Campuran bahasa di UI chat** — beberapa label teknis berbahasa Inggris ("AI active", "Reset") di tengah UI Indonesia.
7. **`TriageResultCard` tidak terpakai** — style-nya masih relevan tetapi belum teruji di layar nyata.
8. **Tidak ada dokumentasi komponen interaktif** (Storybook atau sejenisnya).
9. **Animasi napas** memakai `animate-breathe` di landing tetapi `BreathingExercise` memakai transisi manual; keduanya belum disatukan.
