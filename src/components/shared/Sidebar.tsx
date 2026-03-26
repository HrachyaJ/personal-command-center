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
import { useState } from "react";
import { signOut, useSession } from "../../lib/auth-client";
import { useNavigate } from "react-router";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Habits", href: "/habits", icon: BarChart3 },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const navigate = useNavigate();

  return (
    <aside
      className="bg-card border-r border-border flex flex-col relative"
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
        onClick={() => setCollapsed(!collapsed)}
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
                  className="w-full rounded-xl cursor-pointer h-10 flex items-center overflow-hidden"
                  style={{ justifyContent: "flex-start" }}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  variant={
                    window.location.pathname === item.href ? "default" : "ghost"
                  }
                  size="default"
                  onClick={() => (window.location.href = item.href)}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0 ml-1" />
                  <span
                    className="whitespace-nowrap ml-3"
                    style={{
                      opacity: collapsed ? 0 : 1,
                      transition: "opacity 150ms ease",
                    }}
                  >
                    {item.name}
                  </span>
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
          <p
            className="text-sm font-medium whitespace-nowrap"
            data-testid="user-name"
          >
            {user?.name}
          </p>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {/* {user?.plan} */}
            Free Plan
          </p>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full cursor-pointer rounded-xl flex items-center overflow-hidden"
            style={{ justifyContent: "flex-start" }}
            data-testid="button-upgrade"
            title={collapsed ? "Upgrade to Pro" : undefined}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span
              className="whitespace-nowrap ml-2"
              style={{
                opacity: collapsed ? 0 : 1,
                transition: "opacity 150ms ease",
              }}
            >
              {
                // user?.plan === "Pro" ? "Manage Subscription" : "Upgrade to Pro"
                "Upgrade to Pro"
              }
            </span>
          </Button>

          <Button
            variant="custom"
            className="w-full cursor-pointer rounded-xl flex items-center overflow-hidden"
            style={{ justifyContent: "flex-start" }}
            data-testid="button-logout"
            title={collapsed ? "Logout" : undefined}
            onClick={async () => {
              await signOut();
              navigate("/sign-in");
            }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span
              className="whitespace-nowrap ml-2"
              style={{
                opacity: collapsed ? 0 : 1,
                transition: "opacity 150ms ease",
              }}
            >
              Logout
            </span>
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
