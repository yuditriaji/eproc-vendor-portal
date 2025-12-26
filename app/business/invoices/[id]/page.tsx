'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useGetInvoiceByIdQuery, useApproveInvoiceMutation } from '@/store/api/financeApi';
import { useProcessPaymentFromInvoiceMutation } from '@/store/api/workflowApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle, XCircle, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  PENDING: { label: 'Pending', variant: 'outline' },
  PENDING_APPROVAL: { label: 'Pending Approval', variant: 'outline' },
  APPROVED: { label: 'Approved', variant: 'default' },
  PAID: { label: 'Paid', variant: 'default' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  OVERDUE: { label: 'Overdue', variant: 'destructive' },
  DISPUTED: { label: 'Disputed', variant: 'destructive' },
};

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    method: 'BANK_TRANSFER',
    reference: '',
    notes: '',
  });

  const { data: invoiceResponse, isLoading } = useGetInvoiceByIdQuery(id);
  const [approveInvoice, { isLoading: isApproving }] = useApproveInvoiceMutation();
  const [processPayment, { isLoading: isProcessingPayment }] = useProcessPaymentFromInvoiceMutation();

  const invoice: any = invoiceResponse?.data ?? invoiceResponse;

  const handleApprove = async (approved: boolean) => {
    try {
      await approveInvoice({ id, approved }).unwrap();
      toast({
        title: 'Success',
        description: `Invoice ${approved ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to process approval',
        variant: 'destructive',
      });
    }
  };

  const handleProcessPayment = async () => {
    try {
      await processPayment({
        invoiceId: id,
        data: {
          paymentMethod: paymentData.method,
          reference: paymentData.reference,
          notes: paymentData.notes,
          paidAt: new Date().toISOString(),
        },
      }).unwrap();
      toast({
        title: 'Success',
        description: 'Payment processed successfully',
      });
      setIsPaymentDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to process payment',
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

  if (!invoice) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Invoice not found</h3>
          <Button className="mt-4" asChild>
            <Link href="/business/invoices">Back to Invoices</Link>
          </Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.DRAFT;
  const canApprove = invoice.status === 'PENDING_APPROVAL';
  const canProcessPayment = invoice.status === 'APPROVED';

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/business/invoices">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Invoice {invoice.invoiceNumber}</h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            {invoice.vendorName && (
              <p className="text-muted-foreground mt-1">Vendor: {invoice.vendorName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canApprove && (
            <>
              <Button
                variant="destructive"
                onClick={() => handleApprove(false)}
                disabled={isApproving}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={() => handleApprove(true)} disabled={isApproving}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          )}
          {canProcessPayment && (
            <Button onClick={() => setIsPaymentDialogOpen(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Process Payment
            </Button>
          )}
        </div>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Invoice Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{formatDate(invoice.invoiceDate)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{formatDate(invoice.dueDate)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(invoice.totalAmount, invoice.currency)}
            </p>
          </CardContent>
        </Card>

        {invoice.paymentTerms && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Payment Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{invoice.paymentTerms}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reference Information */}
      {(invoice.purchaseOrderNumber || invoice.contractNumber || invoice.goodsReceiptNumber) && (
        <Card>
          <CardHeader>
            <CardTitle>Reference Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {invoice.purchaseOrderNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Order</p>
                  <p className="font-medium">{invoice.purchaseOrderNumber}</p>
                </div>
              )}
              {invoice.contractNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Contract</p>
                  <p className="font-medium">{invoice.contractNumber}</p>
                </div>
              )}
              {invoice.goodsReceiptNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Goods Receipt</p>
                  <p className="font-medium">{invoice.goodsReceiptNumber}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(invoice.items || []).map((item: any, index: number) => (
                <TableRow key={item.id || index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(item.totalPrice, invoice.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 space-y-2 max-w-md ml-auto">
            <div className="flex items-center justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax:</span>
              <span className="font-semibold">
                {formatCurrency(invoice.taxAmount, invoice.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Approval Information */}
      {(invoice.approvedByName || invoice.approvedAt) && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoice.approvedByName && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Approved by: </span>
                  <span className="font-medium">{invoice.approvedByName}</span>
                </p>
              )}
              {invoice.approvedAt && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Approved on: </span>
                  <span className="font-medium">{formatDate(invoice.approvedAt)}</span>
                </p>
              )}
              {invoice.rejectionReason && (
                <p className="text-sm text-red-600">
                  <span className="font-medium">Rejection Reason: </span>
                  {invoice.rejectionReason}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Information */}
      {invoice.paidAt && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/10">
          <CardHeader>
            <CardTitle className="text-green-900 dark:text-green-100">Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="text-muted-foreground">Paid on: </span>
              <span className="font-medium">{formatDate(invoice.paidAt)}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Record payment for invoice {invoice.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input value={formatCurrency(invoice.totalAmount, invoice.currency)} disabled />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentData.method} onValueChange={(v) => setPaymentData(prev => ({ ...prev, method: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Reference</Label>
              <Input
                placeholder="e.g., Transaction ID or Check Number"
                value={paymentData.reference}
                onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                placeholder="Optional notes"
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleProcessPayment} disabled={isProcessingPayment}>
              {isProcessingPayment ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
