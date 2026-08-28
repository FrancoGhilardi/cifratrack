"use client";

import {
  useTransactionsTable,
  useTransactionsSummaryQuery,
} from "@/features/transactions/hooks";
import { TransactionsTable } from "@/features/transactions/ui/transactions-table";
import { TransactionFiltersBar } from "@/features/transactions/ui/transaction-filters-bar";
import { TransactionDialog } from "@/features/transactions/ui/transaction-dialog";
import { TransactionSummaryStrip } from "@/features/transactions/ui/transaction-summary-strip";
import {
  TransactionSummaryStripSkeleton,
  TransactionsLedgerSkeleton,
} from "@/features/transactions/ui/transactions-skeleton";
import { useTransactionMutations } from "@/features/transactions/hooks/useTransactionMutations";
import { TableLoadingOverlay } from "@/shared/ui/table-loading-overlay";
import { Pagination } from "@/shared/ui/pagination";
import { PageHeader } from "@/shared/ui/page-header";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { ErrorState } from "@/shared/ui/error-state";
import { Button } from "@/shared/ui/button";
import { MonthSelector } from "@/shared/ui/month-selector";
import { Plus } from "lucide-react";
import { useCrudDialogState } from "@/shared/lib/hooks/useCrudDialogState";
import { useMemo } from "react";
import type { SortingState } from "@tanstack/react-table";
import { Month } from "@/shared/lib/date";
import { useControlledMonthNavigation } from "@/shared/lib/hooks/useControlledMonthNavigation";

export default function TransactionsPage() {
  const {
    transactions,
    meta,
    isLoading,
    isFetching,
    isError,
    error,
    params,
    updateParams,
    resetFilters,
    goToPage,
    setSort,
  } = useTransactionsTable();

  const month = params.month || Month.current().toString();
  const monthNav = useControlledMonthNavigation({
    month,
    onMonthChange: (nextMonth) => updateParams({ month: nextMonth, page: 1 }),
  });

  // Query separada para el resumen (solo filtra por mes, sin otros filtros)
  const summaryQuery = useTransactionsSummaryQuery(month);

  const mutations = useTransactionMutations();
  const { state: dialogState, actions: dialogActions } = useCrudDialogState();

  const handleDeleteConfirm = async () => {
    if (!dialogState.deleteId) return;

    try {
      await mutations.delete.mutateAsync(dialogState.deleteId);
      dialogActions.closeDelete();
    } catch {
      // El error se muestra vía toast (useTransactionMutations); el dialog queda abierto
    }
  };

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    setSort(sortBy, sortOrder);
  };

  // Convertir params a SortingState para TanStack Table
  const sorting: SortingState = useMemo(
    () => [
      {
        id: params.sortBy || "occurredOn",
        desc: params.sortOrder === "desc",
      },
    ],
    [params.sortBy, params.sortOrder],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Movimientos"
        description="Ingresos y egresos del período seleccionado."
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <MonthSelector
              currentMonth={monthNav.month}
              monthLabel={monthNav.monthLabel}
              isCurrentMonth={monthNav.isCurrentMonth}
              onPreviousMonth={monthNav.goToPreviousMonth}
              onNextMonth={monthNav.goToNextMonth}
              onCurrentMonth={monthNav.goToCurrentMonth}
            />
            <Button onClick={dialogActions.openCreate} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Nuevo movimiento
            </Button>
          </div>
        }
      />

      {isError && (
        <ErrorState
          message={error?.message ?? "No pudimos cargar los movimientos."}
          showReloadButton
        />
      )}

      {/* Tira de resumen */}
      {summaryQuery.isLoading ? (
        <TransactionSummaryStripSkeleton />
      ) : (
        <TransactionSummaryStrip
          summary={summaryQuery.summary}
          monthLabel={monthNav.monthLabel}
        />
      )}

      {/* Filtros */}
      <div className="border-y border-border/60 py-3">
        <TransactionFiltersBar
          kind={params.kind}
          status={params.status}
          paymentMethodId={params.paymentMethodId}
          categoryIds={params.categoryIds}
          q={params.q}
          onFiltersChange={updateParams}
          onReset={resetFilters}
        />
      </div>

      {/* Tabla */}
      {isLoading ? (
        <TransactionsLedgerSkeleton />
      ) : (
        <>
          <div className="relative">
            <TableLoadingOverlay show={isFetching} />
            <TransactionsTable
              transactions={transactions}
              sorting={sorting}
              onSortingChange={handleSortChange}
              onEdit={dialogActions.openEdit}
              onDelete={dialogActions.openDelete}
              onCreate={dialogActions.openCreate}
            />
          </div>

          {/* Paginación */}
          {meta && meta.totalPages > 1 && (
            <div className="border-t border-border/60 pt-3">
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                pageSize={meta.pageSize}
                totalItems={meta.total}
                onPageChange={goToPage}
                onPageSizeChange={(pageSize) =>
                  updateParams({ pageSize, page: 1 })
                }
              />
            </div>
          )}
        </>
      )}

      {/* Dialog para crear/editar */}
      <TransactionDialog
        open={dialogState.isFormOpen}
        onOpenChange={(open) => !open && dialogActions.closeForm()}
        transactionId={dialogState.editingId}
      />

      {/* Dialog de confirmación para eliminar */}
      <ConfirmDialog
        open={!!dialogState.deleteId}
        onOpenChange={(open) => !open && dialogActions.closeDelete()}
        title="Eliminar movimiento"
        description="¿Querés eliminar este movimiento? No se puede deshacer."
        onConfirm={handleDeleteConfirm}
        confirmText="Eliminar"
        isLoading={mutations.delete.isPending}
      />
    </div>
  );
}
