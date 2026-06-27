import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { sendFCMToUser } from './fcmService';

// ─── Kênh 1: Firestore in-app notification ───────────────────────────────────

export async function createTaskNotification({ userId, title, message, sub = '', type, taskId }) {
  if (!userId) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      sub,
      type,
      taskId,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('[KNP Notification] Tạo thông báo thất bại:', e);
  }
}

// ─── Kênh 2: Zalo ZNS (Zalo Notification Service) ────────────────────────────
//
// Cách setup:
// 1. Đăng ký Zalo OA tại: https://oa.zalo.me
// 2. Tạo ZNS template tại: https://business.zalo.me → Zalo ZNS → Templates
// 3. Lấy OA Access Token tại: https://developers.zalo.me → Official Account
// 4. Điền vào 2 biến bên dưới:

const ZALO_OA_TOKEN    = '';  // TODO: Điền OA Access Token của Zalo OA
const ZALO_TEMPLATE_ID = '';  // TODO: Điền Template ID ZNS đã được duyệt

export async function sendZaloNotification(phone, taskTitle, deadline) {
  if (!ZALO_OA_TOKEN || !ZALO_TEMPLATE_ID) {
    console.warn('[Zalo ZNS] Chưa cấu hình — điền ZALO_OA_TOKEN và ZALO_TEMPLATE_ID trong notificationService.js');
    return;
  }

  const normalizedPhone = phone.startsWith('+84')
    ? phone.slice(1)
    : phone.startsWith('0')
    ? '84' + phone.slice(1)
    : phone;

  const deadlineStr = deadline
    ? new Date(deadline).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'Không có';

  try {
    const res = await fetch('https://business.openapi.zalo.me/message/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'access_token': ZALO_OA_TOKEN },
      body: JSON.stringify({
        phone: normalizedPhone,
        template_id: ZALO_TEMPLATE_ID,
        template_data: { task_name: taskTitle, deadline: deadlineStr },
        tracking_id: `knp_${Date.now()}`,
      }),
    });
    const data = await res.json();
    if (data.error !== 0) {
      console.warn('[Zalo ZNS] API trả lỗi:', data);
    } else {
      console.log('[Zalo ZNS] Gửi thành công đến', normalizedPhone);
    }
  } catch (e) {
    console.error('[Zalo ZNS] Gửi thất bại:', e);
  }
}

// ─── Kênh 3: Giao việc → Firestore + FCM push ────────────────────────────────

export async function sendTaskNotification({ taskId, taskTitle, assigneeId, assigneeName, assignedByName }) {
  if (!assigneeId) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      type: 'new_task',
      title: 'Bạn có công việc mới',
      message: taskTitle,
      body: `${assignedByName || 'Quản lý'} đã giao: "${taskTitle}"`,
      sub: `Người giao: ${assignedByName || 'Quản lý'}`,
      taskId,
      userId: assigneeId,
      recipientId: assigneeId,
      read: false,
      createdAt: serverTimestamp(),
    });

    await sendFCMToUser(assigneeId, {
      title: 'Bạn có công việc mới',
      body: `${assignedByName || 'Quản lý'} đã giao: "${taskTitle}"`,
      data: { taskId, type: 'new_task' },
    });

    console.log(`[KNP] Notification gửi đến ${assigneeName} cho task: ${taskTitle}`);
  } catch (err) {
    console.error('[KNP] sendTaskNotification lỗi:', err);
  }
}
