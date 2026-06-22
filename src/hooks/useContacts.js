import { useState, useEffect } from 'react';
import { getContacts, saveContacts, generateId } from '../data/storage';
import { SAMPLE_CONTACTS } from '../data/sampleData';

export function useContacts() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const stored = getContacts();
    if (stored.length === 0) {
      saveContacts(SAMPLE_CONTACTS);
      setContacts(SAMPLE_CONTACTS);
    } else {
      setContacts(stored);
    }
  }, []);

  function addContact(data) {
    const newContact = { ...data, id: generateId(), ngay_tao: new Date().toISOString().split('T')[0] };
    const updated = [newContact, ...contacts];
    setContacts(updated);
    saveContacts(updated);
    return newContact;
  }

  function updateContact(id, data) {
    const updated = contacts.map(c => c.id === id ? { ...c, ...data } : c);
    setContacts(updated);
    saveContacts(updated);
  }

  function deleteContact(id) {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    saveContacts(updated);
  }

  function getContactsByCustomer(customerId) {
    return contacts.filter(c => c.khach_hang_id === customerId);
  }

  return { contacts, addContact, updateContact, deleteContact, getContactsByCustomer };
}
