/**
 * Profil Personalisasi User Medivue
 * Minimal & Opt-in untuk privasi kesehatan (Halaman 2 Bagian 6)
 */

export interface UserProfile {
  id: string;
  age_range?: 'anak' | 'remaja' | 'dewasa_muda' | 'dewasa' | 'lansia';
  sex?: 'laki_laki' | 'perempuan' | 'prefer_not_to_say';
  conditions?: string[]; // riwayat kondisi khusus: asma, diabetes, hipertensi, kehamilan
  allergies?: string[];
  tone_pref?: 'santai' | 'formal';
  detail_pref?: 'ringkas' | 'detail';
  region?: string;
  uses_bpjs?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AnxietyCheckin {
  id?: string;
  user_id?: string;
  anxiety_before: number; // 1-5
  anxiety_after?: number; // 1-5
  created_at?: string;
}

export interface DiaryEntry {
  id: string;
  user_id?: string;
  session_id?: string;
  note: string;
  severity: number; // 1-5
  symptoms?: string[];
  created_at: string;
}
