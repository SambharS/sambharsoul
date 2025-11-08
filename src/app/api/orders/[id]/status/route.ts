// API route for updating order status with notifications
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        // Update order status
        const { data: order, error } = await supabase
            .from('orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*, user:users(*)')
            .single();

        if (error) {
            console.error('Error updating order status:', error);
            return NextResponse.json(
                { error: 'Failed to update order status' },
                { status: 500 }
            );
        }

        // Send notification based on status
        const notificationMap: Record<string, string> = {
            'Confirmed': 'order_confirmed',
            'Preparing': 'order_preparing',
            'Ready': 'order_ready',
            'Completed': 'order_completed',
            'Accepted': 'order_confirmed',
            'Processing': 'order_preparing',
            'Out for Delivery': 'order_ready',
            'Delivered': 'order_completed',
        };

        const notificationType = notificationMap[status];
        if (notificationType && order.user_id) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: notificationType,
                        orderId: id,
                        userId: order.user_id,
                    }),
                });
            } catch (notifError) {
                console.error('Failed to send notification:', notifError);
                // Don't fail the status update if notification fails
            }
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error in status update API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
