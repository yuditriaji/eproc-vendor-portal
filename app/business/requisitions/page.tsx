'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetPurchaseRequisitionsQuery } from '@/store/api/businessApi';
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
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingCart,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { canCreatePR } from '@/utils/permissions';
import { Skeleton } from '@/components/ui/skeleton';

type PRStatusFilter = 'all' | 'DRAFT' | 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CONVERTED_TO_PO';

const statusConfig = {
  DRAFT: { label: 'Draft', variant: 'secondary' as const, icon: FileText },
  PENDING: { label: 'Pending Approval', variant: 'default' as const, icon: Clock },
  PENDING_APPROVAL: { label: 'Pending Approval', variant: 'default' as const, icon: Clock },
  APPROVED: { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
  REJECTED: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  CANCELLED: { label: 'Cancelled', variant: 'outline' as const, icon: XCircle },
  CONVERTED_TO_PO: { label: 'Converted to PO', variant: 'default' as const, icon: ShoppingCart },
};

export default function PurchaseRequisitionsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PRStatusFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: prsResponse, isLoading } = useGetPurchaseRequisitionsQuery({
    page,
    pageSize,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const prs = prsResponse?.data || [];
  const totalPages = prsResponse?.meta?.totalPages || 1;
  const total = prsResponse?.meta?.total || 0;

  const canCreate = canCreatePR(user);

  // Calculate stats
  const stats = {
    total,
    draft: prs.filter(pr => pr.status === 'DRAFT').length,
    pending: prs.filter(pr => pr.status === 'PENDING_APPROVAL').length,
    approved: prs.filter(pr => pr.status === 'APPROVED').length,
    converted: prs.filter(pr => pr.status === 'CONVERTED_TO_PO').length,
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Requisitions</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage purchase requisitions for procurement
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/business/requisitions/create">
              <Plus className="mr-2 h-4 w-4" />
              Create PR
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PRs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All statuses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {isLoading ? '...' : stats.draft}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Not submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? '...' : stats.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
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
            <p className="text-xs text-muted-foreground mt-1">Ready for PO</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : stats.converted}
            </div>
            <p className="text-xs text-muted-foreground mt-1">To PO</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter purchase requisitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference, title, or requestor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as PRStatusFilter)}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CONVERTED_TO_PO">Converted to PO</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* PRs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Requisitions</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${prs.length} of ${total} requisitions`
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
          ) : prs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No purchase requisitions found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first purchase requisition'}
              </p>
              {canCreate && (
                <Button className="mt-4" asChild>
                  <Link href="/business/requisitions/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create PR
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Requestor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prs.map((pr) => {
                    const status = statusConfig[pr.status] || statusConfig.DRAFT;
                    const StatusIcon = status.icon;
                    // Extract requester name from User object
                    const requesterName = pr.requester
                      ? `${pr.requester.firstName || ''} ${pr.requester.lastName || ''}`.trim() || pr.requester.username || pr.requester.email
                      : 'N/A';
                    return (
                      <TableRow key={pr.id}>
                        <TableCell className="font-medium">
                          {pr.prNumber || pr.referenceNumber || '-'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{pr.title}</p>
                            {pr.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {pr.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{requesterName}</TableCell>
                        <TableCell>{pr.department || 'N/A'}</TableCell>
                        <TableCell>
                          {formatCurrency(pr.estimatedAmount || pr.totalAmount || 0, pr.currency || 'USD')}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(pr.createdAt)}</span>
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
                              <Link href={`/business/requisitions/${pr.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {pr.status === 'APPROVED' && canCreate && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/business/purchase-orders/create?prId=${pr.id}`}>
                                  <ShoppingCart className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
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
