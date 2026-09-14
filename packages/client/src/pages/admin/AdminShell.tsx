import React, { useState } from 'react';
import { 
  Activity, Cpu, Users, Briefcase, Trophy, ShieldAlert, Building, ShieldCheck, 
  Database, Mail, Globe, Server, Flag, Lock, Search, RefreshCw,
  BarChart2, Key, FileCheck, Settings
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
        { id: 'analytics', label: 'Platform Analytics', icon: <BarChart2 className="w-4 h-4" />, badge: 'BI' },
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
      title: 'Security & Governance',
      items: [
        { id: 'audit', label: 'Security & Audit Trail', icon: <Lock className="w-4 h-4" /> },
        { id: 'sessions', label: 'Active Sessions & Access', icon: <Key className="w-4 h-4" /> },
        { id: 'compliance', label: 'GDPR & Compliance', icon: <FileCheck className="w-4 h-4" />, badge: 'GDPR' },
      ]
    },
    {
      title: 'Infrastructure & Ops',
      items: [
        { id: 'live_operations', label: 'Live Operations (3D/2D)', icon: <Server className="w-4 h-4" />, badge: '3D' },
        { id: 'feature_flags', label: 'Feature Flags', icon: <Flag className="w-4 h-4" /> },
        { id: 'settings', label: 'Platform Settings', icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0F] text-[#F5F5F4]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#17171A] border-b border-[#2A2A2E] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] flex items-center justify-center text-xs font-mono font-bold">
            <span className="text-[#F5F5F4]">S</span>
            <span className="text-[#E8672E]">V</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xs font-bold text-[#F5F5F4] tracking-wider uppercase font-mono">
                SUPER ADMIN COMMAND CENTER
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3FB65F]" />
                OPERATIONAL
              </span>
            </div>
            <span className="text-[11px] text-[#6B6B70] font-mono">
              PostgreSQL • Sub-15ms Latency • AI Guardrails Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Trigger Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] hover:border-[#38383D] text-[#A3A3A8] hover:text-[#F5F5F4] transition-colors text-xs font-mono"
          >
            <Search className="w-3.5 h-3.5 text-[#6B6B70]" />
            <span className="hidden sm:inline">Quick command...</span>
            <kbd className="px-1.5 py-0.2 text-[10px] bg-[#17171A] border border-[#2A2A2E] rounded text-[#6B6B70]">
              Ctrl K
            </kbd>
          </button>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh All Real-time Data"
              className="p-1.5 rounded-lg bg-[#1E1E22] hover:bg-[#2A2A2E] border border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sub-Navigation Sidebar */}
        <aside className="w-60 shrink-0 bg-[#17171A] border-r border-[#2A2A2E] p-3 space-y-5 overflow-y-auto hidden md:block">
          {navSections.map(section => (
            <div key={section.title} className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#6B6B70] px-3 block">
                {section.title}
              </span>
              <div className="space-y-0.5 pt-1">
                {section.items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                        isActive
                          ? 'bg-[#241C16] text-[#F5F5F4] font-medium border-l-2 border-[#E8672E]'
                          : 'text-[#A3A3A8] hover:text-[#F5F5F4] hover:bg-[#1E1E22]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? 'text-[#E8672E]' : 'text-[#6B6B70]'}>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                          isActive ? 'bg-[#E8672E]/20 text-[#E8672E]' : 'bg-[#1E1E22] text-[#6B6B70] border border-[#2A2A2E]'
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
        <div className="md:hidden flex items-center gap-1 p-2 bg-[#17171A] border-b border-[#2A2A2E] overflow-x-auto">
          {navSections.flatMap(s => s.items).map(item => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
                activeTab === item.id ? 'bg-[#241C16] text-[#E8672E] border border-[#E8672E]/40 font-medium' : 'text-[#A3A3A8]'
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
