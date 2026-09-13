import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { firebaseService } from '../../services/firebase.service';
import { KeyRound, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsRequesting(true);
    try {
      if (firebaseService.isConfigured()) {
        try {
          await firebaseService.sendPasswordReset(email.trim());
        } catch (fbErr: any) {
          console.log('[Firebase Reset]:', fbErr.message);
        }
      }
      const res = await authService.forgotPassword(email.trim());
      setResetRequested(true);
      if (res.demoToken) {
        setToken(res.demoToken);
        toast.success('Password recovery link generated.');
      } else {
        toast.success(res.message);
      }
    } catch {
      toast.error('Failed to request password recovery.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword || newPassword.length < 8) {
      toast.error('Token and minimum 8-character password required.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await authService.resetPassword(token, newPassword);
      setResetCompleted(true);
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col justify-between">
      <header className="h-16 border-b border-[#2A2A2E] px-8 flex items-center justify-between">
        <Link to="/login" className="flex items-center gap-2">
          <div className="text-xl font-bold tracking-tight">
            <span className="text-[#F5F5F4]">Skill</span>
            <span className="text-[#E8672E]">Verify</span>
          </div>
          <span className="text-[10px] text-[#6B6B70] uppercase font-mono tracking-widest pl-2 border-l border-[#2A2A2E]">
            ACCOUNT RECOVERY
          </span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#E8672E]" />

            {!resetCompleted ? (
              <>
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#241C16] border border-[#E8672E]/30 flex items-center justify-center text-[#E8672E] mb-3">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight">Reset your password</h1>
                  <p className="text-xs text-[#A3A3A8] mt-1">
                    Enter the email associated with your SkillVerify account.
                  </p>
                </div>

                {!resetRequested ? (
                  <form onSubmit={handleRequestReset} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#A3A3A8] mb-1.5">Email address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                        className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F4] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isRequesting}
                      className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
                    >
                      {isRequesting ? 'Dispatching recovery link...' : 'Send Recovery Instructions'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="p-3 bg-[#1E1E22] border border-[#2A2A2E] rounded-xl text-xs text-[#A3A3A8] leading-relaxed">
                      ✓ Recovery link created for <span className="text-white font-medium">{email}</span>.
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#A3A3A8] mb-1.5">Reset Token</label>
                      <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste verification token"
                        required
                        className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F5F5F4] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#A3A3A8] mb-1.5">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        required
                        className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F4] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isResetting}
                      className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
                    >
                      {isResetting ? 'Updating password...' : 'Update Password & Sign In'}
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#16261B] border border-[#3FB65F]/30 flex items-center justify-center text-[#3FB65F] mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold">Password Reset Complete</h2>
                <p className="text-xs text-[#A3A3A8] leading-relaxed">
                  Your credentials have been securely updated. You can now log into your workspace.
                </p>
                <Link to="/login" className="btn-primary w-full inline-block py-2.5 text-xs">
                  Proceed to Sign In →
                </Link>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#2A2A2E] text-center">
              <Link to="/login" className="text-xs text-[#A3A3A8] hover:text-white flex items-center justify-center gap-1.5 transition">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center border-t border-[#1E1E22] text-[11px] text-[#6B6B70]">
        SkillVerify Account Recovery · Cryptographic Single-Use Tokens
      </footer>
    </div>
  );
}
