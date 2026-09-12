import React from 'react';
import { Candidate, CandidateMatch } from '../../../types/buddy';
import {
  X,
  ShieldCheck,
  Award,
  CheckCircle2,
  ExternalLink,
  Code2,
  FileText,
  MapPin,
  Sparkles,
  GitBranch,
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
      <div className="relative w-full max-w-3xl bg-[#0B0F1B] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0 bg-gray-950/60">
          <div className="flex items-center gap-3">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-semibold">
                  {candidate.credibilityScore}% Credibility
                </span>
              </div>
              <p className="text-xs text-gray-400">{candidate.headline}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span>🏛️ {candidate.college}</span>
                <span>📍 {candidate.location}</span>
                <span>⚡ {candidate.hackathonsAttended} Hackathons</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Match Score Banner (if match available) */}
          {match && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-gray-900 to-indigo-950/30 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-0.5">
                  Algorithmic Team Compatibility
                </span>
                <p className="text-xs text-gray-300">
                  {match.reasoningBullets[0] || 'Matches your required technical skills with verified evidence.'}
                </p>
              </div>
              <div className="text-right pl-4">
                <div className="text-2xl font-black text-emerald-400 font-mono">{match.matchScore}%</div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Match</div>
              </div>
            </div>
          )}

          {/* Bio */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About Candidate</h4>
            <p className="text-xs text-gray-300 leading-relaxed bg-gray-950 p-3.5 rounded-xl border border-gray-800/80">
              {candidate.bio}
            </p>
          </div>

          {/* Credibility Architecture */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Credibility Breakdown (Evidence Sources)
              </h4>
              <span className="text-[11px] font-mono text-gray-400">Total Trust Score: {candidate.credibilityScore}/100</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-400 font-medium">Skill Assessment</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{candidate.assessmentOverallScore}%</span>
                </div>
                <p className="text-[10px] text-gray-500">Platform proctored coding/design benchmarks.</p>
              </div>

              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-400 font-medium">Portfolio Evidence</span>
                  <span className="text-xs font-mono font-bold text-indigo-400">{candidate.portfolioEvidenceRating}</span>
                </div>
                <p className="text-[10px] text-gray-500">Validated case studies & project artifacts.</p>
              </div>

              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-400 font-medium">GitHub Verification</span>
                  <span className="text-xs font-mono font-bold text-blue-400">{candidate.githubEvidenceStatus}</span>
                </div>
                <p className="text-[10px] text-gray-500">Commit frequency & code complexity audited.</p>
              </div>
            </div>
          </div>

          {/* Per-Skill Evidence Breakdown Table */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Per-Skill Verification Matrix
            </h4>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 font-mono text-[11px]">
                    <th className="py-2.5 px-3.5">Skill</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Assessment %</th>
                    <th className="py-2.5 px-3 text-center">Portfolio</th>
                    <th className="py-2.5 px-3 text-center">GitHub</th>
                    <th className="py-2.5 px-3.5">Evidence Grounding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 bg-gray-950/40">
                  {candidate.skills.map((s) => (
                    <tr key={s.name} className="hover:bg-gray-900/40 transition">
                      <td className="py-3 px-3.5 font-semibold text-white">
                        {s.name}
                        <span className="text-[10px] text-gray-500 font-normal block">{s.category}</span>
                      </td>
                      <td className="py-3 px-3">
                        {s.status === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-400 px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                            ○ Claimed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold">
                        {s.assessmentScore ? (
                          <span className="text-emerald-400">{s.assessmentScore}%</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-[11px]">
                        <span
                          className={`font-medium ${
                            s.portfolioRating === 'Strong'
                              ? 'text-indigo-400'
                              : s.portfolioRating === 'Moderate'
                              ? 'text-amber-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {s.portfolioRating || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-[11px]">
                        <span
                          className={`font-medium ${
                            s.githubStatus === 'Verified Repos'
                              ? 'text-emerald-400'
                              : s.githubStatus === 'Active Commits'
                              ? 'text-blue-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {s.githubStatus || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-gray-400 text-[11px] leading-relaxed">
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
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Verified Project Artifacts
            </h4>
            <div className="space-y-3">
              {candidate.projects.map((proj) => (
                <div key={proj.title} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-white">{proj.title}</h5>
                      <p className="text-xs text-indigo-400">{proj.role}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                        >
                          <FolderGit2 className="w-3.5 h-3.5" /> Codebase
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">{proj.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.tech.map((t) => (
                      <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-gray-300 border border-gray-800">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2 text-[11px] text-emerald-400/90 bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{proj.evidenceNotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800 bg-gray-950 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onContact(candidate)}
            className="btn-ghost flex items-center gap-2 text-xs py-2 px-4 text-gray-300 hover:text-white border-gray-800"
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Connect / Contact Info</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs py-2 px-4"
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
