import {
  LayoutDashboard,
  FileText,
  Send,
  FileCheck,
  FileSignature,
  FolderOpen,
  Receipt,
  CreditCard,
  Building2,
  TrendingUp,
  Shield,
  Settings,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export const sidebarNavigation: NavSection[] = [
  {
    section: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/vendor/dashboard',
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
        href: '/vendor/tenders',
        badge: 12,
        badgeVariant: 'default',
      },
      {
        id: 'my-bids',
        label: 'My Bids',
        icon: Send,
        href: '/vendor/bids',
        badge: 3,
        badgeVariant: 'secondary',
      },
      {
        id: 'contracts',
        label: 'Contracts',
        icon: FileCheck,
        href: '/vendor/contracts',
      },
      {
        id: 'quotations',
        label: 'Quotations',
        icon: FileSignature,
        href: '/vendor/quotations',
      },
    ],
  },
  {
    section: 'Management',
    items: [
      {
        id: 'documents',
        label: 'Documents',
        icon: FolderOpen,
        href: '/vendor/documents',
      },
      {
        id: 'invoices',
        label: 'Invoices',
        icon: Receipt,
        href: '/vendor/invoices',
        badge: 2,
        badgeVariant: 'destructive',
      },
      {
        id: 'payments',
        label: 'Payments',
        icon: CreditCard,
        href: '/vendor/payments',
      },
    ],
  },
  {
    section: 'Company',
    items: [
      {
        id: 'profile',
        label: 'Company Profile',
        icon: Building2,
        href: '/vendor/profile',
      },
      {
        id: 'performance',
        label: 'Performance',
        icon: TrendingUp,
        href: '/vendor/performance',
      },
      {
        id: 'compliance',
        label: 'Compliance',
        icon: Shield,
        href: '/vendor/compliance',
        badge: 1,
        badgeVariant: 'secondary',
      },
    ],
  },
];

export const bottomNavigation: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/vendor/settings',
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    href: '/vendor/help',
  },
];
