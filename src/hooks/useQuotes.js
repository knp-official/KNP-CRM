import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateId } from '../data/storage';

export function useQuotes() {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'quotes'), snapshot => {
      setQuotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  function addQuote(data) {
    const id = generateId();
    const nextNum = (quotes.length + 1).toString().padStart(3, '0');
    const year = new Date().getFullYear();
    const rec = {
      ...data,
      id,
      so_bao_gia: `BG-${year}-${nextNum}`,
      ngay_tao: new Date().toISOString().split('T')[0],
    };
    setDoc(doc(db, 'quotes', id), rec);
    return rec;
  }

  function updateQuote(id, data) {
    updateDoc(doc(db, 'quotes', id), data);
  }

  function deleteQuote(id) {
    deleteDoc(doc(db, 'quotes', id));
  }

  return { quotes, addQuote, updateQuote, deleteQuote };
}
