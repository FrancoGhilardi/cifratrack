/**
 * DTO: resumen del mes de movimientos.
 * `totalPaid` / `totalPending` son SOLO egresos (semántica histórica);
 * `totalIncome` / `totalExpenses` son los totales del mes por tipo.
 * Todos los montos en centavos.
 */
export interface TransactionSummaryDTO {
  month: string;
  totalPaid: number;
  paidCount: number;
  totalPending: number;
  pendingCount: number;
  totalIncome: number;
  incomeCount: number;
  totalExpenses: number;
  expenseCount: number;
}
