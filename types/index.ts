// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'BUYER' | 'MANAGER' | 'FINANCE' | 'VENDOR';
  companyId?: string;
  avatar?: string;
  abilities?: Ability[];
  tenantId?: string;
}

export interface Ability {
  actions: string[];
  subjects: string[];
  conditions?: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  companyName: string;
  phone: string;
}

// Tender types
export type TenderStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED' | 'AWARDED';

export interface Tender {
  id: string;
  title: string;
  description?: string;
  referenceNumber?: string;
  organization?: {
    name: string;
    id?: string;
  };
  estimatedValue?: number;
  currency: string;
  publishedDate?: string;
  createdAt?: string;
  closingDate: string;
  status: TenderStatus;
  category?: string;
  location?: string;
  documents?: TenderDocument[];
}

export interface TenderDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// Bid types
export type BidStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Bid {
  id: string;
  tenderId: string;
  tender?: {
    id: string;
    title: string;
    organization?: {
      name: string;
    };
  };
  referenceNumber?: string;
  vendorId: string;
  bidAmount?: number;
  currency: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  status: BidStatus;
  documents?: BidDocument[];
  technicalProposal?: string;
  financialProposal?: FinancialProposal;
}

export interface BidDocument {
  id: string;
  type: 'TECHNICAL' | 'FINANCIAL' | 'CERTIFICATE' | 'REFERENCE' | 'OTHER';
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface FinancialProposal {
  items: FinancialItem[];
  totalAmount: number;
  currency: string;
  taxRate?: number;
  notes?: string;
}

export interface FinancialItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Contract types
export type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'SUSPENDED';

export interface Contract {
  id: string;
  title: string;
  vendorId: string;
  buyerId: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  documents?: ContractDocument[];
  milestones?: Milestone[];
}

export interface ContractDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  completionDate?: string;
}

// Dashboard types
export interface DashboardStats {
  activeTenders: number;
  totalBids: number;
  contracts: number;
  successRate: number;
  revenue?: number;
  pendingApprovals?: number;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  // Legacy flat properties for backward compatibility
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

// Form types
export interface FormState {
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
}
