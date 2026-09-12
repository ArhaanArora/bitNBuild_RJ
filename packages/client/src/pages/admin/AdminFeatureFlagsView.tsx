import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Flag, Sliders, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export const AdminFeatureFlagsView: React.FC = () => {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/feature-flags');
      setFlags(res.data?.flags || []);
    } catch (err) {
      console.error('Failed to load feature flags:', err);
      toast.error('Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleToggle = async (key: string, currentEnabled: boolean) => {
    try {
      const newEnabled = !currentEnabled;
      await api.post(`/admin/feature-flags/${key}/toggle`, { enabled: newEnabled });
      toast.success(`Feature flag ${key} ${newEnabled ? 'enabled' : 'disabled'}`);
      setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: newEnabled } : f));
    } catch (err: any) {
      toast.error('Failed to toggle feature flag');
    }
  };

  const handleRolloutChange = async (key: string, percentage: number) => {
    try {
      await api.post(`/admin/feature-flags/${key}/rollout`, { percentage });
      toast.success(`Updated rollout for ${key} to ${percentage}%`);
      setFlags(prev => prev.map(f => f.key === key ? { ...f, rolloutPercentage: percentage } : f));
    } catch (err: any) {
      toast.error('Failed to update rollout percentage');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white">Platform Feature Flags & Staged Rollout</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold font-mono">
              Zero-Downtime Releases
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Toggle platform features dynamically, configure progressive percentage rollouts, and enforce kill-switches.
          </p>
        </div>

        <button
          onClick={loadFlags}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flags.map(f => (
          <div key={f.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-white text-sm">{f.key}</span>
                <p className="text-xs text-gray-400 mt-1">{f.description}</p>
              </div>
              <button
                onClick={() => handleToggle(f.key, f.enabled)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  f.enabled ? 'bg-emerald-500' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    f.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 border-t border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium">Staged Rollout</span>
                <span className="font-mono font-bold text-orange-400">{f.rolloutPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={f.rolloutPercentage}
                onChange={e => handleRolloutChange(f.key, Number(e.target.value))}
                className="w-full accent-orange-500 bg-gray-950 rounded-lg cursor-pointer"
              />
              <div className="text-[10px] text-gray-500 flex items-center justify-between">
                <span>0% (Internal only)</span>
                <span>100% (All users)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
