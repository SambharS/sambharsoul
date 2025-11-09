'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X } from 'lucide-react';
import { areNotificationsEnabled } from '@/lib/notifications';

interface NotificationPromptProps {
    userId: string;
    role: 'user' | 'admin';
    onEnable?: () => void;
    onDismiss?: () => void;
}

/**
 * Prompt component to encourage users to enable notifications
 * Shows only if notifications are not enabled and user hasn't dismissed
 */
export function NotificationPrompt({ userId, role, onEnable, onDismiss }: NotificationPromptProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check if already enabled
        if (areNotificationsEnabled()) {
            setIsVisible(false);
            return;
        }

        // Check if user has dismissed the prompt
        const dismissed = localStorage.getItem(`notification-prompt-dismissed-${userId}`);
        if (dismissed) {
            setIsVisible(false);
            return;
        }

        // Show prompt after a short delay
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, [userId]);

    const handleEnable = async () => {
        setIsLoading(true);
        try {
            const { requestNotificationPermission } = await import('@/lib/notifications');
            const result = await requestNotificationPermission();

            if (result.granted && result.token) {
                // Register token
                await fetch('/api/notifications/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        role,
                        fcmToken: result.token,
                        deviceInfo: navigator.userAgent,
                    }),
                });

                setIsVisible(false);
                onEnable?.();
            } else if (result.error) {
                console.warn('Notification permission error:', result.error);
                // Don't show error to user, just hide the prompt
                setIsVisible(false);
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
            // Hide prompt on error
            setIsVisible(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem(`notification-prompt-dismissed-${userId}`, 'true');
        setIsVisible(false);
        onDismiss?.();
    };

    if (!isVisible) {
        return null;
    }

    return (
        <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">Enable Notifications</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleDismiss}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <CardDescription>
                    {role === 'admin'
                        ? 'Get instant alerts when new orders come in'
                        : 'Stay updated with real-time order status notifications'}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <Button
                    onClick={handleEnable}
                    disabled={isLoading}
                    className="w-full"
                    size="sm"
                >
                    {isLoading ? 'Enabling...' : 'Enable Notifications'}
                </Button>
            </CardContent>
        </Card>
    );
}
