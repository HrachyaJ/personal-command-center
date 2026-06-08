import { Brain, CreditCard, LogOut, ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useUserStore } from "../../stores/useUserStore";
import { useUIStore } from "../../stores/useUIStore";
import { signOut } from "../../lib/auth-client";
import { useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
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
import { navigation } from "../../lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials, resolveAvatarUrl } from "../../lib/avatar";
import { toast } from "sonner";

function Sidebar() {
  const { t } = useTranslation();
  const { sidebarCollapsed: collapsed, setSidebarCollapsed } = useUIStore();
  const { user, loading: isPending, clearUser } = useUserStore();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    clearUser();
    navigate("/sign-in");
  };

  const location = useLocation();
  const currentPath = location.pathname;

  const getNavLabel = (name: string) => {
    const key = name === "AI Coach" ? "aiCoach" : name.toLowerCase();
    return t(`sidebar.navigation.${key}`);
  };

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────────── */}
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
          aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
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
                    onClick={() => navigate(item.href)}
                    title={collapsed ? getNavLabel(item.name) : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && (
                      <span className="whitespace-nowrap">
                        {getNavLabel(item.name)}
                      </span>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border sticky bottom-0 bg-card space-y-2">
          {/* User info row — avatar always visible, text slides away when collapsed */}
          {isPending || !user ? (
            <div className="flex items-center gap-2 pb-2">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              {!collapsed && (
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex items-center gap-2 overflow-hidden pb-2"
              title={collapsed ? (user?.name ?? "") : undefined}
            >
              {/* Avatar — always visible */}
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage
                  src={resolveAvatarUrl(user?.image) ?? undefined}
                  alt={user?.name ?? "Avatar"}
                />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  {getInitials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>

              {/* Name + plan — slide out when collapsed */}
              <div
                className="min-w-0 overflow-hidden"
                style={{
                  opacity: collapsed ? 0 : 1,
                  maxWidth: collapsed ? "0px" : "160px",
                  transition:
                    "opacity 150ms ease, max-width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <p
                  className="text-sm font-medium whitespace-nowrap truncate"
                  data-testid="user-name"
                >
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {t("sidebar.freePlan")}
                </p>
              </div>
            </div>
          )}

          <Button
            className="w-full cursor-pointer rounded-xl flex items-center gap-2 overflow-hidden"
            style={{
              justifyContent: collapsed ? "center" : "flex-start",
              paddingLeft: collapsed ? "0" : "12px",
              paddingRight: collapsed ? "0" : "12px",
            }}
            data-testid="button-upgrade"
            title={collapsed ? t("sidebar.upgrade") : undefined}
            onClick={() => toast.info(t("sidebar.upgradeToast"))}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <span className="whitespace-nowrap">{t("sidebar.upgrade")}</span>
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
            title={collapsed ? t("sidebar.logout") : undefined}
            onClick={() => setLogoutOpen(true)}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <span className="whitespace-nowrap">{t("sidebar.logout")}</span>
            )}
          </Button>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ───────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
        data-testid="mobile-bottom-nav"
      >
        <ul className="flex items-stretch h-16">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            const compactLabel =
              item.name === "AI Coach"
                ? t("sidebar.navigation.aiShort")
                : getNavLabel(item.name);
            return (
              <li key={item.name} className="flex-1">
                <button
                  onClick={() => navigate(item.href)}
                  className={`w-full h-full flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={getNavLabel(item.name)}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-[10px] font-medium leading-none">
                    {compactLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout confirmation */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sidebar.logoutTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sidebar.logoutDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              {t("sidebar.logoutCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleLogout}
            >
              {t("sidebar.logoutConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default Sidebar;
