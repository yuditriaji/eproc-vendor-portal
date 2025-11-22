import { baseApi } from './baseApi';
import type {
  Workflow,
  ApprovalRequest,
  ApprovalHistory,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

/**
 * Workflow & Approval API
 * Endpoints for workflow orchestration and approval management
 */
export const workflowApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== WORKFLOW ORCHESTRATION =====
    initiateProcurementWorkflow: builder.mutation<ApiResponse<Workflow>, { contractId: string }>({
      query: ({ contractId }) => ({
        url: `workflows/procurement/initiate/${contractId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Workflows', 'BusinessDashboard'],
    }),

    createPRFromContract: builder.mutation<ApiResponse<any>, { contractId: string; data: any }>({
      query: ({ contractId, data }) => ({
        url: `workflows/procurement/create-pr/${contractId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Workflows', 'PurchaseRequisitions', 'Contracts', 'BusinessDashboard'],
    }),

    approvePRInWorkflow: builder.mutation<
      ApiResponse<any>,
      { prId: string; approved: boolean; reason?: string }
    >({
      query: ({ prId, approved, reason }) => ({
        url: `workflows/procurement/approve-pr/${prId}`,
        method: 'POST',
        body: { approved, reason },
      }),
      invalidatesTags: ['Workflows', 'PurchaseRequisitions', 'Approvals', 'BusinessDashboard'],
    }),

    createPOFromPR: builder.mutation<ApiResponse<any>, { prId: string; data: any }>({
      query: ({ prId, data }) => ({
        url: `workflows/procurement/create-po/${prId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Workflows', 'PurchaseOrders', 'PurchaseRequisitions', 'BusinessDashboard'],
    }),

    recordGoodsReceipt: builder.mutation<ApiResponse<any>, { poId: string; data: any }>({
      query: ({ poId, data }) => ({
        url: `workflows/procurement/record-gr/${poId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Workflows', 'GoodsReceipts', 'PurchaseOrders', 'BusinessDashboard'],
    }),

    createInvoiceFromGR: builder.mutation<ApiResponse<any>, { grId: string; data: any }>({
      query: ({ grId, data }) => ({
        url: `workflows/procurement/create-invoice/${grId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Workflows', 'Invoices', 'GoodsReceipts', 'BusinessDashboard'],
    }),

    processPaymentFromInvoice: builder.mutation<ApiResponse<any>, { invoiceId: string; data: any }>({
      query: ({ invoiceId, data }) => ({
        url: `workflows/procurement/process-payment/${invoiceId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Workflows', 'Payments', 'Invoices', 'Budgets', 'BusinessDashboard'],
    }),

    getWorkflows: builder.query<
      PaginatedResponse<Workflow>,
      { page?: number; pageSize?: number; status?: string; type?: string }
    >({
      query: (params) => ({
        url: 'workflows',
        params,
      }),
      providesTags: ['Workflows'],
    }),

    getWorkflowById: builder.query<ApiResponse<Workflow>, string>({
      query: (id) => `workflows/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Workflows', id }],
    }),

    cancelWorkflow: builder.mutation<ApiResponse<Workflow>, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `workflows/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Workflows', id },
        'Workflows',
        'BusinessDashboard',
      ],
    }),

    // ===== APPROVAL MANAGEMENT =====
    getApprovalRequests: builder.query<
      PaginatedResponse<ApprovalRequest>,
      { page?: number; pageSize?: number; type?: string; status?: string; assignedToMe?: boolean }
    >({
      query: (params) => ({
        url: 'approvals',
        params,
      }),
      providesTags: ['Approvals'],
    }),

    getApprovalRequestById: builder.query<ApiResponse<ApprovalRequest>, string>({
      query: (id) => `approvals/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Approvals', id }],
    }),

    getMyPendingApprovals: builder.query<
      PaginatedResponse<ApprovalRequest>,
      { page?: number; pageSize?: number; type?: string; priority?: string; search?: string }
    >({
      query: (params) => ({
        url: 'approvals/my-pending',
        params,
      }),
      providesTags: ['Approvals'],
    }),

    approveRequest: builder.mutation<
      ApiResponse<ApprovalRequest>,
      { id: string; approved: boolean; comments?: string }
    >({
      query: ({ id, approved, comments }) => ({
        url: `approvals/${id}/approve`,
        method: 'POST',
        body: { approved, comments },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Approvals', id },
        'Approvals',
        'PurchaseRequisitions',
        'PurchaseOrders',
        'Invoices',
        'Payments',
        'Workflows',
        'BusinessDashboard',
      ],
    }),

    getApprovalHistory: builder.query<
      PaginatedResponse<ApprovalHistory>,
      { page?: number; pageSize?: number; approverId?: string; type?: string; action?: string; search?: string }
    >({
      query: (params) => ({
        url: 'approvals/history',
        params,
      }),
      providesTags: ['Approvals'],
    }),

    getMyApprovalHistory: builder.query<PaginatedResponse<ApprovalHistory>, void>({
      query: () => 'approvals/history/me',
      providesTags: ['Approvals'],
    }),

    // ===== STATISTICS =====
    getApprovalStatistics: builder.query<ApiResponse<any>, void>({
      query: () => 'approvals/statistics',
      providesTags: ['Approvals', 'BusinessDashboard'],
    }),

    getWorkflowStatistics: builder.query<ApiResponse<any>, void>({
      query: () => 'workflows/statistics',
      providesTags: ['Workflows', 'BusinessDashboard'],
    }),
  }),
});

export const {
  // Workflow Orchestration
  useInitiateProcurementWorkflowMutation,
  useCreatePRFromContractMutation,
  useApprovePRInWorkflowMutation,
  useCreatePOFromPRMutation,
  useRecordGoodsReceiptMutation,
  useCreateInvoiceFromGRMutation,
  useProcessPaymentFromInvoiceMutation,
  useGetWorkflowsQuery,
  useGetWorkflowByIdQuery,
  useCancelWorkflowMutation,

  // Approval Management
  useGetApprovalRequestsQuery,
  useGetApprovalRequestByIdQuery,
  useGetMyPendingApprovalsQuery,
  useApproveRequestMutation,
  useGetApprovalHistoryQuery,
  useGetMyApprovalHistoryQuery,
  useGetApprovalStatisticsQuery,
  useGetWorkflowStatisticsQuery,
} = workflowApi;
