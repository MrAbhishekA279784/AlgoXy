import express from 'express';
import { generateLocalCareerGuidance, detectIntentAndAnswer, getBestRole } from '../services/careerService';
import { cacheGet, cacheSet, CACHE_TTL } from '../services/cacheService';
import { firestoreGet, firestoreQuery } from '../services/firebaseService';
import { isGeminiAvailable, callGemini, genAI } from '../utils/gemini';

const router = express.Router();

router.post('/guidance', async (req, res) => {
  try {
    const { uid } = req.body;
    const cacheKey = `career:${uid || 'anon'}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

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

    const localGuidance = generateLocalCareerGuidance(userProfile, testData, interviewData);

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
    res.json({
      skillSuggestion: 'Focus on Data Structures and Algorithms.',
      topRole: 'Software Engineer',
      interviewPrep: 'Start with a Tech mock interview.',
      placementAdvice: 'Maintain CGPA above 7.5 and attendance above 75%.',
      readinessScore: 60, roadmap: [], topCompanies: [], certifications: [],
    });
  }
});

router.post('/assistant', async (req, res) => {
    try {
        const { question, context } = req.body;
        
        // 1. Try local exact intent match
        const localAnswer = detectIntentAndAnswer(question, context);
        if (localAnswer) {
            return res.json({ answer: localAnswer });
        }

        // 2. Try Gemini fallback
        if (isGeminiAvailable() && genAI) {
            const prompt = `You are a career counselor for tech students. Answer concisely: ${question}`;
            const text = await callGemini(prompt, false);
            return res.json({ answer: text });
        }

        return res.json({ answer: "I'm sorry, I don't have an answer for that in my local knowledge base. Configure GEMINI_API_KEY to search the web." });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/job-suggestions', async (req, res) => {
    try {
        const { skills = [], branch = 'CSE', cgpa = '7.0' } = req.body;
        const topRole = getBestRole(skills, parseFloat(cgpa));
        const { loadDataFile } = await import('../services/dataCleaner');
        const roleProfiles = loadDataFile('career/roleProfiles.json') || {};
        const profile = roleProfiles[topRole];
        return res.json({
          suggestions: (profile?.topCompanies || ['TCS', 'Infosys', 'Wipro']).map(
            (c: string) => `${topRole} at ${c} (matches your profile)`
          ),
        });
    } catch(e: any) {
        res.status(500).json({ error: e.message});
    }
})

export default router;
