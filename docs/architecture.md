# Arsitektur Medivue

> Dokumen ini menggambarkan **kondisi kode saat ini** di repository, bukan target arsitektur.
> Terakhir disesuaikan dengan struktur `src/`, `supabase/schema.sql`, dan `package.json` pada repository ini.

---

## 1. Ringkasan

Medivue adalah aplikasi **AI Health Triage Companion** berbasis **Next.js App Router fullstack**. Aplikasi membantu pengguna memahami tingkat urgensi keluhan, bukan menegakkan diagnosis.

Karakteristik arsitektur saat ini:

- **Satu aplikasi Next.js** untuk frontend dan backend (route handlers di `src/app/api`).
- **AI opsional**: Google Gemini dipakai jika `GEMINI_API_KEY` tersedia; jika tidak, seluruh alur tetap berjalan lewat **fallback engine rule-based**.
- **Safety-first**: deteksi red flag deterministik dijalankan **sebelum** AI, lalu output AI divalidasi oleh safety layer.
- **Guest-first**: pengguna dapat memakai check-in tanpa akun. Riwayat sesi dan surat dokter disimpan di **`localStorage`**.
- **Supabase** terpasang untuk autentikasi dan memiliki skema database + RLS, tetapi fitur riwayat/diary **belum memakai Supabase** sebagai penyimpanan utama.
- **Chat interaktif** setelah triage memakai respons teks biasa (bukan streaming token asli; server mengirim teks utuh sebagai body response).

---

## 2. Stack dan versi

| Lapisan | Teknologi | Versi di `package.json` |
|---|---|---|
| Framework | Next.js (App Router) | `^16.4.3` |
| UI | React / React DOM | `^19.3.1` |
| Bahasa | TypeScript | `~6.0.3` |
| Styling | Tailwind CSS v4 + `@tailwindcss/postcss` | `^4.3.3` |
| Ikon | `lucide-react` | `^1.61.0` |
| AI | `@google/genai` (Gemini) | `^2.31.0` |
| Auth/DB | `@supabase/supabase-js` | `^2.118.0` |
| Lint | ESLint + `typescript-eslint` | `^10.13.0` / `^8.71.2` |

Catatan: `devDependencies` masih memuat `vite`, `@vitejs/plugin-react`, dan `@tailwindcss/vite`. Tooling tersebut **tidak dipakai** oleh alur Next.js saat ini (build memakai `next build` dan PostCSS).

---

## 3. Topologi runtime

```text
┌──────────────────────────────────────────────────────────────────┐
│ Browser (Client Components)                                      │
│  - Landing, Auth, Check-in, Dashboard, Diary                     │
│  - AuthContext (Supabase session)                                │
│  - localStorage: sesi triase & surat dokter                      │
└───────────────┬───────────────────────────────┬──────────────────┘
                │ fetch                          │ supabase-js
                ▼                                ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│ Next.js Route Handlers        │   │ Supabase                      │
│  /api/triage                  │   │  - Auth (email/password)      │
│  /api/chat (GET, POST)        │   │  - Postgres + RLS             │
│  /api/chat/letter (POST)      │   │  - Tabel profiles (dibaca)    │
│  /api/diary (GET, POST)       │   └───────────────────────────────┘
└───────────────┬───────────────┘
                │ @google/genai (opsional)
                ▼
┌───────────────────────────────┐
│ Google Gemini API             │
│  model chain + fallback lokal │
└───────────────────────────────┘
```

Prinsip penting:

- **API key Gemini hanya di server** (`GEMINI_API_KEY`), tidak pernah dikirim ke browser.
- **Supabase anon key** aman di browser karena akses data dibatasi RLS.
- **`SUPABASE_SERVICE_ROLE_KEY`** hanya untuk konteks server (`src/lib/supabase/server.ts`), saat ini belum dipakai oleh route handler mana pun.

---

## 4. Struktur folder

