import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  Building, ShieldCheck, AlertTriangle, Plus, Search, Filter, CheckCircle, XCircle, ExternalLink, Globe, Mail, MapPin 
} from 'lucide-react';

export const AdminOrganizationsView: React.FC = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Org Form
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Enterprise');
  const [newWebsite, setNewWebsite] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const loadOrgs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/organizations?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      setOrganizations(res.data?.organizations || []);
    } catch (err) {
      console.error('Failed to load organizations:', err);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, [statusFilter]);

  const handleApplyDecision = async (orgId: string, decision: 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
    try {
      await api.post(`/admin/organizations/${orgId}/decision`, {
        decision,
        reason: `Super Admin action applied manually`,
      });
      toast.success(`Organization ${decision.toLowerCase()} successfully`);
      loadOrgs();
      if (selectedOrg?.id === orgId) {
        setSelectedOrg(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update organization decision');
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      await api.post('/admin/organizations', {
        name: newName,
        type: newType,
        website: newWebsite,
        contactEmail: newEmail,
        location: newLocation,
      });
      toast.success('Organization registered for vetting');
      setShowAddModal(false);
      setNewName('');
      setNewWebsite('');
      setNewEmail('');
      setNewLocation('');
      loadOrgs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to register organization');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Client Organizations & KYB Vetting</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              Gated Access
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Review corporate entities, domain authenticity, AI verification analysis, and human approval gates.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" />
          Onboard Client Org
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
            onKeyDown={e => e.key === 'Enter' && loadOrgs()}
            placeholder="Search by organization name, public ID (ORG-2026-...), or domain..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending KYB</option>
            <option value="VERIFIED">Verified & Active</option>
            <option value="SUSPICIOUS">Flagged / Suspicious</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Org ID</th>
                <th className="py-3 px-4">Organization Name</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Contact & Location</th>
                <th className="py-3 px-4">Risk Factor</th>
                <th className="py-3 px-4">Vetting Status</th>
                <th className="py-3 px-4 text-right">Human Gate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {organizations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gray-500">
                    No matching client organizations found.
                  </td>
                </tr>
              ) : (
                organizations.map(org => (
                  <tr key={org.id} className="hover:bg-gray-800/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {org.publicId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{org.name}</div>
                      {org.website && (
                        <a 
                          href={org.website} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[11px] text-gray-400 hover:text-indigo-400 flex items-center gap-1 mt-0.5"
                        >
                          <Globe className="w-3 h-3" />
                          {org.website.replace('https://', '')}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-gray-700">
                        {org.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-300 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-500" />
                        {org.contactEmail || 'N/A'}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-600" />
                        {org.location || 'Remote'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              (org.riskScore || 0) < 15 ? 'bg-emerald-400' :
                              (org.riskScore || 0) < 45 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(10, org.riskScore || 0))}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-gray-400">{org.riskScore || 10}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        org.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        org.verificationStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {org.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrg(org)}
                          className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs transition"
                        >
                          Inspect AI
                        </button>
                        {org.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleApplyDecision(org.id, 'APPROVED')}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                          >
                            Approve
                          </button>
                        )}
                        {org.verificationStatus !== 'REVOKED' && (
                          <button
                            onClick={() => handleApplyDecision(org.id, 'REJECTED')}
                            className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs transition"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect AI Notes Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="font-mono text-xs text-amber-400">{selectedOrg.publicId}</span>
                <h3 className="text-base font-bold text-white">{selectedOrg.name}</h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-gray-800 text-gray-300">
                {selectedOrg.type}
              </span>
            </div>

            <div className="bg-gray-950/80 rounded-xl p-4 border border-gray-800 space-y-2 text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block">AI Verification Assistant Signals</span>
              <pre className="text-emerald-400/90 font-mono text-[11px] whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(selectedOrg.aiVerificationNotes, null, 2) || 'No automated signals logged.'}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-400">Human Decision: <strong className="text-white">{selectedOrg.humanDecision}</strong></span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrg(null)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDecision(selectedOrg.id, 'APPROVED')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                >
                  Approve Organization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Org Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Onboard Client Organization</h3>
            <p className="text-xs text-gray-400 mb-4">Register a client enterprise for KYB verification and recruiter access.</p>

            <form onSubmit={handleCreateOrg} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Apex Cloud Systems"
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Classification</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Startup">Startup</option>
                  <option value="Government / Partner">Government / Partner</option>
                  <option value="Agency">Agency</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Official Website</label>
                <input
                  type="url"
                  value={newWebsite}
                  onChange={e => setNewWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Corporate Contact Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="recruiting@company.com"
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Headquarters Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder="e.g. Bangalore, India"
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white focus:outline-none focus:border-amber-500"
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
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition"
                >
                  Submit for Vetting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
