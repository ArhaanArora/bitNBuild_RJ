import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { ShieldAlert, Users, Search, RefreshCw, KeyRound, CheckCircle } from 'lucide-react';

export const AdminUsersRBACView: React.FC = () => {
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUserList(res.data?.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await api.post(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update user role');
    }
  };

  const filtered = userList.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.publicId?.toLowerCase().includes(search.toLowerCase()) ||
    (u.firstName && u.firstName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Users & Role-Based Access Control (RBAC)</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
              Privileged Governance
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Assign user permissions, elevate administrative roles, and inspect cryptographic session identifiers.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by user email, public ID, name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Name / Identity</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Account Created</th>
                <th className="py-3 px-4">Active System Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-800/30 transition">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                    {u.publicId || u.id.substring(0, 8)}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : 'Registered User'}
                  </td>
                  <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-4 text-gray-500 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={e => handleChangeRole(u.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-gray-950 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500 capitalize"
                    >
                      <option value="candidate">Candidate</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="organizer">Organizer</option>
                      <option value="admin">Super Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
