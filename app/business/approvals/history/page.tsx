'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetApprovalHistoryQuery } from '@/store/api/workflowApi';
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
  CheckCircle,
  XCircle,
  ArrowLeft,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { isApprover } from '@/utils/permissions';

type ApprovalTypeFilter = 'all' | 'PURCHASE_REQUISITION' | 'PURCHASE_ORDER' | 'INVOICE' | 'PAYMENT' | 'BUDGET_TRANSFER' | 'CONTRACT';
type ActionFilter = 'all' | 'APPROVE' | 'REJECT';

const actionConfig = {
  APPROVE: { label: 'Approved', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
  REJECT: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
};

export default function ApprovalHistoryPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ApprovalTypeFilter>('all');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: historyResponse, isLoading } = useGetApprovalHistoryQuery({
    page,
    pageSize,
    type: typeFilter === 'all' ? undefined : typeFilter,
    action: actionFilter === 'all' ? undefined : actionFilter,
    search: searchQuery || undefined,
  });

  const history = historyResponse?.data || [];
  const totalPages = historyResponse?.meta?.totalPages || 1;
  const total = historyResponse?.meta?.total || 0;

  const canView = isApprover(user);

  // Calculate stats
  const stats = {
    total,
    approved: history.filter(h => h.action === 'APPROVE').length,
    rejected: history.filter(h => h.action === 'REJECT').length,
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the approval history.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Approval History</h1>
          <p className="text-muted-foreground mt-1">
            View your past approval decisions
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/business/approvals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pending
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All decisions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : stats.approved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? `${((stats.approved / stats.total) * 100).toFixed(0)}%` : '0%'} approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? '...' : stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? `${((stats.rejected / stats.total) * 100).toFixed(0)}%` : '0%'} rejection rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter approval history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, entity number, or requestor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as ApprovalTypeFilter)}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PURCHASE_REQUISITION">Purchase Requisition</SelectItem>
                <SelectItem value="PURCHASE_ORDER">Purchase Order</SelectItem>
                <SelectItem value="INVOICE">Invoice</SelectItem>
                <SelectItem value="PAYMENT">Payment</SelectItem>
                <SelectItem value="BUDGET_TRANSFER">Budget Transfer</SelectItem>
                <SelectItem value="CONTRACT">Contract</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={actionFilter}
              onValueChange={(v) => setActionFilter(v as ActionFilter)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="APPROVE">Approved</SelectItem>
                <SelectItem value="REJECT">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${history.length} of ${total} records`
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
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No history found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || typeFilter !== 'all' || actionFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You have not processed any approvals yet.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>PR Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Approver</TableHead>
                    <TableHead>Decision Date</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record: any) => {
                    // Map PR status to action
                    const isApproved = record.status === 'APPROVED';
                    const action = isApproved ? actionConfig.APPROVE : actionConfig.REJECT;
                    const ActionIcon = action.icon;
                    // Map requester name
                    const requesterName = record.requester
                      ? `${record.requester.firstName || ''} ${record.requester.lastName || ''}`.trim() || record.requester.username
                      : 'N/A';
                    // Map approver name
                    const approverName = record.approver
                      ? `${record.approver.firstName || ''} ${record.approver.lastName || ''}`.trim() || record.approver.username
                      : 'N/A';
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Badge variant={action.variant} className="gap-1">
                            <ActionIcon className="h-3 w-3" />
                            {action.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.prNumber || '-'}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm font-medium truncate">{record.title}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{requesterName}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{approverName}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{record.approvedAt ? formatDate(record.approvedAt) : 'N/A'}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/business/requisitions/${record.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
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
