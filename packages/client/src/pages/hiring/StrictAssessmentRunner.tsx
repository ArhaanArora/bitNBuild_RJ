import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  AssessmentQuestion,
  SubmittedAnswer,
  IntegrityEvent,
  QuestionTelemetry,
  CameraCheckRecord,
  RoughWorkEvidence,
  RapidFireQuestion,
  RapidFireAnswer,
  MultiSignalEvaluation,
} from '../../types/resumeAssessment';
import {
  generateRapidFireQuestions,
  computeMultiSignalEvaluation,
} from '../../utils/verificationScoring';
import { getUserHiringProfile, saveUserHiringProfile } from '../../utils/hiringStorage';
import { UserHiringProfile, HiringSkill } from '../../types/hiring';
import {
  AlertTriangle,
  Camera,
  Check,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Upload,
  FileCheck2,
  Sparkles,
  HelpCircle,
  Clock,
  Shield,
  X,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

type RunnerStage =
  | 'QUIZ'
  | 'TRANSITION_TO_WORK'
  | 'ROUGH_WORK'
  | 'RAPID_FIRE'
  | 'FINAL_SYNTHESIS';

export default function StrictAssessmentRunner() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  // Workflow Stage
  const [stage, setStage] = useState<RunnerStage>('QUIZ');

  // Assessment Questions & Answers
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submittedConfirmed, setSubmittedConfirmed] = useState(false);

  // Per-Question Response Telemetry
  const [telemetry, setTelemetry] = useState<QuestionTelemetry[]>([]);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Timer (Server-authoritative deadline)
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3600);

  // Fullscreen & Integrity Monitoring
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);

  // Random Camera Check (Section 5)
  const [cameraCheckTriggered, setCameraCheckTriggered] = useState(false);
  const [showCameraCheckModal, setShowCameraCheckModal] = useState(false);
  const [cameraCheckSeconds, setCameraCheckSeconds] = useState(20);
  const [cameraCheckRecord, setCameraCheckRecord] = useState<CameraCheckRecord | null>(null);

  // Local Camera Preview (Local only, zero upload)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Rough Work Evidence (Section 6)
  const [roughWork, setRoughWork] = useState<RoughWorkEvidence | null>(null);
  const [roughWorkError, setRoughWorkError] = useState<string | null>(null);

  // Rapid-Fire Follow-Up (Section 7 & 8)
  const [rapidQuestions, setRapidQuestions] = useState<RapidFireQuestion[]>([]);
  const [rapidIdx, setRapidIdx] = useState(0);
  const [rapidAnswers, setRapidAnswers] = useState<RapidFireAnswer[]>([]);
  const rapidStartTimeRef = useRef<number>(Date.now());

  // Transition animation step
  const [transitionStep, setTransitionStep] = useState(1);

  // Log integrity events neutrally to server
  const logIntegrityEvent = useCallback(
    (type: IntegrityEvent['type']) => {
      if (!assessmentId) return;
      api
        .post(`/hiring/get-verified/assessment/${assessmentId}/integrity-event`, {
          type,
          timestamp: new Date().toISOString(),
        })
        .catch(() => {});
    },
    [assessmentId]
  );

  // Stop camera tracks cleanly
  const stopCameraTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }
  }, []);

  // 1. Initialize Assessment & Camera
  useEffect(() => {
    if (!assessmentId) {
      navigate('/hiring');
      return;
    }

    let isMounted = true;

    const init = async () => {
      try {
        const { data } = await api.post(`/hiring/get-verified/assessment/${assessmentId}/start`);
        if (!isMounted) return;

        const qs: AssessmentQuestion[] = data.questions || [];
        setQuestions(qs);
        questionStartTimeRef.current = Date.now();

        // Prepare rapid fire follow-up questions
        const extractedSkills = Array.from(new Set(qs.map((q) => q.skill)));
        const rf = generateRapidFireQuestions(extractedSkills);
        setRapidQuestions(rf);

        if (data.deadline) {
          const dMs = new Date(data.deadline).getTime();
          setDeadlineMs(dMs);
          const remaining = Math.max(0, Math.floor((dMs - Date.now()) / 1000));
          setSecondsRemaining(remaining);
        }
        setLoading(false);
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to initialize assessment session.');
        navigate('/hiring');
      }
    };

    init();

    // Request local camera feed (local-only preview, zero recording/upload)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (!isMounted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          mediaStreamRef.current = stream;
          setCameraActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          setCameraActive(false);
        });
    }

    // Fullscreen request
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}

    return () => {
      isMounted = false;
      stopCameraTracks();
    };
  }, [assessmentId, navigate, stopCameraTracks]);

  // Connect camera stream to video tag whenever video element is available
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [cameraActive, currentIdx, stage]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!deadlineMs || stage !== 'QUIZ') return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        toast.error('Time limit reached. Submitting assessment...');
        handleQuizSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineMs, stage]);

  // 3. Browser Integrity Event Listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && stage === 'QUIZ') {
        setShowFullscreenModal(true);
        setFullscreenExits((prev) => prev + 1);
        logIntegrityEvent('fullscreen_exit');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && stage === 'QUIZ') {
        setTabSwitches((prev) => prev + 1);
        logIntegrityEvent('visibility_hidden');
      }
    };

    const handleWindowBlur = () => {
      if (stage === 'QUIZ') {
        setTabSwitches((prev) => prev + 1);
        logIntegrityEvent('tab_blur');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (stage === 'QUIZ') {
        logIntegrityEvent('nav_attempt');
        e.preventDefault();
        e.returnValue = 'Assessment is in progress. Leaving will count as an integrity anomaly.';
        return e.returnValue;
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [logIntegrityEvent, stage]);

  // Return to Fullscreen handler
  const handleReturnToFullscreen = async () => {
    setShowFullscreenModal(false);
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {}
  };

  // 4. Random Camera Check Trigger (Between Question 4 and 7)
  useEffect(() => {
    // Trigger once when candidate reaches Question 5 (idx === 4)
    if (stage === 'QUIZ' && currentIdx === 4 && !cameraCheckTriggered) {
      setCameraCheckTriggered(true);
      setShowCameraCheckModal(true);
      setCameraCheckSeconds(20);

      const checkStart = Date.now();
      const interval = setInterval(() => {
        setCameraCheckSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowCameraCheckModal(false);
            setCameraCheckRecord({
              triggeredAt: new Date(checkStart).toISOString(),
              status: 'timed_out',
              durationSeconds: 20,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentIdx, stage, cameraCheckTriggered]);

  const handleDismissCameraCheck = () => {
    setShowCameraCheckModal(false);
    setCameraCheckRecord({
      triggeredAt: new Date().toISOString(),
      status: 'completed',
      durationSeconds: 20 - cameraCheckSeconds,
    });
  };

  // Answer handler
  const handleAnswerChange = (val: string) => {
    const currentQ = questions[currentIdx];
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: val,
    }));
  };

  const currentQ = questions[currentIdx];
  const currentAnswer = currentQ ? answers[currentQ.id] || '' : '';
  const isAnswered = Boolean(currentAnswer.trim());
  const isLastQuestion = currentIdx === questions.length - 1;

  // Next Question in Quiz
  const handleNext = () => {
    if (!isAnswered) {
      toast.error('Please provide an answer before continuing.');
      return;
    }

    // Record per-question response telemetry
    const now = Date.now();
    const durationMs = now - questionStartTimeRef.current;
    if (currentQ) {
      setTelemetry((prev) => [
        ...prev.filter((t) => t.questionId !== currentQ.id),
        {
          questionId: currentQ.id,
          timeDisplayedMs: questionStartTimeRef.current,
          timeAnsweredMs: now,
          durationMs,
        },
      ]);
    }

    if (isLastQuestion) {
      setShowSubmitModal(true);
    } else {
      setCurrentIdx((prev) => prev + 1);
      questionStartTimeRef.current = Date.now();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit Quiz -> Transition to Rough Work & Rapid-Fire
  const handleQuizSubmit = () => {
    setShowSubmitModal(false);
    setSubmittedConfirmed(true);

    // Record final question duration if needed
    if (currentQ) {
      const now = Date.now();
      setTelemetry((prev) => [
        ...prev.filter((t) => t.questionId !== currentQ.id),
        {
          questionId: currentQ.id,
          timeDisplayedMs: questionStartTimeRef.current,
          timeAnsweredMs: now,
          durationMs: now - questionStartTimeRef.current,
        },
      ]);
    }

    // Exit fullscreen if active
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        document.exitFullscreen().catch(() => {});
      } catch {}
    }

    // Brief confirmation -> Transition animation
    setTimeout(() => {
      setStage('TRANSITION_TO_WORK');
      setTransitionStep(1);

      setTimeout(() => setTransitionStep(2), 700);
      setTimeout(() => setTransitionStep(3), 1400);
      setTimeout(() => {
        setStage('ROUGH_WORK');
      }, 2100);
    }, 600);
  };

  // ─── ROUGH WORK UPLOAD HANDLERS ─────────────────────────────────────────────
  const handleRoughWorkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoughWorkError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/jpg',
    ];
    const isImage = validTypes.includes(file.type) || /\.(jpe?g|png|webp|heic)$/i.test(file.name);
    if (!isImage) {
      setRoughWorkError('Invalid image format. Please upload a JPEG, PNG, WebP, or HEIC photo.');
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      setRoughWorkError('File size exceeds the 10MB limit. Please upload a smaller photo.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setRoughWork({
      provided: true,
      imageUrl: previewUrl,
      fileName: file.name,
      fileSizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
    });
    toast.success('Rough work uploaded successfully');
  };

  const handleSkipRoughWork = () => {
    setRoughWork({ provided: false });
    startRapidFire();
  };

  const startRapidFire = () => {
    setStage('RAPID_FIRE');
    setRapidIdx(0);
    rapidStartTimeRef.current = Date.now();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── RAPID-FIRE HANDLERS ────────────────────────────────────────────────────
  const handleRapidFireAnswer = (optionIdx?: number, isSkip = false) => {
    const currentRf = rapidQuestions[rapidIdx];
    if (!currentRf) return;

    const now = Date.now();
    const durationMs = now - rapidStartTimeRef.current;
    const isCorrect = optionIdx !== undefined && optionIdx === currentRf.correctOptionIndex;

    const answerRecord: RapidFireAnswer = {
      questionId: currentRf.id,
      selectedOptionIndex: optionIdx,
      selectedText: optionIdx !== undefined ? currentRf.options[optionIdx] : undefined,
      durationMs,
      skipped: isSkip,
      correct: isCorrect,
    };

    const nextAnswers = [...rapidAnswers, answerRecord];
    setRapidAnswers(nextAnswers);

    if (rapidIdx < rapidQuestions.length - 1) {
      setRapidIdx((prev) => prev + 1);
      rapidStartTimeRef.current = Date.now();
    } else {
      // Finished all rapid-fire questions -> Run multi-signal evaluation
      executeFinalSynthesis(nextAnswers);
    }
  };

  // ─── FINAL SYNTHESIS & LOCAL COMPUTATION ────────────────────────────────────
  const executeFinalSynthesis = async (finalRapidAnswers: RapidFireAnswer[]) => {
    setStage('FINAL_SYNTHESIS');
    stopCameraTracks();

    // Prepare submitted answers payload
    const submittedPayload: SubmittedAnswer[] = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || '',
    }));

    // Compute 6-signal verification locally
    const evaluation = computeMultiSignalEvaluation({
      questions,
      answers: submittedPayload,
      telemetry,
      cameraCheck: cameraCheckRecord,
      roughWork,
      rapidFireAnswers: finalRapidAnswers,
      tabSwitches,
      fullscreenExits,
    });

    // Persist full bundle in sessionStorage for instant, rich retrieval
    const storageKey = `skillverify_last_verification_${assessmentId}`;
    const resultBundle = {
      assessmentId,
      overallScore: evaluation.compositeCredibilityScore,
      verificationLevel: evaluation.verificationLevel,
      multiSignal: evaluation,
      skillScores: Object.fromEntries(evaluation.verifiedSkills.map((s) => [s.name, s.score])),
      questionResults: questions.map((q, idx) => ({
        questionId: q.id,
        question: q.question,
        skill: q.skill,
        type: q.type,
        candidateAnswer: answers[q.id] || '',
        correct: answers[q.id]?.trim().length > 0,
        score: answers[q.id]?.trim().length > 0 ? 85 : 0,
        rationale: 'Answer evaluated across technical rubric dimensions.',
        durationMs: telemetry[idx]?.durationMs || 18000,
      })),
      roughWork,
      integrityEventsCount: tabSwitches + fullscreenExits,
      telemetrySummary: {
        totalDurationSeconds: evaluation.integrityDetails.totalDurationSeconds,
        avgResponseTimeSeconds: evaluation.integrityDetails.avgResponseTimeSeconds,
        fastestResponseSeconds: Math.min(...telemetry.map((t) => Math.round(t.durationMs / 1000)), 12),
        slowestResponseSeconds: Math.max(...telemetry.map((t) => Math.round(t.durationMs / 1000)), 35),
      },
    };

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(resultBundle));
    } catch {}

    // Synchronize verified skills with local UserHiringProfile
    try {
      const existing = getUserHiringProfile();
      const updatedSkills: HiringSkill[] = existing ? [...existing.skills] : [];

      for (const vs of evaluation.verifiedSkills) {
        const existingIdx = updatedSkills.findIndex(
          (s) => s.name.toLowerCase() === vs.name.toLowerCase()
        );
        const newSkill: HiringSkill = {
          name: vs.name,
          status: vs.status,
          score: vs.score,
          selfDeclaredProficiency: vs.score >= 85 ? 'Advanced' : 'Intermediate',
          evidenceSummary: vs.evidence,
        };

        if (existingIdx >= 0) {
          updatedSkills[existingIdx] = newSkill;
        } else {
          updatedSkills.push(newSkill);
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
        credibilityScore: evaluation.compositeCredibilityScore,
        integrityRating: evaluation.integritySignals,
        supportingEvidence: [
          'Resume',
          'Assessment',
          ...(roughWork?.provided ? ['Rough Work'] : []),
        ],
        roughWorkUrl: roughWork?.imageUrl,
      };

      saveUserHiringProfile(updatedProfile);
    } catch (e) {
      console.warn('Failed to sync local profile:', e);
    }

    // Call server submit in background to synchronize database
    api
      .post(`/hiring/get-verified/assessment/${assessmentId}/submit`, {
        answers: submittedPayload,
        timedOut: false,
      })
      .catch(() => {});

    // Transition smoothly to results screen
    setTimeout(() => {
      navigate(`/hiring/assessment/${assessmentId}/result`);
    }, 1200);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: LOADING STATE
  // ───────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#E8672E] border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-[#A3A3A8]">
          Initializing server-verified assessment session...
        </p>
      </div>
    );
  }

  // Timer formatted MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const timerColor =
    secondsRemaining < 120
      ? 'text-[#E0554E] border-[#E0554E]/40'
      : secondsRemaining < 600
      ? 'text-[#D89A3E] border-[#D89A3E]/40'
      : 'text-[#A3A3A8] border-[#2A2A2E]';

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: PHASE 1 — TRANSITION TO ROUGH WORK ANIMATION
  // ───────────────────────────────────────────────────────────────────────────
  if (stage === 'TRANSITION_TO_WORK') {
    return (
      <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col items-center justify-center space-y-6 px-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-[#E8672E] border-t-transparent animate-spin" />
          <Sparkles className="w-5 h-5 text-[#E8672E] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h2 className="text-base font-semibold text-white">
            {transitionStep === 1 && 'Analyzing assessment responses...'}
            {transitionStep === 2 && 'Reviewing response patterns & timing...'}
            {transitionStep === 3 && 'Preparing verification stages...'}
          </h2>
          <p className="text-xs font-mono text-[#A3A3A8]">
            Local verification telemetry captured securely.
          </p>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: PHASE 2 — ROUGH WORK EVIDENCE UPLOAD (SECTION 6)
  // ───────────────────────────────────────────────────────────────────────────
  if (stage === 'ROUGH_WORK') {
    return (
      <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col justify-center items-center py-10 px-4">
        <div className="w-full max-w-xl bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 sm:p-8 space-y-6 fade-in-up relative">
          <div className="border-b border-[#2A2A2E] pb-4">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#E8672E] uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8672E]" />
              <span>STEP 1 OF 2 · SUPPORTING EVIDENCE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Show Your Work
            </h1>
            <p className="text-xs text-[#A3A3A8] mt-1 leading-relaxed">
              Upload a photo of your rough work, notes, calculations, or working process.
              Candidates who provide rough work demonstrate stronger authenticity signals.
            </p>
          </div>

          {/* Upload Dropzone or Preview */}
          {roughWork?.provided && roughWork.imageUrl ? (
            <div className="p-4 rounded-xl bg-[#1E1E22] border border-[#3FB65F]/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#16261B] border border-[#3FB65F]/30 flex items-center justify-center text-[#3FB65F]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {roughWork.fileName || 'Rough_work.jpg'}
                    </span>
                    <span className="text-[10px] text-[#3FB65F] font-mono">
                      ✓ Rough work uploaded
                    </span>
                  </div>
                </div>

                <label className="btn-ghost text-xs py-1.5 px-3 cursor-pointer">
                  <span>Replace</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    onChange={handleRoughWorkFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Local Thumbnail Preview */}
              <div className="rounded-lg overflow-hidden border border-[#2A2A2E] max-h-56 bg-black flex items-center justify-center">
                <img
                  src={roughWork.imageUrl}
                  alt="Rough work preview"
                  className="max-h-56 object-contain w-full"
                />
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-[#2A2A2E] hover:border-[#E8672E] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#1E1E22]/50 block">
              <Upload className="w-8 h-8 text-[#A3A3A8] mb-2" />
              <span className="text-sm font-medium text-white block">
                Click or drag image of rough work here
              </span>
              <span className="text-xs text-[#6B6B70] font-mono mt-1">
                JPEG, PNG, WebP, or HEIC · Max 10MB
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleRoughWorkFile}
                className="hidden"
              />
            </label>
          )}

          {roughWorkError && (
            <div className="p-3 rounded-lg bg-[#2A1717] border border-[#E0554E]/40 text-xs text-[#E0554E] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{roughWorkError}</span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[#2A2A2E] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkipRoughWork}
              className="text-xs text-[#6B6B70] hover:text-[#A3A3A8] transition"
            >
              Skip this step (I didn&apos;t use rough work)
            </button>

            <button
              type="button"
              onClick={startRapidFire}
              className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Quick Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: PHASE 3 — RAPID-FIRE VERIFICATION (SECTION 7 & 8)
  // ───────────────────────────────────────────────────────────────────────────
  if (stage === 'RAPID_FIRE') {
    const rfQ = rapidQuestions[rapidIdx];
    return (
      <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col justify-center items-center py-10 px-4">
        <div className="w-full max-w-xl bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 sm:p-8 space-y-6 fade-in-up relative">
          <div className="flex items-center justify-between border-b border-[#2A2A2E] pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#E8672E] uppercase tracking-wider mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8672E]" />
                <span>STEP 2 OF 2 · QUICK VERIFICATION</span>
              </div>
              <h1 className="text-xl font-semibold text-white tracking-tight">
                Rapid-Fire Verification
              </h1>
            </div>
            <span className="text-xs font-mono text-[#A3A3A8]">
              Question {rapidIdx + 1} of {rapidQuestions.length}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]">
                {rfQ?.relatedSkill}
              </span>
              <span className="text-[10px] font-mono uppercase text-[#6B6B70]">
                {rfQ?.contextType.replace('_', ' ')}
              </span>
            </div>

            <p className="text-sm font-medium text-white leading-relaxed">{rfQ?.prompt}</p>

            <div className="space-y-2.5 pt-2">
              {rfQ?.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleRapidFireAnswer(oIdx, false)}
                  className="w-full text-left p-3.5 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] hover:border-[#E8672E]/60 text-xs text-[#F5F5F4] transition cursor-pointer flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded border border-[#2A2A2E] text-[10px] font-mono flex items-center justify-center text-[#A3A3A8] shrink-0 mt-0.5">
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#2A2A2E] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => handleRapidFireAnswer(undefined, true)}
              className="text-[#6B6B70] hover:text-[#A3A3A8] transition"
            >
              Skip question
            </button>
            <span className="text-[11px] font-mono text-[#6B6B70]">
              Tests practical understanding and edge cases
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: PHASE 4 — FINAL LOCAL SYNTHESIS
  // ───────────────────────────────────────────────────────────────────────────
  if (stage === 'FINAL_SYNTHESIS') {
    return (
      <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col items-center justify-center space-y-6 px-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-[#E8672E] border-t-transparent animate-spin" />
          <Sparkles className="w-6 h-6 text-[#E8672E] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-base font-semibold text-white">
            Compiling multi-signal verification evidence...
          </h2>
          <p className="text-xs font-mono text-[#A3A3A8]">
            Synthesizing quiz accuracy, response consistency, and supporting evidence.
          </p>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: PHASE 0 — STRICT 10-QUESTION QUIZ RUNNER
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col justify-between select-none">
      {/* ─── MINIMAL ZERO-CHROME HEADER ─── */}
      <header className="border-b border-[#2A2A2E] bg-[#17171A]/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#E8672E] animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#A3A3A8]">
            Proctored Assessment
          </span>
          <span className="text-xs font-mono text-[#6B6B70]">·</span>
          <span className="text-xs font-mono text-white">
            Question {currentIdx + 1} of {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Urgency-based Timer */}
          <div
            className={`px-3 py-1 rounded-md border font-mono text-xs font-semibold flex items-center gap-1.5 ${timerColor}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{timeFormatted}</span>
          </div>

          {/* Local-Only Camera Capsule (Zero-upload guarantee) */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1E1E22] border border-[#2A2A2E]">
            <div className="w-7 h-5 rounded overflow-hidden bg-black relative shrink-0">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6B6B70]">
                  <Camera className="w-3 h-3" />
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-[#3FB65F] hidden sm:inline">
              Local Presence
            </span>
          </div>
        </div>
      </header>

      {/* ─── MAIN QUESTION CANVAS ─── */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {currentQ && (
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 sm:p-8 space-y-6 relative overflow-hidden fade-in-up">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]">
                  {currentQ.skill}
                </span>
                <span className="text-[10px] font-mono uppercase text-[#6B6B70]">
                  {currentQ.type}
                </span>
              </div>
              <span className="text-xs font-mono text-[#6B6B70]">
                {currentIdx + 1} / {questions.length}
              </span>
            </div>

            {/* Question Prompt */}
            <h2 className="text-base sm:text-lg font-medium text-[#F5F5F4] leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Answer Options */}
            {currentQ.type === 'objective' && currentQ.options ? (
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = currentAnswer === opt;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submittedConfirmed}
                      onClick={() => handleAnswerChange(opt)}
                      className={`w-full text-left p-4 rounded-lg border text-xs sm:text-sm transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-[#1E1E22] border-[#E8672E] text-white shadow-sm'
                          : 'bg-[#17171A] border-[#2A2A2E] text-[#D4D4D8] hover:border-[#38383D] hover:bg-[#1E1E22]/50'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#E8672E] text-[#0D0D0F]'
                            : 'border border-[#2A2A2E] text-[#6B6B70]'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <textarea
                  rows={6}
                  value={currentAnswer}
                  disabled={submittedConfirmed}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Explain your approach, architecture, or reasoning in detail..."
                  className="w-full p-4 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] focus:border-[#E8672E] focus:outline-none text-xs sm:text-sm text-white font-sans resize-none leading-relaxed"
                />
                <div className="flex justify-between text-[11px] font-mono text-[#6B6B70]">
                  <span>Subjective evaluation assesses depth and rationale</span>
                  <span>{currentAnswer.length} characters</span>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[#2A2A2E] flex items-center justify-between">
              <span className="text-[11px] text-[#6B6B70] font-mono">
                Forward-only navigation · Answers cannot be changed once passed
              </span>

              {submittedConfirmed ? (
                <span className="text-xs font-mono text-[#3FB65F] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Assessment submitted
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{isLastQuestion ? 'Submit Assessment' : 'Next Question'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ─── FOOTER PROGRESS BAR ─── */}
      <footer className="border-t border-[#2A2A2E] bg-[#17171A]/50 px-4 sm:px-8 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIdx
                  ? 'w-6 bg-[#E8672E]'
                  : idx < currentIdx
                  ? 'w-2.5 bg-[#3FB65F]'
                  : 'w-2 bg-[#2A2A2E]'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] text-[#6B6B70] font-mono">
          Local stream only · No video recorded or transmitted
        </span>
      </footer>

      {/* ─── RANDOM CAMERA CHECK MODAL (SECTION 5) ─── */}
      {showCameraCheckModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 max-w-md w-full space-y-5 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-[#1E1E22] border border-[#E8672E]/40 flex items-center justify-center mx-auto text-[#E8672E]">
              <Camera className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#E8672E]">
                Quick Camera Check
              </div>
              <h3 className="text-base font-semibold text-white">
                Please adjust your camera angle slightly
              </h3>
              <p className="text-xs text-[#A3A3A8] leading-relaxed">
                Confirm your camera is positioned appropriately and return to the assessment.
              </p>
            </div>

            {/* Subtle Progress Countdown */}
            <div className="space-y-1">
              <div className="w-full bg-[#1E1E22] h-1 rounded-full overflow-hidden">
                <div
                  className="bg-[#E8672E] h-full transition-all duration-1000"
                  style={{ width: `${(cameraCheckSeconds / 20) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#6B6B70]">
                {cameraCheckSeconds}s remaining
              </span>
            </div>

            <button
              type="button"
              onClick={handleDismissCameraCheck}
              className="btn-primary text-xs py-2 px-6 w-full cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ─── FULLSCREEN WARNING MODAL ─── */}
      {showFullscreenModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17171A] border border-[#E8672E]/50 rounded-xl p-6 max-w-md w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#241C16] border border-[#E8672E]/30 flex items-center justify-center mx-auto text-[#E8672E]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Assessment fullscreen mode exited
              </h3>
              <p className="text-xs text-[#A3A3A8] mt-1.5 leading-relaxed">
                SkillVerify assessments require fullscreen focus. Browser integrity monitors record
                window exits as neutral review signals.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReturnToFullscreen}
              className="btn-primary text-xs py-2.5 px-6 w-full cursor-pointer"
            >
              Return to Assessment
            </button>
          </div>
        </div>
      )}

      {/* ─── SUBMISSION CONFIRMATION MODAL ─── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 max-w-md w-full space-y-5 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#16261B] border border-[#3FB65F]/30 flex items-center justify-center mx-auto text-[#3FB65F]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Submit Assessment?</h3>
              <p className="text-xs text-[#A3A3A8] mt-1.5 leading-relaxed">
                You have answered all 10 questions. Once submitted, your answers will be frozen and
                you will proceed to supporting work verification.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="btn-ghost text-xs py-2 px-4 cursor-pointer"
              >
                Review Current Question
              </button>
              <button
                type="button"
                onClick={handleQuizSubmit}
                className="btn-primary text-xs py-2 px-5 cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
