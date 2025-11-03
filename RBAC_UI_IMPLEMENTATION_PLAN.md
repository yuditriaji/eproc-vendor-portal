# RBAC User Management UI Implementation Plan

## Overview

**Backend Status**: ✅ Fully implemented (see RBAC_IMPLEMENTATION_PLAN.md and USER_MANAGEMENT.md)

**Goal**: Build the frontend UI to integrate with the existing backend RBAC endpoints.

Implement a complete Role-Based Access Control (RBAC) user interface in the admin portal that allows administrators to:
- Create and manage role configurations with custom permissions
- Assign multiple roles to users (supporting ADMIN + USER dual roles, etc.)
- View effective permissions for users
- Handle temporary role assignments with expiration dates
- Support the multi-role system described in RBAC_IMPLEMENTATION_PLAN.md

**Backend Endpoints Available** (from USER_MANAGEMENT.md):
- ✅ `POST /:tenant/roles` - Create role
- ✅ `GET /:tenant/roles` - List all roles
- ✅ `GET /:tenant/roles/:roleId` - Get role details
- ✅ `PATCH /:tenant/roles/:roleId` - Update role
- ✅ `DELETE /:tenant/roles/:roleId` - Delete role
- ✅ `POST /:tenant/users/:userId/roles` - Assign roles to user
- ✅ `GET /:tenant/users/:userId/roles` - Get user's roles
- ✅ `GET /:tenant/users/:userId/roles/permissions` - Get effective permissions
- ✅ `DELETE /:tenant/users/:userId/roles/:roleId` - Remove role from user

---

## Quick Start - What to Build

### Immediate Actions (MVP):
1. **Create `store/api/roleApi.ts`** - Frontend API client for backend endpoints
2. **Build Roles Page** (`app/admin/(dashboard)/roles/page.tsx`) - List and manage roles
3. **Add Role Assignment to Users Page** - Multi-select dropdown to assign roles
4. **Create Role Form Component** - Create/edit roles with permission editor

### What You Get:
- Admins can create custom roles (e.g., PROCUREMENT_MANAGER, FINANCE_MANAGER)
- Admins can assign multiple roles to users (e.g., Bob gets ADMIN + USER roles)
- Users get merged permissions from all their roles
- Support for temporary roles with expiration dates

---

## Implementation Phases

### Phase 1: Frontend API Client Integration (2-3 days)

#### 1.1 Create Role Management API Client (`store/api/roleApi.ts`)

**Task**: Create RTK Query API client to connect to existing backend endpoints.

**Backend endpoints to integrate** (already implemented):

```typescript
// Role Configuration CRUD
- createRole: POST /:tenant/roles
- getRoles: GET /:tenant/roles
- getRoleById: GET /:tenant/roles/:roleId
- updateRole: PATCH /:tenant/roles/:roleId
- deleteRole: DELETE /:tenant/roles/:roleId

// User Role Assignment
- assignRolesToUser: POST /:tenant/users/:userId/roles
- getUserRoles: GET /:tenant/users/:userId/roles
- getUserPermissions: GET /:tenant/users/:userId/roles/permissions
- removeRoleFromUser: DELETE /:tenant/users/:userId/roles/:roleId
```

**Interfaces:**

```typescript
interface Role {
  id: string;
  tenantId: string;
  roleName: string;
  permissions: Record<string, string[]>;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userRoles?: UserRole[];
}

interface UserRole {
  id: string;
  tenantId: string;
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy?: string;
  expiresAt?: string;
  roleConfig: Role;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

interface AssignRolesRequest {
  roleIds: string[];
  expiresAt?: string; // ISO date string
}
```

**File: `store/api/roleApi.ts`**

---

### Phase 2: Roles Management Page (2-3 days)

#### 2.1 Roles List Page (`app/admin/(dashboard)/roles/page.tsx`)

**Features:**
- Display all roles in cards or data table
- Show role name, description, user count, active status
- Search/filter roles by name or active status
- "Create Role" button
- Edit/Delete actions for each role
- Badge indicators for active/inactive status

**UI Components needed:**
- Card/DataTable for roles list
- Search input with filter
- Status badges
- Action buttons (Edit, Delete, View Details)

