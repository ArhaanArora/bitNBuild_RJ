import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { EvaluationResult } from '../../types/resumeAssessment';
import { getUserHiringProfile, saveUserHiringProfile } from '../../utils/hiringStorage';
import { UserHiringProfile, HiringSkill } from '../../types/hiring';
import VerificationBadge from '../../components/common/VerificationBadge';
import {
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
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StrictAssessmentResult() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [profileSynced, setProfileSynced] = useState(false);

  useEffect(() => {
    if (!assessmentId) {
      navigate('/hiring');
      return;
    }

    let isMounted = true;
    let pollCount = 0;
    const maxPolls = 10;

    const fetchResult = async () => {
      try {
        const { data } = await api.get(`/hiring/get-verified/assessment/${assessmentId}/result`);
        if (!isMounted) return;

        if (data && (data.status === 'evaluated' || data.overallScore !== undefined)) {
          setResult(data);
          setLoading(false);

          // Synchronize verified skills with local UserHiringProfile
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
            Evaluating your assessment with AI...
          </h2>
          <p className="text-xs font-mono text-[#A3A3A8]">
            Applying technical grading rubrics across 10 grounded questions.
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

  const isOverallVerified = result.overallScore >= 70;

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8 fade-in-up">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs border-b border-[#2A2A2E] pb-4">
          <button
            onClick={() => navigate('/hiring?tab=get-hired')}
            className="text-[#A3A3A8] hover:text-[#F5F5F4] flex items-center gap-1.5 transition"
          >
            <span>← Back to Hiring Hub</span>
          </button>
          <span className="text-[#E8672E] font-mono uppercase tracking-wider text-[11px] font-medium">
            Official Evaluation Report
          </span>
        </div>

        {/* Hero Score Card */}
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
                {isOverallVerified ? 'Skills Verified' : 'Assessment Completed'}
              </h1>
              <p className="text-xs sm:text-sm text-[#A3A3A8] max-w-xl leading-relaxed">
                {isOverallVerified
                  ? 'Your answers demonstrated sufficient evidence of technical capability across your claimed skills. Verified badges have been attached to your recruiter profile.'
                  : 'Your assessment has been evaluated. Review the technical rationales below to identify areas to strengthen before re-attempting.'}
              </p>
            </div>

            {/* Score Pill */}
            <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-[#1E1E22] border border-[#2A2A2E] sm:min-w-[160px] text-center">
              <span className="text-xs font-mono uppercase text-[#A3A3A8] mb-0.5 tracking-wider">
                Overall Score
              </span>
              <span
                className={`text-4xl sm:text-5xl font-bold font-mono tracking-tight ${
                  isOverallVerified ? 'text-[#3FB65F]' : 'text-[#D89A3E]'
                }`}
              >
                {result.overallScore}%
              </span>
              <span className="text-[10px] text-[#6B6B70] mt-1 font-mono">10 Questions Graded</span>
            </div>
          </div>

          {/* Session Integrity Record */}
          <div className="p-4 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-lg font-bold font-mono text-white">10 / 10</div>
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Questions Answered</div>
            </div>
            <div>
              <div
                className={`text-lg font-bold font-mono ${
                  result.integrityEventsCount === 0 ? 'text-[#3FB65F]' : 'text-[#D89A3E]'
                }`}
              >
                {result.integrityEventsCount}
              </div>
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Browser Exits / Blurs</div>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-[#3FB65F]">Active</div>
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Local Video Proctor</div>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-[#E8672E]">Verified</div>
              <div className="text-[10px] text-[#6B6B70] uppercase font-medium">Server Evaluated</div>
            </div>
          </div>
        </div>

        {/* Per-Skill Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A3A3A8]">
              Skill Verification Breakdown
            </h2>
            <span className="text-xs font-mono text-[#6B6B70]">
              {Object.keys(result.skillScores).length} targeted competencies
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(result.skillScores).map(([skill, score]) => {
              const verified = score >= 70;
              return (
                <div
                  key={skill}
                  className="p-4 rounded-xl bg-[#17171A] border border-[#2A2A2E] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{skill}</span>
                      <VerificationBadge status={verified ? 'VERIFIED' : 'CLAIMED'} score={score} />
                    </div>
                    <p className="text-[11px] text-[#A3A3A8]">
                      {verified
                        ? 'Evidence demonstrated in assessment questions.'
                        : 'Score fell below the 70% verification threshold.'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xl font-bold font-mono ${
                        verified ? 'text-[#3FB65F]' : 'text-[#A3A3A8]'
                      }`}
                    >
                      {score}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Question Review & Rubric Rationales */}
        {result.questionResults && result.questionResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A3A3A8]">
                Question-by-Question Review & Evaluation Rubric
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

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="p-4 border-t border-[#2A2A2E] bg-[#1E1E22]/30 space-y-3.5 text-xs">
                        {qr.candidateAnswer && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A3A3A8]">
                              Your Submitted Answer:
                            </span>
                            <div className="p-3 rounded-lg bg-[#17171A] border border-[#2A2A2E] text-white font-mono text-xs whitespace-pre-wrap">
                              {qr.candidateAnswer}
                            </div>
                          </div>
                        )}

                        {qr.correctAnswer && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#3FB65F]">
                              Correct Option:
                            </span>
                            <div className="p-2.5 rounded-lg bg-[#16261B] border border-[#3FB65F]/30 text-[#3FB65F] font-mono text-xs">
                              {qr.correctAnswer}
                            </div>
                          </div>
                        )}

                        {qr.rationale && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#E8672E]">
                              Evaluator Rationale (Rubric Dimensions):
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
              onClick={() => navigate('/hiring?tab=jobs')}
              className="btn-secondary text-xs py-2.5 px-4 cursor-pointer"
            >
              Explore Verified Opportunities
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
    </div>
  );
}
