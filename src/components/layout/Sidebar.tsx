import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Briefcase,
  Trophy,
  ClipboardList,
  UserCheck,
  Calendar,
  Users,
  MessageSquare,
  BarChart2,
  Activity,
  Plus,
  Sun,
  Moon,
  LayoutDashboard,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import PostModal from "@/components/community/PostModal";
import { useTheme } from "@/components/ThemeProvider";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeSnapshot: () => void;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribeSnapshot = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
          if (docSnap.exists()) {
            setRole(docSnap.data().role || "student");
          } else {
            setRole("student");
          }
        });
      } else {
        setRole(null);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    ...(role === "teacher" ? [{ name: "Teacher Dashboard", path: "/teacher-dashboard", icon: LayoutDashboard }] : []),
    ...(role === "super_admin" ? [{ name: "Admin Dashboard", path: "/admin-dashboard", icon: ShieldCheck }] : []),
    {
      name: "Internships",
      path: "/opportunities?type=internships",
      icon: Briefcase,
    },
    { name: "Jobs", path: "/opportunities?type=jobs", icon: Briefcase },
    { name: "Competitions", path: "/competitions", icon: Trophy },
    {
      name: "Mock Tests",
      path: "/mock-tests",
      icon: ClipboardList,
      badge: "New",
    },
    {
      name: "Mock Interviews",
      path: "/mock-interviews",
      icon: UserCheck,
      badge: "AI",
    },
    {
      name: "Career Guidance",
      path: "/career-guidance",
      icon: TrendingUp,
      badge: "AI",
    },
    { name: "Hackathons & Events", path: "/events", icon: Calendar },
    { name: "Clubs", path: "/clubs", icon: Users },
    { name: "Community", path: "/community", icon: MessageSquare },
    { name: "Leaderboards", path: "/leaderboard", icon: BarChart2 },
    { name: "My Activity", path: "/activity", icon: Activity },
  ];

  return (
    <aside
      className={cn(
        "w-64 glass-card border-none flex flex-col h-full rounded-r-3xl my-4 ml-4 transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-tcet-cyan to-tcet-purple rounded-xl flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(110,213,250,0.4)]"
          >
            T
          </motion.div>
          <div>
            <h1 className="font-black text-white leading-tight tracking-tight text-lg">TCET</h1>
            <p className="text-[10px] font-black tracking-[0.2em] text-tcet-cyan uppercase">
              Connect
            </p>
          </div>
        </div>
      </div>

      {/* Post Button */}
      <div className="p-5">
        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(110,213,250,0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsPostModalOpen(true)}
          className="w-full bg-white text-tcet-dark rounded-xl py-3 flex items-center justify-center gap-2 font-bold transition-all shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </motion.button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 hide-scrollbar">
        {navItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group",
                  isActive
                    ? "bg-white/15 text-white border border-white/10 shadow-lg"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5 transition-colors", "group-hover:text-tcet-cyan")} />
                {item.name}
              </div>
              {item.badge && (
                <span className="text-[9px] font-black bg-tcet-cyan/20 text-tcet-cyan px-2 py-0.5 rounded-full border border-tcet-cyan/30 uppercase tracking-tighter">
                  {item.badge}
                </span>
              )}
            </NavLink>
          </motion.div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10 mt-auto">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"
              >
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-tcet-purple" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </motion.div>
            </AnimatePresence>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {theme}
            </span>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none",
              theme === "dark" ? "bg-tcet-purple" : "bg-slate-600"
            )}
          >
            <motion.span
              animate={{ x: theme === "dark" ? 24 : 4 }}
              className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
            />
          </button>
        </div>
      </div>

      <PostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
      />
    </aside>
  );
}

