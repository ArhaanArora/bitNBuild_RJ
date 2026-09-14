import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface CredibilityDisplayProps {
  score?: number;
  reportLink?: string;
  className?: string;
}

export default function CredibilityDisplay({
  score = 87,
  reportLink = '/analysis/report',
  className = '',
}: CredibilityDisplayProps) {
  const statusLabel =
    score >= 85 ? 'Strong'    :
    score >= 70 ? 'Moderate'  :
    score >= 50 ? 'Developing': 'Getting Started';

  const statusColor =
    score >= 85 ? 'var(--success)' :
    score >= 70 ? 'var(--warning)' :
    'var(--text-muted)';

  const progressColor =
    score >= 85 ? 'var(--success)' :
    score >= 70 ? 'var(--warning)' :
    'var(--info)';

  // Miniature bar chart values (relative heights, last is current)
  const bars = [0.4, 0.55, 0.6, 0.72, 0.85, 0.78, score / 100];

  return (
    <div
      className={`card flex flex-col justify-between relative overflow-hidden ${className}`}
      style={{ minHeight: '160px' }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-5 w-10 h-[2px] rounded-full"
        style={{ background: 'var(--accent)' }}
        aria-hidden="true"
      />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.1em]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Credibility Score
          </span>

          {/* Sparkline bar chart */}
          <div className="flex items-end gap-0.5 h-6" aria-hidden="true">
            {bars.map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-sm transition-all"
                style={{
                  height: `${h * 100}%`,
                  background: i === bars.length - 1
                    ? progressColor
                    : i >= bars.length - 3
                    ? 'var(--border-strong)'
                    : 'var(--border-subtle)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Score number */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span
            className="text-4xl font-extrabold tracking-tight"
            style={{
              color: 'var(--text-primary)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.04em',
            }}
            aria-label={`Credibility score: ${score} out of 100`}
          >
            {score}
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            /100
          </span>
        </div>

        {/* Progress bar */}
        <div className="progress-bar mb-3" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`${score}% credibility`}>
          <div
            className="progress-fill"
            style={{ width: `${score}%`, background: progressColor }}
          />
        </div>

        {/* Status label */}
        <div className="flex items-center gap-1.5 text-xs font-semibold mb-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: statusColor }}
            aria-hidden="true"
          />
          <span style={{ color: statusColor }}>{statusLabel}</span>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Based on assessments, projects, and verified evidence.
        </p>
      </div>

      {/* Link */}
      <div className="pt-3 mt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link
          to={reportLink}
          className="inline-flex items-center gap-1.5 text-xs font-semibold group hover:gap-2.5 transition-all"
          style={{ color: 'var(--accent)' }}
        >
          <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
          <span>View detailed report</span>
          <ArrowRight
            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}
