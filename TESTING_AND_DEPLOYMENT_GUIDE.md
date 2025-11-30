# Testing and Deployment Guide

## Overview
This guide provides comprehensive instructions for testing and deploying the e-Procurement Vendor Portal frontend implementation.

**Last Updated:** November 30, 2025

---

## 1. Pre-Deployment Checklist

### 1.1 Code Quality Verification
- [x] TypeScript compilation passes (`npm run type-check`)
- [ ] ESLint passes without errors (`npm run lint`)
- [ ] No console errors in browser developer tools
- [ ] All imports resolve correctly
- [ ] No unused variables or imports

### 1.2 Environment Setup
- [ ] `.env.local` configured with correct API URLs
- [ ] Backend API is running and accessible
- [ ] Database is properly seeded with test data
- [ ] Mock API server is available (if needed for development)

### 1.3 Dependencies
- [x] All dependencies installed (`npm install`)
- [x] No security vulnerabilities in dependencies
- [ ] Latest stable versions of critical packages

---

## 2. Testing Strategy

### 2.1 Manual Testing

#### Vendor Portal Testing

**Test User:**
- Email: `vendor@eproc.local`
- Password: `vendor123`
- Role: VENDOR

**Pages to Test:**

1. **Dashboard (`/vendor/dashboard`)**
   - [ ] Page loads without errors
   - [ ] Statistics cards display correctly
   - [ ] Recent activities show
   - [ ] Quick actions work
   - [ ] Mobile responsive

2. **Quotations (`/vendor/quotations`)**
   - [ ] List displays mock/real quotations
   - [ ] Search functionality works
   - [ ] Status filter works (ALL, DRAFT, SUBMITTED, ACCEPTED)
   - [ ] Edit button visible for drafts
   - [ ] View details link works
   - [ ] Empty state displays when no results
   - [ ] Mobile responsive

3. **Payments (`/vendor/payments`)**
   - [ ] Payment list displays
   - [ ] Search works
   - [ ] Status badges show correct colors
   - [ ] Transaction IDs display
   - [ ] Download button appears for completed payments
   - [ ] Total received amount is calculated correctly
   - [ ] Mobile responsive

4. **Performance (`/vendor/performance`)**
   - [ ] Overall score displays (0-100)
   - [ ] Progress bars animate correctly
   - [ ] Star ratings display
   - [ ] Performance history shows
   - [ ] Insights section displays recommendations
   - [ ] Mobile responsive

5. **Compliance (`/vendor/compliance`)**
   - [ ] Document list displays
   - [ ] Upload button works
   - [ ] Document type filters work
   - [ ] Status badges show correctly
   - [ ] Expiry alerts show for documents expiring < 30 days
   - [ ] Search works
   - [ ] Mobile responsive

6. **Settings (`/vendor/settings`)**
   - [ ] All 5 tabs load correctly (Notifications, Security, Preferences, API Keys, Language)
   - [ ] Toggle switches work
   - [ ] Select dropdowns work
   - [ ] Password change form displays
   - [ ] Save buttons appear
   - [ ] Mobile responsive

7. **Help & Support (`/vendor/help`)**
   - [ ] FAQ tab displays categories
   - [ ] FAQs expand/collapse correctly
   - [ ] Search filters FAQs
   - [ ] Documentation tab shows guide cards
   - [ ] Support ticket creation form works
   - [ ] Support ticket list displays
   - [ ] Mobile responsive

#### Business Portal Testing

**Test Users:**

Create test users for each role:
- USER (Procurement Officer)
- BUYER
- MANAGER
- FINANCE
- APPROVER

**Common Tests (All Roles):**

1. **Login & Authentication**
   - [ ] Login page loads (`/business/login`)
   - [ ] Login with valid credentials works
   - [ ] Invalid credentials show error
   - [ ] Token is stored in Redux
   - [ ] Redirect to dashboard after login

2. **Layout & Navigation**
   - [ ] Sidebar displays role-appropriate navigation items
   - [ ] Top navbar shows user name and role badge
   - [ ] Logout button works
   - [ ] Mobile menu opens/closes correctly
   - [ ] Active route is highlighted
   - [ ] Sidebar collapse works on desktop

3. **Dashboard (`/business/dashboard`)**
   - [ ] Role-specific statistics display
   - [ ] Quick actions show for user's role
   - [ ] Recent activities feed displays
   - [ ] Urgent sections show (APPROVER, FINANCE)
   - [ ] Mobile responsive

**USER Role Tests:**

