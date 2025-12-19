import { baseApi } from './baseApi';
import type {
  Tender, Bid, PaginatedResponse, ApiResponse, DashboardStats,
  RFQ, CreateRFQDto, UpdateRFQDto, WorkflowStepResult
} from '@/types';

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
      { page?: number; pageSize?: number; status?: string; tenderId?: string }
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

    // ========================================================================
    // RFQ (Request for Quotation) Endpoints - P2P Standard Workflow
    // ========================================================================
    getRFQs: builder.query<
      PaginatedResponse<RFQ>,
      { page?: number; pageSize?: number; status?: string; prId?: string; search?: string }
    >({
      query: (params) => ({
        url: 'rfqs',
        params,
      }),
      providesTags: ['RFQs'],
    }),

    getRFQById: builder.query<ApiResponse<RFQ>, string>({
      query: (id) => `rfqs/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'RFQs', id }],
    }),

    createRFQ: builder.mutation<ApiResponse<RFQ>, CreateRFQDto>({
      query: (data) => ({
        url: 'rfqs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RFQs'],
    }),

    updateRFQ: builder.mutation<ApiResponse<RFQ>, { id: string; data: UpdateRFQDto }>({
      query: ({ id, data }) => ({
        url: `rfqs/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'RFQs', id }],
    }),

    publishRFQ: builder.mutation<ApiResponse<RFQ>, string>({
      query: (id) => ({
        url: `rfqs/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'RFQs', id }, 'RFQs'],
    }),

    closeRFQ: builder.mutation<ApiResponse<RFQ>, string>({
      query: (id) => ({
        url: `rfqs/${id}/close`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'RFQs', id }, 'RFQs'],
    }),

    cancelRFQ: builder.mutation<ApiResponse<RFQ>, string>({
      query: (id) => ({
        url: `rfqs/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'RFQs', id }, 'RFQs'],
    }),

    deleteRFQ: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `rfqs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RFQs'],
    }),

    // ========================================================================
    // P2P Sourcing Workflow Endpoints
    // ========================================================================
    createRFQFromPR: builder.mutation<
      ApiResponse<WorkflowStepResult>,
      { prId: string; data: Omit<CreateRFQDto, 'prId'> }
    >({
      query: ({ prId, data }) => ({
        url: `workflows/sourcing/create-rfq/${prId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RFQs', 'PurchaseRequisitions'],
    }),

    createTenderFromPR: builder.mutation<
      ApiResponse<WorkflowStepResult>,
      { prId: string; data: any }
    >({
      query: ({ prId, data }) => ({
        url: `workflows/sourcing/create-tender/${prId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tenders', 'PurchaseRequisitions'],
    }),

    acceptRFQQuotation: builder.mutation<
      ApiResponse<WorkflowStepResult>,
      { quotationId: string; contractDetails?: Record<string, any> }
    >({
      query: ({ quotationId, contractDetails }) => ({
        url: `workflows/sourcing/accept-rfq-quotation/${quotationId}`,
        method: 'POST',
        body: contractDetails || {},
      }),
      invalidatesTags: ['RFQs', 'Quotations', 'Contracts'],
    }),

    awardTenderFromPR: builder.mutation<
      ApiResponse<WorkflowStepResult>,
      { tenderId: string; bidId: string; contractDetails?: Record<string, any> }
    >({
      query: ({ tenderId, bidId, contractDetails }) => ({
        url: `workflows/sourcing/award-tender/${tenderId}/${bidId}`,
        method: 'POST',
        body: contractDetails || {},
      }),
      invalidatesTags: ['Tenders', 'Bids', 'Contracts'],
    }),

    // Dashboard
    getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => 'dashboard/stats',
      providesTags: ['Dashboard'],
    }),

    // Statistics
    getTenderStatistics: builder.query<ApiResponse<any>, void>({
      query: () => 'transactions/statistics/tenders',
      providesTags: ['Tenders', 'Statistics'],
    }),

    getPurchaseOrderStatistics: builder.query<ApiResponse<any>, void>({
      query: () => 'transactions/statistics/purchase-orders',
      providesTags: ['PurchaseOrders', 'Statistics'],
    }),
  }),
});

export const {
  // Tenders
  useGetTendersQuery,
  useGetTenderByIdQuery,
  // Bids
  useGetBidsQuery,
  useGetBidByIdQuery,
  useCreateBidMutation,
  useUpdateBidMutation,
  useSubmitBidMutation,
  // RFQs
  useGetRFQsQuery,
  useGetRFQByIdQuery,
  useCreateRFQMutation,
  useUpdateRFQMutation,
  usePublishRFQMutation,
  useCloseRFQMutation,
  useCancelRFQMutation,
  useDeleteRFQMutation,
  // P2P Sourcing Workflows
  useCreateRFQFromPRMutation,
  useCreateTenderFromPRMutation,
  useAcceptRFQQuotationMutation,
  useAwardTenderFromPRMutation,
  // Dashboard & Statistics
  useGetDashboardStatsQuery,
  useGetTenderStatisticsQuery,
  useGetPurchaseOrderStatisticsQuery,
} = procurementApi;

