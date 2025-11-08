// Firebase Admin SDK for server-side operations
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (singleton pattern)
if (!admin.apps.length) {
    try {
        const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });

        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
    }
}

export const adminMessaging = admin.messaging();
export default admin;
