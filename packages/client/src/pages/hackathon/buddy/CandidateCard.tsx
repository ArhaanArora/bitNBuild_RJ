import React from 'react';
import { CandidateMatch, CandidateRequestState } from '../../../types/buddy';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ExternalLink,
  MessageSquare,
  UserPlus,
  Send,
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
      ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30'
      : matchScore >= 80
      ? 'text-indigo-400 bg-indigo-950/80 border-indigo-500/30'
      : 'text-amber-400 bg-amber-950/80 border-amber-500/30';

  return (
    <div className="card-hover relative flex flex-col justify-between border-gray-800 bg-[#0B0F1B]/90 p-5 rounded-2xl transition-all duration-200">
      {/* Top Details & Match Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-12 h-12 rounded-full object-cover border border-gray-700 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base leading-tight hover:text-indigo-300 cursor-pointer" onClick={onViewProfile}>
                  {candidate.name}
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/20 font-semibold">
                  {candidate.credibilityScore}% Credibility
                </span>
              </div>
              <p className="text-xs text-indigo-400 font-medium mt-0.5">{candidate.role}</p>
              <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
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

        {/* Concrete Match Reasoning Bullets */}
        <div className="p-3 rounded-xl bg-gray-950/70 border border-gray-800/80 mb-4 space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
            Matching Evidence Signals
          </span>
          {reasoningBullets.map((bullet, idx) => {
            const isVerified = bullet.startsWith('✓');
            return (
              <div key={idx} className="flex items-start gap-1.5 text-xs">
                {isVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span className={isVerified ? 'text-gray-300' : 'text-gray-400'}>{bullet.replace(/^[✓○]\s*/, '')}</span>
              </div>
            );
          })}
        </div>

        {/* Credibility Architecture Meter */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-gray-900/40 border border-gray-800/60 mb-4 text-center">
          <div>
            <div className="text-xs font-mono font-bold text-emerald-400">{candidate.assessmentOverallScore}%</div>
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">Assessment</div>
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-indigo-400">{candidate.portfolioEvidenceRating}</div>
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">Portfolio Evidence</div>
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-blue-400">{candidate.githubEvidenceStatus}</div>
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">GitHub Status</div>
          </div>
        </div>

        {/* Skills with Unambiguous Claimed vs Verified Distinctions */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium mb-1.5">
            <span>Competency Evidence</span>
            <span className="text-[10px] font-mono text-gray-400">
              {candidate.skills.filter((s) => s.status === 'VERIFIED').length} verified / {candidate.skills.length} total
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((skill) => (
              <span
                key={skill.name}
                className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg border ${
                  skill.status === 'VERIFIED'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                    : 'bg-gray-900/80 text-gray-400 border-gray-700/80'
                }`}
              >
                {skill.status === 'VERIFIED' ? (
                  <span className="text-emerald-400 font-bold">✓</span>
                ) : (
                  <span className="text-gray-500">○</span>
                )}
                <span>{skill.name}</span>
                {skill.status === 'VERIFIED' && (
                  <span className="text-[9px] text-emerald-500/80 ml-0.5">{skill.score}%</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-2 mt-2">
        <button
          type="button"
          onClick={onViewProfile}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold py-1.5 px-2 hover:bg-indigo-950/30 rounded-lg transition"
        >
          View Evidence Profile →
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onContact}
            className="btn-ghost text-xs py-1.5 px-3 border-gray-800 hover:border-gray-700 text-gray-300 flex items-center gap-1.5"
            title="View Direct Contact Info"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Connect</span>
          </button>

          {requestState === 'IDLE' && (
            <button
              type="button"
              onClick={onRequestJoin}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Request to Join</span>
            </button>
          )}

          {requestState === 'REQUEST_SENT' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Request Sent
              </span>
              <button
                type="button"
                onClick={onSendChallenge}
                className="text-xs py-1 px-2.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition"
                title="Send a mini verification challenge"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Verify</span>
              </button>
            </div>
          )}

          {requestState === 'CHALLENGE_SENT' && (
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-500/30 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" /> Challenge Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
