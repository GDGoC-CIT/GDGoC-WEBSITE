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

// Supabase Init
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Database Service Manager (supports local storage syncing for mock dev workflows)
class DatabaseService {
  private isMock: boolean;

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
    if (!localStorage.getItem('gdg_events')) localStorage.setItem('gdg_events', JSON.stringify(initialEvents));
    if (!localStorage.getItem('gdg_team')) localStorage.setItem('gdg_team', JSON.stringify(initialTeam));
    if (!localStorage.getItem('gdg_gallery')) localStorage.setItem('gdg_gallery', JSON.stringify(initialGallery));
    if (!localStorage.getItem('gdg_achievements')) localStorage.setItem('gdg_achievements', JSON.stringify(initialAchievements));
    if (!localStorage.getItem('gdg_tasks')) localStorage.setItem('gdg_tasks', JSON.stringify(initialTasks));
    if (!localStorage.getItem('gdg_rsvps')) localStorage.setItem('gdg_rsvps', JSON.stringify(initialRSVPs));
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
  }

  async setSessionUser(user: User) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('gdg_session', JSON.stringify(user));
  }

  // EVENTS
  async getEvents(): Promise<Event[]> {
    if (this.isMock) {
      if (typeof window === 'undefined') return initialEvents;
      return JSON.parse(localStorage.getItem('gdg_events') || '[]');
    }
    const { data, error } = await supabase!.from('events').select('*').order('date', { ascending: true });
    if (error) throw error;
    return data || [];
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
    if (this.isMock) {
      if (typeof window === 'undefined') return initialRSVPs;
      return JSON.parse(localStorage.getItem('gdg_rsvps') || '[]');
    }
    const { data, error } = await supabase!.from('rsvps').select('*');
    if (error) throw error;
    return data || [];
  }

  async getRSVPsForEvent(eventId: string): Promise<RSVP[]> {
    if (this.isMock) {
      const rsvps = await this.getRSVPs();
      return rsvps.filter(r => r.event_id === eventId);
    }
    const { data, error } = await supabase!.from('rsvps').select('*').eq('event_id', eventId);
    if (error) throw error;
    return data || [];
  }

  async getRSVPsForUser(userId: string): Promise<RSVP[]> {
    if (this.isMock) {
      const rsvps = await this.getRSVPs();
      return rsvps.filter(r => r.user_id === userId);
    }
    const { data, error } = await supabase!.from('rsvps').select('*').eq('user_id', userId);
    if (error) throw error;
    return data || [];
  }

  async toggleRSVP(userId: string, eventId: string): Promise<{ rsvp?: RSVP; deleted: boolean }> {
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
    if (this.isMock) {
      if (typeof window === 'undefined') return initialTasks;
      return JSON.parse(localStorage.getItem('gdg_tasks') || '[]');
    }
    const { data, error } = await supabase!.from('tasks').select('*').order('position', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
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
    if (this.isMock) {
      if (typeof window === 'undefined') return initialGallery;
      return JSON.parse(localStorage.getItem('gdg_gallery') || '[]');
    }
    const { data, error } = await supabase!.from('gallery').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async uploadToGallery(item: Omit<GalleryItem, 'id' | 'created_at'>): Promise<GalleryItem> {
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
    if (this.isMock) {
      if (typeof window === 'undefined') return initialAchievements;
      return JSON.parse(localStorage.getItem('gdg_achievements') || '[]');
    }
    const { data, error } = await supabase!.from('achievements').select('*').order('year', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createAchievement(achievement: Omit<Achievement, 'id' | 'created_at'>): Promise<Achievement> {
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
    if (this.isMock) {
      return initialTeam;
    }
    // We can query users with 'member' or 'admin' role for team
    const { data, error } = await supabase!.from('users')
      .select('*')
      .in('role', ['member', 'admin'])
      .order('name');
    if (error) throw error;
    return data || [];
  }
}

export const db = new DatabaseService();
export const mockTeam = initialTeam;
