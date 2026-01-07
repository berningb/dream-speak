// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: "dream-speak",
  storageBucket: "dream-speak.firebasestorage.app",
  messagingSenderId: "821728503475",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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