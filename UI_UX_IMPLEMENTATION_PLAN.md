# E-Procurement Vendor Portal - UI/UX Implementation Plan

**Version**: 2.0  
**Date**: October 26, 2025  
**Target**: Enterprise Multi-tenant E-Procurement Platform  
**Component Framework**: shadcn/ui + Radix UI + TanStack Table

---

## Table of Contents

1. [Design System Overview](#1-design-system-overview)
2. [Component Framework Strategy](#2-component-framework-strategy)
3. [Layout Architecture](#3-layout-architecture)
4. [Color Palette & Theme](#4-color-palette--theme)
5. [Component Library](#5-component-library)
6. [Page Implementations](#6-page-implementations)
7. [Responsive Design Strategy](#7-responsive-design-strategy)
8. [Implementation Roadmap](#8-implementation-roadmap)

---

## 1. Design System Overview

### 1.1 Design Philosophy

**Enterprise-Grade Principles:**
- **Professional & Trustworthy**: Clean, minimal design suitable for B2B procurement
- **Data-Dense Interface**: Efficient information display with proper hierarchy
- **Accessibility First**: WCAG 2.1 AA compliance minimum
- **Performance Optimized**: Fast load times, optimized for complex data operations

**Visual Style:**
- **Glassmorphism with Enterprise Touch**: Subtle backdrop blur effects with professional color palette
- **Card-Based Layout**: Clear content separation and organization
- **Consistent Spacing**: 4px/8px grid system
- **Icon System**: Lucide React icons for consistency

### 1.2 Technology Stack Integration

- **Framework**: Next.js 15 App Router with Turbopack
- **Styling**: Tailwind CSS 4.0 with custom design tokens
- **Component Framework**: shadcn/ui (copy-paste components)
- **UI Primitives**: Radix UI (accessible, headless components)
- **Data Tables**: TanStack Table (React Table v8)
- **State Management**: Redux Toolkit + RTK Query
- **Forms**: React Hook Form + Yup validation
- **Notifications**: Sonner (toast notifications)
- **File Upload**: react-dropzone
- **Date Handling**: date-fns
- **Charts**: Recharts (lightweight, Tailwind-compatible)
- **Icons**: Lucide React
- **Animations**: Tailwind CSS animations + Framer Motion (selective)

---

## 2. Component Framework Strategy

### 2.1 Why shadcn/ui?

**Decision**: shadcn/ui + Radix UI + TanStack Table

**Key Reasons:**
1. ✅ **Perfect Stack Alignment**: Built for Next.js 15, Tailwind CSS 4.0, TypeScript
2. ✅ **Full Ownership**: Components live in YOUR codebase, complete customization
3. ✅ **Minimal Bundle Size**: ~50KB vs 400-600KB (Ant Design/Carbon)
4. ✅ **Design Freedom**: Enables glassmorphism vision without design lock-in
5. ✅ **Performance**: Excellent Core Web Vitals, PWA-ready
6. ✅ **No Conflicts**: Native Tailwind integration, no CSS system battles
7. ✅ **Modern Architecture**: Server Components ready, streaming support
8. ✅ **Accessibility**: Built on Radix UI (WAI-ARIA compliant)
9. ✅ **No Vendor Lock-In**: No breaking updates from external vendors
10. ✅ **Future-Proof**: Latest React patterns, maintained by Vercel ecosystem

### 2.2 Component Stack

```typescript
// Core UI Components
shadcn/ui                      // Base components (Button, Input, Card, etc.)
  + Radix UI                   // Accessible primitives (Dialog, Dropdown, etc.)
  + Tailwind CSS               // Styling (already in stack)

// Complex Components
TanStack Table                 // Advanced data tables with sorting, filtering, pagination
  + shadcn/ui table            // Base table styling

// Forms
React Hook Form                // Already in stack ✅
  + Yup                        // Already in stack ✅
  + shadcn/ui form             // Form components

// Additional Libraries
react-dropzone                 // File uploads
date-fns                       // Date utilities
sonner                         // Toast notifications
recharts                       // Lightweight charts
lucide-react                   // Icons (already in stack)
```

### 2.3 Installation & Setup

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Configure:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - Tailwind config: Yes
# - Import alias: @/components

# Install core components
npx shadcn-ui@latest add button input card table
npx shadcn-ui@latest add dialog dropdown-menu tooltip
npx shadcn-ui@latest add form label checkbox radio-group select
npx shadcn-ui@latest add badge tabs separator sheet skeleton
npx shadcn-ui@latest add alert breadcrumb

# Install additional dependencies
npm install @tanstack/react-table
npm install sonner
npm install react-dropzone
npm install recharts
```

### 2.4 Custom Component Extensions

```typescript
// src/components/ui/glass-card.tsx
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function GlassCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        'backdrop-blur-xl bg-white/10 dark:bg-slate-900/50',
        'border border-white/20 dark:border-slate-700/50',
        'shadow-xl shadow-black/10',
        className
      )}
      {...props}
    />
  );
}
```

---

## 3. Layout Architecture

### 3.1 Authentication Layout (Public)

**Reference**: Login-Layout screenshot

**Structure:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    Logo/Branding                    │
│                                                     │
│            ┌───────────────────┐                   │
│            │                   │                   │
│            │   Login Form      │                   │
│            │   - Username      │                   │
│            │   - Password      │                   │
│            │   - Remember Me   │                   │
│            │   [Sign In]       │                   │
│            │                   │                   │
│            └───────────────────┘                   │
│                                                     │
│              Theme Selector (bottom left)           │
└─────────────────────────────────────────────────────┘
```

**Key Features:**
- Centered card layout with glassmorphism effect
- Dark/Light theme toggle (bottom-left dropdown)
- Clean, distraction-free design
- Responsive: mobile-first approach
- Background: Subtle gradient or minimal pattern

**Implementation:**
```typescript
// src/app/vendor/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">E-Procurement</h1>
          <p className="text-slate-400 mt-2">Vendor Portal</p>
        </div>
        
        {/* Auth Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          {children}
        </div>
        
        {/* Theme Selector */}
        <ThemeSelector className="absolute bottom-8 left-8" />
      </div>
    </div>
  );
}
```

### 3.2 Main Application Layout with Sidebar (Protected)

**Architecture**: Sidebar + Top Navbar Combination

**Reference**: SIDEBAR_NAVIGATION_STRATEGY.md

**Structure:**
```
┌──────────────────────────────────────────────────────────────────────┐
│ [☰] E-Proc  [Search all...]  [+ New]  [🔔 5]  [☀️]  [👤 John Doe ▼] │ ← Top Navbar (64px)
├──────────┬───────────────────────────────────────────────────────────┤
│          │ Home > Tenders > View                    ← Breadcrumbs    │
│ OVERVIEW │ ───────────────────────────────────────────────────────── │
│ 📊 Dashboard                                                          │
│          │   Page Title: Tender Details                              │
│ PROCURE  │                                                            │
│ 📄 Tender│   ┌────────────────────────────────────────────────────┐ │
│    (12)  │   │                                                    │ │
│ 📤 My Bid│   │          Main Content Area                         │ │
│    (3)   │   │                                                    │ │
│ ✓ Contract│   │                                                    │ │
│ 📝 Quotes│   │                                                    │ │
│          │   └────────────────────────────────────────────────────┘ │
│ MANAGE   │                                                            │
│ 📁 Docs  │                                                            │
│ 🧾 Invoice                                                            │
│    (2)   │                                                            │
│ 💳 Pay   │                                                            │
│          │                                                            │
│ COMPANY  │                                                            │
│ 🏢 Profile│                                                            │
│ 📈 Perform│                                                            │
│ 🛡️ Comply│                                                            │
│    (1)   │                                                            │
│          │                                                            │
│ ─────────│                                                            │
│ ⚙️ Settings│                                                            │
│ ❓ Help   │                                                            │
│          │                                                            │
│ [◄]      │                                                            │
└──────────┴───────────────────────────────────────────────────────────┘
  ↑ Sidebar (240px expanded, 64px collapsed)
```

**Layout Components:**

**Top Navigation Bar:**
- **Left Section**: 
  - Hamburger menu (mobile)
  - Logo/Brand
  - Breadcrumbs (contextual navigation)
- **Center Section**:
  - Global Search (⌘K shortcut)
- **Right Section**: 
  - Quick Actions (+ New Bid button)
  - Notifications bell (with count badge)
  - Theme toggle (Sun/Moon)
  - User Profile menu (with avatar)

**Sidebar Navigation (Vertical):**
- **Primary Navigation**: Main app sections grouped by category
- **Collapsible**: Icon-only mode (64px) or full (240px)
- **Responsive**: Hidden on mobile, slide-in overlay
- **Persistent State**: User preference saved to localStorage
- **Badge Indicators**: Show counts for pending items

**Navigation Classification:**

| Location | Purpose | Contains |
|----------|---------|----------|
| **Sidebar** | Primary structure navigation | Dashboard, Tenders, Bids, Contracts, Documents, Profile, Settings |
| **Top Navbar** | Global actions & utilities | Search, Notifications, Theme, Profile, Quick Actions |

**Implementation:**
```typescript
// src/app/vendor/layout.tsx (using shadcn/ui components)
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Sidebar } from '@/components/layout/Sidebar';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Top Navbar */}
      <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1 pt-16"> {/* pt-16 for navbar height (64px) */}
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          open={sidebarOpen}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900",
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-60",
            "transition-all duration-200"
          )}
        >
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

```typescript
// src/components/layout/TopNavbar.tsx (using shadcn/ui)
import { Menu, Search, Plus, Bell, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-md bg-slate-900/95 border-b border-slate-800">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Hamburger + Logo + Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <Link href="/vendor/dashboard" className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary-500" />
            <span className="hidden sm:inline text-lg font-semibold text-white">E-Procurement</span>
          </Link>
          
          <Breadcrumbs />
        </div>
        
        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search tenders, bids, documents... (⌘K)"
              className="pl-10 bg-slate-800/50 border-slate-700"
            />
          </div>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="hidden md:flex">
            <Plus className="h-4 w-4 mr-2" />
            New Bid
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              5
            </Badge>
          </Button>
          
          <ThemeToggle />
          
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
```

**Sidebar Implementation:** See SIDEBAR_NAVIGATION_STRATEGY.md Section 9 for complete sidebar code using shadcn/ui components.

### 3.3 Sidebar Navigation Structure

**Navigation Sections:**

```typescript
// src/config/navigation.ts
import {
  LayoutDashboard, FileText, Send, FileCheck, FileSignature,
  FolderOpen, Receipt, CreditCard, Building2, TrendingUp, Shield,
  Settings, HelpCircle
} from 'lucide-react';

export const sidebarNavigation = [
  {
    section: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/vendor/dashboard',
        badge: null
      },
    ]
  },
  {
    section: 'Procurement',
    items: [
      {
        id: 'tenders',
        label: 'Tenders',
        icon: FileText,
        href: '/vendor/tenders',
        badge: 12,
        badgeVariant: 'info' as const
      },
      {
        id: 'my-bids',
        label: 'My Bids',
        icon: Send,
        href: '/vendor/bids',
        badge: 3,
        badgeVariant: 'warning' as const
      },
      {
        id: 'contracts',
        label: 'Contracts',
        icon: FileCheck,
        href: '/vendor/contracts',
      },
      {
        id: 'quotations',
        label: 'Quotations',
        icon: FileSignature,
        href: '/vendor/quotations',
      },
    ]
  },
  {
    section: 'Management',
    items: [
      {
        id: 'documents',
        label: 'Documents',
        icon: FolderOpen,
        href: '/vendor/documents',
      },
      {
        id: 'invoices',
        label: 'Invoices',
        icon: Receipt,
        href: '/vendor/invoices',
        badge: 2,
        badgeVariant: 'destructive' as const
      },
      {
        id: 'payments',
        label: 'Payments',
        icon: CreditCard,
        href: '/vendor/payments',
      },
    ]
  },
  {
    section: 'Company',
    items: [
      {
        id: 'profile',
        label: 'Company Profile',
        icon: Building2,
        href: '/vendor/profile',
      },
      {
        id: 'performance',
        label: 'Performance',
        icon: TrendingUp,
        href: '/vendor/performance',
      },
      {
        id: 'compliance',
        label: 'Compliance',
        icon: Shield,
        href: '/vendor/compliance',
        badge: 1,
        badgeVariant: 'warning' as const
      },
    ]
  },
];
```

**Responsive Behavior:**

| Screen Size | Sidebar | Top Navbar |
|-------------|---------|------------|
| **Mobile** (<768px) | Hidden, slide-in overlay | Hamburger + essentials |
| **Tablet** (768-1024px) | Collapsed (icon-only, 64px) | Full navbar |
| **Desktop** (≥1024px) | Expanded (240px) | Full navbar |
| **Large** (≥1536px) | Expanded (280px) | Extra spacing |

### 3.4 Dashboard Layout

**Reference**: general-layout1 + general-layout screenshots combined

**Structure:**
```
┌──────────────────────────────────────────────────────────────┐
│  Navbar (from 2.2)                                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│
│  │  Card Metric 1  │  │  Card Metric 2  │  │ Card Metric 3││
│  └─────────────────┘  └─────────────────┘  └──────────────┘│
│                                                              │
│  ┌──────────────────────────────┐  ┌─────────────────────┐ │
│  │                              │  │                     │ │
│  │   Main Content/Chart         │  │   Sidebar Panel     │ │
│  │                              │  │   - Smart Tools     │ │
│  │                              │  │   - Quick Actions   │ │
│  └──────────────────────────────┘  └─────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Secondary Content (Tables, Lists, etc.)            │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Layout Pattern:**
- **Grid System**: 12-column responsive grid
- **Card Components**: All major content in elevated cards
- **Sidebar**: Right-aligned smart tools/actions (collapsible on mobile)
- **Spacing**: Consistent padding (container: px-4 md:px-6 lg:px-8, gap: 4/6)

---

## 4. Color Palette & Theme

### 4.1 Primary Color Scheme (Enterprise Professional)

**Reference Inspiration**: SpendHQ interface (professional blue/gray)

**Base Palette:**
```javascript
// tailwind.config.js - Custom colors
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary Brand
        primary: {
          50: '#eff6ff',   // Very light blue
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Main brand blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        
        // Neutral (Slate-based for enterprise feel)
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        
        // Accent (Success/Warning/Error)
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
};
```

### 4.2 Dark Mode Support

**Default Theme**: Dark mode (professional, reduces eye strain)

**Light Mode Alternative**: Available via theme selector

**Implementation Strategy:**
```typescript
// src/app/globals.css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    /* ... */
  }
}
```

### 4.3 Glassmorphism Effect

**Usage**: Cards, modals, sidebars

**CSS Pattern:**
```css
.glass-card {
  @apply backdrop-blur-xl bg-white/10 dark:bg-slate-900/50;
  @apply border border-white/20 dark:border-slate-700/50;
  @apply shadow-xl shadow-black/10;
}

.glass-card-hover {
  @apply transition-all duration-200;
  @apply hover:bg-white/15 dark:hover:bg-slate-900/60;
  @apply hover:shadow-2xl hover:border-white/30;
}
```

---

## 5. Component Library (shadcn/ui Based)

### 5.1 shadcn/ui Core Components

**Installation:**
```bash
# All required shadcn/ui components
npx shadcn-ui@latest add button input card table
npx shadcn-ui@latest add dialog dropdown-menu tooltip
npx shadcn-ui@latest add form label checkbox radio-group select textarea
npx shadcn-ui@latest add badge tabs separator sheet skeleton alert
npx shadcn-ui@latest add breadcrumb command calendar popover
```

#### Button Component (shadcn/ui)

**Usage:**
```typescript
import { Button } from '@/components/ui/button';

// shadcn/ui provides these variants:
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Danger</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>

// With loading state (custom extension)
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>
```

#### Card Component (shadcn/ui + Custom)

**Usage:**
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card'; // Custom extension

// Standard card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>

// Glassmorphism card (custom)
<GlassCard>
  <CardContent>
    Glass effect content
  </CardContent>
</GlassCard>
```

#### Input Component (shadcn/ui + React Hook Form)

**Usage:**
```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';

// With React Hook Form
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input placeholder="vendor@example.com" {...field} />
        </FormControl>
        <FormDescription>
          Your registered email address
        </FormDescription>
        <FormMessage /> {/* Auto-shows validation errors */}
      </FormItem>
    )}
  />
</Form>
```

#### Table Component (shadcn/ui + TanStack Table)

**Installation:**
```bash
npm install @tanstack/react-table
npx shadcn-ui@latest add table
```

**Usage:**
```typescript
import { DataTable } from '@/components/ui/data-table'; // Custom wrapper
import { ColumnDef } from '@tanstack/react-table';

// Define columns
const columns: ColumnDef<Tender>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge>{row.getValue('status')}</Badge>
  },
];

