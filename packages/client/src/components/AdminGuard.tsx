import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

const TIER_WEIGHTS: Record<string, number> = {
  support_admin: 1,
  verification_admin: 2,
  security_admin: 3,
  super_admin: 4,
};

interface AdminGuardProps {
  children: React.ReactNode;
  minTier?: 'super_admin' | 'security_admin' | 'verification_admin' | 'support_admin';
}

export default function AdminGuard({ children, minTier = 'support_admin' }: AdminGuardProps) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center gap-3 text-[#F5F5F4]">
        <div className="w-8 h-8 rounded-full border-2 border-[#E8672E] border-t-transparent animate-spin" />
        <p className="text-xs text-[#6B6B70] font-mono uppercase tracking-wider">Verifying security credentials...</p>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  const currentWeight = TIER_WEIGHTS[admin.adminRole] || 0;
  const requiredWeight = TIER_WEIGHTS[minTier] || 0;

  if (currentWeight < requiredWeight) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-6 text-[#F5F5F4]">
        <div className="max-w-md w-full bg-[#141416] border border-[#2A2A2E] rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-[#2A1717] border border-[#E0554E]/30 flex items-center justify-center text-[#E0554E] mx-auto font-mono text-lg font-bold">
            403
          </div>
          <h2 className="text-lg font-bold">Insufficient Privilege Tier</h2>
          <p className="text-xs text-[#A3A3A8] leading-relaxed">
            This security control panel requires <span className="text-[#E8672E] font-semibold">{minTier}</span> privileges. Your active role is <span className="text-white font-semibold">{admin.adminRole}</span>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
