import { baseApi } from './baseApi';
import type { Tender, Bid, PaginatedResponse, ApiResponse, DashboardStats } from '@/types';

export const procurementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tenders
    getTenders: builder.query<
      PaginatedResponse<Tender>,
      { page?: number; pageSize?: number; status?: string; search?: string }
    >({
      query: (params) => ({
        url: 'tenders',
        params,
      }),
      providesTags: ['Tenders'],
    }),
    
    getTenderById: builder.query<ApiResponse<Tender>, string>({
      query: (id) => `tenders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Tenders', id }],
    }),
    
    // Bids
    getBids: builder.query<
      PaginatedResponse<Bid>,
      { page?: number; pageSize?: number; status?: string }
    >({
      query: (params) => ({
        url: 'bids',
        params,
      }),
      providesTags: ['Bids'],
    }),
    
    getBidById: builder.query<ApiResponse<Bid>, string>({
      query: (id) => `bids/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Bids', id }],
    }),
    
    createBid: builder.mutation<ApiResponse<Bid>, Partial<Bid>>({
      query: (data) => ({
        url: 'bids',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bids'],
    }),
    
    updateBid: builder.mutation<ApiResponse<Bid>, { id: string; data: Partial<Bid> }>({
      query: ({ id, data }) => ({
        url: `bids/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Bids', id }],
    }),
    
    submitBid: builder.mutation<ApiResponse<Bid>, string>({
      query: (id) => ({
        url: `bids/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Bids', id }, 'Bids'],
    }),
    
    // Dashboard
    getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => 'dashboard/stats',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetTendersQuery,
  useGetTenderByIdQuery,
  useGetBidsQuery,
  useGetBidByIdQuery,
  useCreateBidMutation,
  useUpdateBidMutation,
  useSubmitBidMutation,
  useGetDashboardStatsQuery,
} = procurementApi;
