import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppShell from './components/AppShell';
import AuthGuard from './components/AuthGuard';
import RoleGuard from './components/RoleGuard';
import AdminGuard from './components/AdminGuard';
import { ErrorBoundary } from './components/ErrorBoundary';

// ─── Eager Core Routes (instant <5ms navigation, zero network waterfalls) ────
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminLogin from './pages/admin/AdminLogin';

import Dashboard from './pages/dashboard/Dashboard';
import ProfileEditor from './pages/profile/ProfileEditor';
import ProjectsPage from './pages/projects/ProjectsPage';
import HackathonList from './pages/hackathon/HackathonList';
import HackathonDetail from './pages/hackathon/HackathonDetail';
import FindTeammatePage from './pages/hackathon/FindTeammatePage';
import TeamDetail from './pages/teams/TeamDetail';
import DiscoverCandidates from './pages/teams/DiscoverCandidates';
import PublicProfile from './pages/verify/PublicProfile';

// ─── Lazy Heavy/Secondary Routes (split to keep core bundle ultralight) ──────
// Skills Page (contains Three.js / Canvas 3D lattice)
const SkillsPage = lazy(() => import('./pages/skills/SkillsPage'));

// Admin Domain (large — Recharts + heavy administrative views)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Assessments (proctored standalone runners)
const AssessmentRunner = lazy(() => import('./pages/assessment/AssessmentRunner'));
const AssessmentResult = lazy(() => import('./pages/assessment/AssessmentResult'));

// Organizer & Recruiter isolated modules
const CreateHackathon = lazy(() => import('./pages/organizer/CreateHackathon'));
const AssessmentBuilder = lazy(() => import('./pages/organizer/AssessmentBuilder'));
const CandidateSearch = lazy(() => import('./pages/recruiter/CandidateSearch'));
const HiringHub = lazy(() => import('./pages/hiring/HiringHub'));
const StrictAssessmentRunner = lazy(() => import('./pages/hiring/StrictAssessmentRunner'));
const StrictAssessmentResult = lazy(() => import('./pages/hiring/StrictAssessmentResult'));

// Heavy 3D Viewer (Three.js ~890KB — isolated until clicked)
const ProjectReportPage = lazy(() => import('./pages/verify/ProjectReportPage'));

// ─── Suspense Fallback ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0D0D0F] flex flex-col items-center justify-center gap-3">
      <div className="w-6 h-6 rounded-full border-2 border-[#E8672E] border-t-transparent animate-spin" />
      <p className="text-xs text-[#6B6B70] tracking-wider uppercase">Loading workspace...</p>
    </div>
  );
}

// ─── Root Redirect ────────────────────────────────────────────────────────────
function RootRedirect() {
  const { user, loading } = useAuth();
  const isAdminDomain = typeof window !== 'undefined' && (
    window.location.hostname.includes('admin') ||
    window.location.hostname.startsWith('admin.')
  );

  if (isAdminDomain) {
    const adminToken = typeof window !== 'undefined' ? (
      sessionStorage.getItem('skillverify_admin_token') ||
      localStorage.getItem('skillverify_admin_token') ||
      sessionStorage.getItem('admin_access_token') ||
      localStorage.getItem('admin_access_token')
    ) : null;
    if (adminToken) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/admin/login" replace />;
  }

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

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'recruiter') return <Navigate to="/hiring" replace />;
  if (user.role === 'organizer') return <Navigate to="/hackathons" replace />;
  return <Navigate to="/dashboard" replace />;
}

// ─── App Router ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Root Dynamic Workspace Dispatcher */}
          <Route path="/" element={<RootRedirect />} />

          {/* Centralized Authentication Entry Points */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify/:userId" element={<PublicProfile />} />

          {/* Isolated Admin Domain — Super Admin Command Center */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminGuard minTier="support_admin">
                <AdminDashboard />
              </AdminGuard>
            }
          />
          {/* Legacy redirects — keep stable for bookmarks */}
          <Route path="/admin/security" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Role-Guarded Workspaces inside AppShell */}
          <Route
            element={
              <AuthGuard>
                <AppShell />
              </AuthGuard>
            }
          >
            {/* Candidate Core Routes (Instant transition) */}
            <Route
              path="/dashboard"
              element={
                <RoleGuard allowedRoles={['candidate', 'admin']}>
                  <Dashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/skills"
              element={
                <RoleGuard allowedRoles={['candidate', 'admin']}>
                  <SkillsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/projects"
              element={
                <RoleGuard allowedRoles={['candidate', 'admin']}>
                  <ProjectsPage />
                </RoleGuard>
              }
            />

            {/* Shared Authenticated Routes */}
            <Route path="/profile" element={<ProfileEditor />} />
            <Route path="/hackathons" element={<HackathonList />} />
            <Route path="/hackathons/:id" element={<HackathonDetail />} />
            <Route path="/hackathons/find-teammates" element={<FindTeammatePage />} />
            <Route path="/buddy" element={<FindTeammatePage />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/teams/:id/discover" element={<DiscoverCandidates />} />

            {/* Candidate Evidence & Verification Routes */}
            <Route
              path="/verification"
              element={
                <RoleGuard allowedRoles={['candidate', 'recruiter', 'organizer', 'admin']}>
                  <HiringHub />
                </RoleGuard>
              }
            />

            {/* Hiring Hub (Multi-Role: Candidates manage Skill Verification & Visibility, Recruiters discover talent) */}
            <Route
              path="/hiring"
              element={
                <RoleGuard allowedRoles={['candidate', 'recruiter', 'organizer', 'admin']}>
                  <HiringHub />
                </RoleGuard>
              }
            />
            <Route
              path="/recruiter/search"
              element={
                <RoleGuard allowedRoles={['recruiter', 'admin']}>
                  <CandidateSearch />
                </RoleGuard>
              }
            />

            {/* Organizer Routes */}
            <Route
              path="/organizer/hackathons/new"
              element={
                <RoleGuard allowedRoles={['organizer', 'admin']}>
                  <CreateHackathon />
                </RoleGuard>
              }
            />
            <Route
              path="/organizer/assessments"
              element={
                <RoleGuard allowedRoles={['organizer', 'admin']}>
                  <AssessmentBuilder />
                </RoleGuard>
              }
            />

            {/* 3D Project Verification & Trust Constellation (Three.js isolated) */}
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
      </Suspense>
    </ErrorBoundary>
  );
}