// Use DataTable
<DataTable
  columns={columns}
  data={tenders}
  searchKey="title"
  filterOptions={[
    { key: 'status', label: 'Status', options: ['Active', 'Closed'] }
  ]}
/>

// Features:
// - Sortable columns (built-in)
// - Pagination (built-in)
// - Row selection (checkbox)
// - Filtering and search
// - Loading skeleton
// - Empty state
```

#### Dialog/Modal Component (shadcn/ui Radix)

**Usage:**
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Confirm Submission</DialogTitle>
      <DialogDescription>
        Are you sure you want to submit this bid?
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Content */}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button onClick={handleSubmit}>Submit</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Features (built-in by Radix UI):
// - Backdrop overlay
// - Focus trap
// - Esc key to close
// - Click outside to close
// - Accessibility (ARIA)
```

#### Badge Component (shadcn/ui)

**Usage:**
```typescript
import { Badge } from '@/components/ui/badge';

// Variants
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>

// Status mapping for procurement
function getStatusBadge(status: TenderStatus) {
  const variants = {
    DRAFT: { variant: 'secondary', label: 'Draft' },
    PUBLISHED: { variant: 'default', label: 'Published' },
    SUBMITTED: { variant: 'outline', label: 'Submitted' },
    APPROVED: { variant: 'default', label: 'Approved', className: 'bg-green-600' },
    REJECTED: { variant: 'destructive', label: 'Rejected' },
    CANCELLED: { variant: 'secondary', label: 'Cancelled' },
  };
  
  const config = variants[status];
  return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
}
```

