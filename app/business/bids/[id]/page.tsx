'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useGetBidByIdQuery, useScoreBidMutation } from '@/store/api/businessApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Star } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  DRAFT: { label: 'Draft', variant: 'outline' as const },
  SUBMITTED: { label: 'Submitted', variant: 'outline' as const },
  UNDER_REVIEW: { label: 'Under Review', variant: 'default' as const },
  EVALUATED: { label: 'Evaluated', variant: 'default' as const },
  ACCEPTED: { label: 'Accepted', variant: 'default' as const },
  REJECTED: { label: 'Rejected', variant: 'destructive' as const },
  WITHDRAWN: { label: 'Withdrawn', variant: 'outline' as const },
};

export default function BidDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const [scores, setScores] = useState({
    technical: '',
    financial: '',
    compliance: '',
    experience: '',
  });
  const [comments, setComments] = useState('');

  const { data: bidResponse, isLoading } = useGetBidByIdQuery(id);
  const [scoreBid, { isLoading: isScoring }] = useScoreBidMutation();

  const bid = bidResponse?.data;

  const handleSubmitScore = async () => {
    try {
      const scoreData = {
        technical: parseFloat(scores.technical) || 0,
        financial: parseFloat(scores.financial) || 0,
        compliance: parseFloat(scores.compliance) || 0,
        experience: parseFloat(scores.experience) || 0,
      };

      await scoreBid({
        id,
        scores: scoreData,
        comments: comments || undefined,
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Bid scored successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to score bid',
        variant: 'destructive',
      });
    }
  };

  const totalScore =
    (parseFloat(scores.technical) || 0) +
    (parseFloat(scores.financial) || 0) +
    (parseFloat(scores.compliance) || 0) +
    (parseFloat(scores.experience) || 0);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!bid) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Bid not found</h3>
          <Button className="mt-4" asChild>
            <Link href="/business/bids">Back to Bids</Link>
          </Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[bid.status] || statusConfig.SUBMITTED;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/business/bids">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Bid Evaluation</h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Bid ID: {bid.id.slice(0, 12).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Bid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tender</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{(bid as any).tender?.title || bid.tenderTitle || 'N/A'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(bid as any).tender?.tenderNumber || bid.tenderNumber || `#${bid.tenderId?.slice(0, 8) || 'N/A'}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{(bid as any).vendor?.name || bid.vendorName || 'N/A'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {bid.vendorId?.slice(0, 8) || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(() => {
                const amount = bid.bidAmount || (bid as any).amount;
                const parsed = amount
                  ? (typeof amount === 'object' ? Number(amount) : parseFloat(String(amount)))
                  : 0;
                return parsed && !isNaN(parsed)
                  ? formatCurrency(parsed, bid.currency || 'USD')
                  : 'N/A';
              })()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Score */}
      {bid.score !== undefined && bid.score !== null && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Score</CardTitle>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
                <span className="text-3xl font-bold text-yellow-600">{bid.score}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Scoring Section */}
      <Card>
        <CardHeader>
          <CardTitle>Bid Scoring</CardTitle>
          <CardDescription>Evaluate the bid on multiple criteria (max 25 points each)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="technical">Technical Compliance (0-25)</Label>
              <Input
                id="technical"
                type="number"
                min="0"
                max="25"
                step="0.5"
                value={scores.technical}
                onChange={(e) => setScores({ ...scores, technical: e.target.value })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Technical specifications and requirements met
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="financial">Financial Proposal (0-25)</Label>
              <Input
                id="financial"
                type="number"
                min="0"
                max="25"
                step="0.5"
                value={scores.financial}
                onChange={(e) => setScores({ ...scores, financial: e.target.value })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">Price competitiveness and value for money</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compliance">Compliance & Documentation (0-25)</Label>
              <Input
                id="compliance"
                type="number"
                min="0"
                max="25"
                step="0.5"
                value={scores.compliance}
                onChange={(e) => setScores({ ...scores, compliance: e.target.value })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Complete documentation and regulatory compliance
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Vendor Experience (0-25)</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="25"
                step="0.5"
                value={scores.experience}
                onChange={(e) => setScores({ ...scores, experience: e.target.value })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Past performance and relevant experience
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="font-medium">Total Score</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{totalScore.toFixed(1)}</span>
              <span className="text-muted-foreground">/100</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Evaluation Comments</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter evaluation notes and recommendations..."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/business/bids">Cancel</Link>
            </Button>
            <Button onClick={handleSubmitScore} disabled={isScoring || totalScore === 0}>
              Submit Evaluation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bid Details */}
      {bid.technicalProposal && (
        <Card>
          <CardHeader>
            <CardTitle>Technical Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{bid.technicalProposal}</p>
          </CardContent>
        </Card>
      )}

      {/* Submitted Date */}
      {bid.submittedAt && (
        <Card>
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Submitted on: <span className="font-medium text-foreground">{formatDate(bid.submittedAt)}</span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
