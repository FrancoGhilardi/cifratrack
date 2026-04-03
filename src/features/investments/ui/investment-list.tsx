"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
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
  CreditCard,
  Pencil,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";

import type { CreateInvestmentInput } from "@/entities/investment/model/investment.schema";
import {
  useAllLiveRates,
  type YieldRate,
} from "@/features/market-data/hooks/useLatestYield";
import { useCurrency } from "@/shared/lib/hooks";
import { useSearchDebounce } from "@/shared/lib/hooks/useSearchDebounce";
import { formatPercentageValue } from "@/shared/lib/utils/percentage";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { Pagination } from "@/shared/ui/pagination";
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
import { TableLoadingOverlay } from "@/shared/ui/table-loading-overlay";

import { useInvestmentMutations } from "../hooks/useInvestments";
import type {
  InvestmentDTO,
  InvestmentQueryParams,
} from "../model/investment.dto";
import { DeleteInvestmentDialog } from "./delete-investment-dialog";
import { InvestmentForm } from "./investment-form";

const MOBILE_SORT_OPTIONS: Array<{
  value: `${NonNullable<InvestmentQueryParams["sortBy"]>}:${NonNullable<InvestmentQueryParams["sortOrder"]>}`;
  label: string;
}> = [
  { value: "startedOn:desc", label: "Inicio: más recientes" },
  { value: "startedOn:asc", label: "Inicio: más antiguas" },
  { value: "principal:desc", label: "Monto: mayor a menor" },
  { value: "principal:asc", label: "Monto: menor a mayor" },
  { value: "tna:desc", label: "TNA: mayor a menor" },
  { value: "tna:asc", label: "TNA: menor a mayor" },
  { value: "days:desc", label: "Duración: mayor a menor" },
  { value: "days:asc", label: "Duración: menor a mayor" },
  { value: "platform:asc", label: "Plataforma: A-Z" },
  { value: "platform:desc", label: "Plataforma: Z-A" },
  { value: "title:asc", label: "Título: A-Z" },
  { value: "title:desc", label: "Título: Z-A" },
];

interface InvestmentListProps {
  investments: InvestmentDTO[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  sortBy: NonNullable<InvestmentQueryParams["sortBy"]>;
  sortOrder: NonNullable<InvestmentQueryParams["sortOrder"]>;
  filters: Partial<Pick<InvestmentQueryParams, "q" | "active">>;
  onFiltersChange: (
    filters: Partial<Pick<InvestmentQueryParams, "q" | "active">>,
  ) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
  onSortChange: (
    sortBy: NonNullable<InvestmentQueryParams["sortBy"]>,
    sortOrder: NonNullable<InvestmentQueryParams["sortOrder"]>,
  ) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showCreateButton?: boolean;
}

function formatInvestmentDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function getDisplayMetrics(investment: InvestmentDTO, liveRates?: YieldRate[]) {
  const liveRate = liveRates?.find(
    (rate) => rate.providerId === investment.yieldProviderId,
  );
  const liveRateValue =
    typeof liveRate?.rate === "number" ? liveRate.rate : null;
  const hasLiveRate = liveRateValue !== null;
  const displayTna = hasLiveRate ? liveRateValue : investment.tna;
  const isLive = hasLiveRate && liveRateValue !== investment.tna;

  let currentYield = investment.yield;
  let currentTotal = investment.total;

  if (hasLiveRate && liveRateValue !== investment.tna && !investment.hasEnded) {
    const start = new Date(investment.startedOn);
    const now = new Date();
    const timeDiff = now.getTime() - start.getTime();
    const daysElapsed = Math.max(
      0,
      Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
    );

    const rate = liveRateValue / 100;
    const dailyRate = rate / 365;

    if (investment.isCompound) {
      currentTotal =
        investment.principal * Math.pow(1 + dailyRate, daysElapsed);
    } else {
      currentTotal = investment.principal * (1 + dailyRate * daysElapsed);
    }
    currentYield = currentTotal - investment.principal;
  }

  return {
    currentYield,
    currentTotal,
    displayTna,
    isLive,
    liveRateDate: liveRate?.date ?? null,
  };
}

export function InvestmentList({
  investments,
  meta,
  sortBy,
  sortOrder,
  filters,
  onFiltersChange,
  onResetFilters,
  isLoading = false,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  showCreateButton = false,
}: InvestmentListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] =
    useState<InvestmentDTO | null>(null);
  const [searchValue, setSearchValue] = useState(filters.q ?? "");

