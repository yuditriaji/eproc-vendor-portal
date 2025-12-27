'use client';

import { use } from 'react';
import Link from 'next/link';
import { useGetPaymentByIdQuery } from '@/store/api/financeApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    CreditCard,
    DollarSign,
    Calendar,
    FileText,
    Building2,
    Clock,
    CheckCircle,
    XCircle,
    Send,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
    REQUESTED: { label: 'Requested', variant: 'secondary', icon: Clock },
    APPROVED: { label: 'Approved', variant: 'default', icon: CheckCircle },
    PROCESSED: { label: 'Processed', variant: 'default', icon: CheckCircle },
    FAILED: { label: 'Failed', variant: 'destructive', icon: XCircle },
    CANCELLED: { label: 'Cancelled', variant: 'outline', icon: XCircle },
};

const paymentMethodConfig: Record<string, { label: string; color: string }> = {
    BANK_TRANSFER: { label: 'Bank Transfer', color: 'text-blue-600' },
    CHECK: { label: 'Check', color: 'text-green-600' },
    WIRE_TRANSFER: { label: 'Wire Transfer', color: 'text-purple-600' },
    ACH: { label: 'ACH', color: 'text-orange-600' },
    CARD: { label: 'Card', color: 'text-pink-600' },
    CASH: { label: 'Cash', color: 'text-gray-600' },
};

export default function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { data: paymentResponse, isLoading, error } = useGetPaymentByIdQuery(resolvedParams.id);

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (error || !paymentResponse?.data) {
        return (
            <div className="p-4 md:p-6">
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">Payment not found</h3>
                            <p className="text-muted-foreground mt-2">
                                The payment you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
                            </p>
                            <Button className="mt-4" asChild>
                                <Link href="/business/payments">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Payments
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const payment: any = paymentResponse.data;
    const status = statusConfig[payment.status] || statusConfig.REQUESTED;
    const StatusIcon = status.icon;

    // Extract nested data
    const vendorName = payment.invoice?.vendor?.name || 'N/A';
    const invoiceNumber = payment.invoice?.invoiceNumber || 'N/A';
    const poNumber = payment.purchaseOrder?.poNumber || 'N/A';
    const paymentMethod = payment.method || payment.paymentMethod || 'N/A';
    const paymentDate = payment.processedDate || payment.paymentDate || payment.createdAt;

    const method = paymentMethodConfig[paymentMethod as keyof typeof paymentMethodConfig]
        ? paymentMethodConfig[paymentMethod as keyof typeof paymentMethodConfig]
        : { label: paymentMethod, color: 'text-gray-600' };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/business/payments">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{payment.paymentNumber}</h1>
                            <Badge variant={status.variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">Payment Details</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {formatCurrency(payment.amount, payment.currency || 'IDR')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Method
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-lg font-semibold ${method.color}`}>
                            {method.label}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Payment Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold">
                            {paymentDate ? formatDate(paymentDate) : 'Not processed'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Vendor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold">{vendorName}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Payment Number</p>
                                <p className="font-medium">{payment.paymentNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={status.variant} className="gap-1 mt-1">
                                    <StatusIcon className="h-3 w-3" />
                                    {status.label}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-semibold">{formatCurrency(payment.amount, payment.currency || 'IDR')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Payment Method</p>
                                <p className={`font-medium ${method.color}`}>{method.label}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Reference</p>
                                <p className="font-medium">{payment.reference || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Payment Type</p>
                                <p className="font-medium">{payment.paymentType || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Related Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Invoice Number</p>
                                {payment.invoiceId ? (
                                    <Link href={`/business/invoices/${payment.invoiceId}`} className="font-medium text-primary hover:underline">
                                        {invoiceNumber}
                                    </Link>
                                ) : (
                                    <p className="font-medium">N/A</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">PO Number</p>
                                {payment.poId ? (
                                    <Link href={`/business/purchase-orders/${payment.poId}`} className="font-medium text-primary hover:underline">
                                        {poNumber}
                                    </Link>
                                ) : (
                                    <p className="font-medium">N/A</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Vendor</p>
                                <p className="font-medium">{vendorName}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                    <CardDescription>Payment processing history</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium">Payment Created</p>
                                <p className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</p>
                            </div>
                        </div>

                        {payment.approvedAt && (
                            <div className="flex items-start gap-4">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Payment Approved</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(payment.approvedAt)}</p>
                                </div>
                            </div>
                        )}

                        {payment.processedDate && (
                            <div className="flex items-start gap-4">
                                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Send className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Payment Processed</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(payment.processedDate)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Notes */}
            {payment.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{payment.notes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
