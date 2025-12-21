'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetQuotationsQuery, useGetRFQsQuery } from '@/store/api/procurementApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileSignature,
  Search,
  Plus,
  Calendar,
  DollarSign,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  FileText
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/formatters';

type QuotationStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  DRAFT: { label: 'Draft', variant: 'outline', icon: FileEdit },
  SUBMITTED: { label: 'Submitted', variant: 'default', icon: Clock },
  PENDING: { label: 'Pending', variant: 'default', icon: Clock },
  ACCEPTED: { label: 'Accepted', variant: 'secondary', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', variant: 'destructive', icon: XCircle },
  EXPIRED: { label: 'Expired', variant: 'outline', icon: Clock },
};

export default function QuotationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch vendor's quotations
  const { data: quotationsResponse, isLoading: quotationsLoading } = useGetQuotationsQuery({
    page,
    pageSize,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  // Fetch published RFQs for the vendor to submit quotations to
  const { data: rfqsResponse, isLoading: rfqsLoading } = useGetRFQsQuery({
    page: 1,
    pageSize: 10,
    status: 'PUBLISHED',
  });

  const quotations = quotationsResponse?.data || [];
  const availableRFQs = rfqsResponse?.data || [];
  const totalPages = quotationsResponse?.meta?.totalPages || 1;
  const isLoading = quotationsLoading;

  const filteredQuotations = searchQuery
    ? quotations.filter((quotation: any) =>
      quotation.rfq?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.quotationNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : quotations;

  const stats = {
    total: quotationsResponse?.meta?.total || quotations.length,
    draft: quotations.filter((q: any) => q.status === 'DRAFT').length,
    submitted: quotations.filter((q: any) => q.status === 'SUBMITTED' || q.status === 'PENDING').length,
    accepted: quotations.filter((q: any) => q.status === 'ACCEPTED').length,
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground mt-1">
            Manage quotation requests and submissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{isLoading ? '...' : stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{isLoading ? '...' : stats.submitted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoading ? '...' : stats.accepted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Available RFQs for quotation */}
      {availableRFQs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available RFQs for Quotation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rfqsLoading ? (
                <Skeleton className="h-16" />
              ) : (
                availableRFQs.map((rfq: any) => (
                  <div key={rfq.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                    <div>
                      <p className="font-medium">{rfq.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {rfq.rfqNumber} • Valid until: {formatDate(rfq.validUntil)}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/vendor/quotations/create?rfqId=${rfq.id}`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Submit Quote
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('DRAFT')}
              >
                Draft
              </Button>
              <Button
                variant={statusFilter === 'SUBMITTED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('SUBMITTED')}
              >
                Submitted
              </Button>
              <Button
                variant={statusFilter === 'ACCEPTED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ACCEPTED')}
              >
                Accepted
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : filteredQuotations.length > 0 ? (
          filteredQuotations.map((quotation: any) => {
            const status = statusConfig[quotation.status] || statusConfig.DRAFT;
            const StatusIcon = status.icon;
            const validUntil = quotation.validUntil ? new Date(quotation.validUntil) : null;
            const daysUntilExpiry = validUntil
              ? Math.ceil((validUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <Card key={quotation.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileSignature className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {quotation.rfq?.title || 'Quotation'}
                            </h3>
                            <Badge variant={status.variant}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {quotation.quotationNumber}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {quotation.rfq?.purchaseRequisition && (
                              <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">For RFQ:</span>
                                <span className="font-medium">{quotation.rfq.rfqNumber}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-medium">
                                {formatCurrency(quotation.totalAmount || quotation.amount || 0, 'USD')}
                              </span>
                            </div>
                            {quotation.submittedAt && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Submitted:</span>
                                <span className="font-medium">
                                  {formatDate(quotation.submittedAt)}
                                </span>
                              </div>
                            )}
                            {validUntil && (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Valid Until:</span>
                                <span className={`font-medium ${daysUntilExpiry && daysUntilExpiry < 7 ? 'text-red-600' : ''}`}>
                                  {formatDate(quotation.validUntil)}
                                  {daysUntilExpiry && daysUntilExpiry > 0 && ` (${daysUntilExpiry} days)`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {quotation.status === 'DRAFT' && (
                        <Button size="sm" asChild>
                          <Link href={`/vendor/quotations/${quotation.id}/edit`}>
                            <FileEdit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/vendor/quotations/${quotation.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileSignature className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quotations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t created any quotations yet'}
              </p>
              {availableRFQs.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Check the "Available RFQs" section above to submit a quotation
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

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
