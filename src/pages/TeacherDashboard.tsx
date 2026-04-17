import { useState, useEffect } from "react";
<<<<<<< HEAD
import {
  Search, Filter, ArrowUpDown, RefreshCw, BookOpen, Target, Users,
  Plus, Trash2, Calendar, Briefcase, UserCheck
} from "lucide-react";
import { getCategoryBadgeStyles } from "@/lib/placement";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  fetchAdminUsers,
  createEvent, deleteEvent, fetchEvents,
  createJob, deleteJob, fetchOpportunities,
  fetchClubMembers, addClubMember, removeClubMember, fetchClubs,
  createAttendance, fetchAttendance,
} from "@/lib/api";

type TeacherTab = "students" | "events" | "opportunities" | "attendance" | "clubs";

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<TeacherTab>("TEACHER");
  const [students, setStudents] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [selectedClub, setSelectedClub] = useState("");

  // Forms
  const [showEventForm, setShowEventForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showAttForm, setShowAttForm] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", subtitle: "", date: "", location: "", icon: "📅" });
  const [jobForm, setJobForm] = useState({ company: "", role: "", location: "", type: "Full-time", salary: "", apply_url: "" });
  const [attForm, setAttForm] = useState({ studentName: "", studentId: "", date: "", status: "present" });

  const loadStudents = async () => {
    setLoading(true);
    try {
      const all = await fetchAdminUsers();
      const studentList = all.filter((u: any) => u.role === "student" || !u.role).map((s: any) => {
        const c = parseFloat(s.cgpa || "0"), a = parseFloat(s.attendance_percentage || "0");
        let category = "Not Eligible";
        if (c >= 8.5 && a >= 75) category = "Category 1";
        else if (c >= 7.5 && a >= 60) category = "Category 2";
        else if (c >= 7.0 && a >= 60) category = "Category 3";
        return { ...s, category };
      });
      setStudents(studentList);
    } catch { toast.error("Failed to load students"); }
    finally { setLoading(false); }
  };

  const loadEvents = async () => { try { setEvents(await fetchEvents()); } catch { } };
  const loadJobs = async () => { try { setJobs(await fetchOpportunities()); } catch { } };
  const loadClubs = async () => {
    try {
      const c = await fetchClubs();
      setClubs(c);
      if (c.length > 0 && !selectedClub) setSelectedClub(c[0].id);
    } catch { }
  };
  const loadMembers = async (clubId: string) => {
    try { setMembers(await fetchClubMembers(clubId)); } catch { setMembers([]); }
  };
  const loadAttendance = async () => { try { setAttendanceRecords(await fetchAttendance()); } catch { setAttendanceRecords([]); } };

  useEffect(() => {
    loadStudents();
    loadEvents();
    loadJobs();
    loadClubs();
    loadAttendance();
  }, []);

  useEffect(() => {
    if (selectedClub) loadMembers(selectedClub);
  }, [selectedClub]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = branchFilter === "All" || s.branch?.includes(branchFilter);
    return matchesSearch && matchesBranch;
  });

  const avgCgpa = students.length > 0
    ? (students.reduce((a, s) => a + parseFloat(s.cgpa || "0"), 0) / students.length).toFixed(1)
    : "0.0";

  // Event handlers
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
    try { await deleteEvent(id); setEvents(prev => prev.filter(e => e.id !== id)); toast.success("Event deleted"); }
    catch { toast.error("Failed to delete event"); }
  };

  const handleCreateJob = async () => {
    try {
      const created = await createJob(jobForm);
      setJobs(prev => [created, ...prev]);
      setShowJobForm(false);
      setJobForm({ company: "", role: "", location: "", type: "Full-time", salary: "", apply_url: "" });
      toast.success("Opportunity posted");
    } catch { toast.error("Failed to post opportunity"); }
  };

  const handleDeleteJob = async (id: string) => {
    try { await deleteJob(id); setJobs(prev => prev.filter(j => j.id !== id)); toast.success("Deleted"); }
    catch { toast.error("Failed to delete"); }
  };

  const handleAddAttendance = async () => {
    try {
      const record = await createAttendance({ ...attForm, markedAt: new Date().toISOString() });
      setAttendanceRecords(prev => [record, ...prev]);
      setShowAttForm(false);
      setAttForm({ studentName: "", studentId: "", date: "", status: "present" });
      toast.success("Attendance recorded");
    } catch { toast.error("Failed to record attendance"); }
  };

  const handleRemoveMember = async (memberId: string) => {
    try { await removeClubMember(memberId); setMembers(prev => prev.filter(m => m.id !== memberId)); toast.success("Member removed"); }
    catch { toast.error("Failed to remove member"); }
  };

  const TABS: { id: TeacherTab; label: string; icon: any }[] = [
    { id: "students", label: "Students", icon: Users },
    { id: "events", label: "Events", icon: Calendar },
    { id: "opportunities", label: "Opportunities", icon: Briefcase },
    { id: "attendance", label: "Attendance", icon: UserCheck },
    { id: "clubs", label: "Club Members", icon: BookOpen },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your students and classroom activities</p>
        </div>
        <button onClick={loadStudents} className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-blue-600 transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Average CGPA", value: avgCgpa, icon: BookOpen },
          { label: "Total Students", value: students.length, icon: Users },
          { label: "Category 1", value: students.filter(s => s.category === "Category 1").length, icon: Target },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
              activeTab === tab.id ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-blue-300")}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* ── Students ── */}
      {activeTab === "students" && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
              className="bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none dark:text-white">
              <option value="All">All Branches</option>
              {["CSE", "IT", "ECE", "MECH", "Civil", "EE"].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none dark:text-white" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400">
                  <th className="pb-3">Name</th><th className="pb-3">Branch</th><th className="pb-3">Year</th>
                  <th className="pb-3">CGPA</th><th className="pb-3">Attendance</th><th className="pb-3">Skills</th><th className="pb-3">Category</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-500">Loading...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-500">No students found.</td></tr>
                ) : (
                  filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors border-b border-gray-50 dark:border-gray-800/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img src={s.photoURL || `https://i.pravatar.cc/40?u=${s.id}`} className="w-8 h-8 rounded-full" alt={s.name} />
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{s.branch?.split(" ")[0] || "N/A"}</td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{s.year || "N/A"}</td>
                      <td className="py-4 text-sm font-semibold text-gray-900 dark:text-white">{s.cgpa || "0.0"}</td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{s.attendance_percentage || 0}%</td>
                      <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{s.skills?.length || 0}</td>
                      <td className="py-4">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap", getCategoryBadgeStyles(s.category))}>
                          {s.category}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
            <button onClick={() => setShowEventForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>
          {showEventForm && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-blue-200 dark:border-blue-800 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white">New Event</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{ key: "title", ph: "Title" }, { key: "subtitle", ph: "Subtitle" }, { key: "date", ph: "Date" }, { key: "location", ph: "Location" }, { key: "icon", ph: "Icon Emoji" }].map(f => (
                  <input key={f.key} placeholder={f.ph} value={(eventForm as any)[f.key]}
                    onChange={e => setEventForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white" />
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreateEvent} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Create</button>
                <button onClick={() => setShowEventForm(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-600 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((e, i) => (
              <div key={e.id || i} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{e.icon || "📅"}</span>
                  <button onClick={() => handleDeleteEvent(e.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{e.title}</h3>
                <p className="text-sm text-gray-500">{e.subtitle}</p>
                <p className="text-xs text-blue-600 mt-2">{e.date} · {e.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Opportunities ── */}
      {activeTab === "opportunities" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Opportunities ({jobs.length})</h2>
            <button onClick={() => setShowJobForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Post Opportunity
            </button>
          </div>
          {showJobForm && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-blue-200 dark:border-blue-800 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white">New Opportunity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{ key: "company", ph: "Company" }, { key: "role", ph: "Role" }, { key: "location", ph: "Location" }, { key: "salary", ph: "Salary" }, { key: "apply_url", ph: "Apply URL" }].map(f => (
                  <input key={f.key} placeholder={f.ph} value={(jobForm as any)[f.key]}
                    onChange={e => setJobForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white" />
                ))}
                <select value={jobForm.type} onChange={e => setJobForm(p => ({ ...p, type: e.target.value }))}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white">
                  <option>Full-time</option><option>Internship</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreateJob} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Post</button>
                <button onClick={() => setShowJobForm(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-600 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          )}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="p-4">Company</th><th className="p-4">Role</th><th className="p-4">Type</th><th className="p-4">Location</th><th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j, i) => (
                    <tr key={j.id || i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{j.company}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{j.role}</td>
                      <td className="p-4"><span className={cn("text-xs font-semibold px-2 py-1 rounded-full", j.type === 'Internship' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600')}>{j.type}</span></td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{j.location}</td>
                      <td className="p-4"><button onClick={() => handleDeleteJob(j.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Attendance ── */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">Attendance ({attendanceRecords.length} records)</h2>
            <button onClick={() => setShowAttForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Mark Attendance
            </button>
          </div>
          {showAttForm && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-blue-200 dark:border-blue-800 p-6 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Mark Attendance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Student Name" value={attForm.studentName} onChange={e => setAttForm(p => ({ ...p, studentName: e.target.value }))}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white" />
                <input placeholder="Student ID (UID)" value={attForm.studentId} onChange={e => setAttForm(p => ({ ...p, studentId: e.target.value }))}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white" />
                <input type="date" value={attForm.date} onChange={e => setAttForm(p => ({ ...p, date: e.target.value }))}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white" />
                <select value={attForm.status} onChange={e => setAttForm(p => ({ ...p, status: e.target.value }))}
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddAttendance} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Save</button>
                <button onClick={() => setShowAttForm(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-600 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          )}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Student</th><th className="p-4">Date</th><th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length === 0 ? (
                  <tr><td colSpan={3} className="py-8 text-center text-gray-500">No attendance records yet.</td></tr>
                ) : attendanceRecords.map((r, i) => (
                  <tr key={r.id || i} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{r.studentName}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{r.date}</td>
                    <td className="p-4">
                      <span className={cn("text-xs font-semibold px-2 py-1 rounded-full",
                        r.status === 'present' ? 'bg-green-50 text-green-600' :
                          r.status === 'late' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500')}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Club Members ── */}
      {activeTab === "clubs" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Club Members</h2>
            <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-sm outline-none dark:text-white">
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Member</th><th className="p-4">Joined</th><th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr><td colSpan={3} className="py-8 text-center text-gray-500">No members in this club.</td></tr>
                ) : members.map((m, i) => (
                  <tr key={m.id || i} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{m.userName || m.userId}</td>
                    <td className="p-4 text-sm text-gray-500">{m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "N/A"}</td>
                    <td className="p-4">
                      <button onClick={() => handleRemoveMember(m.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
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
=======
import { motion } from "motion/react";
import { Search, Filter, ArrowUpDown, RefreshCw, BookOpen, Target, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getCategoryBadgeStyles } from "@/lib/placement";
import { cn } from "@/lib/utils";

export default function TeacherDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      // Filter only students
      const studentUsers = allUsers.filter(u => u.role === "student" || !u.role);
      
      // Calculate mock test average and interview average (mocked for now if not in DB)
      const enrichedStudents = studentUsers.map(student => {
        const cgpa = parseFloat(student.cgpa || "0");
        const att = parseFloat(student.attendance_percentage || "0");
        
        let category = 4;
        if (cgpa >= 8.5 && att >= 75) category = 1;
        else if (cgpa >= 7.5 && att >= 60) category = 2;
        else if (cgpa >= 7.0 && att >= 60) category = 3;

        return {
          ...student,
          category: category === 4 ? "Not Eligible" : `Category ${category}`,
          mockTestScore: student.mockTestScore || Math.floor(Math.random() * 30) + 60, // Mock data
          mockInterviewScore: student.mockInterviewScore || Math.floor(Math.random() * 30) + 50, // Mock data
        };
      });

      setStudents(enrichedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = branchFilter === "All" || student.branch?.includes(branchFilter);
    return matchesSearch && matchesBranch;
  });

  const avgCgpa = students.length > 0 
    ? (students.reduce((acc, s) => acc + parseFloat(s.cgpa || "0"), 0) / students.length).toFixed(1) 
    : "0.0";
  
  const avgMockScore = students.length > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.mockTestScore, 0) / students.length) 
    : 0;
    
  const avgInterviewScore = students.length > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.mockInterviewScore, 0) / students.length) 
    : 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Teacher Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Monitor your students' progress in mock tests and interviews.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Average Class CGPA</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white text-center">{avgCgpa}</div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Average Mock Score</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white text-center">{avgMockScore}</div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Average Mock Interview</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white text-center">{avgInterviewScore}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Overview</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select 
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white min-w-[160px]"
          >
            <option value="All">Filter by Branch</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
          </select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Filter Search names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2.5 bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
              <ArrowUpDown className="w-4 h-4" />
            </button>
            <button onClick={fetchStudents} className="p-2.5 bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400">
                <th className="pb-3 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Branch</th>
                <th className="pb-3 font-semibold">Year</th>
                <th className="pb-3 font-semibold">CGPA</th>
                <th className="pb-3 font-semibold">Attendance</th>
                <th className="pb-3 font-semibold">Skills</th>
                <th className="pb-3 font-semibold">Mock Tests</th>
                <th className="pb-3 font-semibold">Placement Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">Loading students...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">No students found.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={student.photoURL || `https://i.pravatar.cc/150?u=${student.id}`} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{student.branch?.split(' ')[0] || "N/A"}</td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{student.year || "N/A"}</td>
                    <td className="py-4 text-sm font-semibold text-gray-900 dark:text-white">{student.cgpa || "0.0"}</td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{student.attendance_percentage || "0"}%</td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{student.skills?.length || 0}</td>
                    <td className="py-4 text-sm text-gray-600 dark:text-gray-400">{student.mockTestScore}</td>
                    <td className="py-4">
                      <div className={cn("inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap", getCategoryBadgeStyles(student.category))}>
                        {student.category}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
>>>>>>> 58850df9608a9c315f026222dce4eaad0f14e3f8
    </div>
  );
}
