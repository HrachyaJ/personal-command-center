import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "../components/shared/containers/dashboard/Dashboard";
import Tasks from "../components/shared/containers/tasks/Tasks";
import Goals from "../components/shared/containers/goals/Goals";
import Habits from "../components/shared/containers/habits/Habits";
import LandingPage from "../components/shared/containers/landing/LandingPage";
import SignIn from "../components/shared/containers/auth/SignIn";
import SignUp from "../components/shared/containers/auth/SignUp";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import AuthCallback from "../components/shared/containers/auth/AuthCallback";
import NotFound from "../components/shared/NotFound";
import AICoach from "../components/shared/containers/AI-Coach";
import { useThemeStore } from "../stores/useThemeStore";
import { useUserStore } from "../stores/useUserStore";
import Sidebar from "../components/shared/Sidebar";
import { useDensityStore } from "../stores/useDensityStore";
import { Toaster } from "../components/ui/sonner";

const SIDEBAR_ROUTES = [
  "/dashboard",
  "/tasks",
  "/habits",
  "/goals",
  "/ai-coach",
];

function AppLayout() {
  const location = useLocation();
  const { theme } = useThemeStore();

  useEffect(() => {
    useUserStore.getState().fetch();
  }, []);

  document.title = "FocusFlow";

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.classList.toggle("dark", prefersDark);
    }
  }, [theme]);

  // Also listen for system preference changes when theme is "system"
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const showSidebar = SIDEBAR_ROUTES.some(
    (r) => location.pathname.replace(/\/$/, "") === r,
  );

  const { density } = useDensityStore();

  return (
    <>
      <div
        className={`flex min-h-screen ${density === "compact" ? "density-compact" : ""}`}
      >
        {showSidebar && <Sidebar />}
        <main
          className={`flex-1 bg-background ${!showSidebar ? "w-full" : ""}`}
        >
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
              path="/ai-coach"
              element={
                <ProtectedRoute>
                  <AICoach />
                </ProtectedRoute>
              }
            />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <Toaster richColors position="bottom-right" />
    </>
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
