
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAKe2ei80Hjks5BVWHkidGge5u7C8Or8bc",
  authDomain: "synapse-study-pranr.firebaseapp.com",
  projectId: "synapse-study-pranr",
  storageBucket: "synapse-study-pranr.appspot.com",
  messagingSenderId: "794574397369",
  appId: "1:794574397369:web:93e98bca64d92d81956068"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
