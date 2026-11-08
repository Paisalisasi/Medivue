import Link from 'next/link';
import DiaryList from '@/components/diary/DiaryList';
import { ArrowLeft, BookHeart, Info, Wind } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';

export const metadata = {
  title: 'Diary Gejala',
  description: 'Catat perubahan gejala dan siapkan ringkasan untuk konsultasi.',
};

export default function DiaryPage() {
  return (
    <AuthGuard>
      <div className="min-h-[70vh] bg-[#f6f8f4]">
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-900"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke dashboard
          </Link>

          <div className="mb-7 mt-7 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <BookHeart className="h-3.5 w-3.5" /> Ruang catatanmu
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-.04em] text-emerald-950 sm:text-4xl">
              Pantau perubahan, pelan-pelan.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Catat apa yang kamu rasakan hari ini. Perubahan kecil bisa membantu kamu menjelaskan
              kondisi saat berkonsultasi.
            </p>
          </div>

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-[#fff8e8] p-4 text-sm text-amber-950">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <p className="leading-6">
              <strong>Catatan:</strong> Diary ini membantu merangkum perubahan, bukan menentukan
              diagnosis. Kalau gejala terasa berat, memburuk, atau membuatmu khawatir, hubungi tenaga
              medis.
            </p>
          </div>

          <DiaryList />

          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#e9f0e2] p-4 text-sm text-emerald-950">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800">
              <Wind className="h-4 w-4" />
            </span>
            <p className="leading-6">
              Kalau mencatat membuatmu makin cemas, berhenti sebentar. Ada latihan napas singkat di{' '}
              <Link href="/dashboard" className="font-semibold underline underline-offset-2">
                dashboard
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
