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
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F5F4]">Projects</h1>
          <p className="text-[#A3A3A8] text-sm mt-1">Add project evidence and verify codebase integrity</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/analysis/report" className="btn-ghost text-xs flex items-center gap-1.5 border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4]">
            <Compass className="w-4 h-4 text-[#E8672E]" />
            <span>3D Constellation</span>
          </Link>
          <button onClick={() => setVerifyModalOpen(true)} className="btn-ghost text-xs flex items-center gap-1.5 border-[#3FB65F]/30 bg-[#16261B] text-[#3FB65F]">
            <ShieldCheck className="w-4 h-4" />
            <span>Code Audit</span>
          </button>
          <button onClick={() => setAdding(true)} className="btn-primary text-xs">+ Add Project</button>
        </div>
      </div>

      {adding && (
        <div className="card border border-[#2A2A2E] bg-[#17171A] space-y-3">
          <h3 className="section-title text-[#F5F5F4]">New Project</h3>
          <div><label className="label text-[#A3A3A8]">Project name *</label><input className="input text-xs" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label text-[#A3A3A8]">Description</label><textarea rows={3} className="input text-xs" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><label className="label text-[#A3A3A8]">Your role</label><input className="input text-xs" placeholder="e.g. Backend Developer" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
          <div><label className="label text-[#A3A3A8]">Technologies (comma-separated)</label><input className="input text-xs" placeholder="Python, Django, React" value={form.technologies} onChange={e => setForm(f => ({ ...f, technologies: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label text-[#A3A3A8]">GitHub URL</label><input className="input text-xs" placeholder="https://github.com/…" value={form.githubUrl} onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} /></div>
            <div><label className="label text-[#A3A3A8]">Live URL</label><input className="input text-xs" placeholder="https://…" value={form.projectUrl} onChange={e => setForm(f => ({ ...f, projectUrl: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAdding(false)} className="btn-ghost flex-1 border-[#2A2A2E] text-[#A3A3A8]">Cancel</button>
            <button onClick={save} className="btn-primary flex-1">Save Project</button>
          </div>
        </div>
      )}

      {projects.length === 0 && !adding ? (
        <div className="card text-center py-12 border-[#2A2A2E] bg-[#17171A]">
          <p className="text-[#6B6B70]">No projects yet. Add one to strengthen your profile.</p>
          <button onClick={() => setAdding(true)} className="btn-primary mt-3">Add first project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => (
            <div key={p.id} className="card-hover relative border border-[#2A2A2E] bg-[#17171A]">
              <button onClick={() => del(p.id)} className="absolute top-3 right-3 text-[#6B6B70] hover:text-[#E0554E] text-lg">✕</button>
              <h3 className="font-semibold text-[#F5F5F4] mb-1">{p.name}</h3>
              {p.role && <p className="text-xs text-[#E8672E] mb-2">{p.role}</p>}
              <p className="text-sm text-[#A3A3A8] mb-3 line-clamp-2">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(p.technologies ?? []).map(t => (
                  <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 text-xs">
                {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-[#A3A3A8] hover:text-[#F5F5F4] hover:underline">GitHub →</a>}
                {p.projectUrl && <a href={p.projectUrl} target="_blank" rel="noreferrer" className="text-[#3FB65F] hover:underline">Live →</a>}
              </div>
              <div className="mt-3 pt-3 border-t border-[#2A2A2E] flex items-center justify-between">
                <Link to="/analysis/report" className="text-xs text-[#3FB65F] hover:underline flex items-center gap-1 font-medium">
                  <Compass className="w-3.5 h-3.5" /> 3D Scorecard →
                </Link>
                <button onClick={() => setVerifyModalOpen(true)} className="text-xs text-[#E8672E] hover:text-[#F3773D] flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verify Code
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
