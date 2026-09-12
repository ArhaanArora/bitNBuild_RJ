import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Database, Plus, Search, Filter, RefreshCw, Tag, CheckCircle } from 'lucide-react';

export const AdminSkillsTaxonomyView: React.FC = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Skill Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Programming');
  const [aliases, setAliases] = useState('');
  const [description, setDescription] = useState('');

  const loadSkills = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/skills');
      setSkills(res.data?.skills || []);
    } catch (err) {
      console.error('Failed to load skills:', err);
      toast.error('Failed to load canonical skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      const aliasArray = aliases
        .split(',')
        .map(a => a.trim().toLowerCase())
        .filter(Boolean);

      await api.post('/admin/skills', {
        name,
        category,
        aliases: aliasArray,
        description,
      });

      toast.success('Canonical skill registered');
      setShowAddModal(false);
      setName('');
      setAliases('');
      setDescription('');
      loadSkills();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create skill');
    }
  };

  const categories = Array.from(new Set(skills.map(s => s.category).filter(Boolean)));

  const filtered = skills.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = s.name?.toLowerCase().includes(q) || s.slug?.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Canonical Skills Taxonomy</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold font-mono">
              Single Source of Truth
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Standardized skills taxonomy, aliases mapping, and vector search dictionary for candidate assessments.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Canonical Skill
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-gray-900/40 p-3 rounded-2xl border border-gray-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search canonical skill or slug..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between hover:border-indigo-500/30 transition">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-white text-sm">{s.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-800 text-indigo-300">
                  {s.category}
                </span>
              </div>
              <span className="text-[11px] font-mono text-gray-500 mt-0.5 block">{s.slug}</span>

              {s.description && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{s.description}</p>
              )}

              {s.aliases && s.aliases.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-800/80 flex flex-wrap gap-1">
                  {s.aliases.map((al: string, idx: number) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-950 border border-gray-800 text-gray-400">
                      {al}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-gray-800 text-[10px] text-gray-500 flex items-center justify-between">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Active Taxonomy
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add Canonical Skill</h3>
            <p className="text-xs text-gray-400 mb-4">Register an authoritative skill in the platform taxonomy.</p>

            <form onSubmit={handleCreateSkill} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Next.js"
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Programming">Programming</option>
                  <option value="Framework">Framework</option>
                  <option value="Cloud / DevOps">Cloud / DevOps</option>
                  <option value="Database">Database</option>
                  <option value="AI / ML">AI / ML</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Web3">Web3</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Aliases (comma-separated)</label>
                <input
                  type="text"
                  value={aliases}
                  onChange={e => setAliases(e.target.value)}
                  placeholder="nextjs, next.js, next 14"
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Official React framework for the web..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                >
                  Register Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
