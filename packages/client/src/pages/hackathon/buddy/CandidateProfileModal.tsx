import React from 'react';
import { Candidate, CandidateMatch } from '../../../types/buddy';
import VerificationBadge from '../../../components/common/VerificationBadge';
import {
  X,
  ShieldCheck,
  ExternalLink,
  MapPin,
  FolderGit2,
  UserPlus,
  MessageSquare,
} from 'lucide-react';

interface CandidateProfileModalProps {
  candidate: Candidate | null;
  match?: CandidateMatch | null;
  onRequestJoin: (candidate: Candidate) => void;
  onContact: (candidate: Candidate) => void;
  onClose: () => void;
}

export default function CandidateProfileModal({
  candidate,
  match,
  onRequestJoin,
  onContact,
  onClose,
}: CandidateProfileModalProps) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#17171A] rounded-2xl border border-[#2A2A2E] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2E] shrink-0 bg-[#17171A]">
          <div className="flex items-center gap-3">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-14 h-14 rounded-full object-cover border border-[#2A2A2E]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#F5F5F4]">{candidate.name}</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#3FB65F]" />
                  {candidate.credibilityScore}% Credibility
                </span>
              </div>
              <p className="text-xs text-[#E8672E] font-medium">{candidate.headline}</p>
              <div className="flex items-center gap-3 text-xs text-[#6B6B70] mt-1">
                <span>{candidate.college}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-[#6B6B70]" /> {candidate.location}
                </span>
                <span>·</span>
                <span>{candidate.hackathonsAttended} Hackathons</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#A3A3A8] hover:text-[#F5F5F4] p-1.5 rounded-lg hover:bg-[#1E1E22] transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-[#A3A3A8]">
          {/* Match Score Banner */}
          {match && (
            <div className="p-4 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#3FB65F] font-semibold block mb-0.5">
                  Team Compatibility
                </span>
                <p className="text-xs text-[#A3A3A8]">
                  {match.reasoningBullets[0] || 'Matches your required technical skills with verified evidence.'}
                </p>
              </div>
              <div className="text-right pl-4">
                <div className="text-2xl font-black text-[#3FB65F] font-mono">{match.matchScore}%</div>
                <div className="text-[10px] text-[#6B6B70] uppercase font-semibold">Match</div>
              </div>
            </div>
          )}

          {/* Bio */}
          <div>
            <h4 className="text-xs font-semibold text-[#6B6B70] uppercase tracking-wider mb-2">About Candidate</h4>
            <p className="text-xs text-[#A3A3A8] leading-relaxed bg-[#1E1E22] p-3.5 rounded-xl border border-[#2A2A2E]">
              {candidate.bio}
            </p>
          </div>

          {/* Credibility Architecture */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-[#6B6B70] uppercase tracking-wider">
                Credibility Breakdown (Evidence Sources)
              </h4>
              <span className="text-[11px] font-mono text-[#6B6B70]">Total Trust Score: {candidate.credibilityScore}/100</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#1E1E22] border border-[#2A2A2E]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#A3A3A8] font-medium">Skill Assessment</span>
                  <span className="text-xs font-mono font-bold text-[#3FB65F]">{candidate.assessmentOverallScore}%</span>
                </div>
                <p className="text-[10px] text-[#6B6B70]">Platform proctored benchmarks.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1E1E22] border border-[#2A2A2E]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#A3A3A8] font-medium">Portfolio Evidence</span>
                  <span className="text-xs font-mono font-bold text-[#F5F5F4]">{candidate.portfolioEvidenceRating}</span>
                </div>
                <p className="text-[10px] text-[#6B6B70]">Validated case studies & deliverables.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1E1E22] border border-[#2A2A2E]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#A3A3A8] font-medium">GitHub Verification</span>
                  <span className="text-xs font-mono font-bold text-[#F5F5F4]">{candidate.githubEvidenceStatus}</span>
                </div>
                <p className="text-[10px] text-[#6B6B70]">Commit activity & code complexity audited.</p>
              </div>
            </div>
          </div>

          {/* Per-Skill Evidence Breakdown Table */}
          <div>
            <h4 className="text-xs font-semibold text-[#6B6B70] uppercase tracking-wider mb-3">
              Per-Skill Verification Matrix
            </h4>
            <div className="overflow-x-auto rounded-xl border border-[#2A2A2E]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#17171A] border-b border-[#2A2A2E] text-[#6B6B70] font-mono text-[11px]">
                    <th className="py-2.5 px-3.5">Skill</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Assessment %</th>
                    <th className="py-2.5 px-3 text-center">Portfolio</th>
                    <th className="py-2.5 px-3 text-center">GitHub</th>
                    <th className="py-2.5 px-3.5">Evidence Grounding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2E] bg-[#1E1E22]">
                  {candidate.skills.map((s) => (
                    <tr key={s.name} className="hover:bg-[#17171A] transition">
                      <td className="py-3 px-3.5 font-semibold text-[#F5F5F4]">
                        {s.name}
                        <span className="text-[10px] text-[#6B6B70] font-normal block">{s.category}</span>
                      </td>
                      <td className="py-3 px-3">
                        <VerificationBadge status={s.status} />
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold">
                        {s.assessmentScore ? (
                          <span className="text-[#3FB65F]">{s.assessmentScore}%</span>
                        ) : (
                          <span className="text-[#6B6B70]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-[11px]">
                        <span
                          className={`font-medium ${
                            s.portfolioRating === 'Strong'
                              ? 'text-[#F5F5F4]'
                              : s.portfolioRating === 'Moderate'
                              ? 'text-[#D89A3E]'
                              : 'text-[#6B6B70]'
                          }`}
                        >
                          {s.portfolioRating || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-[11px]">
                        <span
                          className={`font-medium ${
                            s.githubStatus === 'Verified Repos'
                              ? 'text-[#3FB65F]'
                              : s.githubStatus === 'Active Commits'
                              ? 'text-[#F5F5F4]'
                              : 'text-[#6B6B70]'
                          }`}
                        >
                          {s.githubStatus || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-[#6B6B70] text-[11px] leading-relaxed">
                        {s.evidenceSummary || 'Self-declared competency claim.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verified Projects Showcase */}
          <div>
            <h4 className="text-xs font-semibold text-[#6B6B70] uppercase tracking-wider mb-3">
              Verified Project Artifacts
            </h4>
            <div className="space-y-3">
              {candidate.projects.map((proj) => (
                <div key={proj.title} className="p-4 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-[#F5F5F4]">{proj.title}</h5>
                      <p className="text-xs text-[#E8672E] font-medium">{proj.role}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#3FB65F] hover:underline flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#A3A3A8] hover:text-[#F5F5F4] flex items-center gap-1 font-medium"
                        >
                          <FolderGit2 className="w-3.5 h-3.5" /> Codebase
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#A3A3A8] leading-relaxed">{proj.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tech.map((t) => (
                      <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17171A] text-[#A3A3A8] border border-[#2A2A2E]">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2 text-[11px] text-[#3FB65F] bg-[#16261B] px-3 py-1.5 rounded-lg border border-[#3FB65F]/20 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{proj.evidenceNotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#2A2A2E] bg-[#17171A] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onContact(candidate)}
            className="btn-ghost flex items-center gap-2 text-xs py-2 px-4 text-[#A3A3A8] hover:text-[#F5F5F4] border-[#2A2A2E]"
          >
            <MessageSquare className="w-4 h-4 text-[#E8672E]" />
            <span>Connect / Contact Info</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs py-2 px-4 border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestJoin(candidate);
              }}
              className="btn-primary flex items-center gap-2 text-xs py-2 px-5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Request to Join</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
