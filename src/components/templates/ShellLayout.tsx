'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/organisms/layout/Navbar';
import Footer from '@/components/organisms/layout/Footer';
import BottomNav from '@/components/organisms/layout/BottomNav';
import FAB from '@/components/organisms/ui/FAB';
import { useAuth } from '@/hooks/useAuth';

/** Route prefixes yang tampil tanpa Navbar/Footer/BottomNav global */
const FULLSCREEN_ROUTES: string[] = [];

/** Route yang tetap memakai shell global, tetapi tanpa Footer */
const NO_FOOTER_ROUTES = ['/dashboard'];

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [aiChatActive, setAiChatActive] = useState(false);

  // Sembunyikan chrome global saat sesi tanya jawab AI di /checkin sedang aktif.
  useEffect(() => {
    const handleAiChat = (event: Event) => {
      const active = (event as CustomEvent<{ active?: boolean }>).detail?.active === true;
      setAiChatActive(active);
    };

    window.addEventListener('medivue:ai-chat', handleAiChat);
    return () => window.removeEventListener('medivue:ai-chat', handleAiChat);
  }, []);

  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname?.startsWith(route));
  const hideFooter = NO_FOOTER_ROUTES.some((route) => pathname?.startsWith(route));

  if (isFullscreen) {
    return (
      <div className="min-h-screen w-full">
        {children}
        <FAB />
      </div>
    );
  }

  // Bottom nav hanya untuk pengguna login dan tidak tampil di landing page.
  // Saat tanya jawab AI aktif, nav + footer disembunyikan agar ruang chat penuh.
  const showBottomNav = Boolean(user) && pathname !== '/' && !aiChatActive;

  return (
    <>
      {!aiChatActive && <Navbar />}
      <div
        data-shell-content
        className={`flex flex-1 flex-col ${
          showBottomNav ? 'pb-[calc(6.25rem+env(safe-area-inset-bottom))] md:pb-0' : ''
        }`}
      >
        <main className="flex-1">{children}</main>
        {!hideFooter && !aiChatActive && <Footer />}
      </div>
      {showBottomNav && <BottomNav />}
      <FAB />
    </>
  );
}
