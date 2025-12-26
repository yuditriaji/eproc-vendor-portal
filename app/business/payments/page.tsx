'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetPaymentsQuery } from '@/store/api/financeApi';
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
  CreditCard,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Send,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { canProcessPayment } from '@/utils/permissions';
import { Skeleton } from '@/components/ui/skeleton';

type PaymentStatusFilter = 'all' | 'REQUESTED' | 'APPROVED' | 'PROCESSED' | 'FAILED' | 'CANCELLED';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  REQUESTED: { label: 'Requested', variant: 'secondary', icon: Clock },
  APPROVED: { label: 'Approved', variant: 'default', icon: CheckCircle },
  PROCESSED: { label: 'Processed', variant: 'default', icon: CheckCircle },
  FAILED: { label: 'Failed', variant: 'destructive', icon: XCircle },
  CANCELLED: { label: 'Cancelled', variant: 'outline', icon: XCircle },
  // Legacy support
  PENDING: { label: 'Pending', variant: 'secondary', icon: Clock },
  PROCESSING: { label: 'Processing', variant: 'default', icon: Send },
  COMPLETED: { label: 'Completed', variant: 'default', icon: CheckCircle },
};

const paymentMethodConfig = {
  BANK_TRANSFER: { label: 'Bank Transfer', color: 'text-blue-600' },
  CHECK: { label: 'Check', color: 'text-green-600' },
  WIRE_TRANSFER: { label: 'Wire Transfer', color: 'text-purple-600' },
  ACH: { label: 'ACH', color: 'text-orange-600' },
  CARD: { label: 'Card', color: 'text-pink-600' },
  CASH: { label: 'Cash', color: 'text-gray-600' },
};

export default function PaymentsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: paymentsResponse, isLoading } = useGetPaymentsQuery({
    page,
    pageSize,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const payments = paymentsResponse?.data || [];
  const totalPages = paymentsResponse?.meta?.totalPages || 1;
  const total = paymentsResponse?.meta?.total || 0;

  const canProcess = canProcessPayment(user);

  // Calculate stats
  const stats = {
    total,
    pending: payments.filter(p => p.status === 'REQUESTED').length,
    processing: payments.filter(p => p.status === 'APPROVED').length,
    completed: payments.filter(p => p.status === 'PROCESSED').length,
    failed: payments.filter(p => p.status === 'FAILED').length,
    totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Process and track vendor payments
          </p>
        </div>
        {canProcess && (
          <Button asChild>
            <Link href="/business/payments/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Payment
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All payments</p>
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
            <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Send className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : stats.processing}
            </div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : stats.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Successfully paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? '...' : stats.failed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : formatCurrency(stats.totalAmount, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by payment number, vendor, or invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as PaymentStatusFilter)}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="REQUESTED">Requested</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PROCESSED">Processed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${payments.length} of ${total} payments`
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
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No payments found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first payment'}
              </p>
              {canProcess && (
                <Button className="mt-4" asChild>
                  <Link href="/business/payments/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Payment
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const status = statusConfig[payment.status] || statusConfig.PENDING;
                    const StatusIcon = status.icon;
                    const method = payment.paymentMethod && paymentMethodConfig[payment.paymentMethod as keyof typeof paymentMethodConfig]
                      ? paymentMethodConfig[payment.paymentMethod as keyof typeof paymentMethodConfig]
                      : { label: payment.paymentMethod || 'N/A', color: 'text-gray-600' };
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.paymentNumber}
                        </TableCell>
                        <TableCell>{payment.vendorName || 'N/A'}</TableCell>
                        <TableCell>
                          {payment.invoiceNumber || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${method.color}`}>
                            {method.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{payment.paymentDate ? formatDate(payment.paymentDate) : 'N/A'}</span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payment.amount, payment.currency || 'IDR')}
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
                              <Link href={`/business/payments/${payment.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {payment.status === 'REQUESTED' && canProcess && (
                              <Button variant="ghost" size="sm" className="text-blue-600">
                                <Send className="h-4 w-4" />
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
