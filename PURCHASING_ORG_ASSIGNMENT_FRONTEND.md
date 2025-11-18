# Purchasing Organization Assignment - Frontend Requirements

## Overview

This document specifies the frontend requirements for managing Purchasing Organization Assignments in the e-procurement system. This feature allows administrators to link purchasing organizations to company codes or plants, establishing organizational responsibilities for procurement activities.

---

## Business Context

In SAP-style procurement, a **Purchasing Organization (POrg)** is assigned to either:
- **Company Code level** - POrg handles procurement for the entire company
- **Plant level** - POrg handles procurement for a specific plant only

This assignment determines which purchasing org is responsible for creating purchase orders, managing vendors, and conducting procurement for different organizational units.

---

## Backend API Reference

### Base URL
`/api/v1/:tenant/org`

### Endpoints

#### 1. List Assignments
```http
GET /porg-assignments?purchasingOrgId={optional}
```

**Response:**
```json
[
  {
    "id": "cm123...",
    "tenantId": "tenant123",
    "purchasingOrgId": "porg123",
    "companyCodeId": "cc123",
    "plantId": null,
    "createdAt": "2024-01-15T10:00:00Z",
    "purchasingOrg": {
      "id": "porg123",
      "code": "PO1",
      "name": "Main Purchasing Org"
    },
    "companyCode": {
      "id": "cc123",
      "code": "1000",
      "name": "ACME Corporation"
    },
    "plant": null
  },
  {
    "id": "cm456...",
    "tenantId": "tenant123",
    "purchasingOrgId": "porg123",
    "companyCodeId": null,
    "plantId": "plant456",
    "createdAt": "2024-01-15T11:00:00Z",
    "purchasingOrg": {
      "id": "porg123",
      "code": "PO1",
      "name": "Main Purchasing Org"
    },
    "companyCode": null,
    "plant": {
      "id": "plant456",
      "code": "P001",
      "name": "Manufacturing Plant 1"
    }
  }
]
```

#### 2. Create Assignment
```http
POST /porg-assignments
Content-Type: application/json

{
  "purchasingOrgId": "porg123",
  "companyCodeId": "cc123"  // OR plantId, not both
}
```

**Validation Rules:**
- ✅ Must provide **either** `companyCodeId` OR `plantId` (exclusive)
- ❌ Cannot provide both
- ❌ Cannot provide neither
- Backend validates IDs exist

**Response:** Created assignment object

#### 3. Delete Assignment
```http
DELETE /porg-assignments/:id
```

#### 4. Get Purchasing Orgs (for dropdown)
```http
GET /purchasing-orgs?q={optional_search}
```

#### 5. Get Company Codes (for dropdown)
```http
GET /company-codes?q={optional_search}
```

#### 6. Get Plants (for dropdown)
```http
GET /plants?companyCodeId={optional_filter}
```

---

## Page Structure

### Location
**Path:** `/admin/configuration/organization/purchasing-orgs`

Add a new tab or section called **"Assignments"** to the existing Purchasing Orgs page.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Purchasing Organizations                                    │
├─────────────────────────────────────────────────────────────┤
│  [ List ]  [ Groups ]  [ Assignments* ]                      │ ← Tabs
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Purchasing Org Assignments                                  │
│  Link purchasing organizations to company codes or plants    │
│                                                               │
│  [ + Assign Purchasing Org ]                    [ Filter ⌄ ] │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Purchasing Org │ Assigned To          │ Type    │ ⋮   │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ PO1           │ 1000 - ACME Corp     │ Company │ ⋮   │  │
│  │ Main Purch... │                      │ Code    │     │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ PO1           │ P001 - Plant 1       │ Plant   │ ⋮   │  │
│  │ Main Purch... │                      │         │     │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ PO2           │ 2000 - ACME US       │ Company │ ⋮   │  │
│  │ Regional Pur..│                      │ Code    │     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Showing 3 of 3 assignments                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## UI Components

### 1. Assignment List Table

**Columns:**
- **Purchasing Org** - Display `code - name`
- **Assigned To** - Display assigned entity (company code or plant) with `code - name`
- **Type** - Badge showing "Company Code" or "Plant"
- **Actions** - Delete button (trash icon)

**Features:**
- ✅ Filter by Purchasing Org (dropdown)
- ✅ Search across all fields
- ✅ Sort by any column
- ✅ Empty state when no assignments

**Empty State:**
```
┌─────────────────────────────────────────┐
│                                         │
│           📋                            │
│                                         │
│   No purchasing org assignments yet     │
│                                         │
│   Create your first assignment to link  │
│   purchasing organizations to company   │
│   codes or plants.                      │
│                                         │
│   [ + Assign Purchasing Org ]           │
│                                         │
└─────────────────────────────────────────┘
```

### 2. Create Assignment Dialog/Modal

**Title:** Assign Purchasing Organization

**Form Fields:**

