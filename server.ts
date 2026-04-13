import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
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
  const PORT = 3000;

  app.use(express.json());

  // --- AI Request Handler ---
  async function handleAIRequest(type: string, payload: any) {
    const apiKey = process.env.GEMINI_API_KEY;
    const isOffline = !apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '' || apiKey.includes('TODO');

    if (type === 'career') {
      const { uid } = payload;
      const userId = uid || 'mock-user-id';
      
      const [testSnap, interviewSnap] = await Promise.all([
        db.collection('test_attempts').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(5).get(),
        db.collection('ai_interviews').where('userId', '==', userId).orderBy('timestamp', 'desc').limit(3).get()
      ]);

      const testData = testSnap.docs.map(doc => doc.data());
      const interviewData = interviewSnap.docs.map(doc => doc.data());

      let userProfile = {
        name: 'Ananya Singh',
        cgpa: 8.74,
        attendance: 87,
        year: '3rd Year',
        skills: ['React', 'Node.js', 'Python', 'DSA']
      };

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
            {
              question: "What is the primary key in a database?",
              options: ["A unique identifier for a record", "A foreign key", "A string value", "None of the above"],
              correctAnswer: "A unique identifier for a record",
              difficulty: "Easy",
              category: "Technical"
            }
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
      let q = db.collection('jobs') as any;

      let queryType = type;
      if (type === 'Internships') queryType = 'Internship';

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
      }

      res.json(jobs);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get('/api/leaderboard', async (req, res) => {
    try {
      const { filter } = req.query;
      const usersSnap = await db.collection('users').get();
      let users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

      if (users.length === 0) {
        // Mock data if DB is empty
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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
