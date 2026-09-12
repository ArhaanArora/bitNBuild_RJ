import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import SkillLatticeScene, { LatticeSkill } from '../../scenes/SkillLatticeScene';
import AccessibleViewToggle from '../../scenes/AccessibleViewToggle';
import VerificationBadge from '../../components/common/VerificationBadge';

interface Skill { id: string; skillId: string; skillName: string; skillCategory: string; claimedLevel: string; verificationStatus: string; verifiedScore: number | null; }
interface AvailableSkill { id: string; name: string; category: string; }
interface Assessment { id: string; title: string; }

export default function SkillsPage() {
  const navigate = useNavigate();
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<AvailableSkill[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [is3D, setIs3D] = useState(true);

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

  const latticeSkills: LatticeSkill[] = mySkills.map(s => ({
    name: s.skillName,
    category: s.skillCategory,
    score: s.verifiedScore || 55,
    confidence: s.verifiedScore ? 95 : 35,
    status: s.verificationStatus,
  }));

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F4]">My Skills</h1>
          <p className="text-[#A3A3A8] text-sm mt-1">Claim competencies and verify them with proctored assessments</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary">+ Claim Skill</button>
      </div>

      {/* 3D Skill Lattice vs Flat Toggle */}
      {mySkills.length > 0 && (
        <>
          <div className="flex items-center justify-between bg-[#17171A] p-3.5 rounded-xl border border-[#2A2A2E]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E8672E]">Topology Visualization</span>
              <p className="text-xs text-[#A3A3A8]">Explore your verified competency landscape in 3D spatial elevation</p>
            </div>
            <AccessibleViewToggle is3D={is3D} onToggle={() => setIs3D(!is3D)} />
          </div>

          {is3D && (
            <SkillLatticeScene skills={latticeSkills} className="shadow-2xl rounded-2xl border border-[#2A2A2E]" />
          )}
        </>
      )}

      {/* Add skill panel */}
      {adding && (
        <div className="card border border-[#2A2A2E] bg-[#17171A]">
          <h3 className="section-title text-[#F5F5F4]">Claim a skill</h3>
          <div className="space-y-3">
            <input
              className="input text-xs" placeholder="Search skills…" value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {filtered.slice(0, 8).map(s => (
              <button key={s.id}
                onClick={() => setSelectedSkill(s.id)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${selectedSkill === s.id ? 'border-[#E8672E] bg-[#241C16]' : 'border-[#2A2A2E] bg-[#1E1E22] hover:border-[#38383D]'}`}
              >
                <span className="font-medium text-[#F5F5F4]">{s.name}</span>
                <span className="text-[#6B6B70] text-xs ml-2 font-mono">{s.category}</span>
              </button>
            ))}
            {selectedSkill && (
              <div>
                <label className="label text-[#A3A3A8]">Claimed level</label>
                <select className="input text-xs" value={selectedLevel} onChange={e => setSelectedLevel(e.target.value as any)}>
                  {['beginner', 'intermediate', 'advanced', 'expert'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setAdding(false); setSelectedSkill(''); }} className="btn-ghost flex-1 border-[#2A2A2E] text-[#A3A3A8]">Cancel</button>
              <button onClick={claimSkill} disabled={!selectedSkill} className="btn-primary flex-1">Claim</button>
            </div>
          </div>
        </div>
      )}

      {/* Skills list */}
      {mySkills.length === 0 ? (
        <div className="card text-center py-12 border-[#2A2A2E] bg-[#17171A]">
          <p className="text-[#6B6B70]">No skills claimed yet.</p>
          <button onClick={() => setAdding(true)} className="btn-primary mt-3">Claim your first skill</button>
        </div>
      ) : (
        <div className="space-y-3">
          {mySkills.map(s => (
            <div key={s.id} className="card-hover flex items-center gap-4 border border-[#2A2A2E] bg-[#17171A]">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-medium text-[#F5F5F4] text-base">{s.skillName}</span>
                  <VerificationBadge status={s.verificationStatus} />
                </div>
                <p className="text-xs text-[#6B6B70] capitalize font-mono">Claimed Level: {s.claimedLevel}</p>
                {s.verifiedScore != null && (
                  <div className="mt-2 flex items-center gap-2.5">
                    <div className="score-bar w-32 bg-[#1E1E22] border border-[#2A2A2E] rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${s.verifiedScore >= 80 ? 'bg-[#3FB65F]' : s.verifiedScore >= 60 ? 'bg-[#D89A3E]' : 'bg-[#E0554E]'}`} style={{ width: `${s.verifiedScore}%` }} />
                    </div>
                    <span className="text-xs font-mono font-medium text-[#A3A3A8]">{s.verifiedScore}/100</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {s.verificationStatus !== 'IN_PROGRESS' && (
                  <button onClick={() => startVerification(s)} className="btn-ghost btn-sm text-xs text-[#E8672E] border-[#2A2A2E] hover:border-[#E8672E]">
                    {s.verificationStatus === 'VERIFIED' ? 'Re-verify' : 'Verify →'}
                  </button>
                )}
                <button onClick={() => deleteSkill(s.id)} className="btn-ghost btn-sm text-xs text-[#6B6B70] hover:text-[#E0554E] border-[#2A2A2E]">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
