import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import Dashboard from "../components/containers/dashboard/Dashboard";
import Tasks from "../components/containers/tasks/Tasks";
import Goals from "../components/containers/goals/Goals";
import Habits from "../components/containers/habits/Habits";
import LandingPage from "../components/containers/landing/LandingPage";
import SignIn from "../components/containers/auth/SignIn";
import SignUp from "../components/containers/auth/SignUp";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import AuthCallback from "../components/containers/auth/AuthCallback";
import NotFound from "../components/shared/NotFound";
import AICoach from "../components/containers/ai-coach/AI-Coach";
import { useThemeStore } from "../stores/useThemeStore";
import { useUserStore } from "../stores/useUserStore";
import Sidebar from "../components/shared/Sidebar";
import { useApplyDensity } from "../hooks/useApplyDensity"; // Imported the layout applier hook
import { Toaster } from "../components/ui/sonner";
import { API_BASE, SIDEBAR_ROUTES } from "../lib/utils";
import { useTranslation } from "../hooks/useTranslation";
import { PageTransition } from "../components/shared/PageTransition";

function AppLayout() {
  const location = useLocation();
  const { theme } = useThemeStore();
  const initialPathname = useRef(location.pathname);

  // Executes root-level rem scaling and cross-tab storage syncing
  useApplyDensity();

  useEffect(() => {
    const isCallback = initialPathname.current === "/auth/callback/google";

    // Wake the server first, then fetch user once on mount.
    fetch(`${API_BASE}/health`)
      .catch(() => {})
      .finally(() => {
        if (!isCallback) {
          useUserStore.getState().fetch();
        }
      });
  }, []);

  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("app.title");
  }, [t]);

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

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  // Reset scroll position on route change — AnimatePresence/Framer won't
  // do this for us automatically.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const showSidebar = SIDEBAR_ROUTES.some(
    (r) => location.pathname.replace(/\/$/, "") === r,
  );

  return (
    <>
      {/* Cleaned up the density-compact class since font scaling works dynamically at the root element level */}
      <div className="flex min-h-screen">
        {showSidebar && <Sidebar />}
        <main
          className={`flex-1 min-w-0 bg-background ${!showSidebar ? "w-full" : ""}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              {/* Public routes */}
              <Route
                path="/"
                element={
                  <PageTransition>
                    <LandingPage />
                  </PageTransition>
                }
              />
              <Route
                path="/sign-in"
                element={
                  <PageTransition>
                    <SignIn />
                  </PageTransition>
                }
              />
              <Route
                path="/sign-up"
                element={
                  <PageTransition>
                    <SignUp />
                  </PageTransition>
                }
              />
              {/* Auth callback — must be outside ProtectedRoute */}
              <Route path="/auth/callback/google" element={<AuthCallback />} />
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <PageTransition>
                      <Dashboard />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <PageTransition>
                      <Tasks />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/habits"
                element={
                  <ProtectedRoute>
                    <PageTransition>
                      <Habits />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <PageTransition>
                      <Goals />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-coach"
                element={
                  <ProtectedRoute>
                    <PageTransition>
                      <AICoach />
                    </PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="*"
                element={
                  <PageTransition>
                    <NotFound />
                  </PageTransition>
                }
              />
            </Routes>
          </AnimatePresence>
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
