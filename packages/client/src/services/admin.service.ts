import axios from 'axios';

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  adminRole: 'super_admin' | 'security_admin' | 'verification_admin' | 'support_admin';
  status: 'active' | 'suspended';
}

export interface SecurityOverviewData {
  metrics: {
    totalUsers: number;
    candidateCount: number;
    recruiterCount: number;
    organizerCount: number;
    pendingVerifications: number;
    suspendedUsers: number;
    securityAlerts: number;
  };
  recentAuditLogs: any[];
}

const adminApi = axios.create({
  baseURL: '/api/admin',
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('skillverify_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminService = {
  async login(email: string, password: string): Promise<{ token: string; admin: AdminProfile }> {
    const { data } = await adminApi.post('/auth/login', { email, password });
    return data;
  },

  async getMe(): Promise<{ admin: AdminProfile }> {
    const { data } = await adminApi.get('/auth/me');
    return data;
  },

  async getSecurityOverview(): Promise<SecurityOverviewData> {
    const { data } = await adminApi.get('/security/overview');
    return data;
  },

  async getUsers(params?: { role?: string; status?: string; search?: string; limit?: number; offset?: number }): Promise<{ users: any[] }> {
    const { data } = await adminApi.get('/security/users', { params });
    return data;
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended', reason: string): Promise<{ message: string }> {
    const { data } = await adminApi.post(`/security/users/${id}/status`, { status, reason });
    return data;
  },

  async getVerificationQueue(): Promise<{ skillReviews: any[]; orgReviews: any[] }> {
    const { data } = await adminApi.get('/security/verification-queue');
    return data;
  },

  async recordVerificationDecision(payload: {
    type: 'candidate_skill' | 'organization';
    targetId: string;
    decision: 'VERIFIED' | 'REJECTED' | 'REVOKED';
    reason?: string;
  }): Promise<{ message: string }> {
    const { data } = await adminApi.post('/security/verify', payload);
    return data;
  },

  async getAuditLogs(params?: { action?: string; entityType?: string; limit?: number; offset?: number }): Promise<{ logs: any[] }> {
    const { data } = await adminApi.get('/security/audit-logs', { params });
    return data;
  },
};
