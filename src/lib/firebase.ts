import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { doc, updateDoc, arrayUnion, setDoc, getDoc, limit } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

// --- Google Login Function ---
export async function loginWithGoogle() {
  const auth = getFirebaseAuth();
  const provider = getFirebaseProvider();
  
  if (!auth || !provider) return null;

  try {
    const result = await signInWithPopup(auth, provider);
    console.log("✅ User Logged In:", result.user.displayName);
    return result.user;
  } catch (error) {
    console.error("❌ Login Error:", error);
    return null;
  }
}

// --- Logout Function ---
export async function logoutUser() {
  const auth = getFirebaseAuth();
  if (!auth) return;
  try {
    await signOut(auth);
    console.log("👋 Logged Out");
  } catch (error) {
    console.error("Logout Error:", error);
  }
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;
let db: Firestore | undefined;

export function initFirebase() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  if (!firebaseConfig.apiKey) {
    console.warn('Firebase config not found. Google Sign-In will not work.');
    return null;
  }

  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
    // Auth/popup only in the browser; Firestore works in API routes (Node) too.
    if (typeof window !== 'undefined') {
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
    }
    db = getFirestore(app);
  }

  return { app, auth: auth!, googleProvider: googleProvider!, db: db! };
}

export function getFirebaseAuth() {
  if (!auth) {
    initFirebase();
  }
  return auth;
}

export function getFirebaseProvider() {
  if (!googleProvider) {
    initFirebase();
  }
  return googleProvider;
}

export function getFirebaseDb() {
  if (!db) {
    initFirebase();
  }
  return db;
}

export async function markPokemonAsOwned(userId: string, pokemonId: string) {
  const db = getFirebaseDb();
  if (!db) return;

  const userRef = doc(db, 'users', userId);

  try {
    // Check karein ke user document exist karta hai ya nahi
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      // Pehli baar document create karein
      await setDoc(userRef, { ownedPokemon: [pokemonId] });
    } else {
      // Existing document mein ID add karein (arrayUnion duplicate handle kar leta hai)
      await updateDoc(userRef, {
        ownedPokemon: arrayUnion(pokemonId)
      });
    }
    console.log(`✅ Pokemon ${pokemonId} added to Pokedex!`);
  } catch (error) {
    console.error("Error updating pokedex:", error);
  }
}

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);