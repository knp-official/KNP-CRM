import { getToken } from 'firebase/messaging';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { messaging, db } from '../firebase';

// ─── Setup hướng dẫn ────────────────────────────────────────────────────────
//
// Bước 1 — Lấy VAPID key:
//   Firebase Console → Project Settings → Cloud Messaging
//   → Web Push certificates → Generate key pair
//   → Copy "Key pair" → dán vào VITE_FCM_VAPID_KEY trong .env.local
//
// Bước 2 — Lấy Server Key:
//   Firebase Console → Project Settings → Cloud Messaging
//   → Cloud Messaging API (Legacy) → Enable → Copy Server Key
//   → dán vào VITE_FCM_SERVER_KEY trong .env.local
//
// File .env.local (KHÔNG commit file này):
//   VITE_FCM_VAPID_KEY=BxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxA
//   VITE_FCM_SERVER_KEY=AAAAxxxxxx:APA91bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//
// Vercel: thêm 2 biến này vào Project Settings → Environment Variables
//
// LƯU Ý: VITE_ prefix nghĩa là key được bundle vào client JS.
// Đây là chấp nhận được cho internal CRM. Nếu cần bảo mật cao hơn,
// chuyển sendFCMPush sang Vercel API Route (/api/send-fcm.js).
// ────────────────────────────────────────────────────────────────────────────

const VAPID_KEY  = import.meta.env.VITE_FCM_VAPID_KEY  || '';
const SERVER_KEY = import.meta.env.VITE_FCM_SERVER_KEY || '';

// Xin quyền + lấy token + lưu vào Firestore users/{uid}
export async function initFCMForUser(uid) {
  if (!uid) return;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  if (!messaging) {
    console.warn('[FCM] messaging chưa được khởi tạo');
    return;
  }
  if (!VAPID_KEY) {
    console.warn('[FCM] VITE_FCM_VAPID_KEY chưa được cấu hình trong .env.local');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('[FCM] Người dùng từ chối quyền thông báo');
      return;
    }

    const swReg  = await navigator.serviceWorker.ready;
    const token  = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });

    if (token) {
      await updateDoc(doc(db, 'users', uid), { fcmToken: token });
      console.log('[FCM] Token đã lưu cho uid:', uid);
    }
  } catch (e) {
    console.warn('[FCM] initFCMForUser lỗi (không ảnh hưởng app):', e.message);
  }
}

// Gửi push notification đến một user theo uid
// Đọc fcmToken từ Firestore, gọi FCM Legacy HTTP API
export async function sendFCMToUser(targetUid, { title, body, data = {} }) {
  if (!SERVER_KEY) {
    console.warn('[FCM] VITE_FCM_SERVER_KEY chưa được cấu hình — push bị bỏ qua');
    return;
  }
  if (!targetUid) return;

  try {
    const userSnap = await getDoc(doc(db, 'users', targetUid));
    const fcmToken = userSnap.data()?.fcmToken;

    if (!fcmToken) {
      console.info('[FCM] User', targetUid, 'chưa có FCM token (chưa bật thông báo)');
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
        notification: {
          title,
          body,
          icon:         '/logo.png',
          click_action: 'https://knp-crm.vercel.app',
        },
        data,
        priority: 'high',
      }),
    });

    const result = await res.json();
    if (result.failure > 0) {
      console.warn('[FCM] Push thất bại:', result.results);
      // Token không hợp lệ → xoá khỏi Firestore để không gửi lại
      if (result.results?.[0]?.error === 'NotRegistered') {
        await updateDoc(doc(db, 'users', targetUid), { fcmToken: null });
      }
    } else {
      console.log('[FCM] Push thành công đến uid:', targetUid);
    }
  } catch (e) {
    console.warn('[FCM] sendFCMToUser lỗi (không ảnh hưởng app):', e.message);
  }
}
