import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminService, AdminProfile } from '../services/admin.service';
import toast from 'react-hot-toast';

interface AdminAuthCtx {
  admin: AdminProfile | null;
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<AdminProfile>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreAdminSession = useCallback(async () => {
    const token = sessionStorage.getItem('skillverify_admin_token');
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      const res = await adminService.getMe();
      setAdmin(res.admin);
    } catch {
      sessionStorage.removeItem('skillverify_admin_token');
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreAdminSession();
  }, [restoreAdminSession]);

  const adminLogin = async (email: string, password: string): Promise<AdminProfile> => {
    try {
      const res = await adminService.login(email, password);
      sessionStorage.setItem('skillverify_admin_token', res.token);
      setAdmin(res.admin);
      toast.success(`Security session authorized (${res.admin.adminRole})`);
      return res.admin;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid admin credentials or account revoked.';
      toast.error(msg);
      throw err;
    }
  };

  const adminLogout = () => {
    sessionStorage.removeItem('skillverify_admin_token');
    setAdmin(null);
    toast.success('Admin Security session terminated.');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return ctx;
}
