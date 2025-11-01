'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

export default function ConfigurationValidationPage() {
  const validationResults = {
    valid: true,
    lastRun: '2025-10-27T17:00:00Z',
    checks: [
      {
        category: 'Company Codes',
        status: 'success',
        message: 'All company codes configured correctly',
        count: 1
      },
      {
        category: 'Plants',
        status: 'success',
        message: 'All plants assigned to valid company codes',
        count: 1
      },
      {
        category: 'Storage Locations',
        status: 'warning',
        message: '1 storage location has low capacity warning',
        count: 1
      },
      {
        category: 'Purchasing Organizations',
        status: 'success',
        message: 'All purchasing organizations properly configured',
        count: 1
      },
      {
        category: 'Purchasing Groups',
        status: 'success',
        message: 'All groups assigned to valid organizations',
        count: 3
      },
      {
        category: 'Vendors',
        status: 'error',
        message: '2 vendors missing required certifications',
        count: 45
      },
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary">Passed</Badge>;
      case 'warning':
        return <Badge variant="outline">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuration Validation</h1>
          <p className="text-muted-foreground">Verify system configuration integrity</p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Run Validation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Validation Summary</CardTitle>
            <Badge variant={validationResults.valid ? 'secondary' : 'destructive'}>
              {validationResults.valid ? 'System Healthy' : 'Issues Detected'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Last validation: {new Date(validationResults.lastRun).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {validationResults.checks.map((check, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="mt-0.5">
                    {getStatusIcon(check.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{check.category}</h3>
                      {getStatusBadge(check.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{check.message}</p>
                    <p className="text-xs text-muted-foreground">Checked {check.count} item(s)</p>
                  </div>
                </div>
                {check.status === 'error' || check.status === 'warning' ? (
                  <Button variant="outline" size="sm">View Details</Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
