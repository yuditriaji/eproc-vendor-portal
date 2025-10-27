'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Receipt, Search, Plus, DollarSign, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';

type InvoiceStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'PAID' | 'REJECTED';

const statusConfig: Record<InvoiceStatus, { label: string; variant: any; icon: any }> = {
  PENDING_APPROVAL: { label: 'Pending', variant: 'outline', icon: Clock },
  APPROVED: { label: 'Approved', variant: 'default', icon: CheckCircle2 },
  PAID: { label: 'Paid', variant: 'secondary', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', variant: 'destructive', icon: XCircle },
};

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const invoices = [
    {
      id: '1',
      invoiceNumber: 'INV-2025-001',
      poNumber: 'PO-2025-001',
      buyer: 'Ministry of Technology',
      amount: 85000,
      currency: 'USD',
      invoiceDate: '2025-10-15',
      dueDate: '2025-11-14',
      status: 'APPROVED' as InvoiceStatus
    },
    {
      id: '2',
      invoiceNumber: 'INV-2025-002',
      poNumber: 'PO-2025-002',
      buyer: 'Department of Finance',
      amount: 42000,
      currency: 'USD',
      invoiceDate: '2025-10-20',
      dueDate: '2025-11-19',
      status: 'PENDING_APPROVAL' as InvoiceStatus
    },
  ];

  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'PENDING_APPROVAL').length,
    approved: invoices.filter(i => i.status === 'APPROVED').length,
    paid: invoices.filter(i => i.status === 'PAID').length,
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage and track your invoices</p>
        </div>
        <Button asChild>
          <Link href="/vendor/invoices/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Link>
        </Button>
      </div>

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {invoices.map((invoice) => {
          const StatusIcon = statusConfig[invoice.status].icon;
          return (
            <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                        <Badge variant={statusConfig[invoice.status].variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[invoice.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">PO: {invoice.poNumber} • {invoice.buyer}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">${invoice.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Invoice:</span>
                          <span className="font-medium">{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Due:</span>
                          <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/vendor/invoices/${invoice.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
