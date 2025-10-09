// User and Authentication types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'USER' | 'VENDOR';
  verified?: boolean;
  createdAt: string;
  // Legacy fields for compatibility
  name?: string;
  company?: string;
  phone?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Tender types
export interface Tender {
  id: string;
  title: string;
  description: string;
  requirements?: Record<string, unknown>;
  criteria?: Record<string, unknown>;
  estimatedValue?: number;
  closingDate: string;
  category?: string;
  department?: string;
  status: TenderStatus;
  createdAt: string;
  updatedAt?: string;
  creator?: {
    username: string;
    role: string;
  };
  bids?: Record<string, unknown>[];
  // Legacy fields for compatibility
  region?: string;
  budget?: number;
  currency?: string;
  deadline?: string;
  attachments?: TenderAttachment[];
}

export type TenderStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'AWARDED' | 'CANCELLED';

// Legacy status mapping
export const LegacyTenderStatus = {
  'open': 'PUBLISHED',
  'pending': 'DRAFT', 
  'closed': 'CLOSED',
  'awarded': 'AWARDED'
} as const;

export interface TenderRequirement {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'number' | 'file' | 'boolean' | 'select';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface TenderAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// Bid types
export interface Bid {
  id: string;
  tenderId: string;
  vendorId: string;
  status: BidStatus;
  submittedAt?: string;
  createdAt: string;
  updatedAt?: string;
  encryptedData?: string;
  decryptedData?: {
    technicalProposal: Record<string, unknown>;
    commercialProposal: Record<string, unknown>;
    financialProposal: Record<string, unknown>;
  };
  tender: {
    title: string;
    status: string;
    closingDate?: string;
  };
  vendor?: {
    username: string;
    email: string;
  };
  // Legacy fields for compatibility
  price?: number;
  currency?: string;
  requirements?: BidRequirement[];
  attachments?: BidAttachment[];
  score?: number;
  feedback?: string;
}

export type BidStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'SCORED' | 'ACCEPTED' | 'REJECTED';

// Legacy status mapping
export const LegacyBidStatus = {
  'draft': 'DRAFT',
  'submitted': 'SUBMITTED',
  'under_review': 'UNDER_REVIEW',
  'scored': 'SCORED',
  'accepted': 'ACCEPTED',
  'rejected': 'REJECTED'
} as const;

export interface BidRequirement {
  requirementId: string;
  value: string | number | boolean | string[];
  attachments?: BidAttachment[];
}

export interface BidAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export type NotificationType = 'bid_status' | 'new_tender' | 'deadline_reminder' | 'system' | 'award';

// Form types
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  company: string;
  phone: string;
  documents?: FileList | null;
}

export interface BidFormData {
  price: number;
  currency: string;
  requirements: Record<string, string | number | boolean | string[]>;
  attachments: File[];
  notes?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Filter and search types
export interface TenderFilters {
  category?: string;
  region?: string;
  status?: TenderStatus;
  budgetMin?: number;
  budgetMax?: number;
  search?: string;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// WebSocket message types
export interface WSMessage {
  type: 'bid_update' | 'new_notification' | 'tender_update';
  data: unknown;
  timestamp: string;
}

export interface BidUpdateMessage {
  bidId: string;
  status: BidStatus;
  score?: number;
  feedback?: string;
}

// UI State types
export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es';
  notifications: {
    show: boolean;
    unreadCount: number;
  };
  modals: {
    confirmDelete: boolean;
    bidSubmission: boolean;
    documentPreview: boolean;
  };
  loading: {
    tenders: boolean;
    bids: boolean;
    submissions: boolean;
  };
}

// Tour and onboarding types
export interface TourStep {
  target: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean;
  hideCloseButton?: boolean;
  hideSkipButton?: boolean;
  locale?: {
    back?: string;
    close?: string;
    last?: string;
    next?: string;
    skip?: string;
  };
}

// A/B Testing types
export interface ABTestVariant {
  name: string;
  weight: number;
  config: Record<string, unknown>;
}

export interface ABTest {
  id: string;
  name: string;
  variants: ABTestVariant[];
  active: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// File upload types
export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// Performance and analytics types
export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

// Environment and configuration types
export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  uploadUrl: string;
  maxFileSize: number;
  supportedLanguages: string[];
  features: {
    darkMode: boolean;
    notifications: boolean;
    analytics: boolean;
    abTesting: boolean;
  };
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export type EntityState<T> = {
  entities: Record<string, T>;
  ids: string[];
  loading: LoadingState;
  error: string | null;
};

export type Timestamp = string;
export type Currency = 'USD' | 'EUR' | 'GBP';
export type FileType = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'jpg' | 'png' | 'gif';

// Redux state types
export interface RootState {
  auth: AuthState;
  tenders: EntityState<Tender>;
  bids: EntityState<Bid>;
  notifications: EntityState<Notification>;
  ui: UIState;
}