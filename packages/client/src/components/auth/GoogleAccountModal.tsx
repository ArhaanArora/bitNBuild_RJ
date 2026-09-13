import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Mail, User, Briefcase, Calendar } from 'lucide-react';

export interface GoogleAccountPayload {
  email: string;
  name: string;
  photoUrl?: string;
  role?: 'candidate' | 'recruiter' | 'organizer';
}

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleAccountPayload) => Promise<void>;
  isSubmitting?: boolean;
  initialRole?: 'candidate' | 'recruiter' | 'organizer';
}

export const GoogleAccountModal: React.FC<GoogleAccountModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  isSubmitting = false,
  initialRole = 'candidate',
}) => {
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'recruiter' | 'organizer'>(initialRole);
  const [customMode, setCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customError, setCustomError] = useState('');

  if (!isOpen) return null;

  const defaultAccounts = [
    {
      name: 'Sanyam Vij',
      email: 'sanyamvij1226@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
      tag: 'Owner / Platform Lead',
    },
    {
      name: 'Alex Chen',
      email: 'alex.chen.dev@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      tag: 'Verified Candidate',
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      setCustomError('Please enter a Google email address.');
      return;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(customEmail)) {
      setCustomError('Please enter a valid email address.');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0];
    onSelectAccount({
      email: customEmail.trim().toLowerCase(),
      name,
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
      role: selectedRole,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        {/* Top Google Header bar */}
        <div className="bg-[#1E1E22] px-6 py-4 border-b border-[#2A2A2E] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-xs font-semibold text-[#F5F5F4] tracking-wide">
              Sign in with Google
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A3A3A8] hover:text-[#F5F5F4] hover:bg-[#2A2A2E] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#F5F5F4]">Choose a Google Account</h2>
            <p className="text-xs text-[#A3A3A8] mt-0.5">
              to continue to <span className="text-[#F5F5F4] font-medium">SkillVerify Platform</span>
            </p>
          </div>

          {/* Role selector pill tabs */}
          <div className="mb-5 p-1 bg-[#121214] border border-[#2A2A2E] rounded-xl flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setSelectedRole('candidate')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition font-medium text-[11px] ${
                selectedRole === 'candidate'
                  ? 'bg-[#E8672E] text-[#0D0D0F] font-semibold shadow'
                  : 'text-[#A3A3A8] hover:text-white'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('recruiter')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition font-medium text-[11px] ${
                selectedRole === 'recruiter'
                  ? 'bg-[#E8672E] text-[#0D0D0F] font-semibold shadow'
                  : 'text-[#A3A3A8] hover:text-white'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Recruiter</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('organizer')}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition font-medium text-[11px] ${
                selectedRole === 'organizer'
                  ? 'bg-[#E8672E] text-[#0D0D0F] font-semibold shadow'
                  : 'text-[#A3A3A8] hover:text-white'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Organizer</span>
            </button>
          </div>

          {!customMode ? (
            <div className="space-y-2.5">
              {defaultAccounts.map((acc) => (
                <button
                  key={acc.email}
                  disabled={isSubmitting}
                  onClick={() => onSelectAccount({
                    email: acc.email,
                    name: acc.name,
                    photoUrl: acc.avatar,
                    role: selectedRole,
                  })}
                  className="w-full bg-[#1E1E22] hover:bg-[#25252A] border border-[#2A2A2E] hover:border-[#E8672E]/50 rounded-xl p-3.5 flex items-center justify-between text-left transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#38383D]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#F5F5F4] group-hover:text-white">
                          {acc.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2A2E] text-[#A3A3A8] font-mono">
                          {acc.tag}
                        </span>
                      </div>
                      <span className="text-xs text-[#A3A3A8] block mt-0.5 font-mono">
                        {acc.email}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#6B6B70] group-hover:text-[#E8672E] group-hover:translate-x-0.5 transition" />
                </button>
              ))}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCustomMode(true)}
                  className="w-full bg-transparent hover:bg-[#1E1E22] border border-dashed border-[#38383D] hover:border-[#E8672E]/50 rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-[#A3A3A8] hover:text-[#F5F5F4] transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Use another Google account</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A3A3A8] mb-1.5">
                  Google Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B6B70] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => {
                      setCustomEmail(e.target.value);
                      setCustomError('');
                    }}
                    placeholder="your.name@gmail.com"
                    className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F5F5F4] focus:outline-none"
                  />
                </div>
                {customError && <p className="text-[11px] text-[#E0554E] mt-1">{customError}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A3A3A8] mb-1.5">
                  Display Name (optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6B6B70] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F5F5F4] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="flex-1 bg-[#1E1E22] hover:bg-[#25252A] text-[#A3A3A8] hover:text-[#F5F5F4] text-xs font-medium py-2.5 rounded-xl transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#E8672E] hover:bg-[#F3773D] text-[#0D0D0F] font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#0D0D0F] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer badge */}
          <div className="mt-6 pt-4 border-t border-[#2A2A2E] flex items-center justify-center gap-2 text-[11px] text-[#6B6B70]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3FB65F]" />
            <span>Google Identity pre-verifies your email with zero friction.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