**Mock Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Roles & Permissions              [+ Create Role]  │
├─────────────────────────────────────────────────────┤
│  [Search roles...]                                  │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐   │
│  │ 🔑 PROCUREMENT_MANAGER            [Active]   │   │
│  │ Procurement department manager               │   │
│  │ • 5 users assigned                           │   │
│  │ • Permissions: tenders, vendors, bids        │   │
│  │                              [Edit] [Delete] │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🔑 FINANCE_MANAGER                [Active]   │   │
│  │ Finance department manager                   │   │
│  │ • 3 users assigned                           │   │
│  │ • Permissions: invoices, payments            │   │
│  │                              [Edit] [Delete] │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

#### 2.2 Create/Edit Role Form (Modal or Separate Page)

**Form Fields:**
- Role Name (text input, required)
- Description (textarea, required)
- Permissions (dynamic JSON editor or checkbox groups)
- Active Status (toggle switch)

**Permission Structure UI:**
- Use accordion or tabs for different resource types (tenders, bids, vendors, etc.)
- Checkboxes for actions: create, read, update, delete, approve, etc.
- Or JSON editor for advanced users

**Validation:**
- Role name required and unique
- At least one permission must be selected
- Description required

**Example Permission UI:**
```
┌─────────────────────────────────────────────┐
│  Permissions                                │
├─────────────────────────────────────────────┤
│  ▶ Tenders                                  │
│    ☑ Create  ☑ Read  ☑ Update  ☑ Approve   │
│                                             │
│  ▶ Vendors                                  │
│    ☐ Create  ☑ Read  ☐ Update  ☐ Delete    │
│                                             │
│  ▶ Bids                                     │
│    ☐ Create  ☑ Read  ☑ Score   ☐ Delete    │
└─────────────────────────────────────────────┘
```

---

### Phase 3: Enhanced User Management (3-4 days)

#### 3.1 Update Users List Page

**Add columns:**
- Roles Count badge (e.g., "2 roles")
- Quick view of assigned roles

**Enhanced user card:**
```
┌─────────────────────────────────────────────────┐
│ 👤 John Doe                        [Active]     │
│ john.doe@acme.com • @johndoe                    │
│                                                 │
│ Roles: [PROCUREMENT_MANAGER] [FINANCE_MANAGER]  │
│                                    [Edit Roles] │
└─────────────────────────────────────────────────┘
```

#### 3.2 User Role Assignment Modal

**Component: `components/admin/UserRoleAssignment.tsx`**

