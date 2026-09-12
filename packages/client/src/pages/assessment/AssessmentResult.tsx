import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

interface Result {
  session: {
    technicalScore: number;
    knowledgeScore: number;
    practicalScore: number;
    explanationScore: number;
    integrityScore: number;
    submittedAt: string;
  };
  integrityBreakdown: {
    tabSwitches: number;
    fullscreenExits: number;
    copyAttempts: number;
    pasteAttempts: number;
    fastResponseFlags: number;
    cameraChecks: { total: number; passed: number };
    roughWorkSubmitted: boolean;
  };
  responses: {
    questionId: string;
    isCorrect: boolean | null;
    pointsAwarded: number;
    timeSpentMs: number;
    flaggedFast: boolean;
  }[];
}

function ScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="text-center p-3 rounded-lg bg-[#1E1E22] border border-[#2A2A2E]">
      <div className={`text-3xl font-bold font-mono ${color}`}>{Math.round(score)}</div>
      <div className="text-xs text-[#6B6B70] font-mono mt-1 uppercase">{label}</div>
      <div className="h-1.5 bg-[#17171A] rounded-full overflow-hidden mt-2.5">
        <div
          className={`h-full ${score >= 80 ? 'bg-[#3FB65F]' : score >= 60 ? 'bg-[#D89A3E]' : 'bg-[#E0554E]'}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function IntegritySignal({ label, value, bad }: { label: string; value: number | boolean | string; bad: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#2A2A2E] last:border-0 font-mono text-xs">
      <span className="text-[#A3A3A8]">{label}</span>
      <span className={`font-semibold ${bad ? 'text-[#E0554E]' : 'text-[#3FB65F]'}`}>{String(value)}</span>
    </div>
  );
}

export default function AssessmentResult() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    api.get(`/sessions/${sessionId}/result`).then(r => setResult(r.data)).catch(() => {});
  }, [sessionId]);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#E8672E] border-t-transparent rounded-full" />
      </div>
    );
  }

  const { session, integrityBreakdown } = result;
  const radarData = [
    { subject: 'Knowledge', value: session.knowledgeScore ?? 0 },
    { subject: 'Practical', value: session.practicalScore ?? 0 },
    { subject: 'Explanation', value: session.explanationScore ?? 0 },
    { subject: 'Integrity', value: session.integrityScore ?? 0 },
  ];

  const status =
    session.technicalScore >= 80
      ? { label: 'VERIFIED', color: 'text-[#3FB65F]', bg: 'bg-[#16261B] border-[#3FB65F]/30' }
      : session.technicalScore >= 60
      ? { label: 'PARTIALLY VERIFIED', color: 'text-[#D89A3E]', bg: 'bg-[#2B2213] border-[#D89A3E]/30' }
      : { label: 'NOT VERIFIED', color: 'text-[#E0554E]', bg: 'bg-[#2A1717] border-[#E0554E]/30' };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Status hero */}
        <div className={`border rounded-xl text-center py-8 px-6 ${status.bg}`}>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A3A3A8] block mb-1">
            SKILL VERIFICATION ASSESSMENT REPORT
          </span>
          <div className={`text-3xl font-bold font-mono ${status.color} mb-6 tracking-wide`}>
            {status.label}
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <ScoreGauge score={session.technicalScore} label="Technical Score" color="text-[#F5F5F4]" />
            <ScoreGauge score={session.integrityScore} label="Integrity Score" color="text-[#3FB65F]" />
          </div>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-mono uppercase text-[#6B6B70] tracking-wider mb-2">Score Components</h3>
            <div className="space-y-3">
              {session.knowledgeScore != null && (
                <ScoreGauge score={session.knowledgeScore} label="Knowledge (MCQ) × 35%" color="text-[#F5F5F4]" />
              )}
              {session.practicalScore != null && (
                <ScoreGauge score={session.practicalScore} label="Practical × 40%" color="text-[#E8672E]" />
              )}
              {session.explanationScore != null && (
                <ScoreGauge score={session.explanationScore} label="Explanation × 25%" color="text-[#F5F5F4]" />
              )}
            </div>
          </div>

          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5 flex flex-col justify-between">
            <h3 className="text-xs font-mono uppercase text-[#6B6B70] tracking-wider mb-2">Skill Polygon</h3>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2A2A2E" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#A3A3A8', fontSize: 11 }} />
                  <Radar name="Score" dataKey="value" stroke="#E8672E" fill="#E8672E" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Integrity signals */}
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5">
          <h3 className="text-xs font-mono uppercase text-[#6B6B70] tracking-wider mb-1">Integrity Signals</h3>
          <p className="text-xs text-[#A3A3A8] mb-4">
            Behavioral signals audited during proctoring session. Contributes to candidate credibility index.
          </p>
          <div className="divide-y divide-[#2A2A2E]">
            <IntegritySignal label="Tab switches" value={integrityBreakdown.tabSwitches} bad={integrityBreakdown.tabSwitches > 0} />
            <IntegritySignal label="Fullscreen exits" value={integrityBreakdown.fullscreenExits} bad={integrityBreakdown.fullscreenExits > 0} />
            <IntegritySignal label="Copy/paste attempts" value={integrityBreakdown.copyAttempts + integrityBreakdown.pasteAttempts} bad={integrityBreakdown.copyAttempts + integrityBreakdown.pasteAttempts > 0} />
            <IntegritySignal label="Fast response flags" value={integrityBreakdown.fastResponseFlags} bad={integrityBreakdown.fastResponseFlags > 2} />
            <IntegritySignal
              label={`Camera checks (${integrityBreakdown.cameraChecks.passed}/${integrityBreakdown.cameraChecks.total} passed)`}
              value={integrityBreakdown.cameraChecks.passed === integrityBreakdown.cameraChecks.total ? '✓ All passed' : `${integrityBreakdown.cameraChecks.total - integrityBreakdown.cameraChecks.passed} missed`}
              bad={integrityBreakdown.cameraChecks.passed < integrityBreakdown.cameraChecks.total}
            />
            <IntegritySignal label="Rough work submitted" value={integrityBreakdown.roughWorkSubmitted ? 'Yes' : 'No'} bad={!integrityBreakdown.roughWorkSubmitted} />
          </div>
        </div>

        {/* Evidence checklist */}
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5">
          <h3 className="text-xs font-mono uppercase text-[#6B6B70] tracking-wider mb-3">Evidence Records</h3>
          <div className="space-y-2">
            {[
              { label: 'Proctored session successfully completed', done: true },
              { label: 'MCQ questions answered and validated', done: result.responses.some(r => r.isCorrect !== null) },
              { label: 'Practical challenge executed with test runner', done: result.responses.some(r => r.pointsAwarded > 0) },
              { label: 'Camera challenge prompts responded', done: integrityBreakdown.cameraChecks.total > 0 },
              { label: 'Supporting rough work notes archived', done: integrityBreakdown.roughWorkSubmitted },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-b border-[#2A2A2E] last:border-0 text-xs">
                <span className={done ? 'text-[#3FB65F]' : 'text-[#6B6B70]'}>{done ? '✓' : '○'}</span>
                <span className={done ? 'text-[#F5F5F4]' : 'text-[#6B6B70]'}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          <Link to="/dashboard" className="btn-secondary text-xs flex-1 justify-center py-2.5">
            ← Back to Dashboard
          </Link>
          <Link to="/skills" className="btn-primary text-xs flex-1 justify-center py-2.5">
            View Verified Skills →
          </Link>
        </div>
      </div>
    </div>
  );
}
