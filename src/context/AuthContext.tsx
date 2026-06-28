'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, User } from '@/lib/db';
import { useRouter, usePathname } from 'next/navigation';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithGoogleToken: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateRole: (role: 'viewer' | 'member' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Determine role from email
function getRoleFromEmail(email: string): 'viewer' | 'member' | 'admin' {
  if (
    email.endsWith('@cit.edu.in') ||
    email === 'rajkishorerk082004@gmail.com' ||
    email === 'gdgoncampuscit@gmail.com'
  ) {
    return 'admin';
  }
  return 'viewer';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // On mount: restore session from localStorage AND listen to Firebase Auth state
  useEffect(() => {
    // First: restore cached session quickly (so UI doesn't flash)
    db.getSessionUser().then(cached => {
      if (cached) setUser(cached);
    });

    // Then: sync with Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const role = getRoleFromEmail(email);

        const appUser: User = {
          id: 'google-' + firebaseUser.uid,
          email,
          name: firebaseUser.displayName || email.split('@')[0],
          role,
          google_avatar_url: firebaseUser.photoURL || ''
        };

        // Sync to Supabase
        try {
          const { supabase } = await import('@/lib/db');
          if (supabase) {
            await supabase.from('users').upsert({
              id: appUser.id,
              email: appUser.email,
              name: appUser.name,
              role: appUser.role,
              google_avatar_url: appUser.google_avatar_url
            });
          }
        } catch (err) {
          console.error('Supabase user sync error:', err);
        }

        await db.setSessionUser(appUser);
        setUser(appUser);
      } else {
        // Firebase says no user — clear session
        const cached = await db.getSessionUser();
        if (!cached) setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Route protection
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

  // Real Google Sign-In via Firebase popup
  const login = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const email = firebaseUser.email || '';
      const role = getRoleFromEmail(email);

      const appUser: User = {
        id: 'google-' + firebaseUser.uid,
        email,
        name: firebaseUser.displayName || email.split('@')[0],
        role,
        google_avatar_url: firebaseUser.photoURL || ''
      };

      // Sync to Supabase
      try {
        const { supabase } = await import('@/lib/db');
        if (supabase) {
          await supabase.from('users').upsert({
            id: appUser.id,
            email: appUser.email,
            name: appUser.name,
            role: appUser.role,
            google_avatar_url: appUser.google_avatar_url
          });
        }
      } catch (err) {
        console.error('Supabase user sync error:', err);
      }

      await db.setSessionUser(appUser);
      setUser(appUser);
      setLoading(false);

      if (role === 'admin' || role === 'member') {
        router.push('/admin/kanban');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setLoading(false);
      // Don't throw for popup-closed-by-user
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        throw err;
      }
    }
  };

  // GSI token-based login (kept for the /auth/signin GSI button as fallback)
  const loginWithGoogleToken = async (idToken: string) => {
    setLoading(true);
    try {
      const base64 = idToken.split('.')[1];
      const decoded = JSON.parse(atob(base64));
      const email = decoded.email || '';
      const role = getRoleFromEmail(email);

      const appUser: User = {
        id: 'google-user-' + decoded.sub,
        email,
        name: decoded.name || email.split('@')[0],
        role,
        google_avatar_url: decoded.picture || ''
      };

      try {
        const { supabase } = await import('@/lib/db');
        if (supabase) {
          await supabase.from('users').upsert({
            id: appUser.id,
            email: appUser.email,
            name: appUser.name,
            role: appUser.role,
            google_avatar_url: appUser.google_avatar_url
          });
        }
      } catch (dbErr) {
        console.error('Supabase user sync error:', dbErr);
      }

      await db.setSessionUser(appUser);
      setUser(appUser);
      setLoading(false);

      if (role === 'admin' || role === 'member') {
        router.push('/admin/kanban');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Token login failed:', err);
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
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
