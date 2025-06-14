"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { signIn, signUpWithOTP, verifyOTP } from "@/services/AuthService";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUpWithOtp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error: Error | null }>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  signinWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const user = localStorage.getItem('user');
    const session = localStorage.getItem('session');
    if (user) {
      setUser(JSON.parse(user));
    }
    if (session) {
      const savedSession = JSON.parse(session);
      setSession(savedSession);
    }

    setLoading(false);
  }, []);


  const signUpWithOtp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const { error } = await signUpWithOTP(email, password, firstName, lastName);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithOtp = async (email: string) => {
    try {
      const { error } = await signIn(email, 'otp');
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signinWithPassword = async (email: string, password: string) => {
    try {
      const { user, session, error } = await signIn(email, 'password', password);

      if (user && session) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('session', JSON.stringify(session));
        setUser(user);
        setSession(session);
      }

      return { user, session, error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    const { user, session, error } = await verifyOTP(email, token);
    if (user && session) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('session', JSON.stringify(session));
      setUser(user);
      setSession(session);
    }
    return { user, session, error };
  };

  const signInWithGoogle = async () => {
    try {
      const { error, response } = await signIn('', 'google');
      if (error) {
        return { error };
      }
      
      if (response?.url) {
        // Redirect to the Google OAuth URL
        window.location.href = response.url;
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signUpWithOtp,
    signInWithOtp,
    signinWithPassword,
    verifyOtp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