4. **Tenders (`/business/tenders`)**
   - [ ] Tender list displays
   - [ ] Create Tender button visible
   - [ ] Search works
   - [ ] Status filter works
   - [ ] Statistics cards update
   - [ ] Pagination works
   - [ ] View tender details works
   - [ ] Mobile responsive

5. **Bids (`/business/bids`)**
   - [ ] Bid list displays
   - [ ] Filter by tender works
   - [ ] Score bid functionality visible
   - [ ] Bid details view works
   - [ ] Mobile responsive

**BUYER Role Tests:**

6. **Contracts (`/business/contracts`)**
   - [ ] Contract list displays
   - [ ] Create Contract button visible
   - [ ] Search and filter work
   - [ ] Contract details view works
   - [ ] Status management works
   - [ ] Mobile responsive

7. **Purchase Requisitions (`/business/requisitions`)**
   - [ ] PR list displays
   - [ ] Create PR button visible
   - [ ] Status filter works
   - [ ] Search works
   - [ ] View PR details works
   - [ ] Mobile responsive

8. **Purchase Orders (`/business/purchase-orders`)**
   - [ ] PO list displays
   - [ ] Create PO button visible
   - [ ] Search and filter work
   - [ ] Vendor assignment option visible
   - [ ] View PO details works
   - [ ] Mobile responsive

9. **Vendors (`/business/vendors`)**
   - [ ] Vendor directory displays
   - [ ] Search works
   - [ ] Vendor status management works
   - [ ] Performance link works
   - [ ] Mobile responsive

**MANAGER Role Tests:**

10. **Approvals (`/business/approvals`)**
    - [ ] Approval queue displays
    - [ ] Filter by type (PR, PO, Invoice, Payment)
    - [ ] Approve button works
    - [ ] Reject button works
    - [ ] Approval history link works
    - [ ] Mobile responsive

11. **Approval History (`/business/approvals/history`)**
    - [ ] Historical approvals display
    - [ ] Filter by date range works
    - [ ] Filter by type works
    - [ ] Approver information shows
    - [ ] Mobile responsive

**FINANCE Role Tests:**

12. **Invoices (`/business/invoices`)**
    - [ ] Invoice list displays
    - [ ] Create invoice button visible (if allowed)
    - [ ] Approval workflow works
    - [ ] Status filter works
    - [ ] Payment link works
    - [ ] Mobile responsive

13. **Payments (`/business/payments`)**
    - [ ] Payment queue displays
    - [ ] Process payment button visible
    - [ ] Approve payment works
    - [ ] Payment history displays
    - [ ] Search works
    - [ ] Mobile responsive

14. **Budgets (`/business/budgets`)**
    - [ ] Budget overview displays
    - [ ] Create/allocate budget button visible
    - [ ] Budget transfer functionality works
    - [ ] Utilization tracking displays
    - [ ] Mobile responsive

**APPROVER Role Tests:**

15. **Pending Approvals Dashboard**
    - [ ] All pending items show in dashboard alert
    - [ ] Quick links to approval pages work
    - [ ] Counts are accurate

### 2.2 Automated Testing

#### Unit Tests (Recommended)
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# Run tests
npm test
```

**What to Test:**
- Permission utility functions (`utils/permissions.ts`)
- Navigation configuration logic (`config/business-navigation.ts`)
- Redux slices
- API slice configurations

#### E2E Tests with Cypress (Recommended)
```bash
# Install Cypress
npm install --save-dev cypress

# Open Cypress
npx cypress open
```

**Critical User Flows to Test:**
1. Vendor login → View tenders → Submit bid → View bid status
2. USER login → Create tender → Publish tender → View bids
3. BUYER login → Create PR → Create PO → Assign vendor
4. MANAGER login → Approve PR → Approve PO → Approve Invoice
5. FINANCE login → Approve invoice → Process payment
6. APPROVER login → View approvals → Approve items

### 2.3 Accessibility Testing
```bash
# Install axe-core
npm install --save-dev @axe-core/react

