import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const fillCredentials = (email: string, pass: string = 'Demo1234!') => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    toast.success(`Filled demo credentials for ${email}`);
  };

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMsg = err.response?.data?.error;
      if (typeof serverMsg === 'string') {
        toast.error(serverMsg);
      } else if (serverMsg && typeof serverMsg === 'object') {
        toast.error(JSON.stringify(serverMsg));
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        toast.error('Network Error: Cannot reach API server. Please ensure backend is running.');
      } else {
        toast.error('Login failed. Please check your credentials or click a demo account below.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">SV</div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to SkillVerify</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input {...register('password')} type="password" className="input" placeholder="••••••••" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials hint with 1-click autofill */}
          <div className="mt-5 p-3 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-2 font-medium flex items-center justify-between">
              <span>⚡ Click to auto-fill demo credentials:</span>
            </p>
            <div className="space-y-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => fillCredentials('alex@demo.local')}
                className="w-full text-left p-2 rounded bg-gray-800 hover:bg-gray-700 transition flex justify-between items-center text-gray-300 border border-gray-700/50"
              >
                <span>alex@demo.local · Demo1234!</span>
                <span className="text-indigo-400 font-semibold text-[11px] bg-indigo-950 px-2 py-0.5 rounded">Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('organizer@demo.local')}
                className="w-full text-left p-2 rounded bg-gray-800 hover:bg-gray-700 transition flex justify-between items-center text-gray-300 border border-gray-700/50"
              >
                <span>organizer@demo.local · Demo1234!</span>
                <span className="text-emerald-400 font-semibold text-[11px] bg-emerald-950 px-2 py-0.5 rounded">Organizer</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('recruiter@acme.com')}
                className="w-full text-left p-2 rounded bg-gray-800 hover:bg-gray-700 transition flex justify-between items-center text-gray-300 border border-gray-700/50"
              >
                <span>recruiter@acme.com · Demo1234!</span>
                <span className="text-amber-400 font-semibold text-[11px] bg-amber-950 px-2 py-0.5 rounded">Recruiter</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('recruiter@demo.local')}
                className="w-full text-left p-2 rounded bg-gray-800 hover:bg-gray-700 transition flex justify-between items-center text-gray-300 border border-gray-700/50"
              >
                <span>recruiter@demo.local · Demo1234!</span>
                <span className="text-amber-400 font-semibold text-[11px] bg-amber-950 px-2 py-0.5 rounded">Recruiter (Demo)</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          No account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Create one</Link>
        </p>
      </div>
    </div>
  );
}
