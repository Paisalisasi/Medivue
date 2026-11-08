import React from 'react';
import StepChat from '@/components/triage/StepChat';
import AuthGuard from '@/components/auth/AuthGuard';

export const metadata = {
  title: 'Cek Gejala',
  description: 'Lima pertanyaan singkat untuk memahami tingkat urgensi keluhanmu.',
};

export default function CheckinPage() {
  return (
    <AuthGuard>
      <StepChat />
    </AuthGuard>
  );
}
