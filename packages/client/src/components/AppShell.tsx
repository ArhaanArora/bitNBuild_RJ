import React, { useState, Suspense } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import { ErrorBoundary } from './ErrorBoundary';
import {
  Home,
  CheckSquare,
  FolderKanban,
  Rocket,
  Briefcase,
  Users,
  UserCheck,
  User,
  Search,
  ChevronDown,
  LogOut,
  Sparkles,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import RoleRequestModal from './RoleRequestModal';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  section?: string;
}

const candidateNav: NavItem[] = [
  { to: '/dashboard', label: 'Home', icon: Home, section: 'HOME' },
  { to: '/verification', label: 'Skill Verification', icon: ShieldCheck, section: 'EVIDENCE' },
  { to: '/skills', label: 'My Skills', icon: CheckSquare },
  { to: '/projects', label: 'My Projects', icon: FolderKanban },
  { to: '/analysis/report', label: '3D Constellation', icon: Sparkles },
  { to: '/hackathons', label: 'Hackathons', icon: Rocket, section: 'EVENTS' },
  { to: '/hackathons/find-teammates', label: 'Find Teammates', icon: Users },
  { to: '/hiring?tab=discovery', label: 'Opportunities', icon: Briefcase, section: 'CAREER' },
  { to: '/profile', label: 'My Profile', icon: User, section: 'ACCOUNT' },
];

const recruiterNav: NavItem[] = [
  { to: '/hiring', label: 'Hiring Hub', icon: Briefcase, section: 'HIRING' },
  { to: '/recruiter/search', label: 'Candidate Search', icon: Search },
  { to: '/hackathons', label: 'Explore Hackathons', icon: Rocket, section: 'EVENTS' },
  { to: '/profile', label: 'Recruiter Profile', icon: User, section: 'ACCOUNT' },
];

