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
      <div className="relative w-full max-w-lg bg-[#17171A] rounded-2xl border border-[#2A2A2E] shadow-2xl overflow-hidden p-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A3A3A8] hover:text-[#F5F5F4] p-1 rounded-lg hover:bg-[#1E1E22] transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#2B2213] border border-[#D89A3E]/30 flex items-center justify-center text-[#D89A3E] shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-[#D89A3E] bg-[#2B2213] px-2 py-0.5 rounded border border-[#D89A3E]/20 mb-1">
              ⚡ Skill Verification Challenge
            </div>
            <h3 className="text-lg font-bold text-[#F5F5F4]">Send Verification Challenge</h3>
            <p className="text-xs text-[#A3A3A8]">Request proctored task verification from {candidate.name}</p>
          </div>
        </div>

        {/* Target Skill Selection */}
        <div className="mb-4">
          <label className="label text-xs font-semibold text-[#A3A3A8] mb-1.5">Skill to Verify</label>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => setSelectedSkill(s.name)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  selectedSkill === s.name
                    ? 'border-[#E8672E] bg-[#241C16] text-[#F5F5F4] font-semibold'
                    : 'border-[#2A2A2E] bg-[#1E1E22] text-[#A3A3A8] hover:border-[#38383D]'
                }`}
              >
                {s.name} {s.status === 'VERIFIED' ? '✓' : '○ Claimed'}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Specs */}
        <div className="p-4 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] mb-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5F4]">
              <FileCode className="w-4 h-4 text-[#E8672E]" />
              <span>Standard Micro-Challenge: {selectedSkill}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-[#D89A3E] bg-[#2B2213] px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" /> 45 mins
            </div>
          </div>

          <p className="text-xs text-[#A3A3A8] leading-relaxed">
            Candidate receives a proctored technical task testing capability in{' '}
            <strong className="text-[#F5F5F4]">{selectedSkill}</strong>. Results and telemetry are verified directly on their profile.
          </p>

          <div>
            <span className="text-[11px] font-semibold text-[#6B6B70] uppercase tracking-wider block mb-1.5">
              Evaluation Criteria:
            </span>
            <ul className="space-y-1 text-xs text-[#A3A3A8]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB65F] shrink-0" />
                <span>Clean architecture & maintainability</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB65F] shrink-0" />
                <span>Edge case handling & correctness</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB65F] shrink-0" />
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
            className="btn-ghost flex-1 py-2.5 text-xs font-semibold border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendChallenge}
            disabled={submitting}
            className="btn-primary flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-[#0D0D0F] border-t-transparent rounded-full animate-spin" />
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
