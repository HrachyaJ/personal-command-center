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
      .then(async (clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            try {
              await client.focus();
              if ("navigate" in client) {
                await client.navigate(url);
              }
              return;
            } catch (err) {
              // focus/navigate can throw on some clients (e.g. mid-navigation
              // or non-navigable worker-controlled clients) — fall through
              // to opening a fresh window instead of failing silently.
              break;
            }
          }
        }
        if (clients.openWindow) return clients.openWindow(url);
      }),
  );
});
