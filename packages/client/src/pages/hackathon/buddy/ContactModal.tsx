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
      <div className="relative w-full max-w-md bg-[#0B0F1B] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Privacy Shield */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 mb-1">
              <ShieldCheck className="w-3 h-3" /> Privacy-Protected Direct Contact
            </div>
            <h3 className="text-lg font-bold text-white">Connect with {candidate.name}</h3>
            <p className="text-xs text-gray-400">{candidate.role} · {candidate.college}</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-5 bg-gray-900/50 p-3 rounded-xl border border-gray-800">
          This contact information is securely provided to coordinate hackathon team formation. Candidate prefers{' '}
          <strong className="text-indigo-400">{candidate.contact.preferred}</strong> for quick communication.
        </p>

        {/* Contact list */}
        <div className="space-y-3 mb-6">
          {/* Discord */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950 border border-gray-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-900/30 flex items-center justify-center text-indigo-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium">Discord Handle</p>
                <p className="text-xs font-mono font-semibold text-white">{candidate.contact.discord}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(candidate.contact.discord, 'Discord handle')}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
            >
              {copiedField === 'Discord handle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'Discord handle' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950 border border-gray-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center text-emerald-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium">Verified Email</p>
                <p className="text-xs font-mono font-semibold text-white">{candidate.contact.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(candidate.contact.email, 'Email')}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
            >
              {copiedField === 'Email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'Email' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950 border border-gray-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center text-blue-400">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium">Direct Phone</p>
                <p className="text-xs font-mono font-semibold text-white">{candidate.contact.phone}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(candidate.contact.phone, 'Phone number')}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
            >
              {copiedField === 'Phone number' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'Phone number' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full btn-primary py-2 text-xs font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
}
