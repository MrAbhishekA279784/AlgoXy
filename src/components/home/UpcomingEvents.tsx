import { useState, useEffect, FormEvent } from "react";
import { registerForEvent } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function UpcomingEvents() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registered, setRegistered] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    college: "",
    branch: "",
    year: "",
    skills: "",
    phone: ""
  });

  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    import("@/lib/api").then(({ fetchEvents }) => {
      fetchEvents()
        .then(setEvents)
        .catch(err => console.error("Error fetching events:", err));
    });
  }, []);

  const handleOpenModal = async (event: any) => {
    setSelectedEvent(event);
    try {
      const user = auth.currentUser;
      setFormData({
        fullName: user?.displayName || "",
        email: user?.email || "",
        college: "University",
        branch: "B.Tech",
        year: "3rd Year",
        skills: "React, Node.js, Python",
        phone: ""
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    setIsRegistering(true);
    try {
      await registerForEvent(selectedEvent.id.toString(), selectedEvent.title, formData);
      setRegistered(prev => ({ ...prev, [selectedEvent.id]: true }));
      toast.success("Registered successfully!");
      setSelectedEvent(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 h-full relative transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xl shrink-0">
                {event.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {event.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{event.subtitle}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  {event.date} • {event.location}
                </p>
              </div>
            </div>
            <button 
              onClick={() => handleOpenModal(event)}
              disabled={registered[event.id]}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                registered[event.id] 
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" 
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {registered[event.id] ? "Registered" : "Register"}
            </button>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Register for {selectedEvent.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Please confirm your details to register.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">College</label>
                  <input type="text" value={formData.college} onChange={e => setFormData({...formData, college: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Branch</label>
                  <input type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <input type="text" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone (Optional)</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Skills</label>
                <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:text-white" required />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setSelectedEvent(null)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isRegistering} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-200 dark:shadow-none">
                  {isRegistering ? "Registering..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
