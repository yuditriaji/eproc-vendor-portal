'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PurchasingGroupsPage() {
  const [showForm, setShowForm] = useState(false);

  const groups = [
    {
      id: 'pg_it100',
      code: 'PG100',
      name: 'IT & Electronics Procurement Group',
      purchasingOrg: 'PORG1000',
      description: 'Specializes in IT equipment and electronics'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchasing Groups</h1>
          <p className="text-muted-foreground">Specialized procurement teams</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Purchasing Group
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Purchasing Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purchasing Organization</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="porg1000">PORG1000 - US Procurement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input placeholder="PG100" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="IT & Electronics Procurement Group" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Specializes in IT equipment and electronics" />
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
        {groups.map((group) => (
          <Card key={group.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{group.name}</h3>
                      <Badge>{group.code}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{group.description}</p>
                    <p className="text-xs text-muted-foreground">Organization: {group.purchasingOrg}</p>
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
