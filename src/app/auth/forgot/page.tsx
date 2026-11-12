'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Masukkan alamat email akunmu.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await resetPassword(email.trim());
    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setIsSent(true);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-10 pt-2 sm:px-8 sm:pb-16 sm:pt-4">
      <Link
        href="/auth"
        className="-ml-1.5 inline-flex min-h-11 items-center gap-2 px-1.5 text-sm font-medium text-slate-500 transition hover:text-[#335581]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Kembali ke masuk
      </Link>

      <div className="mt-5 overflow-hidden rounded-[2rem] border border-[#335581]/10 bg-white p-6 shadow-[0_32px_100px_-52px_rgba(6,78,59,.45)] sm:mt-6 sm:p-9">
        <div className="mx-auto max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#335581]/10 bg-[#F4F8EC] px-3 py-1.5 text-xs font-semibold text-[#335581]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Pemulihan akun
          </span>

          <h1 className="mt-4 text-2xl font-semibold tracking-[-.03em] text-[#335581] sm:text-3xl">
            Lupa kata sandi?
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Masukkan email yang kamu pakai untuk masuk. Kami akan mengirim tautan untuk membuat kata
            sandi baru.
          </p>

          {isSent ? (
            <div className="mt-6 space-y-4">
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-[#F4F8EC] p-3.5 text-sm leading-6 text-[#335581]"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>
                  Jika email tersebut terdaftar, tautan reset sudah dikirim. Periksa inbox dan folder
                  spam, lalu ikuti tautan di dalamnya.
                </span>
              </div>
              <Link
                href="/auth"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#4B7CB6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#335581]"
              >
                Kembali ke halaman masuk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {errorMsg && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs leading-5 text-rose-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Alamat email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition focus:border-[#4B7CB6] focus:outline-none focus:ring-2 focus:ring-[#4B7CB6]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4B7CB6] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-950/10 transition hover:bg-[#335581] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Mengirim tautan...
                  </>
                ) : (
                  'Kirim tautan reset'
                )}
              </button>

              <p className="flex items-start gap-2 text-[11px] leading-5 text-slate-500">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4B7CB6]" aria-hidden="true" />
                Demi keamanan, kami tidak memberi tahu apakah sebuah email terdaftar.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
