import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { firebaseService } from '../../services/firebase.service';
import { Shield, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);

  // Blur validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email address is required.');
      return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    if (!isEmailValid || !isPasswordValid) return;

    setIsSubmitting(true);
    try {
      if (firebaseService.isConfigured()) {
        try {
          await firebaseService.signInWithEmail(email.trim(), password);
        } catch (fbErr: any) {
          console.log('[Firebase login notice]:', fbErr.message);
        }
      }

      const user = await login(email, password, rememberDevice);
      const redirectUrl = (location.state as any)?.from?.pathname || (
        user.role === 'recruiter' ? '/hiring' :
        user.role === 'organizer' ? '/hackathons' : '/dashboard'
      );
      navigate(redirectUrl, { replace: true });
    } catch {
      // toast is dispatched inside useAuth
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await googleSignIn();
      if (result.isNewUser) {
        navigate('/signup', { state: { step: 2, email: result.email } });
      } else if (result.user) {
        const redirectUrl = (location.state as any)?.from?.pathname || (
          result.user.role === 'recruiter' ? '/hiring' :
          result.user.role === 'organizer' ? '/hackathons' : '/dashboard'
        );
        navigate(redirectUrl, { replace: true });
      }
    } catch {
      // Handled in useAuth
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass = 'Demo1234!') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setEmailError('');
    setPasswordError('');
    toast.success(`Loaded credentials for ${demoEmail}`);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col justify-between">
      {/* Top Header Navigation (§2) */}
      <header className="h-16 border-b border-[#2A2A2E] px-8 flex items-center justify-between">
        <Link to="/login" className="flex items-center gap-2">
          <div className="text-xl font-bold tracking-tight">
            <span className="text-[#F5F5F4]">Skill</span>
            <span className="text-[#E8672E]">Verify</span>
          </div>
          <span className="text-[10px] text-[#6B6B70] uppercase font-mono tracking-widest pl-2 border-l border-[#2A2A2E]">
            AUTH GATEWAY
          </span>
        </Link>
        <div className="flex items-center gap-6 text-xs text-[#A3A3A8]">
          <span className="hover:text-white cursor-pointer transition">How it works</span>
          <span className="hover:text-white cursor-pointer transition">Security</span>
          <span className="hover:text-white cursor-pointer transition">Help</span>
        </div>
      </header>

      {/* Main Login Card (§2) */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#E8672E]" />

            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-tight text-[#F5F5F4]">Welcome back</h1>
              <p className="text-xs text-[#A3A3A8] mt-1">Sign in to continue to your workspace.</p>
            </div>

            {/* Primary Action Buttons (Google / Email Selector) */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full bg-[#1E1E22] hover:bg-[#26262B] text-[#F5F5F4] border border-[#2A2A2E] hover:border-[#38383D] rounded-xl py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-[#E8672E] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 20.4 7.5 23 12 23z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2A2A2E]" />
              </div>
              <span className="relative bg-[#17171A] px-3 text-[11px] text-[#6B6B70] uppercase tracking-wider font-mono">
                or continue with email
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A3A3A8] mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onBlur={validateEmail}
                  placeholder="name@example.com"
                  className={`w-full bg-[#1E1E22] border rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F4] placeholder-[#6B6B70] focus:outline-none transition-all ${
                    emailError ? 'border-[#E0554E] focus:border-[#E0554E]' : 'border-[#2A2A2E] focus:border-[#E8672E]'
                  }`}
                />
                {emailError && <p className="text-[11px] text-[#E0554E] mt-1">{emailError}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-[#A3A3A8]">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-[#A3A3A8] hover:text-[#E8672E] transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  onBlur={validatePassword}
                  placeholder="••••••••"
                  className={`w-full bg-[#1E1E22] border rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F4] placeholder-[#6B6B70] focus:outline-none transition-all ${
                    passwordError ? 'border-[#E0554E] focus:border-[#E0554E]' : 'border-[#2A2A2E] focus:border-[#E8672E]'
                  }`}
                />
                {passwordError && <p className="text-[11px] text-[#E0554E] mt-1">{passwordError}</p>}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberDevice"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded bg-[#1E1E22] border-[#2A2A2E] text-[#E8672E] focus:ring-0"
                />
                <label htmlFor="rememberDevice" className="text-xs text-[#A3A3A8] cursor-pointer select-none">
                  Remember this device
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isGoogleLoading}
                className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0D0D0F] border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* 1-Click Demo Credentials Autofill (§2) */}
            <div className="mt-6 pt-5 border-t border-[#2A2A2E]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#6B6B70] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#E8672E]" />
                  <span>1-Click Demo Accounts</span>
                </span>
                <span className="text-[10px] text-[#6B6B70]">Demo1234!</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('alex@demo.local')}
                  className="p-2 rounded-lg bg-[#1E1E22] hover:bg-[#26262B] border border-[#2A2A2E] text-left transition"
                >
                  <p className="text-[11px] font-semibold text-white">Candidate</p>
                  <p className="text-[10px] text-[#6B6B70] truncate">alex@demo.local</p>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('recruiter@demo.local')}
                  className="p-2 rounded-lg bg-[#1E1E22] hover:bg-[#26262B] border border-[#2A2A2E] text-left transition"
                >
                  <p className="text-[11px] font-semibold text-white">Recruiter</p>
                  <p className="text-[10px] text-[#6B6B70] truncate">recruiter@demo.local</p>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('organizer@demo.local')}
                  className="p-2 rounded-lg bg-[#1E1E22] hover:bg-[#26262B] border border-[#2A2A2E] text-left transition"
                >
                  <p className="text-[11px] font-semibold text-white">Organizer</p>
                  <p className="text-[10px] text-[#6B6B70] truncate">organizer@demo.local</p>
                </button>
              </div>
            </div>

            {/* Footer Prompt */}
            <p className="text-center text-xs text-[#A3A3A8] mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#E8672E] font-medium hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer System Guarantee */}
      <footer className="py-4 text-center border-t border-[#1E1E22] text-[11px] text-[#6B6B70]">
        SkillVerify Centralized Security Gateway · Server-Enforced RBAC
      </footer>
    </div>
  );
}
