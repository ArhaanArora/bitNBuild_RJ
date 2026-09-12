import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import VerifyProjectModal from '../verify/VerifyProjectModal';
import { ShieldCheck, Compass } from 'lucide-react';

interface Project { id: string; name: string; description: string; technologies: string[]; role: string; githubUrl: string; projectUrl: string; skills: { name: string }[]; }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allSkills, setAllSkills] = useState<{ id: string; name: string }[]>([]);
  const [adding, setAdding] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', technologies: '', role: '', githubUrl: '', projectUrl: '', skillIds: [] as string[] });

  const load = async () => {
    const [p, s] = await Promise.all([api.get('/projects/mine'), api.get('/skills')]);
    setProjects(p.data); setAllSkills(s.data);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await api.post('/projects/mine', { ...form, technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean) });
      toast.success('Project added!'); setAdding(false);
      setForm({ name: '', description: '', technologies: '', role: '', githubUrl: '', projectUrl: '', skillIds: [] });
      load();
    } catch { toast.error('Failed to save project'); }
  };

  const del = async (id: string) => {
    await api.delete(`/projects/mine/${id}`);
    setProjects(p => p.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">Add project evidence and verify code integrity in 3D</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/analysis/report" className="btn-ghost text-xs flex items-center gap-1.5 border-gray-700">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>3D Constellation</span>
          </Link>
          <button onClick={() => setVerifyModalOpen(true)} className="btn-accent text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>AI Verification</span>
          </button>
          <button onClick={() => setAdding(true)} className="btn-primary text-xs">+ Add Project</button>
        </div>
      </div>

      {adding && (
        <div className="card border-indigo-700/50 space-y-3">
          <h3 className="section-title">New Project</h3>
          <div><label className="label">Project name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Description</label><textarea rows={3} className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><label className="label">Your role</label><input className="input" placeholder="e.g. Backend Developer" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
          <div><label className="label">Technologies (comma-separated)</label><input className="input" placeholder="Python, Django, React" value={form.technologies} onChange={e => setForm(f => ({ ...f, technologies: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">GitHub URL</label><input className="input" placeholder="https://github.com/…" value={form.githubUrl} onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} /></div>
            <div><label className="label">Live URL</label><input className="input" placeholder="https://…" value={form.projectUrl} onChange={e => setForm(f => ({ ...f, projectUrl: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAdding(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={save} className="btn-primary flex-1">Save Project</button>
          </div>
        </div>
      )}

      {projects.length === 0 && !adding ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No projects yet. Add one to strengthen your profile.</p>
          <button onClick={() => setAdding(true)} className="btn-primary mt-3">Add first project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => (
            <div key={p.id} className="card-hover relative">
              <button onClick={() => del(p.id)} className="absolute top-3 right-3 text-gray-600 hover:text-red-400 text-lg">✕</button>
              <h3 className="font-semibold text-white mb-1">{p.name}</h3>
              {p.role && <p className="text-xs text-indigo-400 mb-2">{p.role}</p>}
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(p.technologies ?? []).map(t => <span key={t} className="badge badge-unverified text-xs">{t}</span>)}
              </div>
              <div className="flex gap-3 text-xs">
                {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">GitHub →</a>}
                {p.projectUrl && <a href={p.projectUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">Live →</a>}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                <Link to="/analysis/report" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium">
                  <Compass className="w-3.5 h-3.5" /> 3D Trust Scorecard →
                </Link>
                <button onClick={() => setVerifyModalOpen(true)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> AI Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <VerifyProjectModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
      />
    </div>
  );
}
