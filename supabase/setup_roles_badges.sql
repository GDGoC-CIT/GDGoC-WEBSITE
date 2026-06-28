-- ============================================================
-- GDGoC - ROLES & BADGES TABLES SETUP
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add badges column to existing people table (if not already there)
ALTER TABLE people ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- 2. Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  batch TEXT NOT NULL,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  batch TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#1A73E8',
  icon TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- 5. Drop any old conflicting policies first (safe to ignore if they don't exist)
DROP POLICY IF EXISTS "Public read roles" ON roles;
DROP POLICY IF EXISTS "Authenticated write roles" ON roles;
DROP POLICY IF EXISTS "Public full access roles" ON roles;

DROP POLICY IF EXISTS "Public read badges" ON badges;
DROP POLICY IF EXISTS "Authenticated write badges" ON badges;
DROP POLICY IF EXISTS "Public full access badges" ON badges;

-- 6. Create open policies (anon key can read + write - required for static site)
CREATE POLICY "Public full access roles"  ON roles  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access badges" ON badges FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
