import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Find user by username using admin client to bypass RLS
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Return user data (excluding password hash)
        const { password_hash, ...userData } = user;

        return NextResponse.json({
            user: userData,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Error during login:', error);
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        );
    }
}
