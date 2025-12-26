'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCreateInvoiceMutation } from '@/store/api/financeApi';
import { useGetGoodsReceiptByIdQuery } from '@/store/api/businessApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Send, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const grIdFromUrl = searchParams.get('grId');
  const { toast } = useToast();
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();

  // Fetch GR details if grId is provided
  const { data: grResponse } = useGetGoodsReceiptByIdQuery(grIdFromUrl || '', { skip: !grIdFromUrl });
  const gr: any = grResponse?.data ?? grResponse;

  const [formData, setFormData] = useState({
    purchaseOrderId: '',
    goodsReceiptId: grIdFromUrl || '',
    contractId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'IDR',
    taxRate: '11',
    paymentTerms: 'Net 30',
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: '1', unitPrice: '0' },
  ]);

  // Pre-fill from GR data when loaded
  useEffect(() => {
    if (gr && grIdFromUrl) {
      setFormData(prev => ({
        ...prev,
        goodsReceiptId: grIdFromUrl,
        purchaseOrderId: gr.purchaseOrderId || gr.purchaseOrder?.id || '',
      }));
      // Pre-fill items from GR
      if (gr.receivedItems || gr.items) {
        const grItems = (gr.receivedItems || gr.items).map((item: any, idx: number) => ({
          id: item.id || String(idx + 1),
          description: item.description || item.name || '',
          quantity: String(item.receivedQuantity || item.quantity || 1),
          unitPrice: String(item.unitPrice || 0),
        }));
        if (grItems.length > 0) setItems(grItems);
      }
    }
  }, [gr, grIdFromUrl]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      description: '',
      quantity: '1',
      unitPrice: '0',
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const taxAmount = subtotal * (parseFloat(formData.taxRate) / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = async (asDraft: boolean) => {
    try {
      const invoiceItems = items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
        totalPrice: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
        taxRate: parseFloat(formData.taxRate),
        taxAmount: ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)) * (parseFloat(formData.taxRate) / 100),
      }));

      const invoiceData = {
        purchaseOrderId: formData.purchaseOrderId || undefined,
        goodsReceiptId: formData.goodsReceiptId || undefined,
        contractId: formData.contractId || undefined,
        items: invoiceItems,
        subtotal,
        taxAmount,
        totalAmount: total,
        currency: formData.currency,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        status: (asDraft ? 'DRAFT' : 'PENDING_APPROVAL') as any,
        paymentTerms: formData.paymentTerms || undefined,
        notes: formData.notes || undefined,
      };

      await createInvoice(invoiceData).unwrap();

      toast({
        title: 'Success',
        description: `Invoice ${asDraft ? 'saved as draft' : 'submitted for approval'}`,
      });

      router.push('/business/invoices');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create invoice',
        variant: 'destructive',
      });
    }
  };

  const isFormValid = items.length > 0 && items.some(item => item.description && parseFloat(item.quantity) > 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/business/invoices">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">
            Create a new invoice for goods/services received
          </p>
        </div>
      </div>

      {/* Reference Information */}
      <Card>
        <CardHeader>
          <CardTitle>Reference Information</CardTitle>
          <CardDescription>Link invoice to purchase order, contract, or goods receipt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseOrderId">Purchase Order ID (Optional)</Label>
              <Input
                id="purchaseOrderId"
                placeholder="Enter PO ID"
                value={formData.purchaseOrderId}
                onChange={(e) => handleChange('purchaseOrderId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractId">Contract ID (Optional)</Label>
              <Input
                id="contractId"
                placeholder="Enter Contract ID"
                value={formData.contractId}
                onChange={(e) => handleChange('contractId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goodsReceiptId">Goods Receipt ID (Optional)</Label>
              <Input
                id="goodsReceiptId"
                placeholder="Enter GR ID"
                value={formData.goodsReceiptId}
                onChange={(e) => handleChange('goodsReceiptId', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => handleChange('invoiceDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="IDR">IDR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                placeholder="e.g., Net 30"
                value={formData.paymentTerms}
                onChange={(e) => handleChange('paymentTerms', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Add items to the invoice</CardDescription>
            </div>
            <Button onClick={addItem} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b pb-4 last:border-0">
              <div className="md:col-span-5 space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Total</Label>
                <Input
                  value={(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2)}
                  readOnly
                  disabled
                />
              </div>
              <div className="md:col-span-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">{subtotal.toFixed(2)} {formData.currency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax ({formData.taxRate}%):</span>
              <span className="font-semibold">{taxAmount.toFixed(2)} {formData.currency}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>{total.toFixed(2)} {formData.currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Additional notes or comments"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/business/invoices">Cancel</Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSubmit(true)}
          disabled={!isFormValid || isLoading}
        >
          <Save className="mr-2 h-4 w-4" />
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={!isFormValid || isLoading}
        >
          <Send className="mr-2 h-4 w-4" />
          Submit for Approval
        </Button>
      </div>
    </div>
  );
}
