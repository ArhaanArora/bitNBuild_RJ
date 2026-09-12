import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppShell from './components/AppShell';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Candidate
import Dashboard from './pages/dashboard/Dashboard';
import ProfileEditor from './pages/profile/ProfileEditor';
import SkillsPage from './pages/skills/SkillsPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import AssessmentRunner from './pages/assessment/AssessmentRunner';
import AssessmentResult from './pages/assessment/AssessmentResult';
import HackathonList from './pages/hackathon/HackathonList';
import HackathonDetail from './pages/hackathon/HackathonDetail';
import TeamDetail from './pages/teams/TeamDetail';
import DiscoverCandidates from './pages/teams/DiscoverCandidates';

// Organizer
import CreateHackathon from './pages/organizer/CreateHackathon';
import AssessmentBuilder from './pages/organizer/AssessmentBuilder';

// Recruiter
import CandidateSearch from './pages/recruiter/CandidateSearch';

// Shared
import PublicProfile from './pages/verify/PublicProfile';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/verify/:userId" element={<PublicProfile />} />

      {/* Protected — inside AppShell */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfileEditor />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/hackathons" element={<HackathonList />} />
        <Route path="/hackathons/:id" element={<HackathonDetail />} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/teams/:id/discover" element={<DiscoverCandidates />} />

        {/* Organizer */}
        <Route path="/organizer/hackathons/new" element={<ProtectedRoute roles={['organizer', 'admin']}><CreateHackathon /></ProtectedRoute>} />
        <Route path="/organizer/assessments" element={<ProtectedRoute roles={['organizer', 'admin']}><AssessmentBuilder /></ProtectedRoute>} />

        {/* Recruiter */}
        <Route path="/recruiter/search" element={<ProtectedRoute roles={['recruiter', 'admin']}><CandidateSearch /></ProtectedRoute>} />
      </Route>

      {/* Assessment (full-screen, no shell) */}
      <Route path="/assessment/:sessionId" element={<ProtectedRoute><AssessmentRunner /></ProtectedRoute>} />
      <Route path="/assessment/:sessionId/result" element={<ProtectedRoute><AssessmentResult /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
