'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import BreathingExercise from './BreathingExercise';

interface BreathingModalProps {
  onClose: () => void;
}

/**
 * Popup latihan napas untuk dashboard.
 *
 * Menggantikan accordion inline: latihan dibuka sebagai dialog di atas
 * halaman, dengan scroll halaman di belakangnya dikunci.
 */
export default function BreathingModal({ onClose }: BreathingModalProps) {
  useEffect(() => {
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Latihan napas"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto overscroll-none bg-slate-900/50 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label="Tutup latihan napas"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />

      <div className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-3xl border border-white/70 bg-white p-4 shadow-2xl sm:p-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup latihan napas"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <BreathingExercise />
      </div>
    </div>
  );
}
