-- Add Outcome Tracking columns to decisions table
ALTER TABLE public.decisions 
ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS final_outcome TEXT,
ADD COLUMN IF NOT EXISTS success_score INTEGER CHECK (success_score BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
