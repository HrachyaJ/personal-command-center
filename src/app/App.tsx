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
import SignIn from "../components/shared/containers/auth/SignIn";
import SignUp from "../components/shared/containers/auth/SignUp";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import AuthCallback from "../components/shared/containers/auth/AuthCallback";

const SIDEBAR_ROUTES = [
  "/dashboard",
  "/tasks",
  "/habits",
  "/goals",
  "/pomodoro",
  "/focus-mode",
  "/ai-coach",
];

function AppLayout() {
  const location = useLocation();
  document.title = "FocusFlow - Your Ultimate Productivity Companion";

  const showSidebar = SIDEBAR_ROUTES.some(
    (r) => location.pathname.replace(/\/$/, "") === r,
  );

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 bg-background ${!showSidebar ? "w-full" : ""}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pomodoro"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/habits"
            element={
              <ProtectedRoute>
                <Habits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/focus-mode"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-coach"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />{" "}
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
