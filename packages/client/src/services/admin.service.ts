import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface ListParams {
  search?: string;
  status?: string;
  role?: string;
  limit?: number;
  offset?: number;
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

const adminApi = axios.create({
  baseURL: '/api/admin',
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('skillverify_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Admin Service ────────────────────────────────────────────────────────────

export const adminService = {

  // ── Auth ──────────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<{ token: string; admin: AdminProfile }> {
    const { data } = await adminApi.post('/auth/login', { email, password });
    return data;
  },

  async getMe(): Promise<{ admin: AdminProfile }> {
    const { data } = await adminApi.get('/auth/me');
    return data;
  },

  // ── Overview ──────────────────────────────────────────────────────────────

  async getOverview(): Promise<any> {
    const { data } = await adminApi.get('/overview');
    return data;
  },

  async getStats(): Promise<any> {
    const { data } = await adminApi.get('/stats');
    return data;
  },

  // ── Legacy security overview (backward compat) ────────────────────────────

  async getSecurityOverview(): Promise<SecurityOverviewData> {
    const { data } = await adminApi.get('/security/overview');
    return data;
  },

  // ── Candidates ────────────────────────────────────────────────────────────

  async getCandidates(params?: ListParams): Promise<{ candidates: any[] }> {
    const { data } = await adminApi.get('/candidates', { params });
    return data;
  },

  async getCandidateDetail(id: string): Promise<{ candidate: any }> {
    const { data } = await adminApi.get(`/candidates/${id}`);
    return data;
  },

  // ── Recruiters ────────────────────────────────────────────────────────────

  async getRecruiters(params?: ListParams): Promise<{ recruiters: any[] }> {
    const { data } = await adminApi.get('/recruiters', { params });
    return data;
  },

  // ── Organizers ────────────────────────────────────────────────────────────

  async getOrganizers(params?: ListParams): Promise<{ organizers: any[] }> {
    const { data } = await adminApi.get('/organizers', { params });
    return data;
  },

  // ── Organizations ─────────────────────────────────────────────────────────

  async getOrganizations(params?: ListParams): Promise<{ organizations: any[] }> {
    const { data } = await adminApi.get('/organizations', { params });
    return data;
  },

  async getOrganizationDetail(id: string): Promise<{ organization: any }> {
    const { data } = await adminApi.get(`/organizations/${id}`);
    return data;
  },

  async reviewOrganization(id: string, payload: {
    decision: 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
    reason: string;
    notes?: string;
  }): Promise<{ message: string }> {
    const { data } = await adminApi.post(`/organizations/${id}/review`, payload);
    return data;
  },

  // ── Users + RBAC ──────────────────────────────────────────────────────────

  async getUsers(params?: ListParams): Promise<{ users: any[] }> {
    const { data } = await adminApi.get('/security/users', { params });
    return data;
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended', reason: string): Promise<{ message: string }> {
    const { data } = await adminApi.post(`/security/users/${id}/status`, { status, reason });
    return data;
  },

  async forceLogoutUser(id: string): Promise<{ message: string }> {
    const { data } = await adminApi.post(`/users/${id}/force-logout`);
    return data;
  },

  async exportUserData(id: string): Promise<any> {
    const { data } = await adminApi.get(`/users/${id}/export`);
    return data;
  },

  async eraseUserData(id: string, reason: string): Promise<{ message: string }> {
    const { data } = await adminApi.delete(`/users/${id}/erase`, { data: { reason } });
    return data;
  },

  // ── Admin Users (RBAC) ────────────────────────────────────────────────────

  async getAdminUsers(): Promise<{ admins: any[] }> {
    const { data } = await adminApi.get('/users-rbac');
    return data;
  },

  async createAdminUser(payload: {
    email: string;
    name: string;
    adminRole: string;
    password: string;
  }): Promise<{ admin: any }> {
    const { data } = await adminApi.post('/users-rbac', payload);
    return data;
  },

  async updateAdminRole(id: string, adminRole: string): Promise<{ message: string }> {
    const { data } = await adminApi.patch(`/users-rbac/${id}/role`, { adminRole });
    return data;
  },

  async suspendAdminUser(id: string, reason: string): Promise<{ message: string }> {
    const { data } = await adminApi.post(`/users-rbac/${id}/suspend`, { reason });
    return data;
  },

  // ── Sessions ──────────────────────────────────────────────────────────────

  async getAdminSessions(): Promise<{ sessions: any[] }> {
    const { data } = await adminApi.get('/sessions');
    return data;
  },

  async revokeAdminSession(sessionId: string): Promise<{ message: string }> {
    const { data } = await adminApi.delete(`/sessions/${sessionId}`);
    return data;
  },

  // ── Verifications ─────────────────────────────────────────────────────────

  async getVerificationQueue(): Promise<{ skillReviews: any[]; orgReviews: any[] }> {
    const { data } = await adminApi.get('/security/verification-queue');
    return data;
  },

  async getVerifications(params?: ListParams): Promise<{ verifications: any[] }> {
    const { data } = await adminApi.get('/verifications', { params });
    return data;
  },

  async reviewVerification(id: string, payload: {
    action: 'APPROVE' | 'REJECT' | 'REVOKE';
    score?: number;
    notes?: string;
  }): Promise<{ message: string }> {
    const { data } = await adminApi.post(`/verifications/${id}/review`, payload);
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

  // ── Hackathons + Teams ────────────────────────────────────────────────────

  async getHackathons(params?: ListParams): Promise<{ hackathons: any[] }> {
    const { data } = await adminApi.get('/hackathons', { params });
    return data;
  },

  async getTeams(params?: ListParams): Promise<{ teams: any[] }> {
    const { data } = await adminApi.get('/teams', { params });
    return data;
  },

  // ── Skills ────────────────────────────────────────────────────────────────

  async getSkills(params?: ListParams): Promise<{ skills: any[] }> {
    const { data } = await adminApi.get('/skills', { params });
    return data;
  },

  async createSkill(payload: {
    name: string;
    category: string;
    description?: string;
  }): Promise<{ skill: any }> {
    const { data } = await adminApi.post('/skills', payload);
    return data;
  },

  async updateSkill(id: string, payload: Partial<{
    name: string;
    category: string;
    description: string;
    isActive: boolean;
  }>): Promise<{ skill: any }> {
    const { data } = await adminApi.patch(`/skills/${id}`, payload);
    return data;
  },

  async deleteSkill(id: string): Promise<{ message: string }> {
    const { data } = await adminApi.delete(`/skills/${id}`);
    return data;
  },

  // ── Inbox / Messages ──────────────────────────────────────────────────────

  async getInboxMessages(params?: ListParams): Promise<{ messages: any[] }> {
    const { data } = await adminApi.get('/inbox', { params });
    return data;
  },

  async getMessageThread(id: string): Promise<{ thread: any }> {
    const { data } = await adminApi.get(`/inbox/${id}`);
    return data;
  },

  async replyToMessage(id: string, body: string): Promise<{ message: string }> {
    const { data } = await adminApi.post(`/inbox/${id}/reply`, { body });
    return data;
  },

  async assignMessage(id: string, assigneeId: string): Promise<{ message: string }> {
    const { data } = await adminApi.patch(`/inbox/${id}/assign`, { assigneeId });
    return data;
  },

  async updateMessageStatus(id: string, status: string): Promise<{ message: string }> {
    const { data } = await adminApi.patch(`/inbox/${id}/status`, { status });
    return data;
  },

  // ── CMS ───────────────────────────────────────────────────────────────────

  async getCMSPages(): Promise<{ pages: any[] }> {
    const { data } = await adminApi.get('/cms/pages');
    return data;
  },

  async getCMSPage(slug: string): Promise<{ page: any; versions: any[] }> {
    const { data } = await adminApi.get(`/cms/pages/${slug}`);
    return data;
  },

  async saveCMSDraft(slug: string, content: any, changeNote?: string): Promise<{ version: any }> {
    const { data } = await adminApi.post(`/cms/pages/${slug}/draft`, { content, changeNote });
    return data;
  },

  async publishCMSPage(slug: string, versionId: string): Promise<{ message: string }> {
    const { data } = await adminApi.post(`/cms/pages/${slug}/publish`, { versionId });
    return data;
  },

  async rollbackCMSPage(slug: string, versionId: string, reason: string): Promise<{ message: string }> {
    const { data } = await adminApi.post(`/cms/pages/${slug}/rollback`, { versionId, reason });
    return data;
  },

  // ── Feature Flags ─────────────────────────────────────────────────────────

  async getFeatureFlags(): Promise<{ flags: any[] }> {
    const { data } = await adminApi.get('/feature-flags');
    return data;
  },

  async toggleFeatureFlag(key: string, enabled: boolean, rolloutPercentage?: number): Promise<{ message: string }> {
    if (rolloutPercentage !== undefined) {
      await adminApi.post(`/feature-flags/${key}/rollout`, { percentage: rolloutPercentage });
    }
    const { data } = await adminApi.post(`/feature-flags/${key}/toggle`, { enabled });
    return data;
  },

  // ── AI Inference ──────────────────────────────────────────────────────────

  async getAIInferenceDashboard(): Promise<any> {
    const { data } = await adminApi.get('/ai/dashboard');
    return data;
  },

  async getAIModelRegistry(): Promise<{ models: any[] }> {
    const { data } = await adminApi.get('/ai/models');
    return data;
  },

  async getAIInferenceLogs(params?: { agentType?: string; limit?: number }): Promise<{ logs: any[] }> {
    const { data } = await adminApi.get('/ai/logs', { params });
    return data;
  },

  async getAIEvaluationHistory(): Promise<{ evaluations: any[] }> {
    const { data } = await adminApi.get('/ai/evaluations');
    return data;
  },

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getPlatformAnalytics(range?: '7d' | '30d' | '90d'): Promise<any> {
    const { data } = await adminApi.get('/analytics/platform', { params: { range: range || '30d' } });
    return data;
  },

  async getImpactAnalysis(): Promise<any> {
    const { data } = await adminApi.get('/analytics/impact');
    return data;
  },

  // ── System Health ─────────────────────────────────────────────────────────

  async getSystemHealth(): Promise<any> {
    const { data } = await adminApi.get('/system/health');
    return data;
  },

  // ── Audit Logs ────────────────────────────────────────────────────────────

  async getAuditLogs(params?: {
    action?: string;
    entityType?: string;
    actorEmail?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: any[] }> {
    const { data } = await adminApi.get('/security/audit-logs', { params });
    return data;
  },

  // ── Compliance / GDPR ─────────────────────────────────────────────────────

  async exportUserDataGDPR(userId: string): Promise<any> {
    const { data } = await adminApi.get(`/compliance/users/${userId}/export`);
    return data;
  },

  async eraseUserDataGDPR(userId: string, reason: string): Promise<{ message: string }> {
    const { data } = await adminApi.delete(`/compliance/users/${userId}/erase`, { data: { reason } });
    return data;
  },

  async getDataProcessingRecords(): Promise<{ records: any[] }> {
    const { data } = await adminApi.get('/compliance/data-processing');
    return data;
  },

  // ── Settings ──────────────────────────────────────────────────────────────

  async getPlatformSettings(): Promise<{ settings: any }> {
    const { data } = await adminApi.get('/settings');
    return data;
  },

  async updatePlatformSetting(key: string, value: any): Promise<{ message: string }> {
    const { data } = await adminApi.patch(`/settings/${key}`, { value });
    return data;
  },
};
