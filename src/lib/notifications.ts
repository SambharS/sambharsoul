// Push notification utilities for FCM
import { getMessagingInstance } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface NotificationPermissionResult {
    granted: boolean;
    token?: string;
    error?: string;
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionResult> {
    try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            return { granted: false, error: 'Notifications not supported' };
        }

        // Request permission
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            return { granted: false, error: 'Permission denied' };
        }

        // Get messaging instance
        const messaging = getMessagingInstance();
        if (!messaging) {
            return { granted: false, error: 'Messaging not available' };
        }

        // Get FCM token
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
            console.error('VAPID key not configured');
            return { granted: false, error: 'VAPID key missing' };
        }

        const token = await getToken(messaging, { vapidKey });

        return { granted: true, token };
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return { granted: false, error: String(error) };
    }
}

/**
 * Save FCM token to database
 */
export async function saveFCMToken(
    userId: string,
    role: 'user' | 'admin',
    fcmToken: string,
    deviceInfo?: string
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('fcm_tokens')
            .upsert({
                user_id: userId,
                role,
                fcm_token: fcmToken,
                device_info: deviceInfo || navigator.userAgent,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,fcm_token'
            });

        if (error) {
            console.error('Error saving FCM token:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error saving FCM token:', error);
        return false;
    }
}

/**
 * Register user for push notifications
 */
export async function registerForNotifications(
    userId: string,
    role: 'user' | 'admin'
): Promise<boolean> {
    try {
        const result = await requestNotificationPermission();

        if (!result.granted || !result.token) {
            console.error('Failed to get notification permission:', result.error);
            return false;
        }

        const saved = await saveFCMToken(userId, role, result.token);
        return saved;
    } catch (error) {
        console.error('Error registering for notifications:', error);
        return false;
    }
}

/**
 * Remove FCM token from database
 */
export async function removeFCMToken(userId: string, fcmToken: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('fcm_tokens')
            .delete()
            .eq('user_id', userId)
            .eq('fcm_token', fcmToken);

        if (error) {
            console.error('Error removing FCM token:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error removing FCM token:', error);
        return false;
    }
}

/**
 * Setup foreground message listener
 */
export function setupForegroundMessageListener(
    onMessageReceived: (payload: any) => void
) {
    const messaging = getMessagingInstance();
    if (!messaging) {
        console.warn('Messaging not available for foreground listener');
        return () => { };
    }

    return onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        onMessageReceived(payload);
    });
}

/**
 * Check if notifications are enabled
 */
export function areNotificationsEnabled(): boolean {
    if (!('Notification' in window)) {
        return false;
    }
    return Notification.permission === 'granted';
}
