import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useNotifications } from './hooks/useNotifications';
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

// Tabs accessible by employee role
const EMPLOYEE_TABS = new Set(['dashboard', 'customers', 'tasks']);

function AppContent() {
  const { user, userDoc, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { contacts, addContact, updateContact, deleteContact } = useContacts();
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { quotes, addQuote, updateQuote, deleteQuote } = useQuotes();
  const { debts, addDebt, updateDebt, deleteDebt } = useDebts();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || !userDoc) return <LoginPage />;

  const role = userDoc.vaiTro || 'employee'; // 'admin' | 'manager' | 'employee'
  const canDelete = role === 'admin';

  // Guard: employee cannot access restricted tabs
  const currentTab = role === 'employee' && !EMPLOYEE_TABS.has(activeTab) ? 'dashboard' : activeTab;

  // For employee role: only show their own tasks
  const myEmployee = employees.find(e => e.email === userDoc.email);
  const myEmployeeId = myEmployee?.id;

  // Notifications
  const { notifications, readIds, unreadCount, markAllRead, markRead } = useNotifications({
    tasks, employees, customers,
    myEmployeeId,
    role,
    userId: userDoc.uid || userDoc.id,
  });

  // Wrap delete functions — pass undefined when not allowed (hides delete UI in pages)
  const guard = fn => (canDelete ? fn : undefined);

  function handleTabChange(tab) {
    if (role === 'employee' && !EMPLOYEE_TABS.has(tab)) return;
    setActiveTab(tab);
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar activeTab={currentTab} onTabChange={handleTabChange} role={role} />
      <div className="flex-1 flex flex-col overflow-hidden min-h-screen">
        <Header
          userDoc={userDoc}
          notifications={notifications}
          readIds={readIds}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          onMarkRead={markRead}
          onNavigate={handleTabChange}
        />
        <main className="flex-1 overflow-auto">
          {currentTab === 'dashboard' && (
            <Dashboard customers={customers} contacts={contacts} employees={employees} />
          )}
          {currentTab === 'customers' && (
            <CustomersPage
              customers={customers}
              contacts={contacts}
              onAdd={addCustomer}
              onUpdate={updateCustomer}
              onDelete={guard(deleteCustomer)}
              onAddContact={addContact}
              onUpdateContact={updateContact}
              onDeleteContact={guard(deleteContact)}
            />
          )}
          {currentTab === 'contacts' && (
            <ContactsPage
              contacts={contacts}
              customers={customers}
              onAdd={addContact}
              onUpdate={updateContact}
              onDelete={guard(deleteContact)}
            />
          )}
          {currentTab === 'employees' && (
            <EmployeesPage
              employees={employees}
              onAdd={addEmployee}
              onUpdate={updateEmployee}
              onDelete={guard(deleteEmployee)}
            />
          )}
          {currentTab === 'tasks' && (
            <TasksPage
              tasks={tasks}
              customers={customers}
              employees={employees}
              onAdd={addTask}
              onUpdate={updateTask}
              onDelete={guard(deleteTask)}
              myEmployeeId={role === 'employee' ? myEmployeeId : undefined}
            />
          )}
          {currentTab === 'quotes' && (
            <QuotesPage
              quotes={quotes}
              customers={customers}
              employees={employees}
              onAdd={addQuote}
              onUpdate={updateQuote}
              onDelete={guard(deleteQuote)}
              onAddCustomer={addCustomer}
            />
          )}
          {currentTab === 'debts' && (
            <DebtsPage
              debts={debts}
              customers={customers}
              onAdd={addDebt}
              onUpdate={updateDebt}
              onDelete={guard(deleteDebt)}
            />
          )}
          {currentTab === 'reports' && (
            <ReportsPage
              customers={customers}
              contacts={contacts}
              employees={employees}
              tasks={tasks}
              quotes={quotes}
              debts={debts}
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
