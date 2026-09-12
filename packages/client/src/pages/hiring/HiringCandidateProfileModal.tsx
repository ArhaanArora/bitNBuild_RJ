import React from 'react';
import { HiringCandidate } from '../../types/hiring';
import {
  X,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  GitBranch,
  MapPin,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  Sparkles,
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

  // Credibility bar
  const filledBlocks = Math.round(candidate.credibilityScore / 10);
  const emptyBlocks = Math.max(0, 10 - filledBlocks);
  const credibilityBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-3xl my-8 rounded-2xl bg-[#0b101d] border border-indigo-900/60 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="p-6 border-b border-gray-800 bg-[#0e1424]/90 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/40 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-white leading-tight">{candidate.name}</h2>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {candidate.credibilityScore}% Credibility
                </span>
                {candidate.isCurrentUser && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    You
                  </span>
                )}
              </div>
              <p className="text-sm text-indigo-400 font-semibold mt-0.5">{candidate.role}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <span>🏛️ {candidate.college}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-gray-400" /> {candidate.location}
                </span>
                <span>·</span>
                <span className="text-gray-400 font-mono">{candidate.availability}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300">
          {/* Executive Trust Banner (Under 10-second trust check) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-indigo-950/30 to-gray-950 border border-emerald-500/30">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Platform Trust & Evidence Verification
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {candidate.credibilityScore}/100 Confirmed
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm font-mono text-emerald-400 mb-3 select-none">
              <span>{credibilityBar}</span>
              <span className="text-xs text-gray-300 font-sans">
                {candidate.skills.filter((s) => s.status === 'VERIFIED').length} verified skills backed by tests & projects
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-800/80 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono block">Proctored Assessment</span>
                <span className="font-bold text-indigo-300 text-sm">{candidate.assessmentScore}% Platform Benchmark</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono block">Verified Projects</span>
                <span className="font-bold text-emerald-300 text-sm">{candidate.verifiedProjectsCount} Codebase Audits</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono block">GitHub Provenance</span>
                <span className="font-bold text-blue-300 text-sm">{candidate.githubEvidence}</span>
              </div>
            </div>
          </div>

          {/* Bio / Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Professional Overview</h4>
            <p className="text-xs text-gray-300 leading-relaxed bg-gray-950/60 p-3.5 rounded-xl border border-gray-800">
              {candidate.bio}
            </p>
          </div>

          {/* Verified vs Claimed Skills Breakdown (Section 7 Spec) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Competency Evidence Matrix (Claimed vs Verified)
              </h4>
              <span className="text-[11px] font-mono text-gray-400">
                {candidate.skills.filter((s) => s.status === 'VERIFIED').length} Verified · {candidate.skills.filter((s) => s.status === 'CLAIMED').length} Claimed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {candidate.skills.map((skill) => {
                const isVer = skill.status === 'VERIFIED';
                return (
                  <div
                    key={skill.name}
                    className={`p-3 rounded-xl border transition-all ${
                      isVer
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-gray-950/50 border-gray-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{skill.name}</span>
                        {skill.selfDeclaredProficiency && (
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                            {skill.selfDeclaredProficiency}
                          </span>
                        )}
                      </div>

                      {/* Visual Distinction: Solid badge for Verified, Outline for Claimed */}
                      {isVer ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-gray-900 text-gray-400 border border-gray-700">
                          <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                          <span>Claimed</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-gray-400 font-mono">
                      {isVer ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Assessment:</span>
                            <span className="text-emerald-400 font-bold">{skill.score || skill.assessmentScore || 90}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Project Evidence:</span>
                            <span className="text-indigo-300">{skill.portfolioRating || 'Strong'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">GitHub Evidence:</span>
                            <span className="text-blue-300">{skill.githubStatus || 'Available'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Assessment:</span>
                            <span className="text-amber-400/80">Pending Verification</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Claim Type:</span>
                            <span className="text-gray-400">Self-Reported Coursework</span>
                          </div>
                        </>
                      )}
                    </div>

                    {skill.evidenceSummary && (
                      <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-800/60 leading-relaxed font-sans">
                        {skill.evidenceSummary}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verified Projects / Case Studies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Verified Projects & Production Deliverables
            </h4>
            <div className="space-y-3">
              {candidate.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gray-950/70 border border-gray-800 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-white text-sm">{proj.title}</h5>
                        {proj.isVerified && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Audited Codebase
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-indigo-400 font-medium">{proj.role}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost btn-sm text-xs py-1 px-2.5 flex items-center gap-1 border-gray-700 hover:border-gray-600 text-gray-300"
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>Codebase</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost btn-sm text-xs py-1 px-2.5 flex items-center gap-1 border-gray-700 hover:border-gray-600 text-gray-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">{proj.description}</p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {proj.tech.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 text-indigo-300 border border-gray-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {proj.evidenceNotes && (
                    <div className="text-[11px] text-gray-400 bg-gray-900/60 p-2.5 rounded-lg border border-gray-800/80 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{proj.evidenceNotes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Attached Resume */}
          {candidate.resume && (
            <div className="p-4 rounded-xl bg-gray-950/70 border border-gray-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">{candidate.resume.name}</span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {candidate.resume.sizeBytes ? `${Math.round(candidate.resume.sizeBytes / 1024)} KB` : '1.2 MB'} · Verified PDF
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.success(`Simulating resume download: ${candidate.resume?.name}`)}
                className="btn-ghost btn-sm text-xs flex items-center gap-1.5 border-gray-700 text-gray-300 hover:text-white"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Sticky Footer CTA */}
        <div className="p-4 border-t border-gray-800 bg-[#0e1424] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleShortlist}
            className={`btn-sm text-xs py-2 px-4 flex items-center gap-1.5 rounded-lg border transition ${
              isShortlisted
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                : 'btn-ghost border-gray-700 text-gray-300'
            }`}
          >
            {isShortlisted ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                <span>✓ Shortlisted</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-gray-400" />
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
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Connect / Contact</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs py-2 px-4 border-gray-700 text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
