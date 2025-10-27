'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Search } from 'lucide-react';

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const vendors = [
    {
      id: 'ven_tech001',
      name: 'TechCorp Suppliers Ltd',
      registrationNumber: 'REG-12345',
      contactEmail: 'procurement@techcorp.com',
      businessType: 'IT Equipment & Services',
      status: 'ACTIVE',
      rating: 4.5
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">Manage vendor registrations and profiles</p>
        </div>
        <Button asChild>
          <Link href="/admin/configuration/master-data/vendors/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {vendors.map((vendor) => (
          <Card key={vendor.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{vendor.name}</h3>
                      <Badge variant="secondary">{vendor.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {vendor.registrationNumber} • {vendor.businessType}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {vendor.contactEmail} • Rating: {vendor.rating}/5
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/configuration/master-data/vendors/${vendor.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
