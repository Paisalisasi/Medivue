'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import DisclaimerBanner from './DisclaimerBanner';
import BottomNav from './BottomNav';
import { useAuth } from '@/hooks/useAuth';

/** Route prefixes yang tidak memerlukan Navbar/Footer global */
const FULLSCREEN_ROUTES: string[] = [];

/** Route yang tetap memakai shell global, tetapi tanpa Footer */
const NO_FOOTER_ROUTES = ['/dashboard'];

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isFullscreen = FULLSCREEN_ROUTES.some((route) => pathname?.startsWith(route));
  const hideFooter = NO_FOOTER_ROUTES.some((route) => pathname?.startsWith(route));

  if (isFullscreen) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  // Bottom nav hanya untuk pengguna login dan tidak tampil di landing page.
  const showBottomNav = Boolean(user) && pathname !== '/';

  return (
    <>
      <DisclaimerBanner />
      <Navbar />
      <div
        className={`flex flex-1 flex-col ${
          showBottomNav ? 'pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0' : ''
        }`}
      >
        <main className="flex-1">{children}</main>
        {!hideFooter && <Footer />}
      </div>
      {showBottomNav && <BottomNav />}
    </>
  );
}
