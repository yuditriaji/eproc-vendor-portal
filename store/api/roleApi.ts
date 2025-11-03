import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types';

// Role Types
export interface Role {
  id: string;
  tenantId: string;
  roleName: string;
  permissions: Record<string, string[]>;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userRoles?: UserRole[];
  _count?: {
    userRoles: number;
  };
}

export interface UserRole {
  id: string;
  tenantId: string;
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy?: string;
  expiresAt?: string;
  roleConfig: Role;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

// Request Types
export interface CreateRoleRequest {
  roleName: string;
  permissions: Record<string, string[]>;
  description: string;
  isActive?: boolean;
}

export interface UpdateRoleRequest {
  permissions?: Record<string, string[]>;
  description?: string;
  isActive?: boolean;
}

export interface AssignRolesRequest {
  roleIds: string[];
  expiresAt?: string; // ISO date string
}

export interface UserRolesResponse {
  userId: string;
  email: string;
  username: string;
  roles: UserRole[];
  totalRoles: number;
}

export interface UserPermissionsResponse {
  userId: string;
  roles: string[];
  effectivePermissions: Record<string, string[]>;
}

export const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Role Configuration CRUD
    createRole: builder.mutation<ApiResponse<Role>, CreateRoleRequest>({
      query: (data) => ({
        url: 'roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Roles'],
    }),

    getRoles: builder.query<ApiResponse<Role[]>, { isActive?: boolean } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.isActive !== undefined) {
          queryParams.append('isActive', params.isActive.toString());
        }
        const queryString = queryParams.toString();
        return `roles${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Roles'],
    }),

    getRoleById: builder.query<ApiResponse<Role>, string>({
      query: (roleId) => `roles/${roleId}`,
      providesTags: (_result, _error, roleId) => [{ type: 'Roles', id: roleId }],
    }),

    updateRole: builder.mutation<ApiResponse<Role>, { roleId: string; data: UpdateRoleRequest }>({
      query: ({ roleId, data }) => ({
        url: `roles/${roleId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        'Roles',
        { type: 'Roles', id: roleId },
      ],
    }),

    deleteRole: builder.mutation<ApiResponse<{ id: string; roleName: string; message: string }>, string>({
      query: (roleId) => ({
        url: `roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),

    // User Role Assignment
    assignRolesToUser: builder.mutation<
      ApiResponse<{ message: string; assignments: UserRole[]; alreadyAssigned: number }>,
      { userId: string; data: AssignRolesRequest }
    >({
      query: ({ userId, data }) => ({
        url: `users/${userId}/roles`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        'Auth',
        { type: 'UserRoles', id: userId },
      ],
    }),

    getUserRoles: builder.query<UserRolesResponse, string>({
      query: (userId) => `users/${userId}/roles`,
      providesTags: (_result, _error, userId) => [{ type: 'UserRoles', id: userId }],
    }),

    getUserPermissions: builder.query<UserPermissionsResponse, string>({
      query: (userId) => `users/${userId}/roles/permissions`,
      providesTags: (_result, _error, userId) => [{ type: 'UserRoles', id: userId }],
    }),

    removeRoleFromUser: builder.mutation<
      ApiResponse<{ message: string }>,
      { userId: string; roleId: string }
    >({
      query: ({ userId, roleId }) => ({
        url: `users/${userId}/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        'Auth',
        { type: 'UserRoles', id: userId },
      ],
    }),
  }),
});

export const {
  // Role CRUD
  useCreateRoleMutation,
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,

  // User Role Assignment
  useAssignRolesToUserMutation,
  useGetUserRolesQuery,
  useGetUserPermissionsQuery,
  useRemoveRoleFromUserMutation,
} = roleApi;
