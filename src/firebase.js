// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCkJeZ72cPo9pgtPmCy6MfcGb8kQTh7nfk',
  authDomain: 'chat-app-41d29.firebaseapp.com',
  projectId: 'chat-app-41d29',
  storageBucket: 'chat-app-41d29.appspot.com',
  messagingSenderId: '164261969787',
  appId: '1:164261969787:web:a0f1a7a6c1cc889236c7de',
    measurementId: "G-XTDCQ582YM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
