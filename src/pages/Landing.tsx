<<<<<<< HEAD
import { useState, useEffect, FormEvent } from "react";
import { signInWithGoogle, signInWithEmail, handleGoogleRedirectResult } from "@/lib/firebase";
=======
import { useState, FormEvent } from "react";
import { signInWithGoogle, signInWithEmail } from "@/lib/firebase";
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
import { Sparkles, ArrowRight, Building2, X, Mail } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

export default function Landing() {
  const [showHrModal, setShowHrModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
<<<<<<< HEAD

  // Handle redirect result on mount (for when popup was blocked and redirect was used)
  useEffect(() => {
    handleGoogleRedirectResult();
  }, []);
=======
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
  
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
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300 relative">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-8 shadow-xl shadow-blue-200 dark:shadow-none">
        T
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
        Welcome to <span className="text-blue-600 dark:text-blue-400">TCET Connect</span>
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-md leading-relaxed">
        The all-in-one platform for TCET students to find jobs, practice interviews, and connect with the community.
      </p>
      
      <div className="flex flex-col items-center gap-4">
        <button
<<<<<<< HEAD
          onClick={async () => {
            setIsLoggingIn(true);
            try {
              await signInWithGoogle();
            } catch (error: any) {
              toast.error(error.message || "Google sign-in failed. Please try again.");
            } finally {
              setIsLoggingIn(false);
            }
          }}
          disabled={isLoggingIn}
          className="group relative flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200 dark:shadow-none w-full justify-center disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 bg-white rounded-full p-0.5" />
          {isLoggingIn ? "Signing in..." : "Login with Google"}
=======
          onClick={signInWithGoogle}
          className="group relative flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200 dark:shadow-none w-full justify-center"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 bg-white rounded-full p-0.5" />
          Login with Google
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => setShowEmailModal(true)}
          className="group relative flex items-center gap-3 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] w-full justify-center"
        >
          <Mail className="w-5 h-5" />
          Login with Email
        </button>

        <div className="mt-4">
          <button 
            onClick={() => setShowHrModal(true)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            For Business &rarr; Hire the best talent
          </button>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50">
        <div className="flex flex-col items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-widest dark:text-slate-300">AI Mock Tests</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-widest dark:text-slate-300">Voice Interviews</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-widest dark:text-slate-300">Real Jobs</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-widest dark:text-slate-300">Community</span>
        </div>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 relative shadow-2xl">
            <button 
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Developer Login</h2>
              <p className="text-xs text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg inline-block mt-2 border border-amber-200 dark:border-amber-800/50">
                For role testing and development purposes.
              </p>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={loginData.email} 
                  onChange={e => setLoginData({...loginData, email: e.target.value})} 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white" 
                  placeholder="admin@test.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  value={loginData.password} 
                  onChange={e => setLoginData({...loginData, password: e.target.value})} 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white" 
                  placeholder="••••••••"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoggingIn}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 mt-2"
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showHrModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowHrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Partner with TCET</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Apply for an HR account to post jobs and hire top students.</p>
            </div>

            <form onSubmit={handleHrSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input type="text" required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">HR Name</label>
                <input type="text" required value={formData.hr_name} onChange={e => setFormData({...formData, hr_name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Website</label>
                <input type="url" required value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Roles Hiring For</label>
                <input type="text" required placeholder="e.g. Software Engineer, Data Analyst" value={formData.job_roles} onChange={e => setFormData({...formData, job_roles: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Brief Description</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white resize-none" />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Sending..." : "Send application"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
