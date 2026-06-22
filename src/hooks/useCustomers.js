import { useState, useEffect } from 'react';
import { getCustomers, saveCustomers, generateId } from '../data/storage';
import { SAMPLE_CUSTOMERS } from '../data/sampleData';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const stored = getCustomers();
    if (stored.length === 0) {
      saveCustomers(SAMPLE_CUSTOMERS);
      setCustomers(SAMPLE_CUSTOMERS);
    } else {
      setCustomers(stored);
    }
  }, []);

  function addCustomer(data) {
    const newCustomer = { ...data, id: generateId(), ngay_tao: new Date().toISOString().split('T')[0] };
    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    saveCustomers(updated);
    return newCustomer;
  }

  function updateCustomer(id, data) {
    const updated = customers.map(c => c.id === id ? { ...c, ...data } : c);
    setCustomers(updated);
    saveCustomers(updated);
  }

  function deleteCustomer(id) {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveCustomers(updated);
  }

  return { customers, addCustomer, updateCustomer, deleteCustomer };
}
