'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

export default function RolesPermissionsPage() {
  const roles = [
    {
      role: 'ADMIN',
      permissions: ['*'],
      description: 'System administrator with full access',
      userCount: 2
    },
    {
      role: 'USER',
      permissions: ['read:tenders', 'create:tenders', 'score:bids'],
      description: 'Internal user who can create tenders and score bids',
      userCount: 15
    },
    {
      role: 'BUYER',
      permissions: ['create:pr', 'create:po', 'manage:vendors'],
      description: 'Purchasing professional',
      userCount: 8
    },
    {
      role: 'MANAGER',
      permissions: ['approve:pr', 'approve:po', 'view:reports'],
      description: 'Department manager with approval authority',
      userCount: 5
    },
    {
      role: 'FINANCE',
      permissions: ['approve:invoice', 'process:payment', 'view:budgets'],
      description: 'Finance team member',
      userCount: 4
    },
    {
      role: 'VENDOR',
      permissions: ['read:own', 'create:bids', 'submit:bids'],
      description: 'External vendor who can submit bids',
      userCount: 45
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <p className="text-muted-foreground">Configure system roles and access permissions</p>
      </div>

      <div className="grid gap-4">
        {roles.map((roleItem) => (
          <Card key={roleItem.role}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{roleItem.role}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{roleItem.description}</p>
                  </div>
                </div>
                <Badge variant="secondary">{roleItem.userCount} users</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm font-medium mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {roleItem.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
