import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

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
    score >= 85 ? 'Strong' : score >= 70 ? 'Moderate' : 'Developing';
  const statusColor =
    score >= 85 ? 'text-[#3FB65F]' : score >= 70 ? 'text-[#D89A3E]' : 'text-[#A3A3A8]';
  const dotColor =
    score >= 85 ? 'bg-[#3FB65F]' : score >= 70 ? 'bg-[#D89A3E]' : 'bg-[#A3A3A8]';

  return (
    <div
      className={`relative bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Top Left Orange Accent Line */}
      <div className="absolute top-0 left-6 w-12 h-[2px] bg-[#E8672E]" />

      <div>
        <div className="flex items-start justify-between mb-4">
          <span className="text-xs font-semibold text-[#A3A3A8] uppercase tracking-wider">
            Your Credibility
          </span>

          {/* Mini Bar Chart Graphic from Reference Image */}
          <div className="flex items-end gap-1 h-5">
            <div className="w-1 bg-[#2A2A2E] h-2 rounded-xs" />
            <div className="w-1 bg-[#2A2A2E] h-3 rounded-xs" />
            <div className="w-1 bg-[#38383D] h-4 rounded-xs" />
            <div className="w-1 bg-[#A3A3A8] h-3.5 rounded-xs" />
            <div className="w-1 bg-[#E8672E] h-5 rounded-xs" />
          </div>
        </div>

        {/* Large Score */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-4xl font-bold text-[#F5F5F4] tracking-tight">{score}</span>
          <span className="text-sm font-medium text-[#6B6B70]">/100</span>
        </div>

        {/* Status Dot */}
        <div className="flex items-center gap-1.5 text-xs font-medium mb-3">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className={statusColor}>{statusLabel}</span>
        </div>

        <p className="text-xs text-[#A3A3A8] leading-relaxed">
          Based on assessments, projects and verified evidence.
        </p>
      </div>

      <div className="pt-4 mt-2">
        <Link
          to={reportLink}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#E8672E] hover:text-[#F3773D] transition group"
        >
          <span>View detailed report</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
