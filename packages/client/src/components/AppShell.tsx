import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const candidateNav = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/skills', icon: '✦', label: 'My Skills' },
  { to: '/projects', icon: '◈', label: 'Projects' },
  { to: '/hackathons', icon: '⚡', label: 'Hackathons' },
  { to: '/profile', icon: '◉', label: 'Profile' },
];

const organizerNav = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/hackathons', icon: '⚡', label: 'Hackathons' },
  { to: '/organizer/hackathons/new', icon: '+', label: 'New Hackathon' },
  { to: '/organizer/assessments', icon: '◈', label: 'Assessments' },
  { to: '/profile', icon: '◉', label: 'Profile' },
];

const recruiterNav = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/recruiter/search', icon: '◎', label: 'Search Candidates' },
  { to: '/profile', icon: '◉', label: 'Profile' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = user?.role === 'organizer' ? organizerNav
    : user?.role === 'recruiter' ? recruiterNav
    : candidateNav;

  const handleLogout = () => { logout(); navigate('/login'); };

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

        {/* Logout */}
        <div className="px-3 pt-4 border-t border-gray-800 mt-4">
          <button onClick={handleLogout} className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <span>⏻</span> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
