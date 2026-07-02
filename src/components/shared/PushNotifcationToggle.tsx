// src/components/shared/PushNotificationToggle.tsx
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export function PushNotificationToggle() {
  const {
    permission,
    isSubscribed,
    isLoading,
    error,
    isSupported,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-border p-4">
        <BellOff className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Push notifications unavailable</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your browser doesn't support push notifications. On iPhone, add
            FocusFlow to your Home Screen first.
          </p>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <BellOff className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">Notifications blocked</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            You've blocked notifications for this site. To enable them, go to
            your browser settings and allow notifications for this site.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
        <div className="flex items-start gap-3 min-w-0">
          {isSubscribed ? (
            <BellRing className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          ) : (
            <Bell className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {isSubscribed
                ? "Daily briefing enabled"
                : "Enable daily briefing"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isSubscribed
                ? "You'll get a morning nudge at 8am with your habits and AI Coach insights."
                : "Get a morning nudge at 8am with your habits, tasks, and AI Coach insights."}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant={isSubscribed ? "outline" : "default"}
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isLoading}
          className="shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSubscribed ? (
            "Turn off"
          ) : (
            "Turn on"
          )}
        </Button>
      </div>

      {error && <p className="text-xs text-destructive px-1">{error}</p>}

      {isSubscribed && (
        <p className="text-xs text-muted-foreground px-1">
          Notifications are sent at 8:00 AM in your local timezone.
        </p>
      )}
    </div>
  );
}
