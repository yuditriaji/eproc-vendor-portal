'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileCheck, 
  Search, 
  Download, 
  Calendar, 
  DollarSign,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';

type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'SUSPENDED';

interface Contract {
  id: string;
  title: string;
  contractNumber: string;
  buyer: {
    name: string;
    organization: string;
  };
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  completionPercentage?: number;
  milestonesCompleted?: number;
  milestonesTotal?: number;
}

const statusConfig: Record<ContractStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  ACTIVE: { label: 'Active', variant: 'default', icon: CheckCircle2 },
  COMPLETED: { label: 'Completed', variant: 'secondary', icon: CheckCircle2 },
  TERMINATED: { label: 'Terminated', variant: 'destructive', icon: XCircle },
  SUSPENDED: { label: 'Suspended', variant: 'outline', icon: AlertCircle },
};

export default function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');

  // Mock data - replace with real API data
  const contracts: Contract[] = [
    {
      id: '1',
      title: 'IT Infrastructure Services Contract',
      contractNumber: 'CON-2024-0123',
      buyer: {
        name: 'John Smith',
        organization: 'Ministry of Technology'
      },
      amount: 2500000,
      currency: 'USD',
      startDate: '2024-01-15',
      endDate: '2027-01-14',
      status: 'ACTIVE',
      completionPercentage: 45,
      milestonesCompleted: 3,
      milestonesTotal: 6
    },
    {
      id: '2',
      title: 'Office Equipment Supply Agreement',
      contractNumber: 'CON-2023-0456',
      buyer: {
        name: 'Sarah Johnson',
        organization: 'Department of Administration'
      },
      amount: 450000,
      currency: 'USD',
      startDate: '2023-06-01',
      endDate: '2024-05-31',
      status: 'COMPLETED',
      completionPercentage: 100,
      milestonesCompleted: 4,
      milestonesTotal: 4
    },
    {
      id: '3',
      title: 'Maintenance Services Contract',
      contractNumber: 'CON-2024-0789',
      buyer: {
        name: 'Michael Chen',
        organization: 'Public Works Department'
      },
      amount: 125000,
      currency: 'USD',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      status: 'ACTIVE',
      completionPercentage: 20,
      milestonesCompleted: 1,
      milestonesTotal: 5
    }
  ];

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.buyer.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'ACTIVE').length,
    completed: contracts.filter(c => c.status === 'COMPLETED').length,
    totalValue: contracts.reduce((sum, c) => sum + c.amount, 0)
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Contracts</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track your awarded contracts and agreements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalValue / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ALL')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ACTIVE')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('COMPLETED')}
              >
                Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.map((contract) => {
          const StatusIcon = statusConfig[contract.status].icon;
          return (
            <Card key={contract.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{contract.title}</h3>
                          <Badge variant={statusConfig[contract.status].variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[contract.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {contract.contractNumber}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Organization:</span>
                            <span className="font-medium">{contract.buyer.organization}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Value:</span>
                            <span className="font-medium">
                              ${contract.amount.toLocaleString()} {contract.currency}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Period:</span>
                            <span className="font-medium">
                              {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          {contract.milestonesCompleted !== undefined && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Milestones:</span>
                              <span className="font-medium">
                                {contract.milestonesCompleted}/{contract.milestonesTotal} completed
                              </span>
                            </div>
                          )}
                        </div>

                        {contract.completionPercentage !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{contract.completionPercentage}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="bg-primary rounded-full h-2 transition-all"
                                style={{ width: `${contract.completionPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/vendor/contracts/${contract.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredContracts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contracts found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : 'You don\'t have any contracts yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
