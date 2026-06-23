import { useState, useMemo, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useNotifications } from './hooks/useNotifications';
import { useFirestoreNotifications } from './hooks/useFirestoreNotifications';
import { createTaskNotification, sendZaloNotification } from './services/notificationService';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import EmployeesPage from './pages/EmployeesPage';
import TasksPage from './pages/TasksPage';
import QuotesPage from './pages/QuotesPage';
import DebtsPage from './pages/DebtsPage';
import ReportsPage from './pages/ReportsPage';
import { useCustomers } from './hooks/useCustomers';
import { useContacts } from './hooks/useContacts';
import { useEmployees } from './hooks/useEmployees';
import { useTasks } from './hooks/useTasks';
import { useQuotes } from './hooks/useQuotes';
import { useDebts } from './hooks/useDebts';

// Bảng phân quyền theo role
const PERMS = {
  admin: {
    customers: { add: true,  edit: true,  del: true  },
    contacts:  { add: true,  edit: true,  del: true  },
    employees: { add: true,  edit: true,  del: true  },
    tasks:     { add: true,  edit: true,  del: true  },
    quotes:    { add: true,  edit: true,  del: true  },
    debts:     { view: true, add: true,  edit: true,  del: true  },
    reports:   { view: true },
  },
  manager: {
    customers: { add: true,  edit: true,  del: false },
    contacts:  { add: true,  edit: true,  del: false },
    employees: { add: false, edit: true,  del: false },
    tasks:     { add: true,  edit: true,  del: false },
    quotes:    { add: true,  edit: true,  del: false },
    debts:     { view: true, add: false, edit: false, del: false },
    reports:   { view: true },
  },
  employee: {
    customers: { add: true,  edit: true,  del: false }, // edit per-row via canEditCustomer()
    contacts:  { add: false, edit: false, del: false },
    employees: { add: false, edit: false, del: false },
    tasks:     { add: true,  edit: true,  del: false },
    quotes:    { add: false, edit: false, del: false },
    debts:     { view: false },
    reports:   { view: true },  // hiển thị PersonalReportView
  },
};

function AccessDenied({ module }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', gap: '12px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ fontSize: '52px', lineHeight: 1 }}>🔒</div>
      <p style={{ fontSize: '17px', fontWeight: '700', color: '#414042', margin: 0 }}>
        Bạn không có quyền truy cập
      </p>
      <p style={{ fontSize: '13px', color: '#999', margin: 0, textAlign: 'center', maxWidth: '300px' }}>
        Module <strong>{module}</strong> chỉ dành cho Admin và Quản lý.<br />
        Liên hệ cấp trên để được cấp quyền.
      </p>
    </div>
  );
}

