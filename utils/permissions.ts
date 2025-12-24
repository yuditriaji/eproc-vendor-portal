import type { User } from '@/types';

/**
 * Check if user has any of the required roles (enum or RBAC)
 * @param user - The user object
 * @param requiredRoles - Array of required roles to check against (can be enum or RBAC role names)
 * @returns true if user has at least one of the required roles
 */
export function hasAnyRole(user: User | null, requiredRoles: string[]): boolean {
  if (!user) return false;

  // Check enum role
  if (requiredRoles.includes(user.role)) return true;

  // Check RBAC roles
  if (user.rbacRoles && user.rbacRoles.length > 0) {
    return user.rbacRoles.some((role) => requiredRoles.includes(role));
  }

  return false;
}

/**
 * Check if user has all required roles
 * @param user - The user object
 * @param requiredRoles - Array of required roles (must have all)
 * @returns true if user has all required roles
 */
export function hasAllRoles(user: User | null, requiredRoles: string[]): boolean {
  if (!user) return false;

  return requiredRoles.every((role) => {
    // Check enum role
    if (user.role === role) return true;

    // Check RBAC roles
    if (user.rbacRoles?.includes(role)) return true;

    return false;
  });
}

/**
 * Check if user is an admin (enum ADMIN or RBAC Admin)
 * @param user - The user object
 * @returns true if user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin']);
}

/**
 * Check if user is a buyer (enum BUYER or RBAC Buyer)
 * @param user - The user object
 * @returns true if user is a buyer
 */
export function isBuyer(user: User | null): boolean {
  return hasAnyRole(user, ['BUYER', 'Buyer']);
}

/**
 * Check if user is a vendor (enum VENDOR or RBAC Vendor)
 * @param user - The user object
 * @returns true if user is a vendor
 */
export function isVendor(user: User | null): boolean {
  return hasAnyRole(user, ['VENDOR', 'Vendor']);
}

/**
 * Check if user is a finance user (enum FINANCE or RBAC Finance)
 * @param user - The user object
 * @returns true if user is a finance user
 */
export function isFinance(user: User | null): boolean {
  return hasAnyRole(user, ['FINANCE', 'Finance']);
}

/**
 * Check if user is a manager (enum MANAGER or RBAC Manager)
 * @param user - The user object
 * @returns true if user is a manager
 */
export function isManager(user: User | null): boolean {
  return hasAnyRole(user, ['MANAGER', 'Manager']);
}

/**
 * Check if user can access approval pages (enum APPROVER, MANAGER, or ADMIN)
 * MANAGER and ADMIN can also approve PRs, contracts, invoices per RBAC spec
 * @param user - The user object
 * @returns true if user has approval access
 */
export function isApprover(user: User | null): boolean {
  return hasAnyRole(user, ['APPROVER', 'Approver', 'MANAGER', 'Manager', 'ADMIN', 'Admin']);
}

/**
 * Check if user is a regular internal user (enum USER or RBAC User)
 * @param user - The user object
 * @returns true if user is a regular user
 */
export function isUser(user: User | null): boolean {
  return hasAnyRole(user, ['USER', 'User']);
}

/**
 * Get all user roles (enum + RBAC)
 * @param user - The user object
 * @returns Array of all roles the user has
 */
export function getAllUserRoles(user: User | null): string[] {
  if (!user) return [];

  const roles: string[] = [user.role];
  if (user.rbacRoles) {
    roles.push(...user.rbacRoles);
  }

  return Array.from(new Set(roles)); // Remove duplicates
}

/**
 * Check if user has permission to access a specific resource
 * Can be extended with more complex logic as needed
 * @param user - The user object
 * @param requiredRoles - Roles required to access the resource
 * @returns true if user can access the resource
 */
export function canAccess(user: User | null, requiredRoles: string[]): boolean {
  return hasAnyRole(user, requiredRoles);
}

// ===== VENDOR DATA OWNERSHIP VALIDATION =====
// RBAC: Vendors can only access their own data

/**
 * Check if bid belongs to the current vendor
 * @param bid - The bid object
 * @param user - The user object (must be vendor)
 * @returns true if bid belongs to vendor
 */
export function isOwnBid(bid: any, user: User | null): boolean {
  if (!user || !isVendor(user)) return false;

  // Compare by vendor email since vendorId is the Vendor table ID, not User ID
  const vendorEmail = bid?.vendor?.contactEmail || bid?.vendor?.email;
  const userEmail = user.email;

  if (vendorEmail && userEmail) {
    return vendorEmail.toLowerCase() === userEmail.toLowerCase();
  }

  // Fallback to ID comparison
  return bid?.vendorId === user.id || bid?.vendor?.id === user.id;
}

/**
 * Check if contract is assigned to the current vendor
 * @param contract - The contract object
 * @param user - The user object (must be vendor)
 * @returns true if contract is assigned to vendor
 */
export function isAssignedContract(contract: any, user: User | null): boolean {
  if (!user || !isVendor(user)) return false;

  // Compare by vendor email since vendorId is the Vendor table ID, not User ID
  const vendorEmail = contract?.vendor?.contactEmail || contract?.vendor?.email;
  const userEmail = user.email;

  if (vendorEmail && userEmail) {
    return vendorEmail.toLowerCase() === userEmail.toLowerCase();
  }

  return contract?.vendorId === user.id || contract?.vendor?.id === user.id;
}

