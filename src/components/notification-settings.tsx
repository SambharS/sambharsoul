'use client';

import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Loader2 } from 'lucide-react';

interface NotificationSettingsProps {
    userId: string;
    role: 'user' | 'admin';
}

export function NotificationSettings({ userId, role }: NotificationSettingsProps) {
    const { isEnabled, isLoading, enableNotifications, disableNotifications } = useNotifications({
        userId,
        role,
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Push Notifications
                </CardTitle>
                <CardDescription>
                    Get real-time updates about your orders
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            {isEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {isEnabled
                                ? 'You will receive push notifications for order updates'
                                : 'Enable to receive real-time order updates'}
                        </p>
                    </div>
                    <Button
                        onClick={isEnabled ? disableNotifications : enableNotifications}
                        disabled={isLoading}
                        variant={isEnabled ? 'outline' : 'default'}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : isEnabled ? (
                            <>
                                <BellOff className="mr-2 h-4 w-4" />
                                Disable
                            </>
                        ) : (
                            <>
                                <Bell className="mr-2 h-4 w-4" />
                                Enable
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
