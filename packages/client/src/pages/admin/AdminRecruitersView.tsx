import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';
import { 
  Briefcase, Building, Mail, Search, RefreshCw, CheckCircle, 
  Ban, LogOut, ShieldAlert, Globe
} from 'lucide-react';
import { ConfirmationModal } from '../../components/admin/ConfirmationModal';

export const AdminRecruitersView: React.FC = () => {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionTarget, setActionTarget] = useState<{
    type: 'SUSPEND' | 'FORCE_LOGOUT';
    recruiter: any;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRecruiters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/recruiters');
      setRecruiters(res.data?.recruiters || []);
    } catch (err) {
      console.error('Failed to load recruiters:', err);
      toast.error('Failed to load recruiters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruiters();
  }, []);

  const handleActionConfirm = async (reason: string) => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      if (actionTarget.type === 'SUSPEND') {
        await adminService.updateUserStatus(actionTarget.recruiter.id, 'suspended', reason);
        toast.success(`Recruiter ${actionTarget.recruiter.email} suspended`);
      } else if (actionTarget.type === 'FORCE_LOGOUT') {
        await adminService.forceLogoutUser(actionTarget.recruiter.id);
        toast.success(`Sessions invalidated for ${actionTarget.recruiter.email}`);
      }
      setActionTarget(null);
      await loadRecruiters();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = recruiters.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.publicId?.toLowerCase().includes(search.toLowerCase()) ||
    r.organizationName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17171A] border border-[#2A2A2E] rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1E2538] text-blue-400 border border-blue-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#F5F5F4]">Recruiters & Talent Partners</h2>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                  RECR-2026 Registry
                </span>
              </div>
              <p className="text-xs text-[#6B6B70] mt-0.5">
                Manage recruiter access, enterprise affiliations, search queries, and talent shortlists.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadRecruiters}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1E1E22] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-xs font-semibold text-[#F5F5F4] transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-[#6B6B70] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by recruiter name, RECR-2026 ID, affiliated organization..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#17171A] border border-[#2A2A2E] text-xs text-[#F5F5F4] placeholder-[#6B6B70] focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#A3A3A8]">
            <thead className="bg-[#111113] text-[#6B6B70] uppercase text-[10px] tracking-wider border-b border-[#2A2A2E]">
              <tr>
                <th className="py-3 px-4">RECRUITER ID</th>
                <th className="py-3 px-4">NAME</th>
                <th className="py-3 px-4">CORPORATE ENTITY</th>
                <th className="py-3 px-4">EMAIL</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">SECURITY ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2E]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#6B6B70]">
                    No matching recruiters found in this registry.
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-[#1E1E22]/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{r.publicId}</td>
                    <td className="py-3.5 px-4 font-bold text-[#F5F5F4]">{r.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1.5 text-[#F5F5F4]">
                        <Building className="w-3.5 h-3.5 text-[#6B6B70]" />
                        {r.organizationName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#A3A3A8] flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#6B6B70]" />
                      {r.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30">
                        <CheckCircle className="w-3 h-3" />
                        Active Vetted
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setActionTarget({ type: 'FORCE_LOGOUT', recruiter: r })}
                        title="Force logout active sessions"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1E1E22] hover:bg-[#2A2A2E] text-[#F5F5F4] border border-[#2A2A2E] text-[11px] transition"
                      >
                        <LogOut className="w-3 h-3 text-[#E8672E]" />
                        Logout
                      </button>
                      <button
                        onClick={() => setActionTarget({ type: 'SUSPEND', recruiter: r })}
                        title="Suspend recruiter portal access"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2A1717] hover:bg-[#3D1E1E] text-[#E0554E] border border-[#E0554E]/30 text-[11px] transition"
                      >
                        <Ban className="w-3 h-3" />
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {actionTarget && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setActionTarget(null)}
          onConfirm={handleActionConfirm}
          title={actionTarget.type === 'SUSPEND' ? 'Suspend Recruiter Account' : 'Force Logout Recruiter'}
          description={
            actionTarget.type === 'SUSPEND'
              ? `Are you sure you want to suspend access for ${actionTarget.recruiter.name}? They will immediately lose recruiter search capabilities and enterprise candidate access.`
              : `Invalidate all active sessions for ${actionTarget.recruiter.email}? The recruiter will need to sign in again.`
          }
          affectedEntity={{
            label: 'Recruiter',
            value: `${actionTarget.recruiter.name} (${actionTarget.recruiter.email})`,
          }}
          isDestructive={actionTarget.type === 'SUSPEND'}
          isReversible={actionTarget.type !== 'SUSPEND'}
          requireReason={actionTarget.type === 'SUSPEND'}
          confirmText={actionTarget.type === 'SUSPEND' ? 'Suspend Access' : 'Force Logout'}
          loading={actionLoading}
        />
      )}
    </div>
  );
};
