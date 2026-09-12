import React, { useState } from 'react';
import { HiringCandidate } from '../../types/hiring';
import {
  X,
  Copy,
  Check,
  Mail,
  Phone,
  MessageSquare,
  ShieldCheck,
  Lock,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface HiringContactModalProps {
  candidate: HiringCandidate | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function HiringContactModal({
  candidate,
  isOpen,
  onClose,
}: HiringContactModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !candidate) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const contact = candidate.contact;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#17171A] border border-[#2A2A2E] shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#2A2A2E]">
          <div className="flex items-center gap-3">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-12 h-12 rounded-full object-cover border border-[#2A2A2E]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#F5F5F4]">Connect with {candidate.name}</h3>
              </div>
              <p className="text-xs text-[#E8672E] font-medium">{candidate.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#A3A3A8] hover:text-[#F5F5F4] hover:bg-[#1E1E22] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Consent & Privacy Notice */}
        <div className="my-4 p-3 rounded-xl bg-[#16261B] border border-[#3FB65F]/20 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#3FB65F] shrink-0 mt-0.5" />
          <div className="text-xs text-[#A3A3A8] leading-relaxed">
            <span className="font-semibold text-[#3FB65F] block mb-0.5">Verified Recruiter Access</span>
            Contact details are shared with explicit candidate consent when they activate the Get Hired visibility flow on SkillVerify.
          </div>
        </div>

        {/* Contact Fields List */}
        <div className="space-y-3 my-4">
          {/* Email */}
          <div className="p-3 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Mail className="w-4 h-4 text-[#E8672E] shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-[#6B6B70] block uppercase font-mono">Email Address</span>
                <span className="text-sm font-medium text-[#F5F5F4] select-all">{contact.email}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(contact.email, 'Email')}
              className="btn-ghost text-xs flex items-center gap-1 shrink-0 py-1.5 px-2.5 border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4]"
            >
              {copiedField === 'Email' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#3FB65F]" />
                  <span className="text-[#3FB65F]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#6B6B70]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Phone */}
          <div className="p-3 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Phone className="w-4 h-4 text-[#3FB65F] shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-[#6B6B70] block uppercase font-mono">Phone Number</span>
                <span className="text-sm font-medium text-[#F5F5F4] select-all">{contact.phone}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(contact.phone, 'Phone')}
              className="btn-ghost text-xs flex items-center gap-1 shrink-0 py-1.5 px-2.5 border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4]"
            >
              {copiedField === 'Phone' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#3FB65F]" />
                  <span className="text-[#3FB65F]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#6B6B70]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Preferred Channel & Availability */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#1E1E22] border border-[#2A2A2E]">
              <span className="text-[10px] text-[#6B6B70] uppercase font-mono block">Preferred Contact</span>
              <span className="font-semibold text-[#F5F5F4] mt-0.5 block flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-[#E8672E]" /> {contact.preferred}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#1E1E22] border border-[#2A2A2E]">
              <span className="text-[10px] text-[#6B6B70] uppercase font-mono block">Availability</span>
              <span className="font-semibold text-[#3FB65F] mt-0.5 block">
                {candidate.availability}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#2A2A2E] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              const subject = encodeURIComponent(`Opportunity regarding ${candidate.role} role`);
              const body = encodeURIComponent(`Hi ${candidate.name},\n\nI reviewed your verified profile on SkillVerify (${candidate.credibilityScore}% credibility) and would love to connect about an opportunity.`);
              window.open(`mailto:${contact.email}?subject=${subject}&body=${body}`, '_blank');
            }}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 flex-1 justify-center"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Open Email Draft</span>
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
  );
}
