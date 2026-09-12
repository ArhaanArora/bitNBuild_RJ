import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Globe, History, RotateCcw, Save, Eye, RefreshCw, CheckCircle, FileText } from 'lucide-react';

export const AdminCMSView: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('home');
  const [activePage, setActivePage] = useState<any | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [jsonText, setJsonText] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/cms/pages');
      const pageList = res.data?.pages || [];
      setPages(pageList);
      if (pageList.length > 0 && !selectedSlug) {
        setSelectedSlug(pageList[0].slug);
      }
    } catch (err) {
      console.error('Failed to load CMS pages:', err);
      toast.error('Failed to load CMS pages');
    } finally {
      setLoading(false);
    }
  };

  const loadPageDetails = async (slug: string) => {
    try {
      const res = await api.get(`/admin/cms/pages/${slug}`);
      setActivePage(res.data?.page);
      setVersions(res.data?.versions || []);
      setJsonText(JSON.stringify(res.data?.page?.content || {}, null, 2));
    } catch (err) {
      console.error('Failed to load page details:', err);
      toast.error('Failed to load page details');
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      loadPageDetails(selectedSlug);
    }
  }, [selectedSlug]);

  const handlePublish = async () => {
    try {
      const parsedContent = JSON.parse(jsonText);
      await api.post(`/admin/cms/pages/${selectedSlug}/publish`, {
        content: parsedContent,
        summary: changeSummary || 'Published via Super Admin CMS',
      });
      toast.success(`Published new version for ${selectedSlug}`);
      setChangeSummary('');
      loadPageDetails(selectedSlug);
    } catch (err: any) {
      toast.error(err.message || 'Invalid JSON content or publish failed');
    }
  };

  const handleRollback = async (targetVersion: number) => {
    try {
      await api.post(`/admin/cms/pages/${selectedSlug}/rollback`, { targetVersion });
      toast.success(`Rolled back to version v${targetVersion}`);
      loadPageDetails(selectedSlug);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Rollback failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Website CMS & Public Synchronization</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold font-mono">
              Live Edge Sync
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Edit public marketing copy, announcements, FAQs, track version diffs, and perform atomic rollbacks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            Live Preview
          </button>
          <button
            onClick={handlePublish}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition shadow-lg"
          >
            <Save className="w-3.5 h-3.5" />
            Publish Version
          </button>
        </div>
      </div>

      {/* Pages Switcher Bar */}
      <div className="flex items-center gap-2 bg-gray-900/40 p-2 rounded-xl border border-gray-800 text-xs overflow-x-auto">
        {pages.map(p => (
          <button
            key={p.slug}
            onClick={() => setSelectedSlug(p.slug)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              selectedSlug === p.slug ? 'bg-cyan-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="capitalize">{p.slug}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">
              v{p.publishedVersion}
            </span>
          </button>
        ))}
      </div>

      {/* Editor & Version History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* JSON Editor */}
        <div className="lg:col-span-8 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Content Schema Editor</h3>
              <p className="text-xs text-gray-400">Structured JSON payload served directly to public visitors.</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Valid JSON
            </span>
          </div>

          <textarea
            rows={16}
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            className="w-full p-4 rounded-xl bg-gray-950 border border-gray-800 text-xs text-cyan-300 font-mono leading-relaxed focus:outline-none focus:border-cyan-500 shadow-inner"
          />

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Audit Change Summary (optional)</label>
            <input
              type="text"
              value={changeSummary}
              onChange={e => setChangeSummary(e.target.value)}
              placeholder="e.g. Updated BitNBuild prize pool and principal partner banner..."
              className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Version History */}
        <div className="lg:col-span-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <History className="w-4 h-4 text-cyan-400" />
              Version History
            </h3>
            <span className="text-xs text-gray-400 font-mono">{versions.length} versions</span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {versions.map(v => (
              <div key={v.id} className="p-3 rounded-xl bg-gray-950/70 border border-gray-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-400">Version v{v.versionNumber}</span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(v.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">{v.changeSummary || 'Production publish'}</p>
                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => handleRollback(v.versionNumber)}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-cyan-300 transition font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Rollback
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Live Public API Preview: /api/public/cms/{selectedSlug}</h3>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-gray-950 rounded-xl p-4 border border-gray-800 max-h-96 overflow-y-auto">
              <pre className="text-xs font-mono text-cyan-300 whitespace-pre-wrap">
                {jsonText}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
