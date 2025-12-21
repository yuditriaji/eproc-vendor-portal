'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Send, FileCheck, TrendingUp, ArrowRight, Calendar, DollarSign, Clock } from 'lucide-react';
import { useGetDashboardStatsQuery, useGetTendersQuery } from '@/store/api/procurementApi';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { data: statsResponse, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const stats = statsResponse?.data;

  // Fetch real recent tenders
  const { data: tendersResponse, isLoading: tendersLoading } = useGetTendersQuery({
    page: 1,
    pageSize: 5,
    status: 'PUBLISHED',
  });
  const recentTenders = tendersResponse?.data || [];

  const statCards = [
    {
      title: 'Active Tenders',
      value: stats?.activeTenders ?? 0,
      icon: FileText,
      trend: 'Published tenders',
      trendUp: true,
    },
    {
      title: 'My Bids',
      value: stats?.totalBids ?? 0,
      icon: Send,
      trend: 'Total submitted',
      trendUp: true,
    },
    {
      title: 'Contracts',
      value: stats?.contracts ?? 0,
      icon: FileCheck,
      trend: 'Active contracts',
      trendUp: false,
    },
    {
      title: 'Success Rate',
      value: `${stats?.successRate ?? 0}%`,
      icon: TrendingUp,
      trend: 'Win ratio',
      trendUp: true,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your procurement activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stat.value}
                </div>
                <p className={`text-xs mt-1 flex items-center gap-1 ${stat.trendUp ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                  }`}>
                  {stat.trendUp && <TrendingUp className="h-3 w-3" />}
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Tender Opportunities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Tender Opportunities</CardTitle>
                  <CardDescription>New tenders matching your profile</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/vendor/tenders">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tendersLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))
                ) : recentTenders.length > 0 ? (
                  recentTenders.map((tender: any) => {
                    const closingDate = tender.closingDate || tender.submissionDeadline;
                    const daysRemaining = closingDate
                      ? Math.ceil((new Date(closingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : null;

                    return (
                      <div
                        key={tender.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                        onClick={() => window.location.href = `/vendor/tenders/${tender.id}`}
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {tender.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {closingDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Closing: {formatDate(closingDate)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(tender.estimatedValue || tender.budget || 0, tender.currency?.code || 'USD')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {tender.tenderNumber}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="default">Published</Badge>
                          {daysRemaining !== null && (
                            <span className={`text-xs flex items-center gap-1 ${daysRemaining <= 7 ? 'text-red-600 font-medium' : 'text-muted-foreground'
                              }`}>
                              <Clock className="h-3 w-3" />
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Closing soon'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No active tenders available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/vendor/tenders">
                  <FileText className="mr-2 h-4 w-4" />
                  Browse Tenders
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/vendor/quotations">
                  <Send className="mr-2 h-4 w-4" />
                  View Quotations
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/vendor/bids">
                  <FileCheck className="mr-2 h-4 w-4" />
                  View My Bids
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alerts & Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    {recentTenders.length} Active Tenders
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Review opportunities before deadlines
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
