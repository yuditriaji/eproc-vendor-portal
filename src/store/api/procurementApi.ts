import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/types';

// Base query with authentication and error handling
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    
    headers.set('Content-Type', 'application/json');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

// Enhanced base query with retry logic and token refresh
const baseQueryWithReauth = async (
  args: Parameters<typeof baseQuery>[0],
  api: Parameters<typeof baseQuery>[1],
  extraOptions: Parameters<typeof baseQuery>[2]
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
      },
      api,
      extraOptions
    );

    if (refreshResult.data && (refreshResult.data as any).accessToken) {
      // Store new token and retry original request
      const refreshData = refreshResult.data as { accessToken: string };
      api.dispatch({
        type: 'auth/setCredentials',
        payload: {
          token: refreshData.accessToken,
          // Keep existing user data
          user: (api.getState() as any).auth.user,
        },
      });

      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout user
      api.dispatch({ type: 'auth/logout' });
      // Redirect to login if we're not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/vendor/login';
      }
    }
  }

  return result;
};

// API Response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    nextSteps?: string[];
    [key: string]: any;
  };
}

interface User {
  userId: string;
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
  user: User;
}

interface Tender {
  id: string;
  title: string;
  description: string;
  requirements: any;
  criteria: any;
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
}

interface Bid {
  id: string;
  tenderId: string;
  vendorId: string;
  status: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt?: string;
  technicalProposal?: any;
  commercialProposal?: any;
  financialProposal?: any;
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

interface GetTendersParams {
  status?: string;
  category?: string;
  department?: string;
  limit?: number;
  offset?: number;
}

interface GetBidsParams {
  tenderId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

interface CreateBidParams {
  tenderId: string;
  technicalProposal: any;
  commercialProposal: any;
  financialProposal: any;
  documents?: any[];
}

interface UpdateBidParams {
  technicalProposal?: any;
  commercialProposal?: any;
  financialProposal?: any;
  documents?: any[];
}

// Create the procurement API
export const procurementApi = createApi({
  reducerPath: 'procurementApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Tender',
    'Bid',
    'Contract',
    'Workflow'
  ],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    register: builder.mutation<AuthResponse, {
      email: string;
      username: string;
      password: string;
      firstName?: string;
      lastName?: string;
      role?: string;
    }>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    refreshToken: builder.mutation<{ accessToken: string }, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),

    // Tender endpoints
    getTenders: builder.query<Tender[], GetTendersParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.append('status', params.status);
        if (params.category) searchParams.append('category', params.category);
        if (params.department) searchParams.append('department', params.department);
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.offset) searchParams.append('offset', params.offset.toString());
        
        return `/tenders?${searchParams.toString()}`;
      },
      providesTags: ['Tender'],
      transformResponse: (response: any) => response,
    }),

    getTenderById: builder.query<Tender, string>({
      query: (id) => `/tenders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tender', id }],
    }),

    // Bid endpoints
    getBids: builder.query<Bid[], GetBidsParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.tenderId) searchParams.append('tenderId', params.tenderId);
        if (params.status) searchParams.append('status', params.status);
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.offset) searchParams.append('offset', params.offset.toString());
        
        return `/bids?${searchParams.toString()}`;
      },
      providesTags: ['Bid'],
    }),

    getBidById: builder.query<Bid, string>({
      query: (id) => `/bids/${id}`,
      providesTags: (result, error, id) => [{ type: 'Bid', id }],
    }),

    createBid: builder.mutation<Bid, CreateBidParams>({
      query: (bidData) => ({
        url: '/bids',
        method: 'POST',
        body: bidData,
      }),
      invalidatesTags: ['Bid', 'Tender'],
    }),

    updateBid: builder.mutation<Bid, { id: string } & UpdateBidParams>({
      query: ({ id, ...updateData }) => ({
        url: `/bids/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Bid', id }],
    }),

    submitBid: builder.mutation<Bid, string>({
      query: (id) => ({
        url: `/bids/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Bid', id }, 'Tender'],
    }),

    // Workflow endpoints
    getWorkflowStatus: builder.query<any, { entityType: string; entityId: string }>({
      query: ({ entityType, entityId }) => `/workflows/status/${entityType}/${entityId}`,
      providesTags: ['Workflow'],
    }),

    // Workflow - Tender submission
    submitBidViaWorkflow: builder.mutation<ApiResponse, {
      tenderId: string;
      bidAmount?: number;
      technicalProposal?: any;
      financialProposal?: any;
      compliance?: any;
    }>({
      query: ({ tenderId, ...bidData }) => ({
        url: `/workflows/tender/submit-bid/${tenderId}`,
        method: 'POST',
        body: bidData,
      }),
      invalidatesTags: ['Bid', 'Tender', 'Workflow'],
    }),

    // Contract endpoints
    getContracts: builder.query<any[], {
      page?: number;
      limit?: number;
      status?: string;
      ownerId?: string;
    }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.status) searchParams.append('status', params.status);
        if (params.ownerId) searchParams.append('ownerId', params.ownerId);
        
        return `/contracts?${searchParams.toString()}`;
      },
      providesTags: ['Contract'],
      transformResponse: (response: ApiResponse) => response.data || [],
    }),

    getContractById: builder.query<any, string>({
      query: (id) => `/contracts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Contract', id }],
      transformResponse: (response: ApiResponse) => response.data,
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
  useGetTendersQuery,
  useGetTenderByIdQuery,
  useGetBidsQuery,
  useGetBidByIdQuery,
  useCreateBidMutation,
  useUpdateBidMutation,
  useSubmitBidMutation,
  useGetWorkflowStatusQuery,
  useSubmitBidViaWorkflowMutation,
  useGetContractsQuery,
  useGetContractByIdQuery,
} = procurementApi;

// Export types
export type {
  ApiResponse,
  User,
  AuthResponse,
  Tender,
  Bid,
  GetTendersParams,
  GetBidsParams,
  CreateBidParams,
  UpdateBidParams,
};