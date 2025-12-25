'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useCreateContractMutation, useGetBidByIdQuery, useGetVendorsQuery } from '@/store/api/businessApi';
import { canCreateContract } from '@/utils/permissions';
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

export default function CreateContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const [createContract, { isLoading }] = useCreateContractMutation();

  // Get bid and vendor from URL params
  const bidId = searchParams.get('bidId');
  const preselectedVendorId = searchParams.get('vendorId');

  // Fetch bid data if bidId is provided
  const { data: bidResponse } = useGetBidByIdQuery(bidId || '', { skip: !bidId });
  const bid = bidResponse?.data;

  // Fetch vendors for dropdown
  const { data: vendorsResponse } = useGetVendorsQuery({ page: 1, pageSize: 100 });
  const vendors = vendorsResponse?.data || [];

  const [formData, setFormData] = useState({
    title: '',
    contractNumber: '',
    vendorId: preselectedVendorId || '',
    bidId: bidId || '',
    amount: '',
    currency: 'USD',
    startDate: '',
    endDate: '',
    description: '',
    terms: '',
    paymentTerms: '',
    deliveryTerms: '',
  });

  // Pre-fill form when bid data is loaded
  useEffect(() => {
    if (bid) {
      const bidAmount = bid.bidAmount
        ? (typeof bid.bidAmount === 'object' ? Number(bid.bidAmount) : parseFloat(String(bid.bidAmount)))
        : 0;

      setFormData(prev => ({
        ...prev,
        title: (bid as any).tender?.title ? `Contract for ${(bid as any).tender.title}` : prev.title,
        vendorId: bid.vendorId || prev.vendorId,
        bidId: bid.id || prev.bidId,
        amount: bidAmount ? bidAmount.toString() : prev.amount,
        description: `Contract created from Bid ${bid.id?.slice(0, 8).toUpperCase()}`,
      }));
    }
  }, [bid]);

  // Check permission
  if (!canCreateContract(user)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              You do not have permission to create contracts.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContract({
        ...formData,
        amount: parseFloat(formData.amount),
      }).unwrap();
      toast.success('Contract created successfully');
      router.push('/business/contracts');
    } catch (error) {
      toast.error('Failed to create contract');
      console.error('Error creating contract:', error);
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
          <Link href="/business/contracts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Contract</h1>
          <p className="text-muted-foreground mt-1">
            Create a new procurement contract
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
            <CardDescription>
              Enter the details for the new contract
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Contract Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter contract title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractNumber">Contract Number *</Label>
                <Input
                  id="contractNumber"
                  placeholder="e.g., CTR-2025-001"
                  value={formData.contractNumber}
                  onChange={(e) => handleChange('contractNumber', e.target.value)}
                  required
                />
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
                  {vendors.map((vendor: any) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Contract Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
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

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the contract scope and objectives"
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                placeholder="Enter contract terms and conditions"
                rows={4}
                value={formData.terms}
                onChange={(e) => handleChange('terms', e.target.value)}
              />
            </div>

            {/* Payment Terms */}
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                placeholder="e.g., Net 30 days"
                value={formData.paymentTerms}
                onChange={(e) => handleChange('paymentTerms', e.target.value)}
              />
            </div>

            {/* Delivery Terms */}
            <div className="space-y-2">
              <Label htmlFor="deliveryTerms">Delivery Terms</Label>
              <Input
                id="deliveryTerms"
                placeholder="e.g., FOB, CIF"
                value={formData.deliveryTerms}
                onChange={(e) => handleChange('deliveryTerms', e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Creating...' : 'Create Contract'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/business/contracts')}
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
