import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

export type VerificationState = 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'CLAIMED' | 'UNVERIFIED';

interface VerificationBadgeProps {
  status: VerificationState | string;
  score?: number | null;
  className?: string;
  showScore?: boolean;
}

export default function VerificationBadge({
  status,
  score,
  className = '',
  showScore = false,
}: VerificationBadgeProps) {
  const norm = (status || '').toUpperCase();

  if (norm === 'VERIFIED') {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30 ${className}`}
      >
        <Check className="w-3 h-3 text-[#3FB65F]" />
        <span>Verified</span>
        {showScore && score !== null && score !== undefined && (
          <span className="text-[10px] text-[#3FB65F]/80 ml-0.5">{score}%</span>
        )}
      </span>
    );
  }

  if (norm === 'PARTIALLY_VERIFIED' || norm === 'IN_PROGRESS' || norm === 'PARTIAL') {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-[#2B2213] text-[#D89A3E] border border-[#D89A3E]/30 ${className}`}
      >
        <AlertCircle className="w-3 h-3 text-[#D89A3E]" />
        <span>Partially Verified</span>
        {showScore && score !== null && score !== undefined && (
          <span className="text-[10px] text-[#D89A3E]/80 ml-0.5">{score}%</span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-transparent text-[#A3A3A8] border border-[#2A2A2E] ${className}`}
    >
      <span>Claimed</span>
    </span>
  );
}
