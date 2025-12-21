'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetRFQsQuery } from '@/store/api/procurementApi';
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
    Plus,
    Search,
    Eye,
    FileText,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    DRAFT: { label: 'Draft', variant: 'secondary' },
    PUBLISHED: { label: 'Published', variant: 'default' },
    CLOSED: { label: 'Closed', variant: 'outline' },
    AWARDED: { label: 'Awarded', variant: 'default' },
    CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

export default function RFQListPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const { data: rfqResponse, isLoading } = useGetRFQsQuery({
        page,
        pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
    });

    const rfqs = rfqResponse?.data || [];
    const totalPages = rfqResponse?.meta?.totalPages || 1;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Request for Quotations</h1>
                    <p className="text-muted-foreground">Manage RFQs for simple sourcing</p>
                </div>
                <Button asChild>
                    <Link href="/business/rfq/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New RFQ
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Search and filter RFQs</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-[250px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by title or RFQ number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
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

            {/* RFQ Table */}
            <Card>
                <CardHeader>
                    <CardTitle>RFQ List</CardTitle>
                    <CardDescription>
                        {isLoading ? (
                            <Skeleton className="h-4 w-32" />
                        ) : (
                            `Showing ${rfqs.length} RFQs`
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
                    ) : rfqs.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No RFQs found</h3>
                            <p className="text-muted-foreground mt-2">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Create your first RFQ to get started'}
                            </p>
                            <Button className="mt-4" asChild>
                                <Link href="/business/rfq/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create RFQ
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>RFQ Number</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>PR Number</TableHead>
                                        <TableHead className="text-right">Est. Amount</TableHead>
                                        <TableHead>Valid Until</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rfqs.map((rfq: any) => {
                                        const status = statusConfig[rfq.status] || statusConfig.DRAFT;
                                        return (
                                            <TableRow key={rfq.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {rfq.rfqNumber}
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {rfq.title}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {rfq.purchaseRequisition?.prNumber || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {rfq.estimatedAmount
                                                        ? formatCurrency(rfq.estimatedAmount, 'USD')
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {rfq.validUntil ? formatDate(rfq.validUntil) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={status.variant}>{status.label}</Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(rfq.createdAt)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/business/rfq/${rfq.id}`}>
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
