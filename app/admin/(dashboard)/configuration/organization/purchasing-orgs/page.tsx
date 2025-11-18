'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Plus,
  Loader2,
  AlertCircle,
  Search,
  Trash2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useGetPurchasingOrgsQuery,
  useCreatePurchasingOrgMutation,
  useGetPurchasingOrgAssignmentsQuery,
  useAssignPurchasingOrgMutation,
  useDeletePurchasingOrgAssignmentMutation,
  useGetCompanyCodesQuery,
  useGetPlantsQuery,
} from '@/store/api/configApi';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { isAdmin } from '@/utils/permissions';
import { useAppSelector } from '@/store/hooks';

interface PurchasingOrgFormData {
  code: string;
  name: string;
}

interface AssignmentFormData {
  purchasingOrgId: string;
  assignmentType: 'company' | 'plant';
  companyCodeId?: string;
  plantId?: string;
}

// Component for listing Purchasing Orgs
function PurchasingOrgsList() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, error } = useGetPurchasingOrgsQuery();
  const [createPurchasingOrg, { isLoading: isCreating }] =
    useCreatePurchasingOrgMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PurchasingOrgFormData>();

  const onSubmit = async (formData: PurchasingOrgFormData) => {
    try {
      await createPurchasingOrg(formData).unwrap();
      toast.success('Purchasing organization created successfully');
      reset();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error creating purchasing org:', err);
      const errorMessage =
        err?.data?.message ||
        err?.data?.errors?.join(', ') ||
        'Failed to create purchasing organization';
      toast.error(errorMessage);
    }
  };

  const purchasingOrgs = Array.isArray(data) ? data : data?.data || [];

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
            <span>Failed to load purchasing organizations. Please try again.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Purchasing Organizations</h2>
          <p className="text-sm text-muted-foreground">
            Manage procurement organizational units
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Purchasing Org
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Purchasing Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    placeholder="PO1"
                    {...register('code', { required: 'Code is required' })}
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive">{errors.code.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    placeholder="Procurement Org 1"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {purchasingOrgs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No purchasing organizations configured yet. Create your first
              purchasing organization to get started.
            </CardContent>
          </Card>
        ) : (
          purchasingOrgs.map((org: any) => (
            <Card key={org.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{org.name}</h3>
                        <Badge>{org.code}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
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

// Component for Purchasing Org Assignments
function PurchasingOrgAssignments() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPorgId, setFilterPorgId] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingDetails, setDeletingDetails] = useState<any>(null);

  const { user } = useAppSelector((state) => state.auth);
  const { data: assignments, isLoading } = useGetPurchasingOrgAssignmentsQuery(
    filterPorgId || undefined
  );
  const { data: purchasingOrgs } = useGetPurchasingOrgsQuery();
  const { data: companyCodes } = useGetCompanyCodesQuery();
  const { data: plants } = useGetPlantsQuery();

  const [createAssignment, { isLoading: isCreating }] =
    useAssignPurchasingOrgMutation();
  const [deleteAssignment, { isLoading: isDeleting }] =
    useDeletePurchasingOrgAssignmentMutation();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    defaultValues: {
      assignmentType: 'company',
    },
  });

  const assignmentType = watch('assignmentType');

  const onSubmit = async (formData: AssignmentFormData) => {
    try {
      const payload: any = {
        purchasingOrgId: formData.purchasingOrgId,
      };

      if (formData.assignmentType === 'company') {
        payload.companyCodeId = formData.companyCodeId;
      } else {
        payload.plantId = formData.plantId;
      }

      await createAssignment(payload).unwrap();
      toast.success('Assignment created successfully');
      setShowModal(false);
      reset();
    } catch (err: any) {
      console.error('Error creating assignment:', err);
      const errorMessage =
        err?.data?.message || 'Failed to create assignment';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteAssignment(deletingId).unwrap();
      toast.success('Assignment deleted successfully');
      setDeletingId(null);
      setDeletingDetails(null);
    } catch (err: any) {
      console.error('Error deleting assignment:', err);
      toast.error(err?.data?.message || 'Failed to delete assignment');
    }
  };

  const assignmentsList = Array.isArray(assignments)
    ? assignments
    : assignments?.data || [];

  const porgList = Array.isArray(purchasingOrgs)
    ? purchasingOrgs
    : purchasingOrgs?.data || [];

  const ccList = Array.isArray(companyCodes)
    ? companyCodes
    : companyCodes?.data || [];

  const plantsList = Array.isArray(plants) ? plants : plants?.data || [];

  const filteredAssignments = assignmentsList.filter((assignment: any) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const porgCode = assignment.purchasingOrg?.code?.toLowerCase() || '';
    const porgName = assignment.purchasingOrg?.name?.toLowerCase() || '';
    const ccCode = assignment.companyCode?.code?.toLowerCase() || '';
    const ccName = assignment.companyCode?.name?.toLowerCase() || '';
    const plantCode = assignment.plant?.code?.toLowerCase() || '';
    const plantName = assignment.plant?.name?.toLowerCase() || '';

    return (
      porgCode.includes(query) ||
      porgName.includes(query) ||
      ccCode.includes(query) ||
      ccName.includes(query) ||
      plantCode.includes(query) ||
      plantName.includes(query)
    );
  });

  const adminCanAccess = isAdmin(user);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Purchasing Org Assignments</h2>
          <p className="text-sm text-muted-foreground">
            Link purchasing organizations to company codes or plants
          </p>
        </div>
        {adminCanAccess && (
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Purchasing Org
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPorgId} onValueChange={setFilterPorgId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Org..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Orgs</SelectItem>
            {porgList.map((org: any) => (
              <SelectItem key={org.id} value={org.id}>
                {org.code} - {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assignments Table/List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-muted-foreground mb-4">
              No purchasing org assignments yet
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first assignment to link purchasing organizations to
              company codes or plants.
            </p>
            {adminCanAccess && (
              <Button onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Assign Purchasing Org
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment: any) => (
            <Card key={assignment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Purchasing Org
                        </p>
                        <p className="font-medium">
                          {assignment.purchasingOrg?.code} -{' '}
                          {assignment.purchasingOrg?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Assigned To
                        </p>
                        <p className="font-medium">
                          {assignment.companyCode
                            ? `${assignment.companyCode.code} - ${assignment.companyCode.name}`
                            : `${assignment.plant.code} - ${assignment.plant.name}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Type</p>
                        <Badge variant="outline">
                          {assignment.companyCodeId
                            ? 'Company Code'
                            : 'Plant'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {adminCanAccess && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeletingId(assignment.id);
                        setDeletingDetails(assignment);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Purchasing Organization</DialogTitle>
            <DialogDescription>
              Link a purchasing organization to a company code or plant
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Purchasing Organization Selection */}
            <div className="space-y-2">
              <Label htmlFor="porg">Purchasing Organization *</Label>
              <Controller
                name="purchasingOrgId"
                control={control}
                rules={{ required: 'Purchasing organization is required' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purchasing org..." />
                    </SelectTrigger>
                    <SelectContent>
                      {porgList.map((org: any) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.code} - {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.purchasingOrgId && (
                <p className="text-sm text-destructive">
                  {errors.purchasingOrgId.message}
                </p>
              )}
            </div>

            {/* Assignment Type Toggle */}
            <div className="space-y-3">
              <Label>Assignment Type *</Label>
              <div className="flex gap-2">
                <Controller
                  name="assignmentType"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Button
                        type="button"
                        variant={field.value === 'company' ? 'default' : 'outline'}
                        onClick={() => field.onChange('company')}
                        className="flex-1"
                      >
                        Company Code
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === 'plant' ? 'default' : 'outline'}
                        onClick={() => field.onChange('plant')}
                        className="flex-1"
                      >
                        Plant
                      </Button>
                    </>
                  )}
                />
              </div>
            </div>

            {/* Company Code Selection */}
            {assignmentType === 'company' && (
              <div className="space-y-2">
                <Label htmlFor="cc">Company Code *</Label>
                <Controller
                  name="companyCodeId"
                  control={control}
                  rules={{
                    validate: (value) =>
                      assignmentType === 'company'
                        ? value
                          ? true
                          : 'Company code is required'
                        : true,
                  }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company code..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ccList.map((cc: any) => (
                          <SelectItem key={cc.id} value={cc.id}>
                            {cc.code} - {cc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.companyCodeId && (
                  <p className="text-sm text-destructive">
                    {errors.companyCodeId.message}
                  </p>
                )}
              </div>
            )}

            {/* Plant Selection */}
            {assignmentType === 'plant' && (
              <div className="space-y-2">
                <Label htmlFor="plant">Plant *</Label>
                <Controller
                  name="plantId"
                  control={control}
                  rules={{
                    validate: (value) =>
                      assignmentType === 'plant'
                        ? value
                          ? true
                          : 'Plant is required'
                        : true,
                  }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plant..." />
                      </SelectTrigger>
                      <SelectContent>
                        {plantsList.map((plant: any) => (
                          <SelectItem key={plant.id} value={plant.id}>
                            {plant.code} - {plant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.plantId && (
                  <p className="text-sm text-destructive">
                    {errors.plantId.message}
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  reset();
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment?
            </DialogDescription>
          </DialogHeader>

          {deletingDetails && (
            <div className="space-y-3 py-4">
              <p className="text-sm">
                • <strong>{deletingDetails.purchasingOrg?.code}</strong> -{' '}
                {deletingDetails.purchasingOrg?.name}
              </p>
              <p className="text-sm">
                • Assigned to:{' '}
                <strong>
                  {deletingDetails.companyCodeId
                    ? `${deletingDetails.companyCode?.code} - ${deletingDetails.companyCode?.name}`
                    : `${deletingDetails.plant?.code} - ${deletingDetails.plant?.name}`}
                </strong>
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                This action cannot be undone.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="text-xs text-muted-foreground">
        Showing {filteredAssignments.length} of {assignmentsList.length}{' '}
        assignments
      </div>
    </div>
  );
}

// Main Page Component
export default function PurchasingOrgsPage() {
  return (
    <div>
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold">Purchasing Organizations</h1>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="w-full border-b rounded-none px-6">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <PurchasingOrgsList />
        </TabsContent>

        <TabsContent value="assignments">
          <PurchasingOrgAssignments />
        </TabsContent>
      </Tabs>
    </div>
  );
}
