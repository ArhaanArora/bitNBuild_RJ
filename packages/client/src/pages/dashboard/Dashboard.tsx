import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import VerificationBadge from '../../components/common/VerificationBadge';
import CredibilityDisplay from '../../components/common/CredibilityDisplay';
import VerifyProjectModal from '../verify/VerifyProjectModal';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Users,
  Upload,
  Calendar,
  MapPin,
  ExternalLink,
  TrendingUp,
  Zap,
  ShieldCheck,
  Rocket,
  Award,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface CandidateSkill {
  id: string;
  skillName: string;
  verificationStatus: string;
  verifiedScore: number | null;
  integrityScore: number | null;
  level?: string;
}

interface HackathonItem {
  id: string;
  name: string;
  badgeLetter: string;
  badgeColor: string;
  dates: string;
  location: string;
  spots?: number;
}

const DEFAULT_SKILLS: CandidateSkill[] = [
  { id: '1', skillName: 'Python',    verificationStatus: 'VERIFIED',          verifiedScore: 95, integrityScore: 98, level: 'Advanced' },
  { id: '2', skillName: 'React',     verificationStatus: 'VERIFIED',          verifiedScore: 92, integrityScore: 96, level: 'Intermediate' },
  { id: '3', skillName: 'SQL',       verificationStatus: 'VERIFIED',          verifiedScore: 90, integrityScore: 94, level: 'Intermediate' },
  { id: '4', skillName: 'Git',       verificationStatus: 'VERIFIED',          verifiedScore: 88, integrityScore: 92, level: 'Intermediate' },
  { id: '5', skillName: 'UI/UX',    verificationStatus: 'PARTIALLY_VERIFIED', verifiedScore: 82, integrityScore: 88, level: 'Intermediate' },
];

const UPCOMING_OPPORTUNITIES: HackathonItem[] = [
  { id: 'opp-1', name: 'TIET Hackathon 2025',     badgeLetter: 'T', badgeColor: 'var(--accent)',   dates: 'Mar 15–17, 2025', location: 'Patiala',      spots: 12 },
  { id: 'opp-2', name: 'Google Developer Group',   badgeLetter: 'G', badgeColor: 'var(--info)',    dates: 'Apr 2–4, 2025',   location: 'Online',       spots: 48 },
  { id: 'opp-3', name: 'Microsoft Learn Fest',     badgeLetter: 'M', badgeColor: 'var(--warning)', dates: 'Apr 10–12, 2025', location: 'Chandigarh',   spots: 6  },
];

