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
      setHackathon(h.data); setTeams(t.data);
    });
  }, [id]);

  const createTeam = async () => {
    try {
      const { data } = await api.post('/teams', {
        hackathonId: id!, ...teamForm,
        requiredSkills: teamForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setTeams(prev => [...prev, data]);
      setCreating(false); toast.success('Team created!');
    } catch { toast.error('Failed to create team'); }
  };

  if (!hackathon) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <Link to="/hackathons" className="text-gray-500 hover:text-gray-300 text-sm">← Hackathons</Link>
        <h1 className="text-2xl font-bold text-white mt-2">{hackathon.name}</h1>
        <p className="text-gray-400 mt-1">{hackathon.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {(hackathon.requiredSkills ?? []).map((s: string) => <span key={s} className="badge badge-in-progress">{s}</span>)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: 'Team size', val: `up to ${hackathon.maxTeamSize}` },
          { label: 'Participants', val: hackathon.participantCount ?? '—' },
          { label: 'Teams', val: teams.length },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="text-2xl font-bold text-white">{s.val}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Teams */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Teams ({teams.length})</h2>
          {user?.role === 'candidate' && <button onClick={() => setCreating(true)} className="btn-accent btn-sm">+ Create Team</button>}
        </div>

        {creating && (
          <div className="card border-emerald-700/50 mb-4 space-y-3">
            <h3 className="section-title">Create Team</h3>
            <div><label className="label">Team name *</label><input className="input" value={teamForm.name} onChange={e => setTeamForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="label">Description</label><input className="input" value={teamForm.description} onChange={e => setTeamForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><label className="label">Required skills (comma-separated)</label><input className="input" placeholder="React, Django, Python" value={teamForm.requiredSkills} onChange={e => setTeamForm(f => ({ ...f, requiredSkills: e.target.value }))} /></div>
            <div><label className="label">Max members</label><input type="number" className="input" min={2} max={hackathon.maxTeamSize} value={teamForm.maxMembers} onChange={e => setTeamForm(f => ({ ...f, maxMembers: +e.target.value }))} /></div>
            <div className="flex gap-3"><button onClick={() => setCreating(false)} className="btn-ghost flex-1">Cancel</button><button onClick={createTeam} className="btn-accent flex-1">Create</button></div>
          </div>
        )}

        <div className="space-y-3">
          {teams.map(t => (
            <div key={t.id} className="card-hover flex items-center justify-between">
              <div>
                <Link to={`/teams/${t.id}`} className="font-medium text-white hover:text-indigo-300">{t.name}</Link>
                <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                <div className="flex gap-1.5 mt-2">{(t.requiredSkills ?? []).map((s: string) => <span key={s} className="badge badge-unverified text-xs">{s}</span>)}</div>
              </div>
              <div className="flex gap-2">
                <Link to={`/teams/${t.id}/discover`} className="btn-ghost btn-sm text-indigo-400">Find members</Link>
                <Link to={`/teams/${t.id}`} className="btn-ghost btn-sm">View →</Link>
              </div>
            </div>
          ))}
          {teams.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No teams yet. Be the first to create one.</p>}
        </div>
      </div>
    </div>
  );
}
