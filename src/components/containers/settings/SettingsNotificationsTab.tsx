import { useEffect, useState } from "react";
import { Section } from "./SettingsSection";
import { Row } from "./SettingsRow";
import { Switch } from "../../ui/switch";
import { Separator } from "../../ui/separator";
import { toast } from "sonner";
import { API_BASE, authFetch } from "../../../lib/utils";
import { useTranslation } from "../../../hooks/useTranslation";
import { PushNotificationToggle } from "../../shared/PushNotifcationToggle";

const PREFS_ENDPOINT = `${API_BASE}/api/notifications/preferences`;

type NotificationPrefs = {
  timezone: string;
  goalsReminderHour: number;
  habitsReminderHour: number;
  taskDefaultLeadMinutes: number;
  taskRemindersEnabled: boolean;
  habitRemindersEnabled: boolean;
  goalRemindersEnabled: boolean;
  weeklyDigestEnabled: boolean;
};

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => h);
const LEAD_MINUTE_OPTIONS = [15, 30, 60, 120, 1440]; // 15m, 30m, 1h, 2h, 1 day

function formatHour(h: number) {
  const period = h < 12 ? "AM" : "PM";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${period}`;
}

function formatLeadMinutes(m: number) {
  if (m < 60) return `${m} min before`;
  if (m < 1440) return `${m / 60} hr before`;
  return `${m / 1440} day before`;
}

async function fetchPrefs(): Promise<NotificationPrefs> {
  const res = await authFetch(PREFS_ENDPOINT);
  if (!res.ok) throw new Error("Failed to load notification preferences");
  return res.json();
}

async function patchPrefs(updates: Partial<NotificationPrefs>): Promise<void> {
  const res = await authFetch(PREFS_ENDPOINT, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update notification preferences");
}

// ── Skeleton ───────────────────────────────────────────────────────────────
// Mirrors the real layout (toggle rows + a couple of indented sub-rows) so
// there's no content jump once the fetch resolves. Swap the divs below for
// your shadcn <Skeleton /> primitive if you have one — kept as plain
// divs + animate-pulse here so this works with zero extra imports.

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function SkeletonRow({ indented = false }: { indented?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 sm:gap-4 ${
        indented ? "pl-4 sm:pl-6 border-l-2 border-muted ml-1" : ""
      }`}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-3 w-48" />
      </div>
      <SkeletonBlock className="h-5 w-9 shrink-0 rounded-full" />
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div>
        <SkeletonBlock className="h-3 w-32 mb-3" />
        <SkeletonRow />
      </div>

      <Separator />

      <div>
        <SkeletonBlock className="h-3 w-24 mb-3" />
        <div className="space-y-4">
          <SkeletonRow />
          <SkeletonRow indented />
          <SkeletonRow />
          <SkeletonRow indented />
          <SkeletonRow />
          <SkeletonRow indented />
        </div>
      </div>

      <Separator />

      <div>
        <SkeletonBlock className="h-3 w-20 mb-3" />
        <SkeletonRow />
      </div>
    </div>
  );
}

// Indentation wrapper for a setting that only applies when its parent
// toggle is on (e.g. "Lead time" under "Task reminders") — the left border
// + indent visually ties it to the row above instead of reading as a
// sibling setting of equal weight.
function SubRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="pl-4 sm:pl-6 border-l-2 border-muted ml-1">{children}</div>
  );
}

