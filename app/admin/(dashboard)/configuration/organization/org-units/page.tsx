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
import { Network, Plus, Loader2, AlertCircle, Trash2, Building2, ChevronRight } from 'lucide-react';
import {
    useGetOrgUnitsQuery,
    useCreateOrgUnitMutation,
    useDeleteOrgUnitMutation,
    useGetCompanyCodesQuery
} from '@/store/api/configApi';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface OrgUnitFormData {
    name: string;
    type: 'COMPANY_CODE' | 'PURCHASING_GROUP';
    level: number;
    parentId?: string;
    companyCodeId?: string;
    companyCode?: string;
    pgCode?: string;
}

export default function OrgUnitsPage() {
    const [showForm, setShowForm] = useState(false);
    const { data, isLoading, error } = useGetOrgUnitsQuery();
    const { data: companyCodesData, isLoading: loadingCompanyCodes } = useGetCompanyCodesQuery();
    const [createOrgUnit, { isLoading: isCreating }] = useCreateOrgUnitMutation();
    const [deleteOrgUnit] = useDeleteOrgUnitMutation();

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<OrgUnitFormData>({
        defaultValues: {
            type: 'COMPANY_CODE',
            level: 1,
        }
    });

    const selectedType = watch('type');
    const selectedCompanyCodeId = watch('companyCodeId');

    const orgUnits = Array.isArray(data) ? data : (data?.data || []);
    const companyCodes = Array.isArray(companyCodesData) ? companyCodesData : (companyCodesData?.data || []);

    // When company code is selected, auto-fill the SAP code
    const handleCompanyCodeSelect = (companyCodeId: string) => {
        const actualValue = companyCodeId === 'none' ? undefined : companyCodeId;
        setValue('companyCodeId', actualValue);
        if (actualValue) {
            const cc = companyCodes.find((c: any) => c.id === actualValue);
            if (cc) {
                setValue('companyCode', cc.code);
            }
        }
    };

    const onSubmit = async (formData: OrgUnitFormData) => {
        try {
            await createOrgUnit({
                name: formData.name,
                type: formData.type,
                level: formData.level,
                parentId: formData.parentId || undefined,
                companyCodeId: formData.companyCodeId || undefined,
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
                    <p className="text-muted-foreground">Manage hierarchical organization units for budgeting (SAP-style)</p>
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
                                    <Label>Linked Company Code (SAP)</Label>
                                    <Select
                                        value={selectedCompanyCodeId || 'none'}
                                        onValueChange={handleCompanyCodeSelect}
                                        disabled={loadingCompanyCodes}
                                    >
                                        <SelectTrigger>
                                            {loadingCompanyCodes ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Loading...
                                                </span>
                                            ) : (
                                                <SelectValue placeholder="Select company code" />
                                            )}
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {companyCodes.map((cc: any) => (
                                                <SelectItem key={cc.id} value={cc.id}>
                                                    {cc.code} - {cc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Links this org unit to an SAP company code</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Parent Org Unit (Hierarchy)</Label>
                                    <Select
                                        value={watch('parentId') || 'none'}
                                        onValueChange={(value) => setValue('parentId', value === 'none' ? undefined : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select parent (or leave empty for root)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None (Root Level)</SelectItem>
                                            {orgUnits.map((ou: any) => (
                                                <SelectItem key={ou.id} value={ou.id}>
                                                    {'─'.repeat(ou.level - 1)} {ou.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Create hierarchical structure for budget allocation</p>
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
                                        <Label>SAP Company Code</Label>
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
                            <p>No organization units configured yet.</p>
                            <p className="text-sm mt-1">Create your first organization unit to enable budget creation.</p>
                        </CardContent>
                    </Card>
                ) : (
                    orgUnits.map((ou: any) => (
                        <Card key={ou.id} className={ou.level > 1 ? `ml-${(ou.level - 1) * 4}` : ''}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3 flex-1">
                                        {ou.level > 1 && (
                                            <ChevronRight className="h-5 w-5 text-muted-foreground mt-2" />
                                        )}
                                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            {ou.linkedCompanyCode ? (
                                                <Building2 className="h-5 w-5 text-primary" />
                                            ) : (
                                                <Network className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-semibold">{ou.name}</h3>
                                                <Badge variant="secondary">{ou.type}</Badge>
                                                <Badge variant="outline">Level {ou.level}</Badge>
                                                {ou.linkedCompanyCode && (
                                                    <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">
                                                        CC: {ou.linkedCompanyCode.code}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex gap-4 flex-wrap">
                                                {ou.linkedCompanyCode && (
                                                    <span>Linked to: {ou.linkedCompanyCode.name}</span>
                                                )}
                                                {ou.parent && (
                                                    <span>Parent: {ou.parent.name}</span>
                                                )}
                                                {ou.companyCode && !ou.linkedCompanyCode && (
                                                    <span>SAP Code: {ou.companyCode}</span>
                                                )}
                                                {ou.pgCode && (
                                                    <span>PG Code: {ou.pgCode}</span>
                                                )}
                                                <span className="opacity-50">ID: {ou.id.slice(0, 8)}...</span>
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
