import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
