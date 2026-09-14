import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import {
  ShieldCheck, Download, Trash2, FileText, AlertTriangle,
  CheckCircle, Lock, RefreshCw, User
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ConfirmEraseModal {
  userId: string;
  email: string;
}

export const AdminComplianceView: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [eraseModal, setEraseModal] = useState<ConfirmEraseModal | null>(null);
  const [eraseReason, setEraseReason] = useState('');
  const [eraseConfirmText, setEraseConfirmText] = useState('');
  const [erasing, setErasing] = useState(false);
  const [exportUserId, setExportUserId] = useState('');
  const [exporting, setExporting] = useState(false);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDataProcessingRecords();
      setRecords(res.records);
    } catch {
      toast.error('Failed to load data processing records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecords(); }, []);

  const handleExport = async () => {
    if (!exportUserId.trim()) { toast.error('Enter a User ID'); return; }
    setExporting(true);
    try {
      const data = await adminService.exportUserDataGDPR(exportUserId.trim());
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `user-data-export-${exportUserId}.json`; a.click();
      URL.revokeObjectURL(url);
      toast.success('User data exported');
    } catch {
      toast.error('Failed to export user data — check User ID');
    } finally {
      setExporting(false);
    }
  };

  const handleErase = async () => {
    if (!eraseModal) return;
    if (eraseConfirmText !== 'ERASE') { toast.error('Type ERASE to confirm'); return; }
    if (!eraseReason.trim()) { toast.error('Reason required'); return; }
    setErasing(true);
    try {
      const res = await adminService.eraseUserDataGDPR(eraseModal.userId, eraseReason);
      toast.success(res.message);
      setEraseModal(null); setEraseReason(''); setEraseConfirmText('');
    } catch {
      toast.error('Failed to erase user data');
    } finally {
      setErasing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F5F5F4]">Compliance & Privacy</h1>
          <p className="text-xs text-[#6B6B70] mt-0.5 font-mono">GDPR/CCPA data rights, processing records, and erasure workflows</p>
        </div>
        <button onClick={loadRecords} aria-label="Refresh compliance records" className="p-1.5 rounded-lg bg-[#17171A] border border-[#2A2A2E] text-[#A3A3A8] hover:text-[#F5F5F4] transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* GDPR Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Right to Access / Export */}
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-4 h-4 text-[#3FB65F]" />
            <h3 className="text-sm font-semibold text-[#F5F5F4]">Right to Access — Data Export</h3>
          </div>
          <p className="text-xs text-[#6B6B70] mb-4 leading-relaxed">
            Generate a machine-readable export of all personal data held for a specific user. Download is logged in the audit trail.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter User UUID..."
              value={exportUserId}
              onChange={(e) => setExportUserId(e.target.value)}
              aria-label="User ID for export"
              className="flex-1 px-3 py-2 bg-[#1E1E22] border border-[#2A2A2E] rounded-lg text-xs text-[#F5F5F4] font-mono placeholder-[#4A4A50] focus:outline-none focus:border-[#3FB65F]"
            />
            <button
              onClick={handleExport}
              disabled={exporting}
              aria-label="Export user data"
              className="px-3 py-2 rounded-lg bg-[#16261B] border border-[#3FB65F]/40 text-[#3FB65F] text-xs font-mono font-medium hover:bg-[#3FB65F]/20 disabled:opacity-50 transition-colors"
            >
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Right to Erasure */}
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-4 h-4 text-[#E0554E]" />
            <h3 className="text-sm font-semibold text-[#F5F5F4]">Right to Erasure — PII Deletion</h3>
          </div>
          <p className="text-xs text-[#6B6B70] mb-4 leading-relaxed">
            Anonymizes user PII while preserving anonymized audit records per legal obligation. This action is <span className="text-[#E0554E] font-semibold">irreversible</span>.
          </p>
          <div className="bg-[#2A1717] border border-[#E0554E]/20 rounded-lg p-3 text-xs text-[#E0554E] flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Use the erase workflow below only after verifying the user's identity and request validity.</span>
          </div>
          <button
            onClick={() => setEraseModal({ userId: '', email: '' })}
            className="mt-3 px-3 py-2 rounded-lg bg-[#2A1717] border border-[#E0554E]/40 text-[#E0554E] text-xs font-mono font-medium hover:bg-[#E0554E]/10 transition-colors w-full"
          >
            Open Erasure Workflow
          </button>
        </div>
      </div>

      {/* Data Processing Records */}
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2A2A2E] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#E8672E]" />
          <h3 className="text-sm font-semibold text-[#F5F5F4]">Data Processing Records (GDPR Art. 30)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" role="table" aria-label="Data processing records">
            <thead>
              <tr className="border-b border-[#2A2A2E]">
                {['Data Entity', 'Purpose', 'Legal Basis', 'Retention', 'Erasable'].map(h => (
                  <th key={h} scope="col" className="px-4 py-3 text-left font-mono text-[#6B6B70] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className={`border-b border-[#2A2A2E]/50 ${i % 2 === 0 ? '' : 'bg-[#1A1A1D]'}`}>
                  <td className="px-4 py-3 font-medium text-[#F5F5F4]">{r.entity}</td>
                  <td className="px-4 py-3 text-[#A3A3A8]">{r.purpose}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded font-mono bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]">{r.legalBasis}</span>
                  </td>
                  <td className="px-4 py-3 text-[#A3A3A8] font-mono">{r.retention}</td>
                  <td className="px-4 py-3">
                    {r.canErase ? (
                      <span className="flex items-center gap-1 text-[#3FB65F]"><CheckCircle className="w-3 h-3" aria-hidden="true" /><span className="sr-only">Yes — can be erased</span>Yes</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#6B6B70]"><Lock className="w-3 h-3" aria-hidden="true" /><span className="sr-only">No — legally retained</span>Retained</span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && records.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6B6B70] font-mono text-xs">No data processing records available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Erasure Modal */}
      {eraseModal !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6" role="dialog" aria-modal="true" aria-labelledby="erase-modal-title">
          <div className="bg-[#17171A] border border-[#E0554E]/40 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2A1717] border border-[#E0554E]/30 flex items-center justify-center text-[#E0554E]">
                <Trash2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="erase-modal-title" className="text-sm font-bold text-[#F5F5F4]">GDPR Erasure Workflow</h2>
                <p className="text-[11px] text-[#6B6B70]">This action is irreversible and audit-logged</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-[#A3A3A8] mb-1" htmlFor="erase-user-id">User UUID *</label>
                <div className="flex gap-2 items-center">
                  <User className="w-4 h-4 text-[#6B6B70] shrink-0" aria-hidden="true" />
                  <input
                    id="erase-user-id"
                    type="text"
                    placeholder="Paste User UUID..."
                    value={eraseModal.userId}
                    onChange={(e) => setEraseModal({ ...eraseModal, userId: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#1E1E22] border border-[#2A2A2E] rounded-lg text-xs text-[#F5F5F4] font-mono placeholder-[#4A4A50] focus:outline-none focus:border-[#E0554E]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#A3A3A8] mb-1" htmlFor="erase-reason">Erasure Reason * (audit record)</label>
                <textarea
                  id="erase-reason"
                  rows={2}
                  placeholder="e.g. User submitted GDPR erasure request via support@..."
                  value={eraseReason}
                  onChange={(e) => setEraseReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1E1E22] border border-[#2A2A2E] rounded-lg text-xs text-[#F5F5F4] font-mono placeholder-[#4A4A50] focus:outline-none focus:border-[#E0554E] resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#A3A3A8] mb-1" htmlFor="erase-confirm">
                  Type <span className="text-[#E0554E] font-bold">ERASE</span> to confirm *
                </label>
                <input
                  id="erase-confirm"
                  type="text"
                  placeholder="ERASE"
                  value={eraseConfirmText}
                  onChange={(e) => setEraseConfirmText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1E1E22] border border-[#2A2A2E] rounded-lg text-xs text-[#F5F5F4] font-mono placeholder-[#4A4A50] focus:outline-none focus:border-[#E0554E]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setEraseModal(null); setEraseReason(''); setEraseConfirmText(''); }}
                className="flex-1 px-4 py-2 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] text-[#A3A3A8] text-xs font-mono hover:text-[#F5F5F4] transition-colors"
              >Cancel</button>
              <button
                onClick={handleErase}
                disabled={erasing || eraseConfirmText !== 'ERASE' || !eraseModal.userId || !eraseReason.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-[#2A1717] border border-[#E0554E]/40 text-[#E0554E] text-xs font-mono font-semibold hover:bg-[#E0554E]/10 disabled:opacity-40 transition-colors"
              >
                {erasing ? 'Erasing...' : 'Confirm Erasure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
