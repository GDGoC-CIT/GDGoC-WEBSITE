-- =============================================
-- GDG on Campus CIT - Community Portal Schema
-- RUN THE ENTIRE SCRIPT IN SUPABASE SQL EDITOR
-- =============================================

-- STEP 1: DROP EXISTING TABLES (clean slate)
DROP TABLE IF EXISTS rsvps CASCADE;
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- STEP 2: CREATE TABLES

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'member', 'admin')),
  google_avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events table (uses TEXT id for predictable inserts)
CREATE TABLE events (
  id TEXT PRIMARY KEY,
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
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RSVPs table
CREATE TABLE rsvps (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Tasks table (Kanban)
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee_id TEXT REFERENCES users(id),
  due_date DATE,
  tags TEXT[] DEFAULT '{}',
  position INT DEFAULT 0,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gallery table
CREATE TABLE gallery (
  id TEXT PRIMARY KEY,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
  tag TEXT,
  uploaded_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Achievements table
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('competition', 'certification', 'recognition', 'project')),
  year INT NOT NULL,
  student_names TEXT[] NOT NULL,
  external_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- People table
CREATE TABLE people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  batch TEXT NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  about TEXT,
  skills TEXT[] DEFAULT '{}',
  linkedin TEXT,
  github TEXT,
  portfolio TEXT,
  website TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  verified BOOLEAN DEFAULT false,
  is_team_lead BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STEP 3: ENABLE RLS WITH FULLY OPEN POLICIES
-- (Required so static site can read/write without Firebase Auth tokens)

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Open policies: allow all operations from anon key
CREATE POLICY "Public full access users" ON users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access events" ON events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access rsvps" ON rsvps FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access tasks" ON tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access gallery" ON gallery FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access achievements" ON achievements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public full access people" ON people FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- STEP 4: SEED INITIAL DATA

-- Seed admin user
INSERT INTO users (id, email, name, role) VALUES
('admin-seed', 'gdgoncampuscit@gmail.com', 'GDGoC Admin', 'admin');

-- Seed people (members)
INSERT INTO people (id, name, role, batch, department, year, about, skills, linkedin, github, email, avatar, verified, is_team_lead, display_order) VALUES
('dr-kishores', 'Dr. R. Kishores', 'Faculty Advisor', '2026–27', 'ECE', 'Staff',
 'Faculty Advisor for GDG CIT specializing in wireless networks and cloud architectures.',
 ARRAY['Cloud Computing','IoT','Networking','Mentoring'],
 'https://linkedin.com', 'https://github.com', 'kishores@cit.edu.in',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
 true, false, 1),

('dr-rajeshwari', 'Dr. A. Rajeshwari', 'Faculty Advisor', '2026–27', 'CSE', 'Staff',
 'Faculty Advisor supervising student developers and domain research labs.',
 ARRAY['Algorithms','Machine Learning','System Design'],
 'https://linkedin.com', 'https://github.com', 'rajeshwari@cit.edu.in',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
 true, false, 2),

('arun-kumar', 'Arun Kumar', 'Secretary', '2026–27', 'CSE', 'IV',
 'Technical Lead and Secretary. Full-stack developer passionate about Next.js/React.',
 ARRAY['Next.js','React','TypeScript','Node.js','PostgreSQL'],
 'https://linkedin.com', 'https://github.com', 'arun@cit.edu.in',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
 true, false, 1),

('divya-s', 'Divya S', 'Secretary', '2026–27', 'IT', 'IV',
 'Machine Learning Lead. Specializes in computer vision and NLP pipelines.',
 ARRAY['TensorFlow','Python','PyTorch','OpenCV','FastAPI'],
 'https://linkedin.com', 'https://github.com', 'divya@cit.edu.in',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
 true, false, 2),

('sanjay-m', 'Sanjay M', 'Joint Secretary', '2026–27', 'CSE', 'III',
 'Mobile developer exploring Flutter and Native Android. Joint Secretary at GDG CIT.',
 ARRAY['Flutter','Kotlin','Dart','Firebase','Android Jetpack'],
 'https://linkedin.com', 'https://github.com', 'sanjay@cit.edu.in',
 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
 false, false, 1),

('priya-r', 'Priya R', 'Joint Secretary', '2026–27', 'IT', 'III',
 'UI/UX enthusiast focused on crafting clean interfaces using Figma and Material Design.',
 ARRAY['Figma','UI/UX Design','Wireframing','Material Design','CSS'],
 'https://linkedin.com', 'https://github.com', 'priya@cit.edu.in',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
 false, false, 2),

('vijay-anand', 'Vijay Anand', 'Treasurer', '2026–27', 'CSE', 'IV',
 'Treasurer and Cloud Domain enthusiast. Manages budget and infrastructure pipelines.',
 ARRAY['Google Cloud','Docker','Kubernetes','DevOps'],
 'https://linkedin.com', 'https://github.com', 'vijay@cit.edu.in',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
 true, false, 1),

('abhishek-m', 'Abhishek M', 'Development Team', '2026–27', 'CSE', 'III',
 'Web developer working on user management and database integrations.',
 ARRAY['React','Express','MongoDB','Tailwind CSS'],
 'https://linkedin.com', 'https://github.com', 'abhishek@cit.edu.in',
 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
 false, true, 1),

('karthik-s', 'Karthik S', 'Development Team', '2026–27', 'IT', 'III',
 'Frontend engineer focused on component performance and state management.',
 ARRAY['JavaScript','HTML5','Sass','Responsive Design'],
 'https://linkedin.com', 'https://github.com', 'karthik@cit.edu.in',
 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
 false, false, 2),

('kavya-b', 'Kavya B', 'Design Team', '2026–27', 'ECE', 'III',
 'Creative designer specializing in branding assets and event illustrations.',
 ARRAY['Illustrator','Photoshop','Typography','Branding'],
 'https://linkedin.com', 'https://github.com', 'kavya@cit.edu.in',
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
 false, true, 1),

('manoj-k', 'Manoj K', 'Cloud Team', '2026–27', 'CSE', 'III',
 'Cloud engineer exploring Serverless architectures and Cloud Run.',
 ARRAY['GCP','Firebase','CI/CD','Serverless'],
 'https://linkedin.com', 'https://github.com', 'manoj@cit.edu.in',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
 false, true, 1),

('pooja-r', 'Pooja R', 'AI Team', '2026–27', 'IT', 'III',
 'Data scientist working on deep learning models and predictive analytics.',
 ARRAY['Python','Pandas','Scikit-Learn','Data Analysis'],
 'https://linkedin.com', 'https://github.com', 'pooja@cit.edu.in',
 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
 false, true, 1),

('rahul-g', 'Rahul G', 'Event Team', '2026–27', 'ECE', 'III',
 'Event coordinator specializing in speaker outreach and logistics.',
 ARRAY['Public Relations','Project Management','Operations'],
 'https://linkedin.com', 'https://github.com', 'rahul@cit.edu.in',
 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200',
 false, true, 1),

('sneha-v', 'Sneha V', 'Media Team', '2026–27', 'IT', 'III',
 'Media production enthusiast. Edits event highlights and coordinates video coverage.',
 ARRAY['Premiere Pro','Videography','Photography','Content Writing'],
 'https://linkedin.com', 'https://github.com', 'sneha@cit.edu.in',
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
 false, true, 1),

('vikas-p', 'Vikas P', 'Management Team', '2026–27', 'CSE', 'IV',
 'Operations manager coordinating volunteer onboarding and task delegation.',
 ARRAY['Leadership','Operations','Logistics','Community Building'],
 'https://linkedin.com', 'https://github.com', 'vikas@cit.edu.in',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
 false, true, 1),

('hari-prasad', 'Hari Prasad', 'Cyber Security Team', '2026–27', 'CSE', 'IV',
 'Security researcher passionate about vulnerability assessment and penetration testing.',
 ARRAY['Penetration Testing','CTF','Linux','Network Security'],
 'https://linkedin.com', 'https://github.com', 'hari@cit.edu.in',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
 false, true, 1);

-- Seed events
INSERT INTO events (id, title, description, type, date, location, speaker_name, speaker_title, max_capacity, status, created_by) VALUES
('evt-1', 'Google Cloud Study Jam v2',
 'Dive into Google Cloud Platform (GCP) basics with hands-on Qwiklabs.',
 'study_jam', NOW() + INTERVAL '3 days',
 'CIT IT Seminar Hall, Block 3', 'Dr. Rajesh K', 'Google Cloud Champion Innovator', 120, 'published', 'admin-seed'),

('evt-2', 'Next.js 14 Masterclass',
 'Full-day intensive workshop on Next.js 14 - App Router and React Server Components.',
 'workshop', NOW() + INTERVAL '10 days',
 'CIT Computer Lab 2, Block 1', 'Priya Ramesh', 'Senior Software Engineer, Google India', 60, 'published', 'admin-seed'),

('evt-3', 'GDG HackFest 2026',
 'Annual community hackathon with Web, Mobile, and AI/ML tracks.',
 'hackathon', NOW() + INTERVAL '25 days',
 'CIT Innovation Lab, Block 5', 'Dr. Kishores', 'GDG CIT Faculty Advisor', 200, 'published', 'admin-seed'),

('evt-4', 'Android Compose Camp',
 'Hands-on Android development using Jetpack Compose.',
 'workshop', NOW() - INTERVAL '5 days',
 'CIT Android Lab, Block 2', 'Arun Kumar', 'Mobile Dev Lead, GDG CIT', 80, 'published', 'admin-seed');

-- Seed gallery
INSERT INTO gallery (id, cloudinary_url, tag, uploaded_by) VALUES
('gal-1', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600', 'Android Compose Camp', 'admin-seed'),
('gal-2', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600', 'Compose Coding', 'admin-seed'),
('gal-3', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600', 'Workshop Collab', 'admin-seed'),
('gal-4', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600', 'Study Jam v1', 'admin-seed');

-- Seed achievements
INSERT INTO achievements (id, title, description, category, year, student_names, external_url) VALUES
('ach-1', 'Smart India Hackathon 2025 Winners',
 'GDG CIT team won first place in SIH 2025 with an AI-powered traffic management solution.',
 'competition', 2025, ARRAY['Arun Kumar','Divya S','Manoj K','Kavya B'], 'https://sih.gov.in'),
('ach-2', 'Google Cloud Champion Team',
 'Three members achieved Google Cloud Champion Innovator recognition.',
 'recognition', 2025, ARRAY['Vijay Anand','Manoj K','Rahul G'], 'https://cloud.google.com/developers/champions'),
('ach-3', 'Android Jetpack Compose Early Adopters',
 'Built one of the first Compose Multiplatform apps demonstrated at Google I/O Extended Coimbatore.',
 'project', 2024, ARRAY['Sanjay M','Abhishek M','Karthik S'], NULL),
('ach-4', 'GCP Professional Cloud Architect Certification',
 'Five GDG CIT members earned Professional Cloud Architect certifications.',
 'certification', 2024, ARRAY['Arun Kumar','Pooja R','Sneha V','Hari Prasad','Priya R'], 'https://cloud.google.com/certification');

-- Seed tasks (Kanban)
INSERT INTO tasks (id, title, description, status, priority, tags, position, created_by) VALUES
('task-1', 'Setup GDG CIT Portal', 'Initialize Next.js with Firebase backend', 'done', 'high', ARRAY['web','firebase'], 0, 'admin-seed'),
('task-2', 'Design System', 'Build component library with Google brand colors', 'done', 'medium', ARRAY['design','ui'], 1, 'admin-seed'),
('task-3', 'Supabase Integration', 'Connect all tables to Supabase PostgreSQL', 'in_progress', 'high', ARRAY['database','backend'], 0, 'admin-seed'),
('task-4', 'Event RSVP System', 'Allow users to RSVP and check-in via QR', 'review', 'medium', ARRAY['events','feature'], 0, 'admin-seed'),
('task-5', 'Google Auth Integration', 'Sign-in with Google via Firebase Auth', 'in_progress', 'high', ARRAY['auth','firebase'], 1, 'admin-seed'),
('task-6', 'Gallery Upload', 'Enable admins to upload event photos to Cloudinary', 'backlog', 'medium', ARRAY['media','cloudinary'], 0, 'admin-seed'),
('task-7', 'Achievement Showcase', 'Rich achievements page for student wins', 'done', 'low', ARRAY['ui','content'], 2, 'admin-seed'),
('task-8', 'Mobile Responsive Testing', 'Test and fix responsive layouts', 'backlog', 'low', ARRAY['testing','mobile'], 1, 'admin-seed');

-- Done!
SELECT 'GDG CIT Portal database setup complete!' AS status;