### 5.2 Additional UI Components

#### Toast Notifications (Sonner)

```bash
npm install sonner
```

```typescript
import { toast } from 'sonner';

// Usage
toast.success('Bid submitted successfully!');
toast.error('Failed to submit bid');
toast.info('Tender closing in 2 days');
toast.warning('Document size too large');

// With action
toast.message('New tender available', {
  action: {
    label: 'View',
    onClick: () => router.push('/vendor/tenders/123'),
  },
});
```

#### File Upload (react-dropzone)

```bash
npm install react-dropzone
```

```typescript
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

export function FileUpload({ onFilesAccepted }: { onFilesAccepted: (files: File[]) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFilesAccepted,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxSize: 10485760, // 10MB
  });
  
  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition',
        isDragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-300',
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-slate-400" />
      <p className="mt-2 text-sm text-slate-600">
        {isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}
      </p>
    </div>
  );
}
```

### 5.3 Domain-Specific Components

#### TenderCard (using shadcn/ui components)

```typescript
// src/components/tender/TenderCard.tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { differenceInDays } from 'date-fns';

interface TenderCardProps {
  tender: {
    id: string;
    title: string;
    description: string;
    estimatedValue: number;
    currency: string;
    publishedDate: string;
    closingDate: string;
    status: TenderStatus;
    organization: string;
  };
  onViewDetails: () => void;
  onSubmitBid?: () => void;
}

export function TenderCard({ tender, onViewDetails, onSubmitBid }: TenderCardProps) {
  const daysRemaining = differenceInDays(new Date(tender.closingDate), new Date());
  const isClosingSoon = daysRemaining <= 3 && daysRemaining >= 0;
  
  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Badge variant={getStatusVariant(tender.status)}>
              {tender.status}
            </Badge>
            <h3 className="text-lg font-semibold mt-2 group-hover:text-primary-600 transition">
              {tender.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {tender.organization}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Estimated Value
            </span>
            <span className="text-lg font-bold text-primary-600">
              {formatCurrency(tender.estimatedValue, tender.currency)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Closing: {formatDate(tender.closingDate)}
            </span>
            {isClosingSoon && (
              <Badge variant="destructive" className="ml-auto">
                {daysRemaining} days left
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tender.description}
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1"
          >
            View Details
          </Button>
          {onSubmitBid && (
            <Button
              size="sm"
              onClick={onSubmitBid}
              className="flex-1"
            >
              Submit Bid
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
```

