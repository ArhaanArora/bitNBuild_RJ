import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  TrendingUp,
  Zap,
  ShieldCheck,
  Rocket,
  Award,
  Clock,
  ChevronRight,
  Sparkles,
  Star,
  Activity,
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
  badgeBg: string;
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
  { id: 'opp-1', name: 'TIET Hackathon 2025',   badgeLetter: 'T', badgeColor: '#FF6B35', badgeBg: 'rgba(255,107,53,0.12)', dates: 'Mar 15–17', location: 'Patiala', spots: 12 },
  { id: 'opp-2', name: 'Google DevFest 2025',   badgeLetter: 'G', badgeColor: '#3B82F6', badgeBg: 'rgba(59,130,246,0.12)', dates: 'Apr 2–4',   location: 'Online',  spots: 48 },
  { id: 'opp-3', name: 'Microsoft Learn Fest',  badgeLetter: 'M', badgeColor: '#8B5CF6', badgeBg: 'rgba(139,92,246,0.12)', dates: 'Apr 10–12', location: 'Chandigarh', spots: 6 },
];

const SKILL_CONFIG: Record<string, { emoji: string; color: string; gradFrom: string; gradTo: string }> = {
  python:  { emoji: '🐍', color: '#22D87A', gradFrom: '#22D87A', gradTo: '#059669' },
  react:   { emoji: '⚛️', color: '#3B82F6', gradFrom: '#3B82F6', gradTo: '#1D4ED8' },
  sql:     { emoji: '🗄️', color: '#8B5CF6', gradFrom: '#8B5CF6', gradTo: '#6D28D9' },
  git:     { emoji: '⎇',  color: '#F59E0B', gradFrom: '#F59E0B', gradTo: '#D97706' },
  'ui/ux': { emoji: '✏️', color: '#EC4899', gradFrom: '#EC4899', gradTo: '#DB2777' },
};

/* ── Animated counter ─────────────────────────────────────────────────────── */
function Counter({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * to));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [to, duration]);
  return <>{val}</>;
}

