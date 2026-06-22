import { useState, useEffect } from 'react';
import { getDebts, saveDebts, generateId } from '../data/storage';
import { SAMPLE_DEBTS } from '../data/sampleData';

export function useDebts() {
  const [debts, setDebts] = useState([]);

  useEffect(() => {
    const stored = getDebts();
    if (stored.length === 0) { saveDebts(SAMPLE_DEBTS); setDebts(SAMPLE_DEBTS); }
    else setDebts(stored);
  }, []);

  function addDebt(data) {
    const stored = getDebts();
    const nextNum = (stored.length + 1).toString().padStart(3, '0');
    const year = new Date().getFullYear();
    const rec = {
      ...data,
      id: generateId(),
      so_hoa_don: data.so_hoa_don || `HD-${year}-${nextNum}`,
      ngay_tao: new Date().toISOString().split('T')[0],
    };
    const updated = [rec, ...debts];
    setDebts(updated); saveDebts(updated);
    return rec;
  }

  function updateDebt(id, data) {
    const updated = debts.map(d => d.id === id ? { ...d, ...data } : d);
    setDebts(updated); saveDebts(updated);
  }

  function deleteDebt(id) {
    const updated = debts.filter(d => d.id !== id);
    setDebts(updated); saveDebts(updated);
  }

  return { debts, addDebt, updateDebt, deleteDebt };
}
