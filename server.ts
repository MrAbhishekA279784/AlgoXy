<<<<<<< HEAD
import 'dotenv/config';
=======
<<<<<<< HEAD
import 'dotenv/config';
=======
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
<<<<<<< HEAD
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const firebaseConfig = require('./firebase-applet-config.json');

// ─── Firebase Admin ─────────────────────────────────────────────────────────
let db: admin.firestore.Firestore | null = null;
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
  }
  db = admin.firestore();
} catch (e) {
  console.warn('[Firebase] Admin SDK init failed – will use local fallbacks only.');
}

// ─── Gemini ──────────────────────────────────────────────────────────────────
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const isGeminiAvailable = () =>
  !!GEMINI_KEY && GEMINI_KEY !== 'YOUR_GEMINI_API_KEY' && !GEMINI_KEY.includes('TODO');

const genAI = isGeminiAvailable()
  ? new GoogleGenAI({ apiKey: GEMINI_KEY })
  : null;

async function callGemini(prompt: string, json = false): Promise<string> {
  if (!genAI) throw new Error('Gemini unavailable');
  const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    ...(json ? { config: { responseMimeType: 'application/json' } } : {}),
  });
  let text = response.text || '';
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

// ─── Local JSON Banks ─────────────────────────────────────────────────────────
function loadJSON(file: string): any {
  try {
    return JSON.parse(readFileSync(path.join(__dirname, 'data', file), 'utf-8'));
  } catch {
    return null;
  }
}

const interviewBank: any = loadJSON('interviewBank.json') || {};
const mcqBank: any = loadJSON('mcqBank.json') || {};
const roleSkillMap: any = loadJSON('roleSkillMap.json') || {};
const roleProfiles: any = loadJSON('roleProfiles.json') || {};

// ─── In-Memory Cache ──────────────────────────────────────────────────────────
const cache: Map<string, { value: any; expires: number }> = new Map();
const CACHE_TTL = {
  jobs: 60 * 60 * 1000,       // 1 hour
  interview: 24 * 60 * 60 * 1000, // 24h
  test: 24 * 60 * 60 * 1000,
  career: 60 * 60 * 1000,
};

function cacheGet(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) { cache.delete(key); return null; }
  return entry.value;
}
function cacheSet(key: string, value: any, ttl = CACHE_TTL.career): void {
  cache.set(key, { value, expires: Date.now() + ttl });
}