```text
Medivue/
├── docs/                          # Dokumen arsitektur, produk, design system
├── public/
│   ├── Hero.png                   # Background hero landing page
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout: metadata, AuthProvider, ShellLayout, slot @modal
│   │   ├── globals.css            # Tailwind v4, base style, animasi napas, print
│   │   ├── page.tsx               # Landing page
│   │   ├── auth/page.tsx          # Login & registrasi
│   │   ├── checkin/page.tsx       # Entry alur cek gejala (fullscreen)
│   │   ├── dashboard/page.tsx     # Ringkasan riwayat & surat tersimpan
│   │   ├── diary/page.tsx         # Symptom diary
│   │   ├── profile/page.tsx       # Profil penuh (akses langsung / refresh)
│   │   ├── @modal/
│   │   │   ├── default.tsx
│   │   │   └── (.)profile/page.tsx  # Profil sebagai glass modal di atas halaman terakhir
│   │   └── api/
│   │       ├── triage/route.ts
│   │       ├── chat/route.ts
│   │       ├── chat/letter/route.ts
│   │       └── diary/route.ts
│   ├── components/                # Atomic design (lihat src/components/README.md)
│   │   ├── atoms/brand/Logo.tsx
│   │   ├── molecules/triage/{AnxietySlider,RedFlagAlert}.tsx
│   │   ├── organisms/
│   │   │   ├── auth/AuthGuard.tsx
│   │   │   ├── calm/{BreathingExercise,BreathingModal}.tsx
│   │   │   ├── diary/DiaryList.tsx
│   │   │   ├── layout/{Navbar,Footer,BottomNav}.tsx
│   │   │   ├── profile/ProfilePanel.tsx  # Panel profil dipakai halaman penuh & glass modal
│   │   │   ├── triage/{StepChat,InteractiveAiChat,TriageResultCard,DoctorSummaryModal,DoctorLetterModal}.tsx
│   │   │   └── ui/FAB.tsx         # Tombol global "Catatan penting"
│   │   └── templates/ShellLayout.tsx
│   ├── contexts/AuthContext.tsx
│   ├── lib/
│   │   ├── urgency.ts             # Sumber tunggal metadata 4 level urgensi
│   │   ├── storage.ts             # localStorage + migrasi prefix lama, draft check-in, cache profil
│   │   ├── rules/{redFlags,safetyLayer}.ts
│   │   ├── gemini/{client,config,models,prompts,schemas}.ts
│   │   ├── supabase/{client,server}.ts
│   │   └── utils/formatters.ts
│   └── types/{triage,session,letter,user,supabase}.ts
├── supabase/schema.sql            # 4 tabel + RLS
├── .env.local                     # Kredensial lokal (tidak di-commit)
├── next.config.mjs
└── package.json
```

Alias import: `@/*` → `./src/*` (lihat `tsconfig.json`).

---

## 5. Routing dan halaman

| Route | File | Tipe | Akses | Fungsi |
|---|---|---|---|---|
| `/` | `src/app/page.tsx` | Client component | Publik | Landing: hero, 4 level urgensi, cara kerja, fitur, calm support, privasi, FAQ, CTA |
| `/auth` | `src/app/auth/page.tsx` | Client (dibungkus `Suspense`) | Publik | Login/daftar Supabase + Google, redirect via `?redirect=` |
| `/auth/forgot` | `src/app/auth/forgot/page.tsx` | Client | Publik | Minta tautan reset kata sandi ke email |
| `/auth/reset` | `src/app/auth/reset/page.tsx` | Client | Publik (butuh sesi recovery) | Set kata sandi baru dari tautan reset |
| `/checkin` | `src/app/checkin/page.tsx` | Server entry + `StepChat` client | Publik (guest-first) | Alur 5 pertanyaan, review, panggil `/api/triage`, lanjut ke AI chat |
| `/dashboard` | `src/app/dashboard/page.tsx` | Client | **Wajib login** (`AuthGuard`) | Sapaan, ringkasan aksi (2 kolom di mobile), carousel autoplay drag-follow riwayat pengecekan, sebaran urgensi di bawah "Tenangkan diri", latihan napas berupa popup, surat tersimpan; tanpa Footer global |
| `/diary` | `src/app/diary/page.tsx` | Server entry + `DiaryList` client | **Wajib login** (`AuthGuard`) | Catat dan lihat perkembangan gejala harian |
| `/profile` | `src/app/profile/page.tsx` + `src/app/@modal/(.)profile/page.tsx` | Server wrapper + client `ProfilePanel` | **Wajib login** (`AuthGuard`) | Profil akun, kesehatan & preferensi AI; navigasi client membuka glass modal di atas halaman terakhir, akses langsung/refresh memakai halaman penuh tanpa Navbar/Footer/BottomNav |

