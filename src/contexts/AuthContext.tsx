'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { UserProfile } from '@/types/user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, pass: string) => Promise<{ 
    error: Error | null; 
    session?: Session | null;
    user?: User | null;
  }>;
  signInWithGoogle: (redirectPath?: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, session: null, user: null }),
  signInWithGoogle: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.warn('Could not load profile from Supabase:', err);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Gagal masuk') };
    }
  };

  const signUp = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });

      if (error) return { error: new Error(error.message), session: null, user: null };

      // Optional: Initialize profile in table if user created & session exists
      if (data.user && data.session) {
        try {
          await supabase.from('profiles').insert([
            {
              id: data.user.id,
              age_range: 'dewasa_muda',
              tone_pref: 'santai',
              detail_pref: 'ringkas',
            },
          ]);
        } catch (e) {
          console.warn('Profile creation hook skipped:', e);
        }
      }

      return { error: null, session: data.session, user: data.user };
    } catch (err) {
      return { 
        error: err instanceof Error ? err : new Error('Gagal mendaftar'),
        session: null,
        user: null
      };
    }
  };

  const signInWithGoogle = async (redirectPath = '/dashboard') => {
    const safePath =
      redirectPath.startsWith('/') && !redirectPath.startsWith('//') ? redirectPath : '/dashboard';

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${safePath}`,
          queryParams: { prompt: 'select_account' },
        },
      });

      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Gagal memulai login dengan Google.'),
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });

      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Gagal mengirim tautan reset.'),
      };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) return { error: new Error(error.message) };

      // Cabut sesi di perangkat lain setelah kata sandi diganti.
      await supabase.auth.signOut({ scope: 'others' });

      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Gagal memperbarui kata sandi.'),
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        resetPassword,
        updatePassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook dipakai lintas komponen; aturan fast-refresh tidak relevan untuk context file ini.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
