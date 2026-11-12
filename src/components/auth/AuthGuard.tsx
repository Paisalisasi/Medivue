'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  children: React.ReactNode;
}

/**
 * Guard untuk halaman yang wajib login (dashboard & diary).
 *
 * - Saat sesi masih diperiksa, tampilkan state loading agar konten privat
 *   tidak sempat berkedip.
 * - Jika tidak ada user, arahkan ke /auth dengan parameter redirect agar
 *   pengguna kembali ke halaman asal setelah berhasil masuk.
 */
export default function AuthGuard({ children }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || user) return;

    const target = pathname && pathname !== '/auth' ? pathname : '/dashboard';
    router.replace(`/auth?redirect=${encodeURIComponent(target)}`);
  }, [isLoading, user, pathname, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F4F8EC] px-5">
        <div className="inline-flex items-center gap-2.5 rounded-2xl border border-[#335581]/10 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-[#4B7CB6]" aria-hidden="true" />
          Memeriksa sesi...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
