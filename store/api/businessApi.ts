import { baseApi } from './baseApi';
import type {
  PurchaseRequisition,
  PurchaseOrder,
  Contract,
  Bid,
  PaginatedResponse,
  ApiResponse,
  BusinessDashboardStats,
  Vendor,
  VendorPerformance,
  GoodsReceipt,
} from '@/types';

/**
 * Business Portal API
 * Endpoints for internal users (USER, BUYER, MANAGER, FINANCE, APPROVER)
 */
export const businessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== DASHBOARD =====
    getBusinessDashboardStats: builder.query<ApiResponse<BusinessDashboardStats>, void>({
      query: () => 'statistics/dashboard',
      providesTags: ['BusinessDashboard'],
    }),

    // ===== PURCHASE REQUISITIONS =====
    getPurchaseRequisitions: builder.query<
      PaginatedResponse<PurchaseRequisition>,
      { page?: number; pageSize?: number; status?: string; search?: string }
    >({
      query: (params) => ({
        url: 'purchase-requisitions',
        params,
      }),
      providesTags: ['PurchaseRequisitions'],
    }),

    getPurchaseRequisitionById: builder.query<ApiResponse<PurchaseRequisition>, string>({
      query: (id) => `purchase-requisitions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'PurchaseRequisitions', id }],
    }),

    createPurchaseRequisition: builder.mutation<
      ApiResponse<PurchaseRequisition>,
      Partial<PurchaseRequisition>
    >({
      query: (data) => ({
        url: 'purchase-requisitions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PurchaseRequisitions', 'BusinessDashboard'],
    }),

    updatePurchaseRequisition: builder.mutation<
      ApiResponse<PurchaseRequisition>,
      { id: string; data: Partial<PurchaseRequisition> }
    >({
      query: ({ id, data }) => ({
        url: `purchase-requisitions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PurchaseRequisitions', id },
        'PurchaseRequisitions',
        'BusinessDashboard',
      ],
    }),

    deletePurchaseRequisition: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `purchase-requisitions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PurchaseRequisitions', 'BusinessDashboard'],
    }),

    getPendingPRApprovals: builder.query<PaginatedResponse<PurchaseRequisition>, void>({
      query: () => 'purchase-requisitions/pending/approvals',
      providesTags: ['PurchaseRequisitions', 'Approvals'],
    }),

    // ===== PURCHASE ORDERS =====
    getPurchaseOrders: builder.query<
      PaginatedResponse<PurchaseOrder>,
      { page?: number; pageSize?: number; status?: string; search?: string }
    >({
      query: (params) => ({
        url: 'purchase-orders',
        params,
      }),
      providesTags: ['PurchaseOrders'],
    }),

    getPurchaseOrderById: builder.query<ApiResponse<PurchaseOrder>, string>({
      query: (id) => `purchase-orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'PurchaseOrders', id }],
    }),

    createPurchaseOrder: builder.mutation<ApiResponse<PurchaseOrder>, Partial<PurchaseOrder>>({
      query: (data) => ({
        url: 'purchase-orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PurchaseOrders', 'BusinessDashboard'],
    }),

    updatePurchaseOrder: builder.mutation<
      ApiResponse<PurchaseOrder>,
      { id: string; data: Partial<PurchaseOrder> }
    >({
      query: ({ id, data }) => ({
        url: `purchase-orders/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PurchaseOrders', id },
        'PurchaseOrders',
        'BusinessDashboard',
      ],
    }),

    deletePurchaseOrder: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `purchase-orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PurchaseOrders', 'BusinessDashboard'],
    }),

    approvePurchaseOrder: builder.mutation<
      ApiResponse<PurchaseOrder>,
      { id: string; approved: boolean; reason?: string }
    >({
      query: ({ id, approved, reason }) => ({
        url: `purchase-orders/${id}/approve`,
        method: 'POST',
        body: { approved, reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PurchaseOrders', id },
        'PurchaseOrders',
        'Approvals',
        'BusinessDashboard',
      ],
    }),

    getPendingPOApprovals: builder.query<PaginatedResponse<PurchaseOrder>, void>({
      query: () => 'purchase-orders/pending/approvals',
      providesTags: ['PurchaseOrders', 'Approvals'],
    }),

    assignVendorToPO: builder.mutation<
      ApiResponse<PurchaseOrder>,
      { id: string; vendorId: string }
    >({
      query: ({ id, vendorId }) => ({
        url: `purchase-orders/${id}/vendors`,
        method: 'POST',
        body: { vendorId },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PurchaseOrders', id },
        'PurchaseOrders',
      ],
    }),

    // ===== CONTRACTS (BUSINESS VIEW) =====
    getContracts: builder.query<
      PaginatedResponse<Contract>,
      { page?: number; pageSize?: number; status?: string; search?: string }
    >({
      query: (params) => ({
        url: 'contracts',
        params,
      }),
      providesTags: ['Contracts'],
    }),

    getContractById: builder.query<ApiResponse<Contract>, string>({
      query: (id) => `contracts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Contracts', id }],
    }),

    createContract: builder.mutation<ApiResponse<Contract>, Partial<Contract>>({
      query: (data) => ({
        url: 'contracts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contracts', 'BusinessDashboard'],
    }),

    updateContract: builder.mutation<
      ApiResponse<Contract>,
      { id: string; data: Partial<Contract> }
    >({
      query: ({ id, data }) => ({
        url: `contracts/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Contracts', id },
        'Contracts',
        'BusinessDashboard',
      ],
    }),

    updateContractStatus: builder.mutation<
      ApiResponse<Contract>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `contracts/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Contracts', id },
        'Contracts',
        'BusinessDashboard',
      ],
    }),

    closeContract: builder.mutation<ApiResponse<Contract>, string>({
      query: (id) => ({
        url: `contracts/${id}/close`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Contracts', id },
        'Contracts',
        'BusinessDashboard',
      ],
    }),

    terminateContract: builder.mutation<
      ApiResponse<Contract>,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `contracts/${id}/terminate`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Contracts', id },
        'Contracts',
        'BusinessDashboard',
      ],
    }),

    // ===== GOODS RECEIPTS =====
    getGoodsReceipts: builder.query<
      PaginatedResponse<GoodsReceipt>,
      { page?: number; pageSize?: number; purchaseOrderId?: string }
    >({
      query: (params) => ({
        url: 'goods-receipts',
        params,
      }),
      providesTags: ['GoodsReceipts'],
    }),

    getGoodsReceiptById: builder.query<ApiResponse<GoodsReceipt>, string>({
      query: (id) => `goods-receipts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'GoodsReceipts', id }],
    }),

    createGoodsReceipt: builder.mutation<ApiResponse<GoodsReceipt>, Partial<GoodsReceipt>>({
      query: (data) => ({
        url: 'goods-receipts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GoodsReceipts', 'PurchaseOrders', 'BusinessDashboard'],
    }),

    // ===== VENDORS (BUSINESS VIEW) =====
    getVendors: builder.query<
      PaginatedResponse<Vendor>,
      { page?: number; pageSize?: number; status?: string; search?: string }
    >({
      query: (params) => ({
        url: 'vendors',
        params,
      }),
      providesTags: ['Vendors'],
    }),

    getVendorById: builder.query<ApiResponse<Vendor>, string>({
      query: (id) => `vendors/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Vendors', id }],
    }),

    updateVendorStatus: builder.mutation<
      ApiResponse<Vendor>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `vendors/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Vendors', id }, 'Vendors'],
    }),

    blacklistVendor: builder.mutation<
      ApiResponse<Vendor>,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `vendors/${id}/blacklist`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Vendors', id }, 'Vendors'],
    }),

    getVendorPerformance: builder.query<ApiResponse<VendorPerformance>, string>({
      query: (id) => `vendors/${id}/performance`,
      providesTags: (_result, _error, id) => [{ type: 'Vendors', id }],
    }),

    // ===== TENDER MANAGEMENT (BUSINESS) =====
    createTender: builder.mutation<ApiResponse<any>, Partial<any>>({
      query: (data) => ({
        url: 'tenders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tenders', 'BusinessDashboard'],
    }),

    updateTender: builder.mutation<ApiResponse<any>, { id: string; data: Partial<any> }>({
      query: ({ id, data }) => ({
        url: `tenders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Tenders', id },
        'Tenders',
        'BusinessDashboard',
      ],
    }),

    publishTender: builder.mutation<ApiResponse<any>, string>({
      query: (id) => ({
        url: `tenders/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Tenders', id },
        'Tenders',
        'BusinessDashboard',
      ],
    }),

    awardTender: builder.mutation<
      ApiResponse<any>,
      { id: string; bidId: string; reason?: string }
    >({
      query: ({ id, bidId, reason }) => ({
        url: `tenders/${id}/award`,
        method: 'POST',
        body: { bidId, reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Tenders', id },
        'Tenders',
        'Bids',
        'BusinessDashboard',
      ],
    }),

    // ===== BID EVALUATION (BUSINESS) =====
    getBids: builder.query<
      PaginatedResponse<Bid>,
      { page?: number; pageSize?: number; status?: string; search?: string; tenderId?: string }
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

    scoreBid: builder.mutation<
      ApiResponse<any>,
      { id: string; scores: Record<string, number>; comments?: string }
    >({
      query: ({ id, scores, comments }) => ({
        url: `bids/${id}/score`,
        method: 'POST',
        body: { scores, comments },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Bids', id },
        'Bids',
        'BusinessDashboard',
      ],
    }),
  }),
});

export const {
  // Dashboard
  useGetBusinessDashboardStatsQuery,
  
  // Purchase Requisitions
  useGetPurchaseRequisitionsQuery,
  useGetPurchaseRequisitionByIdQuery,
  useCreatePurchaseRequisitionMutation,
  useUpdatePurchaseRequisitionMutation,
  useDeletePurchaseRequisitionMutation,
  useGetPendingPRApprovalsQuery,
  
  // Purchase Orders
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useApprovePurchaseOrderMutation,
  useGetPendingPOApprovalsQuery,
  useAssignVendorToPOMutation,
  
  // Contracts
  useGetContractsQuery,
  useGetContractByIdQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useUpdateContractStatusMutation,
  useCloseContractMutation,
  useTerminateContractMutation,
  
  // Goods Receipts
  useGetGoodsReceiptsQuery,
  useGetGoodsReceiptByIdQuery,
  useCreateGoodsReceiptMutation,
  
  // Vendors
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useUpdateVendorStatusMutation,
  useBlacklistVendorMutation,
  useGetVendorPerformanceQuery,
  
  // Tenders
  useCreateTenderMutation,
  useUpdateTenderMutation,
  usePublishTenderMutation,
  useAwardTenderMutation,
  
  // Bids
  useGetBidsQuery,
  useGetBidByIdQuery,
  useScoreBidMutation,
} = businessApi;
