"use client";

import { useCallback, useMemo, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { TrendingUp } from "lucide-react";

import type { CreateInvestmentInput } from "@/entities/investment/model/investment.schema";
import { useAllLiveRates } from "@/features/market-data/hooks/useLatestYield";
import { useCurrency } from "@/shared/lib/hooks";
import { useSearchDebounce } from "@/shared/lib/hooks/useSearchDebounce";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { Pagination } from "@/shared/ui/pagination";

import { useInvestmentMutations } from "../hooks/useInvestments";
import type {
  InvestmentDTO,
  InvestmentQueryParams,
} from "../model/investment.dto";
import { DeleteInvestmentDialog } from "./delete-investment-dialog";
import { InvestmentForm } from "./investment-form";
import { InvestmentFilters } from "./investment-filters";
import { InvestmentCardsMobile } from "./investment-cards-mobile";
import { InvestmentTableDesktop } from "./investment-table-desktop";
import { buildLiveRatesMap } from "./investment-metrics";

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
  const [syncedFiltersQ, setSyncedFiltersQ] = useState(filters.q);

  // Resincroniza el input cuando filters.q cambia desde afuera (ej. reset de filtros).
  if (filters.q !== syncedFiltersQ) {
    setSyncedFiltersQ(filters.q);
    setSearchValue(filters.q ?? "");
  }

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
  const { data: liveRates } = useAllLiveRates();

  const liveRatesMap = useMemo(() => buildLiveRatesMap(liveRates), [liveRates]);

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
  const mobileSortValue = `${activeSort.id}:${activeSort.desc ? "desc" : "asc"}`;

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

  const activeFiltersCount = useMemo(
    () => [filters.q, filters.active].filter(Boolean).length,
    [filters.active, filters.q],
  );

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

          <InvestmentFilters
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            activeFilterValue={activeFilterValue}
            onActiveChange={handleActiveChange}
            activeFiltersCount={activeFiltersCount}
            onResetFilters={onResetFilters}
            showCreateButton={showCreateButton}
            onCreate={handleCreate}
            mobileSortValue={mobileSortValue}
            onSortChange={onSortChange}
          />
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
              <InvestmentCardsMobile
                investments={investments}
                liveRatesMap={liveRatesMap}
                formatCurrency={formatCurrency}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              <InvestmentTableDesktop
                investments={investments}
                sorting={sorting}
                onSortChange={onSortChange}
                liveRatesMap={liveRatesMap}
                formatCurrency={formatCurrency}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

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
