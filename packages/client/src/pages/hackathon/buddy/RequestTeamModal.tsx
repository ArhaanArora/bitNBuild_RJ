import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CandidateMatch } from '../../../types/buddy';
import { X, UserPlus, Sparkles, CheckCircle2, Shield } from 'lucide-react';

interface RequestTeamModalProps {
  match: CandidateMatch | null;
  hackathonName: string;
  onClose: () => void;
  onConfirm: (candidateId: string, message: string) => void;
}

export default function RequestTeamModal({
  match,
  hackathonName,
  onClose,
  onConfirm,
}: RequestTeamModalProps) {
  const [message, setMessage] = useState(
    `Hey ${match?.candidate.name || 'there'}, we saw your verified assessment and evidence on the platform. We are forming a team for ${hackathonName || 'the hackathon'} and would love to build together!`
  );
  const [sending, setSending] = useState(false);

  if (!match) return null;
  const { candidate, matchScore, reasoningBullets } = match;

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      onConfirm(candidate.id, message);
      toast.success(`Team request sent to ${candidate.name}!`);
      setSending(false);
      onClose();
    }, 400);
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
          <div className="w-10 h-10 rounded-xl bg-[#241C16] border border-[#E8672E]/30 flex items-center justify-center text-[#E8672E] shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F5F5F4]">Invite to Team</h3>
            <p className="text-xs text-[#A3A3A8]">{hackathonName}</p>
          </div>
        </div>

        {/* Candidate summary card */}
        <div className="p-3.5 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-11 h-11 rounded-full object-cover border border-[#2A2A2E]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#F5F5F4] text-sm">{candidate.name}</span>
                <span className="text-[10px] font-mono text-[#3FB65F] bg-[#16261B] px-2 py-0.5 rounded-full border border-[#3FB65F]/20">
                  {candidate.credibilityScore}% Credibility
                </span>
              </div>
              <p className="text-xs text-[#E8672E]">{candidate.role} · {candidate.college}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-extrabold text-[#3FB65F] font-mono">{matchScore}%</div>
            <div className="text-[10px] text-[#6B6B70] uppercase tracking-wider font-semibold">Match</div>
          </div>
        </div>

        {/* Match reasoning highlight */}
        <div className="mb-4 bg-[#1E1E22] p-3 rounded-xl border border-[#2A2A2E]">
          <p className="text-[11px] font-semibold text-[#E8672E] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#E8672E]" /> Evidence Alignment
          </p>
          <p className="text-xs text-[#A3A3A8]">
            {reasoningBullets[0] || 'Matches your required technical skills with verified assessment evidence.'}
          </p>
        </div>

        {/* Message Input */}
        <div className="mb-6">
          <label className="label text-xs font-semibold text-[#A3A3A8] mb-1.5">
            Personal Invitation Message <span className="text-[#6B6B70] font-normal">(Optional)</span>
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input text-xs leading-relaxed"
            placeholder="Introduce your project idea or track you are targeting..."
          />
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
            onClick={handleSend}
            disabled={sending}
            className="btn-primary flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-[#0D0D0F] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Send Request</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
