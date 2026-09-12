import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

export default function CreateHackathon() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '', registrationDeadline: '', maxTeamSize: 5, requiredSkills: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.post('/hackathons', { ...form, requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) });
      toast.success('Hackathon created!');
      navigate(`/hackathons/${data.id}`);
    } catch { toast.error('Failed to create'); setSaving(false); }
  };

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div className="max-w-xl mx-auto space-y-6 fade-in-up">
      <h1 className="text-2xl font-bold text-white">Create Hackathon</h1>
      <div className="card space-y-4">
        <div><label className="label">Name *</label><input className="input" value={form.name} onChange={f('name')} /></div>
        <div><label className="label">Description</label><textarea rows={3} className="input" value={form.description} onChange={f('description')} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Start date</label><input type="datetime-local" className="input" value={form.startDate} onChange={f('startDate')} /></div>
          <div><label className="label">End date</label><input type="datetime-local" className="input" value={form.endDate} onChange={f('endDate')} /></div>
        </div>
        <div><label className="label">Registration deadline</label><input type="datetime-local" className="input" value={form.registrationDeadline} onChange={f('registrationDeadline')} /></div>
        <div><label className="label">Max team size</label><input type="number" className="input" min={2} max={10} value={form.maxTeamSize} onChange={f('maxTeamSize')} /></div>
        <div><label className="label">Required skills (comma-separated)</label><input className="input" placeholder="Python, React, ML" value={form.requiredSkills} onChange={f('requiredSkills')} /></div>
        <button onClick={save} disabled={!form.name || saving} className="btn-primary w-full">{saving ? 'Creating…' : 'Create Hackathon'}</button>
      </div>
    </div>
  );
}
