-- Migration to add has_completed_tour to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_completed_tour BOOLEAN DEFAULT false;
