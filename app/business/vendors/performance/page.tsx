'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useGetVendorPerformanceStatsQuery } from '@/store/api/businessApi';

export default function VendorPerformancePage() {
  // @ts-ignore - RTK Query void parameter
  const { data: performanceData, isLoading } = useGetVendorPerformanceStatsQuery();

  // Default values when no data
  const summary = performanceData?.summary || {
    totalVendors: 0,
    vendorsWithRating: 0,
    overallScore: 0,
    averageRating: 0,
    averageOnTimeDelivery: 0,
  };

  const metrics = performanceData?.metrics || {
    quality: 0,
    delivery: 0,
    compliance: 0,
    responsiveness: 0,
  };

  const topPerformers = performanceData?.topPerformers || [];
  const lowPerformers = performanceData?.lowPerformers || [];

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
          <CardDescription>
            Average performance across {summary.totalVendors} vendor{summary.totalVendors !== 1 ? 's' : ''}
            {summary.vendorsWithRating > 0 && ` (${summary.vendorsWithRating} with ratings)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            {isLoading ? (
              <Skeleton className="h-20 w-32" />
            ) : (
              <div className="relative">
                <div className={`text-6xl font-bold ${summary.overallScore >= 70 ? 'text-green-600' : summary.overallScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {summary.overallScore}
                </div>
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Out of 100
                </div>
              </div>
            )}
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
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-600">{metrics.quality}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {summary.vendorsWithRating} vendor ratings
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">{metrics.delivery}%</div>
                <p className="text-xs text-muted-foreground mt-1">Delivery punctuality</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{metrics.compliance}%</div>
                <p className="text-xs text-muted-foreground mt-1">Policy adherence</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responsiveness</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">{metrics.responsiveness}%</div>
                <p className="text-xs text-muted-foreground mt-1">Communication speed</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Details Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Details</CardTitle>
          <CardDescription>Detailed vendor performance analytics</CardDescription>
        </CardHeader>
        <CardContent>
          {summary.vendorsWithRating === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Performance Data Yet</h3>
              <p className="text-muted-foreground mt-2">
                Rate vendors to see performance analytics here
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Performance Charts Coming Soon</h3>
              <p className="text-muted-foreground mt-2">
                Detailed charts and trend analysis will be available here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Vendors</CardTitle>
          <CardDescription>Vendors with highest performance scores</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : topPerformers.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              No vendors with ratings yet. Rate vendors to see top performers.
            </div>
          ) : (
            <div className="space-y-4">
              {topPerformers.map((vendor: any) => (
                <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold">
                      #{vendor.rank}
                    </div>
                    <div>
                      <div className="font-semibold">{vendor.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {vendor.businessType || 'No category'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{vendor.score}%</div>
                    <div className="text-xs text-muted-foreground">
                      Rating: {vendor.rating.toFixed(1)}/5
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning Card - Vendors Needing Attention */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-yellow-900 dark:text-yellow-100">
              Vendors Needing Attention
            </CardTitle>
          </div>
          <CardDescription>Vendors with low performance scores (below 60%)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : lowPerformers.length === 0 ? (
            <div className="text-muted-foreground">
              No vendors currently require attention
            </div>
          ) : (
            <div className="space-y-3">
              {lowPerformers.map((vendor: any) => (
                <div key={vendor.id} className="flex items-center justify-between p-3 border border-yellow-300 rounded-lg bg-yellow-100/50 dark:bg-yellow-900/20">
                  <div>
                    <div className="font-semibold text-yellow-900 dark:text-yellow-100">{vendor.name}</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-200">
                      {vendor.businessType || 'No category'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{vendor.score}%</div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">
                      Rating: {vendor.rating.toFixed(1)}/5
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
