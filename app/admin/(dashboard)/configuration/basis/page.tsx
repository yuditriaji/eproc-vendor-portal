'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useGetBasisConfigQuery, useCreateBasisConfigMutation } from '@/store/api/configApi';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface BasisConfigFormData {
  levels: number;
  notes: string;
  allowCrossPlantProcurement: boolean;
  tier1: number;
  tier2: number;
  tier3: number;
  startMonth: number;
  endMonth: number;
}

export default function BasisConfigurationPage() {
  const { data: configData, isLoading, error } = useGetBasisConfigQuery();
  const [createBasisConfig, { isLoading: isSaving }] = useCreateBasisConfigMutation();
  const [hasExistingConfig, setHasExistingConfig] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BasisConfigFormData>({
    defaultValues: {
      levels: 3,
      notes: 'CompanyCode → Plant → StorageLocation hierarchy',
      allowCrossPlantProcurement: true,
      tier1: 10000,
      tier2: 50000,
      tier3: 100000,
      startMonth: 1,
      endMonth: 12,
    }
  });

  useEffect(() => {
    if (configData?.data?.tenantConfig) {
      const config = configData.data.tenantConfig;
      setHasExistingConfig(true);
      reset({
        levels: config.orgStructure?.levels || 3,
        notes: config.orgStructure?.notes || 'CompanyCode → Plant → StorageLocation hierarchy',
        allowCrossPlantProcurement: config.orgStructure?.allowCrossPlantProcurement ?? true,
        tier1: config.approvalLimits?.tier1 || 10000,
        tier2: config.approvalLimits?.tier2 || 50000,
        tier3: config.approvalLimits?.tier3 || 100000,
        startMonth: config.financialYear?.startMonth || 1,
        endMonth: config.financialYear?.endMonth || 12,
      });
    }
  }, [configData, reset]);

  const onSubmit = async (formData: BasisConfigFormData) => {
    try {
      const payload = {
        tenantConfig: {
          orgStructure: {
            levels: Number(formData.levels),
            notes: formData.notes,
            allowCrossPlantProcurement: formData.allowCrossPlantProcurement,
          },
          businessVariants: [
            {
              name: 'Standard Procurement',
              code: 'STD',
              description: 'Standard procurement process for regular items',
            },
          ],
          approvalLimits: {
            tier1: Number(formData.tier1),
            tier2: Number(formData.tier2),
            tier3: Number(formData.tier3),
          },
          financialYear: {
            startMonth: Number(formData.startMonth),
            endMonth: Number(formData.endMonth),
          },
        },
        processConfig: {
          name: 'Standard Tender Process',
          processType: 'TENDER',
          description: 'Complete tender lifecycle from draft to award',
          steps: [
            {
              stepName: 'Draft',
              requiredRole: 'BUYER',
              allowedActions: ['create', 'edit'],
              duration: 2,
            },
            {
              stepName: 'Review',
              requiredRole: 'MANAGER',
              allowedActions: ['review', 'comment'],
              duration: 1,
            },
            {
              stepName: 'Publish',
              requiredRole: 'ADMIN',
              allowedActions: ['publish'],
              duration: 0,
            },
            {
              stepName: 'Bidding',
              requiredRole: 'VENDOR',
              allowedActions: ['submit_bid'],
              duration: 14,
            },
            {
              stepName: 'Evaluation',
              requiredRole: 'BUYER',
              allowedActions: ['score', 'compare'],
              duration: 3,
            },
            {
              stepName: 'Award',
              requiredRole: 'ADMIN',
              allowedActions: ['award', 'reject'],
              duration: 1,
            },
          ],
        },
      };

      await createBasisConfig(payload).unwrap();
      toast.success(hasExistingConfig ? 'Configuration updated successfully' : 'Configuration created successfully');
    } catch (err: any) {
      console.error('Error saving basis configuration:', err);
      const errorMessage = err?.data?.message || err?.data?.errors?.join(', ') || 'Failed to save configuration';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Basis Configuration</h1>
          <p className="text-muted-foreground">System-wide configuration settings</p>
        </div>
        {hasExistingConfig && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Configuration Active</span>
          </div>
        )}
      </div>

      {error && (
        <Card className="border-yellow-500">
          <CardContent className="p-4 flex items-center gap-2 text-yellow-700">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Unable to load existing configuration. Using default values.</span>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Organizational Structure</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hierarchy Levels *</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="5"
                  {...register('levels', { 
                    required: 'Hierarchy levels is required',
                    min: { value: 1, message: 'Minimum 1 level' },
                    max: { value: 5, message: 'Maximum 5 levels' }
                  })} 
                />
                {errors.levels && <p className="text-sm text-destructive">{errors.levels.message}</p>}
                <p className="text-xs text-muted-foreground">
                  CompanyCode → Plant → StorageLocation
                </p>
              </div>
              <div className="space-y-2">
                <Label>Allow Cross-Plant Procurement</Label>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    {...register('allowCrossPlantProcurement')} 
                    className="h-4 w-4" 
                  />
                  <span className="text-sm">Enable cross-plant procurement</span>
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Hierarchy Description</Label>
                <Input 
                  {...register('notes')} 
                  placeholder="Describe your organizational hierarchy"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tier 1 Limit ($) *</Label>
                <Input 
                  type="number" 
                  min="0"
                  {...register('tier1', { 
                    required: 'Tier 1 limit is required',
                    min: { value: 0, message: 'Must be positive' }
                  })} 
                />
                {errors.tier1 && <p className="text-sm text-destructive">{errors.tier1.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tier 2 Limit ($) *</Label>
                <Input 
                  type="number" 
                  min="0"
                  {...register('tier2', { 
                    required: 'Tier 2 limit is required',
                    min: { value: 0, message: 'Must be positive' }
                  })} 
                />
                {errors.tier2 && <p className="text-sm text-destructive">{errors.tier2.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Tier 3 Limit ($) *</Label>
                <Input 
                  type="number" 
                  min="0"
                  {...register('tier3', { 
                    required: 'Tier 3 limit is required',
                    min: { value: 0, message: 'Must be positive' }
                  })} 
                />
                {errors.tier3 && <p className="text-sm text-destructive">{errors.tier3.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Year</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Month *</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="12" 
                  {...register('startMonth', { 
                    required: 'Start month is required',
                    min: { value: 1, message: 'Month must be 1-12' },
                    max: { value: 12, message: 'Month must be 1-12' }
                  })} 
                />
                {errors.startMonth && <p className="text-sm text-destructive">{errors.startMonth.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>End Month *</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="12" 
                  {...register('endMonth', { 
                    required: 'End month is required',
                    min: { value: 1, message: 'Month must be 1-12' },
                    max: { value: 12, message: 'Month must be 1-12' }
                  })} 
                />
                {errors.endMonth && <p className="text-sm text-destructive">{errors.endMonth.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => reset()}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              hasExistingConfig ? 'Update Configuration' : 'Save Configuration'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
