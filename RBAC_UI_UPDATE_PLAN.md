# RBAC UI Update Implementation Plan

## Overview
Update the frontend RBAC management UI to use the new `RbacConfig` and `UserRbacRole` tables instead of the old `RoleConfig` and `UserRole` tables.

## Backend Changes Summary
- ✅ **Removed**: `RoleConfig` and `UserRole` tables
- ✅ **Using**: `RbacConfig` and `UserRbacRole` tables
- ✅ **Schema**: Updated to support multiple role assignments per user with expiration dates
- ✅ **Seed**: Created 3 default roles (Super Admin, Procurement Officer, Vendor)

## Database Schema

### RbacConfig Table (`rbac_config`)
```typescript
interface RbacConfig {
  id: string;
  tenantId: string;
  roleName: string;
  description?: string;
  orgLevel?: number;  // For org hierarchy-based permissions
  permissions: Record<string, string[]>;  // Flexible permission structure
  processConfigId?: string;  // Optional link to ProcessConfig
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### UserRbacRole Table (`user_rbac_roles`)
```typescript
interface UserRbacRole {
  id: string;
  tenantId: string;
  userId: string;
  rbacRoleId: string;
  assignedAt: string;
  assignedBy?: string;
  expiresAt?: string;  // Optional expiration
  rbacRole: RbacConfig;  // Relation to role details
  user: User;  // Relation to user
}
```

## Frontend Updates Required

### Phase 1: Update API Client
**File**: `src/store/api/roleApi.ts`

Update all endpoints to use new table names:
- `role_configs` → `rbac_config`
- `user_roles` → `user_rbac_roles`
- `roleId` → `rbacRoleId`
- `roleConfig` → `rbacRole`

**Changes**:
```typescript
// OLD
export interface Role {
  id: string;
  tenantId: string;
  roleName: string;
  permissions: Record<string, string[]>;
  description: string;
  isActive: boolean;
  // ...
}

// NEW
export interface RbacConfig {
  id: string;
  tenantId: string;
  roleName: string;
  description?: string;
  orgLevel?: number;
  permissions: Record<string, string[]>;
  processConfigId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// OLD
export interface UserRole {
  id: string;
  roleId: string;
  roleConfig: Role;
  // ...
}

// NEW
export interface UserRbacRole {
  id: string;
  rbacRoleId: string;
  rbacRole: RbacConfig;
  // ...
}
```

**API Endpoints**:
- ✅ `GET /roles` → Returns `RbacConfig[]`
- ✅ `POST /roles` → Create `RbacConfig`
- ✅ `GET /roles/:id` → Get single `RbacConfig`
- ✅ `PATCH /roles/:id` → Update `RbacConfig`
- ✅ `DELETE /roles/:id` → Delete `RbacConfig`
- ✅ `POST /users/:userId/roles` → Assign roles (creates `UserRbacRole`)
- ✅ `GET /users/:userId/roles` → Get user's `UserRbacRole[]`
- ✅ `GET /users/:userId/roles/permissions` → Get effective permissions
- ✅ `DELETE /users/:userId/roles/:roleId` → Remove role assignment

### Phase 2: Update Type Definitions
**File**: `src/types/rbac.ts` (create new file)

```typescript
export interface RbacConfig {
  id: string;
  tenantId: string;
  roleName: string;
  description?: string;
  orgLevel?: number;
  permissions: Record<string, string[]>;
  processConfigId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    userRoles: number;
  };
}

