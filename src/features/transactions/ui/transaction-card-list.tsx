"use client";

import { Pencil, Trash2 } from "lucide-react";

import type { TransactionDTO } from "@/features/transactions/mappers/transaction.mapper";
import { useCurrency } from "@/shared/lib/hooks/useCurrency";
import { getCategoryColor } from "@/shared/lib/category-colors";
import { cn } from "@/shared/lib/utils";
import { formatDateToLocal } from "@/shared/lib/utils/date-format";
import { Button } from "@/shared/ui/button";
import { getAmountSign, getAmountTone } from "./transactions-ledger";

interface TransactionCardListProps {
  transactions: TransactionDTO[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
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

/**
 * Fichas móviles: mismo lenguaje del libro mayor, sin caja pesada.
 */
export function TransactionCardList({
  transactions,
  onEdit,
  onDelete,
}: TransactionCardListProps) {
  const { format } = useCurrency();

  return (
    <div className="md:hidden">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="border-b border-border/60 py-3.5 last:border-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-[13.5px]">{transaction.title}</span>
                {transaction.sourceRecurringRuleId && (
                  <span className="inline-flex items-center rounded-full bg-app-nav-active px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-app-nav-accent">
                    Recurrente
                  </span>
                )}
                <StatusBadge status={transaction.status} />
              </div>
              <p className="font-mono text-[11.5px] tabular-nums text-muted-foreground">
                {formatDateToLocal(transaction.occurredOn)}
                {transaction.paymentMethodName ? ` · ${transaction.paymentMethodName}` : ""}
              </p>
              {transaction.description && (
                <p className="line-clamp-1 text-[12px] text-muted-foreground">
                  {transaction.description}
                </p>
              )}
            </div>

            <div
              className={cn(
                "shrink-0 text-right font-mono text-[14px] tabular-nums",
                getAmountTone(transaction),
              )}
            >
              {getAmountSign(transaction)}
              {format(transaction.amount)}
            </div>
          </div>

          {transaction.categories.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              {transaction.categories.map((category, index) => (
                <span
                  key={category.categoryId}
                  className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{ background: getCategoryColor(index) }}
                  />
                  {category.categoryName}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => onEdit?.(transaction.id)}
              aria-label={`Editar ${transaction.title}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-app-neg"
              onClick={() => onDelete?.(transaction.id)}
              aria-label={`Eliminar ${transaction.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
