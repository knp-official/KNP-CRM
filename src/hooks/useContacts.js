import { useState, useEffect, useRef } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SAMPLE_CONTACTS } from '../data/sampleData';
import { generateId } from '../data/storage';

export function useContacts() {
  const [contacts, setContacts] = useState([]);
  const seeded = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'contacts'), snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (data.length === 0 && !seeded.current) {
        seeded.current = true;
        SAMPLE_CONTACTS.forEach(c => setDoc(doc(db, 'contacts', c.id), c));
      } else {
        setContacts(data);
      }
    });
    return unsub;
  }, []);

  function addContact(data) {
    const id = generateId();
    const rec = { ...data, id, ngay_tao: new Date().toISOString().split('T')[0] };
    setDoc(doc(db, 'contacts', id), rec);
    return rec;
  }

  function updateContact(id, data) {
    updateDoc(doc(db, 'contacts', id), data);
  }

  function deleteContact(id) {
    deleteDoc(doc(db, 'contacts', id));
  }

  function getContactsByCustomer(customerId) {
    return contacts.filter(c => c.khach_hang_id === customerId);
  }

  return { contacts, addContact, updateContact, deleteContact, getContactsByCustomer };
}
