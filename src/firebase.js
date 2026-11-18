import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration for MuscleUP Ai (muscleup_ai_web)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBpfiCNon_XhVZBn5ccddJTPNIFxXrADHE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'muscleup-ai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'muscleup-ai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'muscleup-ai.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '961153202269',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:961153202269:web:d2b580ef7f97b36b5935b4',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-YELNBGY1XJ',
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Firebase Authentication (Email/Password + Google)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Cloud Firestore Database (Per-User Permanent Cloud Storage)
export const db = getFirestore(app);

// Safely initialize Firebase Analytics only when supported in browser
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      analytics = null;
    });
}