```
┌──────────────────────────────────────────────────────┐
│  Assign Purchasing Organization              [ × ]   │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Purchasing Organization *                           │
│  ┌────────────────────────────────────────────┐     │
│  │ Select purchasing org...              ⌄   │     │
│  └────────────────────────────────────────────┘     │
│                                                       │
│  Assignment Type *                                   │
│  ┌────────────────┐ ┌────────────────┐             │
│  │ ◉ Company Code │ │ ○ Plant        │             │
│  └────────────────┘ └────────────────┘             │
│                                                       │
│  Company Code *                                      │
│  ┌────────────────────────────────────────────┐     │
│  │ Select company code...                ⌄   │     │
│  └────────────────────────────────────────────┘     │
│                                                       │
│  ───────────────────────────────────────────────    │
│                                                       │
│  [ Cancel ]                          [ Assign ]      │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Business Logic:**

1. **Purchasing Org Selection**
   - Dropdown/select with search
   - Display format: `code - name`
   - Required field

2. **Assignment Type Toggle**
   - Radio buttons: "Company Code" or "Plant"
   - Default: "Company Code"
   - Changes which field appears below

3. **Company Code Selection** (if type = Company Code)
   - Dropdown/select with search
   - Display format: `code - name`
   - Required if Company Code is selected
   - Load from `GET /company-codes`

4. **Plant Selection** (if type = Plant)
   - Dropdown/select with search
   - Display format: `code - name`
   - Required if Plant is selected
   - Load from `GET /plants`
   - Optional: Filter plants by selected company code

**Validation:**
- ✅ All fields required
- ✅ Cannot submit empty form
- ✅ Show error if assignment already exists (duplicate)
- ✅ Handle API errors gracefully

**Success:**
- Close modal
- Refresh assignment list
- Show success toast: "Assignment created successfully"

### 3. Delete Confirmation

**Dialog:**
```
┌─────────────────────────────────────────┐
│  Delete Assignment                      │
├─────────────────────────────────────────┤
│                                         │
│  Are you sure you want to delete this   │
│  assignment?                            │
│                                         │
│  • PO1 - Main Purchasing Org            │
│  • Assigned to: 1000 - ACME Corp        │
│                                         │
│  This action cannot be undone.          │
│                                         │
│  [ Cancel ]            [ Delete ]       │
│                                         │
└─────────────────────────────────────────┘
```

**Success:**
- Remove from list (optimistic update)
- Show success toast: "Assignment deleted successfully"

---

## Component Specification

### React Component Structure (Example)

```typescript
// Page component
<PurchasingOrgAssignmentsPage>
  <PageHeader 
    title="Purchasing Org Assignments"
    description="Link purchasing organizations to company codes or plants"
    action={<CreateAssignmentButton />}
  />
  
  <FilterBar>
    <PurchasingOrgFilter />
    <SearchInput />
  </FilterBar>
  
  <AssignmentsTable 
    data={assignments}
    onDelete={handleDelete}
  />
  
  <CreateAssignmentModal 
    open={isModalOpen}
    onClose={handleClose}
    onSubmit={handleCreate}
  />
</PurchasingOrgAssignmentsPage>
```

### Key Functions

```typescript
// Fetch assignments
const fetchAssignments = async (purchasingOrgId?: string) => {
  const params = purchasingOrgId ? `?purchasingOrgId=${purchasingOrgId}` : '';
  const response = await api.get(`/org/porg-assignments${params}`);
  return response.data;
};

// Create assignment
const createAssignment = async (data: {
  purchasingOrgId: string;
  companyCodeId?: string;
  plantId?: string;
}) => {
  const response = await api.post('/org/porg-assignments', data);
  return response.data;
};

// Delete assignment
const deleteAssignment = async (id: string) => {
  await api.delete(`/org/porg-assignments/${id}`);
};

// Get reference data
const getPurchasingOrgs = async () => {
  const response = await api.get('/org/purchasing-orgs');
  return response.data;
};

const getCompanyCodes = async () => {
  const response = await api.get('/org/company-codes');
  return response.data;
};

const getPlants = async (companyCodeId?: string) => {
  const params = companyCodeId ? `?companyCodeId=${companyCodeId}` : '';
  const response = await api.get(`/org/plants${params}`);
  return response.data;
};
```

---

## State Management

### Local State (React Query / SWR recommended)

```typescript
// Queries
const { data: assignments } = useQuery('assignments', fetchAssignments);
const { data: purchasingOrgs } = useQuery('purchasingOrgs', getPurchasingOrgs);
const { data: companyCodes } = useQuery('companyCodes', getCompanyCodes);
const { data: plants } = useQuery('plants', getPlants);

// Mutations
const createMutation = useMutation(createAssignment, {
  onSuccess: () => {
    queryClient.invalidateQueries('assignments');
    toast.success('Assignment created successfully');
  },
  onError: (error) => {
    toast.error(error.message);
  }
});

