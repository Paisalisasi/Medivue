# Struktur Komponen — Atomic Design

Komponen disusun berdasarkan tingkat kekompleksannya. Setiap level tetap
dikelompokkan per domain agar mudah dicari.

```
src/components/
├── atoms/                  # Elemen dasar, tanpa state bisnis
│   └── brand/Logo.tsx
├── molecules/              # Gabungan atom yang membentuk satu kontrol kecil
│   └── triage/
│       ├── AnxietySlider.tsx
│       └── RedFlagAlert.tsx
├── organisms/              # Bagian UI mandiri yang punya state / perilaku
│   ├── auth/AuthGuard.tsx
│   ├── calm/BreathingExercise.tsx
│   ├── diary/DiaryList.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── BottomNav.tsx
│   ├── triage/
│   │   ├── StepChat.tsx
│   │   ├── InteractiveAiChat.tsx
│   │   ├── TriageResultCard.tsx
│   │   ├── DoctorSummaryModal.tsx
│   │   └── DoctorLetterModal.tsx
│   └── ui/FAB.tsx
└── templates/              # Kerangka halaman global
    └── ShellLayout.tsx
```

## Panduan menambah komponen

| Level | Ciri-ciri | Contoh |
|---|---|---|
| **Atom** | Tidak punya state, hanya menerima props tampilan | ikon, logo, badge, tombol dasar |
| **Molecule** | Menggabungkan beberapa atom menjadi satu kontrol | slider, chip pilihan, alert |
| **Organism** | Punya state, efek, atau alur sendiri; boleh memakai molecule/atom | navbar, modal, daftar diary, alur triase |
| **Template** | Menyusun posisi organism menjadi kerangka halaman | `ShellLayout` |

Aturan import:

- Gunakan alias absolut, mis. `@/components/atoms/brand/Logo`.
- Antar-organism dalam domain yang sama boleh memakai import relatif
  (`./DoctorSummaryModal`).
- Jangan mengimpor organism dari dalam atom atau molecule (arah dependensi
  hanya ke bawah: template → organism → molecule → atom).
- Logika non-UI tetap berada di `src/lib`, `src/hooks`, `src/contexts`, dan
  `src/types` — bukan di dalam folder komponen.
