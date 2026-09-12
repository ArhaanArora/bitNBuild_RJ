import React, { useState, useEffect, useMemo } from 'react';
import { HiringCandidate, HiringMatch } from '../../types/hiring';
import { getDiscoverableCandidates } from '../../data/mockHiringData';
import { computeHiringMatch } from '../../utils/hiringMatching';
import {
  getShortlistedCandidateIds,
  toggleShortlistCandidate,
} from '../../utils/hiringStorage';
import HiringCandidateCard from './HiringCandidateCard';
import HiringCandidateProfileModal from './HiringCandidateProfileModal';
import HiringContactModal from './HiringContactModal';
import { useAuth } from '../../hooks/useAuth';
import {
  Bookmark,
  ArrowLeft,
  Search,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ShortlistedViewProps {
  onBack: () => void;
  onExplore: () => void;
}

export default function ShortlistedView({ onBack, onExplore }: ShortlistedViewProps) {
  const { user } = useAuth();
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [selectedProfileCandidate, setSelectedProfileCandidate] = useState<HiringCandidate | null>(null);
  const [selectedContactCandidate, setSelectedContactCandidate] = useState<HiringCandidate | null>(null);

  useEffect(() => {
    setShortlistedIds(getShortlistedCandidateIds());
  }, []);

  const shortlistedMatches: HiringMatch[] = useMemo(() => {
    const rawCandidates = getDiscoverableCandidates(user || undefined);
    const filtered = rawCandidates.filter((c) => shortlistedIds.includes(c.id));
    return filtered.map((cand) =>
      computeHiringMatch(cand, {
        role: cand.role,
        requiredSkills: cand.skills.filter((s) => s.status === 'VERIFIED').map((s) => s.name),
        experience: 'Any',
        location: 'All Locations',
      })
    );
  }, [shortlistedIds, user]);

  const handleToggleShortlist = (candidateId: string, candidateName: string) => {
    const { isShortlisted, count } = toggleShortlistCandidate(candidateId);
    setShortlistedIds(getShortlistedCandidateIds());
    if (!isShortlisted) {
      toast(`Removed ${candidateName} from shortlist`);
    }
  };

  return (
    <div className="space-y-6 fade-in-up pb-12">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hiring Dashboard</span>
        </button>
        <span className="text-xs font-mono text-emerald-400">
          {shortlistedIds.length} candidates saved
        </span>
      </div>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Bookmark className="w-3.5 h-3.5" /> Recruiter Shortlist
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Shortlisted Candidates
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Review candidates you have saved for recruitment and direct contact outreach.
        </p>
      </div>

      {shortlistedMatches.length === 0 ? (
        <div className="card border-gray-800 bg-[#0B0F1B]/90 p-12 rounded-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Your shortlist is currently empty</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Browse discovered candidates and click "Shortlist" on any card to save them here for easy review and direct contact.
          </p>
          <button
            type="button"
            onClick={onExplore}
            className="btn-primary text-xs py-2.5 px-5 shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2 mx-auto"
          >
            <Search className="w-4 h-4" />
            <span>Find Candidates</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {shortlistedMatches.map((match) => (
            <HiringCandidateCard
              key={match.candidate.id}
              match={match}
              isShortlisted={true}
              onToggleShortlist={() =>
                handleToggleShortlist(match.candidate.id, match.candidate.name)
              }
              onViewProfile={() => setSelectedProfileCandidate(match.candidate)}
              onContact={() => setSelectedContactCandidate(match.candidate)}
            />
          ))}
        </div>
      )}

      {/* Candidate Profile Modal */}
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

      {/* Direct Contact Modal */}
      <HiringContactModal
        candidate={selectedContactCandidate}
        isOpen={!!selectedContactCandidate}
        onClose={() => setSelectedContactCandidate(null)}
      />
    </div>
  );
}
