import { useMemo } from "react";
import type { TransactionSummaryDTO } from "@/entities/transaction/model/transaction-summary.dto";

/**
 * Resumen de transacciones del mes
 */
export interface TransactionsSummary {
  totalPaid: number;
  paidCount: number;
  totalPending: number;
  pendingCount: number;
  totalIncome: number;
  incomeCount: number;
  totalExpenses: number;
  expenseCount: number;
  hasPaidTransactions: boolean;
  hasPendingTransactions: boolean;
  hasIncome: boolean;
  hasExpenses: boolean;
  /** Porcentaje pagado sobre los egresos del mes. 0 si no hay egresos. */
  paidShare: number;
}

/**
 * Hook para adaptar el resumen de transacciones del mes (view-model puro,
 * no hace fetch — para eso ver `useTransactionsSummaryQuery`).
 *
 * @param summary - Resumen de egresos por estado
 * @returns Resumen con flags para la UI
 */
export function useTransactionsSummaryView(
  summary?: TransactionSummaryDTO,
): TransactionsSummary {
  return useMemo(() => {
    const totalPaid = summary?.totalPaid ?? 0;
    const paidCount = summary?.paidCount ?? 0;
    const totalPending = summary?.totalPending ?? 0;
    const pendingCount = summary?.pendingCount ?? 0;
    const totalIncome = summary?.totalIncome ?? 0;
    const incomeCount = summary?.incomeCount ?? 0;
    const totalExpenses = summary?.totalExpenses ?? 0;
    const expenseCount = summary?.expenseCount ?? 0;

    return {
      totalPaid,
      paidCount,
      totalPending,
      pendingCount,
      totalIncome,
      incomeCount,
      totalExpenses,
      expenseCount,
      hasPaidTransactions: paidCount > 0,
      hasPendingTransactions: pendingCount > 0,
      hasIncome: incomeCount > 0,
      hasExpenses: expenseCount > 0,
      paidShare: totalExpenses > 0 ? (totalPaid / totalExpenses) * 100 : 0,
    };
  }, [summary]);
}
