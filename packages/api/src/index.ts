import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { authRouter } from './auth/router';
import { profilesRouter } from './profiles/router';
import { skillsRouter } from './skills/router';
import { projectsRouter } from './projects/router';
import { assessmentsRouter } from './assessments/router';
import { sessionsRouter } from './sessions/router';
import { hackathonsRouter } from './hackathons/router';
import { teamsRouter } from './teams/router';
import { verificationRouter } from './verification/router';
import { analysisRouter } from './analysis/router';
import { notificationsRouter } from './notifications/router';
import { adminRouter } from './admin/router';
import { adminAuthRouter } from './admin/auth.router';
import { adminSecurityRouter } from './admin/security.router';
import { hiringRouter } from './hiring/router';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Compression ───────────────────────────────────────────────────────────────
// Gzip all responses > 1KB. Reduces JSON payloads by 60-80%.
app.use(compression({ level: 6, threshold: 1024 }));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ─── Security & Cache Headers ──────────────────────────────────────────────────
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cache control: API responses should not be cached by default
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve uploaded files with aggressive caching (24h) — they are immutable after upload
import os from 'os';
const uploadDir = process.env.UPLOAD_DIR || (process.env.VERCEL ? os.tmpdir() : './uploads');
app.use('/uploads', express.static(path.resolve(uploadDir), {
  maxAge: '24h',
  etag: true,
  lastModified: true,
}));


// Routes
app.use('/api/auth', authRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/hackathons', hackathonsRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/security', adminSecurityRouter);
app.use('/api/admin', adminRouter);
app.use('/api/hiring', hiringRouter);

import { cmsService } from './services/cms.service';

app.get('/api/public/cms/:slug', async (req, res) => {
  try {
    const page = await cmsService.getPublicPageData(req.params.slug);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json({ page });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch public CMS data' });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

process.on('unhandledRejection', (reason) => {
  console.warn('Unhandled Rejection detected:', reason);
});

process.on('uncaughtException', (err) => {
  console.warn('Uncaught Exception captured:', err.message);
});

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
  });
}

export default app;
