'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderOpen, Search, Upload, Download, FileText, File } from 'lucide-react';

type DocumentCategory = 'CONTRACT' | 'INVOICE' | 'CERTIFICATE' | 'PROPOSAL' | 'OTHER';

const categoryConfig: Record<DocumentCategory, { label: string; variant: any; icon: any }> = {
  CONTRACT: { label: 'Contract', variant: 'default', icon: FileText },
  INVOICE: { label: 'Invoice', variant: 'secondary', icon: FileText },
  CERTIFICATE: { label: 'Certificate', variant: 'outline', icon: File },
  PROPOSAL: { label: 'Proposal', variant: 'default', icon: FileText },
  OTHER: { label: 'Other', variant: 'outline', icon: File },
};

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'ALL'>('ALL');

  const documents = [
    {
      id: '1',
      name: 'Contract Agreement - IT Services.pdf',
      category: 'CONTRACT' as DocumentCategory,
      size: '2.4 MB',
      uploadedAt: '2024-10-15',
      uploadedBy: 'John Doe'
    },
    {
      id: '2',
      name: 'Invoice INV-2025-001.pdf',
      category: 'INVOICE' as DocumentCategory,
      size: '450 KB',
      uploadedAt: '2025-10-20',
      uploadedBy: 'System'
    },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-1">Manage your document library</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant={categoryFilter === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter('ALL')}>
                All
              </Button>
              <Button variant={categoryFilter === 'CONTRACT' ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter('CONTRACT')}>
                Contracts
              </Button>
              <Button variant={categoryFilter === 'INVOICE' ? 'default' : 'outline'} size="sm" onClick={() => setCategoryFilter('INVOICE')}>
                Invoices
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredDocuments.map((document) => {
          const CategoryIcon = categoryConfig[document.category].icon;
          return (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 flex-1">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{document.name}</h3>
                        <Badge variant={categoryConfig[document.category].variant}>
                          {categoryConfig[document.category].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{document.size}</span>
                        <span>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</span>
                        <span>By: {document.uploadedBy}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground">Try adjusting your search or upload new documents</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
