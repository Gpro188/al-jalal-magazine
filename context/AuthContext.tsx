'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onIdTokenChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseConfig';
import { signIn, signOut, signUp } from '@/lib/auth';

export type UserRole = 'contributor' | 'editor' | 'admin';

interface UserData {
  email: string;
  role: UserRole;
  displayName: string;
  classUnion?: string; // Class Union assigned to user
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  isContributor: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data() as UserData);
        } else {
          // Create user document if it doesn't exist
          // This should typically be done via Cloud Function or admin action
          console.log('User document not found');
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  };

  // Redirect user to appropriate dashboard based on role
  useEffect(() => {
    if (user && userData) {
      if (userData.role === 'admin') {
        // Admin stays on current page or goes to admin dashboard
      } else if (userData.role === 'editor') {
        // Editor could be redirected to editor dashboard
        // router.push('/dashboard/editor');
      } else if (userData.role === 'contributor') {
        // Contributor could be redirected to contributor dashboard
        // router.push('/dashboard/contributor');
      }
    }
  }, [user, userData]);

  const handleSignUp = async (email: string, password: string) => {
    const result = await signUp(email, password);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const isAdmin = () => userData?.role === 'admin';
  const isEditor = () => userData?.role === 'editor' || userData?.role === 'admin';
  const isContributor = () => userData?.role === 'contributor';

  const value = {
    user,
    userData,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    isAdmin,
    isEditor,
    isContributor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
