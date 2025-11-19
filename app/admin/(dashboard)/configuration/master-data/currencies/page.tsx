'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, AlertCircle, Search, Edit2, Trash2 } from 'lucide-react';
import {
  useGetCurrenciesQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
} from '@/store/api/configApi';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CurrencyFormData {
  code: string;
  symbol: string;
  name: string;
  exchangeRate?: number;
  isActive?: boolean;
}

export default function CurrenciesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useGetCurrenciesQuery();
  const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation();
  const [updateCurrency, { isLoading: isUpdating }] = useUpdateCurrencyMutation();
  const [deleteCurrency, { isLoading: isDeleting }] = useDeleteCurrencyMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CurrencyFormData>({
    defaultValues: {
      code: '',
      symbol: '',
      name: '',
      exchangeRate: 1.0,
      isActive: true,
    },
  });

  const list = useMemo(() => {
    const arr = Array.isArray(data) ? data : data?.data || [];
    return Array.isArray(arr) ? arr : [];
  }, [data]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return list.filter((c: any) => {
      const matchQ = !q || c.code?.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? c.isActive : !c.isActive);
      return matchQ && matchStatus;
    });
  }, [list, searchQuery, statusFilter]);

  const onSubmit = async (form: CurrencyFormData) => {
    try {
      const payload = {
        code: (form.code || '').toUpperCase(),
        symbol: form.symbol,
        name: form.name,
        exchangeRate: form.exchangeRate ? Number(form.exchangeRate) : 1.0,
        isActive: form.isActive ?? true,
      };

      if (editing) {
        // code is immutable
        const { code, ...rest } = payload as any;
        await updateCurrency({ id: editing.id, data: rest }).unwrap();
        toast.success('Currency updated successfully');
      } else {
        await createCurrency(payload).unwrap();
        toast.success('Currency added successfully');
      }

      setShowModal(false);
      setEditing(null);
      reset({ code: '', symbol: '', name: '', exchangeRate: 1.0, isActive: true });
    } catch (err: any) {
      const msg = err?.data?.message || err?.data?.errors?.join(', ') || 'Failed to save currency';
      toast.error(msg);
    }
  };

  const startCreate = () => {
    setEditing(null);
    reset({ code: '', symbol: '', name: '', exchangeRate: 1.0, isActive: true });
    setShowModal(true);
  };

  const startEdit = (c: any) => {
    setEditing(c);
    reset({
      code: c.code,
      symbol: c.symbol,
      name: c.name,
      exchangeRate: c.exchangeRate ?? 1.0,
      isActive: !!c.isActive,
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteCurrency(confirmDeleteId).unwrap();
      toast.success('Currency deleted successfully');
      setConfirmDeleteId(null);
    } catch (err: any) {
      if (err?.data?.statusCode === 409) {
        toast.error('Currency is in use and cannot be deleted');
      } else {
        toast.error(err?.data?.message || 'Failed to delete currency');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="p-6 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load currencies. Please try again.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Currencies</h1>
          <p className="text-sm text-muted-foreground">Manage currency codes and exchange rates</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Currency
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">💱</div>
            <p className="text-muted-foreground mb-4">No currencies configured yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Add your first currency to start managing exchange rates
            </p>
            <Button onClick={startCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Currency
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-3 px-2">Code</th>
                <th className="py-3 px-2">Symbol</th>
                <th className="py-3 px-2">Name</th>
                <th className="py-3 px-2">Exchange Rate</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-3 px-2 font-semibold">{c.code}</td>
                  <td className="py-3 px-2">{c.symbol}</td>
                  <td className="py-3 px-2">{c.name}</td>
                  <td className="py-3 px-2">{Number(c.exchangeRate ?? 1).toFixed(6)}</td>
                  <td className="py-3 px-2">
                    <Badge variant={c.isActive ? 'secondary' : 'outline'}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(c)}>
                        <Edit2 className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Currency' : 'Add Currency'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update currency details' : 'Create a new currency'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency Code *</Label>
                <Input
                  placeholder="USD"
                  {...register('code', {
                    required: 'Code is required',
                    minLength: { value: 3, message: 'Must be 3 letters' },
                    maxLength: { value: 3, message: 'Must be 3 letters' },
                    validate: (v) => /^[A-Z]{3}$/.test((v || '').toUpperCase()) || 'Must be 3 uppercase letters',
                  })}
                  onChange={(e) => (e.target.value = e.target.value.toUpperCase())}
                  disabled={!!editing}
                />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message as string}</p>}
                <p className="text-xs text-muted-foreground">Exactly 3 uppercase letters (e.g., USD)</p>
              </div>

              <div className="space-y-2">
                <Label>Symbol *</Label>
                <Input
                  placeholder="$"
                  {...register('symbol', {
                    required: 'Symbol is required',
                    minLength: { value: 1, message: 'Min 1 char' },
                    maxLength: { value: 10, message: 'Max 10 chars' },
                  })}
                />
                {errors.symbol && <p className="text-sm text-destructive">{errors.symbol.message as string}</p>}
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="US Dollar"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 1, message: 'Min 1 char' },
                    maxLength: { value: 100, message: 'Max 100 chars' },
                  })}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label>Exchange Rate</Label>
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="1.000000"
                  {...register('exchangeRate', {
                    valueAsNumber: true,
                    validate: (v) => (v === undefined || v === null || v > 0) || 'Must be positive',
                  })}
                />
                {errors.exchangeRate && (
                  <p className="text-sm text-destructive">{errors.exchangeRate.message as string}</p>
                )}
                <p className="text-xs text-muted-foreground">Rate relative to base currency (max 6 decimals)</p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" {...register('isActive')} className="h-4 w-4" />
                  <span className="text-sm">Active</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                }}
                disabled={isCreating || isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Delete Currency</DialogTitle>
            <DialogDescription>Are you sure you want to delete this currency? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
