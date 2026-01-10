"use client";

import {
  useTransactionsTable,
  useTransactionsSummaryQuery,
} from "@/features/transactions/hooks";
import { TransactionsTable } from "@/features/transactions/ui/transactions-table";
import { TransactionFilters } from "@/features/transactions/ui/transaction-filters";
import { TransactionDialog } from "@/features/transactions/ui/transaction-dialog";
import { TransactionSummaryCards } from "@/features/transactions/ui/transaction-summary-cards";
import { useTransactionMutations } from "@/features/transactions/hooks/useTransactionMutations";
import { Skeleton } from "@/shared/ui/skeleton";
import { Pagination } from "@/shared/ui/pagination";
import { PageHeader } from "@/shared/ui/page-header";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Plus } from "lucide-react";
import { useCrudDialogState } from "@/shared/lib/hooks/useCrudDialogState";
import {
  handleMutationError,
  logMutationSuccess,
} from "@/shared/lib/utils/mutation-handlers";
import type { SortingState } from "@tanstack/react-table";

export default function TransactionsPage() {
  const {
    transactions,
    meta,
    isLoading,
    isError,
    error,
    params,
    updateParams,
    resetFilters,
    goToPage,
    setSort,
  } = useTransactionsTable();

  // Query separada para las cards (solo filtra por mes, sin otros filtros)
  const summaryQuery = useTransactionsSummaryQuery(params.month || "");

  const mutations = useTransactionMutations();
  const { state: dialogState, actions: dialogActions } = useCrudDialogState();

  const handleDeleteConfirm = async () => {
    if (!dialogState.deleteId) return;

    try {
      await mutations.delete.mutateAsync(dialogState.deleteId);
      logMutationSuccess("delete", "Movimiento");
      dialogActions.closeDelete();
    } catch (error) {
      handleMutationError("delete", "movimiento", error);
    }
  };

  const handleFormSuccess = () => {
    logMutationSuccess(
      dialogState.editingId ? "update" : "create",
      "Movimiento"
    );
  };

  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    setSort(sortBy, sortOrder);
  };

  // Convertir params a SortingState para TanStack Table
  const sorting: SortingState = [
    {
      id: params.sortBy || "occurredOn",
      desc: params.sortOrder === "desc",
    },
  ];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <p className="text-destructive mb-4">Error al cargar transacciones</p>
        <p className="text-sm text-muted-foreground">{error?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimientos"
        description="Gestiona tus ingresos y egresos"
        actionIcon={Plus}
        actionText="Nuevo Movimiento"
        onAction={dialogActions.openCreate}
      />

      {/* Cards de resumen */}
      {summaryQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <TransactionSummaryCards transactions={summaryQuery.transactions} />
      )}

      {/* Filtros */}
      <div className="rounded-lg border bg-card p-4">
        <TransactionFilters
          month={params.month}
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
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <>
          <TransactionsTable
            transactions={transactions}
            sorting={sorting}
            onSortingChange={handleSortChange}
            onEdit={dialogActions.openEdit}
            onDelete={dialogActions.openDelete}
          />

          {/* Paginación */}
          {meta && meta.totalPages > 1 && (
            <div className="rounded-lg border bg-card p-4">
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
        onSuccess={handleFormSuccess}
      />

      {/* Dialog de confirmación para eliminar */}
      <ConfirmDialog
        open={!!dialogState.deleteId}
        onOpenChange={(open) => !open && dialogActions.closeDelete()}
        title="Eliminar movimiento"
        description="¿Estás seguro de que quieres eliminar este movimiento? Esta acción no se puede deshacer."
        onConfirm={handleDeleteConfirm}
        confirmText="Eliminar"
        isLoading={mutations.delete.isPending}
      />
    </div>
  );
}
