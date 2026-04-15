import { useState, useEffect } from "react";
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
    </div>
  );
}
