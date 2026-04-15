import { useState, useEffect } from "react";
import { ChevronDown, Info, FileText, PlayCircle, Mic, Square, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateAITest } from "@/lib/api";
import { saveTestAttempt, getUserActivity } from "@/lib/db";
import { toast } from "sonner";

const CATEGORY_DATA: Record<string, any[]> = {
  "Tech": [
    { company: "TCS", role: "Software Engineer", logo: "https://logo.clearbit.com/tcs.com" },
    { company: "NVIDIA", role: "Embedded Systems Engineer", logo: "https://logo.clearbit.com/nvidia.com" },
    { company: "Accenture", role: "Software Engineer", logo: "https://logo.clearbit.com/accenture.com" },
    { company: "Deloitte", role: "Data Analyst", logo: "https://logo.clearbit.com/deloitte.com" },
    { company: "EY", role: "Data Analyst", logo: "https://logo.clearbit.com/ey.com" },
    { company: "Fractal Analytics", role: "Data Analyst", logo: "https://logo.clearbit.com/fractal.ai" },
  ],
  "Mechanical": [
    { company: "Tata Motors", role: "Design Engineer", logo: "https://logo.clearbit.com/tatamotors.com" },
    { company: "L&T", role: "Mechanical Engineer", logo: "https://logo.clearbit.com/larsentoubro.com" },
    { company: "Mahindra", role: "Production Engineer", logo: "https://logo.clearbit.com/mahindra.com" },
  ],
  "Civil": [
    { company: "L&T", role: "Site Engineer", logo: "https://logo.clearbit.com/larsentoubro.com" },
    { company: "DLF", role: "Civil Engineer", logo: "https://logo.clearbit.com/dlf.in" },
    { company: "AECOM", role: "Structural Engineer", logo: "https://logo.clearbit.com/aecom.com" },
  ],
  "Electrical": [
    { company: "Siemens", role: "Electrical Engineer", logo: "https://logo.clearbit.com/siemens.com" },
    { company: "ABB", role: "Power Systems Engineer", logo: "https://logo.clearbit.com/abb.com" },
  ],
};

const CATEGORIES = ["Tech", "Mechanical", "Civil", "Electrical", "Electronics", "AI/ML", "Data Science", "Core Engineering", "Business/Management"];

