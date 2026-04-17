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
        "fixed bottom-4 left-4 right-4 glass-card border-none px-6 py-3 rounded-[24px] z-50 transition-all duration-300 shadow-2xl",
        className,
      )}
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <button
                key={item.name}
                className="w-12 h-12 bg-white text-tcet-dark rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] -mt-10 border border-white/20"
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
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                  isActive
                    ? "text-tcet-cyan"
                    : "text-slate-400 hover:text-white",
                )
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
