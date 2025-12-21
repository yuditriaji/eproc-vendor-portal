'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetPurchaseRequisitionByIdQuery, useUpdatePurchaseRequisitionMutation } from '@/store/api/businessApi';
import { useApprovePRInWorkflowMutation, useCreatePOFromPRMutation } from '@/store/api/workflowApi';
import { useCreateRFQFromPRMutation, useCreateTenderFromPRMutation } from '@/store/api/procurementApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Calendar,
    DollarSign,
    FileText,
    ShoppingCart,
    User,
    Clock,
    Send,
    FileSearch,
    Gavel,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    DRAFT: { label: 'Draft', variant: 'secondary' },
    PENDING: { label: 'Pending Approval', variant: 'outline' },
    PENDING_APPROVAL: { label: 'Pending Approval', variant: 'outline' },
    APPROVED: { label: 'Approved', variant: 'default' },
    REJECTED: { label: 'Rejected', variant: 'destructive' },
    CONVERTED: { label: 'Converted to PO', variant: 'default' },
    CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

export default function RequisitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    const router = useRouter();
    const [approvalReason, setApprovalReason] = useState('');
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isCreatePODialogOpen, setIsCreatePODialogOpen] = useState(false);
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

    const { data: prResponse, isLoading, refetch } = useGetPurchaseRequisitionByIdQuery(id);
    const [approvePR, { isLoading: isApproving }] = useApprovePRInWorkflowMutation();
    const [createPO, { isLoading: isCreatingPO }] = useCreatePOFromPRMutation();
    const [updatePR, { isLoading: isSubmitting }] = useUpdatePurchaseRequisitionMutation();
    const [createRFQFromPR, { isLoading: isCreatingRFQ }] = useCreateRFQFromPRMutation();
    const [createTenderFromPR, { isLoading: isCreatingTender }] = useCreateTenderFromPRMutation();

    const pr = prResponse?.data;

    const handleApprove = async (approved: boolean) => {
        try {
            await approvePR({ prId: id, approved, reason: approvalReason }).unwrap();
            toast({
                title: 'Success',
                description: `Purchase Requisition ${approved ? 'approved' : 'rejected'} successfully`,
            });
            setIsApproveDialogOpen(false);
            setIsRejectDialogOpen(false);
            setApprovalReason('');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to process approval',
                variant: 'destructive',
            });
        }
    };

    const handleCreatePO = async () => {
        try {
            await createPO({ prId: id, data: {} }).unwrap();
            toast({
                title: 'Success',
                description: 'Purchase Order created successfully from this requisition',
            });
            setIsCreatePODialogOpen(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to create Purchase Order',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (!pr) {
        return (
            <div className="p-4 md:p-6">
                <div className="text-center py-12">
                    <h3 className="text-lg font-semibold">Purchase Requisition not found</h3>
                    <Button className="mt-4" asChild>
                        <Link href="/business/requisitions">Back to Requisitions</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const status = statusConfig[pr.status] || statusConfig.DRAFT;
    const canSubmit = pr.status === 'DRAFT';
    const canApprove = pr.status === 'PENDING' || pr.status === 'PENDING_APPROVAL';
    const canCreatePO = pr.status === 'APPROVED';
    const canCreateSourcing = pr.status === 'APPROVED' && !(pr as any).sourcingType; // Can create RFQ/Tender if approved and no sourcing started

    // Calculate total from items if estimatedAmount is not set
    const calculatedTotal = pr.items && Array.isArray(pr.items)
        ? pr.items.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0)
        : 0;
    const displayTotal = pr.estimatedAmount || pr.totalAmount || calculatedTotal;

    const handleSubmitForApproval = async () => {
        try {
            await updatePR({ id, data: { status: 'PENDING' as any } }).unwrap();
            toast({
                title: 'Success',
                description: 'Purchase Requisition submitted for approval',
            });
            setIsSubmitDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to submit for approval',
                variant: 'destructive',
            });
        }
    };

    const handleCreateRFQ = async () => {
        try {
            const result: any = await createRFQFromPR({
                prId: id,
                data: {
                    title: pr.title,
                    description: pr.description,
                    items: pr.items as any,
                    estimatedAmount: pr.estimatedAmount || pr.totalAmount,
                    targetVendorIds: [],
                },
            }).unwrap();

            console.log('[Create RFQ] Full response:', JSON.stringify(result, null, 2));

            toast({
                title: 'Success',
                description: 'RFQ created from this Purchase Requisition. Redirecting to RFQ list...',
            });

            // Navigate to RFQ list page since detail page has issues
            router.push('/business/rfq');
        } catch (error: any) {
            console.error('[Create RFQ] Error:', error);
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to create RFQ',
                variant: 'destructive',
            });
        }
    };

    const handleCreateTender = async () => {
        try {
            const result: any = await createTenderFromPR({
                prId: id,
                data: {
                    title: pr.title,
                    description: pr.description,
                    requirements: {},
                    criteria: {},
                    estimatedValue: pr.estimatedAmount || pr.totalAmount,
                },
            }).unwrap();
            toast({
                title: 'Success',
                description: 'Tender created from this Purchase Requisition',
            });
            // Navigate to the new Tender
            const tenderId = result?.data?.id;
            if (tenderId) {
                router.push(`/business/tenders/${tenderId}`);
            } else {
                refetch();
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to create Tender',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/business/requisitions">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">PR #{pr.prNumber || id.slice(0, 8)}</h1>
                            <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{pr.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {canSubmit && (
                        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit for Approval
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Submit for Approval</DialogTitle>
                                    <DialogDescription>
                                        This will submit the Purchase Requisition for approval. Once submitted, it cannot be edited until approved or rejected.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmitForApproval} disabled={isSubmitting}>
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {canApprove && (
                        <>
                            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Reject Purchase Requisition</DialogTitle>
                                        <DialogDescription>
                                            Please provide a reason for rejecting this requisition.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                        placeholder="Reason for rejection..."
                                        value={approvalReason}
                                        onChange={(e) => setApprovalReason(e.target.value)}
                                    />
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={() => handleApprove(false)} disabled={isApproving}>
                                            Reject
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Approve Purchase Requisition</DialogTitle>
                                        <DialogDescription>
                                            Optionally add comments for approval.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                        placeholder="Comments (optional)..."
                                        value={approvalReason}
                                        onChange={(e) => setApprovalReason(e.target.value)}
                                    />
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={() => handleApprove(true)} disabled={isApproving}>
                                            Approve
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}

                    {canCreatePO && (
                        <Dialog open={isCreatePODialogOpen} onOpenChange={setIsCreatePODialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Create Purchase Order
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create Purchase Order</DialogTitle>
                                    <DialogDescription>
                                        This will create a Purchase Order from this approved requisition.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreatePODialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreatePO} disabled={isCreatingPO}>
                                        Create PO
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Sourcing Buttons for Approved PRs */}
                    {canCreateSourcing && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleCreateRFQ}
                                disabled={isCreatingRFQ}
                            >
                                <FileSearch className="mr-2 h-4 w-4" />
                                {isCreatingRFQ ? 'Creating...' : 'Create RFQ'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCreateTender}
                                disabled={isCreatingTender}
                            >
                                <Gavel className="mr-2 h-4 w-4" />
                                {isCreatingTender ? 'Creating...' : 'Create Tender'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Created Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{formatDate(pr.createdAt)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Required By
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{pr.requiredBy ? formatDate(pr.requiredBy) : (pr.requiredDate ? formatDate(pr.requiredDate) : 'Not specified')}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Estimated Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {formatCurrency(displayTotal, pr.currency || 'USD')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Requester
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{pr.requester?.name || pr.requester?.username || 'N/A'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            {pr.description && (
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{pr.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Justification */}
            {pr.justification && (
                <Card>
                    <CardHeader>
                        <CardTitle>Business Justification</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{pr.justification}</p>
                    </CardContent>
                </Card>
            )}

            {/* Line Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Requested Items</CardTitle>
                    <CardDescription>Items included in this purchase requisition</CardDescription>
                </CardHeader>
                <CardContent>
                    {pr.items && pr.items.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pr.items.map((item: any, index: number) => (
                                    <TableRow key={item.id || index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{item.description || item.name}</p>
                                                {item.specifications && (
                                                    <p className="text-sm text-muted-foreground">{item.specifications}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">{item.quantity} {item.unit || ''}</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(item.unitPrice || 0, pr.currency)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency((item.quantity || 0) * (item.unitPrice || 0), pr.currency)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No items specified</p>
                    )}

                    {pr.items && pr.items.length > 0 && (
                        <div className="mt-6 space-y-2 max-w-md ml-auto">
                            <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
                                <span>Estimated Total:</span>
                                <span>{formatCurrency(displayTotal, pr.currency || 'USD')}</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Contract Reference */}
            {pr.contract && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Related Contract
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{pr.contract.title || pr.contract.contractNumber}</p>
                                <p className="text-sm text-muted-foreground">Contract #{pr.contract.contractNumber}</p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href={`/business/contracts/${pr.contract.id}`}>View Contract</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Approval History */}
            {(pr.approvedBy || pr.approvedAt || pr.rejectionReason) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Approval Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {pr.approvedBy && (
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Processed by: </span>
                                    <span className="font-medium">{typeof pr.approvedBy === 'string' ? pr.approvedBy : (pr.approvedByName || 'Unknown')}</span>
                                </p>
                            )}
                            {pr.approvedAt && (
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Processed on: </span>
                                    <span className="font-medium">{formatDate(pr.approvedAt)}</span>
                                </p>
                            )}
                            {pr.rejectionReason && (
                                <p className="text-sm text-red-600">
                                    <span className="font-medium">Rejection Reason: </span>
                                    {pr.rejectionReason}
                                </p>
                            )}

                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
