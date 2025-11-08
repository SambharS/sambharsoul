'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  locationLat?: number;
  locationLng?: number;
  firebaseUid: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserLocation: (lat: number, lng: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    let verifier: RecaptchaVerifier | null = null;

    // Initialize reCAPTCHA
    if (typeof window !== 'undefined') {
      verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          // reCAPTCHA solved
        }
      });
      setRecaptchaVerifier(verifier);
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Sync user via API route (bypasses RLS using service role)
          const response = await fetch('/api/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              phone: firebaseUser.phoneNumber,
            }),
          });

          if (response.ok) {
            const { user: syncedUser } = await response.json();
            setUser(syncedUser);
          } else {
            console.error('Failed to sync user:', await response.text());
            setUser(null);
          }
        } catch (error) {
          console.error('Auth context error:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      if (verifier) {
        try {
          verifier.clear();
        } catch (error) {
          // Ignore errors during cleanup
          console.warn('Error clearing reCAPTCHA on unmount:', error);
        }
      }
    };
  }, []);

  const signInWithPhone = async (phoneNumber: string) => {
    // Recreate reCAPTCHA verifier if it doesn't exist or was cleared
    let verifier = recaptchaVerifier;

    if (!verifier || !verifier.verify) {
      if (typeof window !== 'undefined') {
        verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response: any) => {
            // reCAPTCHA solved
          }
        });
        setRecaptchaVerifier(verifier);
      } else {
        throw new Error('reCAPTCHA not available');
      }
    }

    try {
      // signInWithPhoneNumber returns a ConfirmationResult object, not a string
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(confirmation);
    } catch (error) {
      console.error('Error signing in with phone:', error);

      // Recreate reCAPTCHA for retry
      try {
        if (verifier) {
          verifier.clear();
        }
      } catch (clearError) {
        // Ignore clear errors - verifier might already be destroyed
        console.warn('Could not clear reCAPTCHA:', clearError);
      }

      // Create new verifier for next attempt
      if (typeof window !== 'undefined') {
        const newVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response: any) => {
            // reCAPTCHA solved
          }
        });
        setRecaptchaVerifier(newVerifier);
      }

      throw error;
    }
  };

  const verifyOTP = async (otp: string) => {
    if (!confirmationResult) {
      throw new Error('No confirmation result available. Please request OTP first.');
    }

    try {
      // Use the confirm method from ConfirmationResult
      await confirmationResult.confirm(otp);
      // User will be automatically signed in via onAuthStateChanged
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserLocation = async (lat: number, lng: number) => {
    if (!user) return;

    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          location_lat: lat,
          location_lng: lng
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating location in DB:', error);
        // Update local state even if DB update fails
        setUser({ ...user, locationLat: lat, locationLng: lng });
      } else {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user location:', error);
      // Update local state even if DB update fails
      setUser({ ...user, locationLat: lat, locationLng: lng });
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signInWithPhone,
    verifyOTP,
    signOut,
    updateUserLocation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div id="recaptcha-container" className="hidden" />
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