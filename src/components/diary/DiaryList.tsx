'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { DiaryEntry } from '@/types/user';
import { AlertCircle, BookHeart, Clock, Plus, Sparkles, TrendingUp } from 'lucide-react';

const SEVERITY_LABELS = ['Ringan sekali', 'Ringan', 'Sedang', 'Berat', 'Sangat berat'];

function severityTone(value: number) {
  if (value <= 2) return 'bg-emerald-50 text-emerald-800 ring-emerald-200';
  if (value === 3) return 'bg-amber-50 text-amber-800 ring-amber-200';
  return 'bg-rose-50 text-rose-800 ring-rose-200';
}

export default function DiaryList() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [note, setNote] = useState('');
  const [severity, setSeverity] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const res = await fetch('/api/diary');
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error();
        setEntries(Array.isArray(json.data) ? json.data : []);
      } catch {
        setErrorMessage('Catatan belum bisa dimuat. Periksa koneksi lalu coba lagi.');
      } finally {
        setIsLoading(false);
      }
    };
    void loadEntries();
  }, []);

  const handleAddEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!note.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim(), severity }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Catatan belum tersimpan. Coba lagi.');
      setEntries((current) => [json.data, ...current]);
      setNote('');
      setSeverity(2);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Catatan belum tersimpan. Periksa koneksi lalu coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageSeverity = useMemo(() => {
    if (entries.length === 0) return null;
    const total = entries.reduce((sum, entry) => sum + entry.severity, 0);
    return (total / entries.length).toFixed(1);
  }, [entries]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-emerald-800">
            <BookHeart className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-emerald-950">Catat kondisi hari ini</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Tulis perubahan yang paling terasa, sekecil apa pun.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddEntry} className="space-y-4">
          <textarea
            aria-label="Catatan perkembangan gejala"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Contoh: Kepala masih agak sakit, tapi lebih ringan setelah istirahat."
            className="w-full resize-y rounded-xl border border-slate-200 bg-[#fbfcf8] p-3.5 text-sm leading-6 text-slate-800 placeholder-slate-400 transition focus:border-emerald-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <fieldset>
              <legend className="mb-2 text-xs font-medium text-slate-600">
                Seberapa mengganggu? <span className="text-slate-400">(1–5)</span>
              </legend>
              <div className="flex flex-wrap items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Tingkat ${value} dari 5`}
                    aria-pressed={severity === value}
                    onClick={() => setSeverity(value)}
                    className={`h-9 w-9 rounded-xl text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                      severity === value
                        ? 'bg-emerald-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                {SEVERITY_LABELS[severity - 1]}
              </p>
            </fieldset>

            <button
              type="submit"
              disabled={isSubmitting || !note.trim()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> {isSubmitting ? 'Menyimpan…' : 'Simpan catatan'}
            </button>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {errorMessage}
            </p>
          )}
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-700">
              Riwayat kamu
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-emerald-950">
              Catatan perkembangan{' '}
              <span className="text-sm font-medium text-slate-500">({entries.length})</span>
            </h2>
          </div>
          {averageSeverity && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
              <TrendingUp className="h-3.5 w-3.5" /> Rata-rata {averageSeverity}/5
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-emerald-950/10 bg-white p-6 text-sm text-slate-500">
            Memuat catatan…
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-950/20 bg-white px-6 py-10 text-center">
            <p className="font-semibold text-emerald-950">Belum ada catatan</p>
            <p className="mt-1 text-sm text-slate-500">Catatan pertamamu akan muncul di sini.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-2xl border border-emerald-950/10 bg-white p-5"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(entry.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${severityTone(entry.severity)}`}
                >
                  {SEVERITY_LABELS[entry.severity - 1] ?? 'Sedang'} · {entry.severity}/5
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-700">{entry.note}</p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