# Run accessibility audit in browser console
```

**Check for:**
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] ARIA labels on interactive elements
- [ ] Color contrast ratios (WCAG AA)
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatibility

### 2.4 Performance Testing

**Tools:**
- Lighthouse (Chrome DevTools)
- WebPageTest
- GTmetrix

**Metrics to Monitor:**
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Time to Interactive (TTI) < 3.8s
- [ ] Total Blocking Time (TBT) < 200ms

### 2.5 Cross-Browser Testing

**Browsers to Test:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 2.6 Responsive Design Testing

**Breakpoints to Test:**
- [ ] Mobile: 320px - 640px
- [ ] Tablet: 641px - 1024px
- [ ] Desktop: 1025px - 1920px
- [ ] Large Desktop: 1921px+

**Test on Real Devices:**
- [ ] iPhone (Safari)
- [ ] Android phone (Chrome)
- [ ] iPad (Safari)
- [ ] Android tablet (Chrome)

---

## 3. Backend Integration Testing

### 3.1 API Endpoint Verification

**Vendor Portal Endpoints:**
```bash
# Tenders
GET /api/v1/tenders?status=PUBLISHED

# Bids
GET /api/v1/bids?vendorId={vendorId}
POST /api/v1/bids

# Contracts
GET /api/v1/contracts?vendorId={vendorId}

# Invoices
GET /api/v1/invoices?vendorId={vendorId}
POST /api/v1/invoices

# Payments
GET /api/v1/payments?vendorId={vendorId}

# Quotations
GET /api/v1/quotations?vendorId={vendorId}
POST /api/v1/quotations

# Compliance
GET /api/v1/vendors/compliance
POST /api/v1/vendors/compliance

# Performance
GET /api/v1/vendors/performance
```

**Business Portal Endpoints:**
```bash
# Dashboard
GET /api/v1/statistics/dashboard

# Tenders
GET /api/v1/tenders
POST /api/v1/tenders
PATCH /api/v1/tenders/{id}
POST /api/v1/tenders/{id}/publish

# Purchase Requisitions
GET /api/v1/purchase-requisitions
POST /api/v1/purchase-requisitions
POST /api/v1/purchase-requisitions/{id}/approve

# Purchase Orders
GET /api/v1/purchase-orders
POST /api/v1/purchase-orders
POST /api/v1/purchase-orders/{id}/approve
POST /api/v1/purchase-orders/{id}/vendors

# Contracts
GET /api/v1/contracts
POST /api/v1/contracts
PATCH /api/v1/contracts/{id}

# Invoices
GET /api/v1/invoices
POST /api/v1/invoices
POST /api/v1/invoices/{id}/approve

# Payments
GET /api/v1/payments
POST /api/v1/payments
POST /api/v1/payments/{id}/process
POST /api/v1/payments/{id}/approve

# Budgets
GET /api/v1/budgets
POST /api/v1/budgets
POST /api/v1/budgets/{id}/transfer

