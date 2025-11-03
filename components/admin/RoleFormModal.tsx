'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useCreateRbacRoleMutation, useUpdateRbacRoleMutation } from '@/store/api/rbacApi';
import type { RbacConfig } from '@/types/rbac';
import { toast } from 'sonner';

interface RoleFormModalProps {
  role?: RbacConfig | null;
  open: boolean;
  onClose: () => void;
}

export default function RoleFormModal({ role, open, onClose }: RoleFormModalProps) {
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissionsJson, setPermissionsJson] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [createRole, { isLoading: isCreating }] = useCreateRbacRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRbacRoleMutation();

  const isEditing = !!role;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (role) {
      setRoleName(role.roleName);
      setDescription(role.description || '');
      setPermissionsJson(JSON.stringify(role.permissions, null, 2));
      setIsActive(role.isActive);
    } else {
      // Default permissions template
      const defaultPermissions = {
        tenders: ['read'],
        bids: ['read'],
      };
      setRoleName('');
      setDescription('');
      setPermissionsJson(JSON.stringify(defaultPermissions, null, 2));
      setIsActive(true);
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate JSON
    let permissions;
    try {
      permissions = JSON.parse(permissionsJson);
    } catch (error) {
      toast.error('Invalid JSON format in permissions');
      return;
    }

    try {
      if (isEditing) {
        await updateRole({
          roleId: role.id,
          data: { permissions, description, isActive },
        }).unwrap();
        toast.success('Role updated successfully');
      } else {
        await createRole({
          roleName,
          permissions,
          description,
          isActive,
        }).unwrap();
        toast.success('Role created successfully');
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving role:', err);
      const errorMessage = err?.data?.message || 'Failed to save role';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Role' : 'Create New Role'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Role Name *</Label>
            <Input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="PROCUREMENT_MANAGER"
              disabled={isEditing}
              required
            />
            {isEditing && (
              <p className="text-xs text-muted-foreground">Role name cannot be changed</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this role and its purpose"
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Permissions (JSON) *</Label>
            <Textarea
              value={permissionsJson}
              onChange={(e) => setPermissionsJson(e.target.value)}
              placeholder={'{\n  "tenders": ["create", "read", "update"],\n  "bids": ["read", "score"]\n}'}
              rows={10}
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Define permissions as JSON. Example: {`{"tenders": ["read", "create"], "vendors": ["read"]}`}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              id="active"
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{isEditing ? 'Update Role' : 'Create Role'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
