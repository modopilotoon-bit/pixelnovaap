-- ═══════════════════════════════════════════════════════════════
-- CHISPA ✨ — Supabase Schema (Sin Auth — Login Interno)
-- Corre este SQL en tu Supabase SQL Editor antes de usar la app
-- ═══════════════════════════════════════════════════════════════

-- ─── PROFILES (para last_seen / estado de conexión) ─────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  username TEXT PRIMARY KEY CHECK (username IN ('mimmis', 'russell')),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read/write profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Seed profiles
INSERT INTO public.profiles (username) VALUES ('mimmis'), ('russell')
ON CONFLICT (username) DO NOTHING;

-- ─── QUESTION ANSWERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.question_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id TEXT NOT NULL,
  question_level INT NOT NULL CHECK (question_level IN (1, 2, 3)),
  question_text TEXT NOT NULL,
  username TEXT NOT NULL CHECK (username IN ('mimmis', 'russell')),
  answer TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, username)
);

ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read/write question_answers" ON public.question_answers FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.question_answers;

-- ─── DAILY SPARK ANSWERS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_spark_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spark_date DATE NOT NULL,
  question_text TEXT NOT NULL,
  username TEXT NOT NULL CHECK (username IN ('mimmis', 'russell')),
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(spark_date, username, question_text)
);

ALTER TABLE public.daily_spark_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read/write daily_spark_answers" ON public.daily_spark_answers FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_spark_answers;

-- ─── DYNAMICS SESSIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dynamics_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('yo_nunca', 'completa_la_frase', 'trivia')),
  state JSONB DEFAULT '{}',
  created_by TEXT NOT NULL CHECK (created_by IN ('mimmis', 'russell')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.dynamics_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read/write dynamics_sessions" ON public.dynamics_sessions FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.dynamics_sessions;

-- ─── MILESTONES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL UNIQUE,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read/write milestones" ON public.milestones FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- NO se necesita crear usuarios en Supabase Auth.
-- El login es interno con credenciales hardcoded en la app:
--   mimmis / pixelnova
--   russell / pixelnova
-- Solo necesitas: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
-- ═══════════════════════════════════════════════════════════════
