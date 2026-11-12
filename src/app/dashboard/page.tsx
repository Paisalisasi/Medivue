'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import BreathingExercise from '@/components/calm/BreathingExercise';
import DoctorSummaryModal from '@/components/triage/DoctorSummaryModal';
import DoctorLetterModal from '@/components/triage/DoctorLetterModal';
import { getUrgencyMeta } from '@/lib/urgency';
import { readLetters, readSessions } from '@/lib/storage';
import type { DoctorLetterData } from '@/types/letter';
import type { SessionHistoryItem } from '@/types/session';
import {
  ArrowRight,
  BookHeart,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileCheck2,
  FileText,
  HeartPulse,
  Info,
  Wind,
} from 'lucide-react';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Kartu kategori dengan anatomi seragam: ikon, label, nilai, lalu satu aksi. */
function CategoryCard({
  icon,
  label,
  value,
  helper,
  href,
  actionLabel,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-[#335581]/10 bg-white p-5 transition hover:border-emerald-800/20 hover:shadow-sm sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4B7CB6]/10 text-[#335581]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#335581]">{value}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <span className="flex items-center gap-1.5 border-t border-slate-100 pt-4 text-sm font-semibold text-[#335581] transition-colors group-hover:text-[#335581]">
          {actionLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [showBreathing, setShowBreathing] = useState(false);
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);
  const [savedLetters, setSavedLetters] = useState<DoctorLetterData[]>([]);
  const [selectedDoctorSummary, setSelectedDoctorSummary] = useState<{
    summary: { summary: string; threeQuestionsForDoctor: string[] };
    urgencyLabel: string;
  } | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<DoctorLetterData | null>(null);

  useEffect(() => {
    try {
      // localStorage adalah external store yang baru tersedia setelah mount;
      // sinkronisasi lewat effect memang diperlukan di sini.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessions(readSessions<SessionHistoryItem>(user?.id));
      setSavedLetters(readLetters<DoctorLetterData>());
    } catch (error) {
      console.warn('Could not read saved dashboard data', error);
      setSavedLetters([]);
      setSessions([]);
    }
  }, [user?.id]);

  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Pagi' : hour < 15 ? 'Siang' : hour < 18 ? 'Sore' : 'Malam';
  const displayName = user?.email?.split('@')[0] || 'kamu';
  const recentSession = sessions[0];
  const recentMeta = recentSession ? getUrgencyMeta(recentSession.urgencyLevel) : null;

  const urgencyBreakdown = useMemo(() => {
    return sessions.reduce<Record<string, number>>((acc, session) => {
      acc[session.urgencyLevel] = (acc[session.urgencyLevel] ?? 0) + 1;
      return acc;
    }, {});
  }, [sessions]);

  return (
    <AuthGuard>
      <div className="min-h-[70vh] bg-[#F4F8EC]">
        <div className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:space-y-8 sm:px-8 sm:py-12">
          <header className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#4B7CB6]">
              Ruang pribadimu
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-[#335581] sm:text-4xl">
              Selamat {greeting}, {displayName}.
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Mulai pengecekan baru, pantau yang sudah kamu rasakan, atau siapkan catatan sebelum
              bertemu dokter.
            </p>
          </header>

          {/* Hero aksi utama */}
          <section className="relative overflow-hidden rounded-[1.75rem] bg-[#335581] p-6 text-white sm:p-9">
            <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-16 h-56 w-56 rounded-full border border-white/10" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4B7CB6]" /> Mulai kapan saja, sesuai
                  kebutuhanmu
                </span>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-.03em] sm:text-3xl">
                  Ada yang terasa beda hari ini?
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-100/80">
                  Ceritakan gejalanya dengan bahasamu sendiri. Medivue akan bantu menyusun langkah
                  awal yang lebih jelas.
                </p>
                <Link
                  href="/checkin"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#4B7CB6] px-4 py-2.5 text-sm font-bold text-[#335581] transition hover:bg-[#4B7CB6]"
                >
                  Cek gejala baru <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="hidden h-28 w-28 items-center justify-center rounded-[2rem] bg-white/10 text-white md:flex">
                <HeartPulse className="h-14 w-14" strokeWidth={1.4} aria-hidden="true" />
              </div>
            </div>
          </section>

          {/* Kategori dengan aksi seragam */}
          <section aria-labelledby="ringkasan-heading" className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4B7CB6]">
                Ringkasan
              </p>
              <h2
                id="ringkasan-heading"
                className="mt-1 text-xl font-semibold tracking-tight text-[#335581]"
              >
                Aksimu hari ini
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <CategoryCard
                icon={<HeartPulse className="h-5 w-5" aria-hidden="true" />}
                label="Riwayat cek"
                value={`${sessions.length}`}
                helper={sessions.length > 0 ? 'pengecekan tersimpan' : 'belum ada pengecekan'}
                href="#pengecekan-terakhir"
                actionLabel="Lihat riwayat"
              />
              <CategoryCard
                icon={<FileCheck2 className="h-5 w-5" aria-hidden="true" />}
                label="Catatan dokter"
                value={`${savedLetters.length}`}
                helper={
                  savedLetters.length > 0 ? 'catatan untuk konsultasi' : 'belum ada catatan tersimpan'
                }
                href={savedLetters.length > 0 ? '#catatan' : '/checkin'}
                actionLabel={savedLetters.length > 0 ? 'Lihat catatan' : 'Buat catatan'}
              />
              <CategoryCard
                icon={<BookHeart className="h-5 w-5" aria-hidden="true" />}
                label="Symptom diary"
                value="Harian"
                helper="catat perubahan yang kamu rasakan"
                href="/diary"
                actionLabel="Buka diary"
              />
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-[1.35fr_.8fr]">
            <section
              id="pengecekan-terakhir"
              aria-labelledby="pengecekan-terakhir-heading"
              className="scroll-mt-24 space-y-4"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4B7CB6]">
                  Jejak kesehatan
                </p>
                <h2
                  id="pengecekan-terakhir-heading"
                  className="mt-1 text-xl font-semibold tracking-tight text-[#335581]"
                >
                  Pengecekan terakhir
                </h2>
              </div>

              {recentSession && recentMeta ? (
                <div className="rounded-2xl border border-[#335581]/10 bg-white p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[#335581]">
                        {recentSession.symptomName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {recentSession.duration || 'Durasi tidak dicatat'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${recentMeta.pillClass}`}
                    >
                      {recentMeta.shortLabel}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">{recentSession.reasoning}</p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDate(recentSession.createdAt)}
                    </span>
                    {recentSession.doctorSummary && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDoctorSummary({
                            summary: recentSession.doctorSummary!,
                            urgencyLabel: recentMeta.label,
                          })
                        }
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#335581]/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#335581] transition hover:border-emerald-800/20 hover:bg-[#F4F8EC]"
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" /> Buka ringkasan
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-emerald-950/20 bg-white px-6 py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4B7CB6]/10 text-[#335581]">
                    <HeartPulse className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#335581]">
                    Belum ada riwayat pengecekan
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                    Setelah kamu mengecek gejala, ringkasannya akan muncul di sini.
                  </p>
                  <Link
                    href="/checkin"
                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#4B7CB6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#335581]"
                  >
                    Mulai cek gejala <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              )}

              {sessions.length > 1 && (
                <div className="rounded-2xl border border-[#335581]/10 bg-white p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4B7CB6]">
                    Sebaran urgensi
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(['darurat', 'segera', 'terjadwal', 'pantau_di_rumah'] as const).map((level) => {
                      const meta = getUrgencyMeta(level);
                      const count = urgencyBreakdown[level] ?? 0;
                      return (
                        <span
                          key={level}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${meta.pillClass}`}
                        >
                          {meta.shortLabel} · {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-[#335581]/10 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4B7CB6]/10 text-[#335581]">
                    <Wind className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <h2 className="font-semibold text-[#335581]">Butuh jeda sebentar?</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Ikuti latihan napas singkat untuk bantu menenangkan diri.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-expanded={showBreathing}
                  onClick={() => setShowBreathing(!showBreathing)}
                  className="mt-4 flex min-h-11 w-full items-center justify-between rounded-xl bg-[#f3f6ee] px-4 py-3 text-sm font-semibold text-[#335581] transition hover:bg-[#4B7CB6]/10"
                >
                  {showBreathing ? 'Tutup latihan' : 'Mulai latihan napas'}{' '}
                  {showBreathing ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                {showBreathing && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <BreathingExercise />
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[#335581]/10 bg-white p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#4B7CB6]" aria-hidden="true" />
                  <h2 className="font-semibold text-[#335581]">Sedikit pengingat</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Medivue memberi informasi awal, bukan diagnosis. Kalau gejala terasa berat atau
                  darurat, cari bantuan medis langsung.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#335581]">
                  <Check className="h-4 w-4" aria-hidden="true" /> Kamu tetap yang menentukan langkah
                  selanjutnya.
                </div>
              </div>
            </aside>
          </div>

          {savedLetters.length > 0 && (
            <section
              id="catatan"
              aria-labelledby="catatan-heading"
              className="scroll-mt-24 space-y-4"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#4B7CB6]">
                  Tersimpan
                </p>
                <h2
                  id="catatan-heading"
                  className="mt-1 text-xl font-semibold tracking-tight text-[#335581]"
                >
                  Catatan untuk konsultasi
                </h2>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {savedLetters.map((letter) => (
                  <article
                    key={letter.documentId}
                    className="flex h-full flex-col justify-between rounded-2xl border border-[#335581]/10 bg-white p-5 transition hover:border-emerald-800/20 hover:shadow-sm sm:p-6"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-500">
                          {letter.documentId}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {letter.patientOverview.urgencyLabel}
                        </span>
                      </div>
                      <h3 className="mt-3 font-semibold text-[#335581]">
                        {letter.patientOverview.mainSymptom}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                        {letter.clinicalSummary}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <span className="text-xs text-slate-500">
                        {formatDate(letter.generatedAt)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedLetter(letter)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#4B7CB6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#335581]"
                      >
                        <FileCheck2 className="h-4 w-4" aria-hidden="true" /> Buka catatan
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className="flex items-start gap-3 rounded-2xl border border-[#335581]/10 bg-white/70 p-4 text-xs leading-5 text-slate-600">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#4B7CB6]/10 text-[#335581]">
              <Info className="h-4 w-4" aria-hidden="true" />
            </span>
            <p>
              Riwayat pengecekan tersimpan di browser perangkat ini dan bisa hilang jika data
              browser dibersihkan.
            </p>
          </div>
        </div>
      </div>

      {selectedDoctorSummary && (
        <DoctorSummaryModal
          doctorSummary={selectedDoctorSummary.summary}
          urgencyLabel={selectedDoctorSummary.urgencyLabel}
          onClose={() => setSelectedDoctorSummary(null)}
        />
      )}
      {selectedLetter && (
        <DoctorLetterModal letter={selectedLetter} onClose={() => setSelectedLetter(null)} />
      )}
    </AuthGuard>
  );
}
