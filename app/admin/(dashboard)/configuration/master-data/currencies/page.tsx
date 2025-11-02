'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useGetCurrenciesQuery, useCreateCurrencyMutation } from '@/store/api/configApi';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface CurrencyFormData {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number;
  isActive: boolean;
}

export default function CurrenciesPage() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, error } = useGetCurrenciesQuery();
  const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CurrencyFormData>({
    defaultValues: {
      isActive: true,
      exchangeRate: 1.0,
    }
  });
  
  const onSubmit = async (formData: CurrencyFormData) => {
    try {
      const payload = {
        ...formData,
        exchangeRate: Number(formData.exchangeRate),
      };
      await createCurrency(payload).unwrap();
      toast.success('Currency created successfully');
      reset();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error creating currency:', err);
      const errorMessage = err?.data?.message || err?.data?.errors?.join(', ') || 'Failed to create currency';
      toast.error(errorMessage);
    }
  };
  
  const currencies = Array.isArray(data) ? data : (data?.data || []);

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
            <span>Failed to load currencies. Please try again.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Currencies</h1>
          <p className="text-muted-foreground">Manage currency exchange rates</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Currency
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency Code *</Label>
                  <Input 
                    placeholder="USD" 
                    {...register('code', { required: 'Code is required' })}
                  />
                  {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Symbol *</Label>
                  <Input 
                    placeholder="$" 
                    {...register('symbol', { required: 'Symbol is required' })}
                  />
                  {errors.symbol && <p className="text-sm text-destructive">{errors.symbol.message}</p>}
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Name *</Label>
                  <Input 
                    placeholder="US Dollar" 
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Exchange Rate *</Label>
                  <Input 
                    type="number"
                    step="0.0001"
                    placeholder="1.0" 
                    {...register('exchangeRate', { required: 'Exchange rate is required', min: 0 })}
                  />
                  {errors.exchangeRate && <p className="text-sm text-destructive">{errors.exchangeRate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" {...register('isActive')} className="h-4 w-4" />
                    <span className="text-sm">Active</span>
                  </div>
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
        {currencies.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No currencies configured yet. Create your first currency to get started.
            </CardContent>
          </Card>
        ) : (
          currencies.map((currency: any) => (
            <Card key={currency.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{currency.name}</h3>
                        <Badge>{currency.code}</Badge>
                        <span className="text-lg">{currency.symbol}</span>
                        {currency.isActive ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Exchange Rate: {currency.exchangeRate}
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
