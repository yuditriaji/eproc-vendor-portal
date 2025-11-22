'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetContractsQuery } from '@/store/api/businessApi';
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
  FileCheck,
  Eye,
  CheckCircle,
  XCircle,
  PauseCircle,
  Play,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { canCreateContract } from '@/utils/permissions';
import { Skeleton } from '@/components/ui/skeleton';

type ContractStatusFilter = 'all' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'SUSPENDED';

const statusConfig = {
  ACTIVE: { label: 'Active', variant: 'default' as const, icon: Play },
  COMPLETED: { label: 'Completed', variant: 'default' as const, icon: CheckCircle },
  TERMINATED: { label: 'Terminated', variant: 'destructive' as const, icon: XCircle },
  SUSPENDED: { label: 'Suspended', variant: 'outline' as const, icon: PauseCircle },
};

export default function ContractsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatusFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: contractsResponse, isLoading } = useGetContractsQuery({
    page,
    pageSize,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const contracts = contractsResponse?.data || [];
  const totalPages = contractsResponse?.meta?.totalPages || 1;
  const total = contractsResponse?.meta?.total || 0;

  const canCreate = canCreateContract(user);

  // Calculate stats
  const stats = {
    total,
    active: contracts.filter(c => c.status === 'ACTIVE').length,
    completed: contracts.filter(c => c.status === 'COMPLETED').length,
    terminated: contracts.filter(c => c.status === 'TERMINATED').length,
    suspended: contracts.filter(c => c.status === 'SUSPENDED').length,
    totalValue: contracts.reduce((sum, c) => sum + (c.amount || 0), 0),
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground mt-1">
            Manage vendor contracts and agreements
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/business/contracts/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Contract
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All contracts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : stats.active}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : stats.completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Fulfilled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <PauseCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? '...' : stats.suspended}
            </div>
            <p className="text-xs text-muted-foreground mt-1">On hold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <FileCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? '...' : formatCurrency(stats.totalValue, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Contract value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, contract number, or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as ContractStatusFilter)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${contracts.length} of ${total} contracts`
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
          ) : contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No contracts found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first contract'}
              </p>
              {canCreate && (
                <Button className="mt-4" asChild>
                  <Link href="/business/contracts/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Contract
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => {
                    const status = statusConfig[contract.status] || statusConfig.ACTIVE;
                    const StatusIcon = status.icon;
                    const isExpiringSoon = contract.endDate && 
                      new Date(contract.endDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 &&
                      contract.status === 'ACTIVE';
                    
                    return (
                      <TableRow key={contract.id} className={isExpiringSoon ? 'bg-yellow-50 dark:bg-yellow-950/10' : ''}>
                        <TableCell className="font-medium font-mono">
                          {contract.contractNumber || contract.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate font-medium">{contract.title}</div>
                          {contract.buyerName && (
                            <div className="text-xs text-muted-foreground">
                              Buyer: {contract.buyerName}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{contract.vendorName || 'N/A'}</TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(contract.startDate)}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="text-sm">{formatDate(contract.endDate)}</span>
                            {isExpiringSoon && (
                              <div className="text-xs text-yellow-600 font-medium mt-1">
                                Expiring soon
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(contract.amount, contract.currency)}
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
                              <Link href={`/business/contracts/${contract.id}`}>
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
