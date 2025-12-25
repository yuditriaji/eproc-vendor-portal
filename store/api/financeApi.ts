import { baseApi } from './baseApi';
import type {
  Invoice,
  Payment,
  Budget,
  BudgetTransfer,
  Transaction,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

/**
 * Finance API
 * Endpoints for financial management (FINANCE, MANAGER, APPROVER roles)
 */
export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ===== INVOICES =====
    getInvoices: builder.query<
      PaginatedResponse<Invoice>,
      { page?: number; pageSize?: number; status?: string; search?: string }
    >({
      query: (params) => ({
        url: 'invoices',
        params,
      }),
      providesTags: ['Invoices'],
    }),

    getInvoiceById: builder.query<ApiResponse<Invoice>, string>({
      query: (id) => `invoices/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Invoices', id }],
    }),

    createInvoice: builder.mutation<ApiResponse<Invoice>, Partial<Invoice>>({
      query: (data) => ({
        url: 'invoices',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Invoices', 'BusinessDashboard'],
    }),

    updateInvoice: builder.mutation<
      ApiResponse<Invoice>,
      { id: string; data: Partial<Invoice> }
    >({
      query: ({ id, data }) => ({
        url: `invoices/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Invoices', id },
        'Invoices',
        'BusinessDashboard',
      ],
    }),

    deleteInvoice: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `invoices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Invoices', 'BusinessDashboard'],
    }),

    approveInvoice: builder.mutation<
      ApiResponse<Invoice>,
      { id: string; approved: boolean; reason?: string }
    >({
      query: ({ id, approved, reason }) => ({
        url: `invoices/${id}/approve`,
        method: 'PATCH',
        body: { approved, reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Invoices', id },
        'Invoices',
        'Approvals',
        'BusinessDashboard',
      ],
    }),

    markInvoiceAsPaid: builder.mutation<ApiResponse<Invoice>, string>({
      query: (id) => ({
        url: `invoices/${id}/pay`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Invoices', id },
        'Invoices',
        'Payments',
        'BusinessDashboard',
      ],
    }),

    getPendingInvoiceApprovals: builder.query<PaginatedResponse<Invoice>, void>({
      query: () => 'invoices/pending/approvals',
      providesTags: ['Invoices', 'Approvals'],
    }),

    getInvoiceStatistics: builder.query<ApiResponse<any>, void>({
      query: () => 'invoices/statistics/summary',
      providesTags: ['Invoices', 'BusinessDashboard'],
    }),

    // ===== PAYMENTS =====
    getPayments: builder.query<
      PaginatedResponse<Payment>,
      { page?: number; pageSize?: number; status?: string; search?: string }
    >({
      query: (params) => ({
        url: 'payments',
        params,
      }),
      providesTags: ['Payments'],
    }),

    getPaymentById: builder.query<ApiResponse<Payment>, string>({
      query: (id) => `payments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Payments', id }],
    }),

    createPayment: builder.mutation<ApiResponse<Payment>, Partial<Payment>>({
      query: (data) => ({
        url: 'payments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payments', 'Invoices', 'BusinessDashboard'],
    }),

    updatePayment: builder.mutation<
      ApiResponse<Payment>,
      { id: string; data: Partial<Payment> }
    >({
      query: ({ id, data }) => ({
        url: `payments/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Payments', id },
        'Payments',
        'BusinessDashboard',
      ],
    }),

    deletePayment: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payments', 'BusinessDashboard'],
    }),

    approvePayment: builder.mutation<
      ApiResponse<Payment>,
      { id: string; approved: boolean; reason?: string }
    >({
      query: ({ id, approved, reason }) => ({
        url: `payments/${id}/approve`,
        method: 'POST',
        body: { approved, reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Payments', id },
        'Payments',
        'Approvals',
        'BusinessDashboard',
      ],
    }),

    processPayment: builder.mutation<ApiResponse<Payment>, string>({
      query: (id) => ({
        url: `payments/${id}/process`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Payments', id },
        'Payments',
        'Invoices',
        'Budgets',
        'Transactions',
        'BusinessDashboard',
      ],
    }),

    getPendingPaymentApprovals: builder.query<PaginatedResponse<Payment>, void>({
      query: () => 'payments/pending/approvals',
      providesTags: ['Payments', 'Approvals'],
    }),

    getPaymentStatistics: builder.query<ApiResponse<any>, void>({
      query: () => 'payments/statistics/summary',
      providesTags: ['Payments', 'BusinessDashboard'],
    }),

    // ===== BUDGETS =====
    getBudgets: builder.query<
      PaginatedResponse<Budget>,
      { page?: number; pageSize?: number; status?: string; search?: string }
    >({
      query: (params) => ({
        url: 'budgets',
        params,
      }),
      providesTags: ['Budgets'],
    }),

    getBudgetById: builder.query<ApiResponse<Budget>, string>({
      query: (id) => `budgets/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Budgets', id }],
    }),

    createBudget: builder.mutation<ApiResponse<Budget>, Partial<Budget>>({
      query: (data) => ({
        url: 'budgets',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Budgets', 'BusinessDashboard'],
    }),

    updateBudget: builder.mutation<
      ApiResponse<Budget>,
      { id: string; data: Partial<Budget> }
    >({
      query: ({ id, data }) => ({
        url: `budgets/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Budgets', id },
        'Budgets',
        'BusinessDashboard',
      ],
    }),

    deleteBudget: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `budgets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Budgets', 'BusinessDashboard'],
    }),

    transferBudget: builder.mutation<
      ApiResponse<BudgetTransfer>,
      { fromBudgetId: string; toBudgetId: string; amount: number; reason?: string }
    >({
      query: (data) => ({
        url: `budgets/transfer`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Budgets', 'Transactions', 'BusinessDashboard'],
    }),

    // ===== TRANSACTIONS =====
    getTransactions: builder.query<
      PaginatedResponse<Transaction>,
      { page?: number; pageSize?: number; budgetId?: string; type?: string }
    >({
      query: (params) => ({
        url: 'transactions',
        params,
      }),
      providesTags: ['Transactions'],
    }),

    getTransactionById: builder.query<ApiResponse<Transaction>, string>({
      query: (id) => `transactions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Transactions', id }],
    }),

    getTransactionsByBudget: builder.query<PaginatedResponse<Transaction>, string>({
      query: (budgetId) => `transactions/budget/${budgetId}`,
      providesTags: (_result, _error, budgetId) => [
        { type: 'Budgets', id: budgetId },
        'Transactions',
      ],
    }),

    getTransactionsByType: builder.query<
      PaginatedResponse<Transaction>,
      { type: string; page?: number; pageSize?: number }
    >({
      query: (params) => ({
        url: 'transactions/by-type',
        params,
      }),
      providesTags: ['Transactions'],
    }),

    getTransactionDeductionSummary: builder.query<ApiResponse<any>, void>({
      query: () => 'transactions/deduction/summary',
      providesTags: ['Transactions', 'Budgets', 'BusinessDashboard'],
    }),
  }),
});

export const {
  // Invoices
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useApproveInvoiceMutation,
  useMarkInvoiceAsPaidMutation,
  useGetPendingInvoiceApprovalsQuery,
  useGetInvoiceStatisticsQuery,

  // Payments
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useApprovePaymentMutation,
  useProcessPaymentMutation,
  useGetPendingPaymentApprovalsQuery,
  useGetPaymentStatisticsQuery,

  // Budgets
  useGetBudgetsQuery,
  useGetBudgetByIdQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
  useTransferBudgetMutation,

  // Transactions
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetTransactionsByBudgetQuery,
  useGetTransactionsByTypeQuery,
  useGetTransactionDeductionSummaryQuery,
} = financeApi;