**Features:**
- Multi-select dropdown for available roles
- Display currently assigned roles with badges
- Remove button for each assigned role
- Optional expiration date picker
- Show effective permissions preview

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Manage Roles for John Doe                      │
├──────────────────────────────────────────────────┤
│  Currently Assigned Roles:                       │
│  ┌────────────────────────────────────────────┐  │
│  │ [PROCUREMENT_MANAGER]            [×Remove] │  │
│  │ Assigned: 2024-01-01                       │  │
│  │ Expires: Never                             │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │ [FINANCE_MANAGER]                [×Remove] │  │
│  │ Assigned: 2024-01-02                       │  │
│  │ Expires: 2025-07-01                        │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Assign New Roles:                               │
│  ┌────────────────────────────────────────────┐  │
│  │ [Select roles...]                     ▼    │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ☐ Set expiration date                          │
│  [ ] [Select date...]                           │
│                                                  │
│  ▼ Effective Permissions Preview                │
│  • tenders: create, read, update, approve       │
│  • vendors: read, evaluate                      │
│  • bids: read, score                            │
│  • invoices: create, read, approve              │
│  • payments: create, read, approve              │
│                                                  │
│               [Cancel]  [Assign Roles]           │
└──────────────────────────────────────────────────┘
```

#### 3.3 User Permissions View Page

**Route: `/admin/users/:userId/permissions`**

**Features:**
- Display all assigned roles
- Show merged/effective permissions
- Visual representation of permission inheritance
- Role expiration warnings

---

### Phase 4: Role Details Page (1-2 days)

#### 4.1 Role Details View

**Route: `/admin/roles/:roleId`**

**Sections:**
1. Role Information (name, description, status)
2. Permissions breakdown
3. Assigned Users list
4. Role assignment history
5. Edit/Delete actions

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  ← Back to Roles                                   │
│                                                    │
│  PROCUREMENT_MANAGER                    [Edit]    │
│  Procurement department manager                   │
│  Status: [Active]                                 │
│  Created: 2024-01-01                              │
│  Updated: 2024-01-15                              │
├────────────────────────────────────────────────────┤
│  Permissions                                       │
│  ┌────────────────────────────────────────────┐   │
│  │ Tenders: create, read, update, approve     │   │
│  │ Vendors: read, evaluate                    │   │
│  │ Bids: read, score                          │   │
│  └────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────┤
│  Assigned Users (5)                                │
│  ┌────────────────────────────────────────────┐   │
│  │ 👤 John Doe                                │   │
│  │    john.doe@acme.com                       │   │
│  │    Assigned: 2024-01-01                    │   │
│  │    Expires: Never                          │   │
│  └────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────┐   │
│  │ 👤 Jane Smith                              │   │
│  │    jane.smith@acme.com                     │   │
│  │    Assigned: 2024-01-02                    │   │
│  │    Expires: 2025-07-01 ⚠️ Expires soon     │   │
│  └────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

---

### Phase 5: Advanced Features (2-3 days)

#### 5.1 Permission Matrix View

**Component: `components/admin/PermissionMatrix.tsx`**

**Features:**
- Table view showing all roles vs permissions
- Quick overview of what each role can do
- Export to CSV/PDF

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Permission Matrix                               [Export]    │
├─────────────────────────────────────────────────────────────┤
│                 │ ADMIN │ BUYER │ MANAGER │ FINANCE │ VENDOR│
├─────────────────┼───────┼───────┼─────────┼─────────┼───────┤
│ Create Tender   │   ✓   │   ✓   │    ✓    │    ✗    │   ✗   │
│ Approve Tender  │   ✓   │   ✗   │    ✓    │    ✗    │   ✗   │
│ View Bids       │   ✓   │   ✓   │    ✓    │    ✗    │   ✓   │
│ Submit Bid      │   ✗   │   ✗   │    ✗    │    ✗    │   ✓   │
│ Approve Invoice │   ✓   │   ✗   │    ✗    │    ✓    │   ✗   │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2 Role Template System

**Pre-defined role templates:**
- ADMIN (full system access)
- PROCUREMENT_MANAGER
- FINANCE_MANAGER
- BUYER
- VENDOR
- APPROVER

**Features:**
- Quick create from template
- Customize after creation
- Save as new template

#### 5.3 Bulk User Role Assignment

**Features:**
- Select multiple users
- Assign same role(s) to all
- Useful for department-wide changes

#### 5.4 Role Expiration Notifications

**Component: `components/admin/ExpiringRolesAlert.tsx`**

**Features:**
- Dashboard widget showing roles expiring soon
- Email notifications (backend feature)
- One-click extension

---

## File Structure

```
app/admin/(dashboard)/
├── roles/
│   ├── page.tsx                    # Roles list
│   ├── [roleId]/
│   │   └── page.tsx                # Role details
│   └── create/
│       └── page.tsx                # Create role form
│
├── users/
│   ├── page.tsx                    # Enhanced users list
│   └── [userId]/
│       ├── page.tsx                # User details
│       ├── roles/
│       │   └── page.tsx            # User role management
│       └── permissions/
│           └── page.tsx            # User permissions view

components/admin/
├── RoleForm.tsx                    # Create/Edit role form
├── RoleCard.tsx                    # Role display card
├── UserRoleAssignment.tsx          # Role assignment modal
├── PermissionEditor.tsx            # Permission configuration UI
├── PermissionMatrix.tsx            # Permission matrix view
├── EffectivePermissions.tsx        # Display merged permissions
└── ExpiringRolesAlert.tsx          # Dashboard alert widget

store/api/
├── roleApi.ts                      # Role management endpoints
└── userApi.ts                      # Update with role endpoints
```

---

## UI Components Checklist

### shadcn/ui Components to Use:
- ✅ Card, CardContent, CardHeader
- ✅ Button, Badge
- ✅ Input, Label, Textarea
- ✅ Select (multi-select for roles)
- ✅ Dialog/Modal
- ✅ Accordion (for permission groups)
- ✅ Checkbox (for permissions)
- ✅ Switch (for active status)
- ✅ Calendar/DatePicker (for expiration)
- ✅ Alert (for warnings)
- ✅ Tabs (for organizing content)
- ✅ Table/DataTable (for lists)

---

## API Integration Flow

### Example: Assign Multiple Roles to User

```typescript
// 1. Fetch available roles
const { data: roles } = useGetRolesQuery();

// 2. User selects roles in multi-select
const selectedRoleIds = ['role_123', 'role_456'];

// 3. Submit assignment
await assignRolesToUser({
  userId: 'usr_123',
  data: {
    roleIds: selectedRoleIds,
    expiresAt: '2025-07-01T00:00:00Z' // optional
  }
}).unwrap();

