import { Search, Bell, MessageSquare, LogOut, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { auth, logout } from "@/lib/firebase";
import { useTheme } from "@/components/ThemeProvider";

export default function Header() {
  const user = auth.currentUser;
  const { theme, setTheme } = useTheme();

  return (
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
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-8">
        <div className="relative w-full">
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
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>

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
      </div>
    </header>
  );
}
