# Vendor Portal RBAC Security Audit & Fixes

**Date**: November 22, 2025  
**Status**: Critical Security Issues Identified  
**Target**: Vendor Portal (`/vendor/*` routes)

## Executive Summary

This document outlines critical RBAC violations found in the vendor portal and provides fixes to ensure vendors only have access to VENDOR role functionalities as defined in `RBAC_ROLES_PERMISSIONS.md`.

---

## VENDOR Role Capabilities (RBAC Reference)

According to `RBAC_ROLES_PERMISSIONS.md` (lines 124-148), VENDOR role should:

### ✅ ALLOWED
- View **published tenders only** (not drafts, not all statuses)
- Create and manage **own bids only**
- Submit bids
- Read and update **own profile only**
- View **own bid history only**
- View **own contracts (assigned only)**
- View **own invoices only**
- View **own payments only**
- Read audit logs (**own activities only**)

### ❌ FORBIDDEN
- Cannot create tenders
- Cannot score bids
- Cannot approve anything
- Cannot view draft tenders
- Cannot view all bids (only own)
- Cannot view all contracts (only assigned)
- Cannot view vendor statistics (admin feature)
- Cannot view all invoices/payments (only own)
- Cannot create PRs/POs
- Cannot process payments
- Cannot manage budgets

---

## Critical Security Violations Found

### 1. **CRITICAL: Tenders Page Allows Draft Filter**
**File**: `app/vendor/tenders/page.tsx` (line 76)  
**Issue**: Vendors can select "DRAFT" status filter, potentially viewing draft tenders  
**RBAC Violation**: ❌ Cannot view draft tenders (line 133 of RBAC)  
**Risk**: HIGH - Backend may return draft tenders if API doesn't enforce filtering

**Current Code**:
```typescript
<SelectContent>
  <SelectItem value="all">All Status</SelectItem>
  <SelectItem value="PUBLISHED">Published</SelectItem>
  <SelectItem value="DRAFT">Draft</SelectItem>        // ❌ CRITICAL VIOLATION
  <SelectItem value="CLOSED">Closed</SelectItem>
  <SelectItem value="AWARDED">Awarded</SelectItem>
</SelectContent>
```

**Fix Required**: Remove DRAFT option, default to PUBLISHED only

---

### 2. **HIGH: No Client-Side Data Filtering**
**Files**: Multiple pages across vendor portal  
**Issue**: Pages rely entirely on backend to filter data to "own only"  
**RBAC Violation**: No frontend validation that displayed data belongs to vendor  
**Risk**: MEDIUM - If backend fails to filter, vendor sees unauthorized data

**Affected Pages**:
- `app/vendor/bids/page.tsx` - Should only show own bids
- `app/vendor/contracts/page.tsx` - Should only show assigned contracts
- `app/vendor/invoices/page.tsx` - Should only show own invoices
- `app/vendor/payments/page.tsx` - Should only show own payments
- `app/vendor/documents/page.tsx` - Should only show own documents

**Fix Required**: Add client-side validation to ensure `vendorId === currentUser.id`

---

### 3. **MEDIUM: Dashboard Shows Vendor Statistics**
**File**: `app/vendor/dashboard/page.tsx`  
**Issue**: Dashboard may expose aggregate vendor statistics  
**RBAC Violation**: ❌ Cannot view vendor statistics (line 287 of RBAC)  
**Risk**: LOW - If backend returns system-wide stats instead of vendor-specific

**Fix Required**: Ensure dashboard only shows vendor's own statistics, not system-wide

---

### 4. **LOW: Navigation Config Needs Validation**
**File**: `config/navigation.ts`  
**Issue**: Navigation doesn't explicitly hide admin/internal features  
**RBAC Violation**: Potential exposure of non-vendor features  
**Risk**: LOW - Layout already checks `isVendor()` but navigation should be explicit

**Fix Required**: Validate navigation items are vendor-appropriate

---

## Security Fixes Implementation

### Fix 1: Enforce PUBLISHED-Only Tenders
**File**: `app/vendor/tenders/page.tsx`