  useSearchDebounce({
    value: searchValue,
    delay: 300,
    minLength: 2,
    enabled: true,
    onDebounced: (debounced) => {
      if (debounced !== filters.q) {
        onFiltersChange({ q: debounced });
      }
    },
  });

  useEffect(() => {
    setSearchValue(filters.q ?? "");
  }, [filters.q]);

  const { create, update, delete: deleteInvestment } = useInvestmentMutations();
  const { formatCurrency } = useCurrency();
  const { data: liveRates } = useAllLiveRates();

  const metaInfo = useMemo(() => {
    const total = meta?.total ?? investments.length;
    const page = meta?.page ?? 1;
    const pageSize =
      meta?.pageSize ?? (investments.length > 0 ? investments.length : 10);
    const totalPages = meta?.totalPages ?? 1;

    return {
      total,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    };
  }, [investments.length, meta]);

  const sorting: SortingState = useMemo(
    () =>
      sortBy && sortOrder ? [{ id: sortBy, desc: sortOrder === "desc" }] : [],
    [sortBy, sortOrder],
  );

  const activeSort = sorting[0] ?? { id: "startedOn", desc: true };
  const mobileSortValue =
    `${activeSort.id}:${activeSort.desc ? "desc" : "asc"}` as const;

  const handleCreate = useCallback(() => {
    setSelectedInvestment(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((investment: InvestmentDTO) => {
    setSelectedInvestment(investment);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((investment: InvestmentDTO) => {
    setSelectedInvestment(investment);
    setDeleteDialogOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: CreateInvestmentInput) => {
      if (selectedInvestment) {
        await update.mutateAsync({ id: selectedInvestment.id, data });
      } else {
        await create.mutateAsync(data);
      }
    },
    [create, selectedInvestment, update],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedInvestment) {
      return;
    }

    await deleteInvestment.mutateAsync(selectedInvestment.id);
    setDeleteDialogOpen(false);
    setSelectedInvestment(null);
  }, [deleteInvestment, selectedInvestment]);

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
        cell: ({ row }) => {
          const metrics = getDisplayMetrics(row.original, liveRates);

          return (
            <div className="text-right">
              <div className="font-semibold">
                {formatCurrency(row.original.principal)}
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
        },
      },
      {
        id: "yield",
        header: "Rendimiento",
        cell: ({ row }) => {
          const metrics = getDisplayMetrics(row.original, liveRates);

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
        },
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
              onClick={() => handleEdit(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row.original)}
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
      handleDelete,
      handleEdit,
      handleSort,
      liveRates,
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

  const activeFiltersCount = useMemo(
    () => [filters.q, filters.active].filter(Boolean).length,
    [filters.active, filters.q],
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleActiveChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({ active: undefined });
    } else if (value === "active") {
      onFiltersChange({ active: "true" });
    } else {
      onFiltersChange({ active: "false" });
    }
  };

  const hasData = investments.length > 0;
  const activeFilterValue =
    filters.active === "true"
      ? "active"
      : filters.active === "false"
        ? "ended"
        : "all";

  return (
    <>
      <Card className="border shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <CardTitle>Inversiones</CardTitle>
              <CardDescription>
                Gestiona tus inversiones, compara rendimientos y revisa su
                evolución.
              </CardDescription>
            </div>

            {showCreateButton && (
              <Button onClick={handleCreate} className="w-full sm:w-auto">
                Nueva inversión
              </Button>
            )}
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título o plataforma"
                value={searchValue}
                onChange={handleSearchChange}
                className="h-11 pl-9"
              />
            </div>

            <Select
              value={activeFilterValue}
              onValueChange={handleActiveChange}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="ended">Finalizadas</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={onResetFilters}
                  className="h-11 w-full sm:w-auto"
                >
                  Limpiar filtros ({activeFiltersCount})
                </Button>
              )}

              {!showCreateButton && (
                <Button
                  onClick={handleCreate}
                  className="h-11 w-full sm:w-auto"
                >
                  Nueva inversión
                </Button>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <Select
              value={mobileSortValue}
              onValueChange={(value) => {
                const [nextSortBy, nextSortOrder] = value.split(":");
                if (
                  nextSortBy &&
                  (nextSortOrder === "asc" || nextSortOrder === "desc")
                ) {
                  onSortChange(
                    nextSortBy as NonNullable<InvestmentQueryParams["sortBy"]>,
                    nextSortOrder,
                  );
                }
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Ordenar inversiones" />
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
        </CardHeader>

        <CardContent>
          {!hasData ? (
            <EmptyState
              icon={TrendingUp}
              title="Sin inversiones"
              description="No hay inversiones registradas. Crea una para hacer seguimiento de rendimientos."
            />
          ) : (
            <div className="space-y-4">
              <div className="relative md:hidden">
                <TableLoadingOverlay show={isLoading} className="rounded-xl" />
                <div className="space-y-3">
                  {investments.map((investment) => {
                    const metrics = getDisplayMetrics(investment, liveRates);

                    return (
                      <div
                        key={investment.id}
                        className="rounded-xl border bg-card p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-2">
                            <div>
                              <p className="truncate text-sm font-semibold sm:text-base">
                                {investment.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {investment.platform}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge
                                variant={
                                  investment.hasEnded ? "outline" : "default"
                                }
                                className={
                                  investment.hasEnded
                                    ? "bg-muted/60"
                                    : "bg-green-600 hover:bg-green-600"
                                }
                              >
                                {investment.hasEnded ? "Finalizada" : "Activa"}
                              </Badge>
                              {investment.yieldProviderId && (
                                <Badge variant="secondary">
                                  Tasa vinculada
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-lg font-semibold">
                              {formatCurrency(investment.principal)}
                            </p>
                            <p
                              className={cn(
                                "text-xs",
                                metrics.isLive
                                  ? "font-medium text-blue-600 dark:text-blue-400"
                                  : "text-muted-foreground",
                              )}
                            >
                              TNA {formatPercentageValue(metrics.displayTna)}%
                              {metrics.isLive && " live"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border bg-background/60 p-3">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Rendimiento
                            </p>
                            <p className="mt-1 text-base font-semibold text-green-600 dark:text-green-400">
                              +{formatCurrency(metrics.currentYield)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Total: {formatCurrency(metrics.currentTotal)}
                            </p>
                          </div>

                          <div className="rounded-lg border bg-background/60 p-3">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Duración
                            </p>
                            <p className="mt-1 text-sm font-medium">
                              {investment.days
                                ? `${investment.days} días`
                                : "Sin vencimiento"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {investment.hasEnded
                                ? "Cerrada"
                                : investment.daysRemaining !== null
                                  ? `${investment.daysRemaining} días restantes`
                                  : "Activa sin fecha de cierre"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm">
                          <div className="flex items-start gap-2">
                            <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Vigencia
                              </p>
                              <p className="font-medium">
                                {formatInvestmentDate(investment.startedOn)} →{" "}
                                {formatInvestmentDate(investment.endDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Tipo de interés
                              </p>
                              <p className="font-medium">
                                {investment.isCompound ? "Compuesto" : "Simple"}
                              </p>
                              {metrics.isLive && metrics.liveRateDate && (
                                <p className="text-xs text-muted-foreground">
                                  Actualizado el{" "}
                                  {metrics.liveRateDate.toLocaleDateString(
                                    "es-AR",
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {investment.notes && (
                          <div className="mt-4 rounded-lg border bg-muted/20 p-3">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Notas
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {investment.notes}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <Button
                            variant="outline"
                            className="h-11 flex-1"
                            onClick={() => handleEdit(investment)}
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            className="h-11 flex-1 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(investment)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="relative hidden rounded-md border md:block">
                <TableLoadingOverlay show={isLoading} />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className="whitespace-nowrap"
                            >
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

              {metaInfo.totalPages > 1 && (
                <div className="rounded-lg border bg-card p-4">
                  <Pagination
                    currentPage={metaInfo.page}
                    totalPages={metaInfo.totalPages}
                    pageSize={metaInfo.pageSize}
                    totalItems={metaInfo.total}
                    onPageChange={(page) => onPageChange?.(page)}
                    onPageSizeChange={onPageSizeChange}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <InvestmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        investment={selectedInvestment}
      />

      <DeleteInvestmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        investment={selectedInvestment}
        isLoading={deleteInvestment.isPending}
      />
    </>
  );
}