// 4. Refresh user roles
refetch();

// 5. Show success toast
toast.success('Roles assigned successfully');
```

---

## Testing Scenarios

### Scenario 1: Create Procurement Manager Role
1. Navigate to Roles page
2. Click "Create Role"
3. Enter role name, description
4. Select permissions for tenders, vendors, bids
5. Save role
6. Verify role appears in list

### Scenario 2: Assign Admin + User Dual Role
1. Navigate to Users page
2. Select user "Bob"
3. Click "Edit Roles"
4. Add both ADMIN and USER roles
5. Save assignment
6. Verify user has both roles
7. Check effective permissions show union of both

### Scenario 3: Temporary Project Lead
1. Navigate to user "Alice"
2. Click "Edit Roles"
3. Add PROJECT_LEAD role
4. Set expiration date to 6 months from now
5. Save
6. Verify expiration date is shown
7. Dashboard shows warning when expiring soon

### Scenario 4: Remove Role from User
1. Navigate to user with multiple roles
2. Click "Edit Roles"
3. Click remove button on one role
4. Confirm removal
5. Verify role is removed
6. Check effective permissions are updated

---

## Implementation Timeline

**Note**: Backend RBAC system is fully implemented. This timeline covers FRONTEND UI development only.

| Phase | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| **Phase 1** | Create `roleApi.ts` with all endpoints | 2 days | None |
| | Add TypeScript interfaces | 0.5 days | |
| | Add to RTK Query setup | 0.5 days | |
| **Phase 2** | Build Roles List Page | 1 day | Phase 1 |
| | Build Role Create/Edit Form | 1 day | Phase 1 |
| | Permission Editor Component | 1 day | Phase 1 |
| **Phase 3** | Update Users List Page | 1 day | Phase 1 |
| | User Role Assignment Modal | 1.5 days | Phase 1 |
| | User Permissions View | 1 day | Phase 1 |
| **Phase 4** | Role Details Page | 1.5 days | Phase 2 |
| | Assigned Users List | 0.5 days | Phase 3 |
| **Phase 5** | Permission Matrix View | 1 day | Phase 2, 3 |
| | Role Templates | 1 day | Phase 2 |
| | Expiring Roles Alert | 1 day | Phase 3 |
| **Testing** | Integration testing | 2 days | All phases |
| | Bug fixes and polish | 1 day | All phases |

**Total Estimated Time: 2.5 - 3 weeks**

---

## Priority Implementation Order

### High Priority (MVP):
1. ✅ Role API integration (`roleApi.ts`)
2. ✅ Roles List Page with CRUD
3. ✅ User Role Assignment (multi-select)
4. ✅ Basic permission editor

### Medium Priority:
5. Role Details Page
6. User Permissions View
7. Enhanced permission editor (checkboxes)

### Low Priority (Nice to Have):
8. Permission Matrix
9. Role Templates
10. Expiring Roles Dashboard Widget

---

## Notes & Considerations

### 1. Backward Compatibility
- Keep existing `User.role` field for compatibility
- New system uses `user_roles` junction table
- Both systems can coexist during migration

### 2. Permission Merging Strategy
- When user has multiple roles, use **union** strategy
- All permissions from all roles are combined
- No permission conflicts (additive only)

### 3. UX Guidelines
- Always show currently assigned roles clearly
- Display effective permissions after role changes
- Warn before deleting roles that have users
- Show role expiration warnings prominently

### 4. Performance Considerations
- Cache roles list (changes infrequently)
- Lazy load user permissions view
- Paginate users list when > 50 users
- Debounce search inputs

### 5. Security
- Only ADMIN can manage roles
- Audit log all role assignments/removals
- Validate role permissions on backend
- Prevent self-removal of ADMIN role

---

## Success Criteria

- ✅ Admin can create custom roles with permissions
- ✅ Admin can assign multiple roles to users
- ✅ User can have ADMIN + USER roles simultaneously
- ✅ Role assignments can have expiration dates
- ✅ Effective permissions are calculated correctly
- ✅ UI is intuitive and follows existing design patterns
- ✅ All CRUD operations work without errors
- ✅ Performance is acceptable (< 2s page loads)

---

## Next Steps

1. **Review and approve this plan**
2. **Phase 1**: Start with `roleApi.ts` implementation
3. **Phase 2**: Build Roles management UI
4. **Phase 3**: Enhance User management with role assignment
5. **Testing**: End-to-end testing of all features
6. **Deployment**: Roll out to production with migration guide
