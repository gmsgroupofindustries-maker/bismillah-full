import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGooglePopup, logOutFirebase, handleFirestoreError, OperationType } from '../lib/firebase.ts';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  role: 'customer' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'gmsgroupofindustries@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);

          const isUserAdmin = user.email === ADMIN_EMAIL;
          const userRole: 'customer' | 'admin' = isUserAdmin ? 'admin' : 'customer';

          if (!docSnap.exists()) {
            const newProfile: UserProfile = {
              userId: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Motorcycle Enthusiast',
              photoURL: user.photoURL || '',
              role: userRole,
            };

            await setDoc(userDocRef, {
              ...newProfile,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              serverCreatedAt: serverTimestamp(),
            });

            setUserProfile(newProfile);
          } else {
            setUserProfile(docSnap.data() as UserProfile);
          }
        } catch (err) {
          console.error('Error fetching/creating user profile:', err);
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithGooglePopup();
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await logOutFirebase();
      setUserProfile(null);
    } catch (error) {
      console.error('Sign-Out Error:', error);
      throw error;
    }
  };

  const isAdmin = currentUser?.email === ADMIN_EMAIL || userProfile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
