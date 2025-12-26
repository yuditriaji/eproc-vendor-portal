'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Network, Plus, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useGetOrgUnitsQuery, useCreateOrgUnitMutation, useDeleteOrgUnitMutation } from '@/store/api/configApi';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface OrgUnitFormData {
    name: string;
    type: 'COMPANY_CODE' | 'PURCHASING_GROUP';
    level: number;
    companyCode?: string;
    pgCode?: string;
}

export default function OrgUnitsPage() {
    const [showForm, setShowForm] = useState(false);
    const { data, isLoading, error } = useGetOrgUnitsQuery();
    const [createOrgUnit, { isLoading: isCreating }] = useCreateOrgUnitMutation();
    const [deleteOrgUnit] = useDeleteOrgUnitMutation();

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<OrgUnitFormData>({
        defaultValues: {
            type: 'COMPANY_CODE',
            level: 1,
        }
    });

    const selectedType = watch('type');

    const onSubmit = async (formData: OrgUnitFormData) => {
        try {
            await createOrgUnit({
                name: formData.name,
                type: formData.type,
                level: formData.level,
                companyCode: formData.type === 'COMPANY_CODE' ? formData.companyCode : undefined,
                pgCode: formData.type === 'PURCHASING_GROUP' ? formData.pgCode : undefined,
            }).unwrap();
            toast.success('Organization unit created successfully');
            reset();
            setShowForm(false);
        } catch (err: any) {
            console.error('Error creating org unit:', err);
            const errorMessage = err?.data?.message || 'Failed to create organization unit';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this organization unit?')) return;
        try {
            await deleteOrgUnit(id).unwrap();
            toast.success('Organization unit deleted');
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to delete organization unit');
        }
    };

    const orgUnits = Array.isArray(data) ? data : (data?.data || []);

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardContent className="p-6 flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <span>Failed to load organization units. Please try again.</span>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Organization Units</h1>
                    <p className="text-muted-foreground">Manage organization units for budgeting and procurement</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Organization Unit
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create Organization Unit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name *</Label>
                                    <Input
                                        placeholder="e.g., IT Division"
                                        {...register('name', { required: 'Name is required' })}
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Type *</Label>
                                    <Select
                                        value={selectedType}
                                        onValueChange={(value: 'COMPANY_CODE' | 'PURCHASING_GROUP') => setValue('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="COMPANY_CODE">Company Code</SelectItem>
                                            <SelectItem value="PURCHASING_GROUP">Purchasing Group</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Level</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        {...register('level', { valueAsNumber: true })}
                                    />
                                </div>
                                {selectedType === 'COMPANY_CODE' ? (
                                    <div className="space-y-2">
                                        <Label>Company Code (SAP)</Label>
                                        <Input
                                            placeholder="e.g., 1000"
                                            {...register('companyCode')}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>PG Code (SAP)</Label>
                                        <Input
                                            placeholder="e.g., 001"
                                            {...register('pgCode')}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create'
                                    )}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => {
                                    setShowForm(false);
                                    reset();
                                }} disabled={isCreating}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                {orgUnits.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            No organization units configured yet. Create your first organization unit to enable budget creation.
                        </CardContent>
                    </Card>
                ) : (
                    orgUnits.map((ou: any) => (
                        <Card key={ou.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3 flex-1">
                                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Network className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{ou.name}</h3>
                                                <Badge>{ou.type}</Badge>
                                                <Badge variant="outline">Level {ou.level}</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground flex gap-4">
                                                {ou.companyCode && <span>Company Code: {ou.companyCode}</span>}
                                                {ou.pgCode && <span>PG Code: {ou.pgCode}</span>}
                                                <span>ID: {ou.id.slice(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(ou.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
