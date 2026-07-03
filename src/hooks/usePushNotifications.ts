// src/hooks/usePushNotifications.ts
import { useState, useEffect } from "react";
import { API_BASE, authFetch } from "../lib/utils";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray.buffer;
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSupported =
    mounted && "serviceWorker" in navigator && "PushManager" in window;

  // On mount: check current permission + subscription status, and
  // reconcile the browser's local subscription against what the server
  // actually has on file. A local subscription can outlive the server-side
  // row (e.g. the server deleted it after a 410 Gone), which would
  // otherwise show as silently "subscribed" while nothing ever arrives.
  useEffect(() => {
    if (!isSupported) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermission);

    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const localSub = await reg.pushManager.getSubscription();

        if (!localSub) {
          setIsSubscribed(false);
          return;
        }

        const res = await authFetch(`${API_BASE}/api/push/status`);
        if (!res.ok) {
          // Can't confirm server state — trust the local subscription
          // rather than false-negative the toggle.
          setIsSubscribed(true);
          return;
        }

        const { endpoints } = (await res.json()) as { endpoints: string[] };
        const serverKnowsThisDevice = endpoints.includes(localSub.endpoint);

        if (!serverKnowsThisDevice) {
          // Server has no record of this endpoint — the local subscription
          // is stale. Clean it up so the toggle reflects reality.
          await localSub.unsubscribe();
          setIsSubscribed(false);
        } else {
          setIsSubscribed(true);
        }
      } catch {
        // Non-fatal — leave permission/subscribed state as last known.
      }
    })();
  }, [isSupported]);

  const subscribe = async () => {
    if (!isSupported) return;

    if (Notification.permission === "denied") {
      setError(
        "Notifications are blocked for this site. Enable them in your browser settings, then try again.",
      );
      return;
    }

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;
    if (!vapidKey) {
      setError("Push notifications not configured.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const result = await Notification.requestPermission();
      setPermission(result as PushPermission);
      if (result !== "granted") {
        setError(
          result === "denied"
            ? "Notifications are blocked for this site. Enable them in your browser settings, then try again."
            : "Notification permission was not granted.",
        );
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Send subscription to backend, including the browser's timezone so
      // the daily briefing arrives at a sensible local hour instead of a
      // fixed server time.
      let timezone = "UTC";
      try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        // keep UTC fallback
      }

      const res = await authFetch(`${API_BASE}/api/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sub.toJSON(), timezone }),
      });

      if (!res.ok) throw new Error("Failed to save subscription on server");
      setIsSubscribed(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to enable notifications",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await authFetch(`${API_BASE}/api/push/unsubscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setIsSubscribed(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to disable notifications",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    permission,
    isSubscribed,
    isLoading,
    error,
    isSupported,
    subscribe,
    unsubscribe,
  };
}
