import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { AlertTriangle, Mail, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [resending, setResending] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#E8672E] border-t-transparent animate-spin" />
        <p className="text-xs text-[#6B6B70] tracking-wider uppercase">Authenticating workspace...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account suspension block (§7, §9)
  if (user.status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center p-6 text-[#F5F5F4]">
        <div className="max-w-md w-full bg-[#17171A] border border-[#2A2A2E] rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#2A1717] border border-[#E0554E]/30 flex items-center justify-center text-[#E0554E] mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold">Account Under Review</h2>
          <p className="text-sm text-[#A3A3A8] leading-relaxed">
            Your account is currently under review. Contact support for details.
          </p>
          <div className="pt-2">
            <a
              href="mailto:support@skillverify.com"
              className="btn-secondary w-full inline-block text-xs py-2.5"
            >
              Contact Support (support@skillverify.com)
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await authService.resendVerification();
      toast.success(res.message || "We've sent a verification email.");
    } catch {
      toast.error('Failed to send verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      {/* Email verification reminder banner (§6, §9) */}
      {!user.emailVerified && !bannerDismissed && (
        <div className="bg-[#2B2213] border-b border-[#D89A3E]/30 text-[#D89A3E] px-4 py-2 text-xs flex items-center justify-between z-40 sticky top-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D89A3E]" />
            <span>
              Please verify your email ({user.email}). Certain verified hiring and submission features require a confirmed email.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleResend}
              disabled={resending}
              className="underline font-medium hover:text-white transition disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-[#D89A3E]/70 hover:text-[#D89A3E] text-xs font-mono"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
