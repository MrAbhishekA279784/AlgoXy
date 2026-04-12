import { useState, useEffect } from "react";
import { Users, Shield, Zap, Heart, Search, ArrowRight } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { joinClub } from "@/lib/db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Clubs() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const clubsSnap = await getDocs(collection(db, 'clubs'));
        const clubsData = clubsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const demoClubs = [
          {
            id: 'demo-club-1',
            name: 'Google Developer Student Club',
            description: 'A community for students interested in Google developer technologies.',
            members_count: 450,
            category: 'Technical',
            icon: Zap,
            color: 'bg-blue-500'
          },
          {
            id: 'demo-club-2',
            name: 'TCET ACM Student Chapter',
            description: 'The world\'s largest educational and scientific computing society.',
            members_count: 380,
            category: 'Technical',
            icon: Shield,
            color: 'bg-slate-800'
          },
          {
            id: 'demo-club-3',
            name: 'NSS TCET',
            description: 'National Service Scheme unit of TCET, focusing on social service.',
            members_count: 250,
            category: 'Social',
            icon: Heart,
            color: 'bg-red-500'
          }
        ];
        
        setClubs([...clubsData, ...demoClubs]);
      } catch (error) {
        console.error("Error fetching clubs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const handleJoin = async (club: any) => {
    if (!auth.currentUser) {
      toast.error("Please login to join clubs");
      return;
    }

    setJoining(club.id);
    try {
      await joinClub(club.id, club.name);
      
      // Update members count in Firestore
      const clubRef = doc(db, 'clubs', club.id);
      try {
        await updateDoc(clubRef, {
          members_count: increment(1)
        });
      } catch (e) {
        // If doc doesn't exist in DB (using defaults), just update local state
        console.log("Club doc not in DB, updating local state only");
      }

      setClubs(prev => prev.map(c => 
        c.id === club.id ? { ...c, members_count: (c.members_count || 0) + 1 } : c
      ));
      
      toast.success(`Welcome to ${club.name}!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to join club");
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Campus <span className="text-blue-600 dark:text-blue-400">Clubs</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Join communities that match your interests.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search clubs..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div key={club.id} className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", club.color || 'bg-blue-600')}>
                {club.icon ? <club.icon className="w-7 h-7" /> : <Users className="w-7 h-7" />}
              </div>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                {club.category}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {club.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
              {club.description}
            </p>
            
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-8">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold">{club.members_count} members</span>
            </div>
            
            <button
              onClick={() => handleJoin(club)}
              disabled={joining === club.id}
              className={cn(
                "w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                joining === club.id
                  ? "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600"
                  : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg shadow-slate-200 dark:shadow-none"
              )}
            >
              {joining === club.id ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Club
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
