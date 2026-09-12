import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import VerifyProjectModal from '../verify/VerifyProjectModal';
import HeroConstellation from '../../scenes/HeroConstellation';
import { ShieldCheck, Sparkles, ArrowRight, Compass, Users } from 'lucide-react';

interface CandidateSkill { id: string; skillName: string; verificationStatus: string; verifiedScore: number | null; integrityScore: number | null; }
interface Session { id: string; status: string; technicalScore: number | null; submittedAt: string; }
interface Hackathon { id: string; name: string; }
interface Request { id: string; teamId: string; direction: string; status: string; message: string; }

function ScoreBadge({ score, label }: { score: number | null; label: string }) {
  const color = !score ? 'bg-gray-700' : score >= 80 ? 'bg-emerald-600' : score >= 60 ? 'bg-amber-600' : 'bg-red-600';
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
      <span className="text-sm text-gray-300">{label}</span>
      <div className={`text-sm font-bold text-white px-2.5 py-0.5 rounded-full ${color}`}>
        {score !== null ? `${score}/100` : '—'}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [requests, setRequests] = useState<{ incoming: Request[]; outgoing: Request[] }>({ incoming: [], outgoing: [] });
  const [assessments, setAssessments] = useState<{ id: string; title: string }[]>([]);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [sk, sess, hk, req, ass] = await Promise.allSettled([
          api.get('/skills/mine'),
          api.get('/sessions/my').catch(() => ({ data: [] })),
          api.get('/hackathons'),
          api.get('/teams/requests/mine').catch(() => ({ data: { incoming: [], outgoing: [] } })),
          api.get('/assessments'),
        ]);
        if (sk.status === 'fulfilled') setSkills(sk.value.data);
        if (sess.status === 'fulfilled') setSessions((sess.value as any).data);
        if (hk.status === 'fulfilled') setHackathons(hk.value.data.slice(0, 3));
        if (req.status === 'fulfilled') setRequests((req.value as any).data);
        if (ass.status === 'fulfilled') setAssessments(ass.value.data);
      } catch { toast.error('Failed to load dashboard'); }
    };
    load();
  }, []);

  const startAssessment = async (assessmentId: string, skillId?: string) => {
    try {
      const { data } = await api.post('/sessions/start', { assessmentId, candidateSkillId: skillId });
      navigate(`/assessment/${data.sessionId}`);
    } catch { toast.error('Could not start assessment'); }
  };

  const verified = skills.filter(s => s.verificationStatus === 'VERIFIED');
  const unverified = skills.filter(s => s.verificationStatus === 'UNVERIFIED');

  return (
    <div className="space-y-8 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.firstName}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/hackathons/find-teammates"
            className="btn-accent flex items-center gap-2 text-xs"
          >
            <Users className="w-4 h-4" />
            <span>Find Teammates</span>
          </Link>
          <button
            type="button"
            onClick={() => setVerifyModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Project (3D)</span>
          </button>
        </div>
      </div>

      {/* 3D AI Project Intelligence Spotlight */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#070b16] via-[#0d1527] to-[#0a1122] border border-indigo-900/50 p-6 md:p-8 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> 12-Agent Verification & 3D Spatial Intelligence
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              AI Project Verification & Trust Constellation
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Verify any GitHub repository, ZIP archive, or deployed application through our deterministic 12-agent verification pipeline. Inspect code quality, AI-assistance markers, security vulnerabilities, and authorship provenance in an explorable 3D WebGL universe.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVerifyModalOpen(true)}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 shadow-lg shadow-indigo-500/25"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Verify Project</span>
              </button>
              <Link
                to="/analysis/report"
                className="btn-ghost flex items-center gap-2 px-4 py-2.5 border-gray-700 hover:border-indigo-500 text-gray-200"
              >
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Explore 3D Constellation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 h-[260px] relative rounded-xl overflow-hidden border border-indigo-950/60 shadow-inner">
            <HeroConstellation className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Pending team requests */}
      {requests.incoming.length > 0 && (
        <div className="card border-amber-700/50 bg-amber-900/10">
          <h2 className="section-title text-amber-400">⚡ Team Invitations ({requests.incoming.length})</h2>
          {requests.incoming.map(r => (
            <div key={r.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
              <div>
                <p className="text-sm text-gray-200">{r.message}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.direction === 'invite' ? 'Team invitation' : 'Join request'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={async () => { await api.patch(`/teams/requests/${r.id}/respond`, { action: 'accept' }); toast.success('Joined team!'); setRequests(prev => ({ ...prev, incoming: prev.incoming.filter(x => x.id !== r.id) })); }} className="btn-accent btn-sm">Accept</button>
                <button onClick={async () => { await api.patch(`/teams/requests/${r.id}/respond`, { action: 'reject' }); setRequests(prev => ({ ...prev, incoming: prev.incoming.filter(x => x.id !== r.id) })); }} className="btn-ghost btn-sm">Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verified Skills */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Verified Skills</h2>
            <Link to="/skills" className="text-xs text-indigo-400 hover:text-indigo-300">Manage →</Link>
          </div>
          {verified.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No verified skills yet</p>
              <Link to="/skills" className="btn-primary btn-sm mt-3 inline-flex">Add & verify skills</Link>
            </div>
          ) : (
            <div>
              {verified.map(s => <ScoreBadge key={s.id} score={s.verifiedScore} label={s.skillName} />)}
            </div>
          )}
          {unverified.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-3">Unverified claims — start a verification</p>
              {unverified.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-400">{s.skillName}</span>
                  <button
                    onClick={() => assessments[0] && startAssessment(assessments[0].id, s.id)}
                    className="btn-ghost btn-sm text-indigo-400 border-indigo-700"
                  >Verify →</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="card text-center">
            <div className="text-4xl font-bold text-emerald-400">{verified.length}</div>
            <p className="text-gray-400 text-sm mt-1">Verified Skills</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-indigo-400">{sessions.length}</div>
            <p className="text-gray-400 text-sm mt-1">Assessments Taken</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-amber-400">{hackathons.length}</div>
            <p className="text-gray-400 text-sm mt-1">Hackathons</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: '🤝 Find Teammate', to: '/hackathons/find-teammates', color: 'border-emerald-600 hover:border-emerald-400 bg-emerald-950/20' },
          { label: 'Claim a skill', to: '/skills', color: 'border-indigo-700 hover:border-indigo-500' },
          { label: 'Add project', to: '/projects', color: 'border-purple-700 hover:border-purple-500' },
          { label: 'Browse hackathons', to: '/hackathons', color: 'border-emerald-700 hover:border-emerald-500' },
          { label: 'Edit profile', to: '/profile', color: 'border-gray-600 hover:border-gray-500' },
        ].map(a => (
          <Link key={a.label} to={a.to} className={`card-hover flex items-center justify-center text-center p-4 ${a.color} h-20`}>
            <span className="text-sm font-medium text-gray-200">{a.label}</span>
          </Link>
        ))}
      </div>

      <VerifyProjectModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
      />
    </div>
  );
}
