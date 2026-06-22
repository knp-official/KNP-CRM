import { useState, useMemo } from 'react';

export function useNotifications({ tasks, employees, customers, myEmployeeId, role, userId }) {
  const storageKey = `knp_notif_read_${userId || 'anon'}`;

  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });

  const save = (ids) => {
    setReadIds(ids);
    try { localStorage.setItem(storageKey, JSON.stringify(ids)); } catch {}
  };

  const notifications = useMemo(() => {
    const now = new Date();
    const todaySlice = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayStr = now.toISOString().split('T')[0];
    const result = [];
    // Track which taskIds already have a high-priority notification
    const taskHandled = new Set();

    const relevantTasks = (role === 'employee' && myEmployeeId)
      ? tasks.filter(t => t.nhan_vien_id === myEmployeeId)
      : tasks;

    // Pass 1: overdue + deadline_soon (highest priority per task)
    relevantTasks.forEach(task => {
      if (task.trang_thai === 'Hoàn thành') return;
      const dl = task.deadline ? new Date(task.deadline) : null;
      if (!dl || isNaN(dl)) return;
      const emp = employees.find(e => e.id === task.nhan_vien_id);
      const msLeft = dl - now;
      const hoursLeft = msLeft / 3600000;

      if (msLeft < 0) {
        taskHandled.add(task.id);
        result.push({
          id: `overdue_${task.id}`,
          type: 'overdue',
          sortKey: 0,
          color: '#DC2626',
          bgColor: '#FEF2F2',
          borderColor: '#FECACA',
          icon: '⚠️',
          title: 'Công việc quá hạn',
          message: task.tieu_de,
          sub: emp?.ho_ten ? `Người phụ trách: ${emp.ho_ten}` : '',
          page: 'tasks',
        });
      } else if (hoursLeft < 2) {
        taskHandled.add(task.id);
        const minsLeft = Math.max(1, Math.round(hoursLeft * 60));
        result.push({
          id: `soon_${task.id}`,
          type: 'deadline_soon',
          sortKey: 1,
          color: '#D97706',
          bgColor: '#FFFBEB',
          borderColor: '#FDE68A',
          icon: '⏰',
          title: 'Sắp hết hạn',
          message: task.tieu_de,
          sub: `Còn ${minsLeft} phút`,
          page: 'tasks',
        });
      }
    });

    // Pass 2: new task assigned to me (< 48h), not already handled
    if (myEmployeeId) {
      relevantTasks.forEach(task => {
        if (taskHandled.has(task.id)) return;
        if (task.trang_thai === 'Hoàn thành') return;
        if (task.nhan_vien_id !== myEmployeeId) return;
        if (!task.ngay_tao) return;
        const created = new Date(task.ngay_tao);
        if (isNaN(created)) return;
        const hoursAgo = (now - created) / 3600000;
        if (hoursAgo < 48) {
          taskHandled.add(task.id);
          result.push({
            id: `new_${task.id}`,
            type: 'new_task',
            sortKey: 2,
            color: '#2563EB',
            bgColor: '#EFF6FF',
            borderColor: '#BFDBFE',
            icon: '📌',
            title: 'Công việc mới được giao',
            message: task.tieu_de,
            sub: 'Vừa được giao cho bạn',
            page: 'tasks',
          });
        }
      });
    }

    // Pass 3: stale — Chưa làm > 24h, not already handled
    relevantTasks.forEach(task => {
      if (taskHandled.has(task.id)) return;
      if (task.trang_thai !== 'Chưa làm') return;
      if (!task.ngay_tao) return;
      const created = new Date(task.ngay_tao);
      if (isNaN(created)) return;
      const hoursAgo = (now - created) / 3600000;
      if (hoursAgo > 24) {
        const emp = employees.find(e => e.id === task.nhan_vien_id);
        taskHandled.add(task.id);
        result.push({
          id: `stale_${task.id}`,
          type: 'stale',
          sortKey: 3,
          color: '#92400E',
          bgColor: '#FFFBEB',
          borderColor: '#FDE68A',
          icon: '📋',
          title: 'Chưa bắt đầu',
          message: task.tieu_de,
          sub: emp?.ho_ten
            ? `${emp.ho_ten} · ${Math.round(hoursAgo / 24)} ngày chưa thực hiện`
            : `${Math.round(hoursAgo / 24)} ngày chưa thực hiện`,
          page: 'tasks',
        });
      }
    });

    // Pass 4: birthdays today
    employees.forEach(emp => {
      if (!emp.ngay_sinh || emp.trang_thai === 'Đã nghỉ việc') return;
      if (emp.ngay_sinh.slice(5) !== todaySlice) return;
      result.push({
        id: `bday_emp_${emp.id}_${todayStr}`,
        type: 'birthday',
        sortKey: 4,
        color: '#059669',
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        icon: '🎂',
        title: 'Sinh nhật nhân viên',
        message: emp.ho_ten,
        sub: [emp.chuc_vu, emp.phong_ban].filter(Boolean).join(' · '),
        page: 'employees',
      });
    });

    customers.forEach(cust => {
      if (!cust.ngay_sinh_lien_he) return;
      if (cust.ngay_sinh_lien_he.slice(5) !== todaySlice) return;
      result.push({
        id: `bday_cust_${cust.id}_${todayStr}`,
        type: 'birthday',
        sortKey: 4,
        color: '#059669',
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        icon: '🎂',
        title: 'Sinh nhật khách hàng',
        message: cust.ten,
        sub: cust.tinh_thanh || '',
        page: 'customers',
      });
    });

    return result.sort((a, b) => a.sortKey - b.sortKey || a.message.localeCompare(b.message, 'vi'));
  }, [tasks, employees, customers, myEmployeeId, role]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !readIds.includes(n.id)).length,
    [notifications, readIds]
  );

  const markAllRead = () => save(notifications.map(n => n.id));
  const markRead = (id) => { if (!readIds.includes(id)) save([...readIds, id]); };

  return { notifications, readIds, unreadCount, markAllRead, markRead };
}
