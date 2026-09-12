import React from 'react';
import { HiringMatch } from '../../types/hiring';
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  GitBranch,
  Award,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface HiringCandidateCardProps {
  match: HiringMatch;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
  onViewProfile: () => void;
  onContact: () => void;
}

export default function HiringCandidateCard({
  match,
  isShortlisted,
  onToggleShortlist,
  onViewProfile,
  onContact,
}: HiringCandidateCardProps) {
  const { candidate, matchScore, reasoningBullets } = match;

  // Match badge styling
  const matchColor =
    matchScore >= 90
      ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30'
      : matchScore >= 80
      ? 'text-indigo-400 bg-indigo-950/80 border-indigo-500/30'
      : 'text-amber-400 bg-amber-950/80 border-amber-500/30';

  // Generate ASCII-like credibility visual bar: █████████░ 91%
  const filledBlocks = Math.round(candidate.credibilityScore / 10);
  const emptyBlocks = Math.max(0, 10 - filledBlocks);
  const credibilityBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  return (
    <div className={`card-hover relative flex flex-col justify-between border rounded-2xl p-5 transition-all duration-200 ${
      candidate.isCurrentUser
        ? 'border-indigo-500/50 bg-gradient-to-b from-[#0e162d]/90 to-[#0B0F1B]/95 shadow-lg shadow-indigo-950/40'
        : isShortlisted
        ? 'border-indigo-700/60 bg-[#0B0F1B]/95 shadow-md shadow-indigo-950/20'
        : 'border-gray-800 bg-[#0B0F1B]/90'
    }`}>
      {candidate.isCurrentUser && (
        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold tracking-wider uppercase shadow flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Your Discoverable Profile
        </div>
      )}

      <div>
        {/* Top Header: Avatar, Name, Role, College, Match Score */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-13 h-13 rounded-full object-cover border border-gray-700 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  onClick={onViewProfile}
                  className="font-bold text-white text-base leading-tight hover:text-indigo-300 cursor-pointer transition"
                >
                  {candidate.name}
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {candidate.credibilityScore}% Credibility
                </span>
              </div>
              <p className="text-xs text-indigo-400 font-semibold mt-0.5">{candidate.role}</p>
              <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                <span>🏛️ {candidate.college}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-gray-400" /> {candidate.location}
                </span>
              </p>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="text-right shrink-0">
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-mono font-extrabold ${matchColor}`}>
              <span>{matchScore}%</span>
              <span className="text-[10px] font-normal uppercase tracking-wider text-gray-400">Match</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1 font-mono">{candidate.availability}</div>
          </div>
        </div>

        {/* Concrete Match Reasoning Bullets (Never bare percentage!) */}
        <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800/80 mb-4 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            <span>Verified Match Evidence</span>
            <span className="text-indigo-400 font-mono">Algorithm Score</span>
          </div>
          {reasoningBullets.map((bullet, idx) => {
            const isVerified = bullet.startsWith('✓');
            return (
              <div key={idx} className="flex items-start gap-1.5 text-xs">
                {isVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span className={isVerified ? 'text-gray-300' : 'text-gray-400'}>
                  {bullet.replace(/^[✓○]\s*/, '')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Credibility Architecture Meter */}
        <div className="p-3 rounded-xl bg-gray-900/50 border border-gray-800/70 mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-400 font-medium">Credibility Index</span>
            <span className="font-mono text-emerald-400 font-bold text-xs">{candidate.credibilityScore}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="font-mono text-emerald-400 tracking-wider text-sm select-none">
              {credibilityBar}
            </div>
            <span className="text-[11px] text-gray-500 font-mono">Platform Tested</span>
          </div>
        </div>

        {/* Triad Proof Signals: Projects, Assessment, GitHub */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-gray-900/30 border border-gray-800/50 mb-4 text-center">
          <div>
            <div className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5" /> {candidate.verifiedProjectsCount}
            </div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Verified Projects</div>
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-indigo-400 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5" /> {candidate.assessmentScore}%
            </div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Assessment</div>
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-blue-400 flex items-center justify-center gap-1">
              <GitBranch className="w-3.5 h-3.5" /> {candidate.githubEvidence}
            </div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">GitHub Proof</div>
          </div>
        </div>

        {/* Skills: Clear Visual Distinction: Claimed vs. Verified */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium mb-1.5">
            <span>Relevant Skills</span>
            <span className="text-[10px] font-mono text-gray-400">
              <span className="text-emerald-400 font-semibold">{candidate.skills.filter((s) => s.status === 'VERIFIED').length} Verified</span>
              {' · '}
              <span className="text-gray-400">{candidate.skills.filter((s) => s.status === 'CLAIMED').length} Claimed</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((skill) => {
              const isVer = skill.status === 'VERIFIED';
              return (
                <span
                  key={skill.name}
                  className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
                    isVer
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-xs'
                      : 'bg-gray-900/80 text-gray-400 border-gray-700/80'
                  }`}
                  title={`${skill.name} — ${isVer ? `Platform Verified (${skill.score || 90}%)` : 'Self-declared Claim'}`}
                >
                  {isVer ? (
                    <span className="text-emerald-400 font-bold">✓</span>
                  ) : (
                    <span className="text-gray-500 text-[10px] uppercase font-sans">claim</span>
                  )}
                  <span>{skill.name}</span>
                  {isVer && skill.score && (
                    <span className="text-[9px] text-emerald-400/80 ml-0.5">{skill.score}%</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Actions Footer: [ View Profile ] [ Shortlist ] [ Contact ] */}
      <div className="pt-3 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-2 mt-2">
        <button
          type="button"
          onClick={onViewProfile}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold py-1.5 px-2 hover:bg-indigo-950/40 rounded-lg transition flex items-center gap-1"
        >
          <span>View Profile</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Idempotent Shortlist Toggle Button */}
          <button
            type="button"
            onClick={onToggleShortlist}
            className={`btn-sm text-xs py-1.5 px-3 flex items-center gap-1.5 rounded-lg border transition-all ${
              isShortlisted
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/80'
                : 'btn-ghost border-gray-800 hover:border-gray-700 text-gray-300'
            }`}
            title={isShortlisted ? 'Click to remove from shortlist' : 'Add to shortlisted candidates'}
          >
            {isShortlisted ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>✓ Shortlisted</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-gray-400" />
                <span>Shortlist</span>
              </>
            )}
          </button>

          {/* Contact Modal Trigger */}
          <button
            type="button"
            onClick={onContact}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
            title="View Direct Contact Info"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
}
