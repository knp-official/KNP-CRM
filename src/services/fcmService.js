import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const VAPID_KEY    = import.meta.env.VITE_VAPID_KEY    || import.meta.env.VITE_FCM_VAPID_KEY  || '';
const SERVER_KEY   = import.meta.env.VITE_FCM_SERVER_KEY || '';

// Xin quyền, lấy FCM token, lưu vào Firestore fcm_tokens/{userId} và users/{userId}
export async function requestNotificationPermission(userId) {
  if (!userId) return null;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;
  if (!VAPID_KEY) {
    console.warn('[FCM] Chưa có VITE_VAPID_KEY trong .env.local');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('[FCM] Người dùng từ chối quyền thông báo');
      return null;
    }

    const swReg   = await navigator.serviceWorker.ready;
    const msg     = getMessaging();
    const token   = await getToken(msg, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });

    if (token) {
      // Lưu vào fcm_tokens/{userId} (collection riêng, dễ query)
      await setDoc(doc(db, 'fcm_tokens', userId), {
        token,
        userId,
        updatedAt: serverTimestamp(),
        userAgent: navigator.userAgent,
      });
      // Cập nhật thêm vào users/{userId} để tương thích code cũ
      try {
        await updateDoc(doc(db, 'users', userId), { fcmToken: token });
      } catch (_) {}
      console.log('[FCM] Token đã lưu cho uid:', userId);
    }
    return token;
  } catch (e) {
    console.warn('[FCM] requestNotificationPermission lỗi (không ảnh hưởng app):', e.message);
    return null;
  }
}

// Lắng nghe thông báo khi app đang mở (foreground)
export function onForegroundMessage(callback) {
  try {
    const msg = getMessaging();
    return onMessage(msg, callback);
  } catch (e) {
    console.warn('[FCM] onForegroundMessage không khả dụng:', e.message);
    return () => {};
  }
}

// Gửi push notification đến một user theo uid (dùng FCM Legacy HTTP API với Server Key)
export async function sendFCMToUser(targetUid, { title, body, data = {} }) {
  if (!SERVER_KEY) {
    console.warn('[FCM] VITE_FCM_SERVER_KEY chưa cấu hình — push bị bỏ qua');
    return;
  }
  if (!targetUid) return;

  try {
    // Ưu tiên đọc từ fcm_tokens, fallback sang users
    let fcmToken = null;
    const tokenSnap = await getDoc(doc(db, 'fcm_tokens', targetUid));
    if (tokenSnap.exists()) {
      fcmToken = tokenSnap.data()?.token;
    } else {
      const userSnap = await getDoc(doc(db, 'users', targetUid));
      fcmToken = userSnap.data()?.fcmToken;
    }

    if (!fcmToken) {
      console.info('[FCM] User', targetUid, 'chưa có FCM token');
      return;
    }

    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: { title, body, icon: '/logo192.png', click_action: 'https://knp-crm.vercel.app' },
        data,
        priority: 'high',
      }),
    });

    const result = await res.json();
    if (result.failure > 0) {
      console.warn('[FCM] Push thất bại:', result.results);
      if (result.results?.[0]?.error === 'NotRegistered') {
        // Token hết hạn → xóa
        await setDoc(doc(db, 'fcm_tokens', targetUid), { token: null, userId: targetUid, updatedAt: serverTimestamp() });
        try { await updateDoc(doc(db, 'users', targetUid), { fcmToken: null }); } catch (_) {}
      }
    } else {
      console.log('[FCM] Push thành công đến uid:', targetUid);
    }
  } catch (e) {
    console.warn('[FCM] sendFCMToUser lỗi (không ảnh hưởng app):', e.message);
  }
}

// Alias cũ — giữ để tương thích
export const initFCMForUser = requestNotificationPermission;
