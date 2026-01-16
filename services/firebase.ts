
// Fix: Use standard modular SDK imports for Firebase. 
// If "no exported member" errors persist, ensure the project's firebase version is 9.0.0 or higher.
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getDatabase, ref, onValue, set, push } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBSLeJBrFXUaaYuvGVzt-cHWNRbIfWDMPk",
  authDomain: "weather-5f45a.firebaseapp.com",
  databaseURL: "https://weather-5f45a-default-rtdb.firebaseio.com",
  projectId: "weather-5f45a",
  storageBucket: "weather-5f45a.firebasestorage.app",
  messagingSenderId: "148780170865",
  appId: "1:148780170865:web:57d73dc75b72ecbd30a5d0",
  measurementId: "G-2TPJXPZ3GB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getDatabase(app);
const auth = getAuth(app);

export { 
  app, 
  analytics, 
  db, 
  auth, 
  logEvent, 
  ref, 
  onValue, 
  set, 
  push,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
export type { User };
