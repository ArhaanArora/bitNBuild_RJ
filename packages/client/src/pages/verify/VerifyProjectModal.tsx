import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { Globe, FileArchive, X, Sparkles, Shield, ArrowRight } from 'lucide-react';

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface VerifyProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (report: any) => void;
}

export default function VerifyProjectModal({ isOpen, onClose, onSuccess }: VerifyProjectModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'github' | 'zip' | 'url'>('github');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, Node.js, PostgreSQL');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (activeTab === 'github') formData.append('githubUrl', githubUrl);
      if (activeTab === 'url') formData.append('liveUrl', liveUrl);
      if (activeTab === 'zip' && zipFile) formData.append('zipFile', zipFile);
      formData.append('description', description);
      formData.append('claimedSkills', skillsInput);

      const res = await api.post('/analysis/start', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Multi-agent verification completed!');
      onClose();
      if (onSuccess) onSuccess(res.data);
      navigate(`/project/${res.data.id}/report`);
    } catch (err: any) {
      console.error('Verification error:', err);
      toast.error(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
      <div className="relative w-full max-w-xl bg-[#0B0F1B] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Verify a Project</h2>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Submit repository, files, or live URL for 12-agent evidence verification and 3D constellation synthesis.
        </p>

        {/* Source Type Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-gray-950 rounded-xl border border-gray-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'github'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <GithubIcon className="w-3.5 h-3.5" />
            GitHub Repo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('zip')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'zip'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileArchive className="w-3.5 h-3.5" />
            ZIP Archive
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'url'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Live Website
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'github' && (
            <div>
              <label className="label">GitHub Repository URL *</label>
              <input
                type="url"
                required
                className="input"
                placeholder="https://github.com/owner/repository"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>
          )}

          {activeTab === 'zip' && (
            <div>
              <label className="label">Upload Project ZIP File *</label>
              <input
                type="file"
                required
                accept=".zip"
                className="input file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-indigo-600 file:text-white file:cursor-pointer"
                onChange={(e) => setZipFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          {activeTab === 'url' && (
            <div>
              <label className="label">Live Website URL *</label>
              <input
                type="url"
                required
                className="input"
                placeholder="https://your-project.vercel.app"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="label">Claimed Skills (comma-separated)</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. React, TypeScript, Python, PostgreSQL"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Skills will be independently audited against codebase evidence.
            </p>
          </div>

          <div>
            <label className="label">Project Description (optional)</label>
            <textarea
              rows={2}
              className="input"
              placeholder="Summary of what the project does and key architecture details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-300" />
                  Running 12-Agent Verification…
                </>
              ) : (
                <>
                  Launch Verification
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
