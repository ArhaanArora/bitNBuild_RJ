import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Lock, Shield, CheckCircle2, AlertCircle, Send, X, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface RoleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleRequestModal({ isOpen, onClose }: RoleRequestModalProps) {
  const { user, requestRoleChange } = useAuth();
  const [targetRole, setTargetRole] = useState<'candidate' | 'recruiter' | 'organizer'>('recruiter');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentRole = user?.role || 'candidate';
  const availableRoles = (['candidate', 'recruiter', 'organizer'] as const).filter(
    (r) => r !== currentRole
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 10) {
      toast.error('Please provide a detailed reason (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await requestRoleChange(targetRole, reason.trim());
      setSuccessMessage(`Your application to transition to ${targetRole.toUpperCase()} has been submitted. An administrator will review your credentials and update your custom permissions.`);
    } catch {
      // Error handled in useAuth
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccessMessage(null);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-[#1E1E22] px-6 py-4 border-b border-[#2A2A2E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#E8672E]/10 border border-[#E8672E]/20 text-[#E8672E]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Server-Enforced Role Management</h3>
              <p className="text-xs text-[#A3A3A8]">Roles are cryptographically verified by server claims</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#6B6B70] hover:text-white transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-semibold text-white">Request Submitted</h4>
            <p className="text-sm text-[#A3A3A8] leading-relaxed max-w-sm mx-auto">
              {successMessage}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg bg-[#2A2A2E] hover:bg-[#323238] text-white text-xs font-medium transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Current Verified Role Badge */}
            <div className="bg-[#1E1E22] border border-[#2A2A2E] rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#E8672E]" />
                <span className="text-xs text-[#A3A3A8]">Current Role:</span>
                <span className="text-xs font-semibold text-white uppercase tracking-wider bg-[#2A2A2E] px-2 py-0.5 rounded">
                  {currentRole}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <Lock className="w-3 h-3" />
                <span>Verified by account permissions</span>
              </div>
            </div>

            {/* Target Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#A3A3A8] mb-2 uppercase tracking-wider">
                Requested Target Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      targetRole === role
                        ? 'border-[#E8672E] bg-[#E8672E]/10 text-white'
                        : 'border-[#2A2A2E] bg-[#1E1E22] text-[#A3A3A8] hover:border-[#3E3E44]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm font-semibold capitalize">{role}</span>
                      {targetRole === role && <CheckCircle2 className="w-4 h-4 text-[#E8672E]" />}
                    </div>
                    <span className="text-[11px] text-[#6B6B70]">
                      {role === 'recruiter' && 'Access hiring hub, candidate pipeline & strict assessments'}
                      {role === 'organizer' && 'Host hackathons, evaluate teams & build custom tests'}
                      {role === 'candidate' && 'Solve skill challenges, verify badges & participate'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Justification Textarea */}
            <div>
              <label className="block text-xs font-semibold text-[#A3A3A8] mb-1.5 uppercase tracking-wider">
                Justification & Credentials
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your organization, purpose for role change, and relevant credentials..."
                className="w-full bg-[#1E1E22] border border-[#2A2A2E] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#6B6B70] focus:outline-none focus:border-[#E8672E] transition resize-none"
              />
              <p className="text-[11px] text-[#6B6B70] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Minimum 10 characters. Role updates are server-audited.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2A2A2E]">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-medium text-[#A3A3A8] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !reason.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#E8672E] hover:bg-[#D45620] disabled:opacity-50 text-[#0D0D0F] font-semibold text-xs transition shadow-lg shadow-[#E8672E]/20"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0D0D0F] border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
