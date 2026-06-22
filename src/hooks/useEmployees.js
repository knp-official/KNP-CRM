import { useState, useEffect } from 'react';
import { getEmployees, saveEmployees, generateId } from '../data/storage';
import { SAMPLE_EMPLOYEES } from '../data/sampleData';

export function useEmployees() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const stored = getEmployees();
    if (stored.length === 0) { saveEmployees(SAMPLE_EMPLOYEES); setEmployees(SAMPLE_EMPLOYEES); }
    else setEmployees(stored);
  }, []);

  function addEmployee(data) {
    const rec = { ...data, id: generateId(), ngay_tao: new Date().toISOString().split('T')[0] };
    const updated = [rec, ...employees];
    setEmployees(updated); saveEmployees(updated);
    return rec;
  }

  function updateEmployee(id, data) {
    const updated = employees.map(e => e.id === id ? { ...e, ...data } : e);
    setEmployees(updated); saveEmployees(updated);
  }

  function deleteEmployee(id) {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated); saveEmployees(updated);
  }

  return { employees, addEmployee, updateEmployee, deleteEmployee };
}
