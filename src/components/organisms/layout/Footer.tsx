import React from 'react';
import Link from 'next/link';
import Logo from '@/components/atoms/brand/Logo';
import { PhoneCall, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer data-global-footer className="mt-auto border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              Pendamping awal untuk memahami urgensi keluhan dan menentukan langkah berikutnya —
              dengan bahasa yang menenangkan, bukan menakut-nakuti.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-xs font-medium text-brand-700">
              <ShieldCheck className="h-4 w-4" />
              Informasi awal, bukan diagnosis medis
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-700">Jelajahi</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/" className="transition hover:text-brand-700">Beranda</Link></li>
              <li><Link href="/#cara-kerja" className="transition hover:text-brand-700">Cara kerja</Link></li>
              <li><Link href="/checkin" className="transition hover:text-brand-700">Cek gejala</Link></li>
              <li><Link href="/diary" className="transition hover:text-brand-700">Symptom diary</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-700">Butuh bantuan?</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Untuk kondisi darurat, jangan menunggu hasil aplikasi.
            </p>
            <a
              href="https://kemkes.go.id/id/layanan-119-terobosan-baru-layanan-kegawatdaruratan-medik-di-indonesia"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-danger px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-danger-strong sm:w-auto"
            >
              <PhoneCall className="h-4 w-4" />
              Hubungi 119
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-200/80 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Medivue. Dibuat untuk membantu, bukan menggantikan tenaga medis.</p>
          <p>Riwayat pengecekan tersimpan di perangkatmu.</p>
        </div>
      </div>
    </footer>
  );
}
