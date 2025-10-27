# Implementation Plan - E-Procurement Vendor Portal

## Issues Identified

### 1. **404 Errors on Missing Routes**
The following menu items result in 404 errors:
- `/vendor/contracts`
- `/vendor/quotations`
- `/vendor/documents`
- `/vendor/invoices`
- `/vendor/payments`

**Root Cause**: These routes don't have corresponding page components in the app directory.

### 2. **Authentication Redirect Issue**
After navigating back from 404 pages, users are redirected to login.

**Root Cause**: The middleware/auth logic may be clearing authentication state on navigation errors.

### 3. **No Role-Based Routing**
Currently, all users (including ADMIN) are redirected to `/vendor/dashboard`.

**Root Cause**: 
- Middleware doesn't implement role-based route protection
- No separate admin dashboard routes exist
- User roles (ADMIN, BUYER, MANAGER, FINANCE, USER, VENDOR) are not being used for routing decisions

### 4. **Missing Admin Configuration UI**
No configuration interface exists for ADMIN role to manage:
- Tenant provisioning
- Organizational structure (Company Codes, Plants, Storage Locations)
- Purchasing organizations and groups
- Master data (currencies, vendors)
- User management
- Process configurations

### 5. **Missing Transaction Workflow UI**
No UI implementation for:
- Procurement workflows (Contract → PR → PO → GR → Invoice → Payment)
- Tender workflows (Create → Publish → Bid → Evaluate → Award)
- Invoice and payment processing

---

## Implementation Strategy

### Phase 1: Missing Vendor Pages (Priority: HIGH)
Create the missing vendor-facing pages to fix 404 errors.

### Phase 2: Role-Based Authentication & Routing (Priority: HIGH)
Implement proper role detection and routing logic.

### Phase 3: Admin Configuration UI (Priority: MEDIUM)
Build comprehensive admin dashboard based on CONFIGURATION_PROCESS_FLOW.md.

### Phase 4: Transaction Workflows (Priority: MEDIUM)
Implement procurement and tender workflow pages based on TRANSACTION_PROCESS_FLOW.md.

### Phase 5: Testing & Polish (Priority: LOW)
End-to-end testing, refinements, and documentation.

---

## Detailed Implementation Plan

## Phase 1: Fix Missing Vendor Pages

### 1.1 Create Contracts Page
**File**: `app/vendor/contracts/page.tsx`

**Features**:
- List all vendor contracts (ACTIVE, COMPLETED, TERMINATED, SUSPENDED)
- View contract details
- Download contract documents
- Track milestones

**API Endpoint**: `GET /{tenant}/contracts` (from vendor's perspective)

### 1.2 Create Quotations Page
**File**: `app/vendor/quotations/page.tsx`

**Features**:
- View quotation requests
- Submit quotations
- Track quotation status (DRAFT, SUBMITTED, ACCEPTED, REJECTED)
- Manage pricing and terms

**API Endpoint**: `GET /{tenant}/quotations` (vendor-specific)

### 1.3 Create Documents Page
**File**: `app/vendor/documents/page.tsx`

**Features**:
- Document library with categories
- Upload/download documents
- Document version control
- Search and filter documents

**API Endpoint**: `GET /{tenant}/documents` (vendor-specific)

### 1.4 Create Invoices Page
**File**: `app/vendor/invoices/page.tsx`

**Features**:
- List invoices (PENDING_APPROVAL, APPROVED, PAID, REJECTED)
- Create new invoices from POs
- View invoice details and payment status
- Download invoice PDFs

**API Endpoint**: `GET /{tenant}/invoices`, `POST /{tenant}/invoices`

### 1.5 Create Payments Page
**File**: `app/vendor/payments/page.tsx`

**Features**:
- View payment history
- Track payment status (SCHEDULED, COMPLETED, FAILED)
- Payment details and transaction IDs
- Download payment receipts

**API Endpoint**: `GET /{tenant}/payments` (vendor-specific)

---

## Phase 2: Role-Based Authentication & Routing

### 2.1 Update Type Definitions
**File**: `types/index.ts`

**Changes**:
- Expand `User.role` to include all roles: `'ADMIN' | 'USER' | 'BUYER' | 'MANAGER' | 'FINANCE' | 'VENDOR'`
- Add `abilities` array to User type for permission management
- Add role-based permission types

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'BUYER' | 'MANAGER' | 'FINANCE' | 'VENDOR';
  companyId?: string;
  avatar?: string;
  abilities?: Ability[];
}

