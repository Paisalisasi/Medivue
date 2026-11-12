'use client';

import React, { useState } from 'react';
import { X, Copy, Check, FileDown, Stethoscope } from 'lucide-react';

interface Props {
  doctorSummary: {
    summary: string;
    threeQuestionsForDoctor: string[];
  };
  urgencyLabel: string;
  onClose: () => void;
}

export default function DoctorSummaryModal({ doctorSummary, urgencyLabel, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const fullTextToCopy = `[Ringkasan Gejala Medivue untuk Dokter]
Status Triage: ${urgencyLabel}

Ringkasan:
${doctorSummary.summary}

Pertanyaan yang Disiapkan untuk Konsultasi:
1. ${doctorSummary.threeQuestionsForDoctor?.[0] || '-'}
2. ${doctorSummary.threeQuestionsForDoctor?.[1] || '-'}
3. ${doctorSummary.threeQuestionsForDoctor?.[2] || '-'}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullTextToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <Stethoscope className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-base">Ringkasan Konsultasi Dokter</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Bawa atau tunjukkan ringkasan ini saat bertemu tenaga kesehatan di puskesmas, klinik, atau rumah sakit untuk mempermudah komunikasi gejala secara runtut.
        </p>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-xs text-slate-800 space-y-3 font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1 font-sans">
              Gejala & Riwayat:
            </span>
            <p className="font-sans leading-relaxed text-slate-700">{doctorSummary.summary}</p>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1.5 font-sans">
              3 Pertanyaan yang Disarankan:
            </span>
            <ol className="list-decimal pl-4 space-y-1 font-sans text-slate-700">
              {doctorSummary.threeQuestionsForDoctor?.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl bg-[#4B7CB6] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#335581] transition"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Tersalin ke Clipboard!' : 'Salin Ringkasan'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
