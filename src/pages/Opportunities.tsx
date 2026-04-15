import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { fetchOpportunities } from "@/lib/api";
import { applyForJob } from "@/lib/db";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import CompanyLogo from "@/components/CompanyLogo";
import { Sparkles } from "lucide-react";

export default function Opportunities() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");

  const isInternshipPage = typeParam === "internships";
  const isJobsPage = typeParam === "jobs";

  const filters = isInternshipPage 
    ? ["Internships"] 
    : isJobsPage 
      ? ["Full-time", "Part-time"] 
      : ["All", "Internships", "Full-time", "Part-time"];

  const [activeFilter, setActiveFilter] = useState(
    isInternshipPage ? "Internships" : isJobsPage ? "Full-time" : "All"
  );
  const [jobs, setJobs] = useState<any[]>([]);

  // Sync activeFilter when URL search params change (e.g. sidebar navigation)
  useEffect(() => {
    if (isInternshipPage) {
      setActiveFilter("Internships");
    } else if (isJobsPage) {
      setActiveFilter("Full-time");
    } else if (!typeParam) {
      setActiveFilter("All");
    }
  }, [typeParam]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<Record<string, boolean>>({});
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let skills: string[] = [];
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            skills = userDoc.data().skills || [];
          }
        }

        const jobsData = await fetchOpportunities(activeFilter);
        
        setUserSkills(skills);

        // Calculate match score
        const processedJobs = jobsData.map((job: any) => {
          if (!job.skills || job.skills.length === 0) return { ...job, matchScore: 0 };
          
          const matchingSkills = job.skills.filter((skill: string) => 
            skills.some((s: string) => s.toLowerCase() === skill.toLowerCase())
          );
          
          const matchScore = Math.round((matchingSkills.length / job.skills.length) * 100);
          return { ...job, matchScore };
        });

        // Sort by match score descending
        processedJobs.sort((a: any, b: any) => b.matchScore - a.matchScore);
        
        setJobs(processedJobs);
      } catch (error) {
        console.error("Error fetching opportunities:", error);
        toast.error("Failed to load opportunities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeFilter]);

  const handleApply = async (job: any) => {
    if (applied[job.id]) return;
    
    setApplying(prev => ({ ...prev, [job.id]: true }));
    try {
      await applyForJob(job.id.toString(), job.role, job.company);
      setApplied(prev => ({ ...prev, [job.id]: true }));
      toast.success("Application tracked successfully!");
      if (job.apply_url) {
        window.open(job.apply_url, "_blank");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to apply");
    } finally {
      setApplying(prev => ({ ...prev, [job.id]: false }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-[#0B1120] min-h-full transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#0B1120] z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-600 dark:text-gray-400"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Opportunities</h1>
        <button className="p-2 -mr-2 text-gray-600 dark:text-gray-400">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 md:p-8">
        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs, internships..."
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/20 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none transition-all dark:text-gray-100"
          />
        </motion.div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar">
          {filters.map((filter, idx) => (
            <motion.button
              key={filter}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                activeFilter === filter
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
            >
              {filter}
            </motion.button>
          ))}
        </div>

        {/* Job List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            ) : jobs.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No opportunities found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  We couldn't find any {activeFilter.toLowerCase()} matching your criteria right now. Check back later!
                </p>
              </motion.div>
            ) : (
              jobs.map((job, idx) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {job.matchScore >= 50 && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      Recommended for you ({job.matchScore}%)
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <CompanyLogo company={job.company} logo={job.logo} />
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{job.role}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      {job.posted}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                      {job.location} • {job.type}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {job.salary}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApply(job)}
                      disabled={applying[job.id] || applied[job.id]}
                      className={cn(
                        "px-8 py-2.5 text-sm font-semibold rounded-xl transition-colors",
                        applied[job.id] 
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" 
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      )}
                    >
                      {applying[job.id] ? "Applying..." : applied[job.id] ? "Applied" : "Apply"}
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

