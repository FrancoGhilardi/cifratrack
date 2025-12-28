'use client';

import { TransactionDTO } from '@/features/transactions/mappers/transaction.mapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ArrowLeftRight } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/money';
import { formatDateToLocal } from '@/shared/lib/utils/date-format';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { EmptyState } from '@/shared/ui/empty-state';

interface TransactionsTableProps {
  transactions: TransactionDTO[];
  sorting?: SortingState;
  onSortingChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TransactionsTable({
  transactions,
  sorting = [],
  onSortingChange,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  // Definir columnas de TanStack Table
  const columns = useMemo<ColumnDef<TransactionDTO>[]>(
    () => [
      {
        accessorKey: 'occurredOn',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={() => {
                const newOrder = isSorted === 'asc' ? 'desc' : 'asc';
                onSortingChange?.('occurredOn', newOrder);
              }}
              className="h-8 px-2 hover:bg-accent"
            >
              Fecha
              {isSorted === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.original.occurredOn);
          return <span className="font-medium">{formatDateToLocal(date)}</span>;
        },
      },
      {
        accessorKey: 'title',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={() => {
                const newOrder = isSorted === 'asc' ? 'desc' : 'asc';
                onSortingChange?.('title', newOrder);
              }}
              className="h-8 px-2 hover:bg-accent"
            >
              Título
              {isSorted === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{row.original.title}</span>
              {row.original.sourceRecurringRuleId && (
                <Badge variant="outline" className="text-xs">
                  Recurrente
                </Badge>
              )}
            </div>
            {row.original.description && (
              <span className="text-sm text-muted-foreground">{row.original.description}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'paymentMethodName',
        header: 'Forma de Pago',
        cell: ({ row }) => row.original.paymentMethodName || '-',
      },
      {
        accessorKey: 'income',
        header: () => <div className="text-right">Ingreso</div>,
        cell: ({ row }) => {
          if (row.original.kind !== 'income') return null;
          return (
            <div className="text-right font-medium text-green-600">
              {formatCurrency(row.original.amount, row.original.currency)}
            </div>
          );
        },
      },
      {
        accessorKey: 'expense',
        header: () => <div className="text-right">Egreso</div>,
        cell: ({ row }) => {
          if (row.original.kind !== 'expense') return null;
          return (
            <div className="text-right font-medium text-red-600">
              {formatCurrency(row.original.amount, row.original.currency)}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          if (!row.original.isFixed || row.original.kind !== 'expense') return null;
          return (
            <Badge variant={row.original.status === 'paid' ? 'default' : 'secondary'}>
              {row.original.status === 'paid' ? 'Pagado' : 'Pendiente'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'categories',
        header: 'Categorías',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.categories.map((cat) => (
              <Badge key={cat.categoryId} variant="outline">
                {cat.categoryName}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit?.(row.original.id)}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete?.(row.original.id)}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onSortingChange, onEdit, onDelete]
  );

  // Convertir sorting a formato TanStack
  const tanstackSorting: SortingState = sorting.map((s) => {
    if (typeof s === 'string') {
      return { id: s, desc: false };
    }
    return s;
  });

  // Crear tabla instance
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: {
      sorting: tanstackSorting,
    },
  });

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title="Sin transacciones"
        description="No hay movimientos en este período. Crea uno nuevo o ajusta los filtros."
      />
    );
  }

  return (
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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
