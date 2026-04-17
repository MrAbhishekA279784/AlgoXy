import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Briefcase,
  ClipboardList,
  Users,
  CheckCircle2,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getUserActivity } from "@/lib/db";
import { toast } from "sonner";

export default function Activity() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { name: "All", icon: null },
    { name: "Applications", icon: Briefcase },
    { name: "Events", icon: CalendarIcon },
    { name: "Clubs", icon: Users },
    { name: "Tests", icon: ClipboardList },
  ];

  useEffect(() => {
    setLoading(true);
    getUserActivity()
      .then(setActivities)
      .catch(err => {
        console.error("Error fetching user activity:", err);
        toast.error("Failed to load recent activity.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Applications") return activity.type === "application";
    if (activeFilter === "Events") return activity.type === "event";
    if (activeFilter === "Clubs") return activity.type === "club";
    if (activeFilter === "Tests") return activity.type === "test";
    return true;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application': return <Briefcase className="w-5 h-5" />;
      case 'event': return <CalendarIcon className="w-5 h-5" />;
      case 'club': return <Users className="w-5 h-5" />;
      case 'test': return <ClipboardList className="w-5 h-5" />;
      default: return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const getActivityTitle = (activity: any) => {
    switch (activity.type) {
      case 'application': return `You applied to ${activity.jobTitle}`;
      case 'event': return `You registered for ${activity.eventTitle}`;
      case 'club': return `You joined ${activity.clubName}`;
      case 'test': return `You completed ${activity.testTitle}`;
      default: return 'Activity';
    }
  };

  const getActivitySubtitle = (activity: any) => {
    switch (activity.type) {
      case 'application': return activity.company;
      case 'event': return 'Event Registration';
      case 'club': return 'Club Membership';
      case 'test': return `Score: ${activity.score}%`;
      default: return '';
    }
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((new Date().getTime() - timestamp.toMillis()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-950 min-h-full transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-950 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-400"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Activity</h1>
        <button className="p-2 -mr-2 text-slate-600 dark:text-slate-400">
          <CalendarIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 md:p-8">
        {/* Filter Icons */}
        <div className="flex justify-between mb-8 px-2">
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => setActiveFilter(filter.name)}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  activeFilter === filter.name
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                    : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                {filter.icon ? (
                  <filter.icon className="w-5 h-5" />
                ) : (
                  <span className="font-bold text-sm">All</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  activeFilter === filter.name
                    ? "text-blue-600"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                {filter.name}
              </span>
            </button>
          ))}
        </div>

        {/* Upcoming Section */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Upcoming</h2>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xl shrink-0">
                  💻
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    CodeStorm 2026
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    National Level Hackathon
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">20 - 22 Apr 2026</p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg shrink-0">
                Register
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xl shrink-0">
                  🤖
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    AI Workshop
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    By Google Developer Group
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    25 Apr 2026 • Auditorium
                  </p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg shrink-0">
                Register
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xl shrink-0">
                  📊
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tech Talk
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Career in Data Science
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    30 Apr 2026 • Seminar Hall
                  </p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg shrink-0">
                Register
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          {loading ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">Loading activity...</div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">No activity found.</div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-950 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {getActivityTitle(activity)}
                      </h3>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatTimeAgo(activity.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{getActivitySubtitle(activity)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
