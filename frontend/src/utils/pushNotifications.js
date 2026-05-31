const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

console.log('VAPID KEY LOADED:', VAPID_PUBLIC_KEY);

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeUserToPush() {
  console.log('1. subscribeUserToPush called');

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return;
  }
  console.log('2. serviceWorker and PushManager supported');

  const token = localStorage.getItem('token');
  console.log('3. token:', token ? 'found' : 'MISSING');

  try {
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
    }
    console.log('4. service worker ready:', registration);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const subJson = subscription.toJSON();
    console.log('5. subscription JSON:', JSON.stringify(subJson));

    const res = await fetch(`${API_URL}/notifications/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        subscription: subJson,
      }),
    });

    console.log('6. fetch response status:', res.status);

    if (res.ok) {
      console.log('Push subscription successful!');
      return true;
    } else {
      const text = await res.text();
      console.error('Server error:', text);
      return false;
    }

  } catch (err) {
    console.error('ERROR in subscribeUserToPush:', err);
    return false;
  }
}

export async function unsubscribeUserFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    console.log('Unsubscribed from push notifications');
  }
}