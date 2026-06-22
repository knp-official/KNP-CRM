import { useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SAMPLE_TASKS } from '../data/sampleData';
import { generateId } from '../data/storage';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const seeded = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tasks'), snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length === 0 && !seeded.current) {
        seeded.current = true;
        SAMPLE_TASKS.forEach(t => setDoc(doc(db, 'tasks', t.id), t));
      } else {
        setTasks(data);
      }
    });
    return unsub;
  }, []);

  function addTask(data) {
    const id = generateId();
    const rec = { ...data, id, ngay_tao: new Date().toISOString().split('T')[0] };
    setDoc(doc(db, 'tasks', id), rec);
    return rec;
  }

  function updateTask(id, data) {
    updateDoc(doc(db, 'tasks', id), data);
  }

  function deleteTask(id) {
    deleteDoc(doc(db, 'tasks', id));
  }

  return { tasks, addTask, updateTask, deleteTask };
}
