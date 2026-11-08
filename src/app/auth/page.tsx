'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/brand/Logo';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

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

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
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

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-900"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
      </Link>

      <div className="mt-7 grid overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white shadow-[0_32px_100px_-52px_rgba(6,78,59,.45)] lg:grid-cols-[.95fr_1.05fr]">
        {/* Panel kiri: alasan akun */}
        <aside className="relative hidden overflow-hidden bg-emerald-950 p-9 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full border border-white/10" />

          <div className="relative">
            <Logo size="md" inverted showTagline />
            <h2 className="mt-10 max-w-sm text-3xl font-semibold leading-tight tracking-[-.035em]">
              Riwayat kesehatanmu, lebih rapi dan mudah ditemukan.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-emerald-100/70">
              Akun membuat pengecekan dan catatanmu tersimpan rapi, tanpa mengubah cara Medivue
              membantu — tetap tenang, tetap sederhana.
            </p>

            <ul className="mt-8 space-y-3.5">
              {[
                { icon: HeartPulse, text: 'Riwayat cek gejala dalam satu tempat' },
                { icon: Sparkles, text: 'Ringkasan siap dibawa ke dokter' },
                { icon: ShieldCheck, text: 'Data kesehatan dilindungi Row Level Security' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-emerald-50/90">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-lime-200" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative mt-10 border-t border-white/10 pt-5 text-xs leading-5 text-emerald-100/60">
            Medivue memberi informasi awal, bukan diagnosis. Selalu utamakan pemeriksaan tenaga
            medis.
          </p>
        </aside>

        {/* Panel kanan: form */}
        <div className="p-6 sm:p-9">
          <div className="lg:hidden">
            <Logo size="md" showTagline />
          </div>

          <div className="mt-6 lg:mt-0">
            <h1 className="text-2xl font-semibold tracking-[-.03em] text-emerald-950 sm:text-3xl">
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
                isLogin ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => switchMode(false)}
              aria-pressed={!isLogin}
              className={`rounded-lg py-2.5 transition ${
                !isLogin ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {errorMsg && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs leading-5 text-rose-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs leading-5 text-emerald-800"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
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
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Kata sandi
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-950/10 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
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
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              Privasi data kesehatan dilindungi Row Level Security (RLS).
            </p>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs leading-5 text-slate-500">
              Belum siap punya akun? Kamu tetap bisa{' '}
              <Link href="/checkin" className="font-semibold text-emerald-800 hover:underline">
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
