import React, { useState, useMemo, useEffect } from 'react';
import { HiringCandidate, HiringMatch, HiringRequirement } from '../../types/hiring';
import { getDiscoverableCandidates } from '../../data/mockHiringData';
import { computeHiringMatch } from '../../utils/hiringMatching';
import {
  isCandidateShortlisted,
  toggleShortlistCandidate,
  getShortlistedCandidateIds,
} from '../../utils/hiringStorage';
import HiringCandidateCard from './HiringCandidateCard';
import HiringCandidateProfileModal from './HiringCandidateProfileModal';
import HiringContactModal from './HiringContactModal';
import { useAuth } from '../../hooks/useAuth';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Bookmark,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CandidateDiscoveryViewProps {
  requirement: HiringRequirement;
  onEditRequirements: () => void;
  onBackToDashboard: () => void;
  onViewShortlist: () => void;
}

const ROLE_FILTERS = ['All Roles', 'Backend', 'Frontend', 'AI/ML', 'UI/UX', 'Full Stack'];

export default function CandidateDiscoveryView({
  requirement,
  onEditRequirements,
  onBackToDashboard,
  onViewShortlist,
}: CandidateDiscoveryViewProps) {
  const { user } = useAuth();

  // Loading simulation (Section 20A)
  const [loading, setLoading] = useState(true);
  const [simulatedError, setSimulatedError] = useState(false);

  // Active filters
  const [activeRoleFilter, setActiveRoleFilter] = useState('All Roles');
  const [minCredibility, setMinCredibility] = useState(80);
  const [locationFilter, setLocationFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'match' | 'credibility' | 'assessment' | 'verified'>('match');

  // Pagination cap (Section 4 & 20A)
  const [visibleCount, setVisibleCount] = useState(4);

  // Shortlist IDs from localStorage
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);

  // Modals
  const [selectedProfileCandidate, setSelectedProfileCandidate] = useState<HiringCandidate | null>(null);
  const [selectedContactCandidate, setSelectedContactCandidate] = useState<HiringCandidate | null>(null);

  // Initial load effect
  useEffect(() => {
    setShortlistedIds(getShortlistedCandidateIds());
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [requirement]);

  // Compute matches and rank candidates
  const allMatches: HiringMatch[] = useMemo(() => {
    const rawCandidates = getDiscoverableCandidates(user || undefined);
    let list = rawCandidates.map((cand) => computeHiringMatch(cand, requirement));

    // Filter by Role chip
    if (activeRoleFilter !== 'All Roles') {
      const f = activeRoleFilter.toLowerCase();
      list = list.filter((m) => {
        const r = m.candidate.role.toLowerCase();
        if (f === 'ui/ux') return r.includes('design') || r.includes('ui');
        if (f === 'frontend') return r.includes('frontend') || r.includes('react');
        if (f === 'backend') return r.includes('backend') || r.includes('python') || r.includes('node');
        if (f === 'ai/ml') return r.includes('ai') || r.includes('ml');
        if (f === 'full stack') return r.includes('full') || r.includes('stack');
        return true;
      });
    }

    // Filter by Minimum Credibility
    if (minCredibility > 0) {
      list = list.filter((m) => m.candidate.credibilityScore >= minCredibility);
    }

    // Filter by Location
    if (locationFilter !== 'All') {
      list = list.filter((m) =>
        m.candidate.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'credibility') return b.candidate.credibilityScore - a.candidate.credibilityScore;
      if (sortBy === 'assessment') return b.candidate.assessmentScore - a.candidate.assessmentScore;
      if (sortBy === 'verified') return b.verifiedSkillCount - a.verifiedSkillCount;
      return 0;
    });

    return list;
  }, [requirement, user, activeRoleFilter, minCredibility, locationFilter, sortBy]);

  // Handle Shortlist toggle
  const handleToggleShortlist = (candidateId: string, candidateName: string) => {
    const { isShortlisted: nowShortlisted, count } = toggleShortlistCandidate(candidateId);
    setShortlistedIds(getShortlistedCandidateIds());
    if (nowShortlisted) {
      toast.success(`${candidateName} added to Shortlist (${count})`);
    } else {
      toast(`Removed ${candidateName} from Shortlist`);
    }
  };

  // Recovery action for empty state (Section 4 & 20A)
  const handleBroadenSearch = () => {
    setActiveRoleFilter('All Roles');
    setMinCredibility(0);
    setLocationFilter('All');
    toast.success('Relaxed search filters to show all verified candidates');
  };

  const visibleMatches = allMatches.slice(0, visibleCount);
  const hasMore = visibleCount < allMatches.length;

  return (
    <div className="space-y-6 fade-in-up pb-12">
      {/* Top Header & Breadcrumbs */}
      <div>
        <div className="flex items-center justify-between text-xs text-[#6B6B70] mb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="text-[#A3A3A8] hover:text-[#F5F5F4] transition"
            >
              Hiring Dashboard
            </button>
            <span>/</span>
            <span className="text-[#E8672E] font-medium">Candidate Discovery</span>
          </div>

          <button
            type="button"
            onClick={onViewShortlist}
            className="flex items-center gap-1.5 text-xs text-[#E8672E] hover:text-[#F3773D] transition"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Shortlisted ({shortlistedIds.length})</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E8672E] tracking-wider uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8672E]" />
              <span>EVIDENCE-BACKED CANDIDATE RANKINGS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F4] tracking-tight">
              Discovered Talent Pool
            </h1>
            <p className="text-xs sm:text-sm text-[#A3A3A8] mt-1">
              Matching candidates against{' '}
              <span className="text-[#F5F5F4] font-medium">{requirement.role}</span> with skills:{' '}
              <span className="font-mono text-[#E8672E]">
                {requirement.requiredSkills.join(', ') || 'General Competencies'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onEditRequirements}
              className="btn-ghost text-xs py-2 px-3.5 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E8672E]" />
              <span>Modify Requirements</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar (Section 17) */}
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-[#6B6B70] mr-1 font-medium">Role:</span>
            {ROLE_FILTERS.map((rf) => (
              <button
                key={rf}
                type="button"
                onClick={() => setActiveRoleFilter(rf)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                  activeRoleFilter === rf
                    ? 'bg-[#241C16] text-[#F5F5F4] border-[#E8672E] font-medium'
                    : 'bg-[#1E1E22] text-[#A3A3A8] border-[#2A2A2E] hover:border-[#38383D] hover:text-white'
                }`}
              >
                {rf}
              </button>
            ))}
          </div>

          {/* Quick Dropdowns: Credibility, Location, Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Credibility Filter */}
            <select
              value={minCredibility}
              onChange={(e) => setMinCredibility(Number(e.target.value))}
              className="text-xs py-1 px-2.5 bg-[#1E1E22] border border-[#2A2A2E] rounded-lg text-[#F5F5F4] w-auto focus:outline-none focus:border-[#E8672E]"
            >
              <option value="0">Credibility: Any</option>
              <option value="80">Credibility: 80%+</option>
              <option value="85">Credibility: 85%+</option>
              <option value="90">Credibility: 90%+</option>
            </select>

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="text-xs py-1 px-2.5 bg-[#1E1E22] border border-[#2A2A2E] rounded-lg text-[#F5F5F4] w-auto focus:outline-none focus:border-[#E8672E]"
            >
              <option value="All">Location: All</option>
              <option value="Nearby">Nearby</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Delhi">Delhi NCR</option>
              <option value="Remote">Remote</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs py-1 px-2.5 bg-[#1E1E22] border border-[#2A2A2E] rounded-lg text-[#E8672E] font-medium w-auto focus:outline-none focus:border-[#E8672E]"
            >
              <option value="match">Sort: Best Match</option>
              <option value="credibility">Sort: Credibility</option>
              <option value="assessment">Sort: Assessment</option>
              <option value="verified">Sort: Most Verified</option>
            </select>
          </div>
        </div>

        {/* Live Result Count Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-[#2A2A2E] text-xs text-[#A3A3A8]">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white">{visibleMatches.length}</strong> of{' '}
              <strong className="text-[#E8672E]">{allMatches.length}</strong> verified candidates
            </span>
            {(activeRoleFilter !== 'All Roles' || minCredibility !== 80 || locationFilter !== 'All') && (
              <span className="text-[11px] font-mono text-[#3FB65F] bg-[#16261B] px-2 py-0.5 rounded border border-[#3FB65F]/30">
                Filters active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSimulatedError(!simulatedError)}
              className="text-[11px] text-[#6B6B70] hover:text-[#D89A3E] transition"
              title="Test simulated error handling for demo"
            >
              {simulatedError ? 'Clear Demo Error' : 'Simulate API Fault'}
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Error State (Section 20A) */}
      {simulatedError ? (
        <div className="bg-[#17171A] border border-[#2B2213] p-8 rounded-xl text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-[#D89A3E] mx-auto" />
          <h3 className="text-base font-semibold text-white">Search Service Temporarily Degraded</h3>
          <p className="text-xs text-[#A3A3A8] max-w-md mx-auto">
            A simulated network timeout occurred while querying real-time assessment benchmarks. Cached credibility scores are preserved.
          </p>
          <button
            type="button"
            onClick={() => {
              setSimulatedError(false);
              toast.success('Search service recovered successfully!');
            }}
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Search Query</span>
          </button>
        </div>
      ) : loading ? (
        /* Loading Skeleton State (Section 20A) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="border border-[#2A2A2E] bg-[#17171A] p-5 rounded-xl h-80 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1E1E22]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[#1E1E22] rounded w-1/3" />
                    <div className="h-3 bg-[#1E1E22]/60 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-16 bg-[#1E1E22] rounded-lg" />
                <div className="h-10 bg-[#1E1E22] rounded-lg" />
              </div>
              <div className="h-8 bg-[#1E1E22] rounded-lg" />
            </div>
          ))}
        </div>
      ) : allMatches.length === 0 ? (
        /* Empty State with concrete recovery action (Section 4 & 20A) */
        <div className="bg-[#17171A] border border-[#2A2A2E] p-12 rounded-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-center text-[#A3A3A8] mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No candidates match all your filters yet</h3>
          <p className="text-xs text-[#A3A3A8] max-w-md mx-auto">
            Try broadening your location preference or lowering the credibility score threshold to see candidates with adjacent verified competencies.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleBroadenSearch}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Broaden Search</span>
            </button>
            <button
              type="button"
              onClick={onEditRequirements}
              className="btn-ghost text-xs py-2 px-4"
            >
              Edit Requirements
            </button>
          </div>
        </div>
      ) : (
        /* Candidate Cards Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {visibleMatches.map((match) => (
              <HiringCandidateCard
                key={match.candidate.id}
                match={match}
                isShortlisted={shortlistedIds.includes(match.candidate.id)}
                onToggleShortlist={() =>
                  handleToggleShortlist(match.candidate.id, match.candidate.name)
                }
                onViewProfile={() => setSelectedProfileCandidate(match.candidate)}
                onContact={() => setSelectedContactCandidate(match.candidate)}
              />
            ))}
          </div>

          {/* Pagination / Show More Control (Section 4 & 20A) */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 4)}
                className="btn-ghost text-xs py-2.5 px-6 border-gray-700 hover:border-gray-600 text-gray-300 inline-flex items-center gap-2 hover:text-white"
              >
                <span>Show More Candidates ({allMatches.length - visibleCount} remaining)</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Candidate Profile Evidence Modal */}
      <HiringCandidateProfileModal
        candidate={selectedProfileCandidate}
        isOpen={!!selectedProfileCandidate}
        isShortlisted={
          selectedProfileCandidate ? shortlistedIds.includes(selectedProfileCandidate.id) : false
        }
        onToggleShortlist={() => {
          if (selectedProfileCandidate) {
            handleToggleShortlist(selectedProfileCandidate.id, selectedProfileCandidate.name);
          }
        }}
        onOpenContact={() => {
          const c = selectedProfileCandidate;
          setSelectedProfileCandidate(null);
          setSelectedContactCandidate(c);
        }}
        onClose={() => setSelectedProfileCandidate(null)}
      />

      {/* Direct Contact Modal with Consent Notice */}
      <HiringContactModal
        candidate={selectedContactCandidate}
        isOpen={!!selectedContactCandidate}
        onClose={() => setSelectedContactCandidate(null)}
      />
    </div>
  );
}
