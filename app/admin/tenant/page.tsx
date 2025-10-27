'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Search } from 'lucide-react';

export default function TenantManagementPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const tenants = [
    {
      id: 'ten_abc123',
      name: 'Acme Corporation',
      subdomain: 'acme',
      status: 'ACTIVE',
      region: 'US',
      createdAt: '2025-01-15',
      userCount: 45
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <p className="text-muted-foreground mt-1">Manage multi-tenant organizations</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tenant
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Tenant</CardTitle>
            <CardDescription>Set up a new organization</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input id="name" placeholder="Acme Corporation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <Input id="subdomain" placeholder="acme" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input id="region" placeholder="US" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" placeholder="America/New_York" />
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Admin User</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input id="adminEmail" type="email" placeholder="admin@acme.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminUsername">Username</Label>
                    <Input id="adminUsername" placeholder="acmeadmin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Admin" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Tenant</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tenants..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{tenant.name}</h3>
                      <Badge variant="secondary">{tenant.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {tenant.subdomain}.eproc.com • {tenant.region}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{tenant.userCount} users</span>
                      <span>Created: {new Date(tenant.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
