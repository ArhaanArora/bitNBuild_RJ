import React from 'react';
import { CandidateMatch, CandidateRequestState } from '../../../types/buddy';
import VerificationBadge from '../../../components/common/VerificationBadge';
import {
  CheckCircle2,
  AlertCircle,
  MapPin,
  MessageSquare,
  UserPlus,
  Zap,
} from 'lucide-react';

interface CandidateCardProps {
  match: CandidateMatch;
  requestState: CandidateRequestState;
  onViewProfile: () => void;
  onRequestJoin: () => void;
  onSendChallenge: () => void;
  onContact: () => void;
}

export default function CandidateCard({
  match,
  requestState,
  onViewProfile,
  onRequestJoin,
  onSendChallenge,
  onContact,
}: CandidateCardProps) {
  const { candidate, matchScore, reasoningBullets } = match;

  // Match badge styling
  const matchColor =
    matchScore >= 90
      ? 'text-[#3FB65F] bg-[#16261B] border-[#3FB65F]/30'
      : matchScore >= 80
      ? 'text-[#E8672E] bg-[#241C16] border-[#E8672E]/30'
      : 'text-[#D89A3E] bg-[#2B2213] border-[#D89A3E]/30';

  return (
    <div className="card-hover relative flex flex-col justify-between border border-[#2A2A2E] bg-[#17171A] p-5 rounded-2xl transition-all duration-200">
      {/* Top Details & Match Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-12 h-12 rounded-full object-cover border border-[#2A2A2E] shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className="font-bold text-[#F5F5F4] text-base leading-tight hover:text-[#E8672E] cursor-pointer transition"
                  onClick={onViewProfile}
                >
                  {candidate.name}
                </h3>
                <span className="text-[10px] font-mono text-[#3FB65F] bg-[#16261B] px-2 py-0.5 rounded-full border border-[#3FB65F]/20 font-semibold">
                  {candidate.credibilityScore}% Credibility
                </span>
              </div>
              <p className="text-xs text-[#E8672E] font-medium mt-0.5">{candidate.role}</p>
              <p className="text-[11px] text-[#6B6B70] flex items-center gap-1 mt-0.5">
                <span>{candidate.college}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-[#6B6B70]" /> {candidate.location}
                </span>
              </p>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="text-right shrink-0">
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-mono font-extrabold ${matchColor}`}>
              <span>{matchScore}%</span>
              <span className="text-[10px] font-normal uppercase tracking-wider text-[#A3A3A8]">Match</span>
            </div>
            <div className="text-[10px] text-[#6B6B70] mt-1 font-mono">{candidate.availability}</div>
          </div>
        </div>

        {/* Concrete Match Reasoning Bullets */}
        <div className="p-3 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] mb-4 space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6B70] block mb-1">
            Matching Evidence Signals
          </span>
          {reasoningBullets.map((bullet, idx) => {
            const isVerified = bullet.startsWith('✓');
            return (
              <div key={idx} className="flex items-start gap-1.5 text-xs">
                {isVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB65F] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#D89A3E] shrink-0 mt-0.5" />
                )}
                <span className={isVerified ? 'text-[#A3A3A8]' : 'text-[#6B6B70]'}>
                  {bullet.replace(/^[✓○]\s*/, '')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Credibility Architecture Meter */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] mb-4 text-center">
          <div>
            <div className="text-xs font-mono font-bold text-[#3FB65F]">{candidate.assessmentOverallScore}%</div>
            <div className="text-[10px] text-[#6B6B70] font-medium uppercase tracking-tight">Assessment</div>
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-[#F5F5F4]">{candidate.portfolioEvidenceRating}</div>
            <div className="text-[10px] text-[#6B6B70] font-medium uppercase tracking-tight">Portfolio</div>
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-[#F5F5F4]">{candidate.githubEvidenceStatus}</div>
            <div className="text-[10px] text-[#6B6B70] font-medium uppercase tracking-tight">GitHub</div>
          </div>
        </div>

        {/* Skills with Unambiguous Claimed vs Verified Distinctions */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-[#6B6B70] font-medium mb-1.5">
            <span>Competency Evidence</span>
            <span className="text-[10px] font-mono text-[#6B6B70]">
              {candidate.skills.filter((s) => s.status === 'VERIFIED').length} verified / {candidate.skills.length} total
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((skill) => (
              <span
                key={skill.name}
                className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg border ${
                  skill.status === 'VERIFIED'
                    ? 'bg-[#16261B] text-[#3FB65F] border-[#3FB65F]/30'
                    : 'bg-[#1E1E22] text-[#A3A3A8] border-[#2A2A2E]'
                }`}
              >
                {skill.status === 'VERIFIED' ? (
                  <span className="text-[#3FB65F] font-bold">✓</span>
                ) : (
                  <span className="text-[#6B6B70]">○</span>
                )}
                <span>{skill.name}</span>
                {skill.status === 'VERIFIED' && (
                  <span className="text-[9px] text-[#3FB65F]/80 ml-0.5">{skill.score}%</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 border-t border-[#2A2A2E] flex flex-wrap items-center justify-between gap-2 mt-2">
        <button
          type="button"
          onClick={onViewProfile}
          className="text-xs text-[#E8672E] hover:text-[#F3773D] font-medium py-1.5 px-2 hover:bg-[#241C16] rounded-lg transition"
        >
          View Evidence Profile →
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onContact}
            className="btn-ghost text-xs py-1.5 px-3 border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4] flex items-center gap-1.5"
            title="View Direct Contact Info"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#E8672E]" />
            <span>Connect</span>
          </button>

          {requestState === 'IDLE' && (
            <button
              type="button"
              onClick={onRequestJoin}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Request to Join</span>
            </button>
          )}

          {requestState === 'REQUEST_SENT' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-[#3FB65F] bg-[#16261B] px-2.5 py-1 rounded-lg border border-[#3FB65F]/30 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Request Sent
              </span>
              <button
                type="button"
                onClick={onSendChallenge}
                className="text-xs py-1 px-2.5 rounded-lg bg-[#2B2213] hover:bg-[#382C18] text-[#D89A3E] border border-[#D89A3E]/30 flex items-center gap-1 transition"
                title="Send a mini verification challenge"
              >
                <Zap className="w-3 h-3 text-[#D89A3E]" />
                <span>Verify</span>
              </button>
            </div>
          )}

          {requestState === 'CHALLENGE_SENT' && (
            <span className="text-[11px] font-mono text-[#D89A3E] bg-[#2B2213] px-2.5 py-1 rounded-lg border border-[#D89A3E]/30 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" /> Challenge Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
