'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building, Plus, Loader2, AlertCircle } from 'lucide-react';
import { 
  useGetVendorsQuery, 
  useCreateVendorMutation,
  useGetCompanyCodesQuery,
  useGetPlantsQuery,
  useGetPurchasingOrgsQuery,
  useGetPurchasingGroupsQuery
} from '@/store/api/configApi';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface VendorFormData {
  name: string;
  registrationNumber: string;
  taxId: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  businessType: string;
  yearEstablished: number;
  employeeCount: number;
  annualRevenue: number;
  certifications: string;
  companyCodeId: string;
  plantId: string;
  purchasingOrgId: string;
  purchasingGroupId: string;
}

export default function VendorsPage() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, error } = useGetVendorsQuery();
  const { data: companyCodesData } = useGetCompanyCodesQuery();
  const { data: plantsData } = useGetPlantsQuery();
  const { data: purchasingOrgsData } = useGetPurchasingOrgsQuery();
  const { data: purchasingGroupsData } = useGetPurchasingGroupsQuery();
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VendorFormData>();
  
  const onSubmit = async (formData: VendorFormData) => {
    try {
      const payload = {
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        taxId: formData.taxId,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        website: formData.website,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          routingNumber: formData.routingNumber,
        },
        businessType: formData.businessType,
        yearEstablished: Number(formData.yearEstablished),
        employeeCount: Number(formData.employeeCount),
        annualRevenue: Number(formData.annualRevenue),
        certifications: formData.certifications.split(',').map(c => c.trim()).filter(Boolean),
        companyCodeId: formData.companyCodeId,
        plantId: formData.plantId,
        purchasingOrgId: formData.purchasingOrgId,
        purchasingGroupId: formData.purchasingGroupId,
      };
      
      await createVendor(payload).unwrap();
      toast.success('Vendor created successfully');
      reset();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error creating vendor:', err);
      const errorMessage = err?.data?.message || err?.data?.errors?.join(', ') || 'Failed to create vendor';
      toast.error(errorMessage);
    }
  };
  
  const vendors = data?.data || [];
  const companyCodes = companyCodesData?.data || [];
  const plants = plantsData?.data || [];
  const purchasingOrgs = purchasingOrgsData?.data || [];
  const purchasingGroups = purchasingGroupsData?.data || [];

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
            <span>Failed to load vendors. Please try again.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">Manage supplier and vendor information</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Vendor Name *</Label>
                    <Input placeholder="Acme Corp" {...register('name', { required: 'Name is required' })} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Registration Number *</Label>
                    <Input placeholder="REG123456" {...register('registrationNumber', { required: 'Required' })} />
                    {errors.registrationNumber && <p className="text-sm text-destructive">{errors.registrationNumber.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Tax ID *</Label>
                    <Input placeholder="TAX123456" {...register('taxId', { required: 'Required' })} />
                    {errors.taxId && <p className="text-sm text-destructive">{errors.taxId.message}</p>}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" placeholder="contact@acme.com" {...register('contactEmail', { required: 'Required' })} />
                    {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input placeholder="+1-555-0123" {...register('contactPhone', { required: 'Required' })} />
                    {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone.message}</p>}
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Website *</Label>
                    <Input placeholder="https://acme.com" {...register('website', { required: 'Required' })} />
                    {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-semibold">Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Street *</Label>
                    <Input placeholder="123 Main St" {...register('street', { required: 'Required' })} />
                    {errors.street && <p className="text-sm text-destructive">{errors.street.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input placeholder="New York" {...register('city', { required: 'Required' })} />
                    {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Input placeholder="NY" {...register('state', { required: 'Required' })} />
                    {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Zip Code *</Label>
                    <Input placeholder="10001" {...register('zipCode', { required: 'Required' })} />
                    {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <Input placeholder="USA" {...register('country', { required: 'Required' })} />
                    {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Bank Name *</Label>
                    <Input placeholder="First Bank" {...register('bankName', { required: 'Required' })} />
                    {errors.bankName && <p className="text-sm text-destructive">{errors.bankName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number *</Label>
                    <Input placeholder="1234567890" {...register('accountNumber', { required: 'Required' })} />
                    {errors.accountNumber && <p className="text-sm text-destructive">{errors.accountNumber.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Routing Number *</Label>
                    <Input placeholder="021000021" {...register('routingNumber', { required: 'Required' })} />
                    {errors.routingNumber && <p className="text-sm text-destructive">{errors.routingNumber.message}</p>}
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Business Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Business Type *</Label>
                    <Input placeholder="Corporation" {...register('businessType', { required: 'Required' })} />
                    {errors.businessType && <p className="text-sm text-destructive">{errors.businessType.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Year Established *</Label>
                    <Input type="number" placeholder="2010" {...register('yearEstablished', { required: 'Required' })} />
                    {errors.yearEstablished && <p className="text-sm text-destructive">{errors.yearEstablished.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Employee Count *</Label>
                    <Input type="number" placeholder="500" {...register('employeeCount', { required: 'Required' })} />
                    {errors.employeeCount && <p className="text-sm text-destructive">{errors.employeeCount.message}</p>}
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Annual Revenue *</Label>
                    <Input type="number" step="0.01" placeholder="10000000" {...register('annualRevenue', { required: 'Required' })} />
                    {errors.annualRevenue && <p className="text-sm text-destructive">{errors.annualRevenue.message}</p>}
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Certifications (comma-separated) *</Label>
                    <Input placeholder="ISO9001, ISO14001" {...register('certifications', { required: 'Required' })} />
                    {errors.certifications && <p className="text-sm text-destructive">{errors.certifications.message}</p>}
                  </div>
                </div>
              </div>

              {/* Organizational References */}
              <div className="space-y-4">
                <h3 className="font-semibold">Organizational Assignment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Code *</Label>
                    <select className="w-full px-3 py-2 border rounded-md" {...register('companyCodeId', { required: 'Required' })}>
                      <option value="">Select company code</option>
                      {companyCodes.map((cc: any) => (
                        <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
                      ))}
                    </select>
                    {errors.companyCodeId && <p className="text-sm text-destructive">{errors.companyCodeId.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Plant *</Label>
                    <select className="w-full px-3 py-2 border rounded-md" {...register('plantId', { required: 'Required' })}>
                      <option value="">Select plant</option>
                      {plants.map((plant: any) => (
                        <option key={plant.id} value={plant.id}>{plant.code} - {plant.name}</option>
                      ))}
                    </select>
                    {errors.plantId && <p className="text-sm text-destructive">{errors.plantId.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Purchasing Org *</Label>
                    <select className="w-full px-3 py-2 border rounded-md" {...register('purchasingOrgId', { required: 'Required' })}>
                      <option value="">Select purchasing org</option>
                      {purchasingOrgs.map((org: any) => (
                        <option key={org.id} value={org.id}>{org.code} - {org.name}</option>
                      ))}
                    </select>
                    {errors.purchasingOrgId && <p className="text-sm text-destructive">{errors.purchasingOrgId.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Purchasing Group *</Label>
                    <select className="w-full px-3 py-2 border rounded-md" {...register('purchasingGroupId', { required: 'Required' })}>
                      <option value="">Select purchasing group</option>
                      {purchasingGroups.map((group: any) => (
                        <option key={group.id} value={group.id}>{group.code} - {group.name}</option>
                      ))}
                    </select>
                    {errors.purchasingGroupId && <p className="text-sm text-destructive">{errors.purchasingGroupId.message}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset(); }} disabled={isCreating}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {vendors.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No vendors configured yet. Create your first vendor to get started.
            </CardContent>
          </Card>
        ) : (
          vendors.map((vendor: any) => (
            <Card key={vendor.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{vendor.name}</h3>
                        <Badge>{vendor.registrationNumber}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {vendor.contactEmail} • {vendor.contactPhone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {vendor.businessType} • {vendor.employeeCount} employees
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
