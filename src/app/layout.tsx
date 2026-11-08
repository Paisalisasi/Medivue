import type { Metadata, Viewport } from 'next';
import './globals.css';
import ShellLayout from '@/components/layout/ShellLayout';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: {
    default: 'Medivue — Pahami keluhan, tentukan langkah',
    template: '%s • Medivue',
  },
  description:
    'Medivue membantu memahami tingkat urgensi keluhan kesehatan dan langkah berikutnya. Informasi awal, bukan pengganti diagnosis tenaga medis.',
  applicationName: 'Medivue',
};

export const viewport: Viewport = {
  themeColor: '#064e3b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col bg-[#f6f8f4] text-slate-900 antialiased selection:bg-lime-200 selection:text-emerald-950">
        <AuthProvider>
          <ShellLayout>{children}</ShellLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
