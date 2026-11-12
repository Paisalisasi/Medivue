'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  Loader2,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Wind,
} from 'lucide-react';
import Logo from '@/components/brand/Logo';
import AnxietySlider from './AnxietySlider';
import InteractiveAiChat from './InteractiveAiChat';
import { useAuth } from '@/hooks/useAuth';
import { readSessions, saveSessions } from '@/lib/storage';
import type { SymptomPayload, TriageResult } from '@/types/triage';
import type { SessionHistoryItem } from '@/types/session';

type Stage = 'intro' | 'questions' | 'review';

const TOTAL_STEPS = 5;
const NO_ACCOMPANYING = 'Tidak ada keluhan lain';

const INITIAL_FORM: SymptomPayload = {
  mainSymptom: '',
  duration: '',
  severity: 'sedang',
  accompanyingSymptoms: [],
  anxietyBefore: 3,
};

const STEP_META = [
  { title: 'Gejala utama', helper: 'Mulai dari yang paling terasa.' },
  { title: 'Durasi', helper: 'Seberapa lama sudah berlangsung?' },
  { title: 'Keparahan', helper: 'Seberapa mengganggu aktivitasmu?' },
  { title: 'Gejala penyerta', helper: 'Boleh lebih dari satu.' },
  { title: 'Tingkat kecemasan', helper: 'Supaya kami bisa menyesuaikan nada.' },
];

const SYMPTOM_CHIPS = [
  'Sakit kepala',
  'Demam',
  'Batuk & pilek',
  'Nyeri perut',
  'Pusing / kleyengan',
  'Nyeri dada tertekan',
  'Mual & muntah',
];

const DURATION_OPTIONS = [
  'Baru beberapa jam',
  '1 – 2 hari',
  '3 – 5 hari',
  'Lebih dari 1 minggu',
];

const SEVERITY_OPTIONS: {
  value: NonNullable<SymptomPayload['severity']>;
  label: string;
  description: string;
  tone: string;
}[] = [
  {
    value: 'ringan',
    label: 'Ringan',
    description: 'Masih bisa beraktivitas seperti biasa.',
    tone: 'border-emerald-200 bg-[#F4F8EC]/60 text-[#335581]',
  },
  {
    value: 'sedang',
    label: 'Sedang',
    description: 'Cukup mengganggu, butuh istirahat sesekali.',
    tone: 'border-amber-200 bg-amber-50/60 text-[#335581]',
  },
  {
    value: 'berat',
    label: 'Berat',
    description: 'Sangat mengganggu, sulit beraktivitas.',
    tone: 'border-rose-200 bg-rose-50/60 text-rose-950',
  },
];

const ACCOMPANYING_OPTIONS = [
  NO_ACCOMPANYING,
  'Badan lemas',
  'Nafsu makan turun',
  'Nyeri otot / pegal',
  'Sulit tidur',
  'Mual',
  'Demam',
];

const ANXIETY_LABELS = ['Sangat tenang', 'Sedikit khawatir', 'Cukup cemas', 'Cemas tinggi', 'Sangat panik'];

