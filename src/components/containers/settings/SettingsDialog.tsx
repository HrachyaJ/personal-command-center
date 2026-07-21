import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Sun, User, Lock, Bell, MessageCircle, X } from "lucide-react";
import { NavItem } from "./SettingsNavItem";
import { AppearanceTab, type Tab } from "./SettingsAppearanceTab";
import { AccountTab } from "./SettingsAccountTab";
import { NotificationsTab } from "./SettingsNotificationsTab";
import { PrivacyTab } from "./SettingsPrivacyTab";
import { FeedbackTab } from "./SettingsFeedbackTab";
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

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: "appearance", icon: Sun, label: t("settings.appearance") },
    { id: "account", icon: User, label: t("settings.account") },
    { id: "notifications", icon: Bell, label: t("settings.notifications") },
    { id: "privacy", icon: Lock, label: t("settings.privacy") },
    { id: "feedback", icon: MessageCircle, label: t("settings.feedback") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-5xl p-0 gap-0 rounded-2xl overflow-hidden [&>button:last-child]:hidden sm:[&>button:last-child]:flex">
        <DialogTitle className="sr-only">Settings</DialogTitle>

        <div className="flex flex-col sm:flex-row h-[85vh] sm:h-130 overflow-hidden">
          {/* Mobile-only header with close button */}
          <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b bg-muted shrink-0">
            <span className="text-sm font-semibold">Settings</span>
            <button
              onClick={() => onOpenChange(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted-foreground/10 text-muted-foreground transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Nav: horizontal scrollable pills on mobile, vertical sidebar on desktop */}
          <div className="shrink-0 bg-muted border-b sm:border-b-0 sm:border-r sm:w-48 flex flex-row sm:flex-col gap-1 p-2 sm:p-3 overflow-x-auto sm:overflow-visible">
            <div className="hidden sm:block px-1 pb-3 pt-1">
              <p className="text-sm font-semibold">Settings</p>
            </div>
            {tabs.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={tab === item.id}
                onClick={() => setTab(item.id)}
              />
            ))}
          </div>

          {/* Content — min-w-0 lets it shrink, overflow-x-hidden clips anything wider */}
          <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            {tab === "appearance" && <AppearanceTab />}
            {tab === "account" && <AccountTab />}
            {tab === "notifications" && <NotificationsTab />}
            {tab === "privacy" && <PrivacyTab />}
            {tab === "feedback" && <FeedbackTab />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
