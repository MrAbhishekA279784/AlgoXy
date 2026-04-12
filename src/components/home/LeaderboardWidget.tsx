import { useState, useEffect } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { fetchLeaderboard } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getCategoryBadgeStyles } from "@/lib/placement";
import { Link } from "react-router-dom";

export default function LeaderboardWidget() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then(data => setLeaders(data.slice(0, 5)))
      .catch(err => console.error("Error fetching widget leaderboard:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 h-[360px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 transition-colors duration-300">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Leaderboard</h2>
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Top 5 Students
        </div>
      </div>

      <div className="space-y-4 mb-5">
        {leaders.map((leader, index) => (
          <div key={leader.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className={cn(
                "w-5 text-center text-xs font-bold shrink-0",
                index === 0 ? "text-yellow-500" : "text-slate-400 dark:text-slate-500"
              )}>
                {index === 0 ? "🏆" : index + 1}
              </span>
              <img
                src={leader.photoURL || `https://i.pravatar.cc/150?u=${leader.id}`}
                alt={leader.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100 dark:border-slate-800"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {leader.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {leader.cgpa || "0.0"} CGPA
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    • {leader.attendance_percentage || "0"}% Att.
                  </span>
                </div>
              </div>
            </div>
            <div className={cn(
              "text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0",
              getCategoryBadgeStyles(leader.category)
            )}>
              {leader.category?.split(' ')[1] || "N/A"}
            </div>
          </div>
        ))}
      </div>

      <Link 
        to="/leaderboard"
        className="w-full py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 transition-colors border-t border-slate-50 dark:border-slate-900 mt-2 pt-4"
      >
        View Full Leaderboard <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
