'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetQuotationByIdQuery } from '@/store/api/procurementApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    FileSignature,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    FileEdit,
    FileText
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/formatters';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
    DRAFT: { label: 'Draft', variant: 'outline', icon: FileEdit },
    SUBMITTED: { label: 'Submitted', variant: 'default', icon: Clock },
    PENDING: { label: 'Pending', variant: 'default', icon: Clock },
    ACCEPTED: { label: 'Accepted', variant: 'secondary', icon: CheckCircle2 },
    REJECTED: { label: 'Rejected', variant: 'destructive', icon: XCircle },
    EXPIRED: { label: 'Expired', variant: 'outline', icon: Clock },
};

export default function QuotationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const quotationId = params.id as string;

    const { data: quotationResponse, isLoading, error } = useGetQuotationByIdQuery(quotationId);
    const quotation = quotationResponse?.data;

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <Skeleton className="h-64" />
                <Skeleton className="h-48" />
            </div>
        );
    }

    if (error || !quotation) {
        return (
            <div className="p-4 md:p-6">
                <Card>
                    <CardContent className="p-12 text-center">
                        <FileSignature className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Quotation Not Found</h3>
                        <p className="text-muted-foreground mb-4">
                            The quotation you're looking for doesn't exist or you don't have access to it.
                        </p>
                        <Button asChild>
                            <Link href="/vendor/quotations">Back to Quotations</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const status = statusConfig[quotation.status] || statusConfig.SUBMITTED;
    const StatusIcon = status.icon;
    const items = quotation.items || [];

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Quotation Details</h1>
                    <p className="text-muted-foreground">{quotation.quotationNumber}</p>
                </div>
                <Badge variant={status.variant} className="text-sm py-1 px-3">
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {status.label}
                </Badge>
            </div>

            {/* RFQ Info */}
            {quotation.rfq && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Request for Quotation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">RFQ Number</p>
                                <p className="font-medium">{quotation.rfq.rfqNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Title</p>
                                <p className="font-medium">{quotation.rfq.title}</p>
                            </div>
                            {quotation.rfq.description && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="text-sm">{quotation.rfq.description}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quotation Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSignature className="h-5 w-5" />
                        Quotation Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Amount</p>
                                <p className="text-xl font-bold">{formatCurrency(Number(quotation.amount) || 0, 'USD')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Valid Until</p>
                                <p className="font-medium">{quotation.validUntil ? formatDate(quotation.validUntil) : 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Clock className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Submitted</p>
                                <p className="font-medium">{formatDate(quotation.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Quoted Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium">Item</th>
                                    <th className="text-center py-3 px-4 font-medium">Quantity</th>
                                    <th className="text-center py-3 px-4 font-medium">Unit</th>
                                    <th className="text-right py-3 px-4 font-medium">Unit Price</th>
                                    <th className="text-right py-3 px-4 font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(items) && items.map((item: any, index: number) => (
                                    <tr key={index} className="border-b last:border-0">
                                        <td className="py-3 px-4">
                                            <p className="font-medium">{item.name || item.description}</p>
                                            {item.description && item.name && (
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">{item.quantity}</td>
                                        <td className="py-3 px-4 text-center">{item.unit || 'pcs'}</td>
                                        <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice || 0, 'USD')}</td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {formatCurrency((item.quantity || 0) * (item.unitPrice || 0), 'USD')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-muted/50">
                                    <td colSpan={4} className="py-3 px-4 text-right font-semibold">Grand Total:</td>
                                    <td className="py-3 px-4 text-right font-bold text-lg">
                                        {formatCurrency(Number(quotation.amount) || 0, 'USD')}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Notes */}
            {quotation.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notes / Terms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{quotation.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                    <Link href="/vendor/quotations">Back to List</Link>
                </Button>
            </div>
        </div>
    );
}
