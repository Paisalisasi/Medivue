'use client';

import React from 'react';
import { ShieldAlert, PhoneCall, AlertTriangle } from 'lucide-react';

interface Props {
  reason: string;
  actionText: string;
}

export default function RedFlagAlert({ reason, actionText }: Props) {
  return (
    <div className="rounded-2xl border-2 border-danger bg-danger-soft p-6 shadow-md text-danger-strong">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-danger text-white shadow-sm">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-danger px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              Tanda Bahaya Terdeteksi
            </span>
            <span className="text-xs font-semibold text-danger-strong">Level Darurat</span>
          </div>

          <h3 className="mt-2 text-lg font-bold text-danger-strong">
            Segera Cari Pertolongan Medis Darurat (IGD)
          </h3>

          <p className="mt-1 text-sm text-danger-strong leading-relaxed">
            {reason}
          </p>

          <div className="mt-4 rounded-xl bg-white/90 p-4 border border-danger-line">
            <h4 className="text-xs font-bold uppercase tracking-wider text-danger-strong mb-1 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Tindakan yang Harus Dilakukan:
            </h4>
            <p className="text-sm font-semibold text-slate-800">{actionText}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href="tel:119"
              className="inline-flex items-center gap-2 rounded-xl bg-danger px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-danger-strong transition"
            >
              <PhoneCall className="h-4 w-4" />
              Hubungi Kedaruratan Medis 119
            </a>
            <span className="text-xs text-danger-strong">
              Minta bantuan rekan atau keluarga terdekat untuk segera mendampingi.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
