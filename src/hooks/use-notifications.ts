// React hook for managing push notifications
import { useState, useEffect, useCallback } from 'react';
import {
    requestNotificationPermission,
    setupForegroundMessageListener,
    areNotificationsEnabled,
} from '@/lib/notifications';
import { toast } from 'sonner';

interface UseNotificationsOptions {
    userId?: string;
    role?: 'user' | 'admin';
    onMessageReceived?: (payload: any) => void;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
    const { userId, role, onMessageReceived } = options;
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    // Check initial permission status
    useEffect(() => {
        setIsEnabled(areNotificationsEnabled());
    }, []);

    // Setup foreground message listener
    useEffect(() => {
        const unsubscribe = setupForegroundMessageListener((payload) => {
            // Show toast notification
            toast(payload.notification?.title || 'New Notification', {
                description: payload.notification?.body,
                duration: 5000,
            });

            // Call custom handler if provided
            if (onMessageReceived) {
                onMessageReceived(payload);
            }
        });

        return unsubscribe;
    }, [onMessageReceived]);

    // Request permission and register token
    const enableNotifications = useCallback(async () => {
        if (!userId || !role) {
            toast.error('User information required');
            return false;
        }

        setIsLoading(true);
        try {
            const result = await requestNotificationPermission();

            if (!result.granted || !result.token) {
                toast.error('Notification permission denied');
                setIsLoading(false);
                return false;
            }

            setToken(result.token);

            // Register token with backend
            const response = await fetch('/api/notifications/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    role,
                    fcmToken: result.token,
                    deviceInfo: navigator.userAgent,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to register token');
            }

            setIsEnabled(true);
            toast.success('Notifications enabled successfully');
            return true;
        } catch (error) {
            console.error('Error enabling notifications:', error);
            toast.error('Failed to enable notifications');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [userId, role]);

    // Disable notifications
    const disableNotifications = useCallback(async () => {
        if (!userId || !token) {
            return false;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/notifications/register', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    fcmToken: token,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to unregister token');
            }

            setIsEnabled(false);
            setToken(null);
            toast.success('Notifications disabled');
            return true;
        } catch (error) {
            console.error('Error disabling notifications:', error);
            toast.error('Failed to disable notifications');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [userId, token]);

    return {
        isEnabled,
        isLoading,
        token,
        enableNotifications,
        disableNotifications,
    };
}