#### BidStatusTimeline
```typescript
// src/components/bid/BidStatusTimeline.tsx
interface TimelineStep {
  label: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
}

// Visual: Horizontal stepper
// Steps: Draft → Submitted → Under Review → Accepted/Rejected
```

#### StatCard
```typescript
// src/components/dashboard/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
    label: string;
  };
  icon: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
}

// Reference: Dashboard metrics from general-layout
// Examples:
// - Total Bids: 45
// - Active Tenders: 12
// - Success Rate: 78% (+5% from last month)
```

---

## 6. Page Implementations

### 6.1 Login Page (using shadcn/ui + React Hook Form)

**Route**: `/vendor/login`

**Layout Reference**: Login-Layout screenshot

**Features:**
- Email/password fields with validation
- "Remember me" checkbox
- Password visibility toggle
- Forgot password link
- Register link
- Theme selector (bottom-left)
- Loading state on submit
- Error message display

**Form Validation:**
```typescript
const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});
```

**Implementation:**
```typescript
// src/app/vendor/login/page.tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  
  const form = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });
  
  const onSubmit = async (data: yup.InferType<typeof loginSchema>) => {
    try {
      await login(data).unwrap();
      toast.success('Login successful!');
      router.push('/vendor/dashboard');
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Login</h2>
        <p className="text-slate-400 mt-1">Enter your credentials to access your account</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="vendor@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Remember me</FormLabel>
                </FormItem>
              )}
            />
            <Link
              href="/vendor/forgot-password"
              className="text-sm text-primary-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </Form>
      
      <p className="text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link href="/vendor/register" className="text-primary-400 hover:underline font-medium">
          Register here
        </Link>
      </p>
    </div>
  );
}
```

