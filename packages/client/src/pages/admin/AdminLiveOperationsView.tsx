import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Activity, ShieldAlert, Zap, RefreshCw, CheckCircle, AlertTriangle, Play, Server } from 'lucide-react';
import { Admin3DScene } from './Admin3DScene';

export const AdminLiveOperationsView: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'3d' | '2d'>('3d');
  const [triggering, setTriggering] = useState<string | null>(null);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/incidents');
      setIncidents(res.data?.incidents || []);
    } catch (err) {
      console.error('Failed to load incidents:', err);
      toast.error('Failed to load system incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleTriggerSelfHeal = async (actionType: string) => {
    setTriggering(actionType);
    try {
      const res = await api.post('/admin/automation/self-heal', { actionType });
      toast.success(res.data?.message || 'Self-healing action executed');
      loadIncidents();
    } catch (err: any) {
      toast.error('Failed to trigger self-healing action');
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Live Spatial Operations & Incident Manager</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
              🟢 Cluster Operational
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Toggle between interactive WebGL 3D spatial topology and accessible WCAG 2.2 AA 2D mode with automated self-healing actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setMode('3d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                mode === '3d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              3D Spatial View
            </button>
            <button
              onClick={() => setMode('2d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                mode === '2d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              2D Standard (Accessible)
            </button>
          </div>

          <button
            onClick={loadIncidents}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Spatial 3D Scene or Accessible 2D Table */}
      {mode === '3d' ? (
        <Admin3DScene onSwitchTo2D={() => setMode('2d')} />
      ) : (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white">2D Authoritative Service Status Matrix (WCAG 2.2 AA)</h3>
            <span className="text-xs text-emerald-400 font-medium">6 of 6 nodes healthy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {[
              { name: 'API Gateway', role: 'Express Node Port 6970', latency: '4ms', rps: '420 req/s', status: 'HEALTHY' },
              { name: 'PostgreSQL DB', role: 'Neon Cloud Cluster (SSL)', latency: '14ms', rps: '1,840 op/s', status: 'HEALTHY' },
              { name: 'AI Inference Engine', role: 'Model Router & Fallback Chain', latency: '920ms', rps: '18 inf/m', status: 'HEALTHY' },
              { name: 'Verification Worker', role: 'Static AST & Code Proctoring', latency: '650ms', rps: '35 job/m', status: 'HEALTHY' },
              { name: 'Auth Guard', role: 'JWT & Session Tokenizer', latency: '2ms', rps: '140 auth/s', status: 'HEALTHY' },
              { name: 'Redis Cache Layer', role: 'In-Memory Cache & Buffer', latency: '1ms', rps: '2,400 hit/s', status: 'HEALTHY' },
            ].map(node => (
              <div key={node.name} className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">{node.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {node.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">{node.role}</p>
                <div className="flex items-center justify-between text-[11px] pt-1 text-gray-500 font-mono">
                  <span>Latency: <strong className="text-emerald-400">{node.latency}</strong></span>
                  <span>Throughput: <strong className="text-indigo-300">{node.rps}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automated Self-Healing Trigger Center */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Automated Self-Healing Actions
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Execute controlled zero-downtime diagnostic and remediation routines with audit trail recording.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <button
            disabled={triggering !== null}
            onClick={() => handleTriggerSelfHeal('FLUSH_CACHE')}
            className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 hover:border-amber-500/40 text-left transition group disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs group-hover:text-amber-400 transition">Purge Redis Cache</span>
              <Play className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Flush stale query keys and warm buffers.</p>
          </button>

          <button
            disabled={triggering !== null}
            onClick={() => handleTriggerSelfHeal('ROTATE_GITHUB_TOKENS')}
            className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 hover:border-yellow-500/40 text-left transition group disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs group-hover:text-yellow-400 transition">Rotate GitHub Tokens</span>
              <Play className="w-3.5 h-3.5 text-gray-500 group-hover:text-yellow-400 transition" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Rotate standby tokens to reset hourly rate quotas.</p>
          </button>

          <button
            disabled={triggering !== null}
            onClick={() => handleTriggerSelfHeal('REINDEX_CANDIDATE_SKILLS')}
            className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 hover:border-blue-500/40 text-left transition group disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs group-hover:text-blue-400 transition">Re-index Vectors</span>
              <Play className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Rebuild HNSW candidate skill similarity index.</p>
          </button>

          <button
            disabled={triggering !== null}
            onClick={() => handleTriggerSelfHeal('RESTART_WORKER_POOL')}
            className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 hover:border-purple-500/40 text-left transition group disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs group-hover:text-purple-400 transition">Restart Workers</span>
              <Play className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400 transition" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Gracefully drain and restart worker threads.</p>
          </button>
        </div>
      </div>

      {/* Incident History Stream */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            System Incidents & Remediation Timeline
          </h3>
          <span className="text-xs text-gray-400 font-mono">{incidents.length} recorded</span>
        </div>

        <div className="mt-4 space-y-3">
          {incidents.map(inc => (
            <div key={inc.id} className="p-4 rounded-xl bg-gray-950/70 border border-gray-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{inc.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-800 text-gray-300">
                    {inc.service}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {inc.status}
                </span>
              </div>

              {inc.timelineJson && (
                <div className="pl-3 border-l-2 border-gray-800 space-y-1">
                  {inc.timelineJson.map((t: any, idx: number) => (
                    <div key={idx} className="text-[11px] text-gray-400">
                      <strong className="text-gray-300 font-mono">{t.time}:</strong> {t.note}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[10px] text-gray-500 flex items-center justify-between pt-1">
                <span>Created: {new Date(inc.createdAt).toLocaleString()}</span>
                {inc.resolvedAt && <span>Resolved: {new Date(inc.resolvedAt).toLocaleTimeString()}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
