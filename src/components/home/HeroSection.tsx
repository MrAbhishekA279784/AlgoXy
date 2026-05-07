import { Link } from "react-router-dom";
import { Users, Briefcase, Handshake, Award } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden transition-colors duration-300">
      <div className="z-10 max-w-xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Unlock Your <span className="text-blue-600 dark:text-blue-400">Career!</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Explore opportunities, build skills, and grow with TCET's all-in-one
          career platform.
        </p>

        <div className="flex flex-wrap gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">30K+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Students</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">10K+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Opportunities</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">500+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Partners</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">1K+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Selections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Illustration Placeholder */}
      <div className="hidden md:block absolute right-0 bottom-0 w-1/3 h-full">
        <div className="w-full h-full bg-gradient-to-l from-blue-100/50 dark:from-blue-900/30 to-transparent flex items-end justify-end pr-8 pb-4">
          {/* Replace with actual illustration if available, using a placeholder shape for now */}
          <div className="w-48 h-48 bg-blue-200 dark:bg-blue-800 rounded-t-full opacity-50 relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-300 dark:bg-blue-700 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
