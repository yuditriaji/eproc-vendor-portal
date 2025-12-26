import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types';

/**
 * Organization Structure API
 * Endpoints for company codes, plants, purchasing orgs, etc.
 */

interface CompanyCode {
    id: string;
    code: string;
    name: string;
    description?: string;
}

interface Plant {
    id: string;
    companyCodeId: string;
    code: string;
    name: string;
    description?: string;
}

interface PurchasingOrg {
    id: string;
    code: string;
    name: string;
}

interface PurchasingGroup {
    id: string;
    purchasingOrgId: string;
    code: string;
    name: string;
}

export const orgApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // OrgUnits (for Budget creation)
        getOrgUnits: builder.query<ApiResponse<any[]>, string | void>({
            query: (type) => ({
                url: 'org/org-units',
                params: type ? { type } : undefined,
            }),
            providesTags: ['OrgUnits'],
        }),

        // Company Codes
        getCompanyCodes: builder.query<ApiResponse<CompanyCode[]>, string | void>({
            query: (search) => ({
                url: 'org/company-codes',
                params: search ? { q: search } : undefined,
            }),
            providesTags: ['CompanyCodes'],
        }),

        // Plants
        getPlants: builder.query<ApiResponse<Plant[]>, string | void>({
            query: (companyCodeId) => ({
                url: 'org/plants',
                params: companyCodeId ? { companyCodeId } : undefined,
            }),
            providesTags: ['Plants'],
        }),

        // Purchasing Organizations
        getPurchasingOrgs: builder.query<ApiResponse<PurchasingOrg[]>, string | void>({
            query: (search) => ({
                url: 'org/purchasing-orgs',
                params: search ? { q: search } : undefined,
            }),
            providesTags: ['PurchasingOrgs'],
        }),

        // Purchasing Groups
        getPurchasingGroups: builder.query<ApiResponse<PurchasingGroup[]>, string | void>({
            query: (purchasingOrgId) => ({
                url: 'org/purchasing-groups',
                params: purchasingOrgId ? { purchasingOrgId } : undefined,
            }),
            providesTags: ['PurchasingGroups'],
        }),
    }),
});

export const {
    useGetOrgUnitsQuery,
    useGetCompanyCodesQuery,
    useGetPlantsQuery,
    useGetPurchasingOrgsQuery,
    useGetPurchasingGroupsQuery,
} = orgApi;
