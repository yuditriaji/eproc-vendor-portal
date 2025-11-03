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
  roleIds: string[];
  expiresAt?: string;
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
  roles: string[];
  effectivePermissions: Record<string, string[]>;
}
