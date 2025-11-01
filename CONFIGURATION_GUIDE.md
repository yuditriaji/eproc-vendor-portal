# Configuration Guide

This guide explains how the admin configuration system works and how to use it properly.

## Overview

The admin portal follows the configuration flow defined in `CONFIGURATION_PROCESS_FLOW.md`:

1. **Tenant Provisioning** (SaaS Owner only - NOT available to admins)
2. **Authentication** (Admin login)
3. **Basis Configuration** (System-wide settings)
4. **Organizational Structure** (Company Codes → Plants → Storage Locations → Purchasing Orgs → Purchasing Groups)
5. **Master Data** (Currencies, Vendors)
6. **User Management**
7. **Configuration Validation**

## Access Control

### Authentication Protection

The admin layout now includes authentication checks:
- Users must be logged in to access the admin panel
- Only users with `ADMIN` role can access admin pages
- Unauthenticated users are redirected to `/admin/login`
- Non-admin users are redirected to `/unauthorized`

### Tenant Management

**IMPORTANT**: Tenant creation has been removed from the admin panel. This is a platform-level operation that should only be performed by the SaaS company owner through backend APIs.

Admins can only configure settings within their assigned tenant.

## API Integration

### Configuration API

A comprehensive configuration API has been created at `store/api/configApi.ts` with the following endpoints:

#### Basis Configuration
- `useCreateBasisConfigMutation` - Create/update basis configuration
- `useGetBasisConfigQuery` - Get current basis configuration

#### Company Codes
- `useCreateCompanyCodeMutation` - Create a new company code
- `useGetCompanyCodesQuery` - Get all company codes
- `useUpdateCompanyCodeMutation` - Update a company code
- `useDeleteCompanyCodeMutation` - Delete a company code

#### Plants
- `useCreatePlantMutation` - Create a new plant
- `useGetPlantsQuery` - Get all plants (optionally filter by company code)
- `useUpdatePlantMutation` - Update a plant
- `useDeletePlantMutation` - Delete a plant

#### Storage Locations
- `useCreateStorageLocationMutation` - Create a new storage location
- `useGetStorageLocationsQuery` - Get all storage locations (optionally filter by plant)
- `useUpdateStorageLocationMutation` - Update a storage location
- `useDeleteStorageLocationMutation` - Delete a storage location

#### Purchasing Organizations
- `useCreatePurchasingOrgMutation` - Create a new purchasing organization
- `useGetPurchasingOrgsQuery` - Get all purchasing organizations
- `useUpdatePurchasingOrgMutation` - Update a purchasing organization
- `useDeletePurchasingOrgMutation` - Delete a purchasing organization

#### Purchasing Groups
- `useCreatePurchasingGroupMutation` - Create a new purchasing group
- `useGetPurchasingGroupsQuery` - Get all purchasing groups (optionally filter by purchasing org)
- `useUpdatePurchasingGroupMutation` - Update a purchasing group
- `useDeletePurchasingGroupMutation` - Delete a purchasing group

#### Purchasing Org Assignments
- `useAssignPurchasingOrgMutation` - Assign purchasing org to company code or plant

#### Currencies
- `useCreateCurrencyMutation` - Create a new currency
- `useGetCurrenciesQuery` - Get all currencies
- `useUpdateCurrencyMutation` - Update a currency
- `useDeleteCurrencyMutation` - Delete a currency

#### Vendors
- `useCreateVendorMutation` - Create a new vendor
- `useGetVendorsQuery` - Get all vendors
- `useUpdateVendorMutation` - Update a vendor
- `useDeleteVendorMutation` - Delete a vendor

#### Validation
- `useGetMasterDataSummaryQuery` - Get summary statistics
- `useValidateMasterDataMutation` - Validate master data references

### API Endpoint Format

All endpoints follow the pattern:
```
{API_PREFIX}/{tenant}/{endpoint}
```

For example:
```
POST /api/v1/quiv/org/company-codes
GET /api/v1/quiv/org/plants
POST /api/v1/quiv/currencies
```

The tenant is automatically extracted from:
- Development: Query parameter `?tenant=quiv` or environment variable
- Production: Subdomain `quiv.synnova.com`

## Configuration Flow

### Step 1: Login as Admin

Navigate to:
```
https://eproc-vendor-portal.vercel.app/admin/login?tenant=quiv
```

Use credentials:
- Email: `admin@eproc.local`
- Password: `admin123`

### Step 2: Basis Configuration

Navigate to **Configuration → Basis Configuration**

Configure:
- Organizational structure (hierarchy levels, cross-plant procurement)
- Business variants (standard, express procurement)
- Approval limits (tier 1, 2, 3)
- Financial year settings

### Step 3: Company Codes

Navigate to **Configuration → Organization → Company Codes**

Create company codes with:
- Code (e.g., CC1000)
- Name (e.g., "Acme US Operations")
- Description
- Full address (street, city, state, zip, country)

### Step 4: Plants

Navigate to **Configuration → Organization → Plants**

Create plants under company codes with:
- Company code reference
- Plant code (e.g., P1001)
- Name (e.g., "Manhattan Manufacturing Plant")
- Description
- Address

### Step 5: Storage Locations

Navigate to **Configuration → Organization → Storage Locations**

