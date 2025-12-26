'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { isAdmin } from '@/utils/permissions';
import {
  LayoutDashboard,
  Building2,
  Settings,
  Database,
  Users,
  Shield,
  CheckCircle,
  Menu,
  X,
  ChevronDown,
  Network,
  Loader2
} from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Configuration',
    icon: Settings,
    children: [
      {
        title: 'Basis Configuration',
        href: '/admin/configuration/basis',
        icon: Settings,
      },
      {
        title: 'Organization',
        icon: Network,
        children: [
          {
            title: 'Company Codes',
            href: '/admin/configuration/organization/company-codes',
            icon: Building2,
          },
          {
            title: 'Plants',
            href: '/admin/configuration/organization/plants',
            icon: Building2,
          },
          {
            title: 'Storage Locations',
            href: '/admin/configuration/organization/storage-locations',
            icon: Database,
          },
          {
            title: 'Purchasing Orgs',
            href: '/admin/configuration/organization/purchasing-orgs',
            icon: Building2,
          },
          {
            title: 'Purchasing Org Assignments',
            href: '/admin/configuration/organization/porg-assignments',
            icon: Network,
          },
          {
            title: 'Purchasing Groups',
            href: '/admin/configuration/organization/purchasing-groups',
            icon: Users,
          },
          {
            title: 'Org Units (Budget)',
            href: '/admin/configuration/organization/org-units',
            icon: Network,
          },
        ],
      },
      {
        title: 'Master Data',
        icon: Database,
        children: [
          {
            title: 'Currencies',
            href: '/admin/configuration/master-data/currencies',
            icon: Database,
          },
          {
            title: 'Vendors',
            href: '/admin/configuration/master-data/vendors',
            icon: Users,
          },
        ],
      },
    ],
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Roles & Permissions',
    href: '/admin/roles',
    icon: Shield,
  },
  {
    title: 'Validation',
    href: '/admin/validation',
    icon: CheckCircle,
  },
];

function NavItemComponent({ item, level = 0 }: { item: NavItem; level?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? pathname === item.href : false;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors',
            level > 0 && 'ml-4'
          )}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </div>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </button>
        {isOpen && item.children && (
          <div className="mt-1 space-y-1">
            {item.children.map((child, index) => (
              <NavItemComponent key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors',
        level > 0 && 'ml-4',
        isActive && 'bg-accent font-medium'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.title}</span>
    </Link>
  );
}

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated and has ADMIN role (enum or RBAC)
    if (!isAuthenticated) {
      const tenant = searchParams.get('tenant') || 'default';
      router.replace(`/admin/login?tenant=${tenant}`);
      return;
    }

    // Check both enum and RBAC roles
    if (!isAdmin(user)) {
      router.replace('/unauthorized');
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, router, searchParams]);

  if (isLoading || !isAuthenticated || !isAdmin(user)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">Admin Panel</h2>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              {navigation.map((item, index) => (
                <NavItemComponent key={index} item={item} />
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-card border-b p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Administrator Dashboard</h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
