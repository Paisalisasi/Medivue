'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Printer, 
  Copy, 
  Check, 
  X, 
  HeartPulse, 
  Stethoscope, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  FileText,
  LayoutDashboard,
  MessageSquare
} from 'lucide-react';
import type { DoctorLetterData } from '@/types/letter';
import { readLetters, saveLetters } from '@/lib/storage';

interface Props {
  letter: DoctorLetterData;
  onClose: () => void;
}

export default function DoctorLetterModal({ letter, onClose }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'darurat':
        return 'bg-rose-600 text-white border-rose-700';
      case 'segera':
        return 'bg-amber-600 text-white border-amber-700';
      case 'terjadwal':
        return 'bg-blue-600 text-white border-blue-700';
      case 'pantau_di_rumah':
      default:
        return 'bg-[#4B7CB6] text-white border-[#335581]';
    }
  };

  const fullTextToCopy = `=====================================================
LEMBAR CATATAN KELUHAN PASIEN & PENGANTAR KONSULTASI MEDIS
Dihasilkan oleh: Medivue AI Health Companion
=====================================================

No. Dokumen : ${letter.documentId}
Tanggal     : ${letter.generatedAt}
Kategori    : ${letter.patientOverview.urgencyLabel}

A. DATA ANAMNESIS AWAL:
- Keluhan Utama    : ${letter.patientOverview.mainSymptom}
- Durasi Gejala    : ${letter.patientOverview.duration}
- Tingkat Gangguan : ${letter.patientOverview.severity}
- Gejala Penyerta  : ${letter.patientOverview.accompanyingSymptoms.join(', ') || 'Tidak ada keluhan penyerta'}

B. IKHTISAR KLINIS UNTUK DOKTER:
${letter.clinicalSummary}

C. POIN PENTING DARI PERCAKAPAN PASIEN:
${letter.chatInsights.map((pt, i) => `${i + 1}. ${pt}`).join('\n')}

D. TINDAKAN MANDIRI YANG SUDAH DILAKUKAN DI RUMAH:
${letter.homeCareTried.map((hc, i) => `- ${hc}`).join('\n')}

E. TANDA BAHAYA (RED FLAGS) YANG PERLU DIOBSERVASI:
${letter.dangerSignsToWatch.map((ds, i) => `! ${ds}`).join('\n')}

F. PERTANYAAN PASIEN UNTUK KONSULTASI:
${letter.suggestedQuestionsForDoctor.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Catatan:
${letter.doctorNoteClosing}
=====================================================`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullTextToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Gagal menyalin teks surat:', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAndDashboard = () => {
    try {
      const existing = readLetters<DoctorLetterData>();
      saveLetters([letter, ...existing]);
    } catch (e) {
      console.warn('Gagal menyimpan surat ke cache', e);
    }
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        
        {/* Modal Top Bar (Hidden saat di-print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-3.5 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4B7CB6] text-white shadow-xs">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Surat Bahan Bacaan Dokter Pemeriksa
              </h2>
              <p className="text-[11px] text-slate-500">
                Dokumen ringkasan anamnesis & keluhan untuk dibawa ke klinik / faskes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Cetak / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl bg-[#4B7CB6] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#335581] transition"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
              title="Tutup Modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Isi Surat Medis (Print-Ready) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 bg-white print:p-0">
          
          {/* KOP SURAT MEDIS RESMI */}
          <div className="border-b-2 border-slate-800 pb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4B7CB6] text-white shadow-sm print:border print:border-[#335581]">
                  <HeartPulse className="h-7 w-7" />
                </div>
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#4B7CB6] block">
                    Medivue Clinical Triage
                  </span>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                    LEMBAR CATATAN KELUHAN PASIEN
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Bahan Bacaan & Anamnesis Awal untuk Dokter Pemeriksa di Faskes
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-600 space-y-0.5">
                <p className="font-mono text-xs font-bold text-slate-800">
                  ID: {letter.documentId}
                </p>
                <p>{letter.generatedAt}</p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getUrgencyBadge(letter.patientOverview.urgencyLevel)}`}>
                  {letter.patientOverview.urgencyLabel}
                </span>
              </div>
            </div>
          </div>

          {/* TABEL DATA ANAMNESIS AWAL */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Keluhan Utama:
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {letter.patientOverview.mainSymptom}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Durasi Gejala:
              </span>
              <span className="font-semibold text-slate-800">
                {letter.patientOverview.duration}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Derajat Gangguan:
              </span>
              <span className="font-semibold text-slate-800 capitalize">
                {letter.patientOverview.severity}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Gejala Tambahan:
              </span>
              <span className="font-semibold text-slate-800">
                {letter.patientOverview.accompanyingSymptoms.join(', ') || 'Tidak ada'}
              </span>
            </div>
          </div>

          {/* BAGIAN I: IKHTISAR KLINIS NARATIF */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#335581] uppercase tracking-wider border-b border-emerald-100 pb-1">
              <Stethoscope className="h-4 w-4 text-emerald-600" />
              <span>I. Ikhtisar Klinis Pasien (Clinical Summary)</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 bg-[#F4F8EC]/30 p-3.5 rounded-xl border border-emerald-100/60 text-justify">
              {letter.clinicalSummary}
            </p>
          </div>

          {/* BAGIAN II: POIN KUNCI PERCAKAPAN PASIEN */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">
              <MessageSquare className="h-4 w-4 text-slate-500" />
              <span>II. Poin Catatan dari Diskusi Pasien & Keluhan Spesifik</span>
            </div>
            <ul className="space-y-1.5 pl-2 text-xs sm:text-sm text-slate-700">
              {letter.chatInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600 shrink-0">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DUA KOLOM: TINDAKAN MANDIRI & TANDA BAHAYA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tindakan Mandiri */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Upaya Mandiri di Rumah</span>
              </div>
              <ul className="text-xs text-blue-950 space-y-1">
                {letter.homeCareTried.map((care, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-500">✓</span>
                    <span>{care}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tanda Bahaya Yang Diamati */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Tanda Bahaya yang Diobservasi</span>
              </div>
              <ul className="text-xs text-amber-950 space-y-1">
                {letter.dangerSignsToWatch.map((danger, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">!</span>
                    <span>{danger}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* BAGIAN III: REKOMENDASI PERTANYAAN PASIEN KE DOKTER */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wider border-b border-purple-100 pb-1">
              <HelpCircle className="h-4 w-4 text-purple-600" />
              <span>III. Pertanyaan Terarah Pasien untuk Konsultasi Tatap Muka</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Pertanyaan ini disiapkan sistem agar komunikasi pasien dan dokter di ruang periksa menjadi lebih efisien dan terfokus:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-slate-800 font-medium">
              {letter.suggestedQuestionsForDoctor.map((q, idx) => (
                <li key={idx} className="leading-snug">{q}</li>
              ))}
            </ol>
          </div>

          {/* FOOTER KOP & CATATAN PENUTUP */}
          <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <p className="max-w-md italic leading-tight">
              {letter.doctorNoteClosing}
            </p>
            <div className="text-right">
              <span className="font-semibold text-slate-600 block">Sistem Medivue Triase Medis</span>
              <span>Verifikasi Otomatis AI Triage</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls (Hidden saat di-print) */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
          >
            <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
            <span>Lanjut Obrolan Chat</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-[#F4F8EC] px-4 py-2 text-xs font-bold text-[#335581] hover:bg-[#F4F8EC] transition"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Surat'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndDashboard}
              className="flex items-center gap-1.5 rounded-xl bg-[#4B7CB6] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#335581] transition"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Simpan & Selesai</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
