'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileSignature, 
  Search, 
  Plus,
  Calendar, 
  DollarSign,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit
} from 'lucide-react';

type QuotationStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

interface Quotation {
  id: string;
  quotationNumber: string;
  requestTitle: string;
  buyer: {
    name: string;
    organization: string;
  };
  quotedAmount: number;
  currency: string;
  submittedDate?: string;
  validUntil: string;
  status: QuotationStatus;
  items: number;
}

const statusConfig: Record<QuotationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  DRAFT: { label: 'Draft', variant: 'outline', icon: FileEdit },
  SUBMITTED: { label: 'Submitted', variant: 'default', icon: Clock },
  ACCEPTED: { label: 'Accepted', variant: 'secondary', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', variant: 'destructive', icon: XCircle },
  EXPIRED: { label: 'Expired', variant: 'outline', icon: Clock },
};

export default function QuotationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'ALL'>('ALL');

  // Mock data - replace with real API data
  const quotations: Quotation[] = [
    {
      id: '1',
      quotationNumber: 'QUO-2025-001',
      requestTitle: 'Network Equipment Quotation Request',
      buyer: {
        name: 'John Smith',
        organization: 'IT Department'
      },
      quotedAmount: 85000,
      currency: 'USD',
      submittedDate: '2025-10-20',
      validUntil: '2025-11-20',
      status: 'SUBMITTED',
      items: 5
    },
    {
      id: '2',
      quotationNumber: 'QUO-2025-002',
      requestTitle: 'Office Furniture Supply',
      buyer: {
        name: 'Sarah Johnson',
        organization: 'Administration'
      },
      quotedAmount: 45000,
      currency: 'USD',
      submittedDate: '2025-10-15',
      validUntil: '2025-11-15',
      status: 'ACCEPTED',
      items: 12
    },
    {
      id: '3',
      quotationNumber: 'QUO-2025-003',
      requestTitle: 'Software Licensing Quotation',
      buyer: {
        name: 'Michael Chen',
        organization: 'Technology Services'
      },
      quotedAmount: 120000,
      currency: 'USD',
      validUntil: '2025-11-25',
      status: 'DRAFT',
      items: 3
    }
  ];

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.requestTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quotation.buyer.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || quotation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: quotations.length,
    draft: quotations.filter(q => q.status === 'DRAFT').length,
    submitted: quotations.filter(q => q.status === 'SUBMITTED').length,
    accepted: quotations.filter(q => q.status === 'ACCEPTED').length,
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground mt-1">
            Manage quotation requests and submissions
          </p>
        </div>
        <Button asChild>
          <Link href="/vendor/quotations/create">
            <Plus className="h-4 w-4 mr-2" />
            New Quotation
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('DRAFT')}
              >
                Draft
              </Button>
              <Button
                variant={statusFilter === 'SUBMITTED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('SUBMITTED')}
              >
                Submitted
              </Button>
              <Button
                variant={statusFilter === 'ACCEPTED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ACCEPTED')}
              >
                Accepted
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <div className="space-y-4">
        {filteredQuotations.map((quotation) => {
          const StatusIcon = statusConfig[quotation.status].icon;
          const daysUntilExpiry = Math.ceil((new Date(quotation.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={quotation.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileSignature className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{quotation.requestTitle}</h3>
                          <Badge variant={statusConfig[quotation.status].variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[quotation.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {quotation.quotationNumber}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Buyer:</span>
                            <span className="font-medium">{quotation.buyer.organization}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-medium">
                              ${quotation.quotedAmount.toLocaleString()} {quotation.currency}
                            </span>
                          </div>
                          {quotation.submittedDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Submitted:</span>
                              <span className="font-medium">
                                {new Date(quotation.submittedDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Valid Until:</span>
                            <span className={`font-medium ${daysUntilExpiry < 7 ? 'text-red-600' : ''}`}>
                              {new Date(quotation.validUntil).toLocaleDateString()}
                              {daysUntilExpiry > 0 && ` (${daysUntilExpiry} days)`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {quotation.status === 'DRAFT' && (
                      <Button size="sm" asChild>
                        <Link href={`/vendor/quotations/${quotation.id}/edit`}>
                          <FileEdit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/vendor/quotations/${quotation.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredQuotations.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileSignature className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quotations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t created any quotations yet'}
              </p>
              {!searchQuery && statusFilter === 'ALL' && (
                <Button asChild>
                  <Link href="/vendor/quotations/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Quotation
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
