# Deployment Guide - Multi-Tenant Subdomain Architecture

## Overview

This application implements **subdomain-based multi-tenancy** where each tenant is accessed via their unique subdomain:

- **Acme Corp** (tenant: `acme`) → `acme.synnova.com`
- **Global Inc** (tenant: `global`) → `global.synnova.com`
- **Tech Solutions** (tenant: `techsol`) → `techsol.synnova.com`

The tenant slug is automatically extracted from the subdomain and used for all API requests.

## How It Works

### Architecture Flow

```
User visits: acme.synnova.com
     ↓
Next.js Middleware extracts tenant: "acme"
     ↓
Frontend makes API calls to: /api/v1/acme/auth/login
     ↓
Backend processes request for tenant "acme"
```

### Automatic Tenant Detection

The application uses three layers to detect the tenant:

1. **Middleware** (`middleware.ts`): Extracts tenant from hostname, adds to request headers
2. **Client-side utility** (`lib/tenant.ts`): Provides tenant info to React components
3. **API client** (`store/api/baseApi.ts`): Automatically includes tenant in all API URLs

## Development Setup

### Option 1: Using localhost with environment variable

```bash
# .env.local
NEXT_PUBLIC_TENANT=acme
```

Access: `http://localhost:3001`  
API calls go to: `/api/v1/acme/*`

### Option 2: Using subdomain on localhost

1. **Edit hosts file:**
   ```bash
   sudo nano /etc/hosts
   ```

2. **Add entries:**
   ```
   127.0.0.1  acme.localhost
   127.0.0.1  global.localhost
   127.0.0.1  techsol.localhost
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

4. **Access via subdomain:**
   - `http://acme.localhost:3001` → Tenant: "acme"
   - `http://global.localhost:3001` → Tenant: "global"
   - `http://techsol.localhost:3001` → Tenant: "techsol"

## Production Deployment

### Prerequisites

1. **Domain**: `synnova.com` (or your custom domain)
2. **DNS**: Wildcard subdomain configured
3. **SSL**: Wildcard SSL certificate
4. **Backend**: Running and accessible

### Deployment Platforms

#### Option A: Vercel (Recommended)

**1. Configure Vercel Project:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**2. Environment Variables (Vercel Dashboard):**

```env
NEXT_PUBLIC_API_URL=https://eproc-sourcing-backend.onrender.com/api/v1
NEXT_PUBLIC_WS_URL=wss://eproc-sourcing-backend.onrender.com
NEXT_PUBLIC_UPLOAD_URL=https://eproc-sourcing-backend.onrender.com/uploads
NEXT_PUBLIC_ENVIRONMENT=production
```

**Note:** Do NOT set `NEXT_PUBLIC_TENANT` in production - it will be auto-detected from subdomain.

**3. Configure Custom Domain in Vercel:**

- Go to Project Settings → Domains
- Add: `*.synnova.com` (wildcard domain)
- Vercel will provide DNS records

**4. DNS Configuration:**

Add these records to your DNS provider:

```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
CNAME   *       cname.vercel-dns.com
```

**5. SSL Certificate:**

Vercel automatically provisions wildcard SSL certificates for `*.synnova.com`

#### Option B: Netlify

**1. Build Settings:**

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_PUBLIC_API_URL = "https://eproc-sourcing-backend.onrender.com/api/v1"
  NEXT_PUBLIC_ENVIRONMENT = "production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**2. Domain Configuration:**

- Add custom domain: `*.synnova.com`
- Netlify provides DNS records

**3. DNS Setup:**

```
Type    Name    Value
A       @       75.2.60.5 (Netlify IP)
CNAME   *       apex-loadbalancer.netlify.com
```

#### Option C: Custom Server (Docker + Nginx)

**1. Build Docker Image:**

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
EXPOSE 3001
CMD ["npm", "start"]
```

**2. Nginx Configuration:**

```nginx
# /etc/nginx/sites-available/synnova.com

