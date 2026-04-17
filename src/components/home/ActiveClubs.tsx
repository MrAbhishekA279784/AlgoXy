import { useState, useEffect, FormEvent } from "react";
import { joinClub } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function ActiveClubs() {
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: "",
    branch: "",
    year: "",
    skills: ""
  });

  const [clubs, setClubs] = useState<any[]>([]);

  useEffect(() => {
    import("@/lib/api").then(({ fetchClubs }) => {
      fetchClubs()
        .then(setClubs)
        .catch(err => console.error("Error fetching clubs:", err));
    });
  }, []);

  const handleOpenModal = async (club: any) => {
    setSelectedClub(club);
    try {
      const user = auth.currentUser;
      setFormData({
        name: user?.displayName || "",
        branch: "B.Tech",
        year: "3rd Year",
        skills: "React, Node.js, Python"
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClub) return;
    
    setIsJoining(true);
    try {
      await joinClub(selectedClub.id.toString(), selectedClub.name);
      setJoined(prev => ({ ...prev, [selectedClub.id]: true }));
      toast.success("Joined club successfully!");
      setSelectedClub(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to join club");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 h-full relative transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Clubs</h2>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {clubs.map((club) => (
          <div key={club.id} className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xl shrink-0">
                {club.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {club.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{club.members}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{club.description}</p>
              </div>
            </div>
            <button 
              onClick={() => handleOpenModal(club)}
              disabled={joined[club.id]}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                joined[club.id] 
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" 
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {joined[club.id] ? "Joined" : "Join"}
            </button>
          </div>
        ))}
      </div>

      {selectedClub && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Join {selectedClub.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Confirm your details to join.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Branch</label>
                <input type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Year</label>
                <input type="text" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skills</label>
                <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" required />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setSelectedClub(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isJoining} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  {isJoining ? "Joining..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
