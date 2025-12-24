'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetBidsQuery } from '@/store/api/procurementApi';
import { isOwnBid, logSecurityWarning } from '@/utils/permissions';
import { BidsTable } from '@/components/bid/BidsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type StatusFilter = 'all' | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export default function MyBidsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // VENDOR RBAC: Get current user for ownership validation
  const user = useSelector((state: RootState) => state.auth.user);

  // Pass search to backend for server-side filtering
  const { data: bidsResponse, isLoading } = useGetBidsQuery({
    page,
    pageSize,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  // VENDOR RBAC: Filter to only show vendor's own bids (defense in depth)
  const bids = useMemo(() => {
    const rawBids = bidsResponse?.data || [];

    // Validate all bids belong to current vendor
    const ownBids = rawBids.filter((bid) => {
      const isOwn = isOwnBid(bid, user);
      if (!isOwn && rawBids.length > 0) {
        logSecurityWarning(
          'MyBidsPage',
          `Unauthorized bid detected: ${bid.id} does not belong to vendor ${user?.id}`
        );
      }
      return isOwn;
    });

    return ownBids;
  }, [bidsResponse?.data, user]);

  // Use bids directly since server handles search filtering now
  const filteredBids = bids;

  const totalPages = bidsResponse?.meta?.totalPages || 1;

  // Calculate stats
  const stats = {
    total: bidsResponse?.meta?.total || 0,
    draft: bids.filter(b => b.status === 'DRAFT').length,
    submitted: bids.filter(b => b.status === 'SUBMITTED' || b.status === 'UNDER_REVIEW').length,
    accepted: bids.filter(b => b.status === 'ACCEPTED').length,
    rejected: bids.filter(b => b.status === 'REJECTED').length,
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Bids</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your submitted bids
          </p>
        </div>
        <Button asChild>
          <Link href="/vendor/tenders">
            <Plus className="mr-2 h-4 w-4" />
            Submit New Bid
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.draft + stats.submitted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.draft} draft, {stats.submitted} submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoading ? '...' : stats.accepted}</div>
            <p className="text-xs text-muted-foreground mt-1">Winning bids</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{isLoading ? '...' : stats.rejected}</div>
            <p className="text-xs text-muted-foreground mt-1">Unsuccessful</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bids by tender title or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {isLoading ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <>Showing {filteredBids.length} of {stats.total} bids</>
        )}
      </div>

      {/* Bids Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filteredBids.length > 0 ? (
        <BidsTable bids={filteredBids} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Bids Found</CardTitle>
            <CardDescription>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'You haven\'t submitted any bids yet'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/vendor/tenders">
                <Plus className="mr-2 h-4 w-4" />
                Browse Tenders
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
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
