import { useState, useEffect } from 'react';
import { getTasks, saveTasks, generateId } from '../data/storage';
import { SAMPLE_TASKS } from '../data/sampleData';

export function useTasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const stored = getTasks();
    if (stored.length === 0) { saveTasks(SAMPLE_TASKS); setTasks(SAMPLE_TASKS); }
    else setTasks(stored);
  }, []);

  function addTask(data) {
    const rec = { ...data, id: generateId(), ngay_tao: new Date().toISOString().split('T')[0] };
    const updated = [rec, ...tasks];
    setTasks(updated); saveTasks(updated);
    return rec;
  }

  function updateTask(id, data) {
    const updated = tasks.map(t => t.id === id ? { ...t, ...data } : t);
    setTasks(updated); saveTasks(updated);
  }

  function deleteTask(id) {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated); saveTasks(updated);
  }

  return { tasks, addTask, updateTask, deleteTask };
}
