'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useGetContractByIdQuery, useTerminateContractMutation, useCloseContractMutation, useApproveContractMutation } from '@/store/api/businessApi';
import { useCreateTenderFromContractMutation, useInitiateProcurementWorkflowMutation } from '@/store/api/workflowApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    FileText,
    Building2,
    User,
    Clock,
    XCircle,
    CheckCircle,
    Send,
    ShoppingCart,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    DRAFT: { label: 'Draft', variant: 'secondary' },
    PENDING_APPROVAL: { label: 'Pending Approval', variant: 'outline' },
    ACTIVE: { label: 'Active', variant: 'default' },
    IN_PROGRESS: { label: 'In Progress', variant: 'default' },
    COMPLETED: { label: 'Completed', variant: 'default' },
    TERMINATED: { label: 'Terminated', variant: 'destructive' },
    EXPIRED: { label: 'Expired', variant: 'destructive' },
    CANCELLED: { label: 'Cancelled', variant: 'destructive' },
    CLOSED: { label: 'Closed', variant: 'secondary' },
};

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    const [terminateReason, setTerminateReason] = useState('');
    const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
    const [isCreateTenderOpen, setIsCreateTenderOpen] = useState(false);
    const [isInitiateProcurementOpen, setIsInitiateProcurementOpen] = useState(false);
    const [tenderData, setTenderData] = useState({
        title: '',
        description: '',
        closingDate: '',
        estimatedValue: '',
    });

    const { data: contractResponse, isLoading } = useGetContractByIdQuery(id);
    const [terminateContract, { isLoading: isTerminating }] = useTerminateContractMutation();
    const [closeContract, { isLoading: isClosing }] = useCloseContractMutation();
    const [approveContract, { isLoading: isApproving }] = useApproveContractMutation();
    const [createTender, { isLoading: isCreatingTender }] = useCreateTenderFromContractMutation();
    const [initiateProcurement, { isLoading: isInitiating }] = useInitiateProcurementWorkflowMutation();

    const contract = contractResponse?.data;

    const handleTerminate = async () => {
        try {
            await terminateContract({ id, reason: terminateReason }).unwrap();
            toast({
                title: 'Success',
                description: 'Contract terminated successfully',
            });
            setIsTerminateDialogOpen(false);
            setTerminateReason('');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to terminate contract',
                variant: 'destructive',
            });
        }
    };

    const handleClose = async () => {
        try {
            await closeContract(id).unwrap();
            toast({
                title: 'Success',
                description: 'Contract closed successfully',
            });
            setIsCloseDialogOpen(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to close contract',
                variant: 'destructive',
            });
        }
    };

    const handleApprove = async (approved: boolean) => {
        try {
            await approveContract({ id, approved }).unwrap();
            toast({
                title: 'Success',
                description: approved ? 'Contract approved and activated' : 'Contract rejected',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to process approval',
                variant: 'destructive',
            });
        }
    };

    const handleCreateTender = async () => {
        try {
            await createTender({
                contractId: id,
                data: {
                    title: tenderData.title || `Tender for ${contract?.title}`,
                    description: tenderData.description,
                    closingDate: tenderData.closingDate,
                    estimatedValue: parseFloat(tenderData.estimatedValue) || undefined,
                    requirements: {},
                    criteria: {},
                },
            }).unwrap();
            toast({
                title: 'Success',
                description: 'Tender created successfully from contract',
            });
            setIsCreateTenderOpen(false);
            setTenderData({ title: '', description: '', closingDate: '', estimatedValue: '' });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to create tender',
                variant: 'destructive',
            });
        }
    };

    const handleInitiateProcurement = async () => {
        try {
            await initiateProcurement({ contractId: id }).unwrap();
            toast({
                title: 'Success',
                description: 'Procurement workflow initiated. Redirecting to create Purchase Requisition...',
            });
            setIsInitiateProcurementOpen(false);
            // Navigate to PR creation page
            window.location.href = `/business/requisitions/create?contractId=${id}`;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to initiate procurement',
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

    if (!contract) {
        return (
            <div className="p-4 md:p-6">
                <div className="text-center py-12">
                    <h3 className="text-lg font-semibold">Contract not found</h3>
                    <Button className="mt-4" asChild>
                        <Link href="/business/contracts">Back to Contracts</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const status = statusConfig[contract.status] || statusConfig.DRAFT;
    const isActive = contract.status === 'ACTIVE' || contract.status === 'IN_PROGRESS';
    const canTerminate = isActive || contract.status === 'PENDING_APPROVAL';
    const canClose = contract.status === 'COMPLETED';
    const canCreateTender = isActive;
    const canInitiateProcurement = isActive;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/business/contracts">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{contract.contractNumber || `Contract ${id.slice(0, 8)}`}</h1>
                            <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{contract.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Approve/Reject buttons for DRAFT or PENDING_APPROVAL contracts */}
                    {(contract.status === 'DRAFT' || contract.status === 'PENDING_APPROVAL') && (
                        <>
                            <Button
                                onClick={() => handleApprove(true)}
                                disabled={isApproving}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {isApproving ? 'Processing...' : 'Approve Contract'}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleApprove(false)}
                                disabled={isApproving}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                        </>
                    )}

                    {canCreateTender && (
                        <Dialog open={isCreateTenderOpen} onOpenChange={setIsCreateTenderOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Send className="mr-2 h-4 w-4" />
                                    Create Tender
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create Tender from Contract</DialogTitle>
                                    <DialogDescription>
                                        Create a new tender associated with this contract.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tender-title">Tender Title</Label>
                                        <Input
                                            id="tender-title"
                                            placeholder={`Tender for ${contract.title}`}
                                            value={tenderData.title}
                                            onChange={(e) => setTenderData({ ...tenderData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tender-desc">Description</Label>
                                        <Textarea
                                            id="tender-desc"
                                            placeholder="Tender description..."
                                            value={tenderData.description}
                                            onChange={(e) => setTenderData({ ...tenderData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tender-closing">Closing Date</Label>
                                            <Input
                                                id="tender-closing"
                                                type="date"
                                                value={tenderData.closingDate}
                                                onChange={(e) => setTenderData({ ...tenderData, closingDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tender-value">Estimated Value</Label>
                                            <Input
                                                id="tender-value"
                                                type="number"
                                                placeholder="0.00"
                                                value={tenderData.estimatedValue}
                                                onChange={(e) => setTenderData({ ...tenderData, estimatedValue: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateTenderOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateTender} disabled={isCreatingTender}>
                                        Create Tender
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {canInitiateProcurement && (
                        <Dialog open={isInitiateProcurementOpen} onOpenChange={setIsInitiateProcurementOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Start Procurement
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Initiate Procurement Workflow</DialogTitle>
                                    <DialogDescription>
                                        This will start a procurement workflow (PR → PO → GR → Invoice → Payment) linked to this contract.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsInitiateProcurementOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleInitiateProcurement} disabled={isInitiating}>
                                        Start Workflow
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {canClose && (
                        <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Close Contract
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Close Contract</DialogTitle>
                                    <DialogDescription>
                                        This will mark the contract as closed. This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleClose} disabled={isClosing}>
                                        Close Contract
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {canTerminate && (
                        <Dialog open={isTerminateDialogOpen} onOpenChange={setIsTerminateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Terminate
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Terminate Contract</DialogTitle>
                                    <DialogDescription>
                                        Please provide a reason for terminating this contract. This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                    placeholder="Reason for termination..."
                                    value={terminateReason}
                                    onChange={(e) => setTerminateReason(e.target.value)}
                                />
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsTerminateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleTerminate} disabled={isTerminating || !terminateReason}>
                                        Terminate
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
                            Start Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{contract.startDate ? formatDate(contract.startDate) : 'Not set'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            End Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{contract.endDate ? formatDate(contract.endDate) : 'Not set'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {formatCurrency(Number((contract as any).totalAmount) || Number((contract as any).totalValue) || Number((contract as any).value) || 0, (contract as any).currency?.code || (contract as any).currency || 'USD')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Owner
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold">{contract.owner?.name || contract.owner?.username || 'N/A'}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="vendors">Vendors</TabsTrigger>
                    <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    {/* Description */}
                    {contract.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">{contract.description}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Terms and Conditions */}
                    {contract.terms && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Terms and Conditions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {typeof contract.terms === 'string' ? contract.terms : JSON.stringify(contract.terms, null, 2)}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Terms */}
                    {contract.paymentTerms && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Terms</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">{contract.paymentTerms}</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="vendors" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Contracted Vendors
                            </CardTitle>
                            <CardDescription>Vendors associated with this contract</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                // Debug: log vendors data
                                console.log('Contract vendors:', contract.vendors);

                                const vendorsList = contract.vendors || [];

                                if (vendorsList.length > 0) {
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {vendorsList.map((contractVendor: any, index: number) => {
                                                const vendor = contractVendor?.vendor || contractVendor;
                                                console.log('ContractVendor:', contractVendor, 'Vendor:', vendor);
                                                return (
                                                    <div key={vendor?.id || `vendor-${index}`} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="font-medium">{vendor?.name || vendor?.companyName || 'Unknown Vendor'}</p>
                                                                {vendor?.contactEmail && <p className="text-sm text-muted-foreground">{vendor.contactEmail}</p>}
                                                                {vendor?.email && <p className="text-sm text-muted-foreground">{vendor.email}</p>}
                                                                {vendor?.phone && <p className="text-sm text-muted-foreground">{vendor.phone}</p>}
                                                                {vendor?.contactPhone && <p className="text-sm text-muted-foreground">{vendor.contactPhone}</p>}
                                                                {vendor?.address && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {typeof vendor.address === 'string'
                                                                            ? vendor.address
                                                                            : [vendor.address.street, vendor.address.city, vendor.address.state, vendor.address.country].filter(Boolean).join(', ')}
                                                                    </p>
                                                                )}
                                                                {contractVendor?.role && (
                                                                    <Badge variant="outline" className="mt-2">{contractVendor.role}</Badge>
                                                                )}
                                                            </div>
                                                            {vendor?.id && (
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <Link href={`/business/vendors/${vendor.id}`}>View</Link>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }

                                return (
                                    <p className="text-muted-foreground text-center py-8">No vendors associated with this contract</p>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="deliverables" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Deliverables</CardTitle>
                            <CardDescription>Contract deliverables and milestones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {contract.deliverables && contract.deliverables.length > 0 ? (
                                <div className="space-y-4">
                                    {contract.deliverables.map((deliverable: any, index: number) => (
                                        <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-0">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{deliverable.title || deliverable.name}</p>
                                                {deliverable.description && (
                                                    <p className="text-sm text-muted-foreground">{deliverable.description}</p>
                                                )}
                                                {deliverable.dueDate && (
                                                    <p className="text-sm text-muted-foreground mt-1">Due: {formatDate(deliverable.dueDate)}</p>
                                                )}
                                            </div>
                                            {deliverable.status && (
                                                <Badge variant={deliverable.status === 'COMPLETED' ? 'default' : 'outline'}>
                                                    {deliverable.status}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No deliverables defined</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contract History</CardTitle>
                            <CardDescription>Timeline of contract events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1" />
                                    <div className="flex-1">
                                        <p className="font-medium">Contract Created</p>
                                        <p className="text-sm text-muted-foreground">{contract.createdAt ? formatDate(contract.createdAt) : 'Unknown'}</p>
                                    </div>
                                </div>
                                {contract.approvedAt && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
                                        <div className="flex-1">
                                            <p className="font-medium">Contract Approved</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(contract.approvedAt)}</p>
                                        </div>
                                    </div>
                                )}
                                {contract.startDate && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-3 h-3 rounded-full bg-green-500 mt-1" />
                                        <div className="flex-1">
                                            <p className="font-medium">Contract Started</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(contract.startDate)}</p>
                                        </div>
                                    </div>
                                )}
                                {contract.closedAt && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-3 h-3 rounded-full bg-gray-500 mt-1" />
                                        <div className="flex-1">
                                            <p className="font-medium">Contract Closed</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(contract.closedAt)}</p>
                                        </div>
                                    </div>
                                )}
                                {contract.terminatedAt && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500 mt-1" />
                                        <div className="flex-1">
                                            <p className="font-medium">Contract Terminated</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(contract.terminatedAt)}</p>
                                            {contract.terminationReason && (
                                                <p className="text-sm text-red-600">Reason: {contract.terminationReason}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Related Tender */}
            {contract.tender && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Related Tender
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{contract.tender.title}</p>
                                <p className="text-sm text-muted-foreground">Tender #{contract.tender.referenceNumber}</p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href={`/business/tenders/${contract.tender.id}`}>View Tender</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