export function NotificationsTab() {
  const { t } = useTranslation();

  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Set<keyof NotificationPrefs>>(
    new Set(),
  );

  useEffect(() => {
    let cancelled = false;
    fetchPrefs()
      .then((remote) => {
        if (!cancelled) setPrefs(remote);
      })
      .catch(() => {
        if (!cancelled) toast.error(t("settings.notifications.loadFailed"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updatePref = async <K extends keyof NotificationPrefs>(
    key: K,
    value: NotificationPrefs[K],
    featureKey: string,
  ) => {
    if (!prefs) return;
    const previous = prefs[key];

    // optimistic update
    setPrefs((p) => (p ? { ...p, [key]: value } : p));
    setPending((p) => new Set(p).add(key));

    const feature = t(featureKey);
    try {
      await patchPrefs({ [key]: value });
      toast.success(t("settings.notifications.updated", { feature }));
    } catch {
      setPrefs((p) => (p ? { ...p, [key]: previous } : p));
      toast.error(t("settings.notifications.updateFailed", { feature }));
    } finally {
      setPending((p) => {
        const next = new Set(p);
        next.delete(key);
        return next;
      });
    }
  };

  if (loading) return <NotificationsSkeleton />;

  const disabled = !prefs;

  return (
    <div className="space-y-6">
      {/* ── Push device opt-in ──────────────────────────────────────────── */}
      <Section title="Push Notifications">
        <PushNotificationToggle />
      </Section>

      <Separator />

      <Section title={t("settings.notifications.remindersSection")}>
        <Row
          label={t("settings.notifications.taskReminders")}
          description={t("settings.notifications.taskRemindersDesc")}
        >
          <Switch
            checked={!!prefs?.taskRemindersEnabled}
            disabled={disabled || pending.has("taskRemindersEnabled")}
            onCheckedChange={(checked) =>
              updatePref(
                "taskRemindersEnabled",
                checked,
                "settings.notifications.taskReminders",
              )
            }
          />
        </Row>
        {prefs?.taskRemindersEnabled && (
          <SubRow>
            <Row
              label={t("settings.notifications.taskLeadTime")}
              description={t("settings.notifications.taskLeadTimeDesc")}
            >
              <select
                className="rounded-md border bg-background px-2 py-1 text-sm"
                value={prefs.taskDefaultLeadMinutes}
                disabled={pending.has("taskDefaultLeadMinutes")}
                onChange={(e) =>
                  updatePref(
                    "taskDefaultLeadMinutes",
                    Number(e.target.value),
                    "settings.notifications.taskLeadTime",
                  )
                }
              >
                {LEAD_MINUTE_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {formatLeadMinutes(m)}
                  </option>
                ))}
              </select>
            </Row>
          </SubRow>
        )}

        <Row
          label={t("settings.notifications.habitReminders")}
          description={t("settings.notifications.habitRemindersDesc")}
        >
          <Switch
            checked={!!prefs?.habitRemindersEnabled}
            disabled={disabled || pending.has("habitRemindersEnabled")}
            onCheckedChange={(checked) =>
              updatePref(
                "habitRemindersEnabled",
                checked,
                "settings.notifications.habitReminders",
              )
            }
          />
        </Row>
        {prefs?.habitRemindersEnabled && (
          <SubRow>
            <Row
              label={t("settings.notifications.habitReminderHour")}
              description={t("settings.notifications.habitReminderHourDesc")}
            >
              <select
                className="rounded-md border bg-background px-2 py-1 text-sm"
                value={prefs.habitsReminderHour}
                disabled={pending.has("habitsReminderHour")}
                onChange={(e) =>
                  updatePref(
                    "habitsReminderHour",
                    Number(e.target.value),
                    "settings.notifications.habitReminderHour",
                  )
                }
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            </Row>
          </SubRow>
        )}

        <Row
          label={t("settings.notifications.goalReminders")}
          description={t("settings.notifications.goalRemindersDesc")}
        >
          <Switch
            checked={!!prefs?.goalRemindersEnabled}
            disabled={disabled || pending.has("goalRemindersEnabled")}
            onCheckedChange={(checked) =>
              updatePref(
                "goalRemindersEnabled",
                checked,
                "settings.notifications.goalReminders",
              )
            }
          />
        </Row>
        {prefs?.goalRemindersEnabled && (
          <SubRow>
            <Row
              label={t("settings.notifications.goalReminderHour")}
              description={t("settings.notifications.goalReminderHourDesc")}
            >
              <select
                className="rounded-md border bg-background px-2 py-1 text-sm"
                value={prefs.goalsReminderHour}
                disabled={pending.has("goalsReminderHour")}
                onChange={(e) =>
                  updatePref(
                    "goalsReminderHour",
                    Number(e.target.value),
                    "settings.notifications.goalReminderHour",
                  )
                }
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            </Row>
          </SubRow>
        )}
      </Section>

      <Separator />

      <Section title={t("settings.notifications.reportsSection")}>
        <Row
          label={t("settings.notifications.weeklyDigest")}
          description={t("settings.notifications.weeklyDigestDesc")}
        >
          <Switch
            checked={!!prefs?.weeklyDigestEnabled}
            disabled={disabled || pending.has("weeklyDigestEnabled")}
            onCheckedChange={(checked) =>
              updatePref(
                "weeklyDigestEnabled",
                checked,
                "settings.notifications.weeklyDigest",
              )
            }
          />
        </Row>
      </Section>
    </div>
  );
}
