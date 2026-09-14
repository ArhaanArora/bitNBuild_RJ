import React, { useState, Suspense, useEffect, useCallback } from 'react';
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
  Menu,
  X,
  MessageSquare,
  Settings,
  ChevronRight,
  Zap,
  TrendingUp,
} from 'lucide-react';
import RoleRequestModal from './RoleRequestModal';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  section?: string;
  badge?: string;
}

const candidateNav: NavItem[] = [
  { to: '/dashboard',                 label: 'Home',              icon: Home,        section: 'MAIN' },
  { to: '/verification',              label: 'Skill Verification', icon: ShieldCheck, section: 'EVIDENCE', badge: 'NEW' },
  { to: '/skills',                    label: 'My Skills',          icon: CheckSquare },
  { to: '/projects',                  label: 'My Projects',        icon: FolderKanban },
  { to: '/analysis/report',           label: '3D Constellation',   icon: Sparkles },
  { to: '/hackathons',                label: 'Hackathons',         icon: Rocket,      section: 'EVENTS' },
  { to: '/hackathons/find-teammates', label: 'Find Teammates',     icon: Users },
  { to: '/hiring?tab=discovery',      label: 'Opportunities',      icon: Briefcase,   section: 'CAREER' },
  { to: '/profile',                   label: 'My Profile',         icon: User,        section: 'ACCOUNT' },
];

const recruiterNav: NavItem[] = [
  { to: '/hiring',            label: 'Hiring Hub',         icon: Briefcase, section: 'HIRING' },
  { to: '/recruiter/search',  label: 'Candidate Search',   icon: Search },
  { to: '/hackathons',        label: 'Explore Hackathons', icon: Rocket,    section: 'EVENTS' },
  { to: '/profile',           label: 'Recruiter Profile',  icon: User,      section: 'ACCOUNT' },
];

const organizerNav: NavItem[] = [
  { to: '/hackathons',                   label: 'Hackathons',         icon: Rocket,      section: 'EVENTS' },
  { to: '/organizer/hackathons/new',     label: 'Host Hackathon',     icon: Rocket },
  { to: '/organizer/assessments',        label: 'Assessment Builder', icon: CheckSquare },
  { to: '/hackathons/find-teammates',    label: 'Team Formation',     icon: Users,       section: 'COMMUNITY' },
  { to: '/profile',                      label: 'Organizer Profile',  icon: User,        section: 'ACCOUNT' },
];

const candidateMobileNav: NavItem[] = [
  { to: '/dashboard',    label: 'Home',    icon: Home },
  { to: '/verification', label: 'Verify',  icon: ShieldCheck },
  { to: '/hackathons',   label: 'Events',  icon: Rocket },
  { to: '/profile',      label: 'Profile', icon: User },
];

const recruiterMobileNav: NavItem[] = [
  { to: '/hiring',           label: 'Hiring',   icon: Briefcase },
  { to: '/recruiter/search', label: 'Search',   icon: Search },
  { to: '/hackathons',       label: 'Events',   icon: Rocket },
  { to: '/profile',          label: 'Profile',  icon: User },
];

const organizerMobileNav: NavItem[] = [
  { to: '/hackathons',                label: 'Events',  icon: Rocket },
  { to: '/organizer/hackathons/new',  label: 'Host',    icon: Rocket },
  { to: '/organizer/assessments',     label: 'Assess',  icon: CheckSquare },
  { to: '/profile',                   label: 'Profile', icon: User },
];

