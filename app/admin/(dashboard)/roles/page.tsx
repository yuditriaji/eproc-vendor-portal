'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Search, Loader2, AlertCircle, Users, Edit, Trash2 } from 'lucide-react';
import { useGetRolesQuery, useDeleteRoleMutation, type Role } from '@/store/api/roleApi';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RoleFormModal from '@/components/admin/RoleFormModal';

export default function RolesPermissionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const { data, isLoading, error } = useGetRolesQuery();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  // Extract roles array from response
  let roles: Role[] = [];
  const responseData: any = data;
  if (Array.isArray(responseData)) {
    roles = responseData;
  } else if (responseData?.data && Array.isArray(responseData.data)) {
    roles = responseData.data;
  }

  // Filter roles based on search
  const filteredRoles = roles.filter((role) =>
    searchQuery === '' ||
    role.roleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deletingRole) return;

    try {
      await deleteRole(deletingRole.id).unwrap();
      toast.success('Role deleted successfully');
      setDeletingRole(null);
    } catch (err: any) {
      console.error('Error deleting role:', err);
      const errorMessage = err?.data?.message || 'Failed to delete role';
      toast.error(errorMessage);
    }
  };

  const getPermissionSummary = (permissions: Record<string, string[]>) => {
    const resources = Object.keys(permissions);
    if (resources.length === 0) return 'No permissions';
    if (resources.length === 1) return resources[0];
    if (resources.length === 2) return resources.join(', ');
    return `${resources.slice(0, 2).join(', ')} +${resources.length - 2}`;
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
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage role configurations and permissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {error && (
        <Card className="border-yellow-500">
          <CardContent className="p-4 flex items-center gap-2 text-yellow-700">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Unable to load roles. Please try again.</span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredRoles.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {searchQuery
                ? 'No roles found matching your search.'
                : 'No roles configured yet. Create your first role to get started.'}
            </CardContent>
          </Card>
        ) : (
          filteredRoles.map((role) => (
            <Card key={role.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{String(role.roleName || '')}</h3>
                        {role.isActive ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {String(role.description || '')}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>
                            {role._count?.userRoles || role.userRoles?.length || 0} users
                          </span>
                        </div>
                        <div>
                          Permissions: {getPermissionSummary(role.permissions)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingRole(role)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingRole(role)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Role Modal */}
      {(showCreateModal || editingRole) && (
        <RoleFormModal
          role={editingRole}
          open={showCreateModal || !!editingRole}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRole(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{deletingRole?.roleName}"?
              {(deletingRole?._count?.userRoles || 0) > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This role is assigned to {deletingRole?._count?.userRoles} user(s).
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingRole(null)}
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
    </div>
  );
}
