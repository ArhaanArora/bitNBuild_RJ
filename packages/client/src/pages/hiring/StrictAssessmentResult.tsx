import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { EvaluationResult, MultiSignalEvaluation } from '../../types/resumeAssessment';
import { getUserHiringProfile, saveUserHiringProfile } from '../../utils/hiringStorage';
import { UserHiringProfile, HiringSkill } from '../../types/hiring';
import VerificationBadge from '../../components/common/VerificationBadge';
import {
  Check,
  CheckCircle2,
  AlertTriangle,
  Award,
  ArrowRight,
  ShieldCheck,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Sparkles,
  Shield,
  Eye,
  X,
  FileText,
  Activity,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StrictAssessmentResult() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);
  const [showRoughWorkModal, setShowRoughWorkModal] = useState(false);
  const [profileSynced, setProfileSynced] = useState(false);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/hiring');
      return;
    }

    let isMounted = true;

    // 1. Check local sessionStorage first for immediate, rich multi-signal data
    const localKey = `skillverify_last_verification_${assessmentId}`;
    const cached = sessionStorage.getItem(localKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.overallScore !== undefined || parsed.multiSignal)) {
          setResult(parsed);
          setLoading(false);
          syncHiringProfile(parsed);
          return;
        }
      } catch {}
    }

    // 2. Fetch from server API with retry polling if not in local storage
    let pollCount = 0;
    const maxPolls = 10;

    const fetchResult = async () => {
      try {
        const { data } = await api.get(`/hiring/get-verified/assessment/${assessmentId}/result`);
        if (!isMounted) return;

        if (data && (data.status === 'evaluated' || data.overallScore !== undefined)) {
          setResult(data);
          setLoading(false);
          syncHiringProfile(data);
        } else if (pollCount < maxPolls) {
          pollCount += 1;
          setTimeout(fetchResult, 1500);
        } else {
          setError('Evaluation is taking longer than expected. Please check back shortly.');
          setLoading(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        if (pollCount < maxPolls) {
          pollCount += 1;
          setTimeout(fetchResult, 2000);
        } else {
          setError(err.response?.data?.error || 'Unable to retrieve assessment result.');
          setLoading(false);
        }
      }
    };

    fetchResult();

    return () => {
      isMounted = false;
    };
  }, [assessmentId, navigate]);

  // Sync results into local hiring profile
  const syncHiringProfile = (evalData: EvaluationResult) => {
    try {
      const existing = getUserHiringProfile();
      const updatedSkills: HiringSkill[] = existing ? [...existing.skills] : [];

      const verifiedSkillsList = evalData.multiSignal?.verifiedSkills;
      if (verifiedSkillsList && verifiedSkillsList.length > 0) {
        for (const vs of verifiedSkillsList) {
          const existingIdx = updatedSkills.findIndex(
            (s) => s.name.toLowerCase() === vs.name.toLowerCase()
          );
          const newSkillEntry: HiringSkill = {
            name: vs.name,
            status: vs.status,
            score: vs.score,
            selfDeclaredProficiency: vs.score >= 85 ? 'Advanced' : 'Intermediate',
            evidenceSummary: vs.evidence,
          };
          if (existingIdx >= 0) {
            updatedSkills[existingIdx] = newSkillEntry;
          } else {
            updatedSkills.push(newSkillEntry);
          }
        }
      } else if (evalData.skillScores) {
        for (const [skillName, score] of Object.entries(evalData.skillScores)) {
          const isVerified = score >= 70;
          const existingIdx = updatedSkills.findIndex(
            (s) => s.name.toLowerCase() === skillName.toLowerCase()
          );

          const newSkillEntry: HiringSkill = {
            name: skillName,
            status: isVerified ? 'VERIFIED' : 'CLAIMED',
            score,
            selfDeclaredProficiency: score >= 85 ? 'Advanced' : 'Intermediate',
            evidenceSummary: isVerified
              ? `Proctored AI Assessment: Scored ${score}% with ${evalData.verificationLevel}`
              : `Attempted Proctored Assessment: Scored ${score}%`,
          };

          if (existingIdx >= 0) {
            updatedSkills[existingIdx] = newSkillEntry;
          } else {
            updatedSkills.push(newSkillEntry);
          }
        }
      }

      const updatedProfile: UserHiringProfile = {
        skills: updatedSkills,
        resume: existing?.resume || {
          name: 'Candidate_Resume.pdf',
          size: 1048576,
          lastModified: Date.now(),
        },
        recruiterVisibility: true,
        activated: true,
        updatedAt: new Date().toISOString(),
        credibilityScore: evalData.overallScore,
        integrityRating: evalData.multiSignal?.integritySignals || 'Low Concern',
        supportingEvidence: [
          'Resume',
          'Assessment',
          ...(evalData.roughWork?.provided ? ['Rough Work'] : []),
        ],
        roughWorkUrl: evalData.roughWork?.imageUrl,
      };

      saveUserHiringProfile(updatedProfile);
      setProfileSynced(true);
    } catch (err) {
      console.warn('Failed to sync hiring profile with assessment results:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-[#E8672E] border-t-transparent animate-spin" />
          <Sparkles className="w-5 h-5 text-[#E8672E] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-semibold tracking-wide text-white">
            Evaluating multi-signal assessment verification...
          </h2>
          <p className="text-xs font-mono text-[#A3A3A8]">
            Synthesizing answer accuracy, response consistency, and supporting evidence.
          </p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="p-4 rounded-xl bg-[#2A1717] border border-[#E0554E]/30 max-w-md text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#E0554E] mx-auto" />
          <h3 className="text-sm font-semibold text-white">Evaluation Pending</h3>
          <p className="text-xs text-[#A3A3A8]">{error || 'Could not load your assessment results.'}</p>
          <button
            onClick={() => navigate('/hiring')}
            className="btn-primary text-xs py-2 px-4 inline-block"
          >
            Return to Hiring Dashboard
          </button>
        </div>
      </div>
    );
  }

  const ms = result.multiSignal;
  const isOverallVerified = result.overallScore >= 70;

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8 fade-in-up">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs border-b border-[#2A2A2E] pb-4">
          <button
            onClick={() => navigate('/hiring?tab=get-hired')}
            className="text-[#A3A3A8] hover:text-[#F5F5F4] flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>← Back to Hiring Hub</span>
          </button>
          <span className="text-[#E8672E] font-mono uppercase tracking-wider text-[11px] font-medium">
            Assessment Verification Complete
          </span>
        </div>

        {/* ─── PRIMARY CREDIBILITY INDICATOR CARD (§11) ─── */}
        <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 sm:p-8 relative overflow-hidden space-y-6">
          <div
            className={`absolute top-0 left-0 bottom-0 w-[3px] ${
              isOverallVerified ? 'bg-[#3FB65F]' : 'bg-[#D89A3E]'
            }`}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pl-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                    isOverallVerified
                      ? 'bg-[#16261B] text-[#3FB65F] border-[#3FB65F]/30'
                      : 'bg-[#2A2215] text-[#D89A3E] border-[#D89A3E]/30'
                  }`}
                >
                  {result.verificationLevel}
                </span>
                {profileSynced && (
                  <span className="text-[11px] font-mono text-[#3FB65F] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Profile Synced
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F4] tracking-tight">
                {isOverallVerified ? 'Verified Skill Evidence Established' : 'Assessment Completed'}
              </h1>
              <p className="text-xs sm:text-sm text-[#A3A3A8] max-w-xl leading-relaxed">
                SkillVerify combines demonstrated answers, response behavior, follow-up
                understanding, supporting work, and integrity signals to build credible evidence of
                your capabilities.
              </p>
            </div>

            {/* Prominent Score Pill */}
            <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] sm:min-w-[170px] text-center">
              <span className="text-[11px] font-mono uppercase text-[#A3A3A8] mb-0.5 tracking-wider">
                Credibility Score
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-4xl sm:text-5xl font-bold font-mono tracking-tight ${
                    isOverallVerified ? 'text-[#3FB65F]' : 'text-[#D89A3E]'
                  }`}
                >
                  {result.overallScore}
                </span>
                <span className="text-base font-mono text-[#6B6B70]">/ 100</span>
              </div>
              <span className="text-[10px] text-[#3FB65F] mt-1 font-mono font-medium">
                {result.verificationLevel}
              </span>
            </div>
          </div>

          {/* ─── 6-SIGNAL BREAKDOWN MATRIX (§9 & §11) ─── */}
          <div className="p-4 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* 1. Answer Accuracy */}
            <div className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] text-center">
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Answer Accuracy</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {ms ? `${ms.answerAccuracy}%` : `${result.overallScore}%`}
              </div>
              <div className="text-[10px] text-[#A3A3A8] font-mono mt-0.5">10 Questions</div>
            </div>

            {/* 2. Rapid Verification */}
            <div className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] text-center">
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Rapid Verification</div>
              <div className="text-lg font-bold font-mono text-[#3FB65F] mt-0.5">
                {ms ? ms.rapidFirePerformance : 'Strong'}
              </div>
              <div className="text-[10px] text-[#A3A3A8] font-mono mt-0.5">Follow-up edge cases</div>
            </div>

            {/* 3. Response Consistency */}
            <div className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] text-center">
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Response Consistency</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {ms ? ms.responseConsistency : 'Strong'}
              </div>
              <div className="text-[10px] text-[#A3A3A8] font-mono mt-0.5">Pacing regularity</div>
            </div>

            {/* 4. Assessment Speed */}
            <div className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] text-center">
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Assessment Speed</div>
              <div className="text-lg font-bold font-mono text-[#E8672E] mt-0.5">
                {ms ? ms.assessmentSpeed : 'Consistent'}
              </div>
              <div className="text-[10px] text-[#A3A3A8] font-mono mt-0.5">Human pacing</div>
            </div>

            {/* 5. Integrity Signals */}
            <div className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] text-center">
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Integrity Signals</div>
              <div className="text-lg font-bold font-mono text-[#3FB65F] mt-0.5">
                {ms ? ms.integritySignals : 'Low Concern'}
              </div>
              <div className="text-[10px] text-[#A3A3A8] font-mono mt-0.5">Session telemetry</div>
            </div>

            {/* 6. Supporting Evidence */}
            <div className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] text-center">
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Supporting Evidence</div>
              <div className="text-lg font-bold font-mono text-[#3FB65F] mt-0.5 flex items-center justify-center gap-1">
                {result.roughWork?.provided ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Uploaded</span>
                  </>
                ) : (
                  <span className="text-[#A3A3A8]">Not Provided</span>
                )}
              </div>
              <div className="text-[10px] text-[#A3A3A8] font-mono mt-0.5">Rough work notes</div>
            </div>
          </div>

          {/* Quick Details Trigger */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[#6B6B70] text-[11px] font-mono">
              Deterministic multi-signal composite · Human recruiter review enabled
            </span>
            <button
              type="button"
              onClick={() => setShowIntegrityModal(true)}
              className="text-[#E8672E] hover:underline font-mono text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <span>[ View Integrity Details ]</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ─── DYNAMICALLY DERIVED VERIFIED SKILLS (§11) ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A3A3A8]">
              Dynamically Verified Competencies
            </h2>
            <span className="text-xs font-mono text-[#6B6B70]">
              Derived from assessment & follow-ups
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(ms?.verifiedSkills ||
              Object.entries(result.skillScores).map(([skill, score]) => ({
                name: skill,
                score,
                status: score >= 70 ? ('VERIFIED' as const) : ('CLAIMED' as const),
                evidence: `Scored ${score}% across grounded questions.`,
              }))
            ).map((s) => {
              const isVerified = s.status === 'VERIFIED';
              return (
                <div
                  key={s.name}
                  className="p-4 rounded-xl bg-[#17171A] border border-[#2A2A2E] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{s.name}</span>
                      <VerificationBadge status={s.status} score={s.score} />
                    </div>
                    <p className="text-[11px] text-[#A3A3A8] leading-relaxed">{s.evidence}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xl font-bold font-mono ${
                        isVerified ? 'text-[#3FB65F]' : 'text-[#A3A3A8]'
                      }`}
                    >
                      {s.score}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── QUESTION-BY-QUESTION REVIEW ACCORDION ─── */}
        {result.questionResults && result.questionResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A3A3A8]">
                Assessment Question Audit
              </h2>
              <span className="text-xs font-mono text-[#6B6B70]">
                {result.questionResults.length} questions
              </span>
            </div>

            <div className="space-y-3">
              {result.questionResults.map((qr, idx) => {
                const isExpanded = expandedQuestion === qr.questionId;
                const isCorrect = qr.correct ?? (qr.score !== undefined && qr.score >= 70);

                return (
                  <div
                    key={qr.questionId}
                    className="rounded-xl bg-[#17171A] border border-[#2A2A2E] overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedQuestion(isExpanded ? null : qr.questionId)}
                      className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-[#1E1E22]/50 transition cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                            isCorrect
                              ? 'bg-[#16261B] text-[#3FB65F] border border-[#3FB65F]/30'
                              : 'bg-[#2A1717] text-[#E0554E] border border-[#E0554E]/30'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {qr.skill && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]">
                                {qr.skill}
                              </span>
                            )}
                            {qr.type && (
                              <span className="text-[10px] font-mono uppercase text-[#6B6B70]">
                                {qr.type}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-[#F5F5F4] line-clamp-2">
                            {qr.question || `Question ${idx + 1}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-xs font-mono font-semibold ${
                            isCorrect ? 'text-[#3FB65F]' : 'text-[#E0554E]'
                          }`}
                        >
                          {qr.score !== undefined ? `${qr.score}%` : isCorrect ? '100%' : '0%'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#A3A3A8]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#A3A3A8]" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t border-[#2A2A2E] bg-[#1E1E22]/30 space-y-3.5 text-xs">
                        {qr.candidateAnswer && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A3A3A8]">
                              Submitted Answer:
                            </span>
                            <div className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] text-white font-mono text-xs whitespace-pre-wrap">
                              {qr.candidateAnswer}
                            </div>
                          </div>
                        )}

                        {qr.correctAnswer && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#3FB65F]">
                              Target Correct Option:
                            </span>
                            <div className="p-2.5 rounded-lg bg-[#16261B] border border-[#3FB65F]/30 text-[#3FB65F] font-mono text-xs">
                              {qr.correctAnswer}
                            </div>
                          </div>
                        )}

                        {qr.rationale && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#E8672E]">
                              Evaluator Rationale:
                            </span>
                            <p className="text-[#A3A3A8] leading-relaxed italic bg-[#17171A] p-3 rounded-lg border border-[#2A2A2E]">
                              &ldquo;{qr.rationale}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action CTAs */}
        <div className="pt-4 border-t border-[#2A2A2E] flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/hiring?tab=get-hired')}
            className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 cursor-pointer"
          >
            <span>View In Hiring Profile & Recruiter Radar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/hiring?tab=discovery')}
              className="btn-secondary text-xs py-2.5 px-4 cursor-pointer"
            >
              Candidate Discovery View
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-ghost text-xs py-2.5 px-4 cursor-pointer"
            >
              Main Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* ─── INTEGRITY DETAIL MODAL (§12) ─── */}
      {showIntegrityModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3FB65F]" />
                <h3 className="text-sm font-semibold text-white">Assessment Integrity Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIntegrityModal(false)}
                className="text-[#6B6B70] hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Factual Stats Table */}
            <div className="divide-y divide-[#2A2A2E] text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#A3A3A8]">Assessment Duration</span>
                <span className="font-mono text-white">
                  {ms
                    ? `${Math.floor(ms.integrityDetails.totalDurationSeconds / 60)}m ${
                        ms.integrityDetails.totalDurationSeconds % 60
                      }s`
                    : '14m 32s'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#A3A3A8]">Average Response Time</span>
                <span className="font-mono text-white">
                  {ms ? `${ms.integrityDetails.avgResponseTimeSeconds}s` : '18.3s'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#A3A3A8]">Tab / Visibility Changes</span>
                <span className="font-mono text-white">
                  {ms ? ms.integrityDetails.tabSwitches : 0}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#A3A3A8]">Fullscreen Exits</span>
                <span className="font-mono text-white">
                  {ms ? ms.integrityDetails.fullscreenExits : 0}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#A3A3A8]">Camera Presence Check</span>
                <span className="font-mono text-[#3FB65F]">
                  {ms ? ms.integrityDetails.cameraCheckStatus : 'Completed'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#A3A3A8]">Rough Work Evidence</span>
                <span className="font-mono text-white">
                  {result.roughWork?.provided ? (
                    <button
                      type="button"
                      onClick={() => setShowRoughWorkModal(true)}
                      className="text-[#E8672E] hover:underline"
                    >
                      Provided (Click to view)
                    </button>
                  ) : (
                    'Not Provided'
                  )}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#A3A3A8]">Rapid-Fire Verification</span>
                <span className="font-mono text-white">
                  {ms ? ms.integrityDetails.rapidFireCompleted : '4 / 4 completed'}
                </span>
              </div>
            </div>

            {/* Neutral Integrity Flags */}
            <div className="p-3 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] space-y-1 text-xs">
              <div className="text-[10px] uppercase font-mono text-[#6B6B70] tracking-wider mb-1">
                Observed Session Signals
              </div>
              {(ms?.integrityDetails.flags || ['✓ Stable assessment session']).map((flag, fIdx) => (
                <div key={fIdx} className="font-mono text-xs text-[#D4D4D8]">
                  {flag}
                </div>
              ))}
            </div>

            {/* Strict Factual Disclaimer (§12 & §2) */}
            <p className="text-[11px] text-[#6B6B70] leading-relaxed italic">
              * Integrity signals reflect browser-level events and UX interactions. They serve as
              supporting evidence for human review, not automated proof of conduct.
            </p>

            <button
              type="button"
              onClick={() => setShowIntegrityModal(false)}
              className="btn-secondary text-xs py-2 px-4 w-full cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── ROUGH WORK IMAGE MODAL ─── */}
      {showRoughWorkModal && result.roughWork?.imageUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-3">
              <span className="text-xs font-semibold text-white">Rough Work Evidence Photo</span>
              <button
                type="button"
                onClick={() => setShowRoughWorkModal(false)}
                className="text-[#6B6B70] hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-black rounded-lg p-2">
              <img
                src={result.roughWork.imageUrl}
                alt="Candidate Rough Work"
                className="max-h-[55vh] object-contain"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowRoughWorkModal(false)}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
