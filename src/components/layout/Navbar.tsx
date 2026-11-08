'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookHeart,
  ArrowRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/diary', label: 'Diary', icon: BookHeart },
  { href: '/#cara-kerja', label: 'Cara kerja', icon: null },
];

export default function Navbar() {
  const { user, signOut, isLoading } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-950/5 bg-[#fbfcf8]">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" aria-label="Medivue beranda" className="shrink-0">
          <Logo size="md" showTagline />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition ${
                isActive(href)
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-700 hover:border-emerald-200 hover:text-emerald-900'
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/checkin"
            className="hidden min-h-11 items-center gap-2 rounded-full bg-lime-200/80 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-lime-200 sm:inline-flex"
          >
            Cek gejala
            <ArrowRight className="h-4 w-4" />
          </Link>

          {!isLoading && (user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span
                title={user.email ?? 'Akun Medivue'}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-200 text-sm font-bold text-emerald-950"
              >
                {(user.email?.[0] ?? 'M').toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                aria-label="Keluar dari akun"
                title="Keluar"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="hidden min-h-10 items-center gap-2 rounded-xl border border-emerald-950/10 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-900/20 hover:text-emerald-900 sm:inline-flex"
            >
              <LogIn className="h-4 w-4" />
              Masuk
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-950/10 bg-white text-slate-700 transition hover:bg-emerald-50 md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-menu" className="border-t border-emerald-950/10 bg-[#fbfcf8] px-5 pb-5 pt-3 md:hidden">
          <nav aria-label="Navigasi seluler" className="space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive(href)
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 grid gap-2 border-t border-emerald-950/10 pt-4">
            <Link
              href="/checkin"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-lime-200/80 px-5 py-2.5 text-sm font-semibold text-emerald-950"
            >
              Mulai cek gejala
              <ArrowRight className="h-4 w-4" />
            </Link>
            {!isLoading && (user ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-950/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                <LogOut className="h-4 w-4" />
                Keluar ({user.email})
              </button>
            ) : (
              <Link
                href="/auth"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-950/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                <LogIn className="h-4 w-4" />
                Masuk atau daftar
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