export default function MockTests() {
  const [category, setCategory] = useState("Tech");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  
  const [startingTest, setStartingTest] = useState<any>(null);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    getUserActivity().then(activities => {
      const testAttempts = activities
        .filter(a => a.type === 'test')
        .map(a => ({
          id: a.id,
          role: a.testTitle.split(' - ')[1] || a.testTitle,
          score: `${a.score}/100`,
          date: a.createdAt?.toDate().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true }) || 'Just now'
        }));
      setAttempts(testAttempts);
    });
  }, [activeTest]);

  const currentCards = CATEGORY_DATA[category] || [];
  const filteredCards = currentCards.filter(c => 
    (!company || c.company === company) &&
    (!role || c.role === role)
  );

  const companies = Array.from(new Set(currentCards.map(c => c.company)));
  const roles = Array.from(new Set(currentCards.map(c => c.role)));

  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    let timer: any;
    if (activeTest && !testResult) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTest, testResult]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartTest = async (card: any) => {
    setStartingTest(card);
    try {
      const res = await generateAITest(category, card.company, card.role);
      setActiveTest({ ...card, questions: res.questions });
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeLeft(30 * 60);
      setTestResult(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to start test");
    } finally {
      setStartingTest(null);
    }
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;
    
    let score = 0;
    let correct = 0;
    let wrong = 0;
    activeTest.questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correctAnswer) {
        score++;
        correct++;
      } else if (answers[i]) {
        wrong++;
      }
    });

    const percentage = Math.round((score / activeTest.questions.length) * 100);
    const timeTaken = 30 * 60 - timeLeft;
    let performanceLevel = "Beginner";
    if (percentage >= 80) performanceLevel = "Advanced";
    else if (percentage >= 50) performanceLevel = "Intermediate";

    const result = {
      score: percentage,
      correct,
      wrong,
      timeTaken,
      performanceLevel,
      total: activeTest.questions.length
    };

    setTestResult(result);

    try {
      await saveTestAttempt(
        activeTest.company + "_" + activeTest.role, 
        `${activeTest.company} - ${activeTest.role}`, 
        percentage,
        timeTaken
      );
      
      const newAttempt = {
        id: Date.now(),
        role: activeTest.role,
        score: `${percentage}/100`,
        date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true })
      };
      setAttempts([newAttempt, ...attempts]);
      
      toast.success(`Test submitted! You scored ${percentage}%`);
    } catch (error) {
      toast.error("Failed to save test result");
    }
  };

  const handleShareToCommunity = async () => {
    if (!testResult || !activeTest) return;
    try {
      const { createCommunityPost } = await import('@/lib/db');
      const { auth } = await import('@/lib/firebase');
      const content = `I scored ${testResult.score}% in the ${activeTest.role} mock test for ${activeTest.company}! 🎯`;
      await createCommunityPost(
        content, 
        auth.currentUser?.displayName || "Anonymous", 
        auth.currentUser?.photoURL || "https://i.pravatar.cc/150?u=anon"
      );
      toast.success("Shared to community!");
    } catch (error) {
      toast.error("Failed to share to community");
    }
  };

  if (testResult) {
    return (
      <div className="p-8 max-w-4xl mx-auto transition-colors duration-300">
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Test Complete!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{activeTest.role} at {activeTest.company}</p>
          
          <div className="flex justify-center mb-8">
            <div className="w-40 h-40 rounded-full border-8 border-blue-100 dark:border-blue-900/20 flex items-center justify-center flex-col">
              <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">{testResult.score}%</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{testResult.performanceLevel}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
              <p className="text-2xl font-bold text-green-500">{testResult.correct}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Correct</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
              <p className="text-2xl font-bold text-red-500">{testResult.wrong}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Wrong</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
              <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">{formatTime(testResult.timeTaken)}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Time Taken</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => { setActiveTest(null); setTestResult(null); }}
              className="px-6 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Back to Tests
            </button>
            <button
              onClick={handleShareToCommunity}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Share to Community
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTest) {
    const q = activeTest.questions[currentQuestionIndex];
    return (
      <div className="p-8 max-w-4xl mx-auto transition-colors duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{activeTest.role} Test</h1>
            <p className="text-slate-500 dark:text-slate-400">{activeTest.company}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-xl font-mono font-bold text-slate-700 dark:text-slate-300">
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={() => { setActiveTest(null); setTestResult(null); }}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              End Test
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded uppercase">{q.category}</span>
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded uppercase">{q.difficulty}</span>
            </div>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Question {currentQuestionIndex + 1} of {activeTest.questions.length}
            </div>
          </div>
          
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full mb-8 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / activeTest.questions.length) * 100}%` }}
            />
          </div>

          <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-6">{q.question}</h2>
          
          <div className="space-y-3">
            {q.options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-colors",
                  answers[currentQuestionIndex] === opt 
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100" 
                    : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 dark:text-slate-300"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentQuestionIndex === activeTest.questions.length - 1 ? (
            <button
              onClick={handleSubmitTest}
              className="px-6 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              Submit Test
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(activeTest.questions.length - 1, prev + 1))}
              className="px-6 py-2.5 rounded-xl font-semibold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto transition-colors duration-300">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Get Interview-ready for top roles!
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="relative">
              <select 
                value={category}
                onChange={e => { setCategory(e.target.value); setCompany(""); setRole(""); }}
                className="appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>Category: {c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
              >
                <option value="">Select Company</option>
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select 
                value={role}
                onChange={e => setRole(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
              >
                <option value="">Select Role</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <button 
              onClick={() => { setCategory("Tech"); setCompany(""); setRole(""); }}
              className="text-sm font-medium text-red-500 hover:text-red-600 px-2"
            >
              Clear All
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCards.map((card, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center mb-4 p-2">
                  <img src={card.logo} alt={card.company} className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{card.role}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{card.company}</p>
                <button 
                  onClick={() => handleStartTest(card)}
                  disabled={startingTest === card}
                  className="w-full py-2 rounded-full border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-50"
                >
                  {startingTest === card ? "Starting..." : "Start Test"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          {/* My Attempts */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">My Attempts</h2>
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-medium text-slate-500 dark:text-slate-400">
                <div>Category</div>
                <div>Score</div>
                <div>Action</div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {attempts.map((attempt) => (
                  <div key={attempt.id} className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 items-center">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">{attempt.role}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Last Attempted:<br/>{attempt.date}</p>
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{attempt.score}</div>
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                        <PlayCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