// ─── Firestore helpers (safe, never throw) ────────────────────────────────────
async function firestoreGet(collection: string, id: string): Promise<any | null> {
  if (!db) return null;
  try {
    const snap = await db.collection(collection).doc(id).get();
    return snap.exists ? snap.data() : null;
  } catch { return null; }
}
async function firestoreQuery(col: string, filters: [string, any, any][] = []): Promise<any[]> {
  if (!db) return [];
  try {
    let q: any = db.collection(col);
    for (const [field, op, val] of filters) q = q.where(field, op, val);
    const snap = await q.get();
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
  } catch { return []; }
}
async function firestoreAdd(col: string, data: any): Promise<string | null> {
  if (!db) return null;
  try {
    const ref = await db.collection(col).add({ ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return ref.id;
  } catch { return null; }
}
async function firestoreSet(col: string, id: string, data: any, merge = true): Promise<boolean> {
  if (!db) return false;
  try {
    await db.collection(col).doc(id).set(data, { merge });
    return true;
  } catch { return false; }
}
async function firestoreUpdate(col: string, id: string, data: any): Promise<boolean> {
  if (!db) return false;
  try {
    await db.collection(col).doc(id).update(data);
    return true;
  } catch { return false; }
}
async function firestoreDelete(col: string, id: string): Promise<boolean> {
  if (!db) return false;
  try {
    await db.collection(col).doc(id).delete();
    return true;
  } catch { return false; }
}

// ─── Fallback data ─────────────────────────────────────────────────────────────
const FALLBACK_JOBS = [
  { id: 'seed-1', company: 'Google', role: 'Software Engineer', location: 'Bangalore, India', type: 'Full-time', salary: '₹25,00,000 / year', posted: '1d ago', apply_url: 'https://careers.google.com', skills: ['React', 'Python', 'DSA'] },
  { id: 'seed-2', company: 'Microsoft', role: 'Frontend Developer', location: 'Hyderabad, India', type: 'Full-time', salary: '₹20,00,000 / year', posted: '3d ago', apply_url: 'https://careers.microsoft.com', skills: ['React', 'TypeScript'] },
  { id: 'seed-3', company: 'Amazon', role: 'Backend Developer', location: 'Chennai, India', type: 'Full-time', salary: '₹22,00,000 / year', posted: '2d ago', apply_url: 'https://amazon.jobs', skills: ['Java', 'AWS'] },
  { id: 'seed-4', company: 'Internshala', role: 'Web Development Intern', location: 'Remote', type: 'Internship', salary: '₹15,000 / month', posted: 'Just now', apply_url: 'https://internshala.com', skills: ['HTML', 'CSS', 'JS'] },
  { id: 'seed-5', company: 'LinkedIn', role: 'Product Management Intern', location: 'Mumbai, India', type: 'Internship', salary: '₹40,000 / month', posted: '2h ago', apply_url: 'https://linkedin.com', skills: ['Product', 'Agile'] },
  { id: 'seed-6', company: 'Flipkart', role: 'Data Science Intern', location: 'Bangalore, India', type: 'Internship', salary: '₹30,000 / month', posted: '1d ago', apply_url: 'https://flipkart.com', skills: ['Python', 'ML'] },
  { id: 'seed-7', company: 'TCS', role: 'Systems Engineer', location: 'Mumbai, India', type: 'Full-time', salary: '₹7,00,000 / year', posted: '5d ago', apply_url: 'https://tcs.com/careers', skills: ['Java', 'SQL'] },
  { id: 'seed-8', company: 'Wipro', role: 'Cloud Engineer', location: 'Pune, India', type: 'Full-time', salary: '₹8,50,000 / year', posted: '4d ago', apply_url: 'https://wipro.com/careers', skills: ['AWS', 'Docker'] },
];

const FALLBACK_EVENTS = [
  { id: '1', title: 'CodeStorm 2026', subtitle: 'National Level Hackathon', date: '20 - 22 Apr 2026', location: 'Online', icon: '💻' },
  { id: '2', title: 'AI Workshop', subtitle: 'By Google Developer Group', date: '25 Apr 2026', location: 'Auditorium', icon: '🤖' },
  { id: '3', title: 'Tech Talk', subtitle: 'Career in Data Science', date: '30 Apr 2026', location: 'Seminar Hall', icon: '📊' },
];

const FALLBACK_CLUBS = [
  { id: '1', name: 'Coding Club', members: '1200 Members', description: 'Building. Learning. Growing.', icon: '💻' },
  { id: '2', name: 'Robotics Club', members: '850 Members', description: 'Innovate. Build. Automate.', icon: '⚙️' },
  { id: '3', name: 'AI Club', members: '950 Members', description: 'Explore. Learn. Implement.', icon: '🧠' },
];

const FALLBACK_POSTS = [
  { id: 'fp-1', authorName: 'Rahul Sharma', authorAvatar: 'https://i.pravatar.cc/150?u=rahul', time: '2h ago', content: 'Just cleared TCS Digital! The AI mock interviews here really helped. 🙌', likesCount: 24, comments: 5 },
  { id: 'fp-2', authorName: 'Priya Patel', authorAvatar: 'https://i.pravatar.cc/150?u=priya', time: '5h ago', content: 'Looking for teammates for Smart India Hackathon. Need React + Node.js devs!', likesCount: 15, comments: 8 },
];

// ─── Interview helpers ─────────────────────────────────────────────────────────
function getInterviewQuestionsFromBank(category: string, company: string, role: string): string[] {
  const catBank = interviewBank[category] || {};
  const companyBank = catBank[company] || {};
  const questions = companyBank[role] || interviewBank.generic || [];
  return questions;
}

function buildInitialInterviewMessage(category: string, company: string, role: string): string {
  const questions = getInterviewQuestionsFromBank(category, company, role);
  const q = questions[0] || `Tell me about yourself and your interest in the ${role} role at ${company}.`;
  return `Hello! I'm your AI interviewer for the ${role} position at ${company}. We'll go through 10 questions today. Let's begin!\n\n**Question 1:** ${q}`;
}

function getNextQuestionFromBank(category: string, company: string, role: string, questionIndex: number): string | null {
  const questions = getInterviewQuestionsFromBank(category, company, role);
  if (questionIndex < questions.length) return questions[questionIndex];
  return null;
}

// ─── MCQ helpers ───────────────────────────────────────────────────────────────
function getMCQsFromBank(category: string, role: string, count = 10): any[] {
  const catBank = mcqBank[category] || {};
  const roleQuestions: any[] = catBank[role] || [];
  if (roleQuestions.length >= count) {
    // Shuffle and return requested count
    return [...roleQuestions].sort(() => Math.random() - 0.5).slice(0, count);
  }
  // Merge from generic tech pool if needed
  const allPooled: any[] = [];
  for (const cat of Object.values(mcqBank)) {
    for (const qs of Object.values(cat as any)) allPooled.push(...(qs as any[]));
  }
  const combined = [...roleQuestions, ...allPooled.filter(q => !roleQuestions.includes(q))];
  return combined.sort(() => Math.random() - 0.5).slice(0, count);
}

// ─── Career guidance helpers ───────────────────────────────────────────────────
function calculateReadinessScore(userSkills: string[], targetRole: string): { score: number; missing: string[]; matched: string[] } {
  const roleData = roleSkillMap[targetRole];
  if (!roleData) return { score: 50, missing: [], matched: userSkills };
  const required: string[] = roleData.required || [];
  const preferred: string[] = roleData.preferred || [];
  const matched = required.filter((s: string) => userSkills.some(us => us.toLowerCase().includes(s.toLowerCase())));
  const matchedPref = preferred.filter((s: string) => userSkills.some(us => us.toLowerCase().includes(s.toLowerCase())));
  const missing = required.filter((s: string) => !matched.includes(s));
  const score = Math.round(
    ((matched.length / Math.max(required.length, 1)) * 70) +
    ((matchedPref.length / Math.max(preferred.length, 1)) * 30)
  );
  return { score, missing, matched };
}

function getBestRole(userSkills: string[], cgpa: number): string {
  let best = 'Software Engineer';
  let bestScore = -1;
  for (const [role, data] of Object.entries(roleSkillMap as any)) {
    const { score } = calculateReadinessScore(userSkills, role);
    const meetsMin = cgpa >= (data as any).minCGPA;
    const weighted = score * (meetsMin ? 1.2 : 0.8);
    if (weighted > bestScore) { bestScore = weighted; best = role; }
  }
  return best;
}

function generateLocalCareerGuidance(userProfile: any, testData: any[], interviewData: any[]) {
  const skills = userProfile.skills || [];
  const cgpa = parseFloat(userProfile.cgpa || '0');
  const attendance = parseFloat(userProfile.attendance || '0');

  const topRole = getBestRole(skills, cgpa);
  const { missing, score } = calculateReadinessScore(skills, topRole);
  const profile = roleProfiles[topRole];

  let placementCat = 'Not Eligible';
  if (cgpa >= 8.5 && attendance >= 75) placementCat = 'Category 1';
  else if (cgpa >= 7.5 && attendance >= 60) placementCat = 'Category 2';
  else if (cgpa >= 7.0 && attendance >= 60) placementCat = 'Category 3';

  const avgTestScore = testData.length > 0
    ? Math.round(testData.reduce((a: number, t: any) => a + (t.score || 0), 0) / testData.length)
    : null;

  const skillTip = missing.length > 0
    ? `Focus on learning ${missing.slice(0, 2).join(' and ')} to strengthen your profile for ${topRole}.`
    : `You have the core skills for ${topRole}. Now build real projects to stand out.`;

  const interviewTip = avgTestScore !== null
    ? `Your average mock test score is ${avgTestScore}%. ${avgTestScore < 60 ? 'Practice more DSA problems daily.' : 'Great performance! Try a hard interview round next.'}`
    : 'Start with a Tech mock interview to benchmark your preparation.';

  const roadmap = profile?.roadmap || [
    'Build core technical skills',
    'Complete 2-3 projects',
    'Practice aptitude tests',
    'Apply to campus drives',
  ];

  return {
    skillSuggestion: skillTip,
    topRole,
    interviewPrep: interviewTip,
    placementAdvice: `You are in ${placementCat}. ${cgpa < 8.5 ? `Raise CGPA to 8.5+ for Category 1.` : 'Maintain your CGPA and apply early to top companies.'}`,
    readinessScore: score,
    roadmap,
    topCompanies: profile?.topCompanies || [],
    certifications: profile?.certifications || [],
  };
}

// ─── Job API helpers ───────────────────────────────────────────────────────────
async function fetchAdzuna(keywords: string, country = 'in'): Promise<any[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_API_KEY;
  if (!appId || !appKey) return [];
  try {
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=15&what=${encodeURIComponent(keywords)}&content-type=application/json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data: any = await res.json();
    return (data.results || []).map((j: any) => ({
      id: `az-${j.id}`,
      company: j.company?.display_name || 'Unknown',
      role: j.title,
      location: j.location?.display_name || 'India',
      type: j.contract_time === 'part_time' ? 'Internship' : 'Full-time',
      salary: j.salary_min ? `₹${Math.round(j.salary_min / 100000)}L/yr` : 'Competitive',
      posted: 'Recently',
      apply_url: j.redirect_url,
      skills: [],
      source: 'Adzuna',
    }));
  } catch { return []; }
}

async function fetchGreenhouse(): Promise<any[]> {
  try {
    const res = await fetch('https://boards-api.greenhouse.io/v1/boards/google/jobs?content=true', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data: any = await res.json();
    return (data.jobs || []).slice(0, 8).map((j: any, i: number) => ({
      id: `gh-${j.id || i}`,
      company: 'Google',
      role: j.title,
      location: j.location?.name || 'India',
      type: 'Full-time',
      salary: 'Competitive',
      posted: 'Recently',
      apply_url: j.absolute_url,
      skills: [],
      source: 'Greenhouse',
    }));
  } catch { return []; }
}

function deduplicateJobs(jobs: any[]): any[] {
  const seen = new Set<string>();
  return jobs.filter(j => {
    const key = `${j.company}|${j.role}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = 5000;
  app.use(express.json());

  // ── Health ──────────────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      gemini: isGeminiAvailable(),
      firebase: !!db,
      timestamp: new Date().toISOString(),
    });
  });

  // ── Interview: Start ─────────────────────────────────────────────────────────
  app.post('/api/interview/start', async (req, res) => {
    try {
      const { category = 'Tech', company = 'TCS', role = 'Software Engineer' } = req.body;
      const cacheKey = `interview-start:${category}:${company}:${role}`;
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);

      const reply = buildInitialInterviewMessage(category, company, role);
      const result = { reply, isFinished: false };
      cacheSet(cacheKey, result, CACHE_TTL.interview);
      res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Interview: Follow-up ─────────────────────────────────────────────────────
  app.post('/api/interview/followup', async (req, res) => {
    try {
      const { category = 'Tech', company = 'TCS', role = 'Software Engineer', history = [] } = req.body;
      const questionIndex = Math.floor(history.length / 2); // Each pair = 1 question
      const isLastQuestion = questionIndex >= 9;

      // Try local bank first
      const nextQ = getNextQuestionFromBank(category, company, role, questionIndex);

      if (nextQ && !isLastQuestion) {
        return res.json({
          reply: `**Question ${questionIndex + 1}:** ${nextQ}`,
          isFinished: false,
        });
      }

      // If Gemini available, generate a contextual follow-up for variety
      if (isGeminiAvailable() && genAI) {
        try {
          const lastAnswer = history[history.length - 1]?.text || '';
          const prompt = `You are interviewing a student for a ${role} role at ${company}. They just answered: "${lastAnswer.substring(0, 200)}". Ask ONE sharp follow-up question. Return JSON: {"reply": "...", "isFinished": false}`;
          const text = await callGemini(prompt, true);
          const parsed = JSON.parse(text);
          return res.json(parsed);
        } catch { /* fall through to local */ }
      }

      // Fallback: use bank question or end
      if (nextQ) return res.json({ reply: `**Question ${questionIndex + 1}:** ${nextQ}`, isFinished: false });
      return res.json({ reply: 'Thank you for answering all questions. Click "End Session" to get your feedback.', isFinished: false });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Interview: Feedback ──────────────────────────────────────────────────────
  app.post('/api/interview/feedback', async (req, res) => {
    try {
      const { category = 'Tech', company = 'TCS', role = 'Software Engineer', history = [] } = req.body;
      const cacheKey = `interview-feedback:${category}:${company}:${history.length}`;
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);

      const userAnswers = history.filter((_: any, i: number) => i % 2 === 1).map((m: any) => m.text);

      // Try Gemini for personalized feedback
      if (isGeminiAvailable() && genAI && userAnswers.length > 0) {
        try {
          const prompt = `You are an expert interviewer. Evaluate these answers from a student interviewed for ${role} at ${company}:
${userAnswers.map((a: string, i: number) => `Q${i+1}: ${a.substring(0, 150)}`).join('\n')}
Return a JSON object with: score (0-100 number), strengths (array of 2-3 strings), weaknesses (array of 2-3 strings), suggestedLearning (array of 3 topics).`;
          const text = await callGemini(prompt, true);
          const feedback = JSON.parse(text);
          const result = { reply: 'Interview complete.', isFinished: true, feedback };
          cacheSet(cacheKey, result, CACHE_TTL.interview);
          return res.json(result);
        } catch { /* fall through */ }
      }

      // Local feedback generation
      const answerCount = userAnswers.length;
      const score = Math.min(95, 45 + answerCount * 5);
      const fallbackFeedback = {
        score,
        strengths: ['Completed the interview session', 'Showed initiative in applying', 'Demonstrated willingness to learn'],
        weaknesses: ['Provide more specific technical examples', 'Elaborate with real project experience', 'Practice STAR method for behavioral questions'],
        suggestedLearning: ['System Design Fundamentals', 'Data Structures & Algorithms', 'Problem Solving with LeetCode'],
      };
      const result = { reply: 'Interview complete.', isFinished: true, feedback: fallbackFeedback };
      cacheSet(cacheKey, result, CACHE_TTL.interview);
      res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Legacy /api/ai route (for backwards compat) ───────────────────────────────
  app.post('/api/ai', async (req, res) => {
    try {
      const { type, payload } = req.body;
      if (type === 'interview') {
        const { category, company, role, history, forceFinish } = payload;
        if (!history || history.length === 0) {
          const startRes = await fetch(`http://localhost:${PORT}/api/interview/start`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, company, role }),
          });
          return res.json(await startRes.json());
        }
        if (forceFinish) {
          const fbRes = await fetch(`http://localhost:${PORT}/api/interview/feedback`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, company, role, history }),
          });
          return res.json(await fbRes.json());
        }
        const fuRes = await fetch(`http://localhost:${PORT}/api/interview/followup`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, company, role, history }),
        });
        return res.json(await fuRes.json());
      }
      if (type === 'test') {
        const testRes = await fetch(`http://localhost:${PORT}/api/test/start`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return res.json(await testRes.json());
      }
      if (type === 'career') {
        const careerRes = await fetch(`http://localhost:${PORT}/api/career/guidance`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return res.json(await careerRes.json());
      }
      if (type === 'assistant') {
        if (!isGeminiAvailable() || !genAI) {
          return res.json({ answer: "I'm currently in offline mode. Configure GEMINI_API_KEY to enable AI answers." });
        }
        const text = await callGemini(`You are a career counselor for tech students. Answer concisely: ${payload.question}`);
        return res.json({ answer: text });
      }
      if (type === 'job_suggestions') {
        const { skills = [], branch = 'CSE', cgpa = '7.0' } = payload;
        const topRole = getBestRole(skills, parseFloat(cgpa));
        const profile = roleProfiles[topRole];
        return res.json({
          suggestions: (profile?.topCompanies || ['TCS', 'Infosys', 'Wipro']).map(
            (c: string) => `${topRole} at ${c} (matches your profile)`
          ),
        });
      }
      res.status(400).json({ error: `Unknown AI type: ${type}` });
    } catch (e: any) {
      console.error('[/api/ai] Error:', e.message);
      res.status(500).json({ error: e.message });
    }
  });

  // ── Test: Start ──────────────────────────────────────────────────────────────
  app.post('/api/test/start', async (req, res) => {
    try {
      const { category = 'Tech', role = 'Software Engineer', company = '' } = req.body;
      const cacheKey = `test:${category}:${role}`;
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);

      // 1. Check Firestore for cached questions
      const firestoreKey = `${category}_${role}`.replace(/\s+/g, '_').toLowerCase();
      const fsDoc = await firestoreGet('mcq_cache', firestoreKey);
      if (fsDoc?.questions?.length >= 10) {
        const result = { questions: fsDoc.questions.sort(() => Math.random() - 0.5).slice(0, 10) };
        cacheSet(cacheKey, result, CACHE_TTL.test);
        return res.json(result);
      }

      // 2. Use local JSON bank
      const bankQuestions = getMCQsFromBank(category, role, 10);
      if (bankQuestions.length >= 10) {
        const result = { questions: bankQuestions };
        cacheSet(cacheKey, result, CACHE_TTL.test);
        // Save to Firestore for next time
        firestoreSet('mcq_cache', firestoreKey, { questions: bankQuestions, category, role, updatedAt: new Date().toISOString() });
        return res.json(result);
      }

      // 3. Generate missing with Gemini
      if (isGeminiAvailable() && genAI) {
        try {
          const needed = 10 - bankQuestions.length;
          const prompt = `Generate ${needed} unique multiple choice questions for a ${role} role interview${company ? ` at ${company}` : ''} in the ${category} category.
Return a JSON array. Each item must have: question (string), options (array of 4 strings), correctAnswer (string matching one option exactly), difficulty (Easy/Medium/Hard), category (string).`;
          const text = await callGemini(prompt, true);
          const generated = JSON.parse(text);
          const allQuestions = [...bankQuestions, ...generated].slice(0, 10);
          const result = { questions: allQuestions };
          cacheSet(cacheKey, result, CACHE_TTL.test);
          firestoreSet('mcq_cache', firestoreKey, { questions: allQuestions, category, role, updatedAt: new Date().toISOString() });
          return res.json(result);
        } catch { /* fall through */ }
      }

      // Fallback: return whatever we have from the bank
      const result = { questions: bankQuestions.length > 0 ? bankQuestions : getMCQsFromBank('Tech', 'Software Engineer', 10) };
      cacheSet(cacheKey, result, CACHE_TTL.test);
      res.json(result);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Career Guidance ──────────────────────────────────────────────────────────
  app.post('/api/career/guidance', async (req, res) => {
    try {
      const { uid } = req.body;
      const cacheKey = `career:${uid || 'anon'}`;
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);

      // 1. Load real user data
      let userProfile: any = { name: 'Student', cgpa: 7.5, attendance: 75, year: '3rd Year', skills: [] };
      let testData: any[] = [];
      let interviewData: any[] = [];

      if (uid) {
        const [userDoc, tests, interviews] = await Promise.all([
          firestoreGet('users', uid),
          firestoreQuery('test_attempts', [['userId', '==', uid]]),
          firestoreQuery('ai_interviews', [['userId', '==', uid]]),
        ]);
        if (userDoc) {
          userProfile = {
            name: userDoc.name || userProfile.name,
            cgpa: userDoc.cgpa || userProfile.cgpa,
            attendance: userDoc.attendance_percentage || userProfile.attendance,
            year: userDoc.year || userProfile.year,
            skills: userDoc.skills || [],
          };
        }
        testData = tests;
        interviewData = interviews;
      }

      // 2. Generate local guidance (always works)
      const localGuidance = generateLocalCareerGuidance(userProfile, testData, interviewData);

      // 3. Optionally personalize roadmap with Gemini
      if (isGeminiAvailable() && genAI && uid) {
        try {
          const prompt = `Personalize a career roadmap for ${userProfile.name}, a ${userProfile.year} student with CGPA ${userProfile.cgpa}, skills: ${userProfile.skills.join(', ')}. Target role: ${localGuidance.topRole}.
Return JSON with keys: skillSuggestion (string), interviewPrep (string), placementAdvice (string). Be concise.`;
          const text = await callGemini(prompt, true);
          const aiData = JSON.parse(text);
          Object.assign(localGuidance, aiData);
        } catch { /* keep local guidance */ }
      }

      cacheSet(cacheKey, localGuidance, CACHE_TTL.career);
      res.json(localGuidance);
    } catch (e: any) {
      // Never break — always return something useful
      res.json({
        skillSuggestion: 'Focus on Data Structures and Algorithms.',
        topRole: 'Software Engineer',
        interviewPrep: 'Start with a Tech mock interview.',
        placementAdvice: 'Maintain CGPA above 7.5 and attendance above 75%.',
        readinessScore: 60, roadmap: [], topCompanies: [], certifications: [],
      });
    }
  });

  // ── Jobs: Search ─────────────────────────────────────────────────────────────
  app.get('/api/jobs/search', async (req, res) => {
    try {
      const { type } = req.query as Record<string, string>;
      const normalizedType = type === 'Internships' ? 'Internship' : type;
      const cacheKey = `jobs:${normalizedType || 'all'}`;
      const cached = cacheGet(cacheKey);
      if (cached) return res.json(cached);

      let jobs: any[] = [];

      // 1. Try Firestore
      const fsJobs = await firestoreQuery('jobs', normalizedType && normalizedType !== 'All' ? [['type', '==', normalizedType]] : []);
      if (fsJobs.length > 0) jobs = fsJobs;

      // 2. Try real job APIs in parallel
      if (jobs.length < 5) {
        const [adzunaJobs, ghJobs] = await Promise.all([
          fetchAdzuna(normalizedType === 'Internship' ? 'software internship india' : 'software engineer india'),
          normalizedType !== 'Internship' ? fetchGreenhouse() : Promise.resolve([]),
        ]);
        const apiJobs = deduplicateJobs([...adzunaJobs, ...ghJobs]);
        if (apiJobs.length > 0) jobs = [...jobs, ...apiJobs];
      }

      // 3. Fallback to local seeds
      if (jobs.length === 0) {
        jobs = normalizedType && normalizedType !== 'All'
          ? FALLBACK_JOBS.filter(j => j.type === normalizedType)
          : FALLBACK_JOBS;
      }

      jobs = deduplicateJobs(jobs);
      cacheSet(cacheKey, jobs, CACHE_TTL.jobs);
      res.json(jobs);
    } catch (e: any) {
      res.json(FALLBACK_JOBS);
    }
  });

  // ── Opportunities (alias for jobs) ───────────────────────────────────────────
  app.get('/api/opportunities', async (req, res) => {
    const { type } = req.query as Record<string, string>;
    const redirect = type ? `/api/jobs/search?type=${type}` : '/api/jobs/search';
    try {
      const result = await fetch(`http://localhost:${PORT}${redirect}`);
      const data = await result.json();
      res.json(data);
    } catch { res.json(FALLBACK_JOBS); }
  });

  // ── Events ───────────────────────────────────────────────────────────────────
  app.get('/api/events', async (_req, res) => {
    const cached = cacheGet('events');
    if (cached) return res.json(cached);
    const events = await firestoreQuery('events');
    const result = events.length > 0 ? events : FALLBACK_EVENTS;
    cacheSet('events', result, 30 * 60 * 1000);
    res.json(result);
  });

  app.post('/api/events', async (req, res) => {
    const id = await firestoreAdd('events', req.body);
    if (id) { cache.delete('events'); res.json({ id, ...req.body }); }
    else res.status(500).json({ error: 'Failed to create event' });
  });

  app.put('/api/events/:id', async (req, res) => {
    const ok = await firestoreUpdate('events', req.params.id, req.body);
    if (ok) { cache.delete('events'); res.json({ id: req.params.id, ...req.body }); }
    else res.status(500).json({ error: 'Failed to update event' });
  });

  app.delete('/api/events/:id', async (req, res) => {
    const ok = await firestoreDelete('events', req.params.id);
    if (ok) { cache.delete('events'); res.json({ success: true }); }
    else res.status(500).json({ error: 'Failed to delete event' });
  });

  // ── Clubs ────────────────────────────────────────────────────────────────────
  app.get('/api/clubs', async (_req, res) => {
    const cached = cacheGet('clubs');
    if (cached) return res.json(cached);
    const clubs = await firestoreQuery('clubs');
    const result = clubs.length > 0 ? clubs : FALLBACK_CLUBS;
    cacheSet('clubs', result, 30 * 60 * 1000);
    res.json(result);
  });

  app.post('/api/clubs', async (req, res) => {
    const id = await firestoreAdd('clubs', req.body);
    if (id) { cache.delete('clubs'); res.json({ id, ...req.body }); }
    else res.status(500).json({ error: 'Failed to create club' });
  });

  app.put('/api/clubs/:id', async (req, res) => {
    const ok = await firestoreUpdate('clubs', req.params.id, req.body);
    if (ok) { cache.delete('clubs'); res.json({ id: req.params.id, ...req.body }); }
    else res.status(500).json({ error: 'Failed to update club' });
  });

  app.delete('/api/clubs/:id', async (req, res) => {
    const ok = await firestoreDelete('clubs', req.params.id);
    if (ok) { cache.delete('clubs'); res.json({ success: true }); }
    else res.status(500).json({ error: 'Failed to delete club' });
  });

  // ── Community Posts ──────────────────────────────────────────────────────────
  app.get('/api/community', async (_req, res) => {
    const cached = cacheGet('community');
    if (cached) return res.json(cached);
    const posts = await firestoreQuery('community_posts');
    const result = posts.length > 0 ? posts : FALLBACK_POSTS;
    cacheSet('community', result, 5 * 60 * 1000);
    res.json(result);
  });

  app.post('/api/community', async (req, res) => {
    const id = await firestoreAdd('community_posts', req.body);
    if (id) { cache.delete('community'); res.json({ id, ...req.body }); }
    else res.status(500).json({ error: 'Failed to create post' });
  });

  app.post('/api/community/:id/like', async (req, res) => {
    const ok = await firestoreUpdate('community_posts', req.params.id, {
      likesCount: admin.firestore.FieldValue.increment(1)
    });
    if (ok) { cache.delete('community'); res.json({ success: true }); }
    else res.status(500).json({ error: 'Failed to like post' });
  });

  app.post('/api/community/:id/reply', async (req, res) => {
    const ok = await firestoreUpdate('community_posts', req.params.id, {
      comments: admin.firestore.FieldValue.increment(1)
    });
    if (ok) { cache.delete('community'); res.json({ success: true }); }
    else res.status(500).json({ error: 'Failed to reply' });
  });

  app.delete('/api/community/:id', async (req, res) => {
    const ok = await firestoreDelete('community_posts', req.params.id);
    if (ok) { cache.delete('community'); res.json({ success: true }); }
    else res.status(500).json({ error: 'Failed to delete post' });
  });

  // ── Opportunities CRUD (jobs collection) ─────────────────────────────────────
  app.post('/api/jobs', async (req, res) => {
    const id = await firestoreAdd('jobs', req.body);
    if (id) { for (const k of cache.keys()) { if (k.startsWith('jobs:')) cache.delete(k); } res.json({ id, ...req.body }); }
    else res.status(500).json({ error: 'Failed to create job' });
  });

  app.put('/api/jobs/:id', async (req, res) => {
    const ok = await firestoreUpdate('jobs', req.params.id, req.body);
    if (ok) { for (const k of cache.keys()) { if (k.startsWith('jobs:')) cache.delete(k); } res.json({ id: req.params.id, ...req.body }); }
    else res.status(500).json({ error: 'Failed to update job' });
  });

  app.delete('/api/jobs/:id', async (req, res) => {
    const ok = await firestoreDelete('jobs', req.params.id);
    if (ok) { for (const k of cache.keys()) { if (k.startsWith('jobs:')) cache.delete(k); } res.json({ success: true }); }
    else res.status(500).json({ error: 'Failed to delete job' });
  });

  // ── Admin: Users ─────────────────────────────────────────────────────────────
  app.get('/api/admin/users', async (_req, res) => {
    const users = await firestoreQuery('users');
    res.json(users);
  });

  app.put('/api/admin/users/:id', async (req, res) => {
    const ok = await firestoreUpdate('users', req.params.id, req.body);
    res.json({ success: ok });
  });

  app.delete('/api/admin/users/:id', async (req, res) => {
    const ok = await firestoreDelete('users', req.params.id);
    res.json({ success: ok });
  });

  // ── Admin: Stats ─────────────────────────────────────────────────────────────
  app.get('/api/admin/stats', async (_req, res) => {
    const cached = cacheGet('admin:stats');
    if (cached) return res.json(cached);
    try {
      const [users, posts, jobs, clubs, events] = await Promise.all([
        firestoreQuery('users'),
        firestoreQuery('community_posts'),
        firestoreQuery('jobs'),
        firestoreQuery('clubs'),
        firestoreQuery('events'),
      ]);
      const stats = {
        totalUsers: users.length,
        totalStudents: users.filter(u => u.role === 'student' || !u.role).length,
        totalTeachers: users.filter(u => u.role === 'teacher').length,
        hrAccounts: users.filter(u => u.role === 'hr').length,
        communityPosts: posts.length,
        jobPostings: jobs.filter(j => j.type !== 'Internship').length,
        internships: jobs.filter(j => j.type === 'Internship').length,
        clubs: clubs.length,
        events: events.length,
      };
      cacheSet('admin:stats', stats, 5 * 60 * 1000);
      res.json(stats);
    } catch { res.json({ totalUsers: 0, totalStudents: 0, totalTeachers: 0, hrAccounts: 0, communityPosts: 0, jobPostings: 0, internships: 0, clubs: 0, events: 0 }); }
  });

  // ── Attendance CRUD ───────────────────────────────────────────────────────────
  app.get('/api/attendance', async (req, res) => {
    const { studentId } = req.query as Record<string, string>;
    const filters: [string, any, any][] = studentId ? [['studentId', '==', studentId]] : [];
    const records = await firestoreQuery('attendance', filters);
    res.json(records);
  });

  app.post('/api/attendance', async (req, res) => {
    const id = await firestoreAdd('attendance', req.body);
    if (id) res.json({ id, ...req.body });
    else res.status(500).json({ error: 'Failed to save attendance' });
  });

  app.put('/api/attendance/:id', async (req, res) => {
    const ok = await firestoreUpdate('attendance', req.params.id, req.body);
    res.json({ success: ok });
  });

  // ── Club Members ──────────────────────────────────────────────────────────────
  app.get('/api/club-members', async (req, res) => {
    const { clubId } = req.query as Record<string, string>;
    const filters: [string, any, any][] = clubId ? [['clubId', '==', clubId]] : [];
    const members = await firestoreQuery('club_memberships', filters);
    res.json(members);
  });

  app.post('/api/club-members', async (req, res) => {
    const id = await firestoreAdd('club_memberships', req.body);
    if (id) res.json({ id, ...req.body });
    else res.status(500).json({ error: 'Failed to add member' });
  });

  app.delete('/api/club-members/:id', async (req, res) => {
    const ok = await firestoreDelete('club_memberships', req.params.id);
    res.json({ success: ok });
  });

  // ── Leaderboard ───────────────────────────────────────────────────────────────
  app.get('/api/leaderboard', async (req, res) => {
    const { filter } = req.query as Record<string, string>;
    const cacheKey = `leaderboard:${filter || 'default'}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    let users = await firestoreQuery('users');
    if (users.length === 0) {
      users = [
        { id: '1', name: 'Ananya Singh', photoURL: 'https://i.pravatar.cc/150?u=ananya', branch: 'CSE', year: '3rd Year', cgpa: 9.2, attendance_percentage: 88, skills: ['React', 'Python', 'DSA'] },
        { id: '2', name: 'Rohit Verma', photoURL: 'https://i.pravatar.cc/150?u=rohit', branch: 'CSE', year: '3rd Year', cgpa: 8.8, attendance_percentage: 82, skills: ['Java', 'SQL'] },
        { id: '3', name: 'Priya Nair', photoURL: 'https://i.pravatar.cc/150?u=priya', branch: 'ECE', year: '4th Year', cgpa: 8.4, attendance_percentage: 78, skills: ['C++'] },
      ];
    }

    const calcCategory = (u: any) => {
      const c = parseFloat(u.cgpa || '0'), a = parseFloat(u.attendance_percentage || '0');
      if (c >= 8.5 && a >= 75) return 1;
      if (c >= 7.5 && a >= 60) return 2;
      if (c >= 7.0 && a >= 60) return 3;
      return 4;
    };

    users.sort((a, b) => {
      if (filter === 'Placement Category Rank') {
        const cA = calcCategory(a), cB = calcCategory(b);
        if (cA !== cB) return cA - cB;
        return parseFloat(b.cgpa || '0') - parseFloat(a.cgpa || '0');
      }
      const sA = parseFloat(a.cgpa || '0') * 10 + (a.skills?.length || 0) * 5;
      const sB = parseFloat(b.cgpa || '0') * 10 + (b.skills?.length || 0) * 5;
      return sB - sA;
    });

    const result = users.slice(0, 10).map(u => ({
      ...u,
      category: calcCategory(u) === 4 ? 'Not Eligible' : `Category ${calcCategory(u)}`,
    }));

    cacheSet(cacheKey, result, 5 * 60 * 1000);
    res.json(result);
  });

  // ── Profile Update ────────────────────────────────────────────────────────────
  app.put('/api/profile/:uid', async (req, res) => {
    const ok = await firestoreUpdate('users', req.params.uid, req.body);
    if (ok) res.json({ success: true });
    else res.status(500).json({ error: 'Failed to update profile' });
  });

  // ── Vite Middleware ───────────────────────────────────────────────────────────
=======
import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';
import firebaseConfig from './firebase-applet-config.json';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
  });
}
const db = admin.firestore();

// Initialize Gemini API once
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function startServer() {
  const app = express();
<<<<<<< HEAD
  const PORT = 5000;
=======
  const PORT = 3000;
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e

  app.use(express.json());

  // --- AI Request Handler ---
  async function handleAIRequest(type: string, payload: any) {
    const apiKey = process.env.GEMINI_API_KEY;
    const isOffline = !apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '' || apiKey.includes('TODO');

    if (type === 'career') {
      const { uid } = payload;
      const userId = uid || 'mock-user-id';
<<<<<<< HEAD

      let testData: any[] = [];
      let interviewData: any[] = [];
=======
      
      const [testSnap, interviewSnap] = await Promise.all([
        db.collection('test_attempts').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(5).get(),
        db.collection('ai_interviews').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(3).get()
      ]);

      const testData = testSnap.docs.map(doc => doc.data());
      const interviewData = interviewSnap.docs.map(doc => doc.data());

>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
      let userProfile = {
        name: 'Ananya Singh',
        cgpa: 8.74,
        attendance: 87,
        year: '3rd Year',
        skills: ['React', 'Node.js', 'Python', 'DSA']
      };

<<<<<<< HEAD
      try {
        const [testSnap, interviewSnap] = await Promise.all([
          db.collection('test_attempts').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(5).get(),
          db.collection('ai_interviews').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(3).get()
        ]);
        testData = testSnap.docs.map(doc => doc.data());
        interviewData = interviewSnap.docs.map(doc => doc.data());
      } catch (e) {
        console.warn('Could not fetch test/interview data from Firestore (credentials may be missing):', (e as Error).message);
      }

      if (uid) {
        try {
          const userDoc = await db.collection('users').doc(uid).get();
          if (userDoc.exists) {
            const data = userDoc.data() as any;
            userProfile = {
              name: data.name || userProfile.name,
              cgpa: data.cgpa || userProfile.cgpa,
              attendance: data.attendance_percentage || userProfile.attendance,
              year: data.year || userProfile.year,
              skills: data.skills || userProfile.skills
            };
          }
        } catch (e) {
          console.warn('Could not fetch user profile from Firestore:', (e as Error).message);
=======
      if (uid) {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
          const data = userDoc.data() as any;
          userProfile = {
            name: data.name || userProfile.name,
            cgpa: data.cgpa || userProfile.cgpa,
            attendance: data.attendance_percentage || userProfile.attendance,
            year: data.year || userProfile.year,
            skills: data.skills || userProfile.skills
          };
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
        }
      }

      if (isOffline) {
        return {
          skillSuggestion: "Based on your recent mock tests, focus more on Graph algorithms to reach Category 1.",
          interviewPrep: "Your communication in the last interview was great! Try a technical round next.",
          topRole: "Full Stack Developer",
          placementAdvice: "Maintain your attendance above 75% and CGPA above 8.5 to stay in Category 1."
        };
      }

      const prompt = `You are an expert career counselor for tech students. 
      Analyze this student's performance data:
      - Name: ${userProfile.name}
      - CGPA: ${userProfile.cgpa}
      - Attendance: ${userProfile.attendance}%
      - Year: ${userProfile.year}
      - Skills: ${userProfile.skills.join(', ')}
      - Recent Mock Tests: ${JSON.stringify(testData.map(t => ({ score: t.score })))}
      - Recent AI Interviews: ${JSON.stringify(interviewData.map(i => ({ score: i.score, feedback: i.feedback })))}
      
      Placement Categories:
      - Category 1: CGPA >= 8.5 AND Attendance >= 75%
      - Category 2: CGPA >= 7.5 AND Attendance >= 60%
      - Category 3: CGPA >= 7.0 AND Attendance >= 60%
      
      Return a JSON object with exactly four keys: 
      'skillSuggestion' (a 1-sentence actionable tip based on their weak areas or strengths), 
      'topRole' (the specific job title they are most suited for),
      'interviewPrep' (a 1-sentence recommendation for their next practice session),
      'placementAdvice' (a 1-sentence advice on how to move to a higher placement category or maintain their current one).
      Do not include markdown formatting like \`\`\`json.`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);

    } else if (type === 'assistant') {
      const { question } = payload;
      if (isOffline) {
        return { answer: "I'm currently running in offline mode. Please configure a valid Gemini API key in the settings to ask custom questions." };
      }
      const prompt = `You are an expert career counselor for tech students. Answer the following question concisely and helpfully: ${question}`;
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return { answer: response.text || "I'm sorry, I couldn't generate a response." };

    } else if (type === 'test') {
      const { category, company, role } = payload;
      if (isOffline) {
        return {
          questions: [
<<<<<<< HEAD
            { question: "What is the primary key in a database?", options: ["A unique identifier for a record", "A foreign key", "A string value", "None of the above"], correctAnswer: "A unique identifier for a record", difficulty: "Easy", category: "Technical" },
            { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], correctAnswer: "O(log n)", difficulty: "Easy", category: "Technical" },
            { question: "Which data structure uses FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], correctAnswer: "Queue", difficulty: "Easy", category: "Technical" },
            { question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "Sequential Query Language"], correctAnswer: "Structured Query Language", difficulty: "Easy", category: "Technical" },
            { question: "Which of the following is NOT a valid HTTP method?", options: ["GET", "POST", "SEND", "DELETE"], correctAnswer: "SEND", difficulty: "Medium", category: "Technical" },
            { question: "What is polymorphism in OOP?", options: ["Ability to take many forms", "Data hiding", "Code reuse", "Memory management"], correctAnswer: "Ability to take many forms", difficulty: "Medium", category: "Technical" },
            { question: "Which sorting algorithm has the best average time complexity?", options: ["Bubble Sort O(n^2)", "Merge Sort O(n log n)", "Selection Sort O(n^2)", "Insertion Sort O(n^2)"], correctAnswer: "Merge Sort O(n log n)", difficulty: "Medium", category: "Technical" },
            { question: "What is a deadlock?", options: ["A situation where two processes wait for each other indefinitely", "A type of memory leak", "A network error", "A syntax error"], correctAnswer: "A situation where two processes wait for each other indefinitely", difficulty: "Hard", category: "Technical" },
            { question: "In a relational database, what is normalization?", options: ["Organizing data to reduce redundancy", "Encrypting data", "Backing up data", "Indexing tables"], correctAnswer: "Organizing data to reduce redundancy", difficulty: "Hard", category: "Technical" },
            { question: "What is the purpose of an API gateway?", options: ["Single entry point for managing API requests", "Database connection pool", "File storage system", "Code compiler"], correctAnswer: "Single entry point for managing API requests", difficulty: "Hard", category: "Technical" }
=======
            {
              question: "What is the primary key in a database?",
              options: ["A unique identifier for a record", "A foreign key", "A string value", "None of the above"],
              correctAnswer: "A unique identifier for a record",
              difficulty: "Easy",
              category: "Technical"
            }
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
          ]
        };
      }
      const prompt = `Generate 10 realistic interview questions for a ${role} role at ${company} for a college student in the ${category} category. Mix technical, conceptual, and scenario questions.
      Return ONLY a JSON array of objects. Each object must have:
      'question' (string),
      'options' (array of 4 strings),
      'correctAnswer' (string, must exactly match one of the options),
      'difficulty' (string: Easy, Medium, Hard),
      'category' (string).
      Do not include markdown formatting like \`\`\`json.`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });
      let text = response.text || "[]";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return { questions: JSON.parse(text) };

    } else if (type === 'interview') {
      const { category, company, role, history, forceFinish } = payload;
      if (isOffline) {
        if (forceFinish) {
          return {
            reply: "Interview ended.",
            isFinished: true,
            feedback: { score: 85, strengths: ["Good communication"], weaknesses: ["Needs more technical depth"], suggestedLearning: ["System Design"] }
          };
        }
        return { reply: "This is a mock response because the API key is missing.", isFinished: false };
      }

      let systemPrompt = `You are an AI interviewer conducting a mock interview for a ${role} role at ${company} (${category} category).
      You must ask exactly 10 questions one by one.
      Wait for the candidate's answer before asking the next question.
      If the candidate has answered 10 questions, provide a structured feedback report and end the interview.
      Keep your responses concise and natural, like a real spoken interview.
      Return ONLY a JSON object with these keys:
      'reply' (string, your spoken response or question),
      'isFinished' (boolean, true if you are providing the final feedback, false otherwise),
      'feedback' (object, ONLY include if isFinished is true. Must contain: 'score' (number 0-100), 'strengths' (array of strings), 'weaknesses' (array of strings), and 'suggestedLearning' (array of strings)).
      Do not include markdown formatting like \`\`\`json.`;

      if (forceFinish) {
        systemPrompt += `\n\nThe user has requested to end the interview early. You MUST provide the final feedback report immediately based on the answers provided so far. Set 'isFinished' to true.`;
      }

      const chatHistory = history.map((msg: any) => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Understood. I will act as the interviewer.' }] },
          ...chatHistory
        ],
        config: {
          responseMimeType: "application/json",
        }
      });
      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);

    } else if (type === 'job_suggestions') {
      const { uid, skills, branch, cgpa } = payload;
      if (isOffline) {
        return {
          suggestions: [
            "Software Developer at TechCorp (Matches your React skills)",
            "Data Analyst at DataInc (Matches your Python skills)"
          ]
        };
      }
      const prompt = `Based on the following student profile, suggest 5 relevant job roles or companies they should target:
      - Skills: ${skills?.join(', ')}
      - Branch: ${branch}
      - CGPA: ${cgpa}
      Return a JSON object with a 'suggestions' key containing an array of strings.
      Do not include markdown formatting like \`\`\`json.`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });
      let text = response.text || "{}";
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    }
    
    throw new Error(`Unsupported AI request type: ${type}`);
  }

  // --- API Routes ---
  app.post('/api/ai', async (req, res) => {
    try {
      const { type, payload } = req.body;
      const result = await handleAIRequest(type, payload);
      res.json(result);
    } catch (error: any) {
      console.error('Unified AI Error:', error);
      res.status(500).json({ error: error.message || 'AI request failed' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/opportunities', async (req, res) => {
    try {
      const { type } = req.query;
<<<<<<< HEAD
=======
      let q = db.collection('jobs') as any;
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e

      let queryType = type;
      if (type === 'Internships') queryType = 'Internship';

<<<<<<< HEAD
      let jobs: any[] = [];

      try {
        let q = db.collection('jobs') as any;
        if (queryType && queryType !== 'All') {
          q = q.where('type', '==', queryType);
        }
        const snapshot = await q.get();
        jobs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn('Could not fetch jobs from Firestore:', (e as Error).message);
      }

      // Seed fallback data if Firestore collections are empty or unavailable
      if (jobs.length === 0) {
        const fallbackJobs = [
          { id: 'seed-1', company: 'Google', role: 'Software Engineer', location: 'Bangalore, India', type: 'Full-time', salary: '₹25,00,000 / year', posted: '1d ago', apply_url: 'https://careers.google.com', skills: ['React', 'Node.js', 'Python', 'DSA'] },
          { id: 'seed-2', company: 'Microsoft', role: 'Frontend Developer', location: 'Hyderabad, India', type: 'Full-time', salary: '₹20,00,000 / year', posted: '3d ago', apply_url: 'https://careers.microsoft.com', skills: ['React', 'TypeScript', 'CSS'] },
          { id: 'seed-3', company: 'Amazon', role: 'Backend Developer', location: 'Chennai, India', type: 'Full-time', salary: '₹22,00,000 / year', posted: '2d ago', apply_url: 'https://amazon.jobs', skills: ['Java', 'AWS', 'Microservices'] },
          { id: 'seed-4', company: 'Internshala', role: 'Web Development Intern', location: 'Remote', type: 'Internship', salary: '₹15,000 / month', posted: 'Just now', apply_url: 'https://internshala.com', skills: ['HTML', 'CSS', 'JavaScript'] },
          { id: 'seed-5', company: 'LinkedIn', role: 'Product Management Intern', location: 'Mumbai, India', type: 'Internship', salary: '₹40,000 / month', posted: '2h ago', apply_url: 'https://linkedin.com', skills: ['Product Strategy', 'Agile', 'Communication'] },
          { id: 'seed-6', company: 'Flipkart', role: 'Data Science Intern', location: 'Bangalore, India', type: 'Internship', salary: '₹30,000 / month', posted: '1d ago', apply_url: 'https://flipkart.com', skills: ['Python', 'ML', 'Statistics'] },
          { id: 'seed-7', company: 'TCS', role: 'Systems Engineer', location: 'Mumbai, India', type: 'Full-time', salary: '₹7,00,000 / year', posted: '5d ago', apply_url: 'https://tcs.com/careers', skills: ['Java', 'SQL', 'Linux'] },
          { id: 'seed-8', company: 'Wipro', role: 'Cloud Engineer', location: 'Pune, India', type: 'Full-time', salary: '₹8,50,000 / year', posted: '4d ago', apply_url: 'https://wipro.com/careers', skills: ['AWS', 'Docker', 'Kubernetes'] }
        ];

        if (queryType && queryType !== 'All') {
          jobs = fallbackJobs.filter(j => j.type === queryType);
        } else {
          jobs = fallbackJobs;
        }
=======
      if (queryType && queryType !== 'All') {
        q = q.where('type', '==', queryType);
      }

      const snapshot = await q.get();
      let jobs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

      // Feature 3: If internships empty, trigger fetch (simulated)
      if (queryType === 'Internship' && jobs.length === 0) {
        console.log('Internships empty, fetching from external sources...');
        const externalInternships = [
          {
            company: 'Internshala',
            role: 'Web Development Intern',
            location: 'Remote',
            type: 'Internship',
            salary: '₹15,000 / month',
            posted: 'Just now',
            apply_url: 'https://internshala.com',
            skills: ['HTML', 'CSS', 'JavaScript']
          },
          {
            company: 'LinkedIn',
            role: 'Product Management Intern',
            location: 'Mumbai, India',
            type: 'Internship',
            salary: '₹40,000 / month',
            posted: '2h ago',
            apply_url: 'https://linkedin.com',
            skills: ['Product Strategy', 'Agile', 'Communication']
          }
        ];
        
        for (const job of externalInternships) {
          await db.collection('jobs').add(job);
        }
        
        // Re-fetch
        const newSnapshot = await db.collection('jobs').where('type', '==', 'Internship').get();
        jobs = newSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } else if (queryType === 'Full-time' && jobs.length === 0) {
        console.log('Jobs empty, fetching from external sources...');
        const externalJobs = [
          {
            company: 'Google',
            role: 'Software Engineer',
            location: 'Bangalore, India',
            type: 'Full-time',
            salary: '₹25,00,000 / year',
            posted: '1d ago',
            apply_url: 'https://careers.google.com',
            skills: ['React', 'Node.js', 'Python', 'DSA']
          },
          {
            company: 'Microsoft',
            role: 'Frontend Developer',
            location: 'Hyderabad, India',
            type: 'Full-time',
            salary: '₹20,00,000 / year',
            posted: '3d ago',
            apply_url: 'https://careers.microsoft.com',
            skills: ['React', 'TypeScript', 'CSS']
          }
        ];
        
        for (const job of externalJobs) {
          await db.collection('jobs').add(job);
        }
        
        // Re-fetch
        const newSnapshot = await db.collection('jobs').where('type', '==', 'Full-time').get();
        jobs = newSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
      }

      res.json(jobs);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

<<<<<<< HEAD
  app.get('/api/events', async (req, res) => {
    try {
      let events: any[] = [];
      try {
        const snapshot = await db.collection('events').get();
        events = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn('Could not fetch events from Firestore:', (e as Error).message);
      }

      if (events.length === 0) {
        events = [
          { id: 1, title: "CodeStorm 2026", subtitle: "National Level Hackathon", date: "20 - 22 Apr 2026", location: "Online", icon: "💻" },
          { id: 2, title: "AI Workshop", subtitle: "By Google Developer Group", date: "25 Apr 2026", location: "Auditorium", icon: "🤖" },
          { id: 3, title: "Tech Talk", subtitle: "Career in Data Science", date: "30 Apr 2026", location: "Seminar Hall", icon: "📊" }
        ];
      }
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/clubs', async (req, res) => {
    try {
      let clubs: any[] = [];
      try {
        const snapshot = await db.collection('clubs').get();
        clubs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn('Could not fetch clubs from Firestore:', (e as Error).message);
      }

      if (clubs.length === 0) {
        clubs = [
          { id: 1, name: "Coding Club", members: "1200 Members", description: "Building. Learning. Growing.", icon: "💻" },
          { id: 2, name: "Robotics Club", members: "850 Members", description: "Innovate. Build. Automate.", icon: "⚙️" },
          { id: 3, name: "AI Club", members: "950 Members", description: "Explore. Learn. Implement.", icon: "🧠" }
        ];
      }
      res.json(clubs);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/community', async (req, res) => {
    try {
      let posts: any[] = [];
      try {
        const snapshot = await db.collection('community_posts').orderBy('timestamp', 'desc').get();
        posts = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().timestamp ? 'Just now' : 'Unknown',
        }));
      } catch (e) {
        console.warn('Could not fetch community posts from Firestore:', (e as Error).message);
      }

      if (posts.length === 0) {
        posts = [
          { id: '1', authorName: 'Rohit Verma', authorAvatar: 'https://i.pravatar.cc/150?u=rohit', time: '2h ago', content: 'Struggling with DP questions. Anyone up for a session?', likesCount: 24, comments: 12 },
          { id: '2', authorName: 'Tech Club', authorAvatar: 'https://i.pravatar.cc/150?u=tech', time: '5h ago', content: 'We\'re hosting a workshop on "Web3 Development" this Saturday.', likesCount: 45, comments: 8 },
          { id: '3', authorName: 'Priya Nair', authorAvatar: 'https://i.pravatar.cc/150?u=priya', time: '1d ago', content: 'Placed at NVIDIA! Grateful for the support from this community.', likesCount: 96, comments: 21 },
        ];
      }
      res.json(posts);
    } catch (error) {
      console.error('Error fetching community posts:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/leaderboard', async (req, res) => {
    try {
      const { filter } = req.query;
      let users: any[] = [];

      try {
        const usersSnap = await db.collection('users').get();
        users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      } catch (e) {
        console.warn('Could not fetch users for leaderboard:', (e as Error).message);
      }

      if (users.length === 0) {
        // Mock data if DB is empty or unavailable
=======
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const { filter } = req.query;
      const usersSnap = await db.collection('users').get();
      let users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

      if (users.length === 0) {
        // Mock data if DB is empty
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
        users = [
          { id: '1', name: 'Ananya Singh', photoURL: 'https://i.pravatar.cc/150?u=ananya', branch: 'CSE', year: '3rd Year', cgpa: 9.2, attendance_percentage: 88, skills: ['A', 'B', 'C'] },
          { id: '2', name: 'Rohit Verma', photoURL: 'https://i.pravatar.cc/150?u=rohit', branch: 'CSE', year: '3rd Year', cgpa: 8.8, attendance_percentage: 82, skills: ['A', 'B'] },
          { id: '3', name: 'Priya Nair', photoURL: 'https://i.pravatar.cc/150?u=priya', branch: 'ECE', year: '4th Year', cgpa: 8.4, attendance_percentage: 78, skills: ['A'] },
          { id: '4', name: 'Sahil Shah', photoURL: 'https://i.pravatar.cc/150?u=sahil', branch: 'IT', year: '2nd Year', cgpa: 7.9, attendance_percentage: 75, skills: ['A', 'B', 'C', 'D'] },
          { id: '5', name: 'Neha Gupta', photoURL: 'https://i.pravatar.cc/150?u=neha', branch: 'MECH', year: '3rd Year', cgpa: 7.2, attendance_percentage: 65, skills: ['A'] },
          { id: '6', name: 'Arjun Patel', photoURL: 'https://i.pravatar.cc/150?u=arjun', branch: 'CSE', year: '1st Year', cgpa: 8.5, attendance_percentage: 80, skills: ['A'] },
        ];
      }

      const calculateCategory = (u: any) => {
        const cgpa = parseFloat(u.cgpa || "0");
        const att = parseFloat(u.attendance_percentage || "0");
        if (cgpa >= 8.5 && att >= 75) return 1;
        if (cgpa >= 7.5 && att >= 60) return 2;
        if (cgpa >= 7.0 && att >= 60) return 3;
        return 4; // Not Eligible
      };

      if (filter === 'Placement Category Rank') {
        users.sort((a, b) => {
          const catA = calculateCategory(a);
          const catB = calculateCategory(b);
          if (catA !== catB) return catA - catB;
          
          const cgpaA = parseFloat(a.cgpa || "0");
          const cgpaB = parseFloat(b.cgpa || "0");
          if (cgpaA !== cgpaB) return cgpaB - cgpaA;
          
          const attA = parseFloat(a.attendance_percentage || "0");
          const attB = parseFloat(b.attendance_percentage || "0");
          return attB - attA;
        });
      } else {
        // Default score-based sort
        users.sort((a, b) => {
          const scoreA = (parseFloat(a.cgpa || "0") * 10) + ((a.skills?.length || 0) * 5);
          const scoreB = (parseFloat(b.cgpa || "0") * 10) + ((b.skills?.length || 0) * 5);
          return scoreB - scoreA;
        });
      }

      res.json(users.slice(0, 10).map(u => ({
        ...u,
        category: calculateCategory(u) === 4 ? 'Not Eligible' : `Category ${calculateCategory(u)}`
      })));
    } catch (error) {
      console.error('Leaderboard Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // --- Vite Middleware ---
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
<<<<<<< HEAD
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 AlgoXy server running → http://localhost:${PORT}`);
    console.log(`   Gemini: ${isGeminiAvailable() ? '✅ Available' : '⚠️  Offline (local fallbacks active)'}`);
    console.log(`   Firebase: ${db ? '✅ Connected' : '⚠️  Offline (local fallbacks active)'}\n`);
  });
}

startServer().catch(console.error);
=======
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
