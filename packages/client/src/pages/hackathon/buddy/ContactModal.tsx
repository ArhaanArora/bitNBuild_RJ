import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Candidate } from '../../../types/buddy';
import { X, Mail, Phone, MessageSquare, Copy, Check, ShieldCheck, Lock } from 'lucide-react';

interface ContactModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

export default function ContactModal({ candidate, onClose }: ContactModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!candidate) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
      <div className="relative w-full max-w-md bg-[#17171A] rounded-2xl border border-[#2A2A2E] shadow-2xl overflow-hidden p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A3A3A8] hover:text-[#F5F5F4] p-1 rounded-lg hover:bg-[#1E1E22] transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Privacy Shield */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#241C16] border border-[#E8672E]/30 flex items-center justify-center text-[#E8672E] shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-[#3FB65F] bg-[#16261B] px-2 py-0.5 rounded border border-[#3FB65F]/20 mb-1">
              <ShieldCheck className="w-3 h-3" /> Verified Contact
            </div>
            <h3 className="text-lg font-bold text-[#F5F5F4]">Connect with {candidate.name}</h3>
            <p className="text-xs text-[#A3A3A8]">{candidate.role} · {candidate.college}</p>
          </div>
        </div>

        <p className="text-xs text-[#A3A3A8] leading-relaxed mb-5 bg-[#1E1E22] p-3 rounded-xl border border-[#2A2A2E]">
          Contact information is shared to coordinate hackathon team formation. Candidate prefers{' '}
          <strong className="text-[#E8672E]">{candidate.contact.preferred}</strong> for communication.
        </p>

        {/* Contact list */}
        <div className="space-y-3 mb-6">
          {/* Discord */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1E22] border border-[#2A2A2E]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#241C16] border border-[#E8672E]/20 flex items-center justify-center text-[#E8672E]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-[#6B6B70] font-medium">Discord Handle</p>
                <p className="text-xs font-mono font-semibold text-[#F5F5F4]">{candidate.contact.discord}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(candidate.contact.discord, 'Discord handle')}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-[#17171A] hover:bg-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4] border border-[#2A2A2E] transition"
            >
              {copiedField === 'Discord handle' ? <Check className="w-3.5 h-3.5 text-[#3FB65F]" /> : <Copy className="w-3.5 h-3.5 text-[#6B6B70]" />}
              <span>{copiedField === 'Discord handle' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1E22] border border-[#2A2A2E]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#16261B] border border-[#3FB65F]/20 flex items-center justify-center text-[#3FB65F]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-[#6B6B70] font-medium">Verified Email</p>
                <p className="text-xs font-mono font-semibold text-[#F5F5F4]">{candidate.contact.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(candidate.contact.email, 'Email')}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-[#17171A] hover:bg-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4] border border-[#2A2A2E] transition"
            >
              {copiedField === 'Email' ? <Check className="w-3.5 h-3.5 text-[#3FB65F]" /> : <Copy className="w-3.5 h-3.5 text-[#6B6B70]" />}
              <span>{copiedField === 'Email' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1E1E22] border border-[#2A2A2E]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#241C16] border border-[#E8672E]/20 flex items-center justify-center text-[#E8672E]">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-[#6B6B70] font-medium">Direct Phone</p>
                <p className="text-xs font-mono font-semibold text-[#F5F5F4]">{candidate.contact.phone}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(candidate.contact.phone, 'Phone number')}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-[#17171A] hover:bg-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4] border border-[#2A2A2E] transition"
            >
              {copiedField === 'Phone number' ? <Check className="w-3.5 h-3.5 text-[#3FB65F]" /> : <Copy className="w-3.5 h-3.5 text-[#6B6B70]" />}
              <span>{copiedField === 'Phone number' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full btn-primary py-2.5 text-xs font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
}
