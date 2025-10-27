# E-Procurement Login Guide

This guide explains how to login to the E-Procurement system for different roles using tenant-based URLs.

## 🏢 Multi-Tenant Architecture

### Production (Subdomain-based)
```
{tenant}.domain.com
```
Each tenant has their own subdomain (e.g., `quiv.eproc.com`, `acme.eproc.com`)

### Testing/Development (Query Parameter-based)
```
domain.com/role/login?tenant={tenant}
```
Tenant is passed as a query parameter for testing purposes.

---

## 🔐 Login URLs by Role

### 1. **Admin Login**

#### Production URL Pattern
```
admin.{tenant}.domain.com/admin/login
```

#### Testing URL (Vercel)
```
https://eproc-vendor-portal.vercel.app/admin/login?tenant=quiv
```

#### Test Credentials
- **Email**: `admin@eproc.local`
- **Password**: `admin123`

#### Access Rights
- Full system administration
- Tenant configuration management
- User and role management
- All organizational and master data
- System monitoring and validation

---

### 2. **Vendor Login**

#### Production URL Pattern
```
vendor.{tenant}.domain.com/vendor/login
```

#### Testing URL (Vercel)
```
https://eproc-vendor-portal.vercel.app/vendor/login?tenant=quiv
```

#### Test Credentials
- **Email**: `vendor@eproc.local`
- **Password**: `vendor123`

#### Access Rights
- View and respond to tenders/RFQs
- Submit and manage bids
- View awarded contracts
- Manage company profile
- Document uploads

---

### 3. **Buyer Login**

#### Production URL Pattern
```
buyer.{tenant}.domain.com/buyer/login
```

#### Testing URL (Vercel)
```
https://eproc-vendor-portal.vercel.app/buyer/login?tenant=quiv
```

#### Test Credentials
- **Email**: `buyer@eproc.local`
- **Password**: `buyer123`

#### Access Rights
- Create and manage RFQs/tenders
- Evaluate vendor bids
- Award contracts
- View vendor performance
- Approve purchase requisitions

---

### 4. **Finance Login**

#### Production URL Pattern
```
finance.{tenant}.domain.com/finance/login
```

#### Testing URL (Vercel)
```
https://eproc-vendor-portal.vercel.app/finance/login?tenant=quiv
```

#### Test Credentials
- **Email**: `finance@eproc.local`
- **Password**: `finance123`

#### Access Rights
- Invoice processing and approval
- Payment management
- Budget tracking
- Financial reports
- Vendor payment history

---

### 5. **Manager Login**

#### Production URL Pattern
```
manager.{tenant}.domain.com/buyer/login
```
(Managers use buyer portal with elevated permissions)

#### Testing URL (Vercel)
```
https://eproc-vendor-portal.vercel.app/buyer/login?tenant=quiv
```

#### Test Credentials
- **Email**: `manager@eproc.local`
- **Password**: `manager123`

#### Access Rights
- All buyer permissions
- Approval workflows
- Team management
- Advanced reporting

---

## 🎯 Quick Login Summary for Tenant "quiv"

| Role | URL | Email | Password |
|------|-----|-------|----------|
| **Admin** | [Admin Login](https://eproc-vendor-portal.vercel.app/admin/login?tenant=quiv) | admin@eproc.local | admin123 |
| **Vendor** | [Vendor Login](https://eproc-vendor-portal.vercel.app/vendor/login?tenant=quiv) | vendor@eproc.local | vendor123 |
| **Buyer** | [Buyer Login](https://eproc-vendor-portal.vercel.app/buyer/login?tenant=quiv) | buyer@eproc.local | buyer123 |
| **Finance** | [Finance Login](https://eproc-vendor-portal.vercel.app/finance/login?tenant=quiv) | finance@eproc.local | finance123 |
| **Manager** | [Manager Login](https://eproc-vendor-portal.vercel.app/buyer/login?tenant=quiv) | manager@eproc.local | manager123 |

---

## 🔄 Role-Based Redirects

After successful login, users are automatically redirected to their role-specific dashboard:

- **ADMIN** → `/admin/dashboard`
- **BUYER** → `/buyer/dashboard`
- **MANAGER** → `/buyer/dashboard`
- **FINANCE** → `/finance/dashboard`
- **VENDOR** → `/vendor/dashboard`

---

## 🛡️ Security Features

### Authentication
- JWT-based authentication with automatic token refresh
- Secure cookie handling with CSP headers
- Role-based access control (RBAC)
- Protected routes via Next.js middleware

### Role Verification
Each login page verifies the user's role:
- Admin login only accepts ADMIN role users
- Vendor login only accepts VENDOR role users
- Other roles are validated similarly

### Tenant Isolation
- Each tenant's data is isolated
- Tenant context passed via query parameter (testing) or subdomain (production)
- Multi-tenant support at database level

---

## 🧪 Local Development

### Development URLs (localhost:3001)
```bash
# Start development server
npm run dev

# Start mock API server (required)
node mock-api-server.js
```

| Role | Local URL |
|------|-----------|
| Admin | http://localhost:3001/admin/login?tenant=quiv |
| Vendor | http://localhost:3001/vendor/login?tenant=quiv |
| Buyer | http://localhost:3001/buyer/login?tenant=quiv |
| Finance | http://localhost:3001/finance/login?tenant=quiv |
| Manager | http://localhost:3001/buyer/login?tenant=quiv |

---

## 📋 Implementation Status

### ✅ Completed
- [x] Vendor login page
- [x] Admin login page
- [x] Role-based authentication
- [x] JWT token management
- [x] Protected route middleware
- [x] Role-based redirects
- [x] Tenant query parameter support

### 🚧 To Be Implemented
- [ ] Buyer login page
- [ ] Finance login page
- [ ] Manager-specific permissions
- [ ] Production subdomain routing
- [ ] Forgot password flow
- [ ] Email verification
- [ ] Two-factor authentication (2FA)

---

## 🔧 Technical Implementation

### Auth Flow
1. User enters credentials at role-specific login page
2. Frontend calls `/api/v1/auth/login` with credentials
3. Backend validates credentials and returns JWT token + user data
4. Frontend stores token and dispatches to Redux store
5. Role is verified against login page requirements
6. User is redirected to role-appropriate dashboard
7. Middleware protects all subsequent requests

### Middleware Protection
```typescript
// lib/auth/guards.ts
- requireAdmin() - Admin-only routes
- requireBuyer() - Buyer/Manager routes
- requireVendor() - Vendor-only routes
- requireFinance() - Finance-only routes
- getRoleBasedRedirect() - Auto-redirect logic
```

### API Integration
```typescript
// store/api/authApi.ts
- useLoginMutation() - Login endpoint
- Token auto-refresh on 401 errors
- Automatic retry logic
```

---

## 🐛 Troubleshooting

### Login Failed
- Verify tenant parameter is correct
- Check credentials match the role-specific test accounts
- Ensure mock API server is running (development)
- Check browser console for detailed error messages

### Wrong Dashboard After Login
- Verify user role matches login page
- Check role-based redirect logic in auth guards
- Clear browser cookies and try again

### Tenant Not Found
- Ensure `?tenant=quiv` is included in URL
- Verify tenant exists in database
- Check tenant isolation middleware

---

## 📞 Support

For issues or questions:
- Check browser console logs
- Review `IMPLEMENTATION_SUMMARY.md`
- Check `WARP.md` for development commands
- Review `TECHNICAL_DOCUMENTATION.md` for architecture details
