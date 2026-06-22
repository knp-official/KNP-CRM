import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateId } from '../data/storage';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'customers'), snapshot => {
      setCustomers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  function addCustomer(data) {
    const id = generateId();
    const rec = { ...data, id, ngay_tao: new Date().toISOString().split('T')[0] };
    setDoc(doc(db, 'customers', id), rec);
    return rec;
  }

  function updateCustomer(id, data) {
    updateDoc(doc(db, 'customers', id), data);
  }

  function deleteCustomer(id) {
    deleteDoc(doc(db, 'customers', id));
  }

  return { customers, addCustomer, updateCustomer, deleteCustomer };
}
