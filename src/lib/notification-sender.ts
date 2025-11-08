// Server-side notification sender
import { adminMessaging } from './firebase-admin';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    data?: Record<string, string>;
}

/**
 * Send notification to specific users by role
 */
export async function sendNotificationToRole(
    role: 'user' | 'admin',
    payload: NotificationPayload
): Promise<{ success: boolean; sentCount: number; errors: number }> {
    try {
        // Get all tokens for the role
        const { data: tokens, error } = await supabase
            .from('fcm_tokens')
            .select('fcm_token')
            .eq('role', role);

        if (error || !tokens || tokens.length === 0) {
            console.error('No tokens found for role:', role, error);
            return { success: false, sentCount: 0, errors: 0 };
        }

        const fcmTokens = tokens.map(t => t.fcm_token);
        return await sendNotificationToTokens(fcmTokens, payload);
    } catch (error) {
        console.error('Error sending notification to role:', error);
        return { success: false, sentCount: 0, errors: 0 };
    }
}

/**
 * Send notification to specific user
 */
export async function sendNotificationToUser(
    userId: string,
    payload: NotificationPayload
): Promise<{ success: boolean; sentCount: number; errors: number }> {
    try {
        // Get all tokens for the user
        const { data: tokens, error } = await supabase
            .from('fcm_tokens')
            .select('fcm_token')
            .eq('user_id', userId);

        if (error || !tokens || tokens.length === 0) {
            console.error('No tokens found for user:', userId, error);
            return { success: false, sentCount: 0, errors: 0 };
        }

        const fcmTokens = tokens.map(t => t.fcm_token);
        return await sendNotificationToTokens(fcmTokens, payload);
    } catch (error) {
        console.error('Error sending notification to user:', error);
        return { success: false, sentCount: 0, errors: 0 };
    }
}

/**
 * Send notification to multiple tokens
 */
export async function sendNotificationToTokens(
    tokens: string[],
    payload: NotificationPayload
): Promise<{ success: boolean; sentCount: number; errors: number }> {
    try {
        if (tokens.length === 0) {
            return { success: false, sentCount: 0, errors: 0 };
        }

        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
                icon: payload.icon || '/icon-192x192.png',
            },
            data: payload.data || {},
        };

        const response = await adminMessaging.sendEachForMulticast({
            tokens,
            ...message,
        });

        console.log('Notification sent:', {
            success: response.successCount,
            failed: response.failureCount,
        });

        // Clean up invalid tokens
        if (response.failureCount > 0) {
            const invalidTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    invalidTokens.push(tokens[idx]);
                }
            });

            if (invalidTokens.length > 0) {
                await cleanupInvalidTokens(invalidTokens);
            }
        }

        return {
            success: response.successCount > 0,
            sentCount: response.successCount,
            errors: response.failureCount,
        };
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, sentCount: 0, errors: tokens.length };
    }
}

/**
 * Remove invalid tokens from database
 */
async function cleanupInvalidTokens(tokens: string[]): Promise<void> {
    try {
        const { error } = await supabase
            .from('fcm_tokens')
            .delete()
            .in('fcm_token', tokens);

        if (error) {
            console.error('Error cleaning up invalid tokens:', error);
        } else {
            console.log('Cleaned up invalid tokens:', tokens.length);
        }
    } catch (error) {
        console.error('Error cleaning up invalid tokens:', error);
    }
}

/**
 * Notification templates for common scenarios
 */
export const NotificationTemplates = {
    newOrder: (orderId: string): NotificationPayload => ({
        title: '🔔 New Order Received',
        body: `Order #${orderId.slice(0, 8)} has been placed!`,
        data: { orderId, type: 'new_order' },
    }),

    orderConfirmed: (orderId: string): NotificationPayload => ({
        title: '✅ Order Confirmed',
        body: 'Your order has been confirmed and is being prepared.',
        data: { orderId, type: 'order_confirmed' },
    }),

    orderPreparing: (orderId: string): NotificationPayload => ({
        title: '🍳 Order Being Prepared',
        body: 'Your delicious food is being prepared!',
        data: { orderId, type: 'order_preparing' },
    }),

    orderReady: (orderId: string): NotificationPayload => ({
        title: '🍱 Order Ready for Pickup',
        body: 'Your order is ready! Come pick it up.',
        data: { orderId, type: 'order_ready' },
    }),

    orderCompleted: (orderId: string): NotificationPayload => ({
        title: '🎉 Order Completed',
        body: 'Enjoy your meal! Thank you for ordering.',
        data: { orderId, type: 'order_completed' },
    }),

    paymentConfirmed: (orderId: string, amount: number): NotificationPayload => ({
        title: '💰 Payment Confirmed',
        body: `Payment of ₹${amount.toFixed(2)} received for order #${orderId.slice(0, 8)}`,
        data: { orderId, type: 'payment_confirmed', amount: amount.toString() },
    }),
};
