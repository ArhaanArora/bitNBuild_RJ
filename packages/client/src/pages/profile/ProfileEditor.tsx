import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

export default function ProfileEditor() {
  const [profile, setProfile] = useState<any>(null);
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm();

  useEffect(() => {
    api.get('/profiles/me').then(r => { setProfile(r.data); reset(r.data); });
  }, []);

  const save = async (data: any) => {
    try {
      const updated = await api.patch('/profiles/me', data);
      setProfile(updated.data); reset(updated.data);
      toast.success('Profile saved!');
    } catch { toast.error('Failed to save'); }
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData(); fd.append('photo', e.target.files[0]);
    const { data } = await api.post('/profiles/me/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    toast.success('Photo updated!'); setProfile((p: any) => ({ ...p, photoUrl: data.photoUrl }));
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 fade-in-up">
      <h1 className="text-2xl font-bold text-white">Edit Profile</h1>

      {/* Photo */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-700 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
          {profile?.photoUrl ? <img src={profile.photoUrl} alt="photo" className="w-full h-full object-cover" /> : `${profile?.firstName?.[0]}${profile?.lastName?.[0]}`}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{profile?.firstName} {profile?.lastName}</p>
          <label className="text-xs text-indigo-400 cursor-pointer hover:underline mt-1 inline-block">
            Change photo <input type="file" accept="image/*" className="sr-only" onChange={uploadPhoto} />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit(save)} className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">First name</label><input {...register('firstName')} className="input" /></div>
          <div><label className="label">Last name</label><input {...register('lastName')} className="input" /></div>
        </div>
        <div><label className="label">Bio</label><textarea {...register('bio')} rows={3} className="input" placeholder="Brief description of yourself…" /></div>
        <div><label className="label">Education</label><input {...register('education')} className="input" placeholder="B.Tech CS, 2024" /></div>
        <div><label className="label">LinkedIn URL</label><input {...register('linkedinUrl')} className="input" placeholder="https://linkedin.com/in/…" /></div>
        <div><label className="label">GitHub URL</label><input {...register('githubUrl')} className="input" placeholder="https://github.com/…" /></div>
        <div><label className="label">Portfolio URL</label><input {...register('portfolioUrl')} className="input" placeholder="https://…" /></div>
        <button type="submit" disabled={!isDirty} className="btn-primary w-full">Save Changes</button>
      </form>
    </div>
  );
}
