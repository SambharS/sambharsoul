'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/admin-auth-context';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, loading, signOut, isAdmin } = useAdminAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Don't redirect if we're on the login page or still loading
        if (loading || pathname === '/admin/login') return;

        // Redirect to login if not authenticated or not admin
        if (!user || !isAdmin) {
            router.push('/admin/login');
        }
    }, [user, isAdmin, loading, router, pathname]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Show login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // Show nothing while redirecting
    if (!user || !isAdmin) {
        return null;
    }

    // Show admin content with logout button
    return (
        <div className="min-h-screen">
            {/* Admin Header with Logout */}
            <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">AD</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                                <p className="text-xs text-muted-foreground">Welcome, {user.name || user.username}</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={signOut}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminAuthProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminAuthProvider>
    );
}
