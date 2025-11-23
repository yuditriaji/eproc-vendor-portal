'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  FileText,
  ShoppingCart,
  Award,
  DollarSign,
} from 'lucide-react';

export default function ProcurementReportsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Procurement Reports</h1>
        <p className="text-muted-foreground mt-1">
          Analytics and insights for procurement activities
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenders</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchase Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground mt-1">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground mt-1">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Procurement Analytics</CardTitle>
          <CardDescription>Detailed procurement metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Detailed Reports Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Advanced analytics and visualizations will be available here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Savings Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Savings Analysis</CardTitle>
          <CardDescription>Procurement savings and optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-semibold">Total Savings (YTD)</div>
                  <div className="text-sm text-muted-foreground">Compared to estimates</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">$1.2M</div>
                <div className="text-xs text-muted-foreground">15% savings</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
