import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types';

// Basis Configuration Types
interface BasisConfigRequest {
  tenantConfig: {
    orgStructure: {
      levels: number;
      notes: string;
      allowCrossPlantProcurement: boolean;
    };
    businessVariants: Array<{
      name: string;
      code: string;
      description: string;
    }>;
    approvalLimits: {
      tier1: number;
      tier2: number;
      tier3: number;
    };
    financialYear: {
      startMonth: number;
      endMonth: number;
    };
  };
  processConfig: {
    name: string;
    processType: string;
    description: string;
    steps: Array<{
      stepName: string;
      requiredRole: string;
      allowedActions: string[];
      duration: number;
    }>;
  };
}

// Organization Types
interface CompanyCodeRequest {
  code: string;
  name: string;
  description?: string;
}

interface PlantRequest {
  companyCodeId: string;
  code: string;
  name: string;
}

interface StorageLocationRequest {
  plantId: string;
  code: string;
  name: string;
}

interface PurchasingOrgRequest {
  code: string;
  name: string;
}

interface PurchasingGroupRequest {
  purchasingOrgId: string;
  code: string;
  name: string;
}

interface PurchasingOrgAssignmentRequest {
  purchasingOrgId: string;
  companyCodeId?: string;
  plantId?: string;
}

// Master Data Types
interface CurrencyRequest {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number;
  isActive: boolean;
}

interface VendorRequest {
  name: string;
  registrationNumber: string;
  taxId: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  };
  businessType: string;
  yearEstablished: number;
  employeeCount: number;
  annualRevenue: number;
  certifications: string[];
  companyCodeId: string;
  plantId: string;
  purchasingOrgId: string;
  purchasingGroupId: string;
  // Optional user account creation
  createUserAccount?: boolean;
  userEmail?: string;
  userUsername?: string;
  userFirstName?: string;
  userLastName?: string;
}

interface VendorCreationResponse {
  vendor: any;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
  };
  temporaryPassword?: string;
  message: string;
}

