import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import { getCategoryBadgeStyles } from "@/lib/placement";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    hrAccounts: 0,
    hrPostings: 0,
    communityPosts: 0,
    jobPostings: 0,
    internships: 0,
    clubs: 0,
    events: 0
  });

  const [hrRequests, setHrRequests] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      // Parallel fetch all collections for speed
      const [usersSnap, communitySnap, jobsSnap, clubsSnap, eventsSnap, hrReqSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "community_posts")),
        getDocs(collection(db, "jobs")),
        getDocs(collection(db, "clubs")),
        getDocs(collection(db, "events")),
        getDocs(collection(db, "hr_requests"))
      ]);

      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      const jobs = jobsSnap.docs.map(doc => doc.data() as any);

=======
      // Fetch users
      const usersSnap = await getDocs(collection(db, "users"));
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
      const totalUsers = users.length;
      const totalStudents = users.filter(u => u.role === "student" || !u.role).length;
      const totalTeachers = users.filter(u => u.role === "teacher").length;
      const hrAccounts = users.filter(u => u.role === "hr").length;

      // Calculate top students for analytics
      const enrichedStudents = users.filter(u => u.role === "student" || !u.role).map(student => {
        const cgpa = parseFloat(student.cgpa || "0");
        const att = parseFloat(student.attendance_percentage || "0");
        
        let category = 4;
        if (cgpa >= 8.5 && att >= 75) category = 1;
        else if (cgpa >= 7.5 && att >= 60) category = 2;
        else if (cgpa >= 7.0 && att >= 60) category = 3;

        return {
          ...student,
          category: category === 4 ? "Not Eligible" : `Category ${category}`,
          catNum: category
        };
      });

      enrichedStudents.sort((a, b) => {
        if (a.catNum !== b.catNum) return a.catNum - b.catNum;
        const cgpaA = parseFloat(a.cgpa || "0");
        const cgpaB = parseFloat(b.cgpa || "0");
        if (cgpaA !== cgpaB) return cgpaB - cgpaA;
        const attA = parseFloat(a.attendance_percentage || "0");
        const attB = parseFloat(b.attendance_percentage || "0");
        return attB - attA;
      });

      setTopStudents(enrichedStudents.slice(0, 4));

<<<<<<< HEAD
      // HR Requests (pending only)
      const allHrReqs = hrReqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      setHrRequests(allHrReqs.filter(req => req.status === "pending"));

      // Set real stats (no misleading fallbacks)
      setStats({
        totalUsers,
        totalStudents,
        totalTeachers,
        hrAccounts,
        hrPostings: jobs.length,
        communityPosts: communitySnap.size,
        jobPostings: jobs.filter(j => j.type === "Full-time").length,
        internships: jobs.filter(j => j.type === "Internship").length,
        clubs: clubsSnap.size,
        events: eventsSnap.size
=======
      // Fetch HR Requests
      const hrReqSnap = await getDocs(collection(db, "hr_requests"));
      const allHrReqs = hrReqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      setHrRequests(allHrReqs.filter(req => req.status === "pending"));

      // Fetch other stats (mocked counts if collections don't exist yet)
      const communitySnap = await getDocs(collection(db, "community_posts"));
      const jobsSnap = await getDocs(collection(db, "jobs"));
      const jobs = jobsSnap.docs.map(doc => doc.data() as any);
      const clubsSnap = await getDocs(collection(db, "clubs"));
      const eventsSnap = await getDocs(collection(db, "events"));

      setStats({
        totalUsers: totalUsers || 2200,
        totalStudents: totalStudents || 2000,
        totalTeachers: totalTeachers || 10,
        hrAccounts: hrAccounts || 15,
        hrPostings: jobs.length || 15,
        communityPosts: communitySnap.size || 1500,
        jobPostings: jobs.filter(j => j.type === "Full-time").length || 100,
        internships: jobs.filter(j => j.type === "Internship").length || 75,
        clubs: clubsSnap.size || 75,
        events: eventsSnap.size || 25
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
      });

    } catch (error) {
      console.error("Error fetching admin data:", error);
<<<<<<< HEAD
      toast.error("Failed to load dashboard data. Check Firestore permissions.");
=======
>>>>>>> 648baa19552d4e19f3f6230e8415d44bb744bf7e
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string, req: any) => {
    try {
      await updateDoc(doc(db, "hr_requests", id), { status: "approved" });
      
      // Create or update user in users collection
      const usersSnap = await getDocs(collection(db, "users"));
      const existingUser = usersSnap.docs.find(doc => doc.data().email === req.email);
      
      if (existingUser) {
        await updateDoc(doc(db, "users", existingUser.id), { role: "hr" });
      } else {
        // Note: We can't create an auth user from client side easily without admin SDK,
        // but we can create the firestore document so when they login with google it matches.
        // For email login, they would need to sign up first.
        // For now, we'll just create the document with a placeholder ID.
        // In a real app, this would be done via a Cloud Function.
        const newDocRef = doc(collection(db, "users"));
        await setDoc(newDocRef, {
          uid: newDocRef.id,
          name: req.hr_name,
          email: req.email,
          role: "hr",
          company: req.company_name,
          created_at: new Date()
        });
      }

      toast.success("HR Request approved");
      fetchData();
    } catch (error) {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, "hr_requests", id), { status: "rejected" });
      toast.success("HR Request rejected");
      fetchData();
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Super Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage users, HR requests, and platform analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers },
          { label: "Total Students", value: stats.totalStudents },
          { label: "Total Teachers", value: stats.totalTeachers },
          { label: "HR Accounts", value: stats.hrAccounts },
          { label: "HR postings", value: stats.hrPostings },
          { label: "Community Posts", value: stats.communityPosts },
          { label: "Job Postings", value: stats.jobPostings },
          { label: "Internships", value: stats.internships },
          { label: "Clubs", value: stats.clubs },
          { label: "Events", value: stats.events },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col items-center justify-center text-center">
            <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">{formatNumber(stat.value)}</div>
            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending HR Requests */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pending HR Requests</h2>
        {hrRequests.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center text-gray-500">
            No pending requests
          </div>
        ) : (
          hrRequests.map((req) => (
            <div key={req.id} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-blue-600 dark:text-blue-400 mb-1">{req.company_name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{req.hr_name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300"><span className="font-semibold">Roles:</span> {req.job_roles}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleApprove(req.id, req)}
                  className="px-4 py-2 bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleReject(req.id)}
                  className="px-4 py-2 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Platform Analytics */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Platform Analytics</h2>
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                  <th className="p-4">Rank</th>
                  <th className="p-4">Name</th>
                  <th className="p-4 text-center">CGPA</th>
                  <th className="p-4 text-center">Attendance</th>
                  <th className="p-4 text-right">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {topStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={student.photoURL || `https://i.pravatar.cc/150?u=${student.id}`} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{student.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{student.branch?.split(' ')[0]}, {student.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm font-semibold text-gray-900 dark:text-white">{student.cgpa || "0.0"}</td>
                    <td className="p-4 text-center text-sm font-semibold text-gray-900 dark:text-white">{student.attendance_percentage || "0"}</td>
                    <td className="p-4 text-right">
                      <div className={cn("inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap", getCategoryBadgeStyles(student.category))}>
                        {student.category}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
