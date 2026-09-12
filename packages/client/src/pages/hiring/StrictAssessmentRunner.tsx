import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { AssessmentQuestion, SubmittedAnswer, IntegrityEvent } from '../../types/resumeAssessment';
import { AlertTriangle, Camera, Check, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StrictAssessmentRunner() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  // Assessment Data
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Timer (server-authoritative deadline)
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3600);

  // Fullscreen & Integrity Monitoring
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [integrityEventsCount, setIntegrityEventsCount] = useState(0);

  // Local Camera Preview
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Fire-and-forget integrity event logger
  const logIntegrityEvent = useCallback((type: IntegrityEvent['type']) => {
    setIntegrityEventsCount(prev => prev + 1);
    if (!assessmentId) return;
    api.post(`/hiring/get-verified/assessment/${assessmentId}/integrity-event`, {
      type,
      timestamp: new Date().toISOString(),
    }).catch(() => {});
  }, [assessmentId]);

  // Stop camera tracks cleanly
  const stopCameraTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }
  }, []);

  // 1. Initialize assessment and start timer
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

        setQuestions(data.questions || []);
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

    // Request local camera feed (local-only preview, no recording)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (!isMounted) {
            stream.getTracks().forEach(t => t.stop());
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

  // Connect camera stream to video tag whenever video tag becomes available
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [cameraActive, currentIdx]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!deadlineMs || submitting) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        toast.error('Time limit reached. Submitting assessment now...');
        handleFinalSubmit(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineMs, submitting]);

  // 3. Browser Integrity Event Listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submitting) {
        setShowFullscreenModal(true);
        logIntegrityEvent('fullscreen_exit');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !submitting) {
        logIntegrityEvent('visibility_hidden');
      }
    };

    const handleWindowBlur = () => {
      if (!submitting) {
        logIntegrityEvent('tab_blur');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitting) {
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
  }, [logIntegrityEvent, submitting]);

  // Handle re-entering fullscreen
  const handleReturnToFullscreen = async () => {
    setShowFullscreenModal(false);
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {}
  };

  // Answer handler
  const handleAnswerChange = (val: string) => {
    const currentQ = questions[currentIdx];
    if (!currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: val,
    }));
  };

  const currentQ = questions[currentIdx];
  const currentAnswer = currentQ ? (answers[currentQ.id] || '') : '';
  const isAnswered = Boolean(currentAnswer.trim());
  const isLastQuestion = currentIdx === questions.length - 1;

  const handleNext = () => {
    if (!isAnswered) {
      toast.error('Please provide an answer before continuing.');
      return;
    }

    if (isLastQuestion) {
      setShowSubmitModal(true);
    } else {
      setCurrentIdx(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Submit
  const handleFinalSubmit = async (forceTimeout = false) => {
    if (submitting) return;
    setSubmitting(true);
    setShowSubmitModal(false);

    stopCameraTracks();

    // Exit fullscreen if active
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {}
    }

    const payload: SubmittedAnswer[] = questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id] || '',
    }));

    try {
      await api.post(`/hiring/get-verified/assessment/${assessmentId}/submit`, {
        answers: payload,
        timedOut: forceTimeout,
      });
      navigate(`/hiring/assessment/${assessmentId}/result`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to evaluate assessment.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#E8672E] border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-[#A3A3A8]">Initialising server-verified assessment session...</p>
      </div>
    );
  }

  // Format seconds to mm:ss
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeWarning = secondsRemaining < 600; // under 10 min
  const isTimeCritical = secondsRemaining < 120; // under 2 min

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F4] flex flex-col justify-between select-none">
      {/* ─── MINIMAL PROCTOR HEADER ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#17171A] border-b border-[#2A2A2E] px-6 py-3 flex items-center justify-between">
        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {questions.map((q, idx) => {
              const answered = Boolean((answers[q.id] || '').trim());
              const isCurrent = idx === currentIdx;
              return (
                <div
                  key={q.id}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    isCurrent
                      ? 'bg-[#E8672E] ring-2 ring-[#E8672E]/40'
                      : answered
                      ? 'bg-[#3FB65F]'
                      : 'bg-[#2A2A2E]'
                  }`}
                  title={`Question ${idx + 1}`}
                />
              );
            })}
          </div>
          <span className="text-xs font-mono text-[#6B6B70] pl-2 border-l border-[#2A2A2E]">
            Question {currentIdx + 1} of {questions.length}
          </span>
        </div>

        {/* Center: Timer */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#6B6B70]">TIME REMAINING:</span>
          <span
            className={`font-mono font-bold text-sm tracking-widest ${
              isTimeCritical
                ? 'text-[#E0554E]'
                : isTimeWarning
                ? 'text-[#D89A3E]'
                : 'text-[#F5F5F4]'
            }`}
          >
            {timerFormatted}
          </span>
        </div>

        {/* Right: Local-Only Camera Capsule */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-16 h-12 rounded-lg bg-[#1E1E22] border border-[#2A2A2E] overflow-hidden flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <Camera className="w-4 h-4 text-[#6B6B70]" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#3FB65F] ring-2 ring-[#17171A]" />
          </div>
          <span className="hidden md:inline text-[10px] font-mono text-[#6B6B70]">
            Local Preview Only
          </span>
        </div>
      </header>

      {/* ─── QUESTION CANVAS ──────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 flex flex-col justify-center">
        {currentQ && (
          <div className="space-y-6">
            {/* Meta badges */}
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded bg-[#1E1E22] text-[#E8672E] border border-[#E8672E]/30 font-medium">
                {currentQ.skill}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1E1E22] text-[#A3A3A8] border border-[#2A2A2E]">
                {currentQ.type === 'objective' ? 'Objective MCQ' : 'Subjective Analysis'}
              </span>
              <span className="text-[10px] font-mono uppercase text-[#6B6B70]">
                Difficulty: {currentQ.difficulty}
              </span>
            </div>

            {/* Question Stem */}
            <h2 className="text-lg md:text-xl font-semibold text-[#F5F5F4] leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Objective MCQ choices */}
            {currentQ.type === 'objective' && currentQ.options && (
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = currentAnswer === opt;
                  const optionLetter = String.fromCharCode(65 + oIdx);
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleAnswerChange(opt)}
                      className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-colors flex items-start gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#241C16] border-[#E8672E] text-[#F5F5F4]'
                          : 'bg-[#17171A] border-[#2A2A2E] text-[#A3A3A8] hover:border-[#38383D] hover:bg-[#1E1E22] hover:text-[#F5F5F4]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#E8672E] text-[#0D0D0F]'
                            : 'bg-[#1E1E22] border border-[#2A2A2E] text-[#6B6B70]'
                        }`}
                      >
                        {optionLetter}
                      </div>
                      <span className="leading-relaxed flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Subjective textarea */}
            {currentQ.type === 'subjective' && (
              <div className="space-y-2 pt-2">
                <textarea
                  rows={8}
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Explain your approach, technical tradeoffs, and implementation reasoning in detail..."
                  className="input text-sm w-full font-sans leading-relaxed resize-none p-4"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-[#6B6B70]">
                  <span>Ground your answer in real systems architecture & production practices.</span>
                  <span>{currentAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── BOTTOM CONTROLS ──────────────────────────────────────────────── */}
      <footer className="sticky bottom-0 bg-[#17171A] border-t border-[#2A2A2E] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-xs font-mono text-[#6B6B70]">
            {isAnswered ? (
              <span className="text-[#3FB65F] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Answer recorded
              </span>
            ) : (
              'Answer required to advance'
            )}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={!isAnswered || submitting}
            className="btn-primary text-xs py-2 px-6 flex items-center gap-2 disabled:opacity-40 cursor-pointer"
          >
            <span>{isLastQuestion ? 'Review & Submit Assessment' : 'Next Question'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>

      {/* ─── FULLSCREEN EXIT WARNING MODAL ─────────────────────────────────── */}
      {showFullscreenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#17171A] border border-[#D89A3E]/40 rounded-xl p-6 max-w-md w-full space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#2B2213] border border-[#D89A3E]/30 flex items-center justify-center text-[#D89A3E] mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F5F4] font-mono">
                Assessment Fullscreen Mode Exited
              </h3>
              <p className="text-xs text-[#A3A3A8] mt-1.5 leading-relaxed">
                SkillVerify assessments are monitored for integrity. Browser focus loss or window resizing has been logged as an integrity signal.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReturnToFullscreen}
              className="btn-primary text-xs w-full py-2.5 cursor-pointer font-mono"
            >
              Return to Assessment
            </button>
          </div>
        </div>
      )}

      {/* ─── SUBMISSION CONFIRMATION MODAL ─────────────────────────────────── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 border-b border-[#2A2A2E] pb-3">
              <div className="w-8 h-8 rounded-lg bg-[#241C16] border border-[#E8672E]/30 flex items-center justify-center text-[#E8672E]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F5F5F4]">Submit Assessment</h3>
                <span className="text-[11px] text-[#6B6B70] font-mono">10 of 10 Questions Answered</span>
              </div>
            </div>

            <p className="text-xs text-[#A3A3A8] leading-relaxed">
              Once submitted, your answers will be evaluated via deterministic objective checking and AI rubric analysis. Your verified skill credentials will be updated immediately.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="btn-ghost text-xs flex-1 py-2"
              >
                Back to Review
              </button>
              <button
                type="button"
                onClick={() => handleFinalSubmit(false)}
                disabled={submitting}
                className="btn-primary text-xs flex-1 py-2"
              >
                {submitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
