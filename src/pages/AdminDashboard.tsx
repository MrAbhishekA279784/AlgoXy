import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users, BookOpen, Briefcase, Calendar, MessageSquare,
  Plus, Trash2, Edit2, X, Check, RefreshCw, Shield
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import { getCategoryBadgeStyles } from "@/lib/placement";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  fetchAdminStats, fetchAdminUsers, updateAdminUser, deleteAdminUser,
  createEvent, deleteEvent, fetchEvents,
  createClub, deleteClub, fetchClubs,
  createJob, deleteJob, fetchOpportunities,
  deletePost, fetchCommunity,
} from "@/lib/api";

type Tab = "overview" | "users" | "events" | "clubs" | "jobs" | "community";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modals
  const [showEventForm, setShowEventForm] = useState(false);
  const [showClubForm, setShowClubForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [eventForm, setEventForm] = useState({ title: "", subtitle: "", date: "", location: "", icon: "📅" });
  const [clubForm, setClubForm] = useState({ name: "", description: "", icon: "🏛️" });
  const [jobForm, setJobForm] = useState({ company: "", role: "", location: "", type: "Full-time", salary: "", apply_url: "" });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, e, c, j, p] = await Promise.all([
        fetchAdminStats().catch(() => ({})),
        fetchAdminUsers().catch(() => []),
        fetchEvents().catch(() => []),
        fetchClubs().catch(() => []),
        fetchOpportunities().catch(() => []),
        fetchCommunity().catch(() => []),
      ]);
      setStats(s);
      setUsers(u);
      setEvents(e);
      setClubs(c);
      setJobs(j);
      setPosts(p);
    } catch (e) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteAdminUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("User deleted");
    } catch { toast.error("Failed to delete user"); }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await updateAdminUser(id, { role: newRole });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
      toast.success("Role updated");
    } catch { toast.error("Failed to update role"); }
  };

  const handleCreateEvent = async () => {
    try {
      const created = await createEvent(eventForm);
      setEvents(prev => [created, ...prev]);
      setShowEventForm(false);
      setEventForm({ title: "", subtitle: "", date: "", location: "", icon: "📅" });
      toast.success("Event created");
    } catch { toast.error("Failed to create event"); }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success("Event deleted");
    } catch { toast.error("Failed to delete event"); }
  };

  const handleCreateClub = async () => {
    try {
      const created = await createClub(clubForm);
      setClubs(prev => [created, ...prev]);
      setShowClubForm(false);
      setClubForm({ name: "", description: "", icon: "🏛️" });
      toast.success("Club created");
    } catch { toast.error("Failed to create club"); }
  };

  const handleDeleteClub = async (id: string) => {
    try {
      await deleteClub(id);
      setClubs(prev => prev.filter(c => c.id !== id));
      toast.success("Club deleted");
    } catch { toast.error("Failed to delete club"); }
  };

  const handleCreateJob = async () => {
    try {
      const created = await createJob(jobForm);
      setJobs(prev => [created, ...prev]);
      setShowJobForm(false);
      setJobForm({ company: "", role: "", location: "", type: "Full-time", salary: "", apply_url: "" });
      toast.success("Job posted");
    } catch { toast.error("Failed to post job"); }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      toast.success("Job deleted");
    } catch { toast.error("Failed to delete job"); }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success("Post deleted");
    } catch { toast.error("Failed to delete post"); }
  };

  const calcCategory = (u: any) => {
    const c = parseFloat(u.cgpa || "0"), a = parseFloat(u.attendance_percentage || "0");
    if (c >= 8.5 && a >= 75) return "Category 1";
    if (c >= 7.5 && a >= 60) return "Category 2";
    if (c >= 7.0 && a >= 60) return "Category 3";
    return "Not Eligible";
  };

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "users", label: "Users", icon: Users },
    { id: "events", label: "Events", icon: Calendar },
    { id: "clubs", label: "Clubs", icon: BookOpen },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "community", label: "Community", icon: MessageSquare },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Full platform management</p>
        </div>
        <button onClick={loadAll} className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-blue-600 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-blue-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: stats.totalUsers ?? 0 },
              { label: "Students", value: stats.totalStudents ?? 0 },
              { label: "Teachers", value: stats.totalTeachers ?? 0 },
              { label: "HR Accounts", value: stats.hrAccounts ?? 0 },
              { label: "Community Posts", value: stats.communityPosts ?? 0 },
              { label: "Job Postings", value: stats.jobPostings ?? 0 },
              { label: "Internships", value: stats.internships ?? 0 },
              { label: "Events", value: stats.events ?? 0 },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Top students table */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white">Top Students</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="p-4">Name</th>
                    <th className="p-4">CGPA</th>
                    <th className="p-4">Attendance</th>
                    <th className="p-4">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role === "student" || !u.role).sort((a, b) => parseFloat(b.cgpa || "0") - parseFloat(a.cgpa || "0")).slice(0, 5).map((s, i) => (
                    <tr key={s.id || i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={s.photoURL || `https://i.pravatar.cc/40?u=${s.id}`} className="w-8 h-8 rounded-full" alt={s.name} />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{s.cgpa || "N/A"}</td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{s.attendance_percentage || 0}%</td>
                      <td className="p-4">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", getCategoryBadgeStyles(calcCategory(s) as any))}>
                          {calcCategory(s)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Users ── */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-gray-900 dark:text-white">All Users ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id || i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={u.photoURL || `https://i.pravatar.cc/40?u=${u.id}`} className="w-8 h-8 rounded-full" alt={u.name} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.branch}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role || "student"}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-2 py-1 outline-none dark:text-white"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="hr">HR</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", getCategoryBadgeStyles(calcCategory(u) as any))}>
                        {calcCategory(u)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Events ── */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Events ({events.length})</h2>
            <button onClick={() => setShowEventForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>
          {showEventForm && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-blue-200 dark:border-blue-800 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white">New Event</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "title", placeholder: "Event Title" },
                  { key: "subtitle", placeholder: "Subtitle / Organizer" },
                  { key: "date", placeholder: "Date (e.g. 25 Apr 2026)" },
                  { key: "location", placeholder: "Location (e.g. Auditorium)" },
                  { key: "icon", placeholder: "Emoji Icon (e.g. 🎯)" },
                ].map(field => (
                  <input
                    key={field.key}
                    placeholder={field.placeholder}
                    value={(eventForm as any)[field.key]}
                    onChange={e => setEventForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white"
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreateEvent} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Create</button>
                <button onClick={() => setShowEventForm(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-semibold">Cancel</button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((e, i) => (
              <div key={e.id || i} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{e.icon || "📅"}</span>
                  <button onClick={() => handleDeleteEvent(e.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{e.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{e.subtitle}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">{e.date} · {e.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Clubs ── */}
      {activeTab === "clubs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Clubs ({clubs.length})</h2>
            <button onClick={() => setShowClubForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Add Club
            </button>
          </div>
          {showClubForm && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-blue-200 dark:border-blue-800 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white">New Club</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: "name", placeholder: "Club Name" },
                  { key: "description", placeholder: "Description" },
                  { key: "icon", placeholder: "Emoji Icon" },
                ].map(field => (
                  <input key={field.key} placeholder={field.placeholder} value={(clubForm as any)[field.key]}
                    onChange={e => setClubForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white"
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreateClub} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Create</button>
                <button onClick={() => setShowClubForm(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-semibold">Cancel</button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((c, i) => (
              <div key={c.id || i} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{c.icon || "🏛️"}</span>
                  <button onClick={() => handleDeleteClub(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{c.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{c.description}</p>
                <p className="text-xs text-gray-400 mt-2">{c.members || "0 Members"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Jobs ── */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Jobs & Opportunities ({jobs.length})</h2>
            <button onClick={() => setShowJobForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Post Job
            </button>
          </div>
          {showJobForm && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-blue-200 dark:border-blue-800 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Post New Job</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "company", placeholder: "Company Name" },
                  { key: "role", placeholder: "Role / Position" },
                  { key: "location", placeholder: "Location" },
                  { key: "salary", placeholder: "Salary (e.g. ₹8L/yr)" },
                  { key: "apply_url", placeholder: "Apply URL" },
                ].map(field => (
                  <input key={field.key} placeholder={field.placeholder} value={(jobForm as any)[field.key]}
                    onChange={e => setJobForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white"
                  />
                ))}
                <select value={jobForm.type} onChange={e => setJobForm(prev => ({ ...prev, type: e.target.value }))}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white">
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreateJob} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Post</button>
                <button onClick={() => setShowJobForm(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-semibold">Cancel</button>
              </div>
            </div>
          )}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="p-4">Company</th><th className="p-4">Role</th><th className="p-4">Type</th><th className="p-4">Location</th><th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j, i) => (
                    <tr key={j.id || i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{j.company}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{j.role}</td>
                      <td className="p-4"><span className={cn("text-xs font-semibold px-2 py-1 rounded-full", j.type === 'Internship' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400')}>{j.type}</span></td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{j.location}</td>
                      <td className="p-4">
                        <button onClick={() => handleDeleteJob(j.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Community ── */}
      {activeTab === "community" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Community Posts ({posts.length})</h2>
          {posts.map((p, i) => (
            <div key={p.id || i} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex items-start gap-4">
              <img src={p.authorAvatar || `https://i.pravatar.cc/40?u=${p.id}`} className="w-10 h-10 rounded-full shrink-0" alt={p.authorName} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.authorName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">{p.content}</p>
              </div>
              <button onClick={() => handleDeletePost(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
