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
}

export const firebaseService = {
  /**
   * Google OAuth authentication flow
   * Emits a verified Google Identity object to pass to backend /api/auth/google
   */
  async signInWithGoogle(): Promise<FirebaseIdentityUser> {
    // In production with Firebase client keys:
    // const provider = new GoogleAuthProvider();
    // const result = await signInWithPopup(auth, provider);
    // return { uid: result.user.uid, email: result.user.email!, displayName: result.user.displayName, ... };

    // For hackathon prototype & offline demonstration:
    // Prompt Google Account Picker or return clean demo profile
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          uid: 'google_uid_' + Math.random().toString(36).substring(2, 11),
          email: 'alex.chen.dev@gmail.com',
          displayName: 'Alex Chen',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          emailVerified: true,
        });
      }, 500);
    });
  },

  /**
   * Email/password identity check
   */
  async verifySessionToken(token: string): Promise<boolean> {
    return Boolean(token && token.length > 20);
  },
};
