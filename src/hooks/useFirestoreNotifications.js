import { useState, useEffect, useMemo } from 'react';
import {
  collection, query, where,
  onSnapshot, updateDoc, doc, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

const TYPE_STYLE = {
  new_task:       { color: '#2563EB', bgColor: '#EFF6FF', borderColor: '#BFDBFE', icon: '📌', sortKey: 2 },
  task_updated:   { color: '#D97706', bgColor: '#FFFBEB', borderColor: '#FDE68A', icon: '✏️', sortKey: 3 },
  task_completed: { color: '#059669', bgColor: '#ECFDF5', borderColor: '#A7F3D0', icon: '✅', sortKey: 4 },
};

export function useFirestoreNotifications(userId) {
  const [raw, setRaw] = useState([]);

  useEffect(() => {
    if (!userId) { setRaw([]); return; }
    // Chỉ dùng where đơn — không orderBy để tránh yêu cầu composite index Firestore
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
    );
    const unsub = onSnapshot(q, snap => {
      setRaw(snap.docs.map(d => ({ _fsId: d.id, ...d.data() })));
    }, err => {
      // Index chưa tạo thì bỏ qua lỗi, không crash app
      console.warn('[KNP Notifications] Firestore query lỗi:', err.message);
    });
    return unsub;
  }, [userId]);

  const notifications = useMemo(() => [...raw]
    .sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta; // mới nhất trước
    })
    .slice(0, 30)
    .map(n => {
    const style = TYPE_STYLE[n.type] || TYPE_STYLE.new_task;
    return {
      id: `fs_${n._fsId}`,
      _fsId: n._fsId,
      _read: !!n.read,
      type: n.type,
      sortKey: style.sortKey,
      color: style.color,
      bgColor: style.bgColor,
      borderColor: style.borderColor,
      icon: style.icon,
      title: n.title || '',
      message: n.message || '',
      sub: n.sub || '',
      page: 'tasks',
    };
  }), [raw]);

  const readIds = useMemo(() => notifications.filter(n => n._read).map(n => n.id), [notifications]);
  const unreadCount = useMemo(() => notifications.filter(n => !n._read).length, [notifications]);

  async function markRead(id) {
    const n = notifications.find(x => x.id === id);
    if (!n || n._read) return;
    try {
      await updateDoc(doc(db, 'notifications', n._fsId), { read: true });
    } catch (e) {
      console.error('[KNP Notifications] markRead lỗi:', e);
    }
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n._read);
    if (!unread.length) return;
    const batch = writeBatch(db);
    unread.forEach(n => batch.update(doc(db, 'notifications', n._fsId), { read: true }));
    try {
      await batch.commit();
    } catch (e) {
      console.error('[KNP Notifications] markAllRead lỗi:', e);
    }
  }

  return { notifications, readIds, unreadCount, markRead, markAllRead };
}
