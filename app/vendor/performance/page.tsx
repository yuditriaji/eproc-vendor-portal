'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Star, 
  Award, 
  Target, 
  Clock,
  CheckCircle,
  BarChart,
  Activity
} from 'lucide-react';

export default function PerformancePage() {
  // Mock data - replace with API call
  const performanceMetrics = {
    overallScore: 92,
    bidWinRate: 68,
    contractCompletionRate: 95,
    onTimeDeliveryRate: 88,
    qualityRating: 4.6,
    totalContracts: 24,
    activeContracts: 5,
    completedContracts: 19,
    totalBidsSubmitted: 35,
    bidsWon: 24,
    averageResponseTime: 4.2, // hours
    customerSatisfaction: 4.5,
  };

  const performanceHistory = [
    { period: 'Jan 2025', score: 88, bidsSubmitted: 5, bidsWon: 3, contractsCompleted: 2 },
    { period: 'Feb 2025', score: 90, bidsSubmitted: 6, bidsWon: 4, contractsCompleted: 3 },
    { period: 'Mar 2025', score: 89, bidsSubmitted: 4, bidsWon: 3, contractsCompleted: 2 },
    { period: 'Apr 2025', score: 91, bidsSubmitted: 7, bidsWon: 5, contractsCompleted: 4 },
    { period: 'May 2025', score: 93, bidsSubmitted: 6, bidsWon: 4, contractsCompleted: 3 },
    { period: 'Jun 2025', score: 92, bidsSubmitted: 7, bidsWon: 5, contractsCompleted: 5 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'outline' | 'destructive' => {
    if (score >= 90) return 'secondary';
    if (score >= 70) return 'default';
    return 'outline';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Performance Metrics</h1>
        <p className="text-muted-foreground mt-1">
          Track your vendor performance and ratings
        </p>
      </div>

      {/* Overall Score Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className={`text-6xl font-bold ${getScoreColor(performanceMetrics.overallScore)}`}>
              {performanceMetrics.overallScore}
              <span className="text-3xl text-muted-foreground">/100</span>
            </div>
            <div className="flex-1 space-y-2">
              <Progress value={performanceMetrics.overallScore} className="h-4" />
              <p className="text-sm text-muted-foreground">
                You're performing better than 78% of vendors in your category
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Bid Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(performanceMetrics.bidWinRate)}`}>
              {performanceMetrics.bidWinRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {performanceMetrics.bidsWon} out of {performanceMetrics.totalBidsSubmitted} bids won
            </p>
            <Progress value={performanceMetrics.bidWinRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Contract Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(performanceMetrics.contractCompletionRate)}`}>
              {performanceMetrics.contractCompletionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {performanceMetrics.completedContracts} of {performanceMetrics.totalContracts} completed
            </p>
            <Progress value={performanceMetrics.contractCompletionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              On-Time Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(performanceMetrics.onTimeDeliveryRate)}`}>
              {performanceMetrics.onTimeDeliveryRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Average response: {performanceMetrics.averageResponseTime}h
            </p>
            <Progress value={performanceMetrics.onTimeDeliveryRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Quality Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-yellow-500">
                {performanceMetrics.qualityRating}
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(performanceMetrics.qualityRating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Customer satisfaction: {performanceMetrics.customerSatisfaction}/5
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contract Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{performanceMetrics.totalContracts}</div>
            <p className="text-sm text-muted-foreground mt-1">Lifetime contracts awarded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{performanceMetrics.activeContracts}</div>
            <p className="text-sm text-muted-foreground mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completed Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{performanceMetrics.completedContracts}</div>
            <p className="text-sm text-muted-foreground mt-1">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Performance History
          </CardTitle>
          <CardDescription>Your performance metrics over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceHistory.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.period}</span>
                  <Badge variant={getScoreBadgeVariant(item.score)}>
                    Score: {item.score}/100
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bids Submitted:</span>
                    <span className="ml-2 font-medium">{item.bidsSubmitted}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bids Won:</span>
                    <span className="ml-2 font-medium">{item.bidsWon}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="ml-2 font-medium">{item.contractsCompleted}</span>
                  </div>
                </div>
                <Progress value={item.score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-200">
                  Strong Performance
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Your contract completion rate is 15% above the industry average. Keep up the excellent work!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Opportunity for Improvement
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Consider improving your on-time delivery rate to reach the 95% benchmark for top vendors.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                  Customer Satisfaction
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Your customer satisfaction rating is excellent. Continue maintaining high service quality!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
