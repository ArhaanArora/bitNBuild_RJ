import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';
import { 
  ShieldAlert, Users, Search, RefreshCw, KeyRound, CheckCircle, 
  ShieldCheck, UserPlus, LogOut, Ban, AlertTriangle, Shield, Lock
} from 'lucide-react';
import { ConfirmationModal } from '../../components/admin/ConfirmationModal';

export const AdminUsersRBACView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'admins' | 'platform' | 'role_requests'>('admins');
  const [adminList, setAdminList] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [roleRequests, setRoleRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals & Actions
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', adminRole: 'support_admin', password: '' });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'SUSPEND_ADMIN' | 'SUSPEND_USER' | 'FORCE_LOGOUT' | 'CHANGE_ADMIN_ROLE';
    target: any;
    newRole?: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsRes, usersRes, requestsRes] = await Promise.all([
        adminService.getAdminUsers(),
        api.get('/admin/users'),
        api.get('/admin/role-requests').catch(() => ({ data: { requests: [] } })),
      ]);
      setAdminList(adminsRes.admins || []);
      setUserList(usersRes.data?.users || []);
      setRoleRequests(requestsRes.data?.requests || []);
    } catch (err) {
      console.error('Failed to load RBAC directory:', err);
      toast.error('Failed to load RBAC directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error('All fields are required');
      return;
    }
    setCreatingAdmin(true);
    try {
      await adminService.createAdminUser(newAdmin);
      toast.success(`Admin ${newAdmin.name} created`);
      setIsCreateAdminOpen(false);
      setNewAdmin({ name: '', email: '', adminRole: 'support_admin', password: '' });
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create admin user');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleModalConfirm = async (reason: string) => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.type === 'SUSPEND_ADMIN') {
        await adminService.suspendAdminUser(confirmAction.target.id, reason);
        toast.success(`Admin ${confirmAction.target.email} suspended`);
      } else if (confirmAction.type === 'CHANGE_ADMIN_ROLE') {
        await adminService.updateAdminRole(confirmAction.target.id, confirmAction.newRole!);
        toast.success(`Admin role updated to ${confirmAction.newRole}`);
      } else if (confirmAction.type === 'FORCE_LOGOUT') {
        await adminService.forceLogoutUser(confirmAction.target.id);
        toast.success(`Sessions invalidated for ${confirmAction.target.email}`);
      }
      setConfirmAction(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePlatformRole = async (userId: string, newRole: string) => {
    try {
      await api.post(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Platform role updated to ${newRole}`);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update platform role');
    }
  };

  const handleReviewRoleRequest = async (requestId: string, status: 'approved' | 'rejected', reviewerNotes = '') => {
    try {
      await api.post(`/admin/role-requests/${requestId}/review`, { status, reviewerNotes });
      toast.success(`Role request has been ${status}`);
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || `Failed to review role request`);
    }
  };

  const filteredAdmins = adminList.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.adminRole?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = userList.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.publicId?.toLowerCase().includes(search.toLowerCase()) ||
    (u.firstName && u.firstName.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredRoleRequests = roleRequests.filter(r =>
    (r.userEmail && r.userEmail.toLowerCase().includes(search.toLowerCase())) ||
    (r.reason && r.reason.toLowerCase().includes(search.toLowerCase())) ||
    r.fromRole?.toLowerCase().includes(search.toLowerCase()) ||
    r.toRole?.toLowerCase().includes(search.toLowerCase()) ||
    r.status?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingRequestsCount = roleRequests.filter(r => r.status === 'pending').length;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'super_admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E0554E]/20 text-[#E0554E] border border-[#E0554E]/40 uppercase font-bold">Super Admin (Tier 1)</span>;
      case 'security_admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E8672E]/20 text-[#E8672E] border border-[#E8672E]/40 uppercase font-bold">Security Admin (Tier 2)</span>;
      case 'verification_admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/40 uppercase font-bold">Verification Admin (Tier 3)</span>;
      case 'support_admin':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase font-bold">Support Admin (Tier 4)</span>;
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17171A] border border-[#2A2A2E] rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#241C16] text-[#E8672E] border border-[#E8672E]/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F5F5F4]">
                Privileged Governance & RBAC Directory
              </h2>
              <p className="text-xs text-[#6B6B70] mt-0.5">
                Manage 4-tier admin permissions, role elevations, and user perimeter access
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'admins' && (
            <button
              onClick={() => setIsCreateAdminOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E8672E] hover:bg-[#d05622] text-xs font-bold text-white transition shadow-lg"
            >
              <UserPlus className="w-3.5 h-3.5" />
              New Admin
            </button>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1E1E22] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-xs text-[#F5F5F4] transition shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#2A2A2E] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('admins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'admins'
              ? 'bg-[#241C16] text-[#E8672E] border border-[#E8672E]/40'
              : 'text-[#A3A3A8] hover:text-[#F5F5F4] hover:bg-[#1E1E22]'
          }`}
        >
          <Shield className="w-4 h-4" />
          Administrative Staff ({adminList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('platform')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'platform'
              ? 'bg-[#241C16] text-[#E8672E] border border-[#E8672E]/40'
              : 'text-[#A3A3A8] hover:text-[#F5F5F4] hover:bg-[#1E1E22]'
          }`}
        >
          <Users className="w-4 h-4" />
          Platform Registered Users ({userList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('role_requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'role_requests'
              ? 'bg-[#241C16] text-[#E8672E] border border-[#E8672E]/40'
              : 'text-[#A3A3A8] hover:text-[#F5F5F4] hover:bg-[#1E1E22]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Role Change Applications</span>
          {pendingRequestsCount > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#E8672E] text-[#0D0D0F] font-bold">
              {pendingRequestsCount}
            </span>
          ) : (
            <span className="text-[11px] text-[#6B6B70]">({roleRequests.length})</span>
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B6B70] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={
            activeSubTab === 'admins'
              ? 'Search administrative staff...'
              : activeSubTab === 'platform'
              ? 'Search registered platform users...'
              : 'Search role change requests by user, role, or reason...'
          }
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#17171A] border border-[#2A2A2E] text-xs text-[#F5F5F4] placeholder-[#6B6B70] focus:outline-none focus:border-[#E8672E]"
        />
      </div>

      {/* Sub-Tab 1: Privileged Admin Staff */}
      {activeSubTab === 'admins' && (
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#A3A3A8]">
              <thead className="bg-[#111113] text-[#6B6B70] uppercase text-[10px] tracking-wider border-b border-[#2A2A2E]">
                <tr>
                  <th className="py-3 px-4">ADMIN USER</th>
                  <th className="py-3 px-4">CURRENT TIER</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">LAST LOGIN</th>
                  <th className="py-3 px-4">CHANGE TIER</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#6B6B70]">
                      No administrative staff accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map(admin => (
                    <tr key={admin.id} className="hover:bg-[#1E1E22]/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#F5F5F4]">{admin.name}</div>
                        <div className="text-[11px] text-[#6B6B70]">{admin.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getTierBadge(admin.adminRole)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          admin.status === 'active'
                            ? 'bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30'
                            : 'bg-[#2A1717] text-[#E0554E] border border-[#E0554E]/30'
                        }`}>
                          {admin.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B6B70] text-[11px]">
                        {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={admin.adminRole}
                          onChange={(e) => setConfirmAction({
                            type: 'CHANGE_ADMIN_ROLE',
                            target: admin,
                            newRole: e.target.value,
                          })}
                          disabled={admin.status !== 'active'}
                          className="px-2.5 py-1 rounded-lg bg-[#111113] border border-[#2A2A2E] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#E8672E]"
                        >
                          <option value="super_admin">Super Admin (Tier 1)</option>
                          <option value="security_admin">Security Admin (Tier 2)</option>
                          <option value="verification_admin">Verification Admin (Tier 3)</option>
                          <option value="support_admin">Support Admin (Tier 4)</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {admin.status === 'active' && (
                          <button
                            onClick={() => setConfirmAction({
                              type: 'SUSPEND_ADMIN',
                              target: admin,
                            })}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2A1717] hover:bg-[#3D1E1E] text-[#E0554E] border border-[#E0554E]/30 text-[11px] transition"
                          >
                            <Ban className="w-3 h-3" />
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Platform Registered Users */}
      {activeSubTab === 'platform' && (
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#A3A3A8]">
              <thead className="bg-[#111113] text-[#6B6B70] uppercase text-[10px] tracking-wider border-b border-[#2A2A2E]">
                <tr>
                  <th className="py-3 px-4">PUBLIC ID</th>
                  <th className="py-3 px-4">NAME</th>
                  <th className="py-3 px-4">EMAIL ADDRESS</th>
                  <th className="py-3 px-4">REGISTERED</th>
                  <th className="py-3 px-4">PLATFORM ROLE</th>
                  <th className="py-3 px-4 text-right">SECURITY ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-[#1E1E22]/50 transition">
                    <td className="py-3.5 px-4 font-bold text-[#E8672E]">
                      {u.publicId || u.id.substring(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#F5F5F4]">
                      {u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : 'Registered User'}
                    </td>
                    <td className="py-3.5 px-4 text-[#A3A3A8] text-[11px]">{u.email}</td>
                    <td className="py-3.5 px-4 text-[#6B6B70] text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={e => handleChangePlatformRole(u.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-[#111113] border border-[#2A2A2E] text-xs text-[#F5F5F4] focus:outline-none focus:border-[#E8672E] capitalize"
                      >
                        <option value="candidate">Candidate</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setConfirmAction({
                          type: 'FORCE_LOGOUT',
                          target: u,
                        })}
                        title="Invalidate all active sessions for user"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1E1E22] hover:bg-[#2A2A2E] text-[#F5F5F4] border border-[#2A2A2E] text-[11px] transition"
                      >
                        <LogOut className="w-3 h-3 text-[#E8672E]" />
                        Force Logout
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Role Change Applications (§7, §8) */}
      {activeSubTab === 'role_requests' && (
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-[#2A2A2E] flex items-center justify-between bg-[#121215]">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E8672E]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Server-Enforced Role Elevation Queue
              </span>
            </div>
            <span className="text-[11px] text-[#6B6B70]">
              Role updates apply immediately to database and custom authentication claims
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#A3A3A8]">
              <thead className="bg-[#111113] text-[#6B6B70] uppercase text-[10px] tracking-wider border-b border-[#2A2A2E]">
                <tr>
                  <th className="py-3 px-4">APPLICANT</th>
                  <th className="py-3 px-4">FROM ROLE</th>
                  <th className="py-3 px-4">REQUESTED ROLE</th>
                  <th className="py-3 px-4">JUSTIFICATION</th>
                  <th className="py-3 px-4">SUBMITTED</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2E]">
                {filteredRoleRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#6B6B70] text-xs">
                      No role change applications found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredRoleRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#1E1E22]/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#F5F5F4]">{req.userName || req.userEmail}</div>
                        <div className="text-[11px] text-[#6B6B70]">{req.userEmail}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#2A2A2E] text-[#A3A3A8] capitalize font-medium">
                          {req.fromRole}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#E8672E]/10 border border-[#E8672E]/30 text-[#E8672E] capitalize font-bold">
                          {req.toRole}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs text-[#F5F5F4] line-clamp-2" title={req.reason}>
                          {req.reason}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-[#6B6B70] text-[11px] whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Pending Review
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 font-medium">
                            <Ban className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleReviewRoleRequest(req.id, 'approved', 'Approved by administrator')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-[#0D0D0F] border border-emerald-500/30 text-[11px] font-semibold transition"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewRoleRequest(req.id, 'rejected', 'Application declined')}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-[11px] font-semibold transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#6B6B70]">
                            {req.reviewedBy ? 'Reviewed' : 'Resolved'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {isCreateAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#E8672E]" />
                <h3 className="text-sm font-bold text-[#F5F5F4]">Provision Admin Account</h3>
              </div>
              <button
                onClick={() => setIsCreateAdminOpen(false)}
                className="text-[#6B6B70] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B6B70] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdmin.name}
                  onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-[#111113] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-[#F5F5F4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#6B6B70] mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@skillverify.com"
                  className="w-full bg-[#111113] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-[#F5F5F4] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#6B6B70] mb-1">Privilege Role Tier</label>
                <select
                  value={newAdmin.adminRole}
                  onChange={e => setNewAdmin({ ...newAdmin, adminRole: e.target.value })}
                  className="w-full bg-[#111113] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-[#F5F5F4] focus:outline-none"
                >
                  <option value="super_admin">Super Admin (Tier 1 — Full Access)</option>
                  <option value="security_admin">Security Admin (Tier 2 — Audits & RBAC)</option>
                  <option value="verification_admin">Verification Admin (Tier 3 — Verifications)</option>
                  <option value="support_admin">Support Admin (Tier 4 — Inbox & Read)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B6B70] mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newAdmin.password}
                  onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-[#111113] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-[#F5F5F4] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateAdminOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#A3A3A8] hover:bg-[#1E1E22] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="px-5 py-2 rounded-xl bg-[#E8672E] hover:bg-[#d05622] font-bold text-white transition disabled:opacity-50"
                >
                  {creatingAdmin ? 'Creating...' : 'Provision Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Confirmation Modal */}
      {confirmAction && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleModalConfirm}
          title={
            confirmAction.type === 'SUSPEND_ADMIN'
              ? 'Suspend Administrative Access'
              : confirmAction.type === 'CHANGE_ADMIN_ROLE'
              ? 'Modify Admin Tier Privileges'
              : 'Force Logout User Sessions'
          }
          description={
            confirmAction.type === 'SUSPEND_ADMIN'
              ? `Are you sure you want to suspend admin privileges for ${confirmAction.target.name}? They will lose access to all admin command consoles.`
              : confirmAction.type === 'CHANGE_ADMIN_ROLE'
              ? `Update privilege level for ${confirmAction.target.name} from "${confirmAction.target.adminRole}" to "${confirmAction.newRole}"?`
              : `Force logout all active sessions for ${confirmAction.target.email}? The user will be required to re-authenticate.`
          }
          affectedEntity={{
            label: 'Target User',
            value: confirmAction.target.email,
          }}
          isDestructive={confirmAction.type === 'SUSPEND_ADMIN'}
          isReversible={confirmAction.type !== 'SUSPEND_ADMIN'}
          requireReason={confirmAction.type === 'SUSPEND_ADMIN'}
          confirmText={
            confirmAction.type === 'SUSPEND_ADMIN'
              ? 'Suspend Privileges'
              : confirmAction.type === 'CHANGE_ADMIN_ROLE'
              ? 'Confirm Role Change'
              : 'Invalidate Sessions'
          }
          loading={actionLoading}
        />
      )}
    </div>
  );
};
