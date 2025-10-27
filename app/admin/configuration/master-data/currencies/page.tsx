'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function CurrenciesPage() {
  const [showForm, setShowForm] = useState(false);

  const currencies = [
    {
      id: 'cur_usd001',
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      exchangeRate: 1.0,
      isActive: true
    },
    {
      id: 'cur_eur001',
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      exchangeRate: 0.92,
      isActive: true
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Currencies</h1>
          <p className="text-muted-foreground">Manage system currencies and exchange rates</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Currency
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency Code</Label>
                  <Input placeholder="USD" maxLength={3} />
                </div>
                <div className="space-y-2">
                  <Label>Symbol</Label>
                  <Input placeholder="$" maxLength={3} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="US Dollar" />
                </div>
                <div className="space-y-2">
                  <Label>Exchange Rate</Label>
                  <Input placeholder="1.0" type="number" step="0.0001" />
                </div>
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch id="active" />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Currency</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {currencies.map((currency) => (
          <Card key={currency.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{currency.name}</h3>
                      <Badge>{currency.code}</Badge>
                      {currency.isActive && <Badge variant="secondary">Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Symbol: {currency.symbol} • Exchange Rate: {currency.exchangeRate}
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
