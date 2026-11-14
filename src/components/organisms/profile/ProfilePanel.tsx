'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getDisplayName } from '@/lib/displayName';
import { supabase } from '@/lib/supabase/client';
import { readProfileCache, saveProfileCache } from '@/lib/storage';
import type { UserProfile } from '@/types/user';
import {
  Activity,
  ArrowLeft,
  Check,
  HeartPulse,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Pill,
  Save,
  Sparkles,
  User as UserIcon,
  X,
} from 'lucide-react';

const AGE_OPTIONS: { value: NonNullable<UserProfile['age_range']>; label: string }[] = [
  { value: 'anak', label: 'Anak' },
  { value: 'remaja', label: 'Remaja' },
  { value: 'dewasa_muda', label: 'Dewasa muda' },
  { value: 'dewasa', label: 'Dewasa' },
  { value: 'lansia', label: 'Lansia' },
];

const SEX_OPTIONS: { value: NonNullable<UserProfile['sex']>; label: string }[] = [
  { value: 'laki_laki', label: 'Laki-laki' },
  { value: 'perempuan', label: 'Perempuan' },
  { value: 'prefer_not_to_say', label: 'Tidak ingin menyebutkan' },
];

const CONDITION_PRESETS = [
  'Asma',
  'Diabetes',
  'Hipertensi',
  'Maag / GERD',
  'Riwayat jantung',
  'Kehamilan',
];

const ALLERGY_PRESETS = ['Penisilin', 'Sulfa', 'Kacang', 'Seafood', 'Telur'];

