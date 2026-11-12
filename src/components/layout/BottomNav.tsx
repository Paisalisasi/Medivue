'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookHeart,
  HeartPulse,
  Home,
  LayoutDashboard,
  LogOut,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Bottom navigation untuk mobile (< md), hanya untuk pengguna yang login.
 *
 * Indikator halaman aktif berupa "bubble" yang bergeser halus mengikuti
 * posisi tab (translateX 100% per slot), sehingga pengguna selalu tahu
 * sedang berada di halaman mana.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [accountMenu, setAccountMenu] = useState<{ open: boolean; path: string | null }>({
    open: false,
    path: null,
  });

  // Diturunkan dari pathname agar sheet otomatis tertutup saat pengguna
  // berpindah halaman (tanpa setState di dalam effect).
  const accountOpen = accountMenu.open && accountMenu.path === pathname;
  const toggleAccount = () => setAccountMenu({ open: !accountOpen, path: pathname });
  const closeAccount = () => setAccountMenu({ open: false, path: null });

  useEffect(() => {
    if (!accountOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountMenu({ open: false, path: null });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [accountOpen]);

  if (!user) return null;

  const tabKeys = ['home', 'checkin', 'diary', 'account'] as const;

  const isActive = (key: (typeof tabKeys)[number]) => {
    if (key === 'home') return pathname === '/';
    if (key === 'checkin') return pathname.startsWith('/checkin');
    if (key === 'diary') return pathname.startsWith('/diary');
    return false;
  };

  const activeIndex = tabKeys.findIndex((key) => isActive(key));
  const indicatorIndex = accountOpen ? tabKeys.indexOf('account') : activeIndex;
  const displayName = user.email?.split('@')[0] || 'Akun';
  const initial = (user.email?.[0] ?? 'M').toUpperCase();

  const handleSignOut = async () => {
    closeAccount();
    await signOut();
  };

  return (
    <>
      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      >
        <div className="border-t border-[#F4F8EC]/60 bg-[#F4F8EC]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-12px_rgba(6,78,59,.18)] backdrop-blur-xl">
          <div className="relative mx-auto grid h-[4.5rem] max-w-6xl grid-cols-4 items-center px-2">
            {/* Bubble indikator halaman aktif */}
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-2 left-0 w-1/4 px-1 transition-all duration-300 ease-out ${
                indicatorIndex < 0 ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                transform: `translateX(${Math.max(indicatorIndex, 0) * 100}%)`,
              }}
            >
              <span className="block h-full w-full rounded-2xl bg-[#F4F8EC]/90 ring-1 ring-[#F4F8EC]/80" />
            </span>

            {/* Beranda */}
            <Link
              href="/"
              aria-current={isActive('home') ? 'page' : undefined}
              className={`relative z-10 flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                isActive('home') ? 'text-[#335581]' : 'text-slate-500'
              }`}
            >
              <Home className="h-5 w-5" strokeWidth={isActive('home') ? 2.3 : 1.9} />
              <span>Beranda</span>
            </Link>

            {/* Cek gejala */}
            <Link
              href="/checkin"
              aria-current={isActive('checkin') ? 'page' : undefined}
              className={`relative z-10 flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors ${
                isActive('checkin') ? 'text-[#335581]' : 'text-[#335581]'
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4B7CB6] text-white shadow-sm">
                <HeartPulse className="h-4 w-4" strokeWidth={2.3} />
              </span>
              <span>Cek</span>
            </Link>

            {/* Diary */}
            <Link
              href="/diary"
              aria-current={isActive('diary') ? 'page' : undefined}
              className={`relative z-10 flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                isActive('diary') ? 'text-[#335581]' : 'text-slate-500'
              }`}
            >
              <BookHeart
                className="h-5 w-5"
                strokeWidth={isActive('diary') ? 2.3 : 1.9}
              />
              <span>Diary</span>
            </Link>

            {/* Akun */}
            <button
              type="button"
              onClick={toggleAccount}
              aria-expanded={accountOpen}
              aria-controls="bottom-nav-account"
              aria-label="Buka menu akun"
              className={`relative z-10 flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                accountOpen ? 'text-[#335581]' : 'text-slate-500'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4B7CB6] text-[10px] font-bold text-[#335581]">
                {initial}
              </span>
              <span>Akun</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Action sheet akun */}
      {accountOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu akun"
        >
          <button
            type="button"
            aria-label="Tutup menu akun"
            onClick={closeAccount}
            className="absolute inset-0 h-full w-full cursor-default bg-slate-900/40 backdrop-blur-xs"
          />

          <div
            id="bottom-nav-account"
            className="absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-emerald-950/10 bg-white p-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4B7CB6] text-sm font-bold text-[#335581]">
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#335581]">
                  Akun Medivue
                </p>
                <p className="truncate text-sm font-semibold text-[#335581]">
                  {user.email ?? 'Pengguna Medivue'}
                </p>
                <p className="truncate text-[11px] text-slate-500">{displayName}</p>
              </div>
              <button
                type="button"
                onClick={closeAccount}
                aria-label="Tutup menu akun"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              <Link
                href="/dashboard"
                onClick={closeAccount}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4B7CB6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#335581]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Buka dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-5 text-slate-500">
              <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#335581]" />
              Riwayat pengecekan tetap tersimpan di browser perangkat ini.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
