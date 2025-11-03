'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Calendar } from 'lucide-react';
import { useGetRbacRolesQuery, useGetUserRbacRolesQuery, useAssignRbacRolesToUserMutation, useRemoveRbacRoleFromUserMutation } from '@/store/api/rbacApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

interface UserRoleAssignmentProps {
  userId: string;
  userName: string;
  open: boolean;
  onClose: () => void;
}

export default function UserRoleAssignment({ userId, userName, open, onClose }: UserRoleAssignmentProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [useExpiration, setUseExpiration] = useState(false);

  const { data: rolesData } = useGetRbacRolesQuery();
  const { data: userRolesData, refetch } = useGetUserRbacRolesQuery(userId);
  const [assignRoles, { isLoading: isAssigning }] = useAssignRbacRolesToUserMutation();
  const [removeRole, { isLoading: isRemoving }] = useRemoveRbacRoleFromUserMutation();

  // Extract roles arrays
  const allRoles = Array.isArray(rolesData) ? rolesData : (rolesData?.data || []);
  const userRoles = userRolesData?.roles || [];

  // Get available roles (not yet assigned)
  const assignedRoleIds = new Set(userRoles.map(ur => ur.rbacRoleId));
  const availableRoles = allRoles.filter(role => !assignedRoleIds.has(role.id) && role.isActive);

  const handleAssign = async () => {
    if (!selectedRoleId) {
      toast.error('Please select a role');
      return;
    }

    // Build payload with optional expiration
    const payload: { roleIds: string[]; expiresAt?: string } = {
      roleIds: [selectedRoleId],
    };

    // Add expiration date if specified
    if (useExpiration && expirationDate) {
      // Parse the date and set it to end of day (23:59:59) in local timezone
      const expiryDate = new Date(expirationDate);
      expiryDate.setHours(23, 59, 59, 999);
      payload.expiresAt = expiryDate.toISOString();
      console.log('[Role Assignment] Expiration date:', expirationDate, '-> ISO:', payload.expiresAt);
    }

    console.log('[Role Assignment] Final Payload:', JSON.stringify(payload, null, 2));
    console.log('[Role Assignment] User ID:', userId);

    try {
      await assignRoles({
        userId,
        data: payload,
      }).unwrap();
      
      toast.success('Role assigned successfully');
      setSelectedRoleId('');
      setExpirationDate('');
      setUseExpiration(false);
      refetch();
    } catch (err: any) {
      console.error('[Role Assignment] Error:', err);
      console.error('[Role Assignment] Error data:', err?.data);
      
      let errorMessage = 'Failed to assign role';
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.errors && Array.isArray(err.data.errors)) {
        errorMessage = err.data.errors.join(', ');
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleRemove = async (roleId: string, roleName: string) => {
    try {
      await removeRole({ userId, roleId }).unwrap();
      toast.success(`Role "${roleName}" removed successfully`);
      refetch();
    } catch (err: any) {
      console.error('Error removing role:', err);
      const errorMessage = err?.data?.message || 'Failed to remove role';
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Roles for {userName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Currently Assigned Roles */}
          <div className="space-y-3">
            <Label className="text-base">Currently Assigned Roles</Label>
            {userRoles.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground text-sm">
                  No roles assigned yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {userRoles.map((userRole) => (
                  <Card key={userRole.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">{userRole.rbacRole.roleName}</Badge>
                            {!userRole.rbacRole.isActive && (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {userRole.rbacRole.description}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Assigned: {formatDate(userRole.assignedAt)}</span>
                            <span>Expires: {formatDate(userRole.expiresAt)}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(userRole.rbacRoleId, userRole.rbacRole.roleName)}
                          disabled={isRemoving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Assign New Role */}
          <div className="space-y-3">
            <Label className="text-base">Assign New Role</Label>
            
            {availableRoles.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground text-sm">
                  No more roles available to assign
                </CardContent>
              </Card>
            ) : (
              <>
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.roleName} - {role.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Optional Expiration Date */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="use-expiration"
                      checked={useExpiration}
                      onChange={(e) => setUseExpiration(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="use-expiration" className="text-sm cursor-pointer">
                      Set expiration date
                    </Label>
                  </div>
                  
                  {useExpiration && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        placeholder="Select expiration date"
                      />
                    </div>
                  )}
                </div>

                <Button onClick={handleAssign} disabled={isAssigning || !selectedRoleId} className="w-full">
                  {isAssigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Role'
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
