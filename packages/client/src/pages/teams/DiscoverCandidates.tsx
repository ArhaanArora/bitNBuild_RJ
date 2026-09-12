import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

export default function DiscoverCandidates() {
  const { id: teamId } = useParams<{ id: string }>();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [inviting, setInviting] = useState<string | null>(null);
  const [inviteMsg, setInviteMsg] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/teams/${teamId}`), api.get(`/teams/${teamId}/discover`)])
      .then(([t, c]) => {
        setTeam(t.data);
        setCandidates(c.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [teamId]);

  const sendInvite = async (toUserId: string) => {
    try {
      await api.post('/teams/requests/invite', {
        teamId,
        toUserId,
        message: inviteMsg || 'We think you would be a great fit for our team!',
      });
      toast.success('Invitation sent!');
      setInviting(null);
      setInviteMsg('');
    } catch {
      toast.error('Failed to send invite');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin w-8 h-8 border-2 border-[#E8672E] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#2A2A2E] pb-5">
        <Link
          to={`/teams/${teamId}`}
          className="text-xs font-mono text-[#6B6B70] hover:text-[#A3A3A8] transition-colors inline-block mb-3"
        >
          ← BACK TO {team?.name?.toUpperCase() || 'TEAM'}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#F5F5F4]">Discover Candidates</h1>
            <p className="text-sm text-[#A3A3A8] mt-1">
              Ranked by verified skill match and evidence depth for your team's open slots
            </p>
          </div>
        </div>
        {team?.requiredSkills && team.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {team.requiredSkills.map((s: string) => (
              <span key={s} className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]">
                Target: {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {candidates.length === 0 ? (
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl text-center py-16 px-4">
          <p className="text-[#A3A3A8] text-sm">No matching candidates discovered for this hackathon yet.</p>
          <p className="text-[#6B6B70] text-xs mt-1">Check back as more candidates verify their skill passports.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((c, i) => (
            <div
              key={c.userId}
              className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5 hover:border-[#38383D] transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Rank indicator */}
                <div className="w-9 h-9 shrink-0 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-center font-mono font-bold text-xs text-[#F5F5F4]">
                  #{i + 1}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-base text-[#F5F5F4]">
                        {c.profile?.firstName} {c.profile?.lastName}
                      </span>
                      {c.profile?.education && (
                        <span className="text-xs text-[#6B6B70] ml-2 font-mono">
                          • {c.profile.education}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#6B6B70] uppercase">Match Score:</span>
                      <span
                        className={`text-lg font-mono font-bold ${
                          c.matchScore >= 80
                            ? 'text-[#3FB65F]'
                            : c.matchScore >= 60
                            ? 'text-[#D89A3E]'
                            : 'text-[#A3A3A8]'
                        }`}
                      >
                        {c.matchScore}%
                      </span>
                    </div>
                  </div>

                  {/* Skill breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {c.skillBreakdown?.map((s: any) => (
                      <div
                        key={s.skill}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-mono ${
                          s.matched && s.verified
                            ? 'border-[#3FB65F]/30 bg-[#16261B] text-[#3FB65F]'
                            : s.matched
                            ? 'border-[#D89A3E]/30 bg-[#2B2213] text-[#D89A3E]'
                            : 'border-[#2A2A2E] bg-[#1E1E22] text-[#6B6B70]'
                        }`}
                      >
                        <span className="font-sans font-medium text-[#F5F5F4]">{s.skill}: </span>
                        <span>
                          {s.verified && s.score ? `${s.score}% ✓` : s.matched ? 'Claimed' : '—'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Explanations */}
                  {c.explanations && c.explanations.length > 0 && (
                    <div className="space-y-1 bg-[#1E1E22]/60 p-3 rounded-lg border border-[#2A2A2E]">
                      {c.explanations.slice(0, 3).map((e: string, idx: number) => (
                        <p key={idx} className="text-xs text-[#A3A3A8] flex items-center gap-1.5">
                          <span className="text-[#3FB65F] text-[10px]">✓</span>
                          <span>{e}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  {inviting === c.userId ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        className="input text-xs flex-1 py-1.5"
                        placeholder="Add an invitation note for candidate..."
                        value={inviteMsg}
                        onChange={e => setInviteMsg(e.target.value)}
                      />
                      <button onClick={() => setInviting(null)} className="btn-ghost text-xs py-1.5 px-3">
                        Cancel
                      </button>
                      <button onClick={() => sendInvite(c.userId)} className="btn-primary text-xs py-1.5 px-4">
                        Send Invite
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        to={`/verify/${c.userId}`}
                        target="_blank"
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        View Passport
                      </Link>
                      <button
                        onClick={() => setInviting(c.userId)}
                        className="btn-primary text-xs py-1.5 px-4"
                      >
                        Invite to Team →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
