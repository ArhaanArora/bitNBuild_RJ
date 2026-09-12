import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

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

const app = express();
const PORT = process.env.PORT || 4000;

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

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve uploaded files
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

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
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});

export default app;
