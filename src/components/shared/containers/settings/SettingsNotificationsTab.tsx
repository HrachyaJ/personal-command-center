import { useState } from "react";
import { Section } from "./SettingsSection";
import { Row } from "./SettingsRow";
import { Switch } from "../../../ui/switch";
import { Separator } from "../../../ui/separator";

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
