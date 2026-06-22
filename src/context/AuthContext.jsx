import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

const BOOTSTRAP_ADMIN = {
  email: 'kimnganphat.safe@gmail.com',
  hoTen: 'Lê Như Dũng',
  vaiTro: 'admin',
  phongBan: 'Ban Giám đốc',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const unsubDocRef = useRef(null);
  const bootstrapped = useRef(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubDocRef.current) {
        unsubDocRef.current();
        unsubDocRef.current = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setUserDoc(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      // Bootstrap admin doc if first login
      if (!bootstrapped.current && firebaseUser.email === BOOTSTRAP_ADMIN.email) {
        bootstrapped.current = true;
        const ref = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            uid: firebaseUser.uid,
            email: BOOTSTRAP_ADMIN.email,
            hoTen: BOOTSTRAP_ADMIN.hoTen,
            vaiTro: BOOTSTRAP_ADMIN.vaiTro,
            phongBan: BOOTSTRAP_ADMIN.phongBan,
          });
        }
      }

      // Realtime listener for user doc
      const ref = doc(db, 'users', firebaseUser.uid);
      unsubDocRef.current = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          setUserDoc({ id: snap.id, ...snap.data() });
        } else {
          setUserDoc(null);
        }
        setLoading(false);
      });
    });

    return () => {
      unsub();
      if (unsubDocRef.current) unsubDocRef.current();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userDoc, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
