import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Switch } from "../../../ui/switch";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Separator } from "../../../ui/separator";
import {
  Sun,
  Moon,
  Monitor,
  User,
  Lock,
  Bell,
  Globe,
  Trash2,
  LogOut,
  ChevronRight,
  Check,
} from "lucide-react";
import { API_BASE } from "../../../../lib/utils";
import { toast } from "sonner";
import { useUserStore } from "../../../../stores/useUserStore";
import { useThemeStore } from "../../../../stores/useThemeStore";
import { useNavigate } from "react-router";
import { signOut } from "../../../../lib/auth-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "appearance" | "account" | "notifications" | "privacy";
type Theme = "light" | "dark" | "system";

// ─── Nav Item ─────────────────────────────────────────────────────────────────

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer
        ${
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── Theme Picker ─────────────────────────────────────────────────────────────

function ThemePicker({
  value,
  onChange,
}: {
  value: Theme;
  onChange: (v: Theme) => void;
}) {
  const options: { value: Theme; icon: React.ElementType; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer
              ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-border hover:text-foreground"
              }`}
          >
            <Icon size={16} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function AppearanceTab() {
  const { theme, setTheme } = useThemeStore();
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );

  function handleThemeChange(v: Theme) {
    console.log("setting theme to:", v);
    setTheme(v);
  }

  return (
    <div className="space-y-6">
      <Section title="Theme">
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Color mode</p>
          <ThemePicker value={theme} onChange={handleThemeChange} />
        </div>
      </Section>

      <Separator />

      <Section title="Layout">
        <Row
          label="Compact density"
          description="Reduce spacing for more content on screen"
        >
          <Switch
            checked={density === "compact"}
            onCheckedChange={(v) => setDensity(v ? "compact" : "comfortable")}
          />
        </Row>
      </Section>
    </div>
  );
}

function AccountTab() {
  const { user, update: updateUser } = useUserStore();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [saved, setSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleSave() {
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        toast.error("Failed to update profile");
        return;
      }
      updateUser({ name, email });
      toast.success("Profile updated");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange() {
    setSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data.error ?? "Failed to update password";
        if (msg.toLowerCase().includes("short"))
          toast.error("Password must be at least 8 characters");
        else if (msg.toLowerCase().includes("invalid"))
          toast.error("Current password is incorrect");
        else toast.error(msg);
        return;
      }
      toast.success("Password updated");
      setCurrentPw("");
      setNewPw("");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      <Section title="Profile">
        <div className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-xs mb-1.5 block">
              Display name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-xs mb-1.5 block">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={savingProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            {savingProfile ? (
              "Saving..."
            ) : saved ? (
              <>
                <Check size={14} className="mr-1.5" /> Saved
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </Section>

      <Separator />

      <Section title="Password">
        <div className="space-y-3">
          <div>
            <Label htmlFor="current-pw" className="text-xs mb-1.5 block">
              Current password
            </Label>
            <Input
              id="current-pw"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label htmlFor="new-pw" className="text-xs mb-1.5 block">
              New password
            </Label>
            <Input
              id="new-pw"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button
            className="cursor-pointer"
            size="sm"
            variant="outline"
            onClick={handlePasswordChange}
            disabled={savingPassword}
          >
            <Lock size={14} className="mr-1.5" />
            {savingPassword ? "Updating..." : "Update password"}
          </Button>
        </div>
      </Section>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    taskReminders: true,
    habitReminders: true,
    goalMilestones: true,
    weeklyDigest: false,
    aiInsights: true,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6">
      <Section title="Reminders">
        <Row
          label="Task reminders"
          description="Get notified before tasks are due"
        >
          <Switch
            checked={prefs.taskReminders}
            onCheckedChange={() => toggle("taskReminders")}
          />
        </Row>
        <Row
          label="Habit reminders"
          description="Daily nudge to complete your habits"
        >
          <Switch
            checked={prefs.habitReminders}
            onCheckedChange={() => toggle("habitReminders")}
          />
        </Row>
        <Row
          label="Goal milestones"
          description="Celebrate when you hit a milestone"
        >
          <Switch
            checked={prefs.goalMilestones}
            onCheckedChange={() => toggle("goalMilestones")}
          />
        </Row>
      </Section>

      <Separator />

      <Section title="Reports">
        <Row
          label="Weekly digest"
          description="Sunday summary of your week's progress"
        >
          <Switch
            checked={prefs.weeklyDigest}
            onCheckedChange={() => toggle("weeklyDigest")}
          />
        </Row>
        <Row
          label="AI Coach insights"
          description="Personalized tips from your AI Coach"
        >
          <Switch
            checked={prefs.aiInsights}
            onCheckedChange={() => toggle("aiInsights")}
          />
        </Row>
      </Section>
    </div>
  );
}

function PrivacyTab() {
  const [twoFa, setTwoFa] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/sign-in");
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data.error ?? "Failed to delete account";
        if (msg.toLowerCase().includes("password"))
          toast.error("Incorrect password");
        else toast.error(msg);
        return;
      }
      toast.success("Account deleted");
      await signOut();
      navigate("/sign-in");
    } finally {
      setDeletingAccount(false);
      setDeletePassword("");
    }
  };

  return (
    <div className="space-y-6">
      <Section title="Security">
        <Row
          label="Two-factor authentication"
          description="Add an extra layer of security to your account"
        >
          <Switch checked={twoFa} onCheckedChange={setTwoFa} />
        </Row>
        <Row
          label="Active sessions"
          description="Manage where you're logged in"
        >
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer text-xs h-8 gap-1.5"
          >
            Manage
            <ChevronRight size={12} />
          </Button>
        </Row>
      </Section>

      <Separator />

      <Section title="Data">
        <Row
          label="Export your data"
          description="Download a copy of all your tasks, goals, and habits"
        >
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer text-xs h-8"
          >
            <Globe size={13} className="mr-1.5" />
            Export
          </Button>
        </Row>
      </Section>

      <Separator />

      <Section title="Danger zone">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 space-y-3">
          <Row label="Sign out everywhere" description="Log out of all devices">
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setLogoutOpen(true)}
            >
              <LogOut size={13} className="mr-1.5" />
              Sign out
            </Button>
          </Row>
          <Separator className="bg-destructive/20" />
          <Row
            label="Delete account"
            description="Permanently remove your data"
          >
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={13} className="mr-1.5" />
              Delete
            </Button>
          </Row>
        </div>
      </Section>

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

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeletePassword("");
        }}
      >
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data
              — tasks, goals, habits, and settings. This action{" "}
              <strong>cannot</strong> be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-1 py-2">
            <Label htmlFor="delete-confirm-pw" className="text-xs mb-1.5 block">
              Confirm your password to continue
            </Label>
            <Input
              id="delete-confirm-pw"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => {
                if (e.key === "Enter" && deletePassword) handleDeleteAccount();
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={() => setDeletePassword("")}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteAccount}
              disabled={!deletePassword || deletingAccount}
            >
              {deletingAccount ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: { name?: string; email?: string };
}

export function SettingsDialog({
  open,
  onOpenChange,
  user,
}: SettingsDialogProps) {
  const [tab, setTab] = useState<Tab>("appearance");

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: "appearance", icon: Sun, label: "Appearance" },
    { id: "account", icon: User, label: "Account" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "privacy", icon: Lock, label: "Privacy & Security" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden">
        <div className="flex h-130">
          {/* Sidebar */}
          <div className="w-48 shrink-0 border-r bg-muted p-3 flex flex-col gap-1">
            <DialogHeader className="px-1 pb-3">
              <DialogTitle className="text-sm font-semibold">
                Settings
              </DialogTitle>
            </DialogHeader>
            {tabs.map((t) => (
              <NavItem
                key={t.id}
                icon={t.icon}
                label={t.label}
                active={tab === t.id}
                onClick={() => setTab(t.id)}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {tab === "appearance" && <AppearanceTab />}
            {tab === "account" && <AccountTab />}
            {tab === "notifications" && <NotificationsTab />}
            {tab === "privacy" && <PrivacyTab />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
