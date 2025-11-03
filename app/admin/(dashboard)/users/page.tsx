'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Loader2, AlertCircle, Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetUsersQuery, useCreateUserMutation } from '@/store/api/userApi';
import { useGetUserRbacRolesQuery } from '@/store/api/rbacApi';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import UserRoleAssignment from '@/components/admin/UserRoleAssignment';

interface UserFormData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Helper component to display user roles
function UserRolesBadges({ userId }: { userId: string }) {
  const { data: userRolesData } = useGetUserRbacRolesQuery(userId);
  const userRoles = userRolesData?.roles || [];

  if (userRoles.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No additional roles assigned</p>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-xs text-muted-foreground">Roles:</span>
      {userRoles.slice(0, 3).map((userRole) => (
        <Badge key={userRole.id} variant="outline" className="text-xs">
          {userRole.rbacRole.roleName}
        </Badge>
      ))}
      {userRoles.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{userRoles.length - 3}
        </Badge>
      )}
    </div>
  );
}

export default function UsersManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserName, setEditingUserName] = useState<string>('');
  
  const { data, isLoading, error } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<UserFormData>({
    defaultValues: {
      role: 'USER',
    }
  });
  
  const onSubmit = async (formData: UserFormData) => {
    try {
      await createUser(formData).unwrap();
      toast.success('User created successfully');
      reset();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error creating user:', err);
      const errorMessage = err?.data?.message || err?.data?.errors?.join(', ') || 'Failed to create user';
      toast.error(errorMessage);
    }
  };
  
  // Extract users array from response
  let users: any[] = [];
  const responseData: any = data;
  
  if (Array.isArray(responseData)) {
    users = responseData;
  } else if (responseData?.users && Array.isArray(responseData.users)) {
    // Handle response with users property at root level
    users = responseData.users;
  } else if (responseData?.data?.users && Array.isArray(responseData.data.users)) {
    // Handle response with nested data.users
    users = responseData.data.users;
  } else if (responseData?.data && Array.isArray(responseData.data)) {
    // Handle response with data as array
    users = responseData.data;
  }
  
  // Debug logging
  console.log('[Users Debug] Raw data:', responseData);
  console.log('[Users Debug] Extracted users:', users);
  console.log('[Users Debug] Users count:', users.length);
  
  // Filter users based on search
  const filteredUsers = users.filter((user) =>
    searchQuery === '' ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    ADMIN: 'destructive',
    BUYER: 'default',
    MANAGER: 'secondary',
    FINANCE: 'outline',
    USER: 'outline',
    VENDOR: 'default'
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
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and permissions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>
      
      {error && (
        <Card className="border-yellow-500">
          <CardContent className="p-4 flex items-center gap-2 text-yellow-700">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">Unable to load users. Please try again.</span>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input 
                    type="email" 
                    placeholder="user@example.com" 
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Username *</Label>
                  <Input 
                    placeholder="username" 
                    {...register('username', { required: 'Username is required' })}
                  />
                  {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input 
                    placeholder="John" 
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input 
                    placeholder="Doe" 
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: 'Role is required' }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Administrator</SelectItem>
                          <SelectItem value="BUYER">Buyer</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="FINANCE">Finance</SelectItem>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="VENDOR">Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
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
                    'Create User'
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

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {searchQuery ? 'No users found matching your search.' : 'No users configured yet. Create your first user to get started.'}
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{String(user.firstName || '')} {String(user.lastName || '')}</h3>
                        <Badge variant={roleColors[user.role] as any}>{String(user.role || '')}</Badge>
                        {user.isActive && <Badge variant="secondary">Active</Badge>}
                        {!user.isVerified && <Badge variant="outline">Unverified</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {String(user.email || '')} • @{String(user.username || '')}
                      </p>
                      <UserRolesBadges userId={user.id} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingUserId(user.id);
                        setEditingUserName(`${user.firstName} ${user.lastName}`);
                      }}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Edit Roles
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/users/${user.id}`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Role Assignment Modal */}
      {editingUserId && (
        <UserRoleAssignment
          userId={editingUserId}
          userName={editingUserName}
          open={!!editingUserId}
          onClose={() => {
            setEditingUserId(null);
            setEditingUserName('');
          }}
        />
      )}
    </div>
  );
}
