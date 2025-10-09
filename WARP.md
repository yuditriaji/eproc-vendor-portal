# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
```bash
# Start development server (runs on port 3001)
npm run dev

# Start mock API server (runs on port 3000, required for development)
node mock-api-server.js

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install
```

### Test Credentials
- Email: `vendor@eproc.local`
- Password: `vendor123`

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 4.0
- **State Management**: Redux Toolkit with RTK Query
- **Forms**: React Hook Form with Yup validation
- **UI Components**: Custom components with glassmorphism design
- **PWA**: next-pwa with offline support

### Project Structure
```
src/
├── app/                    # Next.js 15 App Router
│   ├── vendor/            # Vendor-specific routes
│   │   ├── login/         # Authentication pages
│   │   ├── register/      
│   │   └── dashboard/     # Protected vendor dashboard
│   ├── layout.tsx         # Root layout with Redux provider
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── store/                 # Redux store configuration
│   ├── api/              # RTK Query API definitions
│   │   └── baseApi.ts    # Base API with auth & retry logic
│   └── slices/           # Redux state slices
├── middleware/           # Next.js middleware
│   └── auth.ts          # Authentication middleware
├── types/               # TypeScript definitions
├── utils/               # Utility functions
└── config/              # Configuration files
```

### Key Architecture Patterns

#### Authentication System
- JWT-based authentication with automatic token refresh
- Protected routes via Next.js middleware
- Redux state management for auth status
- Secure cookie handling with CSP headers

#### API Layer
- RTK Query for data fetching with caching
- Base query with automatic retry and token refresh
- Centralized error handling and loading states
- Mock API server for development

#### State Management
- Redux Toolkit with RTK Query for server state
- Separate slices for auth and UI state
- Optimistic updates and cache invalidation
- TypeScript integration with proper typing

#### Component Architecture  
- Functional components with React hooks
- TypeScript interfaces for all props
- Tailwind CSS with responsive design
- Glassmorphism UI with backdrop blur effects

#### Security Implementation
- Content Security Policy headers
- XSS protection and input sanitization
- Secure authentication headers
- CORS configuration for API calls

### File Upload System
- FilePond integration for file uploads
- Client-side validation (size, type)
- Progress tracking and error handling
- Secure upload endpoints

### PWA Features
- Service worker for offline functionality
- App manifest for installation
- Background sync capabilities
- Workbox integration for caching

## Development Notes

### TypeScript Configuration
- Strict mode enabled with comprehensive checks
- Path aliases configured for clean imports (`@/components`, `@/store`, etc.)
- Exact optional property types enforced
- No unused locals/parameters allowed

### API Integration
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (defaults to http://localhost:3000/api/v1)
- All endpoints expect JWT Bearer token
- Mock server provides complete development API
- GraphQL support via Apollo Client (installed but not actively used)

### Styling Guidelines
- Tailwind CSS with custom configuration
- Glassmorphism design system
- Responsive-first approach
- Consistent color palette (blue primary, indigo secondary)

### Security Headers
- CSP configured in next.config.mjs
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- XSS Protection enabled

### Environment Variables Required
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_UPLOAD_URL=http://localhost:3000/uploads
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ENVIRONMENT=development
```

### Testing Setup
- Jest and Testing Library dependencies installed
- Cypress for E2E testing
- Axe-core for accessibility testing
- No test configuration files present (tests need setup)

### Code Quality
- ESLint with Next.js configuration
- TypeScript strict mode
- Conventional commit message format preferred
- Code follows React and Next.js best practices

## Development Workflow

### Adding New Features
1. Create feature branch
2. Update types in `src/types/index.ts` if needed
3. Add API endpoints to appropriate slice in `src/store/api/`
4. Create components with proper TypeScript interfaces
5. Add routes to `src/app/` using App Router
6. Test with mock API server

### Common Patterns
- Use RTK Query hooks for data fetching
- Implement proper loading and error states
- Follow existing naming conventions
- Use Tailwind classes consistently
- Add proper TypeScript types for all new code

### Mock API Server
- Complete authentication simulation
- Tender and bid management endpoints
- File upload simulation
- CORS configured for localhost:3001
- Logging for development debugging

### Performance Considerations
- Next.js automatic code splitting
- Image optimization enabled
- Font preloading configured
- Bundle analysis available
- Lazy loading for components