-- LifeLedger Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  age_range TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_pro BOOLEAN DEFAULT false,
  pro_expires_at TIMESTAMPTZ,
  trial_started_at TIMESTAMPTZ
);

-- Decisions table
CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Career', 'Relationships', 'Health', 'Finance', 'Education', 'Personal')),
  what_decided TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  alternatives_rejected TEXT,
  confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 1 AND 10),
  anxiety_score INTEGER NOT NULL CHECK (anxiety_score BETWEEN 1 AND 10),
  expected_outcome TEXT,
  ai_analysis TEXT,
  ai_bias_detected TEXT[],
  ai_devil_advocate TEXT,
  ai_quality_score INTEGER CHECK (ai_quality_score BETWEEN 1 AND 100),
  tags TEXT[],
  is_resolved BOOLEAN DEFAULT false,
  final_outcome TEXT,
  success_score INTEGER CHECK (success_score BETWEEN 1 AND 10),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reflections table
CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reflection_type TEXT NOT NULL CHECK (reflection_type IN ('1month', '3month', '6month', '1year')),
  happiness_score INTEGER NOT NULL CHECK (happiness_score BETWEEN 1 AND 10),
  reflection_text TEXT,
  actual_outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(decision_id, reflection_type)
);

-- Mood check-ins table
CREATE TABLE IF NOT EXISTS public.mood_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  energy_score INTEGER NOT NULL CHECK (energy_score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS decisions_user_id_idx ON public.decisions(user_id);
CREATE INDEX IF NOT EXISTS decisions_created_at_idx ON public.decisions(created_at);
CREATE INDEX IF NOT EXISTS reflections_decision_id_idx ON public.reflections(decision_id);
CREATE INDEX IF NOT EXISTS reflections_user_id_idx ON public.reflections(user_id);
CREATE INDEX IF NOT EXISTS mood_checkins_user_id_idx ON public.mood_checkins(user_id);
CREATE INDEX IF NOT EXISTS mood_checkins_created_at_idx ON public.mood_checkins(created_at);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;

-- Users: can only see/edit their own row
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_delete_own" ON public.users FOR DELETE USING (auth.uid() = id);

-- Decisions: can only see/edit their own decisions
CREATE POLICY "decisions_select_own" ON public.decisions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "decisions_insert_own" ON public.decisions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "decisions_update_own" ON public.decisions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "decisions_delete_own" ON public.decisions FOR DELETE USING (auth.uid() = user_id);

-- Reflections: can only see/edit their own reflections
CREATE POLICY "reflections_select_own" ON public.reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reflections_insert_own" ON public.reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reflections_update_own" ON public.reflections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reflections_delete_own" ON public.reflections FOR DELETE USING (auth.uid() = user_id);

-- Mood check-ins: can only see/edit their own check-ins
CREATE POLICY "mood_checkins_select_own" ON public.mood_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mood_checkins_insert_own" ON public.mood_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mood_checkins_update_own" ON public.mood_checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "mood_checkins_delete_own" ON public.mood_checkins FOR DELETE USING (auth.uid() = user_id);