function toggleItem(list: string[], item: string) {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

const glassCard = 'rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-md sm:p-6';

interface ProfilePanelProps {
  /** `page` = halaman penuh, `modal` = panel di dalam glass overlay. */
  variant?: 'page' | 'modal';
}

export default function ProfilePanel({ variant = 'page' }: ProfilePanelProps) {
  const { user, profile, isLoading, refreshProfile, resetPassword, signOut } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [ageRange, setAgeRange] = useState<UserProfile['age_range']>();
  const [sex, setSex] = useState<UserProfile['sex']>();
  const [conditions, setConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [region, setRegion] = useState('');
  const [usesBpjs, setUsesBpjs] = useState(false);
  const [tonePref, setTonePref] = useState<'santai' | 'formal'>('santai');
  const [detailPref, setDetailPref] = useState<'ringkas' | 'detail'>('ringkas');

  const [isSaving, setIsSaving] = useState(false);
  const [isSavePressed, setIsSavePressed] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  // Isi form dari profil Supabase, atau cache lokal bila profil belum termuat.
  // Profil datang secara asinkron, sehingga sinkronisasi awal form memang
  // memerlukan setState di dalam effect (pola yang sama dipakai StepChat).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const cached = user ? readProfileCache<UserProfile>(user.id) : null;
    const active = profile ?? cached;
    if (active) {
      setAgeRange(active.age_range);
      setSex(active.sex);
      setConditions(active.conditions ?? []);
      setAllergies(active.allergies ?? []);
      setRegion(active.region ?? '');
      setUsesBpjs(Boolean(active.uses_bpjs));
      setTonePref(active.tone_pref ?? 'santai');
      setDetailPref(active.detail_pref ?? 'ringkas');
    }
    setDisplayName(getDisplayName(user, ''));
  }, [user, profile]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const initial = (displayName.trim()?.[0] ?? user?.email?.[0] ?? 'M').toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const addCustom = (value: string, list: string[], setList: (next: string[]) => void) => {
    const trimmed = value.trim();
    if (!trimmed || list.includes(trimmed)) return;
    setList([...list, trimmed]);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setStatus(null);
    window.dispatchEvent(new CustomEvent('medivue:page-loading', { detail: { active: true } }));

    const payload = {
      id: user.id,
      age_range: ageRange ?? null,
      sex: sex ?? null,
      conditions,
      allergies,
      tone_pref: tonePref,
      detail_pref: detailPref,
      region: region.trim() || null,
      uses_bpjs: usesBpjs,
      updated_at: new Date().toISOString(),
    };

    let remoteOk = true;
    try {
      const { error } = await supabase.from('profiles').upsert(payload);
      if (error) throw error;
    } catch {
      remoteOk = false;
    }

    // Cache lokal selalu disimpan agar profil tetap tersedia offline.
    saveProfileCache(user.id, payload);

    try {
      const metaName =
        typeof user.user_metadata?.display_name === 'string'
          ? (user.user_metadata.display_name as string)
          : '';
      if (displayName.trim() && displayName.trim() !== metaName) {
        await supabase.auth.updateUser({ data: { display_name: displayName.trim() } });
      }
    } catch {
      // Nama tampilan gagal disimpan, profil kesehatan tetap tersimpan.
    }

    await refreshProfile();
    setIsSaving(false);
    window.dispatchEvent(new CustomEvent('medivue:page-loading', { detail: { active: false } }));
    setStatus(
      remoteOk
        ? { type: 'success', text: 'Profil tersimpan. Data ini dipakai sebagai konteks personalisasi AI saat cek gejala.' }
        : { type: 'warning', text: 'Profil tersimpan di perangkat ini, tetapi gagal tersimpan ke server. Periksa koneksi lalu simpan ulang.' }
    );
  };

  const handleSendReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    setStatus(null);
    const { error } = await resetPassword(user.email);
    setIsSendingReset(false);
    setStatus(
      error
        ? { type: 'error', text: error.message }
        : { type: 'success', text: 'Tautan ubah kata sandi dikirim ke email kamu. Buka inbox/spam lalu ikuti tautannya.' }
    );
  };

  return (
    <div className="relative w-full">
      {variant === 'page' && (
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke dashboard
        </Link>
      )}

      <p
        className={`text-xs font-bold uppercase tracking-[.16em] text-brand-500 ${
          variant === 'page' ? 'mt-6' : 'pr-12'
        }`}
      >
        Profil pengguna
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-brand-700 sm:text-4xl">
        Halo, {displayName || 'teman Medivue'}.
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Lengkapi profil kesehatanmu agar saran AI lebih personal. Semua bersifat opsional dan
        bisa diubah kapan saja.
      </p>

      {/* ── Kartu akun ── */}
      <section className={`mt-8 ${glassCard}`}>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-brand-700">
              {displayName || 'Pengguna Medivue'}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {user?.email ?? '—'}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">Bergabung sejak {memberSince}</p>
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor={`display-name-${variant}`} className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <UserIcon className="h-3.5 w-3.5" /> Nama tampilan
          </label>
          <input
            id={`display-name-${variant}`}
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Nama panggilanmu"
            maxLength={40}
            className={inputClass}
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleSendReset}
            disabled={isSendingReset || isLoading}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSendingReset ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Kirim tautan ubah kata sandi
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-danger-line bg-danger-soft px-4 py-2.5 text-sm font-semibold text-danger-strong transition hover:bg-danger-line/40"
          >
            <LogOut className="h-4 w-4" />
            Keluar dari akun
          </button>
        </div>
      </section>

      {/* ── Kartu kesehatan ── */}
      <section className={`mt-4 ${glassCard}`}>
        <p className="flex items-center gap-2 text-sm font-semibold text-brand-700">
          <HeartPulse className="h-4 w-4" /> Profil kesehatan
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Dipakai sebagai konteks saat AI menganalisis keluhanmu.
        </p>

        <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Rentang usia
        </p>
        <div className="flex flex-wrap gap-2">
          {AGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setAgeRange(option.value)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                ageRange === option.value
                  ? 'border-brand-500 bg-brand-500 text-white shadow-xs'
                  : 'border-slate-200 bg-white/70 text-slate-700 hover:border-brand-300 hover:bg-surface'
              }`}
            >
              {ageRange === option.value && <Check className="h-3.5 w-3.5" />}
              {option.label}
            </button>
          ))}
        </div>

        <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Jenis kelamin
        </p>
        <div className="flex flex-wrap gap-2">
          {SEX_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSex(option.value)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                sex === option.value
                  ? 'border-brand-500 bg-brand-500 text-white shadow-xs'
                  : 'border-slate-200 bg-white/70 text-slate-700 hover:border-brand-300 hover:bg-surface'
              }`}
            >
              {sex === option.value && <Check className="h-3.5 w-3.5" />}
              {option.label}
            </button>
          ))}
        </div>

        <p className="mb-2 mt-5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <Activity className="h-3.5 w-3.5" /> Riwayat kondisi khusus
        </p>
        <div className="flex flex-wrap gap-2">
          {[...CONDITION_PRESETS, ...conditions.filter((item) => !CONDITION_PRESETS.includes(item))].map(
            (option) => {
              const selected = conditions.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setConditions((prev) => toggleItem(prev, option))}
                  title={selected ? 'Ketuk untuk menghapus' : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    selected
                      ? 'border-brand-500 bg-brand-500 text-white shadow-xs'
                      : 'border-slate-200 bg-white/70 text-slate-700 hover:border-brand-300 hover:bg-surface'
                  }`}
                >
                  {selected &&
                    (CONDITION_PRESETS.includes(option) ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    ))}
                  {option}
                </button>
              );
            }
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={conditionInput}
            onChange={(event) => setConditionInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addCustom(conditionInput, conditions, setConditions);
                setConditionInput('');
              }
            }}
            placeholder="Kondisi lain (opsional)"
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button
            type="button"
            onClick={() => {
              addCustom(conditionInput, conditions, setConditions);
              setConditionInput('');
            }}
            disabled={!conditionInput.trim()}
            className="shrink-0 rounded-xl border border-brand-700/10 bg-white px-4 py-2.5 text-xs font-semibold text-brand-700 transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tambah
          </button>
        </div>

        <p className="mb-2 mt-5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <Pill className="h-3.5 w-3.5" /> Alergi
        </p>
        <div className="flex flex-wrap gap-2">
          {[...ALLERGY_PRESETS, ...allergies.filter((item) => !ALLERGY_PRESETS.includes(item))].map(
            (option) => {
              const selected = allergies.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAllergies((prev) => toggleItem(prev, option))}
                  title={selected ? 'Ketuk untuk menghapus' : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    selected
                      ? 'border-brand-500 bg-brand-500 text-white shadow-xs'
                      : 'border-slate-200 bg-white/70 text-slate-700 hover:border-brand-300 hover:bg-surface'
                  }`}
                >
                  {selected &&
                    (ALLERGY_PRESETS.includes(option) ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    ))}
                  {option}
                </button>
              );
            }
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={allergyInput}
            onChange={(event) => setAllergyInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addCustom(allergyInput, allergies, setAllergies);
                setAllergyInput('');
              }
            }}
            placeholder="Alergi lain (opsional)"
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button
            type="button"
            onClick={() => {
              addCustom(allergyInput, allergies, setAllergies);
              setAllergyInput('');
            }}
            disabled={!allergyInput.trim()}
            className="shrink-0 rounded-xl border border-brand-700/10 bg-white px-4 py-2.5 text-xs font-semibold text-brand-700 transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tambah
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`region-${variant}`} className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <MapPin className="h-3.5 w-3.5" /> Wilayah / kota
            </label>
            <input
              id={`region-${variant}`}
              type="text"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              placeholder="Contoh: Bandung"
              maxLength={60}
              className={inputClass}
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-600">Kepesertaan BPJS</p>
            <button
              type="button"
              role="switch"
              aria-checked={usesBpjs}
              onClick={() => setUsesBpjs((value) => !value)}
              className={`inline-flex min-h-11 w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                usesBpjs
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-300 bg-white text-slate-600'
              }`}
            >
              Saya peserta BPJS Kesehatan
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                  usesBpjs ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 bg-white text-transparent'
                }`}
              >
                <Check className="h-3 w-3" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Kartu preferensi AI ── */}
      <section className={`mt-4 ${glassCard}`}>
        <p className="flex items-center gap-2 text-sm font-semibold text-brand-700">
          <Sparkles className="h-4 w-4" /> Preferensi jawaban AI
        </p>

        <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Gaya bahasa
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: 'santai', label: 'Santai', hint: 'Hangat seperti teman' },
              { value: 'formal', label: 'Formal', hint: 'Sopan seperti dokter' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTonePref(option.value)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                tonePref === option.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                  : 'border-slate-200 bg-white/70 text-slate-700 hover:border-brand-300'
              }`}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="mt-0.5 block text-[11px] opacity-80">{option.hint}</span>
            </button>
          ))}
        </div>

        <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Kedalaman informasi
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: 'ringkas', label: 'Ringkas', hint: 'Langsung ke inti' },
              { value: 'detail', label: 'Detail', hint: 'Penjelasan lengkap' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDetailPref(option.value)}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                detailPref === option.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                  : 'border-slate-200 bg-white/70 text-slate-700 hover:border-brand-300'
              }`}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="mt-0.5 block text-[11px] opacity-80">{option.hint}</span>
            </button>
          ))}
        </div>
      </section>

      {status && (
        <div
          role="status"
          className={`mt-4 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-5 ${
            status.type === 'success'
              ? 'border-success-line bg-success-soft text-success-strong'
              : status.type === 'warning'
                ? 'border-warning-line bg-warning-soft text-warning-strong'
                : 'border-danger-line bg-danger-soft text-danger-strong'
          }`}
        >
          {status.text}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        onPointerDown={() => setIsSavePressed(true)}
        onPointerUp={() => setIsSavePressed(false)}
        onPointerLeave={() => setIsSavePressed(false)}
        onPointerCancel={() => setIsSavePressed(false)}
        disabled={isSaving || isLoading}
        className={`mt-4 inline-flex min-h-12 w-full touch-manipulation select-none items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60 ${
          isSavePressed
            ? 'scale-[0.99] border-brand-700 bg-brand-700 shadow-lg shadow-brand-500/30 ring-2 ring-brand-500/40 ring-offset-2 ring-offset-white'
            : 'border-brand-500 bg-brand-500 shadow-lg shadow-brand-950/10 hover:border-brand-600 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/25 active:border-brand-700 active:bg-brand-700 active:shadow-md'
        }`}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Menyimpan profil...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Simpan profil
          </>
        )}
      </button>
    </div>
  );
}
