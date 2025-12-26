'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetBudgetsQuery } from '@/store/api/financeApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  Wallet,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { canManageBudget } from '@/utils/permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

type BudgetStatusFilter = 'all' | 'ACTIVE' | 'DEPLETED' | 'EXPIRED' | 'SUSPENDED';

const statusConfig = {
  ACTIVE: { label: 'Active', variant: 'default' as const, icon: CheckCircle },
  DEPLETED: { label: 'Depleted', variant: 'destructive' as const, icon: AlertCircle },
  EXPIRED: { label: 'Expired', variant: 'outline' as const, icon: XCircle },
  SUSPENDED: { label: 'Suspended', variant: 'outline' as const, icon: XCircle },
};

export default function BudgetsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BudgetStatusFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: budgetsResponse, isLoading } = useGetBudgetsQuery({
    page,
    pageSize,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  // Handle both new format {data, total, page, pageSize} and legacy format with meta
  const budgets = budgetsResponse?.data || [];
  const totalFromResponse = budgetsResponse?.total ?? budgetsResponse?.meta?.total ?? 0;
  const pageSizeFromResponse = budgetsResponse?.pageSize ?? pageSize;
  const totalPages = Math.ceil(totalFromResponse / pageSizeFromResponse) || 1;
  const total = totalFromResponse;

  const canManage = canManageBudget(user);

  // Calculate stats
  const stats = {
    total,
    active: budgets.filter(b => b.status === 'ACTIVE').length,
    depleted: budgets.filter(b => b.status === 'DEPLETED').length,
    expired: budgets.filter(b => b.status === 'EXPIRED').length,
    totalAllocated: budgets.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0),
    totalUtilized: budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0),
  };

  const utilizationRate = stats.totalAllocated > 0
    ? ((stats.totalUtilized / stats.totalAllocated) * 100).toFixed(1)
    : '0.0';

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage departmental budgets
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/business/budgets/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All budgets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : stats.active}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Depleted</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? '...' : stats.depleted}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Fully utilized</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {isLoading ? '...' : stats.expired}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Past end date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : formatCurrency(stats.totalAllocated, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? '...' : `${utilizationRate}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter budgets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, department, or fiscal year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as BudgetStatusFilter)}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DEPLETED">Depleted</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Budgets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budgets</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${budgets.length} of ${total} budgets`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No budgets found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first budget'}
              </p>
              {canManage && (
                <Button className="mt-4" asChild>
                  <Link href="/business/budgets/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Budget
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Budget Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Fiscal Year</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map((budget: any) => {
                    const status = statusConfig[budget.status as keyof typeof statusConfig] || statusConfig.ACTIVE;
                    const StatusIcon = status.icon;
                    // Map backend fields: totalAmount, availableAmount
                    const allocated = Number(budget.totalAmount) || 0;
                    const available = Number(budget.availableAmount) || 0;
                    const spent = allocated - available;
                    const utilization = allocated > 0 ? (spent / allocated) * 100 : 0;
                    const utilizationColor = getUtilizationColor(utilization);
                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">
                          {budget.orgUnit?.name || budget.name || `Budget ${budget.fiscalYear}`}
                        </TableCell>
                        <TableCell>{budget.orgUnit?.name || budget.departmentName || 'N/A'}</TableCell>
                        <TableCell>
                          <span className="text-sm">{budget.fiscalYear}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">{budget.period?.toLowerCase() || 'Annual'}</span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(allocated, budget.currency || 'IDR')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-semibold">
                              {formatCurrency(spent, budget.currency || 'IDR')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(available, budget.currency || 'IDR')} left
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2 min-w-[120px]">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-semibold ${utilizationColor}`}>
                                {utilization.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={utilization} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/business/budgets/${budget.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
