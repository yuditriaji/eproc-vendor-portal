'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import {
  useCreatePurchaseOrderMutation,
  useGetVendorsQuery,
  useGetPurchaseRequisitionsQuery
} from '@/store/api/businessApi';
import { canCreatePO } from '@/utils/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function CreatePOPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [createPO, { isLoading }] = useCreatePurchaseOrderMutation();

  // Fetch real vendors and PRs for dropdowns
  const { data: vendorsData, isLoading: vendorsLoading } = useGetVendorsQuery({ pageSize: 100, status: 'ACTIVE' });
  const { data: prsData, isLoading: prsLoading } = useGetPurchaseRequisitionsQuery({ pageSize: 100, status: 'APPROVED' });

  const vendors = vendorsData?.data || [];
  const prs = prsData?.data || [];

  const [formData, setFormData] = useState({
    poNumber: '',
    title: '',
    description: '',
    vendorId: '',
    prId: '',
    deliveryAddress: '',
    deliveryDate: '',
    paymentTerms: 'NET_30',
    notes: '',
    currency: 'USD',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, amount: 0 }
  ]);

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = 0; // You can add tax calculation if needed
  const totalAmount = subtotal + taxAmount;

  // Check permission
  if (!canCreatePO(user)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              You do not have permission to create purchase orders.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendorId) {
      toast.error('Please select a vendor');
      return;
    }

    if (!formData.title) {
      toast.error('Please enter a PO title');
      return;
    }

    if (lineItems.length === 0 || lineItems.every(item => !item.description)) {
      toast.error('Please add at least one line item');
      return;
    }

    try {
      const payload: any = {
        poNumber: formData.poNumber || undefined,
        title: formData.title,
        description: formData.description || undefined,
        amount: subtotal,
        totalAmount: totalAmount,
        items: lineItems.filter(item => item.description), // Only include items with description
        terms: {
          paymentTerms: formData.paymentTerms,
          deliveryAddress: formData.deliveryAddress,
          notes: formData.notes,
        },
        expectedDelivery: formData.deliveryDate ? new Date(formData.deliveryDate) : undefined,
        prId: formData.prId && formData.prId !== 'none' ? formData.prId : undefined,
        vendorIds: [formData.vendorId], // Backend expects array
        currency: formData.currency,
      };

      await createPO(payload).unwrap();
      toast.success('Purchase Order created successfully');
      router.push('/business/purchase-orders');
    } catch (error: any) {
      console.error('Error creating PO:', error);
      toast.error(error?.data?.message || 'Failed to create purchase order');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // Recalculate amount
      if (field === 'quantity' || field === 'unitPrice') {
        updated[index].amount = updated[index].quantity * updated[index].unitPrice;
      }
      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/business/purchase-orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Purchase Order</h1>
          <p className="text-muted-foreground mt-1">
            Create a new purchase order for a vendor
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Information</CardTitle>
              <CardDescription>
                Enter the basic details for the new purchase order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poNumber">PO Number (Auto-generated if empty)</Label>
                  <Input
                    id="poNumber"
                    placeholder="e.g., PO-2025-001"
                    value={formData.poNumber}
                    onChange={(e) => handleChange('poNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prId">Related PR (Optional)</Label>
                  {prsLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={formData.prId}
                      onValueChange={(value) => handleChange('prId', value)}
                    >
                      <SelectTrigger id="prId">
                        <SelectValue placeholder="Select PR" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {prs.map((pr: any) => (
                          <SelectItem key={pr.id} value={pr.id}>
                            {pr.prNumber} - {pr.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">PO Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Office Supplies Order Q1 2025"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this purchase order"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </div>

              {/* Vendor Selection */}
              <div className="space-y-2">
                <Label htmlFor="vendorId">Vendor *</Label>
                {vendorsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : vendors.length === 0 ? (
                  <div className="text-sm text-destructive p-3 border border-destructive/50 rounded-md">
                    No active vendors found. Please add vendors first.
                  </div>
                ) : (
                  <Select
                    value={formData.vendorId}
                    onValueChange={(value) => handleChange('vendorId', value)}
                    required
                  >
                    <SelectTrigger id="vendorId">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor: any) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                          {vendor.registrationNumber && ` (${vendor.registrationNumber})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>
                Add the items to be purchased
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5 space-y-1">
                    {index === 0 && <Label className="text-xs">Description *</Label>}
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    {index === 0 && <Label className="text-xs">Qty</Label>}
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    {index === 0 && <Label className="text-xs">Unit Price</Label>}
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    {index === 0 && <Label className="text-xs">Amount</Label>}
                    <Input
                      type="number"
                      value={item.amount.toFixed(2)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Line Item
              </Button>

              <div className="flex justify-end pt-4 border-t">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">{formData.currency} {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formData.currency} {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery & Payment</CardTitle>
              <CardDescription>
                Specify delivery and payment terms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms *</Label>
                  <Select
                    value={formData.paymentTerms}
                    onValueChange={(value) => handleChange('paymentTerms', value)}
                  >
                    <SelectTrigger id="paymentTerms">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NET_15">Net 15 days</SelectItem>
                      <SelectItem value="NET_30">Net 30 days</SelectItem>
                      <SelectItem value="NET_45">Net 45 days</SelectItem>
                      <SelectItem value="NET_60">Net 60 days</SelectItem>
                      <SelectItem value="COD">Cash on Delivery</SelectItem>
                      <SelectItem value="ADVANCE">Advance Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleChange('currency', value)}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="IDR">IDR (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Expected Delivery Date</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => handleChange('deliveryDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Textarea
                  id="deliveryAddress"
                  placeholder="Enter complete delivery address"
                  rows={2}
                  value={formData.deliveryAddress}
                  onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or notes"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isLoading || vendors.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Creating...' : 'Create Purchase Order'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/business/purchase-orders')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
