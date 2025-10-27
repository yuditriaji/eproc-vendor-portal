'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, CreditCard, DollarSign, TrendingUp } from 'lucide-react';

export default function FinanceDashboardPage() {
  const stats = [
    { title: 'Pending Invoices', value: '24', icon: Receipt },
    { title: 'Scheduled Payments', value: '18', icon: CreditCard },
    { title: 'Total Payable', value: '$850K', icon: DollarSign },
    { title: 'This Month', value: '$1.2M', icon: TrendingUp },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <p className="text-muted-foreground mt-1">Invoice and payment management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">Financial Operations</h3>
          <p className="text-muted-foreground">
            Manage invoices, payments, and financial reporting
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
