import { useMemo } from "react";
import type { TransactionDTO } from "../mappers/transaction.mapper";

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
 * Hook para calcular el resumen de transacciones del mes
 *
 * Calcula:
 * - totalPaid: suma de montos de egresos pagados
 * - paidCount: número de egresos pagados
 * - totalPending: suma de montos de egresos pendientes
 * - pendingCount: número de egresos pendientes
 *
 * Solo contempla transacciones de tipo 'expense' (egresos)
 *
 * @param transactions - Lista de transacciones
 * @returns Resumen de transacciones
 */
export function useTransactionsSummary(
  transactions: TransactionDTO[]
): TransactionsSummary {
  return useMemo(() => {
    // Filtrar solo egresos (expense)
    const expenses = transactions.filter((t) => t.kind === "expense");

    const paidTransactions = expenses.filter((t) => t.status === "paid");
    const pendingTransactions = expenses.filter((t) => t.status === "pending");

    // Convertir de centavos a pesos (amount está en centavos en DB)
    const totalPaid = paidTransactions.reduce(
      (sum, t) => sum + t.amount / 100,
      0
    );
    const paidCount = paidTransactions.length;

    const totalPending = pendingTransactions.reduce(
      (sum, t) => sum + t.amount / 100,
      0
    );
    const pendingCount = pendingTransactions.length;

    return {
      totalPaid,
      paidCount,
      totalPending,
      pendingCount,
      hasPaidTransactions: paidCount > 0,
      hasPendingTransactions: pendingCount > 0,
    };
  }, [transactions]);
}
