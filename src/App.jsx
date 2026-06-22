import { useState } from 'react';
import Sidebar from './components/Sidebar';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { contacts, addContact, updateContact, deleteContact } = useContacts();
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { quotes, addQuote, updateQuote, deleteQuote } = useQuotes();
  const { debts, addDebt, updateDebt, deleteDebt } = useDebts();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && (
          <Dashboard customers={customers} contacts={contacts} employees={employees} />
        )}
        {activeTab === 'customers' && (
          <CustomersPage
            customers={customers}
            contacts={contacts}
            onAdd={addCustomer}
            onUpdate={updateCustomer}
            onDelete={deleteCustomer}
            onAddContact={addContact}
            onUpdateContact={updateContact}
            onDeleteContact={deleteContact}
          />
        )}
        {activeTab === 'contacts' && (
          <ContactsPage
            contacts={contacts}
            customers={customers}
            onAdd={addContact}
            onUpdate={updateContact}
            onDelete={deleteContact}
          />
        )}
        {activeTab === 'employees' && (
          <EmployeesPage
            employees={employees}
            onAdd={addEmployee}
            onUpdate={updateEmployee}
            onDelete={deleteEmployee}
          />
        )}
        {activeTab === 'tasks' && (
          <TasksPage
            tasks={tasks}
            customers={customers}
            employees={employees}
            onAdd={addTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        )}
        {activeTab === 'quotes' && (
          <QuotesPage
            quotes={quotes}
            customers={customers}
            employees={employees}
            onAdd={addQuote}
            onUpdate={updateQuote}
            onDelete={deleteQuote}
            onAddCustomer={addCustomer}
          />
        )}
        {activeTab === 'debts' && (
          <DebtsPage
            debts={debts}
            customers={customers}
            onAdd={addDebt}
            onUpdate={updateDebt}
            onDelete={deleteDebt}
          />
        )}
        {activeTab === 'reports' && (
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
  );
}
