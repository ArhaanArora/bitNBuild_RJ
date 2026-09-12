import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  Users, ShieldCheck, Search, Code2, Globe, ExternalLink, Award, RefreshCw 
} from 'lucide-react';

export const AdminCandidatesView: React.FC<{ onInspectCandidate?: (id: string) => void }> = ({
  onInspectCandidate,
}) => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/candidates');
      setCandidates(res.data?.candidates || []);
    } catch (err) {
      console.error('Failed to load candidates:', err);
      toast.error('Failed to load candidate directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const filtered = candidates.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.publicId?.toLowerCase().includes(q) ||
      c.education?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Candidates Directory & Verified Passports</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold font-mono">
              CAND-2026 Registry
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Browse registered student and engineer credentials, verified skill scores, code assessment performance, and evidence links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCandidates}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by candidate name, CAND-2026 ID, email, university..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-indigo-500/30 transition">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono text-indigo-400 font-bold">{c.publicId}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{c.name}</h3>
                  <div className="text-[11px] text-gray-400">{c.email}</div>
                </div>
                {c.avgScore ? (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                    <Award className="w-3.5 h-3.5" />
                    {c.avgScore} pts
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Unscored</span>
                )}
              </div>

              {c.education && (
                <div className="text-[11px] text-gray-400 mt-2 line-clamp-1">
                  🎓 {c.education}
                </div>
              )}

              {/* Skills Tags */}
              <div className="mt-3 pt-3 border-t border-gray-800/80">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold mb-1.5">
                  Verified Skills ({c.verifiedSkillsCount} / {c.totalSkills})
                </span>
                <div className="flex flex-wrap gap-1">
                  {c.skills?.length === 0 ? (
                    <span className="text-[11px] text-gray-600 italic">No skills claimed</span>
                  ) : (
                    c.skills?.map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          s.status === 'VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {s.name} {s.score ? `(${s.score})` : ''}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Links & Action */}
            <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {c.githubUrl && (
                  <a href={c.githubUrl} title="GitHub Profile" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition">
                    <Code2 className="w-3.5 h-3.5" />
                  </a>
                )}
                {c.linkedinUrl && (
                  <a href={c.linkedinUrl} title="LinkedIn Profile" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition">
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
                {c.portfolioUrl && (
                  <a href={c.portfolioUrl} title="Portfolio Website" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition">
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <a
                href={`/verify/${c.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Public Passport
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
