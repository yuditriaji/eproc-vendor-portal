'use client';

import { use } from 'react';
import Link from 'next/link';
import { useGetTenderByIdQuery } from '@/store/api/procurementApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  FileText,
  Clock,
  ArrowLeft,
  Send,
  Download,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysRemaining } from '@/lib/formatters';

interface TenderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TenderDetailPage({ params }: TenderDetailPageProps) {
  const { id } = use(params);
  const { data: tenderResponse, isLoading, error } = useGetTenderByIdQuery(id);
  const tender = tenderResponse?.data;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Tender Not Found</CardTitle>
            <CardDescription>
              The tender you're looking for doesn't exist or has been removed.
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

  const daysRemaining = getDaysRemaining(tender.closingDate);
  const isUrgent = daysRemaining <= 7 && daysRemaining > 0;
  const isClosed = daysRemaining <= 0;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/vendor/tenders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tenders
          </Link>
        </Button>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={
              tender.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
              tender.status === 'CLOSED' ? 'bg-red-500/10 text-red-700 dark:text-red-400' :
              'bg-gray-500/10 text-gray-700 dark:text-gray-400'
            }>
              {tender.status}
            </Badge>
            {isUrgent && !isClosed && (
              <Badge variant="destructive">Closing Soon</Badge>
            )}
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold">{tender.title}</h1>
          <p className="text-muted-foreground text-sm">{tender.referenceNumber}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Download RFP</span>
            <span className="sm:hidden">Download</span>
          </Button>
          <Button className="w-full sm:w-auto" disabled={isClosed} asChild={!isClosed}>
            <Link href={`/vendor/bids/new?tender=${id}`}>
              <Send className="mr-2 h-4 w-4" />
              Submit Bid
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="requirements" className="text-xs sm:text-sm">Reqs</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm">Docs</TabsTrigger>
              <TabsTrigger value="timeline" className="hidden md:flex text-xs sm:text-sm">Timeline</TabsTrigger>
              <TabsTrigger value="qa" className="hidden md:flex text-xs sm:text-sm">Q&A</TabsTrigger>
            </TabsList>
            
            {/* Mobile-only dropdown for additional tabs */}
            <div className="md:hidden mt-2">
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="timeline">Timeline</option>
                <option value="qa">Q&A</option>
              </select>
            </div>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p>{tender.description || 'No description provided.'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scope of Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Detailed scope of work will be provided in the official tender documents.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Technical Capability</span>
                    <span className="font-medium">40%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Price Competitiveness</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Past Performance</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Delivery Timeline</span>
                    <span className="font-medium">10%</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Must be a registered business entity</li>
                    <li>Minimum 3 years of experience in relevant field</li>
                    <li>Valid business licenses and certifications</li>
                    <li>Financial stability and capacity</li>
                    <li>No conflicts of interest</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Required Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Company registration documents</li>
                    <li>Tax compliance certificate</li>
                    <li>Financial statements (last 3 years)</li>
                    <li>Technical proposal</li>
                    <li>Price proposal</li>
                    <li>Past performance references</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tender Documents</CardTitle>
                  <CardDescription>Download official tender documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Request for Proposal (RFP)', size: '2.4 MB', type: 'PDF' },
                    { name: 'Technical Specifications', size: '1.8 MB', type: 'PDF' },
                    { name: 'Bill of Quantities', size: '856 KB', type: 'XLSX' },
                    { name: 'Terms and Conditions', size: '1.2 MB', type: 'PDF' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Key Dates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Tender Published', date: tender.createdAt, status: 'completed' },
                      { label: 'Site Visit (Optional)', date: '2025-10-30T10:00:00Z', status: 'upcoming' },
                      { label: 'Questions Deadline', date: '2025-11-01T17:00:00Z', status: 'upcoming' },
                      { label: 'Bid Submission Deadline', date: tender.closingDate, status: 'upcoming' },
                      { label: 'Bid Opening', date: '2025-11-06T10:00:00Z', status: 'pending' },
                      { label: 'Award Notification', date: '2025-11-15T17:00:00Z', status: 'pending' },
                    ].map((event, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          event.status === 'completed' ? 'bg-green-500' :
                          event.status === 'upcoming' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium">{event.label}</p>
                          <p className="text-sm text-muted-foreground">{event.date ? formatDate(event.date) : 'TBA'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qa" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Questions & Answers</CardTitle>
                  <CardDescription>Submit questions or view responses from the procurement office</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">Submit a Question</Button>
                  <Separator />
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium text-sm mb-1">Q: What are the payment terms?</p>
                      <p className="text-sm text-muted-foreground">
                        A: Payment will be made in installments based on project milestones as outlined in the contract terms.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Asked on Oct 20, 2025</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium text-sm mb-1">Q: Is a site visit mandatory?</p>
                      <p className="text-sm text-muted-foreground">
                        A: Site visits are optional but highly recommended for better understanding of the project requirements.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Asked on Oct 22, 2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tender Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Building2 className="h-4 w-4" />
                  <span>Organization</span>
                </div>
                <p className="font-medium">{tender.organization?.name || 'N/A'}</p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Estimated Value</span>
                </div>
                <p className="font-medium">
                  {tender.estimatedValue
                    ? formatCurrency(tender.estimatedValue, tender.currency)
                    : 'Not disclosed'}
                </p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Closing Date</span>
                </div>
                <p className="font-medium">{formatDate(tender.closingDate)}</p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span>Time Remaining</span>
                </div>
                <p className={`font-medium ${
                  isClosed ? 'text-red-600' : isUrgent ? 'text-orange-600' : ''
                }`}>
                  {isClosed ? 'Closed' : `${daysRemaining} days`}
                </p>
              </div>

              {tender.location && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin className="h-4 w-4" />
                      <span>Location</span>
                    </div>
                    <p className="font-medium">{tender.location}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {isUrgent && !isClosed && (
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-200">
                      Deadline Approaching
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      This tender closes in {daysRemaining} days. Submit your bid soon.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Procurement Officer</p>
                <p className="font-medium">John Doe</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">procurement@example.com</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">+1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