`ShellLayout` merender `Navbar` dan `Footer` secara global (Footer disembunyikan di **`/dashboard`** agar terasa seperti ruang kerja pribadi). Peringatan batas medis tidak lagi berupa banner di atas halaman, melainkan tombol mengambang **`FAB`** ("Catatan penting") di pojok kanan bawah yang tampil di semua halaman; saat ditekan, catatan tampil sebagai **popup di tengah layar** dengan backdrop blur. Di mobile posisinya naik di atas `BottomNav` bila nav tampil, dan menempel rapat ke sudut saat nav tidak ada (mis. beranda).

Pada viewport mobile (`< md`), navigasi utama dipindahkan ke **`BottomNav`** berupa pill melayang berbahan kaca (`bg-white/55` + `backdrop-blur-2xl`). Halaman aktif ditandai **lingkaran liquid glass** di belakang ikon tab (bukan bubble yang bergeser). Tabnya: **Dashboard**, **Cek**, dan **Diary**; ikon tab Cek memakai `public/favicon.svg` di dalam FAB bulat kaca. Akun/profil tidak lagi punya tab di bottom nav — aksesnya lewat ikon profil di Navbar atas. Profil dibuka sebagai **glass modal** melalui intercepting route `@modal/(.)profile`, sehingga halaman terakhir tetap terlihat blur di belakangnya dan scroll halaman tersebut dikunci selama modal terbuka. `BottomNav` hanya dirender jika **pengguna sudah login** dan **tidak berada di landing page (`/`)**. Top bar mobile tetap ada dalam versi slim (logo + tombol profil saat login / Masuk untuk tamu), sedangkan navigasi desktop tetap di `Navbar`. `ShellLayout` menambahkan padding bawah setinggi bottom nav mengambang + safe area hanya saat nav tampil agar konten dan footer tidak tertutup.

Saat sesi tanya jawab AI (`InteractiveAiChat`) aktif di `/checkin`, komponen tersebut mengirim event `medivue:ai-chat` sehingga `ShellLayout` menyembunyikan Navbar/Footer/BottomNav dan `FAB` bergeser ke posisi kompak di atas bar tanya cepat + tombol kirim.

Metadata halaman:

- Root: title template `%s • Medivue`, theme color `#064e3b`, `lang="id"`.
- `/checkin`: "Cek Gejala".
- `/diary`: "Diary Gejala".
- `/auth` dan `/dashboard` tidak mendefinisikan metadata khusus.

---

## 6. API route handlers

### 6.1 `POST /api/triage`

File: `src/app/api/triage/route.ts`

Input `SymptomPayload`:

```ts
{
  mainSymptom: string;                 // wajib, tidak boleh kosong
  duration?: string;
  severity?: 'ringan' | 'sedang' | 'berat';
  accompanyingSymptoms?: string[];
  anxietyBefore?: number;              // 1–5
  ageRange?: string;
  specialConditions?: string[];
  tonePreference?: 'santai' | 'formal';
  detailPreference?: 'ringkas' | 'detail';
}
```

Alur:

```text
POST /api/triage
   │
   ├─ 1. Validasi mainSymptom
   ├─ 2. checkRedFlags(payload)  ── cocok ──► response darurat deterministik
   │                                           (tanpa memanggil AI)
   ├─ 3. GEMINI_API_KEY tersedia?
   │      ├─ ya  ─► Gemini generateContent (JSON schema, temp 0.2, max 1200)
   │      │          └─ error ─► createFallbackTriageResult()
   │      └─ tidak ─► createFallbackTriageResult()
   └─ 4. validateAndEnforceSafety(aiResult, ruleCheck)
          └─► { success: true, data: TriageResult }
```

Perilaku penting:

- Red flag adalah **hard cut-off**: AI tidak dipanggil, hasil langsung `darurat`.
- Fallback triage memakai heuristik sederhana:
  - `severity === 'berat'` atau durasi mengandung `minggu`/`bulan`/`>3 hari` → `segera`.
  - Teks gejala mengandung `demam`, `batuk`, atau `pusing` → `terjadwal`.
  - Selain itu → `pantau_di_rumah`.
