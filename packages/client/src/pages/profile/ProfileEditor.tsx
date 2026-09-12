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
    <div className="max-w-xl mx-auto space-y-6 fade-in-up pb-12">
      <h1 className="text-2xl font-bold text-[#F5F5F4]">Edit Profile</h1>

      {/* Photo */}
      <div className="card flex items-center gap-4 border border-[#2A2A2E] bg-[#17171A]">
        <div className="w-16 h-16 rounded-full bg-[#241C16] border border-[#E8672E]/30 flex items-center justify-center text-xl font-bold text-[#E8672E] overflow-hidden">
          {profile?.photoUrl ? <img src={profile.photoUrl} alt="photo" className="w-full h-full object-cover" /> : `${profile?.firstName?.[0] || 'A'}${profile?.lastName?.[0] || 'C'}`}
        </div>
        <div>
          <p className="text-sm font-medium text-[#F5F5F4]">{profile?.firstName} {profile?.lastName}</p>
          <label className="text-xs text-[#E8672E] cursor-pointer hover:underline mt-1 inline-block">
            Change photo <input type="file" accept="image/*" className="sr-only" onChange={uploadPhoto} />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit(save)} className="card space-y-4 border border-[#2A2A2E] bg-[#17171A]">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label text-xs text-[#A3A3A8]">First name</label><input {...register('firstName')} className="input text-xs" /></div>
          <div><label className="label text-xs text-[#A3A3A8]">Last name</label><input {...register('lastName')} className="input text-xs" /></div>
        </div>
        <div><label className="label text-xs text-[#A3A3A8]">Bio</label><textarea {...register('bio')} rows={3} className="input text-xs" placeholder="Brief description of yourself…" /></div>
        <div><label className="label text-xs text-[#A3A3A8]">Education</label><input {...register('education')} className="input text-xs" placeholder="B.Tech CS, 2024" /></div>
        <div><label className="label text-xs text-[#A3A3A8]">LinkedIn URL</label><input {...register('linkedinUrl')} className="input text-xs" placeholder="https://linkedin.com/in/…" /></div>
        <div><label className="label text-xs text-[#A3A3A8]">GitHub URL</label><input {...register('githubUrl')} className="input text-xs" placeholder="https://github.com/…" /></div>
        <div><label className="label text-xs text-[#A3A3A8]">Portfolio URL</label><input {...register('portfolioUrl')} className="input text-xs" placeholder="https://…" /></div>
        <button type="submit" disabled={!isDirty} className="btn-primary w-full py-2.5 text-xs font-semibold">Save Changes</button>
      </form>
    </div>
  );
}
