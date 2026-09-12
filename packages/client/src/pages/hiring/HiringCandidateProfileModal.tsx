import React from 'react';
import { HiringCandidate } from '../../types/hiring';
import VerificationBadge from '../../components/common/VerificationBadge';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  MapPin,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  FileText,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface HiringCandidateProfileModalProps {
  candidate: HiringCandidate | null;
  isOpen: boolean;
  isShortlisted: boolean;
  onToggleShortlist: () => void;
  onOpenContact: () => void;
  onClose: () => void;
}

export default function HiringCandidateProfileModal({
  candidate,
  isOpen,
  isShortlisted,
  onToggleShortlist,
  onOpenContact,
  onClose,
}: HiringCandidateProfileModalProps) {
  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-3xl my-8 rounded-2xl bg-[#17171A] border border-[#2A2A2E] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="p-6 border-b border-[#2A2A2E] bg-[#17171A] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-16 h-16 rounded-full object-cover border border-[#2A2A2E] shrink-0"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-[#F5F5F4] leading-tight">{candidate.name}</h2>
                <span className="text-xs font-mono text-[#3FB65F] bg-[#16261B] px-2.5 py-0.5 rounded-full border border-[#3FB65F]/30 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3FB65F]" />
                  {candidate.credibilityScore}% Credibility
                </span>
                {candidate.isCurrentUser && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E8672E] text-[#0D0D0F]">
                    You
                  </span>
                )}
              </div>
              <p className="text-sm text-[#E8672E] font-medium mt-0.5">{candidate.role}</p>
              <p className="text-xs text-[#A3A3A8] flex items-center gap-1 mt-0.5">
                <span>{candidate.college}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-[#6B6B70]" /> {candidate.location}
                </span>
                <span>·</span>
                <span className="text-[#6B6B70] font-mono">{candidate.availability}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A3A3A8] hover:text-[#F5F5F4] hover:bg-[#1E1E22] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#A3A3A8]">
          {/* Executive Trust Banner */}
          <div className="p-4 rounded-xl bg-[#1E1E22] border border-[#2A2A2E]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3FB65F] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Platform Trust & Evidence Verification
              </span>
              <span className="text-xs font-mono font-bold text-[#3FB65F]">
                {candidate.credibilityScore}/100 Confirmed
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm font-mono text-[#3FB65F] mb-3 select-none">
              <span className="text-xs text-[#A3A3A8] font-sans">
                {candidate.skills.filter((s) => s.status === 'VERIFIED').length} verified skills backed by proctored assessments & audited codebases
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#2A2A2E] text-xs">
              <div>
                <span className="text-[10px] text-[#6B6B70] uppercase font-mono block">Proctored Assessment</span>
                <span className="font-bold text-[#F5F5F4] text-sm">{candidate.assessmentScore}% Benchmark</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6B70] uppercase font-mono block">Verified Projects</span>
                <span className="font-bold text-[#3FB65F] text-sm">{candidate.verifiedProjectsCount} Audited Codebases</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6B70] uppercase font-mono block">GitHub Provenance</span>
                <span className="font-bold text-[#F5F5F4] text-sm">{candidate.githubEvidence}</span>
              </div>
            </div>
          </div>

          {/* Professional Overview */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B70] mb-1.5">Professional Overview</h4>
            <p className="text-xs text-[#A3A3A8] leading-relaxed bg-[#1E1E22] p-3.5 rounded-xl border border-[#2A2A2E]">
              {candidate.bio}
            </p>
          </div>

          {/* Competency Evidence Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B70]">
                Competency Evidence Matrix
              </h4>
              <span className="text-[11px] font-mono text-[#6B6B70]">
                {candidate.skills.filter((s) => s.status === 'VERIFIED').length} Verified · {candidate.skills.filter((s) => s.status === 'CLAIMED').length} Claimed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {candidate.skills.map((skill) => {
                const isVer = skill.status === 'VERIFIED';
                return (
                  <div
                    key={skill.name}
                    className="p-3.5 rounded-xl border border-[#2A2A2E] bg-[#1E1E22] transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F5F5F4] text-sm">{skill.name}</span>
                        {skill.selfDeclaredProficiency && (
                          <span className="text-[10px] font-mono text-[#A3A3A8] bg-[#17171A] px-1.5 py-0.5 rounded border border-[#2A2A2E]">
                            {skill.selfDeclaredProficiency}
                          </span>
                        )}
                      </div>

                      <VerificationBadge status={skill.status} />
                    </div>

                    <div className="space-y-1 text-xs text-[#A3A3A8] font-mono">
                      {isVer ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-[#6B6B70]">Assessment:</span>
                            <span className="text-[#3FB65F] font-bold">{skill.score || skill.assessmentScore || 90}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6B6B70]">Project Evidence:</span>
                            <span className="text-[#F5F5F4]">{skill.portfolioRating || 'Strong'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6B6B70]">GitHub Evidence:</span>
                            <span className="text-[#F5F5F4]">{skill.githubStatus || 'Available'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-[#6B6B70]">Assessment:</span>
                            <span className="text-[#D89A3E]">Pending Verification</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6B6B70]">Claim Type:</span>
                            <span className="text-[#6B6B70]">Self-Reported</span>
                          </div>
                        </>
                      )}
                    </div>

                    {skill.evidenceSummary && (
                      <p className="text-[11px] text-[#6B6B70] mt-2 pt-2 border-t border-[#2A2A2E] leading-relaxed font-sans">
                        {skill.evidenceSummary}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verified Projects */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B70] mb-3">
              Verified Projects & Deliverables
            </h4>
            <div className="space-y-3">
              {candidate.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-[#F5F5F4] text-sm">{proj.title}</h5>
                        {proj.isVerified && (
                          <span className="text-[10px] font-mono text-[#3FB65F] bg-[#16261B] px-1.5 py-0.5 rounded border border-[#3FB65F]/20 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#3FB65F]" /> Audited Codebase
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#E8672E] font-medium">{proj.role}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1 border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4]"
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>Codebase</span>
                          <ExternalLink className="w-3 h-3 text-[#6B6B70]" />
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1 border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#A3A3A8] leading-relaxed">{proj.description}</p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {proj.tech.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17171A] text-[#A3A3A8] border border-[#2A2A2E]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {proj.evidenceNotes && (
                    <div className="text-[11px] text-[#A3A3A8] bg-[#17171A] p-2.5 rounded-lg border border-[#2A2A2E] flex items-start gap-2">
                      <span className="text-[#E8672E] font-semibold text-xs">Proof:</span>
                      <span>{proj.evidenceNotes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Attached Resume */}
          {candidate.resume && (
            <div className="p-4 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#241C16] border border-[#E8672E]/30 flex items-center justify-center text-[#E8672E]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#F5F5F4] block">{candidate.resume.name}</span>
                  <span className="text-[11px] text-[#6B6B70] font-mono">
                    {candidate.resume.sizeBytes ? `${Math.round(candidate.resume.sizeBytes / 1024)} KB` : '1.2 MB'} · Verified PDF
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.success(`Simulating resume download: ${candidate.resume?.name}`)}
                className="btn-ghost text-xs flex items-center gap-1.5 border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Sticky Footer CTA */}
        <div className="p-4 border-t border-[#2A2A2E] bg-[#17171A] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleShortlist}
            className={`btn-sm text-xs py-2 px-4 flex items-center gap-1.5 rounded-lg border transition ${
              isShortlisted
                ? 'bg-[#16261B] text-[#3FB65F] border-[#3FB65F]/40'
                : 'btn-ghost border-[#2A2A2E] text-[#A3A3A8]'
            }`}
          >
            {isShortlisted ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-[#3FB65F]" />
                <span>✓ Shortlisted</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-[#6B6B70]" />
                <span>Shortlist Candidate</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenContact();
              }}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Connect / Contact</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs py-2 px-4 border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
