'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGetTenderByIdQuery } from '@/store/api/procurementApi';
import { useCreateBidMutation, useSubmitBidMutation } from '@/store/api/procurementApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft,
    Send,
    Save,
    DollarSign,
    FileText,
    Calendar,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

function NewBidPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tenderId = searchParams.get('tender');
    const { toast } = useToast();

    const [bidAmount, setBidAmount] = useState('');
    const [technicalProposal, setTechnicalProposal] = useState('');
    const [deliveryTimeline, setDeliveryTimeline] = useState('');
    const [notes, setNotes] = useState('');

    const { data: tenderResponse, isLoading: tenderLoading } = useGetTenderByIdQuery(tenderId || '', {
        skip: !tenderId,
    });
    const [createBid, { isLoading: isCreating }] = useCreateBidMutation();
    const [submitBid, { isLoading: isSubmitting }] = useSubmitBidMutation();

    const tender = tenderResponse?.data;

    if (!tenderId) {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">No Tender Selected</CardTitle>
                        <CardDescription>
                            Please select a tender from the tenders list to submit a bid.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/vendor/tenders">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Go to Tenders
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (tenderLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!tender) {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Tender Not Found</CardTitle>
                        <CardDescription>
                            The tender you're trying to bid on doesn't exist or has been removed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/vendor/tenders">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Tenders
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleSaveDraft = async () => {
        try {
            await createBid({
                tenderId: tenderId!,
                technicalProposal: { description: technicalProposal },
                commercialProposal: {
                    amount: parseFloat(bidAmount) || 0,
                    deliveryTimeline,
                    notes,
                },
                financialProposal: {
                    totalAmount: parseFloat(bidAmount) || 0,
                    currency: 'USD',
                },
            } as any).unwrap();

            toast({
                title: 'Success',
                description: 'Bid saved as draft',
            });
            router.push('/vendor/bids');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to save bid',
                variant: 'destructive',
            });
        }
    };

    const handleSubmitBid = async () => {
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a valid bid amount',
                variant: 'destructive',
            });
            return;
        }

        try {
            // First create the bid
            const createdBid = await createBid({
                tenderId: tenderId!,
                technicalProposal: { description: technicalProposal },
                commercialProposal: {
                    amount: parseFloat(bidAmount),
                    deliveryTimeline,
                    notes,
                },
                financialProposal: {
                    totalAmount: parseFloat(bidAmount),
                    currency: 'USD',
                },
            } as any).unwrap();

            // Then submit it
            await submitBid(createdBid.data?.id!).unwrap();

            toast({
                title: 'Success',
                description: 'Bid submitted successfully',
            });
            router.push('/vendor/bids');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to submit bid',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href={`/vendor/tenders/${tenderId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Tender
                    </Link>
                </Button>

                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Submit Bid</h1>
                    <p className="text-muted-foreground">
                        Submit your bid for: <span className="font-medium">{tender.title}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bid Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Proposal</CardTitle>
                            <CardDescription>
                                Enter your bid amount and financial terms
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="bidAmount">Bid Amount (USD) *</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="bidAmount"
                                        type="number"
                                        placeholder="Enter your bid amount"
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        className="pl-9"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                {tender.estimatedValue && (
                                    <p className="text-xs text-muted-foreground">
                                        Estimated Value: {formatCurrency(tender.estimatedValue, 'USD')}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deliveryTimeline">Delivery Timeline</Label>
                                <Input
                                    id="deliveryTimeline"
                                    placeholder="e.g., 30 days from order confirmation"
                                    value={deliveryTimeline}
                                    onChange={(e) => setDeliveryTimeline(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Technical Proposal</CardTitle>
                            <CardDescription>
                                Describe your technical approach and capabilities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="technicalProposal">Technical Description</Label>
                                <Textarea
                                    id="technicalProposal"
                                    placeholder="Describe your technical solution, methodology, and relevant experience..."
                                    value={technicalProposal}
                                    onChange={(e) => setTechnicalProposal(e.target.value)}
                                    rows={6}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Notes</CardTitle>
                            <CardDescription>
                                Any additional information or terms
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Additional terms, conditions, or notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            onClick={handleSaveDraft}
                            disabled={isCreating || isSubmitting}
                            className="flex-1"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Save as Draft
                        </Button>
                        <Button
                            onClick={handleSubmitBid}
                            disabled={isCreating || isSubmitting || !bidAmount}
                            className="flex-1"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                        </Button>
                    </div>
                </div>

                {/* Tender Summary Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Tender Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">{tender.title}</p>
                                    <p className="text-xs text-muted-foreground">{(tender as any).tenderNumber || tender.referenceNumber}</p>
                                </div>
                            </div>

                            {tender.estimatedValue && (
                                <div className="flex items-start gap-3">
                                    <DollarSign className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Estimated Value</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatCurrency(tender.estimatedValue, 'USD')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Closing Date</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(tender.closingDate)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>• Ensure your bid amount is competitive</p>
                            <p>• Provide detailed technical proposals</p>
                            <p>• Include realistic delivery timelines</p>
                            <p>• Once submitted, bids cannot be modified</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function NewBidPage() {
    return (
        <Suspense fallback={
            <div className="p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96" />
            </div>
        }>
            <NewBidPageContent />
        </Suspense>
    );
}
