import { Trophy, Star, Clock, ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const COMPETITIONS = [
  {
    id: 1,
    title: "CodeStorm 2026",
    organizer: "Google Developer Student Club",
    date: "April 20 - 22, 2026",
    prize: "₹50,000 + Swags",
    difficulty: "Hard",
    participants: 1200,
    status: "Registration Open",
    tag: "National Level",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80"
  },
  {
    id: 2,
    title: "AlgoX Challenge",
    organizer: "TCET Coding Club",
    date: "May 5, 2026",
    prize: "Internship Interview @ Top Tech",
    difficulty: "Medium",
    participants: 850,
    status: "Coming Soon",
    tag: "Intra-College",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80"
  },
  {
    id: 3,
    title: "UI/UX Designathon",
    organizer: "Design TCET",
    date: "April 28, 2026",
    prize: "MacBook Air & Wacom Tabs",
    difficulty: "Medium",
    participants: 450,
    status: "Registration Open",
    tag: "Regional Level",
    image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&q=80"
  }
];

export default function Competitions() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Upcoming Competitions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Scale your skills by competing with the best students across India.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold hover:border-blue-500 transition-colors">
            All Competitions
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            My participations
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {COMPETITIONS.map((comp, i) => (
          <motion.div
            key={comp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
          >
            <div className="w-full md:w-48 h-48 md:h-auto overflow-hidden relative">
              <img src={comp.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={comp.title} />
              <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-blue-600">
                {comp.tag}
              </div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">{comp.organizer}</span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{comp.difficulty}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{comp.title}</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{comp.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                    <Trophy className="w-4 h-4" />
                    <span>{comp.prize}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">{comp.participants}+</span> participants registered
                </div>
                <button className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  comp.status === "Coming Soon" 
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:gap-3"
                )}>
                  {comp.status === "Coming Soon" ? "Notify Me" : "Register Now"}
                  {comp.status !== "Coming Soon" && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">Organizing a competition?</h2>
            <p className="text-slate-400 max-w-md">Reach out to thousands of students and find the best talent for your organization or club.</p>
          </div>
          <button className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2">
            Register as Organizer <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
