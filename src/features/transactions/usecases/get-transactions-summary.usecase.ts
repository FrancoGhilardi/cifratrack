import type { ITransactionRepository } from "@/entities/transaction/repo";
import type { TransactionSummaryDTO } from "@/entities/transaction/model/transaction-summary.dto";
import { ValidationError } from "@/shared/lib/errors";

/**
 * Caso de uso: Obtener resumen de egresos pagados/pendientes por mes
 */
export class GetTransactionsSummaryUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  async execute(userId: string, month: string): Promise<TransactionSummaryDTO> {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new ValidationError("El mes debe estar en formato YYYY-MM");
    }

    return this.repository.getExpenseStatusSummary(userId, month);
  }
}
