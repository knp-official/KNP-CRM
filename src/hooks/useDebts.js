import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateId } from '../data/storage';

export function useDebts() {
  const [debts, setDebts] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'debts'), snapshot => {
      setDebts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  function addDebt(data) {
    const id = generateId();
    const nextNum = (debts.length + 1).toString().padStart(3, '0');
    const year = new Date().getFullYear();
    const rec = {
      ...data,
      id,
      so_hoa_don: data.so_hoa_don || `HD-${year}-${nextNum}`,
      ngay_tao: new Date().toISOString().split('T')[0],
    };
    setDoc(doc(db, 'debts', id), rec);
    return rec;
  }

  function updateDebt(id, data) {
    updateDoc(doc(db, 'debts', id), data);
  }

  function deleteDebt(id) {
    deleteDoc(doc(db, 'debts', id));
  }

  return { debts, addDebt, updateDebt, deleteDebt };
}
