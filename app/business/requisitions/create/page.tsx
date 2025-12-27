'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useCreatePurchaseRequisitionMutation } from '@/store/api/businessApi';
import { useGetBudgetsQuery } from '@/store/api/financeApi';
import { canCreatePR } from '@/utils/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Plus, Trash, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatters';

interface PRItem {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  estimatedPrice: string;
}

export default function CreatePRPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [createPR, { isLoading }] = useCreatePurchaseRequisitionMutation();

  // Fetch available budgets
  const { data: budgetsData, isLoading: budgetsLoading } = useGetBudgetsQuery({ pageSize: 100 });
  const budgets = budgetsData?.data || [];

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    requestedBy: user?.name || '',
    priority: 'MEDIUM',
    requiredBy: '',
    justification: '',
    notes: '',
    budgetId: '',
  });

  const [items, setItems] = useState<PRItem[]>([
    { id: '1', description: '', quantity: '', unit: 'PCS', estimatedPrice: '' },
  ]);

  // Calculate total estimate
  const totalEstimate = useMemo(() =>
    items.reduce(
      (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.estimatedPrice) || 0),
      0
    ),
    [items]
  );

  // Get selected budget info
  const selectedBudget: any = useMemo(() =>
    budgets.find((b: any) => b.id === formData.budgetId),
    [budgets, formData.budgetId]
  );

  // Check if budget is sufficient
  const isBudgetSufficient = useMemo(() => {
    if (!selectedBudget) return true; // No budget selected
    const available = Number(selectedBudget.availableAmount) || 0;
    return totalEstimate <= available;
  }, [selectedBudget, totalEstimate]);

  // Check permission
  if (!canCreatePR(user)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              You do not have permission to create purchase requisitions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        budgetId: formData.budgetId && formData.budgetId !== 'none' ? formData.budgetId : undefined,
        items: items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.estimatedPrice),
          totalPrice: parseFloat(item.quantity) * parseFloat(item.estimatedPrice),
        })),
      };
      await createPR(payload).unwrap();
      toast.success('Purchase Requisition created successfully');
      router.push('/business/requisitions');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create purchase requisition');
      console.error('Error creating PR:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id: string, field: keyof PRItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    const newId = (Math.max(...items.map((i) => parseInt(i.id))) + 1).toString();
    setItems((prev) => [
      ...prev,
      { id: newId, description: '', quantity: '', unit: 'PCS', estimatedPrice: '' },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/business/requisitions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Purchase Requisition</h1>
          <p className="text-muted-foreground mt-1">
            Request items or services to be procured
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Requisition Information</CardTitle>
            <CardDescription>General details about the requisition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter requisition title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="ADMIN">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestedBy">Requested By</Label>
                <Input id="requestedBy" value={formData.requestedBy} disabled />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredBy">Required By *</Label>
                <Input
                  id="requiredBy"
                  type="date"
                  value={formData.requiredBy}
                  onChange={(e) => handleChange('requiredBy', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Budget Selection */}
            <div className="space-y-2">
              <Label htmlFor="budgetId">Budget (Optional)</Label>
              <p className="text-xs text-muted-foreground">Link this requisition to a budget for financial control</p>
              {budgetsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={formData.budgetId}
                  onValueChange={(value) => handleChange('budgetId', value)}
                >
                  <SelectTrigger id="budgetId">
                    <SelectValue placeholder="Select budget (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No budget</SelectItem>
                    {budgets.map((budget: any) => (
                      <SelectItem key={budget.id} value={budget.id}>
                        {budget.orgUnit?.name || budget.name || `Budget ${budget.fiscalYear}`} - Available: {formatCurrency(budget.availableAmount || 0, budget.currency || 'IDR')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Budget Availability Indicator */}
              {selectedBudget && (
                <div className="mt-2">
                  {isBudgetSufficient ? (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700 dark:text-green-400">
                        Budget available: {formatCurrency(selectedBudget.availableAmount, selectedBudget.currency || 'IDR')}
                        {totalEstimate > 0 && (
                          <span className="ml-2">
                            (After this PR: {formatCurrency((selectedBudget.availableAmount || 0) - totalEstimate, selectedBudget.currency || 'IDR')})
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Insufficient budget! Available: {formatCurrency(selectedBudget.availableAmount, selectedBudget.currency || 'IDR')},
                        Estimated: {formatCurrency(totalEstimate, selectedBudget.currency || 'IDR')}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">Justification *</Label>
              <Textarea
                id="justification"
                placeholder="Explain why these items are needed"
                rows={3}
                value={formData.justification}
                onChange={(e) => handleChange('justification', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information"
                rows={2}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Requisition Items</CardTitle>
                <CardDescription>List of items to be procured</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`desc-${item.id}`}>Description *</Label>
                  <Input
                    id={`desc-${item.id}`}
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`qty-${item.id}`}>Quantity *</Label>
                    <Input
                      id={`qty-${item.id}`}
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`unit-${item.id}`}>Unit *</Label>
                    <Select
                      value={item.unit}
                      onValueChange={(value) => handleItemChange(item.id, 'unit', value)}
                    >
                      <SelectTrigger id={`unit-${item.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PCS">Pieces</SelectItem>
                        <SelectItem value="BOX">Box</SelectItem>
                        <SelectItem value="KG">Kilogram</SelectItem>
                        <SelectItem value="LTR">Liter</SelectItem>
                        <SelectItem value="SET">Set</SelectItem>
                        <SelectItem value="PKG">Package</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`price-${item.id}`}>Est. Unit Price *</Label>
                    <Input
                      id={`price-${item.id}`}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={item.estimatedPrice}
                      onChange={(e) => handleItemChange(item.id, 'estimatedPrice', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="text-right text-sm text-muted-foreground">
                  Line Total: $
                  {(
                    (parseFloat(item.quantity) || 0) * (parseFloat(item.estimatedPrice) || 0)
                  ).toFixed(2)}
                </div>
              </div>
            ))}

            <div className="border-t pt-4 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Estimated Value</p>
                <p className="text-2xl font-bold">${totalEstimate.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Creating...' : 'Create Requisition'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/business/requisitions')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
