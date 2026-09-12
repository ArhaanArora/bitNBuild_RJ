import { Router } from 'express';
import multer from 'multer';
import { resumeVerificationService } from '../services/resumeVerification.service';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const hiringRouter = Router();

// Demo user fallback if no auth token provided
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * POST /api/hiring/get-verified/upload
 * Accept PDF only, validate magic bytes, return resumeId
 */
hiringRouter.post(
  '/get-verified/upload',
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const file = files?.file?.[0] || files?.resume?.[0];

      if (!file) {
        return res.status(400).json({ error: 'No resume file provided. Please upload a valid PDF.' });
      }

      // Client/MIME check
      if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) {
        return res.status(400).json({ error: 'Invalid file type. Only PDF files are supported.' });
      }

      const userId = req.user?.id || DEMO_USER_ID;
      const result = await resumeVerificationService.processResumeUpload(
        userId,
        file.originalname,
        file.buffer
      );

      res.json(result);
  } catch (err: any) {
    console.error('[HiringRouter] Upload error:', err);
    res.status(400).json({ error: err.message || 'Failed to process resume file.' });
  }
});

/**
 * POST /api/hiring/get-verified/analyze
 * Run Step A extraction + Step B generation of 10 questions
 */
hiringRouter.post('/get-verified/analyze', async (req, res) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) {
      return res.status(400).json({ error: 'Missing resumeId in request body.' });
    }

    const userId = req.user?.id || DEMO_USER_ID;
    const result = await resumeVerificationService.analyzeAndGenerateAssessment(resumeId, userId);

    res.json(result);
  } catch (err: any) {
    console.error('[HiringRouter] Analyze error:', err);
    res.status(500).json({ error: err.message || "We couldn't generate your assessment. Please try again." });
  }
});

/**
 * POST /api/hiring/get-verified/assessment/:id/start
 * Stamp startedAt, return deadline and clean question set
 */
hiringRouter.post('/get-verified/assessment/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await resumeVerificationService.startAssessment(id);
    res.json(result);
  } catch (err: any) {
    console.error('[HiringRouter] Start assessment error:', err);
    res.status(404).json({ error: err.message || 'Assessment session not found.' });
  }
});

/**
 * POST /api/hiring/get-verified/assessment/:id/integrity-event
 * Fire-and-forget logging of browser integrity events
 */
hiringRouter.post('/get-verified/assessment/:id/integrity-event', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    if (type) {
      await resumeVerificationService.logIntegrityEvent(id, type);
    }
    res.json({ success: true });
  } catch {
    res.json({ success: true }); // non-blocking fire-and-forget
  }
});

/**
 * POST /api/hiring/get-verified/assessment/:id/submit
 * Deterministic objective diff + AI subjective grading
 */
hiringRouter.post('/get-verified/assessment/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be submitted as an array.' });
    }

    const evaluation = await resumeVerificationService.submitAssessment(id, answers);
    res.json(evaluation);
  } catch (err: any) {
    console.error('[HiringRouter] Submit error:', err);
    res.status(500).json({ error: err.message || 'Failed to evaluate assessment submission.' });
  }
});

/**
 * GET /api/hiring/get-verified/assessment/:id/result
 * Return evaluation result
 */
hiringRouter.get('/get-verified/assessment/:id/result', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await resumeVerificationService.getAssessmentResult(id);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'Result not found.' });
  }
});

/**
 * GET /api/hiring/profile/:userId/verified-skills
 * Return merged verification state for hiring profile view
 */
hiringRouter.get('/profile/:userId/verified-skills', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await resumeVerificationService.getMergedVerifiedSkills(userId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch verified profile skills.' });
  }
});
