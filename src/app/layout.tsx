import type { Metadata, Viewport } from 'next';
import './globals.css';
import ShellLayout from '@/components/templates/ShellLayout';
import AppSplash from '@/components/atoms/brand/AppSplash';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: {
    default: 'Medivue',
    template: '%s • Medivue',
  },
  description:
    'Medivue membantu memahami tingkat urgensi keluhan kesehatan dan langkah berikutnya. Informasi awal, bukan pengganti diagnosis tenaga medis.',
  applicationName: 'Medivue',
  icons: {
    icon: '/favicon.svg?v=2',
    shortcut: '/favicon.svg?v=2',
    apple: '/favicon.svg?v=2',
  },
};

export const viewport: Viewport = {
  themeColor: '#335581',
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col bg-surface text-slate-900 antialiased selection:bg-brand-200 selection:text-brand-900">
        <AppSplash />
        <AuthProvider>
          <ShellLayout>
            {children}
            {modal}
          </ShellLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
