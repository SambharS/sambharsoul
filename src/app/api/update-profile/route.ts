import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { firebaseUid, name } = await request.json();

        if (!firebaseUid || !name) {
            return NextResponse.json(
                { error: 'Firebase UID and name are required' },
                { status: 400 }
            );
        }

        // Update user name in Supabase
        const { data, error } = await supabaseAdmin
            .from('users')
            .update({ name: name.trim() })
            .eq('firebase_uid', firebaseUid)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return NextResponse.json(
                { error: 'Failed to update profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({ user: data });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
