'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

export default function BasisConfigurationPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Basis Configuration</h1>
        <p className="text-muted-foreground">System-wide configuration settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Organizational Structure</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hierarchy Levels</Label>
              <Input type="number" defaultValue="3" />
              <p className="text-xs text-muted-foreground">
                CompanyCode → Plant → StorageLocation
              </p>
            </div>
            <div className="space-y-2">
              <Label>Allow Cross-Plant Procurement</Label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approval Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tier 1 Limit ($)</Label>
              <Input type="number" defaultValue="10000" />
            </div>
            <div className="space-y-2">
              <Label>Tier 2 Limit ($)</Label>
              <Input type="number" defaultValue="50000" />
            </div>
            <div className="space-y-2">
              <Label>Tier 3 Limit ($)</Label>
              <Input type="number" defaultValue="100000" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Year</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Month</Label>
              <Input type="number" min="1" max="12" defaultValue="1" />
            </div>
            <div className="space-y-2">
              <Label>End Month</Label>
              <Input type="number" min="1" max="12" defaultValue="12" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset</Button>
        <Button>Save Configuration</Button>
      </div>
    </div>
  );
}
