'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Upload, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  Search
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import type { ComplianceDocument, ComplianceStatus, ComplianceDocumentType } from '@/types';

const statusConfig: Record<ComplianceStatus, { label: string; variant: any; icon: any }> = {
  VERIFIED: { label: 'Verified', variant: 'secondary', icon: CheckCircle2 },
  PENDING: { label: 'Pending Review', variant: 'outline', icon: Clock },
  EXPIRED: { label: 'Expired', variant: 'destructive', icon: AlertCircle },
  REJECTED: { label: 'Rejected', variant: 'destructive', icon: XCircle },
};

const documentTypeLabels: Record<ComplianceDocumentType, string> = {
  BUSINESS_LICENSE: 'Business License',
  TAX_CERTIFICATE: 'Tax Certificate',
  INSURANCE: 'Insurance Certificate',
  ISO_CERTIFICATION: 'ISO Certification',
  SAFETY_CERTIFICATE: 'Safety Certificate',
  OTHER: 'Other Document',
};

export default function CompliancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ComplianceDocumentType | 'ALL'>('ALL');

  // Mock data - replace with API call
  const complianceDocuments: ComplianceDocument[] = [
    {
      id: '1',
      type: 'BUSINESS_LICENSE',
      name: 'Business Registration Certificate',
      description: 'Official business registration from Ministry of Commerce',
      documentNumber: 'BRG-2024-123456',
      status: 'VERIFIED',
      uploadedAt: '2024-01-15',
      expiryDate: '2026-01-14',
      verifiedBy: 'John Admin',
      verifiedAt: '2024-01-20',
      fileUrl: '/documents/business-license.pdf',
      fileSize: 2456789,
    },
    {
      id: '2',
      type: 'TAX_CERTIFICATE',
      name: 'Tax Compliance Certificate 2024',
      description: 'Annual tax compliance certificate',
      documentNumber: 'TAX-2024-987654',
      status: 'VERIFIED',
      uploadedAt: '2024-02-20',
      expiryDate: '2025-02-19',
      verifiedBy: 'Sarah Finance',
      verifiedAt: '2024-02-22',
      fileUrl: '/documents/tax-cert.pdf',
      fileSize: 1234567,
    },
    {
      id: '3',
      type: 'INSURANCE',
      name: 'General Liability Insurance',
      description: 'Comprehensive general liability insurance coverage',
      documentNumber: 'INS-2024-555777',
      status: 'PENDING',
      uploadedAt: '2024-10-22',
      expiryDate: '2025-10-21',
      fileUrl: '/documents/insurance.pdf',
      fileSize: 3456789,
    },
    {
      id: '4',
      type: 'ISO_CERTIFICATION',
      name: 'ISO 9001:2015 Quality Management',
      description: 'ISO 9001:2015 quality management system certification',
      documentNumber: 'ISO-9001-2024-ABC',
      status: 'VERIFIED',
      uploadedAt: '2024-03-10',
      expiryDate: '2027-03-09',
      verifiedBy: 'Quality Team',
      verifiedAt: '2024-03-15',
      fileUrl: '/documents/iso-9001.pdf',
      fileSize: 4567890,
    },
    {
      id: '5',
      type: 'SAFETY_CERTIFICATE',
      name: 'Occupational Health & Safety Certification',
      description: 'OHSAS 18001 occupational health and safety certification',
      documentNumber: 'OHSAS-2023-DEF',
      status: 'EXPIRED',
      uploadedAt: '2023-05-10',
      expiryDate: '2024-05-09',
      fileUrl: '/documents/ohsas.pdf',
      fileSize: 2345678,
    },
  ];

  const filteredDocuments = complianceDocuments.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: complianceDocuments.length,
    verified: complianceDocuments.filter(d => d.status === 'VERIFIED').length,
    pending: complianceDocuments.filter(d => d.status === 'PENDING').length,
    expired: complianceDocuments.filter(d => d.status === 'EXPIRED').length,
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Documents</h1>
          <p className="text-muted-foreground mt-1">
            Manage your compliance certificates and business documents
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {complianceDocuments.some(doc => {
        const days = getDaysUntilExpiry(doc.expiryDate || '');
        return days > 0 && days <= 30 && doc.status === 'VERIFIED';
      }) && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                  Document Expiry Alert
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  You have documents expiring within 30 days. Please renew them to maintain compliance status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={typeFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('ALL')}
              >
                All
              </Button>
              {Object.entries(documentTypeLabels).map(([key, label]) => (
                <Button
                  key={key}
                  variant={typeFilter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter(key as ComplianceDocumentType)}
                  className="whitespace-nowrap"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.map((document) => {
          const StatusIcon = statusConfig[document.status].icon;
          const daysUntilExpiry = getDaysUntilExpiry(document.expiryDate || '');
          const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30 && document.status === 'VERIFIED';

          return (
            <Card key={document.id} className={`hover:shadow-lg transition-shadow ${isExpiringSoon ? 'border-orange-300 dark:border-orange-700' : ''}`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-lg">{document.name}</h3>
                        <Badge variant={statusConfig[document.status].variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[document.status].label}
                        </Badge>
                        {isExpiringSoon && (
                          <Badge variant="outline" className="border-orange-500 text-orange-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Expires in {daysUntilExpiry} days
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {documentTypeLabels[document.type]}
                        {document.documentNumber && ` • ${document.documentNumber}`}
                      </p>

                      {document.description && (
                        <p className="text-sm text-muted-foreground mb-3">{document.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Uploaded:</span>
                          <span className="font-medium">{formatDate(document.uploadedAt)}</span>
                        </div>
                        {document.expiryDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Expires:</span>
                            <span className={`font-medium ${isExpiringSoon ? 'text-orange-600' : ''}`}>
                              {formatDate(document.expiryDate)}
                            </span>
                          </div>
                        )}
                        {document.fileSize && (
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Size:</span>
                            <span className="font-medium">{formatFileSize(document.fileSize)}</span>
                          </div>
                        )}
                      </div>

                      {document.verifiedBy && document.verifiedAt && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Verified by {document.verifiedBy} on {formatDate(document.verifiedAt)}
                        </div>
                      )}

                      {document.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
                          <strong>Rejection Reason:</strong> {document.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View
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

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== 'ALL'
                  ? 'Try adjusting your search or filters'
                  : "You haven't uploaded any compliance documents yet"}
              </p>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First Document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
