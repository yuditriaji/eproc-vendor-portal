'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export default function VendorPerformancePage() {
  // Mock data - will be replaced with actual API calls
  const performanceMetrics = {
    overall: 87.5,
    quality: 92,
    delivery: 85,
    compliance: 90,
    responsiveness: 83,
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Vendor Performance</h1>
        <p className="text-muted-foreground mt-1">
          Performance analytics and vendor ratings
        </p>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance Score</CardTitle>
          <CardDescription>Average performance across all vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <div className="text-6xl font-bold text-green-600">
                {performanceMetrics.overall}
              </div>
              <div className="text-center text-sm text-muted-foreground mt-2">
                Out of 100
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Rating</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{performanceMetrics.quality}%</div>
            <p className="text-xs text-muted-foreground mt-1">Product/service quality</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{performanceMetrics.delivery}%</div>
            <p className="text-xs text-muted-foreground mt-1">Delivery punctuality</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{performanceMetrics.compliance}%</div>
            <p className="text-xs text-muted-foreground mt-1">Policy adherence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responsiveness</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{performanceMetrics.responsiveness}%</div>
            <p className="text-xs text-muted-foreground mt-1">Communication speed</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Details</CardTitle>
          <CardDescription>Detailed vendor performance analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Performance Analytics Coming Soon</h3>
            <p className="text-muted-foreground mt-2">
              Detailed charts and vendor comparison will be available here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Vendors</CardTitle>
          <CardDescription>Vendors with highest performance scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold">
                    #{i}
                  </div>
                  <div>
                    <div className="font-semibold">Vendor {i}</div>
                    <div className="text-sm text-muted-foreground">Category A</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{95 - i * 2}%</div>
                  <div className="text-xs text-muted-foreground">Overall Score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warning Card */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-yellow-900 dark:text-yellow-100">
              Vendors Needing Attention
            </CardTitle>
          </div>
          <CardDescription>Vendors with declining performance scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            No vendors currently require attention
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
