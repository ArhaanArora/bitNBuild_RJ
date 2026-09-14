import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import {
  Shield, Key, Clock, Laptop, AlertTriangle, RefreshCw,
  LogOut, CheckCircle2, XCircle, UserCheck, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '../../components/admin/ConfirmationModal';

export const AdminSessionsView: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [revokingSession, setRevokingSession] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'SUCCESS' | 'FAILED' | 'REVOKED'>('ALL');

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAdminSessions();
      setSessions(res.sessions || []);
      if ((res as any).loginHistory) {
        setLoginHistory((res as any).loginHistory);
      }
    } catch (err) {
      console.error('Failed to load admin sessions:', err);
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevokeConfirm = async (reason: string) => {
    if (!revokingSession) return;
    setActionLoading(true);
    try {
      await adminService.revokeAdminSession(revokingSession.id);
      toast.success(`Session for ${revokingSession.email} revoked`);
      setRevokingSession(null);
      await loadSessions();
    } catch (err) {
      console.error('Failed to revoke session:', err);
      toast.error('Failed to revoke session');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredHistory = loginHistory.filter((log) => {
    if (filterType === 'SUCCESS') return log.action === 'ADMIN_LOGIN_SUCCESS';
    if (filterType === 'FAILED') return log.action === 'ADMIN_LOGIN_FAILED';
    if (filterType === 'REVOKED') return log.action === 'ADMIN_SESSION_REVOKED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17171A] border border-[#2A2A2E] rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#241C16] text-[#E8672E] border border-[#E8672E]/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F5F5F4] font-mono">
                Admin Sessions & Access Governance
              </h2>
              <p className="text-xs text-[#6B6B70] mt-0.5 font-mono">
                Real-time active tokens, perimeter access logs, and forced session termination controls
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadSessions}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1E1E22] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-xs font-mono text-[#F5F5F4] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Security Posture Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-4 font-mono">
          <div className="flex items-center justify-between text-[11px] text-[#6B6B70] uppercase">
            <span>Active Sessions</span>
            <UserCheck className="w-4 h-4 text-[#3FB65F]" />
          </div>
          <div className="text-2xl font-bold text-[#F5F5F4] mt-2">
            {sessions.length}
          </div>
          <div className="text-[11px] text-[#3FB65F] mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3FB65F] animate-pulse" />
            Active across platform
          </div>
        </div>

        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-4 font-mono">
          <div className="flex items-center justify-between text-[11px] text-[#6B6B70] uppercase">
            <span>Hard Session TTL</span>
            <Clock className="w-4 h-4 text-[#E8672E]" />
          </div>
          <div className="text-2xl font-bold text-[#F5F5F4] mt-2">
            8.0 Hours
          </div>
          <div className="text-[11px] text-[#A3A3A8] mt-1">
            JWT signature hard cutoff
          </div>
        </div>

        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-4 font-mono">
          <div className="flex items-center justify-between text-[11px] text-[#6B6B70] uppercase">
            <span>Perimeter Auth</span>
            <Shield className="w-4 h-4 text-[#3FB65F]" />
          </div>
          <div className="text-2xl font-bold text-[#F5F5F4] mt-2">
            Bcrypt + JWT
          </div>
          <div className="text-[11px] text-[#3FB65F] mt-1">
            HMAC-SHA256 Signed
          </div>
        </div>

        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-4 font-mono">
          <div className="flex items-center justify-between text-[11px] text-[#6B6B70] uppercase">
            <span>Failed Logins (24h)</span>
            <AlertTriangle className="w-4 h-4 text-[#E0554E]" />
          </div>
          <div className="text-2xl font-bold text-[#F5F5F4] mt-2">
            {loginHistory.filter((l) => l.action === 'ADMIN_LOGIN_FAILED').length}
          </div>
          <div className="text-[11px] text-[#A3A3A8] mt-1">
            Monitored by rate-limiter
          </div>
        </div>
      </div>

      {/* Active Admin Sessions Table */}
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#2A2A2E] flex items-center justify-between bg-[#111113]">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-[#E8672E]" />
            <h3 className="text-xs font-bold text-[#F5F5F4] uppercase font-mono tracking-wider">
              Currently Authenticated Admin Sessions
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]">
              {sessions.length} Live
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#2A2A2E] bg-[#141416] text-[#6B6B70]">
                <th className="py-3 px-4 font-medium">ADMIN / IDENTITY</th>
                <th className="py-3 px-4 font-medium">TIER / ROLE</th>
                <th className="py-3 px-4 font-medium">IP & CLIENT</th>
                <th className="py-3 px-4 font-medium">SESSION OPENED</th>
                <th className="py-3 px-4 font-medium">HARD EXPIRY</th>
                <th className="py-3 px-4 font-medium">STATUS</th>
                <th className="py-3 px-4 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2E]">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B6B70]">
                    No active sessions found in this window.
                  </td>
                </tr>
              ) : (
                sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-[#1E1E22]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#F5F5F4]">{sess.name}</div>
                      <div className="text-[11px] text-[#6B6B70]">{sess.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#241C16] text-[#E8672E] border border-[#E8672E]/30 uppercase font-semibold">
                        {sess.adminRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#F5F5F4]">{sess.ipAddress}</div>
                      <div className="text-[10px] text-[#6B6B70] truncate max-w-[180px]">
                        {sess.userAgent}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#A3A3A8]">
                      {sess.loginTime ? new Date(sess.loginTime).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 text-[#A3A3A8]">
                      {sess.expiresAt ? new Date(sess.expiresAt).toLocaleTimeString() : '8h TTL'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3FB65F] animate-pulse" />
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setRevokingSession(sess)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2A1717] hover:bg-[#3D1E1E] text-[#E0554E] border border-[#E0554E]/30 text-[11px] font-mono transition"
                      >
                        <LogOut className="w-3 h-3" />
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Access History & Audit Log */}
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#2A2A2E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111113]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#A3A3A8]" />
            <h3 className="text-xs font-bold text-[#F5F5F4] uppercase font-mono tracking-wider">
              Authentication Perimeter Trail
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {(['ALL', 'SUCCESS', 'FAILED', 'REVOKED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition ${
                  filterType === filter
                    ? 'bg-[#E8672E] text-white font-bold'
                    : 'bg-[#1E1E22] text-[#A3A3A8] hover:text-[#F5F5F4] border border-[#2A2A2E]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#2A2A2E] bg-[#141416] text-[#6B6B70]">
                <th className="py-3 px-4 font-medium">EVENT TYPE</th>
                <th className="py-3 px-4 font-medium">ACTOR EMAIL</th>
                <th className="py-3 px-4 font-medium">ROLE TIER</th>
                <th className="py-3 px-4 font-medium">IP ADDRESS</th>
                <th className="py-3 px-4 font-medium">REASON / NOTES</th>
                <th className="py-3 px-4 font-medium text-right">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2E]">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#6B6B70]">
                    No security events recorded in this filter view.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-[#1E1E22]/40 transition-colors">
                    <td className="py-3 px-4">
                      {log.action === 'ADMIN_LOGIN_SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          LOGIN_SUCCESS
                        </span>
                      ) : log.action === 'ADMIN_LOGIN_FAILED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#2A1717] text-[#E0554E] border border-[#E0554E]/30 font-semibold">
                          <XCircle className="w-3 h-3" />
                          LOGIN_FAILED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#26200E] text-[#D89A3E] border border-[#D89A3E]/30 font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          {log.action}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#F5F5F4]">
                      {log.actorEmail || 'anonymous'}
                    </td>
                    <td className="py-3 px-4 text-[#A3A3A8]">
                      {log.actorRole || 'n/a'}
                    </td>
                    <td className="py-3 px-4 text-[#6B6B70]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-[#A3A3A8] max-w-[240px] truncate">
                      {log.reason || 'Normal perimeter handshake'}
                    </td>
                    <td className="py-3 px-4 text-right text-[#6B6B70]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Confirmation Modal */}
      {revokingSession && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setRevokingSession(null)}
          onConfirm={handleRevokeConfirm}
          title="Revoke Admin Session"
          description={`Are you sure you want to forcibly terminate the session for ${revokingSession.name} (${revokingSession.email})? The admin will be immediately disconnected and must re-authenticate.`}
          affectedEntity={{
            label: 'Target Admin',
            value: `${revokingSession.email} [${revokingSession.ipAddress}]`,
          }}
          isDestructive={true}
          isReversible={false}
          requireReason={true}
          confirmText="Forcibly Revoke Session"
          loading={actionLoading}
        />
      )}
    </div>
  );
};
