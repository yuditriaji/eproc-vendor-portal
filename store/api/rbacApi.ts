import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types';
import type {
  RbacConfig,
  UserRbacRole,
  CreateRbacRoleRequest,
  UpdateRbacRoleRequest,
  AssignRbacRolesRequest,
  UserRolesResponse,
  UserPermissionsResponse,
} from '@/types/rbac';

export const rbacApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // RBAC Role CRUD
    createRbacRole: builder.mutation<ApiResponse<RbacConfig>, CreateRbacRoleRequest>({
      query: (data) => ({
        url: 'roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Roles'],
    }),

    getRbacRoles: builder.query<ApiResponse<RbacConfig[]>, { isActive?: boolean } | void>({
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

    getRbacRoleById: builder.query<ApiResponse<RbacConfig>, string>({
      query: (roleId) => `roles/${roleId}`,
      providesTags: (_result, _error, roleId) => [{ type: 'Roles', id: roleId }],
    }),

    updateRbacRole: builder.mutation<
      ApiResponse<RbacConfig>,
      { roleId: string; data: UpdateRbacRoleRequest }
    >({
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

    deleteRbacRole: builder.mutation<
      ApiResponse<{ id: string; roleName: string; message: string }>,
      string
    >({
      query: (roleId) => ({
        url: `roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),

    // User Role Assignment
    assignRbacRolesToUser: builder.mutation<
      ApiResponse<{ message: string; assignments: UserRbacRole[]; alreadyAssigned: number }>,
      { userId: string; data: AssignRbacRolesRequest }
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

    getUserRbacRoles: builder.query<UserRolesResponse, string>({
      query: (userId) => `users/${userId}/roles`,
      providesTags: (_result, _error, userId) => [{ type: 'UserRoles', id: userId }],
    }),

    getUserPermissions: builder.query<UserPermissionsResponse, string>({
      query: (userId) => `users/${userId}/roles/permissions`,
      providesTags: (_result, _error, userId) => [{ type: 'UserRoles', id: userId }],
    }),

    removeRbacRoleFromUser: builder.mutation<
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
  // RBAC Role CRUD
  useCreateRbacRoleMutation,
  useGetRbacRolesQuery,
  useGetRbacRoleByIdQuery,
  useUpdateRbacRoleMutation,
  useDeleteRbacRoleMutation,

  // User Role Assignment
  useAssignRbacRolesToUserMutation,
  useGetUserRbacRolesQuery,
  useGetUserPermissionsQuery,
  useRemoveRbacRoleFromUserMutation,
} = rbacApi;
