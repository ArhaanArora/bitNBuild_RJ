import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import { authRouter } from './auth/router';
import { profilesRouter } from './profiles/router';
import { skillsRouter } from './skills/router';
import { projectsRouter } from './projects/router';
import { assessmentsRouter } from './assessments/router';
import { sessionsRouter } from './sessions/router';
import { hackathonsRouter } from './hackathons/router';
import { teamsRouter } from './teams/router';
import { verificationRouter } from './verification/router';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

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

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});

export default app;
