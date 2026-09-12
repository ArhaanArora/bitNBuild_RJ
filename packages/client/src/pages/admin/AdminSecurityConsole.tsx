import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { adminService, SecurityOverviewData } from '../../services/admin.service';
import {
  ShieldCheck, Users, CheckCircle, AlertTriangle, FileText, Settings,
  Search, ShieldAlert, Check, X, RefreshCw, LogOut, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSecurityConsole() {
  const { admin, adminLogout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'verification' | 'audit' | 'settings'>('overview');

  // Overview state
  const [overview, setOverview] = useState<SecurityOverviewData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Users state
  const [userList, setUserList] = useState<any[]>([]);
  const [userFilterRole, setUserFilterRole] = useState<string>('all');
  const [userFilterStatus, setUserFilterStatus] = useState<string>('all');
  const [userSearch, setUserSearch] = useState<string>('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Suspension modal state
  const [selectedUserForStatus, setSelectedUserForStatus] = useState<any | null>(null);
  const [statusTarget, setStatusTarget] = useState<'active' | 'suspended'>('suspended');
  const [statusReason, setStatusReason] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Verification queue state
  const [skillReviews, setSkillReviews] = useState<any[]>([]);
  const [orgReviews, setOrgReviews] = useState<any[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const fetchOverview = async () => {
    setOverviewLoading(true);
    try {
      const data = await adminService.getSecurityOverview();
      setOverview(data);
    } catch {
      toast.error('Failed to load security metrics');
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await adminService.getUsers({
        role: userFilterRole,
        status: userFilterStatus,
        search: userSearch,
      });
      setUserList(data.users);
    } catch {
      toast.error('Failed to query user registry');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchQueue = async () => {
    setQueueLoading(true);
    try {
      const data = await adminService.getVerificationQueue();
      setSkillReviews(data.skillReviews);
      setOrgReviews(data.orgReviews);
    } catch {
      toast.error('Failed to fetch verification queue');
    } finally {
      setQueueLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const data = await adminService.getAuditLogs();
      setAuditLogs(data.logs);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') fetchOverview();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'verification') fetchQueue();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForStatus || !statusReason.trim()) {
      toast.error('Justification reason required for immutable audit logs');
      return;
    }

    setStatusUpdating(true);
    try {
      const res = await adminService.updateUserStatus(selectedUserForStatus.id, statusTarget, statusReason);
      toast.success(res.message);
      setSelectedUserForStatus(null);
      setStatusReason('');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update user security status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleVerifyDecision = async (type: 'candidate_skill' | 'organization', targetId: string, decision: 'VERIFIED' | 'REJECTED' | 'REVOKED') => {
    try {
      const res = await adminService.recordVerificationDecision({
        type,
        targetId,
        decision,
        reason: `Operator decision: ${decision}`,
      });
      toast.success(res.message);
      fetchQueue();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to record decision');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F5F5F4] flex flex-col">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-[#1E1E22] bg-[#0E0E12] px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#241C16] border border-[#E8672E]/40 flex items-center justify-center text-[#E8672E]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Security Console</span>
              <span className="text-[10px] bg-[#E8672E]/10 text-[#E8672E] border border-[#E8672E]/30 px-2 py-0.5 rounded font-mono uppercase font-semibold">
                {admin?.adminRole}
              </span>
            </div>
            <p className="text-[11px] text-[#6B6B70]">SkillVerify Platform Governance & Audit Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-semibold text-white">{admin?.name}</p>
            <p className="text-[10px] text-[#6B6B70] font-mono">{admin?.email}</p>
          </div>
          <button
            onClick={adminLogout}
            className="p-2 rounded-lg bg-[#18181C] hover:bg-[#202025] border border-[#2A2A2E] text-[#E0554E] transition"
            title="Terminate Admin Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex min-w-0">
        {/* Sidebar Nav */}
        <aside className="w-56 border-r border-[#1E1E22] bg-[#0A0A0D] p-4 flex flex-col justify-between shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'overview' ? 'bg-[#241C16] text-[#E8672E] font-semibold border-l-2 border-[#E8672E]' : 'text-[#A3A3A8] hover:text-white hover:bg-[#141418]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'users' ? 'bg-[#241C16] text-[#E8672E] font-semibold border-l-2 border-[#E8672E]' : 'text-[#A3A3A8] hover:text-white hover:bg-[#141418]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users & Suspensions</span>
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'verification' ? 'bg-[#241C16] text-[#E8672E] font-semibold border-l-2 border-[#E8672E]' : 'text-[#A3A3A8] hover:text-white hover:bg-[#141418]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Verification Queue</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'audit' ? 'bg-[#241C16] text-[#E8672E] font-semibold border-l-2 border-[#E8672E]' : 'text-[#A3A3A8] hover:text-white hover:bg-[#141418]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Immutable Audit Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                activeTab === 'settings' ? 'bg-[#241C16] text-[#E8672E] font-semibold border-l-2 border-[#E8672E]' : 'text-[#A3A3A8] hover:text-white hover:bg-[#141418]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Platform Security</span>
            </button>
          </nav>

          <div className="p-3 bg-[#111114] border border-[#1E1E22] rounded-xl text-[10px] text-[#6B6B70] leading-relaxed">
            <span className="text-[#E8672E] font-semibold block mb-0.5">APPEND-ONLY AUDIT</span>
            All state mutations write signed cryptographic audit records.
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">Security Overview</h1>
                  <p className="text-xs text-[#A3A3A8] mt-0.5">Real-time platform identity and integrity status</p>
                </div>
                <button
                  onClick={fetchOverview}
                  className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${overviewLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Metric Cards (§8) */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#121216] border border-[#1E1E22] rounded-xl p-4">
                  <p className="text-[11px] text-[#6B6B70] uppercase font-mono tracking-wider">Total Users</p>
                  <p className="text-2xl font-bold mt-1 text-white">{overview?.metrics.totalUsers ?? '—'}</p>
                  <div className="flex items-center gap-2 text-[10px] text-[#A3A3A8] mt-2">
                    <span>{overview?.metrics.candidateCount} Candidates</span>
                    <span>·</span>
                    <span>{overview?.metrics.recruiterCount} Recruiters</span>
                  </div>
                </div>

                <div className="bg-[#121216] border border-[#1E1E22] rounded-xl p-4">
                  <p className="text-[11px] text-[#6B6B70] uppercase font-mono tracking-wider">Pending Verifications</p>
                  <p className="text-2xl font-bold mt-1 text-[#D89A3E]">{overview?.metrics.pendingVerifications ?? '—'}</p>
                  <p className="text-[10px] text-[#A3A3A8] mt-2">Awaiting operator review</p>
                </div>

                <div className="bg-[#121216] border border-[#1E1E22] rounded-xl p-4">
                  <p className="text-[11px] text-[#6B6B70] uppercase font-mono tracking-wider">Suspended Accounts</p>
                  <p className="text-2xl font-bold mt-1 text-[#E0554E]">{overview?.metrics.suspendedUsers ?? '—'}</p>
                  <p className="text-[10px] text-[#A3A3A8] mt-2">Under security review</p>
                </div>

                <div className="bg-[#121216] border border-[#1E1E22] rounded-xl p-4">
                  <p className="text-[11px] text-[#6B6B70] uppercase font-mono tracking-wider">Security Alerts</p>
                  <p className="text-2xl font-bold mt-1 text-[#E8672E]">{overview?.metrics.securityAlerts ?? '0'}</p>
                  <p className="text-[10px] text-[#A3A3A8] mt-2">Active integrity flags</p>
                </div>
              </div>

              {/* Recent Audit Feed */}
              <div className="bg-[#121216] border border-[#1E1E22] rounded-xl p-6">
                <h2 className="text-sm font-semibold mb-4 flex items-center justify-between">
                  <span>Recent Security Events</span>
                  <button onClick={() => setActiveTab('audit')} className="text-xs text-[#E8672E] hover:underline">
                    View all audit logs →
                  </button>
                </h2>
                <div className="divide-y divide-[#1A1A1F]">
                  {overview?.recentAuditLogs.map((log: any) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-[#1E1E22] text-[#A3A3A8] px-2 py-0.5 rounded">
                          {log.action}
                        </span>
                        <span className="text-white font-sans">{log.actorEmail || 'System'}</span>
                        {log.reason && <span className="text-[#6B6B70] font-sans">({log.reason})</span>}
                      </div>
                      <span className="text-[11px] text-[#6B6B70]">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {overview?.recentAuditLogs.length === 0 && (
                    <p className="text-xs text-[#6B6B70] py-4">No recent security events recorded.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. USERS & SUSPENSIONS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-5 max-w-6xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">User Directory & Security Status</h1>
                  <p className="text-xs text-[#A3A3A8] mt-0.5">Manage user workspace access and enforce account suspensions</p>
                </div>
                <button onClick={fetchUsers} className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5">
                  <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#6B6B70] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                    placeholder="Search by email or Public ID..."
                    className="w-full bg-[#121216] border border-[#1E1E22] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#E8672E]"
                  />
                </div>
                <select
                  value={userFilterRole}
                  onChange={(e) => setUserFilterRole(e.target.value)}
                  className="bg-[#121216] border border-[#1E1E22] rounded-xl px-3 py-2 text-xs text-[#A3A3A8] focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="candidate">Candidate</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="organizer">Organizer</option>
                </select>
                <select
                  value={userFilterStatus}
                  onChange={(e) => setUserFilterStatus(e.target.value)}
                  className="bg-[#121216] border border-[#1E1E22] rounded-xl px-3 py-2 text-xs text-[#A3A3A8] focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="bg-[#121216] border border-[#1E1E22] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0E0E12] border-b border-[#1E1E22] text-[#6B6B70] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3 pl-4">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Email Verified</th>
                      <th className="p-3">Verification</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right pr-4">Security Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#18181D]">
                    {userList.map((u: any) => (
                      <tr key={u.id} className="hover:bg-[#15151A] transition">
                        <td className="p-3 pl-4">
                          <p className="font-semibold text-white">{u.firstName || ''} {u.lastName || ''}</p>
                          <p className="text-[11px] text-[#6B6B70] font-mono">{u.email}</p>
                        </td>
                        <td className="p-3 font-mono capitalize text-[#A3A3A8]">{u.role}</td>
                        <td className="p-3">
                          {u.emailVerified ? (
                            <span className="text-[#3FB65F] text-[11px]">✓ Verified</span>
                          ) : (
                            <span className="text-[#D89A3E] text-[11px]">⚠ Unverified</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#18181C] border border-[#2A2A2E] text-[#A3A3A8]">
                            {u.verificationStatus || 'PENDING'}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.status === 'suspended' ? (
                            <span className="text-[10px] bg-[#2A1717] text-[#E0554E] border border-[#E0554E]/30 px-2 py-0.5 rounded font-semibold uppercase">
                              Suspended
                            </span>
                          ) : (
                            <span className="text-[10px] bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30 px-2 py-0.5 rounded font-semibold uppercase">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right pr-4">
                          {u.status === 'active' ? (
                            <button
                              onClick={() => {
                                setSelectedUserForStatus(u);
                                setStatusTarget('suspended');
                              }}
                              className="text-xs text-[#E0554E] hover:underline"
                            >
                              Suspend Account
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUserForStatus(u);
                                setStatusTarget('active');
                              }}
                              className="text-xs text-[#3FB65F] hover:underline"
                            >
                              Reactivate Account
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. VERIFICATION QUEUE TAB */}
          {activeTab === 'verification' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h1 className="text-xl font-bold">Verification Decision Queue</h1>
                <p className="text-xs text-[#A3A3A8] mt-0.5">Operator verification for claimed skills and organizations</p>
              </div>

              {/* Skills Review */}
              <div className="bg-[#121216] border border-[#1E1E22] rounded-xl p-5">
                <h2 className="text-sm font-semibold mb-3">Candidate Skill Claims Awaiting Review</h2>
                <div className="space-y-3">
                  {skillReviews.map((item: any) => (
                    <div key={item.id} className="p-3.5 bg-[#17171C] border border-[#222228] rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {item.skillName} · <span className="text-[#E8672E] font-mono">{item.claimedLevel}</span>
                        </p>
                        <p className="text-[11px] text-[#6B6B70] mt-0.5">
                          Candidate: <span className="text-[#A3A3A8]">{item.candidateEmail}</span>
                        </p>
                        {item.evidenceNotes && (
                          <p className="text-xs text-[#A3A3A8] mt-1 bg-[#101014] p-2 rounded border border-[#1E1E22]">
                            {item.evidenceNotes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyDecision('candidate_skill', item.id, 'VERIFIED')}
                          className="px-3 py-1.5 rounded-lg bg-[#16261B] hover:bg-[#1c3223] text-[#3FB65F] border border-[#3FB65F]/30 text-xs font-semibold"
                        >
                          Approve (Verified)
                        </button>
                        <button
                          onClick={() => handleVerifyDecision('candidate_skill', item.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-lg bg-[#2A1717] hover:bg-[#381f1f] text-[#E0554E] border border-[#E0554E]/30 text-xs font-semibold"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {skillReviews.length === 0 && (
                    <p className="text-xs text-[#6B6B70] py-3">No pending skill claims in queue.</p>
                  )}
                </div>
              </div>

              {/* Organizations Review */}
              <div className="bg-[#121216] border border-[#1E1E22] rounded-xl p-5">
                <h2 className="text-sm font-semibold mb-3">Organization Legitimacy Verifications</h2>
                <div className="space-y-3">
                  {orgReviews.map((org: any) => (
                    <div key={org.id} className="p-3.5 bg-[#17171C] border border-[#222228] rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">{org.name} ({org.type})</p>
                        <p className="text-[11px] text-[#6B6B70] mt-0.5">
                          Contact: {org.contactEmail || 'N/A'} · Website: {org.website || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyDecision('organization', org.id, 'VERIFIED')}
                          className="px-3 py-1.5 rounded-lg bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30 text-xs font-semibold"
                        >
                          Verify Org
                        </button>
                        <button
                          onClick={() => handleVerifyDecision('organization', org.id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-lg bg-[#2A1717] text-[#E0554E] border border-[#E0554E]/30 text-xs font-semibold"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {orgReviews.length === 0 && (
                    <p className="text-xs text-[#6B6B70] py-3">No pending organizations in queue.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. IMMUTABLE AUDIT LOGS TAB (§8) */}
          {activeTab === 'audit' && (
            <div className="space-y-5 max-w-6xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">Immutable Audit Logs</h1>
                  <p className="text-xs text-[#A3A3A8] mt-0.5">Cryptographic record of every state-changing operator & security event</p>
                </div>
                <button onClick={fetchAuditLogs} className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5">
                  <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="bg-[#121216] border border-[#1E1E22] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0E0E12] border-b border-[#1E1E22] text-[#6B6B70] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3 pl-4">Timestamp</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Target Entity</th>
                      <th className="p-3">Justification Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#18181D] font-mono text-[11px]">
                    {auditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-[#15151A] transition">
                        <td className="p-3 pl-4 text-[#6B6B70]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3 text-white">{log.actorEmail || 'System'}</td>
                        <td className="p-3 text-[#A3A3A8]">{log.actorRole || 'System'}</td>
                        <td className="p-3">
                          <span className="text-[#E8672E] font-semibold">{log.action}</span>
                        </td>
                        <td className="p-3 text-[#A3A3A8]">{log.entityType} ({log.entityId?.slice(0, 8)}...)</td>
                        <td className="p-3 text-[#A3A3A8] font-sans">{log.reason || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. PLATFORM SECURITY SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-xl font-bold">Platform Security Policies</h1>
                <p className="text-xs text-[#A3A3A8] mt-0.5">Authorization thresholds and security guardrails</p>
              </div>

              <div className="bg-[#121216] border border-[#1E1E22] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E1E22]">
                  <div>
                    <p className="text-xs font-semibold text-white">Centralized RBAC Enforcement</p>
                    <p className="text-[11px] text-[#6B6B70]">Server-side authorization validated on every request independently</p>
                  </div>
                  <span className="text-[10px] bg-[#16261B] text-[#3FB65F] px-2 py-0.5 rounded font-mono font-semibold">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[#1E1E22]">
                  <div>
                    <p className="text-xs font-semibold text-white">Isolated Admin Credential Space</p>
                    <p className="text-[11px] text-[#6B6B70]">Admins table isolated from users collection to prevent privilege escalation</p>
                  </div>
                  <span className="text-[10px] bg-[#16261B] text-[#3FB65F] px-2 py-0.5 rounded font-mono font-semibold">
                    ENFORCED
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Immutable Audit Logging</p>
                    <p className="text-[11px] text-[#6B6B70]">Every suspension and verification change requires justification reasons</p>
                  </div>
                  <span className="text-[10px] bg-[#16261B] text-[#3FB65F] px-2 py-0.5 rounded font-mono font-semibold">
                    REQUIRED
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Account Status / Suspension Modal (§8) */}
      {selectedUserForStatus && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-[#2A2A2E] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#E0554E]" />
              <span>{statusTarget === 'suspended' ? 'Suspend Account' : 'Reactivate Account'}</span>
            </h2>
            <p className="text-xs text-[#A3A3A8]">
              Target: <span className="text-white font-mono">{selectedUserForStatus.email}</span> ({selectedUserForStatus.role})
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A3A3A8] mb-1">
                  Justification Reason (Recorded in immutable audit log)
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="State the regulatory, security, or policy reason for this action..."
                  required
                  rows={3}
                  className="w-full bg-[#1A1A20] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForStatus(null)}
                  className="btn-secondary py-2 px-3 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusUpdating}
                  className={`${statusTarget === 'suspended' ? 'bg-[#E0554E] hover:bg-[#c9453e] text-white' : 'btn-primary'} py-2 px-4 text-xs font-semibold rounded-xl`}
                >
                  {statusUpdating ? 'Recording...' : `Confirm ${statusTarget === 'suspended' ? 'Suspension' : 'Reactivation'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
