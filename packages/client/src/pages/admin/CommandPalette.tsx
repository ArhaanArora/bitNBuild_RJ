import React, { useState, useEffect } from 'react';
import { Search, Command, ArrowRight, Shield, Cpu, Users, Building, Flag, Mail, Globe, Activity, FileText } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onTriggerAction?: (action: string) => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onTriggerAction,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items: CommandItem[] = [
    {
      id: 'overview',
      title: 'Executive Overview & Live Telemetry',
      category: 'Navigation',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      action: () => { onSelectTab('overview'); onClose(); }
    },
    {
      id: 'analytics',
      title: 'Platform Analytics & Business Intelligence Impact',
      category: 'Executive',
      icon: <Activity className="w-4 h-4 text-blue-400" />,
      badge: 'BI',
      action: () => { onSelectTab('analytics'); onClose(); }
    },
    {
      id: 'ai_inference',
      title: 'AI Inference Architecture (Section 20A Model Routing & Budgets)',
      category: 'Executive',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      badge: 'Section 20A',
      action: () => { onSelectTab('ai_inference'); onClose(); }
    },
    {
      id: 'candidates',
      title: 'Candidates Directory & Verification Passports',
      category: 'Ecosystem',
      icon: <Users className="w-4 h-4 text-blue-400" />,
      action: () => { onSelectTab('candidates'); onClose(); }
    },
    {
      id: 'recruiters',
      title: 'Recruiters & Talent Partners Directory',
      category: 'Ecosystem',
      icon: <Users className="w-4 h-4 text-sky-400" />,
      action: () => { onSelectTab('recruiters'); onClose(); }
    },
    {
      id: 'organizers',
      title: 'Hackathon Organizers & Events Directory',
      category: 'Ecosystem',
      icon: <Users className="w-4 h-4 text-indigo-400" />,
      action: () => { onSelectTab('organizers'); onClose(); }
    },
    {
      id: 'organizations',
      title: 'Client Organizations & KYB Gating',
      category: 'Ecosystem',
      icon: <Building className="w-4 h-4 text-amber-400" />,
      badge: 'KYB',
      action: () => { onSelectTab('organizations'); onClose(); }
    },
    {
      id: 'users_rbac',
      title: 'Users & RBAC Tier Permissions',
      category: 'Ecosystem',
      icon: <Shield className="w-4 h-4 text-rose-400" />,
      action: () => { onSelectTab('users_rbac'); onClose(); }
    },
    {
      id: 'verifications',
      title: 'Verification Moderation Queue',
      category: 'Verification',
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      action: () => { onSelectTab('verifications'); onClose(); }
    },
    {
      id: 'skills_taxonomy',
      title: 'Canonical Skills Taxonomy & Aliases',
      category: 'Verification',
      icon: <Activity className="w-4 h-4 text-teal-400" />,
      action: () => { onSelectTab('skills_taxonomy'); onClose(); }
    },
    {
      id: 'hackathons_teams',
      title: 'Hackathons & Squad Formations',
      category: 'Verification',
      icon: <Activity className="w-4 h-4 text-amber-400" />,
      action: () => { onSelectTab('hackathons_teams'); onClose(); }
    },
    {
      id: 'inbox',
      title: 'Unified Inquiries Inbox & AI Triage',
      category: 'Content',
      icon: <Mail className="w-4 h-4 text-rose-400" />,
      action: () => { onSelectTab('inbox'); onClose(); }
    },
    {
      id: 'cms',
      title: 'Website CMS & Public Live Sync',
      category: 'Content',
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
      action: () => { onSelectTab('cms'); onClose(); }
    },
    {
      id: 'sessions',
      title: 'Active Admin Sessions & Perimeter Access',
      category: 'Security',
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      action: () => { onSelectTab('sessions'); onClose(); }
    },
    {
      id: 'compliance',
      title: 'GDPR Compliance & Data Rights (Erasure / Export)',
      category: 'Security',
      icon: <FileText className="w-4 h-4 text-yellow-400" />,
      badge: 'GDPR',
      action: () => { onSelectTab('compliance'); onClose(); }
    },
    {
      id: 'audit',
      title: 'Cryptographic Immutable Audit Trail',
      category: 'Security',
      icon: <FileText className="w-4 h-4 text-gray-400" />,
      action: () => { onSelectTab('audit'); onClose(); }
    },
    {
      id: 'live_operations',
      title: 'Live 3D/2D Spatial Operations & Incident Manager',
      category: 'Operations',
      icon: <Activity className="w-4 h-4 text-indigo-400" />,
      action: () => { onSelectTab('live_operations'); onClose(); }
    },
    {
      id: 'feature_flags',
      title: 'Platform Feature Flags & Staged Rollout',
      category: 'Operations',
      icon: <Flag className="w-4 h-4 text-orange-400" />,
      action: () => { onSelectTab('feature_flags'); onClose(); }
    },
    {
      id: 'settings',
      title: 'Platform Settings & Infrastructure Health',
      category: 'Operations',
      icon: <Activity className="w-4 h-4 text-gray-400" />,
      action: () => { onSelectTab('settings'); onClose(); }
    },
    {
      id: 'action_flush_cache',
      title: 'Self-Heal: Flush Redis Cache & Pre-warm Buffers',
      category: 'Quick Actions',
      icon: <Activity className="w-4 h-4 text-red-400" />,
      action: () => { onTriggerAction?.('FLUSH_CACHE'); onClose(); }
    },
    {
      id: 'action_rotate_tokens',
      title: 'Self-Heal: Rotate Secondary GitHub Tokens',
      category: 'Quick Actions',
      icon: <Shield className="w-4 h-4 text-yellow-400" />,
      action: () => { onTriggerAction?.('ROTATE_GITHUB_TOKENS'); onClose(); }
    }
  ];

  const filtered = items.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase()) ||
    (item.badge && item.badge.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden shadow-indigo-500/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-800 bg-gray-950/60">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command, candidate ID, organization, or action..."
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-gray-500 font-medium"
          />
          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            <kbd className="px-2 py-0.5 text-[10px] bg-gray-800 border border-gray-700 rounded text-gray-400 font-mono">ESC</kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-gray-800/40">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              No matching commands or entities found for <span className="text-gray-300 font-mono">"{query}"</span>
            </div>
          ) : (
            filtered.map(item => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center justify-between p-3 rounded-xl text-left hover:bg-gray-800/60 transition group text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-gray-200 font-medium group-hover:text-white flex items-center gap-2">
                      {item.title}
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500">{item.category}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-950/80 border-t border-gray-800/80 text-[11px] text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="px-1 text-gray-400 bg-gray-900 border border-gray-800 rounded">↑</kbd> <kbd className="px-1 text-gray-400 bg-gray-900 border border-gray-800 rounded">↓</kbd></span>
            <span>Select: <kbd className="px-1 text-gray-400 bg-gray-900 border border-gray-800 rounded">↵</kbd></span>
          </div>
          <span className="text-indigo-400 font-medium">Super Admin OS v2</span>
        </div>
      </div>
    </div>
  );
};
