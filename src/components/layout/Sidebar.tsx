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
    { name: "Hackathons & Events", path: "/events", icon: Calendar },
    { name: "Clubs", path: "/clubs", icon: Users },
    { name: "Community", path: "/community", icon: MessageSquare },
    { name: "Leaderboards", path: "/leaderboard", icon: BarChart2 },
    { name: "My Activity", path: "/activity", icon: Activity },
  ];

  return (
    <aside
      className={cn(
        "w-64 bg-white dark:bg-[#0B1120] border-r border-gray-200 dark:border-gray-800 flex flex-col h-full transition-colors duration-300",
        className,
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold"
          >
            T
          </motion.div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white leading-tight">TCET</h1>
            <p className="text-[10px] font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
              Connect
            </p>
          </div>
        </div>
      </div>

      {/* Post Button */}
      <div className="p-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsPostModalOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 flex items-center justify-center gap-2 font-medium transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          Post
        </motion.button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
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
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100",
                )
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.name}
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          </motion.div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ opacity: 0, rotate: -20 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 20 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-blue-400" />
                ) : (
                  <Sun className="w-4 h-4 text-blue-600" />
                )}
              </motion.div>
            </AnimatePresence>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
              theme === "dark" ? "bg-blue-600" : "bg-gray-200"
            )}
          >
            <motion.span
              animate={{ x: theme === "dark" ? 24 : 4 }}
              className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
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

