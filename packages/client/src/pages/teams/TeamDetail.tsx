import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<any>(null);

  useEffect(() => {
    api.get(`/teams/${id}`).then(r => setTeam(r.data));
  }, [id]);

  if (!team) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white">{team.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{team.description}</p>
        <div className="flex gap-2 mt-3">{(team.requiredSkills ?? []).map((s: string) => <span key={s} className="badge badge-in-progress text-xs">{s}</span>)}</div>
      </div>

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
