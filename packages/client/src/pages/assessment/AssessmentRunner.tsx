import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

interface Question {
  id: string; type: 'mcq' | 'short_answer' | 'practical';
  body: string; options?: { id: string; text: string }[];
  points: number; expectedTimeSec: number; order: number;
  adaptiveFollowup?: string;
}

interface Session { id: string; status: string; expiresAt: string; assessmentId: string; }
interface Assessment { id: string; title: string; durationMinutes: number; questions: Question[]; }

const CAMERA_PROMPTS = [
  'Turn your camera to the left and show the area around you.',
  'Show your desk and any materials in front of you.',
  'Turn your camera to the right side.',
  'Hold up both hands clearly in front of the camera.',
  'Show the room behind you briefly.',
];

export default function AssessmentRunner() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionStart, setQuestionStart] = useState<Date>(new Date());
  const [timeLeft, setTimeLeft] = useState(0);
  const [integrityEvents, setIntegrityEvents] = useState<{ type: string; ts: Date }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [adaptiveFollowup, setAdaptiveFollowup] = useState<string | null>(null);
  const [adaptiveAnswer, setAdaptiveAnswer] = useState('');
  const [cameraCheck, setCameraCheck] = useState<{ prompt: string; checkId?: string; timeLeft: number } | null>(null);
  const [roughWorkFiles, setRoughWorkFiles] = useState<File[]>([]);
  const [showRoughWork, setShowRoughWork] = useState(false);
  const cameraTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cameraCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load session + assessment
  useEffect(() => {
    const load = async () => {
      try {
        const { data: sess } = await api.get(`/sessions/${sessionId}`);
        setSession(sess);
        const { data: ass } = await api.get(`/assessments/${sess.assessmentId}`);
        setAssessment(ass);
        const remaining = Math.max(0, Math.floor((new Date(sess.expiresAt).getTime() - Date.now()) / 1000));
        setTimeLeft(remaining);
      } catch { toast.error('Could not load assessment'); navigate('/dashboard'); }
    };
    load();
  }, [sessionId, navigate]);

  // Global countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { handleSubmit(); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [timeLeft > 0]);

  // Integrity event listeners
  useEffect(() => {
    const log = (type: string) => async () => {
      const evt = { type, ts: new Date() };
      setIntegrityEvents(prev => [...prev, evt]);
      try { await api.post(`/sessions/${sessionId}/event`, { eventType: type }); } catch {}
    };
    const onVisibility = () => { if (document.visibilityState === 'hidden') log('TAB_SWITCH')(); };
    const onBlur = log('TAB_SWITCH');
    const onCopy = log('COPY_ATTEMPT');
    const onPaste = log('PASTE_ATTEMPT');
    const onCut = log('CUT_ATTEMPT');
    const onCtxMenu = log('RIGHT_CLICK');
    const onFullscreen = () => { if (!document.fullscreenElement) log('FULLSCREEN_EXIT')(); };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('cut', onCut);
    document.addEventListener('contextmenu', onCtxMenu);
    document.addEventListener('fullscreenchange', onFullscreen);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('contextmenu', onCtxMenu);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, [sessionId]);

  // Random camera check (every 5-8 minutes, ~3-4 times total)
  useEffect(() => {
    if (!assessment) return;
    const scheduleCheck = () => {
      const delay = (300 + Math.random() * 180) * 1000;
      cameraCheckRef.current = setTimeout(async () => {
        const prompt = CAMERA_PROMPTS[Math.floor(Math.random() * CAMERA_PROMPTS.length)];
        let cameraTimeLeft = 25;
        setCameraCheck({ prompt, timeLeft: cameraTimeLeft });

        cameraTimerRef.current = setInterval(() => {
          cameraTimeLeft--;
          setCameraCheck(prev => prev ? { ...prev, timeLeft: cameraTimeLeft } : null);
          if (cameraTimeLeft <= 0) {
            // Timed out
            api.post(`/sessions/${sessionId}/camera`, { promptType: prompt, passed: false, timedOut: true });
            setCameraCheck(null);
            scheduleCheck();
          }
        }, 1000);
      }, delay) as any;
    };
    scheduleCheck();
    return () => {
      if (cameraCheckRef.current) clearTimeout(cameraCheckRef.current);
      if (cameraTimerRef.current) clearInterval(cameraTimerRef.current);
    };
  }, [assessment, sessionId]);

  const handleCameraResponse = async (passed: boolean) => {
    if (cameraTimerRef.current) clearInterval(cameraTimerRef.current);
    await api.post(`/sessions/${sessionId}/camera`, { promptType: cameraCheck?.prompt, passed, timedOut: false });
    setCameraCheck(null);
  };

  const currentQuestion = assessment?.questions[currentIdx];

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    try {
      const res = await api.post(`/sessions/${sessionId}/answer`, {
        questionId: currentQuestion.id, answer,
        startedAt: questionStart.toISOString(), answeredAt: new Date().toISOString(),
      });
      if (res.data.adaptiveFollowup) setAdaptiveFollowup(res.data.adaptiveFollowup);
    } catch {}
  };

  const goNext = () => {
    setAdaptiveFollowup(null); setAdaptiveAnswer('');
    if (currentIdx < (assessment?.questions.length ?? 0) - 1) {
      setCurrentIdx(i => i + 1);
      setQuestionStart(new Date());
    } else {
      setShowRoughWork(true);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Upload rough work if any
      if (roughWorkFiles.length > 0) {
        const fd = new FormData();
        roughWorkFiles.forEach(f => fd.append('files', f));
        await api.post(`/sessions/${sessionId}/roughwork`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      await api.post(`/sessions/${sessionId}/submit`, {});
      navigate(`/assessment/${sessionId}/result`);
    } catch { toast.error('Submission failed'); setSubmitting(false); }
  }, [sessionId, roughWorkFiles, submitting, navigate]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!assessment || !session) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  const progress = ((currentIdx + 1) / assessment.questions.length) * 100;
  const isTimeCritical = timeLeft < 120;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" onContextMenu={e => e.preventDefault()}>
      {/* Camera check overlay */}
      {cameraCheck && (
        <div className="camera-overlay">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5 max-w-md w-full mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#E8672E]">Camera Check (Integrity)</span>
              <span className="text-xs font-mono font-bold text-[#D89A3E]">⏱ {cameraCheck.timeLeft}s</span>
            </div>
            <p className="text-sm text-[#F5F5F4] leading-relaxed">{cameraCheck.prompt}</p>
            <p className="text-xs text-[#6B6B70]">This is a quick periodic check. Failure to respond will be logged as an integrity anomaly.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleCameraResponse(false)} className="btn-ghost text-xs flex-1 py-2">Can't do this</button>
              <button onClick={() => handleCameraResponse(true)} className="btn-primary text-xs flex-1 py-2">Done ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* Rough work modal */}
      {showRoughWork && (
        <div className="camera-overlay">
          <div className="bg-[#17171A] border border-[#2A2A2E] rounded-xl p-5 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-sm font-semibold text-[#F5F5F4] uppercase font-mono tracking-wider">Submit Rough Work (Optional)</h3>
            <p className="text-xs text-[#A3A3A8] leading-relaxed">Upload any rough work sheets, notes, or sketches used during the assessment. This serves as supporting evidence.</p>
            <input
              type="file" accept="image/*" multiple
              onChange={e => setRoughWorkFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-xs text-[#A3A3A8] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#1E1E22] file:text-[#F5F5F4] file:border file:border-[#2A2A2E] hover:file:bg-[#2A2A2E] cursor-pointer"
            />
            {roughWorkFiles.length > 0 && (
              <ul className="text-xs text-[#A3A3A8] space-y-1 font-mono">
                {roughWorkFiles.map(f => <li key={f.name}>✓ {f.name}</li>)}
              </ul>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowRoughWork(false); handleSubmit(); }} className="btn-ghost text-xs flex-1 py-2">Skip</button>
              <button onClick={() => { setShowRoughWork(false); handleSubmit(); }} className="btn-primary text-xs flex-1 py-2" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrity banner */}
      {integrityEvents.length > 0 && (
        <div className="bg-[#2B2213] border-b border-[#D89A3E]/30 text-[#D89A3E] text-xs px-6 py-2 flex items-center justify-between font-mono">
          <span>⚠ Integrity event recorded: {integrityEvents[integrityEvents.length - 1]?.type?.replace(/_/g, ' ')}</span>
          <span className="opacity-70">{integrityEvents.length} event(s) total</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#17171A] border-b border-[#2A2A2E] px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#F5F5F4]">{assessment.title}</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="h-1.5 bg-[#1E1E22] rounded-full overflow-hidden flex-1 max-w-48">
              <div className="h-full bg-[#E8672E] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-[#6B6B70] font-mono">{currentIdx + 1} / {assessment.questions.length}</span>
          </div>
        </div>
        <div className={`font-mono font-bold text-base ${isTimeCritical ? 'text-[#E0554E] animate-pulse' : 'text-[#A3A3A8]'}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {currentQuestion && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded border ${
                currentQuestion.type === 'mcq'
                  ? 'border-[#3FB65F]/30 bg-[#16261B] text-[#3FB65F]'
                  : currentQuestion.type === 'practical'
                  ? 'border-[#E8672E]/30 bg-[#241C16] text-[#E8672E]'
                  : 'border-[#2A2A2E] bg-[#1E1E22] text-[#A3A3A8]'
              }`}>
                {currentQuestion.type === 'mcq' ? 'Multiple Choice' : currentQuestion.type === 'practical' ? 'Practical' : 'Short Answer'}
              </span>
              <span className="text-xs text-[#6B6B70] font-mono">{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</span>
            </div>

            <p className="text-base text-[#F5F5F4] leading-relaxed whitespace-pre-wrap">{currentQuestion.body}</p>

            {/* MCQ */}
            {currentQuestion.type === 'mcq' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(opt.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-colors ${
                      answers[currentQuestion.id] === opt.id
                        ? 'border-[#E8672E] bg-[#241C16] text-[#F5F5F4]'
                        : 'border-[#2A2A2E] bg-[#17171A] text-[#A3A3A8] hover:border-[#38383D] hover:bg-[#1E1E22] hover:text-[#F5F5F4]'
                    }`}
                  >
                    <span className="font-mono text-[#6B6B70] mr-2.5">{opt.id.toUpperCase()}.</span> {opt.text}
                  </button>
                ))}
              </div>
            )}

            {/* Short answer / Practical */}
            {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'practical') && (
              <textarea
                rows={currentQuestion.type === 'practical' ? 12 : 5}
                className="input font-mono text-sm resize-none w-full"
                placeholder={currentQuestion.type === 'practical' ? 'Write your code or solution here…' : 'Write your explanation here…'}
                value={answers[currentQuestion.id] ?? ''}
                onChange={e => handleAnswer(e.target.value)}
              />
            )}

            {/* Adaptive follow-up */}
            {adaptiveFollowup && (
              <div className="bg-[#2B2213] border border-[#D89A3E]/30 rounded-xl p-4 space-y-2">
                <p className="text-xs text-[#D89A3E] font-mono font-medium">⚡ QUICK FOLLOW-UP (INTEGRITY CHECK)</p>
                <p className="text-sm text-[#F5F5F4]">{adaptiveFollowup}</p>
                <textarea
                  rows={3}
                  className="input text-sm w-full"
                  placeholder="Brief explanation in your own words…"
                  value={adaptiveAnswer}
                  onChange={e => setAdaptiveAnswer(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-[#2A2A2E]">
              <button onClick={goNext} className="btn-primary text-xs py-2 px-6">
                {currentIdx < assessment.questions.length - 1 ? 'Next Question →' : 'Review & Submit Assessment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