/* ── Stat card ────────────────────────────────────────────────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  unit = '',
  color,
  gradFrom,
  gradTo,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit?: string;
  color: string;
  gradFrom: string;
  gradTo: string;
  delay?: number;
}) {
  return (
    <div
      className="card-glow flex flex-col gap-3 fade-in-up relative overflow-hidden"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Background gradient wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${color}18 0%, transparent 65%)`,
        }}
        aria-hidden="true"
      />
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-4 right-4 h-[1.5px] rounded-full pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between relative z-10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `linear-gradient(135deg, ${gradFrom}25, ${gradTo}15)`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color }} aria-hidden="true" />
        </div>
        <Activity className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)', opacity: 0.4 }} aria-hidden="true" />
      </div>

      <div className="relative z-10">
        <div
          className="text-3xl font-black leading-none tracking-tight mb-1"
          style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.05em' }}
          aria-label={`${label}: ${value}${unit}`}
        >
          <Counter to={value} />{unit}
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </div>
      </div>

      {/* Bottom progress fill */}
      <div className="relative z-10">
        <div className="progress-bar" style={{ height: '3px' }}>
          <div
            className="progress-fill"
            style={{ width: `${Math.min(value, 100)}%`, background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} progress`}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Skill bar row ────────────────────────────────────────────────────────── */
function SkillRow({ skill, index }: { skill: CandidateSkill; index: number }) {
  const key = skill.skillName.toLowerCase();
  const cfg = SKILL_CONFIG[key] || { emoji: '✦', color: 'var(--text-muted)', gradFrom: 'var(--text-muted)', gradTo: 'var(--text-muted)' };
  const score = skill.verifiedScore || 0;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 100 + index * 80);
    return () => clearTimeout(t);
  }, [score, index]);

  return (
    <div
      className="fade-in-up"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none w-5 text-center" aria-hidden="true">{cfg.emoji}</span>
          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{skill.skillName}</span>
          <VerificationBadge status={skill.verificationStatus} />
        </div>
        <span
          className="text-xs font-black tabular-nums"
          style={{ color: cfg.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {score}%
        </span>
      </div>
      <div
        className="progress-bar"
        style={{ height: '6px', background: `${cfg.color}15`, borderRadius: '9999px' }}
      >
        <div
          style={{
            height: '100%',
            width: `${width}%`,
            background: `linear-gradient(90deg, ${cfg.gradFrom}, ${cfg.gradTo})`,
            borderRadius: '9999px',
            transition: 'width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: `0 0 8px ${cfg.color}60`,
          }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${skill.skillName}: ${score}%`}
        />
      </div>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="space-y-6 fade-in-up">
      <div className="skeleton rounded-2xl" style={{ height: '180px' }} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton rounded-2xl" style={{ height: '120px' }} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton rounded-2xl" style={{ height: '160px' }} />)}
      </div>
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '⚡' : '🌙';

  useEffect(() => {
    api.get('/skills/mine')
      .then(r => setSkills(r.data?.length > 0 ? r.data : DEFAULT_SKILLS))
      .catch(() => setSkills(DEFAULT_SKILLS))
      .finally(() => setLoading(false));
  }, []);

  const verifiedCount = skills.filter(s => s.verificationStatus === 'VERIFIED').length;
  const avgScore = skills.length > 0
    ? Math.round(skills.reduce((sum, s) => sum + (s.verifiedScore || 0), 0) / skills.length)
    : 0;

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-5 fade-in-up">

      {/* ══════════════════════════════════════════════
          HERO — Gradient mesh with ambient orbs
      ══════════════════════════════════════════════ */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-raised) 60%, var(--bg-active) 100%)',
          border: '1px solid var(--border-accent)',
          padding: '28px 28px 24px',
        }}
      >
        {/* Ambient orbs */}
        <div className="orb orb-orange absolute" style={{ width: 280, height: 280, top: -100, right: -60, opacity: 0.8 }} aria-hidden="true" />
        <div className="orb orb-purple absolute" style={{ width: 200, height: 200, bottom: -80, right: 120, opacity: 0.6 }} aria-hidden="true" />

        {/* Grid texture */}
        <div className="grid-bg absolute inset-0 pointer-events-none opacity-40" aria-hidden="true" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.12em]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,107,53,0.08))',
                  border: '1px solid rgba(255,107,53,0.3)',
                  color: 'var(--accent)',
                }}
              >
                WELCOME BACK
              </span>
              <span aria-hidden="true">{greetEmoji}</span>
            </div>

            {/* Headline */}
            <h1
              className="text-3xl sm:text-4xl font-black leading-tight mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.04em' }}
            >
              <span style={{ color: 'var(--text-primary)' }}>{greeting}, </span>
              <span className="text-gradient">{user?.firstName || 'Alex'}</span>
            </h1>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
              Your verified profile is working for you.{' '}
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {verifiedCount} skills proven
              </span>{' '}
              — keep building.
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link to="/verification" className="btn-primary btn-sm">
              <Zap className="w-3.5 h-3.5" />
              Verify Skill
            </Link>
            <Link to="/hackathons" className="btn-secondary btn-sm">
              <Rocket className="w-3.5 h-3.5" />
              Find Hackathon
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          STAT CARDS — Animated counters + glows
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={ShieldCheck}
          label="Verified Skills"
          value={verifiedCount}
          color="#22D87A"
          gradFrom="#22D87A"
          gradTo="#059669"
          delay={0.05}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Score"
          value={avgScore}
          unit="%"
          color="#FF6B35"
          gradFrom="#FF6B35"
          gradTo="#FF3D00"
          delay={0.1}
        />
        <StatCard
          icon={Award}
          label="Credibility"
          value={87}
          unit="/100"
          color="#8B5CF6"
          gradFrom="#8B5CF6"
          gradTo="#6D28D9"
          delay={0.15}
        />
      </div>

      {/* ══════════════════════════════════════════════
          FEATURE CARDS — Hackathons + Hiring (2-col)
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Hackathons card */}
        <Link
          to="/hackathons"
          className="card-hover group relative overflow-hidden flex flex-col justify-between no-underline"
          style={{ minHeight: '164px' }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(255,107,53,0.1) 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          {/* Corner photo */}
          <div
            className="absolute right-0 top-0 bottom-0 w-[45%] pointer-events-none"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=400&q=50')",
              backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: 0.07, filter: 'grayscale(100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, var(--bg-surface) 55%, transparent 100%)' }}
          />

          <div className="relative z-10 flex flex-col h-full p-5 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)' }}
                >
                  <Rocket className="w-4 h-4" style={{ color: 'var(--accent)' }} aria-hidden="true" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--accent)' }}>
                  HACKATHONS
                </span>
              </div>
              <h2
                className="text-base font-bold leading-snug mb-1.5"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Find your perfect team
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '75%' }}>
                Connect with verified builders. Bring ideas to life.
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 mt-4 text-xs font-bold group-hover:gap-3 transition-all duration-300"
              style={{ color: 'var(--accent)' }}
            >
              <span>Explore Hackathons</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </Link>

        {/* Hiring card */}
        <Link
          to="/hiring"
          className="card-hover group relative overflow-hidden flex flex-col justify-between no-underline"
          style={{ minHeight: '164px' }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-[45%] pointer-events-none"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=50')",
              backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: 0.07, filter: 'grayscale(100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, var(--bg-surface) 55%, transparent 100%)' }}
          />

          <div className="relative z-10 flex flex-col h-full p-5 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}
                >
                  <Zap className="w-4 h-4" style={{ color: 'var(--info)' }} aria-hidden="true" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: 'var(--info)' }}>
                  HIRING
                </span>
              </div>
              <h2
                className="text-base font-bold leading-snug mb-1.5"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Get hired on proof
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '75%' }}>
                Verified skills. Real opportunities. Zero guesswork.
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 mt-4 text-xs font-bold group-hover:gap-3 transition-all duration-300"
              style={{ color: 'var(--info)' }}
            >
              <span>Explore Hiring</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </Link>
      </div>

      {/* ══════════════════════════════════════════════
          MIDDLE ROW — Skills + Activity + Opportunities
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Verified Skills ── */}
        <div className="card flex flex-col" style={{ gridColumn: 'span 1' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3
                className="text-sm font-bold"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Verified Skills
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {verifiedCount} of {skills.length} proven
              </p>
            </div>
            <Link
              to="/skills"
              className="text-[11px] font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            {skills.slice(0, 5).map((skill, i) => (
              <SkillRow key={skill.id} skill={skill} index={i} />
            ))}
          </div>

          <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <Link
              to="/skills"
              className="text-xs font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all"
              style={{ color: 'var(--accent)' }}
            >
              <span>+ Add more skills</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3
              className="text-sm font-bold"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Recent Activity
            </h3>
            <Link
              to="/profile"
              className="text-[11px] font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 space-y-4 relative" style={{ paddingLeft: '26px' }}>
            {/* Timeline line */}
            <div
              className="absolute left-3.5 top-1 bottom-1 w-px"
              style={{ background: 'linear-gradient(180deg, var(--border-default), var(--border-subtle) 80%, transparent)' }}
              aria-hidden="true"
            />

            {[
              {
                icon: CheckCircle2,
                bg: 'rgba(34,216,122,0.12)',
                border: 'rgba(34,216,122,0.3)',
                color: '#22D87A',
                title: '"Campus Connect" verified',
                sub: 'GitHub analysis completed',
                time: '2h ago',
              },
              {
                icon: FileText,
                bg: 'var(--bg-surface-raised)',
                border: 'var(--border-default)',
                color: 'var(--text-secondary)',
                title: 'Completed React assessment',
                sub: 'Score: 88%',
                time: '1d ago',
              },
              {
                icon: Users,
                bg: 'rgba(59,130,246,0.12)',
                border: 'rgba(59,130,246,0.3)',
                color: '#3B82F6',
                title: 'Received team request',
                sub: 'from Riya Sharma',
                time: '2d ago',
              },
              {
                icon: Upload,
                bg: 'var(--bg-surface-raised)',
                border: 'var(--border-default)',
                color: 'var(--text-muted)',
                title: 'Resume uploaded',
                sub: 'Now visible to recruiters',
                time: '3d ago',
              },
            ].map(({ icon: Icon, bg, border, color, title, sub, time }, i) => (
              <div key={i} className="flex items-start gap-3 relative fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div
                  className="absolute left-[-22px] w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
                  style={{ background: bg, border: `1px solid ${border}` }}
                  aria-hidden="true"
                >
                  <Icon className="w-3 h-3" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                </div>
                <span className="text-[10px] shrink-0 font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>{time}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setVerifyModalOpen(true)}
              className="text-xs font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              Verify another project <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ── Upcoming Opportunities ── */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3
              className="text-sm font-bold"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Opportunities
            </h3>
            <Link
              to="/hackathons"
              className="text-[11px] font-semibold flex items-center gap-0.5 hover:gap-1.5 transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {UPCOMING_OPPORTUNITIES.map((opp, i) => (
              <div
                key={opp.id}
                className="flex items-center gap-3 fade-in-up p-3 rounded-xl transition-colors hover:bg-[var(--bg-surface-raised)]"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Gradient badge */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                  style={{
                    background: opp.badgeBg,
                    color: opp.badgeColor,
                    border: `1px solid ${opp.badgeColor}30`,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: `0 0 12px ${opp.badgeColor}20`,
                  }}
                  aria-hidden="true"
                >
                  {opp.badgeLetter}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{opp.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                      <Calendar className="w-2.5 h-2.5" aria-hidden="true" /> {opp.dates}
                    </span>
                    <span className="text-[10px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                      <MapPin className="w-2.5 h-2.5" aria-hidden="true" /> {opp.location}
                    </span>
                  </div>
                  {opp.spots && opp.spots <= 15 && (
                    <span className="text-[10px] font-bold mt-0.5 inline-block" style={{ color: 'var(--error)' }}>
                      Only {opp.spots} spots left!
                    </span>
                  )}
                </div>

                <Link
                  to="/hackathons"
                  className="text-[10px] font-black px-2.5 py-1.5 rounded-lg shrink-0 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                  style={{
                    border: `1px solid ${opp.badgeColor}40`,
                    color: opp.badgeColor,
                    background: opp.badgeBg,
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
              className="text-xs font-bold flex items-center gap-1.5 hover:gap-2.5 transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              Explore all hackathons <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          CREDIBILITY CARD (full width)
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CredibilityDisplay score={87} reportLink="/analysis/report" />
        </div>

        {/* ── CTA Banner ── */}
        <div
          className="rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-active) 100%)',
            border: '1px solid var(--border-accent)',
          }}
        >
          {/* Orb */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 70%)', filter: 'blur(20px)' }}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <Sparkles className="w-5 h-5 mb-3" style={{ color: 'var(--accent)' }} aria-hidden="true" />
            <h4
              className="text-base font-black leading-tight mb-2"
              style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' }}
            >
              Level up your profile
            </h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Verify more skills, add projects, and unlock opportunities that match your proof.
            </p>
          </div>
          <div className="relative z-10 flex flex-col gap-2 mt-5">
            <Link to="/profile" className="btn-primary btn-sm w-full justify-center">
              Improve Profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/skills" className="btn-ghost btn-sm w-full justify-center">
              Add a Skill
            </Link>
          </div>
        </div>
      </div>

      <VerifyProjectModal isOpen={verifyModalOpen} onClose={() => setVerifyModalOpen(false)} />
    </div>
  );
}
