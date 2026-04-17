import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Opportunities from "./pages/Opportunities";
import MockTests from "./pages/MockTests";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Activity from "./pages/Activity";
import Events from "./pages/Events";
import Clubs from "./pages/Clubs";
import Competitions from "./pages/Competitions";
import MockInterviews from "./pages/MockInterviews";
import Leaderboard from "./pages/Leaderboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CareerGuidance from "./pages/CareerGuidance";
import { useEffect, useState } from "react";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

export default function App() {
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubscribeSnapshot = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
          if (docSnap.exists()) {
            setRole(docSnap.data().role || "student");
          } else {
            setRole("student");
          }
          setLoadingRole(false);
        });
      } else {
        setRole(null);
        setLoadingRole(false);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  if (loadingRole) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={
          role === "teacher" ? <Navigate to="/teacher-dashboard" replace /> :
          role === "super_admin" ? <Navigate to="/admin-dashboard" replace /> :
          <Home />
        } />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="mock-tests" element={<MockTests />} />
        <Route path="community" element={<Community />} />
        <Route path="profile" element={<Profile />} />
        <Route path="activity" element={<Activity />} />
        <Route path="events" element={<Events />} />
        <Route path="clubs" element={<Clubs />} />
        <Route path="competitions" element={<Competitions />} />
        <Route path="mock-interviews" element={<MockInterviews />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="career-guidance" element={<CareerGuidance />} />
        <Route path="teacher-dashboard" element={
          role === "teacher" ? <TeacherDashboard /> : <Navigate to="/" replace />
        } />
        <Route path="admin-dashboard" element={
          role === "super_admin" ? <AdminDashboard /> : <Navigate to="/" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
