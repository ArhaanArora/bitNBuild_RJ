import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, UserProfile, RegisterPayload } from '../services/auth.service';
import { firebaseService } from '../services/firebase.service';
import toast from 'react-hot-toast';

interface AuthCtx {
  user: UserProfile | null;
  loading: boolean;
  roleConflict: { error: string; existingRole: string } | null;
  login: (email: string, password: string, rememberDevice?: boolean) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  googleSignIn: (role?: 'candidate' | 'recruiter' | 'organizer') => Promise<{ user?: UserProfile; isNewUser?: boolean; email?: string }>;
  logout: () => void;
  switchRole: (role: 'candidate' | 'organizer' | 'recruiter') => Promise<void>;
  refreshUser: () => Promise<void>;
  clearRoleConflict: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleConflict, setRoleConflict] = useState<{ error: string; existingRole: string } | null>(null);

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const me = await authService.getMe();
      setUser(me);
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email: string, password: string, rememberDevice = true): Promise<UserProfile> => {
    setRoleConflict(null);
    try {
      const res = await authService.login(email, password);
      const storage = rememberDevice ? localStorage : sessionStorage;
      storage.setItem('access_token', res.access);
      storage.setItem('refresh_token', res.refresh);
      setUser(res.user);
      toast.success(res.message || `Welcome back, ${res.user.firstName || 'User'}.`);
      return res.user;
    } catch (err: any) {
      const serverMsg = err.response?.data?.error || "We couldn't sign you in. Check your email and password and try again.";
      toast.error(serverMsg);
      throw err;
    }
  };

  const register = async (payload: RegisterPayload): Promise<UserProfile> => {
    setRoleConflict(null);
    try {
      const res = await authService.register(payload);
      localStorage.setItem('access_token', res.access);
      localStorage.setItem('refresh_token', res.refresh);
      setUser(res.user);
      toast.success(res.message || `Account created successfully.`);
      return res.user;
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.roleConflict) {
        setRoleConflict({
          error: err.response.data.error,
          existingRole: err.response.data.existingRole,
        });
        toast.error(err.response.data.error);
      } else {
        toast.error(err.response?.data?.error || 'Registration failed');
      }
      throw err;
    }
  };

  const googleSignIn = async (role?: 'candidate' | 'recruiter' | 'organizer') => {
    setRoleConflict(null);
    try {
      const googleUser = await firebaseService.signInWithGoogle();
      const res = await authService.googleAuth({
        email: googleUser.email,
        name: googleUser.displayName,
        photoUrl: googleUser.photoURL,
        role,
      });

      if (res.isNewUser) {
        return { isNewUser: true, email: res.email };
      }

      localStorage.setItem('access_token', res.access);
      localStorage.setItem('refresh_token', res.refresh);
      setUser(res.user);
      toast.success(res.message || `Welcome back, ${res.user.firstName || 'User'}.`);
      return { user: res.user };
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Google authentication failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setUser(null);
    setRoleConflict(null);
    toast.success('Signed out of workspace.');
  };

  const switchRole = async (role: 'candidate' | 'organizer' | 'recruiter') => {
    const demoAccounts = {
      candidate: { email: 'alex@demo.local', pass: 'Demo1234!' },
      recruiter: { email: 'recruiter@demo.local', pass: 'Demo1234!' },
      organizer: { email: 'organizer@demo.local', pass: 'Demo1234!' },
    };
    const target = demoAccounts[role];
    await login(target.email, target.pass);
  };

  const refreshUser = async () => {
    try {
      const me = await authService.getMe();
      setUser(me);
    } catch {
      // Ignore
    }
  };

  const clearRoleConflict = () => setRoleConflict(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        roleConflict,
        login,
        register,
        googleSignIn,
        logout,
        switchRole,
        refreshUser,
        clearRoleConflict,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
