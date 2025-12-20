'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useGetPurchaseOrderByIdQuery, useApprovePurchaseOrderMutation, useSubmitPurchaseOrderForApprovalMutation } from '@/store/api/businessApi';
import { useRecordGoodsReceiptMutation } from '@/store/api/workflowApi';
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
    Package,
    User,
    Building2,
    Truck,
} from 'lucide-react';
import { formatCurrency, formatDate, toNumber } from '@/lib/formatters';
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

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    DRAFT: { label: 'Draft', variant: 'secondary' },
    PENDING_APPROVAL: { label: 'Pending Approval', variant: 'outline' },
    APPROVED: { label: 'Approved', variant: 'default' },
    SENT: { label: 'Sent to Vendor', variant: 'default' },
    PARTIALLY_RECEIVED: { label: 'Partially Received', variant: 'outline' },
    RECEIVED: { label: 'Received', variant: 'default' },
    REJECTED: { label: 'Rejected', variant: 'destructive' },
    CANCELLED: { label: 'Cancelled', variant: 'destructive' },
    CLOSED: { label: 'Closed', variant: 'secondary' },
};

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    const [approvalReason, setApprovalReason] = useState('');
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isGRDialogOpen, setIsGRDialogOpen] = useState(false);
    const [grNotes, setGRNotes] = useState('');

    const { data: poResponse, isLoading } = useGetPurchaseOrderByIdQuery(id);
    const [approvePO, { isLoading: isApproving }] = useApprovePurchaseOrderMutation();
    const [recordGR, { isLoading: isRecordingGR }] = useRecordGoodsReceiptMutation();
    const [submitPO, { isLoading: isSubmitting }] = useSubmitPurchaseOrderForApprovalMutation();

    const po: any = poResponse?.data;

    const handleApprove = async (approved: boolean) => {
        try {
            await approvePO({ id, approved, reason: approvalReason }).unwrap();
            toast({
                title: 'Success',
                description: `Purchase Order ${approved ? 'approved' : 'rejected'} successfully`,
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

    const handleRecordGoodsReceipt = async () => {
        try {
            await recordGR({
                poId: id,
                data: {
                    receivedDate: new Date().toISOString(),
                    notes: grNotes,
                    receivedItems: po?.items || [],
                },
            }).unwrap();
            toast({
                title: 'Success',
                description: 'Goods Receipt recorded successfully',
            });
            setIsGRDialogOpen(false);
            setGRNotes('');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to record goods receipt',
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

    if (!po) {
        return (
            <div className="p-4 md:p-6">
                <div className="text-center py-12">
                    <h3 className="text-lg font-semibold">Purchase Order not found</h3>
                    <Button className="mt-4" asChild>
                        <Link href="/business/purchase-orders">Back to Purchase Orders</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const status = statusConfig[po.status] || statusConfig.DRAFT;
    const canSubmit = po.status === 'DRAFT';
    const canApprove = po.status === 'PENDING_APPROVAL';
    const canRecordGR = po.status === 'APPROVED' || po.status === 'SENT' || po.status === 'PARTIALLY_RECEIVED';

    const handleSubmitForApproval = async () => {
        try {
            await submitPO(id).unwrap();
            toast({
                title: 'Success',
                description: 'Purchase Order submitted for approval',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to submit for approval',
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
                        <Link href="/business/purchase-orders">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">PO #{po.poNumber || id.slice(0, 8)}</h1>
                            <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{po.title || po.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {canSubmit && (
                        <Button onClick={handleSubmitForApproval} disabled={isSubmitting}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                        </Button>
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
                                        <DialogTitle>Reject Purchase Order</DialogTitle>
                                        <DialogDescription>
                                            Please provide a reason for rejecting this purchase order.
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
                                        <DialogTitle>Approve Purchase Order</DialogTitle>
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

                    {canRecordGR && (
                        <Dialog open={isGRDialogOpen} onOpenChange={setIsGRDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Package className="mr-2 h-4 w-4" />
                                    Record Goods Receipt
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Record Goods Receipt</DialogTitle>
                                    <DialogDescription>
                                        Record the receipt of goods for this purchase order.
                                    </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                    placeholder="Receipt notes (inspection findings, etc.)..."
                                    value={grNotes}
                                    onChange={(e) => setGRNotes(e.target.value)}
                                />
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsGRDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleRecordGoodsReceipt} disabled={isRecordingGR}>
                                        Record Receipt
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Order Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{formatDate(po.createdAt)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Delivery Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{po.expectedDelivery ? formatDate(po.expectedDelivery) : 'Not specified'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {formatCurrency(toNumber(po.totalAmount || po.amount), po.currency?.code || 'USD')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Created By
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{po.creator?.firstName ? `${po.creator.firstName} ${po.creator.lastName || ''}` : po.creator?.email || 'N/A'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Vendor Information */}
            {po.vendors && po.vendors.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Vendor Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {po.vendors.map((pv: any, index: number) => (
                                <div key={pv.vendor?.id || index} className="border rounded-lg p-4">
                                    <p className="font-medium">{pv.vendor?.name || 'Unknown Vendor'}</p>
                                    {pv.vendor?.contactEmail && <p className="text-sm text-muted-foreground">{pv.vendor.contactEmail}</p>}
                                    {pv.vendor?.contactPhone && <p className="text-sm text-muted-foreground">{pv.vendor.contactPhone}</p>}
                                    <Badge variant="outline" className="mt-2">{pv.role || 'PRIMARY'}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Line Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                    <CardDescription>Items included in this purchase order</CardDescription>
                </CardHeader>
                <CardContent>
                    {po.items && po.items.length > 0 ? (
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
                                {po.items.map((item: any, index: number) => (
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
                                            {formatCurrency(item.unitPrice || 0, po.currency)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(item.totalPrice || (item.quantity * item.unitPrice) || 0, po.currency)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No items specified</p>
                    )}

                    {po.items && po.items.length > 0 && (
                        <div className="mt-6 space-y-2 max-w-md ml-auto">
                            {po.subtotal && (
                                <div className="flex items-center justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">{formatCurrency(po.subtotal, po.currency)}</span>
                                </div>
                            )}
                            {po.taxAmount && (
                                <div className="flex items-center justify-between">
                                    <span>Tax:</span>
                                    <span className="font-semibold">{formatCurrency(po.taxAmount, po.currency)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
                                <span>Total:</span>
                                <span>{formatCurrency(toNumber(po.totalAmount || po.amount), po.currency?.code || 'USD')}</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Related Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Purchase Requisition Reference */}
                {po.purchaseRequisition && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Source Requisition
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">PR #{po.purchaseRequisition.prNumber}</p>
                                    <p className="text-sm text-muted-foreground">{po.purchaseRequisition.title}</p>
                                </div>
                                <Button variant="outline" asChild>
                                    <Link href={`/business/requisitions/${po.purchaseRequisition.id}`}>View PR</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Contract Reference */}
                {po.contract && (
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
                                    <p className="font-medium">{po.contract.title || po.contract.contractNumber}</p>
                                    <p className="text-sm text-muted-foreground">Contract #{po.contract.contractNumber}</p>
                                </div>
                                <Button variant="outline" asChild>
                                    <Link href={`/business/contracts/${po.contract.id}`}>View Contract</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Approval Information */}
            {(po.approver || po.approvedAt) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Approval Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {po.approver && (
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Processed by: </span>
                                    <span className="font-medium">{po.approver.firstName} {po.approver.lastName || ''}</span>
                                </p>
                            )}
                            {po.approvedAt && (
                                <p className="text-sm">
                                    <span className="text-muted-foreground">Processed on: </span>
                                    <span className="font-medium">{formatDate(po.approvedAt)}</span>
                                </p>
                            )}
                            {po.rejectionReason && (
                                <p className="text-sm text-red-600">
                                    <span className="font-medium">Rejection Reason: </span>
                                    {po.rejectionReason}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Terms and Conditions */}
            {po.terms && (
                <Card>
                    <CardHeader>
                        <CardTitle>Terms and Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{po.terms}</p>
                    </CardContent>
                </Card>
            )}

            {/* Notes */}
            {po.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{po.notes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
