import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your Firebase configuration
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

// Initialize Firestore
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.error('Persistence failed due to multiple open tabs.');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all the features required to enable persistence
      console.error('Persistence is not available on this browser.');
    }
  });

export { db };
