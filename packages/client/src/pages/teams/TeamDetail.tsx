import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import TeamGraphScene from '../../scenes/TeamGraphScene';
import AccessibleViewToggle from '../../scenes/AccessibleViewToggle';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<any>(null);
  const [is3D, setIs3D] = useState(true);

  useEffect(() => {
    api.get(`/teams/${id}`).then(r => setTeam(r.data));
  }, [id]);

  if (!team) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>;

  const teamNodes = [
    ...(team.members || []).map((m: any, idx: number) => ({
      name: m.profile?.firstName ? `${m.profile.firstName} ${m.profile.lastName}` : (m.role || `Member ${idx + 1}`),
      role: m.role || 'Contributor',
      skills: m.skills || ['Full-Stack', 'TypeScript'],
      color: idx === 0 ? '#10B981' : '#6366F1',
      pos: [idx === 0 ? -2 : 2, 0, 0] as [number, number, number],
    })),
    ...(team.members?.length < team.maxMembers ? [{
      name: 'Role Gap',
      role: team.requiredSkills?.[0] ? `${team.requiredSkills[0]} Specialist` : 'Open Skill Slot',
      skills: team.requiredSkills || ['Frontend', 'Backend'],
      color: '#F43F5E',
      pos: [0, 1.8, 0] as [number, number, number],
    }] : [])
  ];

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{team.name}</h1>
          <p className="text-gray-400 text-sm mt-1">{team.description}</p>
          <div className="flex gap-2 mt-3">{(team.requiredSkills ?? []).map((s: string) => <span key={s} className="badge badge-in-progress text-xs">{s}</span>)}</div>
        </div>
        <AccessibleViewToggle is3D={is3D} onToggle={() => setIs3D(!is3D)} />
      </div>

      {is3D && (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">3D Spatial Team Topology & Skill Coverage</div>
          <TeamGraphScene members={teamNodes.length ? teamNodes : undefined} />
        </div>
      )}

      <div className="card">
        <h2 className="section-title">Members ({team.members?.length ?? 0}/{team.maxMembers})</h2>
        {team.members?.map((m: any) => (
          <div key={m.userId} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
            <span className="text-sm text-gray-200">{m.userId}</span>
            <span className="badge badge-unverified text-xs">{m.role ?? 'Member'}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link to={`/teams/${id}/discover`} className="btn-primary">Find Members →</Link>
      </div>
    </div>
  );
}
