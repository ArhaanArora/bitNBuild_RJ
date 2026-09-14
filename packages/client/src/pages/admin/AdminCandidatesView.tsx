import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';
import { 
  Users, ShieldCheck, Search, Code2, Globe, ExternalLink, Award, RefreshCw,
  Ban, LogOut, MoreVertical
} from 'lucide-react';
import { ConfirmationModal } from '../../components/admin/ConfirmationModal';

export const AdminCandidatesView: React.FC<{ onInspectCandidate?: (id: string) => void }> = ({
  onInspectCandidate,
}) => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionTarget, setActionTarget] = useState<{
    type: 'SUSPEND' | 'FORCE_LOGOUT';
    candidate: any;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/candidates');
      setCandidates(res.data?.candidates || []);
    } catch (err) {
      console.error('Failed to load candidates:', err);
      toast.error('Failed to load candidate directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleActionConfirm = async (reason: string) => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      if (actionTarget.type === 'SUSPEND') {
        await adminService.updateUserStatus(actionTarget.candidate.id, 'suspended', reason);
        toast.success(`Candidate ${actionTarget.candidate.email} suspended`);
      } else if (actionTarget.type === 'FORCE_LOGOUT') {
        await adminService.forceLogoutUser(actionTarget.candidate.id);
        toast.success(`Sessions invalidated for ${actionTarget.candidate.email}`);
      }
      setActionTarget(null);
      await loadCandidates();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = candidates.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.publicId?.toLowerCase().includes(q) ||
      c.education?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17171A] border border-[#2A2A2E] rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#241C16] text-[#E8672E] border border-[#E8672E]/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#F5F5F4]">Candidates Directory & Verified Passports</h2>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8672E]/20 text-[#E8672E] border border-[#E8672E]/30 font-semibold font-mono">
                  CAND-2026 Registry
                </span>
              </div>
              <p className="text-xs text-[#6B6B70] mt-0.5">
                Browse registered student and engineer credentials, verified skill scores, code assessment performance, and evidence links.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCandidates}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1E1E22] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-xs font-semibold text-[#F5F5F4] transition shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B6B70] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by candidate name, CAND-2026 ID, email, university..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#17171A] border border-[#2A2A2E] text-xs text-[#F5F5F4] placeholder-[#6B6B70] focus:outline-none focus:border-[#E8672E]"
        />
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-[#38383D] transition">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono text-[#E8672E] font-bold">{c.publicId}</span>
                  <h3 className="text-sm font-bold text-[#F5F5F4] mt-0.5">{c.name}</h3>
                  <div className="text-[11px] text-[#6B6B70]">{c.email}</div>
                </div>
                {c.avgScore ? (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#16261B] border border-[#3FB65F]/30 text-[#3FB65F] text-xs font-mono font-bold">
                    <Award className="w-3.5 h-3.5" />
                    {c.avgScore} pts
                  </div>
                ) : (
                  <span className="text-[10px] text-[#6B6B70] bg-[#1E1E22] px-2 py-0.5 rounded border border-[#2A2A2E]">Unscored</span>
                )}
              </div>

              {c.education && (
                <div className="text-[11px] text-[#A3A3A8] mt-2 line-clamp-1">
                  🎓 {c.education}
                </div>
              )}

              {/* Skills Tags */}
              <div className="mt-3 pt-3 border-t border-[#2A2A2E]">
                <span className="text-[10px] text-[#6B6B70] uppercase tracking-wider block font-semibold mb-1.5">
                  Verified Skills ({c.verifiedSkillsCount} / {c.totalSkills})
                </span>
                <div className="flex flex-wrap gap-1">
                  {c.skills?.length === 0 ? (
                    <span className="text-[11px] text-[#6B6B70] italic">No skills claimed</span>
                  ) : (
                    c.skills?.map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          s.status === 'VERIFIED'
                            ? 'bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30 font-semibold'
                            : 'bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]'
                        }`}
                      >
                        {s.name} {s.score ? `(${s.score})` : ''}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Links & Action */}
            <div className="mt-4 pt-3 border-t border-[#2A2A2E] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {c.githubUrl && (
                  <a href={c.githubUrl} title="GitHub Profile" target="_blank" rel="noreferrer" className="text-[#6B6B70] hover:text-[#F5F5F4] transition">
                    <Code2 className="w-3.5 h-3.5" />
                  </a>
                )}
                {c.linkedinUrl && (
                  <a href={c.linkedinUrl} title="LinkedIn Profile" target="_blank" rel="noreferrer" className="text-[#6B6B70] hover:text-[#F5F5F4] transition">
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
                {c.portfolioUrl && (
                  <a href={c.portfolioUrl} title="Portfolio Website" target="_blank" rel="noreferrer" className="text-[#6B6B70] hover:text-[#F5F5F4] transition">
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActionTarget({ type: 'FORCE_LOGOUT', candidate: c })}
                  title="Force logout active sessions"
                  className="p-1.5 rounded-lg bg-[#1E1E22] hover:bg-[#2A2A2E] text-[#6B6B70] hover:text-[#F5F5F4] transition"
                >
                  <LogOut className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActionTarget({ type: 'SUSPEND', candidate: c })}
                  title="Suspend candidate account"
                  className="p-1.5 rounded-lg bg-[#2A1717] hover:bg-[#3D1E1E] text-[#E0554E] transition"
                >
                  <Ban className="w-3 h-3" />
                </button>
                <a
                  href={`/verify/${c.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[#E8672E] hover:text-[#d05622] font-medium"
                >
                  Passport
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {actionTarget && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setActionTarget(null)}
          onConfirm={handleActionConfirm}
          title={actionTarget.type === 'SUSPEND' ? 'Suspend Candidate Account' : 'Force Logout Candidate'}
          description={
            actionTarget.type === 'SUSPEND'
              ? `Are you sure you want to suspend access for ${actionTarget.candidate.name}? They will lose access to all assessments and team submissions.`
              : `Invalidate all active sessions for ${actionTarget.candidate.email}? The candidate will need to sign in again.`
          }
          affectedEntity={{
            label: 'Candidate',
            value: `${actionTarget.candidate.name} (${actionTarget.candidate.email})`,
          }}
          isDestructive={actionTarget.type === 'SUSPEND'}
          isReversible={actionTarget.type !== 'SUSPEND'}
          requireReason={actionTarget.type === 'SUSPEND'}
          confirmText={actionTarget.type === 'SUSPEND' ? 'Suspend Candidate' : 'Force Logout'}
          loading={actionLoading}
        />
      )}
    </div>
  );
};
