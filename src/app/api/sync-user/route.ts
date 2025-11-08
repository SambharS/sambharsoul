import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { firebaseUid, email, name, phone } = await request.json();

        if (!firebaseUid) {
            return NextResponse.json(
                { error: 'Firebase UID is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('firebase_uid', firebaseUid)
            .single();

        if (existingUser) {
            return NextResponse.json({ user: existingUser });
        }

        // Create new user if doesn't exist
        if (fetchError?.code === 'PGRST116') {
            const { data: newUser, error: insertError } = await supabaseAdmin
                .from('users')
                .insert({
                    firebase_uid: firebaseUid,
                    email: email || null, // Email is optional for phone auth
                    name: name || 'User',
                    phone,
                    role: 'customer'
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating user:', insertError);
                return NextResponse.json(
                    { error: 'Failed to create user' },
                    { status: 500 }
                );
            }

            return NextResponse.json({ user: newUser });
        }

        // Other errors
        console.error('Error fetching user:', fetchError);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    } catch (error) {
        console.error('Sync user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
