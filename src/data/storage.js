const KEYS = {
  customers: 'knp_crm_customers',
  contacts: 'knp_crm_contacts',
  employees: 'knp_crm_employees',
  tasks: 'knp_crm_tasks',
  quotes: 'knp_crm_quotes',
  debts: 'knp_crm_debts',
};

export function getCustomers() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.customers) || '[]');
  } catch {
    return [];
  }
}

export function saveCustomers(customers) {
  localStorage.setItem(KEYS.customers, JSON.stringify(customers));
}

export function getContacts() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.contacts) || '[]');
  } catch {
    return [];
  }
}

export function saveContacts(contacts) {
  localStorage.setItem(KEYS.contacts, JSON.stringify(contacts));
}

export function getEmployees() {
  try { return JSON.parse(localStorage.getItem(KEYS.employees) || '[]'); } catch { return []; }
}
export function saveEmployees(d) { localStorage.setItem(KEYS.employees, JSON.stringify(d)); }

export function getTasks() {
  try { return JSON.parse(localStorage.getItem(KEYS.tasks) || '[]'); } catch { return []; }
}
export function saveTasks(d) { localStorage.setItem(KEYS.tasks, JSON.stringify(d)); }

export function getQuotes() {
  try { return JSON.parse(localStorage.getItem(KEYS.quotes) || '[]'); } catch { return []; }
}
export function saveQuotes(d) { localStorage.setItem(KEYS.quotes, JSON.stringify(d)); }

export function getDebts() {
  try { return JSON.parse(localStorage.getItem(KEYS.debts) || '[]'); } catch { return []; }
}
export function saveDebts(d) { localStorage.setItem(KEYS.debts, JSON.stringify(d)); }

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
