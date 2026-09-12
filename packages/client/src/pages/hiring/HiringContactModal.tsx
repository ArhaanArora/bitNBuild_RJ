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
        className="relative w-full max-w-md rounded-2xl bg-[#0e1424] border border-indigo-900/60 shadow-2xl p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-12 h-12 rounded-full object-cover border border-indigo-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Connect with {candidate.name}</h3>
              </div>
              <p className="text-xs text-indigo-400 font-medium">{candidate.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Consent & Privacy Notice (Section 9) */}
        <div className="my-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-gray-300 leading-relaxed">
            <span className="font-semibold text-emerald-300 block mb-0.5">Verified Recruiter Access</span>
            Contact details are shared with explicit candidate consent when they activate the Get Hired visibility flow on SkillVerify.
          </div>
        </div>

        {/* Contact Fields List */}
        <div className="space-y-3 my-4">
          {/* Email */}
          <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-gray-400 block uppercase font-mono">Email Address</span>
                <span className="text-sm font-medium text-white select-all">{contact.email}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(contact.email, 'Email')}
              className="btn-ghost btn-sm text-xs flex items-center gap-1 shrink-0 py-1.5 px-2.5 border-gray-700"
            >
              {copiedField === 'Email' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Phone */}
          <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-gray-400 block uppercase font-mono">Phone Number</span>
                <span className="text-sm font-medium text-white select-all">{contact.phone}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(contact.phone, 'Phone')}
              className="btn-ghost btn-sm text-xs flex items-center gap-1 shrink-0 py-1.5 px-2.5 border-gray-700"
            >
              {copiedField === 'Phone' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Preferred Channel & Availability */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-gray-950/60 border border-gray-800">
              <span className="text-[10px] text-gray-400 uppercase font-mono block">Preferred Contact</span>
              <span className="font-semibold text-indigo-300 mt-0.5 block flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> {contact.preferred}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-950/60 border border-gray-800">
              <span className="text-[10px] text-gray-400 uppercase font-mono block">Availability</span>
              <span className="font-semibold text-emerald-300 mt-0.5 block">
                {candidate.availability}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-2">
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
            className="btn-ghost text-xs py-2 px-4 border-gray-700 hover:border-gray-600 text-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
