import { NavLink } from "react-router-dom";
import { Home, Search, Plus, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  className?: string;
}

export default function BottomNav({ className }: BottomNavProps) {
  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore", path: "/opportunities", icon: Search },
    { name: "Create", path: "/create", icon: Plus, isFab: true },
    { name: "Activity", path: "/activity", icon: Bell },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <nav
      className={cn(
<<<<<<< HEAD
        "fixed bottom-4 left-4 right-4 glass-card border-none px-6 py-3 rounded-[24px] z-50 transition-all duration-300 shadow-2xl",
=======
        "fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-2 pb-safe z-50 transition-colors duration-300",
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
        className,
      )}
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <button
                key={item.name}
<<<<<<< HEAD
                className="w-12 h-12 bg-white text-tcet-dark rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] -mt-10 border border-white/20"
=======
                className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none -mt-6 border-4 border-white dark:border-slate-950"
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
              >
                <item.icon className="w-6 h-6" />
              </button>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
<<<<<<< HEAD
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                  isActive
                    ? "text-tcet-cyan"
                    : "text-slate-400 hover:text-white",
=======
                  "flex flex-col items-center gap-1 p-2",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300",
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
                )
              }
            >
              <item.icon className="w-6 h-6" />
<<<<<<< HEAD
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.name}</span>
=======
              <span className="text-[10px] font-medium">{item.name}</span>
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
