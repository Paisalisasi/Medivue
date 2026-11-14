'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const MIN_DISPLAY_MS = 400;
const FADE_MS = 300;
const NAVIGATION_FALLBACK_MS = 5000;

/** Splash global untuk refresh, login/daftar, dan simpan profil. */
export default function AppSplash() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const shownAt = useRef(0);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const clearTimers = useCallback(() => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    if (removeTimer.current) clearTimeout(removeTimer.current);
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
  }, []);

  const hide = useCallback(() => {
    clearTimers();
    const wait = Math.max(0, MIN_DISPLAY_MS - (Date.now() - shownAt.current));
    fadeTimer.current = setTimeout(() => {
      setFading(true);
      removeTimer.current = setTimeout(() => setVisible(false), FADE_MS);
    }, wait);
  }, [clearTimers]);

  const show = useCallback(() => {
    clearTimers();
    shownAt.current = Date.now();
    setFading(false);
    setVisible(true);
    // Form non-navigasi atau navigasi gagal tidak boleh mengunci layar.
    fallbackTimer.current = setTimeout(hide, NAVIGATION_FALLBACK_MS);
  }, [clearTimers, hide]);

  /** Splash untuk buka/refresh serta aksi eksplisit: auth dan simpan profil. */
  useEffect(() => {
    shownAt.current = Date.now();
    if (document.readyState === 'complete') {
      hide();
    } else {
      window.addEventListener('load', hide, { once: true });
      fallbackTimer.current = setTimeout(hide, 2500);
    }

    const handlePageLoading = (event: Event) => {
      const active = (event as CustomEvent<{ active?: boolean }>).detail?.active === true;
      if (active) show();
      else hide();
    };

    window.addEventListener('medivue:page-loading', handlePageLoading);
    return () => {
      window.removeEventListener('load', hide);
      window.removeEventListener('medivue:page-loading', handlePageLoading);
      clearTimers();
    };
  }, [clearTimers, hide, show]);

  // Pengaman bila aksi yang memicu loading berpindah halaman.
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    hide();
  }, [hide, pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-surface transition-opacity duration-300 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <Logo size="lg" />
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-500" />
    </div>
  );
}
