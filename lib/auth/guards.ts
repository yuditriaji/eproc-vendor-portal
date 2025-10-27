import { User } from '@/types';

export type UserRole = 'ADMIN' | 'USER' | 'BUYER' | 'MANAGER' | 'FINANCE' | 'VENDOR';

// Role hierarchy - roles that can access lower-level routes
const roleHierarchy: Record<UserRole, UserRole[]> = {
  ADMIN: ['ADMIN', 'USER', 'BUYER', 'MANAGER', 'FINANCE', 'VENDOR'],
  MANAGER: ['MANAGER', 'BUYER', 'USER'],
  BUYER: ['BUYER', 'USER'],
  FINANCE: ['FINANCE'],
  USER: ['USER'],
  VENDOR: ['VENDOR'],
};

/**
 * Check if user has required role
 */
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  const userAllowedRoles = roleHierarchy[user.role] || [];
  return userAllowedRoles.includes(requiredRole);
}

/**
 * Check if user can access admin routes
 */
export function requireAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN';
}

/**
 * Check if user can access buyer routes
 */
export function requireBuyer(user: User | null): boolean {
  return hasRole(user, 'BUYER');
}

/**
 * Check if user can access vendor routes
 */
export function requireVendor(user: User | null): boolean {
  return user?.role === 'VENDOR';
}

/**
 * Check if user can access finance routes
 */
export function requireFinance(user: User | null): boolean {
  return hasRole(user, 'FINANCE');
}

/**
 * Check if user can access manager routes
 */
export function requireManager(user: User | null): boolean {
  return hasRole(user, 'MANAGER');
}

/**
 * Get the default dashboard path for a user based on their role
 */
export function getRoleBasedRedirect(user: User | null): string {
  if (!user) return '/vendor/login';
  
  switch (user.role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'BUYER':
    case 'MANAGER':
    case 'USER':
      return '/buyer/dashboard';
    case 'FINANCE':
      return '/finance/dashboard';
    case 'VENDOR':
      return '/vendor/dashboard';
    default:
      return '/vendor/dashboard';
  }
}

/**
 * Check if route is allowed for user
 */
export function isRouteAllowed(user: User | null, path: string): boolean {
  if (!user) return false;

  // Admin can access everything
  if (user.role === 'ADMIN') return true;

  // Check route prefixes
  if (path.startsWith('/admin')) {
    return false; // Only admin can access, already checked above
  }
  
  if (path.startsWith('/buyer')) {
    return hasRole(user, 'BUYER');
  }
  
  if (path.startsWith('/finance')) {
    return hasRole(user, 'FINANCE');
  }
  
  if (path.startsWith('/vendor')) {
    return user.role === 'VENDOR';
  }

  // Allow access to common routes
  return true;
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    USER: 'User',
    BUYER: 'Buyer',
    MANAGER: 'Manager',
    FINANCE: 'Finance',
    VENDOR: 'Vendor',
  };
  return names[role] || role;
}
