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
          <div className="card max-w-md w-full mx-4 text-center border-amber-600 pulse-ring">
            <div className="text-amber-400 text-3xl mb-3">📷</div>
            <h3 className="text-lg font-bold text-white mb-2">Camera Verification</h3>
            <p className="text-gray-300 mb-4">{cameraCheck.prompt}</p>
            <div className={`text-4xl font-bold mb-4 ${cameraCheck.timeLeft <= 5 ? 'text-red-400' : 'text-amber-400'}`}>
              {cameraCheck.timeLeft}s
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleCameraResponse(false)} className="btn-ghost flex-1">Can't do this</button>
              <button onClick={() => handleCameraResponse(true)} className="btn-accent flex-1">Done ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* Rough work modal */}
      {showRoughWork && (
        <div className="camera-overlay">
          <div className="card max-w-md w-full mx-4">
            <h3 className="section-title">Submit Rough Work (Optional)</h3>
            <p className="text-sm text-gray-400 mb-4">Upload any rough work sheets, notes, or sketches used during the assessment. This serves as supporting evidence.</p>
            <input
              type="file" accept="image/*" multiple
              onChange={e => setRoughWorkFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 mb-4"
            />
            {roughWorkFiles.length > 0 && (
              <ul className="text-xs text-gray-400 mb-4 space-y-1">
                {roughWorkFiles.map(f => <li key={f.name}>✓ {f.name}</li>)}
              </ul>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowRoughWork(false); handleSubmit(); }} className="btn-ghost flex-1">Skip</button>
              <button onClick={() => { setShowRoughWork(false); handleSubmit(); }} className="btn-primary flex-1" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Assessment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrity banner */}
      {integrityEvents.length > 0 && (
        <div className="integrity-banner">
          ⚠ Integrity event recorded: {integrityEvents[integrityEvents.length - 1]?.type?.replace(/_/g, ' ')}
          <span className="ml-auto text-xs opacity-70">{integrityEvents.length} event(s) total</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{assessment.title}</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="score-bar flex-1 max-w-48"><div className="score-fill bg-indigo-500" style={{ width: `${progress}%` }} /></div>
            <span className="text-xs text-gray-400">{currentIdx + 1} / {assessment.questions.length}</span>
          </div>
        </div>
        <div className={`font-mono font-bold text-lg ${isTimeCritical ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </header>

      {/* Question */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {currentQuestion && (
          <div className="fade-in-up space-y-6">
            <div className="flex items-center gap-3">
              <span className={`badge ${currentQuestion.type === 'mcq' ? 'badge-verified' : currentQuestion.type === 'practical' ? 'badge-in-progress' : 'badge-unverified'}`}>
                {currentQuestion.type === 'mcq' ? 'Multiple Choice' : currentQuestion.type === 'practical' ? 'Practical' : 'Short Answer'}
              </span>
              <span className="text-xs text-gray-500">{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</span>
            </div>

            <p className="text-base text-gray-100 leading-relaxed whitespace-pre-wrap">{currentQuestion.body}</p>

            {/* MCQ */}
            {currentQuestion.type === 'mcq' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(opt.id)}
                    className={`w-full text-left p-3.5 rounded-lg border text-sm transition-all ${answers[currentQuestion.id] === opt.id ? 'border-indigo-500 bg-indigo-900/20 text-white' : 'border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800'}`}
                  >
                    <span className="font-medium text-gray-500 mr-2">{opt.id.toUpperCase()}.</span> {opt.text}
                  </button>
                ))}
              </div>
            )}

            {/* Short answer / Practical */}
            {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'practical') && (
              <textarea
                rows={currentQuestion.type === 'practical' ? 12 : 5}
                className="input font-mono text-sm resize-none"
                placeholder={currentQuestion.type === 'practical' ? 'Write your code or solution here…' : 'Write your explanation here…'}
                value={answers[currentQuestion.id] ?? ''}
                onChange={e => handleAnswer(e.target.value)}
              />
            )}

            {/* Adaptive follow-up */}
            {adaptiveFollowup && (
              <div className="card border-amber-700/50 bg-amber-900/10">
                <p className="text-xs text-amber-400 font-medium mb-2">⚡ Quick follow-up (integrity check)</p>
                <p className="text-sm text-gray-200 mb-3">{adaptiveFollowup}</p>
                <textarea
                  rows={3}
                  className="input text-sm"
                  placeholder="Brief explanation…"
                  value={adaptiveAnswer}
                  onChange={e => setAdaptiveAnswer(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end">
              <button onClick={goNext} className="btn-primary px-8">
                {currentIdx < assessment.questions.length - 1 ? 'Next →' : 'Review & Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
