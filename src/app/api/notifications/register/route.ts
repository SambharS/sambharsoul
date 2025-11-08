// API route for registering FCM tokens
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, role, fcmToken, deviceInfo } = body;

        if (!userId || !role || !fcmToken) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('fcm_tokens')
            .upsert({
                user_id: userId,
                role,
                fcm_token: fcmToken,
                device_info: deviceInfo || null,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,fcm_token'
            });

        if (error) {
            console.error('Error registering FCM token:', error);
            return NextResponse.json(
                { error: 'Failed to register token' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in register API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, fcmToken } = body;

        if (!userId || !fcmToken) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('fcm_tokens')
            .delete()
            .eq('user_id', userId)
            .eq('fcm_token', fcmToken);

        if (error) {
            console.error('Error removing FCM token:', error);
            return NextResponse.json(
                { error: 'Failed to remove token' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in delete API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
