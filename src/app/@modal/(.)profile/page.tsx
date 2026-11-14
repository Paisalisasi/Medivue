'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import AuthGuard from '@/components/organisms/auth/AuthGuard';
import ProfilePanel from '@/components/organisms/profile/ProfilePanel';

/**
 * Intercepting route: membuka profil sebagai panel kaca di atas halaman
 * terakhir yang sedang dibuka, tanpa kehilangan konteks halaman tersebut.
 * Akses langsung/refresh ke /profile tetap memakai halaman penuh.
 */
export default function ProfileModalPage() {
  const router = useRouter();

  const close = () => router.back();

  // Kunci scroll halaman terakhir yang ada di belakang modal. Panel profil
  // tetap bisa di-scroll sendiri lewat container overflow-y-auto di bawah.
  useEffect(() => {
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  return (
    <AuthGuard>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Profil pengguna"
        className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto overscroll-none bg-brand-950/30 backdrop-blur-md sm:items-center sm:p-6"
      >
        <button
          type="button"
          aria-label="Tutup profil"
          onClick={close}
          className="absolute inset-0 h-full w-full cursor-default"
        />

        <div className="relative my-0 w-full max-w-3xl overflow-hidden rounded-t-[2rem] border border-white/60 bg-white/60 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 sm:my-6 sm:rounded-[2rem]">
          {/* Kilau lembut di sudut panel. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brand-300/30 blur-3xl"
          />

          <button
            type="button"
            onClick={close}
            aria-label="Tutup profil"
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/75 text-slate-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-slate-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="relative max-h-[92dvh] overflow-y-auto overscroll-contain p-5 sm:p-8">
            <ProfilePanel variant="modal" />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