export interface UserRbacRole {
  id: string;
  tenantId: string;
  userId: string;
  rbacRoleId: string;
  assignedAt: string;
  assignedBy?: string;
  expiresAt?: string;
  rbacRole: RbacConfig;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateRbacRoleRequest {
  roleName: string;
  permissions: Record<string, string[]>;
  description?: string;
  orgLevel?: number;
  processConfigId?: string;
  isActive?: boolean;
}

export interface UpdateRbacRoleRequest {
  permissions?: Record<string, string[]>;
  description?: string;
  orgLevel?: number;
  isActive?: boolean;
}

export interface AssignRbacRolesRequest {
  roleIds: string[];  // Array of rbacRoleId
  expiresAt?: string;  // ISO date string
}

export interface UserRolesResponse {
  userId: string;
  email: string;
  username: string;
  roles: UserRbacRole[];
  totalRoles: number;
}

export interface UserPermissionsResponse {
  userId: string;
  roles: string[];  // Role names
  effectivePermissions: Record<string, string[]>;
}
```

### Phase 3: Update RTK Query API
**File**: `src/store/api/rbacApi.ts` (rename from `roleApi.ts`)

```typescript
import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types';
import type {
  RbacConfig,
  UserRbacRole,
  CreateRbacRoleRequest,
  UpdateRbacRoleRequest,
  AssignRbacRolesRequest,
  UserRolesResponse,
  UserPermissionsResponse,
} from '@/types/rbac';

export const rbacApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // RBAC Role CRUD
    createRbacRole: builder.mutation<ApiResponse<RbacConfig>, CreateRbacRoleRequest>({
      query: (data) => ({
        url: 'roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Roles'],
    }),

    getRbacRoles: builder.query<ApiResponse<RbacConfig[]>, { isActive?: boolean } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.isActive !== undefined) {
          queryParams.append('isActive', params.isActive.toString());
        }
        const queryString = queryParams.toString();
        return `roles${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Roles'],
    }),

    getRbacRoleById: builder.query<ApiResponse<RbacConfig>, string>({
      query: (roleId) => `roles/${roleId}`,
      providesTags: (_result, _error, roleId) => [{ type: 'Roles', id: roleId }],
    }),

    updateRbacRole: builder.mutation<
      ApiResponse<RbacConfig>,
      { roleId: string; data: UpdateRbacRoleRequest }
    >({
      query: ({ roleId, data }) => ({
        url: `roles/${roleId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        'Roles',
        { type: 'Roles', id: roleId },
      ],
    }),

    deleteRbacRole: builder.mutation<
      ApiResponse<{ id: string; roleName: string; message: string }>,
      string
    >({
      query: (roleId) => ({
        url: `roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),

    // User Role Assignment
    assignRbacRolesToUser: builder.mutation<
      ApiResponse<{ message: string; assignments: UserRbacRole[]; alreadyAssigned: number }>,
      { userId: string; data: AssignRbacRolesRequest }
    >({
      query: ({ userId, data }) => ({
        url: `users/${userId}/roles`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        'Auth',
        { type: 'UserRoles', id: userId },
      ],
    }),

    getUserRbacRoles: builder.query<UserRolesResponse, string>({
      query: (userId) => `users/${userId}/roles`,
      providesTags: (_result, _error, userId) => [{ type: 'UserRoles', id: userId }],
    }),

    getUserPermissions: builder.query<UserPermissionsResponse, string>({
      query: (userId) => `users/${userId}/roles/permissions`,
      providesTags: (_result, _error, userId) => [{ type: 'UserRoles', id: userId }],
    }),

    removeRbacRoleFromUser: builder.mutation<
      ApiResponse<{ message: string }>,
      { userId: string; roleId: string }
    >({
      query: ({ userId, roleId }) => ({
        url: `users/${userId}/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        'Auth',
        { type: 'UserRoles', id: userId },
      ],
    }),
  }),
});

