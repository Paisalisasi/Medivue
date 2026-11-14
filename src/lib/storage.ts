/**
 * Penyimpanan lokal Medivue.
 *
 * Data lama (prefix "tenangcek") tetap dibaca lalu dipindahkan ke prefix baru
 * agar riwayat pengguna tidak hilang setelah rebranding.
 */

const SESSION_PREFIX = 'medivue_sessions_';
const LEGACY_SESSION_PREFIX = 'tenangcek_sessions_';

export const LETTERS_KEY = 'medivue_doctor_letters';
const LEGACY_LETTERS_KEY = 'tenangcek_doctor_letters';

function readArray<T>(key: string): T[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

function writeArray<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Penyimpanan penuh atau diblokir: abaikan agar alur tetap berjalan.
  }
}

function migrate<T>(nextKey: string, legacyKey: string, value: T[] | null) {
  if (value && value.length > 0) {
    writeArray(nextKey, value);
  }
}

export function getSessionStorageKey(userId?: string | null) {
  return `${SESSION_PREFIX}${userId || 'guest'}`;
}

export function readSessions<T>(userId?: string | null): T[] {
  const key = getSessionStorageKey(userId);
  const current = readArray<T>(key);
  if (current) return current;

  const legacy = readArray<T>(`${LEGACY_SESSION_PREFIX}${userId || 'guest'}`);
  migrate(key, `${LEGACY_SESSION_PREFIX}${userId || 'guest'}`, legacy);
  return legacy ?? [];
}

export function saveSessions<T>(userId: string | null | undefined, sessions: T[]) {
  writeArray(getSessionStorageKey(userId), sessions);
}

const CHECKIN_DRAFT_KEY = 'medivue_checkin_draft';

export interface CheckinDraft {
  stage: 'intro' | 'questions' | 'review';
  stepIndex: number;
  // Disimpan sebagai unknown agar tidak ada dependensi tipe sirkular di runtime.
  formData: unknown;
}

function readJson(key: string): unknown | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Penyimpanan penuh atau diblokir: abaikan agar alur tetap berjalan.
  }
}

function isValidDraft(value: unknown): value is CheckinDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Record<string, unknown>;
  const stage = draft.stage;
  const stepIndex = draft.stepIndex;
  return (
    (stage === 'intro' || stage === 'questions' || stage === 'review') &&
    typeof stepIndex === 'number' &&
    Number.isInteger(stepIndex) &&
    stepIndex >= 0 &&
    stepIndex <= 4 &&
    Boolean(draft.formData && typeof draft.formData === 'object')
  );
}

export function saveCheckinDraft(draft: CheckinDraft) {
  writeJson(CHECKIN_DRAFT_KEY, draft);
}

export function readCheckinDraft(): CheckinDraft | null {
  const parsed = readJson(CHECKIN_DRAFT_KEY);
  return isValidDraft(parsed) ? parsed : null;
}

export function clearCheckinDraft() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CHECKIN_DRAFT_KEY);
  } catch {
    // Abaikan agar alur tetap berjalan.
  }
}

// Sesi triase aktif: supaya refresh di tengah tanya jawab AI tidak
// melempar user keluar. Hanya dihapus saat user keluar eksplisit
// (Reset Gejala / tombol kembali ke dashboard).
const TRIAGE_SESSION_KEY = 'medivue_triage_session';

export interface TriageSession {
  formData: unknown;
  result: unknown;
}

function isValidTriageSession(value: unknown): value is TriageSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Record<string, unknown>;
  const formData = session.formData as Record<string, unknown> | null;
  const result = session.result as Record<string, unknown> | null;
  return (
    !!formData &&
    typeof formData === 'object' &&
    typeof formData.mainSymptom === 'string' &&
    formData.mainSymptom.trim().length > 0 &&
    !!result &&
    typeof result === 'object' &&
    typeof result.urgencyLevel === 'string'
  );
}

export function saveTriageSession(session: TriageSession) {
  writeJson(TRIAGE_SESSION_KEY, session);
}

export function readTriageSession(): TriageSession | null {
  const parsed = readJson(TRIAGE_SESSION_KEY);
  return isValidTriageSession(parsed) ? parsed : null;
}

export function clearTriageSession() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(TRIAGE_SESSION_KEY);
  } catch {
    // Abaikan agar alur tetap berjalan.
  }
}

const PROFILE_CACHE_PREFIX = 'medivue_profile_';

export function getProfileCacheKey(userId?: string | null) {
  return `${PROFILE_CACHE_PREFIX}${userId || 'guest'}`;
}

export function readProfileCache<T>(userId?: string | null): T | null {
  const parsed = readJson(getProfileCacheKey(userId));
  return (parsed ?? null) as T | null;
}

export function saveProfileCache<T>(userId: string | null | undefined, profile: T) {
  writeJson(getProfileCacheKey(userId), profile);
}

export function clearProfileCache(userId?: string | null) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(getProfileCacheKey(userId));
  } catch {
    // Abaikan agar alur tetap berjalan.
  }
}

export function readLetters<T>(): T[] {
  const current = readArray<T>(LETTERS_KEY);
  if (current) return current;

  const legacy = readArray<T>(LEGACY_LETTERS_KEY);
  migrate(LETTERS_KEY, LEGACY_LETTERS_KEY, legacy);
  return legacy ?? [];
}

export function saveLetters<T>(letters: T[]) {
  writeArray(LETTERS_KEY, letters);
}
