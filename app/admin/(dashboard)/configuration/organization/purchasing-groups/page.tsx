'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useGetPurchasingGroupsQuery, useCreatePurchasingGroupMutation, useGetPurchasingOrgsQuery } from '@/store/api/configApi';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface PurchasingGroupFormData {
  purchasingOrgId: string;
  code: string;
  name: string;
}

export default function PurchasingGroupsPage() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, error } = useGetPurchasingGroupsQuery();
  const { data: purchasingOrgsData } = useGetPurchasingOrgsQuery();
  const [createPurchasingGroup, { isLoading: isCreating }] = useCreatePurchasingGroupMutation();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PurchasingGroupFormData>();
  
  const onSubmit = async (formData: PurchasingGroupFormData) => {
    try {
      await createPurchasingGroup(formData).unwrap();
      toast.success('Purchasing group created successfully');
      reset();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error creating purchasing group:', err);
      const errorMessage = err?.data?.message || err?.data?.errors?.join(', ') || 'Failed to create purchasing group';
      toast.error(errorMessage);
    }
  };
  
  const purchasingGroups = Array.isArray(data) ? data : (data?.data || []);
  const purchasingOrgs = Array.isArray(purchasingOrgsData) ? purchasingOrgsData : (purchasingOrgsData?.data || []);

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
            <span>Failed to load purchasing groups. Please try again.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchasing Groups</h1>
          <p className="text-muted-foreground">Procurement teams and groups</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Purchasing Group
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Purchasing Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Purchasing Organization *</Label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md"
                    {...register('purchasingOrgId', { required: 'Purchasing organization is required' })}
                  >
                    <option value="">Select a purchasing organization</option>
                    {purchasingOrgs.map((org: any) => (
                      <option key={org.id} value={org.id}>
                        {org.code} - {org.name}
                      </option>
                    ))}
                  </select>
                  {errors.purchasingOrgId && <p className="text-sm text-destructive">{errors.purchasingOrgId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input 
                    placeholder="PG1" 
                    {...register('code', { required: 'Code is required' })}
                  />
                  {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input 
                    placeholder="Group 1" 
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
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
        {purchasingGroups.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No purchasing groups configured yet. Create your first purchasing group to get started.
            </CardContent>
          </Card>
        ) : (
          purchasingGroups.map((group: any) => (
            <Card key={group.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{group.name}</h3>
                        <Badge>{group.code}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
