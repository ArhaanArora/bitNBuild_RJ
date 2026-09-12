import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import RecruiterCompareScene from '../../scenes/RecruiterCompareScene';
import AccessibleViewToggle from '../../scenes/AccessibleViewToggle';

export default function CandidateSearch() {
  const [skill, setSkill] = useState('');
  const [minScore, setMinScore] = useState(60);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [is3D, setIs3D] = useState(true);

  const search = async () => {
    if (!skill) return;
    setLoading(true);
    const { data } = await api.get('/verification/search', { params: { skill, minScore } });
    setResults(data); setSearched(true); setLoading(false);
  };

  const compareCandidates = results.length >= 2 ? [
    {
      name: `${results[0].profile?.firstName || 'Candidate A'} ${results[0].profile?.lastName || ''}`,
      role: results[0].profile?.education || 'Candidate 1',
      trustScore: results[0].verifiedScore || 85,
      skillsScore: results[0].verifiedScore || 88,
      securityScore: results[0].integrityScore || 90,
      color: '#10B981',
      position: [-2.6, 0, 0] as [number, number, number],
    },
    {
      name: `${results[1].profile?.firstName || 'Candidate B'} ${results[1].profile?.lastName || ''}`,
      role: results[1].profile?.education || 'Candidate 2',
      trustScore: results[1].verifiedScore || 80,
      skillsScore: results[1].verifiedScore || 82,
      securityScore: results[1].integrityScore || 85,
      color: '#6366F1',
      position: [2.6, 0, 0] as [number, number, number],
    },
  ] : undefined;

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Search Verified Talent</h1>
        <p className="text-gray-400 text-sm mt-1">Find candidates by verified skill score — no resume fluff</p>
      </div>

      <div className="card">
        <div className="flex gap-3">
          <div className="flex-1"><label className="label">Skill</label><input className="input" placeholder="e.g. Python" value={skill} onChange={e => setSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} /></div>
          <div className="w-32"><label className="label">Min score</label><input type="number" className="input" min={0} max={100} value={minScore} onChange={e => setMinScore(+e.target.value)} /></div>
          <div className="pt-5"><button onClick={search} disabled={!skill || loading} className="btn-primary">{loading ? '…' : 'Search'}</button></div>
        </div>
      </div>

      {searched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">{results.length} candidate{results.length !== 1 ? 's' : ''} found</p>
            {results.length >= 2 && (
              <AccessibleViewToggle is3D={is3D} onToggle={() => setIs3D(!is3D)} />
            )}
          </div>

          {is3D && results.length >= 2 && (
            <div>
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">3D Candidate Orbit Comparison</div>
              <RecruiterCompareScene candidates={compareCandidates} />
            </div>
          )}
          <div className="space-y-3">
            {results.map(r => (
              <div key={r.userId} className="card-hover flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{r.profile?.firstName} {r.profile?.lastName}</p>
                  <p className="text-xs text-gray-500">{r.profile?.education}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Integrity: {r.integrityScore}/100 · Verified {r.lastVerifiedAt ? new Date(r.lastVerifiedAt).toLocaleDateString() : ''}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${r.verifiedScore >= 80 ? 'text-emerald-400' : r.verifiedScore >= 60 ? 'text-amber-400' : 'text-gray-400'}`}>{r.verifiedScore}</div>
                  <div className="text-xs text-gray-500">/ 100</div>
                  <Link to={`/verify/${r.userId}`} target="_blank" className="text-xs text-indigo-400 hover:underline mt-1 inline-block">View profile →</Link>
                </div>
              </div>
            ))}
            {results.length === 0 && <p className="card text-center text-gray-500 py-8">No candidates found for "{skill}" with score ≥ {minScore}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
