'use client';

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
  PhoneCall,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/diary', label: 'Diary', icon: BookHeart },
  { href: '/#cara-kerja', label: 'Cara kerja', icon: null },
];

export default function Navbar() {
  const { user, signOut, isLoading } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-950/5 bg-[#fbfcf8]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 md:h-[4.25rem]">
        <Link href="/" aria-label="Medivue beranda" className="shrink-0">
          <span className="md:hidden">
            <Logo size="sm" />
          </span>
          <span className="hidden md:inline-flex">
            <Logo size="md" showTagline />
          </span>
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
          {/* Aksi darurat tetap terjangkau di top bar mobile */}
          <a
            href="tel:119"
            aria-label="Hubungi darurat 119"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 md:hidden"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            119
          </a>

          {/* Tombol masuk mobile khusus tamu di landing page */}
          {!isLoading && !user && pathname === '/' && (
            <Link
              href="/auth"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-emerald-950/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-900/20 hover:text-emerald-900 md:hidden"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              Masuk
            </Link>
          )}

          {/* Shortcut dashboard di mobile saat sudah login */}
          {!isLoading && user && (
            <Link
              href="/dashboard"
              aria-label="Buka dashboard"
              title="Buka dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-200 text-sm font-bold text-emerald-950 transition hover:bg-lime-300 md:hidden"
            >
              {(user.email?.[0] ?? 'M').toUpperCase()}
            </Link>
          )}

          <Link
            href="/checkin"
            className="hidden min-h-11 items-center gap-2 rounded-full bg-lime-200/80 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-lime-200 md:inline-flex"
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
              className="hidden min-h-10 items-center gap-2 rounded-xl border border-emerald-950/10 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-900/20 hover:text-emerald-900 md:inline-flex"
            >
              <LogIn className="h-4 w-4" />
              Masuk
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
