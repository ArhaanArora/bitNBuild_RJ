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
  badgeBg: string;
  badgeText: string;
  dates: string;
  location: string;
}

const UPCOMING_OPPORTUNITIES: HackathonItem[] = [
  {
    id: 'opp-1',
    name: 'TIET Hackathon 2025',
    badgeLetter: 'T',
    badgeBg: 'bg-[#E8672E]',
    badgeText: 'text-[#0D0D0F]',
    dates: 'Mar 15 - Mar 17, 2025',
    location: 'Patiala',
  },
  {
    id: 'opp-2',
    name: 'Google Developer Group',
    badgeLetter: 'G',
    badgeBg: 'bg-[#4C8DDA]',
    badgeText: 'text-white',
    dates: 'Apr 2 - Apr 4, 2025',
    location: 'Online',
  },
  {
    id: 'opp-3',
    name: 'Microsoft Learn Fest',
    badgeLetter: 'M',
    badgeBg: 'bg-[#D89A3E]',
    badgeText: 'text-[#0D0D0F]',
    dates: 'Apr 10 - Apr 12, 2025',
    location: 'Chandigarh',
  },
];

const SKILL_ICONS: Record<string, { color: string; letter: string }> = {
  python: { color: 'text-[#3FB65F]', letter: '🐍' },
  react: { color: 'text-[#4C8DDA]', letter: '⚛️' },
  sql: { color: 'text-[#4C8DDA]', letter: '🗄️' },
  git: { color: 'text-[#E0554E]', letter: '⎇' },
  'ui/ux': { color: 'text-[#D89A3E]', letter: '✏️' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/skills/mine').catch(() => ({ data: [] }));
        if (res.data && res.data.length > 0) {
          setSkills(res.data);
        } else {
          // Default representative skills matching reference image
          setSkills([
            { id: '1', skillName: 'Python', verificationStatus: 'VERIFIED', verifiedScore: 95, integrityScore: 98, level: 'Advanced' },
            { id: '2', skillName: 'React', verificationStatus: 'VERIFIED', verifiedScore: 92, integrityScore: 96, level: 'Intermediate' },
            { id: '3', skillName: 'SQL', verificationStatus: 'VERIFIED', verifiedScore: 90, integrityScore: 94, level: 'Intermediate' },
            { id: '4', skillName: 'Git', verificationStatus: 'VERIFIED', verifiedScore: 88, integrityScore: 92, level: 'Intermediate' },
            { id: '5', skillName: 'UI/UX', verificationStatus: 'PARTIALLY_VERIFIED', verifiedScore: 82, integrityScore: 88, level: 'Intermediate' },
          ]);
        }
      } catch {
        // Fallback default
        setSkills([
          { id: '1', skillName: 'Python', verificationStatus: 'VERIFIED', verifiedScore: 95, integrityScore: 98, level: 'Advanced' },
          { id: '2', skillName: 'React', verificationStatus: 'VERIFIED', verifiedScore: 92, integrityScore: 96, level: 'Intermediate' },
          { id: '3', skillName: 'SQL', verificationStatus: 'VERIFIED', verifiedScore: 90, integrityScore: 94, level: 'Intermediate' },
          { id: '4', skillName: 'Git', verificationStatus: 'VERIFIED', verifiedScore: 88, integrityScore: 92, level: 'Intermediate' },
          { id: '5', skillName: 'UI/UX', verificationStatus: 'PARTIALLY_VERIFIED', verifiedScore: 82, integrityScore: 88, level: 'Intermediate' },
        ]);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8 fade-in-up">
      {/* Greeting Header (Reference Image) */}
      <div>
        <span className="text-[11px] font-semibold text-[#A3A3A8] uppercase tracking-wider block mb-1">
          WELCOME BACK
        </span>
        <h1 className="text-3xl font-semibold text-[#F5F5F4] tracking-tight">
          Good morning, {user?.firstName || 'Alex'}
        </h1>
        <p className="text-sm text-[#A3A3A8] mt-1">
          Turn your skills into real opportunities.
        </p>
      </div>

      {/* Top 3 Feature Cards Row (Reference Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Hackathons */}
        <div className="relative bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 flex flex-col justify-between overflow-hidden group">
          {/* Subtle architectural background texture on right side */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 bg-cover bg-center pointer-events-none grayscale"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80')`,
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E8672E] tracking-wider uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8672E]" />
              <span>HACKATHONS</span>
            </div>
            <h2 className="text-xl font-semibold text-[#F5F5F4] tracking-tight leading-snug">
              Find your perfect team
            </h2>
            <p className="text-xs text-[#A3A3A8] mt-2 leading-relaxed max-w-[85%]">
              Connect with verified builders and bring your ideas to life.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <Link
              to="/hackathons/find-teammates"
              className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-[#E8672E] transition"
            >
              <span className="text-sm">→</span>
              <span>Find Teammates</span>
            </Link>
          </div>
        </div>

        {/* Card 2: Hiring */}
        <div className="relative bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 flex flex-col justify-between overflow-hidden group">
          {/* Subtle workspace background texture on right side */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 bg-cover bg-center pointer-events-none grayscale"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80')`,
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E8672E] tracking-wider uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8672E]" />
              <span>HIRING</span>
            </div>
            <h2 className="text-xl font-semibold text-[#F5F5F4] tracking-tight leading-snug">
              Find talent or get hired
            </h2>
            <p className="text-xs text-[#A3A3A8] mt-2 leading-relaxed max-w-[85%]">
              Verified skills. Real opportunities. No guesswork.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <Link
              to="/hiring"
              className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-[#E8672E] transition"
            >
              <span className="text-sm">→</span>
              <span>Explore Hiring</span>
            </Link>
          </div>
        </div>

        {/* Card 3: Your Credibility Display */}
        <CredibilityDisplay score={87} reportLink="/analysis/report" />
      </div>

      {/* Middle Row (3 Columns: Skills, Recent Activity, Opportunities) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Your Verified Skills */}
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[#F5F5F4]">
                Your Verified Skills
              </h3>
              <Link
                to="/skills"
                className="text-xs text-[#A3A3A8] hover:text-[#F5F5F4] transition"
              >
                View all →
              </Link>
            </div>

            <div className="space-y-3.5">
              {skills.slice(0, 5).map((skill) => {
                const iconMeta = SKILL_ICONS[skill.skillName.toLowerCase()] || {
                  color: 'text-[#A3A3A8]',
                  letter: '✦',
                };
                return (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm w-5 text-center select-none">
                        {iconMeta.letter}
                      </span>
                      <span className="font-medium text-[#F5F5F4]">
                        {skill.skillName}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <VerificationBadge
                        status={skill.verificationStatus}
                        score={skill.verifiedScore}
                      />
                      <span className="text-[#A3A3A8] text-[11px] w-20 text-right">
                        {skill.level || 'Intermediate'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#2A2A2E] mt-4">
            <Link
              to="/skills"
              className="text-xs text-[#E8672E] hover:underline inline-flex items-center gap-1 font-medium"
            >
              + Add more skills to verify
            </Link>
          </div>
        </div>

        {/* Column 2: Recent Activity Timeline */}
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[#F5F5F4]">
                Recent Activity
              </h3>
              <Link
                to="/profile"
                className="text-xs text-[#A3A3A8] hover:text-[#F5F5F4] transition"
              >
                View all →
              </Link>
            </div>

            {/* Timeline List */}
            <div className="space-y-4 relative before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#2A2A2E]">
              {/* Event 1: Project verified */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-[#16261B] border border-[#3FB65F]/30 flex items-center justify-center text-[#3FB65F] shrink-0 z-10">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#F5F5F4] font-medium leading-tight">
                    Project &quot;Campus Connect&quot; verified
                  </p>
                  <p className="text-[11px] text-[#6B6B70] mt-0.5">
                    GitHub analysis completed
                  </p>
                </div>
                <span className="text-[11px] text-[#6B6B70] shrink-0 font-mono">
                  2h ago
                </span>
              </div>

              {/* Event 2: React assessment */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-center text-[#A3A3A8] shrink-0 z-10">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#F5F5F4] font-medium leading-tight">
                    Completed React assessment
                  </p>
                  <p className="text-[11px] text-[#6B6B70] mt-0.5">
                    Score: 88%
                  </p>
                </div>
                <span className="text-[11px] text-[#6B6B70] shrink-0 font-mono">
                  1d ago
                </span>
              </div>

              {/* Event 3: Received team request */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-center text-[#4C8DDA] shrink-0 z-10">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#F5F5F4] font-medium leading-tight">
                    Received team request
                  </p>
                  <p className="text-[11px] text-[#6B6B70] mt-0.5">
                    from Riya Sharma
                  </p>
                </div>
                <span className="text-[11px] text-[#6B6B70] shrink-0 font-mono">
                  2d ago
                </span>
              </div>

              {/* Event 4: Resume uploaded */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-center text-[#A3A3A8] shrink-0 z-10">
                  <Upload className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#F5F5F4] font-medium leading-tight">
                    Resume uploaded
                  </p>
                  <p className="text-[11px] text-[#6B6B70] mt-0.5">
                    Now visible to recruiters
                  </p>
                </div>
                <span className="text-[11px] text-[#6B6B70] shrink-0 font-mono">
                  3d ago
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2A2A2E] mt-4">
            <button
              type="button"
              onClick={() => setVerifyModalOpen(true)}
              className="text-xs text-[#A3A3A8] hover:text-white transition flex items-center gap-1"
            >
              <span>Verify another project</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Column 3: Upcoming Opportunities */}
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[#F5F5F4]">
                Upcoming Opportunities
              </h3>
              <Link
                to="/hackathons"
                className="text-xs text-[#A3A3A8] hover:text-[#F5F5F4] transition"
              >
                View all →
              </Link>
            </div>

            <div className="space-y-4">
              {UPCOMING_OPPORTUNITIES.map((opp) => (
                <div
                  key={opp.id}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg ${opp.badgeBg} ${opp.badgeText} flex items-center justify-center font-bold text-xs shrink-0 select-none`}
                    >
                      {opp.badgeLetter}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#F5F5F4] truncate">
                        {opp.name}
                      </p>
                      <p className="text-[11px] text-[#6B6B70] truncate mt-0.5">
                        {opp.dates} · {opp.location}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/hackathons"
                    className="border border-[#E8672E] text-[#E8672E] hover:bg-[#E8672E] hover:text-[#0D0D0F] transition px-2.5 py-1 rounded text-[11px] font-semibold shrink-0"
                  >
                    Register
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#2A2A2E] mt-4">
            <Link
              to="/hackathons"
              className="text-xs text-[#A3A3A8] hover:text-white transition flex items-center gap-1"
            >
              <span>Explore all hackathons</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Banner (Reference Image) */}
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-semibold text-[#F5F5F4]">
            Let&apos;s get you further
          </h4>
          <p className="text-xs text-[#A3A3A8] mt-1">
            Verify more skills, add projects, and explore opportunities.
          </p>
        </div>

        <Link
          to="/profile"
          className="btn-primary text-xs py-2.5 px-5 shrink-0 self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>Improve Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hidden/Callable Verify Project Modal (Preserves 3D project verification capability) */}
      <VerifyProjectModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
      />
    </div>
  );
}
