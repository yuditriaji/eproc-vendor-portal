'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { cn } from '@/lib/utils';
import { isBusinessUser } from '@/utils/permissions';
import { getBusinessNavigation, businessBottomNavigation, getRoleDisplayName, getRoleBadgeColor } from '@/config/business-navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  User as UserIcon,
  LogOut,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { useLogoutMutation } from '@/store/api/authApi';

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const [logout] = useLogoutMutation();

  // Don't apply layout to auth pages
  const isAuthPage = pathname?.startsWith('/business/login') || 
                     pathname?.startsWith('/business/register');

  // RBAC: Check if user is a business user (not VENDOR, not ADMIN)
  useEffect(() => {
    if (!isAuthenticated && !isAuthPage) {
      router.push('/vendor/login'); // Redirect to login
      return;
    }
    
    // Check if authenticated user is a business user
    if (isAuthenticated && !isAuthPage && !isBusinessUser(user)) {
      // If VENDOR, redirect to vendor portal
      if (user?.role === 'VENDOR') {
        router.push('/vendor/dashboard');
        return;
      }
      // Otherwise unauthorized
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isAuthPage, user, router]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.push('/vendor/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // If auth page, render children without layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  // If not authenticated, don't render protected content
  if (!isAuthenticated) {
    return null;
  }

  // Get role-based navigation
  const navigation = getBusinessNavigation(user);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Logo + Menu Toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">eP</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold">e-Procurement</h1>
                <p className="text-xs text-muted-foreground">Business Portal</p>
              </div>
            </div>
          </div>

          {/* Right: User Info + Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <div className="hidden md:flex items-center gap-3 ml-3 pl-3 border-l">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <Badge className={cn('text-xs', getRoleBadgeColor(user?.role || ''))}>
                  {getRoleDisplayName(user?.role || '')}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 bottom-0 z-30 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-60',
          'hidden lg:block'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            {navigation.map((section) => (
              <div key={section.section} className="mb-6">
                {!sidebarCollapsed && (
                  <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.section}
                  </h3>
                )}
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
                          sidebarCollapsed && 'justify-center'
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-slate-200 dark:border-slate-700 py-4">
            {businessBottomNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
                    sidebarCollapsed && 'justify-center'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Collapse Toggle */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 bottom-0 z-50 w-60 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Navigation (same as desktop) */}
          <div className="flex-1 overflow-y-auto py-4">
            {navigation.map((section) => (
              <div key={section.section} className="mb-6">
                <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.section}
                </h3>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-slate-200 dark:border-slate-700 py-4">
            {businessBottomNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile User Info */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <Badge className={cn('text-xs mt-1', getRoleBadgeColor(user?.role || ''))}>
                  {getRoleDisplayName(user?.role || '')}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setSidebarOpen(false);
                handleLogout();
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

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
