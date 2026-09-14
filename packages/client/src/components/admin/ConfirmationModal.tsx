import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, X, Loader2 } from 'lucide-react';

interface AffectedEntity {
  label: string;
  value: string;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  title: string;
  description: string;
  affectedEntity?: AffectedEntity;
  isDestructive?: boolean;
  isReversible?: boolean;
  requireReason?: boolean;
  confirmText?: string;
  confirmWord?: string; // If provided, user must type this exact word to confirm
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  affectedEntity,
  isDestructive = true,
  isReversible = false,
  requireReason = false,
  confirmText = 'Confirm Action',
  confirmWord,
  loading = false,
}) => {
  const [reason, setReason] = useState('');
  const [typedConfirm, setTypedConfirm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setTypedConfirm('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmWord && typedConfirm.trim() !== confirmWord) {
      setError(`Please type exactly "${confirmWord}" to proceed`);
      return;
    }
    if (requireReason && !reason.trim()) {
      setError('Audit reason is required for this action');
      return;
    }
    setError('');
    await onConfirm(reason.trim());
  };

  const isConfirmDisabled =
    loading ||
    (confirmWord ? typedConfirm.trim() !== confirmWord : false) ||
    (requireReason ? !reason.trim() : false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`p-5 flex items-start justify-between border-b ${isDestructive ? 'bg-[#2A1717]/40 border-[#E0554E]/20' : 'bg-[#26200E]/40 border-[#D89A3E]/20'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isDestructive ? 'bg-[#2A1717] border-[#E0554E]/30 text-[#E0554E]' : 'bg-[#26200E] border-[#D89A3E]/30 text-[#D89A3E]'}`}>
              {isDestructive ? <AlertTriangle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-base font-bold text-[#F5F5F4] font-mono">
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isReversible
                      ? 'bg-[#16261B] text-[#3FB65F] border-[#3FB65F]/30'
                      : 'bg-[#2A1717] text-[#E0554E] border-[#E0554E]/30'
                  }`}
                >
                  {isReversible ? 'Reversible' : 'Irreversible Action'}
                </span>
                {isDestructive && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E0554E]/10 text-[#E0554E] border border-[#E0554E]/20">
                    High Risk
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="p-1 rounded-lg text-[#6B6B70] hover:text-[#F5F5F4] hover:bg-[#1E1E22] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs font-mono">
          <p className="text-[#A3A3A8] leading-relaxed">
            {description}
          </p>

          {/* Affected Target Card */}
          {affectedEntity && (
            <div className="bg-[#1E1E22] border border-[#2A2A2E] rounded-xl p-3.5 flex items-center justify-between">
              <span className="text-[#6B6B70]">{affectedEntity.label}:</span>
              <span className="text-[#F5F5F4] font-bold truncate max-w-[260px]">
                {affectedEntity.value}
              </span>
            </div>
          )}

          {/* Audit Reason Input */}
          {requireReason && (
            <div className="space-y-1.5">
              <label className="block text-[#A3A3A8] text-xs">
                Audit Reason <span className="text-[#E0554E]">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain justification for compliance audit trail..."
                className="w-full bg-[#111113] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl p-3 text-xs text-[#F5F5F4] placeholder-[#4A4A50] focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Type to Confirm Input */}
          {confirmWord && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-[#A3A3A8] text-xs">
                Type <strong className="text-[#E0554E] select-all font-bold font-mono">{confirmWord}</strong> to confirm:
              </label>
              <input
                type="text"
                value={typedConfirm}
                onChange={(e) => setTypedConfirm(e.target.value)}
                placeholder={`Type "${confirmWord}" here`}
                className="w-full bg-[#111113] border border-[#2A2A2E] focus:border-[#E0554E] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5F4] placeholder-[#4A4A50] focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-[#E0554E] text-xs font-medium">
              {error}
            </p>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-[#111113] border-t border-[#2A2A2E] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A3A3A8] hover:text-[#F5F5F4] hover:bg-[#1E1E22] transition-colors font-mono"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold font-mono text-white transition shadow-lg ${
              isDestructive
                ? 'bg-[#E0554E] hover:bg-[#c9453e] disabled:bg-[#4d1f1d] disabled:text-[#888]'
                : 'bg-[#E8672E] hover:bg-[#d05622] disabled:bg-[#4d2f1f] disabled:text-[#888]'
            } disabled:cursor-not-allowed`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
