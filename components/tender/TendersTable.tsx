'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { formatCurrency, formatDate, getDaysRemaining } from '@/lib/formatters';
import type { Tender } from '@/types';

interface TendersTableProps {
  tenders: Tender[];
}

export function TendersTable({ tenders }: TendersTableProps) {
  const columns = useMemo<ColumnDef<Tender>[]>(
    () => [
      {
        accessorKey: 'referenceNumber',
        header: 'Reference',
        cell: ({ row }) => (
          <div className="font-mono text-sm">
            {row.original.referenceNumber || 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-md">
            <Link
              href={`/vendor/tenders/${row.original.id}`}
              className="font-medium hover:text-primary transition-colors line-clamp-1"
            >
              {row.original.title}
            </Link>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {row.original.organization?.name}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusColors: Record<string, string> = {
            PUBLISHED: 'bg-green-500/10 text-green-700 dark:text-green-400',
            DRAFT: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
            CLOSED: 'bg-red-500/10 text-red-700 dark:text-red-400',
            AWARDED: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
          };
          
          return (
            <Badge className={statusColors[row.original.status] || 'bg-gray-500/10'}>
              {row.original.status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'estimatedValue',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Estimated Value
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.estimatedValue
              ? formatCurrency(row.original.estimatedValue, row.original.currency)
              : 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'closingDate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Closing Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const daysRemaining = getDaysRemaining(row.original.closingDate);
          const isUrgent = daysRemaining <= 7 && daysRemaining > 0;
          const isClosed = daysRemaining <= 0;

          return (
            <div>
              <div className="text-sm">{formatDate(row.original.closingDate)}</div>
              <div
                className={`text-xs ${
                  isClosed
                    ? 'text-red-600'
                    : isUrgent
                    ? 'text-orange-600 font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {isClosed ? 'Closed' : `${daysRemaining} days left`}
              </div>
            </div>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <Button asChild variant="ghost" size="sm">
            <Link href={`/vendor/tenders/${row.original.id}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: tenders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No tenders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {tenders.length > 0 ? (
          tenders.map((tender) => {
            const daysRemaining = getDaysRemaining(tender.closingDate);
            const isUrgent = daysRemaining <= 7 && daysRemaining > 0;
            
            return (
              <Link
                key={tender.id}
                href={`/vendor/tenders/${tender.id}`}
                className="block p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium line-clamp-2 flex-1">{tender.title}</h3>
                  <Badge className={
                    tender.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                    tender.status === 'CLOSED' ? 'bg-red-500/10 text-red-700 dark:text-red-400' :
                    'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                  }>
                    {tender.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{tender.organization?.name}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tender.estimatedValue ? formatCurrency(tender.estimatedValue, tender.currency) : 'N/A'}
                  </span>
                  <span className={isUrgent ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
                    {daysRemaining} days left
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No tenders found.
          </div>
        )}
      </div>
    </>
  );
}
