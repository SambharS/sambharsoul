import { supabaseAdmin } from './supabase';

/**
 * Creates a Supabase client with admin user context for RLS policies
 * This allows admin operations to bypass customer restrictions
 */
export async function getAdminSupabaseClient(userId: string) {
    // Set the user context for RLS policies
    const { data, error } = await supabaseAdmin.rpc('set_config', {
        setting: 'app.current_user_id',
        value: userId
    });

    if (error) {
        console.warn('Could not set user context:', error);
    }

    return supabaseAdmin;
}

/**
 * Verify if a user is an admin
 */
export async function verifyAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

    if (error || !data) {
        return false;
    }

    return data.role === 'admin';
}

/**
 * Get admin user by username
 */
export async function getAdminByUsername(username: string) {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('role', 'admin')
        .single();

    if (error) {
        return null;
    }

    return data;
}
