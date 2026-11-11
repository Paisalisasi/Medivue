import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Supabase Browser Client
 * Digunakan pada komponen client-side untuk auth & query terproteksi RLS.
 *
 * Opsi auth dibuat eksplisit agar perilaku sesi konsisten:
 * sesi disimpan di perangkat, token diperbarui otomatis, dan token OAuth /
 * recovery di URL dideteksi saat halaman dimuat.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