- Pesan error validasi: HTTP 400; error tak terduga: HTTP 500.

### 6.2 `GET /api/chat`

Mengembalikan definisi 5 langkah onboarding (`ChatStep[]`) yang saat ini **tidak dipakai** oleh UI `StepChat` (UI mendefinisikan langkahnya sendiri). Endpoint tetap tersedia sebagai kontrak data.

### 6.3 `POST /api/chat`

Input:

```ts
{
  messages: { role: 'user' | 'assistant'; content: string }[];
  triageContext?: {
    mainSymptom?: string;
    duration?: string;
    severity?: string;
    accompanyingSymptoms?: string[];
    urgencyLevel?: string;
    reasoning?: string;
    nextSteps?: string[];
    doctorSummary?: { summary: string; threeQuestionsForDoctor: string[] };
  };
}
```

Alur:

```text
POST /api/chat
   │
   ├─ Validasi messages (array, tidak kosong)
   ├─ Ambil maksimal 12 pesan historis (MAX_CHAT_HISTORY)
   ├─ GEMINI_API_KEY valid?
   │    ├─ ya  ─► buildChatSystemInstruction(triageContext)
   │    │          └─ generateContent (temp 0.45, max 900)
   │    │             └─ sukses ─► text/plain + header X-AI-Provider: gemini
   │    │             └─ gagal  ─► fallback lokal + X-AI-Provider: fallback
   │    └─ tidak ─► fallback lokal + X-AI-Provider: fallback
   └─► Response body berupa teks biasa
```

Fallback chat adalah **router kata kunci** yang menangani topik: takut penyakit serius, makanan/minuman, obat, kapan ke dokter, cemas/overthinking, pertolongan pertama, dan jawaban umum.

Catatan implementasi:

- Markdown dinormalisasi menjadi teks biasa (`toPlainText`) sebelum dikirim ke model dan pada output fallback.
- UI `InteractiveAiChat` membaca `response.body` sebagai stream pembacaan (chunk), walaupun server mengirim teks utuh. Efeknya teks muncul bertahap sesuai chunk jaringan, bukan token AI.

### 6.4 `POST /api/chat/letter`

File: `src/app/api/chat/letter/route.ts`

Menghasilkan `DoctorLetterData`:

```ts
{
  documentId: string;        // MV-YYYYMMDD-XXXX
  generatedAt: string;
  patientOverview: { ... };
  clinicalSummary: string;
  chatInsights: string[];
  dangerSignsToWatch: string[];
  homeCareTried: string[];
  suggestedQuestionsForDoctor: string[];
  doctorNoteClosing: string;
}
```

- Jika Gemini tersedia: prompt meminta JSON murni, temp 0.2, max 1600 token.
- Jika tidak tersedia / gagal / `clinicalSummary` kosong: `generateFallbackDoctorLetter(...)`.
- Output selalu dinormalisasi dan dilengkapi nilai default di route ini.

### 6.5 `GET/POST /api/diary`

File: `src/app/api/diary/route.ts`

- **Belum terhubung ke Supabase.**
- Memakai array in-memory `localDiaryStore` yang diawali satu entri contoh.
- Data **hilang saat server restart** dan tidak terisolasi per pengguna.
- `GET` mengembalikan seluruh isi store; `POST` menambahkan entri baru di depan array.
- Field: `note`, `severity` (1–5), `symptoms`, `created_at`.

---

## 7. Modul `lib/`

### `urgency.ts`

Sumber tunggal metadata level urgensi untuk landing, dashboard, kartu hasil, dan chat:

```ts
URGENCY_ORDER = ['darurat', 'segera', 'terjadwal', 'pantau_di_rumah']
URGENCY_META[level] = {
  label, shortLabel, description, badgeColor, borderColor,
  bgColor, actionText, timeframe, pillClass, dotClass
}
getUrgencyMeta(level) // fallback ke pantau_di_rumah
```

### `rules/redFlags.ts`

