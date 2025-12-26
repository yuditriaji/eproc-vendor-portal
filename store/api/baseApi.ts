import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { getApiUrl } from '@/lib/tenant';

const baseQueryWithLogging = fetchBaseQuery({
  baseUrl: getApiUrl(),
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    headers.set('Content-Type', 'application/json');

    return headers;
  },
});

const baseQuery: typeof baseQueryWithLogging = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  const hasToken = !!state.auth.token;

  console.log('[API Request]', {
    endpoint: typeof args === 'string' ? args : args.url,
    method: typeof args === 'string' ? 'GET' : args.method,
    body: typeof args === 'string' ? undefined : args.body,
    hasAuthToken: hasToken,
  });

  const result = await baseQueryWithLogging(args, api, extraOptions);

  if (result.error) {
    console.error('[API Error]', {
      status: result.error.status,
      data: result.error.data,
      endpoint: typeof args === 'string' ? args : args.url,
      fullError: result.error,
    });
  } else {
    console.log('[API Success]', {
      endpoint: typeof args === 'string' ? args : args.url,
      data: result.data,
    });
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Auth',
    'Tenders',
    'Bids',
    'Contracts',
    'User',
    'Dashboard',
    'CompanyCodes',
    'Plants',
    'StorageLocations',
    'PurchasingOrgs',
    'PurchasingOrgAssignments',
    'PurchasingGroups',
    'Currencies',
    'Vendors',
    'Roles',
    'UserRoles',
    // Business Portal Tags
    'PurchaseRequisitions',
    'PurchaseOrders',
    'Invoices',
    'Payments',
    'Budgets',
    'Transactions',
    'GoodsReceipts',
    'Workflows',
    'Approvals',
    'BusinessDashboard',
    'Statistics',
    // P2P Workflow Tags
    'RFQs',
    'Quotations',
    // OrgUnit for budgets
    'OrgUnits',
  ],
  endpoints: () => ({}),
});
