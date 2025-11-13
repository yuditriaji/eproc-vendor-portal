# Frontend Implementation - RBAC Admin Access

## ✅ Backend Status: WORKING
Backend logs confirm:
```
[DEBUG] RBAC roles loaded: [ 'Admin' ]
[DEBUG] Merged permissions: YES
```

Token includes `rbacRoles: ["Admin"]` ✅

---

## Problem
Frontend still blocks user because it only checks `user.role === 'ADMIN'`, not `rbacRoles`.

---

## Solution

Find your admin route guard and add RBAC check:

```javascript
// ❌ WRONG (current)
if (user.role !== 'ADMIN') {
  alert('Admin credentials required');
  redirect('/unauthorized');
}

// ✅ CORRECT (fixed)
const isAdmin = user.role === 'ADMIN' || user.rbacRoles?.includes('Admin');
if (!isAdmin) {
  alert('Admin credentials required');
  redirect('/unauthorized');
}
```

---

## Step-by-Step Fix

### 1. Verify Token Has rbacRoles
```javascript
// In browser console after login
const token = localStorage.getItem('accessToken');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', decoded);
// Should show: rbacRoles: ["Admin"]
```

### 2. Update User Type
```typescript
interface User {
  id: string;
  email: string;
  role: string;
  rbacRoles: string[];  // ← Add this
  tenantId: string;
}
```

### 3. Fix Admin Check

**Location**: Find where your app checks for admin access (middleware, route guard, etc.)

**Change from:**
```javascript
user.role === 'ADMIN'
```

**To:**
```javascript
user.role === 'ADMIN' || user.rbacRoles?.includes('Admin')
```

---

## Common Locations to Update

### Next.js Middleware
```javascript
// middleware.ts
export function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;
  const user = jwtDecode(token);
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Fix here:
    const isAdmin = user.role === 'ADMIN' || user.rbacRoles?.includes('Admin');
    if (!isAdmin) {
      return NextResponse.redirect('/unauthorized');
    }
  }
}
```

### React Router Guard
```javascript
function AdminRoute({ children }) {
  const { user } = useAuth();
  
  // Fix here:
  const isAdmin = user.role === 'ADMIN' || user.rbacRoles?.includes('Admin');
  
  if (!isAdmin) {
    return <Navigate to="/unauthorized" />;
  }
  return children;
}
```

### Auth Context/Hook
```javascript
// useAuth.js or similar
export function useAuth() {
  const user = getCurrentUser();
  
  return {
    user,
    // Fix here:
    isAdmin: user?.role === 'ADMIN' || user?.rbacRoles?.includes('Admin')
  };
}
```

---

## Utility Function (Recommended)

Create `utils/permissions.js`:

```javascript
export function isAdmin(user) {
  if (!user) return false;
  return user.role === 'ADMIN' || user.rbacRoles?.includes('Admin');
}

export function hasRole(user, roleName) {
  if (!user) return false;
  return user.role === roleName || user.rbacRoles?.includes(roleName);
}

export function hasAnyRole(user, roles) {
  if (!user) return false;
  return roles.some(role => 
    user.role === role || user.rbacRoles?.includes(role)
  );
}
```

**Usage:**
```javascript
import { isAdmin } from '@/utils/permissions';

if (isAdmin(user)) {
  // Allow access
}
```

---

## Test

1. Login with user that has RBAC "Admin" role
2. Check browser console - token should have `rbacRoles: ["Admin"]`
3. Try to access admin portal - should work now
4. If still blocked, add console.log at the check:

```javascript
console.log('User role:', user.role);
console.log('User rbacRoles:', user.rbacRoles);
const isAdmin = user.role === 'ADMIN' || user.rbacRoles?.includes('Admin');
console.log('Is admin?', isAdmin);

if (!isAdmin) {
  alert('Admin credentials required');
}
```

---

## That's It

**One line change:**
```javascript
const isAdmin = user.role === 'ADMIN' || user.rbacRoles?.includes('Admin');
```

Backend works. Just update your frontend admin check.
