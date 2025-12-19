'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetTenderByIdQuery, useGetBidsQuery } from '@/store/api/procurementApi';
import { usePublishTenderMutation, useAwardTenderMutation } from '@/store/api/businessApi';
import { useCloseTenderMutation } from '@/store/api/workflowApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Send, Award as AwardIcon, Calendar, DollarSign, MapPin, Tag, FileText, XCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  DRAFT: { label: 'Draft', variant: 'secondary' as const },
  PUBLISHED: { label: 'Published', variant: 'default' as const },
  CLOSED: { label: 'Closed', variant: 'outline' as const },
  AWARDED: { label: 'Awarded', variant: 'default' as const },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' as const },
};

export default function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState('');
  const [awardReason, setAwardReason] = useState('');

  const { data: tenderResponse, isLoading } = useGetTenderByIdQuery(id);
  const { data: bidsResponse } = useGetBidsQuery({ tenderId: id, status: 'SUBMITTED' });
  const [publishTender, { isLoading: isPublishing }] = usePublishTenderMutation();
  const [awardTender, { isLoading: isAwarding }] = useAwardTenderMutation();
  const [closeTender, { isLoading: isClosing }] = useCloseTenderMutation();

  const tender = tenderResponse?.data;

  const handlePublish = async () => {
    try {
      await publishTender(id).unwrap();
      toast({
        title: 'Success',
        description: 'Tender published successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to publish tender',
        variant: 'destructive',
      });
    }
  };

  const handleClose = async () => {
    try {
      await closeTender({ tenderId: id }).unwrap();
      toast({
        title: 'Success',
        description: 'Tender closed for bidding',
      });
      setShowCloseDialog(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to close tender',
        variant: 'destructive',
      });
    }
  };

  const handleAward = async () => {
    if (!selectedBidId) {
      toast({
        title: 'Error',
        description: 'Please select a bid to award',
        variant: 'destructive',
      });
      return;
    }
    try {
      await awardTender({ id, bidId: selectedBidId, reason: awardReason }).unwrap();
      toast({
        title: 'Success',
        description: 'Tender awarded successfully',
      });
      setShowAwardDialog(false);
      setSelectedBidId('');
      setAwardReason('');
      router.push('/business/tenders');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to award tender',
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

  if (!tender) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Tender not found</h3>
          <Button className="mt-4" asChild>
            <Link href="/business/tenders">Back to Tenders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[tender.status] || statusConfig.DRAFT;
  const canPublish = tender.status === 'DRAFT';
  const canClose = tender.status === 'PUBLISHED';
  const canAward = tender.status === 'CLOSED';
  const bids = bidsResponse?.data || [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/business/tenders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{tender.title}</h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            {tender.referenceNumber && (
              <p className="text-muted-foreground mt-1">
                Reference: {tender.referenceNumber}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canPublish && (
            <Button onClick={handlePublish} disabled={isPublishing}>
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}
          {canClose && (
            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <XCircle className="mr-2 h-4 w-4" />
                  Close Tender
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Close Tender for Bidding</DialogTitle>
                  <DialogDescription>
                    This will close the tender to new bid submissions. You can then evaluate and award the tender.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleClose} disabled={isClosing}>
                    Close Tender
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {canAward && (
            <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
              <DialogTrigger asChild>
                <Button>
                  <AwardIcon className="mr-2 h-4 w-4" />
                  Award Tender
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Award Tender</DialogTitle>
                  <DialogDescription>
                    Select the winning bid to award this tender
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {bids.length > 0 ? (
                    <RadioGroup value={selectedBidId} onValueChange={setSelectedBidId}>
                      {bids.map((bid: any) => (
                        <div key={bid.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent">
                          <RadioGroupItem value={bid.id} id={bid.id} />
                          <Label htmlFor={bid.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{bid.vendor?.name || bid.vendor?.username || 'Vendor'}</p>
                                <p className="text-sm text-muted-foreground">
                                  Score: {bid.totalScore || 'N/A'}
                                </p>
                              </div>
                              {bid.bidAmount && (
                                <p className="font-semibold">
                                  {bid.bidAmount.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No bids available for this tender
                    </p>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="award-reason">Award Reason (Optional)</Label>
                    <Textarea
                      id="award-reason"
                      placeholder="Reason for selecting this bid..."
                      value={awardReason}
                      onChange={(e) => setAwardReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAwardDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAward} disabled={isAwarding || !selectedBidId}>
                    Award Tender
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {tender.status === 'DRAFT' && (
            <Button variant="outline" asChild>
              <Link href={`/business/tenders/${id}/edit`}>Edit</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Key Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Closing Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formatDate(tender.closingDate)}</p>
          </CardContent>
        </Card>

        {tender.estimatedValue && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Estimated Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {formatCurrency(tender.estimatedValue, tender.currency)}
              </p>
            </CardContent>
          </Card>
        )}

        {tender.category && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{tender.category}</p>
            </CardContent>
          </Card>
        )}

        {tender.location && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{tender.location}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {tender.description || 'No description provided'}
          </p>
        </CardContent>
      </Card>

      {/* Documents */}
      {tender.documents && tender.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Tender requirements and specifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tender.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(doc.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bids Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Submitted Bids</CardTitle>
              <CardDescription>View and evaluate vendor bids</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/business/bids?tenderId=${id}`}>View All Bids</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Bid evaluation available in the Bid Evaluation page
          </p>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tender.createdAt && (
              <div className="flex items-start gap-4">
                <div className="w-32 text-sm text-muted-foreground">
                  {formatDate(tender.createdAt)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">Tender draft created</p>
                </div>
              </div>
            )}
            {tender.publishedDate && (
              <div className="flex items-start gap-4">
                <div className="w-32 text-sm text-muted-foreground">
                  {formatDate(tender.publishedDate)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">Published</p>
                  <p className="text-sm text-muted-foreground">Tender opened for bidding</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className="w-32 text-sm text-muted-foreground">
                {formatDate(tender.closingDate)}
              </div>
              <div className="flex-1">
                <p className="font-medium">Closing Date</p>
                <p className="text-sm text-muted-foreground">Deadline for bid submission</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
