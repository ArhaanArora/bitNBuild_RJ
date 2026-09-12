import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { ProjectVerificationReport, ConstellationNode, Finding } from '../../types/analysis';
import TrustConstellation from '../../scenes/TrustConstellation';
import EvidenceShell from '../../scenes/EvidenceShell';
import AccessibleViewToggle from '../../scenes/AccessibleViewToggle';
import {
  ShieldCheck,
  AlertTriangle,
  Award,
  Layers,
  FileText,
  ExternalLink,
  Code2,
  CheckCircle2,
  Info,
  ChevronRight,
  Share2,
} from 'lucide-react';

export default function ProjectReportPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ProjectVerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [is3D, setIs3D] = useState(true);
  const [selectedNode, setSelectedNode] = useState<ConstellationNode | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(id ? `/analysis/${id}/report` : '/analysis/sample');
        setReport(res.data);
      } catch (err) {
        console.error('Failed to load report, loading sample:', err);
        const sampleRes = await api.get('/analysis/sample');
        setReport(sampleRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading || !report) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-gray-400">Loading 3D Trust Constellation…</p>
      </div>
    );
  }

  const { breakdown, constellation, agents, projectSummary } = report;

  // Findings for the selected node in Evidence Shell
  const selectedNodeFindings = selectedNode
    ? agents.find((a) => a.agentId === selectedNode.agentId)?.findings || []
    : [];

  return (
    <div className="space-y-8 fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
              {breakdown.verificationBadge.replace('_', ' ')}
            </span>
            <span className="text-xs font-mono text-gray-500">ID: {report.verificationCode}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {report.projectName}
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">{projectSummary.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <AccessibleViewToggle is3D={is3D} onToggle={setIs3D} />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Verification report link copied!');
            }}
            className="btn-ghost flex items-center gap-1.5 text-xs py-2"
            title="Share Verification Profile"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ─── PRIMARY VISUALIZATION: 3D Constellation vs 2D Flat Scorecard ─── */}
      {is3D ? (
        <div className="space-y-3">
          {selectedNode ? (
            <EvidenceShell
              node={selectedNode}
              findings={selectedNodeFindings}
              onClose={() => setSelectedNode(null)}
            />
          ) : (
            <TrustConstellation
              sceneData={constellation}
              selectedNodeId={undefined}
              onSelectNode={(node) => {
                if (node.role === 'satellite') setSelectedNode(node);
              }}
            />
          )}
        </div>
      ) : (
        /* Accessible 2D Flat View */
        <div className="card space-y-6 border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-xl bg-gradient-to-r from-gray-900 to-gray-950 border border-gray-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
                Overall Trust Score
              </span>
              <div className="text-5xl font-extrabold font-mono text-emerald-400 mt-1">
                {breakdown.overallScore}
                <span className="text-xl text-gray-500 font-normal"> / 100</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Overall Confidence: <strong className="text-white">{breakdown.overallConfidence}%</strong> ·{' '}
                {breakdown.humanReviewRecommended ? 'Human review recommended' : 'Verified autonomously'}
              </p>
            </div>

            {/* Risk Counts Pill Matrix */}
            <div className="flex gap-2">
              <div className="px-3 py-2 rounded-lg bg-rose-950/40 border border-rose-800 text-center">
                <span className="block text-lg font-bold text-rose-400">{breakdown.riskSummary.critical}</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase">Critical</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-800 text-center">
                <span className="block text-lg font-bold text-amber-400">{breakdown.riskSummary.medium}</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase">Medium</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-800 text-center">
                <span className="block text-lg font-bold text-emerald-400">{breakdown.riskSummary.info}</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase">Passed</span>
              </div>
            </div>
          </div>

          {/* Accessible Table of 11 Agents */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Findings</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-300">
                {agents.map((agent) => (
                  <tr key={agent.agentId} className="hover:bg-gray-900/50 transition">
                    <td className="py-2.5 px-3 font-semibold text-white">{agent.name}</td>
                    <td className="py-2.5 px-3 text-gray-400">{agent.weight} pts</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">{agent.score}%</td>
                    <td className="py-2.5 px-3">{agent.confidence}%</td>
                    <td className="py-2.5 px-3">{agent.findings.length} findings</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px]">
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── AI ASSISTANCE ASSESSMENT BANNER (Section 11/34 Requirement) ─── */}
      <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/30 font-semibold uppercase">
              AI Assistance Assessment: {breakdown.aiAssistanceLikelihood}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Score: {breakdown.aiAssistanceScore} / 5 pts
            </span>
          </div>
          <p className="text-xs text-gray-400 max-w-3xl leading-relaxed">
            * <em>AI detection is probabilistic and cannot reliably prove who wrote code. The platform therefore evaluates multiple independent signals (AST entropy, commit cadence, architectural consistency) instead of making definitive authorship claims.</em>
          </p>
        </div>
        <div className="text-xs font-mono text-gray-500 shrink-0">
          Method: Multi-Signal Heuristics
        </div>
      </div>

      {/* ─── 10-CATEGORY SCORE BREAKDOWN MATRIX ─── */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Verification Scorecard Breakdown (100 Pts Max)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Code Quality', score: breakdown.codeQualityScore, max: 15, agent: 'CODE_QUALITY' },
            { label: 'Functionality', score: breakdown.functionalityScore, max: 15, agent: 'QA' },
            { label: 'Security', score: breakdown.securityScore, max: 15, agent: 'SECURITY' },
            { label: 'Skill Verification', score: breakdown.skillVerificationScore, max: 15, agent: 'SKILLS' },
            { label: 'Architecture', score: breakdown.architectureScore, max: 10, agent: 'ARCHITECTURE' },
            { label: 'Documentation', score: breakdown.documentationScore, max: 10, agent: 'DOCUMENTATION' },
            { label: 'Claim Consistency', score: breakdown.claimConsistencyScore, max: 10, agent: 'CLAIM_CONSISTENCY' },
            { label: 'Development Evidence', score: breakdown.authorshipScore, max: 5, agent: 'AUTHORSHIP' },
            { label: 'AI Assistance', score: breakdown.aiAssistanceScore, max: 5, agent: 'AI_ASSISTANCE' },
          ].map((item) => (
            <div key={item.label} className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
              <span className="text-[11px] text-gray-400 block truncate">{item.label}</span>
              <div className="text-lg font-mono font-bold text-white flex items-baseline gap-1">
                <span className="text-emerald-400">{item.score}</span>
                <span className="text-xs text-gray-500 font-normal">/ {item.max}</span>
              </div>
              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── DETAILED FINDINGS & EVIDENCE REPOSITORY ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Evidence &amp; Verification Findings</h3>
          <span className="text-xs font-mono text-gray-500">
            {agents.flatMap((a) => a.findings).length} Total Evidence Artifacts
          </span>
        </div>

        <div className="space-y-3">
          {agents.flatMap((a) => a.findings).map((finding) => (
            <div
              key={finding.id}
              className="p-4 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-gray-700 transition space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      finding.risk === 'CRITICAL' || finding.risk === 'HIGH'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : finding.risk === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {finding.risk}
                  </span>
                  <h4 className="text-sm font-semibold text-white">{finding.title}</h4>
                </div>
                <span className="text-xs font-mono text-gray-400">
                  Confidence: <strong className="text-white">{finding.confidence}%</strong>
                </span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">{finding.reasoning}</p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-gray-500 pt-1 border-t border-gray-800/60">
                <span>Location: <code className="text-indigo-400">{finding.location}</code></span>
                <span>Detection: {finding.detectionMethod}</span>
              </div>

              {finding.recommendation && (
                <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
                  <strong>Recommendation:</strong> {finding.recommendation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
