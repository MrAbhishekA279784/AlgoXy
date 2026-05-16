import 'dotenv/config';

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';
import fs from 'fs/promises';

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

// Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

// Gemini
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

const genAI = GEMINI_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_KEY
    })
  : null;

// Routers
import jobRoutes from './src/routes/jobRoutes';
import careerRoutes from './src/routes/careerRoutes';
import interviewRoutes from './src/routes/interviewRoutes';
import testRoutes from './src/routes/testRoutes';
import communityRoutes from './src/routes/communityRoutes';
import { firestoreQuery, firestoreGet } from './src/services/firebaseService';

// Express
const app = express();

app.use(express.json());

// Basic in-memory rate limiting map
const rateLimits = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 1000;

app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let record = rateLimits.get(ip);
  if (!record || record.resetTime < now) {
    record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
  } else {
    record.count++;
  }
  rateLimits.set(ip, record);

  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }
  next();
});

// Health Route
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    gemini: !!genAI,
    firebase: !!db,
    timestamp: new Date().toISOString()
  });
});

// Mount Routers
app.use('/api/jobs', jobRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/test', testRoutes);
app.use('/api/community', communityRoutes);

// Events API (keeping as is or could move to router)
app.get('/api/events', async (_req, res) => {
  try {
    const snap = await db.collection('events').get();
    const events = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Clubs API
app.get('/api/clubs', async (_req, res) => {
  try {
    const snap = await db.collection('clubs').get();
    const clubs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

// Leaderboard API
app.get('/api/leaderboard', async (_req, res) => {
  try {
    const users = await firestoreQuery('users', [['role', '==', 'student']]);
    users.sort((a, b) => (b.points || 0) - (a.points || 0));
    res.json(users.slice(0, 10));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Admin Stats
app.get('/api/admin/stats', async (_req, res) => {
  try {
    const [users, jobs, events] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('jobs').count().get(),
      db.collection('events').count().get(),
    ]);
    res.json({
      totalUsers: users.data().count,
      totalJobs: jobs.data().count,
      totalEvents: events.data().count,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Profile API
app.get('/api/profile/:uid', async (req, res) => {
  try {
    const user = await firestoreGet('users', req.params.uid);
    if (user) res.json(user);
    else res.status(404).json({ error: 'User not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Cache for AI context data
let aiContextCache = '';
let lastCacheUpdate = 0;

async function getAiContext() {
  const now = Date.now();
  if (aiContextCache && now - lastCacheUpdate < 3600000) return aiContextCache;
  try {
    const dataDir = path.join(__dirname, 'src', 'data'); // data is in src
    let context = 'You are a helpful AI Career Assistant for TCET students.\n';
    try {
      const rolesData = await fs.readFile(path.join(dataDir, 'roleProfiles.json'), 'utf-8');
      context += `\nRole Profiles Information:\n${rolesData.substring(0, 2000)}...`;
    } catch(e) {}
    aiContextCache = context;
    lastCacheUpdate = now;
    return context;
  } catch (err) {
    return 'You are a helpful AI Career Assistant for TCET students.';
  }
}

// AI Assistant (legacy/fallback)
app.post('/api/ai', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });
    if (!genAI) return res.json({ answer: 'Gemini API key missing.' });
    const context = await getAiContext();
    const response = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent(`${context}\n\nUser Question: ${question}`);
    res.json({ answer: response.response.text() });
  } catch (err: any) {
    res.status(500).json({ error: 'AI failed' });
  }
});

// Start Vite + Express Server
async function startServer() {
  try {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();