# Design System Medivue (Updated 2026)

> Dokumen ini mendokumentasikan **design system terbaru** dengan palet biru modern dan gradasi halus.

---

## 1. Prinsip Desain

| Prinsip | Wujud di produk |
|---|---|
| **Tenang & Profesional** | Palet biru samudera, gradasi linear yang halus, tipografi bersih |
| **Transisi Halus** | Antar section menggunakan gradasi linear, bukan garis tegas |
| **Jelas satu langkah** | Satu hasil urgensi, aksi utama dengan warna kontras |

---

## 2. Warna (Palet Baru)

### 2.1 Token Dasar

| Token | Nilai | Penggunaan |
|---|---|---|
| **Primary Blue** | `#4B7CB6` | Aksi utama, ikon aktif, penekanan positif |
| **Dark Blue** | `#335581` | Judul, tombol utama (hover), teks navigasi |
| **Light Gray** | `#D9D9D9` | Latar belakang dasar, border halus |
| **Soft Background** | `#F4F8EC` | Latar belakang section selingan |
| **Dark Text** | `#2C3E50` | Teks utama body |
| **Selection** | `#7FB069` | Seleksi teks |

### 2.2 Gradasi Linear (Smooth Transition)

| Nama | Nilai | Penggunaan |
|---|---|---|
| **Deep Ocean** | `linear-gradient(180deg, #1F3D2B 0%, #0F2418 100%)` | Panel gelap (Auth, Calm Support) |
| **Sky Mist** | `linear-gradient(180deg, #D9D9D9 0%, #F4F8EC 100%)` | Transisi antar section terang |
| **Soft Fade** | `linear-gradient(180deg, #FFFFFF 0%, #D9D9D9 100%)` | Latar belakang kartu dan modal |

---

## 3. Tipografi

- **Font Sans:** System-ui (Inter/Segoe UI stack)
- **Heading:** `font-semibold`, `tracking-tight`
- **Body:** `text-sm leading-6`

---

## 4. Spacing & Radius

- **Radius Kartu:** `rounded-2xl` (16px)
- **Radius Tombol:** `rounded-xl` (12px)
- **Shadow:** Lembut, menggunakan `rgba(51, 85, 129, 0.1)` (Biru Gelap transparan)
