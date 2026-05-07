import express from 'express';
import { buildInitialInterviewMessage, getNextQuestionFromBank } from '../services/interviewService';
import { cacheGet, cacheSet, CACHE_TTL } from '../services/cacheService';
import { isGeminiAvailable, callGemini, genAI } from '../utils/gemini';

const router = express.Router();

router.post('/start', async (req, res) => {
  try {
    const { category = 'Tech', company = 'TCS', role = 'Software Engineer' } = req.body;
    const cacheKey = `interview-start:${category}:${company}:${role}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const { reply } = buildInitialInterviewMessage(category, company, role);
    const result = { reply, isFinished: false };
    cacheSet(cacheKey, result, CACHE_TTL.interview);
    res.json(result);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/followup', async (req, res) => {
  try {
    const { category = 'Tech', company = 'TCS', role = 'Software Engineer', history = [] } = req.body;
    const questionIndex = Math.floor(history.length / 2); // Each pair = 1 question
    const isLastQuestion = questionIndex >= 9;

    const nextQ = getNextQuestionFromBank(category, company, role, questionIndex);

    if (nextQ && !isLastQuestion) {
      return res.json({
        reply: `**Question ${questionIndex + 1}:** ${nextQ}`,
        isFinished: false,
      });
    }

    if (isGeminiAvailable() && genAI) {
      try {
        const lastAnswer = history[history.length - 1]?.text || '';
        const prompt = `You are interviewing a student for a ${role} role at ${company}. They just answered: "${lastAnswer.substring(0, 200)}". Ask ONE sharp follow-up question. Return JSON: {"reply": "...", "isFinished": false}`;
        const text = await callGemini(prompt, true);
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch { /* fall through to local */ }
    }

    if (nextQ) return res.json({ reply: `**Question ${questionIndex + 1}:** ${nextQ}`, isFinished: false });
    return res.json({ reply: 'Thank you for answering all questions. Click "End Session" to get your feedback.', isFinished: false });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.post('/feedback', async (req, res) => {
  try {
    const { category = 'Tech', company = 'TCS', role = 'Software Engineer', history = [] } = req.body;
    const cacheKey = `interview-feedback:${category}:${company}:${history.length}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const userAnswers = history.filter((_: any, i: number) => i % 2 === 1).map((m: any) => m.text);

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

export default router;