export const configApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Basis Configuration
    createBasisConfig: builder.mutation<ApiResponse<any>, BasisConfigRequest>({
      query: (data) => ({
        url: 'config/basis',
        method: 'POST',
        body: data,
      }),
    }),

    getBasisConfig: builder.query<ApiResponse<any>, void>({
      query: () => 'config/basis',
    }),

    // Company Codes
    createCompanyCode: builder.mutation<ApiResponse<any>, CompanyCodeRequest>({
      query: (data) => ({
        url: 'org/company-codes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CompanyCodes'],
    }),

    getCompanyCodes: builder.query<ApiResponse<any[]>, void>({
      query: () => 'org/company-codes',
      providesTags: ['CompanyCodes'],
    }),

    updateCompanyCode: builder.mutation<ApiResponse<any>, { id: string; data: Partial<CompanyCodeRequest> }>({
      query: ({ id, data }) => ({
        url: `org/company-codes/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['CompanyCodes'],
    }),

    deleteCompanyCode: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `org/company-codes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CompanyCodes'],
    }),

    // Plants
    createPlant: builder.mutation<ApiResponse<any>, PlantRequest>({
      query: (data) => ({
        url: 'org/plants',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Plants', 'CompanyCodes'],
    }),

    getPlants: builder.query<ApiResponse<any[]>, string | void>({
      query: (companyCodeId) =>
        companyCodeId ? `org/plants?companyCodeId=${companyCodeId}` : 'org/plants',
      providesTags: ['Plants'],
    }),

    updatePlant: builder.mutation<ApiResponse<any>, { id: string; data: Partial<PlantRequest> }>({
      query: ({ id, data }) => ({
        url: `org/plants/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Plants'],
    }),

    deletePlant: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `org/plants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Plants', 'CompanyCodes'],
    }),

    // Storage Locations
    createStorageLocation: builder.mutation<ApiResponse<any>, StorageLocationRequest>({
      query: (data) => ({
        url: 'org/storage-locations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StorageLocations', 'Plants'],
    }),

    getStorageLocations: builder.query<ApiResponse<any[]>, string | void>({
      query: (plantId) =>
        plantId ? `org/storage-locations?plantId=${plantId}` : 'org/storage-locations',
      providesTags: ['StorageLocations'],
    }),

    updateStorageLocation: builder.mutation<ApiResponse<any>, { id: string; data: Partial<StorageLocationRequest> }>({
      query: ({ id, data }) => ({
        url: `org/storage-locations/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['StorageLocations'],
    }),

    deleteStorageLocation: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `org/storage-locations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StorageLocations', 'Plants'],
    }),

    // Purchasing Organizations
    createPurchasingOrg: builder.mutation<ApiResponse<any>, PurchasingOrgRequest>({
      query: (data) => ({
        url: 'org/purchasing-orgs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PurchasingOrgs'],
    }),

    getPurchasingOrgs: builder.query<ApiResponse<any[]>, void>({
      query: () => 'org/purchasing-orgs',
      providesTags: ['PurchasingOrgs'],
    }),

    updatePurchasingOrg: builder.mutation<ApiResponse<any>, { id: string; data: Partial<PurchasingOrgRequest> }>({
      query: ({ id, data }) => ({
        url: `org/purchasing-orgs/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['PurchasingOrgs'],
    }),

    deletePurchasingOrg: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `org/purchasing-orgs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PurchasingOrgs'],
    }),

    // Purchasing Groups
    createPurchasingGroup: builder.mutation<ApiResponse<any>, PurchasingGroupRequest>({
      query: (data) => ({
        url: 'org/purchasing-groups',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PurchasingGroups', 'PurchasingOrgs'],
    }),

    getPurchasingGroups: builder.query<ApiResponse<any[]>, string | void>({
      query: (purchasingOrgId) =>
        purchasingOrgId ? `org/purchasing-groups?purchasingOrgId=${purchasingOrgId}` : 'org/purchasing-groups',
      providesTags: ['PurchasingGroups'],
    }),

    updatePurchasingGroup: builder.mutation<ApiResponse<any>, { id: string; data: Partial<PurchasingGroupRequest> }>({
      query: ({ id, data }) => ({
        url: `org/purchasing-groups/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['PurchasingGroups'],
    }),

    deletePurchasingGroup: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `org/purchasing-groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PurchasingGroups', 'PurchasingOrgs'],
    }),

    // Purchasing Org Assignments
    getPurchasingOrgAssignments: builder.query<ApiResponse<any[]>, string | void>({
      query: (purchasingOrgId) =>
        purchasingOrgId ? `org/porg-assignments?purchasingOrgId=${purchasingOrgId}` : 'org/porg-assignments',
      providesTags: ['PurchasingOrgAssignments'],
    }),

    assignPurchasingOrg: builder.mutation<ApiResponse<any>, PurchasingOrgAssignmentRequest>({
      query: (data) => ({
        url: 'org/porg-assignments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PurchasingOrgAssignments', 'PurchasingOrgs', 'CompanyCodes'],
    }),

    deletePurchasingOrgAssignment: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `org/porg-assignments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PurchasingOrgAssignments'],
    }),

    // OrgUnits (for Budget)
    getOrgUnits: builder.query<ApiResponse<any[]>, string | void>({
      query: (type) => ({
        url: 'org/org-units',
        params: type ? { type } : undefined,
      }),
      providesTags: ['OrgUnits'],
    }),

    createOrgUnit: builder.mutation<ApiResponse<any>, {
      name: string;
      type: 'COMPANY_CODE' | 'PURCHASING_GROUP';
      level: number;
      parentId?: string;
      companyCode?: string;
      pgCode?: string;
    }>({
      query: (data) => ({
        url: 'org/org-units',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OrgUnits'],
    }),

    updateOrgUnit: builder.mutation<ApiResponse<any>, { id: string; data: { name?: string; parentId?: string } }>({
      query: ({ id, data }) => ({
        url: `org/org-units/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['OrgUnits'],
    }),

    deleteOrgUnit: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `org/org-units/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrgUnits'],
    }),

    // Currencies
    createCurrency: builder.mutation<ApiResponse<any>, CurrencyRequest>({
      query: (data) => ({
        url: 'currencies',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Currencies'],
    }),

    getCurrencies: builder.query<ApiResponse<any[]>, void>({
      query: () => 'currencies',
      providesTags: ['Currencies'],
    }),

    updateCurrency: builder.mutation<ApiResponse<any>, { id: string; data: Partial<CurrencyRequest> }>({
      query: ({ id, data }) => ({
        url: `currencies/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Currencies'],
    }),

    deleteCurrency: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `currencies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Currencies'],
    }),

    // Vendors
    createVendor: builder.mutation<VendorCreationResponse, VendorRequest>({
      query: (data) => ({
        url: 'vendors',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Vendors'],
    }),

    getVendors: builder.query<ApiResponse<any[]>, void>({
      query: () => 'vendors',
      providesTags: ['Vendors'],
    }),

    updateVendor: builder.mutation<ApiResponse<any>, { id: string; data: Partial<VendorRequest> }>({
      query: ({ id, data }) => ({
        url: `vendors/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Vendors'],
    }),

    deleteVendor: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `vendors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vendors'],
    }),

    // Master Data Summary
    getMasterDataSummary: builder.query<ApiResponse<any>, void>({
      query: () => 'master-data/summary',
    }),

    // Configuration Validation
    validateMasterData: builder.mutation<ApiResponse<any>, {
      companyCodeId: string;
      plantId?: string;
      storageLocationId?: string;
      purchasingOrgId?: string;
      purchasingGroupId?: string;
    }>({
      query: (data) => ({
        url: 'master-data/validate',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  // Basis Config
  useCreateBasisConfigMutation,
  useGetBasisConfigQuery,

  // Company Codes
  useCreateCompanyCodeMutation,
  useGetCompanyCodesQuery,
  useUpdateCompanyCodeMutation,
  useDeleteCompanyCodeMutation,

  // Plants
  useCreatePlantMutation,
  useGetPlantsQuery,
  useUpdatePlantMutation,
  useDeletePlantMutation,

  // Storage Locations
  useCreateStorageLocationMutation,
  useGetStorageLocationsQuery,
  useUpdateStorageLocationMutation,
  useDeleteStorageLocationMutation,

  // Purchasing Orgs
  useCreatePurchasingOrgMutation,
  useGetPurchasingOrgsQuery,
  useUpdatePurchasingOrgMutation,
  useDeletePurchasingOrgMutation,

  // Purchasing Groups
  useCreatePurchasingGroupMutation,
  useGetPurchasingGroupsQuery,
  useUpdatePurchasingGroupMutation,
  useDeletePurchasingGroupMutation,

  // Assignments
  useGetPurchasingOrgAssignmentsQuery,
  useAssignPurchasingOrgMutation,
  useDeletePurchasingOrgAssignmentMutation,

  // OrgUnits
  useGetOrgUnitsQuery,
  useCreateOrgUnitMutation,
  useUpdateOrgUnitMutation,
  useDeleteOrgUnitMutation,

  // Currencies
  useCreateCurrencyMutation,
  useGetCurrenciesQuery,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,

  // Vendors
  useCreateVendorMutation,
  useGetVendorsQuery,
  useUpdateVendorMutation,
  useDeleteVendorMutation,

  // Summary & Validation
  useGetMasterDataSummaryQuery,
  useValidateMasterDataMutation,
} = configApi;
