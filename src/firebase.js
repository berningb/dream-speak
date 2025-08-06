// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDcLZdRywuiluxqx9o7X3HA5bQQxfyEIE8",
  authDomain: "dream-speak.firebaseapp.com",
  projectId: "dream-speak",
  storageBucket: "dream-speak.firebasestorage.app",
  messagingSenderId: "821728503475",
  appId: "1:821728503475:web:37c025fdb53a402a8572c6",
  measurementId: "G-BXXH8SWV1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Add error handling for Firestore operations
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('✅ User authenticated:', user.uid);
  } else {
    console.log('❌ User not authenticated');
  }
});

// Enable Firestore offline persistence
import { enableNetwork } from 'firebase/firestore';

// Helper function to check Firestore connection
export const checkFirestoreConnection = async () => {
  try {
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.error('❌ Firestore connection error:', error);
    return false;
  }
};

export default app; 