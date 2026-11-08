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
