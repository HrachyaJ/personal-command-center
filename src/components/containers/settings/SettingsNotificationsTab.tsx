import { useState } from "react";
import { Section } from "./SettingsSection";
import { Row } from "./SettingsRow";
import { Switch } from "../../ui/switch";
import { Separator } from "../../ui/separator";
import { toast } from "sonner";

export function NotificationsTab() {
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
            onCheckedChange={() => {
              setPrefs((p) => ({ ...p, taskReminders: !p.taskReminders }));
              toast.info(
                !prefs.taskReminders
                  ? "Task reminders — this feature is under development."
                  : "Task reminders disabled.",
              );
            }}
          />
        </Row>
        <Row
          label="Habit reminders"
          description="Daily nudge to complete your habits"
        >
          <Switch
            checked={prefs.habitReminders}
            onCheckedChange={() => {
              setPrefs((p) => ({ ...p, habitReminders: !p.habitReminders }));
              toast.info(
                !prefs.habitReminders
                  ? "Habit reminders — this feature is under development."
                  : "Habit reminders disabled.",
              );
            }}
          />
        </Row>
        <Row
          label="Goal milestones"
          description="Celebrate when you hit a milestone"
        >
          <Switch
            checked={prefs.goalMilestones}
            onCheckedChange={() => {
              setPrefs((p) => ({ ...p, goalMilestones: !p.goalMilestones }));
              toast.info(
                !prefs.goalMilestones
                  ? "Goal reminders — this feature is under development."
                  : "Goal reminders disabled.",
              );
            }}
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
            onCheckedChange={() => {
              setPrefs((p) => ({ ...p, weeklyDigest: !p.weeklyDigest }));
              toast.info(
                !prefs.weeklyDigest
                  ? "Weekly digest — this feature is under development."
                  : "Weekly digest disabled.",
              );
            }}
          />
        </Row>
        <Row
          label="AI Coach insights"
          description="Personalized tips from your AI Coach"
        >
          <Switch
            checked={prefs.aiInsights}
            onCheckedChange={() => {
              setPrefs((p) => ({ ...p, aiInsights: !p.aiInsights }));
              toast.info(
                !prefs.aiInsights
                  ? "AI Coach insights — this feature is under development."
                  : "AI Coach insights disabled.",
              );
            }}
          />
        </Row>
      </Section>
    </div>
  );
}
