import React from 'react';
import Link from 'next/link';
import Logo from '@/components/brand/Logo';
import { PhoneCall, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-emerald-950/10 bg-[#fbfcf8]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo size="md" showTagline />
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              Pendamping awal untuk memahami urgensi keluhan dan menentukan langkah berikutnya —
              dengan bahasa yang menenangkan, bukan menakut-nakuti.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900">
              <ShieldCheck className="h-4 w-4" />
              Informasi awal, bukan diagnosis medis
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-800">Jelajahi</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/" className="transition hover:text-emerald-900">Beranda</Link></li>
              <li><Link href="/#cara-kerja" className="transition hover:text-emerald-900">Cara kerja</Link></li>
              <li><Link href="/checkin" className="transition hover:text-emerald-900">Cek gejala</Link></li>
              <li><Link href="/diary" className="transition hover:text-emerald-900">Symptom diary</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-800">Butuh bantuan?</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Untuk kondisi darurat, jangan menunggu hasil aplikasi.
            </p>
            <a
              href="tel:119"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              <PhoneCall className="h-4 w-4" />
              Hubungi 119
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-emerald-950/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Medivue. Dibuat untuk membantu, bukan menggantikan tenaga medis.</p>
          <p>Riwayat pengecekan tersimpan di perangkatmu.</p>
        </div>
      </div>
    </footer>
  );
}
