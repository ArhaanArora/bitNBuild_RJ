import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import {
  Calendar,
  Users,
  Clock,
  ChevronRight,
  Rocket,
  Search,
  Filter,
  CheckCircle2,
  Plus,
} from 'lucide-react';

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

const DEMO_HACKATHONS: Hackathon[] = [
  {
    id: 'demo-1',
    name: 'TIET Hackathon 2025',
    description: 'A 48-hour hackathon focused on sustainable technology and smart city solutions. Build innovative projects using AI, IoT, and cloud platforms.',
    startDate: '2025-03-15',
    endDate: '2025-03-17',
    registrationDeadline: '2025-03-10',
    maxTeamSize: 4,
    requiredSkills: ['React', 'Python', 'Node.js'],
    participantCount: 320,
  },
  {
    id: 'demo-2',
    name: 'Google Developer Group — DevFest',
    description: 'Build production-ready apps with Google Cloud, Firebase, and Gemini AI. Open to all skill levels. Winners get Google Cloud credits worth $5,000.',
    startDate: '2025-04-02',
    endDate: '2025-04-04',
    registrationDeadline: '2025-03-28',
    maxTeamSize: 5,
    requiredSkills: ['Flutter', 'Firebase', 'GCP'],
    participantCount: 1200,
  },
  {
    id: 'demo-3',
    name: 'Microsoft Learn Fest',
    description: 'Leverage Azure, Copilot, and Microsoft 365 APIs to solve real-world enterprise challenges. Judged by senior engineers from Microsoft India.',
    startDate: '2025-04-10',
    endDate: '2025-04-12',
    registrationDeadline: '2025-04-05',
    maxTeamSize: 3,
    requiredSkills: ['Azure', 'C#', 'TypeScript'],
    participantCount: 580,
  },
];

function SkeletonHackathon() {
  return (
    <div className="card space-y-4">
      <div className="skeleton" style={{ height: '18px', width: '200px' }} />
      <div className="skeleton" style={{ height: '13px', width: '90%' }} />
      <div className="skeleton" style={{ height: '13px', width: '75%' }} />
      <div className="flex gap-2 pt-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: '22px', width: '60px', borderRadius: '6px' }} />
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function HackathonList() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get('/hackathons')
      .then(r => setHackathons(r.data?.length ? r.data : DEMO_HACKATHONS))
      .catch(() => setHackathons(DEMO_HACKATHONS))
      .finally(() => setLoading(false));
  }, []);

  const join = async (id: string) => {
    try {
      await api.post(`/hackathons/${id}/join`);
      setJoined(prev => new Set([...prev, id]));
      toast.success('You\'re registered! 🎉');
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Could not register');
    }
  };

  const filtered = hackathons.filter(h =>
    !search ||
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.description.toLowerCase().includes(search.toLowerCase()) ||
    h.requiredSkills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 fade-in-up">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em] block mb-1"
            style={{ color: 'var(--accent)' }}
          >
            COMPETITIONS &amp; CHALLENGES
          </span>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Hackathons
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Browse active hackathons and assemble evidence-verified teams
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/hackathons/find-teammates"
            className="btn-secondary btn-sm flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Find Teammates
          </Link>
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <Link to="/organizer/hackathons/new" className="btn-primary btn-sm flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Create
            </Link>
          )}
        </div>
      </div>

      {/* ── Search & Filter bar ── */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, skill, or tech..."
            className="input pl-9 text-sm"
            aria-label="Search hackathons"
          />
        </div>
        <button className="btn-ghost btn-sm flex items-center gap-1.5" aria-label="Filter hackathons">
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* ── List ── */}
      <div className="space-y-4">
        {loading ? (
          <>
            <SkeletonHackathon />
            <SkeletonHackathon />
            <SkeletonHackathon />
          </>
        ) : filtered.length === 0 ? (
          <div
            className="card text-center py-16"
            style={{ borderStyle: 'dashed', borderColor: 'var(--border-default)' }}
          >
            <Rocket className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {search ? 'No hackathons match your search.' : 'No hackathons available right now.'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Check back soon or explore teammate matching.
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="btn-ghost btn-sm mt-4 mx-auto"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filtered.map((h, i) => {
            const isJoined = joined.has(h.id);
            const deadlineDays = daysUntil(h.registrationDeadline);
            const isUrgent = deadlineDays <= 5 && deadlineDays >= 0;
            const isPast = deadlineDays < 0;

            return (
              <div
                key={h.id}
                className="card-hover fade-in-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Content */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link
                          to={`/hackathons/${h.id}`}
                          className="text-base font-bold hover:underline decoration-dotted transition-colors"
                          style={{ color: 'var(--text-primary)', textUnderlineOffset: '3px' }}
                        >
                          {h.name}
                        </Link>
                        {isJoined && (
                          <span className="badge-success flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Registered
                          </span>
                        )}
                        {isUrgent && !isPast && (
                          <span className="badge-error">
                            ⚡ {deadlineDays}d left
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {h.description}
                      </p>
                    </div>

                    {/* Required skills */}
                    {h.requiredSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5" role="list" aria-label="Required skills">
                        {h.requiredSkills.map(skill => (
                          <span
                            key={skill}
                            className="badge-neutral font-mono"
                            role="listitem"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metadata row */}
                    <div className="flex flex-wrap items-center gap-4" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {h.startDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{formatDate(h.startDate)} – {formatDate(h.endDate)}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Teams of up to {h.maxTeamSize}</span>
                      </span>
                      {h.registrationDeadline && !isPast && (
                        <span
                          className="flex items-center gap-1.5"
                          style={{ color: isUrgent ? 'var(--error)' : 'var(--text-muted)' }}
                        >
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Register by {formatDate(h.registrationDeadline)}</span>
                        </span>
                      )}
                      {h.participantCount > 0 && (
                        <span className="flex items-center gap-1.5">
                          <span>👥</span>
                          <span>{h.participantCount.toLocaleString()} participants</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0" style={{ borderColor: 'var(--border-subtle)' }}>
                    <button
                      onClick={() => join(h.id)}
                      disabled={isJoined || isPast}
                      className={isJoined ? 'badge-success cursor-default py-2 px-3 text-xs' : 'btn-primary btn-sm'}
                      aria-label={isJoined ? `Already registered for ${h.name}` : `Register for ${h.name}`}
                    >
                      {isJoined ? '✓ Registered' : isPast ? 'Closed' : 'Register Now'}
                    </button>
                    <Link
                      to={`/hackathons/${h.id}`}
                      className="text-xs flex items-center gap-0.5 font-medium hover:gap-1.5 transition-all"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      View details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── CTA Footer ── */}
      {!loading && filtered.length > 0 && (
        <div
          className="card text-center py-6"
          style={{ borderStyle: 'dashed', borderColor: 'var(--border-default)', background: 'transparent' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Looking for the right team? Don't go it alone.
          </p>
          <Link to="/hackathons/find-teammates" className="btn-primary btn-sm mt-3 inline-flex">
            <Users className="w-3.5 h-3.5" />
            Find Verified Teammates
          </Link>
        </div>
      )}
    </div>
  );
}
