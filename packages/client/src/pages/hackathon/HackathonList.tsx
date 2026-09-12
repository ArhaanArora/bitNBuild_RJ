import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

interface Hackathon {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeamSize: number;
  requiredSkills: string[];
  participantCount: number;
}

export default function HackathonList() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [joined, setJoined] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get('/hackathons').then(r => setHackathons(r.data)).catch(() => {});
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2E] pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6B70] block mb-1">
            COMPETITIONS & CHALLENGES
          </span>
          <h1 className="text-2xl font-bold text-[#F5F5F4]">Hackathons</h1>
          <p className="text-sm text-[#A3A3A8] mt-1">
            Browse active hackathons and assemble evidence-verified teams
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/hackathons/find-teammates"
            className="btn-secondary text-xs flex items-center gap-2 py-2 px-3.5"
          >
            <span>🤝</span>
            <span>Find Teammates</span>
          </Link>
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <Link to="/organizer/hackathons/new" className="btn-primary text-xs py-2 px-3.5">
              + Create Hackathon
            </Link>
          )}
        </div>
      </div>

      {/* Hackathons List */}
      <div className="space-y-4">
        {hackathons.map(h => {
          const isJoined = joined.has(h.id);
          return (
            <div
              key={h.id}
              className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5 hover:border-[#38383D] transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <Link
                      to={`/hackathons/${h.id}`}
                      className="text-lg font-semibold text-[#F5F5F4] hover:text-[#E8672E] transition-colors inline-block"
                    >
                      {h.name}
                    </Link>
                    <p className="text-sm text-[#A3A3A8] mt-1 line-clamp-2 leading-relaxed">
                      {h.description}
                    </p>
                  </div>

                  {/* Skills required */}
                  {h.requiredSkills && h.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {h.requiredSkills.map(s => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B6B70] pt-1">
                    {h.startDate && (
                      <span className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{new Date(h.startDate).toLocaleDateString()}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span>👥</span>
                      <span>Team size: up to {h.maxTeamSize}</span>
                    </span>
                    {h.registrationDeadline && (
                      <span className="flex items-center gap-1">
                        <span>⏰</span>
                        <span>Register by {new Date(h.registrationDeadline).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 border-[#2A2A2E] pt-3 md:pt-0">
                  <button
                    onClick={() => join(h.id)}
                    disabled={isJoined}
                    className={
                      isJoined
                        ? 'px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30'
                        : 'btn-primary text-xs py-1.5 px-4'
                    }
                  >
                    {isJoined ? '✓ Registered' : 'Register Now'}
                  </button>
                  <Link
                    to={`/hackathons/${h.id}`}
                    className="text-xs text-[#6B6B70] hover:text-[#F5F5F4] transition-colors"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {hackathons.length === 0 && (
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl text-center py-16 px-4">
            <p className="text-[#A3A3A8] text-sm">No hackathons currently available.</p>
            <p className="text-[#6B6B70] text-xs mt-1">Check back soon or explore teammate matching.</p>
          </div>
        )}
      </div>
    </div>
  );
}
