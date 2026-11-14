'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/atoms/brand/Logo';
import { useAuth } from '@/hooks/useAuth';
import {
  BookHeart,
  ArrowRight,
  LayoutDashboard,
  LogIn,
  UserRound,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/diary', label: 'Diary', icon: BookHeart },
  { href: '/#cara-kerja', label: 'Cara kerja', icon: null },
];

export default function Navbar() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  // Transparan saat di paling atas, solid + blur setelah di-scroll.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      data-global-navbar
      className={`${pathname === '/' ? 'fixed' : 'sticky'} top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 md:h-[4.25rem]">
        <Link href="/" aria-label="Medivue beranda" className="shrink-0">
          <span className="md:hidden">
            <Logo size="sm" />
          </span>
          <span className="hidden md:inline-flex">
            <Logo size="md" />
          </span>
        </Link>

        {!pathname?.startsWith('/checkin') && (
          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition ${
                  isActive(href)
                    ? 'border-brand-500 text-brand-700'
                    : 'border-transparent text-slate-700 hover:border-brand-500/40 hover:text-brand-700'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {/* Tombol masuk mobile khusus tamu di landing page */}
          {!isLoading && !user && pathname === '/' && (
            <Link
              href="/auth"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-700/20 hover:text-brand-700 md:hidden"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              Masuk
            </Link>
          )}

          {/* Tombol profil mobile: ikon akun yang jelas mengarah ke /profile */}
          {!isLoading && user && (
            <Link
              href="/profile"
              aria-label="Buka profil saya"
              title="Profil saya"
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition md:hidden ${
                isActive('/profile')
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-line bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}

          {!pathname?.startsWith('/checkin') && pathname !== '/' && (
            <Link
              href="/checkin"
              className="hidden min-h-11 items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 md:inline-flex"
            >
              Cek gejala
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          {!isLoading && (user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/profile"
                title={user.email ?? 'Akun Medivue'}
                aria-label="Buka profil saya"
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  isActive('/profile')
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-line bg-white text-slate-700 hover:border-brand-300 hover:bg-surface hover:text-brand-700'
                }`}
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Profil
              </Link>
            </div>
          ) : (!pathname?.startsWith('/checkin') && (
            <Link
              href="/auth"
              className="hidden min-h-10 items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-700/20 hover:text-brand-700 md:inline-flex"
            >
              <LogIn className="h-4 w-4" />
              Masuk
            </Link>
          )))}
        </div>
      </div>
    </header>
  );
}
