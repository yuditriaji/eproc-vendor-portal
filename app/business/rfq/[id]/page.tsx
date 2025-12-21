'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useGetRFQByIdQuery, usePublishRFQMutation, useCloseRFQMutation, useCancelRFQMutation, useAcceptRFQQuotationMutation } from '@/store/api/procurementApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft,
    Send,
    XCircle,
    CheckCircle,
    Clock,
    DollarSign,
    Calendar,
    FileText,
    Users,
    Award,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    DRAFT: { label: 'Draft', variant: 'secondary' },
    PUBLISHED: { label: 'Published', variant: 'default' },
    CLOSED: { label: 'Closed', variant: 'outline' },
    AWARDED: { label: 'Awarded', variant: 'default' },
    CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

export default function RFQDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
    const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);

    const { data: rfqResponse, isLoading } = useGetRFQByIdQuery(id);
    const [publishRFQ, { isLoading: isPublishing }] = usePublishRFQMutation();
    const [closeRFQ, { isLoading: isClosing }] = useCloseRFQMutation();
    const [cancelRFQ, { isLoading: isCancelling }] = useCancelRFQMutation();
    const [acceptQuotation, { isLoading: isAccepting }] = useAcceptRFQQuotationMutation();

    const rfq: any = rfqResponse?.data;

    const handlePublish = async () => {
        try {
            await publishRFQ(id).unwrap();
            toast({
                title: 'Success',
                description: 'RFQ published successfully. Vendors can now submit quotations.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to publish RFQ',
                variant: 'destructive',
            });
        }
    };

    const handleClose = async () => {
        try {
            await closeRFQ(id).unwrap();
            toast({
                title: 'Success',
                description: 'RFQ closed. No more quotations can be submitted.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to close RFQ',
                variant: 'destructive',
            });
        }
    };

    const handleCancel = async () => {
        try {
            await cancelRFQ(id).unwrap();
            toast({
                title: 'Cancelled',
                description: 'RFQ has been cancelled.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to cancel RFQ',
                variant: 'destructive',
            });
        }
    };

    const handleAcceptQuotation = async () => {
        if (!selectedQuotationId) return;
        try {
            await acceptQuotation({ quotationId: selectedQuotationId }).unwrap();
            toast({
                title: 'Success',
                description: 'Quotation accepted and contract created!',
            });
            setIsAcceptDialogOpen(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to accept quotation',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (!rfq) {
        return (
            <div className="p-4 md:p-6">
                <div className="text-center py-12">
                    <h3 className="text-lg font-semibold">RFQ not found</h3>
                    <Button className="mt-4" asChild>
                        <Link href="/business/rfq">Back to RFQs</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const status = statusConfig[rfq.status] || statusConfig.DRAFT;
    const canPublish = rfq.status === 'DRAFT';
    const canClose = rfq.status === 'PUBLISHED';
    const canCancel = rfq.status === 'DRAFT' || rfq.status === 'PUBLISHED';
    const canAward = rfq.status === 'CLOSED' && (rfq.quotations?.length || 0) > 0;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/business/rfq">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">RFQ #{rfq.rfqNumber}</h1>
                            <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{rfq.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {canPublish && (
                        <Button onClick={handlePublish} disabled={isPublishing}>
                            <Send className="mr-2 h-4 w-4" />
                            {isPublishing ? 'Publishing...' : 'Publish RFQ'}
                        </Button>
                    )}
                    {canClose && (
                        <Button onClick={handleClose} disabled={isClosing} variant="outline">
                            <Clock className="mr-2 h-4 w-4" />
                            {isClosing ? 'Closing...' : 'Close for Submissions'}
                        </Button>
                    )}
                    {canCancel && (
                        <Button onClick={handleCancel} disabled={isCancelling} variant="destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            {isCancelling ? 'Cancelling...' : 'Cancel'}
                        </Button>
                    )}
                </div>
            </div>

            {/* RFQ Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Source PR</span>
                        </div>
                        <p className="text-lg font-semibold mt-1">
                            {rfq.purchaseRequisition?.prNumber || 'N/A'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Estimated Amount</span>
                        </div>
                        <p className="text-lg font-semibold mt-1">
                            {rfq.estimatedAmount ? formatCurrency(rfq.estimatedAmount, 'USD') : 'N/A'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Valid Until</span>
                        </div>
                        <p className="text-lg font-semibold mt-1">
                            {rfq.validUntil ? formatDate(rfq.validUntil) : 'N/A'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Quotations Received</span>
                        </div>
                        <p className="text-lg font-semibold mt-1">
                            {rfq.quotations?.length || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            {rfq.description && (
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{rfq.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Items */}
            {rfq.items && rfq.items.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Items</CardTitle>
                        <CardDescription>Items requested in this RFQ</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Est. Unit Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rfq.items.map((item: any, index: number) => (
                                    <TableRow key={item.id || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.description || item.name}</TableCell>
                                        <TableCell className="text-right">{item.quantity} {item.unit || ''}</TableCell>
                                        <TableCell className="text-right">
                                            {item.estimatedUnitPrice ? formatCurrency(item.estimatedUnitPrice, 'USD') : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Quotations */}
            <Card>
                <CardHeader>
                    <CardTitle>Quotations</CardTitle>
                    <CardDescription>Vendor quotations received for this RFQ</CardDescription>
                </CardHeader>
                <CardContent>
                    {(!rfq.quotations || rfq.quotations.length === 0) ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No quotations received yet
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Quotation #</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Valid Until</TableHead>
                                    <TableHead>Status</TableHead>
                                    {canAward && <TableHead className="text-right">Action</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rfq.quotations.map((quotation: any) => (
                                    <TableRow key={quotation.id}>
                                        <TableCell>{quotation.vendor?.name || 'Unknown Vendor'}</TableCell>
                                        <TableCell className="font-mono text-sm">{quotation.quotationNumber}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(quotation.amount, 'USD')}
                                        </TableCell>
                                        <TableCell>
                                            {quotation.validUntil ? formatDate(quotation.validUntil) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={quotation.status === 'SUBMITTED' ? 'outline' : 'default'}>
                                                {quotation.status}
                                            </Badge>
                                        </TableCell>
                                        {canAward && (
                                            <TableCell className="text-right">
                                                <Dialog open={isAcceptDialogOpen && selectedQuotationId === quotation.id} onOpenChange={(open) => {
                                                    setIsAcceptDialogOpen(open);
                                                    if (open) setSelectedQuotationId(quotation.id);
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="default">
                                                            <Award className="mr-1 h-3 w-3" />
                                                            Accept
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Accept Quotation</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to accept this quotation from {quotation.vendor?.name}?
                                                                This will create a contract and award the RFQ.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="py-4">
                                                            <p className="text-sm">
                                                                <strong>Amount:</strong> {formatCurrency(quotation.amount, 'USD')}
                                                            </p>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
                                                                Cancel
                                                            </Button>
                                                            <Button onClick={handleAcceptQuotation} disabled={isAccepting}>
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                {isAccepting ? 'Accepting...' : 'Accept & Create Contract'}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
