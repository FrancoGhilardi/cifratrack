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
  hasPaidTransactions: boolean;
  hasPendingTransactions: boolean;
}

/**
 * Hook para adaptar el resumen de transacciones del mes
 *
 * @param summary - Resumen de egresos por estado
 * @returns Resumen con flags para la UI
 */
export function useTransactionsSummary(
  summary?: TransactionSummaryDTO
): TransactionsSummary {
  return useMemo(() => {
    const totalPaid = summary?.totalPaid ?? 0;
    const paidCount = summary?.paidCount ?? 0;
    const totalPending = summary?.totalPending ?? 0;
    const pendingCount = summary?.pendingCount ?? 0;

    return {
      totalPaid,
      paidCount,
      totalPending,
      pendingCount,
      hasPaidTransactions: paidCount > 0,
      hasPendingTransactions: pendingCount > 0,
    };
  }, [summary]);
}
