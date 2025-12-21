'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetContractsQuery } from '@/store/api/businessApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileCheck,
  Search,
  Download,
  Calendar,
  DollarSign,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/formatters';

type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'SUSPENDED' | 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  ACTIVE: { label: 'Active', variant: 'default', icon: CheckCircle2 },
  APPROVED: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
  COMPLETED: { label: 'Completed', variant: 'secondary', icon: CheckCircle2 },
  TERMINATED: { label: 'Terminated', variant: 'destructive', icon: XCircle },
  SUSPENDED: { label: 'Suspended', variant: 'outline', icon: AlertCircle },
  DRAFT: { label: 'Draft', variant: 'outline', icon: Clock },
  PENDING_APPROVAL: { label: 'Pending', variant: 'outline', icon: Clock },
};

export default function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: contractsResponse, isLoading } = useGetContractsQuery({
    page,
    pageSize,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const contracts = contractsResponse?.data || [];
  const totalPages = contractsResponse?.meta?.totalPages || 1;

  const filteredContracts = searchQuery
    ? contracts.filter((contract: any) =>
      contract.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contractNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : contracts;

  const stats = {
    total: contractsResponse?.meta?.total || contracts.length,
    active: contracts.filter((c: any) => c.status === 'ACTIVE' || c.status === 'APPROVED').length,
    completed: contracts.filter((c: any) => c.status === 'COMPLETED').length,
    totalValue: contracts.reduce((sum: number, c: any) => sum + (c.contractValue || c.amount || 0), 0)
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Contracts</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track your awarded contracts and agreements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{isLoading ? '...' : stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{isLoading ? '...' : stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : formatCurrency(stats.totalValue, 'USD')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ACTIVE')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('COMPLETED')}
              >
                Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : filteredContracts.length > 0 ? (
          filteredContracts.map((contract: any) => {
            const status = statusConfig[contract.status] || statusConfig.DRAFT;
            const StatusIcon = status.icon;
            return (
              <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{contract.title}</h3>
                            <Badge variant={status.variant}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {contract.contractNumber}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            {contract.vendor && (
                              <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Vendor:</span>
                                <span className="font-medium">{contract.vendor.companyName || contract.vendor.name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Value:</span>
                              <span className="font-medium">
                                {formatCurrency(contract.contractValue || contract.amount || 0, contract.currency?.code || 'USD')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Period:</span>
                              <span className="font-medium">
                                {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/vendor/contracts/${contract.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
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
              <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contracts found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : 'You don\'t have any contracts yet'}
              </p>
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
