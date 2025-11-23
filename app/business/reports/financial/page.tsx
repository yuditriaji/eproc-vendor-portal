'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Receipt,
  CreditCard,
  Wallet,
  DollarSign,
  PieChart,
} from 'lucide-react';

export default function FinancialReportsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <p className="text-muted-foreground mt-1">
          Financial analytics and insights
        </p>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12.5M</div>
            <p className="text-xs text-muted-foreground mt-1">This fiscal year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices Processed</CardTitle>
            <Receipt className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-muted-foreground mt-1">+18% from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments Made</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,108</div>
            <p className="text-xs text-muted-foreground mt-1">$11.8M total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <Wallet className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground mt-1">Of allocated budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Analytics</CardTitle>
          <CardDescription>Detailed financial metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <PieChart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Advanced Analytics Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Detailed financial charts and visualizations will be available here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Spending by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Breakdown of procurement spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'IT Services', amount: '$3.2M', percentage: 25 },
              { name: 'Office Supplies', amount: '$2.8M', percentage: 22 },
              { name: 'Professional Services', amount: '$2.1M', percentage: 17 },
              { name: 'Equipment', amount: '$1.9M', percentage: 15 },
              { name: 'Other', amount: '$2.5M', percentage: 21 },
            ].map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">{category.amount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
