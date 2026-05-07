import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Settings,
  CheckCircle2,
  Plus,
  X,
  MapPin,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { calculatePlacementCategory, getCategoryBadgeStyles, getJuniorMotivationHint } from "@/lib/placement";

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("About");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState("");

  const tabs = ["About", "Skills", "Projects", "Achievements"];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      } catch (error) {
        console.error("Error fetching user data", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleUpdateProfile = async (updates: any) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, updates);
      setUserData((prev: any) => ({ ...prev, ...updates }));
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updatedSkills = [...(userData.skills || []), newSkill.trim()];
    handleUpdateProfile({ skills: updatedSkills });
    setNewSkill("");
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = userData.skills.filter((s: string) => s !== skillToRemove);
    handleUpdateProfile({ skills: updatedSkills });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-[#0B1120] min-h-full transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#0B1120] z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-600 dark:text-gray-400"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Profile</h1>
        <button className="p-2 -mr-2 text-gray-600 dark:text-gray-400">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 md:p-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src={userData.photoURL || "https://i.pravatar.cc/150?u=anon"}
            alt={userData.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md mb-4"
          />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1 mb-1">
            {userData.name}
            <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-600/20" />
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{userData.branch}, {userData.year}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">{userData.email}</p>
          
          {/* Placement Category Badge */}
          {userData.cgpa && userData.attendance_percentage && (
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold border mb-2",
              getCategoryBadgeStyles(calculatePlacementCategory(userData))
            )}>
              {calculatePlacementCategory(userData)} Eligible
            </div>
          )}

          {/* Junior Motivation Hint */}
          {getJuniorMotivationHint(userData) && (
            <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 animate-pulse">
              {getJuniorMotivationHint(userData)}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 border-y border-gray-100 dark:border-gray-800 py-4 mb-8">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {userData.cgpa || "0.0"}{" "}
              <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">/ 10.0</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CGPA</p>
          </div>
          <div className="text-center border-l border-gray-100 dark:border-gray-800">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{userData.skills?.length || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Skills Added</p>
          </div>
          <div className="text-center border-l border-gray-100 dark:border-gray-800">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{userData.attendance_percentage || 0}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Attendance</p>
          </div>
          <div className="text-center border-l border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-gray-100 dark:text-gray-800"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="125"
                  strokeDashoffset="25"
                  className="text-blue-600"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-gray-900 dark:text-white">
                80%
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Profile Complete</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap px-4",
                activeTab === tab
                  ? "text-blue-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "About" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">About Me</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {userData.bio || "No bio added yet. Tell us about yourself!"}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400 flex-1">Location</span>
                  <span className="font-medium text-gray-900 dark:text-white">{userData.location || "Mumbai, India"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400 flex-1">College</span>
                  <span className="font-medium text-gray-900 dark:text-white">TCET</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400 flex-1">Member Since</span>
                  <span className="font-medium text-gray-900 dark:text-white">Aug 2023</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Skills" && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add a new skill (e.g. React, Python)"
                  className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 dark:text-white transition-colors"
                />
                <button 
                  onClick={addSkill}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {userData.skills?.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-900/30 flex items-center gap-2"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)}>
                      <X className="w-3 h-3 hover:text-red-500" />
                    </button>
                  </span>
                ))}
                {(!userData.skills || userData.skills.length === 0) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No skills added yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "Projects" && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">No projects added yet.</p>
              <button className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700">
                + Add Project
              </button>
            </div>
          )}

          {activeTab === "Achievements" && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">No achievements added yet.</p>
              <button className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700">
                + Add Achievement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
