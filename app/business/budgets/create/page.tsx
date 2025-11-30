'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
// import { useCreateBudgetMutation } from '@/store/api/businessApi'; // TODO: Implement budget API
import { canManageBudget } from '@/utils/permissions';
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

export default function CreateBudgetPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  // const [createBudget, { isLoading }] = useCreateBudgetMutation(); // TODO: Implement budget API
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    fiscalYear: new Date().getFullYear().toString(),
    department: '',
    category: '',
    totalAmount: '',
    currency: 'USD',
    startDate: '',
    endDate: '',
    description: '',
    approver: '',
  });

  // Check permission
  if (!canManageBudget(user)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              You do not have permission to create budgets.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call when budget API is implemented
      console.log('Creating budget:', {
        ...formData,
        fiscalYear: parseInt(formData.fiscalYear),
        totalAmount: parseFloat(formData.totalAmount),
      });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Budget created successfully');
      router.push('/business/budgets');
    } catch (error) {
      toast.error('Failed to create budget');
      console.error('Error creating budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/business/budgets">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Budget</h1>
          <p className="text-muted-foreground mt-1">
            Allocate a new budget for a department or category
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Budget Information</CardTitle>
            <CardDescription>
              Enter the details for the new budget allocation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="name">Budget Name *</Label>
              <Input
                id="name"
                placeholder="e.g., IT Department Annual Budget 2025"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fiscalYear">Fiscal Year *</Label>
                <Select
                  value={formData.fiscalYear}
                  onValueChange={(value) => handleChange('fiscalYear', value)}
                >
                  <SelectTrigger id="fiscalYear">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleChange('department', value)}
                  required
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT Department</SelectItem>
                    <SelectItem value="HR">HR Department</SelectItem>
                    <SelectItem value="FINANCE">Finance Department</SelectItem>
                    <SelectItem value="OPERATIONS">Operations</SelectItem>
                    <SelectItem value="SALES">Sales & Marketing</SelectItem>
                    <SelectItem value="ADMIN">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Budget Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Budget Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAPEX">Capital Expenditure (CAPEX)</SelectItem>
                  <SelectItem value="OPEX">Operational Expenditure (OPEX)</SelectItem>
                  <SelectItem value="PERSONNEL">Personnel Costs</SelectItem>
                  <SelectItem value="TRAVEL">Travel & Entertainment</SelectItem>
                  <SelectItem value="SUPPLIES">Supplies & Materials</SelectItem>
                  <SelectItem value="SERVICES">Services & Contractors</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
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

            {/* Date Range */}
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

            {/* Approver */}
            <div className="space-y-2">
              <Label htmlFor="approver">Budget Approver *</Label>
              <Select
                value={formData.approver}
                onValueChange={(value) => handleChange('approver', value)}
                required
              >
                <SelectTrigger id="approver">
                  <SelectValue placeholder="Select approver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cfo">CFO - Jane Smith</SelectItem>
                  <SelectItem value="ceo">CEO - John Doe</SelectItem>
                  <SelectItem value="dept-head">Department Head</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and scope of this budget"
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Creating...' : 'Create Budget'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/business/budgets')}
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
