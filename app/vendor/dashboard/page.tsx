'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Send, FileCheck, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  // Mock data - will be replaced with real API calls
  const stats = [
    {
      title: 'Active Tenders',
      value: '12',
      icon: FileText,
      trend: '+2 this week',
    },
    {
      title: 'My Bids',
      value: '5',
      icon: Send,
      trend: '+3 this month',
    },
    {
      title: 'Contracts',
      value: '8',
      icon: FileCheck,
      trend: '2 pending',
    },
    {
      title: 'Success Rate',
      value: '78%',
      icon: TrendingUp,
      trend: '+5% this quarter',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your procurement activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tender Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">
                    Construction Project Tender #{item}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Organization Name • Closing in 5 days
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Published</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
