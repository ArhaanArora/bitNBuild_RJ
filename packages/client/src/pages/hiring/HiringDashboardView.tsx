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
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Building2,
  Bookmark,
  Eye,
  EyeOff,
  Edit3,
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
      toast.success('Recruiter Discoverability: ON');
    } else {
      toast('Recruiter Discoverability: OFF');
    }
  };

  return (
    <div className="space-y-8 fade-in-up pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-semibold text-[#A3A3A8] uppercase tracking-wider block mb-1">
          MARKETPLACE
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#F5F5F4] tracking-tight">
              Hiring & Talent Discovery
            </h1>
            <p className="text-sm text-[#A3A3A8] mt-1 max-w-2xl">
              Connect people looking for employees with candidates whose skills and experience are backed by verified evidence.
            </p>
          </div>

          {shortlistedCount > 0 && (
            <button
              type="button"
              onClick={onViewShortlist}
              className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-2 self-start sm:self-auto"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#E8672E]" />
              <span>Shortlisted ({shortlistedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Lightweight Stats (Section 2 Spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5 text-center">
          <div className="text-3xl font-bold font-mono text-[#F5F5F4]">
            {DEMO_HIRING_CANDIDATES.length + (profile?.activated && profile.recruiterVisibility ? 1 : 0)}+
          </div>
          <div className="text-xs text-[#A3A3A8] font-medium uppercase tracking-wider mt-1 flex items-center justify-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#A3A3A8]" />
            <span>Available Candidates</span>
          </div>
        </div>

        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5 text-center">
          <div className="text-3xl font-bold font-mono text-[#3FB65F]">19</div>
          <div className="text-xs text-[#A3A3A8] font-medium uppercase tracking-wider mt-1 flex items-center justify-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#3FB65F]" />
            <span>Verified Professionals</span>
          </div>
        </div>

        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5 text-center">
          <div className="text-3xl font-bold font-mono text-[#D89A3E]">14</div>
          <div className="text-xs text-[#A3A3A8] font-medium uppercase tracking-wider mt-1 flex items-center justify-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#D89A3E]" />
            <span>Active Opportunities</span>
          </div>
        </div>
      </div>

      {/* Compact "Your Hiring Profile" Card (Section 2 Spec) if user has completed Get Hired */}
      {profile && profile.activated && (
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-[#3FB65F]" />
          <div className="flex items-center gap-3.5 pl-2">
            <div className="w-10 h-10 rounded-lg bg-[#16261B] border border-[#3FB65F]/30 flex items-center justify-center text-[#3FB65F] shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">Your Hiring Profile</h3>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border font-medium flex items-center gap-1 ${
                    profile.recruiterVisibility
                      ? 'bg-[#16261B] text-[#3FB65F] border-[#3FB65F]/30'
                      : 'bg-[#1E1E22] text-[#A3A3A8] border-[#2A2A2E]'
                  }`}
                >
                  {profile.recruiterVisibility ? (
                    <>
                      <Eye className="w-3 h-3 text-[#3FB65F]" />
                      <span>Discoverability: ON</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-[#A3A3A8]" />
                      <span>Discoverability: OFF</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-[#A3A3A8] mt-0.5">
                {profile.skills.length} skills listed ({profile.skills.filter((s) => s.status === 'VERIFIED').length} verified) ·{' '}
                {profile.resume ? profile.resume.name : 'Resume active'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleVisibility}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              Toggle Visibility
            </button>
            <button
              type="button"
              onClick={onGetHired}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Two Hero Action Cards: HIRING & GET HIRED (Section 2 Spec) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: HIRE SOMEONE */}
        <div className="bg-[#17171A] border border-[#2A2A2E] hover:border-[#38383D] rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E8672E] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8672E]" />
              <span>FOR RECRUITERS & FOUNDERS</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#F5F5F4]">Hire Someone</h2>
            <p className="text-sm text-[#A3A3A8] leading-relaxed">
              Find skilled candidates backed by verified abilities. Filter by role, platform assessment benchmarks, and audited GitHub repositories.
            </p>

            <ul className="space-y-2 pt-2 text-xs text-[#A3A3A8]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3FB65F] shrink-0" />
                <span>Deterministic match scoring with concrete reasons</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3FB65F] shrink-0" />
                <span>Instant visual distinction between Claimed vs Verified skills</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3FB65F] shrink-0" />
                <span>Direct contact reveal with candidate consent protection</span>
              </li>
            </ul>
          </div>

          <div>
            <button
              type="button"
              onClick={onHireSomeone}
              className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 font-semibold cursor-pointer"
            >
              <span>Hire Someone</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: GET HIRED */}
        <div className="bg-[#17171A] border border-[#2A2A2E] hover:border-[#38383D] rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E8672E] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8672E]" />
              <span>FOR STUDENTS & ENGINEERS</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#F5F5F4]">Get Hired</h2>
            <p className="text-sm text-[#A3A3A8] leading-relaxed">
              Showcase your verified skills and experience to potential employers. Put yourself on the hiring radar with automated credibility proof.
            </p>

            <ul className="space-y-2 pt-2 text-xs text-[#A3A3A8]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3FB65F] shrink-0" />
                <span>Self-declare skills with automatic platform benchmark badges</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3FB65F] shrink-0" />
                <span>Upload validated PDF/DOCX resume (up to 5MB)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3FB65F] shrink-0" />
                <span>One-click discoverability control (opt-in or opt-out anytime)</span>
              </li>
            </ul>
          </div>

          <div>
            <button
              type="button"
              onClick={onGetHired}
              className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2 font-semibold cursor-pointer"
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
