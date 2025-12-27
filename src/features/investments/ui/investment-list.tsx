'use client';

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  Pencil,
  Trash2,
  TrendingUp,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Pagination } from '@/shared/ui/pagination';
import { TableLoadingOverlay } from '@/shared/ui/table-loading-overlay';
import type { InvestmentDTO, InvestmentQueryParams } from '../model/investment.dto';
import { InvestmentForm } from './investment-form';
import { DeleteInvestmentDialog } from './delete-investment-dialog';
import { InvestmentListSkeleton } from './investment-list-skeleton';
import { useInvestmentMutations } from '../hooks/useInvestments';
import type { CreateInvestmentInput } from '@/entities/investment/model/investment.schema';
import { useCurrency } from '@/shared/lib/hooks';
import { useSearchDebounce } from '@/shared/lib/hooks/useSearchDebounce';

interface InvestmentListProps {
  investments: InvestmentDTO[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  sortBy: NonNullable<InvestmentQueryParams['sortBy']>;
  sortDir: NonNullable<InvestmentQueryParams['sortDir']>;
  filters: Partial<Pick<InvestmentQueryParams, 'q' | 'active'>>;
  onFiltersChange: (filters: Partial<Pick<InvestmentQueryParams, 'q' | 'active'>>) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
  onSortChange: (
    sortBy: NonNullable<InvestmentQueryParams['sortBy']>,
    sortDir: NonNullable<InvestmentQueryParams['sortDir']>
  ) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showCreateButton?: boolean;
}

export function InvestmentList({
  investments,
  meta,
  sortBy,
  sortDir,
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
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentDTO | null>(null);
  // Búsqueda robusta con debounce genérico
  const [searchValue, setSearchValue] = useState(filters.q ?? '');
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

  const { create, update, delete: deleteInvestment } = useInvestmentMutations();
  const { formatCurrency } = useCurrency();

  const metaInfo = useMemo(() => {
    const total = meta?.total ?? investments.length;
    const page = meta?.page ?? 1;
    const pageSize = meta?.pageSize ?? (investments.length > 0 ? investments.length : 10);
    const totalPages = meta?.totalPages ?? 1;

    return {
      total,
      page,
      pageSize,
      totalPages: totalPages > 0 ? totalPages : 1,
    };
  }, [meta, investments.length]);

  const sorting: SortingState =
    sortBy && sortDir ? [{ id: sortBy, desc: sortDir === 'desc' }] : [];

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
    [create, update, selectedInvestment]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (selectedInvestment) {
      await deleteInvestment.mutateAsync(selectedInvestment.id);
      setDeleteDialogOpen(false);
      setSelectedInvestment(null);
    }
  }, [deleteInvestment, selectedInvestment]);

  const handleSort = useCallback(
    (columnId: NonNullable<InvestmentQueryParams['sortBy']>) => {
      const current = sorting.find((s) => s.id === columnId);
      const nextDir = current ? (current.desc ? 'asc' : 'desc') : 'desc';
      onSortChange(columnId, nextDir);
    },
    [onSortChange, sorting]
  );

