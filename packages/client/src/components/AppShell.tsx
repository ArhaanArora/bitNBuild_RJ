import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const candidateNav = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/hackathons/find-teammates', icon: '🤝', label: 'Find Teammates' },
  { to: '/hiring', icon: '💼', label: 'Hiring' },
  { to: '/analysis/report', icon: '🌌', label: '3D Constellation' },
  { to: '/skills', icon: '✦', label: 'My Skills' },
  { to: '/projects', icon: '◈', label: 'Projects' },
  { to: '/hackathons', icon: '⚡', label: 'Hackathons' },
  { to: '/admin', icon: '🛡️', label: 'Admin Audit' },
  { to: '/profile', icon: '◉', label: 'Profile' },
];

const organizerNav = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/hackathons/find-teammates', icon: '🤝', label: 'Find Teammates' },
  { to: '/hiring', icon: '💼', label: 'Hiring' },
  { to: '/analysis/report', icon: '🌌', label: '3D Constellation' },
  { to: '/hackathons', icon: '⚡', label: 'Hackathons' },
  { to: '/organizer/hackathons/new', icon: '+', label: 'New Hackathon' },
  { to: '/organizer/assessments', icon: '◈', label: 'Assessments' },
  { to: '/admin', icon: '🛡️', label: 'Admin Audit' },
  { to: '/profile', icon: '◉', label: 'Profile' },
];

const recruiterNav = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/hiring', icon: '💼', label: 'Hiring' },
  { to: '/hackathons/find-teammates', icon: '🤝', label: 'Find Teammates' },
  { to: '/analysis/report', icon: '🌌', label: '3D Constellation' },
  { to: '/recruiter/search', icon: '◎', label: 'Search Candidates' },
  { to: '/admin', icon: '🛡️', label: 'Admin Audit' },
  { to: '/profile', icon: '◉', label: 'Profile' },
];

export default function AppShell() {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  const nav = user?.role === 'organizer' ? organizerNav
    : user?.role === 'recruiter' ? recruiterNav
    : candidateNav;

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col py-6">
        {/* Logo */}
        <div className="px-5 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">SV</div>
            <span className="font-bold text-white">SkillVerify</span>
          </div>
          <div className="mt-3 px-1">
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-xs font-medium text-gray-300 truncate">{user?.firstName} {user?.lastName}</p>
            <span className="text-xs text-indigo-400 capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {nav.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Role Switcher */}
        <div className="px-3 pt-3 border-t border-gray-800">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-2 mb-1.5">View As Role</p>
          <div className="grid grid-cols-3 gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800">
            <button
              type="button"
              onClick={() => { switchRole('candidate'); navigate('/dashboard'); }}
              className={`py-1 text-[11px] rounded font-medium transition ${user?.role === 'candidate' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => { switchRole('recruiter'); navigate('/dashboard'); }}
              className={`py-1 text-[11px] rounded font-medium transition ${user?.role === 'recruiter' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => { switchRole('organizer'); navigate('/dashboard'); }}
              className={`py-1 text-[11px] rounded font-medium transition ${user?.role === 'organizer' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Organizer
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-auto">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-gray-800/80 bg-gray-950/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-gray-400">Neon PostgreSQL Live</span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-4 w-px bg-gray-800" />
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium">{user?.firstName}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-900 text-indigo-400 border border-gray-800 capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        <div className="max-w-6xl w-full mx-auto px-6 py-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
