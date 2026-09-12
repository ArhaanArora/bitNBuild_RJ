import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppShell from './components/AppShell';
import AuthGuard from './components/AuthGuard';
import RoleGuard from './components/RoleGuard';
import AdminGuard from './components/AdminGuard';

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Domain (Isolated Surface)
import AdminLogin from './pages/admin/AdminLogin';
import AdminSecurityConsole from './pages/admin/AdminSecurityConsole';

// Candidate Workspace
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

// Organizer Workspace
import CreateHackathon from './pages/organizer/CreateHackathon';
import AssessmentBuilder from './pages/organizer/AssessmentBuilder';

// Recruiter Workspace
import CandidateSearch from './pages/recruiter/CandidateSearch';

// Shared & Public
import PublicProfile from './pages/verify/PublicProfile';
import ProjectReportPage from './pages/verify/ProjectReportPage';
import HiringHub from './pages/hiring/HiringHub';
import StrictAssessmentRunner from './pages/hiring/StrictAssessmentRunner';
import StrictAssessmentResult from './pages/hiring/StrictAssessmentResult';

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#E8672E] border-t-transparent animate-spin" />
        <p className="text-xs text-[#6B6B70] tracking-wider uppercase">Loading workspace...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'recruiter') return <Navigate to="/hiring" replace />;
  if (user.role === 'organizer') return <Navigate to="/hackathons" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Root Dynamic Workspace Dispatcher */}
      <Route path="/" element={<RootRedirect />} />

      {/* Centralized Authentication Entry Points (§2, §3, §6) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/register" element={<Navigate to="/signup" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify/:userId" element={<PublicProfile />} />

      {/* Isolated Admin Domain (§1, §8) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/security"
        element={
          <AdminGuard minTier="support_admin">
            <AdminSecurityConsole />
          </AdminGuard>
        }
      />
      <Route path="/admin" element={<Navigate to="/admin/security" replace />} />

      {/* Role-Guarded Workspaces inside AppShell (§4) */}
      <Route
        element={
          <AuthGuard>
            <AppShell />
          </AuthGuard>
        }
      >
        {/* Candidate & Shared Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfileEditor />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/hackathons" element={<HackathonList />} />
        <Route path="/hackathons/:id" element={<HackathonDetail />} />
        <Route path="/hackathons/find-teammates" element={<FindTeammatePage />} />
        <Route path="/buddy" element={<FindTeammatePage />} />
        <Route path="/hiring" element={<HiringHub />} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/teams/:id/discover" element={<DiscoverCandidates />} />

        {/* Recruiter-Only Isolated Routes (§4) */}
        <Route
          path="/recruiter/search"
          element={
            <RoleGuard allowedRoles={['recruiter']}>
              <CandidateSearch />
            </RoleGuard>
          }
        />

        {/* Organizer-Only Isolated Routes (§4) */}
        <Route
          path="/organizer/hackathons/new"
          element={
            <RoleGuard allowedRoles={['organizer']}>
              <CreateHackathon />
            </RoleGuard>
          }
        />
        <Route
          path="/organizer/assessments"
          element={
            <RoleGuard allowedRoles={['organizer']}>
              <AssessmentBuilder />
            </RoleGuard>
          }
        />

        {/* 3D Project Verification & Trust Constellation */}
        <Route path="/project/:id/report" element={<ProjectReportPage />} />
        <Route path="/analysis/report" element={<ProjectReportPage />} />
        <Route path="/analysis/:id" element={<ProjectReportPage />} />
      </Route>

      {/* Proctored Assessment Fullscreen Runner (No Shell Chrome) */}
      <Route
        path="/assessment/:sessionId"
        element={
          <AuthGuard>
            <AssessmentRunner />
          </AuthGuard>
        }
      />
      <Route
        path="/assessment/:sessionId/result"
        element={
          <AuthGuard>
            <AssessmentResult />
          </AuthGuard>
        }
      />

      {/* Strict Resume Verification Assessment (Zero-Chrome, Proctored) */}
      <Route
        path="/hiring/assessment/:assessmentId"
        element={
          <AuthGuard>
            <StrictAssessmentRunner />
          </AuthGuard>
        }
      />
      <Route
        path="/hiring/assessment/:assessmentId/result"
        element={
          <AuthGuard>
            <StrictAssessmentResult />
          </AuthGuard>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
