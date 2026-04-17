import { useState, useEffect, useRef } from "react";
<<<<<<< HEAD
import { ChevronDown, Info, FileText, Mic, Square, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { startInterview, getFollowupQuestion, getInterviewFeedback } from "@/lib/api";
=======
import { ChevronDown, Info, FileText, PlayCircle, Mic, Square, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { chatAIInterview } from "@/lib/api";
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
import { saveInterviewAttempt, getUserActivity } from "@/lib/db";
import { toast } from "sonner";

const CATEGORY_DATA: Record<string, any[]> = {
  "Tech": [
    { company: "TCS", role: "Software Engineer", logo: "https://logo.clearbit.com/tcs.com" },
    { company: "Deloitte", role: "Data Analyst", logo: "https://logo.clearbit.com/deloitte.com" },
    { company: "EY", role: "Data Analyst", logo: "https://logo.clearbit.com/ey.com" },
    { company: "Fractal Analytics", role: "Data Analyst", logo: "https://logo.clearbit.com/fractal.ai" },
    { company: "Infosys", role: "QA Engineer", logo: "https://logo.clearbit.com/infosys.com" },
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

export default function MockInterviews() {
  const [category, setCategory] = useState("Tech");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  
  const [activeInterview, setActiveInterview] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  
  const [attempts, setAttempts] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    let timer: any;
    if (activeInterview && !feedback) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleEndSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeInterview, feedback]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    getUserActivity().then(activities => {
      const interviewAttempts = activities
        .filter(a => a.type === 'interview')
        .map(a => ({
          id: a.id,
          role: a.role,
          score: a.finalScore ? `${a.finalScore}/100` : 'N/A',
          date: a.createdAt?.toDate().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true }) || 'Just now'
        }));
      setAttempts(interviewAttempts);
    });
  }, [feedback]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(window.speechSynthesis);

  const currentCards = CATEGORY_DATA[category] || [];
  const filteredCards = currentCards.filter(c => 
    (!company || c.company === company) &&
    (!role || c.role === role)
  );

  const companies = Array.from(new Set(currentCards.map(c => c.company)));
  const roles = Array.from(new Set(currentCards.map(c => c.role)));

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };
    }
  }, []);

  const speak = (text: string) => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    synthRef.current.speak(utterance);
  };

  const handleEndSession = async () => {
    if (!activeInterview || feedback) return;
    setIsThinking(true);
    try {
<<<<<<< HEAD
      const res = await getInterviewFeedback(category, activeInterview.company, activeInterview.role, chatHistory);
      const fb = res.feedback || { score: 70, strengths: ['Completed session'], weaknesses: ['Practice more'], suggestedLearning: ['DSA', 'System Design'] };
      setFeedback(fb);
      try { await saveInterviewAttempt(activeInterview.company, activeInterview.role, category, chatHistory, fb); } catch {}
=======
      const res = await chatAIInterview(category, activeInterview.company, activeInterview.role, chatHistory, true);
      const fb = res.feedback || JSON.parse(res.reply);
      setFeedback(fb);
      await saveInterviewAttempt(activeInterview.company, activeInterview.role, category, chatHistory, fb);
      
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
      const newAttempt = {
        id: Date.now(),
        role: activeInterview.role,
        score: fb.score ? `${fb.score}/100` : 'N/A',
        date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true })
      };
      setAttempts([newAttempt, ...attempts]);