export const {
  // RBAC Role CRUD
  useCreateRbacRoleMutation,
  useGetRbacRolesQuery,
  useGetRbacRoleByIdQuery,
  useUpdateRbacRoleMutation,
  useDeleteRbacRoleMutation,

  // User Role Assignment
  useAssignRbacRolesToUserMutation,
  useGetUserRbacRolesQuery,
  useGetUserPermissionsQuery,
  useRemoveRbacRoleFromUserMutation,
} = rbacApi;
```

### Phase 4: Update UI Components

#### 4.1 Roles List Page
**File**: `src/app/vendor/dashboard/admin/roles/page.tsx`

**Changes**:
- Import from new `rbacApi` instead of `roleApi`
- Use `useGetRbacRolesQuery` instead of `useGetRolesQuery`
- Update column mappings for new field names
- Update type references to `RbacConfig`

#### 4.2 Role Form Modal
**File**: `src/components/admin/RoleFormModal.tsx`

**Changes**:
- Use `useCreateRbacRoleMutation` / `useUpdateRbacRoleMutation`
- Add optional fields: `orgLevel`, `processConfigId`
- Update form validation
- Update type references

#### 4.3 User Role Assignment
**File**: `src/components/admin/UserRoleAssignment.tsx`

**Changes**:
- Import from new `rbacApi`
- Use `useGetUserRbacRolesQuery` instead of `useGetUserRolesQuery`
- Update field names: `roleId` → `rbacRoleId`, `roleConfig` → `rbacRole`
- Keep expiration date functionality (already compatible)

#### 4.4 Permission Editor
**File**: `src/components/admin/PermissionEditor.tsx`

**Changes**:
- Update type references to `RbacConfig`
- No structural changes needed (permissions format is the same)

#### 4.5 Users Page
**File**: `src/app/vendor/dashboard/admin/users/page.tsx`

**Changes**:
- Update displayed role badges to show `rbacRole.roleName`
- Update "Edit Roles" button to use new API

### Phase 5: Update baseApi Tags
**File**: `src/store/api/baseApi.ts`

Ensure tags are defined:
```typescript
tagTypes: ['Auth', 'Roles', 'UserRoles', 'Tenders', 'Bids', ...]
```

## Implementation Steps

### Step 1: Backend API Verification
- [ ] Verify all RBAC endpoints are working
- [ ] Test role CRUD operations
- [ ] Test user role assignment with expiration
- [ ] Test permission aggregation

### Step 2: Frontend Types & API
- [ ] Create `src/types/rbac.ts` with new types
- [ ] Create `src/store/api/rbacApi.ts`
- [ ] Update `baseApi.ts` if needed
- [ ] Test API calls in browser console

### Step 3: Update Components
- [ ] Update `RoleFormModal.tsx`
- [ ] Update `UserRoleAssignment.tsx`
- [ ] Update `PermissionEditor.tsx`
- [ ] Update roles list page
- [ ] Update users list page

### Step 4: Testing
- [ ] Test role creation with new fields
- [ ] Test role editing
- [ ] Test role deletion
- [ ] Test user role assignment (single & multiple)
- [ ] Test role assignment with expiration
- [ ] Test role removal
- [ ] Test permission viewing
- [ ] Test with expired roles

### Step 5: Cleanup
- [ ] Remove old `roleApi.ts` (or rename)
- [ ] Remove old type definitions
- [ ] Update imports across the app
- [ ] Run linter and fix issues

## Key Differences to Note

| Old System | New System |
|------------|------------|
| `RoleConfig` | `RbacConfig` |
| `UserRole` | `UserRbacRole` |
| `roleId` | `rbacRoleId` |
| `roleConfig` | `rbacRole` |
| `role_configs` table | `rbac_config` table |
| `user_roles` table | `user_rbac_roles` table |
| Simple role | Role with org level & process config support |

## Additional Features to Consider

### Optional Enhancements
1. **Org Level Filter**: Add UI to filter/assign roles by org level
2. **Process Config Link**: Show which process a role is tied to
3. **Role Hierarchy**: Visual representation of role hierarchy
4. **Bulk Assignment**: Assign multiple roles to multiple users at once
5. **Role Templates**: Pre-defined role templates for common scenarios
6. **Permission Presets**: Quick permission sets (read-only, power user, etc.)

## Migration Notes

- The `User.role` field (enum) is **still present** for backward compatibility
- Authentication currently uses `User.role`, not RBAC roles
- RBAC roles are for **fine-grained permission management**
- Future: Migrate auth to use RBAC roles exclusively

## Testing Checklist

- [ ] Can create new RBAC role
- [ ] Can edit existing role
- [ ] Can delete role (with confirmation)
- [ ] Can view all roles
- [ ] Can filter active/inactive roles
- [ ] Can assign single role to user
- [ ] Can assign multiple roles to user
- [ ] Can set expiration date on assignment
- [ ] Can remove role from user
- [ ] Can view user's assigned roles
- [ ] Can view user's effective permissions
- [ ] Expired roles are handled correctly
- [ ] Permission matrix displays correctly
- [ ] UI updates reflect in backend
- [ ] Proper error handling and loading states

## Completion Criteria

✅ All API endpoints updated to use `RbacConfig` and `UserRbacRole`
✅ All components render correctly with new data structure
✅ All CRUD operations working
✅ User role assignment with expiration working
✅ No console errors
✅ TypeScript compilation successful
✅ All tests passing
✅ Code reviewed and approved
