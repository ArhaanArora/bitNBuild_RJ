import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { firebaseService } from '../../services/firebase.service';
import { User, Briefcase, Calendar, Check, ArrowRight, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const { register, googleSignIn, roleConflict, clearRoleConflict } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Progressive profiling steps: 1 = Auth, 2 = Role, 3 = Profile
  const initialStep = (location.state as any)?.step || 1;
  const initialEmail = (location.state as any)?.email || '';

  const [step, setStep] = useState<number>(initialStep);
  const [authProvider, setAuthProvider] = useState<'email' | 'google'>('email');

  // Step 1: Credentials
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Step 2: Role selection
  const [role, setRole] = useState<'candidate' | 'recruiter' | 'organizer'>('candidate');

  // Step 3: Role-specific essential profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [eventName, setEventName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Validation
  const validateStep1 = () => {
    let valid = true;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password || password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      valid = false;
    } else {
      setPasswordError('');
    }
    return valid;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      clearRoleConflict();
      setStep(2);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    clearRoleConflict();
    try {
      const res = await googleSignIn();
      if (res.isNewUser) {
        setEmail(res.email || '');
        setAuthProvider('google');
        setStep(2);
      } else if (res.user) {
        navigate(res.user.role === 'recruiter' ? '/hiring' : res.user.role === 'organizer' ? '/hackathons' : '/dashboard');
      }
    } catch {
      // Handled
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authProvider === 'email' && firebaseService.isConfigured()) {
        try {
          await firebaseService.signUpWithEmail(email.trim(), password);
        } catch (fbErr: any) {
          console.warn('[Firebase Auth Register sync]:', fbErr.message);
        }
      }

      const user = await register({
        email,
        password: authProvider === 'email' ? password : undefined,
        firstName,
        lastName,
        role,
        authProvider,
        workEmail: role === 'recruiter' ? (workEmail || email) : undefined,
        organizationName: role === 'recruiter' || role === 'organizer' ? organizationName : undefined,
        jobTitle: role === 'recruiter' ? jobTitle : undefined,
        eventName: role === 'organizer' ? eventName : undefined,
        skills: role === 'candidate' ? skills : undefined,
        education: role === 'candidate' ? education : undefined,
        location: role === 'candidate' ? locationStr : undefined,
      });

      const target = role === 'recruiter' ? '/hiring' : role === 'organizer' ? '/hackathons' : '/dashboard';
      navigate(target, { replace: true });
    } catch {
      // Handled in useAuth
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col justify-between">
      {/* Top Header */}
      <header className="h-16 border-b border-[#2A2A2E] px-8 flex items-center justify-between">
        <Link to="/login" className="flex items-center gap-2">
          <div className="text-xl font-bold tracking-tight">
            <span className="text-[#F5F5F4]">Skill</span>
            <span className="text-[#E8672E]">Verify</span>
          </div>
          <span className="text-[10px] text-[#6B6B70] uppercase font-mono tracking-widest pl-2 border-l border-[#2A2A2E]">
            ONBOARDING
          </span>
        </Link>
        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={step >= 1 ? 'text-[#E8672E] font-semibold' : 'text-[#6B6B70]'}>1. Auth</span>
          <span className="text-[#38383D]">→</span>
          <span className={step >= 2 ? 'text-[#E8672E] font-semibold' : 'text-[#6B6B70]'}>2. Role</span>
          <span className="text-[#38383D]">→</span>
          <span className={step >= 3 ? 'text-[#E8672E] font-semibold' : 'text-[#6B6B70]'}>3. Profile</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#E8672E]" />

            {/* Role Conflict Notice (§3.1, §9) */}
            {roleConflict && (
              <div className="mb-6 p-4 rounded-xl bg-[#2B2213] border border-[#D89A3E]/30 text-[#D89A3E] space-y-3 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#D89A3E]" />
                  <div>
                    <p className="text-xs font-semibold">Account Role Conflict</p>
                    <p className="text-xs text-[#D89A3E]/90 mt-0.5">{roleConflict.error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearRoleConflict();
                    navigate('/login');
                  }}
                  className="btn-primary w-full py-2 text-xs"
                >
                  Continue with Existing {roleConflict.existingRole.charAt(0).toUpperCase() + roleConflict.existingRole.slice(1)} Role →
                </button>
              </div>
            )}

            {/* STEP 1: AUTHENTICATION (§3) */}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <h1 className="text-xl font-bold tracking-tight">Create your account</h1>
                  <p className="text-xs text-[#A3A3A8] mt-1">
                    Step 1 of 3: Authenticate with Google or create credentials.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={isGoogleLoading}
                  className="w-full bg-[#1E1E22] hover:bg-[#26262B] text-[#F5F5F4] border border-[#2A2A2E] hover:border-[#38383D] rounded-xl py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-3 transition-all mb-4"
                >
                  {isGoogleLoading ? (
                    <div className="w-4 h-4 border-2 border-[#E8672E] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 20.4 7.5 23 12 23z" />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                <div className="relative my-5 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#2A2A2E]" />
                  </div>
                  <span className="relative bg-[#17171A] px-3 text-[11px] text-[#6B6B70] uppercase tracking-wider font-mono">
                    or continue with email
                  </span>
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#A3A3A8] mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full bg-[#1E1E22] border rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F4] placeholder-[#6B6B70] focus:outline-none transition-all ${
                        emailError ? 'border-[#E0554E]' : 'border-[#2A2A2E] focus:border-[#E8672E]'
                      }`}
                    />
                    {emailError && <p className="text-[11px] text-[#E0554E] mt-1">{emailError}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A3A3A8] mb-1.5">Create password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className={`w-full bg-[#1E1E22] border rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F4] placeholder-[#6B6B70] focus:outline-none transition-all ${
                        passwordError ? 'border-[#E0554E]' : 'border-[#2A2A2E] focus:border-[#E8672E]'
                      }`}
                    />
                    {passwordError && <p className="text-[11px] text-[#E0554E] mt-1">{passwordError}</p>}
                  </div>

                  <button type="submit" className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 mt-4">
                    <span>Continue to Role Selection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                <p className="text-center text-xs text-[#A3A3A8] mt-6">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#E8672E] font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            )}

            {/* STEP 2: SELECT ROLE (§3) */}
            {step === 2 && (
              <div>
                <div className="mb-6">
                  <h1 className="text-xl font-bold tracking-tight">What are you here to do?</h1>
                  <p className="text-xs text-[#A3A3A8] mt-1">
                    Select your primary workspace. This determines your permissions and interface.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-6">
                  {/* Candidate Option */}
                  <div
                    onClick={() => setRole('candidate')}
                    className={`cursor-pointer rounded-xl border p-4 transition-all relative ${
                      role === 'candidate'
                        ? 'bg-[#241C16] border-[#E8672E] shadow-md'
                        : 'bg-[#1E1E22] border-[#2A2A2E] hover:border-[#38383D]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#2A2A2E] flex items-center justify-center text-[#E8672E]">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Candidate</p>
                          <p className="text-xs text-[#A3A3A8]">Showcase verified skills & find hackathon teammates</p>
                        </div>
                      </div>
                      {role === 'candidate' && <Check className="w-4 h-4 text-[#E8672E]" />}
                    </div>
                  </div>

                  {/* Recruiter Option */}
                  <div
                    onClick={() => setRole('recruiter')}
                    className={`cursor-pointer rounded-xl border p-4 transition-all relative ${
                      role === 'recruiter'
                        ? 'bg-[#241C16] border-[#E8672E] shadow-md'
                        : 'bg-[#1E1E22] border-[#2A2A2E] hover:border-[#38383D]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#2A2A2E] flex items-center justify-center text-[#E8672E]">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Recruiter</p>
                          <p className="text-xs text-[#A3A3A8]">Discover talent with audited code & proctored benchmarks</p>
                        </div>
                      </div>
                      {role === 'recruiter' && <Check className="w-4 h-4 text-[#E8672E]" />}
                    </div>
                  </div>

                  {/* Organizer Option */}
                  <div
                    onClick={() => setRole('organizer')}
                    className={`cursor-pointer rounded-xl border p-4 transition-all relative ${
                      role === 'organizer'
                        ? 'bg-[#241C16] border-[#E8672E] shadow-md'
                        : 'bg-[#1E1E22] border-[#2A2A2E] hover:border-[#38383D]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#2A2A2E] flex items-center justify-center text-[#E8672E]">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Organizer</p>
                          <p className="text-xs text-[#A3A3A8]">Build and manage hackathons, challenges & team formation</p>
                        </div>
                      </div>
                      {role === 'organizer' && <Check className="w-4 h-4 text-[#E8672E]" />}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary py-2.5 px-4 text-xs flex items-center gap-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Essential Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: ESSENTIAL PROFILE (§3) */}
            {step === 3 && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#E8672E]/10 text-[#E8672E] border border-[#E8672E]/30 px-2 py-0.5 rounded font-mono uppercase font-semibold">
                      {role} Workspace
                    </span>
                  </div>
                  <h1 className="text-xl font-bold tracking-tight mt-2">Essential Profile</h1>
                  <p className="text-xs text-[#A3A3A8] mt-1">
                    Provide minimal details. You can complete the full profile later.
                  </p>
                </div>

                <form onSubmit={handleStep3Submit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#A3A3A8] mb-1">First name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Alex"
                        required
                        className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-xs text-[#F5F5F4] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#A3A3A8] mb-1">Last name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Chen"
                        required
                        className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-xs text-[#F5F5F4] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Candidate Specific Fields (§3) */}
                  {role === 'candidate' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-[#A3A3A8] mb-1">Core Skills (comma separated)</label>
                        <input
                          type="text"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          placeholder="Python, React, TypeScript, SQL"
                          className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-xs text-[#F5F5F4] focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#A3A3A8] mb-1">Education / Degree</label>
                          <input
                            type="text"
                            value={education}
                            onChange={(e) => setEducation(e.target.value)}
                            placeholder="B.S. Computer Science"
                            className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-xs text-[#F5F5F4] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#A3A3A8] mb-1">Location</label>
                          <input
                            type="text"
                            value={locationStr}
                            onChange={(e) => setLocationStr(e.target.value)}
                            placeholder="San Francisco, CA"
                            className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-xs text-[#F5F5F4] focus:outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Recruiter Specific Fields (§3) */}
                  {role === 'recruiter' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-[#A3A3A8] mb-1">Organization / Company Name</label>
                        <input
                          type="text"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          placeholder="Acme Tech Ventures"
                          required
                          className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-xs text-[#F5F5F4] focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#A3A3A8] mb-1">Job Title</label>
                          <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="Senior Tech Recruiter"
                            className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-xs text-[#F5F5F4] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#A3A3A8] mb-1">Work Email (Optional)</label>
                          <input
                            type="email"
                            value={workEmail}
                            onChange={(e) => setWorkEmail(e.target.value)}
                            placeholder="talent@acme.com"
                            className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-xs text-[#F5F5F4] focus:outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Organizer Specific Fields (§3) */}
                  {role === 'organizer' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-[#A3A3A8] mb-1">Organization / Chapter</label>
                        <input
                          type="text"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          placeholder="Tech Hub Society"
                          required
                          className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-xs text-[#F5F5F4] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#A3A3A8] mb-1">Event / Hackathon Name</label>
                        <input
                          type="text"
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                          placeholder="Annual AI Builder Hackathon 2025"
                          className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3 py-2 text-xs text-[#F5F5F4] focus:outline-none"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-secondary py-2.5 px-4 text-xs flex items-center gap-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-[#0D0D0F] border-t-transparent rounded-full animate-spin" />
                          <span>Creating workspace...</span>
                        </>
                      ) : (
                        <span>Complete Setup & Enter Workspace</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="py-4 text-center border-t border-[#1E1E22] text-[11px] text-[#6B6B70]">
        SkillVerify Progressive Onboarding · Identity & Verification Security
      </footer>
    </div>
  );
}
