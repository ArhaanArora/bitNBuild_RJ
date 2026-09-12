import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Mail, Send, CheckCircle, Clock, AlertCircle, RefreshCw, MessageSquare, Bot, User, Filter } from 'lucide-react';

export const AdminInboxView: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/inbox?category=${categoryFilter}&status=${statusFilter}`);
      setMessages(res.data?.messages || []);
    } catch (err) {
      console.error('Failed to load inbox messages:', err);
      toast.error('Failed to load inbox messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [categoryFilter, statusFilter]);

  const handleSelect = (msg: any) => {
    setSelectedMessage(msg);
    setReplyText(msg.aiSuggestedResponse || '');
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    try {
      await api.post(`/admin/inbox/${selectedMessage.id}/reply`, { responseText: replyText });
      toast.success('Reply dispatched to recipient and logged');
      setSelectedMessage(null);
      setReplyText('');
      loadMessages();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to dispatch reply');
    }
  };

  const handleUpdateStatus = async (msgId: string, status: string) => {
    try {
      await api.put(`/admin/inbox/${msgId}/status`, { status });
      toast.success(`Message marked as ${status}`);
      loadMessages();
      if (selectedMessage?.id === msgId) {
        setSelectedMessage((prev: any) => ({ ...prev, status }));
      }
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white">Unified Inquiries & Communications Inbox</h2>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold font-mono">
              MSG-2026 Triaged
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Incoming candidate appeals, recruiter enterprise requests, automated AI triage, and human response authorization.
          </p>
        </div>

        <button
          onClick={loadMessages}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/40 p-3 rounded-2xl border border-gray-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-medium">Category:</span>
          {['ALL', 'RECRUITER', 'CANDIDATE', 'ORGANIZER', 'SUPPORT'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                categoryFilter === cat ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-medium">Status:</span>
          {['ALL', 'NEW', 'IN_REVIEW', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                statusFilter === st ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-5 space-y-2.5">
          {messages.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center text-xs text-gray-500">
              No matching messages in this filter.
            </div>
          ) : (
            messages.map(m => (
              <div
                key={m.id}
                onClick={() => handleSelect(m)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  selectedMessage?.id === m.id
                    ? 'bg-gray-900 border-rose-500/60 shadow-lg shadow-rose-500/5'
                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-rose-400">{m.publicId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      m.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {m.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">{m.subject}</h4>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{m.body}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="text-gray-300 font-medium">{m.senderName}</span>
                  <span className="capitalize text-gray-400">{m.status.toLowerCase().replace('_', ' ')}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Details & AI Reply Composer */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-gray-800 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-rose-400">{selectedMessage.publicId}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedMessage.subject}</h3>
                  <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                    <span className="text-white font-medium">{selectedMessage.senderName}</span>
                    <span>&lt;{selectedMessage.senderEmail}&gt;</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedMessage.status}
                    onChange={e => handleUpdateStatus(selectedMessage.id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-gray-950 border border-gray-700 text-xs text-white focus:outline-none"
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_REVIEW">IN REVIEW</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              {/* Inquiry Body */}
              <div className="bg-gray-950/70 rounded-xl p-4 border border-gray-800 text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.body}
              </div>

              {/* AI Triage Analysis */}
              {selectedMessage.aiTriageNotes && (
                <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3.5 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold uppercase text-[10px] tracking-wider">
                    <Bot className="w-3.5 h-3.5" />
                    AI Triage Insights
                  </div>
                  <div className="text-[11px] text-gray-300 grid grid-cols-2 gap-2 mt-1">
                    <div>Urgency: <strong className="text-white">{selectedMessage.aiTriageNotes.urgency}</strong></div>
                    <div>Intent: <strong className="text-white">{selectedMessage.aiTriageNotes.intent || 'User Inquiry'}</strong></div>
                    <div>Confidence: <strong className="text-white">{Math.round((selectedMessage.aiTriageNotes.confidence || 0.95) * 100)}%</strong></div>
                  </div>
                </div>
              )}

              {/* Response Draft Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    Response Composer (AI Drafted / Human Authorized)
                  </label>
                  <span className="text-[10px] text-emerald-400 font-medium">Ready for Dispatch</span>
                </div>
                <textarea
                  rows={6}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Draft response to sender..."
                  className="w-full p-3.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <span className="text-[11px] text-gray-500">Recipients will receive response via verified email</span>
                <button
                  onClick={handleSendReply}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  Approve & Dispatch Response
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-900/40 border border-gray-800 rounded-2xl p-8 text-center text-gray-500">
              <Mail className="w-12 h-12 text-gray-700 mb-2" />
              <p className="text-sm font-medium">Select a message from the queue to inspect and author response.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
