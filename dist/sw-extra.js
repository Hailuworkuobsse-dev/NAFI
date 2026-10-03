// NAFI Service Worker extra — background sync + push notifications.
// Loaded via workbox.importScripts from vite-plugin-pwa.

self.addEventListener('sync', (event) => {
  if (event.tag !== 'nafi-mutation-queue') return;

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        client.postMessage({ type: 'nafi:sync-request' });
      });
    })(),
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'NAFI', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'NAFI', {
      body: payload.body ?? '',
      icon: '/pwa/icon-192.png',
      badge: '/pwa/icon-192.png',
      tag: payload.tag ?? 'nafi',
      data: { deepLink: payload.deepLink ?? '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const deepLink = event.notification.data?.deepLink ?? '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const client = clients.find((c) => c.url.includes(self.location.origin));
      if (client) {
        client.focus();
        client.postMessage({ type: 'nafi:navigate', deepLink });
      } else {
        self.clients.openWindow(deepLink);
      }
    }),
  );
});
