import React from 'react';
import StepChat from '@/components/triage/StepChat';

// Metadata halaman di file server component; aturan fast-refresh tidak relevan.
// eslint-disable-next-line react-refresh/only-export-components
export const metadata = {
  title: 'Cek Gejala',
  description: 'Lima pertanyaan singkat untuk memahami tingkat urgensi keluhanmu.',
};

export default function CheckinPage() {
  return <StepChat />;
}
