import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCIiRP7-5-QL4auIpZvXHd14Oae6cQYu6Q",
  authDomain: "knp-crm-17908.firebaseapp.com",
  projectId: "knp-crm-17908",
  storageBucket: "knp-crm-17908.firebasestorage.app",
  messagingSenderId: "1054095415072",
  appId: "1:1054095415072:web:7285742d406c6e82c22945",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// messaging chỉ khả dụng trong browser có hỗ trợ SW + HTTPS
let messaging = null;
isSupported().then((ok) => {
  if (ok) messaging = getMessaging(app);
}).catch(() => {});
export { messaging };
export const getMessagingInstance = () => messaging;