server {
    listen 80;
    server_name *.synnova.com synnova.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name *.synnova.com synnova.com;

    # Wildcard SSL Certificate
    ssl_certificate /etc/letsencrypt/live/synnova.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/synnova.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**3. Docker Compose:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_URL=https://eproc-sourcing-backend.onrender.com/api/v1
      - NEXT_PUBLIC_ENVIRONMENT=production
    restart: unless-stopped
```

**4. Deploy:**

```bash
docker-compose up -d
```

### Wildcard SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate wildcard certificate
sudo certbot certonly \
  --manual \
  --preferred-challenges=dns \
  --email admin@synnova.com \
  --agree-tos \
  -d synnova.com \
  -d *.synnova.com
```

Follow the prompts to add TXT records to your DNS.

## DNS Configuration

### Required DNS Records

For domain: `synnova.com`

```
Type    Name    Value                           TTL
A       @       <your-server-ip>                3600
CNAME   *       synnova.com                     3600
CNAME   www     synnova.com                     3600
TXT     @       "v=spf1 -all"                   3600
```

### Verification

After DNS propagation (5-60 minutes), test:

```bash
# Check subdomain resolution
dig acme.synnova.com
dig global.synnova.com

# Check wildcard
dig randomname.synnova.com
```

All should resolve to your server IP.

## Testing Multi-Tenancy

### 1. Test Tenant Detection

Visit different subdomains:

```
acme.synnova.com/vendor/login → API calls: /api/v1/acme/
global.synnova.com/vendor/login → API calls: /api/v1/global/
```

### 2. Verify API Calls

Open Browser DevTools → Network tab:

```
Request URL: https://backend.com/api/v1/acme/auth/login
```

The tenant slug should match the subdomain.

### 3. Test Multiple Tenants

1. Login to `acme.synnova.com` with Acme Corp admin
2. Open new incognito window
3. Login to `global.synnova.com` with Global Inc admin
4. Verify both sessions are isolated

## Environment Variables Reference

### Production (All Platforms)

```env
# REQUIRED
NEXT_PUBLIC_API_URL=https://your-backend.com/api/v1
NEXT_PUBLIC_ENVIRONMENT=production

# OPTIONAL
NEXT_PUBLIC_WS_URL=wss://your-backend.com
NEXT_PUBLIC_UPLOAD_URL=https://your-backend.com/uploads
NEXT_PUBLIC_MAX_FILE_SIZE=10485760

# DO NOT SET IN PRODUCTION (auto-detected from subdomain)
# NEXT_PUBLIC_TENANT=<leave empty>
```

### Development

```env
# REQUIRED
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_TENANT=default

# OPTIONAL
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_UPLOAD_URL=http://localhost:3000/uploads
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ENVIRONMENT=development
```

## Troubleshooting

### Issue: Subdomain not working locally

**Solution:**
Edit `/etc/hosts` (Mac/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1  acme.localhost
```

### Issue: SSL certificate errors in production

**Solution:**
- Ensure wildcard SSL covers `*.synnova.com`
- Verify certificate chain is complete
- Check certificate expiry

### Issue: Wrong tenant detected

**Solution:**
- Clear browser cache
- Check middleware is running: Network tab → Response Headers → `x-tenant`
- Verify DNS is pointing to correct server

### Issue: API returns 404

**Cause:** Tenant doesn't exist in backend

**Solution:**
1. Verify tenant exists in backend database
2. Check tenant slug spelling matches subdomain
3. Test backend directly: `curl https://backend.com/api/v1/acme/health`

## Backend CORS Configuration

Ensure backend allows wildcard subdomains:

```typescript
// NestJS example
app.enableCors({
  origin: [
    /^https?:\/\/.*\.synnova\.com$/,  // Wildcard subdomains
    'http://localhost:3001',           // Development
  ],
  credentials: true,
});
```

## Monitoring & Analytics

### Track Tenant Usage

Add tenant tracking to analytics:

```typescript
// Google Analytics
gtag('config', 'GA_MEASUREMENT_ID', {
  custom_map: {
    dimension1: 'tenant'
  }
});

gtag('event', 'page_view', {
  tenant: getTenantFromHostname()
});
```

### Logging

Log tenant with every request:

```typescript
console.log(`[${getTenantFromHostname()}] User action:`, action);
```

## Security Considerations

1. **Tenant Isolation**: Each tenant's data is isolated via backend `tenantId`
2. **CSRF Protection**: Enabled in Next.js by default
3. **XSS Prevention**: React's built-in protection
4. **SSL Required**: Force HTTPS in production
5. **Rate Limiting**: Backend implements per-tenant limits

## Performance Optimization

1. **CDN**: Use Vercel Edge Network or Cloudflare
2. **Caching**: Static assets cached at edge
3. **Compression**: Gzip/Brotli enabled
4. **Code Splitting**: Automatic per route

## Rollback Plan

If deployment fails:

```bash
# Vercel
vercel rollback

# Docker
docker-compose down
docker-compose up -d --build

# Nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

**Last Updated:** October 26, 2025  
**Next.js Version:** 15.x  
**Deployment:** Multi-tenant subdomain architecture
