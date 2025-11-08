import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        // Check if admin user exists
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, username, email, role, password_hash')
            .eq('username', 'ravi')
            .single();

        if (error) {
            return NextResponse.json({
                exists: false,
                error: error.message,
                fix: 'Run CREATE_ADMIN_NOW.sql in Supabase SQL Editor'
            });
        }

        return NextResponse.json({
            exists: true,
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                hasPassword: !!user.password_hash
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            exists: false,
            error: error.message
        }, { status: 500 });
    }
}
