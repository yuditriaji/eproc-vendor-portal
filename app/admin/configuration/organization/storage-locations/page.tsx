'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Database, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StorageLocationsPage() {
  const [showForm, setShowForm] = useState(false);

  const locations = [
    {
      id: 'sl_wh001',
      code: 'SL001',
      name: 'Main Warehouse',
      plant: 'P1001 - Manhattan Plant',
      capacity: '50,000 sqft'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Storage Locations</h1>
          <p className="text-muted-foreground">Warehouse and storage facilities</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Storage Location
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Storage Location</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plant</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p1001">P1001 - Manhattan Plant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input placeholder="SL001" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Main Warehouse" />
                </div>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input placeholder="50000" type="number" />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input placeholder="sqft" />
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
        {locations.map((location) => (
          <Card key={location.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{location.name}</h3>
                      <Badge>{location.code}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {location.plant} • Capacity: {location.capacity}
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
