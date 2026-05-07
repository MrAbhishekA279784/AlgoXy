import { GoogleGenAI } from '@google/genai';

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
export const isGeminiAvailable = () =>
  !!GEMINI_KEY && GEMINI_KEY !== 'YOUR_GEMINI_API_KEY' && !GEMINI_KEY.includes('TODO');

export const genAI = isGeminiAvailable()
  ? new GoogleGenAI({ apiKey: GEMINI_KEY })
  : null;

export async function callGemini(prompt: string, json = false): Promise<string> {
  if (!genAI) throw new Error('Gemini unavailable');
  const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    ...(json ? { config: { responseMimeType: 'application/json' } } : {}),
  });
  let text = response.text || '';
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}
