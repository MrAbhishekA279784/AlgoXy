import { useState, useEffect } from "react";
import HeroSection from "../components/home/HeroSection";
import QuickLinks from "../components/home/QuickLinks";
import FeaturedOpportunities from "../components/home/FeaturedOpportunities";
import UpcomingEvents from "../components/home/UpcomingEvents";
import ActiveClubs from "../components/home/ActiveClubs";
import CommunityFeedPreview from "../components/home/CommunityFeedPreview";
import ProfileSnapshot from "../components/home/ProfileSnapshot";
import AICareerAssistant from "../components/home/AICareerAssistant";
import LeaderboardWidget from "../components/home/LeaderboardWidget";
import TeacherDashboard from "./TeacherDashboard";
import AdminDashboard from "./AdminDashboard";
import { motion } from "motion/react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role || "student");
          } else {
            setRole("student");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setRole("student");
        }
      } else {
        setRole("student");
      }
      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchRole();
      } else {
        setRole("student");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (role === "teacher") {
    return <TeacherDashboard />;
  }

  if (role === "super_admin") {
    return <AdminDashboard />;
  }

  if (role === "hr") {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">HR Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">Company access coming soon.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 md:p-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Main Content Column */}
        <div className="flex-1 space-y-6 md:space-y-8 min-w-0">
          <motion.div variants={item}><HeroSection /></motion.div>
          <motion.div variants={item}><QuickLinks /></motion.div>
          <motion.div variants={item}><FeaturedOpportunities /></motion.div>

          {/* 3 Column Grid for Events, Clubs, Community */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <motion.div variants={item} className="flex flex-col min-h-[400px]">
              <UpcomingEvents />
            </motion.div>
            <motion.div variants={item} className="flex flex-col min-h-[400px]">
              <ActiveClubs />
            </motion.div>
            <motion.div variants={item} className="flex flex-col min-h-[400px]">
              <CommunityFeedPreview />
            </motion.div>
          </div>
        </div>

        {/* Right Sidebar (Desktop) / Bottom Stack (Mobile) */}
        <div className="flex flex-col w-full lg:w-80 shrink-0 space-y-6">
          <motion.div variants={item}><ProfileSnapshot /></motion.div>
          <motion.div variants={item}><AICareerAssistant /></motion.div>
          <motion.div variants={item}><LeaderboardWidget /></motion.div>
        </div>
      </div>
    </motion.div>
  );
}

