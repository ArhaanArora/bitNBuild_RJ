import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import {
  User,
  GraduationCap,
  Link2,
  GitBranch,
  Globe,
  Camera,
  Save,
  Loader2,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface ProfileForm {
  firstName: string;
  lastName: string;
  bio: string;
  education: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

export default function ProfileEditor() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, errors },
  } = useForm<ProfileForm>();

  useEffect(() => {
    setLoading(true);
    api
      .get('/profiles/me')
      .then(r => {
        setProfile(r.data);
        reset(r.data);
      })
      .catch(() => {
        // Use auth user data as fallback
        const fallback = {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          bio: '',
          education: '',
          linkedinUrl: '',
          githubUrl: '',
          portfolioUrl: '',
        };
        setProfile(fallback);
        reset(fallback);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const updated = await api.patch('/profiles/me', data);
      setProfile(updated.data);
      reset(updated.data);
      toast.success('Profile saved!');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append('photo', e.target.files[0]);
    try {
      const { data } = await api.post('/profiles/me/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Photo updated!');
      setProfile((p: any) => ({ ...p, photoUrl: data.photoUrl }));
    } catch {
      toast.error('Failed to upload photo');
    }
  };

  const initials = `${profile?.firstName?.[0] || 'A'}${profile?.lastName?.[0] || 'C'}`.toUpperCase();

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-5 fade-in-up">
        <div className="skeleton" style={{ height: '28px', width: '160px' }} />
        <div className="card space-y-4">
          <div className="flex items-center gap-4">
            <div className="skeleton rounded-full" style={{ width: '64px', height: '64px' }} />
            <div className="space-y-2">
              <div className="skeleton" style={{ height: '14px', width: '120px' }} />
              <div className="skeleton" style={{ height: '12px', width: '80px' }} />
            </div>
          </div>
        </div>
        <div className="card space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i}>
              <div className="skeleton mb-1.5" style={{ height: '11px', width: '80px' }} />
              <div className="skeleton" style={{ height: '36px', borderRadius: '10px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 fade-in-up pb-16">
      {/* ── Page title ── */}
      <div>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.12em] block mb-1"
          style={{ color: 'var(--accent)' }}
        >
          ACCOUNT
        </span>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Edit Profile
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Your profile is visible to recruiters and hackathon organizers.
        </p>
      </div>

      {/* ── Avatar card ── */}
      <div className="card flex items-center gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden"
            style={{
              background: profile?.photoUrl ? 'transparent' : 'var(--accent-muted)',
              border: '2px solid var(--border-accent)',
              color: 'var(--accent)',
            }}
          >
            {profile?.photoUrl ? (
              <img src={profile.photoUrl} alt="Profile photo" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          {/* Camera overlay */}
          <label
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
            style={{
              background: 'var(--accent)',
              border: '2px solid var(--bg-base)',
            }}
            aria-label="Change profile photo"
            title="Change photo"
          >
            <Camera className="w-3 h-3 text-[#0A0A0C]" aria-hidden="true" />
            <input type="file" accept="image/*" className="sr-only" onChange={uploadPhoto} />
          </label>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {watch('firstName') || profile?.firstName}{' '}
            {watch('lastName') || profile?.lastName}
          </p>
          <div
            className="text-xs capitalize flex items-center gap-1 mt-0.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Lock className="w-3 h-3 text-emerald-400" aria-hidden="true" />
            {user?.role || 'Candidate'} · Verified role
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Click the camera icon to update your photo
          </p>
        </div>

        {/* Role lock indicator */}
        <div
          className="shrink-0 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5"
          style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)' }}
        >
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} aria-hidden="true" />
          <span className="text-[11px] font-semibold" style={{ color: 'var(--success)' }}>Verified</span>
        </div>
      </div>

      {/* ── Profile form ── */}
      <form onSubmit={handleSubmit(save)} className="card space-y-5" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="firstName">First name</label>
            <input
              id="firstName"
              {...register('firstName', { required: 'First name is required' })}
              className="input"
              placeholder="Sanya"
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label className="label" htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              {...register('lastName')}
              className="input"
              placeholder="Kapoor"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            {...register('bio')}
            rows={3}
            className="input resize-none"
            placeholder="Briefly describe yourself, your interests, and what you're looking for…"
          />
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            This appears on your public profile and in recruiter search results.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="education">
            <GraduationCap className="w-3 h-3 inline mr-1" aria-hidden="true" />
            Education
          </label>
          <input
            id="education"
            {...register('education')}
            className="input"
            placeholder="B.Tech Computer Science, Thapar University, 2024"
          />
        </div>

        <hr className="divider" />
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Social Links
        </p>

        <div className="space-y-3">
          <div className="relative">
            <label className="label" htmlFor="linkedinUrl">
              <Link2 className="w-3 h-3 inline mr-1" aria-hidden="true" />
              LinkedIn
            </label>
            <input
              id="linkedinUrl"
              {...register('linkedinUrl', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Must be a valid URL starting with https://',
                },
              })}
              className="input"
              type="url"
              placeholder="https://linkedin.com/in/your-profile"
              aria-describedby={errors.linkedinUrl ? 'linkedin-error' : undefined}
            />
            {errors.linkedinUrl && (
              <p id="linkedin-error" className="text-xs mt-1" style={{ color: 'var(--error)' }}>
                {errors.linkedinUrl.message}
              </p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="githubUrl">
              <GitBranch className="w-3 h-3 inline mr-1" aria-hidden="true" />
              GitHub
            </label>
            <input
              id="githubUrl"
              {...register('githubUrl', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Must be a valid URL starting with https://',
                },
              })}
              className="input"
              type="url"
              placeholder="https://github.com/your-username"
            />
          </div>

          <div>
            <label className="label" htmlFor="portfolioUrl">
              <Globe className="w-3 h-3 inline mr-1" aria-hidden="true" />
              Portfolio / Website
            </label>
            <input
              id="portfolioUrl"
              {...register('portfolioUrl', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Must be a valid URL starting with https://',
                },
              })}
              className="input"
              type="url"
              placeholder="https://your-portfolio.com"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!isDirty || saving}
            className="btn-primary w-full"
            aria-live="polite"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden="true" />
                Save Changes
              </>
            )}
          </button>
          {!isDirty && (
            <p className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              No unsaved changes
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
