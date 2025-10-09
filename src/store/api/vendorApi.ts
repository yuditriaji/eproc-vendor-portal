import { baseApi } from './baseApi';
import type { RegisterFormData } from '@/types';

// Backend API response types
interface BackendUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  verified?: boolean;
  createdAt: string;
}

interface AuthResponse {
  accessToken: string;
  user: BackendUser;
}

interface RefreshResponse {
  accessToken: string;
}

interface BackendTender {
  id: string;
  title: string;
  description: string;
  requirements?: Record<string, unknown>;
  criteria?: Record<string, unknown>;
  estimatedValue?: number;
  closingDate: string;
  category?: string;
  department?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  creator?: {
    username: string;
    role: string;
  };
  bids?: Record<string, unknown>[];
}

interface CreateTenderDto {
  title: string;
  description: string;
  requirements: Record<string, unknown>;
  criteria: Record<string, unknown>;
  estimatedValue?: number;
  closingDate: string;
  category?: string;
  department?: string;
}

interface UpdateTenderDto {
  title?: string;
  description?: string;
  requirements?: Record<string, unknown>;
  criteria?: Record<string, unknown>;
  estimatedValue?: number;
  closingDate?: string;
  category?: string;
  department?: string;
}

interface BackendBid {
  id: string;
  tenderId: string;
  vendorId: string;
  status: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt?: string;
  encryptedData?: string;
  decryptedData?: {
    technicalProposal: Record<string, unknown>;
    commercialProposal: Record<string, unknown>;
    financialProposal: Record<string, unknown>;
  };
  tender: {
    title: string;
    status: string;
    closingDate?: string;
  };
  vendor?: {
    username: string;
    email: string;
  };
}

interface CreateBidDto {
  tenderId: string;
  technicalProposal: Record<string, unknown>;
  commercialProposal: Record<string, unknown>;
  financialProposal: Record<string, unknown>;
  documents?: any[];
}

interface UpdateBidDto {
  technicalProposal?: Record<string, unknown>;
  commercialProposal?: Record<string, unknown>;
  financialProposal?: Record<string, unknown>;
  documents?: any[];
}

interface RoleConfig {
  roles: Array<{
    role: string;
    permissions: string[];
    description: string;
  }>;
}

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Authentication endpoints
    register: builder.mutation<AuthResponse, RegisterFormData>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: {
          email: data.email,
          password: data.password,
          username: data.name.toLowerCase().replace(/\s+/g, ''),
          firstName: data.name.split(' ')[0],
          lastName: data.name.split(' ').slice(1).join(' ') || '',
          role: 'VENDOR',
        },
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: AuthResponse) => response,
    }),

    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    refreshToken: builder.mutation<RefreshResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Tender', 'Bid', 'Notification'],
    }),

    getRoleConfig: builder.query<RoleConfig, void>({
      query: () => ({
        url: '/auth/roles/config',
        method: 'GET',
      }),
    }),

    // Tender endpoints
    getTenders: builder.query<BackendTender[], { 
      status?: string; 
      category?: string;
      department?: string;
      limit?: number;
      offset?: number;
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        
        return {
          url: `/tenders${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Tender', id } as const)),
              { type: 'Tender', id: 'LIST' },
            ]
          : [{ type: 'Tender', id: 'LIST' }],
    }),

    getTender: builder.query<BackendTender, string>({
      query: (id) => ({
        url: `/tenders/${id}`,
        method: 'GET',
      }),
      providesTags: (_, __, id) => [{ type: 'Tender', id }],
    }),

    createTender: builder.mutation<BackendTender, CreateTenderDto>({
      query: (data) => ({
        url: '/tenders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Tender', id: 'LIST' }],
    }),

    updateTender: builder.mutation<BackendTender, { id: string; data: UpdateTenderDto }>({
      query: ({ id, data }) => ({
        url: `/tenders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Tender', id }, { type: 'Tender', id: 'LIST' }],
    }),

    publishTender: builder.mutation<BackendTender, string>({
      query: (id) => ({
        url: `/tenders/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'Tender', id }, { type: 'Tender', id: 'LIST' }],
    }),

    deleteTender: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/tenders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Tender', id: 'LIST' }],
    }),

    // Bid endpoints
    getBids: builder.query<BackendBid[], {
      tenderId?: string;
      status?: string;
      limit?: number;
      offset?: number;
    }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
        
        return {
          url: `/bids${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Bid', id } as const)),
              { type: 'Bid', id: 'LIST' },
            ]
          : [{ type: 'Bid', id: 'LIST' }],
    }),

    getBid: builder.query<BackendBid, string>({
      query: (id) => ({
        url: `/bids/${id}`,
        method: 'GET',
      }),
      providesTags: (_, __, id) => [{ type: 'Bid', id }],
    }),

    createBid: builder.mutation<BackendBid, CreateBidDto>({
      query: (data) => ({
        url: '/bids',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Bid', id: 'LIST' }],
    }),

    updateBid: builder.mutation<BackendBid, { id: string; data: UpdateBidDto }>({
      query: ({ id, data }) => ({
        url: `/bids/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Bid', id }, { type: 'Bid', id: 'LIST' }],
    }),

    submitBid: builder.mutation<BackendBid, string>({
      query: (id) => ({
        url: `/bids/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'Bid', id }, { type: 'Bid', id: 'LIST' }],
    }),

    // User profile endpoints  
    getProfile: builder.query<BackendUser, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
  }),
});

// Export hooks
export const {
  // Auth
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetRoleConfigQuery,
  
  // Tenders
  useGetTendersQuery,
  useLazyGetTendersQuery,
  useGetTenderQuery,
  useCreateTenderMutation,
  useUpdateTenderMutation,
  usePublishTenderMutation,
  useDeleteTenderMutation,
  
  // Bids
  useGetBidsQuery,
  useLazyGetBidsQuery,
  useGetBidQuery,
  useCreateBidMutation,
  useUpdateBidMutation,
  useSubmitBidMutation,
  
  // Profile
  useGetProfileQuery,
} = vendorApi;
