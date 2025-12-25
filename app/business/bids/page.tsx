'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetBidsQuery } from '@/store/api/businessApi';
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
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Trophy,
  Star,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { canScoreBids } from '@/utils/permissions';
import { Skeleton } from '@/components/ui/skeleton';

type BidStatusFilter = 'all' | 'SUBMITTED' | 'UNDER_REVIEW' | 'EVALUATED' | 'ACCEPTED' | 'REJECTED';

const statusConfig = {
  DRAFT: { label: 'Draft', variant: 'outline' as const, icon: FileText },
  SUBMITTED: { label: 'Submitted', variant: 'outline' as const, icon: FileText },
  UNDER_REVIEW: { label: 'Under Review', variant: 'default' as const, icon: Clock },
  EVALUATED: { label: 'Evaluated', variant: 'default' as const, icon: CheckCircle },
  ACCEPTED: { label: 'Accepted', variant: 'default' as const, icon: Trophy },
  REJECTED: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
  WITHDRAWN: { label: 'Withdrawn', variant: 'outline' as const, icon: XCircle },
};

export default function BidsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BidStatusFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: bidsResponse, isLoading } = useGetBidsQuery({
    page,
    pageSize,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const bids = bidsResponse?.data || [];
  const totalPages = bidsResponse?.meta?.totalPages || 1;
  const total = bidsResponse?.meta?.total || 0;

  const canScore = canScoreBids(user);

  // Calculate stats
  const stats = {
    total,
    submitted: bids.filter(b => b.status === 'SUBMITTED').length,
    underReview: bids.filter(b => b.status === 'UNDER_REVIEW').length,
    evaluated: bids.filter(b => b.status === 'EVALUATED').length,
    accepted: bids.filter(b => b.status === 'ACCEPTED').length,
    rejected: bids.filter(b => b.status === 'REJECTED').length,
    avgScore: bids.filter(b => b.score).reduce((sum, b) => sum + (b.score || 0), 0) /
      (bids.filter(b => b.score).length || 1),
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bid Evaluation</h1>
          <p className="text-muted-foreground mt-1">
            Review and evaluate vendor bids
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All bids</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : stats.submitted}
            </div>
            <p className="text-xs text-muted-foreground mt-1">New bids</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? '...' : stats.underReview}
            </div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluated</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? '...' : stats.evaluated}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Scored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : stats.accepted}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Winners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? '...' : stats.avgScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter bids</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by tender, vendor, or bid ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as BidStatusFilter)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="EVALUATED">Evaluated</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bids Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bids</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${bids.length} of ${total} bids`
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
          ) : bids.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No bids found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No bids have been submitted yet'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bid ID</TableHead>
                    <TableHead>Tender</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.map((bid) => {
                    const status = statusConfig[bid.status] || statusConfig.SUBMITTED;
                    const StatusIcon = status.icon;
                    const needsReview = bid.status === 'SUBMITTED' || bid.status === 'UNDER_REVIEW';
                    const isWinner = bid.status === 'ACCEPTED';

                    return (
                      <TableRow
                        key={bid.id}
                        className={isWinner ? 'bg-green-50 dark:bg-green-950/10' : ''}
                      >
                        <TableCell className="font-medium font-mono">
                          {bid.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate font-medium">
                            {(bid as any).tender?.title || bid.tenderTitle || bid.tenderId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(bid as any).tender?.tenderNumber || bid.tenderNumber || `#${bid.tenderId?.slice(0, 8) || 'N/A'}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{(bid as any).vendor?.name || bid.vendorName || 'N/A'}</div>
                          {bid.vendorId && (
                            <div className="text-xs text-muted-foreground">
                              ID: {bid.vendorId.slice(0, 8)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {(() => {
                            const amount = bid.bidAmount || (bid as any).amount;
                            const parsed = amount
                              ? (typeof amount === 'object' ? Number(amount) : parseFloat(String(amount)))
                              : 0;
                            return parsed && !isNaN(parsed)
                              ? formatCurrency(parsed, bid.currency || 'USD')
                              : 'N/A';
                          })()}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{bid.submittedAt ? formatDate(bid.submittedAt) : 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          {bid.score !== undefined && bid.score !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                                <span className="font-semibold">{bid.score}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">/100</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not scored</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={status.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                            {needsReview && canScore && (
                              <Badge variant="outline" className="gap-1 text-orange-600 border-orange-600">
                                <AlertCircle className="h-3 w-3" />
                                Action Needed
                              </Badge>
                            )}
                            {isWinner && (
                              <Badge variant="default" className="gap-1 bg-green-600">
                                <Trophy className="h-3 w-3" />
                                Winner
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/business/bids/${bid.id}`}>
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
