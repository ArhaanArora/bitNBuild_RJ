import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Lock, FileText, Search, RefreshCw, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

export const AdminAuditSecurityView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs?limit=100');
      setLogs(res.data?.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.entityType?.toLowerCase().includes(search.toLowerCase()) ||
    l.publicId?.toLowerCase().includes(search.toLowerCase()) ||
    l.entityId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-white">Cryptographic Immutable Audit Trail</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 font-semibold font-mono">
              AUD-2026 Registry
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Append-only verification decisions, role alterations, CMS publications, and self-healing action history.
          </p>
        </div>

        <button
          onClick={loadLogs}
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
          placeholder="Filter by action (e.g. SKILL_VERIFICATION), AUD-2026 ID, entity..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Entity Target</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map(l => {
                const isExpanded = expandedId === l.id;
                return (
                  <React.Fragment key={l.id}>
                    <tr className="hover:bg-gray-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-gray-400">
                        {l.publicId || l.id.substring(0, 8)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-indigo-400 text-xs">{l.action}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-mono">
                          {l.entityType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-[11px]">
                        {new Date(l.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : l.id)}
                          className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition text-[11px] inline-flex items-center gap-1"
                        >
                          JSON {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-950/90">
                        <td colSpan={5} className="p-4">
                          <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap overflow-x-auto bg-black/60 p-3 rounded-xl border border-gray-800">
                            {JSON.stringify(l.details || {}, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
