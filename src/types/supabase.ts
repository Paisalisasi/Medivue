/**
 * Tipe Data Skema Database Supabase Medivue
 * Sesuai Dokumen IMK Halaman 5 Bagian 11
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          age_range: string | null;
          sex: string | null;
          conditions: string[] | null;
          allergies: string[] | null;
          tone_pref: 'santai' | 'formal';
          detail_pref: 'ringkas' | 'detail';
          region: string | null;
          uses_bpjs: boolean | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      checkins: {
        Row: {
          id: string;
          user_id: string | null;
          anxiety_before: number;
          anxiety_after: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          anxiety_before: number;
          anxiety_after?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['checkins']['Row']>;
      };
      symptom_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          symptoms: Record<string, unknown>;
          answers: Record<string, unknown>;
          urgency_level: 'darurat' | 'segera' | 'terjadwal' | 'pantau_di_rumah';
          reasoning: string;
          next_steps: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          symptoms: Record<string, unknown>;
          answers: Record<string, unknown>;
          urgency_level: 'darurat' | 'segera' | 'terjadwal' | 'pantau_di_rumah';
          reasoning: string;
          next_steps: string[];
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['symptom_sessions']['Row']>;
      };
      diary_entries: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          note: string;
          severity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          note: string;
          severity: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['diary_entries']['Row']>;
      };
    };
  };
}