export default function StepChat() {
  const { user } = useAuth();
  const [stage, setStage] = useState<Stage>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState<SymptomPayload>(INITIAL_FORM);
  const [symptomInput, setSymptomInput] = useState('');
  const [accompanyingInput, setAccompanyingInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateForm = (patch: Partial<SymptomPayload>) => {
    setFormData((previous) => ({ ...previous, ...patch }));
  };

  const startQuestions = () => {
    setSymptomInput(formData.mainSymptom ?? '');
    setErrorMessage(null);
    setStage('questions');
  };

  const goToStep = (index: number) => {
    if (index < 0 || index > stepIndex) return;
    setStepIndex(index);
    setErrorMessage(null);
    if (index === 0) setSymptomInput(formData.mainSymptom ?? '');
  };

  const toggleAccompanying = (symptom: string) => {
    setFormData((previous) => {
      const current = previous.accompanyingSymptoms ?? [];

      if (symptom === NO_ACCOMPANYING) {
        return { ...previous, accompanyingSymptoms: current.includes(symptom) ? [] : [symptom] };
      }

      const withoutNone = current.filter((item) => item !== NO_ACCOMPANYING);
      const next = withoutNone.includes(symptom)
        ? withoutNone.filter((item) => item !== symptom)
        : [...withoutNone, symptom];

      return { ...previous, accompanyingSymptoms: next };
    });
  };

  const addCustomAccompanying = () => {
    const value = accompanyingInput.trim();
    if (!value) return;

    setFormData((previous) => {
      const current = (previous.accompanyingSymptoms ?? []).filter(
        (item) => item !== NO_ACCOMPANYING
      );
      return {
        ...previous,
        accompanyingSymptoms: current.includes(value) ? current : [...current, value],
      };
    });
    setAccompanyingInput('');
  };

  const handleNext = () => {
    setErrorMessage(null);

    if (stepIndex === 0) {
      const value = symptomInput.trim();
      if (!value) {
        setErrorMessage('Tuliskan atau pilih keluhan utama terlebih dahulu.');
        return;
      }
      updateForm({ mainSymptom: value });
    }

    if (stepIndex === 1 && !formData.duration) {
      setErrorMessage('Pilih perkiraan durasi gejalanya.');
      return;
    }

    if (stepIndex === 3) {
      const custom = accompanyingInput.trim();
      if (custom) addCustomAccompanying();
    }

    if (stepIndex === TOTAL_STEPS - 1) {
      setStage('review');
      return;
    }

    setStepIndex((index) => index + 1);
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (stepIndex === 0) {
      setStage('intro');
      return;
    }
    setStepIndex((index) => index - 1);
  };

  const editStep = (index: number) => {
    setStepIndex(index);
    setStage('questions');
    if (index === 0) setSymptomInput(formData.mainSymptom ?? '');
  };

  const submitTriage = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Gagal memproses data gejala');
      }

      setResult(json.data as TriageResult);

      try {
        const session: SessionHistoryItem = {
          id: `session-${Date.now()}`,
          symptomName: formData.mainSymptom,
          duration: formData.duration || 'Beberapa saat',
          urgencyLevel: json.data.urgencyLevel,
          reasoning: json.data.reasoning,
          createdAt: new Date().toISOString(),
          doctorSummary: json.data.doctorSummary,
        };
        const existing = readSessions<SessionHistoryItem>(user?.id);
        saveSessions(user?.id, [session, ...existing]);
      } catch (storageError) {
        console.warn('Gagal menyimpan sesi ke riwayat lokal:', storageError);
      }
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Terjadi gangguan jaringan. Coba lagi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setStage('intro');
    setStepIndex(0);
    setFormData(INITIAL_FORM);
    setSymptomInput('');
    setAccompanyingInput('');
    setErrorMessage(null);
  };

  if (result) {
    return (
      <div className="h-dvh w-full overflow-hidden">
        <InteractiveAiChat result={result} formData={formData} onReset={handleReset} />
      </div>
    );
  }

  const progress = stage === 'review' ? 100 : ((stepIndex + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="flex min-h-dvh flex-col bg-[#F4F8EC]">
      {stage === 'intro' && (
        <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#335581]">
            <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
          </Link>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#335581]">
                <HeartPulse className="h-3.5 w-3.5" />
                Cek gejala · sekitar 2 menit
              </span>
              <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-.045em] text-[#335581] sm:text-5xl">
                Sebelum mulai, tarik napas sebentar.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Kami akan menanyakan lima hal sederhana tentang keluhanmu. Tidak ada jawaban yang
                salah — jawab sejujur yang kamu bisa.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  'Pertanyaan bertahap, bisa kembali kapan saja',
                  'Tanda bahaya diperiksa lebih dulu',
                  'Kamu tetap yang menentukan langkah berikutnya',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F4F8EC] text-[#4B7CB6]">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={startQuestions}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#4B7CB6] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#335581]"
                >
                  Mulai cek gejala <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  href="/#cara-kerja"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-emerald-950/15 bg-white px-5 py-3 text-sm font-semibold text-[#335581] transition hover:bg-[#F4F8EC]"
                >
                  Lihat cara kerjanya
                </Link>
              </div>

              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4B7CB6]" />
                Bisa dimulai tanpa akun. Riwayat tersimpan di browser perangkat ini.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[#335581]/10 bg-white p-6 shadow-[0_24px_80px_-40px_rgba(6,78,59,.35)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4B7CB6]">Setelah selesai</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4B7CB6]/10 text-[#335581]">
                  <ClipboardList className="h-4 w-4" />
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-[#335581]">
                Kamu akan mendapat tiga hal
              </h2>

              <div className="mt-5 space-y-3">
                {[
                  { icon: Sparkles, title: 'Tingkat urgensi', text: 'Darurat, segera, terjadwal, atau pantau di rumah.' },
                  { icon: CheckCircle2, title: 'Langkah awal', text: 'Saran praktis dan tanda yang perlu diwaspadai.' },
                  { icon: ClipboardList, title: 'Ringkasan dokter', text: 'Catatan siap dibawa saat konsultasi.' },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-3 rounded-2xl bg-[#F4F8EC] p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#4B7CB6] shadow-sm">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#335581]">{title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-600">{text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-teal-100 bg-teal-50/70 p-3 text-[11px] leading-5 text-teal-900">
                <Wind className="mt-0.5 h-4 w-4 shrink-0" />
                Ada latihan napas singkat kalau kamu butuh jeda.
              </div>

              <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">
                Hasil Medivue adalah panduan awal, bukan diagnosis. Untuk kondisi darurat, segera ke
                IGD atau hubungi 119.
              </p>
            </div>
          </div>
        </div>
      )}

      {stage === 'questions' && (
        <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[.34fr_.66fr]">
            <aside className="hidden lg:block">
              <button
                type="button"
                onClick={() => setStage('intro')}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#335581]"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali
              </button>

              <div className="mt-6 rounded-2xl border border-[#335581]/10 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4B7CB6]">Progres check-in</p>
                <p className="mt-1 text-sm text-slate-500">
                  Langkah {stepIndex + 1} dari {TOTAL_STEPS}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#4B7CB6] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>

                <ol className="mt-5 space-y-1">
                  {STEP_META.map((step, index) => {
                    const isDone = index < stepIndex;
                    const isActive = index === stepIndex;
                    return (
                      <li key={step.title}>
                        <button
                          type="button"
                          onClick={() => goToStep(index)}
                          disabled={index > stepIndex}
                          className={`flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition ${
                            isActive ? 'bg-[#F4F8EC]' : isDone ? 'hover:bg-slate-50' : 'opacity-60'
                          }`}
                        >
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            isDone
                              ? 'bg-[#4B7CB6] text-white'
                              : isActive
                                ? 'bg-[#4B7CB6] text-white'
                                : 'bg-slate-100 text-slate-500'
                          }`}>
                            {isDone ? <Check className="h-3 w-3" /> : index + 1}
                          </span>
                          <span>
                            <span className={`block text-xs font-semibold ${isActive ? 'text-[#335581]' : 'text-slate-700'}`}>
                              {step.title}
                            </span>
                            <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{step.helper}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="mt-4 rounded-2xl border border-[#335581]/20 bg-[#F4F8EC] p-4">
                <p className="text-xs font-semibold text-[#335581]">Gejala terasa darurat?</p>
                <p className="mt-1 text-[11px] leading-5 text-[#335581]/80">
                  Jangan menunggu hasil aplikasi. Segera cari bantuan medis.
                </p>
                <a href="tel:119" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline">
                  <PhoneCall className="h-3.5 w-3.5" /> Hubungi 119
                </a>
              </div>
            </aside>

            <main>
              <div className="mb-4 flex items-center justify-between lg:hidden">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Kembali
                </button>
                <span className="text-xs font-semibold text-[#335581]">
                  {stepIndex + 1} / {TOTAL_STEPS}
                </span>
              </div>

              <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-200/70 lg:hidden">
                <div className="h-full rounded-full bg-[#4B7CB6] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>

              <div className="rounded-[1.75rem] border border-[#335581]/10 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F8EC] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#335581]">
                    <Sparkles className="h-3 w-3" />
                    Langkah {stepIndex + 1}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">{STEP_META[stepIndex].title}</span>
                </div>

                <h1 className="mt-4 text-2xl font-semibold tracking-[-.03em] text-[#335581] sm:text-3xl">
                  {stepIndex === 0 && 'Apa yang paling kamu rasakan sekarang?'}
                  {stepIndex === 1 && 'Sudah berapa lama gejala ini berlangsung?'}
                  {stepIndex === 2 && 'Seberapa besar gejala mengganggu aktivitasmu?'}
                  {stepIndex === 3 && 'Ada gejala lain yang menyertai?'}
                  {stepIndex === 4 && 'Seberapa cemas kamu tentang kondisi ini?'}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {stepIndex === 0 && 'Ceritakan dengan bahasamu sendiri, atau pilih salah satu pilihan cepat.'}
                  {stepIndex === 1 && 'Perkiraan saja sudah cukup. Ini membantu menentukan seberapa cepat langkah yang dibutuhkan.'}
                  {stepIndex === 2 && 'Pilih yang paling menggambarkan kondisimu saat ini, bukan yang paling buruk.'}
                  {stepIndex === 3 && 'Pilih semua yang terasa. Kalau tidak ada, pilih “Tidak ada keluhan lain”.'}
                  {stepIndex === 4 && 'Tidak ada jawaban benar atau salah. Kami memakai ini untuk menyesuaikan nada dan saran.'}
                </p>

                <div className="mt-6">
                  {stepIndex === 0 && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={symptomInput}
                        onChange={(event) => setSymptomInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') handleNext();
                        }}
                        placeholder="Contoh: sakit kepala sejak semalam"
                        autoFocus
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-[#4B7CB6]/20"
                      />
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Pilihan cepat</p>
                        <div className="flex flex-wrap gap-2">
                          {SYMPTOM_CHIPS.map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => setSymptomInput(chip)}
                              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                                symptomInput === chip
                                  ? 'border-emerald-300 bg-[#F4F8EC] text-[#335581]'
                                  : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-emerald-300 hover:bg-[#F4F8EC]'
                              }`}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {stepIndex === 1 && (
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {DURATION_OPTIONS.map((option) => {
                        const selected = formData.duration === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateForm({ duration: option })}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-medium transition ${
                              selected
                                ? 'border-emerald-400 bg-[#F4F8EC] text-[#335581]'
                                : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-emerald-300 hover:bg-[#F4F8EC]/60'
                            }`}
                          >
                            {option}
                            <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-emerald-600 bg-[#4B7CB6] text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                              <Check className="h-3 w-3" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {stepIndex === 2 && (
                    <div className="space-y-2.5">
                      {SEVERITY_OPTIONS.map((option) => {
                        const selected = (formData.severity ?? 'sedang') === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateForm({ severity: option.value })}
                            className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
                              selected ? option.tone : 'border-slate-200 bg-slate-50/60 hover:border-emerald-200 hover:bg-[#F4F8EC]/40'
                            }`}
                          >
                            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-emerald-600 bg-[#4B7CB6] text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                              <Check className="h-3 w-3" />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold">{option.label}</span>
                              <span className="mt-0.5 block text-xs leading-5 opacity-80">{option.description}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {stepIndex === 3 && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {ACCOMPANYING_OPTIONS.map((option) => {
                          const selected = (formData.accompanyingSymptoms ?? []).includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleAccompanying(option)}
                              className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                                selected
                                  ? 'border-emerald-300 bg-[#F4F8EC] text-[#335581]'
                                  : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-emerald-300 hover:bg-[#F4F8EC]'
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={accompanyingInput}
                          onChange={(event) => setAccompanyingInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              addCustomAccompanying();
                            }
                          }}
                          placeholder="Gejala lain (opsional)"
                          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-[#4B7CB6]/20"
                        />
                        <button
                          type="button"
                          onClick={addCustomAccompanying}
                          disabled={!accompanyingInput.trim()}
                          className="shrink-0 rounded-xl border border-[#335581]/10 bg-white px-4 py-2.5 text-xs font-semibold text-[#335581] transition hover:bg-[#F4F8EC] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Tambah
                        </button>
                      </div>
                    </div>
                  )}

                  {stepIndex === 4 && (
                    <div>
                      <AnxietySlider
                        value={formData.anxietyBefore ?? 3}
                        onChange={(value) => updateForm({ anxietyBefore: value })}
                      />
                      <p className="mt-3 text-center text-xs text-slate-500">
                        Kamu memilih: <span className="font-semibold text-[#335581]">{ANXIETY_LABELS[(formData.anxietyBefore ?? 3) - 1]}</span>
                      </p>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">!</span>
                    {errorMessage}
                  </div>
                )}

                <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Kembali
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#4B7CB6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#335581]"
                  >
                    {stepIndex === TOTAL_STEPS - 1 ? 'Tinjau jawaban' : 'Lanjut'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      {stage === 'review' && (
        <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
          <button
            type="button"
            onClick={() => editStep(TOTAL_STEPS - 1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#335581]"
          >
            <ArrowLeft className="h-4 w-4" /> Ubah jawaban
          </button>

          <div className="mt-6 rounded-[1.75rem] border border-[#335581]/10 bg-white p-5 shadow-sm sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F8EC] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#335581]">
              <ClipboardList className="h-3.5 w-3.5" />
              Tinjau jawaban
            </span>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-.03em] text-[#335581] sm:text-3xl">
              Sebentar lagi selesai.
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Periksa kembali jawabanmu. Kamu masih bisa mengubahnya sebelum analisis dimulai.
            </p>

            <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              {[
                { label: 'Keluhan utama', value: formData.mainSymptom || '—', step: 0 },
                { label: 'Durasi', value: formData.duration || '—', step: 1 },
                { label: 'Keparahan', value: SEVERITY_OPTIONS.find((option) => option.value === (formData.severity ?? 'sedang'))?.label ?? '—', step: 2 },
                {
                  label: 'Gejala penyerta',
                  value: formData.accompanyingSymptoms?.length ? formData.accompanyingSymptoms.join(', ') : 'Tidak ada',
                  step: 3,
                },
                {
                  label: 'Tingkat kecemasan',
                  value: `${formData.anxietyBefore ?? 3}/5 · ${ANXIETY_LABELS[(formData.anxietyBefore ?? 3) - 1]}`,
                  step: 4,
                },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{row.label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{row.value}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => editStep(row.step)}
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#335581] transition hover:bg-[#F4F8EC]"
                  >
                    Ubah
                  </button>
                </div>
              ))}
            </div>

            {errorMessage && (
              <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">!</span>
                {errorMessage}
              </div>
            )}

            <div className="mt-6 rounded-xl border border-[#335581]/20 bg-[#F4F8EC] p-3.5 text-[11px] leading-5 text-[#335581]">
              <strong>Ingat:</strong> hasil Medivue adalah panduan awal, bukan diagnosis. Jika gejalanya
              terasa berat atau darurat, segera ke IGD atau hubungi 119.
            </div>

            <button
              type="button"
              onClick={submitTriage}
              disabled={isLoading}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4B7CB6] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#335581] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menganalisis keluhan...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-white" />
                  Analisis sekarang
                </>
              )}
            </button>
            <p className="mt-3 text-center text-[11px] text-slate-500">
              Proses ini memeriksa tanda bahaya terlebih dahulu, lalu menyusun langkah awal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
