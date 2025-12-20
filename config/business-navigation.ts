import {
  LayoutDashboard,
  FileText,
  Send,
  FileCheck,
  ShoppingCart,
  Receipt,
  CreditCard,
  Wallet,
  CheckSquare,
  Building2,
  BarChart3,
  Settings,
  HelpCircle,
  FileSignature,
  Package,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { User } from '@/types';

export interface BusinessNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  roles?: string[]; // Empty array or undefined = visible to all business users
}

export interface BusinessNavSection {
  section: string;
  items: BusinessNavItem[];
  roles?: string[]; // Section-level role restriction
}

/**
 * Get navigation items based on user role
 * @param user - Current authenticated user
 * @returns Navigation sections visible to the user
 */
export function getBusinessNavigation(user: User | null): BusinessNavSection[] {
  if (!user) return [];

  const userRole = user.role;

  const allSections: BusinessNavSection[] = [
    {
      section: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          href: '/business/dashboard',
        },
      ],
    },
    {
      section: 'Procurement',
      items: [
        {
          id: 'tenders',
          label: 'Tenders',
          icon: FileText,
          href: '/business/tenders',
          roles: ['ADMIN', 'USER', 'BUYER', 'MANAGER'],
        },
        {
          id: 'bids',
          label: 'Bid Evaluation',
          icon: Send,
          href: '/business/bids',
          roles: ['ADMIN', 'USER', 'BUYER', 'MANAGER', 'APPROVER'],
        },
        {
          id: 'contracts',
          label: 'Contracts',
          icon: FileCheck,
          href: '/business/contracts',
          roles: ['ADMIN', 'BUYER', 'MANAGER', 'FINANCE'],
        },
        {
          id: 'requisitions',
          label: 'Purchase Requisitions',
          icon: FileSignature,
          href: '/business/requisitions',
          roles: ['ADMIN', 'BUYER', 'MANAGER'],
        },
        {
          id: 'purchase-orders',
          label: 'Purchase Orders',
          icon: ShoppingCart,
          href: '/business/purchase-orders',
          roles: ['ADMIN', 'BUYER', 'MANAGER', 'FINANCE'],
        },
      ],
    },
    {
      section: 'Finance',
      roles: ['ADMIN', 'FINANCE', 'MANAGER', 'APPROVER'],
      items: [
        {
          id: 'invoices',
          label: 'Invoices',
          icon: Receipt,
          href: '/business/invoices',
        },
        {
          id: 'payments',
          label: 'Payments',
          icon: CreditCard,
          href: '/business/payments',
          roles: ['ADMIN', 'FINANCE', 'MANAGER', 'APPROVER'],
        },
        {
          id: 'budgets',
          label: 'Budgets',
          icon: Wallet,
          href: '/business/budgets',
          roles: ['ADMIN', 'FINANCE', 'MANAGER'],
        },
      ],
    },
    {
      section: 'Approvals',
      roles: ['ADMIN', 'MANAGER', 'APPROVER'],
      items: [
        {
          id: 'approvals',
          label: 'Pending Approvals',
          icon: CheckSquare,
          href: '/business/approvals',
          // Badge will be set dynamically in layout
          badgeVariant: 'destructive',
        },
        {
          id: 'approval-history',
          label: 'Approval History',
          icon: TrendingUp,
          href: '/business/approvals/history',
        },
      ],
    },
    {
      section: 'Vendors',
      roles: ['ADMIN', 'USER', 'BUYER', 'MANAGER'],
      items: [
        {
          id: 'vendors',
          label: 'Vendor Directory',
          icon: Building2,
          href: '/business/vendors',
        },
        {
          id: 'vendor-performance',
          label: 'Vendor Performance',
          icon: BarChart3,
          href: '/business/vendors/performance',
          roles: ['ADMIN', 'BUYER', 'MANAGER'],
        },
      ],
    },
    {
      section: 'Reports',
      items: [
        {
          id: 'procurement-reports',
          label: 'Procurement Reports',
          icon: Package,
          href: '/business/reports/procurement',
          roles: ['ADMIN', 'USER', 'BUYER', 'MANAGER'],
        },
        {
          id: 'financial-reports',
          label: 'Financial Reports',
          icon: TrendingUp,
          href: '/business/reports/financial',
          roles: ['ADMIN', 'FINANCE', 'MANAGER'],
        },
      ],
    },
  ];

  // Filter sections and items based on user role
  return allSections
    .filter((section) => {
      // If section has role restriction, check if user has required role
      if (section.roles && section.roles.length > 0) {
        return section.roles.includes(userRole);
      }
      return true;
    })
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // If item has role restriction, check if user has required role
        if (item.roles && item.roles.length > 0) {
          return item.roles.includes(userRole);
        }
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0); // Remove empty sections
}

export const businessBottomNavigation: BusinessNavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/business/settings',
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    href: '/business/help',
  },
];

/**
 * Get user role display name
 * @param role - User role enum
 * @returns Human-readable role name
 */
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    USER: 'Procurement Officer',
    BUYER: 'Buyer',
    MANAGER: 'Manager',
    FINANCE: 'Finance Officer',
    APPROVER: 'Approver',
    ADMIN: 'Administrator',
    VENDOR: 'Vendor',
  };
  return roleNames[role] || role;
}

/**
 * Get primary color for role badge
 * @param role - User role enum
 * @returns Tailwind color class
 */
export function getRoleBadgeColor(role: string): string {
  const roleColors: Record<string, string> = {
    USER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    BUYER: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    MANAGER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    FINANCE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    APPROVER: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    ADMIN: 'bg-gray-800 text-white dark:bg-gray-300 dark:text-gray-900',
    VENDOR: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  };
  return roleColors[role] || 'bg-gray-100 text-gray-800';
}
