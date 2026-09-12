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
    api.get(`/teams/${id}`).then(r => setTeam(r.data)).catch(() => {});
  }, [id]);

  if (!team) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin w-8 h-8 border-2 border-[#E8672E] border-t-transparent rounded-full" />
      </div>
    );
  }

  const teamNodes = [
    ...(team.members || []).map((m: any, idx: number) => ({
      name: m.profile?.firstName ? `${m.profile.firstName} ${m.profile.lastName}` : (m.role || `Member ${idx + 1}`),
      role: m.role || 'Contributor',
      skills: m.skills || ['Full-Stack', 'TypeScript'],
      color: idx === 0 ? '#3FB65F' : '#E8672E',
      pos: [idx === 0 ? -2 : 2, 0, 0] as [number, number, number],
    })),
    ...(team.members?.length < team.maxMembers ? [{
      name: 'Role Gap',
      role: team.requiredSkills?.[0] ? `${team.requiredSkills[0]} Specialist` : 'Open Skill Slot',
      skills: team.requiredSkills || ['Frontend', 'Backend'],
      color: '#E0554E',
      pos: [0, 1.8, 0] as [number, number, number],
    }] : [])
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2E] pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6B70] block mb-1">
            TEAM PROFILE & SKILL TOPOLOGY
          </span>
          <h1 className="text-2xl font-bold text-[#F5F5F4]">{team.name}</h1>
          <p className="text-sm text-[#A3A3A8] mt-1">{team.description}</p>
          {team.requiredSkills && team.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {team.requiredSkills.map((s: string) => (
                <span key={s} className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <AccessibleViewToggle is3D={is3D} onToggle={() => setIs3D(!is3D)} />
      </div>

      {is3D && (
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-[#E8672E]">
            3D Spatial Team Topology & Skill Coverage
          </div>
          <div className="rounded-xl overflow-hidden border border-[#2A2A2E] bg-[#17171A]">
            <TeamGraphScene members={teamNodes.length ? teamNodes : undefined} />
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5">
        <h2 className="text-sm font-mono uppercase text-[#F5F5F4] mb-4">
          Members ({team.members?.length ?? 0}/{team.maxMembers})
        </h2>
        <div className="divide-y divide-[#2A2A2E]">
          {team.members?.map((m: any) => (
            <div key={m.userId} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-[#F5F5F4]">{m.userId}</span>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]">
                {m.role ?? 'Member'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Link to={`/teams/${id}/discover`} className="btn-primary text-xs py-2.5 px-5">
          Find Matching Members →
        </Link>
      </div>
    </div>
  );
}
