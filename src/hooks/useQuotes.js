import { useState, useEffect } from 'react';
import { getQuotes, saveQuotes, generateId } from '../data/storage';
import { SAMPLE_QUOTES } from '../data/sampleData';

export function useQuotes() {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    const stored = getQuotes();
    if (stored.length === 0) { saveQuotes(SAMPLE_QUOTES); setQuotes(SAMPLE_QUOTES); }
    else setQuotes(stored);
  }, []);

  function addQuote(data) {
    const stored = getQuotes();
    const nextNum = (stored.length + 1).toString().padStart(3, '0');
    const year = new Date().getFullYear();
    const rec = {
      ...data,
      id: generateId(),
      so_bao_gia: `BG-${year}-${nextNum}`,
      ngay_tao: new Date().toISOString().split('T')[0],
    };
    const updated = [rec, ...quotes];
    setQuotes(updated); saveQuotes(updated);
    return rec;
  }

  function updateQuote(id, data) {
    const updated = quotes.map(q => q.id === id ? { ...q, ...data } : q);
    setQuotes(updated); saveQuotes(updated);
  }

  function deleteQuote(id) {
    const updated = quotes.filter(q => q.id !== id);
    setQuotes(updated); saveQuotes(updated);
  }

  return { quotes, addQuote, updateQuote, deleteQuote };
}
