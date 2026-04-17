import { Search, Bell, MessageSquare, LogOut, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { auth, logout } from "@/lib/firebase";
import { useTheme } from "@/components/ThemeProvider";

export default function Header() {
  const user = auth.currentUser;
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-20 glass-card mx-8 mt-4 rounded-2xl border-none flex items-center justify-between px-6 sticky top-4 z-30 transition-all duration-300 shadow-xl">
      {/* Mobile Logo (Hidden on Desktop) */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-9 h-9 bg-gradient-to-br from-tcet-cyan to-tcet-purple rounded-xl flex items-center justify-center text-white font-black text-lg">
          T
        </div>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-8">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tcet-cyan" />
          <input
            type="text"
            placeholder="Search platform..."
            className="w-full bg-white/5 border border-white/10 focus:bg-white/10 focus:border-tcet-cyan rounded-xl py-2.5 pl-12 pr-12 text-sm outline-none transition-all text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2.5 glass-button rounded-xl text-slate-300 hover:text-white group">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-tcet-cyan rounded-full shadow-[0_0_10px_rgba(110,213,250,0.8)]"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block" />

        <Link
          to="/profile"
          className="flex items-center gap-3 glass-button p-1 pr-4 rounded-xl hover:border-tcet-cyan/50 transition-all"
        >
          <div className="relative">
            <img
              src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
              alt={user?.displayName || "User"}
              className="w-9 h-9 rounded-lg object-cover border border-white/20"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-tcet-accent rounded-full border-2 border-tcet-dark"></div>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-black text-white leading-none">
              {user?.displayName?.split(' ')[0] || "Student"}
            </p>
            <p className="text-[10px] font-bold text-tcet-cyan mt-1 uppercase tracking-tighter">Gold Tier</p>
          </div>
        </Link>

        <button 
          onClick={logout}
          className="p-2.5 glass-button rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
