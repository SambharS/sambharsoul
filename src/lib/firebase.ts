// Firebase configuration
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "your-measurement-id"
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services that work on both server and client
export const auth: Auth = getAuth(app);
export const database: Database = getDatabase(app);
export const storage: FirebaseStorage = getStorage(app);

// Messaging requires browser environment - lazy initialize
let messagingInstance: Messaging | null = null;

export const getMessagingInstance = (): Messaging | null => {
  // Only initialize messaging in browser environment
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    if (!messagingInstance) {
      try {
        messagingInstance = getMessaging(app);
      } catch (error) {
        console.error('Failed to initialize Firebase Messaging:', error);
        return null;
      }
    }
    return messagingInstance;
  }
  return null;
};

// For backward compatibility, export a getter
export const messaging = getMessagingInstance();

export default app;