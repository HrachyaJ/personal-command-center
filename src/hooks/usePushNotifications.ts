// src/hooks/usePushNotifications.ts
import { useState, useEffect } from "react";
import { API_BASE, authFetch } from "../lib/utils";

// const VAPID_PUBLIC_KEY = import.meta.env.VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
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

  // On mount: check current permission + subscription status
  useEffect(() => {
    if (!isSupported) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermission);

    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    });
  }, [isSupported]);

  const subscribe = async () => {
    if (!isSupported) return;

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;
    if (!vapidKey) {
      setError("Push notifications not configured.");
      return;
    }

    console.log(import.meta.env.VITE_VAPID_PUBLIC_KEY);

    setIsLoading(true);
    setError(null);

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const result = await Notification.requestPermission();
      setPermission(result as PushPermission);
      if (result !== "granted") {
        setError("Notification permission denied.");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapidKey,
        ) as unknown as ArrayBuffer,
      });

      // 4. Send subscription to backend
      const res = await authFetch(`${API_BASE}/api/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
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
