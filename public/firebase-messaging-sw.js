// Firebase Messaging Service Worker — xử lý background push notification
// File này phải đặt tại /public/firebase-messaging-sw.js (Vite sẽ serve từ root)

importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCIiRP7-5-QL4auIpZvXHd14Oae6cQYu6Q',
  authDomain: 'knp-crm-17908.firebaseapp.com',
  projectId: 'knp-crm-17908',
  storageBucket: 'knp-crm-17908.firebasestorage.app',
  messagingSenderId: '1054095415072',
  appId: '1:1054095415072:web:7285742d406c6e82c22945',
});

const messaging = firebase.messaging();

// Hiển thị notification khi app đóng hoặc ở background
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'KNP CRM';
  const body  = payload.notification?.body  || 'Bạn có thông báo mới';

  self.registration.showNotification(title, {
    body,
    icon:  '/logo.png',
    badge: '/logo.png',
    data:  payload.data || {},
    requireInteraction: false,
    vibrate: [200, 100, 200],
  });
});

// Click vào notification → mở app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const appUrl = 'https://knp-crm.vercel.app';
      const existing = list.find(c => c.url.startsWith(appUrl));
      if (existing) return existing.focus();
      return clients.openWindow(appUrl);
    })
  );
});
