import { api } from '../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'organizer' | 'admin';
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  profileCompleted: boolean;
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
  status: 'active' | 'suspended';
  lastLoginAt?: string;
  photoUrl?: string;
  workEmail?: string;
  jobTitle?: string;
  organizationName?: string;
  eventName?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'candidate' | 'recruiter' | 'organizer';
  authProvider?: 'email' | 'google';
  workEmail?: string;
  jobTitle?: string;
  organizationName?: string;
  eventName?: string;
  education?: string;
  skills?: string;
  location?: string;
}

export interface AuthResponse {
  message?: string;
  user: UserProfile;
  access: string;
  refresh: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },

  async googleAuth(payload: { email: string; name?: string; role?: string; photoUrl?: string; idToken?: string; password?: string }): Promise<any> {
    const { data } = await api.post('/auth/google', payload);
    return data;
  },

  async getMe(): Promise<UserProfile> {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string; demoToken?: string }> {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/verify-email', { token });
    return data;
  },

  async resendVerification(): Promise<{ message: string; demoToken?: string }> {
    const { data } = await api.post('/auth/resend-verification');
    return data;
  },

  async deleteAccount(confirmation: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/delete-account', { confirmation });
    return data;
  },

  async submitRoleRequest(toRole: string, reason: string): Promise<{ message: string; request: any }> {
    const { data } = await api.post('/auth/role-request', { toRole, reason });
    return data;
  },

  async getMyRoleRequests(): Promise<{ requests: any[] }> {
    const { data } = await api.get('/auth/role-request/my');
    return data;
  },
};
