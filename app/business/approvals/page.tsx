'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { 
  useGetMyPendingApprovalsQuery,
  useApproveRequestMutation,
} from '@/store/api/workflowApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  CheckSquare,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { isApprover } from '@/utils/permissions';
import { useToast } from '@/hooks/use-toast';

type ApprovalTypeFilter = 'all' | 'PURCHASE_REQUISITION' | 'PURCHASE_ORDER' | 'INVOICE' | 'PAYMENT' | 'BUDGET_TRANSFER' | 'CONTRACT';
type PriorityFilter = 'all' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

const typeConfig = {
  PURCHASE_REQUISITION: { label: 'Purchase Requisition', icon: FileText, color: 'text-blue-600' },
  PURCHASE_ORDER: { label: 'Purchase Order', icon: FileText, color: 'text-green-600' },
  INVOICE: { label: 'Invoice', icon: FileText, color: 'text-purple-600' },
  PAYMENT: { label: 'Payment', icon: FileText, color: 'text-orange-600' },
  BUDGET_TRANSFER: { label: 'Budget Transfer', icon: FileText, color: 'text-pink-600' },
  CONTRACT: { label: 'Contract', icon: FileText, color: 'text-indigo-600' },
};

const priorityConfig = {
  LOW: { label: 'Low', variant: 'outline' as const, color: 'text-gray-600' },
  MEDIUM: { label: 'Medium', variant: 'secondary' as const, color: 'text-blue-600' },
  HIGH: { label: 'High', variant: 'default' as const, color: 'text-orange-600' },
  URGENT: { label: 'Urgent', variant: 'destructive' as const, color: 'text-red-600' },
};

export default function ApprovalsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ApprovalTypeFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { toast } = useToast();

  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');

  const { data: approvalsResponse, isLoading } = useGetMyPendingApprovalsQuery({
    page,
    pageSize,
    type: typeFilter === 'all' ? undefined : typeFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    search: searchQuery || undefined,
  });

  const [approveRequest, { isLoading: isProcessing }] = useApproveRequestMutation();

  const approvals = approvalsResponse?.data || [];
  const totalPages = approvalsResponse?.meta?.totalPages || 1;
  const total = approvalsResponse?.meta?.total || 0;

  const canApprove = isApprover(user);

  // Calculate stats
  const stats = {
    total,
    urgent: approvals.filter(a => a.priority === 'URGENT').length,
    high: approvals.filter(a => a.priority === 'HIGH').length,
    overdue: approvals.filter(a => a.dueDate && new Date(a.dueDate) < new Date()).length,
  };

  const handleOpenDialog = (approval: any, action: 'approve' | 'reject') => {
    setSelectedApproval(approval);
    setActionType(action);
    setComments('');
  };

  const handleCloseDialog = () => {
    setSelectedApproval(null);
    setActionType(null);
    setComments('');
  };

  const handleSubmitAction = async () => {
    if (!selectedApproval || !actionType) return;

    try {
      const isApproving = actionType === 'approve';
      
      if (!isApproving && !comments) {
        toast({
          title: 'Rejection reason required',
          description: 'Please provide a reason for rejection.',
          variant: 'destructive',
        });
        return;
      }

      await approveRequest({
        id: selectedApproval.id,
        approved: isApproving,
        comments: comments || undefined,
      }).unwrap();
      
      toast({
        title: isApproving ? 'Approved' : 'Rejected',
        description: `${selectedApproval.title} has been ${isApproving ? 'approved successfully' : 'rejected'}.`,
        variant: isApproving ? 'default' : 'destructive',
      });
      
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to process approval.',
        variant: 'destructive',
      });
    }
  };

  if (!canApprove) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the approvals page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pending Approvals</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve pending requests
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/business/approvals/history">
            <Clock className="mr-2 h-4 w-4" />
            View History
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting your approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? '...' : stats.urgent}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {isLoading ? '...' : stats.high}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Review soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? '...' : stats.overdue}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter approval requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, entity number, or requestor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as ApprovalTypeFilter)}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PURCHASE_REQUISITION">Purchase Requisition</SelectItem>
                <SelectItem value="PURCHASE_ORDER">Purchase Order</SelectItem>
                <SelectItem value="INVOICE">Invoice</SelectItem>
                <SelectItem value="PAYMENT">Payment</SelectItem>
                <SelectItem value="BUDGET_TRANSFER">Budget Transfer</SelectItem>
                <SelectItem value="CONTRACT">Contract</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Requests</CardTitle>
          <CardDescription>
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${approvals.length} of ${total} pending approvals`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : approvals.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No pending approvals</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || typeFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'All caught up! No approvals waiting for your review.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Entity #</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.map((approval) => {
                    const typeInfo = typeConfig[approval.type] || typeConfig.PURCHASE_REQUISITION;
                    const TypeIcon = typeInfo.icon;
                    const priority = priorityConfig[approval.priority || 'MEDIUM'];
                    const isOverdue = approval.dueDate && new Date(approval.dueDate) < new Date();
                    return (
                      <TableRow key={approval.id} className={isOverdue ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                            <span className="text-sm font-medium">{typeInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate">{approval.title}</div>
                          {approval.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {approval.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {approval.entityNumber}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{approval.requestedByName || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          {approval.amount && approval.currency ? (
                            <span className="font-semibold">
                              {formatCurrency(approval.amount, approval.currency)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={priority.variant} className="gap-1">
                            {priority.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {approval.dueDate ? (
                            <span className={`text-sm ${isOverdue ? 'font-semibold text-red-600' : ''}`}>
                              {formatDate(approval.dueDate)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">No due date</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/business/approvals/${approval.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600"
                              onClick={() => handleOpenDialog(approval, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handleOpenDialog(approval, 'reject')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Approval/Rejection Dialog */}
      <Dialog open={!!selectedApproval && !!actionType} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Are you sure you want to approve this request? You can add optional comments.'
                : 'Please provide a reason for rejecting this request.'}
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{selectedApproval.title}</p>
                <p className="text-sm text-muted-foreground">{selectedApproval.entityNumber}</p>
                {selectedApproval.amount && selectedApproval.currency && (
                  <p className="text-sm font-semibold mt-1">
                    {formatCurrency(selectedApproval.amount, selectedApproval.currency)}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {actionType === 'approve' ? 'Comments (Optional)' : 'Rejection Reason *'}
                </label>
                <Textarea
                  placeholder={
                    actionType === 'approve'
                      ? 'Add any comments or notes...'
                      : 'Explain why you are rejecting this request...'
                  }
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAction}
              disabled={isProcessing}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {isProcessing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
