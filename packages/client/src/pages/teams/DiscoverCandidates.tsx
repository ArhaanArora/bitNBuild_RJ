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
    Promise.all([api.get(`/teams/${teamId}`), api.get(`/teams/${teamId}/discover`)]).then(([t, c]) => {
      setTeam(t.data); setCandidates(c.data); setLoading(false);
    }).catch(() => setLoading(false));
  }, [teamId]);

  const sendInvite = async (toUserId: string) => {
    try {
      await api.post('/teams/requests/invite', { teamId, toUserId, message: inviteMsg || 'We think you would be a great fit for our team!' });
      toast.success('Invitation sent!'); setInviting(null); setInviteMsg('');
    } catch { toast.error('Failed to send invite'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <Link to={`/teams/${teamId}`} className="text-gray-500 hover:text-gray-300 text-sm">← {team?.name}</Link>
        <h1 className="text-2xl font-bold text-white mt-2">Discover Candidates</h1>
        <p className="text-gray-400 text-sm mt-1">Ranked by verified skill match for your team's needs</p>
        {team && <div className="flex gap-2 mt-2">{(team.requiredSkills ?? []).map((s: string) => <span key={s} className="badge badge-in-progress text-xs">{s}</span>)}</div>}
      </div>

      {candidates.length === 0 ? (
        <div className="card text-center py-12"><p className="text-gray-500">No candidates found for this hackathon yet.</p></div>
      ) : (
        <div className="space-y-4">
          {candidates.map((c, i) => (
            <div key={c.userId} className="card-hover">
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-gray-700 text-gray-300'}`}>
                  #{i + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-white">{c.profile?.firstName} {c.profile?.lastName}</span>
                      <span className="text-xs text-gray-500 ml-2">{c.profile?.education}</span>
                    </div>
                    <div className={`text-2xl font-bold ${c.matchScore >= 80 ? 'text-emerald-400' : c.matchScore >= 60 ? 'text-amber-400' : 'text-gray-400'}`}>
                      {c.matchScore}%
                    </div>
                  </div>

                  {/* Skill breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {c.skillBreakdown?.map((s: any) => (
                      <div key={s.skill} className={`text-xs px-2 py-1.5 rounded-lg border ${s.matched && s.verified ? 'border-emerald-700 bg-emerald-900/20 text-emerald-400' : s.matched ? 'border-amber-700 bg-amber-900/10 text-amber-400' : 'border-gray-700 text-gray-600'}`}>
                        {s.skill}: {s.verified && s.score ? `${s.score}/100 ✓` : s.matched ? 'Claimed' : '—'}
                      </div>
                    ))}
                  </div>

                  {/* Explanations */}
                  <div className="space-y-0.5 mb-3">
                    {c.explanations?.slice(0, 3).map((e: string, idx: number) => (
                      <p key={idx} className="text-xs text-gray-400">{e}</p>
                    ))}
                  </div>

                  {/* Actions */}
                  {inviting === c.userId ? (
                    <div className="flex gap-2">
                      <input className="input text-sm flex-1" placeholder="Add a message…" value={inviteMsg} onChange={e => setInviteMsg(e.target.value)} />
                      <button onClick={() => setInviting(null)} className="btn-ghost btn-sm">Cancel</button>
                      <button onClick={() => sendInvite(c.userId)} className="btn-accent btn-sm">Send</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Link to={`/verify/${c.userId}`} target="_blank" className="btn-ghost btn-sm">View Profile</Link>
                      <button onClick={() => setInviting(c.userId)} className="btn-primary btn-sm">Invite →</button>
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
