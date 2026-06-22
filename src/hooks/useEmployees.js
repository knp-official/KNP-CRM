import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateId } from '../data/storage';

export function useEmployees() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'employees'), snapshot => {
      setEmployees(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  function addEmployee(data) {
    const id = generateId();
    const rec = { ...data, id, ngay_tao: new Date().toISOString().split('T')[0] };
    setDoc(doc(db, 'employees', id), rec);
    return rec;
  }

  function updateEmployee(id, data) {
    updateDoc(doc(db, 'employees', id), data);
  }

  function deleteEmployee(id) {
    deleteDoc(doc(db, 'employees', id));
  }

  return { employees, addEmployee, updateEmployee, deleteEmployee };
}
