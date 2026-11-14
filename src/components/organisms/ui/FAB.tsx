'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Info, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * FAB (Floating Action Button) catatan penting.
 *
 * Tombol bulat di kanan bawah tetap menjadi pemicu, tetapi isinya kini
 * tampil sebagai popup di tengah layar agar lebih mudah diperhatikan.
 *
 * Posisi tombol mobile menyesuaikan konteks:
 * - Sesi tanya jawab AI aktif: digeser ke atas agar tidak menutupi bar tanya
 *   cepat dan tombol kirim.
 * - Ada BottomNav (halaman selain beranda): dinaikkan agar tidak tertutup nav.
 * - Tanpa BottomNav (mis. beranda): menempel rapat ke sudut kanan bawah.
 */
export default function FAB() {
  const [open, setOpen] = useState(false);
  const [aiChatActive, setAiChatActive] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const handleAiChat = (event: Event) => {
      const active = (event as CustomEvent<{ active?: boolean }>).detail?.active === true;
      setAiChatActive(active);
    };

    window.addEventListener('medivue:ai-chat', handleAiChat);
    return () => window.removeEventListener('medivue:ai-chat', handleAiChat);
  }, []);

  // Kunci scroll halaman selama popup terbuka, dan tutup dengan Escape.
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Samakan dengan logika ShellLayout: BottomNav tampil untuk pengguna login
  // di halaman selain beranda. Di halaman profil penuh BottomNav disembunyikan,
  // jadi FAB ikut turun ke sudut.
  const showBottomNav =
    Boolean(user) && pathname !== '/' && pathname !== '/profile' && !aiChatActive;

  const positionClass = aiChatActive
    ? 'bottom-[8.5rem] right-4 md:bottom-40 md:right-6'
    : showBottomNav
      ? 'bottom-[calc(6rem+env(safe-area-inset-bottom))] right-5 md:bottom-6 md:right-6'
      : 'bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 md:bottom-6 md:right-6';

  return (
    <>
      <div className={`fixed z-40 ${positionClass}`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Buka catatan penting Medivue"
          title="Catatan penting"
          className={`relative flex items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-700/25 transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
            aiChatActive ? 'h-11 w-11' : 'h-14 w-14'
          }`}
        >
          {/* Denyut halus agar tombol terasa penting, tanpa mengganggu. */}
          {!aiChatActive && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-brand-500/30 [animation-duration:2.8s]"
            />
          )}
          <Info className={aiChatActive ? 'h-5 w-5' : 'h-6 w-6'} aria-hidden="true" />
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-danger ring-2 ring-white"
          />
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Catatan penting"
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto overscroll-none bg-brand-950/40 p-4 backdrop-blur-md"
        >
          <button
            type="button"
            aria-label="Tutup catatan penting"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-danger-soft blur-2xl"
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-danger-soft text-danger-strong ring-1 ring-danger-line">
                  <ShieldAlert className="h-6 w-6" aria-hidden="true" />
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup catatan penting"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-4 text-lg font-semibold text-brand-700">Catatan penting</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Medivue memberi informasi awal, bukan diagnosis. Untuk kondisi darurat, segera ke
                IGD terdekat atau hubungi layanan gawat darurat.
              </p>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
