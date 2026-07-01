import { createClient } from '@supabase/supabase-js';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'viewer' | 'member' | 'admin';
  google_avatar_url: string;
  created_at?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'talk' | 'hackathon' | 'study_jam' | 'other';
  cloudinary_public_id?: string;
  date: string;
  location: string;
  speaker_name?: string;
  speaker_title?: string;
  max_capacity?: number;
  status: 'draft' | 'published' | 'cancelled';
  created_by?: string;
  created_at?: string;
}

export interface RSVP {
  id: string;
  user_id: string;
  event_id: string;
  checked_in: boolean;
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id?: string;
  due_date?: string;
  tags: string[];
  position: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryItem {
  id: string;
  cloudinary_url: string;
  cloudinary_public_id?: string;
  event_id?: string;
  tag?: string;
  uploaded_by?: string;
  created_at?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'competition' | 'certification' | 'recognition' | 'project';
  year: number;
  student_names: string[];
  external_url?: string;
  created_at?: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  batch: string;
  department: string;
  year: string;
  about: string;
  skills: string[];
  linkedin: string;
  github: string;
  portfolio?: string;
  website?: string;
  email: string;
  phone?: string;
  avatar: string;
  is_team_lead?: boolean;
  display_order?: number;
  badges?: string[];
  created_at?: string;
}

export interface Role {
  id: string;
  batch: string;
  name: string;
  display_order: number;
  created_at?: string;
}

export interface Badge {
  id: string;
  batch: string;
  name: string;
  color: string;
  icon?: string;
  display_order: number;
  created_at?: string;
}

export interface Batch {
  id: string;
  name: string;       // e.g. "2026–27"
  created_at?: string;
}


// Initial Mock Data
const initialEvents: Event[] = [
  {
    id: 'evt-1',
    title: 'Google Cloud Study Jam v2',
    description: 'Dive into Google Cloud Platform (GCP) basics, hands-on labs with Qwiklabs, and learn how to deploy serverless apps. Secure your cloud skills badge and earn cool swags!',
    type: 'study_jam',
    cloudinary_public_id: 'study_jam_cloud',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days in future
    location: 'CIT IT Seminar Hall, Block 3',
    speaker_name: 'Dr. Rajesh K',
    speaker_title: 'Google Cloud Champion Innovator',
    max_capacity: 120,
    status: 'published'
  },
  {
    id: 'evt-2',
    title: 'Next.js App Router Masterclass',
    description: 'Learn modern React Server Components, Suspense, streaming, server actions, and deploy production-grade websites to Vercel. Recommended for beginners and intermediate developers.',
    type: 'workshop',
    cloudinary_public_id: 'nextjs_masterclass',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days in future
    location: 'Main Auditorium, CIT Library Block',
    speaker_name: 'Arun Kumar',
    speaker_title: 'Full Stack Engineer & Tech Lead',
    max_capacity: 200,
    status: 'published'
  },
  {
    id: 'evt-3',
    title: 'GDG Hackfest CIT 2026',
    description: 'A 24-hour hackathon where student teams design, build, and pitch software solutions addressing local community issues. Cash prizes, certificates, and mentoring included.',
    type: 'hackathon',
    cloudinary_public_id: 'gdg_hackfest',
    date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days in future
    location: 'CIT Main Campus Hub & Open Air Theatre',
    speaker_name: 'GDG Panel Judges',
    speaker_title: 'Industry Experts from Google & Tech Corporates',
    max_capacity: 300,
    status: 'published'
  },
  {
    id: 'evt-4',
    title: 'Android Compose Camp: UI Essentials',
    description: 'Our kickstart session on Jetpack Compose! We explored declarative UI, state management, basic layouts, custom animations, and built an interactive material app.',
    type: 'workshop',
    cloudinary_public_id: 'android_camp',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago (Past event)
    location: 'CSE Lab 4, Block 2',
    speaker_name: 'Sanjay M',
    speaker_title: 'Android Developer & GDG Mobile Domain Lead',
    max_capacity: 80,
    status: 'published'
  }
];

const initialTeam = [
  { id: '1', name: 'Dr. R. Kishores', role: 'Chapter Lead / Faculty Advisor', email: 'kishores@cit.edu.in', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', domains: ['Management', 'Cloud'], linkedin: 'https://linkedin.com' },
  { id: '2', name: 'Arun Kumar', role: 'Technical & Web Lead', email: 'arun@cit.edu.in', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', domains: ['Web', 'Next.js', 'React'], linkedin: 'https://linkedin.com' },
  { id: '3', name: 'Divya S', role: 'Machine Learning Lead', email: 'divya@cit.edu.in', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', domains: ['AI/ML', 'TensorFlow', 'Python'], linkedin: 'https://linkedin.com' },
  { id: '4', name: 'Sanjay M', role: 'Flutter & Mobile Domain Lead', email: 'sanjay@cit.edu.in', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200', domains: ['Mobile', 'Flutter', 'Android'], linkedin: 'https://linkedin.com' },
  { id: '5', name: 'Priya R', role: 'UI/UX Design Lead', email: 'priya@cit.edu.in', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200', domains: ['Design', 'Figma', 'Material Design'], linkedin: 'https://linkedin.com' },
  { id: '6', name: 'Vijay Anand', role: 'Cloud Platform Lead', email: 'vijay@cit.edu.in', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', domains: ['Cloud', 'Firebase', 'DevOps'], linkedin: 'https://linkedin.com' }
];

const initialGallery: GalleryItem[] = [
  { id: 'gal-1', cloudinary_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600', event_id: 'evt-4', tag: 'Android Compose Camp' },
  { id: 'gal-2', cloudinary_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600', event_id: 'evt-4', tag: 'Compose Coding' },
  { id: 'gal-3', cloudinary_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600', event_id: 'evt-4', tag: 'Workshop Collab' },
  { id: 'gal-4', cloudinary_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600', event_id: 'evt-1', tag: 'Study Jam v1' }
];

const initialAchievements: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Smart India Hackathon 2025 winners',
    description: 'Our team won the 1st prize in Smart India Hackathon (SIH) under the Smart Agriculture category, creating a real-time IoT crop yield optimizer using TensorFlow.',
    category: 'competition',
    year: 2025,
    student_names: ['Arun Kumar', 'Divya S', 'Sanjay M'],
    external_url: 'https://sih.gov.in'
  },
  {
    id: 'ach-2',
    title: 'Google Cloud Champion Program',
    description: 'Six core board members successfully certified as Google Cloud Certified Associate Cloud Engineers (ACE), boosting local campus mentoring capabilities.',
    category: 'certification',
    year: 2025,
    student_names: ['Dr. R. Kishores', 'Vijay Anand', 'Priya R'],
    external_url: 'https://cloud.google.com/certification'
  },
  {
    id: 'ach-3',
    title: 'Best Developer Campus Chapter Award',
    description: 'Recognized as one of the most active campus dev groups in Tamil Nadu, hosting 12+ successful code workshops, hackathons, and study jams over 6 months.',
    category: 'recognition',
    year: 2025,
    student_names: ['GDG CIT Core Team'],
    external_url: 'https://developers.google.com'
  }
];

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Confirm Event Venue for Cloud Study Jam',
    description: 'Book Block 3 IT Seminar hall and confirm projector and lab setups with technical assistants.',
    status: 'in_progress',
    priority: 'high',
    assignee_id: '2', // Arun Kumar
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['Event', 'Outreach'],
    position: 0
  },
  {
    id: 'task-2',
    title: 'Design Event Banner Templates',
    description: 'Design custom Google brand color templates for social media headers and Cloudinary image listings.',
    status: 'backlog',
    priority: 'medium',
    assignee_id: '5', // Priya R
    due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['Design', 'Tech'],
    position: 0
  },
  {
    id: 'task-3',
    title: 'Configure Supabase Database Schema & RLS',
    description: 'Run SQL migrations on Supabase to enable Tables for users, events, RSVPs, Kanban cards, and lock admin routes using Row Level Security.',
    status: 'done',
    priority: 'high',
    assignee_id: '2', // Arun Kumar
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['Tech'],
    position: 0
  },
  {
    id: 'task-4',
    title: 'Finalize Speaker Bios & Profiles',
    description: 'Request bio profiles, LinkedIn link formats, and headshots from Google Cloud champion panels for judges section.',
    status: 'review',
    priority: 'low',
    assignee_id: '3', // Divya S
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: ['Outreach'],
    position: 0
  }
];

const initialRSVPs: RSVP[] = [
  { id: 'r-1', user_id: 'viewer-user', event_id: 'evt-1', checked_in: false },
  { id: 'r-2', user_id: 'viewer-user', event_id: 'evt-4', checked_in: true }
];

const initialPeople: Person[] = [
  // 2026–27 Batch
  {
    id: "dr-kishores",
    name: "Dr. R. Kishores",
    role: "Faculty Advisor",
    batch: "2026–27",
    department: "ECE",
    year: "Staff",
    about: "Dr. R. Kishores is a passionate educator and technology enthusiast advising the GDG CIT chapter. He specializes in wireless networks and cloud architectures.",
    skills: ["Cloud Computing", "IoT", "Networking", "Academic Mentoring"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "kishores@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    display_order: 1
  },
  {
    id: "dr-rajeshwari",
    name: "Dr. A. Rajeshwari",
    role: "Faculty Advisor",
    batch: "2026–27",
    department: "CSE",
    year: "Staff",
    about: "Dr. A. Rajeshwari supervises student developers and domain research labs at CIT, driving collaboration on cloud engineering and AI tracks.",
    skills: ["Algorithms", "Machine Learning", "System Design"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "rajeshwari@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    display_order: 2
  },
  {
    id: "arun-kumar",
    name: "Arun Kumar",
    role: "Secretary",
    batch: "2026–27",
    department: "CSE",
    year: "IV",
    about: "Technical Lead and Secretary at GDG CIT. Full-stack developer passionate about building scalable web products and mentoring peers on Next.js/React.",
    skills: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    portfolio: "https://arunkumar.dev",
    email: "arun@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    display_order: 1
  },
  {
    id: "divya-s",
    name: "Divya S",
    role: "Secretary",
    batch: "2026–27",
    department: "IT",
    year: "IV",
    about: "Machine Learning Lead & Secretary. Specializes in computer vision and natural language processing pipelines using TensorFlow and PyTorch.",
    skills: ["TensorFlow", "Python", "PyTorch", "OpenCV", "FastAPI"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "divya@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    display_order: 2
  },
  {
    id: "sanjay-m",
    name: "Sanjay M",
    role: "Joint Secretary",
    batch: "2026–27",
    department: "CSE",
    year: "III",
    about: "Mobile developer exploring Flutter and Native Android. Joint Secretary at GDG CIT organizing workshops and hands-on compose camps.",
    skills: ["Flutter", "Kotlin", "Dart", "Firebase", "Android Jetpack"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "sanjay@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
    display_order: 1
  },
  {
    id: "priya-r",
    name: "Priya R",
    role: "Joint Secretary",
    batch: "2026–27",
    department: "IT",
    year: "III",
    about: "UI/UX enthusiast focused on crafting clean interfaces, wireframing, and establishing user experience patterns using Figma and Google Material Design.",
    skills: ["Figma", "UI/UX Design", "Wireframing", "Material Design", "CSS"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    portfolio: "https://priyadesign.me",
    email: "priya@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    display_order: 2
  },
  {
    id: "vijay-anand",
    name: "Vijay Anand",
    role: "Treasurer",
    batch: "2026–27",
    department: "CSE",
    year: "IV",
    about: "Treasurer and Cloud Domain enthusiast. Manages budget allocations and coordinates infrastructure pipelines for hackathons.",
    skills: ["Google Cloud", "Docker", "Kubernetes", "DevOps", "Financial Planning"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "vijay@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    display_order: 1
  },
  {
    id: "abhishek-m",
    name: "Abhishek M",
    role: "Development Team",
    batch: "2026–27",
    department: "CSE",
    year: "III",
    about: "Web developer working on user management, database integrations, and dynamic dashboard interfaces for community apps.",
    skills: ["React", "Express", "MongoDB", "Tailwind CSS"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "abhishek@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200",
    is_team_lead: true,
    display_order: 1
  },
  {
    id: "karthik-s",
    name: "Karthik S",
    role: "Development Team",
    batch: "2026–27",
    department: "IT",
    year: "III",
    about: "Frontend engineer focused on component performance, responsiveness, and state management logic using Zustand and React.",
    skills: ["JavaScript", "HTML5", "Sass", "Responsive Design"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "karthik@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
    display_order: 2
  },
  {
    id: "kavya-b",
    name: "Kavya B",
    role: "Design Team",
    batch: "2026–27",
    department: "ECE",
    year: "III",
    about: "Creative designer specializing in branding assets, web banners, and illustrations for events and social media announcements.",
    skills: ["Illustrator", "Photoshop", "Typography", "Branding"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "kavya@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    is_team_lead: true,
    display_order: 1
  },
  {
    id: "manoj-k",
    name: "Manoj K",
    role: "Cloud Team",
    batch: "2026–27",
    department: "CSE",
    year: "III",
    about: "Cloud engineer exploring Serverless architectures, Cloud Run, and deployment automations using GitHub Actions.",
    skills: ["GCP", "Firebase", "CI/CD", "Serverless"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "manoj@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    is_team_lead: true,
    display_order: 1
  },
  {
    id: "pooja-r",
    name: "Pooja R",
    role: "AI Team",
    batch: "2026–27",
    department: "IT",
    year: "III",
    about: "Data scientist working on deep learning models and predictive analytics. Enthusiastic about generative AI and LLM integrations.",
    skills: ["Python", "Pandas", "Scikit-Learn", "Data Analysis"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "pooja@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    is_team_lead: true,
    display_order: 1
  },
  {
    id: "rahul-g",
    name: "Rahul G",
    role: "Event Team",
    batch: "2026–27",
    department: "ECE",
    year: "III",
    about: "Event coordinator who excels in speaker outreach, logistical planning, schedule pipelines, and venue arrangements.",
    skills: ["Public Relations", "Project Management", "Operations"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "rahul@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200",
    is_team_lead: true,
    display_order: 1
  },
  {
    id: "sneha-v",
    name: "Sneha V",
    role: "Media Team",
    batch: "2026–27",
    department: "IT",
    year: "III",
    about: "Media production enthusiast. Edits event highlights, designs recap flyers, and coordinates video coverage for CIT technical events.",
    skills: ["Premiere Pro", "Videography", "Photography", "Content Writing"],
    is_team_lead: true,
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "sneha@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    display_order: 1
  },
  {
    id: "vikas-p",
    name: "Vikas P",
    role: "Management Team",
    batch: "2026–27",
    department: "CSE",
    year: "IV",
    about: "Coordinates inter-chapter relations and manages sponsorship drives, vendor communications, and resource procurement.",
    skills: ["Leadership", "Negotiation", "Public Speaking", "Strategy"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "vikas@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=200",
    is_team_lead: true,
    display_order: 1
  },
  {
    id: "hari-prasad",
    name: "Hari Prasad",
    role: "Cyber Security Team",
    batch: "2026–27",
    department: "IT",
    year: "IV",
    about: "Security analyst focused on penetration testing, CTFs, vulnerability scanning, and conducting cryptography sessions.",
    skills: ["Linux", "Metasploit", "Cryptography", "Reverse Engineering"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "hari@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    is_team_lead: true,
    display_order: 1
  },

  // 2027–28 Batch
  {
    id: "dr-kishores",
    name: "Dr. R. Kishores",
    role: "Faculty Advisor",
    batch: "2027–28",
    department: "ECE",
    year: "Staff",
    about: "Dr. R. Kishores is a passionate educator advising the GDG CIT chapter.",
    skills: ["Cloud Computing", "IoT", "Academic Mentoring"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "kishores@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    display_order: 1
  },
  {
    id: "manoj-k",
    name: "Manoj K",
    role: "Secretary",
    batch: "2027–28",
    department: "CSE",
    year: "IV",
    about: "Cloud engineer serving as Secretary for 2027–28.",
    skills: ["GCP", "Firebase", "CI/CD", "Serverless", "Leadership"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "manoj@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    display_order: 1
  },
  {
    id: "kavya-b",
    name: "Kavya B",
    role: "Joint Secretary",
    batch: "2027–28",
    department: "ECE",
    year: "IV",
    about: "Creative designer serving as Joint Secretary for 2027–28.",
    skills: ["Illustrator", "Photoshop", "Typography", "Branding", "UI Design"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "kavya@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    display_order: 1
  },

  // 2028–29 Batch
  {
    id: "dr-kishores",
    name: "Dr. R. Kishores",
    role: "Faculty Advisor",
    batch: "2028–29",
    department: "ECE",
    year: "Staff",
    about: "Dr. R. Kishores advising the GDG CIT chapter.",
    skills: ["Cloud Computing", "IoT", "Academic Mentoring"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "kishores@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    display_order: 1
  },
  {
    id: "abhishek-sec",
    name: "Abhishek M",
    role: "Secretary",
    batch: "2028–29",
    department: "CSE",
    year: "IV",
    about: "Web developer serving as Secretary for 2028–29.",
    skills: ["React", "Express", "MongoDB", "Tailwind CSS", "Management"],
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    email: "abhishek@cit.edu.in",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200",
    display_order: 1
  }
];

// Supabase Init
// NOTE: These are public/anon keys - safe to commit (they are also in .env.local for local dev).
// Hardcoded here so the static export (Firebase Hosting) always has them embedded.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nibnmfdtgeanrycmlevf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_WB3VmTv2VLENrphPeMYL5w_H3-Y0mXO';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;


// Database Service Manager (supports local storage syncing for mock dev workflows)
class DatabaseService {
  private isMock: boolean;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_TTL = 30000; // 30 seconds cache TTL

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < this.CACHE_TTL) {
      return entry.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(keyPrefix?: string) {
    if (keyPrefix) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(keyPrefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  constructor() {
    this.isMock = !supabase;
    if (this.isMock) {
      console.log('Database initialized in MOCK local mode. Reading and writing to LocalStorage.');
      this.initLocalStorage();
    } else {
      console.log('Database initialized with real Supabase client.');
    }
  }

  private initLocalStorage() {
    if (typeof window === 'undefined') return;
    // Version migration: clear stale people data when slug IDs were introduced
    const DB_VERSION = '2';
    if (localStorage.getItem('gdg_db_version') !== DB_VERSION) {
      localStorage.removeItem('gdg_people');
      Object.keys(localStorage)
        .filter(k => k.startsWith('gdg_role_order_'))
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem('gdg_db_version', DB_VERSION);
    }
    if (!localStorage.getItem('gdg_events')) localStorage.setItem('gdg_events', JSON.stringify(initialEvents));
    if (!localStorage.getItem('gdg_team')) localStorage.setItem('gdg_team', JSON.stringify(initialTeam));
    if (!localStorage.getItem('gdg_gallery')) localStorage.setItem('gdg_gallery', JSON.stringify(initialGallery));
    if (!localStorage.getItem('gdg_achievements')) localStorage.setItem('gdg_achievements', JSON.stringify(initialAchievements));
    if (!localStorage.getItem('gdg_tasks')) localStorage.setItem('gdg_tasks', JSON.stringify(initialTasks));
    if (!localStorage.getItem('gdg_rsvps')) localStorage.setItem('gdg_rsvps', JSON.stringify(initialRSVPs));
    if (!localStorage.getItem('gdg_people')) localStorage.setItem('gdg_people', JSON.stringify(initialPeople));
  }

  // Get active session user (mocked for preview development)
  async getSessionUser(): Promise<User | null> {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('gdg_session');
    if (session) {
      return JSON.parse(session);
    }
    // Default mock user for testing if nothing else exists
    const defaultUser: User = {
      id: 'viewer-user',
      email: 'student@cit.edu.in',
      name: 'Adithya CIT',
      role: 'admin', // Start as Admin for easy testing of all Kanban/Media operations in preview
      google_avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
    };
    localStorage.setItem('gdg_session', JSON.stringify(defaultUser));
    return defaultUser;
  }

  async logoutSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('gdg_session');
    this.clearCache();
  }

  async setSessionUser(user: User) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('gdg_session', JSON.stringify(user));
    this.clearCache();
  }

  // EVENTS
  async getEvents(): Promise<Event[]> {
    const cacheKey = 'events';
    const cached = this.getCached<Event[]>(cacheKey);
    if (cached) return cached;

    let result: Event[];
    if (this.isMock) {
      if (typeof window === 'undefined') return initialEvents;
      result = JSON.parse(localStorage.getItem('gdg_events') || '[]');
    } else {
      try {
        const { data, error } = await supabase!.from('events').select('*').order('date', { ascending: true });
        if (error) throw error;
        result = data || [];
      } catch (err) {
        console.warn("Supabase getEvents query failed, falling back to LocalStorage:", err);
        if (typeof window === 'undefined') return initialEvents;
        result = JSON.parse(localStorage.getItem('gdg_events') || JSON.stringify(initialEvents));
      }
    }
    this.setCache(cacheKey, result);
    return result;
  }

  async getEventById(id: string): Promise<Event | null> {
    if (this.isMock) {
      const events = await this.getEvents();
      return events.find(e => e.id === id) || null;
    }
    const { data, error } = await supabase!.from('events').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  async createEvent(event: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
    this.clearCache('events');
    if (this.isMock) {
      const events = await this.getEvents();
      const newEvent: Event = {
        ...event,
        id: 'evt-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      events.push(newEvent);
      localStorage.setItem('gdg_events', JSON.stringify(events));
      return newEvent;
    }
    const { data, error } = await supabase!.from('events').insert([event]).select().single();
    if (error) throw error;
    return data;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    this.clearCache('events');
    if (this.isMock) {
      const events = await this.getEvents();
      const index = events.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Event not found');
      const updated = { ...events[index], ...updates };
      events[index] = updated;
      localStorage.setItem('gdg_events', JSON.stringify(events));
      return updated;
    }
    const { data, error } = await supabase!.from('events').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteEvent(id: string): Promise<void> {
    this.clearCache('events');
    if (this.isMock) {
      const events = await this.getEvents();
      const filtered = events.filter(e => e.id !== id);
      localStorage.setItem('gdg_events', JSON.stringify(filtered));
      return;
    }
    const { error } = await supabase!.from('events').delete().eq('id', id);
    if (error) throw error;
  }

  // RSVPS
  async getRSVPs(): Promise<RSVP[]> {
    const cacheKey = 'rsvps';
    const cached = this.getCached<RSVP[]>(cacheKey);
    if (cached) return cached;

    let result: RSVP[];
    if (this.isMock) {
      if (typeof window === 'undefined') return initialRSVPs;
      result = JSON.parse(localStorage.getItem('gdg_rsvps') || '[]');
    } else {
      try {
        const { data, error } = await supabase!.from('rsvps').select('*');
        if (error) throw error;
        result = data || [];
      } catch (err) {
        console.warn("Supabase getRSVPs query failed, falling back to LocalStorage:", err);
        if (typeof window === 'undefined') return initialRSVPs;
        result = JSON.parse(localStorage.getItem('gdg_rsvps') || JSON.stringify(initialRSVPs));
      }
    }
    this.setCache(cacheKey, result);
    return result;
  }

  async getRSVPsForEvent(eventId: string): Promise<RSVP[]> {
    const cacheKey = `rsvps_event_${eventId}`;
    const cached = this.getCached<RSVP[]>(cacheKey);
    if (cached) return cached;

    let result: RSVP[];
    if (this.isMock) {
      const rsvps = await this.getRSVPs();
      result = rsvps.filter(r => r.event_id === eventId);
    } else {
      const { data, error } = await supabase!.from('rsvps').select('*').eq('event_id', eventId);
      if (error) throw error;
      result = data || [];
    }
    this.setCache(cacheKey, result);
    return result;
  }

  async getRSVPsForUser(userId: string): Promise<RSVP[]> {
    const cacheKey = `rsvps_user_${userId}`;
    const cached = this.getCached<RSVP[]>(cacheKey);
    if (cached) return cached;

    let result: RSVP[];
    if (this.isMock) {
      const rsvps = await this.getRSVPs();
      result = rsvps.filter(r => r.user_id === userId);
    } else {
      const { data, error } = await supabase!.from('rsvps').select('*').eq('user_id', userId);
      if (error) throw error;
      result = data || [];
    }
    this.setCache(cacheKey, result);
    return result;
  }

  async toggleRSVP(userId: string, eventId: string): Promise<{ rsvp?: RSVP; deleted: boolean }> {
    this.clearCache('rsvps');
    if (this.isMock) {
      const rsvps = await this.getRSVPs();
      const existing = rsvps.find(r => r.user_id === userId && r.event_id === eventId);
      
      if (existing) {
        // Delete RSVP
        const filtered = rsvps.filter(r => r.id !== existing.id);
        localStorage.setItem('gdg_rsvps', JSON.stringify(filtered));
        return { deleted: true };
      } else {
        // Create RSVP
        const newRsvp: RSVP = {
          id: 'rsvp-' + Math.random().toString(36).substr(2, 9),
          user_id: userId,
          event_id: eventId,
          checked_in: false,
          created_at: new Date().toISOString()
        };
        rsvps.push(newRsvp);
        localStorage.setItem('gdg_rsvps', JSON.stringify(rsvps));
        return { rsvp: newRsvp, deleted: false };
      }
    }
    
    // Supabase logic: check existing
    const { data: existing } = await supabase!.from('rsvps')
      .select('*')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase!.from('rsvps').delete().eq('id', existing.id);
      if (error) throw error;
      return { deleted: true };
    } else {
      const { data, error } = await supabase!.from('rsvps')
        .insert([{ user_id: userId, event_id: eventId }])
        .select()
        .single();
      if (error) throw error;
      return { rsvp: data, deleted: false };
    }
  }

  async checkInRSVP(rsvpId: string, checkedIn: boolean = true): Promise<RSVP> {
    this.clearCache('rsvps');
    if (this.isMock) {
      const rsvps = await this.getRSVPs();
      const index = rsvps.findIndex(r => r.id === rsvpId);
      if (index === -1) throw new Error('RSVP not found');
      rsvps[index].checked_in = checkedIn;
      localStorage.setItem('gdg_rsvps', JSON.stringify(rsvps));
      return rsvps[index];
    }
    const { data, error } = await supabase!.from('rsvps')
      .update({ checked_in: checkedIn })
      .eq('id', rsvpId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // TASKS (KANBAN)
  async getTasks(): Promise<Task[]> {
    const cacheKey = 'tasks';
    const cached = this.getCached<Task[]>(cacheKey);
    if (cached) return cached;

    let result: Task[];
    if (this.isMock) {
      if (typeof window === 'undefined') return initialTasks;
      result = JSON.parse(localStorage.getItem('gdg_tasks') || '[]');
    } else {
      try {
        const { data, error } = await supabase!.from('tasks').select('*').order('position', { ascending: true });
        if (error) throw error;
        result = data || [];
      } catch (err) {
        console.warn("Supabase getTasks query failed, falling back to LocalStorage:", err);
        if (typeof window === 'undefined') return initialTasks;
        result = JSON.parse(localStorage.getItem('gdg_tasks') || JSON.stringify(initialTasks));
      }
    }
    this.setCache(cacheKey, result);
    return result;
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    this.clearCache('tasks');
    if (this.isMock) {
      const tasks = await this.getTasks();
      const newTask: Task = {
        ...task,
        id: 'task-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      tasks.push(newTask);
      localStorage.setItem('gdg_tasks', JSON.stringify(tasks));
      return newTask;
    }
    const { data, error } = await supabase!.from('tasks').insert([task]).select().single();
    if (error) throw error;
    return data;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    this.clearCache('tasks');
    if (this.isMock) {
      const tasks = await this.getTasks();
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Task not found');
      const updated = {
        ...tasks[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      tasks[index] = updated;
      localStorage.setItem('gdg_tasks', JSON.stringify(tasks));
      return updated;
    }
    const { data, error } = await supabase!.from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async saveTasksOrder(tasks: Task[]): Promise<void> {
    this.clearCache('tasks');
    if (this.isMock) {
      localStorage.setItem('gdg_tasks', JSON.stringify(tasks));
      return;
    }
    // For Supabase, bulk upsert the tasks with updated positions/status
    const { error } = await supabase!.from('tasks').upsert(
      tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assignee_id: t.assignee_id,
        due_date: t.due_date,
        tags: t.tags,
        position: t.position,
        updated_at: new Date().toISOString()
      }))
    );
    if (error) throw error;
  }

  async deleteTask(id: string): Promise<void> {
    this.clearCache('tasks');
    if (this.isMock) {
      const tasks = await this.getTasks();
      const filtered = tasks.filter(t => t.id !== id);
      localStorage.setItem('gdg_tasks', JSON.stringify(filtered));
      return;
    }
    const { error } = await supabase!.from('tasks').delete().eq('id', id);
    if (error) throw error;
  }

  // GALLERY
  async getGallery(): Promise<GalleryItem[]> {
    const cacheKey = 'gallery';
    const cached = this.getCached<GalleryItem[]>(cacheKey);
    if (cached) return cached;

    let result: GalleryItem[];
    if (this.isMock) {
      if (typeof window === 'undefined') return initialGallery;
      result = JSON.parse(localStorage.getItem('gdg_gallery') || '[]');
    } else {
      try {
        const { data, error } = await supabase!.from('gallery').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        result = data || [];
      } catch (err) {
        console.warn("Supabase getGallery query failed, falling back to LocalStorage:", err);
        if (typeof window === 'undefined') return initialGallery;
        result = JSON.parse(localStorage.getItem('gdg_gallery') || JSON.stringify(initialGallery));
      }
    }
    this.setCache(cacheKey, result);
    return result;
  }

  async uploadToGallery(item: Omit<GalleryItem, 'id' | 'created_at'>): Promise<GalleryItem> {
    this.clearCache('gallery');
    if (this.isMock) {
      const gallery = await this.getGallery();
      const newItem: GalleryItem = {
        ...item,
        id: 'gal-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      gallery.unshift(newItem);
      localStorage.setItem('gdg_gallery', JSON.stringify(gallery));
      return newItem;
    }
    const { data, error } = await supabase!.from('gallery').insert([item]).select().single();
    if (error) throw error;
    return data;
  }

  // ACHIEVEMENTS
  async getAchievements(): Promise<Achievement[]> {
    const cacheKey = 'achievements';
    const cached = this.getCached<Achievement[]>(cacheKey);
    if (cached) return cached;

    let result: Achievement[];
    if (this.isMock) {
      if (typeof window === 'undefined') return initialAchievements;
      result = JSON.parse(localStorage.getItem('gdg_achievements') || '[]');
    } else {
      try {
        const { data, error } = await supabase!.from('achievements').select('*').order('year', { ascending: false });
        if (error) throw error;
        result = data || [];
      } catch (err) {
        console.warn("Supabase getAchievements query failed, falling back to LocalStorage:", err);
        if (typeof window === 'undefined') return initialAchievements;
        result = JSON.parse(localStorage.getItem('gdg_achievements') || JSON.stringify(initialAchievements));
      }
    }
    this.setCache(cacheKey, result);
    return result;
  }

  async createAchievement(achievement: Omit<Achievement, 'id' | 'created_at'>): Promise<Achievement> {
    this.clearCache('achievements');
    if (this.isMock) {
      const achievements = await this.getAchievements();
      const newAchievement: Achievement = {
        ...achievement,
        id: 'ach-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      achievements.push(newAchievement);
      localStorage.setItem('gdg_achievements', JSON.stringify(achievements));
      return newAchievement;
    }
    const { data, error } = await supabase!.from('achievements').insert([achievement]).select().single();
    if (error) throw error;
    return data;
  }

  // TEAM
  async getTeam() {
    const cacheKey = 'team';
    const cached = this.getCached<any[]>(cacheKey);
    if (cached) return cached;

    let result: any[];
    if (this.isMock) {
      result = initialTeam;
    } else {
      // We can query users with 'member' or 'admin' role for team
      const { data, error } = await supabase!.from('users')
        .select('*')
        .in('role', ['member', 'admin'])
        .order('name');
      if (error) throw error;
      result = data || [];
    }
    this.setCache(cacheKey, result);
    return result;
  }

  // PEOPLE (GDG MEMBERS)
  async getPeople(): Promise<Person[]> {
    const cacheKey = 'people';
    const cached = this.getCached<Person[]>(cacheKey);
    if (cached) return cached;

    let list: Person[] = [];
    if (this.isMock) {
      if (typeof window === 'undefined') return initialPeople;
      const stored = localStorage.getItem('gdg_people');
      if (!stored) {
        list = [...initialPeople];
        localStorage.setItem('gdg_people', JSON.stringify(list));
      } else {
        list = JSON.parse(stored);
      }
    } else {
      try {
        const { data, error } = await supabase!.from('people').select('*').order('name');
        if (error) throw error;
        list = data || [];
      } catch (err) {
        console.warn("Supabase 'people' query failed, falling back to LocalStorage:", err);
        if (typeof window === 'undefined') return initialPeople;
        list = JSON.parse(localStorage.getItem('gdg_people') || JSON.stringify(initialPeople));
      }
    }

    // Programmatic migration / default value initializer for display_order and team lead roles
    let migrated = false;
    
    // Group people by batch & role to calculate default orders
    const batchRoleMap: Record<string, Record<string, Person[]>> = {};
    list.forEach(p => {
      if (p.display_order === undefined) {
        p.display_order = 999; // Default large order to be filled
        migrated = true;
      }
      if (!batchRoleMap[p.batch]) batchRoleMap[p.batch] = {};
      if (!batchRoleMap[p.batch][p.role]) batchRoleMap[p.batch][p.role] = [];
      batchRoleMap[p.batch][p.role].push(p);
    });

    // For any member still having 999, assign sequential index
    Object.keys(batchRoleMap).forEach(b => {
      Object.keys(batchRoleMap[b]).forEach(r => {
        const sorted = [...batchRoleMap[b][r]].sort((x, y) => {
          if (x.display_order !== 999 && y.display_order !== 999) return x.display_order! - y.display_order!;
          return x.name.localeCompare(y.name);
        });
        sorted.forEach((p, idx) => {
          if (p.display_order === 999) {
            p.display_order = idx + 1;
            migrated = true;
          }
        });
      });
    });

    // Sync initial mock team leads if not set
    const leadNames = ["Abhishek M", "Kavya B", "Manoj K", "Pooja R", "Rahul G", "Sneha V", "Vikas P", "Hari Prasad"];
    list.forEach(p => {
      if (p.batch === '2026–27' && leadNames.includes(p.name) && p.is_team_lead === undefined) {
        p.is_team_lead = true;
        migrated = true;
      }
    });

    if (migrated && typeof window !== 'undefined' && this.isMock) {
      localStorage.setItem('gdg_people', JSON.stringify(list));
    }

    this.setCache(cacheKey, list);
    return list;
  }

  async getPersonById(id: string): Promise<Person | null> {
    const people = await this.getPeople();
    return people.find(p => p.id === id) || null;
  }

  async getNextPersonId(batch: string): Promise<string> {
    const people = await this.getPeople();
    const batchPeople = people.filter(p => p.batch === batch);
    
    let maxNum = 0;
    batchPeople.forEach(p => {
      const match = p.id.match(/^p(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    
    return `p${maxNum + 1}`;
  }

  async getRoleOrder(batch: string): Promise<string[]> {
    const rolesList = await this.getRoles(batch);
    return rolesList.map(r => r.name);
  }

  async saveRoleOrder(batch: string, order: string[]): Promise<void> {
    const rolesList = await this.getRoles(batch);
    const updated = order.map((name, idx) => {
      const existing = rolesList.find(r => r.name === name);
      return {
        id: existing?.id || `${batch.replace(/–/g, '-')}-${name.replace(/\s+/g, '-').toLowerCase()}`,
        batch,
        name,
        display_order: idx
      };
    });
    await this.saveRoles(batch, updated);
  }

  async createPerson(person: Omit<Person, 'created_at'>): Promise<Person> {
    this.clearCache('people');
    if (this.isMock) {
      const people = await this.getPeople();
      
      // Calculate next display_order inside their role section if not provided
      let displayOrder = person.display_order;
      if (displayOrder === undefined) {
        const roleMembers = people.filter(p => p.batch === person.batch && p.role === person.role);
        displayOrder = roleMembers.length + 1;
      }

      const newPerson: Person = {
        ...person,
        display_order: displayOrder,
        created_at: new Date().toISOString()
      };
      people.push(newPerson);
      localStorage.setItem('gdg_people', JSON.stringify(people));
      return newPerson;
    }
    try {
      const { data, error } = await supabase!.from('people').insert([person]).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Supabase createPerson failed, writing to LocalStorage:", err);
      const people = await this.getPeople();
      let displayOrder = person.display_order;
      if (displayOrder === undefined) {
        const roleMembers = people.filter(p => p.batch === person.batch && p.role === person.role);
        displayOrder = roleMembers.length + 1;
      }
      const newPerson: Person = {
        ...person,
        display_order: displayOrder,
        created_at: new Date().toISOString()
      };
      people.push(newPerson);
      localStorage.setItem('gdg_people', JSON.stringify(people));
      return newPerson;
    }
  }

  async updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
    this.clearCache('people');
    if (this.isMock) {
      const people = await this.getPeople();
      const index = people.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Person not found');
      const updated = { ...people[index], ...updates };
      people[index] = updated;
      localStorage.setItem('gdg_people', JSON.stringify(people));
      return updated;
    }
    try {
      const { data, error } = await supabase!.from('people').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Supabase updatePerson failed, updating LocalStorage:", err);
      const people = await this.getPeople();
      const index = people.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Person not found');
      const updated = { ...people[index], ...updates };
      people[index] = updated;
      localStorage.setItem('gdg_people', JSON.stringify(people));
      return updated;
    }
  }

  async getRoles(batch: string): Promise<Role[]> {
    const cacheKey = `roles_${batch}`;
    const cached = this.getCached<Role[]>(cacheKey);
    if (cached) return cached;

    let result: Role[];
    if (this.isMock) {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(`gdg_roles_${batch}`);
      result = stored ? JSON.parse(stored) : [];
    } else {
      try {
        const { data, error } = await supabase!.from('roles').select('*').eq('batch', batch).order('display_order');
        if (error) throw error;
        result = data || [];
      } catch (err) {
        console.warn('[getRoles] Supabase failed, fallback to localStorage:', err);
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(`gdg_roles_${batch}`);
        result = stored ? JSON.parse(stored) : [];
      }
    }
    this.setCache(cacheKey, result);
    return result;
  }

  async saveRoles(batch: string, roles: Role[]): Promise<void> {
    this.clearCache(`roles_${batch}`);
    if (this.isMock) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`gdg_roles_${batch}`, JSON.stringify(roles));
      }
      return;
    }
    try {
      const { error: delErr } = await supabase!.from('roles').delete().eq('batch', batch);
      if (delErr) console.error('[saveRoles] delete error:', delErr);
      // Strip created_at so the DB default applies
      const payload = roles.map(({ created_at: _c, ...r }) => r);
      const { error } = await supabase!.from('roles').insert(payload);
      if (error) throw error;
      console.log('[saveRoles] wrote', payload.length, 'roles for batch', batch);
    } catch (err) {
      console.error('[saveRoles] Supabase failed, falling back to LocalStorage:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`gdg_roles_${batch}`, JSON.stringify(roles));
      }
    }
  }

  async deletePerson(id: string): Promise<void> {
    this.clearCache('people');
    console.log("DatabaseService: deleting person with ID:", id);
    if (this.isMock) {
      const people = await this.getPeople();
      console.log("Mock Mode: total people before filter =", people.length);
      const filtered = people.filter(p => p.id !== id);
      console.log("Mock Mode: total people after filter =", filtered.length);
      localStorage.setItem('gdg_people', JSON.stringify(filtered));
      return;
    }
    try {
      console.log("Supabase Mode: deleting person ID =", id);
      const { error } = await supabase!.from('people').delete().eq('id', id);
      if (error) throw error;
      console.log("Supabase Mode: delete succeeded");
    } catch (err) {
      console.error("Supabase deletePerson failed:", err);
      const people = await this.getPeople();
      const filtered = people.filter(p => p.id !== id);
      localStorage.setItem('gdg_people', JSON.stringify(filtered));
      throw err;
    }
  }

  async getBadges(batch: string): Promise<Badge[]> {
    const cacheKey = `badges_${batch}`;
    const cached = this.getCached<Badge[]>(cacheKey);
    if (cached) return cached;

    let result: Badge[];
    if (this.isMock) {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(`gdg_badges_${batch}`);
      result = stored ? JSON.parse(stored) : [];
    } else {
      try {
        const { data, error } = await supabase!.from('badges').select('*').eq('batch', batch).order('display_order');
        if (error) throw error;
        result = data || [];
      } catch (err) {
        console.warn("Supabase getBadges failed, fallback to local:", err);
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(`gdg_badges_${batch}`);
        result = stored ? JSON.parse(stored) : [];
      }
    }
    this.setCache(cacheKey, result);
    return result;
  }

  async saveBadges(batch: string, badges: Badge[]): Promise<void> {
    this.clearCache(`badges_${batch}`);
    if (this.isMock) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`gdg_badges_${batch}`, JSON.stringify(badges));
      }
      return;
    }
    try {
      const { error: delErr } = await supabase!.from('badges').delete().eq('batch', batch);
      if (delErr) console.error('[saveBadges] delete error:', delErr);
      if (badges.length > 0) {
        // Strip created_at so the DB default applies
        const payload = badges.map(({ created_at: _c, ...b }) => b);
        const { error } = await supabase!.from('badges').insert(payload);
        if (error) throw error;
        console.log('[saveBadges] wrote', payload.length, 'badges for batch', batch);
      }
    } catch (err) {
      console.error('[saveBadges] Supabase failed, falling back to LocalStorage:', err);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`gdg_badges_${batch}`, JSON.stringify(badges));
      }
    }
  }

  // ─── Batch CRUD ───────────────────────────────────────────────────────────

  async getBatches(): Promise<Batch[]> {
    const cacheKey = 'batches';
    const cached = this.getCached<Batch[]>(cacheKey);
    if (cached) return cached;

    let result: Batch[];
    if (this.isMock) {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem('gdg_custom_batches');
      if (!stored) return [];
      const names: string[] = JSON.parse(stored);
      result = names.map(name => ({ id: name, name }));
    } else {
      try {
        const { data, error } = await supabase!.from('batches').select('*').order('name');
        if (error) throw error;
        result = data || [];
      } catch (err) {
        console.warn('[getBatches] Supabase failed, fallback to localStorage:', err);
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem('gdg_custom_batches');
        if (!stored) return [];
        const names: string[] = JSON.parse(stored);
        result = names.map(name => ({ id: name, name }));
      }
    }
    this.setCache(cacheKey, result);
    return result;
  }

  async saveBatches(batches: Batch[]): Promise<void> {
    this.clearCache('batches');
    // Always keep localStorage in sync for offline/fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('gdg_custom_batches', JSON.stringify(batches.map(b => b.name)));
    }
    if (this.isMock) return;
    try {
      await supabase!.from('batches').delete().neq('id', '__never__'); // clear all
      if (batches.length > 0) {
        const payload = batches.map(({ created_at: _c, ...b }) => b);
        const { error } = await supabase!.from('batches').insert(payload);
        if (error) throw error;
        console.log('[saveBatches] wrote', payload.length, 'batches to Supabase');
      }
    } catch (err) {
      console.error('[saveBatches] Supabase failed, data saved in localStorage only:', err);
    }
  }
}


export const db = new DatabaseService();
export const mockTeam = initialTeam;
