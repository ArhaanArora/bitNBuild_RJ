import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Trophy, Mail, Calendar, Search, RefreshCw, CheckCircle } from 'lucide-react';

export const AdminOrganizersView: React.FC = () => {
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadOrganizers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/organizers');
      setOrganizers(res.data?.organizers || []);
    } catch (err) {
      console.error('Failed to load organizers:', err);
      toast.error('Failed to load hackathon organizers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizers();
  }, []);

  const filtered = organizers.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.email?.toLowerCase().includes(search.toLowerCase()) ||
    o.publicId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Hackathon Organizers & Hosts</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold font-mono">
              ORGN-2026 Registry
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage authorized campus, university, and community hackathon organizers.
          </p>
        </div>

        <button
          onClick={loadOrganizers}
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
          placeholder="Search organizers by name, ORGN-2026 ID, email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(o => (
          <div key={o.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">{o.publicId}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{o.name}</h3>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-gray-600" />
                    {o.email}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold mb-1.5">
                  Hosted Hackathons ({o.hackathonsCount})
                </span>
                <div className="space-y-1">
                  {o.hackathons?.length === 0 ? (
                    <span className="text-[11px] text-gray-600 italic">No events created yet</span>
                  ) : (
                    o.hackathons?.map((h: any) => (
                      <div key={h.id} className="text-[11px] text-gray-300 flex items-center justify-between p-1.5 rounded-lg bg-gray-950/60 border border-gray-800">
                        <span className="truncate">{h.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${h.isPublished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                          {h.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800 text-[11px] text-gray-500 flex items-center justify-between">
              <span>BitNBuild Partner</span>
              <span className="text-emerald-400 font-medium">Privileged Host</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
