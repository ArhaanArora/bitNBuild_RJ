import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/verification/profile/${userId}`).then(r => setData(r.data)).catch(() => {});
  }, [userId]);

  if (!data) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>;

  const { profile, verifiedSkills, allSkills, projects, assessmentCount, latestIntegrityScore } = data;

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6 fade-in-up">
        {/* Header */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-700 flex items-center justify-center text-2xl font-bold text-white">
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{profile?.firstName} {profile?.lastName}</h1>
              {profile?.education && <p className="text-sm text-gray-400">{profile.education}</p>}
              {profile?.bio && <p className="text-sm text-gray-500 mt-1">{profile.bio}</p>}
              <div className="flex gap-3 mt-2 text-xs">
                {profile?.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">LinkedIn</a>}
                {profile?.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:underline">GitHub</a>}
              </div>
            </div>
            <div className="ml-auto text-center">
              <div className="text-3xl font-bold text-emerald-400">{verifiedSkills.length}</div>
              <div className="text-xs text-gray-500">Verified Skills</div>
            </div>
          </div>
        </div>

        {/* Verified Skills */}
        <div className="card">
          <h2 className="section-title">Verified Skills</h2>
          {verifiedSkills.length === 0 ? <p className="text-gray-500 text-sm">No verified skills yet.</p> : (
            <div className="space-y-3">
              {verifiedSkills.map((s: any) => (
                <div key={s.skillName} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white">{s.skillName}</span>
                    <span className="badge badge-verified ml-2">Verified</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Integrity: {s.integrityScore}/100 · {s.lastVerifiedAt ? new Date(s.lastVerifiedAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">{s.verifiedScore}</div>
                    <div className="text-xs text-gray-500">/ 100</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <div className="card">
            <h2 className="section-title">Projects</h2>
            <div className="space-y-3">
              {projects.map((p: any) => (
                <div key={p.id} className="border-b border-gray-700 last:border-0 pb-3 last:pb-0">
                  <p className="font-medium text-white">{p.name}</p>
                  <p className="text-xs text-indigo-400">{p.role}</p>
                  <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{p.description}</p>
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-indigo-400 mt-1 inline-block">GitHub →</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-600">Verified by SkillVerify · {assessmentCount} assessment(s) completed</p>
      </div>
    </div>
  );
}
