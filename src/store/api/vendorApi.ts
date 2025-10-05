import { baseApi } from './baseApi';
import type { 
  Tender, 
  Bid, 
  Notification, 
  User, 
  RegisterFormData,
  BidFormData,
  TenderFilters,
  PaginatedResponse,
  ApiResponse
} from '@/types';

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

interface BackendTender {
  id: string;
  title: string;
  description: string;
  requirements?: any;
  criteria?: any;
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
  bids?: any[];
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

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Tender', 'Bid', 'Notification'],
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
      providesTags: (result, error, id) => [{ type: 'Tender', id }],
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
  useLogoutMutation,
  
  // Tenders
  useGetTendersQuery,
  useLazyGetTendersQuery,
  useGetTenderQuery,
  
  // Profile
  useGetProfileQuery,
} = vendorApi;