### 6.2 Dashboard Page (with sidebar)

**Route**: `/vendor/dashboard`

**Layout Reference**: general-layout1 + general-layout (SpendHQ style)

**Sections:**

1. **Top Metrics Row** (4 stat cards)
   - Active Tenders
   - My Bids (Total)
   - Contracts Awarded
   - Success Rate

2. **Main Content (Left 2/3)**
   - **AI Procurement Assistant** (similar to SpendHQ)
     - Chat interface
     - Quick suggestions
     - Search tenders by criteria
   - **Recent Tender Opportunities** (table/cards)
     - Title, Organization, Estimated Value, Closing Date, Status
     - Quick actions: View, Submit Bid

3. **Sidebar (Right 1/3)**
   - **Smart Tools Panel**
     - Predictive Reorder Panel (alerts for upcoming tenders)
     - Quick Actions (New Bid, View Contracts)
   - **Quick Alerts**
     - Tenders closing soon
     - Bid evaluation updates
     - Contract notifications

4. **Bottom Section**
   - **Live ROI Performance** (chart - if applicable)
   - **Recent Activity Timeline**

**Implementation:**
```typescript
// src/app/vendor/dashboard/page.tsx
export default function DashboardPage() {
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: tenders } = useGetActiveTendersQuery({ limit: 5 });
  const { data: alerts } = useGetAlertsQuery();
  
  return (
    <div className="space-y-6 p-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Tenders"
          value={stats?.activeTenders || 0}
          icon={<FileText />}
          trend="neutral"
        />
        <StatCard
          title="My Bids"
          value={stats?.totalBids || 0}
          change={{ value: 5, direction: 'up', label: 'from last month' }}
          icon={<Send />}
          trend="positive"
        />
        <StatCard
          title="Contracts"
          value={stats?.contracts || 0}
          icon={<FileCheck />}
          trend="neutral"
        />
        <StatCard
          title="Success Rate"
          value={`${stats?.successRate || 0}%`}
          change={{ value: 3, direction: 'up', label: 'this quarter' }}
          icon={<TrendingUp />}
          trend="positive"
        />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold">Your AI Procurement Assistant</h2>
              </div>
              <p className="text-sm text-slate-400">Ask me anything about tenders and procurement</p>
            </CardHeader>
            <CardContent>
              <AIAssistantChat />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Recent Tender Opportunities</h2>
            </CardHeader>
            <CardContent>
              <TenderTable tenders={tenders} />
            </CardContent>
          </Card>
        </div>
        
        {/* Right 1/3 Sidebar */}
        <div className="space-y-6">
          <Card variant="glass">
            <CardHeader>
              <h3 className="font-semibold">Smart Tools</h3>
            </CardHeader>
            <CardContent>
              <SmartToolsPanel />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Quick Alerts</h3>
            </CardHeader>
            <CardContent>
              <AlertList alerts={alerts} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

### 6.3 Tenders List Page (using DataTable)

**Route**: `/vendor/tenders`

**Features:**
- Filter panel (Status, Organization, Closing Date, Value Range)
- Search bar
- Sort options (Closing Date, Value, Published Date)
- Grid/List view toggle
- Pagination
- Export to CSV

**Layout:**
```
┌────────────────────────────────────────────────┐
│  Tenders                           [+ Filter]  │
├────────────────────────────────────────────────┤
│  [Search...]                    [Grid] [List]  │
├────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Tender 1 │  │ Tender 2 │  │ Tender 3 │    │
│  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Tender 4 │  │ Tender 5 │  │ Tender 6 │    │
│  └──────────┘  └──────────┘  └──────────┘    │
├────────────────────────────────────────────────┤
│              [< Prev]  1 2 3  [Next >]         │
└────────────────────────────────────────────────┘
```

### 6.4 Tender Detail Page

**Route**: `/vendor/tenders/[id]`

**Layout:**
```
┌────────────────────────────────────────────────┐
│  ← Back to Tenders                             │
├────────────────────────────────────────────────┤
│  Tender Title                      [PUBLISHED] │
│  Organization Name                             │
├────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────┐ │
│  │ Info Panel      │  │ Actions Panel       │ │
│  │ - Est. Value    │  │ [Submit Bid]        │ │
│  │ - Closing Date  │  │ [Download Docs]     │ │
│  │ - Published     │  │ [Save for Later]    │ │
│  └─────────────────┘  └─────────────────────┘ │
├────────────────────────────────────────────────┤
│  Tabs: Overview | Requirements | Documents     │
│                 | Timeline | Q&A               │
├────────────────────────────────────────────────┤
│  [Tab Content Area]                            │
│                                                │
└────────────────────────────────────────────────┘
```

**Features:**
- Comprehensive tender information display
- Document download section (with FilePond preview)
- Submit bid button (opens modal/redirects to bid form)
- Q&A section for clarifications
- Timeline showing tender milestones

### 6.5 Bid Submission Page (Multi-step with shadcn/ui)

**Route**: `/vendor/bids/new?tenderId=[id]`

**Features:**
- Multi-step form wizard
  - Step 1: Company Information (pre-filled from vendor profile)
  - Step 2: Technical Proposal (file upload + text)
  - Step 3: Financial Proposal (itemized pricing)
  - Step 4: Supporting Documents (certificates, references)
  - Step 5: Review & Submit
- Auto-save draft functionality
- File upload with validation (FilePond)
- Progress indicator
- Validation on each step
- Confirmation modal before final submission

**Implementation:**
```typescript
// src/app/vendor/bids/new/page.tsx
export default function NewBidPage({ searchParams }) {
  const { tenderId } = searchParams;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  
  const steps = [
    { id: 1, name: 'Company Info', component: CompanyInfoStep },
    { id: 2, name: 'Technical Proposal', component: TechnicalProposalStep },
    { id: 3, name: 'Financial Proposal', component: FinancialProposalStep },
    { id: 4, name: 'Documents', component: DocumentsStep },
    { id: 5, name: 'Review', component: ReviewStep },
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Submit Bid</h1>
          <BidStatusTimeline currentStep={currentStep} steps={steps} />
        </CardHeader>
        <CardContent>
          <StepRenderer
            step={steps[currentStep - 1]}
            formData={formData}
            onUpdate={setFormData}
          />
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={saveDraft}>
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
              >
                {currentStep === steps.length ? 'Submit Bid' : 'Next'}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
```

### 6.6 My Bids Page

**Route**: `/vendor/bids`

**Features:**
- List of all submitted bids
- Filter by status (All, Draft, Submitted, Under Review, Accepted, Rejected)
- Search by tender name
- Status badges with color coding
- Quick actions: View Details, Edit Draft, Withdraw

**Table Columns:**
- Tender Title
- Organization
- Submitted Date
- Status
- Bid Amount (if not confidential)
- Actions

### 6.7 Contracts Page

**Route**: `/vendor/contracts`

**Features:**
- List of awarded contracts
- Contract details (start date, end date, value, terms)
- Related documents download
- Performance tracking
- Delivery milestones
- Invoice submission link

### 6.8 Profile Settings Page

**Route**: `/vendor/settings`

**Tabs:**
1. **Company Profile**
   - Company name, registration number, tax ID
   - Contact information
   - Bank details (masked)
   - Address

2. **Account Settings**
   - Email, username
   - Change password
   - Two-factor authentication

3. **Notifications**
   - Email preferences
   - SMS alerts
   - In-app notifications

4. **Documents**
   - Company certificates
   - Tax documents
   - Bank statements
   - References

---

## 7. Responsive Design Strategy

### 7.1 Breakpoints

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '475px',   // Extra small devices
      'sm': '640px',   // Small devices (mobile landscape)
      'md': '768px',   // Medium devices (tablets)
      'lg': '1024px',  // Large devices (laptops)
      'xl': '1280px',  // Extra large devices (desktops)
      '2xl': '1536px', // 2X large devices (large desktops)
    },
  },
};
```

### 7.2 Mobile-First Approach

**Base Styles**: Mobile (320px-640px)
**Progressive Enhancement**: Add styles for larger screens

**Example:**
```css
/* Mobile-first */
.container {
  @apply px-4 py-6;
}

/* Tablet and up */
@screen md {
  .container {
    @apply px-6 py-8;
  }
}

/* Desktop and up */
@screen lg {
  .container {
    @apply px-8 py-10 max-w-7xl mx-auto;
  }
}
```

### 7.3 Responsive Component Patterns

**Navigation:**
- Mobile: Hamburger menu → Sidebar slides in as overlay
- Tablet: Collapsed sidebar (icon-only, 64px)
- Desktop: Expanded sidebar (240px) + full top navbar

**Tables:**
- Mobile: Card-based layout with stacked information
- Desktop: Full table view

**Forms:**
- Mobile: Single column layout
- Desktop: Multi-column layout where appropriate

**Dashboard:**
- Mobile: Single column, collapsible sections
- Tablet: 2-column grid
- Desktop: 3-column grid with sidebar

### 7.4 Touch-Friendly Design

- Minimum touch target: 44x44px
- Increased spacing between interactive elements on mobile
- Swipe gestures for card navigation
- Pull-to-refresh on list pages

---

## 8. Implementation Roadmap

### Phase 1: Foundation & Setup (Week 1-2)

**Tasks:**
1. [ ] Initialize shadcn/ui in project
   ```bash
   npx shadcn-ui@latest init
   ```
2. [ ] Install core shadcn/ui components
   - Button, Input, Card, Dialog, Badge, Form, Table
3. [ ] Set up design tokens in Tailwind config
4. [ ] Create custom components (GlassCard, etc.)
5. [ ] Implement authentication layout
6. [ ] Build main application layout with sidebar + top navbar
7. [ ] Set up theme provider (next-themes)
8. [ ] Install additional libraries (TanStack Table, Sonner, react-dropzone)

**Deliverables:**
- shadcn/ui components installed and configured
- Sidebar + Top Navbar layout working
- Theme switching functional
- Custom component extensions (GlassCard, DataTable wrapper)
- Authentication layout complete

### Phase 2: Core Pages & Components (Week 3-4)

**Tasks:**
1. [ ] Login page with shadcn/ui Form + React Hook Form + Yup
2. [ ] Dashboard page (stat cards, charts with Recharts)
3. [ ] Implement sidebar navigation with all sections
4. [ ] Tenders list page with DataTable (TanStack Table)
5. [ ] Tender detail page with tabs
6. [ ] Create domain-specific components
   - TenderCard (using Card from shadcn/ui)
   - StatCard (custom)
   - BidStatusTimeline (custom stepper)

**Deliverables:**
- Complete authentication flow
- Functional dashboard
- Tender browsing and viewing

### Phase 3: Bid Management (Week 5-6)

**Tasks:**
1. [ ] Bid submission form (multi-step wizard with React Hook Form)
2. [ ] File upload integration (react-dropzone)
3. [ ] My Bids page with DataTable
4. [ ] Bid detail page (view submitted bids)
5. [ ] Draft auto-save functionality
6. [ ] Toast notifications for user feedback (Sonner)

**Deliverables:**
- Complete bid submission flow
- Bid management interface
- Document handling system

### Phase 4: Additional Features (Week 7-8)

**Tasks:**
1. [ ] Contracts page with DataTable
2. [ ] Profile settings (all tabs using shadcn/ui Tabs)
3. [ ] Notifications system
   - Bell icon with badge
   - Dropdown menu with notifications list
   - Toast notifications (Sonner)
4. [ ] AI Assistant integration (optional)
5. [ ] Dashboard widgets (charts with Recharts)
6. [ ] Mobile responsive optimization
   - Sidebar overlay on mobile
   - Touch-friendly targets
   - Responsive DataTables

**Deliverables:**
- Complete vendor portal functionality
- Fully responsive across all devices
- Production-ready application

### Phase 5: Polish & Testing (Week 9-10)

**Tasks:**
1. [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
2. [ ] Accessibility audit (axe DevTools)
   - Check ARIA labels (Radix UI provides most)
   - Test keyboard navigation
   - Screen reader testing
3. [ ] Performance optimization
   - Lighthouse audit (target >90)
   - Bundle size analysis
   - Code splitting optimization
4. [ ] Error handling and loading states
   - Skeleton loaders (shadcn/ui Skeleton)
   - Error boundaries
   - Toast error messages
5. [ ] User acceptance testing
6. [ ] Documentation and handoff

**Deliverables:**
- Tested and polished application
- Performance optimized (Lighthouse >90)
- Accessibility compliant (WCAG 2.1 AA)
- Documentation for maintenance
- Deployment-ready build

---

## 8. Technical Specifications

### 8.1 Performance Targets

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

**Optimization Strategies:**
- Code splitting by route
- Lazy loading of heavy components
- Image optimization (Next.js Image component)
- Font preloading
- API response caching (RTK Query)

### 8.2 Accessibility Requirements

**WCAG 2.1 AA Compliance:**
- Color contrast ratio ≥ 4.5:1 (normal text), ≥ 3:1 (large text)
- Keyboard navigation for all interactive elements
- ARIA labels for screen readers
- Focus indicators visible
- Skip to main content link
- Form validation messages accessible
- Alt text for all images

**Testing Tools:**
- axe DevTools
- WAVE Browser Extension
- Screen reader testing (NVDA/JAWS)

### 8.3 Browser Support

**Supported Browsers:**
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

**Graceful Degradation:**
- Progressive enhancement approach
- Fallbacks for CSS features (backdrop-filter)
- Polyfills for older browsers (if needed)

### 8.4 Security Considerations

**Frontend Security:**
- XSS prevention (React's built-in protection)
- CSRF tokens for sensitive actions
- Secure cookie handling
- Content Security Policy headers
- Input sanitization
- File upload validation (type, size, content)

---

## 9. Design Assets & Resources

### 9.1 Icons

**Primary Library**: Lucide React
- Consistent style across all icons
- Tree-shakeable imports
- Full TypeScript support

**Common Icons Used:**
- Navigation: Home, FileText, Send, FileCheck, Settings, Bell, User
- Actions: Plus, Edit, Trash, Download, Upload, Search, Filter
- Status: Check, X, AlertCircle, Info, TrendingUp, TrendingDown
- UI: ChevronDown, ChevronRight, Menu, X, Eye, EyeOff

### 9.2 Fonts

**Primary Font**: Inter (Google Fonts)
- Clean, modern sans-serif
- Excellent readability
- Variable font support
- Wide range of weights (300, 400, 500, 600, 700)

**Monospace Font**: JetBrains Mono (for code/IDs)
- Used for: Transaction IDs, reference numbers

**Implementation:**
```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
```

### 9.3 Illustrations & Empty States

**Empty State Components:**
- No tenders found
- No bids submitted
- No documents uploaded
- No notifications

**Illustration Style:**
- Minimal, line-based illustrations
- Consistent color scheme (primary brand colors)
- SVG format for scalability

---

## 10. Component Examples

### 10.1 TenderCard Component

```typescript
// src/components/tender/TenderCard.tsx
interface TenderCardProps {
  tender: Tender;
  onViewDetails: () => void;
  onSubmitBid?: () => void;
}

export function TenderCard({ tender, onViewDetails, onSubmitBid }: TenderCardProps) {
  const daysRemaining = differenceInDays(new Date(tender.closingDate), new Date());
  const isClosingSoon = daysRemaining <= 3;
  
  return (
    <Card variant="glass" hover className="group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Badge variant={getStatusVariant(tender.status)}>
              {tender.status}
            </Badge>
            <h3 className="text-lg font-semibold mt-2 group-hover:text-primary-500 transition">
              {tender.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {tender.organization}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Estimated Value
            </span>
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(tender.estimatedValue, tender.currency)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300">
              Closing: {format(new Date(tender.closingDate), 'MMM dd, yyyy')}
            </span>
            {isClosingSoon && (
              <Badge variant="warning" size="sm">
                {daysRemaining} days left
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {tender.description}
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1"
          >
            View Details
          </Button>
          {onSubmitBid && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSubmitBid}
              className="flex-1"
            >
              Submit Bid
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
```

### 10.2 StatCard Component

```typescript
// src/components/dashboard/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    direction: 'up' | 'down';
    label: string;
  };
  trend?: 'positive' | 'negative' | 'neutral';
}

export function StatCard({ title, value, icon, change, trend }: StatCardProps) {
  const getTrendColor = () => {
    if (!trend) return 'text-slate-600 dark:text-slate-300';
    return trend === 'positive' 
      ? 'text-success-600 dark:text-success-400' 
      : trend === 'negative'
      ? 'text-error-600 dark:text-error-400'
      : 'text-slate-600 dark:text-slate-300';
  };
  
  return (
    <Card variant="elevated" className="hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
              {value}
            </p>
            {change && (
              <div className="flex items-center gap-1 mt-2">
                {change.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {change.value > 0 ? '+' : ''}{change.value}% {change.label}
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <div className="text-primary-600 dark:text-primary-400">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 11. Best Practices

### 11.1 Code Organization

```
src/
├── app/                        # Next.js App Router
│   ├── vendor/
│   │   ├── (auth)/            # Auth routes group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   ├── tenders/
│   │   ├── bids/
│   │   └── contracts/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # Generic UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── layout/                # Layout components
│   │   ├── MainNavbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── tender/                # Domain-specific
│   │   ├── TenderCard.tsx
│   │   ├── TenderTable.tsx
│   │   └── TenderFilter.tsx
│   └── ...
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   └── usePagination.ts
├── lib/                       # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── api-helpers.ts
├── store/                     # Redux store
│   ├── api/
│   └── slices/
└── types/                     # TypeScript types
    └── index.ts
```

### 11.2 Naming Conventions

**Components:**
- PascalCase: `TenderCard`, `MainNavbar`
- Descriptive: Purpose should be clear from name
- Folder structure: One component per file

**Functions:**
- camelCase: `formatCurrency`, `validateEmail`
- Verb-first: Actions should start with verbs

**Types/Interfaces:**
- PascalCase: `TenderCardProps`, `User`
- Props suffix for component props: `TenderCardProps`

**CSS Classes:**
- Kebab-case: `tender-card`, `stat-card`
- BEM methodology for complex components (if not using Tailwind)

### 11.3 Performance Optimization

**React Best Practices:**
- Use `React.memo` for expensive components
- Optimize re-renders with `useMemo` and `useCallback`
- Lazy load heavy components: `React.lazy()`
- Avoid inline functions in JSX (define outside render)

**Next.js Optimization:**
- Use `next/image` for all images
- Implement route-based code splitting
- Enable static generation where possible
- Use `loading.tsx` for loading states

**API Optimization:**
- Implement proper caching strategies (RTK Query)
- Debounce search inputs
- Pagination for large datasets
- Optimize API payload size

---

## Conclusion

This UI/UX implementation plan provides a comprehensive roadmap for building an enterprise-grade e-procurement vendor portal using **shadcn/ui + Radix UI + TanStack Table**. The design combines modern aesthetics (glassmorphism) with professional enterprise standards, ensuring a high-quality user experience across all devices and use cases.

**Key Success Factors:**
1. **Modern Component Framework**: shadcn/ui provides full ownership and customization
2. **Performance**: Minimal bundle size (~50KB vs 400-600KB alternatives)
3. **Sidebar + Top Navbar**: Optimal navigation for complex enterprise app
4. **Consistency**: Reusable shadcn/ui components ensure uniform UI
5. **Responsiveness**: Mobile-first approach with collapsible sidebar
6. **Accessibility**: Built on Radix UI (WCAG 2.1 AA compliant)
7. **Design Freedom**: Full control to implement glassmorphism vision
8. **Maintainability**: Components in codebase, no vendor lock-in
9. **Type Safety**: Full TypeScript support throughout
10. **Future-Proof**: Next.js 15 + React 19 optimized

**Technology Stack Summary:**
- **Framework**: Next.js 15 App Router + Turbopack
- **Styling**: Tailwind CSS 4.0
- **Components**: shadcn/ui + Radix UI
- **Tables**: TanStack Table (React Table v8)
- **Forms**: React Hook Form + Yup
- **State**: Redux Toolkit + RTK Query
- **Notifications**: Sonner
- **File Upload**: react-dropzone
- **Charts**: Recharts
- **Icons**: Lucide React

**Next Steps:**
1. Initialize shadcn/ui: `npx shadcn-ui@latest init`
2. Install core components
3. Set up sidebar + top navbar layout
4. Implement authentication pages
5. Build dashboard with sidebar navigation
6. Create domain-specific components
7. Implement data tables with TanStack Table
8. Add file upload with react-dropzone
9. Polish with toast notifications (Sonner)
10. Test and deploy

**Reference Documents:**
- SIDEBAR_NAVIGATION_STRATEGY.md - Complete sidebar implementation
- COMPONENT_FRAMEWORK_ANALYSIS.md - Framework comparison and decision
- TECHNICAL_DOCUMENTATION.md - Backend API reference
- WARP.md - Development guidelines

---

**Document Version**: 2.0  
**Last Updated**: October 26, 2025  
**Component Framework**: shadcn/ui + Radix UI + TanStack Table  
**Prepared for**: E-Procurement Vendor Portal Development Team
