import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Candidate,
  CandidateMatch,
  CandidateRequestState,
  TeamRequirement,
} from '../../types/buddy';
import { MOCK_CANDIDATES, computeCandidateMatch } from '../../data/mockCandidates';
import CandidateCard from './buddy/CandidateCard';
import CandidateProfileModal from './buddy/CandidateProfileModal';
import ContactModal from './buddy/ContactModal';
import RequestTeamModal from './buddy/RequestTeamModal';
import VerificationChallengeModal from './buddy/VerificationChallengeModal';
import { api } from '../../lib/api';
import {
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Filter,
  SlidersHorizontal,
  MapPin,
  RefreshCw,
  Plus,
  X,
  Award,
  ArrowRight,
} from 'lucide-react';

const COMMON_SKILLS = [
  'Figma',
  'UI/UX',
  'Prototyping',
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'PyTorch',
  'TailwindCSS',
  'FastAPI',
  'Docker',
  'Go',
  'PostgreSQL',
  'Flutter',
];

const HACKATHONS = [
  'BitNBuild Rajasthan 2026',
  'HackAI Global Hackathon',
  'Smart Campus Hackfest TIET',
  'Rajasthan Cyber Summit Hackathon',
];

export default function FindTeammatePage() {
  // Form search state
  const [role, setRole] = useState('UI/UX Designer');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Figma', 'UI/UX', 'Prototyping']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Any');
  const [locationPreference, setLocationPreference] = useState('Nearby');
  const [hackathon, setHackathon] = useState(HACKATHONS[0]);

  // Loading & View states
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);

  // Active filters & sorting
  const [activeRoleFilter, setActiveRoleFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'match' | 'credibility' | 'assessment' | 'verified'>('match');

  // Request & challenge tracking states per candidate
  const [requestStates, setRequestStates] = useState<Record<string, CandidateRequestState>>({
    'cand-1': 'IDLE',
    'cand-2': 'IDLE',
    'cand-3': 'IDLE',
    'cand-4': 'IDLE',
    'cand-5': 'IDLE',
    'cand-6': 'IDLE',
    'cand-7': 'IDLE',
  });

  // Active modals
  const [selectedCandidateForProfile, setSelectedCandidateForProfile] = useState<Candidate | null>(null);
  const [selectedCandidateForContact, setSelectedCandidateForContact] = useState<Candidate | null>(null);
  const [selectedMatchForRequest, setSelectedMatchForRequest] = useState<CandidateMatch | null>(null);
  const [selectedCandidateForChallenge, setSelectedCandidateForChallenge] = useState<Candidate | null>(null);

  // Requirement bundle
  const currentRequirement: TeamRequirement = useMemo(() => ({
    role,
    requiredSkills,
    experienceLevel,
    locationPreference,
    hackathon,
  }), [role, requiredSkills, experienceLevel, locationPreference, hackathon]);

  // Real PostgreSQL Database Matches
  const [dbMatches, setDbMatches] = useState<CandidateMatch[] | null>(null);
  const [isFromDatabase, setIsFromDatabase] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.post('/teams/find-teammates', {
        requiredSkills,
        experienceLevel,
        locationPreference,
        hackathonId: hackathon,
      });
      if (res.data?.matches && res.data.matches.length > 0) {
        setDbMatches(res.data.matches);
        setIsFromDatabase(true);
        toast.success(`Matched ${res.data.matches.length} candidates directly from PostgreSQL!`);
      } else {
        setDbMatches(null);
        setIsFromDatabase(false);
      }
    } catch (err) {
      console.warn('Backend matching API fallback:', err);
      setDbMatches(null);
      setIsFromDatabase(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [requiredSkills, experienceLevel, hackathon]);

  // Compute matches (from DB or fallback mock)
  const candidateMatches: CandidateMatch[] = useMemo(() => {
    let list: CandidateMatch[] = [];
    if (dbMatches && dbMatches.length > 0) {
      list = [...dbMatches];
    } else {
      list = MOCK_CANDIDATES.map((cand) => computeCandidateMatch(cand, currentRequirement));
    }

    // Role filter chip
    if (activeRoleFilter !== 'All') {
      list = list.filter((m) => {
        const cRole = m.candidate.role.toLowerCase();
        const f = activeRoleFilter.toLowerCase();
        if (f === 'ui/ux' || f === 'ui-ux') return cRole.includes('design') || cRole.includes('ui');
        if (f === 'frontend') return cRole.includes('frontend') || cRole.includes('react');
        if (f === 'backend') return cRole.includes('backend') || cRole.includes('cloud') || cRole.includes('go') || cRole.includes('django');
        if (f === 'ai/ml' || f === 'ai-ml') return cRole.includes('ai') || cRole.includes('ml');
        if (f === 'full-stack') return cRole.includes('full-stack') || cRole.includes('full');
        return true;
      });
    }

    // Sort order
    list.sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'credibility') return b.candidate.credibilityScore - a.candidate.credibilityScore;
      if (sortBy === 'assessment') return b.candidate.assessmentOverallScore - a.candidate.assessmentOverallScore;
      if (sortBy === 'verified') {
        const aVer = a.candidate.skills.filter((s) => s.status === 'VERIFIED').length;
        const bVer = b.candidate.skills.filter((s) => s.status === 'VERIFIED').length;
        return bVer - aVer;
      }
      return 0;
    });

    return list;
  }, [dbMatches, currentRequirement, activeRoleFilter, sortBy]);

  // Skill management
  const toggleSkill = (skill: string) => {
    if (requiredSkills.includes(skill)) {
      setRequiredSkills(requiredSkills.filter((s) => s !== skill));
    } else {
      setRequiredSkills([...requiredSkills, skill]);
    }
  };

  const addCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const s = customSkillInput.trim();
    if (s && !requiredSkills.includes(s)) {
      setRequiredSkills([...requiredSkills, s]);
      setCustomSkillInput('');
    }
  };

  const handleSearch = () => {
    fetchMatches();
  };

  return (
    <div className="space-y-8 fade-in-up pb-12">
      {/* Breadcrumbs & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
          <span>/</span>
          <Link to="/hackathons" className="hover:text-gray-300">Hackathons</Link>
          <span>/</span>
          <span className="text-indigo-400 font-medium">Find Teammates</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Evidence-Based Teammate Matching
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Find Your Hackathon Teammate
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Build your team with people whose skills are backed by assessment scores, portfolio benchmarks, and GitHub validation — not just self-declared claims.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/analysis/report"
              className="btn-ghost text-xs flex items-center gap-1.5 border-gray-800 hover:border-gray-700 py-2.5 px-3.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>3D Trust Constellation</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Fast, Single-Screen Requirement Form */}
      <div className="card border-indigo-900/40 bg-gradient-to-br from-gray-900/90 via-[#0B0F1B] to-gray-950 p-6 rounded-2xl shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Search className="w-4 h-4 text-indigo-400" />
            <span>Define Required Role & Verified Competencies</span>
          </div>
          <span className="text-xs text-gray-500 font-mono">Realtime Evidence Scoring</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Role Needed */}
          <div>
            <label className="label text-xs font-semibold text-gray-300">Role Needed</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input text-xs"
            >
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="AI/ML Engineer">AI/ML Engineer</option>
              <option value="Full-Stack Developer">Full-Stack Developer</option>
              <option value="Any">Any Role</option>
            </select>
          </div>

          {/* Hackathon Selection */}
          <div>
            <label className="label text-xs font-semibold text-gray-300">Target Hackathon</label>
            <select
              value={hackathon}
              onChange={(e) => setHackathon(e.target.value)}
              className="input text-xs"
            >
              {HACKATHONS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label className="label text-xs font-semibold text-gray-300">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="input text-xs"
            >
              <option value="Any">Any Experience</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced (Hackathon Winners)</option>
            </select>
          </div>

          {/* Location / Radius */}
          <div>
            <label className="label text-xs font-semibold text-gray-300">Location Filter</label>
            <select
              value={locationPreference}
              onChange={(e) => setLocationPreference(e.target.value)}
              className="input text-xs"
            >
              <option value="Nearby">Nearby Colleges (Punjab & Rajasthan)</option>
              <option value="Patiala">Patiala (TIET / Chitkara)</option>
              <option value="Chandigarh">Chandigarh (PEC / UIET)</option>
              <option value="Jaipur">Jaipur (MNIT / IIT Jodhpur)</option>
              <option value="All">All Locations (Remote OK)</option>
            </select>
          </div>
        </div>

        {/* Required Skills Multi-Select Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label text-xs font-semibold text-gray-300 mb-0">
              Required Skills <span className="text-gray-500 font-normal">(Candidates scored on assessment proof)</span>
            </label>
            {requiredSkills.length > 0 && (
              <button
                type="button"
                onClick={() => setRequiredSkills([])}
                className="text-[11px] text-gray-500 hover:text-gray-300"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {COMMON_SKILLS.map((skill) => {
              const isSelected = requiredSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-mono transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm border border-indigo-400/30'
                      : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <span>{skill}</span>
                  {isSelected && <X className="w-3 h-3 text-indigo-200" />}
                </button>
              );
            })}
          </div>

          {/* Custom skill add input */}
          <form onSubmit={addCustomSkill} className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              placeholder="Add other skill (e.g. Next.js, WebGL)…"
              className="input text-xs py-1.5"
            />
            <button
              type="submit"
              disabled={!customSkillInput.trim()}
              className="btn-ghost text-xs py-1.5 px-3 border-gray-800 disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Showing teammates near you (Patiala, Chandigarh, Jaipur, BITS)</span>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Finding Teammates…</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find Teammates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 p-3.5 rounded-xl border border-gray-800">
        {/* Role Chips Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3 text-indigo-400" /> Filter:
          </span>
          {['All', 'UI/UX', 'Frontend', 'Backend', 'AI/ML', 'Full-Stack'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveRoleFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                activeRoleFilter === f
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-gray-400 hover:text-white bg-gray-950/60 hover:bg-gray-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sort Control */}
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-950 text-xs text-gray-200 border border-gray-800 rounded-lg py-1 px-2.5 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="match">Best Match Score</option>
            <option value="credibility">Highest Overall Credibility</option>
            <option value="assessment">Skill Assessment Score</option>
            <option value="verified">Most Verified Skills</option>
          </select>
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-lg">Ranked Teammate Matches</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
              {candidateMatches.length} candidates
            </span>
            {isFromDatabase && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live PostgreSQL Verified
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 font-mono hidden sm:inline">
            Ranked by: Skill Match + Assessment + Portfolio + GitHub Evidence
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card text-center py-16 border-dashed border-gray-800">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-300 font-medium">Finding teammates with verified skills…</p>
            <p className="text-xs text-gray-500 mt-1 font-mono">Cross-referencing proctored benchmarks and code provenance</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && candidateMatches.length === 0 && (
          <div className="card text-center py-16 border-dashed border-gray-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">No strong matches found.</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Try expanding your required skills, resetting the role filter, or choosing "All Locations" to see more candidates.
            </p>
            <button
              type="button"
              onClick={() => {
                setRole('Any');
                setActiveRoleFilter('All');
                setRequiredSkills([]);
              }}
              className="btn-ghost text-xs mt-2"
            >
              Reset Search Parameters
            </button>
          </div>
        )}

        {/* Results Grid */}
        {!loading && candidateMatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {candidateMatches.map((match) => (
              <CandidateCard
                key={match.candidate.id}
                match={match}
                requestState={requestStates[match.candidate.id] || 'IDLE'}
                onViewProfile={() => setSelectedCandidateForProfile(match.candidate)}
                onRequestJoin={() => setSelectedMatchForRequest(match)}
                onSendChallenge={() => setSelectedCandidateForChallenge(match.candidate)}
                onContact={() => setSelectedCandidateForContact(match.candidate)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedCandidateForProfile && (
        <CandidateProfileModal
          candidate={selectedCandidateForProfile}
          match={candidateMatches.find((m) => m.candidate.id === selectedCandidateForProfile.id)}
          onRequestJoin={(cand) => {
            const m = candidateMatches.find((x) => x.candidate.id === cand.id);
            if (m) setSelectedMatchForRequest(m);
          }}
          onContact={(cand) => setSelectedCandidateForContact(cand)}
          onClose={() => setSelectedCandidateForProfile(null)}
        />
      )}

      {selectedCandidateForContact && (
        <ContactModal
          candidate={selectedCandidateForContact}
          onClose={() => setSelectedCandidateForContact(null)}
        />
      )}

      {selectedMatchForRequest && (
        <RequestTeamModal
          match={selectedMatchForRequest}
          hackathonName={hackathon}
          onClose={() => setSelectedMatchForRequest(null)}
          onConfirm={async (candidateId, message) => {
            try {
              await api.post('/teams/direct-invite', { candidateId, message });
              toast.success('Team invitation registered in database and notification sent!');
            } catch (err) {
              console.warn('Invite API error:', err);
            }
            setRequestStates((prev) => ({ ...prev, [candidateId]: 'REQUEST_SENT' }));
          }}
        />
      )}

      {selectedCandidateForChallenge && (
        <VerificationChallengeModal
          candidate={selectedCandidateForChallenge}
          onClose={() => setSelectedCandidateForChallenge(null)}
          onChallengeSent={async (candidateId, skillName, message) => {
            try {
              await api.post('/teams/direct-challenge', { candidateId, skillName, message });
              toast.success(`Verification challenge logged in database and dispatched!`);
            } catch (err) {
              console.warn('Challenge API error:', err);
            }
            setRequestStates((prev) => ({ ...prev, [candidateId]: 'CHALLENGE_SENT' }));
          }}
        />
      )}
    </div>
  );
}
