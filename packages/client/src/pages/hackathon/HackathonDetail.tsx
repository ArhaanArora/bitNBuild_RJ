import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function HackathonDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', description: '', maxMembers: 4, requiredSkills: '' });

  useEffect(() => {
    Promise.all([api.get(`/hackathons/${id}`), api.get(`/teams/hackathon/${id}`)]).then(([h, t]) => {
      setHackathon(h.data);
      setTeams(t.data);
    }).catch(() => {});
  }, [id]);

  const createTeam = async () => {
    try {
      const { data } = await api.post('/teams', {
        hackathonId: id!,
        ...teamForm,
        requiredSkills: teamForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setTeams(prev => [...prev, data]);
      setCreating(false);
      toast.success('Team created!');
    } catch {
      toast.error('Failed to create team');
    }
  };

  if (!hackathon) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin w-8 h-8 border-2 border-[#E8672E] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Link & Header */}
      <div className="border-b border-[#2A2A2E] pb-5">
        <Link to="/hackathons" className="text-xs font-mono text-[#6B6B70] hover:text-[#A3A3A8] transition-colors inline-block mb-3">
          ← BACK TO HACKATHONS
        </Link>
        <h1 className="text-2xl font-bold text-[#F5F5F4]">{hackathon.name}</h1>
        <p className="text-sm text-[#A3A3A8] mt-1 max-w-3xl leading-relaxed">{hackathon.description}</p>
        {hackathon.requiredSkills && hackathon.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {hackathon.requiredSkills.map((s: string) => (
              <span key={s} className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Team Size', val: `Up to ${hackathon.maxTeamSize}` },
          { label: 'Participants', val: hackathon.participantCount ?? '—' },
          { label: 'Formed Teams', val: teams.length },
        ].map(s => (
          <div key={s.label} className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-4">
            <div className="text-2xl font-mono font-bold text-[#F5F5F4]">{s.val}</div>
            <div className="text-xs text-[#6B6B70] uppercase font-mono mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Teams section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#F5F5F4]">Registered Teams ({teams.length})</h2>
            <p className="text-xs text-[#6B6B70]">Browse teams seeking members or create your own</p>
          </div>
          {user?.role === 'candidate' && (
            <button onClick={() => setCreating(true)} className="btn-primary text-xs py-2 px-3.5">
              + Create Team
            </button>
          )}
        </div>

        {creating && (
          <div className="bg-[#17171A] border border-[#E8672E]/40 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#F5F5F4] uppercase tracking-wider font-mono">Create New Team</h3>
            <div>
              <label className="text-xs font-mono text-[#A3A3A8] block mb-1">TEAM NAME *</label>
              <input
                className="input text-sm w-full"
                value={teamForm.name}
                onChange={e => setTeamForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Distributed Core"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#A3A3A8] block mb-1">PROJECT CONCEPT / DESCRIPTION</label>
              <input
                className="input text-sm w-full"
                value={teamForm.description}
                onChange={e => setTeamForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief summary of what your team plans to build"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#A3A3A8] block mb-1">REQUIRED SKILLS (COMMA-SEPARATED)</label>
              <input
                className="input text-sm w-full"
                placeholder="React, PostgreSQL, PyTorch"
                value={teamForm.requiredSkills}
                onChange={e => setTeamForm(f => ({ ...f, requiredSkills: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#A3A3A8] block mb-1">MAX TEAM MEMBERS</label>
              <input
                type="number"
                className="input text-sm w-32"
                min={2}
                max={hackathon.maxTeamSize}
                value={teamForm.maxMembers}
                onChange={e => setTeamForm(f => ({ ...f, maxMembers: +e.target.value }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setCreating(false)} className="btn-ghost text-xs flex-1 py-2">
                Cancel
              </button>
              <button onClick={createTeam} className="btn-primary text-xs flex-1 py-2">
                Create Team
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {teams.map(t => (
            <div
              key={t.id}
              className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#38383D] transition-colors"
            >
              <div className="space-y-1">
                <Link to={`/teams/${t.id}`} className="font-medium text-[#F5F5F4] hover:text-[#E8672E] transition-colors">
                  {t.name}
                </Link>
                <p className="text-xs text-[#A3A3A8]">{t.description}</p>
                {t.requiredSkills && t.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {t.requiredSkills.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/teams/${t.id}/discover`} className="btn-secondary text-xs py-1.5 px-3">
                  Find Members
                </Link>
                <Link to={`/teams/${t.id}`} className="btn-ghost text-xs py-1.5 px-3">
                  View →
                </Link>
              </div>
            </div>
          ))}
          {teams.length === 0 && (
            <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl text-center py-12">
              <p className="text-[#A3A3A8] text-sm">No teams formed yet for this hackathon.</p>
              <p className="text-[#6B6B70] text-xs mt-1">Be the first to create one and recruit members.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
