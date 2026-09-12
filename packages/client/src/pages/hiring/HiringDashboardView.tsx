import React, { useState, useEffect } from 'react';
import {
  getUserHiringProfile,
  getShortlistedCandidateIds,
  toggleRecruiterDiscoverability,
} from '../../utils/hiringStorage';
import { DEMO_HIRING_CANDIDATES } from '../../data/mockHiringData';
import { useAuth } from '../../hooks/useAuth';
import {
  Briefcase,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  Bookmark,
  Eye,
  EyeOff,
  Edit3,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface HiringDashboardViewProps {
  onHireSomeone: () => void;
  onGetHired: () => void;
  onViewShortlist: () => void;
}

export default function HiringDashboardView({
  onHireSomeone,
  onGetHired,
  onViewShortlist,
}: HiringDashboardViewProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(getUserHiringProfile());
  const [shortlistedCount, setShortlistedCount] = useState(0);

  useEffect(() => {
    setProfile(getUserHiringProfile());
    setShortlistedCount(getShortlistedCandidateIds().length);
  }, []);

  const handleToggleVisibility = () => {
    const newState = toggleRecruiterDiscoverability();
    const updated = getUserHiringProfile();
    setProfile(updated);
    if (newState) {
      toast.success('🟢 Recruiter Discoverability: ON');
    } else {
      toast('⚪ Recruiter Discoverability: OFF');
    }
  };

  return (
    <div className="space-y-8 fade-in-up pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Verified Skill-First Marketplace
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Hiring & Talent Discovery
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Connect people looking for employees with candidates whose skills and experience are backed by verified evidence.
            </p>
          </div>

          {shortlistedCount > 0 && (
            <button
              type="button"
              onClick={onViewShortlist}
              className="btn-accent text-xs py-2 px-3.5 flex items-center gap-2 self-start sm:self-auto"
            >
              <Bookmark className="w-4 h-4" />
              <span>Shortlisted ({shortlistedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Lightweight Stats (Section 2 Spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center border-gray-800 bg-[#0B0F1B]/90 p-5 rounded-2xl">
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {DEMO_HIRING_CANDIDATES.length + (profile?.activated && profile.recruiterVisibility ? 1 : 0)}+
          </div>
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Available Candidates</span>
          </div>
        </div>

        <div className="card text-center border-gray-800 bg-[#0B0F1B]/90 p-5 rounded-2xl">
          <div className="text-3xl font-extrabold font-mono text-indigo-400">19</div>
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Verified Professionals</span>
          </div>
        </div>

        <div className="card text-center border-gray-800 bg-[#0B0F1B]/90 p-5 rounded-2xl">
          <div className="text-3xl font-extrabold font-mono text-amber-400">14</div>
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Opportunities</span>
          </div>
        </div>
      </div>

      {/* Compact "Your Hiring Profile" Card (Section 2 Spec) if user has completed Get Hired */}
      {profile && profile.activated && (
        <div className="card border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-[#0B0F1B] to-gray-950 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Your Hiring Profile</h3>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${
                    profile.recruiterVisibility
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      : 'bg-gray-900 text-gray-400 border-gray-700'
                  }`}
                >
                  {profile.recruiterVisibility ? (
                    <>
                      <Eye className="w-3 h-3 text-emerald-400" />
                      <span>🟢 Recruiter Discoverability: ON</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-gray-400" />
                      <span>⚪ Recruiter Discoverability: OFF</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {profile.skills.length} skills listed ({profile.skills.filter((s) => s.status === 'VERIFIED').length} verified) ·{' '}
                {profile.resume ? profile.resume.name : 'Resume active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleVisibility}
              className="btn-ghost btn-sm text-xs border-gray-700 hover:border-gray-600 text-gray-200"
            >
              Toggle Visibility
            </button>
            <button
              type="button"
              onClick={onGetHired}
              className="btn-primary btn-sm text-xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>View & Edit Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Two Hero Action Cards: HIRING & GET HIRED (Section 2 Spec) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: HIRE SOMEONE */}
        <div className="card-hover border border-indigo-900/50 bg-gradient-to-br from-[#0c1328] via-[#0B0F1B] to-[#080d1a] p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
              For Recruiters & Founders
            </div>
            <h2 className="text-2xl font-extrabold text-white">Hire Someone</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Find skilled candidates backed by verified abilities. Filter by role, platform assessment benchmarks, and audited GitHub repositories.
            </p>

            <ul className="space-y-2 pt-2 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Deterministic match scoring with concrete reasons</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant visual distinction between Claimed vs Verified skills</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct contact reveal with candidate consent protection</span>
              </li>
            </ul>
          </div>

          <div>
            <button
              type="button"
              onClick={onHireSomeone}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 font-semibold cursor-pointer"
            >
              <span>Hire Someone</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: GET HIRED */}
        <div className="card-hover border border-emerald-900/40 bg-gradient-to-br from-[#081812] via-[#0B0F1B] to-[#06100c] p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              For Students & Engineers
            </div>
            <h2 className="text-2xl font-extrabold text-white">Get Hired</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Showcase your verified skills and experience to potential employers. Put yourself on the hiring radar with automated credibility proof.
            </p>

            <ul className="space-y-2 pt-2 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Self-declare skills with automatic platform benchmark badges</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Upload validated PDF/DOCX resume (up to 5MB)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>One-click discoverability control (opt-in or opt-out anytime)</span>
              </li>
            </ul>
          </div>

          <div>
            <button
              type="button"
              onClick={onGetHired}
              className="btn-accent w-full py-3 text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 font-semibold cursor-pointer"
            >
              <span>Get Hired</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