const organizerNav: NavItem[] = [
  { to: '/hackathons', label: 'Hackathons', icon: Rocket, section: 'EVENTS' },
  { to: '/organizer/hackathons/new', label: 'Host Hackathon', icon: Rocket },
  { to: '/organizer/assessments', label: 'Assessment Builder', icon: CheckSquare },
  { to: '/hackathons/find-teammates', label: 'Team Formation', icon: Users, section: 'COMMUNITY' },
  { to: '/profile', label: 'Organizer Profile', icon: User, section: 'ACCOUNT' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const navItems =
    user?.role === 'recruiter'
      ? recruiterNav
      : user?.role === 'organizer'
      ? organizerNav
      : candidateNav;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/recruiter/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'C'}`.toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#0D0D0F] text-[#F5F5F4]">
      {/* Sidebar (Fixed ~240px) */}
      <aside className="w-60 shrink-0 bg-[#0D0D0F] border-r border-[#2A2A2E] flex flex-col justify-between py-6 px-4">
        <div>
          {/* Brand Header */}
          <div className="px-2 mb-8">
            <NavLink to="/dashboard" className="inline-block group">
              <div className="text-xl font-bold tracking-tight">
                <span className="text-[#F5F5F4]">Skill</span>
                <span className="text-[#E8672E]">Verify</span>
              </div>
              <p className="text-[11px] text-[#6B6B70] tracking-wide mt-0.5">
                Skills. Proof. Opportunities.
              </p>
            </NavLink>
          </div>

          {/* Grouped Intent Navigation */}
          <nav className="space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const [itemPath, itemQuery] = item.to.split('?');
              const isActive =
                item.to === '/dashboard'
                  ? location.pathname === '/dashboard' || location.pathname === '/'
                  : item.to === '/verification'
                  ? location.pathname === '/verification' ||
                    (location.pathname === '/hiring' &&
                      (location.search.includes('tab=assessment') ||
                        location.search.includes('tab=get-hired') ||
                        location.search.includes('tab=verification')))
                  : itemQuery
                  ? location.pathname === itemPath && location.search.includes(itemQuery)
                  : location.pathname === itemPath ||
                    (itemPath !== '/' && location.pathname.startsWith(itemPath));

              const showDivider =
                item.section &&
                idx > 0 &&
                (item.section === 'EVIDENCE' ||
                  item.section === 'EVENTS' ||
                  item.section === 'OPPORTUNITIES' ||
                  item.section === 'DISCOVER' ||
                  item.section === 'CAREER' ||
                  item.section === 'ACCOUNT');

              return (
                <React.Fragment key={item.to}>
                  {showDivider && (
                    <div className="my-3 border-t border-[#1E1E22]" />
                  )}

                  <NavLink
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                      isActive
                        ? 'bg-[#241C16] text-[#F5F5F4] border-l-2 border-[#E8672E] rounded-l-none'
                        : 'text-[#A3A3A8] hover:text-[#F5F5F4] hover:bg-[#17171A]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#E8672E]' : 'text-[#A3A3A8]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </NavLink>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Promo Card (Reference Image) */}
        <div className="mt-8 pt-4">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-3.5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E8672E]" />
            <p className="text-xs text-[#A3A3A8] leading-relaxed font-normal pl-1">
              Build a credible profile. Unlock real opportunities.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#2A2A2E] bg-[#0D0D0F] px-8 flex items-center justify-between gap-6 shrink-0 sticky top-0 z-30">
          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#6B6B70] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for people, skills, projects, or opportunities..."
                className="w-full bg-[#17171A] border border-[#2A2A2E] rounded-xl pl-10 pr-4 py-2 text-xs text-[#F5F5F4] placeholder-[#6B6B70] focus:outline-none focus:border-[#E8672E] transition-all"
              />
            </div>
          </form>

          {/* Right Header Navigation & Avatar */}
          <div className="flex items-center gap-6 shrink-0">
            {/* Slogan Breadcrumb Tags (Reference Image) */}
            <div className="hidden xl:flex items-center gap-2 text-[11px] font-semibold text-[#6B6B70] tracking-widest uppercase select-none">
              <span>LEARN</span>
              <span className="text-[#38383D]">/</span>
              <span>BUILD</span>
              <span className="text-[#38383D]">/</span>
              <span>VERIFY</span>
              <span className="text-[#38383D]">/</span>
              <span>CONNECT</span>
            </div>

            {/* Notification Bell */}
            <div className="text-[#A3A3A8] hover:text-white transition">
              <NotificationBell />
            </div>

            {/* User Avatar Capsule Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#17171A] transition text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#2A2A2E] border border-[#38383D] flex items-center justify-center text-xs font-semibold text-[#F5F5F4]">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-[#F5F5F4] leading-tight">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-[11px] text-[#A3A3A8] capitalize leading-tight flex items-center gap-1">
                    <span>{user?.role || 'Candidate'}</span>
                    <Lock className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B6B70]" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-[#17171A] border border-[#2A2A2E] rounded-xl shadow-2xl py-2 z-50 animate-fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#2A2A2E]">
                    <p className="text-xs font-semibold text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[11px] text-[#A3A3A8] truncate">{user?.email}</p>
                  </div>

                  {/* Server-Enforced Role Status Indicator (§7) */}
                  <div className="px-3 py-2.5 border-b border-[#2A2A2E] bg-[#121215]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-[#6B6B70] uppercase tracking-wider">
                        Account Role
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Server Enforced</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-[#1E1E22] px-2.5 py-1.5 rounded-lg border border-[#2A2A2E] mb-2">
                      <span className="text-xs font-semibold text-white capitalize">
                        {user?.role || 'Candidate'}
                      </span>
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <span>Verified</span>
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8E8E93] leading-tight mb-2.5">
                      Current Role: <strong className="text-white capitalize">{user?.role || 'Candidate'} 🔒</strong> (verified by account permissions)
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserDropdownOpen(false);
                        setRoleModalOpen(true);
                      }}
                      className="w-full py-1.5 px-2.5 text-[11px] font-medium text-[#E8672E] hover:text-white bg-[#E8672E]/10 hover:bg-[#E8672E] rounded-lg transition text-center flex items-center justify-center gap-1.5 border border-[#E8672E]/20"
                    >
                      <span>Request a different role</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <NavLink
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#A3A3A8] hover:text-white hover:bg-[#1E1E22]"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#E0554E] hover:bg-[#2A1717] text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="min-h-[300px] flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-[#E8672E] border-t-transparent animate-spin" />
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Role Change Application Modal (§7) */}
      <RoleRequestModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
      />
    </div>
  );
}
