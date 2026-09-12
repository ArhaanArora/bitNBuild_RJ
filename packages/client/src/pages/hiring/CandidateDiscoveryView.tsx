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
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="text-gray-400 hover:text-white transition"
            >
              Hiring Dashboard
            </button>
            <span>/</span>
            <span className="text-indigo-400 font-medium">Candidate Discovery</span>
          </div>

          <button
            type="button"
            onClick={onViewShortlist}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Shortlisted ({shortlistedIds.length})</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Evidence-Backed Candidate Rankings
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Discovered Talent Pool
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Matching candidates against{' '}
              <span className="text-indigo-300 font-semibold">{requirement.role}</span> with skills:{' '}
              <span className="font-mono text-emerald-400">
                {requirement.requiredSkills.join(', ') || 'General Competencies'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onEditRequirements}
              className="btn-ghost text-xs py-2 px-3.5 border-gray-700 hover:border-gray-600 text-gray-200 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Modify Requirements</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar (Section 17) */}
      <div className="card p-4 rounded-xl bg-[#0e1424]/90 border border-gray-800/90 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 mr-1 font-medium">Role:</span>
            {ROLE_FILTERS.map((rf) => (
              <button
                key={rf}
                type="button"
                onClick={() => setActiveRoleFilter(rf)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                  activeRoleFilter === rf
                    ? 'bg-indigo-600 text-white border-indigo-500 font-semibold shadow-xs'
                    : 'bg-gray-900/80 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-white'
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
              className="input text-xs py-1 px-2.5 bg-gray-900 border-gray-800 text-gray-300 w-auto"
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
              className="input text-xs py-1 px-2.5 bg-gray-900 border-gray-800 text-gray-300 w-auto"
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
              className="input text-xs py-1 px-2.5 bg-gray-900 border-gray-800 text-indigo-300 font-semibold w-auto"
            >
              <option value="match">Sort: Best Match</option>
              <option value="credibility">Sort: Credibility</option>
              <option value="assessment">Sort: Assessment</option>
              <option value="verified">Sort: Most Verified</option>
            </select>
          </div>
        </div>

        {/* Live Result Count Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white">{visibleMatches.length}</strong> of{' '}
              <strong className="text-indigo-400">{allMatches.length}</strong> verified candidates
            </span>
            {(activeRoleFilter !== 'All Roles' || minCredibility !== 80 || locationFilter !== 'All') && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                Filters active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Demo edge case toggle: Simulated error state (Section 20A) */}
            <button
              type="button"
              onClick={() => setSimulatedError(!simulatedError)}
              className="text-[11px] text-gray-500 hover:text-amber-400 transition"
              title="Test simulated error handling for demo"
            >
              {simulatedError ? 'Clear Demo Error' : 'Simulate API Fault'}
            </button>
          </div>
        </div>
      </div>

      {/* Simulated Error State (Section 20A) */}
      {simulatedError ? (
        <div className="card border-amber-500/40 bg-amber-950/20 p-8 rounded-2xl text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Search Service Temporarily Degraded</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
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
              className="border border-gray-800 bg-[#0B0F1B]/90 p-5 rounded-2xl h-80 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-800 rounded w-1/3" />
                    <div className="h-3 bg-gray-800/60 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-16 bg-gray-900/60 rounded-xl" />
                <div className="h-10 bg-gray-900/40 rounded-xl" />
              </div>
              <div className="h-8 bg-gray-900 rounded-lg" />
            </div>
          ))}
        </div>
      ) : allMatches.length === 0 ? (
        /* Empty State with concrete recovery action (Section 4 & 20A) */
        <div className="card border-gray-800 bg-[#0B0F1B]/90 p-12 rounded-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No candidates match all your filters yet</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Try broadening your location preference or lowering the credibility score threshold to see candidates with adjacent verified competencies.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleBroadenSearch}
              className="btn-primary text-xs py-2 px-4 shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Broaden Search (Relax Filters)</span>
            </button>
            <button
              type="button"
              onClick={onEditRequirements}
              className="btn-ghost text-xs py-2 px-4 border-gray-700 text-gray-300"
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
