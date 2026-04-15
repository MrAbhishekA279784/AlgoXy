import { Link } from "react-router-dom";
import {
  Briefcase,
  Search,
  Trophy,
  ClipboardList,
  UserCheck,
  Calendar,
  Users,
  MessageSquare,
} from "lucide-react";

export default function QuickLinks() {
  const links = [
    {
      name: "Internships",
      icon: Briefcase,
      path: "/opportunities?type=internships",
    },
    { name: "Jobs", icon: Search, path: "/opportunities?type=jobs" },
    { name: "Competitions", icon: Trophy, path: "/competitions" },
    { name: "Mock Tests", icon: ClipboardList, path: "/mock-tests" },
    {
      name: "Mock Interviews",
      icon: UserCheck,
      path: "/mock-interviews",
      badge: "AI",
    },
    { name: "Hackathons & Events", icon: Calendar, path: "/events" },
    { name: "Clubs", icon: Users, path: "/clubs" },
    { name: "Community", icon: MessageSquare, path: "/community" },
  ];

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
      {links.map((link) => (
        <Link
          key={link.name}
          to={link.path}
          className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all group relative"
        >
          {link.badge && (
            <span className="absolute -top-2 -right-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-slate-950">
              {link.badge}
            </span>
          )}
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <link.icon className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">
            {link.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