# Vendors
GET /api/v1/vendors/business
GET /api/v1/vendors/business/{id}/performance
```

### 3.2 Error Handling Verification

**Test Scenarios:**
- [ ] 401 Unauthorized → Redirects to login
- [ ] 403 Forbidden → Shows access denied message
- [ ] 404 Not Found → Shows not found message
- [ ] 500 Server Error → Shows error message, retry option
- [ ] Network timeout → Shows network error message
- [ ] Invalid data → Shows validation errors

---

## 4. Security Testing

### 4.1 RBAC Verification

**Vendor Role:**
- [ ] Cannot access `/business/*` routes
- [ ] Cannot create tenders
- [ ] Can only see own bids
- [ ] Can only see own contracts
- [ ] Can only see own invoices
- [ ] Can only see own payments

**Business User Roles:**
- [ ] Cannot access `/vendor/*` routes
- [ ] USER can create tenders
- [ ] BUYER can create PRs/POs
- [ ] MANAGER can approve PRs/POs/Invoices
- [ ] FINANCE can process payments
- [ ] APPROVER sees only approval queue

### 4.2 Authentication Security
- [ ] JWT token stored securely
- [ ] Token refresh works
- [ ] Logout clears token
- [ ] Protected routes redirect to login
- [ ] CSRF protection enabled
- [ ] XSS protection in place

### 4.3 Data Validation
- [ ] Input sanitization works
- [ ] File upload restrictions enforced
- [ ] SQL injection prevention
- [ ] Rate limiting in place

---

## 5. Deployment

### 5.1 Environment Variables

Create `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://api.eproc.yourdomain.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.eproc.yourdomain.com
NEXT_PUBLIC_UPLOAD_URL=https://api.eproc.yourdomain.com/uploads
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ENVIRONMENT=production
```

### 5.2 Build for Production
```bash
# Build the application
npm run build

# Start production server (local test)
npm start

# Test production build locally
# Should be accessible at http://localhost:3000
```

### 5.3 Deployment Options

#### Option A: Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Option B: Docker
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build Docker image
docker build -t eproc-vendor-portal .

# Run container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.eproc.yourdomain.com/api/v1 eproc-vendor-portal
```

#### Option C: Traditional Server (PM2)
```bash
# Install PM2
npm install -g pm2

# Build
npm run build

# Start with PM2
pm2 start npm --name "eproc-vendor-portal" -- start

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 5.4 Nginx Configuration (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name eproc.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# SSL Configuration (after obtaining certificate)
server {
    listen 443 ssl http2;
    server_name eproc.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/eproc.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eproc.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 6. Post-Deployment Monitoring

### 6.1 Health Checks
- [ ] Application is accessible
- [ ] API connectivity works
- [ ] Database connections stable
- [ ] Login works
- [ ] Critical user flows work

### 6.2 Monitoring Tools

**Application Performance Monitoring (APM):**
- Sentry (errors and performance)
- New Relic
- Datadog
- LogRocket (session replay)

**Setup Sentry:**
```bash
npm install @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard -i nextjs
```

**Infrastructure Monitoring:**
- Uptime monitoring (UptimeRobot, Pingdom)
- Server monitoring (CloudWatch, Prometheus)
- Log aggregation (ELK stack, Papertrail)

### 6.3 Metrics to Monitor
- [ ] Response time (< 200ms average)
- [ ] Error rate (< 1%)
- [ ] Uptime (> 99.9%)
- [ ] CPU usage (< 70%)
- [ ] Memory usage (< 80%)
- [ ] Database query performance

---

## 7. Rollback Plan

### 7.1 Vercel Rollback
```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

### 7.2 Docker Rollback
```bash
# Tag previous working image
docker tag eproc-vendor-portal:latest eproc-vendor-portal:backup

# Rollback to previous image
docker pull eproc-vendor-portal:previous-tag
docker stop eproc-vendor-portal
docker rm eproc-vendor-portal
docker run -d --name eproc-vendor-portal -p 3000:3000 eproc-vendor-portal:previous-tag
```

### 7.3 PM2 Rollback
```bash
# Keep backup of previous build
cp -r .next .next.backup

# Restore if needed
rm -rf .next
mv .next.backup .next
pm2 restart eproc-vendor-portal
```

---

## 8. Documentation

### 8.1 User Documentation
- [ ] User manuals for each role
- [ ] Video tutorials for common tasks
- [ ] FAQ documentation
- [ ] Troubleshooting guide

### 8.2 Technical Documentation
- [ ] API integration guide
- [ ] Architecture diagrams
- [ ] Database schema
- [ ] Deployment procedures
- [ ] Maintenance procedures

---

## 9. Training

### 9.1 Vendor Training
- How to register/login
- How to browse tenders
- How to submit bids
- How to manage contracts
- How to submit invoices
- How to track payments

### 9.2 Internal User Training

**USER (Procurement Officer):**
- How to create tenders
- How to evaluate bids
- How to generate reports

**BUYER:**
- How to create contracts
- How to create PRs and POs
- How to manage vendors

**MANAGER:**
- How to approve PRs/POs
- How to manage budgets
- How to oversee workflows

**FINANCE:**
- How to approve invoices
- How to process payments
- How to manage budgets

**APPROVER:**
- How to review approval queue
- How to approve/reject items

---

## 10. Maintenance Schedule

### 10.1 Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review performance metrics

### 10.2 Weekly
- [ ] Review user feedback
- [ ] Check for security updates
- [ ] Database backup verification

### 10.3 Monthly
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization
- [ ] User acceptance testing for new features

### 10.4 Quarterly
- [ ] Comprehensive security review
- [ ] Accessibility audit
- [ ] Load testing
- [ ] Disaster recovery drill

---

## 11. Troubleshooting

### Common Issues

**Issue: White screen / Page not loading**
- Check browser console for errors
- Verify API URL is correct
- Check network tab for failed requests
- Clear browser cache

**Issue: Login not working**
- Verify credentials are correct
- Check API is running
- Verify JWT token generation
- Check CORS settings

**Issue: 401 Unauthorized errors**
- Token expired → Refresh token
- Token invalid → Re-login
- Check Authorization header

**Issue: 403 Forbidden errors**
- User doesn't have permission
- Check RBAC configuration
- Verify user role is correct

**Issue: Slow performance**
- Check network latency
- Review database queries
- Optimize images
- Enable caching
- Use CDN for static assets

---

**Deployment Checklist Complete:** [ ]
**Production Ready:** [ ]
**Monitoring Enabled:** [ ]
**Documentation Complete:** [ ]

**Last Updated:** November 30, 2025
