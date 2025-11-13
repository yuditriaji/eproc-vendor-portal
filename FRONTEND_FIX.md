# Frontend Fix - Enable RBAC Admin Access

## Problem
User assigned RBAC "Admin" role cannot login to admin portal.

## Root Cause
Frontend only checks `user.role` (enum), not `user.rbacRoles` (RBAC).

---

## Solution: Update Admin Portal Guard

### Step 1: Check Token (Debug)
```javascript
// In browser console after login
const token = localStorage.getItem('accessToken');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log(decoded);
// Should show: { role: "USER", rbacRoles: ["Admin"], ... }
```

### Step 2: Fix Route Guard

**Before (Broken):**
```javascript
// ❌ Only checks enum role
if (user.role !== 'ADMIN') {
  redirect('/unauthorized');
}
```

**After (Fixed):**
```javascript
// ✅ Checks both enum AND RBAC roles
if (user.role !== 'ADMIN' && !user.rbacRoles?.includes('Admin')) {
  redirect('/unauthorized');
}
```

---

## Implementation Examples

### Next.js Middleware
```javascript
// middleware.ts
import { jwtDecode } from 'jwt-decode';

export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;
  const decoded = jwtDecode(token);
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check both enum and RBAC
    const isAdmin = decoded.role === 'ADMIN' || decoded.rbacRoles?.includes('Admin');
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return NextResponse.next();
}
```

### React Router
```javascript
// ProtectedRoute.tsx
function AdminRoute({ children }) {
  const { user } = useAuth();
  
  // Check both enum and RBAC
  const isAdmin = user.role === 'ADMIN' || user.rbacRoles?.includes('Admin');
  
  if (!isAdmin) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
}
```

### Vue Router
```javascript
// router/index.js
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    const user = store.getters.currentUser;
    
    // Check both enum and RBAC
    const isAdmin = user.role === 'ADMIN' || user.rbacRoles?.includes('Admin');
    
    if (!isAdmin) {
      next('/unauthorized');
    } else {
      next();
    }
  } else {
    next();
  }
});
```

---

## Utility Function (Reusable)

```javascript
// utils/permissions.js
export function hasAnyRole(user, requiredRoles) {
  if (!user) return false;
  
  // Check enum role
  if (requiredRoles.includes(user.role)) return true;
  
  // Check RBAC roles
  if (user.rbacRoles?.some(r => requiredRoles.includes(r))) return true;
  
  return false;
}

export function isAdmin(user) {
  return hasAnyRole(user, ['ADMIN', 'Admin']);
}

// Usage:
if (isAdmin(user)) {
  // Show admin portal
}
```

---

## Update User Type

```typescript
// types/user.ts
export interface User {
  id: string;
  email: string;
  role: string;            // Enum: ADMIN, BUYER, etc.
  rbacRoles: string[];     // RBAC: ["Admin", "PROCUREMENT_MANAGER"]
  abilities?: any;
  tenantId: string;
}
```

---

## Test Checklist

- [ ] User with enum `ADMIN` can access admin portal
- [ ] User with RBAC `"Admin"` can access admin portal  
- [ ] User with neither role is blocked
- [ ] Token contains `rbacRoles` array after login
- [ ] Console shows no errors about undefined `rbacRoles`

---

## Quick Debug

Add this temporarily to see what's happening:
```javascript
console.log('User:', user);
console.log('Enum role:', user.role);
console.log('RBAC roles:', user.rbacRoles);
console.log('Is admin?', user.role === 'ADMIN' || user.rbacRoles?.includes('Admin'));
```

---

## That's It!

The backend already works. Just update frontend guards to check `rbacRoles` array.

**One line fix:**
```javascript
const isAdmin = user.role === 'ADMIN' || user.rbacRoles?.includes('Admin');
```
