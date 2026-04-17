import { useState, useEffect, FormEvent } from "react";
import { signInWithGoogle, signInWithEmail, handleGoogleRedirectResult } from "@/lib/firebase";
import { Sparkles, ArrowRight, Building2, X, Mail, Briefcase, Code, Mic, Users, Zap } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import BackgroundEffects from "@/components/BackgroundEffects";

export default function Landing() {
  const [showHrModal, setShowHrModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    handleGoogleRedirectResult();
  }, []);
  
  const [formData, setFormData] = useState({
    company_name: "",
    hr_name: "",
    email: "",
    website: "",
    job_roles: "",
    description: ""
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleHrSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "hr_requests"), {
        ...formData,
        status: "pending",
        created_at: serverTimestamp()
      });
      toast.success("Application sent successfully! We will contact you soon.");
      setShowHrModal(false);
      setFormData({
        company_name: "",
        hr_name: "",
        email: "",
        website: "",
        job_roles: "",
        description: ""
      });
    } catch (error) {
      toast.error("Failed to send application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await signInWithEmail(loginData.email, loginData.password);
      setShowEmailModal(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <BackgroundEffects />
      
      {/* Glow Orb behind Title */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-tcet-cyan/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 space-y-6 max-w-4xl"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mx-auto w-20 h-20 glass-card rounded-3xl flex items-center justify-center border-white/20 shadow-[0_0_30px_rgba(110,213,250,0.3)]"
        >
          <span className="text-4xl font-black text-white">T</span>
        </motion.div>

        <div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-2">
            TCET <span className="text-transparent bg-clip-text bg-gradient-to-r from-tcet-cyan to-tcet-purple">Connect</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium text-tcet-cyan/80 tracking-wide uppercase">
            Unlocking Student Careers
          </p>
          <p className="text-lg text-slate-400 mt-4 max-w-lg mx-auto">
            AI-powered all-in-one career platform for modern students.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              setIsLoggingIn(true);
              try { await signInWithGoogle(); }
              catch (err) { toast.error("Sign-in failed"); }
              finally { setIsLoggingIn(false); }
            }}
            className="glass-button w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-xl text-white shadow-[0_0_40px_rgba(110,213,250,0.2)] flex items-center gap-3"
          >
            Enter Platform
            <Zap className="w-5 h-5 text-tcet-cyan animate-pulse" />
          </motion.button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="text-slate-400 hover:text-white transition-colors font-semibold"
          >
            Developer Access →
          </button>
        </div>
      </motion.div>

      {/* Floating Feature Cards */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        {/* Internships */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] glass-card p-6 rounded-[24px] border-white/10 w-48 text-left"
        >
          <Briefcase className="w-8 h-8 text-tcet-cyan mb-3" />
          <h3 className="font-bold text-white">Internships</h3>
          <p className="text-sm text-slate-400">30K+ Students</p>
        </motion.div>

        {/* Jobs */}
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[25%] left-[15%] glass-card p-6 rounded-[24px] border-white/10 w-48 text-left"
        >
          <Building2 className="w-8 h-8 text-tcet-purple mb-3" />
          <h3 className="font-bold text-white">Jobs</h3>
          <p className="text-sm text-slate-400">10K+ Opportunities</p>
        </motion.div>

        {/* Hackathons */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] right-[10%] glass-card p-6 rounded-[24px] border-white/10 w-48 text-left"
        >
          <Code className="w-8 h-8 text-tcet-accent mb-3" />
          <h3 className="font-bold text-white">Hackathons</h3>
          <p className="text-sm text-slate-400">Build & Compete</p>
        </motion.div>

        {/* Mock Interviews */}
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[15%] glass-card p-6 rounded-[24px] border-white/10 w-48 text-left"
        >
          <Mic className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="font-bold text-white">Mock Interviews</h3>
          <p className="text-sm text-slate-400">AI Powered Practice</p>
        </motion.div>
      </div>

      {/* Footer / Mobile Features */}
      <div className="lg:hidden mt-12 grid grid-cols-2 gap-4 w-full relative z-10">
        <div className="glass-card p-4 rounded-2xl flex flex-col items-center gap-2">
            <Briefcase className="w-6 h-6 text-tcet-cyan" />
            <span className="text-xs font-bold text-white">30K+ Students</span>
        </div>
        <div className="glass-card p-4 rounded-2xl flex flex-col items-center gap-2">
            <Building2 className="w-6 h-6 text-tcet-purple" />
            <span className="text-xs font-bold text-white">10K+ Jobs</span>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-50 text-left"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-8 w-full max-w-sm rounded-3xl relative"
            >
              <button onClick={() => setShowEmailModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-2">Developer Login</h2>
              <form onSubmit={handleEmailLogin} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-bold text-tcet-cyan uppercase tracking-widest mb-2">Email</label>
                  <input type="email" required value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-tcet-cyan transition-colors" placeholder="admin@tcet.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-tcet-cyan uppercase tracking-widest mb-2">Password</label>
                  <input type="password" required value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-tcet-cyan transition-colors" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={isLoggingIn} className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-tcet-cyan transition-colors mt-4">
                  {isLoggingIn ? "Authenticating..." : "Login"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
