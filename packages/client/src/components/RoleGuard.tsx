import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('candidate' | 'recruiter' | 'organizer' | 'admin')[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Graceful routing to role's authorized workspace
    const fallbackRoutes: Record<string, string> = {
      candidate: '/dashboard',
      recruiter: '/hiring',
      organizer: '/hackathons',
    };
    const target = fallbackRoutes[user.role] || '/dashboard';
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
