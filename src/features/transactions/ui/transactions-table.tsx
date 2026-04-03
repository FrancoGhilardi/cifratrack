"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  CreditCard,
  Pencil,
  ReceiptText,
  Trash2,
} from "lucide-react";

import type { TransactionDTO } from "@/features/transactions/mappers/transaction.mapper";
import { formatCurrency } from "@/shared/lib/money";
import { cn } from "@/shared/lib/utils";
import { formatDateToLocal } from "@/shared/lib/utils/date-format";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

const MOBILE_SORT_OPTIONS = [
  { value: "occurredOn:desc", label: "Fecha: más recientes" },
  { value: "occurredOn:asc", label: "Fecha: más antiguas" },
  { value: "title:asc", label: "Título: A-Z" },
  { value: "title:desc", label: "Título: Z-A" },
  { value: "amount:desc", label: "Monto: mayor a menor" },
  { value: "amount:asc", label: "Monto: menor a mayor" },
] as const;

interface TransactionsTableProps {
  transactions: TransactionDTO[];
  sorting?: SortingState;
  onSortingChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
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
  const columns = useMemo<ColumnDef<TransactionDTO>[]>(
    () => [
      {
        accessorKey: "occurredOn",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={() => {
                const newOrder = isSorted === "asc" ? "desc" : "asc";
                onSortingChange?.("occurredOn", newOrder);
              }}
              className="h-8 px-2 hover:bg-accent"
            >
              Fecha
              {isSorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : isSorted === "desc" ? (
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
        accessorKey: "title",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={() => {
                const newOrder = isSorted === "asc" ? "desc" : "asc";
                onSortingChange?.("title", newOrder);
              }}
              className="h-8 px-2 hover:bg-accent"
            >
              Título
              {isSorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : isSorted === "desc" ? (
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
              <span className="text-sm text-muted-foreground">
                {row.original.description}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "paymentMethodName",
        header: "Forma de Pago",
        cell: ({ row }) => row.original.paymentMethodName || "-",
      },
      {
        accessorKey: "income",
        header: () => <div className="text-right">Ingreso</div>,
        cell: ({ row }) => {
          if (row.original.kind !== "income") return null;
          return (
            <div className="text-right font-medium text-green-600 dark:text-green-400">
              {formatCurrency(row.original.amount, row.original.currency)}
            </div>
          );
        },
      },
      {
        accessorKey: "expense",
        header: () => <div className="text-right">Egreso</div>,
        cell: ({ row }) => {
          if (row.original.kind !== "expense") return null;

          const colorClass =
            row.original.status === "pending"
              ? "text-amber-600 dark:text-amber-400"
              : "text-red-600";

          return (
            <div className={cn("text-right font-medium", colorClass)}>
              {formatCurrency(row.original.amount, row.original.currency)}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
          if (!row.original.isFixed || row.original.kind !== "expense") {
            return null;
          }

          return (
            <Badge
              variant={row.original.status === "paid" ? "default" : "secondary"}
            >
              {row.original.status === "paid" ? "Pagado" : "Pendiente"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "categories",
        header: "Categorías",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.categories.map((category) => (
              <Badge key={category.categoryId} variant="outline">
                {category.categoryName}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: "actions",
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
    [onDelete, onEdit, onSortingChange],
  );

  const tanstackSorting: SortingState = sorting.map((sort) => {
    if (typeof sort === "string") {
      return { id: sort, desc: false };
    }

    return sort;
  });

  const activeSort = tanstackSorting[0] ?? { id: "occurredOn", desc: true };
  const mobileSortValue = `${activeSort.id}:${activeSort.desc ? "desc" : "asc"}`;

  // eslint-disable-next-line react-hooks/incompatible-library
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
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 md:hidden">
        <div className="space-y-2">
          <p className="text-sm font-medium">Orden</p>
          <Select
            value={mobileSortValue}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split(":");
              if (sortBy && (sortOrder === "asc" || sortOrder === "desc")) {
                onSortingChange?.(sortBy, sortOrder);
              }
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Ordenar movimientos" />
            </SelectTrigger>
            <SelectContent>
              {MOBILE_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {transactions.map((transaction) => {
          const amountColorClass =
            transaction.kind === "income"
              ? "text-green-600 dark:text-green-400"
              : transaction.status === "pending"
                ? "text-amber-600 dark:text-amber-400"
                : "text-red-600";

          return (
            <div
              key={transaction.id}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold sm:text-base">
                      {transaction.title}
                    </p>
                    {transaction.sourceRecurringRuleId && (
                      <Badge variant="outline" className="text-xs">
                        Recurrente
                      </Badge>
                    )}
                    {transaction.isFixed && transaction.kind === "expense" && (
                      <Badge
                        variant={
                          transaction.status === "paid"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {transaction.status === "paid" ? "Pagado" : "Pendiente"}
                      </Badge>
                    )}
                  </div>

                  {transaction.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {transaction.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className={cn("text-lg font-semibold", amountColorClass)}>
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.kind === "income" ? "Ingreso" : "Egreso"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Fecha
                    </p>
                    <p className="font-medium">
                      {formatDateToLocal(new Date(transaction.occurredOn))}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Forma de pago
                    </p>
                    <p className="font-medium">
                      {transaction.paymentMethodName || "-"}
                    </p>
                  </div>
                </div>

                {transaction.isFixed && transaction.kind === "expense" && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <ReceiptText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Seguimiento
                      </p>
                      <p className="font-medium">
                        {transaction.status === "pending" && transaction.dueOn
                          ? `Vence ${formatDateToLocal(
                              new Date(transaction.dueOn),
                            )}`
                          : transaction.paidOn
                            ? `Pagado el ${formatDateToLocal(
                                new Date(transaction.paidOn),
                              )}`
                            : transaction.status === "paid"
                              ? "Movimiento registrado como pagado"
                              : "Sin fecha adicional"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {transaction.categories.map((category) => (
                  <Badge key={category.categoryId} variant="outline">
                    {category.categoryName}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="h-11 flex-1"
                  onClick={() => onEdit?.(transaction.id)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  className="h-11 flex-1 text-destructive hover:text-destructive"
                  onClick={() => onDelete?.(transaction.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden rounded-md border md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
