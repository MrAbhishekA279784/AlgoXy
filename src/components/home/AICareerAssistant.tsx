import { useState, useEffect } from "react";
import { Sparkles, Target, Briefcase, ArrowRight, X, Send, MessageCircle, TrendingUp } from "lucide-react";
import { fetchAICareerInsights, askAICareerAssistant } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function AICareerAssistant() {
  const [insights, setInsights] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);

  useEffect(() => {
    // Wait for auth to initialize
    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchAICareerInsights(user?.uid)
        .then(setInsights)
        .catch(err => {
          console.error("Error fetching AI insights:", err);
        });
    });
    return () => unsubscribe();
  }, []);

  const handleAsk = async () => {
    if (!question.trim()) return;
    const q = question;
    setQuestion("");
    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    setIsAsking(true);
    try {
      const res = await askAICareerAssistant(q);
      setChatHistory(prev => [...prev, { role: 'ai', text: res.answer }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error." }]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          AI Career Assistant
        </h2>
        <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">
          BETA
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
        Your personal AI guide to career growth.
      </p>

      <div className="space-y-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
              Skill Suggestion
            </h3>
            {insights ? (
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                {insights.skillSuggestion}
              </p>
            ) : (
              <div className="space-y-1.5 mt-1">
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-full"></div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-4/5"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
            <Target className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
              Interview Prep
            </h3>
            {insights ? (
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                {insights.interviewPrep}
              </p>
            ) : (
              <div className="space-y-1.5 mt-1">
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-full"></div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
              Top Role for You
            </h3>
            {insights ? (
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                {insights.topRole}
              </p>
            ) : (
              <div className="space-y-1.5 mt-1">
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-2/3"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
      >
        View Full Report <ArrowRight className="w-4 h-4" />
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/50 dark:bg-gray-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-[#111827] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800 relative z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  AI Career Report
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Skill Analysis</h4>
                  </div>
                  {insights ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {insights.skillSuggestion}
                    </p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      <div className="h-3.5 bg-blue-100/50 dark:bg-blue-900/20 rounded animate-pulse w-full"></div>
                      <div className="h-3.5 bg-blue-100/50 dark:bg-blue-900/20 rounded animate-pulse w-5/6"></div>
                      <div className="h-3.5 bg-blue-100/50 dark:bg-blue-900/20 rounded animate-pulse w-4/6"></div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Interview Strategy</h4>
                  </div>
                  {insights ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {insights.interviewPrep}
                    </p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      <div className="h-3.5 bg-blue-100/50 dark:bg-blue-900/20 rounded animate-pulse w-full"></div>
                      <div className="h-3.5 bg-blue-100/50 dark:bg-blue-900/20 rounded animate-pulse w-4/5"></div>
                      <div className="h-3.5 bg-blue-100/50 dark:bg-blue-900/20 rounded animate-pulse w-5/6"></div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Recommended Roles</h4>
                  </div>
                  {insights ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {insights.topRole}
                    </p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      <div className="h-3.5 bg-blue-100/50 dark:bg-blue-900/20 rounded animate-pulse w-3/4"></div>
                      <div className="h-3.5 bg-blue-100/50 dark:bg-blue-900/20 rounded animate-pulse w-1/2"></div>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl p-4 border border-yellow-100 dark:border-yellow-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Placement Strategy</h4>
                  </div>
                  {insights ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {insights.placementAdvice}
                    </p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      <div className="h-3.5 bg-yellow-100/50 dark:bg-yellow-900/20 rounded animate-pulse w-full"></div>
                      <div className="h-3.5 bg-yellow-100/50 dark:bg-yellow-900/20 rounded animate-pulse w-4/5"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat History */}
              {chatHistory.length > 0 && (
                <div className="mt-6 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Q&A
                  </h4>
                  {chatHistory.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn("p-3 rounded-xl text-sm", msg.role === 'user' ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 ml-8" : "bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mr-8")}
                    >
                      {msg.text}
                    </motion.div>
                  ))}
                  {isAsking && <div className="p-3 rounded-xl text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mr-8 animate-pulse">Thinking...</div>}
                </div>
              )}

              {/* Input Area */}
              <div className="mt-6 flex gap-2">
                <input 
                  type="text" 
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAsk()}
                  placeholder="Ask a career question..."
                  className="flex-1 bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 dark:text-white transition-colors"
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAsk}
                  disabled={isAsking || !question.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="mt-6 flex justify-end">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition-colors"
                >
                  Close Report
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

