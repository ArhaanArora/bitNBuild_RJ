import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
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
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  section?: string;
}

const candidateNav: NavItem[] = [
  { to: '/dashboard', label: 'Home', icon: Home, section: 'HOME' },
  { to: '/skills', label: 'My Skills', icon: CheckSquare, section: 'EVIDENCE' },
  { to: '/projects', label: 'My Projects', icon: FolderKanban },
  { to: '/hiring?tab=assessment', label: 'Skill Verification', icon: CheckSquare },
  { to: '/hackathons', label: 'Hackathons', icon: Rocket, section: 'OPPORTUNITIES' },
  { to: '/hackathons/find-teammates', label: 'Find Teammates', icon: Users, section: 'DISCOVER' },
  { to: '/hiring?tab=status', label: 'Applications', icon: Briefcase },
  { to: '/profile', label: 'Profile', icon: User, section: 'ACCOUNT' },
];

const recruiterNav: NavItem[] = [
  { to: '/hiring', label: 'Dashboard', icon: Home, section: 'HOME' },
  { to: '/hiring?tab=discovery', label: 'Candidates', icon: UserCheck, section: 'TALENT' },
  { to: '/recruiter/search', label: 'Search Talent', icon: Search },
  { to: '/hiring?tab=shortlisted', label: 'Shortlists', icon: CheckSquare },
  { to: '/hiring?tab=requirements', label: 'Job Posts', icon: Briefcase, section: 'OPPORTUNITIES' },
  { to: '/profile', label: 'Organization Profile', icon: User, section: 'ACCOUNT' },
];

const organizerNav: NavItem[] = [
  { to: '/hackathons', label: 'Dashboard', icon: Home, section: 'HOME' },
  { to: '/organizer/hackathons/new', label: 'Create Hackathon', icon: Rocket, section: 'EVENTS' },
  { to: '/organizer/assessments', label: 'Assessment Builder', icon: CheckSquare },
  { to: '/hackathons/find-teammates', label: 'Team Formation', icon: Users, section: 'COMMUNITY' },
  { to: '/profile', label: 'Organizer Profile', icon: User, section: 'ACCOUNT' },
];

export default function AppShell() {
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
              const isActive =
                item.to === '/dashboard'
                  ? location.pathname === '/dashboard' || location.pathname === '/'
                  : location.pathname.startsWith(item.to);

              const showDivider =
                item.section &&
                idx > 0 &&
                (item.section === 'OPPORTUNITIES' ||
                  item.section === 'DISCOVER' ||
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
                  <div className="text-[11px] text-[#A3A3A8] capitalize leading-tight">
                    {user?.role || 'Candidate'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B6B70]" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-[#17171A] border border-[#2A2A2E] rounded-xl shadow-2xl py-2 z-50 animate-fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#2A2A2E]">
                    <p className="text-xs font-semibold text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[11px] text-[#A3A3A8] truncate">{user?.email}</p>
                  </div>

                  {/* Role Switcher */}
                  <div className="px-3 py-2 border-b border-[#2A2A2E]">
                    <span className="text-[10px] font-semibold text-[#6B6B70] uppercase tracking-wider block mb-1.5">
                      Switch Role
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-[#1E1E22] p-1 rounded-lg">
                      {(['candidate', 'recruiter', 'organizer'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            switchRole(r);
                            setUserDropdownOpen(false);
                          }}
                          className={`py-1 text-[10px] font-medium capitalize rounded transition ${
                            user?.role === r
                              ? 'bg-[#E8672E] text-[#0D0D0F] font-semibold'
                              : 'text-[#A3A3A8] hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
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
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
