// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'BUYER' | 'MANAGER' | 'FINANCE' | 'VENDOR' | 'APPROVER';
  rbacRoles?: string[];  // RBAC-based roles (e.g., ['Admin', 'PROCUREMENT_MANAGER'])
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
export type BidStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'EVALUATED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

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
  vendorName?: string;
  tenderTitle?: string;
  tenderNumber?: string;
  bidAmount?: number;
  amount?: number;  // Alias for bidAmount
  currency: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  status: BidStatus;
  score?: number;  // Evaluation score (0-100)
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
export type ContractStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'TERMINATED' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED' | 'CLOSED';

export interface ContractDeliverable {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  dueDate?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Contract {
  id: string;
  title: string;
  contractNumber?: string;
  description?: string;
  vendorId?: string;
  vendorName?: string;
  vendors?: Array<{
    id: string;
    name?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    address?: string;
  }>;
  buyerId: string;
  buyerName?: string;
  owner?: {
    id: string;
    name?: string;
    username?: string;
    email?: string;
  };
  amount: number;
  totalValue?: number;
  value?: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  terms?: string | Record<string, any>;
  paymentTerms?: string;
  documents?: ContractDocument[];
  milestones?: Milestone[];
  deliverables?: ContractDeliverable[];
  tender?: {
    id: string;
    title: string;
    referenceNumber?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  approvedBy?: {
    id: string;
    name?: string;
    username?: string;
  };
  closedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
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

// Quotation types
export type QuotationStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
}

export interface Quotation {
  id: string;
  rfqId?: string;
  rfqTitle?: string;
  tenderId?: string;
  tenderTitle?: string;
  vendorId: string;
  items: QuotationItem[];
  totalAmount: number;
  currency: string;
  validUntil: string;
  status: QuotationStatus;
  submittedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment types
export type PaymentStatus = 'REQUESTED' | 'APPROVED' | 'PROCESSED' | 'FAILED' | 'CANCELLED';

export interface Payment {
  id: string;
  paymentNumber?: string;
  invoiceId: string;
  invoiceNumber?: string;
  contractId?: string;
  contractNumber?: string;
  vendorId?: string;
  vendorName?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentDate: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Performance types
export interface PerformanceMetrics {
  overallScore: number;
  bidWinRate: number;
  contractCompletionRate: number;
  onTimeDeliveryRate: number;
  qualityRating: number;
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  totalBidsSubmitted: number;
  bidsWon: number;
  averageResponseTime?: number; // in hours
  customerSatisfaction?: number;
}

export interface PerformanceHistory {
  period: string;
  score: number;
  bidsSubmitted: number;
  bidsWon: number;
  contractsCompleted: number;
}

// Compliance types
export type ComplianceStatus = 'VERIFIED' | 'PENDING' | 'EXPIRED' | 'REJECTED';
export type ComplianceDocumentType =
  | 'BUSINESS_LICENSE'
  | 'TAX_CERTIFICATE'
  | 'INSURANCE'
  | 'ISO_CERTIFICATION'
  | 'SAFETY_CERTIFICATE'
  | 'OTHER';

export interface ComplianceDocument {
  id: string;
  type: ComplianceDocumentType;
  name: string;
  description?: string;
  fileUrl?: string;
  fileSize?: number;
  status: ComplianceStatus;
  uploadedAt: string;
  expiryDate?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  documentNumber?: string;
}

// Support types
export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type SupportTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type SupportTicketCategory = 'TECHNICAL' | 'BILLING' | 'GENERAL' | 'FEATURE_REQUEST' | 'BUG_REPORT';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedToName?: string;
  resolvedAt?: string;
  closedAt?: string;
  attachments?: SupportAttachment[];
  messages?: SupportMessage[];
}

export interface SupportAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  message: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  isStaff: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

// Purchase Requisition types
export type PurchaseRequisitionStatus = 'DRAFT' | 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CONVERTED_TO_PO';

export interface PurchaseRequisitionItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
  category?: string;
}

export interface PurchaseRequisition {
  id: string;
  prNumber?: string;
  referenceNumber?: string; // Legacy field
  title: string;
  description?: string;
  requestorId?: string;
  requesterId?: string;
  requestorName?: string;
  requester?: {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  };
  departmentId?: string;
  departmentName?: string;
  department?: string; // Direct department field from backend
  items: PurchaseRequisitionItem[] | any[];
  totalAmount?: number;
  estimatedAmount?: number; // Backend field
  currency?: string;
  requiredDate?: string;
  requiredBy?: string; // Backend field
  justification?: string;
  priority?: string;
  notes?: string;
  status: PurchaseRequisitionStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  contract?: {
    id: string;
    title?: string;
    contractNumber?: string;
  };
  approvalHistory?: Array<{
    id?: string;
    action: string;
    performedBy?: string;
    performedByName?: string;
    performedAt?: string;
    comments?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Purchase Order types
export type PurchaseOrderStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SENT_TO_VENDOR' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED' | 'CLOSED';

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
  receivedQuantity?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber?: string;
  referenceNumber: string;
  purchaseRequisitionId?: string;
  purchaseRequisitionNumber?: string;
  purchaseRequisition?: {
    id: string;
    prNumber?: string;
    title?: string;
  };
  title: string;
  description?: string;
  vendorId: string;
  vendorName?: string;
  vendors?: Array<{
    id: string;
    name?: string;
    companyName?: string;
    email?: string;
    phone?: string;
  }>;
  buyerId: string;
  buyerName?: string;
  createdBy?: {
    id?: string;
    name?: string;
    username?: string;
  };
  items: PurchaseOrderItem[];
  totalAmount: number;
  subtotal?: number;
  taxAmount?: number;
  currency: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  paymentTerms?: string;
  terms?: string;
  notes?: string;
  status: PurchaseOrderStatus;
  approvedBy?: {
    id?: string;
    name?: string;
    username?: string;
  };
  approvedByName?: string;
  approvedAt?: string;
  sentToVendorAt?: string;
  rejectionReason?: string;
  contract?: {
    id: string;
    title?: string;
    contractNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Budget types
export type BudgetStatus = 'ACTIVE' | 'DEPLETED' | 'EXPIRED' | 'SUSPENDED';
export type BudgetPeriod = 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';

export interface Budget {
  id: string;
  name: string;
  description?: string;
  departmentId?: string;
  departmentName?: string;
  fiscalYear: string;
  period: BudgetPeriod;
  totalAmount: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: BudgetStatus;
  managerId?: string;
  managerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetTransfer {
  id: string;
  fromBudgetId: string;
  fromBudgetName?: string;
  toBudgetId: string;
  toBudgetName?: string;
  amount: number;
  currency: string;
  reason: string;
  requestedBy: string;
  requestedByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

// Transaction types
export type TransactionType = 'ALLOCATION' | 'EXPENDITURE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'REFUND' | 'ADJUSTMENT';

export interface Transaction {
  id: string;
  budgetId: string;
  budgetName?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  referenceId?: string;  // PR, PO, or Invoice ID
  referenceType?: 'PR' | 'PO' | 'INVOICE';
  referenceNumber?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

// Goods Receipt types
export type GoodsReceiptStatus = 'DRAFT' | 'PENDING' | 'INSPECTED' | 'ACCEPTED' | 'RECEIVED' | 'PARTIALLY_RECEIVED' | 'REJECTED' | 'PARTIAL';

export interface GoodsReceiptItem {
  id: string;
  purchaseOrderItemId?: string;
  description?: string;
  name?: string;
  orderedQuantity?: number;
  receivedQuantity?: number;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  condition?: 'GOOD' | 'ACCEPTED' | 'DAMAGED' | 'DEFECTIVE' | 'REJECTED';
  notes?: string;
  specifications?: string;
  serialNumber?: string;
}

export interface GoodsReceipt {
  id: string;
  grNumber?: string;
  referenceNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber?: string;
  purchaseOrder?: {
    id: string;
    poNumber?: string;
    title?: string;
    description?: string;
  };
  vendorId: string;
  vendorName?: string;
  items: GoodsReceiptItem[];
  receivedItems?: GoodsReceiptItem[];
  receivedBy?: {
    id?: string;
    name?: string;
    username?: string;
  } | string;
  receivedByName?: string;
  receivedDate: string;
  status: GoodsReceiptStatus;
  notes?: string;
  inspectionNotes?: string;
  inspectedBy?: {
    id?: string;
    name?: string;
    username?: string;
  } | string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice types (extending existing with more fields)
export type InvoiceStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED' | 'OVERDUE';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  goodsReceiptId?: string;
  goodsReceiptNumber?: string;
  contractId?: string;
  contractNumber?: string;
  vendorId: string;
  vendorName?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  paidAt?: string;
  rejectionReason?: string;
  paymentTerms?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Workflow types
export type WorkflowType = 'PROCUREMENT' | 'APPROVAL' | 'PAYMENT';
export type WorkflowStatus = 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WorkflowStepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'SKIPPED';

export interface WorkflowStep {
  id: string;
  stepNumber: number;
  stepName: string;
  stepType: 'CONTRACT' | 'PR' | 'PR_APPROVAL' | 'PO' | 'GR' | 'INVOICE' | 'PAYMENT';
  status: WorkflowStepStatus;
  assignedTo?: string;
  assignedToName?: string;
  assignedToRole?: string;
  completedBy?: string;
  completedByName?: string;
  completedAt?: string;
  notes?: string;
  referenceId?: string;  // ID of the entity created in this step
  referenceNumber?: string;
}

export interface Workflow {
  id: string;
  workflowNumber: string;
  type: WorkflowType;
  contractId?: string;
  contractNumber?: string;
  title: string;
  description?: string;
  initiatedBy: string;
  initiatedByName?: string;
  status: WorkflowStatus;
  currentStepNumber: number;
  totalSteps: number;
  steps: WorkflowStep[];
  startedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

// Approval types
export type ApprovalType = 'PURCHASE_REQUISITION' | 'PURCHASE_ORDER' | 'INVOICE' | 'PAYMENT' | 'BUDGET_TRANSFER' | 'CONTRACT';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApprovalAction = 'APPROVE' | 'REJECT';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  entityId: string;  // ID of PR, PO, Invoice, etc.
  entityNumber: string;  // Reference number
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  requestedBy: string;
  requestedByName?: string;
  approvers: ApprovalItem[];
  currentApproverId?: string;
  status: ApprovalStatus;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalItem {
  id: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: ApprovalStatus;
  approvedAt?: string;
  rejectionReason?: string;
  level: number;  // Approval hierarchy level
  notes?: string;
}

export interface ApprovalHistory {
  id: string;
  approvalRequestId: string;
  action: ApprovalAction;
  approverId: string;
  approverName: string;
  approverRole: string;
  comments?: string;
  performedAt: string;
}

// Vendor types (extending for business portal)
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  registrationNumber?: string;
  category?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED' | 'SUSPENDED';
  rating?: number;
  totalContracts?: number;
  totalValue?: number;
  compliance?: ComplianceStatus;
  contactPerson?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorPerformance {
  vendorId: string;
  vendorName: string;
  overallRating: number;
  deliveryPerformance: number;
  qualityScore: number;
  responsiveness: number;
  priceCompetitiveness: number;
  totalContractsCompleted: number;
  totalContractsActive: number;
  totalValueDelivered: number;
  averageDeliveryTime: number;  // in days
  defectRate: number;  // percentage
  onTimeDeliveryRate: number;  // percentage
}

// Statistics types for business dashboard
export interface BusinessDashboardStats {
  // Tender stats
  totalTenders?: number;
  activeTenders?: number;
  draftTenders?: number;
  publishedTenders?: number;
  closedTenders?: number;

  // Procurement stats
  totalPRs?: number;
  pendingPRs?: number;
  approvedPRs?: number;
  totalPOs?: number;
  pendingPOs?: number;
  activePOs?: number;

  // Financial stats
  totalBudget?: number;
  allocatedBudget?: number;
  spentBudget?: number;
  remainingBudget?: number;
  pendingInvoices?: number;
  pendingPayments?: number;
  processedPayments?: number;

  // Approval stats
  pendingApprovals?: number;
  pendingPRApprovals?: number;
  pendingPOApprovals?: number;
  pendingInvoiceApprovals?: number;
  pendingPaymentApprovals?: number;
  approvedToday?: number;

  // Vendor stats
  totalVendors?: number;
  activeVendors?: number;
  totalContracts?: number;
  activeContracts?: number;

  // Workflow stats
  activeWorkflows?: number;
  completedWorkflows?: number;
}

// ============================================================================
// RFQ (Request for Quotation) Types - P2P Standard Workflow
// ============================================================================

export type RFQStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'AWARDED' | 'CANCELLED';
export type SourcingType = 'NONE' | 'RFQ' | 'TENDER' | 'DIRECT';
export type ContractSourceType = 'MANUAL' | 'TENDER_AWARD' | 'QUOTATION_ACCEPT';

export interface RFQItem {
  name: string;
  quantity: number;
  unit?: string;
  description?: string;
  specifications?: Record<string, any>;
}

export interface RFQ {
  id: string;
  tenantId: string;
  rfqNumber: string;
  prId?: string;
  title: string;
  description?: string;
  items: RFQItem[];
  estimatedAmount?: number;
  validUntil?: string;
  targetVendorIds?: string[];
  category?: string;
  department?: string;
  status: RFQStatus;
  publishedAt?: string;
  closedAt?: string;
  awardedQuotationId?: string;
  awardedContractId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  purchaseRequisition?: PurchaseRequisition;
  creator?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  quotations?: Quotation[];
}

export interface CreateRFQDto {
  prId?: string;
  title: string;
  description?: string;
  items: RFQItem[];
  estimatedAmount?: number;
  validUntil?: string;
  targetVendorIds?: string[];
  category?: string;
  department?: string;
}

export interface UpdateRFQDto {
  title?: string;
  description?: string;
  items?: RFQItem[];
  estimatedAmount?: number;
  validUntil?: string;
  targetVendorIds?: string[];
  category?: string;
  department?: string;
}

// P2P Workflow Step Result
export interface WorkflowStepResult {
  success: boolean;
  message: string;
  nextSteps?: string[];
  data?: any;
}

// Form types
export interface FormState {
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
}
