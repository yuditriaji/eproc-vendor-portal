'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useGetBudgetByIdQuery, useTransferBudgetMutation, useGetBudgetsQuery } from '@/store/api/financeApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
    ArrowLeft,
    ArrowRightLeft,
    DollarSign,
    Calendar,
    TrendingUp,
    Wallet,
    CheckCircle,
    AlertCircle,
    XCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
    ACTIVE: { label: 'Active', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
    DEPLETED: { label: 'Depleted', variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' },
    EXPIRED: { label: 'Expired', variant: 'outline' as const, icon: XCircle, color: 'text-gray-600' },
    SUSPENDED: { label: 'Suspended', variant: 'outline' as const, icon: XCircle, color: 'text-orange-600' },
};

export default function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
    const [transferData, setTransferData] = useState({
        toBudgetId: '',
        amount: '',
        reason: '',
    });

    const { data: budgetResponse, isLoading } = useGetBudgetByIdQuery(id);
    const { data: allBudgetsResponse } = useGetBudgetsQuery({ pageSize: 100 });
    const [transferBudget, { isLoading: isTransferring }] = useTransferBudgetMutation();

    const budget: any = budgetResponse?.data;
    const allBudgets = allBudgetsResponse?.data || [];
    const otherBudgets = allBudgets.filter((b: any) => b.id !== id);

    const handleTransfer = async () => {
        if (!transferData.toBudgetId || !transferData.amount) {
            toast({
                title: 'Error',
                description: 'Please select target budget and enter amount',
                variant: 'destructive',
            });
            return;
        }

        try {
            await transferBudget({
                fromBudgetId: id,
                toBudgetId: transferData.toBudgetId,
                amount: parseFloat(transferData.amount),
                reason: transferData.reason,
            }).unwrap();

            toast({
                title: 'Success',
                description: 'Budget transferred successfully',
            });
            setIsTransferDialogOpen(false);
            setTransferData({ toBudgetId: '', amount: '', reason: '' });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'Failed to transfer budget',
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

    if (!budget) {
        return (
            <div className="p-4 md:p-6">
                <div className="text-center py-12">
                    <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Budget not found</h3>
                    <Button className="mt-4" asChild>
                        <Link href="/business/budgets">Back to Budgets</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const status = statusConfig[budget.status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    const StatusIcon = status.icon;
    const utilization = budget.allocatedAmount > 0
        ? ((budget.spentAmount || 0) / budget.allocatedAmount) * 100
        : 0;
    const remaining = (budget.allocatedAmount || 0) - (budget.spentAmount || 0);

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/business/budgets">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{budget.name}</h1>
                            <Badge variant={status.variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {budget.departmentName || 'General'} • FY {budget.fiscalYear}
                        </p>
                    </div>
                </div>

                {budget.status === 'ACTIVE' && (
                    <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                Transfer Funds
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Transfer Budget</DialogTitle>
                                <DialogDescription>
                                    Transfer funds from this budget to another budget
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>From Budget</Label>
                                    <Input value={budget.name} disabled />
                                    <p className="text-sm text-muted-foreground">
                                        Available: {formatCurrency(remaining, budget.currency)}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="toBudget">To Budget *</Label>
                                    <Select
                                        value={transferData.toBudgetId}
                                        onValueChange={(v) => setTransferData({ ...transferData, toBudgetId: v })}
                                    >
                                        <SelectTrigger id="toBudget">
                                            <SelectValue placeholder="Select target budget" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {otherBudgets.map((b: any) => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.name} ({b.fiscalYear})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={transferData.amount}
                                        onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Reason for transfer..."
                                        value={transferData.reason}
                                        onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleTransfer} disabled={isTransferring}>
                                    {isTransferring ? 'Transferring...' : 'Transfer'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Allocated
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {formatCurrency(budget.allocatedAmount || 0, budget.currency)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Spent
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {formatCurrency(budget.spentAmount || 0, budget.currency)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Remaining
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(remaining, budget.currency)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Period
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold">{budget.period}</p>
                        <p className="text-sm text-muted-foreground">FY {budget.fiscalYear}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Utilization */}
            <Card>
                <CardHeader>
                    <CardTitle>Budget Utilization</CardTitle>
                    <CardDescription>Current spending vs allocated amount</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                {formatCurrency(budget.spentAmount || 0, budget.currency)} of {formatCurrency(budget.allocatedAmount || 0, budget.currency)}
                            </span>
                            <span className={`text-lg font-bold ${utilization >= 90 ? 'text-red-600' :
                                utilization >= 75 ? 'text-orange-600' :
                                    utilization >= 50 ? 'text-yellow-600' :
                                        'text-green-600'
                                }`}>
                                {utilization.toFixed(1)}%
                            </span>
                        </div>
                        <Progress value={Math.min(utilization, 100)} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* Budget Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Category</p>
                            <p className="font-medium">{budget.category || 'General'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Department</p>
                            <p className="font-medium">{budget.departmentName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Start Date</p>
                            <p className="font-medium">{budget.startDate ? formatDate(budget.startDate) : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">End Date</p>
                            <p className="font-medium">{budget.endDate ? formatDate(budget.endDate) : 'N/A'}</p>
                        </div>
                        {budget.description && (
                            <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="font-medium">{budget.description}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
