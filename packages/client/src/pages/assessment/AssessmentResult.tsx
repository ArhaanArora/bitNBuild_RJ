import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

interface Result {
  session: { technicalScore: number; knowledgeScore: number; practicalScore: number; explanationScore: number; integrityScore: number; submittedAt: string; };
  integrityBreakdown: {
    tabSwitches: number; fullscreenExits: number; copyAttempts: number; pasteAttempts: number;
    fastResponseFlags: number; cameraChecks: { total: number; passed: number }; roughWorkSubmitted: boolean;
  };
  responses: { questionId: string; isCorrect: boolean | null; pointsAwarded: number; timeSpentMs: number; flaggedFast: boolean; }[];
}

function ScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-4xl font-bold ${color}`}>{Math.round(score)}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
      <div className="score-bar mt-2"><div className={`score-fill ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} /></div>
    </div>
  );
}

function IntegritySignal({ label, value, bad }: { label: string; value: number | boolean | string; bad: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${bad ? 'text-red-400' : 'text-emerald-400'}`}>{String(value)}</span>
    </div>
  );
}

export default function AssessmentResult() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    api.get(`/sessions/${sessionId}/result`).then(r => setResult(r.data)).catch(() => {});
  }, [sessionId]);

  if (!result) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  const { session, integrityBreakdown } = result;
  const radarData = [
    { subject: 'Knowledge', value: session.knowledgeScore ?? 0 },
    { subject: 'Practical', value: session.practicalScore ?? 0 },
    { subject: 'Explanation', value: session.explanationScore ?? 0 },
    { subject: 'Integrity', value: session.integrityScore ?? 0 },
  ];

  const status = session.technicalScore >= 80 ? { label: 'VERIFIED', color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-700' }
    : session.technicalScore >= 60 ? { label: 'VERIFIED (Fair)', color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-700' }
    : { label: 'NOT VERIFIED', color: 'text-red-400', bg: 'bg-red-900/20 border-red-700' };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6 fade-in-up">
        {/* Status hero */}
        <div className={`card border text-center py-8 ${status.bg}`}>
          <p className="text-sm text-gray-400 mb-2">Skill Verification Result</p>
          <div className={`text-3xl font-bold ${status.color} mb-4`}>{status.label}</div>
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <ScoreGauge score={session.technicalScore} label="Technical Score" color="text-indigo-400" />
            <ScoreGauge score={session.integrityScore} label="Integrity Score" color="text-emerald-400" />
          </div>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="section-title">Score Breakdown</h3>
            <div className="space-y-3">
              {session.knowledgeScore != null && <ScoreGauge score={session.knowledgeScore} label="Knowledge (MCQ) × 35%" color="text-blue-400" />}
              {session.practicalScore != null && <ScoreGauge score={session.practicalScore} label="Practical × 40%" color="text-purple-400" />}
              {session.explanationScore != null && <ScoreGauge score={session.explanationScore} label="Explanation × 25%" color="text-pink-400" />}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Skill Radar</h3>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Integrity signals */}
        <div className="card">
          <h3 className="section-title">Integrity Signals</h3>
          <p className="text-xs text-gray-500 mb-4">These are behavioral signals, not cheating verdicts. They contribute to the integrity score.</p>
          <IntegritySignal label="Tab switches" value={integrityBreakdown.tabSwitches} bad={integrityBreakdown.tabSwitches > 0} />
          <IntegritySignal label="Fullscreen exits" value={integrityBreakdown.fullscreenExits} bad={integrityBreakdown.fullscreenExits > 0} />
          <IntegritySignal label="Copy/paste attempts" value={integrityBreakdown.copyAttempts + integrityBreakdown.pasteAttempts} bad={integrityBreakdown.copyAttempts + integrityBreakdown.pasteAttempts > 0} />
          <IntegritySignal label="Unusually fast responses" value={integrityBreakdown.fastResponseFlags} bad={integrityBreakdown.fastResponseFlags > 2} />
          <IntegritySignal label={`Camera checks (${integrityBreakdown.cameraChecks.passed}/${integrityBreakdown.cameraChecks.total} passed)`} value={integrityBreakdown.cameraChecks.passed === integrityBreakdown.cameraChecks.total ? '✓ All passed' : `${integrityBreakdown.cameraChecks.total - integrityBreakdown.cameraChecks.passed} missed`} bad={integrityBreakdown.cameraChecks.passed < integrityBreakdown.cameraChecks.total} />
          <IntegritySignal label="Rough work submitted" value={integrityBreakdown.roughWorkSubmitted ? 'Yes' : 'No'} bad={!integrityBreakdown.roughWorkSubmitted} />
        </div>

        {/* Evidence checklist */}
        <div className="card">
          <h3 className="section-title">Evidence Checklist</h3>
          {[
            { label: 'Assessment completed', done: true },
            { label: 'MCQ questions answered', done: result.responses.some(r => r.isCorrect !== null) },
            { label: 'Practical challenge attempted', done: result.responses.some(r => r.pointsAwarded > 0) },
            { label: 'Camera checks responded', done: integrityBreakdown.cameraChecks.total > 0 },
            { label: 'Rough work submitted', done: integrityBreakdown.roughWorkSubmitted },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-3 py-2 border-b border-gray-700 last:border-0">
              <span className={done ? 'text-emerald-400' : 'text-gray-600'}>{done ? '✓' : '○'}</span>
              <span className={`text-sm ${done ? 'text-gray-200' : 'text-gray-500'}`}>{label}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Link to="/dashboard" className="btn-ghost flex-1 justify-center">← Dashboard</Link>
          <Link to="/skills" className="btn-primary flex-1 justify-center">View Skills →</Link>
        </div>
      </div>
    </div>
  );
}