function AppContent() {
  const { user, userDoc, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // ── ALL hooks must be called unconditionally (Rules of Hooks) ──
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { contacts, addContact, updateContact, deleteContact }     = useContacts();
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { quotes, addQuote, updateQuote, deleteQuote }             = useQuotes();
  const { debts, addDebt, updateDebt, deleteDebt }                 = useDebts();

  // Derive identity before useTasks so we can pass Firestore-level filters
  const role           = userDoc?.vaiTro || 'employee';
  const isEmployee     = role === 'employee' || role === 'manager';
  const currentUserUid = userDoc?.uid;

  // Match by Firebase UID — phone+PIN users have userDoc.email = '09xx@knp.internal'
  // which doesn't match the real email stored in employees collection.
  const myEmployee   = employees.find(e => e.uid === currentUserUid);
  const myEmployeeId = myEmployee?.id;

  // Subordinates của manager: nhân viên có quan_ly_truc_tiep_id trỏ đến myEmployeeId
  const mySubordinateIds = myEmployeeId
    ? employees.filter(e => e.quan_ly_truc_tiep_id === myEmployeeId).map(e => e.id)
    : [];

  // useTasks nhận role để phân nhánh query ở tầng Firestore:
  // admin → fetch all | manager → mình + subordinates | employee → chỉ mình
  const { tasks, addTask, updateTask, deleteTask } = useTasks(
    role,
    myEmployeeId ?? null,
    currentUserUid ?? null,
    mySubordinateIds,
  );

  // Kênh 1a: computed notifications (overdue, deadline, birthday…)
  const computed = useNotifications({
    tasks, employees, customers,
    myEmployeeId,
    role,
    userId: userDoc?.uid || userDoc?.id || 'anon',
  });

  // Kênh 1b: Firestore realtime notifications (giao việc, cập nhật…)
  const firestore = useFirestoreNotifications(userDoc?.uid || null);

  // Merge: Firestore trước (mới nhất), computed sau — dedup by id (prefix khác nhau)
  const notifications = useMemo(() => [
    ...firestore.notifications,
    ...computed.notifications,
  ], [firestore.notifications, computed.notifications]);

  const readIds = useMemo(() => [
    ...firestore.readIds,
    ...computed.readIds,
  ], [firestore.readIds, computed.readIds]);

  const unreadCount = firestore.unreadCount + computed.unreadCount;

  function markRead(id) {
    if (id.startsWith('fs_')) firestore.markRead(id);
    else computed.markRead(id);
  }

  function markAllRead() {
    firestore.markAllRead();
    computed.markAllRead();
  }

  // ─── Wrappers giao việc — tự động tạo thông báo ───────────────────────────
  const notifyAssignee = useCallback(async (task, type, extraSub = '') => {
    const emp = employees.find(e => e.id === task.nhan_vien_id);
    if (!emp) return;

    const deadlineFmt = task.deadline
      ? new Date(task.deadline).toLocaleString('vi-VN', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : '';

    // In-app notification (chỉ nếu nhân viên đã kích hoạt tài khoản)
    if (emp.uid) {
      const titles = {
        new_task:       'Công việc mới được giao',
        task_updated:   'Công việc vừa được cập nhật',
        task_completed: 'Công việc đã hoàn thành',
      };
      await createTaskNotification({
        userId: emp.uid,
        title: titles[type] || 'Thông báo công việc',
        message: task.tieu_de,
        sub: extraSub || (deadlineFmt ? `Hạn: ${deadlineFmt}` : ''),
        type,
        taskId: task.id,
      });
    }

    // Zalo notification
    const phone = emp.so_dien_thoai || emp.phone || '';
    if (phone && (type === 'new_task' || type === 'task_updated')) {
      sendZaloNotification(phone, task.tieu_de, task.deadline);
    }
  }, [employees]);

  // Khi hoàn thành task → thông báo cho người tạo (admin hiện tại hoặc created_by)
  const notifyCreator = useCallback(async (task) => {
    const creatorUid = task.created_by_uid || userDoc?.uid;
    if (!creatorUid || creatorUid === task.nhan_vien_uid) return;
    await createTaskNotification({
      userId: creatorUid,
      title: 'Công việc đã hoàn thành',
      message: task.tieu_de,
      sub: 'Nhân viên vừa đánh dấu hoàn thành',
      type: 'task_completed',
      taskId: task.id,
    });
  }, [userDoc]);

  function handleAddTask(data) {
    const rec = addTask({ ...data, created_by_uid: userDoc?.uid });
    notifyAssignee(rec, 'new_task');
    return rec;
  }

  function handleUpdateTask(id, data) {
    const prev = tasks.find(t => t.id === id);
    updateTask(id, data);

    if (prev) {
      const deadlineChanged = data.deadline && data.deadline !== prev.deadline;
      const priorityChanged = data.uu_tien && data.uu_tien !== prev.uu_tien;
      const justCompleted   = data.trang_thai === 'Hoàn thành' && prev.trang_thai !== 'Hoàn thành';

      if (justCompleted) {
        notifyCreator({ ...prev, ...data, id });
      } else if ((deadlineChanged || priorityChanged) && data.nhan_vien_id) {
        const sub = deadlineChanged ? `Deadline mới: ${new Date(data.deadline).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` : `Ưu tiên thay đổi: ${data.uu_tien}`;
        notifyAssignee({ ...prev, ...data, id }, 'task_updated', sub);
      }
    }
  }

  // ── Conditional renders AFTER all hooks ────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <svg style={{ animation: 'spin 0.8s linear infinite' }} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F15A22" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity="0.2"/>
            <path d="M3 12a9 9 0 0 1 9-9"/>
          </svg>
          <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Đang tải...</p>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!user || !userDoc) return <LoginPage />;

  const p   = PERMS[role] || PERMS.employee;
  const g   = (fn, allowed) => (allowed ? fn : undefined);
  const tab = activeTab;

  // Data-layer guard: employee không được update hồ sơ bất kỳ ai
  function handleUpdateEmployee(id, data) {
    console.log('[KNP] updateEmployee called:', { id, byRole: role, myEmployeeId });
    if (isEmployee) {
      console.warn('[KNP] BLOCKED: employee role cannot update any employee profile');
      return;
    }
    updateEmployee(id, data);
  }

  const visibleEmployees = employees;

  // Employee add customer → tự động gán managedBy
  function handleAddCustomer(data) {
    return addCustomer(isEmployee ? { ...data, managedBy: currentUserUid } : data);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
      <Sidebar activeTab={tab} onTabChange={setActiveTab} role={role} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '100vh' }}>
        <Header
          userDoc={userDoc}
          notifications={notifications}
          readIds={readIds}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          onMarkRead={markRead}
          onNavigate={setActiveTab}
        />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {tab === 'dashboard' && (
            <Dashboard customers={customers} contacts={contacts} employees={employees} />
          )}
          {tab === 'customers' && (
            <CustomersPage
              customers={customers} contacts={contacts}
              onAdd={g(handleAddCustomer, p.customers.add)}
              onUpdate={g(updateCustomer, p.customers.edit)}
              onDelete={g(deleteCustomer, p.customers.del)}
              onAddContact={g(addContact, p.contacts.add)}
              onUpdateContact={g(updateContact, p.contacts.edit)}
              onDeleteContact={g(deleteContact, p.contacts.del)}
              currentUserUid={currentUserUid}
              isEmployee={isEmployee}
            />
          )}
          {tab === 'employees' && (
            <EmployeesPage
              employees={visibleEmployees}
              onAdd={g(addEmployee, p.employees.add)}
              onUpdate={isEmployee ? null : (p.employees.edit ? handleUpdateEmployee : null)}
              onDelete={g(deleteEmployee, p.employees.del)}
              myEmployeeId={myEmployeeId}
              isEmployee={isEmployee}
            />
          )}
          {tab === 'tasks' && (
            <TasksPage
              tasks={tasks} customers={customers} employees={employees}
              onAdd={g(handleAddTask, p.tasks.add)}
              onUpdate={handleUpdateTask}
              onDelete={g(deleteTask, p.tasks.del)}
              myEmployeeId={myEmployeeId}
            />
          )}
          {tab === 'quotes' && (
            <QuotesPage
              quotes={quotes} customers={customers} employees={employees}
              onAdd={g(addQuote, p.quotes.add)}
              onUpdate={g(updateQuote, p.quotes.edit)}
              onDelete={g(deleteQuote, p.quotes.del)}
              onAddCustomer={g(addCustomer, p.customers.add)}
            />
          )}
          {tab === 'debts' && (
            p.debts.view
              ? <DebtsPage
                  debts={debts} customers={customers}
                  onAdd={g(addDebt, p.debts.add)}
                  onUpdate={g(updateDebt, p.debts.edit)}
                  onDelete={g(deleteDebt, p.debts.del)}
                />
              : <AccessDenied module="Công nợ" />
          )}
          {tab === 'reports' && (
            <ReportsPage
              customers={customers} contacts={contacts} employees={employees}
              tasks={tasks} quotes={quotes} debts={debts}
              isEmployeeView={isEmployee}
              myEmployeeId={myEmployeeId}
              myUid={currentUserUid}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