**Changes**:
1. Default status filter to 'PUBLISHED'
2. Remove DRAFT, CLOSED, AWARDED from filter options
3. Add warning message that only published tenders are shown
4. Force status parameter to always be PUBLISHED

### Fix 2: Add Vendor Data Ownership Validation
**File**: `utils/permissions.ts`

**Add New Functions**:
```typescript
// Validate bid belongs to vendor
export function isOwnBid(bid: Bid, user: User | null): boolean

// Validate contract is assigned to vendor
export function isAssignedContract(contract: Contract, user: User | null): boolean

// Validate invoice belongs to vendor
export function isOwnInvoice(invoice: Invoice, user: User | null): boolean

// Validate payment belongs to vendor
export function isOwnPayment(payment: Payment, user: User | null): boolean
```

### Fix 3: Add Frontend Data Filtering
Apply to all pages displaying lists:
1. Filter API responses to ensure vendorId matches
2. Log security warnings if unauthorized data detected
3. Gracefully handle data mismatches

### Fix 4: Add Page-Level RBAC Guards
**New File**: `components/guards/VendorGuard.tsx`

Wrap sensitive components to ensure vendor-only access with explicit checks.

---

## Testing Checklist

After fixes are applied, verify:

- [ ] Vendor cannot see DRAFT status option in tenders filter
- [ ] Vendor tenders page defaults to PUBLISHED status
- [ ] Vendor cannot manually set status=DRAFT in URL parameters
- [ ] Bids page only shows vendor's own bids
- [ ] Contracts page only shows assigned contracts
- [ ] Invoices page only shows vendor's invoices
- [ ] Payments page only shows vendor's payments
- [ ] Documents page only shows vendor's documents
- [ ] Dashboard shows only vendor-specific statistics
- [ ] Navigation only shows vendor-appropriate links
- [ ] Profile page only allows editing own profile
- [ ] No admin/internal role features are visible
- [ ] Unauthorized API responses are logged and handled

---

## Backend Validation Requirements

**CRITICAL**: Frontend fixes are defense-in-depth only. Backend MUST enforce:

1. **Tender Endpoint**: `/api/v1/tenders` - Must filter by status=PUBLISHED for VENDOR role
2. **Bids Endpoint**: `/api/v1/bids` - Must filter by vendorId=currentUser.id
3. **Contracts Endpoint**: `/api/v1/contracts` - Must filter by assignedVendorId=currentUser.id
4. **Invoices Endpoint**: `/api/v1/invoices` - Must filter by vendorId=currentUser.id
5. **Payments Endpoint**: `/api/v1/payments` - Must filter by vendorId=currentUser.id
6. **Dashboard Stats**: `/api/v1/dashboard/stats` - Must return vendor-specific stats only

**Backend validation is PRIMARY defense. Frontend is SECONDARY.**

---

## Implementation Priority

1. **IMMEDIATE (P0)**: Fix tender DRAFT filter vulnerability
2. **HIGH (P1)**: Add data ownership validation utilities
3. **MEDIUM (P2)**: Implement frontend data filtering
4. **LOW (P3)**: Add explicit navigation validation
5. **LOW (P3)**: Create VendorGuard component for future use

---

## Security Best Practices Applied

1. ✅ **Defense in Depth**: Multiple layers of validation (layout, page, component)
2. ✅ **Principle of Least Privilege**: Vendor sees only what's necessary
3. ✅ **Explicit Deny**: Remove options rather than hide them
4. ✅ **Data Ownership**: Validate all displayed data belongs to vendor
5. ✅ **Audit Trail**: Log suspicious access attempts
6. ✅ **Fail Secure**: If validation fails, deny access

---

## Next Steps

1. Apply fixes outlined in this document
2. Test all vendor pages with test credentials
3. Perform security review with backend team
4. Document API contracts for vendor-specific endpoints
5. Add E2E tests for RBAC enforcement
6. Schedule penetration testing for vendor portal

---

**Document Version**: 1.0  
**Reviewed By**: Security Audit  
**Next Review**: After fixes implementation
