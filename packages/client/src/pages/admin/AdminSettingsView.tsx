import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import {
  Settings, Server, Database, Shield, Cpu, Wifi, WifiOff,
  RefreshCw, CheckCircle, AlertTriangle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

function ServiceBadge({ status }: { status: string }) {
  const cfg = {
    HEALTHY: { color: 'text-[#3FB65F]', bg: 'bg-[#16261B] border-[#3FB65F]/30', icon: CheckCircle },
    CONFIGURED: { color: 'text-[#3FB65F]', bg: 'bg-[#16261B] border-[#3FB65F]/30', icon: CheckCircle },
    CONNECTED: { color: 'text-[#3FB65F]', bg: 'bg-[#16261B] border-[#3FB65F]/30', icon: CheckCircle },
    DEGRADED: { color: 'text-[#D89A3E]', bg: 'bg-[#26200E] border-[#D89A3E]/30', icon: AlertTriangle },
    CRITICAL: { color: 'text-[#E0554E]', bg: 'bg-[#2A1717] border-[#E0554E]/30', icon: XCircle },
    UNCONFIGURED: { color: 'text-[#6B6B70]', bg: 'bg-[#1E1E22] border-[#38383D]', icon: WifiOff },
  }[status] || { color: 'text-[#6B6B70]', bg: 'bg-[#1E1E22] border-[#38383D]', icon: Wifi };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {status}
    </span>
  );
}

export const AdminSettingsView: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [healthRes, settingsRes] = await Promise.all([
        adminService.getSystemHealth(),
        adminService.getPlatformSettings(),
      ]);
      setHealth(healthRes);
      setSettings(settingsRes.settings);
    } catch {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F5F5F4]">Platform Settings & System Health</h1>
          <p className="text-xs text-[#6B6B70] mt-0.5 font-mono">Infrastructure status, service configuration, and platform controls</p>
        </div>
        <button onClick={load} aria-label="Refresh settings" className="p-1.5 rounded-lg bg-[#17171A] border border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4] transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* System Health Overview */}
      {health && (
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#E8672E]" />
              <h3 className="text-sm font-semibold text-[#F5F5F4]">System Health</h3>
            </div>
            <ServiceBadge status={health.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1E1E22] rounded-lg p-3">
              <p className="text-[10px] text-[#6B6B70] font-mono uppercase mb-1">Uptime</p>
              <p className="text-sm font-mono font-bold text-[#F5F5F4]">{formatUptime(health.uptimeSeconds)}</p>
            </div>
            <div className="bg-[#1E1E22] rounded-lg p-3">
              <p className="text-[10px] text-[#6B6B70] font-mono uppercase mb-1">DB Latency</p>
              <p className={`text-sm font-mono font-bold ${health.database?.latencyMs < 100 ? 'text-[#3FB65F]' : 'text-[#D89A3E]'}`}>
                {health.database?.latencyMs}ms
              </p>
            </div>
            <div className="bg-[#1E1E22] rounded-lg p-3">
              <p className="text-[10px] text-[#6B6B70] font-mono uppercase mb-1">Heap Memory</p>
              <p className="text-sm font-mono font-bold text-[#F5F5F4]">{health.memory?.heapUsedMb}MB / {health.memory?.heapTotalMb}MB</p>
            </div>
            <div className="bg-[#1E1E22] rounded-lg p-3">
              <p className="text-[10px] text-[#6B6B70] font-mono uppercase mb-1">Node.js</p>
              <p className="text-sm font-mono font-bold text-[#F5F5F4]">{health.nodeVersion}</p>
            </div>
          </div>

          {/* Service Status Grid */}
          <div className="space-y-2">
            <p className="text-[10px] text-[#6B6B70] font-mono uppercase tracking-wider">Services</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(health.services || {}).map(([name, svc]: [string, any]) => (
                <div key={name} className="flex items-center justify-between bg-[#1E1E22] rounded-lg px-3 py-2">
                  <span className="text-xs font-mono text-[#A3A3A8] capitalize">{name}</span>
                  <ServiceBadge status={svc.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Platform Configuration */}
      {settings && (
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2A2A2E] flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#E8672E]" />
            <h3 className="text-sm font-semibold text-[#F5F5F4]">Platform Configuration</h3>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#1E1E22] text-[#6B6B70] border border-[#2A2A2E] ml-auto">Read-only — edit via ENV</span>
          </div>
          <div className="divide-y divide-[#2A2A2E]/50">
            {[
              { key: 'Environment', value: settings.environment, icon: <Server className="w-3.5 h-3.5" /> },
              { key: 'Platform Version', value: settings.platformVersion, icon: <Cpu className="w-3.5 h-3.5" /> },
              { key: 'Registration', value: settings.registrationOpen ? 'Open' : 'Closed', icon: <Shield className="w-3.5 h-3.5" /> },
              { key: 'Verification System', value: settings.verificationEnabled ? 'Enabled' : 'Disabled', icon: <CheckCircle className="w-3.5 h-3.5" /> },
              { key: 'AI Verification', value: settings.aiVerificationEnabled ? 'Enabled' : 'Disabled (no API key)', icon: <Cpu className="w-3.5 h-3.5" /> },
              { key: 'Firebase Auth', value: settings.firebaseConfigured ? 'Configured' : 'Not Configured', icon: <Shield className="w-3.5 h-3.5" /> },
              { key: 'OpenAI', value: settings.openaiConfigured ? 'Configured' : 'Not Configured', icon: <Cpu className="w-3.5 h-3.5" /> },
              { key: 'Max Upload Size', value: `${settings.maxUploadSizeMb}MB`, icon: <Database className="w-3.5 h-3.5" /> },
            ].map(({ key, value, icon }) => (
              <div key={key} className="flex items-center justify-between px-5 py-3 hover:bg-[#1A1A1D] transition-colors">
                <div className="flex items-center gap-2 text-xs font-mono text-[#A3A3A8]">
                  <span className="text-[#6B6B70]">{icon}</span>
                  {key}
                </div>
                <span className="text-xs font-mono font-medium text-[#F5F5F4]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#26200E] border border-[#D89A3E]/30 rounded-xl p-4 flex items-start gap-3 text-xs text-[#D89A3E]">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-semibold">Configuration is environment-controlled</p>
          <p className="text-[#A3A3A8] mt-1 leading-relaxed">
            Platform settings are controlled via environment variables in <code className="font-mono text-[#D89A3E]">packages/api/.env</code>.
            To change values, update the env file and restart the API server. Never expose secrets in the UI.
          </p>
        </div>
      </div>
    </div>
  );
};
