'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, ShoppingCart, Package, TrendingUp, Plus } from 'lucide-react';

export default function BuyerDashboardPage() {
  const stats = [
    { title: 'Active Tenders', value: '12', icon: FileText },
    { title: 'Purchase Orders', value: '35', icon: ShoppingCart },
    { title: 'Pending Approvals', value: '8', icon: Package },
    { title: 'This Month', value: '$2.5M', icon: TrendingUp },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Procurement management and tender oversight</p>
        </div>
        <Button asChild>
          <Link href="/buyer/procurement/tenders/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Tender
          </Link>
        </Button>
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
          <h3 className="text-lg font-semibold mb-2">Procurement Workflows</h3>
          <p className="text-muted-foreground mb-4">
            Manage tenders, purchase requisitions, and purchase orders
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href="/buyer/procurement/tenders">View Tenders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/buyer/procurement/purchase-orders">View Purchase Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
