"use client";

import { ArrowLeftRight } from "lucide-react";
import type { SortingState } from "@tanstack/react-table";

import type { TransactionDTO } from "@/features/transactions/mappers/transaction.mapper";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { MobileSortSelect } from "@/shared/ui/mobile-sort-select";
import { TransactionsLedger } from "./transactions-ledger";
import { TransactionCardList } from "./transaction-card-list";

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
  onCreate?: () => void;
}

/**
 * Contenedor delgado: elige libro mayor (desktop) o fichas (mobile) según
 * breakpoint, sin lógica propia de presentación.
 */
export function TransactionsTable({
  transactions,
  sorting = [],
  onSortingChange,
  onEdit,
  onDelete,
  onCreate,
}: TransactionsTableProps) {
  const tanstackSorting: SortingState = sorting.map((sort) => {
    if (typeof sort === "string") {
      return { id: sort, desc: false };
    }

    return sort;
  });

  const activeSort = tanstackSorting[0] ?? { id: "occurredOn", desc: true };
  const mobileSortValue = `${activeSort.id}:${activeSort.desc ? "desc" : "asc"}`;

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title="Sin movimientos"
        description="No hay movimientos con estos filtros. Probá con otro mes o limpiá los filtros."
        action={onCreate && <Button onClick={onCreate}>Nuevo movimiento</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-border/60 pb-3 md:hidden">
        <MobileSortSelect
          options={MOBILE_SORT_OPTIONS}
          value={mobileSortValue}
          onSortChange={(sortBy, sortOrder) => onSortingChange?.(sortBy, sortOrder)}
          placeholder="Ordenar movimientos"
        />
      </div>

      <TransactionCardList
        transactions={transactions}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <div className="hidden md:block">
        <TransactionsLedger
          transactions={transactions}
          sorting={tanstackSorting}
          onSortingChange={onSortingChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
