import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
  console.log('Push received');

  let data = {
    title: 'Notification',
    body: 'Default message',
    icon: '/icons/icon-192.png',
  };

  if (event.data) {
    try {
      // Try JSON first
      data = event.data.json();
    } catch (e) {
      // Fallback for plain text (like DevTools push)
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: '/icons/icon-192.png',
    })
  );
});