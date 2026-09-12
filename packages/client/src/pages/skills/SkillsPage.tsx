import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

interface Skill { id: string; skillId: string; skillName: string; skillCategory: string; claimedLevel: string; verificationStatus: string; verifiedScore: number | null; }
interface AvailableSkill { id: string; name: string; category: string; }
interface Assessment { id: string; title: string; }

const STATUS_BADGE: Record<string, string> = {
  VERIFIED: 'badge-verified', UNVERIFIED: 'badge-unverified',
  IN_PROGRESS: 'badge-in-progress', EXPIRED: 'badge-expired',
};

export default function SkillsPage() {
  const navigate = useNavigate();
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<AvailableSkill[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');

  const load = async () => {
    const [sk, all, ass] = await Promise.all([api.get('/skills/mine'), api.get('/skills'), api.get('/assessments')]);
    setMySkills(sk.data); setAllSkills(all.data); setAssessments(ass.data);
  };
  useEffect(() => { load(); }, []);

  const claimSkill = async () => {
    if (!selectedSkill) return;
    try {
      await api.post('/skills/mine', { skillId: selectedSkill, claimedLevel: selectedLevel });
      toast.success('Skill claimed!'); setAdding(false); setSelectedSkill(''); load();
    } catch (e: any) { toast.error(e.response?.data?.error ?? 'Failed'); }
  };

  const startVerification = async (skill: Skill) => {
    if (!assessments[0]) { toast.error('No assessments available'); return; }
    try {
      const { data } = await api.post('/sessions/start', { assessmentId: assessments[0].id, candidateSkillId: skill.id });
      navigate(`/assessment/${data.sessionId}`);
    } catch { toast.error('Could not start assessment'); }
  };

  const deleteSkill = async (id: string) => {
    await api.delete(`/skills/mine/${id}`);
    setMySkills(prev => prev.filter(s => s.id !== id));
  };

  const unclaimed = allSkills.filter(s => !mySkills.some(ms => ms.skillId === s.id));
  const filtered = search ? unclaimed.filter(s => s.name.toLowerCase().includes(search.toLowerCase())) : unclaimed;

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Skills</h1>
          <p className="text-gray-400 text-sm mt-1">Claim skills and verify them with assessments</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary">+ Claim Skill</button>
      </div>

      {/* Add skill panel */}
      {adding && (
        <div className="card border-indigo-700/50">
          <h3 className="section-title">Claim a skill</h3>
          <div className="space-y-3">
            <input
              className="input" placeholder="Search skills…" value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {filtered.slice(0, 8).map(s => (
              <button key={s.id}
                onClick={() => setSelectedSkill(s.id)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${selectedSkill === s.id ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700 hover:border-gray-600'}`}
              >
                <span className="font-medium text-white">{s.name}</span>
                <span className="text-gray-500 text-xs ml-2">{s.category}</span>
              </button>
            ))}
            {selectedSkill && (
              <div>
                <label className="label">Claimed level</label>
                <select className="input" value={selectedLevel} onChange={e => setSelectedLevel(e.target.value as any)}>
                  {['beginner', 'intermediate', 'advanced', 'expert'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setAdding(false); setSelectedSkill(''); }} className="btn-ghost flex-1">Cancel</button>
              <button onClick={claimSkill} disabled={!selectedSkill} className="btn-primary flex-1">Claim</button>
            </div>
          </div>
        </div>
      )}

      {/* Skills list */}
      {mySkills.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No skills claimed yet.</p>
          <button onClick={() => setAdding(true)} className="btn-primary mt-3">Claim your first skill</button>
        </div>
      ) : (
        <div className="space-y-3">
          {mySkills.map(s => (
            <div key={s.id} className="card-hover flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{s.skillName}</span>
                  <span className={STATUS_BADGE[s.verificationStatus] ?? 'badge'}>{s.verificationStatus}</span>
                </div>
                <p className="text-xs text-gray-500 capitalize">Claimed: {s.claimedLevel}</p>
                {s.verifiedScore != null && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="score-bar w-32"><div className={`score-fill ${s.verifiedScore >= 80 ? 'bg-emerald-500' : s.verifiedScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${s.verifiedScore}%` }} /></div>
                    <span className="text-xs font-medium text-gray-300">{s.verifiedScore}/100</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {s.verificationStatus !== 'IN_PROGRESS' && (
                  <button onClick={() => startVerification(s)} className="btn-ghost btn-sm text-indigo-400 border-indigo-700">
                    {s.verificationStatus === 'VERIFIED' ? 'Re-verify' : 'Verify →'}
                  </button>
                )}
                <button onClick={() => deleteSkill(s.id)} className="btn-ghost btn-sm text-red-400 border-red-900">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
