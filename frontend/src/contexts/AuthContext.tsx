"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { getUserStats } from "@/services/AuthService";
import { usePostHog } from 'posthog-js/react';


type AuthContextType = {
  user: User | null;
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
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const posthog = usePostHog();

  // Track user identification in PostHog
  useEffect(() => {
    if (user && posthog) {
      console.log('👤 Identifying user in PostHog:', user.id);
      
      // Identify user with their unique ID
      posthog.identify(user.id, {
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        // Add any custom user properties from user_metadata
        ...(user.user_metadata && {
          first_name: user.user_metadata.firstName,
          last_name: user.user_metadata.lastName,
        })
      });

      // Set user properties
      posthog.people.set({
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        ...(user.user_metadata && {
          first_name: user.user_metadata.firstName,
          last_name: user.user_metadata.lastName,
        })
      });
    } else if (!user && posthog) {
      console.log('👤 User logged out, resetting PostHog');
      // Reset PostHog when user logs out
      posthog.reset();
    }
  }, [user, posthog]);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithOtp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signinWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
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

