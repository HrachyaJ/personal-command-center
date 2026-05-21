import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Sun, User, Lock, Bell } from "lucide-react";
import { NavItem } from "./SettingsNavItem";
import { AppearanceTab, type Tab } from "./SettingsAppearanceTab";
import { AccountTab } from "./SettingsAccountTab";
import { NotificationsTab } from "./SettingsNotificationsTab";
import { PrivacyTab } from "./SettingsPrivacyTab";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: Tab;
}

export function SettingsDialog({
  open,
  onOpenChange,
  initialTab = "appearance",
}: SettingsDialogProps) {
  const [tab, setTab] = useState<Tab>(initialTab);

  // reset tab when dialog opens so re-opening from bell always lands on notifications
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

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
