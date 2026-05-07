import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchOpportunities } from "@/lib/api";
import { applyForJob } from "@/lib/db";
import { toast } from "sonner";
import { motion } from "motion/react";
import CompanyLogo from "@/components/CompanyLogo";

export default function FeaturedOpportunities() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applying, setApplying] = useState<Record<string, boolean>>({});
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchOpportunities()
      .then(setJobs)
      .catch(err => {
        console.error("Error fetching opportunities:", err);
        toast.error("Failed to load featured opportunities");
      });
  }, []);

  const handleApply = async (job: any) => {
    if (applied[job.id]) return;
    
    setApplying(prev => ({ ...prev, [job.id]: true }));
    try {
      await applyForJob(job.id.toString(), job.role, job.company);
      setApplied(prev => ({ ...prev, [job.id]: true }));
      toast.success("Application submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply");
    } finally {
      setApplying(prev => ({ ...prev, [job.id]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Featured Opportunities
        </h2>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 z-10 hidden md:flex">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 z-10 hidden md:flex">
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Cards Container */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {jobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="min-w-[280px] md:min-w-[300px] bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 snap-start shrink-0 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <CompanyLogo company={job.company} logo={job.logo} />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{job.role}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                  {job.location} • {job.type}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {job.salary}
                </p>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleApply(job)}
                disabled={applying[job.id] || applied[job.id]}
                className={`w-full py-2 text-sm font-semibold rounded-xl transition-colors ${
                  applied[job.id] 
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {applying[job.id] ? "Applying..." : applied[job.id] ? "Applied" : "Apply"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

