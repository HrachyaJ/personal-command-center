// public/sw.js
// Service worker — receives push events and shows notifications

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "FocusFlow", body: event.data.text() };
  }

  const { title = "FocusFlow", body = "", url = "/dashboard" } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/favicon-96x96.png",
      badge: "/favicon-96x96.png",
      data: { url },
      vibrate: [100, 50, 100],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) return clients.openWindow(url);
      }),
  );
});
