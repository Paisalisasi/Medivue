import type { User } from '@supabase/supabase-js';

/**
 * Nama tampilan yang konsisten di seluruh aplikasi.
 *
 * Prioritas:
 * 1. `display_name` yang disimpan saat pengguna mengubah nama di halaman profil.
 * 2. Prefix email sebagai nama awal setelah pendaftaran.
 */
export function getDisplayName(user: User | null | undefined, fallback = 'kamu'): string {
  if (!user) return fallback;

  const metadataName = user.user_metadata?.display_name;
  if (typeof metadataName === 'string' && metadataName.trim()) {
    return metadataName.trim();
  }

  const emailPrefix = user.email?.split('@')[0]?.trim();
  return emailPrefix || fallback;
}
