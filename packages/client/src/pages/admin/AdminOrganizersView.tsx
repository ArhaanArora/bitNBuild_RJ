import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { adminService } from '../../services/admin.service';
import toast from 'react-hot-toast';
import { 
  Trophy, Mail, Search, RefreshCw, CheckCircle, 
  Ban, LogOut, Calendar, ExternalLink
} from 'lucide-react';
import { ConfirmationModal } from '../../components/admin/ConfirmationModal';

export const AdminOrganizersView: React.FC = () => {
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionTarget, setActionTarget] = useState<{
    type: 'SUSPEND' | 'FORCE_LOGOUT';
    organizer: any;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadOrganizers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/organizers');
      setOrganizers(res.data?.organizers || []);
    } catch (err) {
      console.error('Failed to load organizers:', err);
      toast.error('Failed to load hackathon organizers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizers();
  }, []);

  const handleActionConfirm = async (reason: string) => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      if (actionTarget.type === 'SUSPEND') {
        await adminService.updateUserStatus(actionTarget.organizer.id, 'suspended', reason);
        toast.success(`Organizer ${actionTarget.organizer.email} suspended`);
      } else if (actionTarget.type === 'FORCE_LOGOUT') {
        await adminService.forceLogoutUser(actionTarget.organizer.id);
        toast.success(`Sessions invalidated for ${actionTarget.organizer.email}`);
      }
      setActionTarget(null);
      await loadOrganizers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = organizers.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.email?.toLowerCase().includes(search.toLowerCase()) ||
    o.publicId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17171A] border border-[#2A2A2E] rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#26200E] text-[#D89A3E] border border-[#D89A3E]/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#F5F5F4]">Hackathon Organizers & Hosts</h2>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D89A3E]/20 text-[#D89A3E] border border-[#D89A3E]/30 font-semibold font-mono">
                  ORGN-2026 Registry
                </span>
              </div>
              <p className="text-xs text-[#6B6B70] mt-0.5">
                Manage authorized campus, university, and community hackathon organizers and hosted competitions.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadOrganizers}
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
          placeholder="Search organizers by name, ORGN-2026 ID, email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#17171A] border border-[#2A2A2E] text-xs text-[#F5F5F4] placeholder-[#6B6B70] focus:outline-none focus:border-[#D89A3E]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(o => (
          <div key={o.id} className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-[#38383D] transition">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono text-[#D89A3E] font-bold">{o.publicId}</span>
                  <h3 className="text-sm font-bold text-[#F5F5F4] mt-0.5">{o.name}</h3>
                  <div className="text-[11px] text-[#6B6B70] flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-[#6B6B70]" />
                    {o.email}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30">
                  Verified Host
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2A2A2E]">
                <span className="text-[10px] text-[#6B6B70] uppercase tracking-wider block font-semibold mb-1.5">
                  Hosted Hackathons ({o.hackathonsCount})
                </span>
                <div className="space-y-1">
                  {o.hackathons?.length === 0 ? (
                    <span className="text-[11px] text-[#6B6B70] italic">No events created yet</span>
                  ) : (
                    o.hackathons?.map((h: any) => (
                      <div key={h.id} className="text-[11px] text-[#A3A3A8] flex items-center justify-between p-2 rounded-lg bg-[#111113] border border-[#2A2A2E]">
                        <span className="truncate max-w-[180px]">{h.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          h.isPublished
                            ? 'bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30'
                            : 'bg-[#1E1E22] text-[#6B6B70] border border-[#2A2A2E]'
                        }`}>
                          {h.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#2A2A2E] flex items-center justify-between">
              <span className="text-[10px] text-[#6B6B70]">
                Registered {new Date(o.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActionTarget({ type: 'FORCE_LOGOUT', organizer: o })}
                  title="Force logout active sessions"
                  className="p-1.5 rounded-lg bg-[#1E1E22] hover:bg-[#2A2A2E] text-[#6B6B70] hover:text-[#F5F5F4] transition"
                >
                  <LogOut className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActionTarget({ type: 'SUSPEND', organizer: o })}
                  title="Suspend organizer account"
                  className="p-1.5 rounded-lg bg-[#2A1717] hover:bg-[#3D1E1E] text-[#E0554E] transition"
                >
                  <Ban className="w-3 h-3" />
                </button>
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
          title={actionTarget.type === 'SUSPEND' ? 'Suspend Organizer Account' : 'Force Logout Organizer'}
          description={
            actionTarget.type === 'SUSPEND'
              ? `Are you sure you want to suspend hosting privileges for ${actionTarget.organizer.name}? Any ongoing hackathons will have publishing disabled.`
              : `Invalidate all active sessions for ${actionTarget.organizer.email}? The organizer will need to sign in again.`
          }
          affectedEntity={{
            label: 'Organizer',
            value: `${actionTarget.organizer.name} (${actionTarget.organizer.email})`,
          }}
          isDestructive={actionTarget.type === 'SUSPEND'}
          isReversible={actionTarget.type !== 'SUSPEND'}
          requireReason={actionTarget.type === 'SUSPEND'}
          confirmText={actionTarget.type === 'SUSPEND' ? 'Suspend Organizer' : 'Force Logout'}
          loading={actionLoading}
        />
      )}
    </div>
  );
};