<<<<<<< HEAD
      toast.success("Interview completed!");
    } catch (e) {
=======
      toast.success("Interview completed and saved!");
    } catch (e) {
      console.error("Failed to end session", e);
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
      toast.error("Failed to generate feedback");
    } finally {
      setIsThinking(false);
    }
  };

  const handleStartInterview = async (card: any) => {
    setActiveInterview(card);
    setChatHistory([]);
    setFeedback(null);
    setIsThinking(true);
    setTimeLeft(30 * 60);
    try {
<<<<<<< HEAD
      const res = await startInterview(category, card.company, card.role);
      setChatHistory([{ role: 'ai', text: res.reply }]);
      speak(res.reply);
    } catch (error: any) {
      toast.error("Failed to start interview");
=======
      const res = await chatAIInterview(category, card.company, card.role, []);
      setChatHistory([{ role: 'ai', text: res.reply }]);
      speak(res.reply);
    } catch (error: any) {
      toast.error(error.message || "Failed to start interview");
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
      setActiveInterview(null);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendAnswer = async () => {
    if (!transcript.trim()) return;
<<<<<<< HEAD
    if (isRecording) toggleRecording();
=======
    
    if (isRecording) {
      toggleRecording();
    }

>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
    const userText = transcript;
    setTranscript("");
    const newHistory = [...chatHistory, { role: 'user', text: userText }];
    setChatHistory(newHistory);
    setIsThinking(true);
<<<<<<< HEAD
    try {
      const res = await getFollowupQuestion(category, activeInterview.company, activeInterview.role, newHistory);
      if (res.isFinished) {
        const fb = res.feedback || { score: 75, strengths: ['Good effort'], weaknesses: ['More detail needed'], suggestedLearning: ['DSA'] };
        setFeedback(fb);
        try { await saveInterviewAttempt(activeInterview.company, activeInterview.role, category, newHistory, fb); } catch {}
        setAttempts(prev => [{ id: Date.now(), role: activeInterview.role, score: `${fb.score}/100`, date: new Date().toLocaleString() }, ...prev]);
        toast.success("Interview completed!");
=======

    try {
      const res = await chatAIInterview(category, activeInterview.company, activeInterview.role, newHistory);
      
      if (res.isFinished) {
        try {
          const fb = res.feedback || JSON.parse(res.reply);
          setFeedback(fb);
          
          await saveInterviewAttempt(activeInterview.company, activeInterview.role, category, newHistory, fb);

          const newAttempt = {
            id: Date.now(),
            role: activeInterview.role,
            score: fb.score ? `${fb.score}/100` : 'N/A',
            date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true })
          };
          setAttempts([newAttempt, ...attempts]);
          toast.success("Interview completed and saved!");
          
        } catch (e) {
          console.error("Failed to parse feedback or save", e);
          setChatHistory(prev => [...prev, { role: 'ai', text: res.reply }]);
          speak(res.reply);
        }
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', text: res.reply }]);
        speak(res.reply);
      }
<<<<<<< HEAD
    } catch {
=======
    } catch (error: any) {
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
      toast.error("Failed to get response");
    } finally {
      setIsThinking(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  if (activeInterview) {
    return (
      <div className="p-8 max-w-4xl mx-auto transition-colors duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{activeInterview.role} Interview</h1>
            <p className="text-slate-500 dark:text-slate-400">{activeInterview.company}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Question {Math.min(10, Math.floor(chatHistory.length / 2) + 1)}/10
            </div>
            <div className="text-xl font-mono font-bold text-slate-700 dark:text-slate-300">
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={handleEndSession}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        {feedback ? (
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Interview Feedback</h2>
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full border-8 border-blue-100 dark:border-blue-900/20 flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{feedback.score || 0}</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Strengths
                </h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                  {feedback.strengths?.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-500 dark:text-red-400 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" /> Areas to Improve
                </h3>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                  {feedback.weaknesses?.map((w: string, i: number) => <li key={i}>• {w}</li>)}
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Suggested Learning Topics</h3>
              <div className="flex flex-wrap gap-2">
                {feedback.suggestedLearning?.map((topic: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-lg">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-4">
              <button
                onClick={() => { setActiveInterview(null); setFeedback(null); }}
                className="px-6 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Back to Interviews
              </button>
              <button
                onClick={async () => {
                  try {
                    const { createCommunityPost } = await import('@/lib/db');
                    const { auth } = await import('@/lib/firebase');
                    const content = `I scored ${feedback.score}% in the ${activeInterview.role} mock interview for ${activeInterview.company}! 🎯`;
                    await createCommunityPost(
                      content, 
                      auth.currentUser?.displayName || "Anonymous", 
                      auth.currentUser?.photoURL || "https://i.pravatar.cc/150?u=anon"
                    );
                    toast.success("Shared to community!");
                  } catch (error) {
                    toast.error("Failed to share to community");
                  }
                }}
                className="px-6 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Share to Community
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-blue-600 text-white rounded-br-sm" 
                      : "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 p-4 rounded-2xl rounded-bl-sm text-sm flex gap-1">
                    <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Speak or type your answer..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 pr-32 min-h-[100px] resize-none outline-none focus:border-blue-500 dark:text-white transition-colors"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button
                  onClick={toggleRecording}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isRecording ? "bg-red-100 dark:bg-red-900/20 text-red-500 animate-pulse" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700"
                  )}
                >
                  {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleSendAnswer}
                  disabled={!transcript.trim() || isThinking}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
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
                  onClick={() => handleStartInterview(card)}
                  className="w-full py-2 rounded-full border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Start Interview
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
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Last attempted: {attempt.date}</p>
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{attempt.score}</div>
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800">
                        <FileText className="w-4 h-4" />
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
