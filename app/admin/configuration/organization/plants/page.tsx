'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PlantsPage() {
  const [showForm, setShowForm] = useState(false);

  const plants = [
    {
      id: 'plt_man1001',
      code: 'P1001',
      name: 'Manhattan Manufacturing Plant',
      companyCode: 'CC1000',
      address: 'New York, NY',
      storageLocations: 2
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plants</h1>
          <p className="text-muted-foreground">Manufacturing and operational facilities</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plant
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Plant</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Code</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company code" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cc1000">CC1000 - Acme US Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Plant Code</Label>
                  <Input placeholder="P1001" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Manhattan Manufacturing Plant" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Primary manufacturing facility" />
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
        {plants.map((plant) => (
          <Card key={plant.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{plant.name}</h3>
                      <Badge>{plant.code}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plant.companyCode} • {plant.address} • {plant.storageLocations} storage locations
                    </p>
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
