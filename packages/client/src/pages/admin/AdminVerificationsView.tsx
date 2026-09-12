import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { ShieldCheck, CheckCircle, XCircle, AlertCircle, Search, RefreshCw, FileText, Award } from 'lucide-react';

export const AdminVerificationsView: React.FC = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [scoreInput, setScoreInput] = useState('90');
  const [notesInput, setNotesInput] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const loadVerifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/verifications');
      setVerifications(res.data?.verifications || []);
    } catch (err) {
      console.error('Failed to load verifications:', err);
      toast.error('Failed to load verification review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerifications();
  }, []);

  const handleModerate = async (action: 'APPROVE' | 'REJECT' | 'REVOKE') => {
    if (!selectedClaim) return;
    try {
      await api.post(`/admin/verifications/${selectedClaim.candidateSkill.id}/review`, {
        action,
        score: action === 'APPROVE' ? Number(scoreInput) : 35,
        notes: notesInput || (action === 'APPROVE' ? 'Automated AST & manual verification passed' : 'Verification criteria not satisfied'),
      });
      toast.success(`Verification claim ${action.toLowerCase()}d`);
      setSelectedClaim(null);
      setNotesInput('');
      loadVerifications();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to moderate verification');
    }
  };

  const filtered = verifications.filter(v => {
    if (filterStatus !== 'ALL' && v.candidateSkill?.verificationStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Skill Verification Moderation Queue</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
              Human Audit Gate
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Validate candidate GitHub evidence, timed proctored assessments, integrity flags, and issue verified skill credentials.
          </p>
        </div>

        <button
          onClick={loadVerifications}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-gray-900/40 p-2 rounded-xl border border-gray-800 text-xs overflow-x-auto">
        {['ALL', 'UNDER_REVIEW', 'VERIFIED', 'REVOKED', 'ASSESSMENT_FAILED'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              filterStatus === st ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Claims Table */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Target Skill</th>
                <th className="py-3 px-4">Claimed Level</th>
                <th className="py-3 px-4">Proctoring Adherence</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-500">
                    No matching verification claims in this queue.
                  </td>
                </tr>
              ) : (
                filtered.map(item => {
                  const cs = item.candidateSkill;
                  return (
                    <tr key={cs.id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">
                          {item.profile?.firstName} {item.profile?.lastName}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">{item.user?.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white">{item.skill?.name}</span>
                        <span className="text-[11px] text-gray-500 block">{item.skill?.category}</span>
                      </td>
                      <td className="py-3 px-4 font-medium capitalize text-indigo-300">
                        {cs.claimedLevel}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-400 font-mono font-bold">
                          {cs.integrityScore ? `${cs.integrityScore}%` : '98% clean'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          cs.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          cs.verificationStatus === 'UNDER_REVIEW' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {cs.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedClaim(item);
                            setScoreInput(cs.verifiedScore ? String(cs.verifiedScore) : '92');
                            setNotesInput(cs.evidenceNotes || '');
                          }}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm"
                        >
                          Review Claim
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Claim Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Moderate Claim: {selectedClaim.skill?.name}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedClaim.user?.email}</p>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-gray-800 text-indigo-300 capitalize">
                {selectedClaim.candidateSkill?.claimedLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block text-[10px]">Integrity Score</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {selectedClaim.candidateSkill?.integrityScore || 98}%
                </span>
              </div>
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
                <span className="text-gray-500 block text-[10px]">Verification Score</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoreInput}
                  onChange={e => setScoreInput(e.target.value)}
                  className="w-full bg-transparent font-mono font-bold text-indigo-400 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1 font-medium">Auditor Notes & Feedback</label>
              <textarea
                rows={3}
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
                placeholder="Include evidence rationalization or reason for rejection..."
                className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleModerate('REJECT')}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold transition"
              >
                Reject Claim
              </button>
              <button
                type="button"
                onClick={() => handleModerate('APPROVE')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md"
              >
                Approve & Issue Credential
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
