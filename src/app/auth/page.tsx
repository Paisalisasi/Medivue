'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/atoms/brand/Logo';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

/** Logo Google resmi (empat warna) untuk tombol OAuth. */
function GoogleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.38Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.39l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.94a6 6 0 0 1 0-3.88V7.47H3.06a10 10 0 0 0 0 9.06l3.35-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.5 3.83 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.47l3.35 2.59C7.2 7.7 9.4 5.94 12 5.94Z"
      />
    </svg>
  );
}

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectPath =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/dashboard';

  const switchMode = (nextIsLogin: boolean) => {
    setIsLogin(nextIsLogin);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Mohon isi email dan kata sandi.');
      return;
    }

    if (!isLogin && password.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          const lower = error.message.toLowerCase();
          if (lower.includes('email not confirmed')) {
            setErrorMsg(
              'Email belum dikonfirmasi! Silakan periksa inbox/spam email Anda untuk link konfirmasi, atau matikan opsi "Confirm email" di pengaturan Supabase.'
            );
          } else if (lower.includes('invalid login credentials')) {
            setErrorMsg(
              'Email atau kata sandi tidak cocok. Jika baru mendaftar, pastikan email sudah dikonfirmasi (atau matikan Confirm email di Supabase).'
            );
          } else {
            setErrorMsg(error.message);
          }
        } else {
          router.push(redirectPath);
        }
      } else {
        const { error, session, user } = await signUp(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else if (user && (!user.identities || user.identities.length === 0)) {
          setErrorMsg(
            'Email ini sudah terdaftar sebelumnya. Silakan beralih ke tab Masuk (Login) atau gunakan kata sandi yang sesuai.'
          );
        } else if (!session) {
          // Supabase mewajibkan email confirmation
          setSuccessMsg(
            'Pendaftaran berhasil! Email konfirmasi telah dikirim. Mohon buka email Anda dan klik tautan verifikasi sebelum masuk (atau matikan "Confirm email" di dashboard Supabase untuk testing).'
          );
        } else {
          setSuccessMsg('Pendaftaran berhasil! Mengalihkan ke dashboard...');
          setTimeout(() => {
            router.push(redirectPath);
          }, 1200);
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);

    const { error } = await signInWithGoogle(redirectPath);

    if (error) {
      setErrorMsg(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-2 sm:px-8 sm:pb-16 sm:pt-4">
      <Link
        href="/"
        className="-ml-1.5 inline-flex min-h-11 items-center gap-2 px-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
      </Link>

      <div className="mt-5 grid overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_32px_100px_-52px_rgba(22,39,61,.45)] sm:mt-6 lg:grid-cols-[.95fr_1.05fr]">
        {/* Panel kiri: alasan akun */}
        <aside className="relative hidden overflow-hidden bg-brand-700 p-9 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full border border-white/10" />

          <div className="relative">
            <Logo size="md" inverted />
            <h2 className="mt-10 max-w-sm text-3xl font-semibold leading-tight tracking-[-.035em]">
              Riwayat kesehatanmu, lebih rapi dan mudah ditemukan.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
              Akun membuat pengecekan dan catatanmu tersimpan rapi, tanpa mengubah cara Medivue
              membantu — tetap tenang, tetap sederhana.
            </p>

            <ul className="mt-8 space-y-3.5">
              {[
                { icon: HeartPulse, text: 'Riwayat cek gejala dalam satu tempat' },
                { icon: Sparkles, text: 'Ringkasan siap dibawa ke dokter' },
                { icon: ShieldCheck, text: 'Data kesehatan dilindungi Row Level Security' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-white/90">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
                    <Icon className="h-4 w-4 text-white" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative mt-10 border-t border-white/10 pt-5 text-xs leading-5 text-white/60">
            Medivue memberi informasi awal, bukan diagnosis. Selalu utamakan pemeriksaan tenaga
            medis.
          </p>
        </aside>

        {/* Panel kanan: form */}
        <div className="p-6 sm:p-9">
          <div className="lg:hidden">
            <Logo size="md" />
          </div>

          <div className="mt-6 lg:mt-0">
            <h1 className="text-2xl font-semibold tracking-[-.03em] text-brand-700 sm:text-3xl">
              {isLogin ? 'Selamat datang kembali.' : 'Buat akun Medivue.'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isLogin
                ? 'Masuk untuk melanjutkan riwayat cek gejala dan catatan harianmu.'
                : 'Daftar untuk menyimpan riwayat pengecekan dan diary gejala.'}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => switchMode(true)}
              aria-pressed={isLogin}
              className={`rounded-lg py-2.5 transition ${
                isLogin ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => switchMode(false)}
              aria-pressed={!isLogin}
              className={`rounded-lg py-2.5 transition ${
                !isLogin ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar
            </button>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isGoogleLoading}
              aria-busy={isGoogleLoading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Menghubungkan ke Google...
                </>
              ) : (
                <>
                  <GoogleIcon />
                  {isLogin ? 'Masuk dengan Google' : 'Daftar dengan Google'}
                </>
              )}
            </button>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-semibold uppercase tracking-[.12em] text-slate-400">
                atau dengan email
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-danger-line bg-danger-soft p-3.5 text-xs leading-5 text-danger-strong"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-xl border border-brand-200 bg-surface p-3.5 text-xs leading-5 text-brand-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Alamat email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Kata sandi
                </label>
                {isLogin && (
                  <Link
                    href="/auth/forgot"
                    className="text-xs font-semibold text-brand-700 hover:underline"
                  >
                    Lupa kata sandi?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? 'Kata sandi' : 'Minimal 8 karakter'}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-700/25 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                'Memproses...'
              ) : isLogin ? (
                <>
                  Masuk sekarang <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Buat akun Medivue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="flex items-start gap-2 text-[11px] leading-5 text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
              Privasi data kesehatan dilindungi Row Level Security (RLS).
            </p>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs leading-5 text-slate-500">
              Belum siap punya akun? Kamu tetap bisa{' '}
              <Link href="/checkin" className="font-semibold text-brand-700 hover:underline">
                cek gejala sebagai tamu
              </Link>
              . Riwayat tamu tersimpan di browser perangkat ini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-5 text-sm text-slate-500">
          Memuat halaman masuk...
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
