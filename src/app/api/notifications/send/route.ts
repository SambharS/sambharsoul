// API route for sending push notifications
import { NextRequest, NextResponse } from 'next/server';
import {
    sendNotificationToRole,
    sendNotificationToUser,
    NotificationTemplates,
} from '@/lib/notification-sender';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, orderId, userId, role, amount } = body;

        let result;

        switch (type) {
            case 'new_order':
                // Notify all admins about new order
                result = await sendNotificationToRole('admin', NotificationTemplates.newOrder(orderId));
                break;

            case 'order_confirmed':
                // Notify specific user
                result = await sendNotificationToUser(userId, NotificationTemplates.orderConfirmed(orderId));
                break;

            case 'order_preparing':
                result = await sendNotificationToUser(userId, NotificationTemplates.orderPreparing(orderId));
                break;

            case 'order_ready':
                result = await sendNotificationToUser(userId, NotificationTemplates.orderReady(orderId));
                break;

            case 'order_completed':
                result = await sendNotificationToUser(userId, NotificationTemplates.orderCompleted(orderId));
                break;

            case 'payment_confirmed':
                result = await sendNotificationToRole('admin', NotificationTemplates.paymentConfirmed(orderId, amount));
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid notification type' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: result.success,
            sentCount: result.sentCount,
            errors: result.errors,
        });
    } catch (error) {
        console.error('Error in notification API:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
