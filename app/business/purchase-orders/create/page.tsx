'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useCreatePurchaseOrderMutation } from '@/store/api/businessApi';
import { canCreatePO } from '@/utils/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreatePOPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [createPO, { isLoading }] = useCreatePurchaseOrderMutation();

  const [formData, setFormData] = useState({
    poNumber: '',
    vendorId: '',
    prId: '',
    deliveryAddress: '',
    deliveryDate: '',
    paymentTerms: 'NET_30',
    notes: '',
    totalAmount: '',
    currency: 'USD',
  });

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
    try {
      await createPO({
        ...formData,
        totalAmount: parseFloat(formData.totalAmount),
      }).unwrap();
      toast.success('Purchase Order created successfully');
      router.push('/business/purchase-orders');
    } catch (error) {
      toast.error('Failed to create purchase order');
      console.error('Error creating PO:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Information</CardTitle>
            <CardDescription>
              Enter the details for the new purchase order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poNumber">PO Number *</Label>
                <Input
                  id="poNumber"
                  placeholder="e.g., PO-2025-001"
                  value={formData.poNumber}
                  onChange={(e) => handleChange('poNumber', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prId">Related PR (Optional)</Label>
                <Select
                  value={formData.prId}
                  onValueChange={(value) => handleChange('prId', value)}
                >
                  <SelectTrigger id="prId">
                    <SelectValue placeholder="Select PR" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="pr1">PR-2025-001</SelectItem>
                    <SelectItem value="pr2">PR-2025-002</SelectItem>
                    <SelectItem value="pr3">PR-2025-003</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vendor Selection */}
            <div className="space-y-2">
              <Label htmlFor="vendorId">Vendor *</Label>
              <Select
                value={formData.vendorId}
                onValueChange={(value) => handleChange('vendorId', value)}
                required
              >
                <SelectTrigger id="vendorId">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor1">Vendor 1</SelectItem>
                  <SelectItem value="vendor2">Vendor 2</SelectItem>
                  <SelectItem value="vendor3">Vendor 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.totalAmount}
                  onChange={(e) => handleChange('totalAmount', e.target.value)}
                  required
                />
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

            {/* Payment Terms */}
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

            {/* Delivery Details */}
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address *</Label>
              <Textarea
                id="deliveryAddress"
                placeholder="Enter complete delivery address"
                rows={3}
                value={formData.deliveryAddress}
                onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Expected Delivery Date *</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleChange('deliveryDate', e.target.value)}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
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
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
