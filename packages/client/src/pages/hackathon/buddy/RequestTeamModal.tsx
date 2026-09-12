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
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Invite to Team</h3>
            <p className="text-xs text-gray-400">{hackathonName}</p>
          </div>
        </div>

        {/* Candidate summary card */}
        <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800/80 mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-11 h-11 rounded-full object-cover border border-gray-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{candidate.name}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {candidate.credibilityScore}% Credibility
                </span>
              </div>
              <p className="text-xs text-gray-400">{candidate.role} · {candidate.college}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-extrabold text-emerald-400 font-mono">{matchScore}%</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Match</div>
          </div>
        </div>

        {/* Match reasoning highlight */}
        <div className="mb-4 bg-gray-900/40 p-3 rounded-xl border border-gray-800/60">
          <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Evidence-Based Alignment
          </p>
          <p className="text-xs text-gray-300">
            {reasoningBullets[0] || 'Matches your required technical skills with verified assessment evidence.'}
          </p>
        </div>

        {/* Message Input */}
        <div className="mb-6">
          <label className="label text-xs font-semibold text-gray-300 mb-1.5">
            Personal Invitation Message <span className="text-gray-500 font-normal">(Optional)</span>
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
            className="btn-ghost flex-1 py-2 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="btn-primary flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-2"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
