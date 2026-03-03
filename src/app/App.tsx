import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Sidebar from "../components/shared/Sidebar";
import Dashboard from "../components/shared/containers/Dashboard";
import Goals from "../components/shared/containers/Goals";
import Tasks from "../components/shared/containers/Tasks";
import Habits from "../components/shared/containers/Habits";
import LandingPage from "../components/shared/containers/LandingPage";

function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div className="flex min-h-screen">
      {!isLanding && <Sidebar />}
      <main className={`flex-1 bg-background ${isLanding ? "w-full" : ""}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/pomodoro" element={<Tasks />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/focus-mode" element={<Tasks />} />
          <Route path="/ai-coach" element={<Tasks />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
