import { useState, useEffect } from "react";
import { Trophy, Medal, TrendingUp, Users, Star, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryBadgeStyles } from "@/lib/placement";
import { fetchLeaderboard } from "@/lib/api";
import { toast } from "sonner";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Overall");

  const filters = ["Overall", "Placement Category Rank"];

  useEffect(() => {
    const loadLeaders = async () => {
      setLoading(true);
      try {
        const data = await fetchLeaderboard(activeFilter);
        setLeaders(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        toast.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    loadLeaders();
  }, [activeFilter]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Campus <span className="text-blue-600">Leaderboard</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Top performers based on CGPA, attendance, and placement eligibility.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Season 1</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
              activeFilter === filter
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-none"
                : "bg-white dark:bg-[#111827] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-12 items-end">
        {/* 2nd Place */}
        {leaders[1] && (
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img src={leaders[1].photoURL || "https://i.pravatar.cc/150?u=2"} alt={leaders[1].name} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-200 dark:border-gray-800 object-cover" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold border-2 border-white dark:border-gray-900">2</div>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white text-center line-clamp-1">{leaders[1].name}</p>
            <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 mb-2", getCategoryBadgeStyles(leaders[1].category))}>
              {leaders[1].category}
            </div>
            <div className="w-full h-24 bg-gray-100 dark:bg-gray-900 rounded-t-2xl border-x border-t border-gray-200 dark:border-gray-800" />
          </div>
        )}

        {/* 1st Place */}
        {leaders[0] && (
          <div className="flex flex-col items-center">
            <Trophy className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" />
            <div className="relative mb-4">
              <img src={leaders[0].photoURL || "https://i.pravatar.cc/150?u=1"} alt={leaders[0].name} className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-yellow-400 object-cover shadow-xl shadow-yellow-100 dark:shadow-none" />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold border-4 border-white dark:border-gray-900">1</div>
            </div>
            <p className="text-base font-bold text-gray-900 dark:text-white text-center line-clamp-1">{leaders[0].name}</p>
            <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 mb-2", getCategoryBadgeStyles(leaders[0].category))}>
              {leaders[0].category}
            </div>
            <div className="w-full h-32 bg-blue-600 rounded-t-2xl shadow-lg shadow-blue-100 dark:shadow-none" />
          </div>
        )}

        {/* 3rd Place */}
        {leaders[2] && (
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img src={leaders[2].photoURL || "https://i.pravatar.cc/150?u=3"} alt={leaders[2].name} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-200 dark:border-orange-900/30 object-cover" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center text-orange-700 dark:text-orange-200 font-bold border-2 border-white dark:border-gray-900">3</div>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white text-center line-clamp-1">{leaders[2].name}</p>
            <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 mb-2", getCategoryBadgeStyles(leaders[2].category))}>
              {leaders[2].category}
            </div>
            <div className="w-full h-20 bg-orange-50 dark:bg-orange-900/10 rounded-t-2xl border-x border-t border-orange-100 dark:border-orange-900/20" />
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
          <span className="col-span-1">Rank</span>
          <span className="col-span-3">Student Name</span>
          <span className="col-span-2 text-center">CGPA</span>
          <span className="col-span-2 text-center">Attendance %</span>
          <span className="col-span-2 text-center">Placement Category</span>
          <span className="col-span-1 text-center">Year</span>
          <span className="col-span-1 text-right">Final Score</span>
        </div>
        
        <div className="divide-y divide-gray-50 dark:divide-gray-900">
          {leaders.map((leader, index) => (
            <div key={leader.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <div className="col-span-1">
                <span className="text-sm font-bold text-gray-400 dark:text-gray-600">{index + 1}</span>
              </div>
              <div className="col-span-3 flex items-center gap-3 min-w-0">
                <img src={leader.photoURL || `https://i.pravatar.cc/150?u=${leader.id}`} alt={leader.name} className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-800 shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{leader.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider truncate">{leader.branch}</p>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{leader.cgpa || "0.0"}</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-bold text-gray-900 dark:text-white">{leader.attendance_percentage || "0"}%</span>
              </div>
              <div className="col-span-2 flex justify-center">
                <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap", getCategoryBadgeStyles(leader.category))}>
                  {leader.category}
                </div>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{leader.year?.split(' ')[0] || "N/A"}</span>
              </div>
              <div className="col-span-1 text-right">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{leader.finalScore?.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
