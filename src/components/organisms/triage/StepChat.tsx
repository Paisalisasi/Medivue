'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import AnxietySlider from '@/components/molecules/triage/AnxietySlider';
import InteractiveAiChat from './InteractiveAiChat';
import { clearCheckinDraft, readCheckinDraft, readProfileCache, clearTriageSession, readTriageSession, readSessions, saveCheckinDraft, saveSessions, saveTriageSession } from '@/lib/storage';
import type { SymptomPayload, TriageResult } from '@/types/triage';
import type { SessionHistoryItem } from '@/types/session';
import type { UserProfile } from '@/types/user';

type Stage = 'questions' | 'review';

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
    tone: 'border-brand-200 bg-surface/60 text-brand-700',
  },
  {
    value: 'sedang',
    label: 'Sedang',
    description: 'Cukup mengganggu, butuh istirahat sesekali.',
    tone: 'border-warning-line bg-warning-soft/60 text-warning-strong',
  },
  {
    value: 'berat',
    label: 'Berat',
    description: 'Sangat mengganggu, sulit beraktivitas.',
    tone: 'border-danger-line bg-danger-soft/60 text-danger-strong',
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
  const { user, profile } = useAuth();
  const [stage, setStage] = useState<Stage>('questions');
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState<SymptomPayload>(INITIAL_FORM);
  const [symptomInput, setSymptomInput] = useState('');
  const [accompanyingInput, setAccompanyingInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isDraftReady, setIsDraftReady] = useState(false);

  // Pulihkan sesi triase aktif dulu agar refresh di tengah tanya jawab AI
  // tetap di chat; kalau tidak ada, pulihkan draft check-in seperti biasa.
  useEffect(() => {
    try {
      const session = readTriageSession();
      if (session) {
        setFormData({ ...INITIAL_FORM, ...(session.formData as SymptomPayload) });
        setResult(session.result as TriageResult);
        setIsDraftReady(true);
        return;
      }
      const draft = readCheckinDraft();
      if (draft) {
        const restored = { ...INITIAL_FORM, ...(draft.formData as SymptomPayload) };
        const hasAnswers =
          Boolean(restored.mainSymptom?.trim()) || draft.stage !== 'intro';
        if (hasAnswers) {
          setFormData(restored);
          // Draft lama bisa menyimpan stage 'intro'; sekarang langsung ke pertanyaan.
          setStage(draft.stage === 'review' ? 'review' : 'questions');
          setStepIndex(draft.stepIndex);
          setSymptomInput(restored.mainSymptom ?? '');
        }
      }
    } catch {
      // Abaikan draft rusak dan mulai dari awal.
    } finally {
      setIsDraftReady(true);
    }
  }, []);

  // Simpan otomatis setiap ada perubahan, kecuali saat hasil sudah keluar
  // atau form masih kosong di tahap awal.
  useEffect(() => {
    if (!isDraftReady || result) return;
    if (stepIndex === 0 && !formData.mainSymptom?.trim()) return;
    saveCheckinDraft({ stage, stepIndex, formData });
  }, [isDraftReady, stage, stepIndex, formData, result]);

  const updateForm = (patch: Partial<SymptomPayload>) => {
    setFormData((previous) => ({ ...previous, ...patch }));
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
    if (stepIndex > 0) setStepIndex((index) => index - 1);
  };

  const editStep = (index: number) => {
    setStepIndex(index);
    setStage('questions');
    if (index === 0) setSymptomInput(formData.mainSymptom ?? '');
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    // Proteksi login: jika user belum terautentikasi, simpan draft dulu
    // supaya jawaban tidak hilang saat kembali dari halaman login,
    // lalu tampilkan modal login.
    if (!user) {
      saveCheckinDraft({ stage, stepIndex, formData });
      setShowAuthPrompt(true);
      return;
    }

    setIsLoading(true);
    setShowAuthPrompt(false);

    // Sertakan profil kesehatan sebagai konteks personalisasi AI bila ada.
    const cachedProfile = readProfileCache<UserProfile>(user.id);
    const activeProfile = profile ?? cachedProfile;
    const payload: SymptomPayload = {
      ...formData,
      ageRange: activeProfile?.age_range ?? undefined,
      specialConditions:
        activeProfile?.conditions?.length ? activeProfile.conditions : undefined,
      tonePreference: activeProfile?.tone_pref ?? undefined,
      detailPreference: activeProfile?.detail_pref ?? undefined,
    };

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Gagal memproses data gejala');
      }

      setResult(json.data as TriageResult);
      clearCheckinDraft();
      saveTriageSession({ formData, result: json.data });

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
        const existing = readSessions<SessionHistoryItem>(user.id);
        saveSessions(user.id, [session, ...existing]);
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

  const handleCloseAuthPrompt = () => {
    setShowAuthPrompt(false);
  };

  const handleReset = () => {
    clearCheckinDraft();
    clearTriageSession();
    setResult(null);
    setStage('questions');
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

  // Gejala penyerta yang diketik manual (di luar opsi bawaan),
  // ditampilkan sebagai chip terpilih agar terlihat jelas.
  const customAccompanying = (formData.accompanyingSymptoms ?? []).filter(
    (item) => !ACCOMPANYING_OPTIONS.includes(item)
  );

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      {stage === 'questions' && (
        <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-brand-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke dashboard
          </Link>
          <div className="grid gap-8 lg:grid-cols-[.34fr_.66fr]">
            <aside className="hidden lg:block">
              <div className="rounded-2xl border border-brand-700/10 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-500">Progres check-in</p>
                <p className="mt-1 text-sm text-slate-500">
                  Langkah {stepIndex + 1} dari {TOTAL_STEPS}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width: `${progress}%` }} />
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
                            isActive ? 'bg-surface' : isDone ? 'hover:bg-slate-50' : 'opacity-60'
                          }`}
                        >
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            isDone
                              ? 'bg-brand-500 text-white'
                              : isActive
                                ? 'bg-brand-500 text-white'
                                : 'bg-slate-100 text-slate-500'
                          }`}>
                            {isDone ? <Check className="h-3 w-3" /> : index + 1}
                          </span>
                          <span>
                            <span className={`block text-xs font-semibold ${isActive ? 'text-brand-700' : 'text-slate-700'}`}>
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
            </aside>

            <main>
              <div className="mb-4 lg:hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-500">
                    Progres check-in
                  </p>
                  <span className="text-xs font-semibold text-brand-700">
                    {stepIndex + 1} / {TOTAL_STEPS}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                  <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-brand-700/10 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700">
                    <Sparkles className="h-3 w-3" />
                    Langkah {stepIndex + 1}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">{STEP_META[stepIndex].title}</span>
                </div>

                <h1 className="mt-4 text-2xl font-semibold tracking-[-.03em] text-brand-700 sm:text-3xl">
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
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Pilihan cepat</p>
                        <div className="flex flex-wrap gap-2">
                          {SYMPTOM_CHIPS.map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => setSymptomInput(chip)}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                                symptomInput === chip
                                  ? 'border-brand-500 bg-brand-500 text-white shadow-xs'
                                  : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-brand-300 hover:bg-surface'
                              }`}
                            >
                              {symptomInput === chip && <Check className="h-3.5 w-3.5" />}
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
                                ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                                : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-brand-300 hover:bg-surface/60'
                            }`}
                          >
                            {option}
                            <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
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
                              selected ? option.tone : 'border-slate-200 bg-slate-50/60 hover:border-brand-200 hover:bg-surface/40'
                            }`}
                          >
                            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
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
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                                selected
                                  ? 'border-brand-500 bg-brand-500 text-white shadow-xs'
                                  : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-brand-300 hover:bg-surface'
                              }`}
                            >
                              {selected && <Check className="h-3.5 w-3.5" />}
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {customAccompanying.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {customAccompanying.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleAccompanying(item)}
                              title="Ketuk untuk menghapus"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-500 bg-brand-500 px-3 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-brand-700"
                            >
                              <Check className="h-3.5 w-3.5" />
                              {item}
                              <X className="h-3.5 w-3.5" />
                            </button>
                          ))}
                        </div>
                      )}

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
                          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                        <button
                          type="button"
                          onClick={addCustomAccompanying}
                          disabled={!accompanyingInput.trim()}
                          className="shrink-0 rounded-xl border border-brand-700/10 bg-white px-4 py-2.5 text-xs font-semibold text-brand-700 transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
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
                        Kamu memilih: <span className="font-semibold text-brand-700">{ANXIETY_LABELS[(formData.anxietyBefore ?? 3) - 1]}</span>
                      </p>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-danger-line bg-danger-soft p-3 text-xs text-danger-strong">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">!</span>
                    {errorMessage}
                  </div>
                )}

                <div className={`mt-7 flex items-center border-t border-slate-100 pt-5 ${stepIndex > 0 ? 'justify-between' : 'justify-end'}`}>
                  {stepIndex > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Kembali
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
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
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" /> Ubah jawaban
          </button>

          <div className="mt-6 rounded-[1.75rem] border border-brand-700/10 bg-white p-5 shadow-sm sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700">
              <ClipboardList className="h-3.5 w-3.5" />
              Tinjau jawaban
            </span>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-.03em] text-brand-700 sm:text-3xl">
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
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-surface"
                  >
                    Ubah
                  </button>
                </div>
              ))}
            </div>

            {errorMessage && (
              <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-danger-line bg-danger-soft p-3 text-xs text-danger-strong">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">!</span>
                {errorMessage}
              </div>
            )}

            <div className="mt-6 rounded-xl border border-brand-700/20 bg-surface p-3.5 text-[11px] leading-5 text-brand-700">
              <strong>Ingat:</strong> hasil Medivue adalah panduan awal, bukan diagnosis. Jika gejalanya
              terasa berat atau darurat, segera ke IGD atau hubungi 119.
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-950/10 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
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

      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="mx-auto w-full max-w-md rounded-2xl border border-brand-700/20 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-brand-700">Login diperlukan</h2>
            <p className="mt-2 text-sm text-slate-600">
              Silakan login untuk menganalisis gejala dan mendapatkan rekomendasi hasil triase.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCloseAuthPrompt}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Batal
              </button>
              <Link
                href="/auth?redirect=/checkin"
                className="flex-1 rounded-xl bg-brand-500 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Login sekarang
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
