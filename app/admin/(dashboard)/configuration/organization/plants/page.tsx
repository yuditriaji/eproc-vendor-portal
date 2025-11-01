'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useGetPlantsQuery, useCreatePlantMutation, useGetCompanyCodesQuery } from '@/store/api/configApi';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface PlantFormData {
  companyCodeId: string;
  code: string;
  name: string;
  description: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function PlantsPage() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, error } = useGetPlantsQuery();
  const { data: companyCodesData } = useGetCompanyCodesQuery();
  const [createPlant, { isLoading: isCreating }] = useCreatePlantMutation();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlantFormData>();
  
  const onSubmit = async (formData: PlantFormData) => {
    try {
      const payload = {
        companyCodeId: formData.companyCodeId,
        code: formData.code,
        name: formData.name,
        description: formData.description,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      };
      
      console.log('Sending plant payload:', JSON.stringify(payload, null, 2));
      
      await createPlant(payload).unwrap();
      toast.success('Plant created successfully');
      reset();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error creating plant:', err);
      const errorMessage = err?.data?.message || err?.data?.errors?.join(', ') || 'Failed to create plant';
      toast.error(errorMessage);
    }
  };
  
  const plants = data?.data || [];
  const companyCodes = companyCodesData?.data || [];

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
            <span>Failed to load plants. Please try again.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plants</h1>
          <p className="text-muted-foreground">Manufacturing and operational facilities</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plant
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Plant</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Company Code *</Label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md"
                    {...register('companyCodeId', { required: 'Company code is required' })}
                  >
                    <option value="">Select a company code</option>
                    {companyCodes.map((cc: any) => (
                      <option key={cc.id} value={cc.id}>
                        {cc.code} - {cc.name}
                      </option>
                    ))}
                  </select>
                  {errors.companyCodeId && <p className="text-sm text-destructive">{errors.companyCodeId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Plant Code *</Label>
                  <Input 
                    placeholder="P1001" 
                    {...register('code', { required: 'Code is required' })}
                  />
                  {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input 
                    placeholder="Manhattan Manufacturing Plant" 
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description *</Label>
                  <Input 
                    placeholder="Primary manufacturing facility" 
                    {...register('description', { required: 'Description is required' })}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Street Address *</Label>
                  <Input 
                    placeholder="456 Industrial Ave" 
                    {...register('street', { required: 'Street is required' })}
                  />
                  {errors.street && <p className="text-sm text-destructive">{errors.street.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input 
                    placeholder="New York" 
                    {...register('city', { required: 'City is required' })}
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Input 
                    placeholder="NY" 
                    {...register('state', { required: 'State is required' })}
                  />
                  {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Zip Code *</Label>
                  <Input 
                    placeholder="10002" 
                    {...register('zipCode', { required: 'Zip code is required' })}
                  />
                  {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Input 
                    placeholder="USA" 
                    {...register('country', { required: 'Country is required' })}
                  />
                  {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
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
        {plants.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No plants configured yet. Create your first plant to get started.
            </CardContent>
          </Card>
        ) : (
          plants.map((plant: any) => (
            <Card key={plant.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{plant.name}</h3>
                        <Badge>{plant.code}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {plant.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {plant.address?.city}, {plant.address?.state} {plant.address?.country}
                      </p>
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
