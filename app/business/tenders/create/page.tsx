'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTenderMutation } from '@/store/api/businessApi';
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
import { ArrowLeft, Save, Send } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function CreateTenderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createTender, { isLoading }] = useCreateTenderMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    estimatedValue: '',
    currency: 'USD',
    closingDate: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (asDraft: boolean) => {
    try {
      const tenderData = {
        title: formData.title,
        description: formData.description,
        category: formData.category || undefined,
        location: formData.location || undefined,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        currency: formData.currency,
        closingDate: formData.closingDate,
        status: asDraft ? 'DRAFT' : 'PUBLISHED',
      };

      await createTender(tenderData).unwrap();

      toast({
        title: 'Success',
        description: `Tender ${asDraft ? 'saved as draft' : 'published'} successfully`,
      });

      router.push('/business/tenders');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create tender',
        variant: 'destructive',
      });
    }
  };

  const isFormValid = formData.title && formData.closingDate;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/business/tenders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Tender</h1>
          <p className="text-muted-foreground mt-1">
            Create and publish a new tender for vendors
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Tender Information</CardTitle>
          <CardDescription>Enter the details of the tender</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter tender title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter detailed description of the tender requirements"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={6}
            />
          </div>

          {/* Category and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., IT Services, Construction"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., New York, USA"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
          </div>

          {/* Estimated Value and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Estimated Value</Label>
              <Input
                id="estimatedValue"
                type="number"
                placeholder="0.00"
                value={formData.estimatedValue}
                onChange={(e) => handleChange('estimatedValue', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Closing Date */}
          <div className="space-y-2">
            <Label htmlFor="closingDate">
              Closing Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="closingDate"
              type="datetime-local"
              value={formData.closingDate}
              onChange={(e) => handleChange('closingDate', e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              Deadline for vendors to submit their bids
            </p>
          </div>

          {/* Document Upload Placeholder */}
          <div className="space-y-2">
            <Label>Tender Documents</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Document upload feature coming soon
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You'll be able to attach requirement documents, specifications, and terms
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/business/tenders">Cancel</Link>
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
          Publish Tender
        </Button>
      </div>
    </div>
  );
}
