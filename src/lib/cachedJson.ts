/**
 * Cache JSON kecil untuk request GET yang diulang antar halaman
 * (mis. daftar diary). Stale-while-revalidate: data cache langsung
 * dipakai, lalu fetch berjalan di background untuk menyegarkan.
 *
 * shortcut: cache ini per tab tanpa invalidasi lintas tab. Kalau butuh
 * segar antar tab, tambah BroadcastChannel/storage listener.
 */

const memory = new Map<string, { at: number; data: unknown }>();
const LS_PREFIX = 'medivue_cache_';

function readLs<T>(key: string): { at: number; data: T } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: T };
    if (typeof parsed.at !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLs(key: string, entry: { at: number; data: unknown }) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Penuh/diblokir: cache memori tetap dipakai.
  }
}

export function peekCache<T>(key: string, ttlMs = 60000): T | null {
  const hit = memory.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data as T;
  const stored = readLs<T>(key);
  if (stored && Date.now() - stored.at < ttlMs) {
    memory.set(key, stored);
    return stored.data;
  }
  return null;
}

export function setCache(key: string, data: unknown) {
  const entry = { at: Date.now(), data };
  memory.set(key, entry);
  writeLs(key, entry);
}

/** Ambil JSON dari cache bila segar, sekaligus segarkan di background. */
export async function getCachedJson<T>(
  key: string,
  url: string,
  ttlMs = 60000,
  init?: RequestInit
): Promise<T> {
  const cached = peekCache<T>(key, ttlMs);
  if (cached !== null) {
    void fetch(url, init)
      .then((res) => res.json())
      .then((json) => setCache(key, (json as { data?: T })?.data ?? (json as T)))
      .catch(() => {
        // Biarkan cache lama dipakai bila background refresh gagal.
      });
    return cached;
  }

  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) throw new Error('fetch failed');
  const data = ((json as { data?: T })?.data ?? (json as T)) as T;
  setCache(key, data);
  return data;
}
