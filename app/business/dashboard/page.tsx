'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Send,
  FileCheck,
  Receipt,
  CreditCard,
  CheckSquare,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  AlertCircle,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { getRoleDisplayName } from '@/config/business-navigation';

export default function BusinessDashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role || '';

  // Role-based statistics (mock data - will be replaced with API calls)
  const getStatsForRole = () => {
    switch (userRole) {
      case 'USER':
        return [
          { title: 'My Tenders', value: 8, icon: FileText, change: '+2 this month', trend: 'up' },
          { title: 'Active Bids', value: 24, icon: Send, change: 'Across all tenders', trend: 'neutral' },
          { title: 'Pending Evaluation', value: 12, icon: CheckSquare, change: 'Needs scoring', trend: 'up' },
          { title: 'Awarded Tenders', value: 3, icon: TrendingUp, change: 'This quarter', trend: 'up' },
        ];
      case 'BUYER':
        return [
          { title: 'Active Contracts', value: 15, icon: FileCheck, change: '+3 this month', trend: 'up' },
          { title: 'Purchase Orders', value: 42, icon: ShoppingCart, change: '8 pending approval', trend: 'neutral' },
          { title: 'Purchase Requisitions', value: 28, icon: FileText, change: '5 awaiting PO', trend: 'neutral' },
          { title: 'Active Vendors', value: 67, icon: Users, change: '92% compliance', trend: 'up' },
        ];
      case 'MANAGER':
        return [
          { title: 'Pending Approvals', value: 18, icon: AlertCircle, change: 'Requires action', trend: 'up' },
          { title: 'Team Tenders', value: 35, icon: FileText, change: 'All departments', trend: 'neutral' },
          { title: 'Monthly Budget', value: '$485K', icon: DollarSign, change: '68% utilized', trend: 'neutral' },
          { title: 'Active Contracts', value: 52, icon: FileCheck, change: '+7 this month', trend: 'up' },
        ];
      case 'FINANCE':
        return [
          { title: 'Pending Invoices', value: 23, icon: Receipt, change: 'Awaiting approval', trend: 'up' },
          { title: 'Payment Queue', value: 15, icon: CreditCard, change: '$2.3M total', trend: 'neutral' },
          { title: 'Budget Available', value: '$1.8M', icon: DollarSign, change: '45% of total', trend: 'up' },
          { title: 'Processed Payments', value: 89, icon: CheckSquare, change: 'This month', trend: 'up' },
        ];
      case 'APPROVER':
        return [
          { title: 'Pending PRs', value: 8, icon: FileText, change: 'Awaiting approval', trend: 'up' },
          { title: 'Pending POs', value: 12, icon: ShoppingCart, change: 'Awaiting approval', trend: 'up' },
          { title: 'Pending Invoices', value: 15, icon: Receipt, change: 'Awaiting approval', trend: 'up' },
          { title: 'Approved Today', value: 24, icon: CheckSquare, change: 'All types', trend: 'up' },
        ];
      default:
        return [
          { title: 'Active Items', value: 0, icon: Package, change: 'No data', trend: 'neutral' },
        ];
    }
  };

  // Role-based quick actions
  const getQuickActionsForRole = () => {
    switch (userRole) {
      case 'USER':
        return [
          { label: 'Create Tender', icon: Plus, href: '/business/tenders/create', variant: 'default' as const },
          { label: 'Evaluate Bids', icon: Send, href: '/business/bids', variant: 'outline' as const },
          { label: 'View Reports', icon: TrendingUp, href: '/business/reports/procurement', variant: 'outline' as const },
        ];
      case 'BUYER':
        return [
          { label: 'Create Contract', icon: Plus, href: '/business/contracts/create', variant: 'default' as const },
          { label: 'Create PR', icon: FileText, href: '/business/requisitions/create', variant: 'outline' as const },
          { label: 'Create PO', icon: ShoppingCart, href: '/business/purchase-orders/create', variant: 'outline' as const },
          { label: 'Manage Vendors', icon: Users, href: '/business/vendors', variant: 'outline' as const },
        ];
      case 'MANAGER':
        return [
          { label: 'Review Approvals', icon: CheckSquare, href: '/business/approvals', variant: 'default' as const },
          { label: 'View Budgets', icon: DollarSign, href: '/business/budgets', variant: 'outline' as const },
          { label: 'Team Reports', icon: TrendingUp, href: '/business/reports/procurement', variant: 'outline' as const },
        ];
      case 'FINANCE':
        return [
          { label: 'Process Payments', icon: CreditCard, href: '/business/payments', variant: 'default' as const },
          { label: 'Approve Invoices', icon: Receipt, href: '/business/invoices', variant: 'outline' as const },
          { label: 'Manage Budgets', icon: DollarSign, href: '/business/budgets', variant: 'outline' as const },
        ];
      case 'APPROVER':
        return [
          { label: 'Pending Approvals', icon: CheckSquare, href: '/business/approvals', variant: 'default' as const },
          { label: 'Approval History', icon: Clock, href: '/business/approvals/history', variant: 'outline' as const },
        ];
      default:
        return [];
    }
  };

  // Recent activities (mock data)
  const recentActivities = [
    {
      id: '1',
      type: 'tender',
      title: 'New tender published: Office Equipment Q1 2025',
      timestamp: '2 hours ago',
      status: 'published',
    },
    {
      id: '2',
      type: 'approval',
      title: 'Purchase Requisition #PR-2025-045 approved',
      timestamp: '4 hours ago',
      status: 'approved',
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment processed: Invoice #INV-2025-123',
      timestamp: '6 hours ago',
      status: 'completed',
    },
    {
      id: '4',
      type: 'bid',
      title: 'New bid received for Tender #TND-2025-012',
      timestamp: '1 day ago',
      status: 'pending',
    },
  ];

  const stats = getStatsForRole();
  const quickActions = getQuickActionsForRole();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name} • {getRoleDisplayName(userRole)}
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs mt-1 flex items-center gap-1 ${
                  stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                }`}>
                  {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant={action.variant}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={action.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Link>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest updates across the system</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/business/reports/procurement">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {activity.type === 'tender' && <FileText className="h-4 w-4 text-primary" />}
                    {activity.type === 'approval' && <CheckSquare className="h-4 w-4 text-green-600" />}
                    {activity.type === 'payment' && <CreditCard className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'bid' && <Send className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                  <Badge variant={
                    activity.status === 'approved' || activity.status === 'completed' ? 'default' :
                    activity.status === 'pending' ? 'secondary' : 'outline'
                  }>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-Specific Sections */}
      {userRole === 'APPROVER' && (
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Urgent: Pending Approvals</CardTitle>
            </div>
            <CardDescription>Items requiring your immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                <div>
                  <p className="font-medium">Purchase Requisitions</p>
                  <p className="text-sm text-muted-foreground">8 items pending</p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/business/approvals?type=pr">Review</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                <div>
                  <p className="font-medium">Purchase Orders</p>
                  <p className="text-sm text-muted-foreground">12 items pending</p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/business/approvals?type=po">Review</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                <div>
                  <p className="font-medium">Invoices</p>
                  <p className="text-sm text-muted-foreground">15 items pending</p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/business/approvals?type=invoice">Review</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {userRole === 'FINANCE' && (
        <Card className="border-yellow-500/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <CardTitle>Payment Queue</CardTitle>
            </div>
            <CardDescription>Invoices ready for payment processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                <div>
                  <p className="font-medium">High Priority Payments</p>
                  <p className="text-sm text-muted-foreground">$850,000 • 5 invoices</p>
                </div>
                <Button size="sm" variant="default" asChild>
                  <Link href="/business/payments?priority=high">Process</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                <div>
                  <p className="font-medium">Standard Payments</p>
                  <p className="text-sm text-muted-foreground">$1,450,000 • 10 invoices</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/business/payments">View Queue</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(userRole === 'USER' || userRole === 'BUYER') && (
        <Card>
          <CardHeader>
            <CardTitle>Active Tenders Overview</CardTitle>
            <CardDescription>Tenders currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold mt-1">5</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold mt-1">12</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Under Evaluation</p>
                <p className="text-2xl font-bold mt-1">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
