-- Migration: Add structured fields to jobs table
ALTER TABLE jobs 
  ADD COLUMN IF NOT EXISTS domain text,
  ADD COLUMN IF NOT EXISTS required_skills text[],
  ADD COLUMN IF NOT EXISTS preferred_skills text[],
  ADD COLUMN IF NOT EXISTS tools_tech text[],
  ADD COLUMN IF NOT EXISTS education_requirements text;
