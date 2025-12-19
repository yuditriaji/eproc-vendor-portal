'use client';

import { use } from 'react';
import Link from 'next/link';
import { useGetGoodsReceiptByIdQuery } from '@/store/api/businessApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft,
    Calendar,
    Package,
    User,
    FileText,
    ClipboardCheck,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    PENDING: { label: 'Pending Inspection', variant: 'outline' },
    INSPECTED: { label: 'Inspected', variant: 'secondary' },
    ACCEPTED: { label: 'Accepted', variant: 'default' },
    REJECTED: { label: 'Rejected', variant: 'destructive' },
    PARTIAL: { label: 'Partial', variant: 'outline' },
};

// Helper function to extract name from receivedBy/inspectedBy which can be string or object
const getPersonName = (person: { id?: string; name?: string; username?: string } | string | null | undefined): string => {
    if (!person) return 'N/A';
    if (typeof person === 'string') return person;
    return person.name || person.username || 'N/A';
};

export default function GoodsReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const { data: grResponse, isLoading } = useGetGoodsReceiptByIdQuery(id);
    const gr = grResponse?.data;

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (!gr) {
        return (
            <div className="p-4 md:p-6">
                <div className="text-center py-12">
                    <h3 className="text-lg font-semibold">Goods Receipt not found</h3>
                    <Button className="mt-4" asChild>
                        <Link href="/business/goods-receipts">Back to Goods Receipts</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const status = statusConfig[gr.status] || statusConfig.PENDING;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/business/goods-receipts">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">GR #{gr.grNumber || id.slice(0, 8)}</h1>
                            <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">Goods Receipt Record</p>
                    </div>
                </div>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Received Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{formatDate(gr.receivedDate || gr.createdAt)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Received By
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{getPersonName(gr.receivedBy)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <ClipboardCheck className="h-4 w-4" />
                            Inspected By
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{gr.inspectedBy ? getPersonName(gr.inspectedBy) : 'Not inspected'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Items Received
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{gr.receivedItems?.length || gr.items?.length || 0}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Purchase Order Reference */}
            {gr.purchaseOrder && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Source Purchase Order
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">PO #{gr.purchaseOrder.poNumber}</p>
                                <p className="text-sm text-muted-foreground">{gr.purchaseOrder.title || gr.purchaseOrder.description}</p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href={`/business/purchase-orders/${gr.purchaseOrder.id}`}>View PO</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Received Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Received Items</CardTitle>
                    <CardDescription>Items received in this goods receipt</CardDescription>
                </CardHeader>
                <CardContent>
                    {(gr.receivedItems || gr.items) && (gr.receivedItems || gr.items).length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Ordered Qty</TableHead>
                                    <TableHead className="text-right">Received Qty</TableHead>
                                    <TableHead>Condition</TableHead>
                                    <TableHead>Serial Number</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(gr.receivedItems || gr.items).map((item: any, index: number) => (
                                    <TableRow key={item.id || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{item.description || item.name}</p>
                                                {item.specifications && (
                                                    <p className="text-sm text-muted-foreground">{item.specifications}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">{item.orderedQuantity || item.quantity || 'N/A'}</TableCell>
                                        <TableCell className="text-right">{item.receivedQuantity || item.quantity || 'N/A'}</TableCell>
                                        <TableCell>
                                            {item.condition ? (
                                                <Badge variant={item.condition === 'GOOD' || item.condition === 'ACCEPTED' ? 'default' : 'destructive'}>
                                                    {item.condition}
                                                </Badge>
                                            ) : (
                                                'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell>{item.serialNumber || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No items recorded</p>
                    )}
                </CardContent>
            </Card>

            {/* Inspection Notes */}
            {gr.inspectionNotes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5" />
                            Inspection Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{gr.inspectionNotes}</p>
                    </CardContent>
                </Card>
            )}

            {/* General Notes */}
            {gr.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{gr.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Status Information */}
            <Card className={gr.status === 'ACCEPTED' ? 'border-green-200 bg-green-50 dark:bg-green-950/10' : gr.status === 'REJECTED' ? 'border-red-200 bg-red-50 dark:bg-red-950/10' : ''}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {gr.status === 'ACCEPTED' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : gr.status === 'REJECTED' ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                            <Package className="h-5 w-5" />
                        )}
                        Receipt Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="text-sm">
                            <span className="text-muted-foreground">Current Status: </span>
                            <Badge variant={status.variant}>{status.label}</Badge>
                        </p>
                        {gr.acceptedAt && (
                            <p className="text-sm">
                                <span className="text-muted-foreground">Accepted on: </span>
                                <span className="font-medium">{formatDate(gr.acceptedAt)}</span>
                            </p>
                        )}
                        {gr.rejectedAt && (
                            <p className="text-sm">
                                <span className="text-muted-foreground">Rejected on: </span>
                                <span className="font-medium">{formatDate(gr.rejectedAt)}</span>
                            </p>
                        )}
                        {gr.rejectionReason && (
                            <p className="text-sm text-red-600">
                                <span className="font-medium">Rejection Reason: </span>
                                {gr.rejectionReason}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Create Invoice Button (if accepted) */}
            {gr.status === 'ACCEPTED' && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Ready for Invoice</p>
                                <p className="text-sm text-muted-foreground">This goods receipt can now be invoiced</p>
                            </div>
                            <Button asChild>
                                <Link href={`/business/invoices/create?grId=${id}`}>
                                    Create Invoice
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
