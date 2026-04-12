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
if (firebaseConfig.firestoreDatabaseId) {
  // Note: In admin SDK, you usually access the default database. 
  // If a specific databaseId is needed, it's handled differently or not supported in the same way as client SDK.
  // For now, we'll use the default database as it's the most common case for Admin SDK.
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Helper: Ensure Jobs in Firestore ---
  const ensureJobs = async () => {
    try {
      const snapshot = await db.collection('jobs').limit(1).get();
      
      if (snapshot.empty) {
        console.log('Populating initial jobs...');
        const initialJobs = [
          {
            company: 'Google',
            logo: 'https://logo.clearbit.com/google.com',
            role: 'Software Engineering Intern',
            location: 'Bangalore, India',
            type: 'Internship',
            salary: '₹1,00,000 / month',
            posted: '1d ago',
            apply_url: 'https://careers.google.com/jobs/results/',
            skills: ['C++', 'Java', 'Python', 'Data Structures']
          },
          {
            company: 'Microsoft',
            role: 'SDE 1',
            location: 'Hyderabad, India',
            type: 'Full-time',
            salary: '₹18 LPA',
            posted: '2d ago',
            apply_url: 'https://careers.microsoft.com/professionals/us/en/search-results',
            skills: ['C#', '.NET', 'System Design']
          },
          {
            company: 'Amazon',
            role: 'Data Analyst Intern',
            location: 'Remote',
            type: 'Internship',
            salary: '₹60,000 / month',
            posted: '3d ago',
            apply_url: 'https://www.amazon.jobs/en/',
            skills: ['SQL', 'Excel', 'Tableau', 'Python']
          },
          {
            company: 'Atlassian',
            role: 'Frontend Engineer',
            location: 'Bangalore, India',
            type: 'Full-time',
            salary: '₹24 LPA',
            posted: '5h ago',
            apply_url: 'https://www.atlassian.com/company/careers',
            skills: ['React', 'TypeScript', 'Redux']
          }
        ];

        for (const job of initialJobs) {
          await db.collection('jobs').add(job);
        }
      }
    } catch (err) {
      console.error('Error ensuring jobs:', err);
    }
  };

  // --- Helper: Ensure Users in Firestore ---
  const ensureUsers = async () => {
    try {
      const snapshot = await db.collection('users').where('role', '==', 'student').get();
      
      if (snapshot.size < 10) {
        console.log('Populating initial users...');
        const initialUsers = [
          { name: 'Aarav Mehta', branch: 'CSE', year: '4th year', cgpa: '9.1', attendance_percentage: 82, skills: ['React', 'Node.js'], role: 'student' },
          { name: 'Riya Sharma', branch: 'IT', year: '3rd year', cgpa: '8.6', attendance_percentage: 76, skills: ['Python', 'Django'], role: 'student' },
          { name: 'Karan Patel', branch: 'EXTC', year: '4th year', cgpa: '7.8', attendance_percentage: 68, skills: ['C++', 'Embedded Systems'], role: 'student' },
          { name: 'Neha Singh', branch: 'CSE', year: '3rd year', cgpa: '8.3', attendance_percentage: 71, skills: ['Java', 'Spring Boot'], role: 'student' },
          { name: 'Aditya Verma', branch: 'IT', year: '4th year', cgpa: '7.5', attendance_percentage: 64, skills: ['JavaScript', 'Vue'], role: 'student' },
          { name: 'Simran Kaur', branch: 'CSE', year: '4th year', cgpa: '9.0', attendance_percentage: 85, skills: ['Machine Learning', 'Python'], role: 'student' },
          { name: 'Rahul Shah', branch: 'EXTC', year: '3rd year', cgpa: '7.2', attendance_percentage: 61, skills: ['AutoCAD', 'SolidWorks'], role: 'student' },
          { name: 'Priya Nair', branch: 'IT', year: '4th year', cgpa: '8.4', attendance_percentage: 73, skills: ['Verilog', 'MATLAB'], role: 'student' },
          { name: 'Yash Patil', branch: 'CSE', year: '3rd year', cgpa: '8.9', attendance_percentage: 80, skills: ['AWS', 'Docker'], role: 'student' },
          { name: 'Mehul Jain', branch: 'EXTC', year: '4th year', cgpa: '7.6', attendance_percentage: 66, skills: ['Data Structures', 'Algorithms'], role: 'student' },
        ];

        for (const user of initialUsers) {
          const cgpa = parseFloat(user.cgpa);
          const att = user.attendance_percentage;
          let category = 4;
          if (cgpa >= 8.5 && att >= 75) category = 1;
          else if (cgpa >= 7.5 && att >= 60) category = 2;
          else if (cgpa >= 7.0 && att >= 60) category = 3;

          const docRef = await db.collection('users').add({
            ...user,
            placement_category: category === 4 ? "Not Eligible" : `Category ${category}`
          });

          // Add 2 mock test attempts (60-90 range)
          await db.collection('test_attempts').add({
            userId: docRef.id,
            score: Math.floor(Math.random() * 31) + 60,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
          await db.collection('test_attempts').add({
            userId: docRef.id,
            score: Math.floor(Math.random() * 31) + 60,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });

          // Add 2 mock interview attempts (65-88 range)
          await db.collection('ai_interviews').add({
            userId: docRef.id,
            score: Math.floor(Math.random() * 24) + 65,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
          await db.collection('ai_interviews').add({
            userId: docRef.id,
            score: Math.floor(Math.random() * 24) + 65,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    } catch (err) {
      console.error('Error ensuring users:', err);
    }
  };

  // --- Helper: Ensure HR Requests in Firestore ---
  const ensureHrRequests = async () => {
    try {
      const snapshot = await db.collection('hr_requests').limit(1).get();
      
      if (snapshot.empty) {
        console.log('Populating initial HR requests...');
        const initialRequests = [
          { company_name: 'Infosys', hr_name: 'Rahul Sharma', email: 'rahul@infosys.com', website: 'https://infosys.com', job_roles: 'Software Engineer, Backend Developer', description: 'Looking to hire freshers for our Pune campus.', status: 'pending', created_at: admin.firestore.FieldValue.serverTimestamp() },
          { company_name: 'Tech Mahindra', hr_name: 'Sneha Gupta', email: 'sneha@techmahindra.com', website: 'https://techmahindra.com', job_roles: 'Data Analyst, Cloud Engineer', description: 'Hiring for our new cloud division.', status: 'pending', created_at: admin.firestore.FieldValue.serverTimestamp() },
        ];

        for (const req of initialRequests) {
          await db.collection('hr_requests').add(req);
        }
      }
    } catch (err) {
      console.error('Error ensuring HR requests:', err);
    }
  };

  // --- Helper: Ensure Test Accounts in Firebase Auth & Firestore ---
  const ensureTestAccounts = async () => {
    const testAccounts = [
      { email: 'teacher@test.com', password: 'password123', role: 'teacher', name: 'Test Teacher' },
      { email: 'admin@test.com', password: 'password123', role: 'super_admin', name: 'Test Admin' },
      { email: 'student@test.com', password: 'password123', role: 'student', name: 'Test Student' },
    ];

    for (const account of testAccounts) {
      try {
        let userRecord;
        try {
          userRecord = await admin.auth().getUserByEmail(account.email);
        } catch (error: any) {
          if (error.code === 'auth/user-not-found') {
            userRecord = await admin.auth().createUser({
              email: account.email,
              password: account.password,
              displayName: account.name,
            });
            console.log(`Created test user: ${account.email}`);
          } else {
            throw error;
          }
        }

        // Ensure Firestore document exists and has correct role
        const userRef = db.collection('users').doc(userRecord.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
          await userRef.set({
            uid: userRecord.uid,
            name: account.name,
            email: account.email,
            role: account.role,
            branch: 'CSE',
            year: '3rd Year',
            cgpa: '8.0',
            attendance_percentage: 80,
            skills: [],
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });
        } else {
          await userRef.update({ role: account.role });
        }
      } catch (err) {
        console.error(`Error ensuring test account ${account.email}:`, err);
      }
    }
  };

  await ensureJobs();
  await ensureUsers();
  await ensureHrRequests();
  await ensureTestAccounts();

  // --- API Routes ---
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

  app.get('/api/ai/career-insights', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { uid } = req.query;
      
      const userId = (uid as string) || 'mock-user-id';
      
      const [testSnap, interviewSnap] = await Promise.all([
        db.collection('test_attempts').where('userId', '==', userId).orderBy('createdAt', 'desc').limit(5).get(),
        db.collection('ai_interviews').where('userId', '==', userId).orderBy('createdAt', 'desc').limit(3).get()
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
        const userDoc = await db.collection('users').doc(uid as string).get();
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

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'TODO_KEYHERE') {
        return res.json({
          skillSuggestion: "Based on your recent mock tests, focus more on Graph algorithms to reach Category 1.",
          interviewPrep: "Your communication in the last interview was great! Try a technical round next.",
          topRole: "Full Stack Developer",
          placementAdvice: "Maintain your attendance above 75% and CGPA above 8.5 to stay in Category 1."
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert career counselor for tech students. 
      Analyze this student's performance data:
      - Name: ${userProfile.name}
      - CGPA: ${userProfile.cgpa}
      - Attendance: ${userProfile.attendance}%
      - Year: ${userProfile.year}
      - Skills: ${userProfile.skills.join(', ')}
      - Recent Mock Tests: ${JSON.stringify(testData.map(t => ({ title: t.testTitle, score: t.score })))}
      - Recent AI Interviews: ${JSON.stringify(interviewData.map(i => ({ role: i.role, score: i.finalScore, feedback: i.feedback })))}
      
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      let text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error) {
      console.error('AI Error:', error);
      res.json({
        skillSuggestion: "Your DSA score is good, but consistency can help you crack top companies.",
        interviewPrep: "Start a personalized AI mock interview and get instant feedback.",
        topRole: "Software Engineer, Data Analyst",
        placementAdvice: "Focus on improving your attendance to reach the next eligibility category."
      });
    }
  });

  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { question } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'TODO_KEYHERE') {
        return res.json({ answer: "I'm currently running in offline mode. Please configure a valid Gemini API key in the settings to ask custom questions." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert career counselor for tech students. Answer the following question concisely and helpfully: ${question}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      res.json({ answer: response.text });
    } catch (error) {
      console.error('AI Ask Error:', error);
      res.status(500).json({ error: 'Failed to get answer from AI' });
    }
  });

  app.post('/api/ai/generate-test', async (req, res) => {
    try {
      const { category, company, role } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'TODO_KEYHERE') {
        return res.json({
          questions: [
            {
              question: "What is the primary key in a database?",
              options: ["A unique identifier for a record", "A foreign key", "A string value", "None of the above"],
              correctAnswer: "A unique identifier for a record",
              difficulty: "Easy",
              category: "Technical"
            }
          ]
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Generate 10 realistic interview questions for a ${role} role at ${company} for a college student in the ${category} category. Mix technical, conceptual, and scenario questions.
      Return ONLY a JSON array of objects. Each object must have:
      'question' (string),
      'options' (array of 4 strings),
      'correctAnswer' (string, must exactly match one of the options),
      'difficulty' (string: Easy, Medium, Hard),
      'category' (string).
      Do not include markdown formatting like \`\`\`json.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      let text = response.text || '';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(text);
      res.json({ questions: parsed });
    } catch (error) {
      console.error('AI Generate Test Error:', error);
      res.status(500).json({ error: 'Failed to generate test' });
    }
  });

  app.post('/api/ai/interview-chat', async (req, res) => {
    try {
      const { category, company, role, history, forceFinish } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'TODO_KEYHERE') {
        if (forceFinish) {
          return res.json({
            reply: "Interview ended.",
            isFinished: true,
            feedback: { score: 85, strengths: ["Good communication"], weaknesses: ["Needs more technical depth"], suggestedLearning: ["System Design"] }
          });
        }
        return res.json({ reply: "This is a mock response because the API key is missing.", isFinished: false });
      }

      const ai = new GoogleGenAI({ apiKey });
      
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

      const contents = history.map((msg: any) => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Understood. I will act as the interviewer.' }] },
          ...contents
        ],
      });

      let text = response.text || '';
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error) {
      console.error('AI Interview Chat Error:', error);
      res.status(500).json({ error: 'Failed to get interview response' });
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
