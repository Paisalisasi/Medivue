'use client';

import React, { useState } from 'react';
import type { TriageResult } from '@/types/triage';
import { URGENCY_META } from '@/lib/urgency';
import { 
  AlertTriangle, 
  Clock, 
  CalendarCheck, 
  Home, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import DoctorSummaryModal from './DoctorSummaryModal';

interface Props {
  result: TriageResult;
}

export default function TriageResultCard({ result }: Props) {
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const config = URGENCY_META[result.urgencyLevel] ?? URGENCY_META.pantau_di_rumah;

  const getUrgencyIcon = () => {
    switch (result.urgencyLevel) {
      case 'darurat':
        return <ShieldAlert className="h-6 w-6 text-danger" />;
      case 'segera':
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      case 'terjadwal':
        return <CalendarCheck className="h-6 w-6 text-brand-600" />;
      case 'pantau_di_rumah':
        return <Home className="h-6 w-6 text-success" />;
    }
  };

  return (
    <div className={`overflow-hidden rounded-2xl border-2 ${config.borderColor} bg-white shadow-sm transition-all`}>
      {/* Header Level Urgensi */}
      <div className={`p-5 sm:p-6 border-b ${config.bgColor}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-xs">
              {getUrgencyIcon()}
            </div>
            <div>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${config.badgeColor}`}>
                {config.label}
              </span>
              <p className="mt-1 text-xs text-slate-500 font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Waktu tindakan: <strong className="text-slate-700">{config.timeframe}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDoctorModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <FileText className="h-4 w-4 text-brand-600" />
            <span>Ringkasan untuk Dokter</span>
          </button>
        </div>

        {/* Tindakan Utama */}
        <div className="mt-4 rounded-xl bg-white/90 p-3.5 border border-slate-200/80">
          <p className="text-xs text-slate-500 font-medium">Langkah Utama:</p>
          <p className="text-sm sm:text-base font-bold text-slate-800">{config.actionText}</p>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* 1. Alasan Singkat */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-slate-400" />
            Kenapa Saya Mendapat Hasil Ini?
          </h3>
          <p className="text-sm leading-relaxed text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            {result.reasoning}
          </p>
        </div>

        {/* 2. Kemungkinan Paling Umum (Kelaziman, bukan penyakit seram) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-brand-500" />
            Kemungkinan Penyebab Paling Lazim
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.commonCauses?.map((cause, idx) => (
              <div key={idx} className="flex items-start gap-2 rounded-lg bg-surface/50 p-2.5 text-xs text-brand-700 border border-brand-100">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" />
                <span>{cause}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Tanda Bahaya (Kapan Harus Naik Level) */}
        {result.dangerSignsToWatch?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-danger mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-danger" />
              Tanda Bahaya: Kapan Harus Segera ke Faskes?
            </h3>
            <ul className="space-y-1.5 rounded-xl bg-danger-soft/40 p-3.5 border border-danger-line text-xs text-danger-strong">
              {result.dangerSignsToWatch.map((sign, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. Tindakan Konkret Berikutnya */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4 text-slate-500" />
            Langkah Konkret yang Bisa Dilakukan Sekarang
          </h3>
          <div className="space-y-2">
            {result.nextSteps?.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-brand-500">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Calm Support Reassurance Message */}
        {result.calmSupport?.message && (
          <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-xs text-brand-900 flex items-start gap-3">
            <span className="text-xl">🌿</span>
            <div>
              <span className="font-semibold block mb-0.5">Catatan Penenang:</span>
              <p className="leading-relaxed">{result.calmSupport.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Ringkasan Dokter */}
      {showDoctorModal && (
        <DoctorSummaryModal
          doctorSummary={result.doctorSummary}
          urgencyLabel={config.label}
          onClose={() => setShowDoctorModal(false)}
        />
      )}
    </div>
  );
}
