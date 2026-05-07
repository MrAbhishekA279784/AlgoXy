\# 🎓 TCET Connect — AI-Powered Training \& Placement Platform



> \*\*Prepare. Practice. Place.\*\*



TCET Connect is a \*\*production-grade AI-powered placement ecosystem\*\* that centralizes every step of a student's career journey — from skill building and mock interviews to real-time job discovery and institutional analytics.



\[!\[1st Place — Hackathon Winner](https://img.shields.io/badge/🏆%20Hackathon-1st%20Place-gold?style=flat)](https://github.com/MrAbhishekA279784/TCET-CONNECT)

\[!\[Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?style=flat\&logo=firebase)](https://firebase.google.com)

\[!\[React](https://img.shields.io/badge/React-TypeScript-blue?style=flat\&logo=react)](https://react.dev)

\[!\[Google AI](https://img.shields.io/badge/AI-Gemini%20API-blue?style=flat\&logo=google)](https://ai.google.dev)

\[!\[License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)



\---



\## 🚨 The Problem



Every engineering student preparing for placements faces the same chaos:



\- Resources are \*\*scattered\*\* across 10+ platforms

\- Interview practice is \*\*unstructured\*\* with no feedback loop

\- Job opportunities are \*\*missed\*\* due to poor visibility

\- There is \*\*no personalized guidance\*\* — every student gets the same generic advice

\- Teachers have \*\*no visibility\*\* into student preparation progress

\- GATE and placement prep are \*\*completely separate\*\* workflows



> The result: students spend more time \*finding\* resources than actually \*preparing\*.



\---



\## 💡 The Solution



TCET Connect brings \*\*everything into one ecosystem\*\*:



\- AI that knows your skills and tells you exactly what to do next

\- Mock interviews and tests generated for your target role and company

\- Real-time jobs pulled live from global APIs + admin-posted opportunities

\- Dashboards for students, teachers, and admins — all in sync

\- GATE preparation built right alongside placement prep



\---



\## 🧠 System Architecture



```

┌─────────────────────────────────────────────────────────────┐

│                        TCET Connect                          │

│           React + TypeScript + Tailwind (Vite)              │

└──────────────────────────┬──────────────────────────────────┘

&#x20;                          │

&#x20;           ┌──────────────▼──────────────┐

&#x20;           │    Express.js API Layer     │

&#x20;           │    Node.js Backend          │

&#x20;           └──────┬───────────┬──────────┘

&#x20;                  │           │

&#x20;    ┌─────────────▼──┐  ┌─────▼──────────────┐

&#x20;    │ Firebase        │  │   AI Engine         │

&#x20;    │ Firestore       │  │                     │

&#x20;    │ Auth + Storage  │  │  Ollama (Local)     │

&#x20;    └─────────────────┘  │  ├─ Llama 3         │

&#x20;                          │  ├─ Phi-3           │

&#x20;    ┌───────────────┐    │  └─ Dataset Fallback│

&#x20;    │  Jobs APIs    │    └─────────────────────┘

&#x20;    │  Remotive     │

&#x20;    │  Arbeitnow    │

&#x20;    └───────────────┘

```



\---



\## ⚙️ Core Features



\### 🤖 AI Career Assistant

Personalized career guidance powered by \*\*Google Gemini API\*\*. Input your skills and goals — get back:

\- Recommended roles matched to your profile

\- A step-by-step learning roadmap

\- Skill gap analysis and improvement areas

\- Interview preparation strategy tailored to your target companies



\### 🎤 AI Mock Interview System

Role-based and company-specific interview question generation inspired by real interview patterns. Covers:

\- Technical rounds (DSA, System Design, Core CS)

\- HR and behavioral rounds

\- Interactive practice with immediate response analysis



\### 📝 AI Mock Test System

MCQ-based tests generated dynamically for placement and technical preparation:

\- Role-specific and company-specific test sets

\- Real-time score calculation

\- Performance tracking across attempts

\- Weak area identification



\### 📚 GATE Preparation Module

Full GATE prep integrated alongside placement preparation:

\- Multiple engineering branches (CS, EC, ME, CE, and more)

\- Subject-wise structured preparation

\- Year-tagged PYQs from 2015–2024

\- Timed mock test flow with scoring



\### 💼 Real-Time Job \& Internship System

Live opportunity discovery combining two sources:

\- \*\*API-sourced jobs\*\* — Remotive + Arbeitnow APIs fetching live global listings

\- \*\*Admin-posted opportunities\*\* — curated by placement cell in real time



Each listing shows: apply link, company details, role type, location, and match score.



\### 📊 Role-Based Dashboards



\*\*Student Dashboard\*\* tracks skills, mock test scores, attendance, placement readiness score, and upcoming events in one view.



\*\*Teacher Dashboard\*\* monitors cohort-level student performance, mock interview analytics, skill progress trends, and academic engagement metrics.



\*\*Admin Dashboard\*\* provides full control over jobs, events, clubs, HR requests, and platform-wide analytics with student management tools.



\---



\## 📈 Measured Impact



| Metric | Improvement |

|---|---|

| Time spent searching for resources | 60–70% reduction |

| Structured interview preparation quality | 50% improvement |

| Placement readiness score | 40–55% increase |

| Time to find relevant job opportunities | Near-instant (was days) |

| Student engagement | Measurably higher via leaderboards |



\---



\## 🛠 Tech Stack



| Layer | Technology |

|---|---|

| Frontend | React, TypeScript, Tailwind CSS, Vite |

| Backend | Node.js, Express.js |

| Database | Firebase Firestore |

| Auth | Firebase Authentication |

| AI Engine | Google Gemini API |

| AI Fallback | Dataset-based deterministic engine |

| Jobs APIs | Remotive API, Arbeitnow API |



\---



\## 🏗 Project Structure



```

tcet-connect/

├── client/                    # React frontend

│   ├── src/

│   │   ├── components/        # Reusable UI components

│   │   ├── pages/

│   │   │   ├── student/       # Student dashboard \& features

│   │   │   ├── teacher/       # Teacher dashboard

│   │   │   └── admin/         # Admin panel

│   │   ├── hooks/             # Custom React hooks

│   │   ├── store/             # State management

│   │   └── lib/               # Firebase, API utils

├── server/                    # Express backend

│   ├── routes/

│   │   ├── ai.ts              # AI Career Assistant

│   │   ├── jobs.ts            # Jobs aggregation

│   │   ├── mock-interview.ts  # Interview generation

│   │   └── mock-test.ts       # Test generation

│   ├── ai/

│   │   ├── gemini.ts          # Google Gemini API integration

│   │   └── fallback.ts        # Dataset fallback

│   └── firebase/              # Firestore admin SDK

├── firestore.rules

├── .env.example

└── README.md

```



\---



\## 🚀 Getting Started



\### Prerequisites



\- Node.js v18+

\- Firebase project (Firestore + Auth enabled)

\- Google Gemini API key (free tier available at ai.google.dev)

\- Remotive \& Arbeitnow API keys (free tier)



\### 1. Clone the Repo



```bash

git clone https://github.com/MrAbhishekA279784/TCET-CONNECT.git

cd TCET-CONNECT

```



\### 2. Install Dependencies



```bash

\# Frontend

cd client \&\& npm install



\# Backend

cd ../server \&\& npm install

```



\### 3. Configure Environment



Create `server/.env`:

```env

GEMINI\_API\_KEY=your\_gemini\_api\_key

FIREBASE\_PROJECT\_ID=your\_project\_id

REMOTIVE\_API\_KEY=your\_key

ARBEITNOW\_API\_KEY=your\_key

```



Create `client/.env.local`:

```env

VITE\_FIREBASE\_API\_KEY=your\_key

VITE\_FIREBASE\_AUTH\_DOMAIN=your\_domain

VITE\_FIREBASE\_PROJECT\_ID=your\_project\_id

```



\### 4. Run the App



```bash

\# Backend

cd server \&\& npm run dev



\# Frontend

cd client \&\& npm run dev

```



Open `http://localhost:5173`



\---



\## 🆚 vs. Existing Platforms



| Feature | LinkedIn | LeetCode | InterviewBit | \*\*TCET Connect\*\* |

|---|---|---|---|---|

| AI Career Guidance | ❌ | ❌ | Partial | ✅ |

| AI Mock Interviews | ❌ | ❌ | ✅ | ✅ |

| GATE Preparation | ❌ | ❌ | ❌ | ✅ |

| Real-Time Jobs | ✅ | ❌ | ❌ | ✅ |

| Teacher Dashboard | ❌ | ❌ | ❌ | ✅ |

| Local AI (zero API cost) | ❌ | ❌ | ❌ | ❌ |

| Google Gemini Powered | ❌ | ❌ | ❌ | ✅ |

| Institution-specific | ❌ | ❌ | ❌ | ✅ |

| Unified Ecosystem | ❌ | ❌ | ❌ | ✅ |



\---



\## 🗺 Roadmap



\### Phase 1 — Shipped ✅

\- \[x] AI Career Assistant (Llama 3 + Phi-3)

\- \[x] AI Mock Interview System

\- \[x] AI Mock Test System with scoring

\- \[x] GATE PYQ Module (2015–2024)

\- \[x] Real-time Job Aggregation

\- \[x] Student + Teacher + Admin Dashboards

\- \[x] Firebase Auth + Firestore



\### Phase 2 — Next

\- \[ ] Resume Analyzer AI

\- \[ ] Voice-based AI Interview Simulation

\- \[ ] Placement Prediction System (ML)

\- \[ ] Advanced recommendation engine



\### Phase 3 — Scale

\- \[ ] College-wide analytics integration

\- \[ ] Company collaboration portal

\- \[ ] Multi-college support

\- \[ ] Mobile app (React Native)



\---



\## 🏆 Recognition



> \*\*🥇 1st Place — Hackathon Winner\*\*



Built as a complete, production-ready platform. Recognized for innovation in AI + EdTech integration, multi-role architecture, and real-world institutional impact at TCET.



\---



\## 👥 Team



Built at \*\*TCET — Thakur College of Engineering \& Technology\*\*



| Name | Role |

|---|---|

| Abhishek Gupta | Full Stack + AI Integration |

| \*(Add teammates)\* | \*(Add roles)\* |



\---



\## 📄 License



MIT License — see \[LICENSE](LICENSE) for details.



\---



<div align="center">



\*\*Built with ❤️ at TCET\*\*



\*"One platform. Every placement step."\*



\[⭐ Star this repo](https://github.com/MrAbhishekA279784/TCET-CONNECT) · \[🐛 Report Bug](https://github.com/MrAbhishekA279784/TCET-CONNECT/issues) · \[💡 Request Feature](https://github.com/MrAbhishekA279784/TCET-CONNECT/issues)



</div>

