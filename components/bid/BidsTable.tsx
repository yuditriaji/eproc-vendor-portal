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
import { ArrowUpDown, ExternalLink, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { BidStatusTimeline } from './BidStatusTimeline';
import type { Bid } from '@/types';

interface BidsTableProps {
  bids: Bid[];
}

export function BidsTable({ bids }: BidsTableProps) {
  const columns = useMemo<ColumnDef<Bid>[]>(
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
        accessorKey: 'tender.title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Tender
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="max-w-md">
            <Link
              href={`/vendor/bids/${row.original.id}`}
              className="font-medium hover:text-primary transition-colors line-clamp-1"
            >
              {row.original.tender?.title || 'Untitled Tender'}
            </Link>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {row.original.tender?.organization?.name || 'N/A'}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const statusConfig: Record<string, { label: string; className: string }> = {
            DRAFT: { label: 'Draft', className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400' },
            SUBMITTED: { label: 'Submitted', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
            UNDER_REVIEW: { label: 'Under Review', className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
            ACCEPTED: { label: 'Accepted', className: 'bg-green-500/10 text-green-700 dark:text-green-400' },
            REJECTED: { label: 'Rejected', className: 'bg-red-500/10 text-red-700 dark:text-red-400' },
            WITHDRAWN: { label: 'Withdrawn', className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400' },
          };

          const config = statusConfig[status] || statusConfig.DRAFT;

          return (
            <Badge className={config.className}>
              {config.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'bidAmount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Bid Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.bidAmount
              ? formatCurrency(row.original.bidAmount, row.original.currency)
              : 'N/A'}
          </div>
        ),
      },
      {
        accessorKey: 'submittedAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Submitted Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.submittedAt
              ? formatDate(row.original.submittedAt)
              : row.original.status === 'DRAFT'
              ? 'Not submitted'
              : 'N/A'}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/vendor/bids/${row.original.id}`}>
                  View Details
                </Link>
              </DropdownMenuItem>
              {row.original.status === 'DRAFT' && (
                <DropdownMenuItem asChild>
                  <Link href={`/vendor/bids/${row.original.id}/edit`}>
                    Edit Bid
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href={`/vendor/tenders/${row.original.tender?.id}`}>
                  View Tender
                </Link>
              </DropdownMenuItem>
              {row.original.status === 'SUBMITTED' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Withdraw Bid
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: bids,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
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
                  No bids found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
