import { useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SAMPLE_CUSTOMERS } from '../data/sampleData';
import { generateId } from '../data/storage';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const seeded = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'customers'), snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length === 0 && !seeded.current) {
        seeded.current = true;
        SAMPLE_CUSTOMERS.forEach(c => setDoc(doc(db, 'customers', c.id), c));
      } else {
        setCustomers(data);
      }
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
