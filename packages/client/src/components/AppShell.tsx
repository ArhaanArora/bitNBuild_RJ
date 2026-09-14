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
} from 'lucide-react';
import RoleRequestModal from './RoleRequestModal';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  section?: string;
}

const candidateNav: NavItem[] = [
  { to: '/dashboard',              label: 'Home',              icon: Home,        section: 'MAIN' },
  { to: '/verification',           label: 'Skill Verification', icon: ShieldCheck, section: 'EVIDENCE' },
  { to: '/skills',                 label: 'My Skills',          icon: CheckSquare },
  { to: '/projects',               label: 'My Projects',        icon: FolderKanban },
  { to: '/analysis/report',        label: '3D Constellation',   icon: Sparkles },
  { to: '/hackathons',             label: 'Hackathons',         icon: Rocket,      section: 'EVENTS' },
  { to: '/hackathons/find-teammates', label: 'Find Teammates',  icon: Users },
  { to: '/hiring?tab=discovery',   label: 'Opportunities',      icon: Briefcase,   section: 'CAREER' },
  { to: '/profile',                label: 'My Profile',         icon: User,        section: 'ACCOUNT' },
];

const recruiterNav: NavItem[] = [
  { to: '/hiring',            label: 'Hiring Hub',         icon: Briefcase, section: 'HIRING' },
  { to: '/recruiter/search',  label: 'Candidate Search',   icon: Search },
  { to: '/hackathons',        label: 'Explore Hackathons', icon: Rocket,    section: 'EVENTS' },
  { to: '/profile',           label: 'Recruiter Profile',  icon: User,      section: 'ACCOUNT' },
];

const organizerNav: NavItem[] = [
  { to: '/hackathons',                   label: 'Hackathons',        icon: Rocket,      section: 'EVENTS' },
  { to: '/organizer/hackathons/new',     label: 'Host Hackathon',    icon: Rocket },
  { to: '/organizer/assessments',        label: 'Assessment Builder', icon: CheckSquare },
  { to: '/hackathons/find-teammates',    label: 'Team Formation',    icon: Users,       section: 'COMMUNITY' },
  { to: '/profile',                      label: 'Organizer Profile', icon: User,        section: 'ACCOUNT' },
];