const SKILL_ICONS: Record<string, { emoji: string; color: string }> = {
  python:  { emoji: '🐍', color: 'var(--success)' },
  react:   { emoji: '⚛️', color: 'var(--info)' },
  sql:     { emoji: '🗄️', color: 'var(--info)' },
  git:     { emoji: '⎇',  color: 'var(--error)' },
  'ui/ux': { emoji: '✏️', color: 'var(--warning)' },
};

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card ${className}`}>
      <div className="skeleton h-4 w-1/3 mb-4" style={{ height: '12px', width: '80px' }} />
      <div className="skeleton h-6 w-2/3 mb-2" style={{ height: '20px', width: '140px' }} />
      <div className="skeleton h-4 w-full mb-1" style={{ height: '12px' }} />
      <div className="skeleton h-4 w-3/4" style={{ height: '12px', width: '75%' }} />
    </div>
  );
}

function QuickStatBadge({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)' }}>
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} aria-hidden="true" />
      </div>
      <div>
        <div className="text-xs font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{value}</div>
        <div className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/skills/mine').catch(() => ({ data: [] }));
        setSkills(res.data?.length > 0 ? res.data : DEFAULT_SKILLS);
      } catch {
        setSkills(DEFAULT_SKILLS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const verifiedCount = skills.filter(s => s.verificationStatus === 'VERIFIED').length;
  const avgScore = skills.length > 0
    ? Math.round(skills.reduce((sum, s) => sum + (s.verifiedScore || 0), 0) / skills.length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 fade-in-up">
        <div className="skeleton rounded-xl" style={{ height: '100px' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span
            className="text-[10px] font-bold uppercase tracking-[0.12em] block mb-1"
            style={{ color: 'var(--accent)' }}
          >
            WELCOME BACK
          </span>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {greeting},{' '}
            <span className="text-gradient">{user?.firstName || 'Alex'}</span> 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Turn your skills into real opportunities.
          </p>
        </div>

        {/* Quick stats row */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <QuickStatBadge icon={ShieldCheck} label="Verified"    value={`${verifiedCount} Skills`} color="var(--success)" />
          <QuickStatBadge icon={TrendingUp}  label="Avg Score"   value={`${avgScore}%`}           color="var(--accent)" />
          <QuickStatBadge icon={Award}       label="Credibility" value="87 / 100"                  color="var(--info)" />
        </div>
      </div>

      {/* ── Feature Cards Row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Hackathons */}
        <Link
          to="/hackathons"
          className="card-hover group relative overflow-hidden flex flex-col justify-between min-h-[160px] no-underline"
          style={{ minHeight: '160px' }}
        >
          {/* Decorative background */}
          <div
            className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=60')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.12,
              filter: 'grayscale(100%)',
            }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--bg-surface) 50%, transparent 100%)' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--accent)' }}>
                HACKATHONS
              </span>
            </div>
            <h2 className="text-base font-bold leading-snug" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Find your perfect team
            </h2>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '80%' }}>
              Connect with verified builders and bring your ideas to life.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-1.5 mt-4 text-xs font-bold group-hover:gap-2.5 transition-all" style={{ color: 'var(--text-primary)' }}>
            <Rocket className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span>Find Teammates</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" style={{ color: 'var(--accent)' }} />
          </div>
        </Link>

        {/* Card 2: Hiring */}
        <Link
          to="/hiring"
          className="card-hover group relative overflow-hidden flex flex-col justify-between no-underline"
          style={{ minHeight: '160px' }}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=60')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.12,
              filter: 'grayscale(100%)',
            }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--bg-surface) 50%, transparent 100%)' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--info)' }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--info)' }}>
                HIRING
              </span>
            </div>
            <h2 className="text-base font-bold leading-snug" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Find talent or get hired
            </h2>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '80%' }}>
              Verified skills. Real opportunities. No guesswork.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-1.5 mt-4 text-xs font-bold group-hover:gap-2.5 transition-all" style={{ color: 'var(--text-primary)' }}>
            <Zap className="w-3.5 h-3.5" style={{ color: 'var(--info)' }} />
            <span>Explore Hiring</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" style={{ color: 'var(--info)' }} />
          </div>
        </Link>

        {/* Card 3: Credibility */}
        <CredibilityDisplay score={87} reportLink="/analysis/report" />
      </div>

      {/* ── Middle Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Verified Skills */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Your Verified Skills
            </h3>
            <Link
              to="/skills"
              className="text-[11px] font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {skills.slice(0, 5).map((skill, i) => {
              const icon = SKILL_ICONS[skill.skillName.toLowerCase()] || { emoji: '✦', color: 'var(--text-muted)' };
              const score = skill.verifiedScore || 0;
              return (
                <div
                  key={skill.id}
                  className="fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm w-5 text-center" aria-hidden="true">{icon.emoji}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {skill.skillName}
                      </span>
                      <VerificationBadge status={skill.verificationStatus} score={skill.verifiedScore} />
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: icon.color }}>{score}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${score}%`, background: icon.color }}
                      role="progressbar"
                      aria-valuenow={score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${skill.skillName} score: ${score}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <Link
              to="/skills"
              className="text-xs font-semibold flex items-center gap-1.5 hover:gap-2.5 transition-all"
              style={{ color: 'var(--accent)' }}
            >
              <span>+ Add more skills</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Column 2: Recent Activity */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Recent Activity
            </h3>
            <Link
              to="/profile"
              className="text-[11px] font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div
            className="flex-1 space-y-4 relative"
            style={{ paddingLeft: '24px' }}
          >
            {/* Timeline vertical line */}
            <div
              className="absolute left-3 top-1 bottom-1 w-px"
              style={{ background: 'var(--border-subtle)' }}
              aria-hidden="true"
            />

            {[
              {
                icon: CheckCircle2,
                bg: 'var(--success-bg)',
                border: 'var(--success-border)',
                color: 'var(--success)',
                title: 'Project "Campus Connect" verified',
                sub: 'GitHub analysis completed',
                time: '2h ago',
              },
              {
                icon: FileText,
                bg: 'var(--bg-surface-raised)',
                border: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
                title: 'Completed React assessment',
                sub: 'Score: 88%',
                time: '1d ago',
              },
              {
                icon: Users,
                bg: 'var(--info-bg)',
                border: 'var(--info-border)',
                color: 'var(--info)',
                title: 'Received team request',
                sub: 'from Riya Sharma',
                time: '2d ago',
              },
              {
                icon: Upload,
                bg: 'var(--bg-surface-raised)',
                border: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
                title: 'Resume uploaded',
                sub: 'Now visible to recruiters',
                time: '3d ago',
              },
            ].map(({ icon: Icon, bg, border, color, title, sub, time }, i) => (
              <div key={i} className="flex items-start gap-3 relative fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div
                  className="absolute left-[-21px] w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
                  style={{ background: bg, border: `1px solid ${border}` }}
                  aria-hidden="true"
                >
                  <Icon className="w-3 h-3" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0 pl-1">
                  <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {title}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                </div>
                <span className="text-[11px] shrink-0 font-mono" style={{ color: 'var(--text-muted)' }}>
                  {time}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setVerifyModalOpen(true)}
              className="text-xs font-semibold flex items-center gap-1.5 hover:gap-2.5 transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              Verify another project
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Column 3: Upcoming Opportunities */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Upcoming Opportunities
            </h3>
            <Link
              to="/hackathons"
              className="text-[11px] font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {UPCOMING_OPPORTUNITIES.map((opp, i) => (
              <div
                key={opp.id}
                className="flex items-center gap-3 fade-in-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Badge */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0"
                  style={{ background: `${opp.badgeColor}20`, color: opp.badgeColor, border: `1px solid ${opp.badgeColor}30` }}
                  aria-hidden="true"
                >
                  {opp.badgeLetter}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {opp.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                      <Calendar className="w-2.5 h-2.5" aria-hidden="true" />
                      {opp.dates}
                    </span>
                    <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                      <MapPin className="w-2.5 h-2.5" aria-hidden="true" />
                      {opp.location}
                    </span>
                  </div>
                  {opp.spots && opp.spots <= 15 && (
                    <span
                      className="text-[10px] font-semibold mt-0.5 inline-block"
                      style={{ color: 'var(--error)' }}
                    >
                      Only {opp.spots} spots left!
                    </span>
                  )}
                </div>

                <Link
                  to="/hackathons"
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition-all hover:scale-105 active:scale-95"
                  style={{
                    border: `1px solid ${opp.badgeColor}50`,
                    color: opp.badgeColor,
                    background: `${opp.badgeColor}10`,
                  }}
                  aria-label={`Register for ${opp.name}`}
                >
                  Register
                </Link>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <Link
              to="/hackathons"
              className="text-xs font-semibold flex items-center gap-1.5 hover:gap-2.5 transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              Explore all hackathons
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom CTA Banner ────────────────────────────────────── */}
      <div
        className="rounded-[14px] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-active) 100%)',
          border: '1px solid var(--border-accent)',
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute right-0 top-0 w-64 h-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 100% 50%, var(--accent-subtle) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} aria-hidden="true" />
            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Let's get you further
            </h4>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)', maxWidth: '340px' }}>
            Verify more skills, add projects, and explore opportunities that match your level.
          </p>
        </div>

        <Link
          to="/profile"
          className="btn-primary btn-sm shrink-0 self-start sm:self-auto relative z-10"
        >
          <span>Improve Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Verify Project Modal */}
      <VerifyProjectModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
      />
    </div>
  );
}
