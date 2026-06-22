import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateId } from '../data/storage';

export function useTasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tasks'), snapshot => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
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