export interface Ability {
  actions: string[];
  subjects: string[];
  conditions?: Record<string, any>;
}
```

### 2.2 Enhance Middleware
**File**: `middleware.ts`

**Changes**:
- Add role-based route protection
- Implement route prefixes per role:
  - `/admin/*` → ADMIN only
  - `/buyer/*` → BUYER, MANAGER, ADMIN
  - `/vendor/*` → VENDOR only
  - `/finance/*` → FINANCE, ADMIN
- Redirect to appropriate dashboard based on role after login

### 2.3 Create Role-Based Route Guards
**New File**: `lib/auth/guards.ts`

**Features**:
- `requireAdmin()` - Protects admin routes
- `requireBuyer()` - Protects buyer routes
- `requireVendor()` - Protects vendor routes
- `requireFinance()` - Protects finance routes
- Role hierarchy support (ADMIN can access all)

### 2.4 Update Authentication Flow
**File**: `store/api/authApi.ts`

**Changes**:
- Parse user role from login response
- Store role in Redux state
- Implement `getRoleBasedRedirect()` function:
  - ADMIN → `/admin/dashboard`
  - BUYER → `/buyer/dashboard`
  - MANAGER → `/buyer/dashboard`
  - FINANCE → `/finance/dashboard`
  - USER → `/buyer/dashboard`
  - VENDOR → `/vendor/dashboard`

### 2.5 Create Dashboard Redirector
**File**: `app/page.tsx` or `app/dashboard/page.tsx`

**Logic**:
```typescript
// Check user role and redirect
if (user.role === 'ADMIN') redirect('/admin/dashboard');
if (user.role === 'VENDOR') redirect('/vendor/dashboard');
if (['BUYER', 'MANAGER', 'USER'].includes(user.role)) redirect('/buyer/dashboard');
if (user.role === 'FINANCE') redirect('/finance/dashboard');
```

---

## Phase 3: Admin Configuration UI

### 3.1 Admin Dashboard Structure

```
app/admin/
├── layout.tsx                    # Admin layout with navigation
├── dashboard/
│   └── page.tsx                 # Admin overview dashboard
├── tenant/
│   ├── page.tsx                 # Tenant management
│   └── [id]/
│       └── page.tsx             # Tenant details
├── configuration/
│   ├── page.tsx                 # Configuration overview
│   ├── basis/
│   │   └── page.tsx             # Basis configuration (org structure, processes)
│   ├── organization/
│   │   ├── company-codes/
│   │   │   ├── page.tsx         # List company codes
│   │   │   └── [id]/page.tsx   # Edit company code
│   │   ├── plants/
│   │   │   ├── page.tsx         # List plants
│   │   │   └── [id]/page.tsx   # Edit plant
│   │   ├── storage-locations/
│   │   │   ├── page.tsx         # List storage locations
│   │   │   └── [id]/page.tsx   # Edit storage location
│   │   ├── purchasing-orgs/
│   │   │   ├── page.tsx         # List purchasing orgs
│   │   │   └── [id]/page.tsx   # Edit purchasing org
│   │   └── purchasing-groups/
│   │       ├── page.tsx         # List purchasing groups
│   │       └── [id]/page.tsx   # Edit purchasing group
│   └── master-data/
│       ├── currencies/
│       │   └── page.tsx         # Manage currencies
│       └── vendors/
│           ├── page.tsx         # Vendor management
│           └── [id]/page.tsx   # Vendor details
├── users/
│   ├── page.tsx                 # User management
│   ├── create/page.tsx          # Create user
│   └── [id]/
│       └── page.tsx             # Edit user
├── roles/
│   └── page.tsx                 # Role & permission management
└── validation/
    └── page.tsx                 # Configuration validation tool
```

### 3.2 Admin Navigation
**File**: `config/navigation.ts`

Add admin navigation configuration:
```typescript
export const adminNavigation: NavSection[] = [
  {
    section: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    ],
  },
  {
    section: 'Configuration',
    items: [
      { id: 'tenant', label: 'Tenant Management', icon: Building, href: '/admin/tenant' },
      { id: 'basis', label: 'Basis Configuration', icon: Settings, href: '/admin/configuration/basis' },
      { id: 'organization', label: 'Organization', icon: Sitemap, href: '/admin/configuration/organization/company-codes' },
      { id: 'master-data', label: 'Master Data', icon: Database, href: '/admin/configuration/master-data/currencies' },
      { id: 'users', label: 'User Management', icon: Users, href: '/admin/users' },
      { id: 'roles', label: 'Roles & Permissions', icon: Shield, href: '/admin/roles' },
    ],
  },
  {
    section: 'Tools',
    items: [
      { id: 'validation', label: 'Configuration Validation', icon: CheckCircle, href: '/admin/validation' },
    ],
  },
];
```

### 3.3 Key Admin Components

#### Tenant Provisioning Component
**File**: `components/admin/TenantProvisioning.tsx`

**Features**:
- Form to create new tenant
- Fields: name, subdomain, region, timezone, features
- Admin user creation
- Real-time subdomain availability check

**API**: `POST /{API_PREFIX}/tenants`

#### Basis Configuration Component
**File**: `components/admin/BasisConfiguration.tsx`

**Features**:
- Org structure configuration (levels, cross-plant procurement)
- Business variants setup
- Approval limits configuration
- Financial year setup
- Process configuration (workflow steps, roles, actions)

**API**: `POST /{API_PREFIX}/{tenant}/config/basis`

#### Organizational Hierarchy Component
**File**: `components/admin/OrganizationalHierarchy.tsx`

**Features**:
- Tree view of Company Codes → Plants → Storage Locations
- Purchasing Organizations → Purchasing Groups
- Drag-and-drop to reorganize
- Quick add/edit/delete actions

**APIs**:
- `GET /{API_PREFIX}/{tenant}/org/company-codes`
- `POST /{API_PREFIX}/{tenant}/org/company-codes`
- `POST /{API_PREFIX}/{tenant}/org/plants`
- `POST /{API_PREFIX}/{tenant}/org/storage-locations`
- `POST /{API_PREFIX}/{tenant}/org/purchasing-orgs`
- `POST /{API_PREFIX}/{tenant}/org/purchasing-groups`

#### User Management Component
**File**: `components/admin/UserManagement.tsx`

**Features**:
- User list with filters (role, status)
- Create user with role assignment
- Edit user details and permissions
- Deactivate/activate users
- Role-based ability assignment

**APIs**:
- `GET /{API_PREFIX}/{tenant}/users`
- `POST /{API_PREFIX}/{tenant}/auth/register`
- `PUT /{API_PREFIX}/{tenant}/users/{id}`

#### Configuration Validation Component
**File**: `components/admin/ConfigurationValidation.tsx`

**Features**:
- Validate master data references
- Check org structure consistency
- Display validation errors and warnings
- Suggest fixes for common issues

**API**: `POST /{API_PREFIX}/{tenant}/master-data/validate`

---

## Phase 4: Transaction Workflow UI

### 4.1 Buyer/Manager Dashboard Structure

```
app/buyer/
├── layout.tsx                   # Buyer layout
├── dashboard/
│   └── page.tsx                # Buyer overview
├── procurement/
│   ├── contracts/
│   │   ├── page.tsx            # List contracts
│   │   └── [id]/
│   │       ├── page.tsx        # Contract details
│   │       └── initiate/page.tsx # Initiate procurement from contract
│   ├── purchase-requisitions/
│   │   ├── page.tsx            # List PRs
│   │   ├── create/page.tsx     # Create PR
│   │   └── [id]/
│   │       ├── page.tsx        # PR details
│   │       └── approve/page.tsx # Approve/reject PR
│   ├── purchase-orders/
│   │   ├── page.tsx            # List POs
│   │   ├── create/page.tsx     # Create PO from PR
│   │   └── [id]/
│   │       ├── page.tsx        # PO details
│   │       ├── approve/page.tsx # Approve PO
│   │       └── goods-receipt/page.tsx # Create goods receipt
│   └── tenders/
│       ├── page.tsx            # List tenders
│       ├── create/page.tsx     # Create tender
│       └── [id]/
│           ├── page.tsx        # Tender details
│           ├── publish/page.tsx # Publish tender
│           ├── close/page.tsx  # Close tender
│           ├── evaluate/page.tsx # Evaluate bids
│           └── award/page.tsx  # Award tender
├── vendors/
│   ├── page.tsx                # Vendor management
│   └── [id]/page.tsx           # Vendor details
└── reports/
    └── page.tsx                # Reports and analytics
```

### 4.2 Finance Dashboard Structure

```
app/finance/
├── layout.tsx                  # Finance layout
├── dashboard/
│   └── page.tsx               # Finance overview
├── invoices/
│   ├── page.tsx               # List invoices
│   └── [id]/
│       ├── page.tsx           # Invoice details
│       └── approve/page.tsx   # Approve/reject invoice
├── payments/
│   ├── page.tsx               # List payments
│   ├── create/page.tsx        # Create payment
│   └── [id]/page.tsx          # Payment details
└── reports/
    ├── purchase-orders/page.tsx # PO statistics
    └── tenders/page.tsx        # Tender statistics
```

### 4.3 Key Workflow Components

#### Procurement Workflow Component
**File**: `components/workflows/ProcurementWorkflow.tsx`

**Features**:
- Visual workflow progress indicator
- Step-by-step status (CREATE_PR → APPROVE_PR → CREATE_PO → APPROVE_PO → GOODS_RECEIPT → INVOICE → PAYMENT)
- Related documents navigation
- Timeline view

**API**: `GET /{tenant}/workflows/status/{entityType}/{entityId}`

#### Purchase Requisition Form
**File**: `components/procurement/PurchaseRequisitionForm.tsx`

**Features**:
- Multi-item PR creation
- Item specifications
- Budget allocation
- Justification and approval routing

**API**: `POST /{tenant}/workflows/procurement/create-pr/{contractId}`

#### Tender Creation Wizard
**File**: `components/tenders/TenderCreationWizard.tsx`

**Features**:
- Multi-step wizard (Details → Requirements → Criteria → Review)
- Requirements builder (technical, commercial, compliance)
- Scoring criteria configuration
- Document attachment

**API**: `POST /{tenant}/workflows/tender/create/{contractId}`

#### Bid Evaluation Component
**File**: `components/tenders/BidEvaluation.tsx`

**Features**:
- Side-by-side bid comparison
- Scoring interface (technical, commercial, experience)
- Comments and notes
- Ranking calculation

**API**: `POST /{tenant}/workflows/tender/evaluate-bid/{bidId}`

#### Invoice Management Component
**File**: `components/finance/InvoiceManagement.tsx`

**Features**:
- Invoice list with filters
- Match invoice to PO and GR
- Approval workflow
- Payment scheduling

**APIs**:
- `GET /{tenant}/invoices`
- `PUT /{tenant}/invoices/{invoiceId}/approve`

#### Payment Processing Component
**File**: `components/finance/PaymentProcessing.tsx`

**Features**:
- Payment creation from approved invoices
- Bank details management
- Payment method selection
- Transaction tracking

**API**: `POST /{tenant}/payments`

---

## Phase 5: API Integration

### 5.1 Create RTK Query API Slices

#### Admin Configuration API
**File**: `store/api/adminApi.ts`

**Endpoints**:
- `createTenant`
- `createBasisConfiguration`
- `createCompanyCode`
- `createPlant`
- `createStorageLocation`
- `createPurchasingOrg`
- `createPurchasingGroup`
- `createCurrency`
- `createVendor`
- `validateMasterData`
- `getOrganizationalHierarchy`

#### Procurement Workflow API
**File**: `store/api/workflowApi.ts`

**Endpoints**:
- `initiateProcurement`
- `createPurchaseRequisition`
- `approvePurchaseRequisition`
- `createPurchaseOrder`
- `approvePurchaseOrder`
- `createGoodsReceipt`
- `getWorkflowStatus`

#### Tender Workflow API
**File**: `store/api/tenderWorkflowApi.ts`

**Endpoints**:
- `createTender`
- `publishTender`
- `submitBid` (vendor)
- `closeTender`
- `evaluateBid`
- `awardTender`

#### Finance API
**File**: `store/api/financeApi.ts`

**Endpoints**:
- `getInvoices`
- `createInvoice`
- `approveInvoice`
- `getPayments`
- `createPayment`
- `getPurchaseOrderStatistics`
- `getTenderStatistics`

### 5.2 Update Base API Configuration
**File**: `store/api/baseApi.ts`

**Changes**:
- Add tenant header injection: `x-tenant: {tenant}`
- Handle role-based authorization errors
- Token refresh logic
- Multi-tenant URL construction: `{API_PREFIX}/{tenant}/{endpoint}`

---

## Phase 6: Testing & Quality Assurance

### 6.1 Unit Tests
- Component rendering tests
- Form validation tests
- Redux state management tests
- API integration tests (mocked)

### 6.2 Integration Tests
- Role-based routing flows
- Workflow state transitions
- API communication
- Authentication and authorization

### 6.3 E2E Tests
- Admin tenant provisioning flow
- Buyer procurement workflow (Contract → PR → PO → GR)
- Vendor tender submission flow
- Finance invoice approval and payment flow

### 6.4 Accessibility Testing
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management

---

## Technical Considerations

### 1. Multi-Tenancy
- Tenant resolution from subdomain or header (`x-tenant`)
- Tenant-specific data isolation
- Tenant-aware API requests

### 2. Role-Based Access Control (RBAC)
- Implement ability-based permissions (CASL.js or custom)
- Guard routes and components by role/permission
- Dynamic navigation based on user abilities

### 3. State Management
- Redux Toolkit for global state
- RTK Query for server state and caching
- Local state for UI components

### 4. Form Handling
- React Hook Form for complex forms
- Yup/Zod for validation schemas
- File upload with progress tracking

### 5. Real-time Updates
- WebSocket integration for workflow updates
- Notification system for status changes
- Optimistic UI updates

### 6. Error Handling
- Global error boundary
- API error handling with retry logic
- User-friendly error messages
- Error logging and monitoring

### 7. Performance
- Code splitting by route
- Lazy loading for heavy components
- Memoization for expensive calculations
- Virtual scrolling for large lists

---

## Implementation Timeline

### Week 1-2: Phase 1 - Missing Vendor Pages
- Create all missing vendor pages (contracts, quotations, documents, invoices, payments)
- Implement basic UI with mock data
- Add to navigation

### Week 3-4: Phase 2 - Role-Based Routing
- Update middleware and auth logic
- Implement role guards
- Create role-specific dashboards
- Test authentication flows

### Week 5-8: Phase 3 - Admin Configuration UI
- Build admin dashboard structure
- Implement tenant provisioning
- Create organizational hierarchy management
- Build master data configuration
- Implement user management
- Add configuration validation

### Week 9-12: Phase 4 - Transaction Workflows
- Build buyer procurement workflows
- Implement tender workflows
- Create finance invoice and payment UI
- Add workflow tracking components

### Week 13-14: Phase 5 - API Integration
- Create all RTK Query API slices
- Wire up components to real APIs
- Handle loading and error states
- Test end-to-end flows

### Week 15-16: Phase 6 - Testing & Polish
- Write and run tests
- Fix bugs and edge cases
- Performance optimization
- Documentation updates

---

## File Structure Summary

```
/Users/yuditriaji/Synnova/eproc-vendor-portal/
├── app/
│   ├── admin/                      # NEW: Admin dashboard
│   ├── buyer/                      # NEW: Buyer dashboard
│   ├── finance/                    # NEW: Finance dashboard
│   └── vendor/
│       ├── contracts/              # NEW: Fix 404
│       ├── quotations/             # NEW: Fix 404
│       ├── documents/              # NEW: Fix 404
│       ├── invoices/               # NEW: Fix 404
│       └── payments/               # NEW: Fix 404
├── components/
│   ├── admin/                      # NEW: Admin components
│   ├── workflows/                  # NEW: Workflow components
│   ├── procurement/                # NEW: Procurement components
│   ├── tenders/                    # NEW: Tender components
│   └── finance/                    # NEW: Finance components
├── store/
│   └── api/
│       ├── adminApi.ts             # NEW: Admin API
│       ├── workflowApi.ts          # NEW: Workflow API
│       ├── tenderWorkflowApi.ts    # NEW: Tender workflow API
│       └── financeApi.ts           # NEW: Finance API
├── lib/
│   └── auth/
│       └── guards.ts               # NEW: Role guards
├── middleware.ts                   # UPDATE: Add role routing
├── types/index.ts                  # UPDATE: Add role types
└── config/
    └── navigation.ts               # UPDATE: Add admin nav
```

---

## API Endpoints Reference

### Configuration APIs (Admin)
- `POST /api/v1/tenants` - Create tenant
- `POST /api/v1/{tenant}/config/basis` - Basis configuration
- `POST /api/v1/{tenant}/org/company-codes` - Create company code
- `POST /api/v1/{tenant}/org/plants` - Create plant
- `POST /api/v1/{tenant}/org/storage-locations` - Create storage location
- `POST /api/v1/{tenant}/org/purchasing-orgs` - Create purchasing org
- `POST /api/v1/{tenant}/org/purchasing-groups` - Create purchasing group
- `POST /api/v1/{tenant}/currencies` - Create currency
- `POST /api/v1/{tenant}/vendors` - Create vendor
- `POST /api/v1/{tenant}/auth/register` - Create user

### Procurement Workflow APIs
- `POST /api/v1/{tenant}/workflows/procurement/initiate/{contractId}` - Initiate procurement
- `POST /api/v1/{tenant}/workflows/procurement/create-pr/{contractId}` - Create PR
- `POST /api/v1/{tenant}/workflows/procurement/approve-pr/{prId}` - Approve PR
- `POST /api/v1/{tenant}/workflows/procurement/create-po/{prId}` - Create PO
- `POST /api/v1/{tenant}/workflows/procurement/approve-po/{poId}` - Approve PO
- `POST /api/v1/{tenant}/workflows/procurement/goods-receipt/{poId}` - Create goods receipt

### Tender Workflow APIs
- `POST /api/v1/{tenant}/workflows/tender/create/{contractId}` - Create tender
- `POST /api/v1/{tenant}/workflows/tender/publish/{tenderId}` - Publish tender
- `POST /api/v1/{tenant}/workflows/tender/submit-bid/{tenderId}` - Submit bid (vendor)
- `POST /api/v1/{tenant}/workflows/tender/close/{tenderId}` - Close tender
- `POST /api/v1/{tenant}/workflows/tender/evaluate-bid/{bidId}` - Evaluate bid
- `POST /api/v1/{tenant}/workflows/tender/award/{tenderId}/{winningBidId}` - Award tender

### Finance APIs
- `POST /api/v1/{tenant}/invoices` - Create invoice
- `PUT /api/v1/{tenant}/invoices/{invoiceId}/approve` - Approve invoice
- `POST /api/v1/{tenant}/payments` - Create payment
- `GET /api/v1/{tenant}/transactions/statistics/purchase-orders` - PO statistics
- `GET /api/v1/{tenant}/transactions/statistics/tenders` - Tender statistics

### Workflow Status API
- `GET /api/v1/{tenant}/workflows/status/{entityType}/{entityId}` - Get workflow status

---

## Next Steps

1. **Review and approve this implementation plan**
2. **Prioritize phases** based on business needs
3. **Set up development environment** with proper tenant configuration
4. **Create feature branches** for each phase
5. **Begin implementation** starting with Phase 1 (high priority fixes)
6. **Regular testing and code reviews** throughout development
7. **Documentation** of new features and APIs
8. **Deployment** to staging environment for UAT

---

## Risk Mitigation

### Authentication Issues
- **Risk**: Role-based routing breaks existing authentication
- **Mitigation**: Implement backward compatibility, thorough testing, feature flags

### API Integration Complexity
- **Risk**: Backend APIs not ready or incomplete
- **Mitigation**: Use mock APIs, implement adapter pattern for easy switching

### Performance Concerns
- **Risk**: Admin UI with large datasets becomes slow
- **Mitigation**: Implement pagination, virtual scrolling, lazy loading

### Multi-Tenancy Bugs
- **Risk**: Data leakage between tenants
- **Mitigation**: Strict testing, tenant isolation validation, security audit

---

## Success Criteria

- ✅ All navigation menu items work without 404 errors
- ✅ Users are routed to correct dashboard based on role
- ✅ ADMIN users have access to full configuration UI
- ✅ Procurement workflows can be created and tracked
- ✅ Tender workflows are fully functional
- ✅ Finance can manage invoices and payments
- ✅ All roles have appropriate access controls
- ✅ System passes security audit
- ✅ Performance meets acceptable standards (< 2s page load)
- ✅ Test coverage > 80%
