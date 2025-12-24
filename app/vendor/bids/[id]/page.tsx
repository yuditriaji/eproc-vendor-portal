'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetBidByIdQuery, useSubmitBidMutation } from '@/store/api/procurementApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    Send,
    Edit,
    FileText,
    Calendar,
    DollarSign,
    Clock,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function BidDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { toast } = useToast();

    const { data: bidResponse, isLoading } = useGetBidByIdQuery(id);
    const [submitBid, { isLoading: isSubmitting }] = useSubmitBidMutation();

    const bid = bidResponse?.data;

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!bid) {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Bid Not Found</CardTitle>
                        <CardDescription>
                            The bid you are looking for doesn't exist or has been removed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/vendor/bids">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to My Bids
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleSubmit = async () => {
        try {
            await submitBid(id).unwrap();
            toast({
                title: 'Success',
                description: 'Bid submitted successfully',
            });
            router.refresh();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to submit bid',
                variant: 'destructive',
            });
        }
    };

    const statusConfig: Record<string, { label: string; className: string }> = {
        DRAFT: { label: 'Draft', className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400' },
        SUBMITTED: { label: 'Submitted', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
        UNDER_REVIEW: { label: 'Under Review', className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
        ACCEPTED: { label: 'Accepted', className: 'bg-green-500/10 text-green-700 dark:text-green-400' },
        REJECTED: { label: 'Rejected', className: 'bg-red-500/10 text-red-700 dark:text-red-400' },
        WITHDRAWN: { label: 'Withdrawn', className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400' },
    };

    const config = statusConfig[bid.status] || statusConfig.DRAFT;

    // Parse bid amount - might be Decimal object or number
    const bidAmount = bid.bidAmount
        ? (typeof bid.bidAmount === 'object' ? Number(bid.bidAmount) : bid.bidAmount)
        : (bid as any).financialProposal?.totalAmount;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href="/vendor/bids">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Bids
                    </Link>
                </Button>

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={config.className}>{config.label}</Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            {bid.tender?.title || 'Bid Details'}
                        </h1>
                        <p className="text-muted-foreground">
                            {bid.referenceNumber || `Bid ID: ${bid.id.slice(0, 8)}...`}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {bid.status === 'DRAFT' && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={`/vendor/bids/${id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button onClick={handleSubmit} disabled={isSubmitting}>
                                    <Send className="mr-2 h-4 w-4" />
                                    {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                                </Button>
                            </>
                        )}
                        {bid.tender?.id && (
                            <Button variant="outline" asChild>
                                <Link href={`/vendor/tenders/${bid.tender.id}`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Tender
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Financial Proposal */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Proposal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Bid Amount</span>
                                </div>
                                <span className="text-xl font-bold">
                                    {bidAmount ? formatCurrency(bidAmount, bid.currency || 'USD') : 'N/A'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Technical Proposal */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Technical Proposal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {(bid as any).technicalProposal?.description ||
                                    (typeof (bid as any).technicalProposal === 'string' ? (bid as any).technicalProposal : 'No technical proposal provided')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Bid Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-xs text-muted-foreground">
                                        {bid.createdAt ? formatDate(bid.createdAt) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {bid.submittedAt && (
                                <div className="flex items-start gap-3">
                                    <Send className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Submitted</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(bid.submittedAt)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(bid.tender as any)?.closingDate && (
                                <div className="flex items-start gap-3">
                                    <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Tender Closing</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate((bid.tender as any).closingDate)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {bid.tender && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Tender Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium">{bid.tender.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Status: {(bid.tender as any)?.status || 'N/A'}
                                    </p>
                                </div>
                                {bid.tender.id && (
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href={`/vendor/tenders/${bid.tender.id}`}>
                                            View Tender Details
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
