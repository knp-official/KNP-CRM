import { useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SAMPLE_EMPLOYEES } from '../data/sampleData';
import { generateId } from '../data/storage';

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const seeded = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'employees'), snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length === 0 && !seeded.current) {
        seeded.current = true;
        SAMPLE_EMPLOYEES.forEach(e => setDoc(doc(db, 'employees', e.id), e));
      } else {
        setEmployees(data);
      }
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
