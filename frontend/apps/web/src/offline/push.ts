import { apiClient } from '@/auth/api';

export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeToPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const granted = await requestPushPermission();
  if (!granted) return;

  const registration = await navigator.serviceWorker.ready;

  const { data } = await apiClient.get<{ data: { publicKey: string } }>(
    '/notifications/push/vapid-public-key',
  );
  const applicationServerKey = urlBase64ToUint8Array(data.data.publicKey);

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  await apiClient.post('/notifications/push/subscribe', subscription.toJSON());
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  await apiClient.post('/notifications/push/unsubscribe', {
    endpoint: subscription.endpoint,
  });

  await subscription.unsubscribe();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