// The 4 most important mobile nav items per role
const candidateMobileNav: NavItem[] = [
  { to: '/dashboard',    label: 'Home',     icon: Home },
  { to: '/verification', label: 'Verify',   icon: ShieldCheck },
  { to: '/hackathons',   label: 'Events',   icon: Rocket },
  { to: '/profile',      label: 'Profile',  icon: User },
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
  navItems,
  user,
  logout,
  navigate,
  setRoleModalOpen,
  closeSidebar,
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
    if (item.to === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    if (item.to === '/verification') {
      return (
        location.pathname === '/verification' ||
        (location.pathname === '/hiring' &&
          (location.search.includes('tab=assessment') ||
            location.search.includes('tab=get-hired') ||
            location.search.includes('tab=verification')))
      );
    }
    if (itemQuery) {
      return location.pathname === itemPath && location.search.includes(itemQuery);
    }
    return (
      location.pathname === itemPath ||
      (itemPath !== '/' && location.pathname.startsWith(itemPath))
    );
  };

  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'C'}`.toUpperCase();

  // Group navItems by section
  let lastSection = '';
  const itemsWithDividers = navItems.map((item, idx) => {
    const showDivider =
      item.section &&
      idx > 0 &&
      item.section !== lastSection &&
      item.section !== 'MAIN';
    if (item.section) lastSection = item.section;
    return { item, showDivider };
  });

  return (
    <div className="flex flex-col h-full py-5 px-3">
      {/* Brand */}
      <div className="px-2 mb-7 flex items-center justify-between">
        <NavLink
          to="/dashboard"
          className="inline-block"
          onClick={closeSidebar}
        >
          <div className="text-[20px] font-bold tracking-tight leading-none">
            <span className="text-[var(--text-primary)]">Skill</span>
            <span className="text-[var(--accent)]">Verify</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] tracking-[0.08em] mt-0.5 font-medium">
            Skills · Proof · Opportunities
          </p>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Main navigation">
        {itemsWithDividers.map(({ item, showDivider }, idx) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <React.Fragment key={item.to}>
              {showDivider && (
                <div className="py-3 px-2">
                  <div className="section-label">{item.section}</div>
                </div>
              )}
              {idx === 0 && item.section && (
                <div className="section-label px-2 mb-1">{item.section}</div>
              )}
              <NavLink
                to={item.to}
                onClick={closeSidebar}
                className={`nav-link${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 nav-icon transition-colors ${
                    active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </NavLink>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Promo callout */}
      <div className="mt-4 mx-1">
        <div
          className="rounded-xl p-3 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-active) 100%)',
            border: '1px solid var(--border-accent)',
          }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-xl"
            style={{ background: 'var(--accent)' }}
          />
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed pl-1">
            Build a credible profile. Unlock real opportunities.
          </p>
        </div>
      </div>

      {/* User footer */}
      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[var(--bg-surface)] transition-all text-left"
          aria-expanded={userDropdownOpen}
          aria-haspopup="menu"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[var(--text-primary)] shrink-0"
            style={{ background: 'var(--bg-surface-raised)', border: '1px solid var(--border-default)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[var(--text-primary)] truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] capitalize flex items-center gap-1 mt-0.5">
              <span>{user?.role || 'Candidate'}</span>
              <Lock className="w-2.5 h-2.5 text-emerald-400" aria-hidden="true" />
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 transition-transform ${
              userDropdownOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {userDropdownOpen && (
          <div
            className="mt-1 mx-1 rounded-xl overflow-hidden border border-[var(--border-default)] fade-in-scale"
            style={{ background: 'var(--bg-surface-raised)' }}
            role="menu"
          >
            {/* Role status */}
            <div className="px-3 py-2.5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Account Role
                </span>
                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                  <Lock className="w-2.5 h-2.5" aria-hidden="true" />
                  Server Enforced
                </span>
              </div>
              <div className="flex items-center justify-between bg-[var(--bg-surface)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] mb-2">
                <span className="text-xs font-semibold text-[var(--text-primary)] capitalize">
                  {user?.role || 'Candidate'}
                </span>
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  Verified <Lock className="w-2 h-2" aria-hidden="true" />
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen(false);
                  setRoleModalOpen(true);
                  closeSidebar();
                }}
                className="w-full py-1.5 px-2.5 text-[11px] font-medium text-[var(--accent)] hover:text-white bg-[var(--accent-subtle)] hover:bg-[var(--accent)] rounded-lg transition-all text-center flex items-center justify-center gap-1.5 border border-[var(--border-accent)]"
                role="menuitem"
              >
                Request a different role
              </button>
            </div>

            <div className="py-1" role="none">
              <NavLink
                to="/profile"
                onClick={() => { setUserDropdownOpen(false); closeSidebar(); }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                role="menuitem"
              >
                <User className="w-3.5 h-3.5" aria-hidden="true" />
                Edit Profile
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  setUserDropdownOpen(false);
                  closeSidebar();
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--error)] hover:bg-[var(--error-bg)] text-left transition-colors"
                role="menuitem"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                Sign Out
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
    user?.role === 'recruiter'
      ? recruiterNav
      : user?.role === 'organizer'
      ? organizerNav
      : candidateNav;

  const mobileNavItems =
    user?.role === 'recruiter'
      ? recruiterMobileNav
      : user?.role === 'organizer'
      ? organizerMobileNav
      : candidateMobileNav;

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/recruiter/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSidebarOpen(false);
  };

  const isMobileNavActive = (item: NavItem) => {
    if (item.to === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  };

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const initials = `${user?.firstName?.[0] || 'A'}${user?.lastName?.[0] || 'C'}`.toUpperCase();

  return (
    <div className="app-layout">
      {/* Skip link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── Sidebar Overlay (mobile) ── */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
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

      {/* ── Main Content ── */}
      <div className="main-content">
        {/* Top Header Bar */}
        <header className="page-header" role="banner">
          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="btn-icon mobile-only mr-1"
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            style={{ display: 'none' }} // hidden by CSS on desktop, shown on mobile
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg" role="search">
            <div className="relative flex items-center">
              <Search
                className="w-4 h-4 absolute left-3.5 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people, skills, projects..."
                className="input pl-10 pr-4 py-[7px] text-xs"
                aria-label="Search"
              />
            </div>
          </form>

          {/* Right section */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Tagline (desktop only) */}
            <div
              className="hidden xl:flex items-center gap-1.5 select-none"
              style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)' }}
              aria-hidden="true"
            >
              {['LEARN', 'BUILD', 'VERIFY', 'CONNECT'].map((word, i) => (
                <React.Fragment key={word}>
                  {i > 0 && <span style={{ color: 'var(--border-strong)' }}>/</span>}
                  <span>{word}</span>
                </React.Fragment>
              ))}
            </div>

            {/* Notification Bell */}
            <div style={{ color: 'var(--text-secondary)' }}>
              <NotificationBell />
            </div>

            {/* Avatar (desktop user menu trigger) — mobile users use sidebar footer */}
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="hidden md:block leading-tight">
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {user?.firstName}
                </div>
                <div
                  className="text-[10px] capitalize flex items-center gap-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {user?.role || 'Candidate'}
                  <Lock className="w-2.5 h-2.5 text-emerald-400" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Mobile hamburger (right side) */}
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
          </div>
        </header>

        {/* Page Content */}
        <main
          className="page-content"
          id="main-content"
          tabIndex={-1}
          aria-label="Main content"
        >
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div
                    className="min-h-[300px] flex items-center justify-center"
                    role="status"
                    aria-label="Loading page"
                  >
                    <div
                      className="w-6 h-6 rounded-full border-2 border-t-transparent"
                      style={{
                        borderColor: 'var(--border-default)',
                        borderTopColor: 'var(--accent)',
                        animation: 'spin 0.8s linear infinite',
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

        {/* Mobile Bottom Navigation */}
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
                <Icon
                  className="w-5 h-5"
                  strokeWidth={active ? 2.5 : 1.8}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          {/* "More" button opens sidebar on mobile */}
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

      {/* Role Request Modal */}
      <RoleRequestModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
      />
    </div>
  );
}
