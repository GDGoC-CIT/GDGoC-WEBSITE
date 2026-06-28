-- GDG on Campus CIT - Community Portal Schema
-- PostgreSQL Migration Script for Cloud Supabase

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'member', 'admin')),
  google_avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('workshop', 'talk', 'hackathon', 'study_jam', 'other')),
  cloudinary_public_id TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  speaker_name TEXT,
  speaker_title TEXT,
  max_capacity INT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create RSVPs Table
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- 4. Create Tasks Table (Kanban Board)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee_id UUID REFERENCES users(id),
  due_date DATE,
  tags TEXT[] DEFAULT '{}',
  position INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  tag TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('competition', 'certification', 'recognition', 'project')),
  year INT NOT NULL,
  student_names TEXT[] NOT NULL,
  external_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 7. Row Level Security Policies

-- USERS Policies
CREATE POLICY "Public read admin/member users" ON users 
  FOR SELECT USING (role IN ('member', 'admin'));

CREATE POLICY "Users can update own details" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- EVENTS Policies
CREATE POLICY "Public read published events" ON events 
  FOR SELECT USING (status = 'published');

CREATE POLICY "Members/Admins manage events" ON events 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('member', 'admin')
    )
  );

-- RSVPS Policies
CREATE POLICY "Users read and write own RSVPs" ON rsvps 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Members/Admins read and check in RSVPs" ON rsvps 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('member', 'admin')
    )
  );

CREATE POLICY "Members/Admins update checked_in status" ON rsvps 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('member', 'admin')
    )
  );

-- TASKS Policies
CREATE POLICY "Members/Admins read and write tasks" ON tasks 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('member', 'admin')
    )
  );

-- GALLERY Policies
CREATE POLICY "Public read gallery items" ON gallery 
  FOR SELECT USING (true);

CREATE POLICY "Members/Admins manage gallery items" ON gallery 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('member', 'admin')
    )
  );

-- ACHIEVEMENTS Policies
CREATE POLICY "Public read achievements" ON achievements 
  FOR SELECT USING (true);

CREATE POLICY "Members/Admins manage achievements" ON achievements 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('member', 'admin')
    )
  );
