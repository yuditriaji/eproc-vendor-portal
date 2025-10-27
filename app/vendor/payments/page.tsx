'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Search, Download, DollarSign, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';

type PaymentStatus = 'SCHEDULED' | 'COMPLETED' | 'FAILED';

const statusConfig: Record<PaymentStatus, { label: string; variant: any; icon: any }> = {
  SCHEDULED: { label: 'Scheduled', variant: 'outline', icon: Clock },
  COMPLETED: { label: 'Completed', variant: 'secondary', icon: CheckCircle2 },
  FAILED: { label: 'Failed', variant: 'destructive', icon: XCircle },
};

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const payments = [
    {
      id: '1',
      paymentNumber: 'PAY-2025-001',
      invoiceNumber: 'INV-2025-001',
      buyer: 'Ministry of Technology',
      amount: 85000,
      currency: 'USD',
      paymentDate: '2025-10-25',
      method: 'Wire Transfer',
      transactionId: 'TXN-20251025-ABC123',
      status: 'COMPLETED' as PaymentStatus
    },
    {
      id: '2',
      paymentNumber: 'PAY-2025-002',
      invoiceNumber: 'INV-2025-002',
      buyer: 'Department of Finance',
      amount: 42000,
      currency: 'USD',
      paymentDate: '2025-11-05',
      method: 'Wire Transfer',
      status: 'SCHEDULED' as PaymentStatus
    },
  ];

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'COMPLETED').length,
    scheduled: payments.filter(p => p.status === 'SCHEDULED').length,
    totalAmount: payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-1">Track payment history and scheduled payments</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalAmount / 1000).toFixed(0)}K</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search payments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {payments.map((payment) => {
          const StatusIcon = statusConfig[payment.status].icon;
          return (
            <Card key={payment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{payment.paymentNumber}</h3>
                        <Badge variant={statusConfig[payment.status].variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[payment.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Invoice: {payment.invoiceNumber} • {payment.buyer}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">${payment.amount.toLocaleString()} {payment.currency}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Method:</span>
                          <span className="font-medium">{payment.method}</span>
                        </div>
                      </div>
                      {payment.transactionId && (
                        <p className="text-xs text-muted-foreground mt-2">Transaction ID: {payment.transactionId}</p>
                      )}
                    </div>
                  </div>
                  {payment.status === 'COMPLETED' && (
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
