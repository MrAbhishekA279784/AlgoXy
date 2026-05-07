import express from 'express';
import { getMCQsFromBank } from '../services/testService';
import { cacheGet, cacheSet, CACHE_TTL } from '../services/cacheService';
import { firestoreGet, firestoreSet } from '../services/firebaseService';
import { isGeminiAvailable, callGemini, genAI } from '../utils/gemini';

const router = express.Router();

router.post('/start', async (req, res) => {
  try {
    const { category = 'Tech', role = 'Software Engineer', company = '' } = req.body;
    const cacheKey = `test:${category}:${role}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const firestoreKey = `${category}_${role}`.replace(/\s+/g, '_').toLowerCase();
    const fsDoc = await firestoreGet('mcq_cache', firestoreKey);
    if (fsDoc?.questions?.length >= 10) {
      const result = { questions: fsDoc.questions.sort(() => Math.random() - 0.5).slice(0, 10) };
      cacheSet(cacheKey, result, CACHE_TTL.test);
      return res.json(result);
    }

    const bankQuestions = getMCQsFromBank(category, role, 10);
    if (bankQuestions.length >= 10) {
      const result = { questions: bankQuestions };
      cacheSet(cacheKey, result, CACHE_TTL.test);
      firestoreSet('mcq_cache', firestoreKey, { questions: bankQuestions, category, role, updatedAt: new Date().toISOString() });
      return res.json(result);
    }

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

    const result = { questions: bankQuestions.length > 0 ? bankQuestions : getMCQsFromBank('Tech', 'Software Engineer', 10) };
    cacheSet(cacheKey, result, CACHE_TTL.test);
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
