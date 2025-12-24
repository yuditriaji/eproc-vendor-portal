'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetBidByIdQuery, useUpdateBidMutation, useSubmitBidMutation } from '@/store/api/procurementApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Send } from 'lucide-react';

export default function EditBidPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { toast } = useToast();

    const { data: bidResponse, isLoading } = useGetBidByIdQuery(id);
    const [updateBid, { isLoading: isUpdating }] = useUpdateBidMutation();
    const [submitBid, { isLoading: isSubmitting }] = useSubmitBidMutation();

    const bid = bidResponse?.data;

    const [bidAmount, setBidAmount] = useState('');
    const [deliveryTimeline, setDeliveryTimeline] = useState('');
    const [technicalProposal, setTechnicalProposal] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (bid) {
            // Parse existing values
            const existingAmount = bid.bidAmount
                ? (typeof bid.bidAmount === 'object' ? Number(bid.bidAmount) : bid.bidAmount)
                : (bid as any).financialProposal?.totalAmount || '';

            setBidAmount(String(existingAmount || ''));
            setDeliveryTimeline((bid as any).commercialProposal?.deliveryTimeline || '');
            setTechnicalProposal((bid as any).technicalProposal?.description || '');
            setNotes((bid as any).commercialProposal?.notes || '');
        }
    }, [bid]);

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

    if (bid.status !== 'DRAFT') {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Cannot Edit</CardTitle>
                        <CardDescription>
                            Only draft bids can be edited. This bid has already been submitted.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href={`/vendor/bids/${id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                View Bid Details
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleSave = async () => {
        try {
            await updateBid({
                id,
                data: {
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
                } as any,
            }).unwrap();

            toast({
                title: 'Success',
                description: 'Bid saved successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to save bid',
                variant: 'destructive',
            });
        }
    };

    const handleSubmit = async () => {
        try {
            // First save the bid
            await handleSave();
            // Then submit it
            await submitBid(id).unwrap();
            toast({
                title: 'Success',
                description: 'Bid submitted successfully',
            });
            router.push(`/vendor/bids/${id}`);
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
                    <Link href={`/vendor/bids/${id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Bid Details
                    </Link>
                </Button>

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Edit Bid</h1>
                        <p className="text-muted-foreground">
                            {bid.tender?.title || `Bid ID: ${bid.id.slice(0, 8)}...`}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleSave} disabled={isUpdating}>
                            <Save className="mr-2 h-4 w-4" />
                            {isUpdating ? 'Saving...' : 'Save Draft'}
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting || isUpdating}>
                            <Send className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Proposal */}
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Proposal</CardTitle>
                        <CardDescription>
                            Enter your bid amount and pricing details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bidAmount">Bid Amount (USD)</Label>
                            <Input
                                id="bidAmount"
                                type="number"
                                placeholder="Enter amount"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deliveryTimeline">Delivery Timeline</Label>
                            <Input
                                id="deliveryTimeline"
                                placeholder="e.g., 30 days"
                                value={deliveryTimeline}
                                onChange={(e) => setDeliveryTimeline(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Technical Proposal */}
                <Card>
                    <CardHeader>
                        <CardTitle>Technical Proposal</CardTitle>
                        <CardDescription>
                            Describe your technical approach and methodology
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Enter your technical proposal..."
                            className="min-h-[200px]"
                            value={technicalProposal}
                            onChange={(e) => setTechnicalProposal(e.target.value)}
                        />
                    </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Additional Notes</CardTitle>
                        <CardDescription>
                            Any additional information you want to include
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Enter any additional notes..."
                            className="min-h-[100px]"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Action buttons at bottom for mobile */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t lg:hidden">
                <Button variant="outline" onClick={handleSave} disabled={isUpdating} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    {isUpdating ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || isUpdating} className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                </Button>
            </div>
        </div>
    );
}
