'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateRFQMutation } from '@/store/api/procurementApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RFQItem {
    name: string;
    description: string;
    quantity: number;
    unit: string;
    estimatedUnitPrice: number;
}

export default function CreateRFQPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [createRFQ, { isLoading }] = useCreateRFQMutation();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        validUntil: '',
        category: '',
        department: '',
    });

    const [items, setItems] = useState<RFQItem[]>([
        { name: '', description: '', quantity: 1, unit: 'pcs', estimatedUnitPrice: 0 },
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: keyof RFQItem, value: string | number) => {
        setItems((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addItem = () => {
        setItems((prev) => [
            ...prev,
            { name: '', description: '', quantity: 1, unit: 'pcs', estimatedUnitPrice: 0 },
        ]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.quantity * item.estimatedUnitPrice, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Title is required',
                variant: 'destructive',
            });
            return;
        }

        if (items.some((item) => !item.name.trim())) {
            toast({
                title: 'Validation Error',
                description: 'All items must have a name',
                variant: 'destructive',
            });
            return;
        }

        try {
            await createRFQ({
                title: formData.title,
                description: formData.description,
                items: items,
                estimatedAmount: calculateTotal(),
                validUntil: formData.validUntil || undefined,
                targetVendorIds: [],
                category: formData.category || undefined,
                department: formData.department || undefined,
            } as any).unwrap();

            toast({
                title: 'Success',
                description: 'RFQ created successfully',
            });

            router.push('/business/rfq');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to create RFQ',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/business/rfq">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Create New RFQ</h1>
                    <p className="text-muted-foreground">Request for Quotation from vendors</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Enter the RFQ details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter RFQ title"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="validUntil">Valid Until</Label>
                                <Input
                                    id="validUntil"
                                    name="validUntil"
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter RFQ description"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    placeholder="e.g., IT Equipment"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    placeholder="e.g., IT, Finance"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Items */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Items</CardTitle>
                                <CardDescription>Add items you need quotations for</CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Item {index + 1}</span>
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="space-y-1">
                                        <Label>Name *</Label>
                                        <Input
                                            value={item.name}
                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                            placeholder="Item name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Quantity</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Unit</Label>
                                        <Input
                                            value={item.unit}
                                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                            placeholder="pcs, kg, etc."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Est. Unit Price</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.estimatedUnitPrice}
                                            onChange={(e) => handleItemChange(index, 'estimatedUnitPrice', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="text-right text-lg font-semibold">
                            Estimated Total: ${calculateTotal().toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/business/rfq">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        {isLoading ? 'Creating...' : 'Create RFQ'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
