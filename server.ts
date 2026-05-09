import 'dotenv/config';

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';

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

// Express
const app = express();

app.use(express.json());

// Health Route
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    gemini: !!genAI,
    firebase: true,
    timestamp: new Date().toISOString()
  });
});

// Events API
app.get('/api/events', async (_req, res) => {
  try {
    const snap = await db.collection('events').get();

    const events = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(events);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch events'
    });
  }
});

// Clubs API
app.get('/api/clubs', async (_req, res) => {
  try {
    const snap = await db.collection('clubs').get();

    const clubs = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(clubs);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch clubs'
    });
  }
});

// Jobs API
app.get('/api/jobs', async (_req, res) => {
  try {
    const snap = await db.collection('jobs').get();

    const jobs = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(jobs);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch jobs'
    });
  }
});

// AI Assistant
app.post('/api/ai', async (req, res) => {
  try {
    const { question } = req.body;

    if (!genAI) {
      return res.json({
        answer:
          'Gemini API key missing. Add GEMINI_API_KEY in .env file.'
      });
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: question
            }
          ]
        }
      ]
    });

    res.json({
      answer: response.text
    });
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// Start Vite + Express Server
async function startServer() {
  const vite = await createViteServer({
    server: {
      middlewareMode: true
    },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  const PORT = Number(process.env.PORT) || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();