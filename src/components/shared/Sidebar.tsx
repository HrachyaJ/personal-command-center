import {
  Brain,
  Home,
  CheckSquare,
  Clock,
  BarChart3,
  Target,
  Shield,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Pomodoro", href: "/pomodoro", icon: Clock },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Focus Mode", href: "/focus-mode", icon: Shield },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-card border-r border-border flex flex-col transition-all duration-300 relative`}
      data-testid="sidebar"
    >
      <div className="p-6 border-b border-border flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="text-primary-foreground text-sm" />
            </div>
            <h1 className="text-xl font-semibold">FocusFlow</h1>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="text-primary-foreground text-sm" />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 bg-card border border-border rounded-full p-1.5 hover:bg-accent hover:text-white transition-colors shadow-md z-10 cursor-pointer"
        data-testid="toggle-sidebar"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Button
                  className={`w-full ${
                    collapsed ? "justify-center px-0" : "justify-start"
                  } cursor-pointer`}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  variant={
                    window.location.pathname === item.href ? "default" : "ghost"
                  }
                  onClick={() => (window.location.href = item.href)}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 ${!collapsed && "mr-3"}`} />
                  {!collapsed && item.name}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={`p-4 border-t border-border sticky bottom-0 bg-card ${
          collapsed ? "flex flex-col items-center" : ""
        }`}
      >
        {!collapsed && (
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium" data-testid="user-name">
                John Doe
              </p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
          </div>
        )}

        <div className={`space-y-2 ${collapsed ? "w-full" : ""}`}>
          <Button
            className={`w-full cursor-pointer ${
              collapsed ? "justify-center px-2" : ""
            }`}
            data-testid="button-upgrade"
            title={collapsed ? "Upgrade to Pro" : undefined}
          >
            <CreditCard className={`w-4 h-4 ${!collapsed && "mr-2"}`} />
            {!collapsed && "Upgrade to Pro"}
          </Button>

          <Button
            variant="outline"
            className={`w-full cursor-pointer ${
              collapsed ? "justify-center px-2" : ""
            }`}
            data-testid="button-logout"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className={`w-4 h-4 ${!collapsed && "mr-2"}`} />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
0;
