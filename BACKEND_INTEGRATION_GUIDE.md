# Backend Integration Guide

## Overview

This vendor portal is now configured to work with your multi-tenant e-procurement backend as documented in `TECHNICAL_DOCUMENTATION.md`.

## API Structure

### Base URL Format

```
{BASE_URL}/api/v1/{tenant}/{resource}
```

**Example:**
```
https://eproc-sourcing-backend.onrender.com/api/v1/default/auth/login
```

### Environment Configuration

Create `.env.local` file:

```env
# Backend API
NEXT_PUBLIC_API_URL=https://eproc-sourcing-backend.onrender.com/api/v1

# Your tenant slug
NEXT_PUBLIC_TENANT=default

# WebSocket (if needed)
NEXT_PUBLIC_WS_URL=wss://eproc-sourcing-backend.onrender.com

# File uploads
NEXT_PUBLIC_UPLOAD_URL=https://eproc-sourcing-backend.onrender.com/uploads
NEXT_PUBLIC_MAX_FILE_SIZE=10485760

# Environment
NEXT_PUBLIC_ENVIRONMENT=development
```

## Authentication Flow

### 1. Admin Login (For Testing)

The portal sends requests to:

```http
POST /:tenant/auth/login
Content-Type: application/json

{
  "email": "admin@yourcompany.com",
  "password": "your-admin-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "admin@yourcompany.com",
      "role": "ADMIN",
      "tenantId": "tenant-id"
    },
    "token": "jwt-access-token"
  }
}
```

### 2. Token Storage

The frontend automatically:
- Stores JWT in Redux store
- Saves to localStorage for persistence
- Includes in all subsequent requests via `Authorization: Bearer {token}`

### 3. Protected Routes

All requests to protected endpoints include:
```http
Authorization: Bearer {jwt-token}
Content-Type: application/json
```

## Vendor Registration Flow

### Step 1: Vendor Self-Registration

```http
POST /:tenant/auth/register
Content-Type: application/json

{
  "email": "vendor@company.com",
  "username": "vendoruser",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "VENDOR"
}
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Vendor account created but requires verification",
  "userId": "user-id-to-verify"
}
```

### Step 2: Admin Verification

Admin must verify the vendor account:

```http
PATCH /:tenant/auth/users/{userId}/verify
Authorization: Bearer {admin-token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "isVerified": true
    }
  }
}
```

### Step 3: Vendor Login

After verification, vendor can login:

```http
POST /:tenant/auth/login
Content-Type: application/json

{
  "email": "vendor@company.com",
  "password": "SecurePass123!"
}
```

## Available Endpoints

### Authentication

- `POST /:tenant/auth/login` - Login
- `POST /:tenant/auth/register` - Register (VENDOR needs verification)
- `PATCH /:tenant/auth/users/:userId/verify` - Verify vendor (ADMIN only)
- `GET /:tenant/auth/me` - Get current user
- `POST /:tenant/auth/refresh` - Refresh token
- `POST /:tenant/auth/logout` - Logout

### Tenders

- `GET /:tenant/tenders` - List tenders (with pagination)
- `GET /:tenant/tenders/:id` - Get tender details

### Bids

- `GET /:tenant/bids` - List user's bids
- `GET /:tenant/bids/:id` - Get bid details
- `POST /:tenant/bids` - Create new bid
- `PUT /:tenant/bids/:id` - Update bid draft
- `POST /:tenant/bids/:id/submit` - Submit bid

### Dashboard

- `GET /:tenant/dashboard/stats` - Dashboard statistics

## Testing Checklist

### 1. Environment Setup

- [x] Create `.env.local` with correct `NEXT_PUBLIC_API_URL`
- [x] Set `NEXT_PUBLIC_TENANT` to your tenant slug
- [x] Verify backend is accessible

### 2. Authentication Test

- [ ] Login with admin credentials
- [ ] Verify JWT token is stored
- [ ] Check Redux DevTools for auth state
- [ ] Test logout functionality

### 3. API Integration Test

- [ ] Dashboard loads with stats
- [ ] Tenders list displays
- [ ] Tender details page works
- [ ] Bid creation flow
- [ ] Bid submission

### 4. Error Handling

- [ ] Invalid credentials show error toast
- [ ] Network errors handled gracefully
- [ ] Token expiry triggers refresh
- [ ] 403/401 errors redirect to login

## CORS Configuration

Ensure your backend allows requests from:
```
http://localhost:3001  (development)
https://your-production-domain.com  (production)
```

Backend CORS configuration:
```typescript
// In your NestJS backend
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
});
```

## Rate Limiting

Your backend implements role-based rate limiting:

- **ADMIN**: 5000 requests/hour
- **BUYER/MANAGER**: 2000 requests/hour
- **VENDOR**: 500 requests/hour
- **USER/FINANCE**: 1000 requests/hour

The frontend automatically handles 429 (Too Many Requests) responses.

## Troubleshooting

### Issue: "Network Error" or "Failed to fetch"

**Cause:** CORS not configured or API URL incorrect

**Solution:**
1. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
2. Verify backend CORS allows frontend origin
3. Check backend is running and accessible

### Issue: "401 Unauthorized" after login

**Cause:** Token not included in requests

**Solution:**
1. Check Redux DevTools → State → auth → token
2. Verify localStorage has token
3. Check Network tab → Request Headers for `Authorization`

### Issue: "403 Forbidden" on vendor registration

**Expected behavior:** Vendor accounts require admin verification

**Solution:**
1. Note the `userId` from registration response
2. Login as admin
3. Call verify endpoint: `PATCH /:tenant/auth/users/:userId/verify`

### Issue: "404 Not Found" on endpoints

**Cause:** Incorrect tenant slug

**Solution:**
1. Verify `NEXT_PUBLIC_TENANT` matches your backend tenant
2. Check backend logs for tenant resolution
3. Ensure tenant exists in database

## Development Workflow

1. **Start backend:**
   ```bash
   cd eproc-sourcing-backend
   npm run start:dev
   ```

2. **Start frontend:**
   ```bash
   cd eproc-vendor-portal
   npm run dev
   ```

3. **Access app:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api/v1
   - Swagger Docs: http://localhost:3000/api/v1/docs

## Production Deployment

### Environment Variables (Vercel/Netlify)

```env
NEXT_PUBLIC_API_URL=https://eproc-sourcing-backend.onrender.com/api/v1
NEXT_PUBLIC_TENANT=production
NEXT_PUBLIC_WS_URL=wss://eproc-sourcing-backend.onrender.com
NEXT_PUBLIC_ENVIRONMENT=production
```

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

## Security Notes

1. **Never commit `.env.local`** - Contains sensitive configuration
2. **Token storage** - Tokens in localStorage (consider httpOnly cookies for production)
3. **HTTPS required** - Production must use HTTPS
4. **Token refresh** - Implement automatic refresh before expiry (15 min default)

## Support

For backend-specific issues, refer to:
- `TECHNICAL_DOCUMENTATION.md` - Complete backend docs
- Backend Swagger UI - Interactive API documentation
- `docs/` folder in backend repo - Detailed endpoint docs

---

**Last Updated:** October 26, 2025  
**Compatible With:** eproc-sourcing-backend v2.0
