'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGetRFQByIdQuery, useCreateQuotationMutation } from '@/store/api/procurementApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Save, FileText, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface QuotationItem {
    name: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
}

export default function CreateQuotationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rfqId = searchParams.get('rfqId');
    const { toast } = useToast();

    const { data: rfqResponse, isLoading: rfqLoading } = useGetRFQByIdQuery(rfqId || '', { skip: !rfqId });
    const [createQuotation, { isLoading: isSubmitting }] = useCreateQuotationMutation();

    const rfq = rfqResponse?.data;

    const [formData, setFormData] = useState({
        notes: '',
        validUntil: '',
    });

    const [items, setItems] = useState<QuotationItem[]>([
        { name: '', description: '', quantity: 1, unit: 'pcs', unitPrice: 0 },
    ]);

    // Pre-fill items from RFQ if available
    useEffect(() => {
        if (rfq?.items && Array.isArray(rfq.items) && rfq.items.length > 0) {
            setItems(
                rfq.items.map((item: any) => ({
                    name: item.name || item.description || '',
                    description: item.description || item.specifications || '',
                    quantity: item.quantity || 1,
                    unit: item.unit || 'pcs',
                    unitPrice: item.estimatedUnitPrice || item.unitPrice || 0,
                }))
            );
        }
    }, [rfq]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
        setItems((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addItem = () => {
        setItems((prev) => [
            ...prev,
            { name: '', description: '', quantity: 1, unit: 'pcs', unitPrice: 0 },
        ]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!rfqId) {
            toast({
                title: 'Error',
                description: 'RFQ ID is required',
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
            await createQuotation({
                rfqId,
                amount: calculateTotal(),
                items: items,
                validUntil: formData.validUntil || undefined,
                notes: formData.notes || undefined,
            }).unwrap();

            toast({
                title: 'Success',
                description: 'Quotation submitted successfully',
            });

            router.push('/vendor/quotations');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to submit quotation',
                variant: 'destructive',
            });
        }
    };

    if (!rfqId) {
        return (
            <div className="p-4 md:p-6">
                <Card>
                    <CardContent className="p-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No RFQ Selected</h3>
                        <p className="text-muted-foreground mb-4">
                            Please select an RFQ to submit a quotation for.
                        </p>
                        <Button asChild>
                            <Link href="/vendor/quotations">Back to Quotations</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/vendor/quotations">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Submit Quotation</h1>
                    <p className="text-muted-foreground">Respond to Request for Quotation</p>
                </div>
            </div>

            {/* RFQ Details */}
            {rfqLoading ? (
                <Skeleton className="h-32" />
            ) : rfq ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            RFQ Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">RFQ Number</p>
                                <p className="font-medium">{rfq.rfqNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Title</p>
                                <p className="font-medium">{rfq.title}</p>
                            </div>
                            {rfq.validUntil && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Valid Until:</span>
                                    <span className="font-medium">{formatDate(rfq.validUntil)}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Estimated Amount:</span>
                                <span className="font-medium">{formatCurrency(rfq.estimatedAmount || 0, 'USD')}</span>
                            </div>
                        </div>
                        {rfq.description && (
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="text-sm mt-1">{rfq.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">RFQ not found</p>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quotation Items */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Your Quotation</CardTitle>
                                <CardDescription>Enter your pricing for each item</CardDescription>
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
                                        <Label>Your Unit Price ($)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="text-right text-lg font-semibold">
                            Total Quote: ${calculateTotal().toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="validUntil">Quote Valid Until</Label>
                            <Input
                                id="validUntil"
                                name="validUntil"
                                type="date"
                                value={formData.validUntil}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes / Terms</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Enter any additional notes, terms, or conditions..."
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/vendor/quotations">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !rfq}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Submitting...' : 'Submit Quotation'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
