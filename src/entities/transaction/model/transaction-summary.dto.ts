/**
 * DTO: Transaction Summary (expense paid vs pending)
 */
export interface TransactionSummaryDTO {
  month: string;
  totalPaid: number; // en centavos
  paidCount: number;
  totalPending: number; // en centavos
  pendingCount: number;
}
