import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Briefcase, Building, Mail, Globe, Search, RefreshCw, CheckCircle } from 'lucide-react';

export const AdminRecruitersView: React.FC = () => {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadRecruiters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/recruiters');
      setRecruiters(res.data?.recruiters || []);
    } catch (err) {
      console.error('Failed to load recruiters:', err);
      toast.error('Failed to load recruiters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruiters();
  }, []);

  const filtered = recruiters.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.publicId?.toLowerCase().includes(search.toLowerCase()) ||
    r.organizationName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Recruiters & Talent Partners</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold font-mono">
              RECR-2026 Registry
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage recruiter portal access, enterprise affiliations, search queries, and talent shortlists.
          </p>
        </div>

        <button
          onClick={loadRecruiters}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by recruiter name, RECR-2026 ID, affiliated organization..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Recruiter ID</th>
                <th className="py-3 px-4">Recruiter Name</th>
                <th className="py-3 px-4">Corporate Entity</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gray-500">
                    No matching recruiters found.
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-800/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{r.publicId}</td>
                    <td className="py-3 px-4 font-bold text-white">{r.name}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 text-gray-200">
                        <Building className="w-3.5 h-3.5 text-gray-500" />
                        {r.organizationName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-600" />
                      {r.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Active Vetted
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
