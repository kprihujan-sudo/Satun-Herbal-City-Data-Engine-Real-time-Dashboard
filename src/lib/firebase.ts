import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";

// Config parsed directly from firebase-applet-config.json for robustness
const firebaseConfig = {
  apiKey: "AIzaSyBCYDbQbswvzzWc8Fk4U8okuNkhCeh1TUg",
  authDomain: "sigma-env-5mvz5.firebaseapp.com",
  projectId: "sigma-env-5mvz5",
  storageBucket: "sigma-env-5mvz5.firebasestorage.app",
  messagingSenderId: "942344729513",
  appId: "1:942344729513:web:5ddafcd88f5614cd23cab8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID from config
// Config firestoreDatabaseId: "ai-studio-61688326-be8b-4266-b77e-2399ab6076ec"
const db = getFirestore(app, "ai-studio-61688326-be8b-4266-b77e-2399ab6076ec");

export { db };
