import Link from 'next/link';
import DiaryList from '@/components/organisms/diary/DiaryList';
import { BookHeart, Info, Wind } from 'lucide-react';
import AuthGuard from '@/components/organisms/auth/AuthGuard';

export const metadata = {
  title: 'Diary Gejala',
  description: 'Catat perubahan gejala dan siapkan ringkasan untuk konsultasi.',
};

export default function DiaryPage() {
  return (
    <AuthGuard>
      <div className="min-h-[70vh] bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
          <div className="mb-7 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-700/10 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700">
              <BookHeart className="h-3.5 w-3.5" /> Ruang catatanmu
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-.04em] text-brand-700 sm:text-4xl">
              Pantau perubahan, pelan-pelan.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Catat apa yang kamu rasakan hari ini. Perubahan kecil bisa membantu kamu menjelaskan
              kondisi saat berkonsultasi.
            </p>
          </div>

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-warning-line/80 bg-warning-soft p-4 text-sm text-warning-strong">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="leading-6">
              <strong>Catatan:</strong> Diary ini membantu merangkum perubahan, bukan menentukan
              diagnosis. Kalau gejala terasa berat, memburuk, atau membuatmu khawatir, hubungi tenaga
              medis.
            </p>
          </div>

          <DiaryList />

          <div className="mt-8 flex items-start gap-3 rounded-2xl bg-surface p-4 text-sm text-brand-700">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700">
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