- 7 aturan deterministik: nyeri dada akut, sesak berat, tanda stroke, meningismus, thunderclap headache, anafilaksis berat, kehilangan kesadaran.
- Pencocokan sederhana: gabungan `mainSymptom + accompanyingSymptoms + duration` di-`lowercase`, lalu `includes(keyword)`.
- Mengembalikan `{ hasRedFlag, matchedRule?, emergencyMessage? }`.

### `rules/safetyLayer.ts`

`validateAndEnforceSafety(aiResult, ruleCheck)` melakukan:

1. Override ke `darurat` jika red flag terdeteksi.
2. Mencegah level AI lebih rendah dari ambang aman.
3. Sanitasi pola teks berbahaya (`minum X mg`, `dosis X`, `resepkan`).
4. Menimpa `confidenceNotes` dengan disclaimer tetap: Medivue bukan pengganti diagnosis dokter.

### `gemini/`

| File | Isi |
|---|---|
| `client.ts` | `getGeminiClient()`; timeout 25 detik, retry SDK dimatikan (`attempts: 1`) |
| `config.ts` | `GEMINI_MODEL` default `gemini-3.5-flash`; `GEMINI_FAST_THINKING = { thinkingBudget: 0 }`; `MAX_CHAT_HISTORY = 12` |
| `models.ts` | Rantai fallback model + `isRetryableModelError` + `withModelFallback` |
| `prompts.ts` | `MEDIVUE_CHAT_SYSTEM_PROMPT`, `buildChatSystemInstruction`, `MEDIVUE_SYSTEM_PROMPT`, `buildTriagePrompt` |
| `schemas.ts` | `TRIAGE_JSON_SCHEMA` untuk structured output |

Rantai model (default): `gemini-3.5-flash` → `gemini-3.8-flash` → `gemini-3.7-flash` → `gemini-3.1-flash-lite`.

Error yang dianggap layak retry: `UNAVAILABLE`, `high demand`, `overloaded`, timeout, network error, `429/500/502/503/504`, `NOT_FOUND`, `RESOURCE_EXHAUSTED`. Error konfigurasi langsung dilempar.

### `storage.ts`

- Sesi: `medivue_sessions_<userId|guest>`.
- Surat: `medivue_doctor_letters`.
- Migrasi otomatis dari prefix lama `tenangcek_sessions_*` dan `tenangcek_doctor_letters`.
- Semua operasi dibungkus `try/catch` agar kegagalan penyimpanan tidak memutus alur.

### `supabase/`

- `client.ts`: browser client dengan `NEXT_PUBLIC_SUPABASE_URL` + anon key.
- `server.ts`: `getSupabaseServerClient()` memakai service role key (fallback anon). **Belum dipakai.**

### `utils/formatters.ts`

- `formatDateIndo`, `formatUrgencyBadge`. Sebagian komponen juga mendefinisikan formatter lokal sendiri.

---

## 8. Alur data utama

### 8.1 Check-in dan triage

```text
User
 │
 ▼
/checkin  (StepChat)
 │  stage: intro → questions(1..5) → review
 │  field: mainSymptom, duration, severity,
 │         accompanyingSymptoms, anxietyBefore
 ▼
POST /api/triage
 │
 ├─ checkRedFlags ──► red flag? ──► hasil darurat
 │
 ├─ Gemini structured output (opsional)
 │
 └─ validateAndEnforceSafety
 │
 ▼
TriageResult
 │
 ├─ simpan SessionHistoryItem ke localStorage
 │
 ▼
InteractiveAiChat
 ├─ sidebar: ringkasan triase + breathing exercise
 ├─ chat lanjutan via POST /api/chat
 ├─ tombol "Akhiri & Surat Dokter" → POST /api/chat/letter
 └─ DoctorLetterModal → salin/cetak/PDF → simpan ke localStorage
```

### 8.2 Dashboard

```text
/dashboard
 ├─ readSessions(user?.id)   ──► sesi terakhir, total, sebaran urgensi
 ├─ readLetters()            ──► kartu surat tersimpan
 ├─ DoctorSummaryModal       ──► salin ringkasan dokter
 ├─ DoctorLetterModal        ──► lihat/cetak surat
 └─ BreathingExercise
```

### 8.3 Diary

