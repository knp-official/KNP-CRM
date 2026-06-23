import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function useTasks(role = 'employee', myEmployeeId = null, myUid = null, mySubordinateIds = []) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Admin: fetch tất cả
    if (role === 'admin') {
      const unsub = onSnapshot(collection(db, 'tasks'), snap => {
        setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return unsub;
    }

    // Manager và Employee: chờ đủ myUid VÀ myEmployeeId
    if (!myUid || !myEmployeeId) {
      setTasks([]);
      return;
    }

    let byAssignee = [];
    let byCreator = [];
    const unsubs = [];

    function merge() {
      const map = new Map();
      [...byAssignee, ...byCreator].forEach(t => map.set(t.id, t));
      setTasks([...map.values()]);
    }

    if (role === 'manager') {
      // Manager thấy task của mình + task của nhân viên do mình quản lý
      const visibleIds = [myEmployeeId, ...mySubordinateIds];
      console.log('[KNP] Manager filter: visibleIds=', visibleIds);

      // Query task được giao cho manager hoặc subordinates
      visibleIds.forEach(eid => {
        const q = query(collection(db, 'tasks'), where('nhan_vien_id', '==', eid));
        unsubs.push(onSnapshot(q, snap => {
          const newTasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          byAssignee = [...byAssignee.filter(t => !newTasks.find(n => n.id === t.id)), ...newTasks];
          merge();
        }));
      });

      // Query task do manager tạo
      const q2 = query(collection(db, 'tasks'), where('created_by_uid', '==', myUid));
      unsubs.push(onSnapshot(q2, snap => {
        byCreator = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        merge();
      }));

    } else {
      // Employee: chỉ thấy task của mình
      console.log('[KNP] Employee filter: myEmployeeId=', myEmployeeId, 'myUid=', myUid);

      const q1 = query(collection(db, 'tasks'), where('nhan_vien_id', '==', myEmployeeId));
      unsubs.push(onSnapshot(q1, snap => {
        byAssignee = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        merge();
      }));

      const q2 = query(collection(db, 'tasks'), where('created_by_uid', '==', myUid));
      unsubs.push(onSnapshot(q2, snap => {
        byCreator = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        merge();
      }));
    }

    return () => unsubs.forEach(u => u());
  }, [role, myEmployeeId, myUid, JSON.stringify(mySubordinateIds)]);

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
