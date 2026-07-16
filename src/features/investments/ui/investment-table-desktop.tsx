"use client";

import { memo, useCallback, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";

import { formatPercentageValue } from "@/shared/lib/utils/percentage";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { TableLoadingOverlay } from "@/shared/ui/table-loading-overlay";

import type {
  InvestmentDTO,
  InvestmentQueryParams,
} from "../model/investment.dto";
import {
  formatInvestmentDate,
  getDisplayMetrics,
  type LiveRatesMap,
} from "./investment-metrics";

interface InvestmentTableDesktopProps {
  investments: InvestmentDTO[];
  sorting: SortingState;
  onSortChange: (
    sortBy: NonNullable<InvestmentQueryParams["sortBy"]>,
    sortOrder: NonNullable<InvestmentQueryParams["sortOrder"]>,
  ) => void;
  liveRatesMap: LiveRatesMap;
  formatCurrency: (value: number) => string;
  isLoading: boolean;
  onEdit: (investment: InvestmentDTO) => void;
  onDelete: (investment: InvestmentDTO) => void;
}

const PrincipalCell = memo(function PrincipalCell({
  investment,
  liveRatesMap,
  formatCurrency,
}: {
  investment: InvestmentDTO;
  liveRatesMap: LiveRatesMap;
  formatCurrency: (value: number) => string;
}) {
  const metrics = useMemo(
    () => getDisplayMetrics(investment, liveRatesMap),
    [investment, liveRatesMap],
  );

  return (
    <div className="text-right">
      <div className="font-semibold">
        {formatCurrency(investment.principal)}
      </div>
      <div
        className={cn(
          "text-xs",
          metrics.isLive
            ? "font-medium text-blue-600 dark:text-blue-400"
            : "text-muted-foreground",
        )}
      >
        TNA: {formatPercentageValue(metrics.displayTna)}%
        {metrics.isLive && " (Live)"}
      </div>
    </div>
  );
});

const YieldCell = memo(function YieldCell({
  investment,
  liveRatesMap,
  formatCurrency,
}: {
  investment: InvestmentDTO;
  liveRatesMap: LiveRatesMap;
  formatCurrency: (value: number) => string;
}) {
  const metrics = useMemo(
    () => getDisplayMetrics(investment, liveRatesMap),
    [investment, liveRatesMap],
  );

  return (
    <div className="text-right">
      <div className="font-semibold text-green-600 dark:text-green-400">
        +{formatCurrency(metrics.currentYield)}
      </div>
      <div className="text-xs text-muted-foreground">
        Total: {formatCurrency(metrics.currentTotal)}
      </div>
    </div>
  );
});

export function InvestmentTableDesktop({
  investments,
  sorting,
  onSortChange,
  liveRatesMap,
  formatCurrency,
  isLoading,
  onEdit,
  onDelete,
}: InvestmentTableDesktopProps) {
  const handleSort = useCallback(
    (columnId: NonNullable<InvestmentQueryParams["sortBy"]>) => {
      const current = sorting.find((sort) => sort.id === columnId);
      const nextOrder = current ? (current.desc ? "asc" : "desc") : "desc";
      onSortChange(columnId, nextOrder);
    },
    [onSortChange, sorting],
  );

  const renderSortIcon = useCallback(
    (columnId: string) => {
      const current = sorting.find((sort) => sort.id === columnId);
      if (!current) {
        return <ArrowUpDown className="ml-2 h-4 w-4" />;
      }

      return current.desc ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUp className="ml-2 h-4 w-4" />
      );
    },
    [sorting],
  );

  const columns = useMemo<ColumnDef<InvestmentDTO>[]>(
    () => [
      {
        id: "title",
        accessorKey: "title",
        header: () => (
          <Button
            variant="ghost"
            onClick={() => handleSort("title")}
            className="h-8 px-2 hover:bg-accent"
          >
            Título / Plataforma
            {renderSortIcon("title")}
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.platform}
            </div>
          </div>
        ),
      },
      {
        id: "principal",
        accessorKey: "principal",
        header: () => (
          <Button
            variant="ghost"
            onClick={() => handleSort("principal")}
            className="h-8 px-2 hover:bg-accent"
          >
            Monto
            {renderSortIcon("principal")}
          </Button>
        ),
        cell: ({ row }) => (
          <PrincipalCell
            investment={row.original}
            liveRatesMap={liveRatesMap}
            formatCurrency={formatCurrency}
          />
        ),
      },
      {
        id: "yield",
        header: "Rendimiento",
        cell: ({ row }) => (
          <YieldCell
            investment={row.original}
            liveRatesMap={liveRatesMap}
            formatCurrency={formatCurrency}
          />
        ),
      },
      {
        id: "days",
        accessorKey: "days",
        header: () => (
          <Button
            variant="ghost"
            onClick={() => handleSort("days")}
            className="h-8 px-2 hover:bg-accent"
          >
            Duración
            {renderSortIcon("days")}
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>
                {row.original.days
                  ? `${row.original.days} días`
                  : "Sin vencimiento"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatInvestmentDate(row.original.startedOn)} →{" "}
              {formatInvestmentDate(row.original.endDate)}
            </div>
          </div>
        ),
      },
      {
        id: "startedOn",
        accessorKey: "startedOn",
        header: () => (
          <Button
            variant="ghost"
            onClick={() => handleSort("startedOn")}
            className="h-8 px-2 hover:bg-accent"
          >
            Inicio
            {renderSortIcon("startedOn")}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="font-medium">
              {formatInvestmentDate(row.original.startedOn)}
            </div>
            <div className="text-xs text-muted-foreground">
              Fin: {formatInvestmentDate(row.original.endDate)}
            </div>
          </div>
        ),
      },
      {
        id: "status",
        header: "Estado",
        cell: ({ row }) => {
          if (row.original.hasEnded) {
            return (
              <Badge variant="outline" className="bg-muted/60">
                Finalizada
              </Badge>
            );
          }

          return (
            <div className="flex flex-col gap-1">
              <Badge className="bg-green-600 hover:bg-green-600">Activa</Badge>
              <span className="text-xs text-muted-foreground">
                {row.original.daysRemaining !== null
                  ? `${row.original.daysRemaining} días restantes`
                  : "Sin fecha de cierre"}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(row.original)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [
      formatCurrency,
      handleSort,
      liveRatesMap,
      onDelete,
      onEdit,
      renderSortIcon,
    ],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: investments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: {
      sorting,
    },
  });

  return (
    <div className="relative hidden rounded-md border md:block">
      <TableLoadingOverlay show={isLoading} />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
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
                  <TableCell key={cell.id} className="align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
