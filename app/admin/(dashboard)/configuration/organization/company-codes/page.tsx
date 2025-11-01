'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useGetCompanyCodesQuery, useCreateCompanyCodeMutation } from '@/store/api/configApi';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface CompanyCodeFormData {
  code: string;
  name: string;
  description?: string;
}

export default function CompanyCodesPage() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, error } = useGetCompanyCodesQuery();
  const [createCompanyCode, { isLoading: isCreating }] = useCreateCompanyCodeMutation();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyCodeFormData>();
  
  const onSubmit = async (formData: CompanyCodeFormData) => {
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description || '',
      };
      
      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      
      await createCompanyCode(payload).unwrap();
      toast.success('Company code created successfully');
      reset();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error creating company code:', err);
      const errorMessage = err?.data?.message || err?.data?.errors?.join(', ') || 'Failed to create company code';
      toast.error(errorMessage);
    }
  };
  
  const companyCodes = data?.data || [];

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
            <span>Failed to load company codes. Please try again.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company Codes</h1>
          <p className="text-muted-foreground">Top-level organizational units</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Company Code
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Company Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input 
                    placeholder="CC1" 
                    {...register('code', { required: 'Code is required' })}
                  />
                  {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input 
                    placeholder="Company 1" 
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input 
                    placeholder="Company description" 
                    {...register('description')}
                  />
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
        {companyCodes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No company codes configured yet. Create your first company code to get started.
            </CardContent>
          </Card>
        ) : (
          companyCodes.map((cc: any) => (
            <Card key={cc.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{cc.name}</h3>
                        <Badge>{cc.code}</Badge>
                      </div>
                      {cc.description && (
                        <p className="text-sm text-muted-foreground">
                          {cc.description}
                        </p>
                      )}
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
