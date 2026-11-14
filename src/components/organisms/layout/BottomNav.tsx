'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookHeart, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Bottom navigation untuk mobile (< md), hanya untuk pengguna yang login.
 *
 * Halaman aktif ditandai dengan lingkaran liquid glass di belakang ikon,
 * bukan bubble yang bergeser selebar tab. Akun/profil tidak punya tab di
 * sini; aksesnya ada di Navbar atas dan halaman /profile.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const isActive = (key: 'dashboard' | 'checkin' | 'diary') => {
    if (key === 'dashboard') return pathname.startsWith('/dashboard');
    if (key === 'checkin') return pathname.startsWith('/checkin');
    return pathname.startsWith('/diary');
  };

  // Lingkaran kaca untuk tab aktif.
  const glassActive =
    'bg-gradient-to-br from-white/85 via-white/55 to-white/30 ring-2 ring-brand-500/50 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_20px_-10px_rgba(22,39,61,.35)]';

  return (
    <nav
      data-global-bottomnav
      aria-label="Navigasi bawah"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 md:hidden"
    >
      <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/55 shadow-xl shadow-brand-950/10 backdrop-blur-2xl backdrop-saturate-150">
        <div className="relative mx-auto grid h-16 max-w-6xl grid-cols-3 items-center px-2">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            aria-current={isActive('dashboard') ? 'page' : undefined}
            className={`relative z-10 flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
              isActive('dashboard') ? 'text-brand-700' : 'text-slate-500'
            }`}
          >
            <span className="flex h-11 items-center justify-center">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive('dashboard') ? glassActive : 'bg-transparent'
                }`}
              >
                <LayoutDashboard
                  className="h-5 w-5"
                  strokeWidth={isActive('dashboard') ? 2.3 : 1.9}
                />
              </span>
            </span>
            <span>Dashboard</span>
          </Link>

          {/* Cek gejala */}
          <Link
            href="/checkin"
            aria-current={isActive('checkin') ? 'page' : undefined}
            className="relative z-10 flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-bold text-brand-700 transition-colors"
          >
            <span className="flex h-11 items-center justify-center">
              <span
                className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/70 transition-all duration-300 ${
                  isActive('checkin')
                    ? glassActive
                    : 'bg-white/50 ring-1 ring-white/60 backdrop-blur-xl'
                }`}
              >
                <img src="/favicon.svg" alt="" aria-hidden="true" className="h-10 w-10" />
              </span>
            </span>
            <span>Cek</span>
          </Link>

          {/* Diary */}
          <Link
            href="/diary"
            aria-current={isActive('diary') ? 'page' : undefined}
            className={`relative z-10 flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
              isActive('diary') ? 'text-brand-700' : 'text-slate-500'
            }`}
          >
            <span className="flex h-11 items-center justify-center">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive('diary') ? glassActive : 'bg-transparent'
                }`}
              >
                <BookHeart
                  className="h-5 w-5"
                  strokeWidth={isActive('diary') ? 2.3 : 1.9}
                />
              </span>
            </span>
            <span>Diary</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
