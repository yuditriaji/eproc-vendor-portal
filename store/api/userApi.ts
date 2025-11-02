import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types';

interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId?: string;
  companyCodeId?: string;
  purchasingGroupId?: string;
}

interface UpdateUserRequest {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  departmentId?: string;
  companyCodeId?: string;
  purchasingGroupId?: string;
  isActive?: boolean;
}

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  departmentId?: string;
  companyCodeId?: string;
  purchasingGroupId?: string;
  tenantId: string;
  createdAt: string;
  updatedAt?: string;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create User (Admin only)
    createUser: builder.mutation<ApiResponse<{ user: User; accessToken?: string }>, CreateUserRequest>({
      query: (data) => ({
        url: 'auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Get All Users
    getUsers: builder.query<ApiResponse<User[]>, { page?: number; limit?: number; role?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.role) queryParams.append('role', params.role);
        
        const queryString = queryParams.toString();
        return `auth/users${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Auth'],
    }),

    // Get User by ID
    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => `auth/users/${id}`,
      providesTags: ['Auth'],
    }),

    // Update User
    updateUser: builder.mutation<ApiResponse<User>, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `auth/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Delete User
    deleteUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `auth/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Auth'],
    }),

    // Verify User (Admin only)
    verifyUser: builder.mutation<ApiResponse<{ user: User }>, string>({
      query: (userId) => ({
        url: `auth/users/${userId}/verify`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Auth'],
    }),

    // Toggle User Active Status
    toggleUserStatus: builder.mutation<ApiResponse<User>, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `auth/users/${id}`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useVerifyUserMutation,
  useToggleUserStatusMutation,
} = userApi;
