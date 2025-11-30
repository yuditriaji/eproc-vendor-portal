'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetTendersQuery, useGetTenderStatisticsQuery } from '@/store/api/procurementApi';
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
  Calendar,
  Eye,
  Edit,
  Send,
  Award,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { canCreateTender } from '@/utils/permissions';
import { Skeleton } from '@/components/ui/skeleton';

type TenderStatusFilter = 'all' | 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'AWARDED' | 'CANCELLED';

const statusConfig = {
  DRAFT: { label: 'Draft', variant: 'secondary' as const, color: 'text-gray-600' },
  PUBLISHED: { label: 'Published', variant: 'default' as const, color: 'text-blue-600' },
  CLOSED: { label: 'Closed', variant: 'outline' as const, color: 'text-gray-600' },
  AWARDED: { label: 'Awarded', variant: 'default' as const, color: 'text-green-600' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' as const, color: 'text-red-600' },
};

export default function BusinessTendersPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenderStatusFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: tendersResponse, isLoading } = useGetTendersQuery({
    page,
    pageSize,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });
  
  // Fetch tender statistics from backend
  const { data: statsResponse, isLoading: statsLoading } = useGetTenderStatisticsQuery();
  const tenderStats = statsResponse?.data?.summary;

  const tenders = tendersResponse?.data || [];
  const totalPages = tendersResponse?.meta?.totalPages || 1;
  const total = tendersResponse?.meta?.total || 0;

  const canCreate = canCreateTender(user);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tender Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, manage, and track procurement tenders
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/business/tenders/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Tender
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : tenderStats?.totalTenders || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All statuses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? '...' : tenderStats?.activeTenders || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Published tenders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <Edit className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {statsLoading ? '...' : tenderStats?.closedTenders || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">For evaluation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awarded</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? '...' : tenderStats?.awardedTenders || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter tenders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, reference, or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as TenderStatusFilter)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="AWARDED">Awarded</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tenders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tenders</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${tenders.length} of ${total} tenders`
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
          ) : tenders.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No tenders found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first tender'}
              </p>
              {canCreate && (
                <Button className="mt-4" asChild>
                  <Link href="/business/tenders/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tender
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
                    <TableHead>Organization</TableHead>
                    <TableHead>Estimated Value</TableHead>
                    <TableHead>Closing Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenders.map((tender) => {
                    const status = statusConfig[tender.status] || statusConfig.DRAFT;
                    return (
                      <TableRow key={tender.id}>
                        <TableCell className="font-medium">
                          {tender.referenceNumber || tender.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tender.title}</p>
                            {tender.category && (
                              <p className="text-sm text-muted-foreground">{tender.category}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{tender.organization?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {tender.estimatedValue
                            ? formatCurrency(tender.estimatedValue, tender.currency)
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{formatDate(tender.closingDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/business/tenders/${tender.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {tender.status === 'PUBLISHED' && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/business/tenders/${tender.id}/bids`}>
                                  <Send className="h-4 w-4" />
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
