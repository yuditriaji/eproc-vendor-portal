'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus } from 'lucide-react';

export default function PurchasingOrgsPage() {
  const [showForm, setShowForm] = useState(false);

  const purchasingOrgs = [
    {
      id: 'porg_us1000',
      code: 'PORG1000',
      name: 'US Procurement Organization',
      description: 'Handles all procurement for US operations',
      groupsCount: 3
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchasing Organizations</h1>
          <p className="text-muted-foreground">Procurement organizational units</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Purchasing Organization
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Purchasing Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input placeholder="PORG1000" />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="US Procurement Organization" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Handles all procurement for US operations" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {purchasingOrgs.map((org) => (
          <Card key={org.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{org.name}</h3>
                      <Badge>{org.code}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{org.description}</p>
                    <p className="text-xs text-muted-foreground">{org.groupsCount} purchasing groups</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
