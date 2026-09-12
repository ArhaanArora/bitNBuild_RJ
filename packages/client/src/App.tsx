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
import FindTeammatePage from './pages/hackathon/FindTeammatePage';
import TeamDetail from './pages/teams/TeamDetail';
import DiscoverCandidates from './pages/teams/DiscoverCandidates';

// Organizer
import CreateHackathon from './pages/organizer/CreateHackathon';
import AssessmentBuilder from './pages/organizer/AssessmentBuilder';

// Recruiter
import CandidateSearch from './pages/recruiter/CandidateSearch';

// Shared
import PublicProfile from './pages/verify/PublicProfile';
import ProjectReportPage from './pages/verify/ProjectReportPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function ProtectedRoute({ children }: { children: React.ReactNode; roles?: string[] }) {
  const { loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>;
  return <>{children}</>;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <Routes>
      {/* Direct access to Dashboard without Login page */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<Navigate to="/dashboard" replace />} />
      <Route path="/verify/:userId" element={<PublicProfile />} />

      {/* Main Dashboard & Features inside AppShell */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfileEditor />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/hackathons" element={<HackathonList />} />
        <Route path="/hackathons/:id" element={<HackathonDetail />} />
        <Route path="/hackathons/find-teammates" element={<FindTeammatePage />} />
        <Route path="/buddy" element={<FindTeammatePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/teams/:id/discover" element={<DiscoverCandidates />} />

        {/* Organizer */}
        <Route path="/organizer/hackathons/new" element={<CreateHackathon />} />
        <Route path="/organizer/assessments" element={<AssessmentBuilder />} />

        {/* Recruiter */}
        <Route path="/recruiter/search" element={<CandidateSearch />} />

        {/* 3D AI Project Verification & Trust Constellation */}
        <Route path="/project/:id/report" element={<ProjectReportPage />} />
        <Route path="/analysis/report" element={<ProjectReportPage />} />
        <Route path="/analysis/:id" element={<ProjectReportPage />} />
      </Route>

      {/* Assessment (full-screen, no shell) */}
      <Route path="/assessment/:sessionId" element={<AssessmentRunner />} />
      <Route path="/assessment/:sessionId/result" element={<AssessmentResult />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
