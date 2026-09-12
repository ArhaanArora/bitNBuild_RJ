import React, { useState } from 'react';
import { 
  Activity, Cpu, Users, Briefcase, Trophy, ShieldAlert, Building, ShieldCheck, 
  Database, Mail, Globe, Server, Flag, Lock, Search, Command, RefreshCw, Zap
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';

interface AdminShellProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  systemHealth?: any;
  onRefresh?: () => void;
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  activeTab,
  onSelectTab,
  systemHealth,
  onRefresh,
  children,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navSections = [
    {
      title: 'Executive',
      items: [
        { id: 'overview', label: 'Command Overview', icon: <Activity className="w-4 h-4" /> },
        { id: 'ai_inference', label: 'AI Inference (Sec 20A)', icon: <Cpu className="w-4 h-4" />, badge: 'AI' },
      ]
    },
    {
      title: 'Ecosystem & Access',
      items: [
        { id: 'candidates', label: 'Candidates & Passports', icon: <Users className="w-4 h-4" /> },
        { id: 'recruiters', label: 'Recruiters & Partners', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'organizers', label: 'Hackathon Organizers', icon: <Trophy className="w-4 h-4" /> },
        { id: 'organizations', label: 'Client Orgs & KYB', icon: <Building className="w-4 h-4" />, badge: 'KYB' },
        { id: 'users_rbac', label: 'Users & RBAC', icon: <ShieldAlert className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Verification & Comps',
      items: [
        { id: 'verifications', label: 'Verification Queue', icon: <ShieldCheck className="w-4 h-4" />, badge: 'Gate' },
        { id: 'skills_taxonomy', label: 'Canonical Skills', icon: <Database className="w-4 h-4" /> },
        { id: 'hackathons_teams', label: 'Hackathons & Teams', icon: <Trophy className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Content & Comms',
      items: [
        { id: 'inbox', label: 'Unified Inbox', icon: <Mail className="w-4 h-4" /> },
        { id: 'cms', label: 'Website CMS & Sync', icon: <Globe className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Infrastructure & Ops',
      items: [
        { id: 'live_operations', label: 'Live Operations (3D/2D)', icon: <Server className="w-4 h-4" />, badge: '3D' },
        { id: 'feature_flags', label: 'Feature Flags', icon: <Flag className="w-4 h-4" /> },
        { id: 'audit', label: 'Security & Audit Trail', icon: <Lock className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20">
            OS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-white tracking-wide">SUPER ADMIN COMMAND CENTER</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                100% OPERATIONAL
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Neon PostgreSQL • 14ms DB Latency • Section 20A AI Guardrails Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Trigger Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-gray-950/80 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition text-xs shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Search entities or actions...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-gray-900 border border-gray-700 rounded text-gray-400 font-mono">
              Ctrl K
            </kbd>
          </button>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh All Real-time Data"
              className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sub-Navigation Sidebar */}
        <aside className="w-64 shrink-0 bg-gray-900/50 border-r border-gray-800/80 p-4 space-y-6 overflow-y-auto hidden md:block">
          {navSections.map(section => (
            <div key={section.title} className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 px-3 block">
                {section.title}
              </span>
              <div className="space-y-0.5 pt-1">
                {section.items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          isActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Mobile Horizontal Navigation Tabs */}
        <div className="md:hidden flex items-center gap-1 p-2 bg-gray-900 border-b border-gray-800 overflow-x-auto">
          {navSections.flatMap(s => s.items).map(item => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                activeTab === item.id ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Canvas */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Command Palette Keyboard Shortcut Modal */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTab={onSelectTab}
      />
    </div>
  );
};
