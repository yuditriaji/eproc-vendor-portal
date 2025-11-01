'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Users, 
  Building2, 
  Database, 
  Settings,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Users', value: '156', icon: Users, trend: '+12 this month' },
    { title: 'Active Tenants', value: '8', icon: Building2, trend: '+2 this month' },
    { title: 'System Health', value: '99.9%', icon: CheckCircle, trend: 'All systems operational' },
    { title: 'Active Contracts', value: '45', icon: TrendingUp, trend: '+5 this week' },
  ];

  const quickActions = [
    { title: 'User Management', href: '/admin/users', icon: Users, description: 'Manage user accounts and permissions' },
    { title: 'Tenant Configuration', href: '/admin/tenant', icon: Building2, description: 'Configure tenant settings' },
    { title: 'Organizational Setup', href: '/admin/configuration/organization/company-codes', icon: Database, description: 'Manage organizational structure' },
    { title: 'System Settings', href: '/admin/configuration/basis', icon: Settings, description: 'Configure system parameters' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          System administration and configuration management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">API Services</span>
              </div>
              <Badge variant="secondary">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Database</span>
              </div>
              <Badge variant="secondary">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Background Jobs</span>
              </div>
              <Badge variant="outline">Minor Issues</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
