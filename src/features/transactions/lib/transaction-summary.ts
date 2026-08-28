import type { TransactionSummaryDTO } from "@/entities/transaction/model/transaction-summary.dto";

export interface SummaryGroupRow {
  kind: "income" | "expense";
  status: "pending" | "paid";
  total: number | null;
  count: number | null;
}

/**
 * Reduce las filas agrupadas por tipo y estado al DTO del mes.
 * Pagado/pendiente se computan solo sobre egresos: un ingreso "pendiente"
 * no es una deuda del usuario.
 */
export function buildTransactionSummary(
  rows: SummaryGroupRow[],
  month: string,
): TransactionSummaryDTO {
  const summary: TransactionSummaryDTO = {
    month,
    totalPaid: 0,
    paidCount: 0,
    totalPending: 0,
    pendingCount: 0,
    totalIncome: 0,
    incomeCount: 0,
    totalExpenses: 0,
    expenseCount: 0,
  };

  for (const row of rows) {
    const total = row.total ?? 0;
    const count = row.count ?? 0;

    if (row.kind === "income") {
      summary.totalIncome += total;
      summary.incomeCount += count;
      continue;
    }

    summary.totalExpenses += total;
    summary.expenseCount += count;

    if (row.status === "paid") {
      summary.totalPaid += total;
      summary.paidCount += count;
    } else {
      summary.totalPending += total;
      summary.pendingCount += count;
    }
  }

  return summary;
}
