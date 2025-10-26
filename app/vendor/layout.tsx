'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNavbar } from '@/components/layout/top-navbar';
import { cn } from '@/lib/utils';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Don't apply layout to auth pages
  const isAuthPage = pathname?.startsWith('/vendor/login') || 
                     pathname?.startsWith('/vendor/register') ||
                     pathname?.startsWith('/vendor/forgot-password');

  // Redirect to login if not authenticated and not on auth page
  useEffect(() => {
    if (!isAuthenticated && !isAuthPage) {
      router.push('/vendor/login');
    }
  }, [isAuthenticated, isAuthPage, router]);

  // If auth page, render children without layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  // If not authenticated, don't render protected content
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Top Navbar */}
      <TopNavbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        open={sidebarOpen}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 overflow-y-auto pt-16 transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        )}
      >
        {children}
      </main>
    </div>
  );
}