function SidebarContent({
  navItems, user, logout, navigate, setRoleModalOpen, closeSidebar,
}: {
  navItems: NavItem[];
  user: any;
  logout: () => void;
  navigate: (path: string) => void;
  setRoleModalOpen: (v: boolean) => void;
  closeSidebar: () => void;
}) {
  const location = useLocation();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (item: NavItem) => {
    const [itemPath, itemQuery] = item.to.split('?');
    if (item.to === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    if (item.to === '/verification') {
      return location.pathname === '/verification' ||
        (location.pathname === '/hiring' && (
          location.search.includes('tab=assessment') ||
          location.search.includes('tab=get-hired') ||
          location.search.includes('tab=verification')
        ));
    }
    if (itemQuery) return location.pathname === itemPath && location.search.includes(itemQuery);
    return location.pathname === itemPath || (itemPath !== '/' && location.pathname.startsWith(itemPath));
  };

  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'C'}`.toUpperCase();

  let lastSection = '';
  const itemsWithDividers = navItems.map((item, idx) => {
    const showDivider = item.section && idx > 0 && item.section !== lastSection && item.section !== 'MAIN';
    if (item.section) lastSection = item.section;
    return { item, showDivider };
  });

  return (
    <div className="flex flex-col h-full">
      {/* ── Brand ───────────────────────────────────── */}
      <div className="px-5 pt-6 pb-5 relative overflow-hidden shrink-0">
        {/* Ambient glow behind brand */}
        <div
          className="absolute -top-6 -left-6 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)', filter: 'blur(20px)' }}
          aria-hidden="true"
        />
        <NavLink to="/dashboard" onClick={closeSidebar} className="block relative z-10">
          <div
            className="text-[22px] font-black tracking-tight leading-none mb-0.5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.04em' }}
          >
            <span style={{ color: 'var(--text-primary)' }}>Skill</span>
            <span className="text-gradient">Verify</span>
          </div>
          <p className="text-[10px] font-semibold tracking-[0.1em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Skills · Proof · Opportunities
          </p>
        </NavLink>
      </div>

      {/* ── Navigation ──────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4" role="navigation" aria-label="Main navigation">
        {itemsWithDividers.map(({ item, showDivider }, idx) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <React.Fragment key={item.to}>
              {(showDivider || (idx === 0 && item.section)) && (
                <div className="px-1 pt-5 pb-1.5">
                  <p className="section-label">{item.section}</p>
                </div>
              )}
              <NavLink
                to={item.to}
                onClick={closeSidebar}
                className={`nav-link${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 nav-icon transition-colors ${active ? '' : 'text-[var(--text-muted)]'}`}
                  aria-hidden="true"
                />
                <span className="truncate flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                      color: '#fff',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </React.Fragment>
          );
        })}
      </nav>

      {/* ── Promo strip ─────────────────────────────── */}
      <div className="px-3 pb-3 shrink-0">
        <div
          className="rounded-2xl p-3.5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,53,0.12) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(255,107,53,0.2)',
          }}
        >
          <div
            className="absolute -right-4 -top-4 w-16 h-16 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <Zap className="w-4 h-4 mb-1.5" style={{ color: 'var(--accent)' }} aria-hidden="true" />
          <p className="text-[11px] font-semibold leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Build credible proof.{' '}
            <span style={{ color: 'var(--accent)' }}>Unlock real jobs.</span>
          </p>
        </div>
      </div>

      {/* ── User footer ─────────────────────────────── */}
      <div className="px-3 pb-5 pt-2 border-t shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          type="button"
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-[var(--bg-surface-raised)] transition-all text-left group"
          aria-expanded={userDropdownOpen}
          aria-haspopup="menu"
        >
          {/* Avatar with gradient ring */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--accent-muted), var(--bg-surface-raised))',
              border: '1.5px solid var(--border-accent)',
              color: 'var(--accent)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[10px] capitalize flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
              <span>{user?.role || 'Candidate'}</span>
              <Lock className="w-2.5 h-2.5 text-emerald-400" aria-hidden="true" />
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-muted)' }}
            aria-hidden="true"
          />
        </button>

        {userDropdownOpen && (
          <div
            className="mt-1.5 rounded-xl overflow-hidden border fade-in-scale"
            style={{ background: 'var(--bg-surface-raised)', borderColor: 'var(--border-default)' }}
            role="menu"
          >
            <div className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Account Role</span>
                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                  <Lock className="w-2.5 h-2.5" aria-hidden="true" /> Server Enforced
                </span>
              </div>
              <div
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border mb-2"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
              >
                <span className="text-xs font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                  {user?.role || 'Candidate'}
                </span>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  Verified <Lock className="w-2 h-2" aria-hidden="true" />
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setUserDropdownOpen(false); setRoleModalOpen(true); closeSidebar(); }}
                className="w-full py-1.5 px-2.5 text-[11px] font-semibold rounded-lg transition-all text-center border"
                style={{
                  color: 'var(--accent)',
                  background: 'var(--accent-subtle)',
                  borderColor: 'var(--border-accent)',
                }}
                role="menuitem"
              >
                Request a different role
              </button>
            </div>
            <div className="py-1" role="none">
              <NavLink
                to="/profile"
                onClick={() => { setUserDropdownOpen(false); closeSidebar(); }}
                className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--bg-surface)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                role="menuitem"
              >
                <User className="w-3.5 h-3.5" aria-hidden="true" /> Edit Profile
              </NavLink>
              <button
                type="button"
                onClick={() => { setUserDropdownOpen(false); closeSidebar(); logout(); navigate('/login'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--error-bg)] text-left transition-colors"
                style={{ color: 'var(--error)' }}
                role="menuitem"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems =
    user?.role === 'recruiter' ? recruiterNav :
    user?.role === 'organizer' ? organizerNav :
    candidateNav;

  const mobileNavItems =
    user?.role === 'recruiter' ? recruiterMobileNav :
    user?.role === 'organizer' ? organizerMobileNav :
    candidateMobileNav;

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/recruiter/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSidebarOpen(false);
  };

  const isMobileNavActive = (item: NavItem) => {
    if (item.to === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  };

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'C'}`.toUpperCase();

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── Sidebar Overlay ─────────────────────────── */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className={`sidebar${sidebarOpen ? ' mobile-open' : ''}`}
        aria-label="Sidebar navigation"
        role="navigation"
        id="sidebar"
      >
        <SidebarContent
          navItems={navItems}
          user={user}
          logout={logout}
          navigate={navigate}
          setRoleModalOpen={setRoleModalOpen}
          closeSidebar={closeSidebar}
        />
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <div className="main-content">
        {/* Top Header */}
        <header className="page-header" role="banner">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="btn-icon"
            style={{ display: 'none' }}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            id="mobile-menu-btn"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md" role="search">
            <div className="relative flex items-center">
              <Search
                className="w-3.5 h-3.5 absolute left-3.5 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people, skills, projects..."
                className="input pl-9 pr-4 py-[7px] text-xs"
                aria-label="Search"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Pill tagline desktop */}
            <div
              className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)',
              }}
              aria-hidden="true"
            >
              {['LEARN', 'BUILD', 'VERIFY', 'CONNECT'].map((word, i) => (
                <React.Fragment key={word}>
                  {i > 0 && <span style={{ color: 'var(--border-strong)', fontSize: '10px' }}>·</span>}
                  <span>{word}</span>
                </React.Fragment>
              ))}
            </div>

            <div style={{ color: 'var(--text-secondary)' }}>
              <NotificationBell />
            </div>

            {/* Avatar chip */}
            <div className="hidden sm:flex items-center gap-2 pl-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-muted), var(--bg-surface-raised))',
                  border: '1.5px solid var(--border-accent)',
                  color: 'var(--accent)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {user?.firstName}
                </div>
                <div className="text-[10px] capitalize flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  {user?.role || 'Candidate'}
                  <Lock className="w-2.5 h-2.5 text-emerald-400" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content" id="main-content" tabIndex={-1} aria-label="Main content">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="min-h-[300px] flex items-center justify-center" role="status" aria-label="Loading page">
                    <div
                      className="w-8 h-8 rounded-full border-2"
                      style={{
                        borderColor: 'var(--border-default)',
                        borderTopColor: 'var(--accent)',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="mobile-nav" role="navigation" aria-label="Mobile bottom navigation">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isMobileNavActive(item);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`mobile-nav-item${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {active ? (
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ background: 'var(--accent-glow)', filter: 'blur(8px)', transform: 'scale(1.5)' }}
                      aria-hidden="true"
                    />
                    <Icon className="w-5 h-5 relative z-10" strokeWidth={2.5} aria-hidden="true" />
                  </div>
                ) : (
                  <Icon className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
                )}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <button
            type="button"
            className="mobile-nav-item"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open full navigation"
          >
            <Menu className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
            <span>More</span>
          </button>
        </nav>
      </div>

      <RoleRequestModal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} />
    </div>
  );
}
