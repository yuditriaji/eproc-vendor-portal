'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetGoodsReceiptsQuery } from '@/store/api/businessApi';
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
    Package,
    Calendar,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';

type GRStatusFilter = 'all' | 'PENDING' | 'INSPECTED' | 'ACCEPTED' | 'REJECTED' | 'PARTIAL';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    PENDING: { label: 'Pending Inspection', variant: 'outline' },
    INSPECTED: { label: 'Inspected', variant: 'secondary' },
    ACCEPTED: { label: 'Accepted', variant: 'default' },
    REJECTED: { label: 'Rejected', variant: 'destructive' },
    PARTIAL: { label: 'Partial', variant: 'outline' },
};

export default function GoodsReceiptsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<GRStatusFilter>('all');
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const { data: grResponse, isLoading } = useGetGoodsReceiptsQuery({
        page,
        pageSize,
    });

    const receipts = grResponse?.data || [];
    const totalPages = grResponse?.meta?.totalPages || 1;
    const total = grResponse?.meta?.total || 0;

    // Client-side filtering (since backend doesn't support all filters)
    const filteredReceipts = receipts.filter((gr: any) => {
        if (statusFilter !== 'all' && gr.status !== statusFilter) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                gr.grNumber?.toLowerCase().includes(query) ||
                gr.purchaseOrder?.poNumber?.toLowerCase().includes(query) ||
                gr.notes?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Goods Receipts</h1>
                    <p className="text-muted-foreground mt-1">
                        Track and manage goods receipts for purchase orders
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : total}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">All records</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {isLoading ? '...' : receipts.filter((gr: any) => gr.status === 'PENDING').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting inspection</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {isLoading ? '...' : receipts.filter((gr: any) => gr.status === 'ACCEPTED').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Goods accepted</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {isLoading ? '...' : receipts.filter((gr: any) => gr.status === 'REJECTED').length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Goods rejected</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Search and filter goods receipts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by GR number, PO number, or notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(v) => setStatusFilter(v as GRStatusFilter)}
                        >
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="INSPECTED">Inspected</SelectItem>
                                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="PARTIAL">Partial</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Goods Receipts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Goods Receipts</CardTitle>
                    <CardDescription>
                        {isLoading ? (
                            <Skeleton className="h-4 w-32" />
                        ) : (
                            `Showing ${filteredReceipts.length} of ${total} receipts`
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
                    ) : filteredReceipts.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No goods receipts found</h3>
                            <p className="text-muted-foreground mt-2">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Goods receipts will appear here when created from purchase orders'}
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>GR Number</TableHead>
                                        <TableHead>Purchase Order</TableHead>
                                        <TableHead>Received Date</TableHead>
                                        <TableHead>Received By</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReceipts.map((gr: any) => {
                                        const status = statusConfig[gr.status] || statusConfig.PENDING;
                                        return (
                                            <TableRow key={gr.id}>
                                                <TableCell className="font-medium">
                                                    {gr.grNumber || gr.id.slice(0, 8)}
                                                </TableCell>
                                                <TableCell>
                                                    {gr.purchaseOrder ? (
                                                        <Link
                                                            href={`/business/purchase-orders/${gr.purchaseOrder.id}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {gr.purchaseOrder.poNumber || 'View PO'}
                                                        </Link>
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">{formatDate(gr.receivedDate || gr.createdAt)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {gr.receivedBy?.name || gr.receivedBy?.username || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={status.variant}>{status.label}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/business/goods-receipts/${gr.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
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
