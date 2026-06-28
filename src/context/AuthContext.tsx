'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, User } from '@/lib/db';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role?: 'viewer' | 'member' | 'admin', email?: string) => Promise<void>;
  loginWithGoogleToken: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateRole: (role: 'viewer' | 'member' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadSession() {
      try {
        const sessionUser = await db.getSessionUser();
        setUser(sessionUser);
      } catch (err) {
        console.error('Failed to load auth session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  // Watch protected routes client-side for routing safety
  useEffect(() => {
    if (loading) return;

    const isDashboard = pathname === '/dashboard';
    const isAdminRoute = pathname.startsWith('/admin');

    if (!user) {
      if (isDashboard || isAdminRoute) {
        router.push('/auth/signin');
      }
    } else {
      if (isAdminRoute && user.role !== 'member' && user.role !== 'admin') {
        router.push('/auth/signin?error=AccessDenied');
      }
    }
  }, [user, pathname, loading, router]);

  const loginWithGoogleToken = async (idToken: string) => {
    setLoading(true);
    const decoded = parseJwt(idToken);
    if (!decoded) {
      setLoading(false);
      throw new Error("Invalid Google credential token");
    }

    const email = decoded.email;
    const name = decoded.name;
    const avatar = decoded.picture;

    // Auto upgrade admin for user's requested email or any @cit.edu.in
    let role: 'viewer' | 'member' | 'admin' = 'viewer';
    if (email.endsWith('@cit.edu.in') || email === 'rajkishorerk082004@gmail.com') {
      role = 'admin';
    }

    const realUser: User = {
      id: 'google-user-' + decoded.sub,
      email: email,
      name: name,
      role: role,
      google_avatar_url: avatar
    };

    // Sync to Supabase if config is live
    try {
      const { supabase } = await import('@/lib/db');
      if (supabase) {
        await supabase.from('users').upsert({
          id: realUser.id,
          email: realUser.email,
          name: realUser.name,
          role: realUser.role,
          google_avatar_url: realUser.google_avatar_url
        });
      }
    } catch (dbErr) {
      console.error("Supabase user sync error:", dbErr);
    }

    await db.setSessionUser(realUser);
    setUser(realUser);
    setLoading(false);

    if (role === 'admin' || role === 'member') {
      router.push('/admin/kanban');
    } else {
      router.push('/dashboard');
    }
  };

  const login = async (role: 'viewer' | 'member' | 'admin' = 'viewer', email?: string) => {
    setLoading(true);
    // Simulate successful Google OAuth sync
    const defaultEmail = email || (role === 'admin' ? 'lead@cit.edu.in' : role === 'member' ? 'member@cit.edu.in' : 'student@gmail.com');
    const mockUser: User = {
      id: role + '-user-' + Math.random().toString(36).substr(2, 5),
      email: defaultEmail,
      name: role === 'admin' ? 'Abhishek CIT (Lead)' : role === 'member' ? 'Karthik S (Board)' : 'Ganesh Kumar',
      role: role,
      google_avatar_url: role === 'admin' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        : role === 'member'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'
    };

    await db.setSessionUser(mockUser);
    setUser(mockUser);
    setLoading(false);
    
    // Redirect appropriately
    if (role === 'admin' || role === 'member') {
      router.push('/admin/kanban');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = async () => {
    setLoading(true);
    await db.logoutSession();
    setUser(null);
    setLoading(false);
    router.push('/home');
  };

  const updateRole = async (role: 'viewer' | 'member' | 'admin') => {
    if (!user) return;
    const updated = { ...user, role };
    await db.setSessionUser(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogleToken, logout, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