/**
 * Check if invoice belongs to the current vendor
 * @param invoice - The invoice object
 * @param user - The user object (must be vendor)
 * @returns true if invoice belongs to vendor
 */
export function isOwnInvoice(invoice: any, user: User | null): boolean {
  if (!user || !isVendor(user)) return false;

  const vendorEmail = invoice?.vendor?.contactEmail || invoice?.vendor?.email;
  const userEmail = user.email;

  if (vendorEmail && userEmail) {
    return vendorEmail.toLowerCase() === userEmail.toLowerCase();
  }

  return invoice?.vendorId === user.id || invoice?.vendor?.id === user.id;
}

/**
 * Check if payment belongs to the current vendor
 * @param payment - The payment object
 * @param user - The user object (must be vendor)
 * @returns true if payment belongs to vendor
 */
export function isOwnPayment(payment: any, user: User | null): boolean {
  if (!user || !isVendor(user)) return false;

  const vendorEmail = payment?.vendor?.contactEmail || payment?.vendor?.email;
  const userEmail = user.email;

  if (vendorEmail && userEmail) {
    return vendorEmail.toLowerCase() === userEmail.toLowerCase();
  }

  return payment?.vendorId === user.id || payment?.vendor?.id === user.id;
}

/**
 * Check if document belongs to the current vendor
 * @param document - The document object
 * @param user - The user object (must be vendor)
 * @returns true if document belongs to vendor
 */
export function isOwnDocument(document: any, user: User | null): boolean {
  if (!user || !isVendor(user)) return false;
  return document?.vendorId === user.id || document?.uploadedBy === user.id;
}

/**
 * Filter array to only include vendor's own data
 * @param items - Array of items to filter
 * @param user - The current user (must be vendor)
 * @param ownershipCheck - Function to check ownership
 * @returns Filtered array containing only vendor's own items
 */
export function filterVendorOwnData<T>(
  items: T[],
  user: User | null,
  ownershipCheck: (item: T, user: User | null) => boolean
): T[] {
  if (!user || !isVendor(user)) return [];
  return items.filter((item) => ownershipCheck(item, user));
}

/**
 * Log security warning when unauthorized data is detected
 * @param context - Context of where the issue occurred
 * @param details - Additional details
 */
export function logSecurityWarning(context: string, details: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[SECURITY WARNING] ${context}: ${details}`);
  }
  // In production, this should send to monitoring service
}

// ===== BUSINESS USER PERMISSION CHECKS =====
// For internal users (USER, BUYER, MANAGER, FINANCE, APPROVER)

/**
 * Check if user is a business/internal user (not VENDOR)
 * @param user - The user object
 * @returns true if user is an internal business user
 */
export function isBusinessUser(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin', 'USER', 'User', 'BUYER', 'Buyer', 'MANAGER', 'Manager', 'FINANCE', 'Finance', 'APPROVER', 'Approver']);
}

/**
 * Check if user can create tenders
 * Only USER (Procurement Officer) and MANAGER can create tenders
 * @param user - The user object
 * @returns true if user can create tenders
 */
export function canCreateTender(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin', 'USER', 'User', 'MANAGER', 'Manager']);
}

/**
 * Check if user can approve purchase requisitions
 * @param user - The user object
 * @returns true if user can approve PRs
 */
export function canApprovePR(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin', 'MANAGER', 'Manager', 'APPROVER', 'Approver']);
}

/**
 * Check if user can approve purchase orders
 * @param user - The user object
 * @returns true if user can approve POs
 */
export function canApprovePO(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin', 'MANAGER', 'Manager', 'FINANCE', 'Finance', 'APPROVER', 'Approver']);
}

/**
 * Check if user can approve invoices
 * @param user - The user object
 * @returns true if user can approve invoices
 */
export function canApproveInvoice(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin', 'MANAGER', 'Manager', 'FINANCE', 'Finance', 'APPROVER', 'Approver']);
}

/**
 * Check if user can process payments
 * @param user - The user object
 * @returns true if user can process payments
 */
export function canProcessPayment(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin', 'FINANCE', 'Finance']);
}

/**
 * Check if user can create contracts
 * @param user - The user object
 * @returns true if user can create contracts
 */
export function canCreateContract(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin', 'BUYER', 'Buyer', 'MANAGER', 'Manager']);
}

/**
 * Check if user can create purchase requisitions
 * @param user - The user object
 * @returns true if user can create PRs
 */
export function canCreatePR(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin', 'BUYER', 'Buyer', 'MANAGER', 'Manager']);
}

/**
 * Check if user can create purchase orders
 * @param user - The user object
 * @returns true if user can create POs
 */
export function canCreatePO(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin', 'BUYER', 'Buyer', 'MANAGER', 'Manager']);
}

/**
 * Check if user can manage budgets
 * @param user - The user object
 * @returns true if user can manage budgets
 */
export function canManageBudget(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin', 'FINANCE', 'Finance', 'MANAGER', 'Manager']);
}

/**
 * Check if user can manage vendors
 * @param user - The user object
 * @returns true if user can manage vendors
 */
export function canManageVendors(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin', 'BUYER', 'Buyer', 'MANAGER', 'Manager']);
}

/**
 * Check if user can score bids
 * @param user - The user object
 * @returns true if user can score bids
 */
export function canScoreBids(user: User | null): boolean {
  return hasAnyRole(user, ['ADMIN', 'Admin', 'USER', 'User', 'BUYER', 'Buyer', 'MANAGER', 'Manager', 'APPROVER', 'Approver']);
}
