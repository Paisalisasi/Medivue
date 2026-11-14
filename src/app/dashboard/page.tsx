'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode, type PointerEvent } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/organisms/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import BreathingModal from '@/components/organisms/calm/BreathingModal';
import DoctorSummaryModal from '@/components/organisms/triage/DoctorSummaryModal';
import DoctorLetterModal from '@/components/organisms/triage/DoctorLetterModal';
import { getUrgencyMeta } from '@/lib/urgency';
import { getCachedJson, peekCache } from '@/lib/cachedJson';
import { getDisplayName } from '@/lib/displayName';
import { DIARY_CACHE_KEY } from '@/components/organisms/diary/DiaryList';
import { readLetters, readSessions } from '@/lib/storage';
import type { DoctorLetterData } from '@/types/letter';
import type { SessionHistoryItem } from '@/types/session';
import {
  ArrowRight,
  BookHeart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  FileText,
  HeartPulse,
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
  className = '',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
  href: string;
  actionLabel: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex h-full flex-col rounded-2xl border border-brand-700/10 bg-white p-4 transition hover:border-brand-200 hover:shadow-sm sm:p-5 md:p-6 ${className}`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-700 sm:h-10 sm:w-10">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-slate-500 sm:text-xs">{label}</p>
          <p className="mt-1.5 text-lg font-semibold tracking-tight text-brand-700 sm:mt-2 sm:text-2xl">{value}</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">{helper}</p>
        </div>
      </div>

      <div className="mt-auto pt-4 sm:pt-5">
        <span className="flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-brand-700 transition-colors group-hover:text-brand-700 sm:pt-4 sm:text-sm">
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

/** Isi kartu satu sesi, dipakai oleh lapisan masuk & keluar carousel galeri. */
function SessionCardContent({
  session,
  meta,
  onOpenSummary,
}: {
  session: SessionHistoryItem;
  meta: ReturnType<typeof getUrgencyMeta>;
  onOpenSummary: (
    summary: NonNullable<SessionHistoryItem['doctorSummary']>,
    urgencyLabel: string
  ) => void;
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-brand-700">{session.symptomName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {session.duration || 'Durasi tidak dicatat'}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${meta.pillClass}`}>
          {meta.shortLabel}
        </span>
      </div>

      <p className="mb-4 mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{session.reasoning}</p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(session.createdAt)}
        </span>
        {session.doctorSummary && (
          <button
            type="button"
            onClick={() => onOpenSummary(session.doctorSummary!, meta.label)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-brand-700/10 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:border-brand-200 hover:bg-surface"
          >
            <FileText className="h-4 w-4" aria-hidden="true" /> Buka ringkasan
          </button>
        )}
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);
  const [savedLetters, setSavedLetters] = useState<DoctorLetterData[]>([]);
  const [diaryCount, setDiaryCount] = useState(() => peekCache<unknown[]>(DIARY_CACHE_KEY)?.length ?? 0);
  const [selectedDoctorSummary, setSelectedDoctorSummary] = useState<{ summary: { summary: string; threeQuestionsForDoctor: string[] }; urgencyLabel: string } | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<DoctorLetterData | null>(null);

  useEffect(() => {
    try {
      // localStorage adalah external store yang baru tersedia setelah mount; sinkrasi lewat effect memang diperlukan di sini.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessions(readSessions<SessionHistoryItem>(user?.id));
      setSavedLetters(readLetters<DoctorLetterData>());
    } catch (error) {
      console.warn('Could not read saved dashboard data', error);
      setSavedLetters([]);
      setSessions([]);
    }
  }, [user?.id]);

  // Jumlah diary diambil dari cache bersama DiaryList agar tidak fetch ulang.
  useEffect(() => {
    let cancelled = false;

    getCachedJson<unknown[]>(DIARY_CACHE_KEY, '/api/diary')
      .then((data) => {
        if (!cancelled) setDiaryCount(data.length);
      })
      .catch(() => {
        // Biarkan 0 bila diary belum bisa dimuat.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Pagi' : hour < 15 ? 'Siang' : hour < 18 ? 'Sore' : 'Malam';
  const displayName = getDisplayName(user, 'kamu');
  const safeSessionIndex = Math.min(activeSessionIndex, Math.max(sessions.length - 1, 0));
  // Autoplay carousel: bergeser halus setiap 5 detik dan berhenti sementara
  // saat pengguna hover, fokus, atau sedang menggeser kartu.
  useEffect(() => {
    if (sessions.length <= 1 || isCarouselPaused || isDragging) return;

    const interval = setInterval(() => {
      const next = (safeSessionIndex + 1) % sessions.length;
      setActiveSessionIndex(next);
    }, 5000);

    return () => clearInterval(interval);
  }, [sessions.length, isCarouselPaused, isDragging, safeSessionIndex]);

  const goToSession = (next: number) => {
    const clamped = Math.max(0, Math.min(next, sessions.length - 1));
    setActiveSessionIndex(clamped);
  };

  const openDoctorSummary = (
    summary: NonNullable<SessionHistoryItem['doctorSummary']>,
    urgencyLabel: string
  ) => {
    setSelectedDoctorSummary({ summary, urgencyLabel });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea')) return;

    dragStartX.current = event.clientX;
    dragStartY.current = event.clientY;
    setIsDragging(true);
    setIsCarouselPaused(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = event.clientX - dragStartX.current;
    const deltaY = event.clientY - dragStartY.current;

    // Biarkan scroll vertikal tetap alami.
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 12) return;

    let nextOffset = deltaX;
    if (
      (safeSessionIndex === 0 && deltaX > 0) ||
      (safeSessionIndex === sessions.length - 1 && deltaX < 0)
    ) {
      nextOffset = deltaX * 0.35;
    }

    setDragOffset(nextOffset);
    if (Math.abs(deltaX) > 6) event.preventDefault();
  };

  const endDrag = (clientX?: number) => {
    if (!isDragging) return;

    const deltaX = clientX !== undefined ? clientX - dragStartX.current : 0;
    const threshold = 50;
    let target = safeSessionIndex;

    if (deltaX <= -threshold) {
      target = Math.min(safeSessionIndex + 1, sessions.length - 1);
    } else if (deltaX >= threshold) {
      target = Math.max(safeSessionIndex - 1, 0);
    }

    setIsDragging(false);
    setDragOffset(0);
    setIsCarouselPaused(false);
    setActiveSessionIndex(target);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    endDrag(event.clientX);
  };

  const handlePointerCancel = () => {
    endDrag();
  };

  const urgencyBreakdown = useMemo(() => {
    return sessions.reduce<Record<string, number>>((acc, session) => {
      acc[session.urgencyLevel] = (acc[session.urgencyLevel] ?? 0) + 1;
      return acc;
    }, {});
  }, [sessions]);

  return (
    <AuthGuard>
      <div className="min-h-[70vh] bg-surface">
        <div className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:space-y-8 sm:px-8 sm:py-12">
          <header className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-brand-500">
              Ruang pribadimu
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-brand-700 sm:text-4xl">
              Selamat {greeting}, {displayName}.
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Mulai pengecekan baru, pantau yang kamu rasakan, atau siapkan catatan sebelum bertemu dokter.
            </p>
          </header>

          {/* Hero aksi utama */}
          <section className="relative overflow-hidden rounded-[1.75rem] bg-brand-700 p-6 text-white sm:p-9">
            <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-16 h-56 w-56 rounded-full border border-white/10" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-brand-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Mulai kapan saja, sesuai kebutuhanmu
                </span>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-.03em] sm:text-3xl">
                  Ada yang terasa beda hari ini?
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-brand-100/80">
                  Ceritakan gejalanya dengan bahasamu sendiri. Medivue akan bantu menyusun langkah awal yang lebih jelas.
                </p>
                <Link
                  href="/checkin"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
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
              <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-500">
                Ringkasan
              </p>
              <h2 id="ringkasan-heading" className="mt-1 text-xl font-semibold tracking-tight text-brand-700">
                Aksimu hari ini
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                helper={savedLetters.length > 0 ? 'catatan untuk konsultasi' : 'belum ada catatan tersimpan'}
                href={savedLetters.length > 0 ? '#catatan' : '/checkin'}
                actionLabel={savedLetters.length > 0 ? 'Lihat catatan' : 'Buat catatan'}
              />
              <CategoryCard
                icon={<BookHeart className="h-5 w-5" aria-hidden="true" />}
                label="Symptom diary"
                value={`${diaryCount}`}
                helper={
                  diaryCount > 0
                    ? 'catatan harian tersimpan'
                    : 'belum ada catatan harian'
                }
                href="/diary"
                actionLabel="Buka diary"
                className="col-span-2 sm:col-span-1"
              />
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-[1.35fr_.8fr]">
            <section id="pengecekan-terakhir" aria-labelledby="pengecekan-terakhir-heading" className="min-w-0 scroll-mt-24 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-500">
                  Jejak kesehatan
                </p>
                <h2 id="pengecekan-terakhir-heading" className="mt-1 text-xl font-semibold tracking-tight text-brand-700">
                  Riwayat pengecekan
                </h2>
              </div>

              {sessions.length > 0 ? (
                <div
                  role="region"
                  aria-roledescription="carousel"
                  aria-label="Riwayat pengecekan"
                  className={`w-full min-w-0 touch-pan-y overflow-hidden rounded-2xl border border-brand-700/10 bg-white ${
                    isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
                  }`}
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'mouse') setIsCarouselPaused(true);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === 'mouse') setIsCarouselPaused(false);
                  }}
                  onFocusCapture={() => setIsCarouselPaused(true)}
                  onBlurCapture={() => setIsCarouselPaused(false)}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                >
                  <div
                    className="flex w-full"
                    style={{
                      transform: `translate3d(calc(-${safeSessionIndex * 100}% + ${dragOffset}px), 0, 0)`,
                      transition: isDragging
                        ? 'none'
                        : 'transform 560ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    {sessions.map((session, index) => {
                      const meta = getUrgencyMeta(session.urgencyLevel);
                      return (
                        <div
                          key={session.id}
                          role="group"
                          aria-roledescription="slide"
                          aria-label={`${session.symptomName}, ${meta.label}`}
                          aria-hidden={index !== safeSessionIndex ? true : undefined}
                          className="flex min-h-[15rem] w-full shrink-0 flex-col bg-white p-5 sm:p-6"
                        >
                          <SessionCardContent
                            session={session}
                            meta={meta}
                            onOpenSummary={openDoctorSummary}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {sessions.length > 1 && (
                    <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-3 sm:px-5">
                      <button
                        type="button"
                        onClick={() => goToSession(safeSessionIndex - 1)}
                        disabled={safeSessionIndex === 0}
                        aria-label="Pengecekan sebelumnya"
                        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-brand-200 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="shrink-0 text-[11px] font-semibold text-slate-400">
                          {safeSessionIndex + 1} / {sessions.length}
                        </span>
                        <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
                            style={{ width: `${((safeSessionIndex + 1) / sessions.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => goToSession(safeSessionIndex + 1)}
                        disabled={safeSessionIndex === sessions.length - 1}
                        aria-label="Pengecekan berikutnya"
                        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-brand-200 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-700">
                    <HeartPulse className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-brand-700">
                    Belum ada riwayat pengecekan
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                    Setelah kamu mengecek gejala, ringkasannya akan muncul di sini.
                  </p>
                  <Link
                    href="/checkin"
                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    Mulai cek gejala <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </section>

            <aside className="min-w-0 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-500">
                  Tenangkan diri
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-brand-700">
                  Butuh jeda sebentar?
                </h2>
              </div>

              <div className="rounded-2xl border border-brand-700/10 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-700">
                    <Wind className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-1 flex-1 text-xs leading-5 text-slate-500">
                    Ikuti latihan napas singkat untuk bantu menenangkan diri.
                  </p>
                </div>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setShowBreathingModal(true)}
                  className="mt-4 flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 shadow-xs transition hover:border-brand-300 hover:bg-brand-100 hover:shadow-sm active:border-brand-400 active:bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:border-brand-700/10 sm:bg-surface-muted sm:shadow-none"
                >
                  <Wind className="h-4 w-4" aria-hidden="true" />
                  Mulai latihan napas
                </button>
              </div>

              {sessions.length > 1 && (
                <div className="rounded-2xl border border-brand-700/10 bg-white p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-500">
                    Sebaran urgensi
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(['darurat', 'segera', 'terjadwal', 'pantau_di_rumah'] as const).map((level) => {
                      const meta = getUrgencyMeta(level);
                      const count = urgencyBreakdown[level] ?? 0;
                      return (
                        <span key={level} className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ${meta.pillClass}`}>
                          <span className="truncate">{meta.shortLabel}</span>
                          <span className="shrink-0 tabular-nums">{count}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {savedLetters.length > 0 && (
            <section id="catatan" aria-labelledby="catatan-heading" className="scroll-mt-24 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-500">
                  Tersimpan
                </p>
                <h2 id="catatan-heading" className="mt-1 text-xl font-semibold tracking-tight text-brand-700">
                  Catatan untuk konsultasi
                </h2>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {savedLetters.map((letter) => (
                  <article key={letter.documentId} className="flex h-full flex-col justify-between rounded-2xl border border-brand-700/10 bg-white p-5 transition hover:border-brand-200 hover:shadow-sm sm:p-6">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-500">
                          {letter.documentId}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {letter.patientOverview.urgencyLabel}
                        </span>
                      </div>
                      <h3 className="mt-3 font-semibold text-brand-700">
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
                      <button type="button" onClick={() => setSelectedLetter(letter)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
                        <FileCheck2 className="h-4 w-4" aria-hidden="true" /> Buka catatan
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {selectedDoctorSummary && (
        <DoctorSummaryModal doctorSummary={selectedDoctorSummary.summary} urgencyLabel={selectedDoctorSummary.urgencyLabel} onClose={() => setSelectedDoctorSummary(null)} />
      )}
      {selectedLetter && (
        <DoctorLetterModal letter={selectedLetter} onClose={() => setSelectedLetter(null)} />
      )}
      {showBreathingModal && (
        <BreathingModal onClose={() => setShowBreathingModal(false)} />
      )}
    </AuthGuard>
  );
}