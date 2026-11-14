'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

interface Props {
  reason: string;
  actionText: string;
}

/**
 * Banner ringkas tanda bahaya. Penjelasan lengkap hanya tampil
 * sebagai popup saat tombol "Lihat penjelasan" diklik, agar tidak
 * memenuhi ruang chat di mobile maupun desktop.
 */
export default function RedFlagAlert({ reason, actionText }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open ]);

  return (
    <>
      <div className="flex items-center gap-2.5 rounded-xl border border-danger-line bg-danger-soft px-3 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger text-white">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-danger-strong sm:text-sm">
          Tanda bahaya terdeteksi — perlu perhatian segera
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="shrink-0 rounded-lg bg-danger px-3 py-1.5 text-xs font-bold text-white transition hover:bg-danger-strong"
        >
          Lihat penjelasan
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Penjelasan tanda bahaya"
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto overscroll-none bg-slate-900/50 p-4"
        >
          <button
            type="button"
            aria-label="Tutup penjelasan"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default"
          />

          <div className="relative w-full max-w-md rounded-2xl border border-danger-line bg-white p-5 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger text-white">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup penjelasan"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-3 inline-block rounded-md bg-danger px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              Tanda Bahaya Terdeteksi
            </p>
            <h3 className="mt-2 text-base font-bold text-danger-strong">
              Segera Cari Pertolongan Medis Darurat (IGD)
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-danger-strong">{reason}</p>

            <div className="mt-4 rounded-xl border border-danger-line bg-danger-soft p-4">
              <h4 className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-danger-strong">
                <AlertTriangle className="h-4 w-4" /> Tindakan yang Harus Dilakukan:
              </h4>
              <p className="text-sm font-semibold text-slate-800">{actionText}</p>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Minta bantuan rekan atau keluarga terdekat untuk segera mendampingi.
            </p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
