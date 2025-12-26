'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCreateInvoiceMutation } from '@/store/api/financeApi';
import { useCreateInvoiceFromGRMutation } from '@/store/api/workflowApi';
import { useGetGoodsReceiptByIdQuery, useGetGoodsReceiptsQuery, useGetPurchaseOrdersQuery } from '@/store/api/businessApi';
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
  const [createInvoiceFromGR, { isLoading: isCreatingFromGR }] = useCreateInvoiceFromGRMutation();

  // Fetch all DELIVERED POs and COMPLETE GRs for dropdowns
  const { data: posResponse } = useGetPurchaseOrdersQuery({ pageSize: 100, status: 'DELIVERED' });
  const { data: grsResponse } = useGetGoodsReceiptsQuery({ pageSize: 100 });
  const purchaseOrders: any[] = posResponse?.data || [];
  const goodsReceipts: any[] = grsResponse?.data || [];

  // Fetch single GR details if grId is provided
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

      // Use workflow API if GR is selected (handles vendorId automatically)
      if (formData.goodsReceiptId) {
        await createInvoiceFromGR({
          grId: formData.goodsReceiptId,
          data: {
            items: invoiceItems,
            subtotal,
            taxAmount,
            totalAmount: total,
            invoiceDate: formData.invoiceDate,
            dueDate: formData.dueDate,
            notes: formData.notes || undefined,
          },
        }).unwrap();
      } else {
        // For manual invoice creation without GR, need vendorId from PO
        const selectedPO = purchaseOrders.find((po: any) => po.id === formData.purchaseOrderId);
        const vendorId = selectedPO?.vendors?.[0]?.vendorId || selectedPO?.vendorId;

        if (!formData.purchaseOrderId) {
          toast({
            title: 'Missing Information',
            description: 'Please select a Purchase Order or Goods Receipt to create an invoice',
            variant: 'destructive',
          });
          return;
        }

        if (!vendorId) {
          toast({
            title: 'Missing Vendor',
            description: 'Could not find vendor information from the selected PO. Please select a Goods Receipt instead.',
            variant: 'destructive',
          });
          return;
        }

        const invoiceData = {
          poId: formData.purchaseOrderId,
          vendorId: vendorId,
          items: invoiceItems,
          amount: subtotal,
          taxAmount,
          totalAmount: total,
          invoiceDate: formData.invoiceDate,
          dueDate: formData.dueDate || undefined,
          notes: formData.notes || undefined,
        };

        await createInvoice(invoiceData).unwrap();
      }

      toast({
        title: 'Success',
        description: `Invoice ${asDraft ? 'saved as draft' : 'created successfully'}`,
      });

      router.push('/business/invoices');
    } catch (error: any) {
      console.error('Invoice creation error:', error);
      toast({
        title: 'Error',
        description: error?.data?.message || error?.message || 'Failed to create invoice',
        variant: 'destructive',
      });
    }
  };

  const isFormValid = (formData.purchaseOrderId || formData.goodsReceiptId) &&
    items.length > 0 &&
    items.some(item => item.description && parseFloat(item.quantity) > 0);
  const isSubmitting = isLoading || isCreatingFromGR;

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
          <CardDescription>Link invoice to a Purchase Order or Goods Receipt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Purchase Order (Delivered)</Label>
              <Select
                value={formData.purchaseOrderId || 'none'}
                onValueChange={(v) => handleChange('purchaseOrderId', v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Purchase Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No PO --</SelectItem>
                  {purchaseOrders.map((po: any) => (
                    <SelectItem key={po.id} value={po.id}>
                      {po.poNumber} - {po.title || po.description || 'No title'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Only DELIVERED POs are shown</p>
            </div>
            <div className="space-y-2">
              <Label>Goods Receipt</Label>
              <Select
                value={formData.goodsReceiptId || 'none'}
                onValueChange={(v) => handleChange('goodsReceiptId', v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Goods Receipt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No GR --</SelectItem>
                  {goodsReceipts.map((gr: any) => (
                    <SelectItem key={gr.id} value={gr.id}>
                      {gr.receiptNumber || gr.grNumber || gr.id.slice(0, 8)} - {gr.purchaseOrder?.poNumber || 'PO N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Link to an existing Goods Receipt</p>
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
          disabled={!isFormValid || isSubmitting}
        >
          <Save className="mr-2 h-4 w-4" />
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={!isFormValid || isSubmitting}
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>
    </div>
  );
}
