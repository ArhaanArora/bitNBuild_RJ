import React from 'react';
import { Check, AlertCircle, Clock } from 'lucide-react';

export type VerificationState = 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'CLAIMED' | 'UNVERIFIED' | 'IN_PROGRESS' | 'PARTIAL';

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
        className={`badge-success ${className}`}
        role="status"
        aria-label={`Verified${showScore && score != null ? ` — ${score}%` : ''}`}
      >
        <Check className="w-3 h-3" aria-hidden="true" />
        <span>Verified</span>
        {showScore && score != null && (
          <span style={{ opacity: 0.75, marginLeft: '2px' }}>{score}%</span>
        )}
      </span>
    );
  }

  if (norm === 'PARTIALLY_VERIFIED' || norm === 'IN_PROGRESS' || norm === 'PARTIAL') {
    return (
      <span
        className={`badge-warning ${className}`}
        role="status"
        aria-label={`Partially verified${showScore && score != null ? ` — ${score}%` : ''}`}
      >
        <AlertCircle className="w-3 h-3" aria-hidden="true" />
        <span>Partial</span>
        {showScore && score != null && (
          <span style={{ opacity: 0.75, marginLeft: '2px' }}>{score}%</span>
        )}
      </span>
    );
  }

  if (norm === 'UNVERIFIED') {
    return (
      <span
        className={`badge-neutral ${className}`}
        role="status"
        aria-label="Unverified"
      >
        <Clock className="w-3 h-3" aria-hidden="true" />
        <span>Unverified</span>
      </span>
    );
  }

  // CLAIMED / fallback
  return (
    <span
      className={`badge-neutral ${className}`}
      role="status"
      aria-label="Claimed"
    >
      <span>Claimed</span>
    </span>
  );
}
