import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

export default function CandidateSearch() {
  const [skill, setSkill] = useState('');
  const [minScore, setMinScore] = useState(60);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!skill) return;
    setLoading(true);
    const { data } = await api.get('/verification/search', { params: { skill, minScore } });
    setResults(data); setSearched(true); setLoading(false);
  };

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
        <div>
          <p className="text-sm text-gray-400 mb-3">{results.length} candidate{results.length !== 1 ? 's' : ''} found</p>
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
