'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const { user, isLoading, updatePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter.');
      return;
    }

    if (password !== confirm) {
      setErrorMsg('Konfirmasi kata sandi belum sama.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await updatePassword(password);
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => router.replace('/dashboard'), 1600);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-10 pt-2 sm:px-8 sm:pb-16 sm:pt-4">
      <Link
        href="/auth"
        className="-ml-1.5 inline-flex min-h-11 items-center gap-2 px-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Kembali ke masuk
      </Link>

      <div className="mt-5 overflow-hidden rounded-[2rem] border border-brand-700/10 bg-white p-6 shadow-[0_32px_100px_-52px_rgba(22,39,61,.45)] sm:mt-6 sm:p-9">
        <div className="mx-auto max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-700/10 bg-surface px-3 py-1.5 text-xs font-semibold text-brand-700">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Kata sandi baru
          </span>

          {isLoading ? (
            <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin text-brand-500" aria-hidden="true" />
              Memeriksa tautan reset...
            </div>
          ) : isSuccess ? (
            <div className="mt-6 space-y-4">
              <h1 className="text-2xl font-semibold tracking-[-.03em] text-brand-700 sm:text-3xl">
                Kata sandi diperbarui.
              </h1>
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-xl border border-brand-200 bg-surface p-3.5 text-sm leading-6 text-brand-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                <span>
                  Sesi di perangkat lain sudah dikeluarkan. Kamu akan diarahkan ke dashboard.
                </span>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Buka dashboard
              </Link>
            </div>
          ) : !user ? (
            <div className="mt-6 space-y-4">
              <h1 className="text-2xl font-semibold tracking-[-.03em] text-brand-700 sm:text-3xl">
                Tautan tidak valid atau kedaluwarsa.
              </h1>
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-danger-line bg-danger-soft p-3.5 text-sm leading-6 text-danger-strong"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                <span>
                  Tautan reset hanya bisa dipakai sekali dan memiliki batas waktu. Minta tautan baru
                  untuk melanjutkan.
                </span>
              </div>
              <Link
                href="/auth/forgot"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Minta tautan baru
              </Link>
              <Link
                href="/auth"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Kembali ke halaman masuk
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mt-4 text-2xl font-semibold tracking-[-.03em] text-brand-700 sm:text-3xl">
                Buat kata sandi baru.
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Gunakan minimal 8 karakter. Setelah disimpan, sesi di perangkat lain akan dikeluarkan.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {errorMsg && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-danger-line bg-danger-soft p-3.5 text-xs leading-5 text-danger-strong"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Kata sandi baru
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="new-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Ulangi kata sandi
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-950/10 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan kata sandi baru'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
