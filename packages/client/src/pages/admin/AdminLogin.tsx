import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { ShieldCheck, Lock, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate('/admin/security', { replace: true });
    } catch {
      // Toast dispatched in useAdminAuth
    } finally {
      setLoading(false);
    }
  };

  const fillAdminDemo = () => {
    setEmail('admin@skillverify.com');
    setPassword('AdminSecret2025!');
    toast.success('Loaded Super Admin credentials');
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F4] flex flex-col justify-between">
      <header className="h-16 border-b border-[#1E1E22] px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#241C16] border border-[#E8672E]/40 flex items-center justify-center text-[#E8672E]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">SkillVerify Security Control</span>
          <span className="text-[10px] bg-[#E8672E]/10 text-[#E8672E] px-2 py-0.5 rounded font-mono uppercase tracking-wider ml-2">
            ISOLATED
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-[#111114] border border-[#222226] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E8672E] to-[#D89A3E]" />

            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-tight">Security Console Authentication</h1>
              <p className="text-xs text-[#8E8E93] mt-1">
                Restricted access for platform administrators and security operators.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8E8E93] mb-1.5 font-mono uppercase text-[11px]">
                  Admin Identifier / Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@skillverify.com"
                  required
                  className="w-full bg-[#18181C] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F4] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8E8E93] mb-1.5 font-mono uppercase text-[11px]">
                  Security Key / Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#18181C] border border-[#2A2A2E] focus:border-[#E8672E] rounded-xl px-3.5 py-2.5 text-xs text-[#F5F5F4] focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0D0D0F] border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize Session</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#222226]">
              <button
                type="button"
                onClick={fillAdminDemo}
                className="w-full p-2.5 rounded-xl bg-[#18181C] hover:bg-[#202025] border border-[#2A2A2E] flex items-center justify-between text-left transition"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#E8672E]" />
                  <div>
                    <p className="text-xs font-semibold text-white">Demo Super Admin</p>
                    <p className="text-[10px] text-[#8E8E93] font-mono">admin@skillverify.com</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#E8672E] font-mono font-medium">Click to fill</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center border-t border-[#1E1E22] text-[11px] text-[#6B6B70] font-mono">
        SkillVerify Security Domain · Tiered Administrative Access Control
      </footer>
    </div>
  );
}
