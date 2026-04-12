import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
