import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Candidate } from '../../../types/buddy';
import { X, Award, Clock, CheckCircle2, FileCode, ShieldAlert, ArrowRight } from 'lucide-react';

interface VerificationChallengeModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onChallengeSent: (candidateId: string, skillName: string, message: string) => void;
}

export default function VerificationChallengeModal({
  candidate,
  onClose,
  onChallengeSent,
}: VerificationChallengeModalProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>(
    candidate?.skills[0]?.name || 'Primary Skill'
  );
  const [submitting, setSubmitting] = useState(false);

  if (!candidate) return null;

  const handleSendChallenge = () => {
    setSubmitting(true);
    setTimeout(() => {
      onChallengeSent(
        candidate.id,
        selectedSkill,
        `Pre-team challenge: Please complete proctored verification for ${selectedSkill}.`
      );
      toast.success(`Verification challenge on "${selectedSkill}" sent to ${candidate.name}!`);
      setSubmitting(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
      <div className="relative w-full max-w-lg bg-[#0B0F1B] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden p-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/20 mb-1">
              ⚡ Pre-Team Challenge Verification
            </div>
            <h3 className="text-lg font-bold text-white">Send Verification Challenge</h3>
            <p className="text-xs text-gray-400">Request evidence-based task verification from {candidate.name}</p>
          </div>
        </div>

        {/* Target Skill Selection */}
        <div className="mb-4">
          <label className="label text-xs font-semibold text-gray-300 mb-1.5">Skill to Verify</label>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => setSelectedSkill(s.name)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  selectedSkill === s.name
                    ? 'border-indigo-500 bg-indigo-900/30 text-white font-semibold'
                    : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                }`}
              >
                {s.name} {s.status === 'VERIFIED' ? '✓' : '○ Claimed'}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Specs */}
        <div className="p-4 rounded-xl bg-gray-950 border border-gray-800/80 mb-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>Standard Micro-Challenge: {selectedSkill}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" /> 45 mins
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed">
            Candidate receives a sandboxed, time-boxed technical scenario testing real-world capability in{' '}
            <strong className="text-white">{selectedSkill}</strong>. Results and anti-cheat telemetry will be attached directly to their team application.
          </p>

          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
              Evaluation Criteria:
            </span>
            <ul className="space-y-1 text-xs text-gray-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Modularity, maintainability, and clean architecture</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Edge case handling and test resilience</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Execution speed and problem-solving reasoning</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost flex-1 py-2 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendChallenge}
            disabled={submitting}
            className="btn-primary flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 border-0"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Send Challenge</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
