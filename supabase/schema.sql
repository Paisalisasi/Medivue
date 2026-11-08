-- =========================================================================
-- MEDIVUE DATABASE SCHEMA (Supabase Postgres)
-- Sesuai Dokumen IMK Halaman 5 Bagian 11: Struktur Data & Row Level Security
-- =========================================================================

-- 1. Tabel Profil Personalisasi (Opt-in & Minimalis)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age_range TEXT CHECK (age_range IN ('anak', 'remaja', 'dewasa_muda', 'dewasa', 'lansia')),
  sex TEXT,
  conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  tone_pref TEXT DEFAULT 'santai' CHECK (tone_pref IN ('santai', 'formal')),
  detail_pref TEXT DEFAULT 'ringkas' CHECK (detail_pref IN ('ringkas', 'detail')),
  region TEXT,
  uses_bpjs BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Check-in Kecemasan (Skala 1-5 Sebelum & Sesudah Triage)
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anxiety_before SMALLINT NOT NULL CHECK (anxiety_before BETWEEN 1 AND 5),
  anxiety_after SMALLINT CHECK (anxiety_after BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Sesi Gejala & Hasil Triage
CREATE TABLE IF NOT EXISTS public.symptom_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms JSONB NOT NULL DEFAULT '{}'::jsonb,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('darurat', 'segera', 'terjadwal', 'pantau_di_rumah')),
  reasoning TEXT,
  next_steps JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Diary Gejala Harian
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.symptom_sessions(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  severity SMALLINT NOT NULL CHECK (severity BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Prinsip Privasi: User hanya bisa membaca dan menulis data miliknya sendiri
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- Profiles: user owns their profile
CREATE POLICY "Users can manage own profile"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Checkins: user owns their checkin records
CREATE POLICY "Users can manage own checkins"
  ON public.checkins
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Symptom Sessions: user owns their symptom triage sessions
CREATE POLICY "Users can manage own symptom sessions"
  ON public.symptom_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Diary Entries: user owns their diary entries
CREATE POLICY "Users can manage own diary"
  ON public.diary_entries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- API privileges are still required before RLS policies can be evaluated.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.profiles,
  public.checkins,
  public.symptom_sessions,
  public.diary_entries
TO authenticated;