const deleteMutation = useMutation(deleteAssignment, {
  onSuccess: () => {
    queryClient.invalidateQueries('assignments');
    toast.success('Assignment deleted successfully');
  }
});
```

---

## User Permissions

**Required Role:** `ADMIN` or RBAC `Admin`

All assignment management operations require admin privileges. The page should:
- ✅ Be accessible only to admin users
- ✅ Hide/disable create/delete buttons for non-admins (defense in depth)
- ✅ Show proper error messages if unauthorized

---

## Responsive Design

### Desktop (≥1024px)
- Full table with all columns
- Modal: 600px width, centered

### Tablet (768px - 1023px)
- Condensed table (hide Type column, show in row expansion)
- Modal: 90vw width

### Mobile (<768px)
- Card-based layout instead of table
- Full-screen modal/drawer

**Card Layout Example:**
```
┌─────────────────────────────────┐
│ PO1 - Main Purchasing Org       │
│ → 1000 - ACME Corporation       │
│ Company Code                     │
│                       [ Delete ] │
└─────────────────────────────────┘
```

---

## Error Handling

### Validation Errors
- Show inline errors below each field
- Highlight invalid fields in red
- Disable submit button until form is valid

### API Errors

**Common Errors:**

1. **Duplicate Assignment**
   ```
   ⚠️ This assignment already exists
   ```

2. **Invalid Reference**
   ```
   ❌ Selected company code no longer exists
   ```

3. **Network Error**
   ```
   ❌ Unable to save assignment. Please check your connection.
   [ Retry ]
   ```

4. **Permission Denied**
   ```
   ❌ You don't have permission to manage assignments
   ```

---

## Testing Checklist

### Functional Tests
- [ ] List displays all assignments
- [ ] Create assignment with company code
- [ ] Create assignment with plant
- [ ] Cannot create duplicate assignment
- [ ] Filter by purchasing org works
- [ ] Search filters results
- [ ] Delete assignment removes it
- [ ] Delete confirmation shows correct details
- [ ] Form validation prevents invalid submissions
- [ ] API errors are handled gracefully

### UI Tests
- [ ] Empty state displays correctly
- [ ] Loading states show while fetching
- [ ] Modal opens and closes
- [ ] Radio button toggle switches fields
- [ ] Dropdowns are searchable
- [ ] Table sorts correctly
- [ ] Responsive layout works on mobile

### Permission Tests
- [ ] Admin can access page
- [ ] RBAC Admin can access page
- [ ] Non-admin users are blocked
- [ ] Unauthorized API calls show error

---

## Implementation Priority

### Phase 1 - MVP (Required)
1. ✅ Basic table listing assignments
2. ✅ Create assignment modal
3. ✅ Delete functionality
4. ✅ Form validation

### Phase 2 - Enhanced (Nice to have)
5. ⭐ Filter by purchasing org
6. ⭐ Search functionality
7. ⭐ Bulk operations
8. ⭐ Export to CSV

---

## Design Reference

Follow existing admin portal patterns:
- Use same table component as Users, Roles pages
- Use same modal/dialog component
- Use same form controls (shadcn/ui recommended)
- Match color scheme and spacing
- Reuse loading/error components

---

## API Integration Example

```typescript
// services/orgStructure.ts

export const assignmentService = {
  // List all assignments
  list: async (filters?: { purchasingOrgId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.purchasingOrgId) {
      params.append('purchasingOrgId', filters.purchasingOrgId);
    }
    
    const { data } = await apiClient.get(
      `/org/porg-assignments?${params}`
    );
    return data;
  },

  // Create new assignment
  create: async (payload: {
    purchasingOrgId: string;
    companyCodeId?: string;
    plantId?: string;
  }) => {
    const { data } = await apiClient.post('/org/porg-assignments', payload);
    return data;
  },

  // Delete assignment
  delete: async (id: string) => {
    await apiClient.delete(`/org/porg-assignments/${id}`);
  },

  // Get reference data
  getPurchasingOrgs: async () => {
    const { data } = await apiClient.get('/org/purchasing-orgs');
    return data;
  },

  getCompanyCodes: async () => {
    const { data } = await apiClient.get('/org/company-codes');
    return data;
  },

  getPlants: async (companyCodeId?: string) => {
    const params = companyCodeId 
      ? `?companyCodeId=${companyCodeId}` 
      : '';
    const { data } = await apiClient.get(`/org/plants${params}`);
    return data;
  }
};
```

---

## Summary

**Feature:** Purchasing Organization Assignment Management

**Purpose:** Allow admins to link purchasing organizations to company codes or plants

**Backend:** ✅ Complete (API exists)

**Frontend:** ❌ Missing (needs to be built)

**Complexity:** Low-Medium
- Standard CRUD operations
- Simple form with radio toggle
- No complex business logic on frontend

**Estimated Effort:** 4-6 hours for MVP

**Dependencies:**
- Access to existing Purchasing Orgs page
- API client configured
- Admin authentication working (✅ Fixed)

---

## Questions / Clarifications Needed

1. Should we allow bulk deletion of assignments?
2. Should we show history/audit trail of who created/deleted assignments?
3. Do we need to prevent deletion if the assignment is in use (e.g., linked to POs)?
4. Should we validate that a company code doesn't already have another POrg assigned?

---

**Document Version:** 1.0  
**Last Updated:** 2024-11-18  
**Status:** Ready for Implementation
