import {
  Brain,
  Home,
  CheckSquare,
  BarChart3,
  Target,
  CreditCard,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Button } from "../ui/button";
import { useUserStore } from "../../stores/useUserStore";
import { useUIStore } from "../../stores/useUIStore";
import { signOut } from "../../lib/auth-client";
import { useNavigate } from "react-router";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Skeleton } from "./Skeletons";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Habits", href: "/habits", icon: BarChart3 },
  { name: "AI Coach", href: "/ai-coach", icon: Brain },
];

function Sidebar() {
  const { sidebarCollapsed: collapsed, setSidebarCollapsed } = useUIStore();
  const { user, loading: isPending } = useUserStore();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/sign-in");
  };

  const currentPath = window.location.pathname;

  return (
    <>
      {/* ── Desktop Sidebar (hidden on mobile) ─────────────────────────────── */}
      <aside
        className="hidden md:flex bg-card border-r border-border flex-col relative"
        style={{
          width: collapsed ? "5rem" : "16rem",
          minWidth: collapsed ? "5rem" : "16rem",
          transition:
            "width 300ms cubic-bezier(0.4, 0, 0.2, 1), min-width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        data-testid="sidebar"
      >
        {/* Header */}
        <div
          className="p-6 border-b border-border flex items-center overflow-hidden"
          style={{ height: "73px" }}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Brain className="text-primary-foreground" />
          </div>
          <span
            className="text-xl font-semibold whitespace-nowrap ml-3"
            style={{
              opacity: collapsed ? 0 : 1,
              transition: "opacity 150ms ease",
            }}
          >
            FocusFlow
          </span>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className="absolute -right-3 top-6.5 bg-card border border-border rounded-full p-1.5 shadow-md z-10 cursor-pointer hover:bg-accent hover:text-white"
          style={{ transition: "background 150ms ease, color 150ms ease" }}
          data-testid="toggle-sidebar"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className="w-4 h-4"
            style={{
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </button>

        {/* Nav */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Button
                    className="w-full rounded-xl cursor-pointer h-10 flex items-center gap-3 overflow-hidden"
                    style={{
                      justifyContent: collapsed ? "center" : "flex-start",
                      paddingLeft: collapsed ? "0" : "12px",
                      paddingRight: collapsed ? "0" : "12px",
                    }}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                    variant={currentPath === item.href ? "default" : "ghost"}
                    size="default"
                    onClick={() => (window.location.href = item.href)}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && (
                      <span className="whitespace-nowrap">{item.name}</span>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border sticky bottom-0 bg-card">
          <div
            className="overflow-hidden"
            style={{
              opacity: collapsed ? 0 : 1,
              maxHeight: collapsed ? "0px" : "48px",
              marginBottom: collapsed ? "0px" : "1rem",
              transition:
                "opacity 150ms ease, max-height 300ms cubic-bezier(0.4, 0, 0.2, 1), margin-bottom 300ms ease",
            }}
          >
            {isPending ? (
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            ) : (
              <>
                <p
                  className="text-sm font-medium whitespace-nowrap"
                  data-testid="user-name"
                >
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  Free Plan
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Button
              className="w-full cursor-pointer rounded-xl flex items-center gap-2 overflow-hidden"
              style={{
                justifyContent: collapsed ? "center" : "flex-start",
                paddingLeft: collapsed ? "0" : "12px",
                paddingRight: collapsed ? "0" : "12px",
              }}
              data-testid="button-upgrade"
              title={collapsed ? "Upgrade to Pro" : undefined}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <span className="whitespace-nowrap">Upgrade to Pro</span>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full cursor-pointer rounded-xl flex items-center gap-2 overflow-hidden"
              style={{
                justifyContent: collapsed ? "center" : "flex-start",
                paddingLeft: collapsed ? "0" : "12px",
                paddingRight: collapsed ? "0" : "12px",
              }}
              data-testid="button-logout"
              title={collapsed ? "Logout" : undefined}
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav (hidden on desktop) ──────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
        data-testid="mobile-bottom-nav"
      >
        <ul className="flex items-stretch h-16">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <li key={item.name} className="flex-1">
                <button
                  onClick={() => (window.location.href = item.href)}
                  className={`w-full h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={item.name}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-[10px] font-medium leading-none">
                    {item.name === "AI Coach" ? "AI" : item.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout confirmation dialog */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of FocusFlow?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign back in to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleLogout}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default Sidebar;
