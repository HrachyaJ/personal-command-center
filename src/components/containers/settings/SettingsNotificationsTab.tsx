import { useState } from "react";
import { Section } from "./SettingsSection";
import { Row } from "./SettingsRow";
import { Switch } from "../../ui/switch";
import { Separator } from "../../ui/separator";
import { toast } from "sonner";
import { translate } from "../../../lib/i18n";
import { useLocaleStore } from "../../../stores/useLocaleStore";

export function NotificationsTab() {
  const locale = useLocaleStore((s) => s.locale);
  const t = (key: string, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);

  const [prefs, setPrefs] = useState({
    taskReminders: true,
    habitReminders: true,
    goalMilestones: true,
    weeklyDigest: false,
    aiInsights: true,
  });

  const handleToggle = (key: keyof typeof prefs, featureKey: string) => {
    const next = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: next }));
    const feature = t(featureKey);
    toast.info(
      next
        ? t("settings.notifications.underDev", { feature })
        : t("settings.notifications.disabled", { feature }),
    );
  };

  return (
    <div className="space-y-6">
      <Section title={t("settings.notifications.remindersSection")}>
        <Row
          label={t("settings.notifications.taskReminders")}
          description={t("settings.notifications.taskRemindersDesc")}
        >
          <Switch
            checked={prefs.taskReminders}
            onCheckedChange={() =>
              handleToggle(
                "taskReminders",
                "settings.notifications.taskReminders",
              )
            }
          />
        </Row>
        <Row
          label={t("settings.notifications.habitReminders")}
          description={t("settings.notifications.habitRemindersDesc")}
        >
          <Switch
            checked={prefs.habitReminders}
            onCheckedChange={() =>
              handleToggle(
                "habitReminders",
                "settings.notifications.habitReminders",
              )
            }
          />
        </Row>
        <Row
          label={t("settings.notifications.goalMilestones")}
          description={t("settings.notifications.goalMilestonesDesc")}
        >
          <Switch
            checked={prefs.goalMilestones}
            onCheckedChange={() =>
              handleToggle(
                "goalMilestones",
                "settings.notifications.goalMilestones",
              )
            }
          />
        </Row>
      </Section>

      <Separator />

      <Section title={t("settings.notifications.reportsSection")}>
        <Row
          label={t("settings.notifications.weeklyDigest")}
          description={t("settings.notifications.weeklyDigestDesc")}
        >
          <Switch
            checked={prefs.weeklyDigest}
            onCheckedChange={() =>
              handleToggle(
                "weeklyDigest",
                "settings.notifications.weeklyDigest",
              )
            }
          />
        </Row>
        <Row
          label={t("settings.notifications.aiInsights")}
          description={t("settings.notifications.aiInsightsDesc")}
        >
          <Switch
            checked={prefs.aiInsights}
            onCheckedChange={() =>
              handleToggle("aiInsights", "settings.notifications.aiInsights")
            }
          />
        </Row>
      </Section>
    </div>
  );
}
