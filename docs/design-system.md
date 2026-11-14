# Design System Medivue (Updated 2026)

> Dokumen ini mendokumentasikan design system terbaru: **palet biru samudera** dengan
> token semantik untuk tingkat urgensi. Semua warna didefinisikan sekali di
> `src/app/globals.css` melalui `@theme` Tailwind v4.

---

## 1. Prinsip Desain

| Prinsip | Wujud di produk |
|---|---|
| **Tenang & Profesional** | Palet biru samudera, gradasi linear yang halus, tipografi bersih |
| **Transisi Halus** | Antar section menggunakan gradasi linear, bukan garis tegas |
| **Jelas satu langkah** | Satu hasil urgensi, aksi utama dengan warna kontras |

---

## 2. Warna

### 2.1 Token Brand (Biru)

| Token | Nilai | Penggunaan |
|---|---|---|
| `brand-50` | `#F1F6FC` | Latar callout info |
| `brand-100` | `#E2EDF8` | Border/ring halus |
| `brand-200` | `#C4DAEE` | Border state aktif, seleksi teks |
| `brand-300` | `#9CBEE0` | Aksen dekoratif |
| `brand-400` | `#6E9BD1` | Aksen terang |
| `brand-500` | `#4B7CB6` | **Aksi utama**, ikon aktif, fokus ring |
| `brand-600` | `#3E6BA1` | Hover aksen |
| `brand-700` | `#335581` | **Judul**, tombol utama, teks navigasi |
| `brand-800` | `#294263` | Panel gelap |
| `brand-900` | `#1D3350` | Ujung gradasi panel gelap |
| `brand-950` | `#16273D` | Shadow/teks tergelap |

### 2.2 Token Surface & Netral

| Token | Nilai | Penggunaan |
|---|---|---|
| `surface` | `#F6F8FB` | Latar halaman & section |
| `surface-soft` | `#FBFCFE` | Kartu sangat terang |
| `surface-muted` | `#EEF3F9` | Panel/kolom selingan |
| `line` | `#E2E8F0` | Border halus |
| `line-strong` | `#CBD5E1` | Border tegas |
| `slate-*` | Tailwind | Teks body, caption, ikon sekunder |

> Netral memakai skala **slate** bawaan Tailwind. Tidak ada lagi campuran
> hijau/cream pada background maupun teks.

### 2.3 Token Semantik Urgensi

Empat tingkat urgensi memakai empat hue berbeda agar langsung terbaca.

| Level | Token | Nilai | Kelas ringkas |
|---|---|---|---|
| **Darurat** | `danger` | `#E11D48` | `bg-danger`, `bg-danger-soft`, `border-danger-line`, `text-danger-strong` |
| **Segera** | `warning` | `#B45309` | `bg-warning`, `bg-warning-soft`, `border-warning-line`, `text-warning-strong` |
| **Terjadwal** | `brand-500` | `#4B7CB6` | `bg-brand-50`, `border-brand-200`, `text-brand-700` |
| **Pantau di rumah** | `success` | `#15803D` | `bg-success`, `bg-success-soft`, `border-success-line`, `text-success-strong` |

`success` juga dipakai untuk ikon centang/konfirmasi. Sumber kebenaran kelas
per level ada di `src/lib/urgency.ts` (`URGENCY_META`).

### 2.4 Gradasi Linear

| Nama | Nilai | Penggunaan |
|---|---|---|
| **Deep Ocean** | `linear-gradient(180deg, #335581 0%, #16273D 100%)` | Panel gelap (landing CTA, auth) |
| **Sky Mist** | `linear-gradient(180deg, #F6F8FB 0%, #FFFFFF 100%)` | Transisi antar section terang |
| **Soft Fade** | `linear-gradient(180deg, #EEF3F9 0%, #F6F8FB 100%)` | Latar section selingan |

Utility siap pakai: `.section-transition-light`, `.section-transition-white`,
`.section-transition-gray`, `.animate-breathe`.

---

## 3. Tipografi

- **Font Sans:** System-ui (Inter/Segoe UI stack), token `--font-sans`
- **Heading:** `font-semibold`, `tracking-tight`
- **Body:** `text-sm leading-6`

---

## 4. Spacing & Radius

- **Radius Kartu:** `rounded-2xl` (16px)
- **Radius Tombol:** `rounded-xl` (12px)
- **Shadow:** Lembut, menggunakan `rgba(22, 39, 61, 0.1)` (navy transparan)

---

## 5. Aturan Pemakaian

1. Jangan menulis hex langsung di komponen. Gunakan token (`bg-brand-500`,
   `text-slate-700`, `border-line`, dst.).
2. Hijau (`success`) hanya untuk level "Pantau di rumah" dan konfirmasi sukses.
3. Merah (`danger`) khusus darurat/error, amber (`warning`) khusus peringatan.
4. Untuk state aktif gunakan `brand-500`; untuk hover gunakan `brand-700`.
5. Fokus keyboard selalu `outline-brand-500` / `ring-brand-500/20`.
