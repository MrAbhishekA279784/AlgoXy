import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, ArrowRight, CheckCircle2, Search } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { registerForEvent } from "@/lib/db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const eventsSnap = await getDocs(collection(db, 'events'));
        const eventsData = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const demoEvents = [
          {
            id: 'demo-hack-1',
            title: 'TCET Hackathon 2024',
            description: 'A 24-hour hackathon to build innovative solutions for real-world problems.',
            date: '25th May, 2024',
            location: 'TCET Auditorium',
            category: 'Hackathon',
            image: 'https://picsum.photos/seed/hack/800/400',
            attendees: 120
          },
          {
            id: 'demo-workshop-1',
            title: 'AI/ML Workshop',
            description: 'Learn the basics of Machine Learning and Artificial Intelligence with hands-on projects.',
            date: '1st June, 2024',
            location: 'Lab 302',
            category: 'Workshop',
            image: 'https://picsum.photos/seed/ai/800/400',
            attendees: 45
          }
        ];
        
        setEvents([...eventsData, ...demoEvents]);

        // Fetch user profile for autofill
        if (auth.currentUser) {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserProfile(userSnap.data());
          }
        }
      } catch (error) {
        console.error("Error fetching events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRegister = async (event: any) => {
    if (!auth.currentUser || !userProfile) {
      toast.error("Please complete your profile first");
      return;
    }

    setRegistering(event.id);
    try {
      const formData = {
        name: userProfile.name,
        email: userProfile.email,
        branch: userProfile.branch,
        year: userProfile.year
      };
      await registerForEvent(event.id, event.title, formData);
      toast.success(`Registered for ${event.title}!`);
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setRegistering(null);
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
            Hackathons & <span className="text-blue-600 dark:text-blue-400">Events</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Discover opportunities to learn, build, and network.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search events..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-blue-500 dark:text-white w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all">
            <div className="relative h-48 overflow-hidden">
              <img
                src={event.image || `https://picsum.photos/seed/${event.id}/800/400`}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                  {event.category}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {event.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
                {event.description}
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">{event.date}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium">{event.location}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">{event.attendees}+ attending</span>
                </div>
              </div>
              
              <button
                onClick={() => handleRegister(event)}
                disabled={registering === event.id}
                className={cn(
                  "w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                  registering === event.id
                    ? "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none"
                )}
              >
                {registering === event.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register Now
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
