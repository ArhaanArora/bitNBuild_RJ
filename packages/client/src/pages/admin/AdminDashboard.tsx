import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Activity,
  Database,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Code2,
  FileText,
  Lock,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  verifiedSkills: number;
  totalTeams: number;
  totalAuditLogs: number;
  canonicalSkills: number;
}

interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details: any;
  ipAddress: string | null;
  createdAt: string;
}

interface CanonicalSkill {
  id: string;
  name: string;
  slug: string;
  category: string;
  aliases: string[];
  description: string | null;
  status: string;
  createdAt: string;
}

interface VerificationClaim {
  candidateSkill: {
    id: string;
    userId: string;
    skillId: string;
    claimedLevel: string;
    verificationStatus: string;
    verifiedScore: number | null;
    integrityScore: number | null;
    evidenceNotes: string | null;
    createdAt: string;
  };
  skill: {
    name: string;
    category: string;
  };
  user: {
    email: string;
  };
  profile: {
    firstName: string;
    lastName: string;
    education: string | null;
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'audit' | 'skills' | 'moderation'>('audit');
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [skillsList, setSkillsList] = useState<CanonicalSkill[]>([]);
  const [verifications, setVerifications] = useState<VerificationClaim[]>([]);
  const [loading, setLoading] = useState(true);

  // New Skill Modal
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming');
  const [newSkillAliases, setNewSkillAliases] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes, skillsRes, verRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/audit-logs'),
        api.get('/admin/skills'),
        api.get('/admin/verifications'),
      ]);

      setStats(statsRes.data?.stats || null);
      setLogs(logsRes.data?.logs || []);
      setSkillsList(skillsRes.data?.skills || []);
      setVerifications(verRes.data?.verifications || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Failed to connect to admin API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      const aliasesArray = newSkillAliases
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const res = await api.post('/admin/skills', {
        name: newSkillName.trim(),
        category: newSkillCategory,
        aliases: aliasesArray,
      });

      if (res.data?.success) {
        toast.success(`Canonical skill "${newSkillName}" registered!`);
        setShowAddSkill(false);
        setNewSkillName('');
        setNewSkillAliases('');
        loadData();
      }
    } catch (err) {
      console.error('Failed to add skill:', err);
      toast.error('Could not register canonical skill');
    }
  };

  const handleModerate = async (id: string, action: 'APPROVE' | 'REVOKE' | 'REJECT') => {
    try {
      const res = await api.post(`/admin/verifications/${id}/review`, {
        action,
        score: action === 'APPROVE' ? 92 : 40,
        notes: `Admin manual moderation decision: ${action}`,
      });

      if (res.data?.success) {
        toast.success(`Claim status updated to ${action}`);
        loadData();
      }
    } catch (err) {
      console.error('Moderation action failed:', err);
      toast.error('Failed to process moderation review');
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2">
            <Lock className="w-3.5 h-3.5" />
            Platform Trust & Moderation Console
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin & Audit Governance</h1>
          <p className="text-gray-400 text-sm mt-1">
            Immutable append-only audit trail, canonical skill dictionary, and verification claims moderation.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Live DB
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#0B0F1B] border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.totalUsers ?? '—'}</div>
          <p className="text-[11px] text-gray-500 mt-1">Candidates & recruiters</p>
        </div>

        <div className="bg-[#0B0F1B] border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Verified Skills</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{stats?.verifiedSkills ?? '—'}</div>
          <p className="text-[11px] text-gray-500 mt-1">Evidence-backed</p>
        </div>

        <div className="bg-[#0B0F1B] border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Active Teams</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.totalTeams ?? '—'}</div>
          <p className="text-[11px] text-gray-500 mt-1">Hackathon squads</p>
        </div>

        <div className="bg-[#0B0F1B] border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Audit Events</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{stats?.totalAuditLogs ?? '—'}</div>
          <p className="text-[11px] text-gray-500 mt-1">Append-only logs</p>
        </div>

        <div className="bg-[#0B0F1B] border border-gray-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>Canonical Skills</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">{stats?.canonicalSkills ?? '—'}</div>
          <p className="text-[11px] text-gray-500 mt-1">Aliased registry</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Append-Only Audit Trail ({logs.length})
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'skills'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Canonical Skills Registry ({skillsList.length})
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'moderation'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Verification Claims Queue ({verifications.length})
        </button>
      </div>

      {/* TAB 1: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-[#0B0F1B] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Immutable Event Ledger</h2>
                <p className="text-xs text-gray-400">All security, verification, and match mutations recorded sequentially</p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
                ● Tamper-Evident
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-900/60 text-gray-400 border-b border-gray-800 uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Entity Type</th>
                    <th className="px-6 py-3">Entity / Actor</th>
                    <th className="px-6 py-3">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-900/30 transition">
                      <td className="px-6 py-3.5 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-300 font-mono font-medium">
                        {log.entityType}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-gray-400 text-[11px]">
                        <div>ID: {log.entityId.slice(0, 8)}...</div>
                        {log.actorId && <div className="text-gray-500">Actor: {log.actorId.slice(0, 8)}...</div>}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-[11px] text-gray-400 max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Canonical Skills */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Master taxonomy preventing skill fragmentation (e.g. mapping "py" and "python3" to canonical "Python").
            </p>
            <button
              onClick={() => setShowAddSkill(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              Add Canonical Skill
            </button>
          </div>

          <div className="bg-[#0B0F1B] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-900/60 text-gray-400 border-b border-gray-800 uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Canonical Name</th>
                    <th className="px-6 py-3">Slug</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Registered Aliases</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {skillsList.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-900/30 transition">
                      <td className="px-6 py-3.5 font-semibold text-white">
                        {s.name}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-indigo-400">
                        {s.slug}
                      </td>
                      <td className="px-6 py-3.5 text-gray-400">
                        {s.category}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {((s.aliases as string[]) || []).map((alias, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-900 text-gray-300 border border-gray-800"
                            >
                              {alias}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Verification Claims Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            Candidate skill claims undergoing automated assessment or manual evidence verification.
          </p>

          <div className="bg-[#0B0F1B] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-900/60 text-gray-400 border-b border-gray-800 uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Candidate</th>
                    <th className="px-6 py-3">Skill & Level</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Scores</th>
                    <th className="px-6 py-3">Evidence Notes</th>
                    <th className="px-6 py-3 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {verifications.map((v) => {
                    const status = v.candidateSkill.verificationStatus;
                    const isVerified = status === 'VERIFIED';
                    return (
                      <tr key={v.candidateSkill.id} className="hover:bg-gray-900/30 transition">
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-white">
                            {v.profile.firstName} {v.profile.lastName}
                          </div>
                          <div className="text-gray-500 font-mono text-[11px]">{v.user.email}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-medium text-gray-200">{v.skill.name}</div>
                          <div className="text-[11px] text-gray-500 capitalize">{v.candidateSkill.claimedLevel}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              isVerified
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : status === 'REVOKED' || status === 'ASSESSMENT_FAILED'
                                ? 'bg-red-950 text-red-400 border border-red-500/30'
                                : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-xs">
                          {v.candidateSkill.verifiedScore ? (
                            <span className="text-emerald-400 font-semibold">{v.candidateSkill.verifiedScore}%</span>
                          ) : (
                            <span className="text-gray-500">Unscored</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-gray-400 max-w-xs truncate text-[11px]">
                          {v.candidateSkill.evidenceNotes || 'No specific evidence notes attached.'}
                        </td>
                        <td className="px-6 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {status !== 'VERIFIED' && (
                            <button
                              onClick={() => handleModerate(v.candidateSkill.id, 'APPROVE')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition"
                            >
                              Approve
                            </button>
                          )}
                          {status === 'VERIFIED' && (
                            <button
                              onClick={() => handleModerate(v.candidateSkill.id, 'REVOKE')}
                              className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-300 border border-red-500/30 text-[11px] font-semibold transition"
                            >
                              Revoke
                            </button>
                          )}
                          <button
                            onClick={() => handleModerate(v.candidateSkill.id, 'REJECT')}
                            className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-[11px] font-semibold transition"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
          <div className="relative w-full max-w-md bg-[#0B0F1B] rounded-2xl border border-gray-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Register Canonical Skill</h3>
            <p className="text-xs text-gray-400 mb-4">
              Add a new canonical technology to the platform's standardized dictionary.
            </p>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kubernetes, Rust, GraphQL"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Programming">Programming</option>
                  <option value="Backend">Backend</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Design">Design</option>
                  <option value="Web3">Web3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Aliases (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. k8s, kube, kubectl"
                  value={newSkillAliases}
                  onChange={(e) => setNewSkillAliases(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkill(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-lg shadow-indigo-600/20"
                >
                  Save to Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
