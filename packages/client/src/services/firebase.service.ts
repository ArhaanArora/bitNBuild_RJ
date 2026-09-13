import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';

/**
 * Firebase Identity Architecture Layer (§1, §5, §6)
 *
 * Guiding principle: Firebase Authentication handles identity ("who are you");
 * the SkillVerify backend handles authorization ("what can you do") and role assignment.
 */

export interface FirebaseIdentityUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  idToken?: string;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Safe initialization
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
  }
} catch (err) {
  console.warn('[SkillVerify Firebase] Initialization warning:', err);
}

export { app, auth, googleProvider };

export const firebaseService = {
  /**
   * Check whether Firebase client credentials are configured
   */
  isConfigured(): boolean {
    return Boolean(auth && firebaseConfig.apiKey && firebaseConfig.projectId);
  },

  /**
   * Get currently active Firebase Auth user, if any
   */
  getCurrentUser(): FirebaseUser | null {
    return auth ? auth.currentUser : null;
  },

  /**
   * Google OAuth authentication flow with Firebase
   * Emits a verified Google Identity object to pass to backend /api/auth/google
   */
  async signInWithGoogle(): Promise<FirebaseIdentityUser> {
    if (!auth || !googleProvider) {
      console.warn('[SkillVerify Firebase] Auth not initialized with keys, using fallback mock.');
      return {
        uid: 'google_uid_' + Math.random().toString(36).substring(2, 11),
        email: 'alex.chen.dev@gmail.com',
        displayName: 'Alex Chen',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        emailVerified: true,
      };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        emailVerified: user.emailVerified,
        idToken,
      };
    } catch (err: any) {
      // If user closed popup intentionally or popup blocked in sandbox:
      console.error('[SkillVerify Firebase] Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Google sign-in popup was closed before completing.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        throw new Error('Google sign-in was cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked by browser. Please enable popups or try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        throw new Error(`Domain not authorized in Firebase Console (${window.location.hostname}). Add it to Firebase Authentication Authorized Domains.`);
      }
      throw err;
    }
  },

  /**
   * Sign in with Email and Password using Firebase Auth
   */
  async signInWithEmail(email: string, pass: string): Promise<FirebaseIdentityUser> {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized.');
    }
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const idToken = await result.user.getIdToken();
    return {
      uid: result.user.uid,
      email: result.user.email || '',
      displayName: result.user.displayName || undefined,
      photoURL: result.user.photoURL || undefined,
      emailVerified: result.user.emailVerified,
      idToken,
    };
  },

  /**
   * Register new user with Email and Password in Firebase Auth
   */
  async signUpWithEmail(email: string, pass: string): Promise<FirebaseIdentityUser> {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized.');
    }
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    try {
      await sendEmailVerification(result.user);
    } catch (e) {
      console.warn('[SkillVerify Firebase] Could not send verification email automatically:', e);
    }
    const idToken = await result.user.getIdToken();
    return {
      uid: result.user.uid,
      email: result.user.email || '',
      displayName: result.user.displayName || undefined,
      photoURL: result.user.photoURL || undefined,
      emailVerified: result.user.emailVerified,
      idToken,
    };
  },

  /**
   * Send Password Reset Email via Firebase Auth
   */
  async sendPasswordReset(email: string): Promise<void> {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized.');
    }
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Sign out of Firebase Auth
   */
  async signOut(): Promise<void> {
    if (auth) {
      await signOut(auth);
    }
  },

  /**
   * Listen to Firebase Auth state changes
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
  },
};