```text
/diary → DiaryList
 ├─ GET /api/diary           ──► in-memory store
 └─ POST /api/diary          ──► tambah ke in-memory store
```

Tidak ada isolasi per user, tidak ada persistensi database.

### 8.4 Autentikasi

```text
AuthProvider (root layout)
 ├─ supabase.auth.getSession()
 ├─ onAuthStateChange
 ├─ fetchProfile(user.id) → profiles (SELECT *)
 ├─ signIn / signUp / signOut
 ├─ resetPassword(email) → resetPasswordForEmail(redirectTo: origin + /auth/reset)
 ├─ updatePassword(password) → updateUser({ password }) → signOut({ scope: 'others' })
 ├─ signInWithGoogle → supabase.auth.signInWithOAuth({ provider: 'google' })
 │    └─ redirectTo: origin + redirectPath (default /dashboard)
 └─ signUp: insert profiles hanya jika Supabase mengembalikan session
             (jika email confirmation aktif, profil belum dibuat)
```

Alur OAuth Google dan tautan reset sama-sama memakai flow default `implicit` dari `supabase-js`: kembali ke aplikasi dengan token di URL, lalu `detectSessionInUrl` menyimpan sesi. Tidak ada route callback tambahan.

`AuthGuard` (dipakai `/dashboard` dan `/diary`):

```text
 ├─ isLoading → spinner "Memeriksa sesi..."
 ├─ user null → router.replace('/auth?redirect=<pathname>')
 └─ user ada → render halaman
```

#### 8.4.1 Konfigurasi OAuth Google

Wajib disiapkan di dashboard sebelum tombol berfungsi:

1. **Supabase → Authentication → Providers → Google**: aktifkan, isi Client ID & Client Secret.
2. **Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client**:
   - Authorized JavaScript origin: `http://localhost:3000` dan domain produksi.
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. **Supabase → Authentication → URL Configuration → Redirect URLs**:
   - `http://localhost:3000/dashboard` (default login/OAuth) dan domain produksi.
   - `http://localhost:3000/auth/reset` untuk tautan reset kata sandi.
   - Tambahkan wildcard `http://localhost:3000/**` bila memakai `?redirect=` ke path lain.
4. **Supabase → Authentication → Providers → Email**: aktifkan "Confirm email" dan atur minimum password 8 karakter agar konsisten dengan validasi aplikasi.

---

## 9. Keamanan dan etika

| Kontrol | Implementasi saat ini |
|---|---|
| Deteksi darurat deterministik | `redFlags.ts`, dicek sebelum AI |
| AI tidak boleh menurunkan urgensi | `safetyLayer.ts` (ranking + override) |
| Larangan dosis/resep | Prompt + sanitasi regex |
| Disclaimer permanen | `confidenceNotes` ditimpa safety layer; banner & footer |
| Data sensitif | Riwayat di perangkat (localStorage); Supabase RLS untuk tabel yang ada |
| Proteksi halaman | `AuthGuard` mewajibkan login untuk `/dashboard` dan `/diary`; check-in tetap guest-first |
| Reset kata sandi | Tautan sekali pakai via Supabase; pesan netral (anti-enumerasi email); sesi lain dicabut setelah perubahan |
| Kebijakan kata sandi | Minimal 8 karakter untuk daftar & reset (login akun lama tetap menerima kata sandi lama) |
| Redirect aman | `?redirect=` hanya menerima path internal (`/...`, bukan `//...`) |
| API key | Hanya server (`GEMINI_API_KEY`) |

---

## 10. Persistensi dan model data

### 10.1 Yang benar-benar dipakai aplikasi

| Data | Lokasi | Kunci / mekanisme |
|---|---|---|
| Sesi triase | Browser `localStorage` | `medivue_sessions_<userId|guest>` |
| Surat dokter | Browser `localStorage` | `medivue_doctor_letters` |
| Diary | Memori proses server | `localDiaryStore` di route handler |
| Autentikasi | Supabase Auth | Session cookie/token dikelola `supabase-js` |
| Profil | Tabel `profiles` | Hanya dibaca; insert saat sign-up jika session tersedia |

### 10.2 Skema Supabase (tersedia, belum dipakai penuh)

`supabase/schema.sql` membuat:

