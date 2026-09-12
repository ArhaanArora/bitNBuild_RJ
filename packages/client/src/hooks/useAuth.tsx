import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  role: 'candidate' | 'organizer' | 'recruiter' | 'admin';
  firstName?: string;
  lastName?: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'candidate' | 'organizer' | 'recruiter') => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'candidate' | 'organizer' | 'recruiter';
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const performAutoLogin = async (email = 'alex@demo.local') => {
    try {
      const { data } = await api.post('/auth/login', { email, password: 'Demo1234!' });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      setUser(data.user);
      return data.user;
    } catch {
      const fallbackUser: User = {
        id: '599deb10-f111-4718-ae3a-6276febbc02a',
        email,
        role: email.includes('recruiter') ? 'recruiter' : email.includes('organizer') ? 'organizer' : 'candidate',
        firstName: email.includes('recruiter') ? 'Maya' : email.includes('organizer') ? 'Raj' : 'Alex',
        lastName: email.includes('recruiter') ? 'Recruiter' : email.includes('organizer') ? 'Organizer' : 'Chen',
      };
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  const restore = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      await performAutoLogin();
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser({ ...data, firstName: data.profile?.firstName, lastName: data.profile?.lastName });
    } catch {
      await performAutoLogin();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { restore(); }, [restore]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data.user);
  };

  const register = async (form: RegisterData) => {
    const { data } = await api.post('/auth/register', form);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data.user);
  };

  const switchRole = async (role: 'candidate' | 'organizer' | 'recruiter') => {
    const emails = {
      candidate: 'alex@demo.local',
      recruiter: 'recruiter@acme.com',
      organizer: 'organizer@demo.local',
    };
    await performAutoLogin(emails[role]);
  };

  const logout = () => {
    switchRole('candidate');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
