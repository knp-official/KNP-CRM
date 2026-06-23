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
import ContactsPage from './pages/ContactsPage';
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

const EMPLOYEE_TABS = new Set(['dashboard', 'customers', 'tasks']);

function AppContent() {
  const { user, userDoc, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // ── ALL hooks must be called unconditionally (Rules of Hooks) ──
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { contacts, addContact, updateContact, deleteContact }     = useContacts();
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { tasks, addTask, updateTask, deleteTask }                 = useTasks();
  const { quotes, addQuote, updateQuote, deleteQuote }             = useQuotes();
  const { debts, addDebt, updateDebt, deleteDebt }                 = useDebts();

  // Derive auth-dependent values safely with optional chaining
  const role        = userDoc?.vaiTro || 'employee';
  const myEmployee  = employees.find(e => e.email === (userDoc?.email || ''));
  const myEmployeeId = myEmployee?.id;

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

  const canDelete  = role === 'admin';
  const currentTab = (role === 'employee' && !EMPLOYEE_TABS.has(activeTab)) ? 'dashboard' : activeTab;
  const guard      = fn => (canDelete ? fn : undefined);

  function handleTabChange(tab) {
    if (role === 'employee' && !EMPLOYEE_TABS.has(tab)) return;
    setActiveTab(tab);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F5F5' }}>
      <Sidebar activeTab={currentTab} onTabChange={handleTabChange} role={role} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '100vh' }}>
        <Header
          userDoc={userDoc}
          notifications={notifications}
          readIds={readIds}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          onMarkRead={markRead}
          onNavigate={handleTabChange}
        />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {currentTab === 'dashboard' && (
            <Dashboard customers={customers} contacts={contacts} employees={employees} />
          )}
          {currentTab === 'customers' && (
            <CustomersPage
              customers={customers} contacts={contacts}
              onAdd={addCustomer} onUpdate={updateCustomer} onDelete={guard(deleteCustomer)}
              onAddContact={addContact} onUpdateContact={updateContact} onDeleteContact={guard(deleteContact)}
            />
          )}
          {currentTab === 'contacts' && (
            <ContactsPage
              contacts={contacts} customers={customers}
              onAdd={addContact} onUpdate={updateContact} onDelete={guard(deleteContact)}
            />
          )}
          {currentTab === 'employees' && (
            <EmployeesPage
              employees={employees}
              onAdd={addEmployee} onUpdate={updateEmployee} onDelete={guard(deleteEmployee)}
            />
          )}
          {currentTab === 'tasks' && (
            <TasksPage
              tasks={tasks} customers={customers} employees={employees}
              onAdd={handleAddTask} onUpdate={handleUpdateTask} onDelete={guard(deleteTask)}
              myEmployeeId={role === 'employee' ? myEmployeeId : undefined}
            />
          )}
          {currentTab === 'quotes' && (
            <QuotesPage
              quotes={quotes} customers={customers} employees={employees}
              onAdd={addQuote} onUpdate={updateQuote} onDelete={guard(deleteQuote)}
              onAddCustomer={addCustomer}
            />
          )}
          {currentTab === 'debts' && (
            <DebtsPage
              debts={debts} customers={customers}
              onAdd={addDebt} onUpdate={updateDebt} onDelete={guard(deleteDebt)}
            />
          )}
          {currentTab === 'reports' && (
            <ReportsPage
              customers={customers} contacts={contacts} employees={employees}
              tasks={tasks} quotes={quotes} debts={debts}
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
