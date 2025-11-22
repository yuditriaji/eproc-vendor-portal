'use client';

import { useState } from 'react';
import { useGetTendersQuery } from '@/store/api/procurementApi';
import { TenderCard } from '@/components/tender/TenderCard';
import { TendersTable } from '@/components/tender/TendersTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Grid3x3, List, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type ViewMode = 'grid' | 'list';
// VENDOR RBAC: Vendors can only view PUBLISHED and CLOSED/AWARDED tenders (no DRAFT)
type StatusFilter = 'PUBLISHED' | 'CLOSED' | 'AWARDED';

export default function TendersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  // VENDOR RBAC: Default to PUBLISHED only - vendors cannot see draft tenders
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PUBLISHED');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // VENDOR RBAC: Always pass status filter to ensure only appropriate tenders are fetched
  const { data: tendersResponse, isLoading } = useGetTendersQuery({
    page,
    pageSize,
    status: statusFilter, // Always filter by status (default: PUBLISHED)
    search: searchQuery || undefined,
  });

  const tenders = tendersResponse?.data || [];
  const totalPages = tendersResponse?.meta?.totalPages || 1;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tender Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            Browse and bid on published procurement opportunities
          </p>
        </div>
        <Button>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Advanced Filters
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tenders by title, organization, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {/* VENDOR RBAC: Only show PUBLISHED, CLOSED, AWARDED - no DRAFT access */}
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="AWARDED">Awarded</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="grid" className="px-3">
                <Grid3x3 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="px-3">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {isLoading ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <>Showing {tenders.length} of {tendersResponse?.meta?.total || 0} tenders</>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenders.map((tender) => (
            <TenderCard key={tender.id} tender={tender} />
          ))}
        </div>
      ) : (
        <TendersTable tenders={tenders} />
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
