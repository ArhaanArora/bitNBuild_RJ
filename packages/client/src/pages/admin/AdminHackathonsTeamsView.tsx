import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Trophy, Users, Calendar, Search, RefreshCw, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react';

export const AdminHackathonsTeamsView: React.FC = () => {
  const [subTab, setSubTab] = useState<'hackathons' | 'teams'>('hackathons');
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [hRes, tRes] = await Promise.all([
        api.get('/admin/hackathons'),
        api.get('/admin/teams'),
      ]);
      setHackathons(hRes.data?.hackathons || []);
      setTeams(tRes.data?.teams || []);
    } catch (err) {
      console.error('Failed to load hackathons & teams:', err);
      toast.error('Failed to load competition data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await api.post(`/admin/hackathons/${id}/toggle-publish`);
      toast.success(`Hackathon state updated to ${res.data?.hackathon?.isPublished ? 'Published' : 'Draft'}`);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to toggle publish state');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Hackathons & Team Formations</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold font-mono">
              HACK-2026 Registry
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Publish status overrides, registration windows, team composition checks, and skill balance scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setSubTab('hackathons')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                subTab === 'hackathons' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Hackathons ({hackathons.length})
            </button>
            <button
              onClick={() => setSubTab('teams')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                subTab === 'teams' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Formed Teams ({teams.length})
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {subTab === 'hackathons' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hackathons.map(h => (
            <div key={h.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-amber-400">{h.publicId}</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{h.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{h.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    h.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {h.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-800 text-xs">
                  <div className="bg-gray-950/60 p-2 rounded-lg border border-gray-800">
                    <span className="text-[10px] text-gray-500 block">Organizer</span>
                    <span className="text-gray-300 truncate block font-mono text-[11px]">{h.organizerEmail}</span>
                  </div>
                  <div className="bg-gray-950/60 p-2 rounded-lg border border-gray-800">
                    <span className="text-[10px] text-gray-500 block">Registered Teams</span>
                    <span className="text-amber-400 font-bold font-mono text-sm">{h.teamsCount} teams</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Max size: {h.maxTeamSize} per team</span>
                <button
                  onClick={() => handleTogglePublish(h.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    h.isPublished
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {h.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {h.isPublished ? 'Unpublish' : 'Publish Live'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Team Name</th>
                  <th className="py-3 px-4">Hackathon</th>
                  <th className="py-3 px-4">Members</th>
                  <th className="py-3 px-4">Skill Balance Score</th>
                  <th className="py-3 px-4">Required Stack</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-gray-500">
                      No active teams formed yet.
                    </td>
                  </tr>
                ) : (
                  teams.map(t => (
                    <tr key={t.id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3 px-4 font-bold text-white">{t.name}</td>
                      <td className="py-3 px-4 text-amber-400/90 font-medium">{t.hackathonName}</td>
                      <td className="py-3 px-4 font-mono">
                        {t.membersCount} / {t.maxMembers}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400">{t.skillBalanceScore}%</span>
                          <span className="text-[10px] text-gray-500">vector balanced</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {t.requiredSkills?.map((s: string, idx: number) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] text-gray-400">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
