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
