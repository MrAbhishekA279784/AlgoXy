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
        "fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-2 pb-safe z-50 transition-colors duration-300",
        className,
      )}
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <button
                key={item.name}
                className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none -mt-6 border-4 border-white dark:border-slate-950"
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
                  "flex flex-col items-center gap-1 p-2",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300",
                )
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
