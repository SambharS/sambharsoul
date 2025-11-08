'use client';

import { useEffect, useState } from 'react';
import {
    isMessagingSupported,
    initializeFCM,
    onMessageListener,
    requestNotificationPermission
} from '@/lib/firebase-messaging';
import { MessagePayload } from 'firebase/messaging';

interface UseFCMReturn {
    token: string | null;
    permission: NotificationPermission;
    isSupported: boolean;
    requestPermission: () => Promise<NotificationPermission>;
}

/**
 * Hook to use Firebase Cloud Messaging in React components
 * Only works on client-side
 */
export function useFCM(onMessage?: (payload: MessagePayload) => void): UseFCMReturn {
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported] = useState(() => isMessagingSupported());

    useEffect(() => {
        // Only run on client-side
        if (!isSupported) {
            return;
        }

        // Initialize FCM
        const init = async () => {
            try {
                // Check current permission
                if ('Notification' in window) {
                    setPermission(Notification.permission);
                }

                // If already granted, get token
                if (Notification.permission === 'granted') {
                    const fcmToken = await initializeFCM();
                    setToken(fcmToken);
                }
            } catch (error) {
                console.error('Error initializing FCM:', error);
            }
        };

        init();

        // Set up message listener if callback provided
        if (onMessage) {
            const unsubscribe = onMessageListener(onMessage);
            return () => {
                if (unsubscribe) {
                    unsubscribe();
                }
            };
        }
    }, [isSupported, onMessage]);

    const requestPermission = async (): Promise<NotificationPermission> => {
        if (!isSupported) {
            return 'denied';
        }

        try {
            const newPermission = await requestNotificationPermission();
            setPermission(newPermission);

            if (newPermission === 'granted') {
                const fcmToken = await initializeFCM();
                setToken(fcmToken);
            }

            return newPermission;
        } catch (error) {
            console.error('Error requesting permission:', error);
            return 'denied';
        }
    };

    return {
        token,
        permission,
        isSupported,
        requestPermission
    };
}
