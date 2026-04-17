import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Landing from "@/pages/Landing";
import { motion, AnimatePresence } from "motion/react";
<<<<<<< HEAD
import BackgroundEffects from "../BackgroundEffects";
=======
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8

export default function Layout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
<<<<<<< HEAD
      <div className="h-screen w-full flex items-center justify-center bg-[#0b1026]">
        <BackgroundEffects />
        <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center border-white/20 animate-float">
          <div className="w-8 h-8 border-4 border-tcet-cyan border-t-transparent rounded-full animate-spin" />
        </div>
=======
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-center" />
        <Landing />
      </>
    );
  }

  return (
<<<<<<< HEAD
    <div className="relative flex h-screen overflow-hidden font-sans text-white transition-colors duration-300">
      <BackgroundEffects />
      <Toaster position="top-center" theme="dark" />
      
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex z-30" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-20">
=======
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B1120] overflow-hidden font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Toaster position="top-center" />
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
        {/* Header */}
        <Header />

        {/* Main Content Area */}
<<<<<<< HEAD
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6 px-4 md:px-8 mt-4 hide-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
=======
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
<<<<<<< HEAD
        <BottomNav className="md:hidden z-30" />
=======
        <BottomNav className="md:hidden" />
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
      </div>
    </div>
  );
}

