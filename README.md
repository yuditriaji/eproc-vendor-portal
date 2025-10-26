# E-Procurement Vendor Portal

Enterprise-grade procurement platform built with **Next.js 15**, **shadcn/ui**, and **TypeScript**.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router) with Turbopack
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: Redux Toolkit + RTK Query
- **Forms**: React Hook Form + Yup validation
- **Tables**: TanStack Table (React Table v8)
- **Notifications**: Sonner
- **Icons**: Lucide React
- **Theme**: next-themes (dark/light mode)
- **Date Handling**: date-fns

## 📁 Project Structure

```
eproc-vendor-portal/
├── app/                      # Next.js 15 App Router
│   ├── vendor/
│   │   ├── (auth)/          # Auth routes (login, register)
│   │   └── dashboard/        # Protected vendor dashboard
│   ├── layout.tsx           # Root layout with providers
│   └── globals.css          # Global styles with Tailwind
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components
│   └── providers/           # Redux & Theme providers
├── store/
│   ├── api/                 # RTK Query API endpoints
│   │   ├── baseApi.ts      # Base API configuration
│   │   ├── authApi.ts      # Authentication endpoints
│   │   └── procurementApi.ts # Tender/Bid endpoints
│   ├── slices/             # Redux slices
│   │   └── authSlice.ts    # Auth state management
│   └── store.ts            # Store configuration
├── lib/                     # Utility functions
│   ├── utils.ts            # cn() for Tailwind
│   └── formatters.ts       # Currency, date formatters
├── types/                   # TypeScript definitions
│   └── index.ts            # Shared types
└── public/                  # Static assets
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yuditriaji/eproc-vendor-portal.git
   cd eproc-vendor-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and configure your API URLs:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   NEXT_PUBLIC_WS_URL=ws://localhost:3000
   NEXT_PUBLIC_TENANT=default
   NEXT_PUBLIC_UPLOAD_URL=http://localhost:3000/uploads
   NEXT_PUBLIC_MAX_FILE_SIZE=10485760
   NEXT_PUBLIC_ENVIRONMENT=development
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📜 Available Scripts

- **`npm run dev`** - Start development server with Turbopack
- **`npm run build`** - Build for production
- **`npm start`** - Start production server
- **`npm run lint`** - Run ESLint
- **`npm run type-check`** - Run TypeScript type checking

## 🎨 Design System

### Color Palette

- **Primary**: Blue (#3b82f6) - Professional, trustworthy
- **Secondary**: Slate - Modern, clean
- **Success**: Green (#22c55e)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)
- **Info**: Sky (#0ea5e9)

### Theme

- **Default**: Dark mode (professional, reduces eye strain)
- **Alternative**: Light mode available via theme toggle
- **Glassmorphism**: Subtle backdrop blur effects for modern UI

## 🔐 Authentication

The authentication system uses JWT tokens with the following flow:

1. User logs in at `/vendor/login`
2. API returns JWT token and user data (from `/:tenant/auth/login`)
3. Token stored in localStorage and Redux store
4. Protected routes check authentication status
5. Token included in all API requests via RTK Query

### Multi-Tenant API Structure

All API requests are sent to:
```
{BASE_URL}/api/v1/{tenant}/{resource}
```

Example:
```
POST https://api.example.com/api/v1/default/auth/login
GET  https://api.example.com/api/v1/default/tenders
```

The tenant slug is configured via `NEXT_PUBLIC_TENANT` environment variable.

### Test Credentials

Use your admin account credentials to test. VENDOR accounts require ADMIN verification before they can login.

## 📡 API Integration

### Base API Configuration

All API endpoints are configured through RTK Query with automatic:
- Token injection
- Request retries
- Cache management
- Loading states
- Error handling

### Available Endpoints

**Authentication:**
- `POST /:tenant/auth/login` - User login
- `POST /:tenant/auth/register` - User registration (VENDOR requires admin verification)
- `PATCH /:tenant/auth/users/:userId/verify` - Verify vendor account (ADMIN only)
- `POST /:tenant/auth/logout` - User logout
- `GET /:tenant/auth/me` - Get current user
- `POST /:tenant/auth/refresh` - Refresh token

**Procurement:**
- `GET /:tenant/tenders` - List tenders (with pagination/filters)
- `GET /:tenant/tenders/:id` - Get tender details
- `GET /:tenant/bids` - List user bids
- `POST /:tenant/bids` - Create bid
- `PUT /:tenant/bids/:id` - Update bid
- `POST /:tenant/bids/:id/submit` - Submit bid
- `GET /:tenant/dashboard/stats` - Dashboard statistics

**Note:** Replace `:tenant` with your actual tenant slug (configured in `NEXT_PUBLIC_TENANT`).

## 🧩 Key Features Implemented

### ✅ Foundation (Complete)

- [x] Next.js 15 with App Router & Turbopack
- [x] TypeScript with strict mode
- [x] Tailwind CSS 4.0 with custom design tokens
- [x] shadcn/ui components (Button, Input, Card, Label, Badge)
- [x] Redux Toolkit + RTK Query setup
- [x] Authentication state management
- [x] API layer with interceptors
- [x] Theme provider (dark/light mode)
- [x] Toast notifications (Sonner)
- [x] Authentication layout with glassmorphism
- [x] Login page with React Hook Form + Yup validation
- [x] Dashboard page (basic)
- [x] Environment configuration
- [x] Type definitions

### 🚧 To Be Implemented

See `UI_UX_IMPLEMENTATION_PLAN.md` for the complete roadmap:

- [ ] Main application layout (Sidebar + Top Navbar)
- [ ] Sidebar navigation with all sections
- [ ] Complete dashboard with real data
- [ ] Tenders list page with DataTable
- [ ] Tender detail page
- [ ] Bid submission flow (multi-step)
- [ ] My Bids page
- [ ] Contracts page
- [ ] Profile settings
- [ ] Middleware for route protection
- [ ] Mobile responsiveness optimization
- [ ] Additional shadcn/ui components as needed

## 📖 Development Guidelines

### Component Development

- Use shadcn/ui components as base
- Extend with custom variants when needed
- Follow TypeScript strict mode
- Use Tailwind CSS utility classes
- Implement responsive design (mobile-first)

### State Management

- Use RTK Query for server state
- Use Redux slices for client state
- Minimize global state (prefer component state)
- Cache API responses appropriately

### Code Style

- Follow ESLint configuration
- Use TypeScript for all files
- Name components with PascalCase
- Name functions with camelCase
- Use explicit types (avoid `any`)

## 🐛 Troubleshooting

### Common Issues

**1. Module not found errors**
```bash
npm install
# or
rm -rf node_modules package-lock.json && npm install
```

**2. Type errors**
```bash
npm run type-check
```

**3. Build errors**
```bash
rm -rf .next
npm run build
```

## 📝 License

ISC License

## 👥 Contributors

- Yudi Tri Aji

## 📮 Support

For issues and questions, please use the GitHub issue tracker.

---

**Version**: 2.0.0  
**Last Updated**: October 26, 2025  
**Built with**: Next.js 15 + shadcn/ui