  const renderSortIcon = useCallback(
    (columnId: string) => {
      const current = sorting.find((s) => s.id === columnId);
      if (!current) return <ArrowUpDown className="ml-2 h-4 w-4" />;
      return current.desc ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUp className="ml-2 h-4 w-4" />
      );
    },
    [sorting]
  );

  const columns = useMemo<ColumnDef<InvestmentDTO>[]>(
    () => [
      {
        id: 'title',
        accessorKey: 'title',
        header: () => (
          <Button
            variant="ghost"
            onClick={() => handleSort('title')}
            className="h-8 px-2 hover:bg-accent"
          >
            Título / Plataforma
            {renderSortIcon('title')}
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="text-sm text-muted-foreground">{row.original.platform}</div>
          </div>
        ),
      },
      {
        id: 'principal',
        accessorKey: 'principal',
        header: () => (
          <Button
            variant="ghost"
            onClick={() => handleSort('principal')}
            className="h-8 px-2 hover:bg-accent"
          >
            Monto
            {renderSortIcon('principal')}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-right">
            <div className="font-semibold">{formatCurrency(row.original.principal)}</div>
            <div className="text-xs text-muted-foreground">
              TNA: {row.original.tna.toFixed(2)}%
            </div>
          </div>
        ),
      },
      {
        id: 'yield',
        header: 'Rendimiento',
        cell: ({ row }) => (
          <div className="text-right">
            <div className="font-semibold text-green-600 dark:text-green-400">
              +{formatCurrency(row.original.yield)}
            </div>
            <div className="text-xs text-muted-foreground">
              Total: {formatCurrency(row.original.total)}
            </div>
          </div>
        ),
      },
      {
        id: 'days',
        accessorKey: 'days',
        header: () => (
          <Button
            variant="ghost"
            onClick={() => handleSort('days')}
            className="h-8 px-2 hover:bg-accent"
          >
            Duración
            {renderSortIcon('days')}
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>{row.original.days} días</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {row.original.startedOn} → {row.original.endDate}
            </div>
          </div>
        ),
      },
      {
        id: 'startedOn',
        accessorKey: 'startedOn',
        header: () => (
          <Button
            variant="ghost"
            onClick={() => handleSort('startedOn')}
            className="h-8 px-2 hover:bg-accent"
          >
            Inicio
            {renderSortIcon('startedOn')}
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="font-medium">{row.original.startedOn}</div>
            <div className="text-xs text-muted-foreground">Fin: {row.original.endDate}</div>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          if (row.original.hasEnded) {
            return (
              <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                Finalizada
              </Badge>
            );
          }

          return (
            <div className="flex flex-col gap-1">
              <Badge variant="default" className="bg-green-600">
                Activa
              </Badge>
              <span className="text-xs text-muted-foreground">
                {row.original.daysRemaining} días restantes
              </span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
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
    [handleDelete, handleEdit, handleSort, formatCurrency, renderSortIcon]
  );

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
    [filters.q, filters.active]
  );

  // Mantener el valor local de búsqueda sincronizado con el que viene de la URL
  useEffect(() => {
    setSearchValue(filters.q ?? '');
  }, [filters.q]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleActiveChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({ active: undefined });
    } else if (value === 'active') {
      onFiltersChange({ active: 'true' });
    } else {
      onFiltersChange({ active: 'false' });
    }
  };

  const hasData = investments.length > 0;
  const activeFilterValue =
    filters.active === 'true' ? 'active' : filters.active === 'false' ? 'ended' : 'all';
  const isInitialLoading = isLoading && !hasData;

  return (
    <>
      <Card className="border-0">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Inversiones</CardTitle>
              <CardDescription>Gestiona tus inversiones y rendimientos</CardDescription>
            </div>
            {showCreateButton && (
              <Button onClick={handleCreate} size="sm">
                Nueva inversión
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título o plataforma"
                  value={searchValue}
                  onChange={handleSearchChange}
                  className="pl-9"
                />
              </div>

              <Select value={activeFilterValue} onValueChange={handleActiveChange}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="ended">Finalizadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" onClick={onResetFilters}>
                  Limpiar filtros ({activeFiltersCount})
                </Button>
              )}
              {!showCreateButton && (
                <Button onClick={handleCreate} size="sm">
                  Nueva inversión
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isInitialLoading ? (
            <InvestmentListSkeleton />
          ) : !hasData ? (
            <EmptyState
              icon={TrendingUp}
              title="Sin inversiones"
              description="No hay inversiones registradas. Crea una para hacer seguimiento de rendimientos."
            />
          ) : (
            <>
              <div className="rounded-md border relative">
                <TableLoadingOverlay show={isLoading} />
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="whitespace-nowrap">
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
                          <TableCell key={cell.id} className="align-top">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {metaInfo.totalPages > 1 && (
                <div className="mt-4">
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
            </>
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
      />
    </>
  );
}
