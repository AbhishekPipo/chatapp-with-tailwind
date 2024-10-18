import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCkJeZ72cPo9pgtPmCy6MfcGb8kQTh7nfk',
  authDomain: 'chat-app-41d29.firebaseapp.com',
  projectId: 'chat-app-41d29',
  storageBucket: 'chat-app-41d29.appspot.com',
  messagingSenderId: '164261969787',
  appId: '1:164261969787:web:a0f1a7a6c1cc889236c7de',
  measurementId: 'G-XTDCQ582YM'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.error('Persistence failed due to multiple open tabs.');
    } else if (err.code === 'unimplemented') {
      console.error('Persistence is not available on this browser.');
    }
  });

export { db, storage };
