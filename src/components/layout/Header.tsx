import { Search, Bell, MessageSquare, LogOut, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { auth, logout } from "@/lib/firebase";
import { useTheme } from "@/components/ThemeProvider";

export default function Header() {
  const user = auth.currentUser;
  const { theme, setTheme } = useTheme();

  return (
<<<<<<< HEAD
    <header className="h-20 glass-card mx-8 mt-4 rounded-2xl border-none flex items-center justify-between px-6 sticky top-4 z-30 transition-all duration-300 shadow-xl">
      {/* Mobile Logo (Hidden on Desktop) */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-9 h-9 bg-gradient-to-br from-tcet-cyan to-tcet-purple rounded-xl flex items-center justify-center text-white font-black text-lg">
          T
        </div>
=======
    <header className="h-16 bg-white dark:bg-[#0B1120] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 transition-colors duration-300">
      {/* Mobile Logo (Hidden on Desktop) */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          T
        </div>
        <div>
          <h1 className="font-bold text-gray-900 dark:text-white leading-tight text-sm">
            TCET
          </h1>
          <p className="text-[8px] font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
            Connect
          </p>
        </div>
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-8">
        <div className="relative w-full">
<<<<<<< HEAD
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
=======
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities, events, companies, people..."
            className="w-full bg-gray-100 dark:bg-gray-900 border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/20 rounded-full py-2 pl-10 pr-12 text-sm outline-none transition-all dark:text-gray-100"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
            /
          </div>
        </div>
      </div>

      {/* Mobile Search Icon */}
      <div className="flex md:hidden flex-1 justify-end mr-4">
        <button className="p-2 text-gray-600 dark:text-gray-400">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0B1120]"></span>
        </button>
        <button 
          onClick={logout}
          className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors"
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
<<<<<<< HEAD
=======

        <Link
          to="/profile"
          className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-900 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
        >
          <img
            src={user?.photoURL || "https://i.pravatar.cc/150?u=anon"}
            alt={user?.displayName || "User"}
            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-800"
          />
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none">
              {user?.displayName || "Anonymous"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
          </div>
        </Link>
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
      </div>
    </header>
  );
}
