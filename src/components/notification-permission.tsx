'use client';

import { useState } from 'react';
import { useFCM } from '@/hooks/use-fcm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPermissionProps {
    onTokenReceived?: (token: string) => void;
}

export function NotificationPermission({ onTokenReceived }: NotificationPermissionProps) {
    const [requesting, setRequesting] = useState(false);
    const { toast } = useToast();

    const { token, permission, isSupported, requestPermission } = useFCM((payload) => {
        // Handle foreground messages
        toast({
            title: payload.notification?.title || 'New Notification',
            description: payload.notification?.body || '',
        });
    });

    const handleRequestPermission = async () => {
        setRequesting(true);
        try {
            const result = await requestPermission();

            if (result === 'granted') {
                toast({
                    title: 'Notifications Enabled!',
                    description: 'You will receive order updates',
                });

                // Call callback with token if provided
                if (token && onTokenReceived) {
                    onTokenReceived(token);
                }
            } else if (result === 'denied') {
                toast({
                    title: 'Notifications Blocked',
                    description: 'Please enable notifications in your browser settings',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
            toast({
                title: 'Error',
                description: 'Failed to enable notifications',
                variant: 'destructive',
            });
        } finally {
            setRequesting(false);
        }
    };

    // Don't show if not supported
    if (!isSupported) {
        return null;
    }

    // Don't show if already granted
    if (permission === 'granted') {
        return (
            <Card className="border-green-200 bg-green-50">
                <CardContent className="flex items-center gap-3 p-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">
                            Notifications Enabled
                        </p>
                        <p className="text-xs text-green-700">
                            You'll receive order updates
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Don't show if denied (user must enable in browser settings)
    if (permission === 'denied') {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="flex items-center gap-3 p-4">
                    <BellOff className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">
                            Notifications Blocked
                        </p>
                        <p className="text-xs text-red-700">
                            Enable in browser settings to receive updates
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show request button
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Enable Notifications
                </CardTitle>
                <CardDescription>
                    Get real-time updates about your orders
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    onClick={handleRequestPermission}
                    disabled={requesting}
                    className="w-full"
                >
                    {requesting ? 'Requesting...' : 'Enable Notifications'}
                </Button>
            </CardContent>
        </Card>
    );
}
