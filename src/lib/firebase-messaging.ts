// Firebase Cloud Messaging utilities
// This file handles push notifications - CLIENT-SIDE ONLY

import { getMessagingInstance } from './firebase';
import { getToken, onMessage, MessagePayload } from 'firebase/messaging';

/**
 * Check if messaging is supported in current environment
 */
export const isMessagingSupported = (): boolean => {
    return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!isMessagingSupported()) {
        console.warn('Notifications not supported in this environment');
        return 'denied';
    }

    try {
        const permission = await Notification.requestPermission();
        return permission;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
    }
};

/**
 * Get FCM token for push notifications
 */
export const getFCMToken = async (): Promise<string | null> => {
    if (!isMessagingSupported()) {
        console.warn('Messaging not supported');
        return null;
    }

    const messaging = getMessagingInstance();
    if (!messaging) {
        console.warn('Messaging instance not available');
        return null;
    }

    try {
        // Request permission first
        const permission = await requestNotificationPermission();
        if (permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        // Get FCM token
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
            console.error('VAPID key not configured');
            return null;
        }

        const token = await getToken(messaging, { vapidKey });
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = (
    callback: (payload: MessagePayload) => void
): (() => void) | null => {
    if (!isMessagingSupported()) {
        return null;
    }

    const messaging = getMessagingInstance();
    if (!messaging) {
        return null;
    }

    try {
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            callback(payload);
        });
        return unsubscribe;
    } catch (error) {
        console.error('Error setting up message listener:', error);
        return null;
    }
};

/**
 * Show browser notification
 */
export const showNotification = (
    title: string,
    options?: NotificationOptions
): void => {
    if (!isMessagingSupported()) {
        return;
    }

    if (Notification.permission === 'granted') {
        new Notification(title, options);
    }
};

/**
 * Initialize FCM and return token
 * Call this when user logs in or on app start
 */
export const initializeFCM = async (): Promise<string | null> => {
    if (!isMessagingSupported()) {
        console.log('FCM not supported in this environment');
        return null;
    }

    try {
        // Register service worker if not already registered
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register(
                '/firebase-messaging-sw.js'
            );
            console.log('Service Worker registered:', registration);
        }

        // Get FCM token
        const token = await getFCMToken();
        if (token) {
            console.log('FCM Token obtained:', token);
            // TODO: Save token to Supabase for this user
            return token;
        }

        return null;
    } catch (error) {
        console.error('Error initializing FCM:', error);
        return null;
    }
};