Create storage locations within plants with:
- Plant reference
- Location code (e.g., SL001)
- Name (e.g., "Main Warehouse")
- Description
- Capacity and unit

### Step 6: Purchasing Organizations

Navigate to **Configuration → Organization → Purchasing Orgs**

Create purchasing organizations with:
- Code (e.g., PORG1000)
- Name (e.g., "US Procurement Organization")
- Description

Then assign them to company codes using the assignment endpoint.

### Step 7: Purchasing Groups

Navigate to **Configuration → Organization → Purchasing Groups**

Create purchasing groups under purchasing orgs with:
- Purchasing org reference
- Group code (e.g., PG100)
- Name (e.g., "IT & Electronics Procurement Group")
- Description

### Step 8: Master Data

#### Currencies
Navigate to **Configuration → Master Data → Currencies**

Configure currencies with:
- Code (e.g., USD, EUR)
- Symbol ($, €)
- Name
- Exchange rate
- Active status

#### Vendors
Navigate to **Configuration → Master Data → Vendors**

Register vendors with:
- Basic info (name, registration, tax ID)
- Contact details
- Address
- Bank details
- Business info (type, employees, revenue)
- Certifications
- Insurance

### Step 9: User Management

Navigate to **User Management**

Create users with appropriate roles:
- ADMIN - Full system access
- USER - Internal tender management
- BUYER - Procurement operations
- MANAGER - Approval authority
- FINANCE - Financial operations
- VENDOR - External supplier access

### Step 10: Validation

Navigate to **Validation**

Validate master data consistency to ensure:
- Company codes are properly configured
- Plants belong to correct company codes
- Storage locations belong to correct plants
- Purchasing orgs are assigned correctly
- Purchasing groups belong to correct purchasing orgs

## Example: Company Code Page

The Company Codes page demonstrates proper API integration:

```typescript
export default function CompanyCodesPage() {
  const { data, isLoading, error } = useGetCompanyCodesQuery();
  const [createCompanyCode, { isLoading: isCreating }] = useCreateCompanyCodeMutation();
  
  const onSubmit = async (formData) => {
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      };
      
      await createCompanyCode(payload).unwrap();
      toast.success('Company code created successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create company code');
    }
  };
}
```

Key features:
- RTK Query hooks for data fetching and mutations
- Loading states with spinner indicators
- Error handling with toast notifications
- Form validation with React Hook Form
- Proper TypeScript typing
- Backend data structure compliance

## Technical Implementation

### Redux Store Setup

The configuration API is integrated with RTK Query:

```typescript
// store/api/configApi.ts
export const configApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCompanyCode: builder.mutation({
      query: (data) => ({
        url: 'org/company-codes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CompanyCodes'],
    }),
    // ... more endpoints
  }),
});
```

### Tag-based Cache Invalidation

Tags are used for automatic cache invalidation:
- `CompanyCodes` - Company code data
- `Plants` - Plant data
- `StorageLocations` - Storage location data
- `PurchasingOrgs` - Purchasing organization data
- `PurchasingGroups` - Purchasing group data
- `Currencies` - Currency data
- `Vendors` - Vendor data

When a mutation succeeds, related queries are automatically refetched.

### Authentication Flow

1. User navigates to admin page
2. `AdminLayoutContent` checks authentication status via Redux
3. If not authenticated → redirect to `/admin/login?tenant={tenant}`
4. If authenticated but not ADMIN → redirect to `/unauthorized`
5. If authenticated and ADMIN → render page content

### Suspense Boundaries

The admin layout uses Suspense boundaries to handle:
- `useSearchParams()` in client components
- Dynamic imports
- Data fetching

```typescript
<Suspense fallback={<Loader />}>
  <AdminLayoutContent>{children}</AdminLayoutContent>
</Suspense>
```

## Next Steps

To complete the configuration implementation:

1. ✅ Fix sidebar visibility before login
2. ✅ Remove tenant management from admin
3. ✅ Create configuration API with proper endpoints
4. ✅ Implement Company Codes page with full integration
5. ⏳ Implement remaining organization pages (Plants, Storage Locations, Purchasing Orgs, Purchasing Groups)
6. ⏳ Implement master data pages (Currencies, Vendors)
7. ⏳ Implement basis configuration page with backend integration
8. ⏳ Test all pages with real backend
9. ⏳ Add validation page implementation

## Troubleshooting

### Build Errors

If you encounter build errors:

1. **Module not found errors**: Ensure all imports are correct and files exist
2. **Suspense boundary errors**: Wrap components using `useSearchParams()` in `<Suspense>`
3. **Type errors**: Check that all API types match backend response structures

### Authentication Issues

If authentication doesn't work:

1. Check that token is stored in Redux state
2. Verify token is sent in Authorization header
3. Check middleware is extracting tenant correctly
4. Verify backend accepts the token format

### API Integration Issues

If API calls fail:

1. Check network tab for request/response
2. Verify endpoint URLs match backend structure
3. Check request body format matches backend expectations
4. Verify tenant parameter is included in URL
5. Check authentication token is valid

## References

- [CONFIGURATION_PROCESS_FLOW.md](./CONFIGURATION_PROCESS_FLOW.md) - Complete API specification
- [LOGIN_GUIDE.md](./LOGIN_GUIDE.md) - Login instructions for all roles
- [WARP.md](./WARP.md) - Development environment guide
