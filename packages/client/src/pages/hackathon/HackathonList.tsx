import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

interface Hackathon { id: string; name: string; description: string; startDate: string; endDate: string; registrationDeadline: string; maxTeamSize: number; requiredSkills: string[]; participantCount: number; }

export default function HackathonList() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [joined, setJoined] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get('/hackathons').then(r => setHackathons(r.data));
  }, []);

  const join = async (id: string) => {
    try {
      await api.post(`/hackathons/${id}/join`);
      setJoined(prev => new Set([...prev, id]));
      toast.success('Joined hackathon!');
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Could not join');
    }
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Hackathons</h1>
          <p className="text-gray-400 text-sm mt-1">Browse active hackathons and assemble evidence-verified teams</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/hackathons/find-teammates" className="btn-accent text-xs flex items-center gap-1.5">
            <span>🤝 Find Teammates</span>
          </Link>
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <Link to="/organizer/hackathons/new" className="btn-primary text-xs">+ Create</Link>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {hackathons.map(h => (
          <div key={h.id} className="card-hover">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Link to={`/hackathons/${h.id}`} className="text-lg font-semibold text-white hover:text-indigo-300">{h.name}</Link>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{h.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(h.requiredSkills ?? []).map(s => <span key={s} className="badge badge-in-progress text-xs">{s}</span>)}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  {h.startDate && <span>📅 {new Date(h.startDate).toLocaleDateString()}</span>}
                  <span>👥 Team size: {h.maxTeamSize}</span>
                  {h.registrationDeadline && <span>⏰ Register by {new Date(h.registrationDeadline).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <button
                  onClick={() => join(h.id)}
                  disabled={joined.has(h.id)}
                  className={joined.has(h.id) ? 'badge-verified text-xs px-3 py-1.5 rounded-lg' : 'btn-accent btn-sm'}
                >
                  {joined.has(h.id) ? '✓ Joined' : 'Join'}
                </button>
                <Link to={`/hackathons/${h.id}`} className="text-xs text-gray-500 hover:text-gray-300">View details →</Link>
              </div>
            </div>
          </div>
        ))}
        {hackathons.length === 0 && (
          <div className="card text-center py-12"><p className="text-gray-500">No hackathons available yet.</p></div>
        )}
      </div>
    </div>
  );
}
