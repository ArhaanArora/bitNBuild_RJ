import React from 'react';
import { HiringMatch } from '../../types/hiring';
import VerificationBadge from '../../components/common/VerificationBadge';
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
  ArrowRight,
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

  return (
    <div
      className={`bg-[#17171A] border rounded-xl p-5 flex flex-col justify-between transition-all relative ${
        candidate.isCurrentUser
          ? 'border-[#E8672E]/50'
          : isShortlisted
          ? 'border-[#38383D]'
          : 'border-[#2A2A2E] hover:border-[#38383D]'
      }`}
    >
      {candidate.isCurrentUser && (
        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-[#E8672E] text-[#0D0D0F] text-[10px] font-bold tracking-wider uppercase">
          Your Profile
        </div>
      )}

      <div>
        {/* Top Header: Avatar, Name, Role, College, Match Score */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-12 h-12 rounded-full object-cover border border-[#2A2A2E] shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  onClick={onViewProfile}
                  className="font-semibold text-[#F5F5F4] text-base leading-tight hover:text-[#E8672E] cursor-pointer transition"
                >
                  {candidate.name}
                </h3>
                <span className="text-[10px] font-mono text-[#3FB65F] bg-[#16261B] px-2 py-0.5 rounded border border-[#3FB65F]/30 font-medium">
                  {candidate.credibilityScore}% Credibility
                </span>
              </div>
              <p className="text-xs text-[#A3A3A8] font-medium mt-0.5">{candidate.role}</p>
              <p className="text-[11px] text-[#6B6B70] flex items-center gap-1 mt-0.5">
                <span>🏛️ {candidate.college}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-[#6B6B70]" /> {candidate.location}
                </span>
              </p>
            </div>
          </div>

          {/* Match Score */}
          <div className="text-right shrink-0">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#2A2A2E] bg-[#1E1E22] text-xs font-mono font-bold text-[#E8672E]">
              <span>{matchScore}%</span>
              <span className="text-[10px] font-normal uppercase tracking-wider text-[#A3A3A8]">
                Match
              </span>
            </div>
            <div className="text-[10px] text-[#6B6B70] mt-1 font-mono">
              {candidate.availability}
            </div>
          </div>
        </div>

        {/* Concrete Match Reasoning Bullets */}
        <div className="p-3 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] mb-4 space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6B70] mb-1">
            Matching Evidence
          </div>
          {reasoningBullets.map((bullet, idx) => {
            const isVerified = bullet.startsWith('✓');
            return (
              <div key={idx} className="flex items-start gap-1.5 text-xs">
                {isVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB65F] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#D89A3E] shrink-0 mt-0.5" />
                )}
                <span className={isVerified ? 'text-[#D4D4D8]' : 'text-[#A3A3A8]'}>
                  {bullet.replace(/^[✓○]\s*/, '')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Verification Summary Banner (Section 14) */}
        <div className="p-3 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] mb-3.5 space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#6B6B70]">Assessment</span>
            <span className="text-white font-semibold">Completed (10 Qs)</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#6B6B70]">Supporting Evidence</span>
            <span className="text-[#D4D4D8] text-[10px] text-right truncate max-w-[180px]">
              {(candidate.supportingEvidence || ['Resume', 'Assessment', 'Rough Work']).join(', ')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#6B6B70]">Integrity Rating</span>
            <span className="text-[#3FB65F] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {candidate.integrityRating || 'Low Concern'}
            </span>
          </div>
        </div>

        {/* Triad Proof Signals */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] mb-4 text-center">
          <div>
            <div className="text-xs font-mono font-bold text-[#3FB65F] flex items-center justify-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5" /> {candidate.verifiedProjectsCount}
            </div>
            <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Projects</div>
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-[#F5F5F4] flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#E8672E]" /> {candidate.assessmentScore}%
            </div>
            <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Assessment</div>
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-[#A3A3A8] flex items-center justify-center gap-1">
              <GitBranch className="w-3.5 h-3.5" /> {candidate.githubEvidence}
            </div>
            <div className="text-[10px] text-[#6B6B70] uppercase font-medium">GitHub</div>
          </div>
        </div>

        {/* Skills: Claimed vs. Verified */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-[#6B6B70] font-medium mb-1.5">
            <span>Key Competencies</span>
            <span className="font-mono">
              <span className="text-[#3FB65F]">
                {candidate.skills.filter((s) => s.status === 'VERIFIED').length} Verified
              </span>
              {' · '}
              <span className="text-[#A3A3A8]">
                {candidate.skills.filter((s) => s.status === 'CLAIMED').length} Claimed
              </span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((skill) => (
              <VerificationBadge
                key={skill.name}
                status={skill.status}
                score={skill.score}
                showScore={false}
                className="py-0.5"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 border-t border-[#2A2A2E] flex flex-wrap items-center justify-between gap-2 mt-2">
        <button
          type="button"
          onClick={onViewProfile}
          className="text-xs text-[#F5F5F4] hover:text-[#E8672E] font-medium py-1.5 transition flex items-center gap-1"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          {/* Shortlist Toggle */}
          <button
            type="button"
            onClick={onToggleShortlist}
            className={`btn-sm text-xs py-1.5 px-3 flex items-center gap-1.5 rounded-lg border transition-all ${
              isShortlisted
                ? 'bg-[#16261B] text-[#3FB65F] border-[#3FB65F]/40'
                : 'btn-ghost'
            }`}
          >
            {isShortlisted ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-[#3FB65F]" />
                <span>Shortlisted</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-[#A3A3A8]" />
                <span>Shortlist</span>
              </>
            )}
          </button>

          {/* Contact Trigger */}
          <button
            type="button"
            onClick={onContact}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#E8672E]" />
            <span>Contact</span>
          </button>
        </div>
      </div>
    </div>
  );
}
