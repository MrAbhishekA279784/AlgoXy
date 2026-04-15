import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "motion/react";

export default function ProfileSnapshot() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfile({
            name: data.name || "Student",
            avatar: data.photoURL || "https://i.pravatar.cc/150?u=anon",
            course: data.branch || "B.Tech",
            email: data.email || "",
            cgpa: data.cgpa || "0.0",
            attendance_percentage: data.attendance_percentage || 0,
            skillsAdded: data.skills?.length || 0,
            profileComplete: 85 // Mocked for now
          });
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData();
      }
    });

    return () => unsubscribe();
  }, []);

  if (!profile)
    return (
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 h-[200px] animate-pulse" />
    );

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 transition-colors duration-300"
    >
      <div className="flex items-center gap-4 mb-6">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
        />
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1">
            {profile.name}
            <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-600/20" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{profile.course}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{profile.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 divide-x divide-slate-100 dark:divide-slate-800">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {profile.cgpa}{" "}
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
              / 10.0
            </span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">CGPA</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {profile.attendance_percentage || 0}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Attendance</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {profile.skillsAdded || profile.skills?.length || 0}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Skills Added</p>
        </div>
        <div className="text-center flex flex-col items-center justify-center">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Simple SVG Ring for 85% */}
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <motion.circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray="100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - profile.profileComplete }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-blue-600"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-900 dark:text-white">
              {profile.profileComplete}%
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Profile Complete</p>
        </div>
      </div>
    </motion.div>
  );
}