| Tabel | Kolom utama |
|---|---|
| `profiles` | `id` (= auth.users), `age_range`, `sex`, `conditions[]`, `allergies[]`, `tone_pref`, `detail_pref`, `region`, `uses_bpjs`, timestamps |
| `checkins` | `id`, `user_id`, `anxiety_before` (1–5), `anxiety_after` (1–5), `created_at` |
| `symptom_sessions` | `id`, `user_id`, `symptoms` JSONB, `answers` JSONB, `urgency_level`, `reasoning`, `next_steps` JSONB, `created_at` |
| `diary_entries` | `id`, `user_id`, `session_id`, `note`, `severity` (1–5), `created_at` |

RLS aktif di keempat tabel; policy `FOR ALL` dengan `auth.uid() = id/user_id`. Ada `GRANT` untuk role `authenticated`.

### 10.3 Tipe TypeScript

- `types/triage.ts`: `UrgencyLevel`, `SymptomPayload`, `TriageResult`, `RedFlagRule`, `ChatStep`.
- `types/session.ts`: `SessionHistoryItem` (bentuk data yang disimpan di localStorage).
- `types/letter.ts`: `DoctorLetterData`.
- `types/user.ts`: `UserProfile`, `AnxietyCheckin`, `DiaryEntry`.
- `types/supabase.ts`: definisi `Database` (Row/Insert/Update) untuk 4 tabel.

---

## 11. Variabel lingkungan

| Variabel | Cakupan | Wajib | Dipakai oleh |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Untuk auth | `lib/supabase/client.ts`, `server.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Untuk auth | `lib/supabase/client.ts`, `server.ts` |
| `GEMINI_API_KEY` | Server | Tidak (ada fallback) | `lib/gemini/client.ts`, route handlers |
| `GEMINI_MODEL` | Server | Tidak | `lib/gemini/config.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Tidak | `lib/supabase/server.ts` (belum dipakai) |

---

## 12. Konvensi dan pola kode

- **App Router** dengan `page.tsx` per route; komponen interaktif memakai `'use client'`.
- **Path alias** `@/` untuk seluruh import internal.
- **UI text berbahasa Indonesia**, istilah teknis tetap Inggris.
- **Tailwind utility langsung di JSX**; tidak ada file token terpusat selain beberapa CSS variable di `globals.css`.
- **Metadata level urgensi** dipusatkan di `lib/urgency.ts`, bukan diduplikasi di tiap komponen.
- **Error handling defensif**: `try/catch` pada localStorage, Gemini, dan parsing JSON.
- **AI selalu opsional**: setiap jalur AI memiliki fallback lokal.

---

## 13. Known gaps / technical debt

1. **`AuthGuard` adalah no-op** — semua halaman yang dibungkusnya dapat diakses tanpa login (memang disengaja untuk mode tamu, tetapi tidak ada proteksi untuk data akun).
2. **Diary belum memakai Supabase** — data in-memory, global untuk semua pengguna, hilang saat restart.
3. **Sesi dan surat belum disinkronkan ke Supabase** — hanya localStorage, tidak mengikuti akun di perangkat lain.
4. **`TriageResultCard` tidak terpakai** — hasil triase dirender di `InteractiveAiChat`, bukan komponen ini.
5. **`GET /api/chat` tidak dipakai UI** — definisi langkah ganda antara route dan `StepChat`.
6. **Dua palet untuk level `terjadwal`** — `URGENCY_META` memakai `sky`, sedangkan `TriageResultCard` dan `DoctorLetterModal` memakai `blue`.
7. **Chat bukan streaming token asli** — server mengirim teks utuh; UI membaca chunk jaringan.
8. **Tooling Vite masih ada di devDependencies** meski proyek berjalan di Next.js.
9. **Tidak ada rate limiting / auth pada route AI** — endpoint dapat dipanggil langsung.
10. **Tidak ada test suite** dan belum ada validasi runtime (mis. Zod) untuk payload API.
11. **Profil sign-up bergantung pada session** — jika email confirmation aktif, baris `profiles` tidak dibuat sampai ada alur lanjutan.
12. **`types/supabase.ts` tidak dipakai** untuk membuat typed client; query memakai tipe manual/`as`.
