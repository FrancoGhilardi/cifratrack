"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";

import type { TransactionDTO } from "@/features/transactions/mappers/transaction.mapper";
import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import { getCategoryColor } from "@/shared/lib/category-colors";
import { cn } from "@/shared/lib/utils";
import { formatDateToLocal } from "@/shared/lib/utils/date-format";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

/** Tono del importe: ingreso, egreso pagado o egreso pendiente. */
export function getAmountTone(transaction: TransactionDTO) {
  if (transaction.kind === "income") return "text-app-pos";
  return transaction.status === "pending" ? "text-app-pend" : "text-app-neg";
}

/** Signo explícito: el color solo no alcanza para distinguir signo (a11y). */
export function getAmountSign(transaction: TransactionDTO) {
  return transaction.kind === "income" ? "+" : "−";
}

const SORTABLE_COLUMN_IDS = new Set(["occurredOn", "title", "amount"]);

interface SortableHeaderProps {
  label: string;
  columnId: string;
  sorting: SortingState;
  onSortingChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  align?: "left" | "right";
}

function SortableHeader({
  label,
  columnId,
  sorting,
  onSortingChange,
  align = "left",
}: SortableHeaderProps) {
  const active = sorting[0]?.id === columnId;
  const desc = active && sorting[0]?.desc;

  return (
    <button
      type="button"
      onClick={() => onSortingChange?.(columnId, desc ? "asc" : "desc")}
      aria-label={`Ordenar por ${label}`}
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-nav-accent)]",
        active ? "text-app-nav-accent" : "text-muted-foreground hover:text-foreground",
        align === "right" && "justify-end",
      )}
    >
      {label}
      {active ? (
        desc ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );
}

function CategoriesCell({
  categories,
}: {
  categories: TransactionDTO["categories"];
}) {
  if (categories.length === 0) {
    return <span className="text-[12px] text-muted-foreground">—</span>;
  }

  const visible = categories.slice(0, 2);
  const extra = categories.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px]">
      {visible.map((category, index) => (
        <span key={category.categoryId} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ background: getCategoryColor(index) }}
          />
          <span className="truncate">{category.categoryName}</span>
        </span>
      ))}
      {extra > 0 && (
        <span className="text-muted-foreground">+{extra}</span>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: TransactionDTO["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]",
        status === "paid" ? "bg-app-pos/12 text-app-pos" : "bg-app-pend/15 text-app-pend",
      )}
    >
      {status === "paid" ? "Pagado" : "Pendiente"}
    </span>
  );
}

interface TransactionsLedgerProps {
  transactions: TransactionDTO[];
  sorting?: SortingState;
  onSortingChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * Libro mayor de movimientos (desktop): hairlines en vez de caja, una sola
 * columna de importe con signo + color por token, acciones alcanzables por
 * teclado (`focus-within`, no solo `hover`).
 */
export function TransactionsLedger({
  transactions,
  sorting = [],
  onSortingChange,
  onEdit,
  onDelete,
}: TransactionsLedgerProps) {
  const { format } = useCurrency();

  const columns = useMemo<ColumnDef<TransactionDTO>[]>(
    () => [
      {
        accessorKey: "occurredOn",
        header: () => (
          <SortableHeader
            label="Fecha"
            columnId="occurredOn"
            sorting={sorting}
            onSortingChange={onSortingChange}
          />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-[12.5px] tabular-nums text-muted-foreground">
            {formatDateToLocal(row.original.occurredOn)}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: () => (
          <SortableHeader
            label="Detalle"
            columnId="title"
            sorting={sorting}
            onSortingChange={onSortingChange}
          />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 truncate text-[13.5px]">{row.original.title}</span>
              {row.original.sourceRecurringRuleId && (
                <span className="inline-flex items-center rounded-full bg-app-nav-active px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-app-nav-accent">
                  Recurrente
                </span>
              )}
              <StatusBadge status={row.original.status} />
            </div>
            {row.original.description && (
              <span className="line-clamp-1 text-[12px] text-muted-foreground">
                {row.original.description}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "paymentMethodName",
        header: () => (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Forma de pago
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-[13px] text-muted-foreground">
            {row.original.paymentMethodName ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "categories",
        header: () => (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Categorías
          </span>
        ),
        cell: ({ row }) => <CategoriesCell categories={row.original.categories} />,
      },
      {
        accessorKey: "amount",
        header: () => (
          <SortableHeader
            label="Importe"
            columnId="amount"
            sorting={sorting}
            onSortingChange={onSortingChange}
            align="right"
          />
        ),
        cell: ({ row }) => (
          <div
            className={cn(
              "text-right font-mono text-[13.5px] tabular-nums",
              getAmountTone(row.original),
            )}
          >
            {getAmountSign(row.original)}
            {format(row.original.amount)}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={() => onEdit?.(row.original.id)}
              aria-label={`Editar ${row.original.title}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-app-neg"
              onClick={() => onDelete?.(row.original.id)}
              aria-label={`Eliminar ${row.original.title}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [format, onDelete, onEdit, onSortingChange, sorting],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: {
      sorting,
    },
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="border-b border-border/60 hover:bg-transparent">
            {headerGroup.headers.map((header) => {
              const isAmount = header.column.id === "amount";
              const isActions = header.column.id === "actions";
              const isTitle = header.column.id === "title";
              const isSortable = SORTABLE_COLUMN_IDS.has(header.column.id);
              const isActive = header.column.id === sorting[0]?.id;

              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    "h-auto py-2.5",
                    isAmount && "text-right",
                    isActions && "w-[72px]",
                    isTitle && "max-w-[320px]",
                  )}
                  aria-sort={
                    !isSortable
                      ? undefined
                      : isActive
                        ? sorting[0]?.desc
                          ? "descending"
                          : "ascending"
                        : "none"
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            className="group border-b border-border/60 last:border-0 hover:bg-app-nav-hover"
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn(
                  "py-3",
                  cell.column.id === "title" && "max-w-[320px] whitespace-normal",
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
