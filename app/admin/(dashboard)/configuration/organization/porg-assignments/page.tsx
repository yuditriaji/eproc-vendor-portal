'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Loader2,
  AlertCircle,
  Search,
  Trash2,
} from 'lucide-react';
import {
  useGetPurchasingOrgAssignmentsQuery,
  useAssignPurchasingOrgMutation,
  useDeletePurchasingOrgAssignmentMutation,
  useGetPurchasingOrgsQuery,
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

interface AssignmentFormData {
  purchasingOrgId: string;
  assignmentType: 'company' | 'plant';
  companyCodeId?: string;
  plantId?: string;
}

export default function PorgAssignmentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPorgId, setFilterPorgId] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingDetails, setDeletingDetails] = useState<any>(null);

  const { user } = useAppSelector((state) => state.auth);
  const { data: assignments, isLoading, error: assignmentsError } =
    useGetPurchasingOrgAssignmentsQuery(filterPorgId || undefined);
  const { data: purchasingOrgs, error: porgsError } =
    useGetPurchasingOrgsQuery();
  const { data: companyCodes, error: ccError } = useGetCompanyCodesQuery();
  const { data: plants, error: plantsError } = useGetPlantsQuery();

  // Log any errors for debugging
  if (assignmentsError) console.error('[Assignments Error]', assignmentsError);
  if (porgsError) console.error('[POrgs Error]', porgsError);
  if (ccError) console.error('[CompanyCodes Error]', ccError);
  if (plantsError) console.error('[Plants Error]', plantsError);

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

      console.log('[Creating Assignment]', payload);
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

  if (!adminCanAccess) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="p-6 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>You do not have permission to access this page.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchasing Org Assignments</h1>
          <p className="text-sm text-muted-foreground">
            Link purchasing organizations to company codes or plants
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Assign Purchasing Org
        </Button>
      </div>

      {/* Error State */}
      {(assignmentsError || porgsError || ccError || plantsError) && (
        <Card className="border-destructive">
          <CardContent className="p-6 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Error loading data. Please refresh the page or try again.</span>
          </CardContent>
        </Card>
      )}

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
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Purchasing Org
            </Button>
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
                        <p className="text-xs text-muted-foreground mb-1">
                          Type
                        </p>
                        <Badge variant="outline">
                          {assignment.companyCodeId
                            ? 'Company Code'
                            : 'Plant'}
                        </Badge>
                      </div>
                    </div>
                  </div>
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
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
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
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
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
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
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
