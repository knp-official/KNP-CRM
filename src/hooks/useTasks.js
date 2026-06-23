import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function useTasks(isEmployeeMode = false, myEmployeeId = null, myUid = null) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Admin/Manager: fetch tất cả
    if (!isEmployeeMode) {
      const unsub = onSnapshot(collection(db, 'tasks'), snap => {
        setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return unsub;
    }

    // Employee: chờ đủ cả myUid VÀ myEmployeeId mới query
    if (!myUid || !myEmployeeId) {
      setTasks([]);
      return;
    }

    console.log('[KNP] Employee task filter: myEmployeeId=', myEmployeeId, ', myUid=', myUid);

    let byAssignee = [];
    let byCreator = [];
    const unsubs = [];

    function merge() {
      const map = new Map();
      [...byAssignee, ...byCreator].forEach(t => map.set(t.id, t));
      setTasks([...map.values()]);
    }

    // Query 1: task được giao cho employee này
    const q1 = query(collection(db, 'tasks'), where('nhan_vien_id', '==', myEmployeeId));
    unsubs.push(onSnapshot(q1, snap => {
      byAssignee = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      merge();
    }));

    // Query 2: task do employee này tạo
    const q2 = query(collection(db, 'tasks'), where('created_by_uid', '==', myUid));
    unsubs.push(onSnapshot(q2, snap => {
      byCreator = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      merge();
    }));

    return () => unsubs.forEach(u => u());
  }, [isEmployeeMode, myEmployeeId, myUid]);

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
