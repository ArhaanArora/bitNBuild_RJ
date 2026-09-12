import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import VerificationBadge from '../../components/common/VerificationBadge';

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/verification/profile/${userId}`).then(r => setData(r.data)).catch(() => {});
  }, [userId]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#E8672E] border-t-transparent rounded-full" />
      </div>
    );
  }

  const { profile, verifiedSkills, projects, assessmentCount } = data;

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Capsule */}
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-center text-xl font-bold font-mono text-[#F5F5F4]">
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B6B70] block mb-1">
                VERIFIED TALENT PASSPORT
              </span>
              <h1 className="text-xl font-bold text-[#F5F5F4]">
                {profile?.firstName} {profile?.lastName}
              </h1>
              {profile?.education && <p className="text-xs font-mono text-[#A3A3A8] mt-0.5">{profile.education}</p>}
              {profile?.bio && <p className="text-sm text-[#A3A3A8] mt-2 leading-relaxed">{profile.bio}</p>}
              <div className="flex gap-4 mt-3 text-xs font-mono">
                {profile?.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#E8672E] hover:underline">
                    LinkedIn ↗
                  </a>
                )}
                {profile?.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-[#A3A3A8] hover:text-[#F5F5F4]">
                    GitHub ↗
                  </a>
                )}
              </div>
            </div>
            <div className="sm:border-l border-[#2A2A2E] sm:pl-6 pt-3 sm:pt-0 text-left sm:text-center shrink-0">
              <div className="text-3xl font-bold font-mono text-[#3FB65F]">{verifiedSkills?.length || 0}</div>
              <div className="text-[11px] font-mono text-[#6B6B70] uppercase mt-0.5">Verified Skills</div>
            </div>
          </div>
        </div>

        {/* Verified Skills */}
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2A2A2E]">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#6B6B70]">Verified Skill Evidence</h2>
            <span className="text-xs font-mono text-[#3FB65F]">100% Proctored</span>
          </div>

          {!verifiedSkills || verifiedSkills.length === 0 ? (
            <p className="text-[#6B6B70] text-sm py-4 text-center font-mono">No verified skills recorded yet.</p>
          ) : (
            <div className="divide-y divide-[#2A2A2E]">
              {verifiedSkills.map((s: any) => (
                <div key={s.skillName} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[#F5F5F4]">{s.skillName}</span>
                      <VerificationBadge status="VERIFIED" score={s.verifiedScore} />
                    </div>
                    <p className="text-xs font-mono text-[#6B6B70]">
                      Integrity Index: {s.integrityScore}/100 {s.lastVerifiedAt ? `• Audited ${new Date(s.lastVerifiedAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-[#F5F5F4]">{s.verifiedScore}%</div>
                    <div className="text-[10px] font-mono text-[#6B6B70]">BENCHMARK</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#6B6B70] mb-4 pb-3 border-b border-[#2A2A2E]">
              Production Projects ({projects.length})
            </h2>
            <div className="divide-y divide-[#2A2A2E]">
              {projects.map((p: any) => (
                <div key={p.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-[#F5F5F4]">{p.name}</p>
                    {p.role && <span className="text-xs font-mono text-[#E8672E]">{p.role}</span>}
                  </div>
                  <p className="text-xs text-[#A3A3A8] line-clamp-2 leading-relaxed">{p.description}</p>
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-[#6B6B70] hover:text-[#E8672E] inline-block pt-1"
                    >
                      Repository Evidence →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs font-mono text-[#6B6B70] pt-4 px-2">
          <span>Verified by SkillVerify Platform</span>
          <span>{assessmentCount || 0} assessment(s) completed</span>
        </div>

        <div className="text-center pt-2">
          <Link to="/dashboard" className="btn-secondary text-xs py-2 px-6">
            ← Explore Platform
          </Link>
        </div>
      </div>
    </div>
  );
}
