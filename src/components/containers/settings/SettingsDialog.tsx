import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Sun, User, Lock, Bell } from "lucide-react";
import { NavItem } from "./SettingsNavItem";
import { AppearanceTab, type Tab } from "./SettingsAppearanceTab";
import { AccountTab } from "./SettingsAccountTab";
import { NotificationsTab } from "./SettingsNotificationsTab";
import { PrivacyTab } from "./SettingsPrivacyTab";
import { useTranslation } from "../../../hooks/useTranslation";

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
  const { t } = useTranslation();

  // reset tab when dialog opens so re-opening from bell always lands on notifications
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: "appearance", icon: Sun, label: t("settings.appearance") },
    { id: "account", icon: User, label: t("settings.account") },
    { id: "notifications", icon: Bell, label: t("settings.notifications") },
    { id: "privacy", icon: Lock, label: t("settings.privacy") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-5xl p-0 gap-0 overflow-hidden rounded-xl">
        <div className="flex flex-col sm:flex-row h-[80vh] sm:h-130">
          {/* Sidebar / mobile tab row */}
          <div className="w-full sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r bg-muted p-3 flex flex-row sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible">
            <DialogHeader className="hidden sm:block px-1 pb-3">
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0">
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
