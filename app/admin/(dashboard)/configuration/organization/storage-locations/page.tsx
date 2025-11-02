'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Database, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useGetStorageLocationsQuery, useCreateStorageLocationMutation, useGetPlantsQuery } from '@/store/api/configApi';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface StorageLocationFormData {
  plantId: string;
  code: string;
  name: string;
}

export default function StorageLocationsPage() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, error } = useGetStorageLocationsQuery();
  const { data: plantsData } = useGetPlantsQuery();
  const [createStorageLocation, { isLoading: isCreating }] = useCreateStorageLocationMutation();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<StorageLocationFormData>();
  
  const onSubmit = async (formData: StorageLocationFormData) => {
    try {
      await createStorageLocation(formData).unwrap();
      toast.success('Storage location created successfully');
      reset();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error creating storage location:', err);
      const errorMessage = err?.data?.message || err?.data?.errors?.join(', ') || 'Failed to create storage location';
      toast.error(errorMessage);
    }
  };
  
  const storageLocations = Array.isArray(data) ? data : (data?.data || []);
  const plants = Array.isArray(plantsData) ? plantsData : (plantsData?.data || []);

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
            <span>Failed to load storage locations. Please try again.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Storage Locations</h1>
          <p className="text-muted-foreground">Warehouse and storage facilities</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Storage Location
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Storage Location</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Plant *</Label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md"
                    {...register('plantId', { required: 'Plant is required' })}
                  >
                    <option value="">Select a plant</option>
                    {plants.map((plant: any) => (
                      <option key={plant.id} value={plant.id}>
                        {plant.code} - {plant.name}
                      </option>
                    ))}
                  </select>
                  {errors.plantId && <p className="text-sm text-destructive">{errors.plantId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Storage Location Code *</Label>
                  <Input 
                    placeholder="S001" 
                    {...register('code', { required: 'Code is required' })}
                  />
                  {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input 
                    placeholder="Main WH" 
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
        {storageLocations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No storage locations configured yet. Create your first storage location to get started.
            </CardContent>
          </Card>
        ) : (
          storageLocations.map((location: any) => (
            <Card key={location.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{location.name}</h3>
                        <Badge>{location.code}</Badge>
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
