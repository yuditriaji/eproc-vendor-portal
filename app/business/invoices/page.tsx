'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetInvoicesQuery, useGetInvoiceStatisticsQuery } from '@/store/api/financeApi';
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
  Receipt,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { canApproveInvoice } from '@/utils/permissions';
import { Skeleton } from '@/components/ui/skeleton';

type InvoiceStatusFilter = 'all' | 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED' | 'OVERDUE';

const statusConfig = {
  DRAFT: { label: 'Draft', variant: 'secondary' as const, icon: Receipt },
  PENDING_APPROVAL: { label: 'Pending Approval', variant: 'default' as const, icon: Clock },
  APPROVED: { label: 'Approved', variant: 'default' as const, icon: CheckCircle },
  PAID: { label: 'Paid', variant: 'default' as const, icon: CheckCircle },
  REJECTED: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  CANCELLED: { label: 'Cancelled', variant: 'outline' as const, icon: XCircle },
  OVERDUE: { label: 'Overdue', variant: 'destructive' as const, icon: AlertCircle },
};

export default function InvoicesPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: invoicesResponse, isLoading } = useGetInvoicesQuery({
    page,
    pageSize,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });
  
  // Fetch invoice statistics from backend
  const { data: statsResponse, isLoading: statsLoading } = useGetInvoiceStatisticsQuery();
  const invoiceStats = statsResponse?.data;

  const invoices = invoicesResponse?.data || [];
  const totalPages = invoicesResponse?.meta?.totalPages || 1;
  const total = invoicesResponse?.meta?.total || 0;

  const canApprove = canApproveInvoice(user);

  // Use backend statistics
  const stats = {
    total: invoiceStats?.total || 0,
    pending: invoiceStats?.pendingApproval || 0,
    approved: invoiceStats?.approved || 0,
    paid: invoiceStats?.paid || 0,
    overdue: invoiceStats?.overdue || 0,
    totalAmount: invoiceStats?.totalAmount || 0,
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Manage and process invoices for payment
          </p>
        </div>
        <Button asChild>
          <Link href="/business/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '...' : stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statsLoading ? '...' : stats.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Need approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? '...' : stats.approved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ready to pay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? '...' : stats.paid}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statsLoading ? '...' : stats.overdue}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Past due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatCurrency(stats.totalAmount, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Outstanding</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number, vendor, or PO..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as InvoiceStatusFilter)}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${invoices.length} of ${total} invoices`
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
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No invoices found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first invoice'}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/business/invoices/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const status = statusConfig[invoice.status] || statusConfig.DRAFT;
                    const StatusIcon = status.icon;
                    const isOverdue = invoice.status === 'OVERDUE';
                    return (
                      <TableRow key={invoice.id} className={isOverdue ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>{invoice.vendorName || 'N/A'}</TableCell>
                        <TableCell>
                          {invoice.purchaseOrderNumber || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(invoice.invoiceDate)}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm ${isOverdue ? 'font-semibold text-red-600' : ''}`}>
                            {formatDate(invoice.dueDate)}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(invoice.totalAmount, invoice.currency)}
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
                              <Link href={`/business/invoices/${invoice.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {invoice.status === 'PENDING_APPROVAL' && canApprove && (
                              <Button variant="ghost" size="sm" className="text-green-600">
                                <CheckCircle className="h-4 w-4" />
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
