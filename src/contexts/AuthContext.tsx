  'use client';

  import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
  import { 
    User, 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut as firebaseSignOut 
  } from 'firebase/auth';
  import { initFirebase, getFirebaseAuth, getFirebaseProvider } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';

  interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
  }

  const AuthContext = createContext<AuthContextType | undefined>(undefined);

  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const auth = getFirebaseAuth();
      if (!auth) {
        console.warn('Firebase not configured. Sign-in will not work.');
        setIsLoading(false);
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("🔥 Auth State:", user);
        setUser(user);
        setIsLoading(false);
      });

      return () => unsubscribe();
    }, []);

    const signIn = async () => {
      const auth = getFirebaseAuth();
      const provider = getFirebaseProvider();
      const db = getFirebaseDb();
      
      if (!auth || !provider || !db) {
        throw new Error('Firebase not configured.');
      }
    
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
    
        // --- FIRESTORE MEIN USER DATA SAVE KAREIN ---
        const userRef = doc(db, 'users', user.uid);
        
        // 'setDoc' with { merge: true } ka faida ye hai ke 
        // agar user pehle se exists karta hai toh purana data delete nahi hoga, 
        // sirf update hoga.
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: serverTimestamp(),
        }, { merge: true });
    
        console.log("✅ User profile synced with Firestore");
      } catch (error) {
        console.error('Error signing in:', error);
        throw error;
      }
    };

    const signOut = async () => {
      const auth = getFirebaseAuth();
      if (!auth) return;

      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    };

    return (
      <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
        {children}
      </AuthContext.Provider>
    );
  }

  export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
  }
